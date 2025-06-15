// News Detail Page JavaScript

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('News Detail page initialized');
    
    // Initialize all functionality
    initSocialSharing();
    initSidebarSticky();
    initReadingProgress();
    initImageLightbox();
    initHelpButtons();
    initDonationButtons();
    initScrollAnimations();
    initMobileEnhancements();
});

// Social Sharing Functionality
function initSocialSharing() {
    const shareButtons = document.querySelectorAll('.share-btn');
    const currentUrl = encodeURIComponent(window.location.href);
    const pageTitle = encodeURIComponent(document.title);
    const newsImage = document.querySelector('.news-detail-image');
    const imageUrl = newsImage ? encodeURIComponent(newsImage.src) : '';
    
    shareButtons.forEach(button => {
        const platform = button.classList.contains('share-facebook') ? 'facebook' :
                         button.classList.contains('share-twitter') ? 'twitter' :
                         button.classList.contains('share-telegram') ? 'telegram' :
                         button.classList.contains('share-whatsapp') ? 'whatsapp' : '';
        
        button.addEventListener('click', function(e) {
            e.preventDefault();
            shareOnPlatform(platform, currentUrl, pageTitle, imageUrl);
        });
    });
}

function shareOnPlatform(platform, url, title, image) {
    let shareUrl = '';
    
    switch(platform) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
            break;
        case 'telegram':
            shareUrl = `https://t.me/share/url?url=${url}&text=${title}`;
            break;
        case 'whatsapp':
            shareUrl = `https://wa.me/?text=${title}%20${url}`;
            break;
    }
    
    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
    }
}

// Sticky Sidebar Functionality
function initSidebarSticky() {
    const sidebar = document.querySelector('.news-sidebar');
    const article = document.querySelector('.news-detail-article');
    
    if (!sidebar || !article) return;
    
    let sidebarTop = sidebar.offsetTop;
    let sidebarHeight = sidebar.offsetHeight;
    let articleHeight = article.offsetHeight;
    
    function updateSidebarPosition() {
        const scrollTop = window.pageYOffset;
        const navbarHeight = document.querySelector('.navbar').offsetHeight;
        const footerOffset = document.querySelector('.footer').offsetTop;
        
        if (scrollTop + navbarHeight > sidebarTop) {
            const maxTop = footerOffset - sidebarHeight - 50;
            const newTop = Math.min(scrollTop + navbarHeight + 20, maxTop);
            
            if (newTop > 0) {
                sidebar.style.position = 'fixed';
                sidebar.style.top = `${navbarHeight + 20}px`;
                sidebar.style.width = `${sidebar.parentElement.offsetWidth}px`;
            }
        } else {
            sidebar.style.position = 'static';
            sidebar.style.width = 'auto';
        }
    }
    
    window.addEventListener('scroll', updateSidebarPosition);
    window.addEventListener('resize', function() {
        sidebarTop = sidebar.offsetTop;
        updateSidebarPosition();
    });
}

// Reading Progress Bar
function initReadingProgress() {
    // Create progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    progressBar.innerHTML = '<div class="reading-progress-fill"></div>';
    document.body.appendChild(progressBar);
    
    // Add CSS for progress bar
    const style = document.createElement('style');
    style.textContent = `
        .reading-progress {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 3px;
            background: rgba(220, 53, 69, 0.2);
            z-index: 9999;
        }
        
        .reading-progress-fill {
            height: 100%;
            background: linear-gradient(135deg, #dc3545, #c82333);
            width: 0%;
            transition: width 0.3s ease;
        }
    `;
    document.head.appendChild(style);
    
    const progressFill = progressBar.querySelector('.reading-progress-fill');
    const article = document.querySelector('.news-detail-article');
    
    if (!article) return;
    
    function updateReadingProgress() {
        const articleTop = article.offsetTop;
        const articleHeight = article.offsetHeight;
        const scrollTop = window.pageYOffset;
        const windowHeight = window.innerHeight;
        
        const articleStart = articleTop - windowHeight / 3;
        const articleEnd = articleTop + articleHeight - windowHeight / 3;
        
        if (scrollTop < articleStart) {
            progressFill.style.width = '0%';
        } else if (scrollTop > articleEnd) {
            progressFill.style.width = '100%';
        } else {
            const progress = (scrollTop - articleStart) / (articleEnd - articleStart);
            progressFill.style.width = `${Math.max(0, Math.min(100, progress * 100))}%`;
        }
    }
    
    window.addEventListener('scroll', updateReadingProgress);
    updateReadingProgress();
}

// Image Lightbox
function initImageLightbox() {
    const newsImage = document.querySelector('.news-detail-image');
    
    if (!newsImage) return;
    
    newsImage.style.cursor = 'pointer';
    newsImage.addEventListener('click', function() {
        createLightbox(this.src, this.alt);
    });
}

function createLightbox(imageSrc, imageAlt) {
    const lightbox = document.createElement('div');
    lightbox.className = 'image-lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-overlay">
            <div class="lightbox-content">
                <img src="${imageSrc}" alt="${imageAlt}" class="lightbox-image">
                <button class="lightbox-close">&times;</button>
            </div>
        </div>
    `;
    
    // Add CSS for lightbox
    const style = document.createElement('style');
    style.textContent = `
        .image-lightbox {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .image-lightbox.active {
            opacity: 1;
        }
        
        .lightbox-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
        }
        
        .lightbox-content {
            position: relative;
            max-width: 90%;
            max-height: 90%;
        }
        
        .lightbox-image {
            width: 100%;
            height: 100%;
            object-fit: contain;
            max-width: 100%;
            max-height: 100%;
        }
        
        .lightbox-close {
            position: absolute;
            top: -40px;
            right: -40px;
            background: none;
            border: none;
            color: white;
            font-size: 2rem;
            cursor: pointer;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: opacity 0.3s ease;
        }
        
        .lightbox-close:hover {
            opacity: 0.7;
        }
        
        @media (max-width: 768px) {
            .lightbox-close {
                top: 10px;
                right: 10px;
                background: rgba(0, 0, 0, 0.5);
                border-radius: 50%;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(lightbox);
    
    // Close lightbox functionality
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const overlay = lightbox.querySelector('.lightbox-overlay');
    
    function closeLightbox() {
        lightbox.classList.remove('active');
        setTimeout(() => {
            document.body.removeChild(lightbox);
        }, 300);
    }
    
    closeBtn.addEventListener('click', closeLightbox);
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            closeLightbox();
        }
    });
    
    // Close on Escape key
    function handleKeydown(e) {
        if (e.key === 'Escape') {
            closeLightbox();
            document.removeEventListener('keydown', handleKeydown);
        }
    }
    document.addEventListener('keydown', handleKeydown);
    
    // Show lightbox
    setTimeout(() => {
        lightbox.classList.add('active');
    }, 10);
}

// Help Buttons Functionality
function initHelpButtons() {
    const helpButtons = document.querySelectorAll('.help-widget .btn-light, .sidebar-widget .btn-light');
    
    helpButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Check if on mobile device
            const ua = navigator.userAgent || navigator.vendor || window.opera;
            const isAndroid = /android/i.test(ua);
            const isIOS = /iPhone|iPad|iPod/.test(ua);
            
            if (isAndroid || isIOS) {
                // Show contact information
                showContactModal();
            } else {
                // Show help modal or redirect
                showHelpModal();
            }
        });
    });
}

function showContactModal() {
    const modal = document.createElement('div');
    modal.className = 'contact-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h4>Контактна інформація</h4>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="contact-item">
                        <i class="fas fa-phone text-danger"></i>
                        <a href="tel:+78001234567">+7 (800) 123-45-67</a>
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-envelope text-danger"></i>
                        <a href="mailto:info@help-center.ru">info@help-center.ru</a>
                    </div>
                    <div class="contact-item">
                        <i class="fab fa-telegram text-danger"></i>
                        <a href="https://t.me/help_center_bot" target="_blank">Telegram Bот</a>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal styles
    const style = document.createElement('style');
    style.textContent = `
        .contact-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .contact-modal.active {
            opacity: 1;
        }
        
        .contact-modal .modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .contact-modal .modal-content {
            background: white;
            border-radius: 15px;
            max-width: 400px;
            width: 90%;
            overflow: hidden;
        }
        
        .contact-modal .modal-header {
            background: #dc3545;
            color: white;
            padding: 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .contact-modal .modal-close {
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
        }
        
        .contact-modal .modal-body {
            padding: 2rem;
        }
        
        .contact-modal .contact-item {
            display: flex;
            align-items: center;
            margin-bottom: 1rem;
            padding: 1rem;
            border: 1px solid #f0f0f0;
            border-radius: 10px;
            transition: all 0.3s ease;
        }
        
        .contact-modal .contact-item:hover {
            border-color: #dc3545;
            background: #f8f9fa;
        }
        
        .contact-modal .contact-item i {
            margin-right: 1rem;
            width: 20px;
        }
        
        .contact-modal .contact-item a {
            color: #333;
            text-decoration: none;
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(modal);
    
    // Close functionality
    const closeBtn = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.modal-overlay');
    
    function closeModal() {
        modal.classList.remove('active');
        setTimeout(() => document.body.removeChild(modal), 300);
    }
    
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });
    
    setTimeout(() => modal.classList.add('active'), 10);
}

function showHelpModal() {
    // This would integrate with your existing modal system
    console.log('Show help modal for desktop');
    // You can integrate this with your existing donation modal
}

// Donation Buttons Functionality
function initDonationButtons() {
    const donationButtons = document.querySelectorAll('.donation-widget .btn-danger, .btn-help');
    
    donationButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const ua = navigator.userAgent || navigator.vendor || window.opera;
            const isAndroid = /android/i.test(ua);
            
            if (isAndroid) {
                // Download file for Android
                const pdfUrl = '/static/main/apk-file/test.docx';
                const link = document.createElement('a');
                link.href = pdfUrl;
                link.download = 'donation_form_android.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                // Show donation modal
                const modalEl = document.getElementById('donationModal');
                if (modalEl && typeof bootstrap !== 'undefined') {
                    const modal = new bootstrap.Modal(modalEl);
                    modal.show();
                } else {
                    console.log('Donation modal not found or Bootstrap not loaded');
                }
            }
        });
    });
}

// Scroll Animations
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.news-card, .sidebar-widget, .recent-news-item');
    
    // Set initial states
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
    
    function checkAnimation() {
        animatedElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 100;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    }
    
    window.addEventListener('scroll', checkAnimation);
    checkAnimation(); // Initial check
}

// Mobile Enhancements
function initMobileEnhancements() {
    // Mobile-specific functionality
    if (window.innerWidth <= 768) {
        // Optimize sidebar for mobile
        const sidebar = document.querySelector('.news-sidebar');
        if (sidebar) {
            sidebar.style.position = 'static';
        }
        
        // Enhance social sharing for mobile
        const shareButtons = document.querySelectorAll('.share-btn');
        shareButtons.forEach(button => {
            if (button.classList.contains('share-whatsapp')) {
                // Make WhatsApp sharing more prominent on mobile
                button.style.order = '-1';
            }
        });
    }
    
    // Handle orientation changes
    window.addEventListener('orientationchange', function() {
        setTimeout(() => {
            // Recalculate positions after orientation change
            const sidebar = document.querySelector('.news-sidebar');
            if (sidebar && window.innerWidth > 768) {
                initSidebarSticky();
            }
        }, 500);
    });
}

// Recent News Click Handlers
document.addEventListener('DOMContentLoaded', function() {
    const recentNewsItems = document.querySelectorAll('.recent-news-item a');
    
    recentNewsItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Add loading state
            const newsItem = this.closest('.recent-news-item');
            newsItem.style.opacity = '0.7';
            
            // You can add actual navigation logic here
            console.log('Navigating to:', this.href);
        });
    });
});

// Navigation Links (Previous/Next Post)
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link-card');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Add loading animation
            this.style.transform = 'scale(0.98)';
            this.style.opacity = '0.8';
            
            setTimeout(() => {
                // You can add actual navigation logic here
                console.log('Navigating to post:', this.querySelector('.nav-title').textContent);
            }, 200);
        });
    });
});

// Smooth scroll to top functionality
function addScrollToTop() {
    const scrollBtn = document.createElement('button');
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
    
    const style = document.createElement('style');
    style.textContent = `
        .scroll-to-top {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            background: #dc3545;
            border: none;
            border-radius: 50%;
            color: white;
            font-size: 1.2rem;
            cursor: pointer;
            transition: all 0.3s ease;
            opacity: 0;
            visibility: hidden;
            z-index: 1000;
        }
        
        .scroll-to-top.visible {
            opacity: 1;
            visibility: visible;
        }
        
        .scroll-to-top:hover {
            background: #c82333;
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(220, 53, 69, 0.4);
        }
        
        @media (max-width: 768px) {
            .scroll-to-top {
                bottom: 20px;
                right: 20px;
                width: 45px;
                height: 45px;
            }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(scrollBtn);
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 500) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    });
    
    // Scroll to top functionality
    scrollBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Initialize scroll to top
document.addEventListener('DOMContentLoaded', addScrollToTop);

// Print functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add print button to article
    const article = document.querySelector('.news-detail-article');
    if (article) {
        const printBtn = document.createElement('button');
        printBtn.className = 'btn btn-outline-secondary btn-sm print-btn';
        printBtn.innerHTML = '<i class="fas fa-print me-2"></i>Друкувати';
        printBtn.style.marginTop = '1rem';
        
        printBtn.addEventListener('click', function() {
            window.print();
        });
        
        const socialShare = document.querySelector('.social-share');
        if (socialShare) {
            socialShare.appendChild(printBtn);
        }
    }
});

// Performance optimization
document.addEventListener('DOMContentLoaded', function() {
    // Lazy load images in related news
    const relatedImages = document.querySelectorAll('.related-news-section img[src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                // Image is already loaded, just add fade-in effect
                img.style.opacity = '0';
                img.style.transition = 'opacity 0.5s ease';
                setTimeout(() => {
                    img.style.opacity = '1';
                }, 100);
                observer.unobserve(img);
            }
        });
    });
    
    relatedImages.forEach(img => imageObserver.observe(img));
});

// Error handling for images
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        img.addEventListener('error', function() {
            // Replace with placeholder if image fails to load
            this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtCY0LfQvtCx0YDQsNC20LXQvdC40LUg0L3QtdC00L7RgdGC0YPQv9C90L48L3RleHQ+PC9zdmc+';
            this.alt = 'Зображення недоступне';
        });
    });
});

console.log('News Detail JavaScript loaded successfully');