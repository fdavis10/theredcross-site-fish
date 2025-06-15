// Hero Carousel Functionality
let currentSlideIndex = 0;
const slides = document.querySelectorAll('.carousel-slide');
const indicators = document.querySelectorAll('.indicator');
const totalSlides = slides.length;

// Auto-play carousel
let autoPlayInterval;

function showSlide(index) {
    // Hide all slides
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));
    
    // Show current slide
    slides[index].classList.add('active');
    indicators[index].classList.add('active');
}

function nextSlide() {
    currentSlideIndex = (currentSlideIndex + 1) % totalSlides;
    showSlide(currentSlideIndex);
}

function prevSlide() {
    currentSlideIndex = (currentSlideIndex - 1 + totalSlides) % totalSlides;
    showSlide(currentSlideIndex);
}

function changeSlide(direction) {
    if (direction === 1) {
        nextSlide();
    } else {
        prevSlide();
    }
    resetAutoPlay();
}

function currentSlide(index) {
    currentSlideIndex = index - 1;
    showSlide(currentSlideIndex);
    resetAutoPlay();
}

function startAutoPlay() {
    autoPlayInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
}

function resetAutoPlay() {
    clearInterval(autoPlayInterval);
    startAutoPlay();
}

// Initialize carousel
document.addEventListener('DOMContentLoaded', function() {
    showSlide(0);
    startAutoPlay();
    
    // Pause auto-play on hover
    const carouselContainer = document.querySelector('.carousel-container');
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', () => {
            clearInterval(autoPlayInterval);
        });
        
        carouselContainer.addEventListener('mouseleave', () => {
            startAutoPlay();
        });
    }
});

// Partners Carousel - Duplicate content for seamless loop
document.addEventListener('DOMContentLoaded', function() {
    const partnersTrack = document.querySelector('.partners-track');
    if (partnersTrack) {
        const originalContent = partnersTrack.innerHTML;
        partnersTrack.innerHTML = originalContent + originalContent;
    }
});

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetElement.offsetTop - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = 'white';
        navbar.style.backdropFilter = 'none';
    }
});

// Animate elements on scroll
function animateOnScroll() {
    const elements = document.querySelectorAll('.news-card, .action-card, .info-block');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
}

// Initialize animation styles
document.addEventListener('DOMContentLoaded', function() {
    const elements = document.querySelectorAll('.news-card, .action-card, .info-block');
    
    elements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
    
    // Initial check
    animateOnScroll();
});

// Listen for scroll events
window.addEventListener('scroll', animateOnScroll);

// Banner click handler
document.addEventListener('DOMContentLoaded', function() {
    const banner = document.querySelector('.banner-container');
    if (banner) {
        banner.addEventListener('click', function() {
            // Add your click handler logic here
            console.log('Banner clicked!');
            // Example: window.location.href = '/join-us/';
        });
    }
});

// Help button click handler
document.addEventListener('DOMContentLoaded', function() {
    const helpBtn = document.querySelector('.btn-help');
    if (helpBtn) {
        helpBtn.addEventListener('click', function() {
            // Add your help button logic here
            console.log('Help button clicked!');
            // Example: window.location.href = '/donate/';
        });
    }
});

// Action cards click handlers
document.addEventListener('DOMContentLoaded', function() {
    const actionCards = document.querySelectorAll('.action-card');
    
    actionCards.forEach((card, index) => {
        card.addEventListener('click', function() {
            const cardTitle = card.querySelector('h5').textContent;
            console.log(`Action card clicked: ${cardTitle}`);
            
            // Add specific logic for each card
            switch(index) {
                case 0: // Стать партнером
                    // window.location.href = '/become-partner/';
                    break;
                case 1: // Оформить пожертвование
                    // window.location.href = '/donate/';
                    break;
                case 2: // Стать волонтером
                    // window.location.href = '/volunteer/';
                    break;
                case 3: // Получить помощь
                    // window.location.href = '/get-help/';
                    break;
            }
        });
    });
});

// Mobile menu enhancements
document.addEventListener('DOMContentLoaded', function() {
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    if (navbarToggler && navbarCollapse) {
        // Close mobile menu when clicking on a link
        const navLinks = navbarCollapse.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navbarCollapse.classList.contains('show')) {
                    navbarToggler.click();
                }
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            const isClickInsideNav = navbarCollapse.contains(e.target) || navbarToggler.contains(e.target);
            
            if (!isClickInsideNav && navbarCollapse.classList.contains('show')) {
                navbarToggler.click();
            }
        });
    }
});

// Form validation and submission helpers (for future use)
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[\+]?[\d\s\-\(\)]{10,}$/;
    return re.test(phone);
}

// Utility function for API calls (for Django integration)
async function makeAPICall(url, method = 'GET', data = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
    };
    
    // Add CSRF token for Django
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
    if (csrfToken) {
        options.headers['X-CSRFToken'] = csrfToken.value;
    }
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

// News section dynamic loading (for Django integration)
async function loadNews() {
    try {
        // This would connect to your Django API
        // const news = await makeAPICall('/api/news/latest/');
        // updateNewsSection(news);
        console.log('News loading functionality ready for Django integration');
    } catch (error) {
        console.error('Failed to load news:', error);
    }
}

function updateNewsSection(newsData) {
    const newsContainer = document.querySelector('.news-section .row');
    if (!newsContainer || !newsData) return;
    
    newsContainer.innerHTML = '';
    
    newsData.forEach(newsItem => {
        const newsCard = createNewsCard(newsItem);
        newsContainer.appendChild(newsCard);
    });
}

function createNewsCard(newsItem) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'col-md-4 mb-4';
    
    cardDiv.innerHTML = `
        <div class="news-card">
            <img src="${newsItem.image}" alt="${newsItem.title}" class="news-image">
            <div class="news-content">
                <h5>${newsItem.title}</h5>
                <p class="text-muted small">${newsItem.date}</p>
                <p>${newsItem.excerpt}</p>
            </div>
        </div>
    `;
    
    return cardDiv;
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Red Cross Help Center website initialized');
    
    // You can add initialization calls here
    // loadNews();
    
    // Add any other initialization logic
});

// Performance optimization - Lazy loading for images
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
});