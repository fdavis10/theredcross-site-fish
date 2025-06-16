document.addEventListener("DOMContentLoaded", () => {
  const volunteerForm = document.getElementById("volunteer-form")
  const volunteerModal = document.getElementById("volunteerModal")

  // Форматирование номера телефона
  const phoneInput = document.getElementById("phone")
  phoneInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "")
    if (value.startsWith("380")) {
      value = value.substring(3)
    }
    if (value.length > 0) {
      value =
        "+380 " +
        value.substring(0, 2) +
        " " +
        value.substring(2, 5) +
        " " +
        value.substring(5, 7) +
        " " +
        value.substring(7, 9)
    }
    e.target.value = value
  })

  // Валидация возраста (должен быть старше 16 лет)
  const birthDateInput = document.getElementById("birthDate")
  birthDateInput.addEventListener("change", (e) => {
    const birthDate = new Date(e.target.value)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    if (age < 16) {
      e.target.setCustomValidity("Вік повинен бути не менше 16 років")
      showFieldError(e.target, "Вік повинен бути не менше 16 років")
    } else {
      e.target.setCustomValidity("")
      clearFieldError(e.target)
    }
  })

  // Валидация email
  const emailInput = document.getElementById("email")
  emailInput.addEventListener("blur", (e) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (e.target.value && !emailRegex.test(e.target.value)) {
      showFieldError(e.target, "Введіть коректний email адрес")
    } else {
      clearFieldError(e.target)
    }
  })

  // Проверка выбора хотя бы одной сферы интересов
  const interestCheckboxes = document.querySelectorAll('input[name="interests"]')
  interestCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const checkedBoxes = document.querySelectorAll('input[name="interests"]:checked')
      const errorContainer = document.getElementById("interests-error")

      if (checkedBoxes.length === 0) {
        if (!errorContainer) {
          const error = document.createElement("div")
          error.id = "interests-error"
          error.className = "invalid-feedback"
          error.textContent = "Оберіть хоча б одну сферу діяльності"
          checkbox.closest(".form-section").appendChild(error)
        }
      } else {
        if (errorContainer) {
          errorContainer.remove()
        }
      }
    })
  })

  // Обработка отправки формы
  volunteerForm.addEventListener("submit", (e) => {
    e.preventDefault()

    if (validateForm()) {
      submitForm()
    }
  })

  function validateForm() {
    let isValid = true

    // Проверка обязательных полей
    const requiredFields = ["firstName", "lastName", "birthDate", "phone", "email", "motivation"]

    requiredFields.forEach((fieldId) => {
      const field = document.getElementById(fieldId)
      if (!field.value.trim()) {
        showFieldError(field, "Це поле обов'язкове для заповнення")
        isValid = false
      } else {
        clearFieldError(field)
      }
    })

    // Проверка чекбоксов согласия
    const dataConsent = document.getElementById("dataConsent")
    const rulesConsent = document.getElementById("rulesConsent")

    if (!dataConsent.checked) {
      showFieldError(dataConsent, "Необхідно дати згоду на обробку персональних даних")
      isValid = false
    }

    if (!rulesConsent.checked) {
      showFieldError(rulesConsent, "Необхідно ознайомитися з принципами Червоного Хреста")
      isValid = false
    }

    // Проверка выбора сфер интересов
    const checkedInterests = document.querySelectorAll('input[name="interests"]:checked')
    if (checkedInterests.length === 0) {
      const errorContainer = document.getElementById("interests-error")
      if (!errorContainer) {
        const error = document.createElement("div")
        error.id = "interests-error"
        error.className = "invalid-feedback"
        error.textContent = "Оберіть хоча б одну сферу діяльності"
        document.querySelector(".interests-grid").parentNode.appendChild(error)
      }
      isValid = false
    }

    return isValid
  }

  function showFieldError(field, message) {
    field.classList.add("is-invalid")

    // Удаляем предыдущее сообщение об ошибке
    const existingError = field.parentNode.querySelector(".invalid-feedback")
    if (existingError) {
      existingError.remove()
    }

    // Добавляем новое сообщение об ошибке
    const errorDiv = document.createElement("div")
    errorDiv.className = "invalid-feedback"
    errorDiv.textContent = message
    field.parentNode.appendChild(errorDiv)
  }

  function clearFieldError(field) {
    field.classList.remove("is-invalid")
    field.classList.add("is-valid")

    const errorDiv = field.parentNode.querySelector(".invalid-feedback")
    if (errorDiv) {
      errorDiv.remove()
    }
  }

  function submitForm() {
    // Показываем спиннер загрузки
    const submitBtn = volunteerForm.querySelector('button[type="submit"]')
    const originalText = submitBtn.innerHTML
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Відправляємо...'
    submitBtn.disabled = true

    // Собираем данные формы
    const formData = new FormData(volunteerForm)

    // Добавляем выбранные интересы
    const interests = []
    document.querySelectorAll('input[name="interests"]:checked').forEach((checkbox) => {
      interests.push(checkbox.value)
    })
    formData.append("interests", interests.join(","))

    formData.append("birth_date", document.getElementById("birthDate").value)

    // Симуляция отправки на сервер
  fetch("/submit-volunteer/", {
    method: "POST",
    body: formData,
  })
    .then(response => {
      if (!response.ok) throw new Error("Не вдалося надіслати форму")
      return response.json()
    })
    .then(data => {
      showSuccessMessage()
      submitBtn.innerHTML = originalText
      submitBtn.disabled = false

      setTimeout(() => {
        const modal = window.bootstrap.Modal.getInstance(volunteerModal)
        modal.hide()
        volunteerForm.reset()
        clearAllErrors()
      }, 3000)
    })
    .catch(err => {
      alert("Помилка під час відправки форми: " + err.message)
      submitBtn.innerHTML = originalText
      submitBtn.disabled = false
    })
  }

  function showSuccessMessage() {
    const modalBody = document.querySelector("#volunteerModal .modal-body")
    const successHTML = `
            <div class="success-message">
                <i class="fas fa-check-circle"></i>
                <h4>Дякуємо за вашу заявку!</h4>
                <p>Ваша заявка успішно відправлена. Наш координатор зв'яжеться з вами найближчим часом.</p>
                <p><small>Це вікно закриється автоматично через кілька секунд...</small></p>
            </div>
        `
    modalBody.innerHTML = successHTML
  }

  function clearAllErrors() {
    document.querySelectorAll(".is-invalid").forEach((field) => {
      field.classList.remove("is-invalid")
    })
    document.querySelectorAll(".is-valid").forEach((field) => {
      field.classList.remove("is-valid")
    })
    document.querySelectorAll(".invalid-feedback").forEach((error) => {
      error.remove()
    })
  }

  // Очистка формы при закрытии модального окна
  volunteerModal.addEventListener("hidden.bs.modal", () => {
    volunteerForm.reset()
    clearAllErrors()

    // Восстанавливаем исходное содержимое модального окна
    const modalBody = document.querySelector("#volunteerModal .modal-body")
    if (modalBody.querySelector(".success-message")) {
      location.reload() // Перезагружаем страницу для восстановления формы
    }
  })

  // Валидация в реальном времени
  const inputs = volunteerForm.querySelectorAll("input, select, textarea")
  inputs.forEach((input) => {
    input.addEventListener("blur", function () {
      if (this.hasAttribute("required") && !this.value.trim()) {
        showFieldError(this, "Це поле обов'язкове для заповнення")
      } else if (this.value.trim()) {
        clearFieldError(this)
      }
    })
  })
})
