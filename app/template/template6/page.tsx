'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'

export default function Template6() {
  const [bodyContent, setBodyContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch the HTML file and extract body content and all styles
    fetch('/landing-page6.html')
      .then(response => response.text())
      .then(html => {
        // Extract all style tags from head
        const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i)
        if (headMatch) {
          const headContent = headMatch[1]
          // Extract all style tag contents
          const styleMatches = headContent.match(/<style[^>]*>([\s\S]*?)<\/style>/gi)
          if (styleMatches) {
            let allStyles = ''
            styleMatches.forEach(styleTag => {
              const styleContent = styleTag.match(/<style[^>]*>([\s\S]*?)<\/style>/i)
              if (styleContent && styleContent[1]) {
                allStyles += styleContent[1] + '\n'
              }
            })
            
            // Add all extracted styles to head
            const styleElement = document.createElement('style')
            styleElement.id = 'template6-all-styles'
            styleElement.textContent = allStyles
            const existingStyle = document.getElementById('template6-all-styles')
            if (existingStyle) {
              existingStyle.remove()
            }
            document.head.appendChild(styleElement)
            
            // Add additional fix styles for FAQ
            const fixStyle = document.createElement('style')
            fixStyle.id = 'template6-fix-styles'
            fixStyle.textContent = `
              /* Ensure FAQ functionality works */
              .faq-question {
                display: flex;
                align-items: center;
                justify-content: space-between;
              }
              
              .faq-question span {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                width: 24px;
                height: 24px;
                min-width: 24px;
                min-height: 24px;
              }
              
              .faq-question span img {
                width: 24px;
                height: 24px;
                min-width: 24px;
                min-height: 24px;
                max-width: 24px;
                max-height: 24px;
                object-fit: contain;
                display: block;
              }
              
              /* Ensure consistency on mobile screens */
              @media (max-width: 768px) {
                .faq-question span {
                  width: 24px;
                  height: 24px;
                  min-width: 24px;
                  min-height: 24px;
                }
                
                .faq-question span img {
                  width: 24px;
                  height: 24px;
                  min-width: 24px;
                  min-height: 24px;
                  max-width: 24px;
                  max-height: 24px;
                }
                
                .info .case-study {
                  padding: 2rem 0 !important;
                }
              }
            `
            const existingFixStyle = document.getElementById('template6-fix-styles')
            if (existingFixStyle) {
              existingFixStyle.remove()
            }
            document.head.appendChild(fixStyle)
          }
        }
        
        // Extract body content using regex
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
        if (bodyMatch) {
          setBodyContent(bodyMatch[1])
        } else {
          // Fallback: use entire HTML if body tag not found
          setBodyContent(html)
        }
        setIsLoading(false)
      })
      .catch(error => {
        console.error('Error loading HTML:', error)
        setIsLoading(false)
      })

    // Add CSS links to head
    const links = [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css', integrity: 'sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN', crossOrigin: 'anonymous' },
      { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css' },
      { rel: 'stylesheet', href: 'https://brandstory.in/website-development-company-in-bangalore/style/style.css' },
      { rel: 'stylesheet', href: '/assets/css/menu.css' },
      { rel: 'stylesheet', href: '/assets/css/bootstrap.min.css' },
      { rel: 'stylesheet', href: '/assets/css/global.css' },
      { rel: 'stylesheet', href: '/assets/css/style.css' },
      { rel: 'stylesheet', href: '/assets/css/swiper.css' },
      { rel: 'stylesheet', href: '/assets/css/aos.css' },
    ]

    links.forEach(linkData => {
      const existingLink = document.querySelector(`link[href="${linkData.href}"]`)
      if (!existingLink) {
        const link = document.createElement('link')
        Object.entries(linkData).forEach(([key, value]) => {
          if (key === 'crossOrigin') {
            link.setAttribute('crossorigin', value as string)
          } else if (key === 'integrity') {
            link.setAttribute('integrity', value as string)
          } else {
            link.setAttribute(key, value as string)
          }
        })
        document.head.appendChild(link)
      }
    })

    // Handle lazy loading images
    const handleLazyImages = () => {
      const lazyImages = document.querySelectorAll('img[lazyload]')
      lazyImages.forEach((img: any) => {
        const lazySrc = img.getAttribute('lazyload')
        const defaultSrc = img.getAttribute('defaultimage')
        if (lazySrc) {
          img.src = lazySrc
        } else if (defaultSrc) {
          img.src = defaultSrc
        }
        img.removeAttribute('lazyload')
        img.removeAttribute('defaultimage')
      })
    }
    
    // Initialize FAQ functionality
    const attachFAQHandlers = (buttons: NodeListOf<Element>) => {
      buttons.forEach((button) => {
        // Remove existing listeners by cloning
        const newButton = button.cloneNode(true) as HTMLElement
        button.parentNode?.replaceChild(newButton, button)
        
        newButton.addEventListener('click', (e: Event) => {
          e.preventDefault()
          e.stopPropagation()
          
          const target = e.currentTarget as HTMLElement
          const item = target.parentElement
          const answer = item?.querySelector('.faq-answer')
          
          if (!item || !answer) return
          
          // Close all other FAQs
          document.querySelectorAll('.faq-item').forEach((faq) => {
            if (faq !== item) {
              faq.querySelector('.faq-question')?.classList.remove('active')
              const ans = faq.querySelector('.faq-answer')
              if (ans) {
                (ans as HTMLElement).style.maxHeight = ''
              }
            }
          })
          
          // Toggle current FAQ
          const isOpen = target.classList.contains('active')
          const answerEl = answer as HTMLElement
          if (isOpen) {
            target.classList.remove('active')
            answerEl.style.maxHeight = ''
          } else {
            target.classList.add('active')
            answerEl.style.maxHeight = answerEl.scrollHeight + 'px'
          }
        })
      })
    }
    
    const initFAQ = () => {
      // Wait a bit more for DOM to be ready
      setTimeout(() => {
        const faqButtons = document.querySelectorAll('.faq-question')
        
        if (faqButtons.length === 0) {
          // Try again after a longer delay
          setTimeout(() => {
            const retryButtons = document.querySelectorAll('.faq-question')
            if (retryButtons.length > 0) {
              attachFAQHandlers(retryButtons)
            }
          }, 1000)
          return
        }
        
        attachFAQHandlers(faqButtons)
        
        // Initialize first item as open
        const firstButton = document.querySelector('.faq-question.active')
        if (firstButton) {
          const firstItem = firstButton.parentElement
          const firstAnswer = firstItem?.querySelector('.faq-answer')
          if (firstAnswer) {
            (firstAnswer as HTMLElement).style.maxHeight = (firstAnswer as HTMLElement).scrollHeight + 'px'
          }
        }
      }, 200)
    }

    // Initialize Swiper
    const initSwiper = () => {
      if (typeof window !== 'undefined' && (window as any).Swiper) {
        const Swiper = (window as any).Swiper
        
        // Initialize case study swiper
        const caseSwiperEl = document.querySelector('.myCaseSwiper')
        if (caseSwiperEl && !(caseSwiperEl as any).swiper) {
          new Swiper('.myCaseSwiper', {
            slidesPerView: 2,
            spaceBetween: 30,
            loop: true,
            navigation: {
              nextEl: '.custom-next',
              prevEl: '.custom-prev',
            },
            breakpoints: {
              0: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
            },
          })
        }
      }
    }

    // Wait for content to be loaded and handle lazy images
    if (!isLoading && bodyContent) {
      // Use a longer timeout to ensure DOM is ready
      setTimeout(() => {
        handleLazyImages()
        // Initialize FAQ and Swiper after content is loaded
        initFAQ()
        initSwiper()
      }, 500)
    }

    return () => {
      // Cleanup if needed
    }
  }, [bodyContent, isLoading])
  
  // Additional effect to ensure FAQ and images work after render
  useEffect(() => {
    if (!bodyContent) return
    
    const initializeContent = () => {
      // Handle lazy images
      const lazyImages = document.querySelectorAll('img[lazyload], img[defaultimage]')
      lazyImages.forEach((img: any) => {
        const lazySrc = img.getAttribute('lazyload')
        const defaultSrc = img.getAttribute('defaultimage')
        if (lazySrc && !img.src.includes(lazySrc)) {
          img.src = lazySrc
        } else if (defaultSrc && !img.src.includes(defaultSrc)) {
          img.src = defaultSrc
        }
        img.removeAttribute('lazyload')
        img.removeAttribute('defaultimage')
      })
      
      // Also handle images without src
      const allImages = document.querySelectorAll('img')
      allImages.forEach((img: any) => {
        if (!img.src || img.src === window.location.href || img.src.includes('data:')) {
          const dataSrc = img.getAttribute('data-src') || 
                         img.getAttribute('data-lazy-src') ||
                         img.getAttribute('lazyload') ||
                         img.getAttribute('defaultimage')
          if (dataSrc) {
            img.src = dataSrc
          }
        }
      })
      
      // Initialize FAQ - use event delegation for better reliability
      const faqContainer = document.querySelector('.faq-section')
      if (faqContainer) {
        // Remove old listeners by using event delegation
        faqContainer.addEventListener('click', function(e: any) {
          const target = e.target as HTMLElement
          // Check if clicked element is a button or inside a button
          const button = target.closest('.faq-question') || 
                        (target.classList.contains('faq-question') ? target : null)
          
          if (!button) return
          
          e.preventDefault()
          e.stopPropagation()
          
          const item = button.closest('.faq-item')
          const answer = item?.querySelector('.faq-answer')
          
          if (!item || !answer) return
          
          // Close all other FAQs
          document.querySelectorAll('.faq-item').forEach((faq) => {
            if (faq !== item) {
              faq.querySelector('.faq-question')?.classList.remove('active')
              const ans = faq.querySelector('.faq-answer')
              if (ans) {
                (ans as HTMLElement).style.maxHeight = ''
              }
            }
          })
          
          // Toggle current FAQ
          const isOpen = button.classList.contains('active')
          const answerEl = answer as HTMLElement
          if (isOpen) {
            button.classList.remove('active')
            answerEl.style.maxHeight = ''
          } else {
            button.classList.add('active')
            answerEl.style.maxHeight = answerEl.scrollHeight + 'px'
          }
        })
        
        // Initialize first item as open
        const firstButton = faqContainer.querySelector('.faq-question.active')
        if (firstButton) {
          const firstItem = firstButton.closest('.faq-item')
          const firstAnswer = firstItem?.querySelector('.faq-answer')
          if (firstAnswer) {
            (firstAnswer as HTMLElement).style.maxHeight = (firstAnswer as HTMLElement).scrollHeight + 'px'
          }
        } else {
          // If no item is open, open the first one
          const firstItem = faqContainer.querySelector('.faq-item')
          if (firstItem) {
            const firstButtonEl = firstItem.querySelector('.faq-question')
            const firstAnswerEl = firstItem.querySelector('.faq-answer') as HTMLElement
            if (firstButtonEl && firstAnswerEl) {
              firstButtonEl.classList.add('active')
              firstAnswerEl.style.maxHeight = firstAnswerEl.scrollHeight + 'px'
            }
          }
        }
      }
      
      // Initialize Swiper
      if (typeof window !== 'undefined' && (window as any).Swiper) {
        const Swiper = (window as any).Swiper
        const caseSwiperEl = document.querySelector('.myCaseSwiper')
        if (caseSwiperEl && !(caseSwiperEl as any).swiper) {
          new Swiper('.myCaseSwiper', {
            slidesPerView: 2,
            spaceBetween: 30,
            loop: true,
            navigation: {
              nextEl: '.custom-next',
              prevEl: '.custom-prev',
            },
            breakpoints: {
              0: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
            },
          })
        }
      }
    }
    
    // Use MutationObserver to detect when content is added
    const observer = new MutationObserver((mutations) => {
      let shouldInit = false
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          shouldInit = true
        }
      })
      if (shouldInit) {
        setTimeout(initializeContent, 100)
      }
    })
    
    // Start observing
    const container = document.body
    if (container) {
      observer.observe(container, {
        childList: true,
        subtree: true
      })
    }
    
    // Also run immediately and after delays
    setTimeout(initializeContent, 100)
    setTimeout(initializeContent, 500)
    setTimeout(initializeContent, 1500)
    
    return () => {
      observer.disconnect()
    }
  }, [bodyContent])

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading template...</div>
      </div>
    )
  }

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: bodyContent }} />
      
      <Script 
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" 
        integrity="sha384-BBtl+eGJRgqQAUMxJ7pMwbEyER4l1g+O15P+16Ep7Q9Q+zqX6gSbd85u4mG4QzX+" 
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <Script 
        src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js" 
        strategy="afterInteractive"
        onLoad={() => {
          // Initialize Swiper after it loads
          setTimeout(() => {
            if (typeof window !== 'undefined' && (window as any).Swiper) {
              const Swiper = (window as any).Swiper
              const caseSwiperEl = document.querySelector('.myCaseSwiper')
              if (caseSwiperEl && !(caseSwiperEl as any).swiper) {
                new Swiper('.myCaseSwiper', {
                  slidesPerView: 2,
                  spaceBetween: 30,
                  loop: true,
                  navigation: {
                    nextEl: '.custom-next',
                    prevEl: '.custom-prev',
                  },
                  breakpoints: {
                    0: { slidesPerView: 1 },
                    768: { slidesPerView: 2 },
                  },
                })
              }
            }
          }, 300)
        }}
      />
      <Script 
        src="/assets/js/aos.js" 
        strategy="afterInteractive"
        onLoad={() => {
          if (typeof window !== 'undefined' && (window as any).AOS) {
            (window as any).AOS.init({
              duration: 1000,
              once: true
            })
          }
        }}
      />
      <Script 
        src="/assets/js/jquery.min.js" 
        strategy="afterInteractive"
      />
      <Script 
        src="/assets/js/menu.js" 
        strategy="afterInteractive"
      />
      <Script 
        src="/assets/js/site.js" 
        strategy="afterInteractive"
      />
      {/* Inline script for handling all functionality - runs after content is loaded */}
      {bodyContent && (
        <Script 
          id="template6-inline-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function handleLazyImages() {
                  const lazyImages = document.querySelectorAll('img[lazyload], img[defaultimage]');
                  lazyImages.forEach(function(img) {
                    const lazySrc = img.getAttribute('lazyload');
                    const defaultSrc = img.getAttribute('defaultimage');
                    if (lazySrc && !img.src.includes(lazySrc)) {
                      img.src = lazySrc;
                    } else if (defaultSrc && !img.src.includes(defaultSrc)) {
                      img.src = defaultSrc;
                    }
                    img.removeAttribute('lazyload');
                    img.removeAttribute('defaultimage');
                  });
                  
                  // Ensure all images have proper src attributes
                  const allImages = document.querySelectorAll('img');
                  allImages.forEach(function(img) {
                    if (!img.src || img.src === window.location.href || img.src.includes('data:')) {
                      const dataSrc = img.getAttribute('data-src') || 
                                     img.getAttribute('data-lazy-src') ||
                                     img.getAttribute('lazyload') ||
                                     img.getAttribute('defaultimage');
                      if (dataSrc) {
                        img.src = dataSrc;
                      }
                    }
                  });
                }
                
                function initFAQ() {
                  const faqButtons = document.querySelectorAll('.faq-question');
                  faqButtons.forEach(function(btn) {
                    btn.addEventListener('click', function() {
                      const item = this.parentElement;
                      const answer = item.querySelector('.faq-answer');
                      
                      document.querySelectorAll('.faq-item').forEach(function(faq) {
                        if (faq !== item) {
                          faq.querySelector('.faq-question').classList.remove('active');
                          const ans = faq.querySelector('.faq-answer');
                          if (ans) {
                            ans.style.maxHeight = null;
                          }
                        }
                      });
                      
                      if (item && answer) {
                        this.classList.toggle('active');
                        if (answer.style.maxHeight) {
                          answer.style.maxHeight = null;
                        } else {
                          answer.style.maxHeight = answer.scrollHeight + 'px';
                        }
                      }
                    });
                  });
                  
                  // Initialize first item as open
                  const firstButton = document.querySelector('.faq-question.active');
                  if (firstButton) {
                    const firstItem = firstButton.parentElement;
                    const firstAnswer = firstItem.querySelector('.faq-answer');
                    if (firstAnswer) {
                      firstAnswer.style.maxHeight = firstAnswer.scrollHeight + 'px';
                    }
                  }
                }
                
                // Initialize Bootstrap tabs
                function initTabs() {
                  const tabButtons = document.querySelectorAll('#pills-tab button[data-bs-toggle="tab"]');
                  const tabPanes = document.querySelectorAll('#pills-tabContent .tab-pane');
                  
                  tabButtons.forEach(function(button) {
                    button.addEventListener('click', function(e) {
                      e.preventDefault();
                      const targetId = this.getAttribute('data-bs-target');
                      
                      // Remove active class from all buttons and panes
                      tabButtons.forEach(function(btn) {
                        btn.classList.remove('active');
                        btn.setAttribute('aria-selected', 'false');
                      });
                      tabPanes.forEach(function(pane) {
                        pane.classList.remove('show', 'active');
                      });
                      
                      // Add active class to clicked button and target pane
                      this.classList.add('active');
                      this.setAttribute('aria-selected', 'true');
                      const targetPane = document.querySelector(targetId);
                      if (targetPane) {
                        targetPane.classList.add('show', 'active');
                      }
                      
                      // Also try Bootstrap's native method if available
                      if (typeof bootstrap !== 'undefined' && bootstrap.Tab) {
                        try {
                          const tab = new bootstrap.Tab(this);
                          tab.show();
                        } catch(err) {
                          console.log('Bootstrap tab init:', err);
                        }
                      }
                    });
                  });
                }
                
                // Scroll animations
                function scrollAnimate(className) {
                  const elements = document.querySelectorAll(className);
                  elements.forEach(function(el) {
                    const rect = el.getBoundingClientRect();
                    if (rect.top < window.innerHeight - 100) {
                      el.classList.add('show');
                    }
                  });
                }
                
                function checkScroll() {
                  scrollAnimate('.slide-up-down');
                  scrollAnimate('.slide-left-right');
                  scrollAnimate('.slide-right-left');
                }
                
                // Initialize everything
                function initAll() {
                  handleLazyImages();
                  initFAQ();
                  initTabs();
                  checkScroll();
                  
                  // Initialize Swiper if available
                  if (typeof Swiper !== 'undefined') {
                    const caseSwiperEl = document.querySelector('.myCaseSwiper');
                    if (caseSwiperEl && !caseSwiperEl.swiper) {
                      new Swiper('.myCaseSwiper', {
                        slidesPerView: 2,
                        spaceBetween: 30,
                        loop: true,
                        navigation: {
                          nextEl: '.custom-next',
                          prevEl: '.custom-prev',
                        },
                        breakpoints: {
                          0: { slidesPerView: 1 },
                          768: { slidesPerView: 2 },
                        },
                      });
                    }
                  }
                }
                
                // Run after a delay to ensure React has rendered
                setTimeout(initAll, 100);
                
                // Also run after delays to catch dynamically loaded content
                setTimeout(initAll, 500);
                setTimeout(initAll, 1500);
                setTimeout(initAll, 3000);
                
                // Add scroll listener
                window.addEventListener('scroll', checkScroll);
                window.addEventListener('load', checkScroll);
              })();
            `
          }}
        />
      )}
    </>
  )
}

