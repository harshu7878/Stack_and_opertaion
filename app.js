// Responsive Stack Data Structure Presentation JavaScript

class ResponsiveStackPresentation {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 12;
        this.isFullscreen = false;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.isSwiping = false;
        this.swipeThreshold = 30; // Reduced threshold for better sensitivity
        this.isTransitioning = false;
        
        // Device detection
        this.isMobile = this.detectMobile();
        this.isTablet = this.detectTablet();
        
        // Initialize after DOM is ready
        this.initializeWhenReady();
    }

    detectMobile() {
        return window.innerWidth <= 768 || 
               /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    detectTablet() {
        return window.innerWidth >= 768 && window.innerWidth <= 1024;
    }

    initializeWhenReady() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => this.initialize(), 150);
            });
        } else {
            setTimeout(() => this.initialize(), 150);
        }
    }

    initialize() {
        console.log('Initializing Responsive Stack Presentation...');
        
        try {
            this.initializeElements();
            this.createSlideDots(); // Create dots before setting up listeners
            this.setupEventListeners();
            this.setupTouchGestures();
            this.updateUI();
            this.setupResponsiveFeatures();
            this.showInitialSwipeHint();
            
            console.log('Presentation initialized successfully:', {
                isMobile: this.isMobile,
                isTablet: this.isTablet,
                totalSlides: this.totalSlides,
                dotsCreated: document.querySelectorAll('.slide-dot').length
            });
        } catch (error) {
            console.error('Error initializing presentation:', error);
        }
    }

    initializeElements() {
        // Main elements
        this.slideContainer = document.getElementById('slide-container');
        this.slides = document.querySelectorAll('.slide');
        this.presentationContainer = document.querySelector('.presentation-container');
        
        // Navigation elements
        this.mobileNavPrev = document.getElementById('mobile-prev-btn');
        this.mobileNavNext = document.getElementById('mobile-next-btn');
        this.desktopNavPrev = document.getElementById('prev-btn');
        this.desktopNavNext = document.getElementById('next-btn');
        
        // UI elements
        this.slideCounter = document.getElementById('slide-counter');
        this.currentSlideSpan = document.getElementById('current-slide');
        this.totalSlidesSpan = document.getElementById('total-slides');
        this.fullscreenBtn = document.getElementById('fullscreen-btn');
        this.progressBar = document.getElementById('progress-bar');
        this.slideDotsContainer = document.getElementById('slide-dots');
        this.swipeIndicator = document.getElementById('swipe-indicator');
        
        // Set total slides
        if (this.totalSlidesSpan) {
            this.totalSlidesSpan.textContent = this.totalSlides;
        }
        
        // Ensure first slide is active
        this.slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === 0);
        });
        
        console.log('Elements initialized:', {
            slideContainer: !!this.slideContainer,
            slides: this.slides.length,
            slideDotsContainer: !!this.slideDotsContainer,
            mobileNavButtons: !!(this.mobileNavPrev && this.mobileNavNext),
            fullscreenBtn: !!this.fullscreenBtn
        });
    }

    createSlideDots() {
        if (!this.slideDotsContainer) {
            console.warn('Slide dots container not found');
            return;
        }
        
        // Clear existing dots
        this.slideDotsContainer.innerHTML = '';
        
        // Create dots for each slide
        for (let i = 1; i <= this.totalSlides; i++) {
            const dot = document.createElement('button');
            dot.className = 'slide-dot';
            dot.setAttribute('aria-label', `Go to slide ${i}`);
            dot.setAttribute('data-slide', i);
            dot.type = 'button';
            
            // Set initial active state
            if (i === 1) {
                dot.classList.add('active');
            }
            
            // Add click handler
            dot.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`Slide dot ${i} clicked`);
                this.goToSlide(i);
            });
            
            // Add touch handlers for better mobile experience
            dot.addEventListener('touchstart', (e) => {
                e.preventDefault();
                dot.style.transform = 'scale(1.3)';
            });
            
            dot.addEventListener('touchend', (e) => {
                setTimeout(() => {
                    dot.style.transform = 'scale(1)';
                }, 100);
            });
            
            this.slideDotsContainer.appendChild(dot);
        }
        
        console.log(`Created ${this.totalSlides} slide dots`);
        
        // Verify dots are visible
        const createdDots = this.slideDotsContainer.querySelectorAll('.slide-dot');
        console.log('Dots created and visible:', createdDots.length);
        
        // Force a reflow to ensure dots are rendered
        this.slideDotsContainer.offsetHeight;
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Mobile navigation
        if (this.mobileNavPrev) {
            this.mobileNavPrev.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Mobile previous button clicked');
                this.previousSlide();
            });
        }
        
        if (this.mobileNavNext) {
            this.mobileNavNext.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Mobile next button clicked');
                this.nextSlide();
            });
        }
        
        // Desktop navigation
        if (this.desktopNavPrev) {
            this.desktopNavPrev.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.previousSlide();
            });
        }
        
        if (this.desktopNavNext) {
            this.desktopNavNext.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.nextSlide();
            });
        }
        
        // Fullscreen toggle with better handling
        if (this.fullscreenBtn) {
            this.fullscreenBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Fullscreen button clicked');
                this.toggleFullscreen();
            });
        }
        
        // Slide counter tap
        if (this.slideCounter) {
            this.slideCounter.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSlideProgress();
            });
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyNavigation(e));
        
        // Fullscreen change events
        ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(event => {
            document.addEventListener(event, () => this.handleFullscreenChange());
        });
        
        // Orientation and resize handling
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.handleOrientationChange(), 100);
        });
        
        window.addEventListener('resize', () => this.handleResize());
        
        console.log('Event listeners setup complete');
    }

    setupTouchGestures() {
        if (!this.slideContainer) {
            console.warn('No slide container found for touch gestures');
            return;
        }
        
        let touchStartTime = 0;
        let initialTouchX = 0;
        let initialTouchY = 0;
        let isVerticalScroll = false;
        
        // Improved touch start handler
        this.slideContainer.addEventListener('touchstart', (e) => {
            if (e.touches.length !== 1 || this.isTransitioning) return;
            
            const touch = e.touches[0];
            this.touchStartX = touch.clientX;
            this.touchStartY = touch.clientY;
            initialTouchX = touch.clientX;
            initialTouchY = touch.clientY;
            touchStartTime = Date.now();
            this.isSwiping = false;
            isVerticalScroll = false;
            
            console.log('Touch start:', { x: this.touchStartX, y: this.touchStartY });
            
            // Hide swipe indicator on first touch
            if (this.swipeIndicator) {
                this.swipeIndicator.classList.remove('show');
            }
        }, { passive: true });
        
        // Improved touch move handler
        this.slideContainer.addEventListener('touchmove', (e) => {
            if (e.touches.length !== 1 || this.isTransitioning) return;
            
            const touch = e.touches[0];
            const deltaX = Math.abs(touch.clientX - initialTouchX);
            const deltaY = Math.abs(touch.clientY - initialTouchY);
            
            // Determine scroll direction on first significant movement
            if (!this.isSwiping && !isVerticalScroll && (deltaX > 5 || deltaY > 5)) {
                if (deltaX > deltaY && deltaX > 10) {
                    // Horizontal swipe
                    this.isSwiping = true;
                    console.log('Horizontal swipe initiated');
                } else if (deltaY > deltaX && deltaY > 10) {
                    // Vertical scroll
                    isVerticalScroll = true;
                    console.log('Vertical scroll detected');
                }
            }
            
            // Prevent default for horizontal swipes
            if (this.isSwiping) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // Improved touch end handler
        this.slideContainer.addEventListener('touchend', (e) => {
            if (e.changedTouches.length !== 1 || this.isTransitioning || isVerticalScroll) {
                this.isSwiping = false;
                return;
            }
            
            const touch = e.changedTouches[0];
            this.touchEndX = touch.clientX;
            this.touchEndY = touch.clientY;
            
            const deltaX = this.touchEndX - this.touchStartX;
            const deltaY = Math.abs(this.touchEndY - this.touchStartY);
            const swipeTime = Date.now() - touchStartTime;
            const swipeDistance = Math.abs(deltaX);
            
            console.log('Touch end:', { 
                deltaX, 
                deltaY, 
                swipeTime, 
                swipeDistance,
                isSwiping: this.isSwiping,
                threshold: this.swipeThreshold
            });
            
            // Process swipe if conditions are met
            if (this.isSwiping && 
                swipeDistance > this.swipeThreshold && 
                deltaY < 100 && 
                swipeTime < 500) {
                
                if (deltaX > 0) {
                    // Swipe right - previous slide
                    console.log('Swipe right: going to previous slide');
                    this.previousSlide();
                } else {
                    // Swipe left - next slide  
                    console.log('Swipe left: going to next slide');
                    this.nextSlide();
                }
            }
            
            this.isSwiping = false;
        }, { passive: true });
        
        console.log('Touch gestures setup complete with threshold:', this.swipeThreshold);
    }

    setupResponsiveFeatures() {
        if (this.isMobile) {
            document.body.classList.add('mobile-device');
        }
        
        // Add enhanced visual feedback
        const interactiveElements = document.querySelectorAll('.operation-card, .application-card, .implementation-card, .step');
        interactiveElements.forEach(element => {
            element.addEventListener('touchstart', function() {
                this.classList.add('touch-active');
            });
            
            element.addEventListener('touchend', function() {
                setTimeout(() => this.classList.remove('touch-active'), 150);
            });
        });
        
        console.log('Responsive features setup complete');
    }

    showInitialSwipeHint() {
        if (this.isMobile && this.swipeIndicator) {
            setTimeout(() => {
                this.swipeIndicator.classList.add('show');
                setTimeout(() => {
                    this.swipeIndicator.classList.remove('show');
                }, 3000);
            }, 1000);
        }
    }

    handleKeyNavigation(event) {
        if (this.isTransitioning) return;
        
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
        if (this.isTransitioning || this.currentSlide <= 1) return;
        this.goToSlide(this.currentSlide - 1);
    }

    nextSlide() {
        if (this.isTransitioning || this.currentSlide >= this.totalSlides) return;
        this.goToSlide(this.currentSlide + 1);
    }

    goToSlide(slideNumber) {
        console.log('goToSlide called:', slideNumber, 'from:', this.currentSlide);
        
        if (this.isTransitioning || 
            slideNumber < 1 || 
            slideNumber > this.totalSlides || 
            slideNumber === this.currentSlide) {
            return;
        }

        this.isTransitioning = true;
        
        // Hide current slide
        const currentSlideElement = document.getElementById(`slide-${this.currentSlide}`);
        if (currentSlideElement) {
            currentSlideElement.classList.remove('active');
        }

        // Update current slide number
        this.currentSlide = slideNumber;

        // Show new slide
        const newSlideElement = document.getElementById(`slide-${this.currentSlide}`);
        if (newSlideElement) {
            newSlideElement.classList.add('active');
        }

        // Update all UI elements
        this.updateUI();
        
        // Re-enable transitions after animation
        setTimeout(() => {
            this.isTransitioning = false;
        }, 500);
        
        // Announce slide change for accessibility
        this.announceSlideChange();
    }

    updateUI() {
        this.updateSlideCounter();
        this.updateNavigationButtons();
        this.updateProgressBar();
        this.updateSlideDots();
    }

    updateSlideCounter() {
        if (this.currentSlideSpan) {
            this.currentSlideSpan.textContent = this.currentSlide;
            
            // Add visual feedback
            if (this.slideCounter) {
                this.slideCounter.style.transform = 'scale(1.1)';
                this.slideCounter.style.transition = 'transform 0.2s ease';
                setTimeout(() => {
                    this.slideCounter.style.transform = 'scale(1)';
                }, 200);
            }
        }
    }

    updateNavigationButtons() {
        const isFirst = this.currentSlide === 1;
        const isLast = this.currentSlide === this.totalSlides;
        
        // Update mobile navigation
        [this.mobileNavPrev, this.desktopNavPrev].forEach(btn => {
            if (btn) {
                btn.disabled = isFirst;
                btn.style.opacity = isFirst ? '0.5' : '1';
            }
        });
        
        [this.mobileNavNext, this.desktopNavNext].forEach(btn => {
            if (btn) {
                btn.disabled = isLast;
                btn.style.opacity = isLast ? '0.5' : '1';
            }
        });
    }

    updateProgressBar() {
        if (this.progressBar) {
            const progress = (this.currentSlide / this.totalSlides) * 100;
            this.progressBar.style.width = `${progress}%`;
        }
    }

    updateSlideDots() {
        const dots = this.slideDotsContainer?.querySelectorAll('.slide-dot');
        if (dots && dots.length > 0) {
            dots.forEach((dot, index) => {
                const isActive = index + 1 === this.currentSlide;
                dot.classList.toggle('active', isActive);
                
                // Add visual feedback for active dot
                if (isActive) {
                    dot.style.transform = 'scale(1.2)';
                    setTimeout(() => {
                        dot.style.transform = 'scale(1)';
                    }, 200);
                }
            });
            console.log(`Updated slide dots, active: ${this.currentSlide}`);
        } else {
            console.warn('No slide dots found to update');
        }
    }

    showSlideProgress() {
        const progressText = `Slide ${this.currentSlide} of ${this.totalSlides}`;
        this.showToast(progressText);
    }

    showToast(message) {
        // Remove existing toast
        const existingToast = document.querySelector('.toast-message');
        if (existingToast) {
            existingToast.remove();
        }
        
        // Create new toast
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 1rem;
            z-index: 2000;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
        });
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    toggleFullscreen() {
        console.log('Toggle fullscreen, current state:', this.isFullscreen);
        if (this.isFullscreen) {
            this.exitFullscreen();
        } else {
            this.enterFullscreen();
        }
    }

    enterFullscreen() {
        console.log('Entering fullscreen...');
        const element = this.presentationContainer || document.documentElement;
        
        const requestFullscreen = element.requestFullscreen || 
                                 element.webkitRequestFullscreen || 
                                 element.mozRequestFullScreen || 
                                 element.msRequestFullscreen;
        
        if (requestFullscreen) {
            requestFullscreen.call(element).then(() => {
                console.log('Entered fullscreen successfully');
            }).catch(err => {
                console.warn('Fullscreen request failed, using fallback:', err);
                this.fallbackFullscreen();
            });
        } else {
            console.log('Fullscreen API not supported, using fallback');
            this.fallbackFullscreen();
        }
    }

    exitFullscreen() {
        console.log('Exiting fullscreen...');
        const exitFullscreen = document.exitFullscreen || 
                              document.webkitExitFullscreen || 
                              document.mozCancelFullScreen || 
                              document.msExitFullscreen;
        
        if (exitFullscreen) {
            exitFullscreen.call(document).then(() => {
                console.log('Exited fullscreen successfully');
            }).catch(err => {
                console.warn('Exit fullscreen failed, using fallback:', err);
                this.fallbackExitFullscreen();
            });
        } else {
            this.fallbackExitFullscreen();
        }
    }

    fallbackFullscreen() {
        console.log('Using fallback fullscreen');
        this.isFullscreen = true;
        this.presentationContainer.classList.add('fullscreen');
        document.body.style.overflow = 'hidden';
        this.updateFullscreenButton();
    }

    fallbackExitFullscreen() {
        console.log('Using fallback exit fullscreen');
        this.isFullscreen = false;
        this.presentationContainer.classList.remove('fullscreen');
        document.body.style.overflow = '';
        this.updateFullscreenButton();
    }

    handleFullscreenChange() {
        const isInFullscreen = !!(document.fullscreenElement || 
                                 document.webkitFullscreenElement || 
                                 document.mozFullScreenElement || 
                                 document.msFullscreenElement);
        
        console.log('Fullscreen state changed:', this.isFullscreen, '->', isInFullscreen);
        this.isFullscreen = isInFullscreen;
        this.updateFullscreenButton();
    }
    
    updateFullscreenButton() {
        if (!this.fullscreenBtn) return;
        
        // Clear any stuck states
        this.fullscreenBtn.blur();
        
        if (this.isFullscreen) {
            this.presentationContainer.classList.add('fullscreen');
            this.fullscreenBtn.setAttribute('aria-label', 'Exit Fullscreen');
            this.fullscreenBtn.title = 'Exit Fullscreen (Esc)';
        } else {
            this.presentationContainer.classList.remove('fullscreen');
            this.fullscreenBtn.setAttribute('aria-label', 'Enter Fullscreen');
            this.fullscreenBtn.title = 'Enter Fullscreen (F)';
        }
    }

    handleOrientationChange() {
        this.isMobile = this.detectMobile();
        this.isTablet = this.detectTablet();
        
        setTimeout(() => {
            this.updateUI();
            // Recreate dots if needed after orientation change
            if (this.slideDotsContainer && this.slideDotsContainer.children.length === 0) {
                this.createSlideDots();
            }
        }, 200);
    }

    handleResize() {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.isMobile = this.detectMobile();
            this.isTablet = this.detectTablet();
            this.updateUI();
        }, 250);
    }

    announceSlideChange() {
        let announcement = document.getElementById('slide-announcement');
        if (!announcement) {
            announcement = document.createElement('div');
            announcement.id = 'slide-announcement';
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-atomic', 'true');
            announcement.className = 'sr-only';
            document.body.appendChild(announcement);
        }
        
        const slideTitle = document.querySelector(`#slide-${this.currentSlide} .slide-title, #slide-${this.currentSlide} .main-title`);
        const title = slideTitle ? slideTitle.textContent : `Slide ${this.currentSlide}`;
        
        announcement.textContent = `${title}. Slide ${this.currentSlide} of ${this.totalSlides}`;
    }

    // Public utility methods
    getCurrentSlideInfo() {
        return {
            current: this.currentSlide,
            total: this.totalSlides,
            isFirst: this.currentSlide === 1,
            isLast: this.currentSlide === this.totalSlides,
            isFullscreen: this.isFullscreen,
            isMobile: this.isMobile,
            isTablet: this.isTablet
        };
    }

    jumpToSlide(slideNumber) {
        if (slideNumber >= 1 && slideNumber <= this.totalSlides) {
            this.goToSlide(slideNumber);
        }
    }
}

// Initialize presentation
let stackPresentation;

function initializePresentation() {
    console.log('Initializing responsive presentation...');
    
    try {
        stackPresentation = new ResponsiveStackPresentation();
        window.stackPresentation = stackPresentation;
        
        console.log('Responsive Stack Presentation ready!');
        console.log('Controls: Swipe, tap buttons, use arrow keys, or tap slide dots');
        
    } catch (error) {
        console.error('Failed to initialize presentation:', error);
    }
}

// Multiple initialization paths
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePresentation);
} else {
    initializePresentation();
}

// Fallback
window.addEventListener('load', () => {
    if (!window.stackPresentation) {
        console.log('Fallback initialization');
        initializePresentation();
    }
});

// Add enhanced touch styles
const enhancedStyles = document.createElement('style');
enhancedStyles.textContent = `
    .touch-active {
        transform: scale(0.98) !important;
        opacity: 0.9 !important;
        transition: all 0.1s ease !important;
    }
    
    .slide-dot {
        transition: all 0.2s ease !important;
    }
    
    .slide-dot:active {
        transform: scale(1.3) !important;
    }
    
    .fullscreen-btn {
        transition: all 0.2s ease !important;
    }
    
    .fullscreen-btn:focus {
        outline: 2px solid rgba(255, 255, 255, 0.8) !important;
        outline-offset: 2px !important;
    }
`;

document.head.appendChild(enhancedStyles);

// Global help function
window.showHelp = function() {
    const helpText = `Stack Presentation Controls:

Navigation:
• Swipe left/right (mobile/tablet)
• Click Next/Previous buttons
• Use arrow keys or spacebar
• Click slide dots to jump
• Tap slide counter for progress

Fullscreen:
• Click fullscreen button
• Press F key
• Press Escape to exit

Accessibility:
• Screen reader compatible
• Keyboard navigation
• ARIA labels included`;
    
    if (window.stackPresentation?.isMobile) {
        window.stackPresentation.showToast('Swipe or tap to navigate');
    } else {
        alert(helpText);
    }
};

// Debug function
window.debugSlides = function() {
    console.log('Debug Info:', {
        presentation: !!window.stackPresentation,
        currentSlide: window.stackPresentation?.currentSlide,
        totalSlides: window.stackPresentation?.totalSlides,
        slideDots: document.querySelectorAll('.slide-dot').length,
        activeSlide: document.querySelector('.slide.active')?.id,
        isMobile: window.stackPresentation?.isMobile
    });
};

console.log('Stack Presentation loaded! Try window.showHelp() for controls.');
