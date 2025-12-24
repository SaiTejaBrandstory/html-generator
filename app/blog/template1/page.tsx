'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'

export default function BlogTemplate1() {
  const [htmlContent, setHtmlContent] = useState<string>('')

  useEffect(() => {
    // Load the HTML content from API route
    const loadHtmlContent = async () => {
      try {
        const response = await fetch('/api/blog-template1')
        if (response.ok) {
          const text = await response.text()
          // Extract body content from the HTML
          const bodyMatch = text.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
          if (bodyMatch) {
            setHtmlContent(bodyMatch[1])
          } else {
            setHtmlContent(text)
          }
        }
      } catch (error) {
        console.error('Error loading HTML content:', error)
      }
    }

    loadHtmlContent()

    // Add CSS links to head
    const links = [
      { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css' },
      { rel: 'stylesheet', href: 'https://brandstory.in/blogs/assets/css/menu.css?key=1766575958' },
      { rel: 'stylesheet', href: 'https://brandstory.in/blogs/assets/css/bootstrap.min.css' },
      { rel: 'stylesheet', href: 'https://brandstory.in/resources/casestudies/assets/css/style.css?key=1766575958' },
      { rel: 'stylesheet', href: 'https://brandstory.in/resources/casestudies/assets/css/global.css?key=1766575958' },
      { rel: 'stylesheet', href: 'https://brandstory.in/blogs/assets/css/swiper.css?key=1766575958' },
      { rel: 'stylesheet', href: 'https://brandstory.in/blogs/assets/css/global.css?key=1766575958' },
      { rel: 'stylesheet', href: 'https://brandstory.in/blogs/assets/css/style.css?key=1766575958' },
      { rel: 'stylesheet', href: 'https://brandstory.in/blogs/assets/css/my-styles.css?key=1766575958' },
      { rel: 'stylesheet', href: 'https://brandstory.in/blogs/assets/css/animation.css?key=1766575958' },
      { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.12/css/intlTelInput.min.css' },
    ]

    links.forEach(linkData => {
      const existingLink = document.querySelector(`link[href="${linkData.href}"]`)
      if (!existingLink) {
        const link = document.createElement('link')
        Object.entries(linkData).forEach(([key, value]) => {
          link.setAttribute(key, value as string)
        })
        document.head.appendChild(link)
      }
    })

    // Initialize sticky navigation script
    const initStickyNav = () => {
      const sections = document.querySelectorAll(".blog-content div[id]")
      const navLinks = document.querySelectorAll(".stickymin li a")

      const observerOptions = {
        root: null,
        rootMargin: "-50% 0px -50% 0px",
        threshold: 0
      }

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            let activeId = entry.target.id

            // Remove active class from all items
            navLinks.forEach(link => link.parentElement?.classList.remove("active"))

            // Add active class to the corresponding menu item
            let activeLink = document.querySelector(`.stickymin li a[href="#${activeId}"]`)
            if (activeLink) {
              activeLink.parentElement?.classList.add("active")
            }
          }
        })
      }, observerOptions)

      // Observe each section
      sections.forEach(section => observer.observe(section))
    }

    // Wait for content to be loaded before initializing
    if (htmlContent) {
      setTimeout(() => {
        initStickyNav()
      }, 500)
    }

    return () => {
      // Cleanup
    }
  }, [htmlContent])

  return (
    <>
      <div 
        className="blog-template-wrapper"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
      
      <Script 
        src="https://code.jquery.com/jquery-3.6.0.min.js" 
        strategy="afterInteractive"
      />
      <Script 
        src="https://brandstory.in/blogs/assets/js/bootstrap.bundle.min.js" 
        strategy="afterInteractive"
      />
      <Script 
        src="https://brandstory.in/blogs/assets/js/menu.js?key=1766575958" 
        strategy="afterInteractive"
      />
      <Script 
        src="https://brandstory.in/blogs/assets/js/swiper.js?key=1766575958" 
        strategy="afterInteractive"
      />
      <Script 
        src="https://brandstory.in/blogs/assets/js/animation.js?key=1766575958" 
        strategy="afterInteractive"
      />
      <Script 
        src="https://brandstory.in/blogs/assets/js/site.js?key=1766575958" 
        strategy="afterInteractive"
      />
    </>
  )
}

