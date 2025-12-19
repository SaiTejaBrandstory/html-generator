'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'

export default function Template5() {
  const [bodyContent, setBodyContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch the HTML file and extract body content and all styles
    fetch('/landing-page5.html')
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
            styleElement.id = 'template5-all-styles'
            styleElement.textContent = allStyles
            const existingStyle = document.getElementById('template5-all-styles')
            if (existingStyle) {
              existingStyle.remove()
            }
            document.head.appendChild(styleElement)
            
            // Add additional fix styles for FAQ and clients
            const fixStyle = document.createElement('style')
            fixStyle.id = 'template5-fix-styles'
            fixStyle.textContent = `
              /* Ensure FAQ accordion works */
              accordion-group .panel-collapse.collapse.show,
              accordion-group .panel-collapse.collapse.in {
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                height: auto !important;
              }
              accordion-group .panel-collapse.collapse:not(.show):not(.in) {
                display: none !important;
              }
              accordion-group .panel-body {
                display: block !important;
                visibility: visible !important;
              }
              /* Ensure client images display */
              .vc_gitem-zone-imgnew {
                display: inline-block !important;
                vertical-align: middle !important;
                margin: 5px !important;
              }
              .clients .row {
                display: flex !important;
                flex-wrap: wrap !important;
                justify-content: center !important;
                align-items: center !important;
              }
              /* Client logos - 2 per row on small screens */
              @media (max-width: 768px) {
                .vc_gitem-zone-imgnew {
                  width: calc(50% - 10px) !important;
                  max-width: calc(50% - 10px) !important;
                  margin: 5px !important;
                  box-sizing: border-box !important;
                }
                .clients .row.pt-2.margin_t7,
                .clients .row.pt-2.margin_t7 > div {
                  display: flex !important;
                  flex-wrap: wrap !important;
                  justify-content: center !important;
                }
              }
              @media (max-width: 480px) {
                .vc_gitem-zone-imgnew {
                  width: calc(50% - 10px) !important;
                  max-width: calc(50% - 10px) !important;
                  margin: 5px !important;
                }
              }
              /* Fix for accordion buttons */
              .accordion-toggle button.btn-link {
                cursor: pointer !important;
                width: 100% !important;
                text-align: left !important;
              }
              /* Fix button width in banner section */
              .btn[_ngcontent-sc621],
              a.btn[_ngcontent-sc621] {
                width: auto !important;
              }
            `
            const existingFixStyle = document.getElementById('template5-fix-styles')
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
      { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css', integrity: 'sha384-xOolHFLEh07PJGoPkLv1IbcEPTNtaed2xpHsD9ESMhqIYd0nLMwNLD69Npy4HI+N', crossOrigin: 'anonymous' },
      { rel: 'stylesheet', href: 'https://blr1.digitaloceanspaces.com/brandstory/css/app.css' },
      { rel: 'stylesheet', href: 'https://blr1.digitaloceanspaces.com/brandstory/fonts/poppins_all.css' },
      { rel: 'stylesheet', href: 'https://blr1.digitaloceanspaces.com/brandstory/fonts/roboto_all.css' },
      { rel: 'stylesheet', href: 'https://blr1.digitaloceanspaces.com/brandstory/assets_bslead/css/career.css' },
      { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/remixicon/2.5.0/remixicon.css', integrity: 'sha512-resGm4dJ9yO+KlYS15kAuwTd+BYzWuyd581JE3xYgaV6jVT8T25kP8cm/eBxeyhd3MvJS8XjXKLvxwlh7xYw==', crossOrigin: 'anonymous', referrerPolicy: 'no-referrer' },
      { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css', integrity: 'sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==', crossOrigin: 'anonymous', referrerPolicy: 'no-referrer' },
      { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css', integrity: 'sha384-4LISF5TTJX/fLmGSsOcH37WJ4pDVJq/4hK4xq4xY4U6Q1h4B4N1WU1T7M1h1w==', crossOrigin: 'anonymous' },
    ]

    links.forEach(linkData => {
      const existingLink = document.querySelector(`link[href="${linkData.href}"]`)
      if (!existingLink) {
        const link = document.createElement('link')
        Object.entries(linkData).forEach(([key, value]) => {
          if (key === 'crossOrigin') {
            link.setAttribute('crossorigin', value as string)
          } else if (key === 'referrerPolicy') {
            link.setAttribute('referrerpolicy', value as string)
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
    
    // Initialize FAQ accordion
    const attachFAQHandlers = (buttons: NodeListOf<Element>) => {
      buttons.forEach((button) => {
        // Remove existing listeners by cloning
        const newButton = button.cloneNode(true) as HTMLElement
        button.parentNode?.replaceChild(newButton, button)
        
        newButton.addEventListener('click', (e: Event) => {
          e.preventDefault()
          e.stopPropagation()
          
          const target = e.currentTarget as HTMLElement
          const panel = target.closest('accordion-group') || target.closest('.panel')
          if (!panel) return
          
          const collapse = panel.querySelector('.panel-collapse, .collapse')
          if (!collapse) return
          
          const isOpen = (collapse as HTMLElement).style.display === 'block' || 
                        collapse.classList.contains('show') || 
                        collapse.classList.contains('in')
          
          // Close all other panels
          const accordion = panel.closest('accordion') || panel.closest('.panel-group')
          if (accordion) {
            const allPanels = accordion.querySelectorAll('accordion-group, .panel')
            allPanels.forEach((otherPanel) => {
              if (otherPanel !== panel) {
                const otherCollapse = otherPanel.querySelector('.panel-collapse, .collapse')
                const otherButton = otherPanel.querySelector('.accordion-toggle button, .accordion-toggle .btn-link')
                if (otherCollapse) {
                  (otherCollapse as HTMLElement).style.display = 'none'
                  otherCollapse.classList.remove('show', 'in')
                  otherCollapse.setAttribute('aria-expanded', 'false')
                  otherCollapse.setAttribute('aria-hidden', 'true')
                }
                if (otherButton) {
                  (otherButton as HTMLElement).setAttribute('aria-expanded', 'false')
                }
                otherPanel.classList.remove('panel-open')
              }
            })
          }
          
          // Toggle current panel
          if (isOpen) {
            (collapse as HTMLElement).style.display = 'none'
            collapse.classList.remove('show', 'in')
            collapse.setAttribute('aria-expanded', 'false')
            collapse.setAttribute('aria-hidden', 'true')
            target.setAttribute('aria-expanded', 'false')
            panel.classList.remove('panel-open')
          } else {
            (collapse as HTMLElement).style.display = 'block'
            collapse.classList.add('show', 'in')
            collapse.setAttribute('aria-expanded', 'true')
            collapse.setAttribute('aria-hidden', 'false')
            target.setAttribute('aria-expanded', 'true')
            panel.classList.add('panel-open')
          }
        })
      })
    }
    
    const initFAQAccordion = () => {
      // Wait a bit more for DOM to be ready
      setTimeout(() => {
        const accordionButtons = document.querySelectorAll('.accordion-toggle button.btn-link, .accordion-toggle .btn-link')
        
        if (accordionButtons.length === 0) {
          // Try again after a longer delay
          setTimeout(() => {
            const retryButtons = document.querySelectorAll('.accordion-toggle button.btn-link, .accordion-toggle .btn-link')
            if (retryButtons.length > 0) {
              attachFAQHandlers(retryButtons)
            }
          }, 1000)
          return
        }
        
        attachFAQHandlers(accordionButtons)
        
        // Initialize first item as open
        const firstCollapse = document.querySelector('.panel-collapse.collapse.in, .panel-collapse.collapse.show')
        if (firstCollapse) {
          (firstCollapse as HTMLElement).style.display = 'block'
          const firstBody = firstCollapse.querySelector('.panel-body')
          if (firstBody) {
            (firstBody as HTMLElement).style.display = 'block'
          }
        }
      }, 200)
    }

    // Wait for content to be loaded and handle lazy images
    if (!isLoading && bodyContent) {
      // Use a longer timeout to ensure DOM is ready
      setTimeout(() => {
        handleLazyImages()
        // Initialize FAQ accordion after content is loaded
        initFAQAccordion()
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
      
      // Initialize FAQ accordion - use event delegation for better reliability
      const accordionContainer = document.querySelector('accordion, .panel-group')
      if (accordionContainer) {
        // Remove old listeners by using event delegation
        accordionContainer.addEventListener('click', function(e: any) {
          const target = e.target as HTMLElement
          // Check if clicked element is a button or inside a button
          const button = target.closest('button.btn-link') || 
                        (target.tagName === 'BUTTON' && target.classList.contains('btn-link') ? target : null)
          
          if (!button) return
          
          e.preventDefault()
          e.stopPropagation()
          
          const panel = button.closest('accordion-group') || button.closest('.panel')
          if (!panel) return
          
          const collapse = panel.querySelector('.panel-collapse, .collapse')
          if (!collapse) return
          
          const isOpen = (collapse as HTMLElement).style.display === 'block' || 
                        collapse.classList.contains('show') || 
                        collapse.classList.contains('in')
          
          // Close all other panels
          const accordion = panel.closest('accordion') || panel.closest('.panel-group')
          if (accordion) {
            const allPanels = accordion.querySelectorAll('accordion-group, .panel')
            allPanels.forEach((otherPanel) => {
              if (otherPanel !== panel) {
                const otherCollapse = otherPanel.querySelector('.panel-collapse, .collapse')
                const otherButton = otherPanel.querySelector('button.btn-link')
                if (otherCollapse) {
                  (otherCollapse as HTMLElement).style.display = 'none'
                  otherCollapse.classList.remove('show', 'in')
                  otherCollapse.setAttribute('aria-expanded', 'false')
                  otherCollapse.setAttribute('aria-hidden', 'true')
                }
                if (otherButton) {
                  otherButton.setAttribute('aria-expanded', 'false')
                  otherButton.classList.add('collapsed')
                }
                otherPanel.classList.remove('panel-open')
              }
            })
          }
          
          // Toggle current panel
          if (isOpen) {
            (collapse as HTMLElement).style.display = 'none'
            collapse.classList.remove('show', 'in')
            collapse.setAttribute('aria-expanded', 'false')
            collapse.setAttribute('aria-hidden', 'true')
            button.setAttribute('aria-expanded', 'false')
            button.classList.add('collapsed')
            panel.classList.remove('panel-open')
          } else {
            (collapse as HTMLElement).style.display = 'block'
            collapse.classList.add('show', 'in')
            collapse.setAttribute('aria-expanded', 'true')
            collapse.setAttribute('aria-hidden', 'false')
            button.setAttribute('aria-expanded', 'true')
            button.classList.remove('collapsed')
            panel.classList.add('panel-open')
          }
        })
        
        // Initialize first item as open
        const firstCollapse = accordionContainer.querySelector('.panel-collapse.collapse.in, .panel-collapse.collapse.show')
        if (firstCollapse) {
          (firstCollapse as HTMLElement).style.display = 'block'
        } else {
          // If no item is open, open the first one
          const firstPanel = accordionContainer.querySelector('accordion-group, .panel')
          if (firstPanel) {
            const firstCollapseEl = firstPanel.querySelector('.panel-collapse, .collapse')
            const firstButton = firstPanel.querySelector('button.btn-link')
            if (firstCollapseEl) {
              (firstCollapseEl as HTMLElement).style.display = 'block'
              firstCollapseEl.classList.add('show', 'in')
              firstCollapseEl.setAttribute('aria-expanded', 'true')
              firstCollapseEl.setAttribute('aria-hidden', 'false')
            }
            if (firstButton) {
              firstButton.setAttribute('aria-expanded', 'true')
              firstButton.classList.remove('collapsed')
            }
            firstPanel.classList.add('panel-open')
          }
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
        src="https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.slim.min.js" 
        strategy="afterInteractive"
      />
      <Script 
        src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js" 
        integrity="sha384-Fy6S3B9q64WdZWQUiU+q4/2Lc9npb8tCaSX9FK7E8HnRr0Jz8D6OP9dO5Vg3Q9ct" 
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      {/* AngularJS runtime scripts - these may not work in React but included for completeness */}
      <Script 
        src="https://brandstory.in/runtime-es2015.fb2a1dd67f168b55c2ea.js" 
        strategy="afterInteractive"
        type="module"
      />
      <Script 
        src="https://brandstory.in/runtime-es5.fb2a1dd67f168b55c2ea.js" 
        strategy="afterInteractive"
        noModule
        defer
      />
      <Script 
        src="https://brandstory.in/polyfills-es5.9b348caa68107674da0f.js" 
        strategy="afterInteractive"
        noModule
        defer
      />
      <Script 
        src="https://brandstory.in/polyfills-es2015.fad36233b3ac84537bbb.js" 
        strategy="afterInteractive"
        type="module"
      />
      <Script 
        src="https://brandstory.in/scripts.bfb8b7192841abfac751.js" 
        strategy="afterInteractive"
        defer
      />
      <Script 
        src="https://brandstory.in/main-es2015.b54a6790ec3398b75e80.js" 
        strategy="afterInteractive"
        type="module"
      />
      <Script 
        src="https://brandstory.in/main-es5.b54a6790ec3398b75e80.js" 
        strategy="afterInteractive"
        noModule
        defer
      />
      {/* Inline script for lazy loading images - runs after content is loaded */}
      {bodyContent && (
        <Script 
          id="template5-inline-script"
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
                
                // Run after a delay to ensure React has rendered
                setTimeout(function() {
                  handleLazyImages();
                }, 100);
                
                // Also run after delays to catch dynamically loaded content
                setTimeout(handleLazyImages, 500);
                setTimeout(handleLazyImages, 1500);
                setTimeout(handleLazyImages, 3000);
              })();
            `
          }}
        />
      )}
    </>
  )
}
