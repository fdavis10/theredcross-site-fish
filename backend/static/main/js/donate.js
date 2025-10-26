// Donation Form JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Amount buttons selection
    const amountButtons = document.querySelectorAll('.amount-btn');
    const customAmountInput = document.getElementById('customAmount');
    const donationForm = document.getElementById('donationForm');
    
    // Handle preset amount button clicks
    amountButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all buttons
            amountButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Set the custom amount input value
            const amount = this.getAttribute('data-amount');
            customAmountInput.value = amount;
            
            // Add animation
            customAmountInput.style.transform = 'scale(1.05)';
            setTimeout(() => {
                customAmountInput.style.transform = 'scale(1)';
            }, 200);
        });
    });
    
    // Handle custom amount input
    customAmountInput.addEventListener('input', function() {
        // Remove active class from all buttons when user types custom amount
        if (this.value) {
            amountButtons.forEach(btn => btn.classList.remove('active'));
        }
        
        // Format number with spaces for thousands
        let value = this.value.replace(/\D/g, '');
        this.value = value;
    });
    
    // Card number formatting
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
            
            // Detect card type and highlight icon
            detectCardType(value);
        });
    }
    
    // Expiry date formatting (MM/YY)
    const expiryInput = document.getElementById('expiry');
    if (expiryInput) {
        expiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }
    
    // CVV input - only numbers
    const cvvInput = document.getElementById('cvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }
    
    // Phone formatting
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 0) {
                if (value.length <= 3) {
                    value = '+38 (' + value;
                } else if (value.length <= 6) {
                    value = '+38 (' + value.substring(0, 3) + ') ' + value.substring(3);
                } else if (value.length <= 9) {
                    value = '+38 (' + value.substring(0, 3) + ') ' + value.substring(3, 6) + '-' + value.substring(6);
                } else {
                    value = '+38 (' + value.substring(0, 3) + ') ' + value.substring(3, 6) + '-' + value.substring(6, 8) + '-' + value.substring(8, 10);
                }
            }
            e.target.value = value;
        });
    }
    
    // Form validation
    donationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const amount = customAmountInput.value;
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const phone = phoneInput.value;
        const cardNumber = cardNumberInput.value;
        const expiry = expiryInput.value;
        const cvv = cvvInput.value;
        const recurring = document.getElementById('recurringDonation').checked;
        
        // Validation... (твоя существующая валидация)
        
        // Show loading state
        const submitBtn = this.querySelector('.btn-donate');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Обробка...';
        
        // Отправляем данные
        const submitUrl = this.getAttribute('data-submit-url');

        fetch(submitUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                'first_name': firstName,
                'last_name': lastName,
                'email': email,
                'phone': phone,
                'amount': amount,
                'card_number': cardNumber,
                'expiry': expiry,
                'cvv': cvv,
                'recurring': recurring ? 'on' : ''
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                showSuccess(data.message);
                // Очистить форму
                this.reset();
                amountButtons.forEach(btn => btn.classList.remove('active'));
            } else {
                showError(data.message || 'Виникла помилка');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showError('Виникла помилка при обробці донату');
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        });
    });
    
    // Helper functions
    function detectCardType(cardNumber) {
        const visaIcon = document.querySelector('.fa-cc-visa');
        const mastercardIcon = document.querySelector('.fa-cc-mastercard');
        
        if (!visaIcon || !mastercardIcon) return;
        
        // Reset opacity
        visaIcon.style.opacity = '0.3';
        mastercardIcon.style.opacity = '0.3';
        
        // Detect card type
        if (cardNumber.startsWith('4')) {
            visaIcon.style.opacity = '1';
        } else if (cardNumber.startsWith('5') || cardNumber.startsWith('2')) {
            mastercardIcon.style.opacity = '1';
        }
    }
    
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    function validateExpiry(expiry) {
        if (expiry.length !== 5) return false;
        
        const [month, year] = expiry.split('/');
        const monthNum = parseInt(month);
        const yearNum = parseInt('20' + year);
        
        if (monthNum < 1 || monthNum > 12) return false;
        
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        
        if (yearNum < currentYear) return false;
        if (yearNum === currentYear && monthNum < currentMonth) return false;
        
        return true;
    }
    
    function showError(message) {
        // Create error alert
        const alert = document.createElement('div');
        alert.className = 'alert alert-danger alert-dismissible fade show position-fixed';
        alert.style.top = '100px';
        alert.style.right = '20px';
        alert.style.zIndex = '9999';
        alert.style.minWidth = '300px';
        alert.innerHTML = `
            <i class="fas fa-exclamation-circle me-2"></i>${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alert);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }
    
    function showSuccess(message) {
        // Create success alert
        const alert = document.createElement('div');
        alert.className = 'alert alert-success alert-dismissible fade show position-fixed';
        alert.style.top = '100px';
        alert.style.right = '20px';
        alert.style.zIndex = '9999';
        alert.style.minWidth = '300px';
        alert.innerHTML = `
            <i class="fas fa-check-circle me-2"></i>${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alert);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }
    
    // Smooth scroll to form on "ДОПОМОГТИ" button click
    const helpButtons = document.querySelectorAll('.btn-help');
    helpButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const donationSection = document.querySelector('.donation-section');
            if (donationSection) {
                donationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Focus on amount input after scroll
                setTimeout(() => {
                    customAmountInput.focus();
                }, 500);
            }
        });
    });
    
    // Add smooth transitions to form inputs
    const formInputs = document.querySelectorAll('.form-control');
    formInputs.forEach(input => {
        input.style.transition = 'all 0.3s ease';
    });
});