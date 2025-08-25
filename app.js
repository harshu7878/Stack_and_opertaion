// Stack Data Structure Presentation JavaScript

class StackPresentation {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 12;
        this.isFullscreen = false;
        
        // Initialize after a short delay to ensure DOM is fully ready
        setTimeout(() => {
            this.initializeElements();
            this.setupEventListeners();
            this.updateSlideCounter();
            this.updateNavigationButtons();
            console.log('Stack Presentation initialized successfully');
        }, 100);
    }

    initializeElements() {
        // Get DOM elements
        this.slideContainer = document.getElementById('slide-container');
        this.slides = document.querySelectorAll('.slide');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.fullscreenBtn = document.getElementById('fullscreen-btn');
        this.currentSlideSpan = document.getElementById('current-slide');
        this.totalSlidesSpan = document.getElementById('total-slides');
        this.presentationContainer = document.querySelector('.presentation-container');
        
        // Set total slides
        if (this.totalSlidesSpan) {
            this.totalSlidesSpan.textContent = this.totalSlides;
        }
        
        // Ensure first slide is active
        this.slides.forEach((slide, index) => {
            if (index === 0) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });
        
        console.log('Elements initialized:', {
            slides: this.slides.length,
            prevBtn: !!this.prevBtn,
            nextBtn: !!this.nextBtn,
            fullscreenBtn: !!this.fullscreenBtn
        });
    }

    setupEventListeners() {
        // Navigation button listeners
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Previous button clicked');
                this.previousSlide();
            });
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Next button clicked');
                this.nextSlide();
            });
        }
        
        // Fullscreen button listener
        if (this.fullscreenBtn) {
            this.fullscreenBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Fullscreen button clicked');
                this.toggleFullscreen();
            });
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyNavigation(e));
        
        // Fullscreen change events
        document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('mozfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('MSFullscreenChange', () => this.handleFullscreenChange());
        
        // Touch/swipe support for mobile
        this.setupTouchEvents();
        
        console.log('Event listeners set up');
    }

    setupTouchEvents() {
        let startX = 0;
        let endX = 0;
        const minSwipeDistance = 50;

        if (this.slideContainer) {
            this.slideContainer.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
            });

            this.slideContainer.addEventListener('touchend', (e) => {
                endX = e.changedTouches[0].clientX;
                this.handleSwipe(startX, endX, minSwipeDistance);
            });
        }
    }

    handleSwipe(startX, endX, minDistance) {
        const distance = endX - startX;
        
        if (Math.abs(distance) > minDistance) {
            if (distance > 0) {
                // Swipe right - go to previous slide
                this.previousSlide();
            } else {
                // Swipe left - go to next slide
                this.nextSlide();
            }
        }
    }

    handleKeyNavigation(event) {
        switch(event.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
                event.preventDefault();
                console.log('Left arrow pressed');
                this.previousSlide();
                break;
            case 'ArrowRight':
            case 'ArrowDown':
            case ' ': // Spacebar
                event.preventDefault();
                console.log('Right arrow or space pressed');
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
        if (this.currentSlide > 1) {
            this.goToSlide(this.currentSlide - 1);
        }
    }

    nextSlide() {
        console.log('nextSlide called, current:', this.currentSlide);
        if (this.currentSlide < this.totalSlides) {
            this.goToSlide(this.currentSlide + 1);
        }
    }

    goToSlide(slideNumber) {
        console.log('goToSlide called:', slideNumber);
        
        if (slideNumber < 1 || slideNumber > this.totalSlides) {
            console.log('Invalid slide number:', slideNumber);
            return;
        }

        // Hide current slide
        const currentSlideElement = document.getElementById(`slide-${this.currentSlide}`);
        if (currentSlideElement) {
            currentSlideElement.classList.remove('active');
            console.log('Removed active from slide:', this.currentSlide);
        }

        // Update current slide number
        this.currentSlide = slideNumber;

        // Show new slide
        const newSlideElement = document.getElementById(`slide-${this.currentSlide}`);
        if (newSlideElement) {
            newSlideElement.classList.add('active');
            console.log('Added active to slide:', this.currentSlide);
        } else {
            console.error('Could not find slide element:', `slide-${this.currentSlide}`);
        }

        // Update UI
        this.updateSlideCounter();
        this.updateNavigationButtons();
        this.animateSlideTransition();
    }

    animateSlideTransition() {
        const activeSlide = document.querySelector('.slide.active');
        if (activeSlide) {
            // Reset animation
            activeSlide.style.animation = 'none';
            // Force reflow
            activeSlide.offsetHeight;
            // Re-add animation
            activeSlide.style.animation = 'slideIn 0.5s ease-out';
        }
    }

    updateSlideCounter() {
        if (this.currentSlideSpan) {
            this.currentSlideSpan.textContent = this.currentSlide;
            console.log('Updated slide counter to:', this.currentSlide);
            
            // Add a subtle animation to the counter
            this.currentSlideSpan.style.transform = 'scale(1.1)';
            this.currentSlideSpan.style.transition = 'transform 0.2s ease';
            setTimeout(() => {
                this.currentSlideSpan.style.transform = 'scale(1)';
            }, 200);
        }
    }

    updateNavigationButtons() {
        // Update previous button
        if (this.prevBtn) {
            this.prevBtn.disabled = this.currentSlide === 1;
            this.prevBtn.style.opacity = this.currentSlide === 1 ? '0.5' : '1';
        }
        
        // Update next button
        if (this.nextBtn) {
            this.nextBtn.disabled = this.currentSlide === this.totalSlides;
            this.nextBtn.style.opacity = this.currentSlide === this.totalSlides ? '0.5' : '1';
        }
        
        console.log('Updated navigation buttons, current slide:', this.currentSlide);
    }

    toggleFullscreen() {
        console.log('toggleFullscreen called, current state:', this.isFullscreen);
        if (this.isFullscreen) {
            this.exitFullscreen();
        } else {
            this.enterFullscreen();
        }
    }

    enterFullscreen() {
        const element = this.presentationContainer;
        console.log('Entering fullscreen...');
        
        if (element.requestFullscreen) {
            element.requestFullscreen().catch(err => console.error('Fullscreen error:', err));
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        } else {
            // Fallback for browsers that don't support fullscreen API
            console.log('Fullscreen API not supported, using CSS fallback');
            this.isFullscreen = true;
            this.presentationContainer.classList.add('fullscreen');
            this.updateFullscreenButton();
        }
    }

    exitFullscreen() {
        console.log('Exiting fullscreen...');
        
        if (document.exitFullscreen) {
            document.exitFullscreen().catch(err => console.error('Exit fullscreen error:', err));
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else {
            // Fallback
            this.isFullscreen = false;
            this.presentationContainer.classList.remove('fullscreen');
            this.updateFullscreenButton();
        }
    }

    handleFullscreenChange() {
        this.isFullscreen = !!(document.fullscreenElement || 
                              document.webkitFullscreenElement || 
                              document.mozFullScreenElement || 
                              document.msFullscreenElement);
        
        console.log('Fullscreen changed:', this.isFullscreen);
        this.updateFullscreenButton();
    }
    
    updateFullscreenButton() {
        if (this.isFullscreen) {
            this.presentationContainer.classList.add('fullscreen');
            if (this.fullscreenBtn) {
                this.fullscreenBtn.title = 'Exit Fullscreen';
            }
        } else {
            this.presentationContainer.classList.remove('fullscreen');
            if (this.fullscreenBtn) {
                this.fullscreenBtn.title = 'Enter Fullscreen';
            }
        }
    }

    // Utility methods
    getCurrentSlideInfo() {
        return {
            current: this.currentSlide,
            total: this.totalSlides,
            isFirst: this.currentSlide === 1,
            isLast: this.currentSlide === this.totalSlides,
            isFullscreen: this.isFullscreen
        };
    }

    jumpToSlide(slideNumber) {
        if (slideNumber >= 1 && slideNumber <= this.totalSlides) {
            this.goToSlide(slideNumber);
        }
    }
}

// Initialize presentation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing presentation...');
    
    // Create presentation instance
    window.stackPresentation = new StackPresentation();
    
    // Add visual enhancements
    setTimeout(() => {
        addVisualEnhancements();
        createProgressIndicator();
    }, 200);
    
    console.log('Stack Data Structure Presentation setup complete!');
    console.log('Use arrow keys or navigation buttons to navigate between slides.');
    console.log('Press F to toggle fullscreen mode.');
});

// Additional visual enhancements
function addVisualEnhancements() {
    // Add hover effects to interactive elements
    document.querySelectorAll('.operation-card, .application-card, .implementation-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Add click effects to buttons
    document.querySelectorAll('.nav-btn, .fullscreen-btn').forEach(btn => {
        btn.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        btn.addEventListener('mouseup', function() {
            this.style.transform = 'scale(1)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

// Create a progress indicator
function createProgressIndicator() {
    // Remove existing progress indicator if it exists
    const existingProgress = document.querySelector('.progress-indicator');
    if (existingProgress) {
        existingProgress.remove();
    }

    const progressContainer = document.createElement('div');
    progressContainer.className = 'progress-indicator';
    progressContainer.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: rgba(255, 255, 255, 0.2);
        z-index: 1000;
        transition: opacity 0.3s ease;
    `;

    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.style.cssText = `
        height: 100%;
        background: linear-gradient(90deg, #667eea, #764ba2);
        width: ${(1 / 12) * 100}%;
        transition: width 0.3s ease;
    `;

    progressContainer.appendChild(progressBar);
    document.body.appendChild(progressContainer);

    // Update progress bar when slide changes
    const updateProgress = () => {
        if (window.stackPresentation) {
            const currentSlide = window.stackPresentation.currentSlide;
            progressBar.style.width = `${(currentSlide / 12) * 100}%`;
        }
    };

    // Set up interval to update progress
    setInterval(updateProgress, 500);
}

// Keyboard shortcuts help
document.addEventListener('keydown', (e) => {
    if ((e.key === 'h' || e.key === 'H') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        showKeyboardHelp();
    }
});

function showKeyboardHelp() {
    const helpText = `Stack Presentation - Keyboard Shortcuts:

• Arrow Left/Right: Navigate slides
• Space/Arrow Down: Next slide  
• Home: First slide
• End: Last slide
• F: Toggle fullscreen
• Escape: Exit fullscreen
• Ctrl+H: Show this help`;
    
    alert(helpText);
}

// Add print styles
const printStyles = document.createElement('style');
printStyles.textContent = `
    @media print {
        .presentation-header,
        .navigation-controls,
        .progress-indicator {
            display: none !important;
        }
        
        .slide-container {
            padding: 0 !important;
        }
        
        .slide {
            display: block !important;
            page-break-after: always;
            height: auto !important;
            max-height: none !important;
            position: static !important;
        }
        
        .slide:last-child {
            page-break-after: avoid;
        }
        
        body {
            background: white !important;
        }
    }
`;
document.head.appendChild(printStyles);