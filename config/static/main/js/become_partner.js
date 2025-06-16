// Partnership Form Multi-Step Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Form elements
    const form = document.getElementById('partnershipForm');
    const steps = document.querySelectorAll('.form-step');
    const nextButtons = document.querySelectorAll('.btn-next');
    const prevButtons = document.querySelectorAll('.btn-prev');
    const submitButton = document.querySelector('.btn-submit');
    const progressBar = document.querySelector('.progress-bar');
    const stepIndicators = document.querySelectorAll('.step-indicator');
    
    // Check if Bootstrap is loaded
    let successModal;
    if (typeof bootstrap !== 'undefined') {
        successModal = new bootstrap.Modal(document.getElementById('successModal'));
    }
    
    let currentStep = 0;
    const totalSteps = steps.length;
    
    // Initialize form
    updateProgressBar();
    updateStepIndicators();
    
    // Next button functionality
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (validateCurrentStep()) {
                nextStep();
            }
        });
    });
    
    // Previous button functionality
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            prevStep();
        });
    });
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateCurrentStep()) {
            submitForm();
        }
    });
    
    // Real-time validation
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(input);
        });
        
        input.addEventListener('input', function() {
            if (input.classList.contains('is-invalid')) {
                validateField(input);
            }
        });
    });
    
    // Phone number formatting
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 0) {
                if (value.length <= 3) {
                    value = `+${value}`;
                } else if (value.length <= 6) {
                    value = `+${value.slice(0, 3)} (${value.slice(3)})`;
                } else if (value.length <= 9) {
                    value = `+${value.slice(0, 3)} (${value.slice(3, 6)}) ${value.slice(6)}`;
                } else {
                    value = `+${value.slice(0, 3)} (${value.slice(3, 6)}) ${value.slice(6, 9)}-${value.slice(9, 11)}-${value.slice(11, 13)}`;
                }
            }
            e.target.value = value;
        });
    }
    
    function nextStep() {
        if (currentStep < totalSteps - 1) {
            steps[currentStep].classList.remove('active');
            steps[currentStep].classList.add('completed');
            currentStep++;
            steps[currentStep].classList.add('active');
            updateProgressBar();
            updateStepIndicators();
            scrollToForm();
        }
    }
    
    function prevStep() {
        if (currentStep > 0) {
            steps[currentStep].classList.remove('active');
            currentStep--;
            steps[currentStep].classList.remove('completed');
            steps[currentStep].classList.add('active');
            updateProgressBar();
            updateStepIndicators();
            scrollToForm();
        }
    }
    
    function updateProgressBar() {
        const progress = ((currentStep + 1) / totalSteps) * 100;
        progressBar.style.width = `${progress}%`;
    }
    
    function updateStepIndicators() {
        stepIndicators.forEach((indicator, index) => {
            indicator.classList.remove('active', 'completed');
            if (index < currentStep) {
                indicator.classList.add('completed');
            } else if (index === currentStep) {
                indicator.classList.add('active');
            }
        });
    }
    
    function scrollToForm() {
        const formContainer = document.querySelector('.form-container');
        if (formContainer) {
            formContainer.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
    
    function validateCurrentStep() {
        const currentStepElement = steps[currentStep];
        const requiredFields = currentStepElement.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });
        
        // Additional validation for specific steps
        if (currentStep === 0) {
            const emailField = document.getElementById('email');
            const phoneField = document.getElementById('phone');
            
            if (emailField && emailField.value && !validateEmail(emailField.value)) {
                showFieldError(emailField, 'Введіть правильний email адрес');
                isValid = false;
            }
            
            if (phoneField && phoneField.value && !validatePhone(phoneField.value)) {
                showFieldError(phoneField, 'Введіть правильний номер телефону');
                isValid = false;
            }
        }
        
        return isValid;
    }
    
    function validateField(field) {
        clearFieldError(field);
        
        if (field.hasAttribute('required') && !field.value.trim()) {
            showFieldError(field, 'Це поле обов\'язкове для заповнення');
            return false;
        }
        
        if (field.type === 'email' && field.value && !validateEmail(field.value)) {
            showFieldError(field, 'Введіть правильний email адрес');
            return false;
        }
        
        if (field.type === 'tel' && field.value && !validatePhone(field.value)) {
            showFieldError(field, 'Введіть правильний номер телефону');
            return false;
        }
        
        if (field.type === 'url' && field.value && !validateURL(field.value)) {
            showFieldError(field, 'Введіть правильний URL адрес');
            return false;
        }
        
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
        return true;
    }
    
    function showFieldError(field, message) {
        field.classList.remove('is-valid');
        field.classList.add('is-invalid');
        
        let errorElement = field.parentNode.querySelector('.invalid-feedback');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'invalid-feedback';
            field.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;
    }
    
    function clearFieldError(field) {
        field.classList.remove('is-invalid');
        const errorElement = field.parentNode.querySelector('.invalid-feedback');
        if (errorElement) {
            errorElement.remove();
        }
    }
    
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function validatePhone(phone) {
        const phoneRegex = /^\+[\d\s\(\)\-]{10,}$/;
        return phoneRegex.test(phone);
    }
    
    function validateURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
    
    function collectFormData() {
        const formData = new FormData(form);
        const data = {};
        
        // Basic form fields
        for (let [key, value] of formData.entries()) {
            if (key !== 'interests') {
                data[key] = value;
            }
        }
        
        // Collect checkbox values
        const interests = [];
        document.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
            interests.push(checkbox.value);
        });
        data.interests = interests;
        
        return data;
    }
    
    function submitForm() {
        const submitBtn = document.querySelector('.btn-submit');
        const originalText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Відправляємо...';
        
        const formData = collectFormData();
        
        // Simulate API call
        setTimeout(() => {
            console.log('Form Data:', formData);
            
            // Here you would typically send data to your server
            // Example: 
            // fetch('/api/partnership', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify(formData)
            // })
            // .then(response => response.json())
            // .then(data => {
            //     console.log('Success:', data);
            //     showSuccessModal();
            // })
            // .catch(error => {
            //     console.error('Error:', error);
            //     showErrorMessage();
            // });
            
            // Reset form
            form.reset();
            resetForm();
            
            // Show success modal
            showSuccessModal();
            
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            
        }, 2000);
    }
    
    function showSuccessModal() {
        if (successModal) {
            successModal.show();
        } else {
            // Fallback if Bootstrap modal is not available
            alert('Дякуємо за заявку! Наш менеджер зв\'яжеться з вами найближчим часом.');
        }
    }
    
    function resetForm() {
        currentStep = 0;
        steps.forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if (index === 0) {
                step.classList.add('active');
            }
        });
        
        // Clear all validation states
        inputs.forEach(input => {
            input.classList.remove('is-valid', 'is-invalid');
            clearFieldError(input);
        });
        
        updateProgressBar();
        updateStepIndicators();
    }
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe benefit cards
    document.querySelectorAll('.benefit-card').forEach(card => {
        card.classList.add('animate-ready');
        observer.observe(card);
    });
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        .animate-ready {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.6s ease;
        }
        
        .animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        .navbar.scrolled {
            background: rgba(255, 255, 255, 0.95) !important;
            backdrop-filter: blur(10px);
            box-shadow: 0 2px 20px rgba(0,0,0,0.1);
        }
        
        .field-focused {
            transform: scale(1.02);
            transition: transform 0.2s ease;
        }
    `;
    document.head.appendChild(style);
    
    // Form field focus effects
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentNode.classList.add('field-focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentNode.classList.remove('field-focused');
        });
    });
    
    // Dynamic form field enhancement
    enhanceFormFields();
    
    function enhanceFormFields() {
        // Add floating label effect
        inputs.forEach(input => {
            if (input.type !== 'checkbox' && input.type !== 'radio') {
                input.addEventListener('input', function() {
                    if (this.value) {
                        this.classList.add('has-value');
                    } else {
                        this.classList.remove('has-value');
                    }
                });
                
                // Check initial state
                if (input.value) {
                    input.classList.add('has-value');
                }
            }
        });
        
        // Add character counter for textareas
        const textareas = form.querySelectorAll('textarea');
        textareas.forEach(textarea => {
            const maxLength = textarea.getAttribute('maxlength');
            if (maxLength) {
                const counter = document.createElement('small');
                counter.className = 'text-muted character-counter';
                counter.textContent = `0/${maxLength}`;
                textarea.parentNode.appendChild(counter);
                
                textarea.addEventListener('input', function() {
                    const current = this.value.length;
                    counter.textContent = `${current}/${maxLength}`;
                    
                    if (current > maxLength * 0.9) {
                        counter.classList.add('text-warning');
                    } else {
                        counter.classList.remove('text-warning');
                    }
                });
            }
        });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            // Ctrl+Enter to go to next step
            const nextBtn = steps[currentStep].querySelector('.btn-next');
            if (nextBtn) {
                nextBtn.click();
            }
        }
        
        if (e.key === 'Escape') {
            // Escape to go to previous step
            const prevBtn = steps[currentStep].querySelector('.btn-prev');
            if (prevBtn && currentStep > 0) {
                prevBtn.click();
            }
        }
    });
    
    // Auto-save form data to localStorage (optional)
    let autoSaveTimer;
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            clearTimeout(autoSaveTimer);
            autoSaveTimer = setTimeout(saveFormData, 1000);
        });
    });
    
    function saveFormData() {
        const formData = collectFormData();
        try {
            localStorage.setItem('partnershipFormData', JSON.stringify(formData));
        } catch (e) {
            console.log('Could not save form data to localStorage');
        }
    }
    
    function loadFormData() {
        try {
            const savedData = localStorage.getItem('partnershipFormData');
            if (savedData) {
                const data = JSON.parse(savedData);
                
                // Fill form fields
                Object.keys(data).forEach(key => {
                    const field = form.querySelector(`[name="${key}"], #${key}`);
                    if (field && data[key]) {
                        if (field.type === 'checkbox') {
                            field.checked = data[key].includes(field.value);
                        } else {
                            field.value = data[key];
                        }
                    }
                });
                
                // Handle interests checkboxes
                if (data.interests && Array.isArray(data.interests)) {
                    data.interests.forEach(interest => {
                        const checkbox = form.querySelector(`input[value="${interest}"]`);
                        if (checkbox) {
                            checkbox.checked = true;
                        }
                    });
                }
            }
        } catch (e) {
            console.log('Could not load form data from localStorage');
        }
    }
    
    // Load saved data on page load
    loadFormData();
    
    // Clear saved data on successful submission
    function clearSavedData() {
        try {
            localStorage.removeItem('partnershipFormData');
        } catch (e) {
            console.log('Could not clear saved form data');
        }
    }
    
    // Add this to the successful submission
    const originalSubmitForm = submitForm;
    submitForm = function() {
        originalSubmitForm();
        clearSavedData();
    };
    
    console.log('Partnership form script loaded successfully!');
});