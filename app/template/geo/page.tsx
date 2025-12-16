'use client'

import { useEffect } from 'react'
import Script from 'next/script'

export default function GeoTemplate() {
  useEffect(() => {
    // Add custom CSS for accordion to ensure it displays correctly
    const style = document.createElement('style')
    style.id = 'faq-accordion-fix'
    style.textContent = `
      .accordion-collapse.collapse.show {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        height: auto !important;
      }
      .accordion-collapse.collapse:not(.show) {
        display: none !important;
      }
      .accordion-body {
        display: block !important;
        visibility: visible !important;
      }
      .faq-cus-acc .accordion-collapse.show .accordion-body {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      /* Ensure consistent height for both carousels */
      .clients-swiper .swiper-slide,
      .clients-swiper02 .swiper-slide {
        height: 130.5px !important;
        margin-bottom: 10px !important;
      }
      /* Mobile responsiveness for carousels - add little gap */
      @media (max-width: 1199px) {
        .clients-swiper .swiper-slide,
        .clients-swiper02 .swiper-slide {
          margin-bottom: 8px !important;
        }
        .clients-swiper,
        .clients-swiper02 {
          height: auto !important;
        }
      }
      @media (max-width: 767px) {
        .clients-swiper .swiper-slide,
        .clients-swiper02 .swiper-slide {
          height: auto !important;
          margin-bottom: 2rem !important;
          margin-right: 10px !important;
        }
        .clients-swiper02.pt-5 {
          padding-top: 0 !important;
        }
        .smm-uae-btn {
          padding: 15px !important;
        }
        .fs-22 {
          font-size: 14px !important;
        }
        a.cnt-btn::before,
        a.cnt-btn::after {
          width: 24px !important;
          height: 24px !important;
        }
      }
    `
    // Remove existing style if present
    const existingStyle = document.getElementById('faq-accordion-fix')
    if (existingStyle) {
      existingStyle.remove()
    }
    document.head.appendChild(style)

    // Add CSS links to head
    const links = [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=DM+Serif+Text&family=Hanken+Grotesk&family=Roboto&display=swap' },
      { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css' },
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
          } else {
            link.setAttribute(key, value as string)
          }
        })
        document.head.appendChild(link)
      }
    })

    // Initialize scripts after DOM is ready
    const initScripts = () => {
      // Initialize AOS
      if (typeof window !== 'undefined' && (window as any).AOS) {
        (window as any).AOS.init({
          duration: 1000,
          once: true
        })
      }

      // Initialize Swiper if it's loaded and elements exist
      if (typeof window !== 'undefined' && (window as any).Swiper) {
        const Swiper = (window as any).Swiper
        
        console.log('Swiper is available, initializing swipers...')

        // Initialize clients swiper if not already initialized
        const clientsSwiperEl = document.querySelector('.clients-swiper')
        if (clientsSwiperEl && !(clientsSwiperEl as any).swiper) {
          const getSwiperDirection = () => {
            return window.innerWidth <= 1099 ? 'horizontal' : 'vertical'
          }
          
          try {
            const swiperInstance = new Swiper('.clients-swiper', {
              direction: getSwiperDirection(),
              slidesPerView: 2,
              spaceBetween: 10,
              loop: true,
              speed: 4000,
              autoplay: {
                delay: 1,
                disableOnInteraction: false,
                reverseDirection: true,
              },
              breakpoints: {
                640: {
                  slidesPerView: 2,
                  spaceBetween: 10,
                },
                768: {
                  slidesPerView: 3,
                  spaceBetween: 15,
                },
                1024: {
                  slidesPerView: 4,
                  spaceBetween: 10,
                },
              },
            })
            console.log('Clients swiper initialized:', swiperInstance)
          } catch (error) {
            console.error('Error initializing clients swiper:', error)
          }
        }

        // Initialize clients swiper 02
        const clientsSwiper02El = document.querySelector('.clients-swiper02')
        if (clientsSwiper02El && !(clientsSwiper02El as any).swiper) {
          const getSwiper02Direction = () => {
            return window.innerWidth <= 1099 ? 'horizontal' : 'vertical'
          }
          
          try {
            const swiperInstance02 = new Swiper('.clients-swiper02', {
              direction: getSwiper02Direction(),
              slidesPerView: 2,
              spaceBetween: 10,
              loop: true,
              speed: 4000,
              autoplay: {
                delay: 1,
                disableOnInteraction: false,
              },
              breakpoints: {
                640: {
                  slidesPerView: 2,
                  spaceBetween: 10,
                },
                768: {
                  slidesPerView: 3,
                  spaceBetween: 15,
                },
                1024: {
                  slidesPerView: 4,
                  spaceBetween: 10,
                },
              },
            })
            console.log('Clients swiper 02 initialized:', swiperInstance02)
          } catch (error) {
            console.error('Error initializing clients swiper 02:', error)
          }
        }

        // Initialize testimonials swiper
        const testiSwiperEl = document.querySelector('.bsd-testi-swiper')
        if (testiSwiperEl && !(testiSwiperEl as any).swiper) {
          const slides = testiSwiperEl.querySelectorAll('.swiper-slide')
          const slideCount = slides.length
          // Only enable loop if we have more slides than the max slidesPerView
          const enableLoop = slideCount > 2
          
          try {
            const testiSwiper = new Swiper('.bsd-testi-swiper', {
              slidesPerView: 1,
              spaceBetween: 10,
              loop: enableLoop,
              autoplay: enableLoop ? {
                delay: 3000,
                disableOnInteraction: false,
              } : false,
              breakpoints: {
                640: {
                  slidesPerView: 1,
                  spaceBetween: 10,
                },
                768: {
                  slidesPerView: 2,
                  spaceBetween: 10,
                },
                1024: {
                  slidesPerView: 2,
                  spaceBetween: 10,
                },
              },
            })
            console.log('Testimonials swiper initialized successfully with', slideCount, 'slides, loop:', enableLoop)
          } catch (error) {
            console.error('Error initializing testimonials swiper:', error)
          }
        } else {
          if (!testiSwiperEl) {
            console.warn('Testimonials swiper element (.bsd-testi-swiper) not found in DOM')
          } else if ((testiSwiperEl as any).swiper) {
            console.log('Testimonials swiper already initialized')
          }
        }

        // Initialize content swiper
        const contentSwiperEl = document.querySelector('.contentSwiper')
        if (contentSwiperEl && !(contentSwiperEl as any).swiper) {
          new Swiper('.contentSwiper', {
            spaceBetween: 20,
            speed: 2000,
            navigation: {
              nextEl: '.explore-swiper-button-next',
              prevEl: '.explore-swiper-button-prev',
            },
            breakpoints: {
              640: {
                slidesPerView: 1,
                spaceBetween: 10,
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 10,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 10,
              },
            },
          })
        }
      }
    }

    // Function to check if all required scripts are loaded
    const checkScriptsReady = () => {
      const required = {
        Swiper: typeof window !== 'undefined' && (window as any).Swiper,
        AOS: typeof window !== 'undefined' && (window as any).AOS,
      }
      return required.Swiper && required.AOS
    }

    // Initialize with retry mechanism
    const initWithRetry = (retries = 15, delay = 200) => {
      if (checkScriptsReady()) {
        // Wait a bit more for DOM to be fully ready
        setTimeout(() => {
          initScripts()
        }, 100)
      } else if (retries > 0) {
        setTimeout(() => {
          initWithRetry(retries - 1, delay)
        }, delay)
      } else {
        console.warn('Some scripts failed to load, attempting initialization anyway...')
        initScripts()
      }
    }

    // Wait for DOM and scripts to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        initWithRetry()
      })
    } else {
      initWithRetry()
    }

    // Also wait for window load event as fallback
    const handleWindowLoad = () => {
      setTimeout(() => {
        if (!checkScriptsReady()) {
          console.log('Window loaded, retrying initialization...')
          initWithRetry(10, 300)
        } else {
          initScripts()
        }
      }, 300)
    }
    window.addEventListener('load', handleWindowLoad)

    // Listen for Swiper loaded event
    const handleSwiperLoaded = () => {
      console.log('Swiper script loaded, attempting initialization...')
      setTimeout(() => {
        initScripts()
      }, 200)
    }
    window.addEventListener('swiperLoaded', handleSwiperLoaded)

    return () => {
      window.removeEventListener('swiperLoaded', handleSwiperLoaded)
      window.removeEventListener('load', handleWindowLoad)
    }

    // Fix FAQ accordion - prevent Bootstrap from hiding content
    const fixFAQAccordion = () => {
      const accordionButtons = document.querySelectorAll('.faq-cus-acc .accordion-button')
      const accordionCollapses = document.querySelectorAll('.faq-cus-acc .accordion-collapse')
      
      accordionButtons.forEach((button, index) => {
        button.addEventListener('click', (e) => {
          e.preventDefault()
          const targetId = button.getAttribute('data-bs-target')
          if (targetId) {
            const targetCollapse = document.querySelector(targetId)
            if (targetCollapse) {
              // Toggle show class
              const isCurrentlyShown = targetCollapse.classList.contains('show')
              
              // Close all other collapses
              accordionCollapses.forEach((collapse) => {
                collapse.classList.remove('show')
                const collapseBody = collapse.querySelector('.accordion-body')
                if (collapseBody) {
                  (collapseBody as HTMLElement).style.display = 'none'
                }
              })
              
              // Toggle current collapse
              if (!isCurrentlyShown) {
                targetCollapse.classList.add('show')
                const collapseBody = targetCollapse.querySelector('.accordion-body')
                if (collapseBody) {
                  (collapseBody as HTMLElement).style.display = 'block'
                }
                button.classList.remove('collapsed')
                button.setAttribute('aria-expanded', 'true')
              } else {
                targetCollapse.classList.remove('show')
                const collapseBody = targetCollapse.querySelector('.accordion-body')
                if (collapseBody) {
                  (collapseBody as HTMLElement).style.display = 'none'
                }
                button.classList.add('collapsed')
                button.setAttribute('aria-expanded', 'false')
              }
            }
          }
        })
      })
      
      // Initialize first item as open
      const firstCollapse = document.querySelector('#collapse01')
      if (firstCollapse) {
        firstCollapse.classList.add('show')
        const firstBody = firstCollapse.querySelector('.accordion-body')
        if (firstBody) {
          (firstBody as HTMLElement).style.display = 'block'
        }
      }
    }
    
    // Fix FAQ accordion after DOM is ready
    setTimeout(() => {
      fixFAQAccordion()
    }, 500)
    
    // Also try after longer delay
    setTimeout(() => {
      fixFAQAccordion()
    }, 1500)

    return () => {
      window.removeEventListener('swiperLoaded', handleSwiperLoaded)
    }
  }, [])

  return (
    <>
      <section className="home-banner bg-black mt-100">
        <div className="container-fluid p-0">
          <div className="bnr-slide01 bg-bnr h-600 d-flex align-items-center">
            <div className="container">
              <div className="row">
                <div className="col-md-8 text-white">
                  <h1 className="mb-4" data-aos="fade-up" data-aos-duration="1000">Generative Engine Optimization Services in Bangalore for AI-First Visibility</h1>
                  <div className="smm-uae-btn w-fit" data-aos="fade-up" data-aos-duration="1400">
                    <a href="https://brandstory.in/contact-us/" className="fs-22 cnt-btn fw-700 text-white d-flex align-items-center gap-2">Book Your Free GEO Consultation Now!</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ai-search bg-bnr sp-100">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <p className="text-white text-center" data-aos="fade-up" data-aos-duration="1000">AI search is already transforming how people find and engage with brands. From ChatGPT to Google SGE, generative engines now shape the buying journey. BrandStory helps you lead in this space. As a top-rated Generative Engine Optimization company in Bangalore, we build structured content systems. It increases visibility, strengthens digital identity and shows your brand up in the answers where it matters.</p>
              <p className="text-white text-center mb-0" data-aos="fade-up" data-aos-duration="1300">Traditional SEO is not enough. Being first on Google doesn&apos;t mean being found in AI answers. Forward-thinking businesses focus on how they show up in conversations, not only in search results. With GEO services, BrandStory positions your business for presence in generative engines, not only in search pages.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="sp-70">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 col-md-12">
              <img src="/assets/images/geo-location/robotic.png" className="img-fluid mb-4" alt="" data-aos="fade-up" data-aos-duration="1500" />
              <h2 className="text-white mb-4" data-aos="fade-up" data-aos-duration="1600">Trusted by 500+ brands across India</h2>
              <p className="text-white mb-4 mb-md-4 mb-lg-0" data-aos="fade-up" data-aos-duration="1700">BrandStory delivers measurable success in AI-first search, SEO performance and long-term growth. From SaaS to D2C, enterprises to startups and challengers, we work across India&apos;s evolving digital landscape.</p>
            </div>
            <div className="col-md-12 col-lg-3">
              <div className="swiper clients-swiper" data-aos="fade-up" data-aos-duration="1000" style={{ height: '600px' }}>
                <div className="swiper-wrapper">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <div key={num} className="swiper-slide" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={`/assets/images/cilent-logos/client-logo-${num}.svg`} className="img-fluid" alt={`Client ${num}`} style={{ maxHeight: '100px', width: 'auto', objectFit: 'contain' }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="col-md-12 col-lg-3">
              <div className="swiper clients-swiper02 pt-5" data-aos="fade-up" data-aos-duration="1000" style={{ height: '600px' }}>
                <div className="swiper-wrapper">
                  {[11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21].map((num) => (
                    <div key={num} className="swiper-slide" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={`/assets/images/cilent-logos/client-logo-${num}.svg`} className="img-fluid" alt={`Logo ${num}`} style={{ maxHeight: '100px', width: 'auto', objectFit: 'contain' }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="meet-bsd spb-100 cus-overflow-x">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h2 className="text-white text-center mb-5" data-aos="fade-up">Reviewed by Verified Experts</h2>
              <div className="d-flex flex-wrap justify-content-center text-center">
                <div className="p-2 custom-col">
                  <div className="review-card bg-review" data-aos="fade-up">
                    <img src="/assets/images/web-development-company/clutch.svg" className="img-fluid cus-w-100" alt="Clutch" />
                  </div>
                </div>
                <div className="p-2 custom-col">
                  <div className="review-card bg-review-02" data-aos="fade-up">
                    <img src="/assets/images/geo-location/g2.svg" className="img-fluid cus-w-50" alt="Google" />
                  </div>
                </div>
                <div className="p-2 custom-col">
                  <div className="review-card bg-review-trustpilot" data-aos="fade-up">
                    <img src="/assets/images/geo-location/trust-pilot.svg" className="img-fluid cus-w-100" alt="Trustpilot" />
                  </div>
                </div>
                <div className="p-2 custom-col">
                  <div className="review-card bg-review-goodfirms" data-aos="fade-up">
                    <img src="/assets/images/geo-location/good.svg" className="img-fluid cus-w-150 o" alt="Goodfirms" />
                  </div>
                </div>
                <div className="p-2 custom-col">
                  <div className="review-card" data-aos="fade-up">
                    <img src="/assets/images/web-development-company/google-logo.svg" className="img-fluid cus-w-150" alt="Google" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="track-record-section bg-bnr sp-100">
        <div className="container">
          <h2 className="text-center mb-5 text-white fw-bold" data-aos="fade-up">Our Track Record</h2>
          <div className="row g-4">
            <div className="col-md-3" data-aos="fade-up">
              <div className="custom-card first-card text-center px-4">
                <h5>Years of Experience</h5>
                <p>Over 12 years of strategic expertise.</p>
              </div>
            </div>
            <div className="col-md-3" data-aos="fade-up">
              <div className="custom-card text-center px-4">
                <h5>Expert Team</h5>
                <p>120+ skilled professionals</p>
              </div>
            </div>
            <div className="col-md-3" data-aos="fade-up">
              <div className="custom-card text-center px-4">
                <h5>Client Success</h5>
                <p>500+ clients with proven search growth.</p>
              </div>
            </div>
            <div className="col-md-3" data-aos="fade-up">
              <div className="custom-card text-center px-4">
                <h5>Industry Reach</h5>
                <p>Serving 30+ diverse, dynamic industries.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="key-benefits bg-bnr sp-100 cus-overflow-x">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <h2 className="text-white text-center mb-5" data-aos="fade-up">Key Benefits of GEO Services for AI Search Engines</h2>
              <div className="row g-3">
                {[
                  { img: 'key-01.svg', title: 'Appear in AI-Generated Summaries', desc: 'Boost your chances of being featured in AI-powered answer summaries across multiple platforms, thereby increasing your brand\'s visibility.' },
                  { img: 'key-02.svg', title: 'Improve Answer Engine Visibility', desc: 'Enhance your presence in answer engines and gain zero-click search inclusions, driving traffic without traditional clicks.' },
                  { img: 'key-03.svg', title: 'Strengthen Digital Identity', desc: 'Build and maintain a strong digital footprint across AI knowledge bases for better brand recognition and trust.' },
                  { img: 'key-04.svg', title: 'Expand Reach via AI Platforms', desc: 'Tap into audiences on ChatGPT, Perplexity, Gemini, Bing AI, and other AI-driven search platforms for wider exposure.' },
                  { img: 'key-05.svg', title: 'Capture Voice & Conversational Searches', desc: 'Optimize content to appear in voice assistant responses and conversational search results, reaching users naturally.' },
                  { img: 'key-06.svg', title: 'Build AI-Compliant Content Architecture', desc: 'Create scalable, structured content designed to meet AI search algorithms\' requirements for sustained visibility and growth.' },
                ].map((item, idx) => (
                  <div key={idx} className="col-md-4">
                    <div className="feature-card" data-aos={idx % 3 === 0 ? 'fade-left' : idx % 3 === 1 ? 'fade-up' : 'fade-right'}>
                      <span className="circle-feature-box"></span>
                      <img src={`/assets/images/geo-location/${item.img}`} className="img-fluid mb-4" alt="" />
                      <h3 className="text-white mb-3">{item.title}</h3>
                      <p className="text-white fs-18 mb-0">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sp-100 gen-engine-main">
        <div className="container">
          <div className="row">
            <div className="col-md-6" data-aos="fade-up">
              <div className="gen-engine">
                <h2 className="text-white mb-4">BrandStory&apos;s Generative Engine Optimization Services for AI Search Engines</h2>
                <p className="text-white fs-18 mb-5 mb-md-0">Stay discoverable in AI-first search. Our GEO services position your brand across AI Overviews, answer engines, and voice platforms through structured, entity-rich, and semantically intelligent content.</p>
              </div>
            </div>
            <div className="col-md-6">
              {[
                { title: 'Answer Engine Optimization (AEO)', desc: 'Optimize for AI-generated answers on platforms like Google AI Overviews and Bing Copilot. Align content with high-intent, zero-click queries using structured formats and intent mapping.' },
                { title: 'AI-Optimized Content Creation', desc: 'Produce long-form content designed for AI summarization. Enhance visibility with structured formatting, semantic alignment, and NLP-optimized writing for product pages, blogs, and FAQs.' },
                { title: 'Topic Clustering & Semantic SEO', desc: 'Build interconnected topic clusters around core services. Improve AI comprehension, crawl depth, and topical authority using LSI keywords and pillar-supporting architecture.' },
                { title: 'Featured Snippet & AI Overview Optimization', desc: 'Structure content to qualify for AI-generated snippets. Use bullet points, tables, definitions, and Q&A formats tailored for voice and natural language outputs.' },
                { title: 'Knowledge Graph & Entity Optimization', desc: 'Improve brand recognition in AI search. Align entity data across Google Knowledge Graph, Wikidata, LinkedIn, Crunchbase, and your website for consistent visibility.' },
                { title: 'Structured Data & Schema Implementation', desc: 'Add JSON-LD schema to FAQs, How-tos, and products. Help AI tools understand, index, and feature your content with greater accuracy.' },
                { title: 'Brand Mentions & Digital PR for AI Discovery', desc: 'Earn high-authority brand mentions across media and niche publications. Improve AI trust signals through linkless entity building and visibility campaigns.' },
                { title: 'Prompt Optimization & AI Tool Integration', desc: 'Test and refine prompts for visibility across ChatGPT, Gemini, and Perplexity. Integrate your content via APIs, data plugins, and LLM-compatible formats.' },
                { title: 'GEO Performance Auditing & Reporting', desc: 'Track your presence in AI Overviews, ChatGPT, and voice results. Includes visibility scoring, entity recognition audits, and attribution tracking from AI platforms.' },
                { title: 'Voice & Conversational SEO', desc: 'Craft content for voice assistants like Google Assistant, Siri, and Alexa. Use conversational syntax and structured responses optimized for spoken queries.' },
                { title: 'AI Competitor Intelligence', desc: 'Monitor competitors\' AI footprint. Identify ranking triggers, content gaps, and strategic opportunities in generative answers and zero-click environments.' },
                { title: 'Multimodal Content Optimization', desc: 'Make all content formats AI-readable—images, video, code blocks, and tables. Use semantic tagging and alt attributes for broader multimodal inclusion.' },
              ].map((item, idx) => (
                <div key={idx} className="gen-en-card text-center px-4 mb-3" data-aos="fade-up">
                  <h4 className="card-title text-start fw-bold fs-24 text-white mb-3">{item.title}</h4>
                  <p className="card-text text-start text-white fs-18 mb-0">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="spb-70">
        <div className="container">
          <h2 className="text-white mb-4 text-center" data-aos="fade-up">Our 5-Stage GEO Process for AI-First Search Success</h2>
          <p className="text-white fs-18 text-center mb-5" data-aos="fade-up">We simplify the complex. Our GEO approach is structured to reduce guesswork, bring clarity, and deliver measurable AI-first visibility using the right tools, frameworks, and experience at every stage.</p>
          <div className="ai-first p-0" data-aos="fade-up">
            <div className="row">
              <div className="col-md-4 d-flex">
                <img src="/assets/images/geo-location/ai-robot.png" className="w-cus-50 w-100 mb-0" alt="" />
              </div>
              <div className="col-md-8 py-4">
                {[
                  { num: '01', title: 'Planning', subtitle: 'Know where you stand', desc: 'We evaluate how AI systems like ChatGPT, Google AI, and Perplexity perceive your brand, content, and entity relevance—so we start with clarity, not assumptions.' },
                  { num: '02', title: 'Strategic Content Planning', subtitle: 'Built around how users search—and how AI answers', desc: 'We create an answer-first content plan mapped to real user journeys, question clusters, and zero-click intent, ensuring every piece serves a strategic purpose.' },
                  { num: '03', title: 'Generative Content Engineering', subtitle: 'Write less. Rank smarter', desc: 'We craft long-form, AI-optimized content designed for semantic recognition, natural summaries, and multimodal inclusion—ensuring your brand is understood by humans and machines alike.' },
                  { num: '04', title: 'Schema & Metadata Structuring', subtitle: 'Structure that speaks AI', desc: 'We apply precise schema markup, JSON-LD and internal linking frameworks so search engines and AI agents can parse and prioritize your content accurately.' },
                  { num: '05', title: 'Performance Review & Iteration', subtitle: 'What gets measured, improves', desc: 'We track your brand\'s inclusion across AI Overviews, voice results, and answer engines. Based on insights, we refine content to increase your AI footprint over time.' },
                ].map((item, idx) => (
                  <div key={idx} className="process-sec mb-3 me-4 cus-dott" data-aos="fade-up">
                    <div className="row align-items-center inner-p-sec text-white p-2 mb-3">
                      <div className="col-auto">
                        <span className="p-2 fs-58">{item.num}</span>
                      </div>
                      <div className="col">
                        <h5 className="fw-bold mb-1 fs-24">{item.title}</h5>
                        <p className="fs-18 mb-2 fw-700">{item.subtitle}</p>
                        <p className="mb-0 fs-16">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="spb-100 spt-70">
        <div className="container">
          <div className="why-prt-card" data-aos="fade-up">
            <div className="row">
              <div className="col-md-8 why-p-card px-5 py-4">
                <h2 className="text-white mb-3">Why Partner with Our Generative Engine Optimization Agency in Bangalore</h2>
                <p className="text-white fs-18 mb-2">Search is no longer a list of links—it&apos;s a stream of answers. As a leading Generative Engine Optimization agency in Bangalore, BrandStory ensures your business is represented across AI tools like ChatGPT, Perplexity, and Google AI Overviews. With a structured, AI-first approach, content is crafted to be cited, surfaced, and trusted in zero-click environments.</p>
              </div>
              <div className="col-md-4 d-flex">
                <img src="/assets/images/geo-location/human-robot.png" className="img-fluid w-100 hum-robot mb-0" alt="" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="spb-100">
        <div className="container">
          <h2 className="text-white text-center mb-3" data-aos="fade-up">Why GEO Is Essential for Modern <span className="db">Search Visibility</span></h2>
          <p className="text-white text-center fs-18 mb-5" data-aos="fade-up">Modern search begins inside generative engines. Visibility now depends on how AI understands, summarizes, and ranks your content. Being present in traditional search is no longer enough. To start ahead, partnering with our experienced Answer Engine Optimization agency in Bangalore ensures your brand earns visibility in the AI-first search era.</p>
          <div className="row d-flex align-items-center">
            <div className="col-md-6">
              <img src="/assets/images/geo-location/laptop.png" className="img-fluid mb-4 mb-md-0" alt="" data-aos="fade-up" data-aos-duration="1600" />
            </div>
            <div className="col-md-6">
              <ul className="text-white fs-18">
                <li className="mb-3" data-aos="fade-up" data-aos-duration="1000">Over 50% of digital journeys now start with AI tools and assistants</li>
                <li className="mb-3" data-aos="fade-up" data-aos-duration="1200">GEO services for AI Overviews and ChatGPT rankings improve answer inclusion and topical relevance</li>
                <li className="mb-3" data-aos="fade-up" data-aos-duration="1400">Zero-click search optimization services in Bangalore increase visibility without needing link clicks</li>
                <li className="mb-3" data-aos="fade-up" data-aos-duration="1600">Structured responses enhance performance on voice assistants like Siri, Alexa, and Google Assistant</li>
                <li className="mb-3" data-aos="fade-up" data-aos-duration="1800">AI content optimization for local businesses in Bangalore delivers geo-relevant results in conversational search</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="sp-100 bg-bnr benefits-work">
        <div className="container">
          <div className="row mb-4">
            <div className="col-md-5">
              <h2 className="text-white mb-0" data-aos="fade-up">Benefits of Working With BrandStory&apos;s GEO Experts</h2>
            </div>
            <div className="col-md-7">
              <p className="text-white fs-18 mb-0 mt-2" data-aos="fade-up">BrandStory brings precision, clarity, and strategic expertise to every GEO engagement. Recognized as one of the top 10 Generative Engine Optimization companies in Bangalore. Our agency ensures content is not just visible, but impactful across AI-first platforms.</p>
            </div>
          </div>
          <div className="row">
            <div className="col-md-5"></div>
            <div className="col-md-7">
              <div className="row g-3">
                {[
                  { img: 'goe-01.svg', title: 'Local AI Optimization Expertise', desc: 'Utilize GEO frameworks specifically designed for Bangalore-based businesses. Improve local visibility in AI-generated results through region-specific schema and content structuring.' },
                  { img: 'goe-02.svg', title: 'Built for LLMs and Conversational AI', desc: 'Specialize in Perplexity and ChatGPT SEO services in Bangalore. Align content with how large language models generate and prioritize answers.' },
                  { img: 'goe-03.svg', title: 'Complete Answer Engine Optimization Systems', desc: 'Apply structured data, schema markup, and conversational formats. Our certified Answer Engine Optimization company in Bangalore ensures brand presence across platforms.' },
                  { img: 'goe-04.svg', title: 'Data-Driven, Ongoing Impact', desc: 'Track performance with visibility scoring and entity audits. Refine content continuously to boost discoverability and AI relevance.' },
                ].map((item, idx) => (
                  <div key={idx} className="col-md-6">
                    <div className="feature-card p-3 border-benefits" data-aos={idx % 2 === 0 ? 'fade-left' : 'fade-right'}>
                      <img src={`/assets/images/geo-location/${item.img}`} className="img-fluid mb-4" alt="" />
                      <h3 className="text-white mb-3">{item.title}</h3>
                      <p className="text-white fs-18 mb-0">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="spt-70 spb-100">
        <div className="container">
          <h2 className="mb-5 text-center text-white" data-aos="fade-up">Testimonials</h2>
          <div className="swiper bsd-testi-swiper" data-aos="fade-up">
            <div className="swiper-wrapper">
              {[
                { text: 'We started appearing in ChatGPT responses within 90 days. The framework was structured, the reporting was clear and the results were consistent.', author: '— Marketing Head, B2B SaaS Platform' },
                { text: 'Our move to GEO with BrandStory drove exponential visibility. We now rank inside AI Overviews and voice searches—something traditional SEO never delivered.', author: '— Head of Growth, E-commerce Brand' },
                { text: 'GEO changed how our brand is discovered. BrandStory didn\'t just provide a service, they delivered a strategic transformation with long-term impact.', author: '— Co-founder, Healthcare SaaS Platform' },
              ].map((testimonial, idx) => (
                <div key={idx} className="swiper-slide">
                  <div className="card shadow bg-aa rounded-4 p-4 h-100">
                    <img src="/assets/images/web-development-company/quotes.svg" className="w-11" alt="Quotes" />
                    <div className="card-body p-0 mt-3 mb-2">
                      <p className="card-text mb-4 fs-18 text-white">{testimonial.text}</p>
                      <p className="card-text mb-0 fs-18 text-white fw-700">{testimonial.author}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="spb-100">
        <div className="container">
          <h2 className="text-white text-center mb-3" data-aos="fade-up">Industries We Help Succeed</h2>
          <p className="text-white text-center fs-18 mb-5" data-aos="fade-up">BrandStory provides tailored Generative Engine Optimization services in Bangalore. The focus is on industries where <span className="db">AI-driven visibility creates real impact, from SaaS to regulated sectors.</span></p>
          <div className="row g-4">
            {['SaaS & B2B Technology', 'Healthcare & HealthTech', 'Education & EdTech', 'BFSI & Fintech', 'Manufacturing & Industrial Tech', 'Legal & Compliance Services', 'Real Estate & Property Tech', 'E-commerce & D2C', 'Consulting & Professional Services'].map((industry, idx) => (
              <div key={idx} className="col-md-4">
                <div className="feature-card" data-aos="fade-up" data-aos-duration={idx < 3 ? '1000' : idx < 6 ? '1500' : '2000'}>
                  <h4 className="fs-20 text-center text-white mb-0">{industry}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="explore-sec ai-tools bg-bnr spt-100 spb-70 cus-overflow-x">
        <div className="container">
          <div className="heading d-flex flex-column align-items-center px-md-5 px-2 mx-md-5 mx-0" data-aos="fade-up">
            <h2 className="text-center text-white mb-4">AI Tools & Technologies Powering BrandStory&apos;s GEO Services</h2>
            <p className="text-white text-center fs-18 mb-5">BrandStory integrates with today&apos;s top AI platforms to optimize how your content is read, interpreted and featured. The goal isn&apos;t just visibility, it&apos;s authoritative inclusion across AI-generated answers.</p>
          </div>
          <div className="content-slider position-relative mt-5" data-aos="fade-up">
            <div className="main-next-prev cus">
              <div className="explore-swiper-button-prev"></div>
              <div className="explore-swiper-button-next"></div>
            </div>
            <div className="swiper contentSwiper">
              <div className="swiper-wrapper">
                {[
                  { title: 'ChatGPT (OpenAI)', desc: 'Optimize content for ChatGPT\'s answer engine. Use prompt tuning, conversational formatting, and entity relevance to increase visibility in AI-generated responses.' },
                  { title: 'Perplexity.ai', desc: 'Tailor content for Perplexity\'s hybrid search model. Improve chances of appearing in citation-style answers and AI-driven follow-up queries.' },
                  { title: 'Google AI Overviews (Search Generative Experience)', desc: 'Use structured data and semantic signals to qualify content. Boost chances of inclusion in AI Overviews, zero-click summaries, and Knowledge Panels.' },
                  { title: 'Claude (Anthropic)', desc: 'Format content to match Claude\'s natural language processing. Optimize metadata for better visibility in conversational and AI-driven search results.' },
                  { title: 'Microsoft Copilot (Bing AI)', desc: 'Apply schema and semantic SEO techniques. Boost visibility in Bing\'s AI-powered search assistant and conversational results.' },
                  { title: 'Meta AI (LLaMA-based tools)', desc: 'Structure data for better AI recognition. Improve entity clarity for visibility across Meta\'s LLaMA-based assistants and integrated business search tools.' },
                  { title: 'NeevaAI (Benchmark Model)', desc: 'While now deprecated, NeevaAI serves as a benchmarking tool for prompt-based testing and generative summary formatting strategies.' },
                  { title: 'Frase, Alsoasked, Diffbot, Schema Pro', desc: 'Tool stack for keyword clustering, SERP intent mapping, AI visibility audits, structured data generation, and FAQ optimization.' },
                ].map((tool, idx) => (
                  <div key={idx} className="swiper-slide">
                    <div className="card bg-aa shadow rounded-4 p-3 h-100">
                      <div className="card-body p-0 mt-3 mb-2">
                        <h4 className="card-title fw-bold fs-24 text-white">{tool.title}</h4>
                        <p className="card-text mb-4 fs-18 text-white">{tool.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sp-100">
        <div className="container">
          <h2 className="text-center text-white mb-5" data-aos="fade-up">FAQ&apos;s</h2>
          <div className="row g-4 d-flex align-items-center">
            <div className="col-md-12">
              <div className="accordion custom-accordion faq-cus-acc" id="faqAccordion">
                {[
                  { id: '01', question: 'How does Generative Engine Optimization help brands grow?', answer: 'It boosts visibility across AI tools like ChatGPT and Perplexity – summarize, recommend, and answer. GEO aligns your content with how users now search.', open: true },
                  { id: '02', question: 'How does ChatGPT content visibility optimization in Bangalore support GEO goals?', answer: 'Our ChatGPT content visibility optimization in Bangalore helps your brand appear in AI-generated responses. It aligns content with ChatGPT\'s structure and improves semantic accuracy.' },
                  { id: '03', question: 'How is GEO different from regular SEO?', answer: 'SEO focuses on ranking in search results. GEO ensures your brand is cited in AI-generated answers using structured content and entity-based optimization.' },
                  { id: '04', question: 'When can I expect visibility improvements?', answer: 'Most brands see results within 8–12 weeks from our Generative Engine Optimization services in Bangalore. Visibility depends on content quality, domain authority and how well GEO is implemented.' },
                  { id: '05', question: 'What results should I anticipate from GEO?', answer: 'Expect brand mentions in AI summaries and zero-click results. GEO also improves voice search performance across platforms like ChatGPT, Bing AI and Google SGE.' },
                  { id: '06', question: 'Is GEO tailored for regional targeting like Bangalore?', answer: 'Yes. Localized schema, geo-relevant topics, and AI content optimization for local businesses in Bangalore are key parts of our strategy.' },
                  { id: '07', question: 'Are there any limitations with GEO?', answer: 'GEO requires structured, up-to-date content. Without proper schema and entity clarity, AI tools may overlook your brand in generative search layers.' },
                  { id: '08', question: 'Why isn\'t my brand showing up in AI summaries?', answer: 'It\'s often due to weak entity recognition or missing structured data. A lack of trust signals can also prevent AI tools from surfacing your brand.' },
                  { id: '09', question: 'What are the costs involved in GEO implementation?', answer: 'Pricing varies by scale and scope. Flexible packages are available for startups, mid-size companies, and enterprises investing in GEO services in Bangalore.' },
                  { id: '10', question: 'Do B2B companies benefit from GEO?', answer: 'Yes. GEO boosts credibility for B2B brands. It secures placements in AI shortlists and authoritative summaries that guide decision-makers.' },
                  { id: '11', question: 'How can GEO solve visibility gaps in ChatGPT or Perplexity?', answer: 'Our Perplexity and ChatGPT SEO services in Bangalore focus on prompt-driven content and structured markup. It helps close visibility gaps in generative AI platforms effectively.' },
                  { id: '12', question: 'Does multimedia content matter for GEO?', answer: 'Yes, multimedia like videos, images and infographics enhance engagement and improve AI visibility. BrandStory\'s GEO services help optimize multimedia for better search inclusion.' },
                  { id: '13', question: 'Why is Online Reputation Management Important?', answer: 'Online reputation builds trust and credibility across AI search results. Our GEO services in Bangalore ensure positive brand narratives appear in voice, chat and answer engines.' },
                  { id: '14', question: 'Do I need to change my entire website to implement GEO?', answer: 'Not necessarily. An expert team can audit and upgrade critical elements—content, structure and UX — without a full rebuild. It ensures alignment with generative search algorithms.' },
                  { id: '15', question: 'Is GEO relevant for both B2B and B2C?', answer: 'Yes, it is. Our specialized GEO agency in Bangalore tailors strategies to effectively target decision makers and consumers across AI platforms.' },
                  { id: '16', question: 'What kind of content works best for Generative Engine Optimization?', answer: 'Authoritative, structured, multimedia rich content performs best. BrandStory crafts FAQ-rich, entity based content that AI engines prefer to surface in zero click answers.' },
                ].map((faq) => (
                  <div key={faq.id} className="accordion-item" data-aos="fade-up">
                    <h2 className="accordion-header" id={`heading${faq.id}`}>
                      <button 
                        className={`accordion-button ${faq.open ? '' : 'collapsed'} fs-24 fw-700`} 
                        type="button" 
                        onClick={(e) => {
                          e.preventDefault()
                          const targetId = `#collapse${faq.id}`
                          const targetCollapse = document.querySelector(targetId)
                          const allCollapses = document.querySelectorAll('.faq-cus-acc .accordion-collapse')
                          const allButtons = document.querySelectorAll('.faq-cus-acc .accordion-button')
                          
                          // Close all collapses
                          allCollapses.forEach((collapse) => {
                            collapse.classList.remove('show')
                            const body = collapse.querySelector('.accordion-body') as HTMLElement
                            if (body) body.style.display = 'none'
                          })
                          allButtons.forEach((btn) => {
                            btn.classList.add('collapsed')
                            btn.setAttribute('aria-expanded', 'false')
                          })
                          
                          // Toggle current collapse
                          if (targetCollapse) {
                            const isShown = targetCollapse.classList.contains('show')
                            if (!isShown) {
                              targetCollapse.classList.add('show')
                              const body = targetCollapse.querySelector('.accordion-body') as HTMLElement
                              if (body) body.style.display = 'block'
                              e.currentTarget.classList.remove('collapsed')
                              e.currentTarget.setAttribute('aria-expanded', 'true')
                            }
                          }
                        }}
                        aria-expanded={faq.open} 
                        aria-controls={`collapse${faq.id}`}
                      >
                        {faq.question}
                      </button>
                    </h2>
                    <div 
                      id={`collapse${faq.id}`} 
                      className={`accordion-collapse collapse ${faq.open ? 'show' : ''}`} 
                      aria-labelledby={`heading${faq.id}`}
                      style={{ display: faq.open ? 'block' : 'none' }}
                    >
                      <div className="accordion-body" style={{ display: 'block' }}>
                        <p>{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="spb-100">
        <div className="container">
          <div className="card bg-aa shadow rounded-4 h-100 sp-70 px-5" data-aos="fade-up">
            <div className="card-body p-0 mt-3 mb-2 text-center">
              <h2 className="text-center text-white mb-4" data-aos="fade-up" data-aos-duration="1000">Let Your Brand Be Part of the AI Conversation</h2>
              <p className="text-white text-center fs-18 mb-5" data-aos="fade-up" data-aos-duration="1500">AI engines are shaping decisions before clicks happen. Make sure your <span className="db">brand is present, referenced, and trusted where it matters most.</span></p>
              <div className="smm-uae-btn w-fit">
                <a href="https://brandstory.in/contact-us/" className="fs-22 cnt-btn fw-700 text-white d-flex align-items-center gap-2 w-100" data-aos-duration="2000">Book Your Free GEO Consultation Now!</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Script 
        src="/assets/js/jquery.min.js" 
        strategy="afterInteractive"
        onLoad={() => {
          console.log('jQuery loaded')
        }}
      />
      <Script 
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" 
        strategy="afterInteractive"
        onLoad={() => {
          console.log('Bootstrap loaded')
        }}
      />
      <Script 
        src="/assets/js/swiper-bundle.min.js" 
        strategy="afterInteractive"
        onLoad={() => {
          console.log('Swiper loaded')
          // Trigger re-initialization after Swiper loads
          setTimeout(() => {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new Event('swiperLoaded'))
            }
          }, 100)
        }}
      />
      <Script 
        src="/assets/js/aos.js" 
        strategy="afterInteractive"
        onLoad={() => {
          console.log('AOS loaded')
          if (typeof window !== 'undefined' && (window as any).AOS) {
            (window as any).AOS.init({
              duration: 1000,
              once: true
            })
          }
        }}
      />
      <Script 
        src="/assets/js/site.js" 
        strategy="afterInteractive"
        onLoad={() => {
          console.log('Site.js loaded')
        }}
      />
      <Script 
        src="/assets/js/menu.js" 
        strategy="afterInteractive"
        onLoad={() => {
          console.log('Menu.js loaded')
        }}
      />
      <Script 
        src="/assets/js/counter.js" 
        strategy="afterInteractive"
        onLoad={() => {
          console.log('Counter.js loaded')
        }}
      />
    </>
  )
}
