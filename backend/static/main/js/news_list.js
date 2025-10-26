// News List Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const searchInput = document.getElementById('searchInput');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const newsGrid = document.getElementById('newsGrid');
    const newsItems = document.querySelectorAll('.news-item');
    
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase().trim();
            filterNews(searchTerm);
        });
    }
    
    // Filter buttons functionality
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            const filterType = this.getAttribute('data-filter');
            sortNews(filterType);
        });
    });
    
    // Search filter function
    function filterNews(searchTerm) {
        let visibleCount = 0;
        
        newsItems.forEach(item => {
            const title = item.querySelector('.news-card-title a').textContent.toLowerCase();
            const excerpt = item.querySelector('.news-card-excerpt').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || excerpt.includes(searchTerm)) {
                item.style.display = '';
                visibleCount++;
                // Reset animation
                item.style.animation = 'none';
                setTimeout(() => {
                    item.style.animation = '';
                }, 10);
            } else {
                item.style.display = 'none';
            }
        });
        
        // Show "no results" message if no items match
        showNoResultsMessage(visibleCount);
    }
    
    // Sort news function
    function sortNews(filterType) {
        const itemsArray = Array.from(newsItems);
        
        switch(filterType) {
            case 'recent':
                // Sort by date (newest first)
                itemsArray.sort((a, b) => {
                    const dateA = new Date(a.getAttribute('data-date'));
                    const dateB = new Date(b.getAttribute('data-date'));
                    return dateB - dateA;
                });
                break;
                
            case 'popular':
                // Shuffle for "popular" (you can implement real popularity logic later)
                itemsArray.sort(() => Math.random() - 0.5);
                break;
                
            case 'all':
            default:
                // Return to original order
                itemsArray.sort((a, b) => {
                    return Array.from(newsGrid.children).indexOf(a) - Array.from(newsGrid.children).indexOf(b);
                });
                break;
        }
        
        // Re-append items in new order
        itemsArray.forEach((item, index) => {
            newsGrid.appendChild(item);
            // Reset animations with stagger
            item.style.animation = 'none';
            setTimeout(() => {
                item.style.animation = '';
                item.style.animationDelay = `${index * 0.1}s`;
            }, 10);
        });
    }
    
    // Show/hide "no results" message
    function showNoResultsMessage(visibleCount) {
        let noResultsDiv = document.querySelector('.no-results-message');
        
        if (visibleCount === 0) {
            if (!noResultsDiv) {
                noResultsDiv = document.createElement('div');
                noResultsDiv.className = 'col-12 no-results-message';
                noResultsDiv.innerHTML = `
                    <div class="no-news text-center py-5">
                        <i class="fas fa-search fa-4x text-muted mb-3"></i>
                        <h3 class="text-muted">Нічого не знайдено</h3>
                        <p class="text-muted">Спробуйте змінити параметри пошуку</p>
                    </div>
                `;
                newsGrid.appendChild(noResultsDiv);
            }
        } else {
            if (noResultsDiv) {
                noResultsDiv.remove();
            }
        }
    }
    
    // Newsletter form submission
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        const submitButton = newsletterForm.querySelector('.btn');
        const emailInput = newsletterForm.querySelector('input[type="email"]');
        
        submitButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            const email = emailInput.value.trim();
            
            if (!email) {
                showNotification('Будь ласка, введіть email', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showNotification('Будь ласка, введіть коректний email', 'error');
                return;
            }
            
            // Simulate form submission
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Відправка...';
            
            setTimeout(() => {
                showNotification('Дякуємо за підписку!', 'success');
                emailInput.value = '';
                submitButton.disabled = false;
                submitButton.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Підписатись';
            }, 1500);
        });
    }
    
    // Email validation helper
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Notification function
    function showNotification(message, type = 'success') {
        // Remove existing notification if any
        const existingNotification = document.querySelector('.custom-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `custom-notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>
            ${message}
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : '#dc3545'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
            z-index: 9999;
            animation: slideInRight 0.4s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.4s ease';
            setTimeout(() => notification.remove(), 400);
        }, 3000);
    }
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Smooth scroll for pagination
    const paginationLinks = document.querySelectorAll('.pagination .page-link');
    paginationLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Let the default behavior work but scroll smoothly to top
            setTimeout(() => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }, 100);
        });
    });
    
    // Add hover effect for news cards (additional interactivity)
    newsItems.forEach(item => {
        const card = item.querySelector('.news-card-enhanced');
        
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.4s ease';
        });
    });
    
    // Intersection Observer for animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe all news items
    newsItems.forEach(item => {
        observer.observe(item);
    });
});