// FIXED Mobile-Responsive Stack Data Structure Presentation

class MobileStackPresentation {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 13;
        this.isFullscreen = false;
        this.isMobile = this.detectMobile();
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.touchStartTime = 0;
        this.isAnimating = false;
        this.isTouching = false;
        this.swipeThreshold = 50;
        this.swipeTimeThreshold = 500;
        this.swipeMinVelocity = 0.3;
        
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.initializeElements();
        this.setupEventListeners();
        this.createProgressDots();
        this.updateUI();
        this.setupMobileOptimizations();
        this.hideSwipeHintAfterDelay();
        
        console.log('Mobile Stack Presentation initialized');
        console.log(`Device: ${this.isMobile ? 'Mobile' : 'Desktop'}`);
    }

    detectMobile() {
        const userAgent = navigator.userAgent.toLowerCase();
        const mobileKeywords = ['android', 'webos', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];
        const hasMobileUserAgent = mobileKeywords.some(keyword => userAgent.includes(keyword));
        const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isSmallScreen = window.innerWidth <= 768;
        
        return hasMobileUserAgent || hasTouch || isSmallScreen;
    }

    initializeElements() {
        this.slideContainer = document.getElementById('slide-container');
        this.slides = document.querySelectorAll('.slide');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.fullscreenBtn = document.getElementById('fullscreen-btn');
        this.slideCounterBtn = document.getElementById('slide-counter-btn');
        this.currentSlideSpan = document.getElementById('current-slide');
        this.totalSlidesSpan = document.getElementById('total-slides');
        this.presentationContainer = document.querySelector('.presentation-container');
        this.progressDotsContainer = document.getElementById('progress-dots');
        this.swipeHint = document.getElementById('swipe-hint');
        
        // Set total slides display
        if (this.totalSlidesSpan) {
            this.totalSlidesSpan.textContent = this.totalSlides;
        }
        
        // Ensure first slide is active
        this.slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === 0);
        });
        
        console.log('Elements initialized:', {
            slides: this.slides.length,
            prevBtn: !!this.prevBtn,
            nextBtn: !!this.nextBtn,
            isMobile: this.isMobile
        });
    }

    setupEventListeners() {
        // FIXED: Navigation buttons with better error handling
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Previous button clicked');
                this.previousSlide();
            });
            console.log('Previous button listener attached');
        } else {
            console.error('Previous button not found!');
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Next button clicked');
                this.nextSlide();
            });
            console.log('Next button listener attached');
        } else {
            console.error('Next button not found!');
        }
        
        // Slide counter for jumping to slides
        if (this.slideCounterBtn) {
            this.slideCounterBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSlideJumpDialog();
            });
        }
        
        // Fullscreen functionality
        this.setupFullscreenEvents();
        
        // Touch/swipe events
        this.setupTouchEvents();
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyNavigation(e));
        
        // Fullscreen change events
        this.setupFullscreenChangeEvents();
        
        // Orientation and resize handling
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.handleOrientationChange(), 100);
        });
        
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));
        
        console.log('All event listeners setup complete');
    }

    setupFullscreenEvents() {
        if (!this.fullscreenBtn) return;
        
        let holdTimeout;
        
        const startHold = () => {
            holdTimeout = setTimeout(() => {
                this.toggleFullscreen();
                this.showFeedback('Fullscreen toggled');
                if (navigator.vibrate) {
                    navigator.vibrate(50);
                }
            }, 800);
        };
        
        const endHold = () => {
            clearTimeout(holdTimeout);
        };
        
        // Mouse events
        this.fullscreenBtn.addEventListener('mousedown', startHold);
        this.fullscreenBtn.addEventListener('mouseup', endHold);
        this.fullscreenBtn.addEventListener('mouseleave', endHold);
        
        // Touch events
        this.fullscreenBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            startHold();
        });
        
        this.fullscreenBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            endHold();
        });
        
        this.fullscreenBtn.addEventListener('click', (e) => {
            e.preventDefault();
        });
    }

    setupTouchEvents() {
        if (!this.slideContainer) return;
        
        this.slideContainer.addEventListener('touchstart', (e) => {
            if (this.isScrollableContent(e.target)) {
                return;
            }
            
            this.isTouching = true;
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
            this.touchEndX = this.touchStartX;
            this.touchEndY = this.touchStartY;
            this.touchStartTime = Date.now();
            
            console.log('Touch start:', this.touchStartX, this.touchStartY);
        }, { passive: true });

        this.slideContainer.addEventListener('touchmove', (e) => {
            if (!this.isTouching || this.isScrollableContent(e.target)) {
                return;
            }
            
            this.touchEndX = e.touches[0].clientX;
            this.touchEndY = e.touches[0].clientY;
            
            const deltaX = this.touchEndX - this.touchStartX;
            const deltaY = Math.abs(this.touchEndY - this.touchStartY);
            
            if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > 20) {
                e.preventDefault();
            }
        }, { passive: false });

        this.slideContainer.addEventListener('touchend', (e) => {
            if (!this.isTouching || this.isScrollableContent(e.target)) {
                this.isTouching = false;
                return;
            }
            
            this.isTouching = false;
            
            const deltaX = this.touchEndX - this.touchStartX;
            const deltaY = Math.abs(this.touchEndY - this.touchStartY);
            const deltaTime = Date.now() - this.touchStartTime;
            
            console.log('Touch end - deltaX:', deltaX, 'deltaY:', deltaY, 'time:', deltaTime);
            
            this.handleSwipe(deltaX, deltaY, deltaTime);
        }, { passive: true });

        this.slideContainer.addEventListener('touchcancel', () => {
            this.isTouching = false;
        }, { passive: true });
    }

    isScrollableContent(element) {
        let current = element;
        while (current && current !== this.slideContainer) {
            if (current.classList && current.classList.contains('scrollable-content')) {
                return true;
            }
            if (current.closest && current.closest('.scrollable-content')) {
                return true;
            }
            current = current.parentElement;
        }
        return false;
    }

    handleSwipe(deltaX, deltaY, deltaTime) {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);
        const velocity = absX / Math.max(deltaTime, 1);
        
        console.log('Handling swipe - absX:', absX, 'absY:', absY, 'velocity:', velocity);
        
        const isHorizontalSwipe = absX > absY;
        const isLongEnoughSwipe = absX > this.swipeThreshold;
        const isQuickEnoughSwipe = deltaTime < this.swipeTimeThreshold;
        const hasEnoughVelocity = velocity > this.swipeMinVelocity;
        
        if (isHorizontalSwipe && isLongEnoughSwipe && (isQuickEnoughSwipe || hasEnoughVelocity)) {
            if (deltaX > 0) {
                console.log('Swipe right - previous slide');
                this.previousSlide();
                this.showFeedback('← Previous');
            } else {
                console.log('Swipe left - next slide');
                this.nextSlide();
                this.showFeedback('Next →');
            }
            
            if (navigator.vibrate) {
                navigator.vibrate(30);
            }
        }
    }

    setupFullscreenChangeEvents() {
        const events = [
            'fullscreenchange',
            'webkitfullscreenchange',
            'mozfullscreenchange',
            'MSFullscreenChange'
        ];
        
        events.forEach(event => {
            document.addEventListener(event, () => this.handleFullscreenChange());
        });
    }

    createProgressDots() {
        if (!this.progressDotsContainer) {
            console.error('Progress dots container not found!');
            return;
        }
        
        this.progressDotsContainer.innerHTML = '';
        console.log('Creating progress dots...');
        
        for (let i = 1; i <= this.totalSlides; i++) {
            const dot = document.createElement('div');
            dot.className = 'progress-dot';
            if (i === 1) dot.classList.add('active');
            
            // FIXED: Proper event listener with closure
            dot.addEventListener('click', ((slideNumber) => {
                return (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Progress dot clicked for slide:', slideNumber);
                    this.goToSlide(slideNumber);
                    this.showFeedback(`Slide ${slideNumber}`);
                };
            })(i));
            
            this.progressDotsContainer.appendChild(dot);
            console.log(`Progress dot ${i} created and listener attached`);
        }
        
        console.log('All progress dots created');
    }

    setupMobileOptimizations() {
        if (!this.isMobile) return;
        
        document.body.classList.add('mobile-device');
        
        // Prevent double-tap zoom
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });
        
        // Optimize animations for mobile
        document.documentElement.style.setProperty('--duration-normal', '200ms');
        document.documentElement.style.setProperty('--duration-fast', '100ms');
        
        // Handle iOS viewport issues
        const fixViewport = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };
        
        fixViewport();
        window.addEventListener('resize', fixViewport);
        window.addEventListener('orientationchange', () => {
            setTimeout(fixViewport, 100);
        });
        
        console.log('Mobile optimizations applied');
    }

    handleKeyNavigation(event) {
        if (this.isAnimating) return;
        
        switch(event.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
                event.preventDefault();
                this.previousSlide();
                break;
            case 'ArrowRight':
            case 'ArrowDown':
            case ' ':
                event.preventDefault();
                this.nextSlide();
                break;
            case 'Home':
                event.preventDefault();
                this.goToSlide(1);
                break;
            case 'End':
                event.preventDefault();
                this.goToSlide(this.totalSlides);
                break;
            case 'f':
            case 'F':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    this.toggleFullscreen();
                }
                break;
            case 'Escape':
                if (this.isFullscreen) {
                    this.exitFullscreen();
                }
                break;
        }
    }

    previousSlide() {
        console.log('previousSlide called, current:', this.currentSlide);
        if (this.isAnimating) {
            console.log('Animation in progress, ignoring');
            return;
        }
        if (this.currentSlide <= 1) {
            console.log('Already at first slide');
            this.showFeedback('Already at first slide');
            return;
        }
        this.goToSlide(this.currentSlide - 1);
    }

    nextSlide() {
        console.log('nextSlide called, current:', this.currentSlide);
        if (this.isAnimating) {
            console.log('Animation in progress, ignoring');
            return;
        }
        if (this.currentSlide >= this.totalSlides) {
            console.log('Already at last slide');
            this.showFeedback('Already at last slide');
            return;
        }
        this.goToSlide(this.currentSlide + 1);
    }

    goToSlide(slideNumber) {
        console.log(`goToSlide called with slideNumber: ${slideNumber}, current: ${this.currentSlide}`);
        
        if (this.isAnimating) {
            console.log('Animation in progress, ignoring navigation');
            return;
        }
        
        if (slideNumber < 1 || slideNumber > this.totalSlides) {
            console.log('Invalid slide number:', slideNumber);
            return;
        }
        
        if (slideNumber === this.currentSlide) {
            console.log('Already on target slide');
            return;
        }

        this.isAnimating = true;
        console.log(`Navigating from slide ${this.currentSlide} to slide ${slideNumber}`);
        
        // Hide current slide
        const currentSlideElement = document.getElementById(`slide-${this.currentSlide}`);
        if (currentSlideElement) {
            currentSlideElement.classList.remove('active');
            console.log('Removed active class from current slide');
        }

        // Update current slide number
        const oldSlide = this.currentSlide;
        this.currentSlide = slideNumber;

        // Show new slide
        const newSlideElement = document.getElementById(`slide-${this.currentSlide}`);
        if (newSlideElement) {
            // Small delay for smooth transition
            setTimeout(() => {
                newSlideElement.classList.add('active');
                console.log('Added active class to new slide');
                
                // Reset scroll position of new slide content
                const scrollableContent = newSlideElement.querySelector('.scrollable-content');
                if (scrollableContent) {
                    scrollableContent.scrollTop = 0;
                }
                
                // Update UI
                this.updateUI();
                
                // Re-enable navigation after animation
                setTimeout(() => {
                    this.isAnimating = false;
                    console.log('Navigation re-enabled');
                }, 300);
            }, 50);
        } else {
            console.error('Could not find slide element:', `slide-${this.currentSlide}`);
            this.currentSlide = oldSlide; // Revert on error
            this.isAnimating = false;
        }
    }

    updateUI() {
        this.updateSlideCounter();
        this.updateNavigationButtons();
        this.updateProgressDots();
        console.log('UI updated for slide:', this.currentSlide);
    }

    updateSlideCounter() {
        if (this.currentSlideSpan) {
            this.currentSlideSpan.textContent = this.currentSlide;
        }
    }

    updateNavigationButtons() {
        if (this.prevBtn) {
            const isDisabled = this.currentSlide === 1;
            this.prevBtn.disabled = isDisabled;
            this.prevBtn.style.opacity = isDisabled ? '0.5' : '1';
        }
        
        if (this.nextBtn) {
            const isDisabled = this.currentSlide === this.totalSlides;
            this.nextBtn.disabled = isDisabled;
            this.nextBtn.style.opacity = isDisabled ? '0.5' : '1';
        }
    }

    updateProgressDots() {
        if (!this.progressDotsContainer) return;
        
        const dots = this.progressDotsContainer.querySelectorAll('.progress-dot');
        dots.forEach((dot, index) => {
            const isActive = index + 1 === this.currentSlide;
            dot.classList.toggle('active', isActive);
        });
    }

    showSlideJumpDialog() {
        const slideNum = prompt(
            `Jump to slide (1-${this.totalSlides}):`,
            this.currentSlide.toString()
        );
        
        const num = parseInt(slideNum, 10);
        if (!isNaN(num) && num >= 1 && num <= this.totalSlides) {
            this.goToSlide(num);
            this.showFeedback(`Jumped to slide ${num}`);
        } else if (slideNum !== null) {
            this.showFeedback('Invalid slide number');
        }
    }

    toggleFullscreen() {
        if (this.isFullscreen) {
            this.exitFullscreen();
        } else {
            this.enterFullscreen();
        }
    }

    enterFullscreen() {
        const element = this.presentationContainer;
        
        const requestFullscreen = element.requestFullscreen ||
                                element.webkitRequestFullscreen ||
                                element.mozRequestFullScreen ||
                                element.msRequestFullscreen;
        
        if (requestFullscreen) {
            requestFullscreen.call(element).catch(err => {
                console.log('Fullscreen request failed:', err);
                this.fallbackFullscreen(true);
            });
        } else {
            this.fallbackFullscreen(true);
        }
    }

    exitFullscreen() {
        const exitFullscreen = document.exitFullscreen ||
                             document.webkitExitFullscreen ||
                             document.mozCancelFullScreen ||
                             document.msExitFullscreen;
        
        if (exitFullscreen) {
            exitFullscreen.call(document).catch(err => {
                console.log('Exit fullscreen failed:', err);
                this.fallbackFullscreen(false);
            });
        } else {
            this.fallbackFullscreen(false);
        }
    }

    fallbackFullscreen(enter) {
        this.isFullscreen = enter;
        this.presentationContainer.classList.toggle('fullscreen', enter);
        this.updateFullscreenButton();
        
        if (enter && this.isMobile) {
            setTimeout(() => {
                window.scrollTo(0, 1);
            }, 100);
        }
    }

    handleFullscreenChange() {
        this.isFullscreen = !!(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement
        );
        
        this.updateFullscreenButton();
        
        if (this.isMobile) {
            setTimeout(() => this.handleResize(), 100);
        }
        
        console.log('Fullscreen changed:', this.isFullscreen);
    }
    
    updateFullscreenButton() {
        this.presentationContainer.classList.toggle('fullscreen', this.isFullscreen);
        
        if (this.fullscreenBtn) {
            this.fullscreenBtn.title = this.isFullscreen ? 
                'Hold to exit fullscreen' : 
                'Hold to enter fullscreen';
        }
    }

    handleOrientationChange() {
        this.handleResize();
        
        if (this.isMobile) {
            setTimeout(() => {
                window.scrollTo(0, 1);
            }, 500);
        }
        
        console.log('Orientation changed');
    }

    handleResize() {
        this.isMobile = this.detectMobile();
        
        const activeSlide = document.querySelector('.slide.active');
        if (activeSlide) {
            const scrollableContent = activeSlide.querySelector('.scrollable-content');
            if (scrollableContent) {
                scrollableContent.scrollTop = 0;
            }
        }
        
        console.log('Resize handled, mobile:', this.isMobile);
    }

    showFeedback(message) {
        // Remove existing feedback
        const existing = document.querySelector('.feedback-message');
        if (existing) {
            existing.remove();
        }
        
        // Create feedback element
        const feedback = document.createElement('div');
        feedback.className = 'feedback-message';
        feedback.textContent = message;
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.85);
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 2rem;
            font-size: 0.875rem;
            font-weight: 500;
            z-index: 10000;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s ease;
            max-width: 200px;
            text-align: center;
        `;
        
        document.body.appendChild(feedback);
        
        // Animate in
        setTimeout(() => {
            feedback.style.opacity = '1';
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            feedback.style.opacity = '0';
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.parentNode.removeChild(feedback);
                }
            }, 200);
        }, 1500);
    }

    hideSwipeHintAfterDelay() {
        if (this.swipeHint && this.isMobile) {
            setTimeout(() => {
                this.swipeHint.style.transition = 'opacity 1s ease';
                this.swipeHint.style.opacity = '0.3';
                
                setTimeout(() => {
                    this.swipeHint.style.display = 'none';
                }, 1000);
            }, 5000);
        }
    }

    // Utility functions
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Public API
    getCurrentSlideInfo() {
        return {
            current: this.currentSlide,
            total: this.totalSlides,
            isFirst: this.currentSlide === 1,
            isLast: this.currentSlide === this.totalSlides,
            isFullscreen: this.isFullscreen,
            isMobile: this.isMobile
        };
    }

    jumpToSlide(slideNumber) {
        if (slideNumber >= 1 && slideNumber <= this.totalSlides) {
            this.goToSlide(slideNumber);
        }
    }
}

// Initialize presentation
let presentation;

function initializePresentation() {
    console.log('Initializing Mobile Stack Presentation...');
    presentation = new MobileStackPresentation();
    
    // Global access for debugging
    window.stackPresentation = presentation;
    
    // Performance monitoring
    if ('performance' in window) {
        window.addEventListener('load', () => {
            console.log('Presentation loaded successfully');
        });
    }
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePresentation);
} else {
    initializePresentation();
}

// Help dialog for keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if ((e.key === 'h' || e.key === 'H') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        showHelpDialog();
    }
});

function showHelpDialog() {
    const helpText = `Stack Presentation - Controls:

MOBILE GESTURES:
👆 Tap navigation buttons
👈👉 Swipe left/right to navigate
🖐️ Hold fullscreen button to toggle
📍 Tap progress dots to jump to slides
📜 Scroll within slides for more content

KEYBOARD SHORTCUTS:
⬅️➡️ Arrow keys: Navigate slides
Space: Next slide
Home/End: First/Last slide
Ctrl+F: Toggle fullscreen
Escape: Exit fullscreen
Ctrl+H: Show this help

FEATURES:
✅ Works on all smartphones
✅ Content scrolls within slides
✅ Touch-optimized navigation
✅ Responsive design that adapts
✅ Smooth animations
✅ Battery efficient`;
    
    alert(helpText);
}

// Additional mobile-specific styles injection
const mobileStyles = document.createElement('style');
mobileStyles.textContent = `
    /* Additional Mobile Safety Styles */
    .mobile-device {
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
        -webkit-tap-highlight-color: transparent;
    }
    
    .mobile-device .scrollable-content {
        /* Allow text selection in scrollable areas */
        -webkit-user-select: text;
        -moz-user-select: text;
        -ms-user-select: text;
        user-select: text;
        -webkit-touch-callout: default;
    }
    
    /* Ensure proper touch scrolling on iOS */
    .scrollable-content {
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;
    }
    
    /* Prevent text selection outside scrollable areas */
    .slide-container {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }
    
    /* High contrast mode support */
    @media (prefers-contrast: high) {
        .nav-btn,
        .fullscreen-btn,
        .slide-counter {
            border: 2px solid currentColor;
        }
        
        .progress-dot {
            border: 1px solid currentColor;
        }
    }
    
    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
        .slide-emoji {
            animation: none !important;
        }
        
        .closing-message, .question-prompt {
            animation: none !important;
        }
        
        * {
            transition-duration: 0.1s !important;
            animation-duration: 0.1s !important;
        }
    }
    
    /* Custom properties for viewport units on mobile */
    :root {
        --vh: 1vh;
    }
    
    .mobile-device .presentation-container {
        height: calc(var(--vh, 1vh) * 100);
        min-height: -webkit-fill-available;
    }
    
    /* Focus indicators for accessibility */
    .nav-btn:focus-visible,
    .fullscreen-btn:focus-visible,
    .slide-counter:focus-visible,
    .progress-dot:focus-visible {
        outline: 2px solid white;
        outline-offset: 2px;
    }
    
    /* Ensure no content overflows viewport */
    .slide-content * {
        max-width: 100%;
        word-wrap: break-word;
        overflow-wrap: break-word;
    }
    
    /* Feedback message styling */
    .feedback-message {
        font-family: var(--font-family-base);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
    }
`;

document.head.appendChild(mobileStyles);

console.log('✅ FIXED Mobile Stack Data Structure Presentation loaded!');
console.log('📱 Navigation buttons now work properly');
console.log('📍 Progress dots are now clickable');
console.log('📜 Content scrolls within slides');
console.log('👆 All touch interactions work');
console.log('⌨️ Press Ctrl+H for help');
