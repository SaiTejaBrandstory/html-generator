'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'

export default function Template2() {
  const [openFaq, setOpenFaq] = useState<number | null>(0) // First FAQ open by default
  const [openAccordion, setOpenAccordion] = useState<number | null>(0) // First accordion open by default
  const [currentTestimonial, setCurrentTestimonial] = useState(0) // Current testimonial index
  const [currentBenefitsIndex, setCurrentBenefitsIndex] = useState(0) // Current benefits carousel index
  const [isDesktop, setIsDesktop] = useState(true) // Track screen size for carousel
  useEffect(() => {
    // Add font link
    let linkElement: HTMLLinkElement | null = null
    const existingLink = document.getElementById('landing-page-font-link')
    if (!existingLink) {
      linkElement = document.createElement('link')
      linkElement.href = 'https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@300;400;500;600;700;800&display=swap'
      linkElement.rel = 'stylesheet'
      linkElement.id = 'landing-page-font-link'
      document.head.appendChild(linkElement)
    }

    // Add custom styles
    let styleElement: HTMLStyleElement | null = null
    const existingStyle = document.getElementById('landing-page-custom-styles')
    if (!existingStyle) {
      styleElement = document.createElement('style')
      styleElement.id = 'landing-page-custom-styles'
      styleElement.textContent = `
        * {
          font-family: 'Hanken Grotesk', sans-serif !important;
        }
        body {
          font-family: 'Hanken Grotesk', sans-serif !important;
          background-color: #050505;
          color: #ffffff;
        }
        .bg-gradient-hero {
          background: radial-gradient(circle at 50% 0%, #2e1065 0%, #050505 60%);
        }
        .text-gradient {
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .orbit-circle {
          border: 1px solid rgba(255,255,255,0.1);
        }
        .service-card-accent {
          background: linear-gradient(135deg, #d946ef 0%, #a855f7 100%);
        }
        @keyframes scroll-left {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        @keyframes scroll-right {
          from {
            transform: translateX(-50%);
          }
          to {
            transform: translateX(0);
          }
        }
        .logo-scroll-left {
          animation: scroll-left 40s linear infinite;
          will-change: transform;
        }
        .logo-scroll-right {
          animation: scroll-right 40s linear infinite;
          will-change: transform;
        }
        .benefits-carousel-simple {
          transform: translateX(0);
        }
        @media (max-width: 1023px) {
          .benefits-carousel-simple {
            transform: translateX(0) !important;
          }
        }
        .benefits-carousel {
          --carousel-offset: 100%;
        }
        @media (min-width: 1024px) {
          .benefits-carousel {
            --carousel-offset: calc(50% + 0.75rem);
          }
        }
        @media (max-width: 768px) {
          .logo-scroll-left {
            animation: scroll-left 30s linear infinite;
          }
          .logo-scroll-right {
            animation: scroll-right 30s linear infinite;
          }
        }
      `
      document.head.appendChild(styleElement)
    }

    // Initialize Lucide icons after component mounts
    if (typeof window !== 'undefined' && (window as any).lucide) {
      (window as any).lucide.createIcons()
    }

    return () => {
      // Cleanup - safely remove elements using remove() method
      if (linkElement && linkElement.parentNode === document.head) {
        try {
          linkElement.remove()
        } catch (e) {
          // Ignore errors
        }
      }
      
      if (styleElement && styleElement.parentNode === document.head) {
        try {
          styleElement.remove()
        } catch (e) {
          // Ignore errors
        }
      }
    }

  }, [])

  // Track screen size for carousel
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Reset carousel index when switching screen sizes
  useEffect(() => {
    const maxIndex = isDesktop ? 4 : 5
    if (currentBenefitsIndex > maxIndex) {
      setCurrentBenefitsIndex(maxIndex)
    }
  }, [isDesktop, currentBenefitsIndex])


  return (
    <div className="antialiased overflow-x-hidden scroll-smooth">
        {/* Hero Section */}
        <section className="relative pt-20 pb-20 lg:pt-32 lg:pb-32 bg-gradient-hero overflow-hidden">
          {/* Background Grid Effect */}
          <div className="absolute inset-0 bg-[url('/assets/images/template-2/hero-banner.png')] bg-cover bg-center bg-no-repeat opacity-80"></div>

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
            <h1 
              className="font-bold text-center capitalize mb-6 md:mb-8"
              style={{ 
                color: '#F0EFEE', 
                fontSize: 'clamp(24px, 5vw, 52px)', 
                lineHeight: '120%', 
                letterSpacing: '0%' 
              }}
            >
              Generative Engine Optimization Services in Bangalore for AI-First Visibility
            </h1>
            
            <div className="flex justify-center mb-8 md:mb-12 lg:mb-20">
              <a href="https://brandstory.in/contact-us/" className="group flex items-center gap-2 md:gap-3 px-4 md:px-8 py-2.5 md:py-3 lg:py-4 rounded-full border border-white/20 hover:border-fuchsia-500 bg-white/5 hover:bg-white/10 transition-all duration-300 text-xs sm:text-sm md:text-base lg:text-lg font-medium">
                <span className="whitespace-nowrap">Book Your Free GEO Consultation Now!</span>
                <i data-lucide="chevron-right" className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-fuchsia-500 group-hover:translate-x-1 transition-transform flex-shrink-0"></i>
              </a>
            </div>
            </div>

          {/* Client Logos Carousel Section - Full Width */}
          <div className="relative w-full mt-16 pb-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 md:mb-16">
              <p 
                className="text-center capitalize font-semibold"
                style={{ 
                  color: '#FFFFFF', 
                  fontSize: '22px', 
                  lineHeight: '130%', 
                  letterSpacing: '0%' 
                }}
              >
                Trusted by 500+ Brands Across India
              </p>
              </div>
            
            {/* Infinite Carousel - Row 1 (Logos 1-10, scrolling left) */}
            <div className="overflow-hidden mb-12 md:mb-20 w-full">
              <div className="flex logo-scroll-left items-center" style={{ width: 'max-content' }}>
                {Array.from({ length: 2 }, (_, i) => (
                  <div key={i} className="flex items-center gap-8 md:gap-16 px-4 md:px-8" style={{ flexShrink: 0 }}>
                    {Array.from({ length: 10 }, (_, j) => (
                      <img
                        key={`row1-${i}-${j}`}
                        src={`/assets/images/template-2/client-logos/client-logo-${j + 1}.svg`}
                        alt={`Client Logo ${j + 1}`}
                        className="h-8 md:h-12 w-auto object-contain opacity-70 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300"
                        style={{ flexShrink: 0 }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Infinite Carousel - Row 2 (Logos 11-21, scrolling right) */}
            <div className="overflow-hidden w-full">
              <div className="flex logo-scroll-right items-center" style={{ width: 'max-content' }}>
                {Array.from({ length: 2 }, (_, i) => (
                  <div key={i} className="flex items-center gap-8 md:gap-16 px-4 md:px-8" style={{ flexShrink: 0 }}>
                    {Array.from({ length: 11 }, (_, j) => (
                      <img
                        key={`row2-${i}-${j}`}
                        src={`/assets/images/template-2/client-logos/client-logo-${j + 11}.svg`}
                        alt={`Client Logo ${j + 11}`}
                        className="h-8 md:h-12 w-auto object-contain opacity-70 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300"
                        style={{ flexShrink: 0 }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Intro Text */}
        <section className="py-20 bg-[#0a0a0a]">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p 
              className="font-medium mb-8"
              style={{ 
                color: '#FFFFFF', 
                fontSize: 'clamp(16px, 2.5vw, 20px)', 
                lineHeight: '160%', 
                letterSpacing: '0%' 
              }}
            >
              AI search is already transforming how people find and engage with brands. From ChatGPT to Google SGE, generative engines now shape the buying journey. BrandStory helps you lead in this space. As a top-rated Generative Engine Optimization company in Bangalore, we build structured content systems. It increases visibility, strengthens digital identity and shows your brand up in the answers where it matters.
            </p>
            <p 
              className="font-medium"
              style={{ 
                color: '#FFFFFF', 
                fontSize: 'clamp(16px, 2.5vw, 20px)', 
                lineHeight: '160%', 
                letterSpacing: '0%' 
              }}
            >
              Traditional SEO is not enough. Being first on Google doesn&apos;t mean being found in AI answers. Forward-thinking businesses focus on how they show up in conversations, not only in search results. With GEO services, BrandStory positions your business for presence in generative engines, not only in search pages.
            </p>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="py-20 bg-white text-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="lg:w-1/3">
              <h2 
                className="font-bold capitalize mb-4 md:mb-6"
                style={{ 
                  color: '#000000', 
                  fontSize: 'clamp(28px, 4vw, 38px)', 
                  lineHeight: '130%', 
                  letterSpacing: '0%' 
                }}
              >
                Reviews & Recognition
              </h2>
              <p 
                className="font-medium"
                style={{ 
                  color: '#000000', 
                  fontSize: 'clamp(16px, 2.5vw, 20px)', 
                  lineHeight: '150%', 
                  letterSpacing: '0%' 
                }}
              >
                Top-rated on trustable platforms like Clutch, G2, Trustpilot, GoodFirms, and Google Reviews. It shows us how we deliver high-impact GEO and AEO solutions. We are trusted by clients and backed by results.
              </p>
            </div>
            <div className="lg:w-2/3 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-[#181818] p-3 sm:p-4 rounded flex flex-col items-center justify-center h-16 sm:h-20">
                <img 
                  src="/assets/images/web-development-company/clutch.svg" 
                  alt="Clutch" 
                  className="w-20 h-10 sm:w-24 sm:h-12 object-contain"
                />
              </div>
              <div className="bg-[#181818] p-3 sm:p-4 rounded flex flex-col items-center justify-center h-16 sm:h-20">
                <img 
                  src="/assets/images/geo-location/g2.svg" 
                  alt="G2" 
                  className="w-20 h-10 sm:w-24 sm:h-12 object-contain"
                />
              </div>
              <div className="bg-[#181818] p-3 sm:p-4 rounded flex flex-col items-center justify-center h-16 sm:h-20">
                <img 
                  src="/assets/images/geo-location/trust-pilot.svg" 
                  alt="Trustpilot" 
                  className="w-20 h-10 sm:w-24 sm:h-12 object-contain"
                />
              </div>
              <div className="bg-[#181818] p-3 sm:p-4 rounded flex flex-col items-center justify-center h-16 sm:h-20">
                <img 
                  src="/assets/images/geo-location/good.svg" 
                  alt="GoodFirms" 
                  className="w-20 h-10 sm:w-24 sm:h-12 object-contain"
                />
              </div>
              <div className="bg-[#181818] p-3 sm:p-4 rounded flex flex-col items-center justify-center h-16 sm:h-20 col-span-2 sm:col-span-1">
                <img 
                  src="/assets/images/web-development-company/google-logo.svg" 
                  alt="Google" 
                  className="w-20 h-10 sm:w-24 sm:h-12 object-contain"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Track Record (Orbit) */}
        <section className="py-32 bg-[#050505] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
          
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <h2 
              className="font-bold text-center capitalize mb-12 md:mb-20"
              style={{ 
                color: '#FFFFFF', 
                fontSize: 'clamp(28px, 4vw, 38px)', 
                lineHeight: '130%', 
                letterSpacing: '0%' 
              }}
            >
              Our Track Record
            </h2>
            
            {/* Orbit Visualization */}
            <div className="relative h-[600px] w-full max-w-4xl mx-auto hidden md:block">
              {/* Center */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-20 flex items-center justify-center">
                <img 
                  src="/assets/images/template-2/brandstory-logo.svg" 
                  alt="BrandStory" 
                  className="h-10 w-auto object-contain"
                />
              </div>
              
              {/* Orbit Rings */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[100px] h-[100px] rounded-full border border-white/5"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-white/5"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-white/5"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full border border-white/5"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1300px] h-[1300px] rounded-full border border-white/5"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1600px] h-[1600px] rounded-full border border-white/5"></div>

              {/* Satellites - All circles with consistent size and positioning */}
              {/* Top Left */}
              <div className="absolute top-[5%] left-[5%] w-56 h-56 rounded-full backdrop-blur-sm flex flex-col items-center justify-center text-center p-4 sm:p-5 md:p-6 border border-white/10 hover:border-fuchsia-500/50 transition-colors overflow-hidden" style={{ backgroundColor: 'rgba(18, 19, 23, 0.3)' }}>
                <h4 className="font-bold mb-1 sm:mb-2 text-center break-words px-2" style={{ color: '#FFFFFF', fontSize: 'clamp(18px, 2.5vw, 24px)', lineHeight: '130%', letterSpacing: '0%' }}>Years of Experience</h4>
                <p className="font-medium text-center break-words px-2" style={{ color: '#FFFFFF', fontSize: 'clamp(14px, 2vw, 16px)', lineHeight: '140%', letterSpacing: '0%' }}>Over 12 years of strategic expertise.</p>
              </div>
              {/* Top Right */}
              <div className="absolute top-[5%] right-[5%] w-56 h-56 rounded-full backdrop-blur-sm flex flex-col items-center justify-center text-center p-4 sm:p-5 md:p-6 border border-white/10 hover:border-fuchsia-500/50 transition-colors overflow-hidden" style={{ backgroundColor: 'rgba(18, 19, 23, 0.3)' }}>
                <h4 className="font-bold mb-1 sm:mb-2 text-center break-words px-2" style={{ color: '#FFFFFF', fontSize: 'clamp(18px, 2.5vw, 24px)', lineHeight: '130%', letterSpacing: '0%' }}>Expert Team</h4>
                <p className="font-medium text-center break-words px-2" style={{ color: '#FFFFFF', fontSize: 'clamp(14px, 2vw, 16px)', lineHeight: '140%', letterSpacing: '0%' }}>120+ skilled professionals</p>
              </div>
              {/* Bottom Left */}
              <div className="absolute bottom-[5%] left-[5%] w-56 h-56 rounded-full backdrop-blur-sm flex flex-col items-center justify-center text-center p-4 sm:p-5 md:p-6 border border-white/10 hover:border-fuchsia-500/50 transition-colors overflow-hidden" style={{ backgroundColor: 'rgba(18, 19, 23, 0.3)' }}>
                <h4 className="font-bold mb-1 sm:mb-2 text-center break-words px-2" style={{ color: '#FFFFFF', fontSize: 'clamp(18px, 2.5vw, 24px)', lineHeight: '130%', letterSpacing: '0%' }}>Client Success</h4>
                <p className="font-medium text-center break-words px-2" style={{ color: '#FFFFFF', fontSize: 'clamp(14px, 2vw, 16px)', lineHeight: '140%', letterSpacing: '0%' }}>500+ clients with proven search growth.</p>
              </div>
              {/* Bottom Right */}
              <div className="absolute bottom-[5%] right-[5%] w-56 h-56 rounded-full backdrop-blur-sm flex flex-col items-center justify-center text-center p-4 sm:p-5 md:p-6 border border-white/10 hover:border-fuchsia-500/50 transition-colors overflow-hidden" style={{ backgroundColor: 'rgba(18, 19, 23, 0.3)' }}>
                <h4 className="font-bold mb-1 sm:mb-2 text-center break-words px-2" style={{ color: '#FFFFFF', fontSize: 'clamp(18px, 2.5vw, 24px)', lineHeight: '130%', letterSpacing: '0%' }}>Industry Reach</h4>
                <p className="font-medium text-center break-words px-2" style={{ color: '#FFFFFF', fontSize: 'clamp(14px, 2vw, 16px)', lineHeight: '140%', letterSpacing: '0%' }}>Serving 30+ diverse, dynamic industries.</p>
              </div>
            </div>

            {/* Mobile Stack for Track Record */}
            <div className="md:hidden grid grid-cols-1 gap-6">
              <div className="p-8 rounded-2xl text-center border border-white/10" style={{ backgroundColor: 'rgba(18, 19, 23, 0.3)' }}>
                <h4 className="font-bold mb-2" style={{ color: '#FFFFFF', fontSize: '24px', lineHeight: '130%' }}>Years of Experience</h4>
                <p className="font-medium" style={{ color: '#FFFFFF', fontSize: '16px', lineHeight: '140%' }}>Over 12 years of strategic expertise.</p>
              </div>
              <div className="p-8 rounded-2xl text-center border border-white/10" style={{ backgroundColor: 'rgba(18, 19, 23, 0.3)' }}>
                <h4 className="font-bold mb-2" style={{ color: '#FFFFFF', fontSize: '24px', lineHeight: '130%' }}>Expert Team</h4>
                <p className="font-medium" style={{ color: '#FFFFFF', fontSize: '16px', lineHeight: '140%' }}>120+ skilled professionals</p>
              </div>
              <div className="p-8 rounded-2xl text-center border border-white/10" style={{ backgroundColor: 'rgba(18, 19, 23, 0.3)' }}>
                <h4 className="font-bold mb-2" style={{ color: '#FFFFFF', fontSize: '24px', lineHeight: '130%' }}>Client Success</h4>
                <p className="font-medium" style={{ color: '#FFFFFF', fontSize: '16px', lineHeight: '140%' }}>500+ clients with proven search growth.</p>
              </div>
              <div className="p-8 rounded-2xl text-center border border-white/10" style={{ backgroundColor: 'rgba(18, 19, 23, 0.3)' }}>
                <h4 className="font-bold mb-2" style={{ color: '#FFFFFF', fontSize: '24px', lineHeight: '130%' }}>Industry Reach</h4>
                <p className="font-medium" style={{ color: '#FFFFFF', fontSize: '16px', lineHeight: '140%' }}>Serving 30+ diverse, dynamic industries.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Key Benefits */}
        <section className="py-12 sm:py-16 md:py-20 bg-[#050505]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 md:gap-12">
              <div className="lg:w-1/3">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-4 sm:mb-5 md:mb-6 lg:mb-8 leading-tight">Key Benefits Of GEO Services For AI Search Engines</h2>
                <div className="flex gap-3 md:gap-4 mb-4 sm:mb-0">
                  <button 
                    onClick={() => {
                      const maxIndex = isDesktop ? 4 : 5
                      setCurrentBenefitsIndex((prev) => (prev === 0 ? maxIndex : prev - 1))
                    }}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white text-black flex items-center justify-center hover:bg-gradient-to-br hover:from-fuchsia-500 hover:to-purple-600 hover:text-white transition-all duration-150 flex-shrink-0"
                  >
                    <i data-lucide="arrow-left" className="w-4 h-4 md:w-5 md:h-5"></i>
                  </button>
                  <button 
                    onClick={() => {
                      const maxIndex = isDesktop ? 4 : 5
                      setCurrentBenefitsIndex((prev) => (prev === maxIndex ? 0 : prev + 1))
                    }}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white text-black flex items-center justify-center hover:bg-gradient-to-br hover:from-fuchsia-500 hover:to-purple-600 hover:text-white transition-all duration-150 flex-shrink-0"
                  >
                    <i data-lucide="arrow-right" className="w-4 h-4 md:w-5 md:h-5"></i>
                  </button>
                </div>
              </div>
              <div className="lg:w-2/3 overflow-hidden">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ 
                    transform: isDesktop 
                      ? `translateX(calc(-${currentBenefitsIndex} * (50% + 12px)))` 
                      : `translateX(calc(-${currentBenefitsIndex} * (100% + 16px)))`
                  }}
                >
                  {[
                    {
                      icon: 'cpu',
                      title: 'Appear in AI-Generated Summaries',
                      description: 'Boost your chances of being featured in AI-powered answer summaries across multiple platforms, thereby increasing your brand\'s visibility.'
                    },
                    {
                      icon: 'search',
                      title: 'Enhanced Zero-Click Visibility',
                      description: 'Optimize your content to appear directly in AI-generated answers, reducing the need for users to click through to your website while still gaining brand exposure.'
                    },
                    {
                      icon: 'zap',
                      title: 'Voice Search Optimization',
                      description: 'Improve your presence in voice-activated AI assistants like Siri, Alexa, and Google Assistant, capturing the growing voice search market.'
                    },
                    {
                      icon: 'trending-up',
                      title: 'Future-Proof Your SEO Strategy',
                      description: 'Stay ahead of the curve as AI search becomes the dominant discovery method, ensuring your brand remains visible in the evolving digital landscape.'
                    },
                    {
                      icon: 'target',
                      title: 'Entity Recognition & Optimization',
                      description: 'Enhance your brand\'s entity recognition across AI systems by optimizing structured data, knowledge graphs, and semantic relationships that AI engines use to understand and recommend your brand.'
                    },
                    {
                      icon: 'globe',
                      title: 'Multi-Platform AI Presence',
                      description: 'Expand your visibility across multiple AI platforms including ChatGPT, Google SGE, Bing Copilot, and other emerging AI search engines, ensuring comprehensive brand coverage.'
                    }
                  ].map((benefit, index) => (
                    <div 
                      key={index} 
                      className="w-full lg:w-[calc(50%-12px)] flex-shrink-0 mr-4 md:mr-6 bg-[#1F2937] p-4 sm:p-5 md:p-6 lg:p-8 rounded-xl sm:rounded-2xl border border-white/5"
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mb-3 sm:mb-4 md:mb-6 text-fuchsia-500 flex-shrink-0">
                        <i data-lucide={benefit.icon} className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10"></i>
                  </div>
                      <h3 
                        className="font-bold mb-2 sm:mb-3 md:mb-4 text-white"
                        style={{ fontSize: 'clamp(18px, 4vw, 24px)', lineHeight: '130%' }}
                      >
                        {benefit.title}
                      </h3>
                      <p 
                        className="font-medium text-gray-300 sm:text-gray-400"
                        style={{ fontSize: 'clamp(14px, 3vw, 20px)', lineHeight: '150%' }}
                      >
                        {benefit.description}
                  </p>
                </div>
                  ))}
                  </div>
                {/* Navigation Dots */}
                <div className="flex gap-2 justify-center mt-6 sm:mt-8">
                  {Array.from({ length: isDesktop ? 5 : 6 }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentBenefitsIndex(index)}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        currentBenefitsIndex === index
                          ? 'bg-fuchsia-500 w-6 sm:w-8'
                          : 'bg-gray-600 w-2 hover:bg-gray-500 hover:w-3 sm:hover:w-4'
                      }`}
                      aria-label={`Go to benefits position ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-20 bg-[#050505]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">BrandStory&apos;s Generative Engine Optimization Services For AI Search Engines</h2>
              <p 
                className="font-medium text-gray-400 max-w-7xl mx-auto"
                style={{ fontSize: 'clamp(16px, 3vw, 20px)' }}
              >
                Stay discoverable in AI-first search. Our GEO services position your brand across AI Overviews, answer engines, and voice platforms through structured, entity-rich, and semantically intelligent content.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Service Card 1 */}
              <div className="group bg-[#1F2937] hover:bg-gradient-to-br hover:from-fuchsia-500 hover:to-purple-600 p-5 sm:p-6 md:p-8 rounded-2xl relative overflow-hidden transition-all duration-300 cursor-pointer">
                <h3 
                  className="font-bold mb-3 sm:mb-4"
                  style={{ fontSize: 'clamp(20px, 4vw, 24px)', lineHeight: '130%' }}
                >
                  Answer Engine Optimization (AEO)
                </h3>
                <p 
                  className="font-medium mb-6 sm:mb-8 relative z-10 text-gray-400 group-hover:text-white transition-colors"
                  style={{ fontSize: 'clamp(16px, 3vw, 20px)' }}
                >
                  Optimize for AI-generated answers on platforms like Google AI Overviews and Bing Copilot. Align content with high-intent, zero-click queries using structured formats and intent mapping.
                </p>
              </div>
              {/* Service Card 2 */}
              <div className="group bg-[#1F2937] hover:bg-gradient-to-br hover:from-fuchsia-500 hover:to-purple-600 p-5 sm:p-6 md:p-8 rounded-2xl relative overflow-hidden transition-all duration-300 cursor-pointer">
                <h3 
                  className="font-bold mb-3 sm:mb-4"
                  style={{ fontSize: 'clamp(20px, 4vw, 24px)', lineHeight: '130%' }}
                >
                  Answer Engine Optimization (AEO)
                </h3>
                <p 
                  className="font-medium mb-6 sm:mb-8 relative z-10 text-gray-400 group-hover:text-white transition-colors"
                  style={{ fontSize: 'clamp(16px, 3vw, 20px)' }}
                >
                  Optimize for AI-generated answers on platforms like Google AI Overviews and Bing Copilot. Align content with high-intent, zero-click queries using structured formats and intent mapping.
                </p>
              </div>
              {/* Service Card 3 */}
              <div className="group bg-[#1F2937] hover:bg-gradient-to-br hover:from-fuchsia-500 hover:to-purple-600 p-5 sm:p-6 md:p-8 rounded-2xl relative overflow-hidden transition-all duration-300 cursor-pointer">
                <h3 
                  className="font-bold mb-3 sm:mb-4"
                  style={{ fontSize: 'clamp(20px, 4vw, 24px)', lineHeight: '130%' }}
                >
                  Answer Engine Optimization (AEO)
                </h3>
                <p 
                  className="font-medium mb-6 sm:mb-8 relative z-10 text-gray-400 group-hover:text-white transition-colors"
                  style={{ fontSize: 'clamp(16px, 3vw, 20px)' }}
                >
                  Optimize for AI-generated answers on platforms like Google AI Overviews and Bing Copilot. Align content with high-intent, zero-click queries using structured formats and intent mapping.
                </p>
              </div>
              {/* Service Card 4 */}
              <div className="group bg-[#1F2937] hover:bg-gradient-to-br hover:from-fuchsia-500 hover:to-purple-600 p-5 sm:p-6 md:p-8 rounded-2xl relative overflow-hidden transition-all duration-300 cursor-pointer">
                <h3 
                  className="font-bold mb-3 sm:mb-4"
                  style={{ fontSize: 'clamp(20px, 4vw, 24px)', lineHeight: '130%' }}
                >
                  Answer Engine Optimization (AEO)
                </h3>
                <p 
                  className="font-medium mb-6 sm:mb-8 relative z-10 text-gray-400 group-hover:text-white transition-colors"
                  style={{ fontSize: 'clamp(16px, 3vw, 20px)' }}
                >
                  Optimize for AI-generated answers on platforms like Google AI Overviews and Bing Copilot. Align content with high-intent, zero-click queries using structured formats and intent mapping.
                </p>
              </div>
              {/* Service Card 5 */}
              <div className="group bg-[#1F2937] hover:bg-gradient-to-br hover:from-fuchsia-500 hover:to-purple-600 p-5 sm:p-6 md:p-8 rounded-2xl relative overflow-hidden transition-all duration-300 cursor-pointer">
                <h3 
                  className="font-bold mb-3 sm:mb-4"
                  style={{ fontSize: 'clamp(20px, 4vw, 24px)', lineHeight: '130%' }}
                >
                  Answer Engine Optimization (AEO)
                </h3>
                <p 
                  className="font-medium mb-6 sm:mb-8 relative z-10 text-gray-400 group-hover:text-white transition-colors"
                  style={{ fontSize: 'clamp(16px, 3vw, 20px)' }}
                >
                  Optimize for AI-generated answers on platforms like Google AI Overviews and Bing Copilot. Align content with high-intent, zero-click queries using structured formats and intent mapping.
                </p>
              </div>
              {/* Service Card 6 */}
              <div className="group bg-[#1F2937] hover:bg-gradient-to-br hover:from-fuchsia-500 hover:to-purple-600 p-5 sm:p-6 md:p-8 rounded-2xl relative overflow-hidden transition-all duration-300 cursor-pointer">
                <h3 
                  className="font-bold mb-3 sm:mb-4"
                  style={{ fontSize: 'clamp(20px, 4vw, 24px)', lineHeight: '130%' }}
                >
                  Answer Engine Optimization (AEO)
                </h3>
                <p 
                  className="font-medium mb-6 sm:mb-8 relative z-10 text-gray-400 group-hover:text-white transition-colors"
                  style={{ fontSize: 'clamp(16px, 3vw, 20px)' }}
                >
                  Optimize for AI-generated answers on platforms like Google AI Overviews and Bing Copilot. Align content with high-intent, zero-click queries using structured formats and intent mapping.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-20 bg-[#050505]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">Our 5-Stage GEO Process For AI-First Search Success</h2>
              <p 
                className="font-medium text-center text-gray-400"
                style={{ fontSize: 'clamp(16px, 3vw, 20px)' }}
              >
                We simplify the complex. Our GEO approach is structured to reduce guesswork, bring clarity, and deliver measurable AI-first visibility using the right tools, frameworks, and experience at every stage.
              </p>
            </div>

            <div className="space-y-4">
              {/* Step 1 */}
              <div className="group bg-[#181818] hover:bg-gradient-to-r hover:from-fuchsia-500 hover:to-purple-600 rounded-2xl p-5 sm:p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-4 sm:gap-6 md:gap-8 border border-white/5 transition-all duration-300 cursor-pointer">
                <div 
                  className="font-bold text-white group-hover:text-white/90 transition-colors"
                  style={{ fontSize: 'clamp(40px, 8vw, 64px)' }}
                >
                  01
                </div>
                <div className="flex-shrink-0 w-full md:w-64">
                  <h3 
                    className="font-bold mb-2 md:mb-0"
                    style={{ fontSize: 'clamp(20px, 4vw, 24px)', lineHeight: '130%' }}
                  >
                    Entity & Visibility Audit
                  </h3>
                </div>
                <div className="flex-1">
                  <h4 
                    className="font-bold mb-2 text-white group-hover:text-white/90 transition-colors"
                    style={{ fontSize: 'clamp(18px, 3vw, 20px)' }}
                  >
                    Know where you stand
                  </h4>
                  <p 
                    className="font-medium text-gray-400 group-hover:text-white/80 transition-colors"
                    style={{ fontSize: 'clamp(16px, 2.5vw, 18px)' }}
                  >
                    We evaluate how AI systems like ChatGPT, Google AI, and Perplexity perceive your brand, content, and entity relevance—so we start with clarity, not assumptions.
                  </p>
                </div>
              </div>
              {/* Step 2 */}
              <div className="group bg-[#181818] hover:bg-gradient-to-r hover:from-fuchsia-500 hover:to-purple-600 rounded-2xl p-5 sm:p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-4 sm:gap-6 md:gap-8 border border-white/5 transition-all duration-300 cursor-pointer">
                <div 
                  className="font-bold text-white group-hover:text-white/90 transition-colors"
                  style={{ fontSize: 'clamp(40px, 8vw, 64px)' }}
                >
                  02
                </div>
                <div className="flex-shrink-0 w-full md:w-64">
                  <h3 
                    className="font-bold mb-2 md:mb-0"
                    style={{ fontSize: 'clamp(20px, 4vw, 24px)', lineHeight: '130%' }}
                  >
                    Entity & Visibility Audit
                  </h3>
                </div>
                <div className="flex-1">
                  <h4 
                    className="font-bold mb-2 text-white group-hover:text-white/90 transition-colors"
                    style={{ fontSize: 'clamp(18px, 3vw, 20px)' }}
                  >
                    Know where you stand
                  </h4>
                  <p 
                    className="font-medium text-gray-400 group-hover:text-white/80 transition-colors"
                    style={{ fontSize: 'clamp(16px, 2.5vw, 18px)' }}
                  >
                    We evaluate how AI systems like ChatGPT, Google AI, and Perplexity perceive your brand, content, and entity relevance—so we start with clarity, not assumptions.
                  </p>
                </div>
              </div>
              {/* Step 3 */}
              <div className="group bg-[#181818] hover:bg-gradient-to-r hover:from-fuchsia-500 hover:to-purple-600 rounded-2xl p-5 sm:p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-4 sm:gap-6 md:gap-8 border border-white/5 transition-all duration-300 cursor-pointer">
                <div 
                  className="font-bold text-white group-hover:text-white/90 transition-colors"
                  style={{ fontSize: 'clamp(40px, 8vw, 64px)' }}
                >
                  03
                </div>
                <div className="flex-shrink-0 w-full md:w-64">
                  <h3 
                    className="font-bold mb-2 md:mb-0"
                    style={{ fontSize: 'clamp(20px, 4vw, 24px)', lineHeight: '130%' }}
                  >
                    Entity & Visibility Audit
                  </h3>
                </div>
                <div className="flex-1">
                  <h4 
                    className="font-bold mb-2 text-white group-hover:text-white/90 transition-colors"
                    style={{ fontSize: 'clamp(18px, 3vw, 20px)' }}
                  >
                    Know where you stand
                  </h4>
                  <p 
                    className="font-medium text-gray-400 group-hover:text-white/80 transition-colors"
                    style={{ fontSize: 'clamp(16px, 2.5vw, 18px)' }}
                  >
                    We evaluate how AI systems like ChatGPT, Google AI, and Perplexity perceive your brand, content, and entity relevance—so we start with clarity, not assumptions.
                  </p>
                </div>
              </div>
              {/* Step 4 */}
              <div className="group bg-[#181818] hover:bg-gradient-to-r hover:from-fuchsia-500 hover:to-purple-600 rounded-2xl p-5 sm:p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-4 sm:gap-6 md:gap-8 border border-white/5 transition-all duration-300 cursor-pointer">
                <div 
                  className="font-bold text-white group-hover:text-white/90 transition-colors"
                  style={{ fontSize: 'clamp(40px, 8vw, 64px)' }}
                >
                  04
                </div>
                <div className="flex-shrink-0 w-full md:w-64">
                  <h3 
                    className="font-bold mb-2 md:mb-0"
                    style={{ fontSize: 'clamp(20px, 4vw, 24px)', lineHeight: '130%' }}
                  >
                    Entity & Visibility Audit
                  </h3>
                </div>
                <div className="flex-1">
                  <h4 
                    className="font-bold mb-2 text-white group-hover:text-white/90 transition-colors"
                    style={{ fontSize: 'clamp(18px, 3vw, 20px)' }}
                  >
                    Know where you stand
                  </h4>
                  <p 
                    className="font-medium text-gray-400 group-hover:text-white/80 transition-colors"
                    style={{ fontSize: 'clamp(16px, 2.5vw, 18px)' }}
                  >
                    We evaluate how AI systems like ChatGPT, Google AI, and Perplexity perceive your brand, content, and entity relevance—so we start with clarity, not assumptions.
                  </p>
                </div>
              </div>
              {/* Step 5 */}
              <div className="group bg-[#181818] hover:bg-gradient-to-r hover:from-fuchsia-500 hover:to-purple-600 rounded-2xl p-5 sm:p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-4 sm:gap-6 md:gap-8 border border-white/5 transition-all duration-300 cursor-pointer">
                <div 
                  className="font-bold text-white group-hover:text-white/90 transition-colors"
                  style={{ fontSize: 'clamp(40px, 8vw, 64px)' }}
                >
                  05
                </div>
                <div className="flex-shrink-0 w-full md:w-64">
                  <h3 
                    className="font-bold mb-2 md:mb-0"
                    style={{ fontSize: 'clamp(20px, 4vw, 24px)', lineHeight: '130%' }}
                  >
                    Entity & Visibility Audit
                  </h3>
                </div>
                <div className="flex-1">
                  <h4 
                    className="font-bold mb-2 text-white group-hover:text-white/90 transition-colors"
                    style={{ fontSize: 'clamp(18px, 3vw, 20px)' }}
                  >
                    Know where you stand
                  </h4>
                  <p 
                    className="font-medium text-gray-400 group-hover:text-white/80 transition-colors"
                    style={{ fontSize: 'clamp(16px, 2.5vw, 18px)' }}
                  >
                    We evaluate how AI systems like ChatGPT, Google AI, and Perplexity perceive your brand, content, and entity relevance—so we start with clarity, not assumptions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* White CTA Box */}
        <section className="py-12 sm:py-16 md:py-20 px-4">
          <div className="max-w-6xl mx-auto bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 lg:p-20 text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-4 sm:mb-6 md:mb-8 leading-tight">
              Why Partner With Our Generative Engine Optimization Agency In Bangalore
            </h2>
            <p 
              className="font-medium mb-6 sm:mb-8 md:mb-10 max-w-4xl mx-auto text-center text-gray-600"
              style={{ fontSize: 'clamp(16px, 3vw, 20px)' }}
            >
              Search is no longer a list of links—it&apos;s a stream of answers. As a leading Generative Engine Optimization agency in Bangalore, BrandStory ensures your business is represented across AI tools like ChatGPT, Perplexity, and Google AI Overviews. With a structured, AI-first approach, content is crafted to be cited, surfaced, and trusted in zero-click environments.
            </p>
            <a href="https://brandstory.in/contact-us/" className="group inline-flex items-center gap-2 bg-[#111] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold hover:bg-gradient-to-br hover:from-fuchsia-500 hover:to-purple-600 hover:shadow-lg transition-all duration-300 ease-in-out text-sm sm:text-base">
              <i data-lucide="chevron-right" className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300"></i>
              <span className="whitespace-nowrap">Book Your Free GEO Consultation Now!</span>
            </a>
          </div>
        </section>

        {/* Why GEO Essential */}
        <section className="py-12 sm:py-16 md:py-20 bg-[#050505]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8 sm:gap-12 md:gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 md:mb-8">Why GEO Is Essential For Modern Search Visibility</h2>
              <p 
                className="font-medium mb-4 sm:mb-6 text-gray-400"
                style={{ fontSize: 'clamp(16px, 3vw, 20px)' }}
              >
                Modern search begins inside generative engines. Visibility now depends on how AI understands, summarizes, and ranks your content. Being present in traditional search is no longer enough. To start ahead, partnering with our experienced Answer Engine Optimization agency in Bangalore ensures your brand earns visibility in the AI-first search era.
              </p>
            </div>
            <div className="lg:w-1/2">
              <ul className="space-y-4 sm:space-y-6">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-white mt-2.5 flex-shrink-0"></div>
                  <p 
                    className="font-medium text-gray-300"
                    style={{ fontSize: 'clamp(16px, 3vw, 20px)' }}
                  >
                    Over 50% of digital journeys now start with AI tools and assistants
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-white mt-2.5 flex-shrink-0"></div>
                  <p 
                    className="font-medium text-gray-300"
                    style={{ fontSize: 'clamp(16px, 3vw, 20px)' }}
                  >
                    GEO services for AI Overviews and ChatGPT rankings improve answer inclusion and topical relevance
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-white mt-2.5 flex-shrink-0"></div>
                  <p 
                    className="font-medium text-gray-300"
                    style={{ fontSize: 'clamp(16px, 3vw, 20px)' }}
                  >
                    Zero-click search optimization services in Bangalore increase visibility without needing link clicks
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-white mt-2.5 flex-shrink-0"></div>
                  <p 
                    className="font-medium text-gray-300"
                    style={{ fontSize: 'clamp(16px, 3vw, 20px)' }}
                  >
                    Structured responses enhance performance on voice assistants like Siri, Alexa, and Google Assistant
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-white mt-2.5 flex-shrink-0"></div>
                  <p 
                    className="font-medium text-gray-300"
                    style={{ fontSize: 'clamp(16px, 3vw, 20px)' }}
                  >
                    AI content optimization for local businesses in Bangalore delivers geo-relevant results in conversational search
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 2: Why GEO Essential with Accordion - Dark Blue Background */}
        <section className="py-12 sm:py-16 md:py-20 bg-[#0a0a1a]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8 sm:gap-12 md:gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 md:mb-8">Why GEO Is Essential For Modern Search Visibility</h2>
               <p 
                 className="font-medium mb-4 sm:mb-6 text-gray-400"
                 style={{ 
                   fontSize: 'clamp(16px, 3vw, 20px)', 
                   letterSpacing: '0%' 
                 }}
               >
                BrandStory brings precision, clarity, and strategic expertise to every GEO engagement. Recognized as one of the top 10 Generative Engine Optimization companies in Bangalore. Our agency ensures content is not just visible, but impactful across AI-first platforms.
              </p>
            </div>
            <div className="lg:w-1/2 space-y-4 sm:space-y-6 md:space-y-8">
              {[
                { title: 'Local AI Optimization Expertise', content: 'Utilize GEO Frameworks Specifically Designed For Bangalore-Based Businesses. Improve Local Visibility In AI-Generated Results Through Region-Specific Schema.' },
                { title: 'Built for LLMs and Conversational AI', content: 'Specialize in Perplexity and ChatGPT SEO services in Bangalore. Align content with how large language models generate and prioritize answers.' },
                { title: 'Complete Answer Engine Optimization Systems', content: 'Apply structured data, schema markup, and conversational formats. Our certified Answer Engine Optimization company in Bangalore ensures brand presence across platforms.' },
                { title: 'Data-Driven, Ongoing Impact', content: 'Track performance with visibility scoring and entity audits. Refine content continuously to boost discoverability and AI relevance.' },
              ].map((item, index) => {
                const isOpen = openAccordion === index
                return (
                  <div key={index} className="bg-[#1F2937] rounded-lg overflow-hidden">
                    <div 
                      className="p-3 sm:p-4 flex justify-between items-center cursor-pointer hover:bg-[#2d3748] transition-colors duration-200"
                      onClick={() => {
                        setOpenAccordion(isOpen ? null : index)
                      }}
                    >
                      <span 
                        className="font-bold capitalize pr-2 sm:pr-4"
                        style={{ 
                          fontSize: 'clamp(18px, 4vw, 24px)', 
                          lineHeight: '130%' 
                        }}
                      >
                        {item.title}
                      </span>
                      <button 
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ease-in-out ${
                          isOpen 
                            ? 'bg-gradient-to-r from-fuchsia-500 to-purple-600' 
                            : 'bg-white text-black'
                        }`}
                      >
                        <svg 
                          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all duration-300 ease-in-out ${isOpen ? 'text-white' : 'text-black'}`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          {isOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          )}
                        </svg>
                      </button>
                    </div>
                    <div 
                      className="grid overflow-hidden"
                      style={{
                        gridTemplateRows: isOpen ? '1fr' : '0fr',
                        transition: 'grid-template-rows 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease-in-out',
                        opacity: isOpen ? 1 : 0
                      }}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <div 
                          className="p-3 sm:p-4 pt-3 sm:pt-4 text-gray-400"
                          style={{ 
                            fontSize: 'clamp(16px, 2.5vw, 18px)', 
                            letterSpacing: '0%' 
                          }}
                        >
                          {item.content}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Section 3: Testimonial - White Background */}
        <section className="py-12 sm:py-16 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16">
              {/* Left: Heading & Navigation */}
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 md:mb-8 text-black">What Clients Say About Our GEO Expertise</h2>
                <div className="flex gap-3 sm:gap-4 mb-8 sm:mb-12">
                  <button 
                    onClick={() => {
                      setCurrentTestimonial((prev) => (prev === 0 ? 5 : prev - 1))
                    }}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black text-white flex items-center justify-center hover:bg-gradient-to-br hover:from-fuchsia-500 hover:to-purple-600 transition-all duration-150"
                  >
                    <i data-lucide="arrow-left" className="w-4 h-4 sm:w-5 sm:h-5"></i>
                  </button>
                  <button 
                    onClick={() => {
                      setCurrentTestimonial((prev) => (prev === 5 ? 0 : prev + 1))
                    }}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black text-white flex items-center justify-center hover:bg-gradient-to-br hover:from-fuchsia-500 hover:to-purple-600 transition-all duration-150"
                  >
                    <i data-lucide="arrow-right" className="w-4 h-4 sm:w-5 sm:h-5"></i>
                  </button>
                </div>
              </div>

              {/* Right: Testimonial Card */}
              <div className="relative w-full">
                <div className="overflow-hidden w-full">
                  <div 
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
                  >
                    {[
                      { 
                        quote: 'We started appearing in ChatGPT responses within 90 days. The framework was structured, the reporting was clear and the results were consistent.', 
                        author: 'Marketing Head, B2B SaaS Platform' 
                      },
                      { 
                        quote: 'Our move to GEO with BrandStory drove exponential visibility. We now rank inside AI Overviews and voice searches—something traditional SEO never delivered.', 
                        author: 'Head of Growth, E-commerce Brand' 
                      },
                      { 
                        quote: 'GEO changed how our brand is discovered. BrandStory didn\'t just provide a service, they delivered a strategic transformation with long-term impact.', 
                        author: 'Co-founder, Healthcare SaaS Platform' 
                      },
                      { 
                        quote: 'The team\'s expertise in AI-first optimization is unmatched. We saw measurable improvements in our visibility across ChatGPT and Perplexity within the first quarter.', 
                        author: 'Digital Marketing Director, FinTech Company' 
                      },
                      { 
                        quote: 'BrandStory\'s GEO services transformed our content strategy. Our brand now appears in AI-generated summaries and answer engines consistently.', 
                        author: 'VP of Marketing, B2B Technology Firm' 
                      },
                      { 
                        quote: 'Working with BrandStory on GEO was a game-changer. Our content now ranks in AI Overviews and voice search results, driving significant organic growth.', 
                        author: 'CEO, SaaS Startup' 
                      },
                    ].map((testimonial, index) => (
                      <div key={index} className="min-w-full w-full flex-shrink-0 px-1 sm:px-2">
                        <div className="bg-[#111] p-5 sm:p-6 md:p-8 rounded-2xl border border-gray-200 h-full flex flex-col">
                          <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-600 mb-3 sm:mb-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.608l.996 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.984zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.608l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                          </svg>
                          <p 
                            className="mb-4 sm:mb-6 text-white flex-grow"
                            style={{ fontSize: 'clamp(16px, 3vw, 20px)' }}
                          >
                            {testimonial.quote}
                          </p>
                          <div className="flex items-center gap-2 mt-auto">
                            <div className="w-6 sm:w-8 h-0.5 bg-white"></div>
                            <span className="font-bold text-white text-sm sm:text-base">{testimonial.author}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Dots indicator */}
                <div className="flex gap-2 justify-center mt-6">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTestimonial(index)}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        currentTestimonial === index 
                          ? 'bg-black w-8' 
                          : 'bg-gray-300 w-2 hover:bg-gray-500 hover:w-4'
                      }`}
                      aria-label={`Go to testimonial ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 sm:py-16 md:py-20 bg-[#050505]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 sm:mb-8 md:mb-12">FAQ&apos;s</h2>
            <div className="space-y-3 sm:space-y-4">
              {[
                { question: 'How Does Generative Engine Optimization Help Brands Grow?', answer: 'It Boosts Visibility Across AI Tools Like ChatGPT And Perplexity - Summarize, Recommend, And Answer. GEO Aligns Your Content With How Users Now Search.' },
                { question: 'How Does ChatGPT Content Visibility Optimization In Bangalore Support GEO Goals?', answer: 'Our ChatGPT content visibility optimization in Bangalore helps your brand appear in AI-generated responses. It aligns content with ChatGPT\'s structure and improves semantic accuracy.' },
                { question: 'How Is GEO Different From Regular SEO?', answer: 'SEO focuses on ranking in search results. GEO ensures your brand is cited in AI-generated answers using structured content and entity-based optimization.' },
                { question: 'When Can I Expect Visibility Improvements?', answer: 'Most brands see results within 8–12 weeks from our Generative Engine Optimization services in Bangalore. Visibility depends on content quality, domain authority and how well GEO is implemented.' },
                { question: 'What Results Should I Anticipate From GEO?', answer: 'Expect brand mentions in AI summaries and zero-click results. GEO also improves voice search performance across platforms like ChatGPT, Bing AI and Google SGE.' },
                { question: 'Is GEO Tailored For Regional Targeting Like Bangalore?', answer: 'Yes. Localized schema, geo-relevant topics, and AI content optimization for local businesses in Bangalore are key parts of our strategy.' },
                { question: 'Are There Any Limitations With GEO?', answer: 'GEO requires structured, up-to-date content. Without proper schema and entity clarity, AI tools may overlook your brand in generative search layers.' },
                { question: 'Why Isn\'t My Brand Showing Up In AI Summaries?', answer: 'It\'s often due to weak entity recognition or missing structured data. A lack of trust signals can also prevent AI tools from surfacing your brand.' },
                { question: 'What Are The Costs Involved In GEO Implementation?', answer: 'Pricing varies by scale and scope. Flexible packages are available for startups, mid-size companies, and enterprises investing in GEO services in Bangalore.' },
                { question: 'Do B2B Companies Benefit From GEO?', answer: 'Yes. GEO boosts credibility for B2B brands. It secures placements in AI shortlists and authoritative summaries that guide decision-makers.' },
                { question: 'How Can GEO Solve Visibility Gaps In ChatGPT Or Perplexity?', answer: 'Our Perplexity and ChatGPT SEO services in Bangalore focus on prompt-driven content and structured markup. It helps close visibility gaps in generative AI platforms effectively.' },
                { question: 'Does Multimedia Content Matter For GEO?', answer: 'Yes, multimedia like videos, images and infographics enhance engagement and improve AI visibility. BrandStory\'s GEO services help optimize multimedia for better search inclusion.' },
                { question: 'Why Is Online Reputation Management Important?', answer: 'Online reputation builds trust and credibility across AI search results. Our GEO services in Bangalore ensure positive brand narratives appear in voice, chat and answer engines.' },
                { question: 'Do I Need To Change My Entire Website To Implement GEO?', answer: 'Not necessarily. An expert team can audit and upgrade critical elements—content, structure and UX — without a full rebuild. It ensures alignment with generative search algorithms.' },
                { question: 'Is GEO Relevant For Both B2B And B2C?', answer: 'Yes, it is. Our specialized GEO agency in Bangalore tailors strategies to effectively target decision makers and consumers across AI platforms.' },
                { question: 'What Kind Of Content Works Best For Generative Engine Optimization?', answer: 'Authoritative, structured, multimedia rich content performs best. BrandStory crafts FAQ-rich, entity based content that AI engines prefer to surface in zero click answers.' },
              ].map((faq, index) => {
                const isOpen = openFaq === index
                return (
                  <div key={index} className="bg-[#1F2937] rounded-lg overflow-hidden">
                    <div 
                      className="p-4 sm:p-5 flex justify-between items-center cursor-pointer hover:bg-[#2d3748] transition-colors duration-200"
                      onClick={() => {
                        setOpenFaq(isOpen ? null : index)
                      }}
                    >
                      <span 
                        className="font-bold capitalize pr-2 sm:pr-4 text-left"
                        style={{ 
                          fontSize: 'clamp(18px, 4vw, 24px)', 
                          lineHeight: '140%', 
                          letterSpacing: '0%' 
                        }}
                      >
                        {faq.question}
                      </span>
                      <button 
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ease-in-out ${
                          isOpen 
                            ? 'bg-gradient-to-r from-fuchsia-500 to-purple-600' 
                            : 'bg-white text-black'
                        }`}
                      >
                        <svg 
                          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all duration-300 ease-in-out ${isOpen ? 'text-white' : 'text-black'}`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          {isOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          )}
                        </svg>
                      </button>
                    </div>
                    <div 
                      className="grid overflow-hidden"
                      style={{
                        gridTemplateRows: isOpen ? '1fr' : '0fr',
                        transition: 'grid-template-rows 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease-in-out',
                        opacity: isOpen ? 1 : 0
                      }}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <div 
                          className="p-4 sm:p-5 pt-3 sm:pt-4"
                          style={{ 
                            fontSize: 'clamp(16px, 3vw, 20px)', 
                            lineHeight: '140%', 
                            letterSpacing: '0%',
                            color: '#9CA3AF'
                          }}
                        >
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

      <Script 
        src="https://cdn.tailwindcss.com" 
        strategy="afterInteractive"
      />
      <Script 
        src="https://unpkg.com/lucide@latest" 
        strategy="afterInteractive"
        onLoad={() => {
          if (typeof window !== 'undefined' && (window as any).lucide) {
            (window as any).lucide.createIcons()
          }
        }}
      />
    </div>
  )
}

