import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import archiver from 'archiver'
import { createReadStream, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { Readable } from 'stream'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Helper function to escape HTML
function escapeHtml(str: string): string {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// Helper function to add directory to ZIP
function addDirectoryToZip(archive: archiver.Archiver, dirPath: string, zipPath: string) {
  try {
    const items = readdirSync(dirPath)
    for (const item of items) {
      const fullPath = join(dirPath, item)
      const stat = statSync(fullPath)
      const relativePath = join(zipPath, item).replace(/\\/g, '/')
      
      if (stat.isDirectory()) {
        addDirectoryToZip(archive, fullPath, relativePath)
      } else {
        archive.append(createReadStream(fullPath), { name: relativePath })
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not add directory ${dirPath} to ZIP:`, error)
  }
}

// Generate complete HTML page with all sections for template3
function generateHTMLPage(content: any): string {
  const animations = ['fade-left', 'fade-up', 'fade-right', 'fade-left', 'fade-up', 'fade-right']
  const benefitAnimations = ['fade-left', 'fade-up', 'fade-right', 'fade-left', 'fade-up', 'fade-right']
  const benefitCircles = ['circle-purple', 'circle-pastel-red', 'circle-soft-blue', 'circle-teal', 'circle-orchid', 'circle-vivid-orange']
  const benefitLines = ['line-purple', 'line-pastel-red', 'line-soft-blue', 'line-teal', 'line-orchid', 'line-vivid-orange']
  const benefitImages = [
    'https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/scc/create.png',
    'https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/scc/deliver.png',
    'https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/scc/integrate.png',
    'https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/scc/enhance.png',
    'https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/scc/easy.png',
    'https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/scc/across.png'
  ]
  const serviceImages = [
    'https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/scc/custom.png',
    'https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/scc/cart.png',
    'https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/scc/payment.png',
    'https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/scc/inventory.png',
    'https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/scc/ecomm.png',
    'https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/scc/services.png',
    'https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/scc/solutions.png',
    'https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/scc/api.png',
    'https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/scc/migrations.png',
    'https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/scc/security.png',
    'https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/scc/vend.png',
    'https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/scc/repor.png'
  ]
  const serviceAnimations = ['fade-left', 'fade-up', 'fade-right', 'fade-left', 'fade-up', 'fade-right', 'fade-left', 'fade-up', 'fade-right', 'fade-left', 'fade-up', 'fade-right']
  const trackRecordBgClasses = ['bg-brand-01 text-white', 'bg-brand-02 text-black', 'bg-brand-03 text-white', 'bg-brand-04 text-white']
  const trackRecordDelays = ['200', '400', '600', '800']
  const trackRecordDurations = ['1000', '1200', '1300', '1400']

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(content.page_title || 'Generated Page')}</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Text:ital@0;1&family=Hanken+Grotesk:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet">

    <!-- CSS -->
    <link href="https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/css/menu.css?key=1765949516" rel="stylesheet">
    <link href="https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/css/global.css?key=1765949516" rel="stylesheet">
    <link href="https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/css/style.css?key=1765949516" rel="stylesheet">
    <link href="https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/css/swiper.css?key=1765949516" rel="stylesheet">
    <link href="https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/css/aos.css?key=1765949516" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">
    <link rel="icon" type="image/png" sizes="32x32" href="https://brandstory.in/assets/images/wp-content/uploads/2018/04/favicon.png">
</head>
<body>
    <!-- Banner Section -->
    <section class="home-banner bg-black">
        <div class="container-fluid p-0">
            <div class="swiper bannerSwiper">
                <div class="swiper-wrapper">
                    <div class="swiper-slide">
                        <div class="bnr-slide01 bg-bnr d-flex align-items-center">
                <div class="container">
                    <div class="row">
                        <div class="col-md-8 text-white">
                                        <h1 class="mb-4">${escapeHtml(content.banner?.title || '')}</h1>
                                        <p class="mb-5">${escapeHtml(content.banner?.subtitle || '')}</p>
                                        <div class="smm-uae-btn btn-001">
                                            <a href="${escapeHtml(content.banner?.cta_link || 'https://brandstory.in/contact-us/')}" class="fs-22 cnt-btn fw-700 text-white d-flex align-items-center gap-2">${escapeHtml(content.banner?.cta_text || '')}</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
                </div>
            </div>
        </div>
        <div class="container">
            <p class="text-center text-white ml-5 mr-5 pt-5">
                ${escapeHtml(content.intro?.paragraph_1 || '')}
            </p>
        </div>
    </section>
    
    <!-- Intro Section -->
    <section class="next-section py-5 bg-black text-white">
        <div class="container">
            <div class="row align-items-center g-4">
                <div class="col-lg-6">
                    <img src="https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/ecom/ecommerce-uiux.png" alt="UI/UX" class="img-fluid rounded-4 shadow">
                </div>
                <div class="col-lg-6">
                    <p>${escapeHtml(content.intro?.paragraph_2 || '')}</p>
                    <p>${escapeHtml(content.intro?.paragraph_3 || '')}</p>
                            </div>
                        </div>
                    </div>
    </section>
    
    <!-- Trusted Brands Section -->
    <section class="trusted-brands spb-100">
        <div class="container">
            <h2 class="text-white mb-5 text-center" data-aos="fade-up">${escapeHtml(content.trusted_brands?.heading || '')}</h2>
            <p class="text-white">${escapeHtml(content.trusted_brands?.description || '')}</p>
            
            <div class="swiper clients-swiper" data-aos="fade-up">
                        <div class="swiper-wrapper">
                    <div class="swiper-slide logo">
                        <img src="https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/ecom/nuu.svg" loading="lazy" class="img-fluid active" alt="web development company in Bangalore">
                    </div>
                    <div class="swiper-slide logo">
                        <img src="https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/ecom/luna.svg" loading="lazy" class="img-fluid active" alt="website development company in Bangalore">
                    </div>
                    <div class="swiper-slide logo">
                        <img src="https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/ecom/rzo.svg" loading="lazy" class="img-fluid active" alt="website design service provider in Bangalore">
                    </div>
                    <div class="swiper-slide logo">
                        <img src="https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/ecom/m.svg" loading="lazy" class="img-fluid active" alt="leading web design company in Bangalore">
                    </div>
                    <div class="swiper-slide logo">
                        <img src="https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/ecom/daily.svg" loading="lazy" class="img-fluid active" alt="web design and development company in Bangalore">
                    </div>
                    <div class="swiper-slide logo">
                        <img src="https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/ecom/dimen.svg" loading="lazy" class="img-fluid active" alt="web development company in Bangalore">
                    </div>
                    <div class="swiper-slide logo">
                        <img src="https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/ecom/tiipoi.svg" loading="lazy" class="img-fluid active" alt="affordable web design company Bangalore">
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Reviewed Experts Section -->
    <section class="meet-bsd spb-100 cus-overflow-x">
        <div class="container">
            <div class="row">
                <div class="col-lg-12">
                    <h2 class="text-white text-center mb-5" data-aos="fade-up">${escapeHtml(content.reviewed_experts?.heading || 'Rated & Reviewed on Trusted Platforms')}</h2>
                    <div class="row">
                        <div class="col-md-3 mb-3 mb-md-0">
                            <div class="review-card" data-aos="fade-up">
                                <img src="https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/web-development-company/google-logo.svg" class="img-fluid cus-w-150" alt="Google">
                            </div>
                        </div>
                        <div class="col-md-3 mb-3 mb-md-0">
                            <div class="review-card bg-review" data-aos="fade-up">
                                <img src="https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/web-development-company/clutch.svg" loading="lazy" class="img-fluid cus-w-100" alt="Clutch">
                            </div>
                        </div>
                        <div class="col-md-3 mb-3 mb-md-0">
                            <div class="review-card bg-review-02" data-aos="fade-up">
                                <img src="https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/web-development-company/ambitation-box.svg" loading="lazy" class="img-fluid cus-w-200" alt="Ambition Box">
                            </div>
                        </div>
                        <div class="col-md-3 mb-3 mb-md-0">
                            <div class="review-card bg-review-03" data-aos="fade-up">
                                <img src="https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/web-development-company/just-dial.svg" loading="lazy" class="img-fluid cus-w-150" alt="Just Dial">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Track Record Section -->
    <section class="trusted-brands spb-100">
        <div class="container">
            <h2 class="text-white mb-5 text-center" data-aos="fade-up">${escapeHtml(content.track_record?.heading || 'Performance Backed by Experience')}</h2>
            <div class="row">
                ${(content.track_record?.stats || []).slice(0, 4).map((stat: any, index: number) => `
                <div class="col-md-3" data-aos="fade-up">
                    <div class="brand-box ${trackRecordBgClasses[index % trackRecordBgClasses.length]} p-3 mb-3 mb-md-0" data-aos="fade-up" data-aos-delay="${trackRecordDelays[index % trackRecordDelays.length]}" data-aos-duration="${trackRecordDurations[index % trackRecordDurations.length]}">
                        <h3>${escapeHtml(stat.number || '')}</h3>
                        <div class="content-bottom">
                            <p class="fs-18">${escapeHtml(stat.title || '')}</p>
                            <p class="fs-18">${escapeHtml(stat.description || '')}</p>
                    </div>
                </div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>
    
    <!-- Key Benefits Section -->
    <section class="meet-bsd spb-100 cus-overflow-x">
        <div class="container">
            <div class="row">
                <div class="col-lg-12">
                    <h2 class="text-white text-center mb-5" data-aos="fade-up">${escapeHtml(content.key_benefits?.heading || 'Key Benefits of E-commerce Website Development Services')}</h2>
                    <div class="row g-3">
                        ${(content.key_benefits?.benefits || []).slice(0, 6).map((benefit: any, i: number) => `
                        <div class="col-md-4">
                            <div class="feature-card" data-aos="${benefitAnimations[i]}">
                                <span class="circle-feature-box ${benefitCircles[i]}"></span>
                                <img src="${benefitImages[i]}" class="img-fluid mb-4" alt="${escapeHtml(benefit.title || '')}">
                                <h3 class="text-white mb-2">${escapeHtml(benefit.title || '')}</h3>
                                <span class="line-feature-box ${benefitLines[i]}"></span>
                                <p class="text-white fs-18 mb-0">${escapeHtml(benefit.description || '')}</p>
                            </div>
                        </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Services Section -->
    <section class="spb-100 cus-overflow-x">
        <div class="container">
            <h2 class="mb-5 mt-3 text-center text-white">${escapeHtml(content.services?.heading || 'Comprehensive Ecommerce Development Services Tailored for Growth')}</h2>
            <p class="text-center text-white">${escapeHtml(content.services?.description || '')}</p>
            <div class="row g-4">
                ${(content.services?.services_list || []).slice(0, 12).map((service: any, i: number) => `
                <div class="col-md-4" data-aos="${serviceAnimations[i]}">
                    <div class="ind-card bg-white position-relative">
                        <div class="ind-inner-01 position-relative">
                            <img src="${serviceImages[i]}" loading="lazy" class="img-fluid mb-0" alt="${escapeHtml(service.title || '')}">
                            <div class="ind-head position-absolute">
                                <h3 class="text-white text-center">${escapeHtml(service.title || '')}</h3>
                            </div>
                        </div>
                        <div class="ind-inner-02">
                            <h4 class="text-center fs-24 fw-700 mb-3">${escapeHtml(service.title || '')}</h4>
                            <p class="text-center mb-0 fs-18">${escapeHtml(service.description || '')}</p>
                        </div>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>
    
    <!-- Accordion Section -->
    <section class="spb-70">
        <div class="container">
            <h2 class="text-white text-center mb-5" data-aos="fade-up">${escapeHtml(content.accordion?.heading || 'Flexible Ecommerce Platforms for All Business Models')}</h2>
            <p class="text-center text-white">${escapeHtml(content.accordion?.description || '')}</p>
            <div class="row g-4 d-flex align-items-center">
                <div class="col-md-4" data-aos="fade-up">
                    <img src="https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/scc/flex.png" loading="lazy" class="img-fluid rounded-3 mb-3" alt="Flexible Platforms">
                </div>
                <div class="col-md-8" data-aos="fade-up">
                    <div class="accordion custom-accordion" id="mainAccordion">
                        ${(content.accordion?.items || []).slice(0, 5).map((item: any, i: number) => `
                        <div class="accordion-item">
                            <h2 class="accordion-header" id="heading${i + 1}">
                                <button class="accordion-button ${i === 0 ? 'show' : 'collapsed'} fs-24 fw-700" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${i + 1}" aria-expanded="${i === 0 ? 'true' : 'false'}" aria-controls="collapse${i + 1}">
                                    ${escapeHtml(item.title || '')}
                                </button>
                            </h2>
                            <div id="collapse${i + 1}" class="accordion-collapse collapse ${i === 0 ? 'show' : ''}" aria-labelledby="heading${i + 1}" data-bs-parent="#mainAccordion">
                                <div class="accordion-body">
                                    <p>${escapeHtml(item.description || '')}</p>
                                </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Why Choose Section -->
    <section class="why-ecom-section py-5">
        <div class="container">
            <h2 class="text-center text-white mb-4">
                ${escapeHtml(content.why_choose?.heading || 'Why Choose Our Ecommerce Website Development')} <br>& Design Services
            </h2>
            <p class="text-center text-white mb-5">${escapeHtml(content.why_choose?.description_1 || '')}</p>
            <p class="text-center text-white mb-5">${escapeHtml(content.why_choose?.description_2 || '')}</p>
            <div class="row align-items-center pt-5">
                <div class="col-md-6 d-flex justify-content-center">
                    <img src="https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/scc/ecom-choose.png" alt="Why Choose Ecommerce Development Services" class="img-fluid rounded">
                </div>
                <div class="col-md-6 mx-auto text-white">
                    <p>${escapeHtml(content.why_choose?.paragraph || '')}</p>
                    <h4 class="fw-bold mb-3">${escapeHtml(content.why_choose?.subheading || 'How We Are Different from Others:')}</h4>
                    <ul class="fs-18">
                        ${(content.why_choose?.points || []).map((point: string) => `<li>${escapeHtml(point)}</li>`).join('')}
                    </ul>
                    <div class="smm-uae-btn btn-001">
                        <a href="${escapeHtml(content.why_choose?.cta_link || 'https://brandstory.in/contact-us/')}" class="fs-22 cnt-btn fw-700 text-white d-flex align-items-center gap-2">${escapeHtml(content.why_choose?.cta_text || 'Claim Your Free Competitive SEO Report!')}</a>
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Platforms Section -->
    <section class="spb-100 px-2 px-md-0">
        <div class="container" data-aos="fade-up">
            <h2 class="mb-5 mt-3 text-center text-white" data-aos="fade-up">${escapeHtml(content.platforms?.heading || 'Platform-Specific Ecommerce Development Services We Offer')}</h2>
            <p class="text-center text-white">${escapeHtml(content.platforms?.description || '')}</p>
            <div class="row border border-light">
                ${(content.platforms?.platforms_list || []).slice(0, 6).map((platform: any, i: number) => {
                    const platformImages = [
                        'https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/scc/magneto.png',
                        'https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/scc/shopify.png',
                        'https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/scc/woo.png',
                        'https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/scc/big.png',
                        'https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/scc/opencart.png',
                        'https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/scc/wix.png'
                    ]
                    return `
                <div class="col-md-4 border border-light platform-main">
                    <div class="platform-card py-5 px-2">
                        <div class="pf-card-img d-flex justify-content-between align-items-center pb-4">
                            <img src="${platformImages[i]}" class="img-fluid mb-0" alt="${escapeHtml(platform.name || '')}">
                            <img src="https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/web-development-company/platform-arrow.svg" class="img-fluid mb-0" alt="${escapeHtml(platform.name || '')}">
                        </div>
                        <div class="pf-card-content">
                            <h3 class="mb-3 mt-2 fs-28">${escapeHtml(platform.name || '')}</h3>
                            <p class="mb-0 fs-18">${escapeHtml(platform.description || '')}</p>
                        </div>
                    </div>
                </div>
                `
                }).join('')}
                ${content.platforms?.platforms_list && content.platforms.platforms_list.length >= 7 ? `
                <div class="col-md-12 border border-light platform-main">
                    <div class="platform-card py-5 px-2">
                        <div class="pf-card-img d-flex justify-content-between align-items-center pb-4">
                            <img src="https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/scc/cusecom.png" class="img-fluid mb-0" alt="${escapeHtml(content.platforms.platforms_list[6]?.name || 'Custom Ecommerce')}">
                            <img src="https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/web-development-company/platform-arrow.svg" class="img-fluid mb-0" alt="Custom Ecommerce">
                        </div>
                        <div class="pf-card-content">
                            <h3 class="mb-3 mt-2 fs-28">${escapeHtml(content.platforms.platforms_list[6]?.name || 'Custom e-commerce development')}</h3>
                            <p class="mb-0 fs-18">${escapeHtml(content.platforms.platforms_list[6]?.description || '')}</p>
                        </div>
                    </div>
                </div>
                ` : ''}
                </div>
        </div>
    </section>
    
    <!-- Success Stories Section -->
    <section class="ecom-success py-5">
        <div class="container">
            <h2 class="text-center text-white mb-5">${escapeHtml(content.success_stories?.heading || 'Ecommerce Success Stories Backed by Data')}</h2>
            <div class="row g-4">
                ${(content.success_stories?.stories || []).slice(0, 3).map((story: any) => `
                <div class="col-md-4">
                    <div class="success-card h-100">
                        <img src="https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/web-development-company/quotes.svg" class="w-11" alt="Quotes">
                        <p>${escapeHtml(story.description || '')}</p>
                        <strong>${escapeHtml(story.title || '')}</strong>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>
    
    <!-- Tools & Technologies Section -->
    <section class="spb-100 px-2">
        <div class="container">
            <h2 class="text-center text-white mb-5" data-aos="fade-up">${escapeHtml(content.tools_technologies?.heading || 'Tools & Technologies Used in eCommerce Website Development')}</h2>
            <p class="text-center text-white">${escapeHtml(content.tools_technologies?.description || '')}</p>
            ${(content.tools_technologies?.blocks || []).slice(0, 10).map((block: any, blockIndex: number) => {
                const tabPrefixes = ['goals', 'market', 'audience', 'intent', 'volume', 'node', 'java', 'ruby', 'tech', 'content', 'structure', 'meta', 'headers', 'seo', 'engage', 'conversion', 'google', 'speed', 'mobile', 'secure', 'presta', 'maps', 'citations', 'schema', 'snippets', 'faq', 'github', 'swot', 'strategy', 'gap', 'mail', 'chimp', 'links', 'mentions', 'social']
                return `
            <div class="process-sec" data-aos="fade-up">
                <div class="row align-items-center inner-p-sec text-white p-2">
                    <div class="col-auto">
                        <span class="p-2 p-md-4 fs-88">${String(blockIndex + 1).padStart(2, '0')}</span>
                </div>
                    <div class="col">
                        <h5 class="fw-bold mb-1 fs-24">${escapeHtml(block.title || '')}</h5>
                        <p class="mb-0 fs-18">${escapeHtml(block.description || '')}</p>
                        <div class="read-more-content">
                            <div class="tab-box">
                                <ul class="tab-list">
                                    ${(block.tabs || []).map((tab: any, tabIndex: number) => `
                                    <li class="${tabIndex === 0 ? 'active' : ''}" data-tab="${tabPrefixes[tabIndex] || 'tab'}-${String(blockIndex + 1).padStart(2, '0')}">${escapeHtml(tab.name || '')}</li>
                                    `).join('')}
                                </ul>
                                <div class="tab-content">
                                    ${(block.tabs || []).map((tab: any, tabIndex: number) => `
                                    <p data-tab="${tabPrefixes[tabIndex] || 'tab'}-${String(blockIndex + 1).padStart(2, '0')}" class="${tabIndex === 0 ? 'active' : ''}">${escapeHtml(tab.description || '')}</p>
                                    `).join('')}
                </div>
            </div>
                            <p class="mb-0 fs-18">Use case: ${escapeHtml(block.use_case || '')}</p>
                        </div>
                        <button class="read-more-btn">
                            Read More 
                            <span class="arrow">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="arrow-icon">
                                    <path d="M12.1338 5.94433C12.3919 5.77382 12.7434 5.80202 12.9707 6.02929C13.1979 6.25656 13.2261 6.60807 13.0556 6.8662L12.9707 6.9707L8.47067 11.4707C8.21097 11.7304 7.78896 11.7304 7.52926 11.4707L3.02926 6.9707L2.9443 6.8662C2.77379 6.60807 2.80199 6.25656 3.02926 6.02929C3.25653 5.80202 3.60804 5.77382 3.86617 5.94433L3.97067 6.02929L7.99996 10.0586L12.0293 6.02929L12.1338 5.94433Z"></path>
                                </svg>
                            </span>
                        </button>
                    </div>
                </div>
                ${blockIndex < (content.tools_technologies?.blocks || []).length - 1 ? `
                <div class="dir-arrow my-3">
                    <img src="https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/web-development-company/down-arrow.svg" class="img-fluid" alt="SEO Process Arrow">
                </div>
                ` : ''}
            </div>
            `
            }).join('')}
        </div>
    </section>
    <script>
    document.addEventListener("DOMContentLoaded", function () {
      // TAB SWITCHING (only one active at a time)
      document.querySelectorAll(".tab-box").forEach(tabBox => {
        const tabs = tabBox.querySelectorAll(".tab-list li");
        const contents = tabBox.querySelectorAll(".tab-content p");

        tabs.forEach(tab => {
          tab.addEventListener("click", () => {
            const target = tab.getAttribute("data-tab");

            // Reset all tabs + contents
            tabs.forEach(t => t.classList.remove("active"));
            contents.forEach(c => c.classList.remove("active"));

            // Activate clicked tab + target <p>
            tab.classList.add("active");
            const targetContent = tabBox.querySelector(\`.tab-content p[data-tab="\${target}"]\`);
            if (targetContent) {
              targetContent.classList.add("active");
            }
          });
        });
      });

      // READ MORE / LESS (only one open at a time)
      document.querySelectorAll(".read-more-btn").forEach(btn => {
        btn.addEventListener("click", function () {
          const content = this.previousElementSibling; // the .read-more-content

          if (content.classList.contains("open")) {
            // Close the current one
            content.style.maxHeight = null;
            content.classList.remove("open");
            this.classList.remove("less");
            this.firstChild.textContent = "Read More ";
          } else {
            // Close ALL first (so only one is open)
            document.querySelectorAll(".read-more-content").forEach(c => {
              c.style.maxHeight = null;
              c.classList.remove("open");
            });
            document.querySelectorAll(".read-more-btn").forEach(b => {
              b.classList.remove("less");
              if (b.firstChild) b.firstChild.textContent = "Read More ";
            });

            // Open the clicked one
            content.style.maxHeight = content.scrollHeight + "px";
            content.classList.add("open");
            this.classList.add("less");
            this.firstChild.textContent = "Read Less ";
          }
        });
      });
    });
    </script>
    
    <!-- Next Gen Technologies Section -->
    <section class="spb-100 cus-overflow-x">
        <div class="container">
            <h2 class="mb-5 text-white text-center" data-aos="fade-up">${escapeHtml(content.next_gen_tech?.heading || 'Next-Gen Technologies Shaping Ecommerce')}</h2>
            <p class="text-white text-center">${escapeHtml(content.next_gen_tech?.description || '')}</p>
                    <div class="row g-3">
                ${(content.next_gen_tech?.technologies || []).slice(0, 4).map((tech: any, i: number) => {
                    const bgClasses = ['head-bg-indigo', 'head-bg-coral-red', 'head-bg-soft-blue', 'head-bg-teal']
                    const techImages = [
                        'https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/scc/arfi.png',
                        'https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/scc/ar.png',
                        'https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/scc/vecom.png',
                        'https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/scc/blchain.png'
                    ]
                    return `
                <div class="col-md-6" data-aos="${animations[i]}">
                    <div class="card trusted-webdev-card shadow-lg">
                        <div class="card-header gap-3 head-bg-main ${bgClasses[i]} d-flex justify-content-start align-items-center py-4 px-3">
                            <div class="mb-0">
                                <img src="${techImages[i]}" class="img-fluid mb-0" alt="${escapeHtml(tech.title || '')}">
                            </div>
                            <div class="mb-0">
                                <h5 class="card-title fs-22 fw-700 mb-0">${escapeHtml(tech.title || '')}</h5>
                        </div>
                    </div>
                        <div class="card-body py-4 px-4">
                            <p class="card-text text-dark mb-0">${escapeHtml(tech.description || '')}</p>
                </div>
                    </div>
                </div>
                `
                }).join('')}
            </div>
        </div>
    </section>
    
    <!-- Industries Section -->
    <section class="explore-sec spb-70 cus-overflow-x">
        <div class="container">
            <div class="heading d-flex flex-column align-items-center" data-aos="fade-up">
                <h2 class="text-center text-white mb-5">${escapeHtml(content.industries?.heading || 'Industries That Trust Us')}</h2>
                <p class="text-white text-center">${escapeHtml(content.industries?.description || '')}</p>
            </div>
            <div class="content-slider position-relative mt-5" data-aos="fade-up">
                <div class="main-next-prev cus">
                    <div class="explore-swiper-button-prev"></div>
                    <div class="explore-swiper-button-next"></div>
                </div>
                <div class="swiper contentSwiper">
                <div class="swiper-wrapper">
                        ${(content.industries?.industries_list || []).slice(0, 5).map((industry: any, i: number) => {
                            const industryImages = [
                                'https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/scc/healthcare.png',
                                'https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/scc/media.png',
                                'https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/scc/startup.png',
                                'https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/scc/banking.png',
                                'https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/scc/ecomme.png'
                            ]
                            return `
                        <div class="swiper-slide">
                            <div class="card shadow rounded-4 p-3 h-100">
                                <a href="#"><img src="${industryImages[i]}" loading="lazy" class="card-img-top rounded-top-4" alt="${escapeHtml(industry.name || '')}"></a>
                                <div class="card-body p-0 mt-3 mb-2">
                                    <h4 class="card-title fw-bold fs-24">${escapeHtml(industry.name || '')}</h4>
                                    <p class="card-text mb-4 fs-18">${escapeHtml(industry.description || '')}</p>
                                </div>
                            </div>
                        </div>
                        `
                        }).join('')}
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Testimonials Section -->
    <section class="spb-100">
        <div class="container">
            <h2 class="mb-5 mt-3 text-center text-white" data-aos="fade-up">${escapeHtml(content.testimonials?.heading || 'Testimonials')}</h2>
            <div class="swiper bsd-testi-swiper" data-aos="fade-up">
                <div class="swiper-wrapper">
                    ${(content.testimonials?.testimonials_list || []).slice(0, 6).map((testimonial: any) => `
                    <div class="swiper-slide">
                        <div class="card shadow rounded-4 p-4 h-100">
                            <img src="https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/web-development-company/quotes.svg" class="w-11" alt="Quotes">
                            <div class="card-body p-0 mt-3 mb-2">
                                <p class="card-text mb-4 fs-18">${escapeHtml(testimonial.quote || '')}</p>
                                <p class="card-text mb-4 fs-18"><strong>${escapeHtml(testimonial.author || '')}</strong></p>
                            </div>
                        </div>
                    </div>
                `).join('')}
                </div>
            </div>
        </div>
    </section>
    
    <!-- Marketing Solutions Section -->
    <section class="explore-sec spb-70">
        <div class="container">
            <div class="heading d-flex flex-column align-items-center" data-aos="fade-up">
                <h2 class="text-center text-white mb-5" data-aos="fade-up">BrandStory's Ecommerce Marketing Solutions</h2>
                <p class="text-white text-center">Drive measurable growth and lasting customer engagement. Our ecommerce marketing solutions in Bangalore are built to amplify visibility, attract quality traffic, and increase conversions across every stage of your buyer's journey. From content to performance marketing, we help ecommerce brands grow smarter.</p>
            </div>
            <div class="content-slider position-relative mt-5" data-aos="fade-up">
                <div class="trending-main-next-prev">
                    <div class="trend-swiper-button-prev"></div>
                    <div class="trend-swiper-button-next"></div>
                </div>
                <div class="swiper trendingSwiper">
                    <div class="swiper-wrapper">
                        <div class="swiper-slide">
                            <div class="card shadow rounded-4 p-3 h-100">
                                <a href="https://brandstory.in/content-marketing/"><img src="https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/scc/contentw.png" loading="lazy" class="card-img-top rounded-top-4" alt="The Future of Web Development: Key Trends for 2025"></a>
                                <div class="card-body p-0 mt-3 mb-2">
                                    <h4 class="card-title fw-bold fs-24">Content Marketing</h4>
                                    <p class="card-text mb-4 fs-18">Simple. We create digital content. It's the element that helps us to be the company we are and our ever growing client list is proof of that. Brandstory is one of the leading content marketing communications companies in Bangalore, India provides…</p>
                                    <a href="https://brandstory.in/content-marketing/" class="txt-know fs-18" style="text-decoration: none;">Know more</a>
                                </div>
                            </div>
                        </div>
                        <div class="swiper-slide">
                            <div class="card shadow rounded-4 p-3 h-100">
                                <a href="https://brandstory.in/seo-company-bangalore/"><img src="https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/scc/seos.png" loading="lazy" class="card-img-top rounded-top-4" alt="Top 10 E-Commerce Platforms for Your Business in 2025"></a>
                                <div class="card-body p-0 mt-3 mb-2">
                                    <h4 class="card-title fw-bold fs-24">Search Engine Optimisation</h4>
                                    <p class="card-text mb-4 fs-18">Search Engine Optimization (SEO) program increases the overall visibility of your business across all search engine platforms. It provides opportunities for brands to create acquisitions (sales, leads, inquiries etc.), and help consumers to…</p>
                                    <a href="https://brandstory.in/seo-company-bangalore/" class="txt-know fs-18" style="text-decoration: none;">Know more</a>
                                </div>
                            </div>
                        </div>
                        <div class="swiper-slide">
                            <div class="card shadow rounded-4 p-3 h-100">
                                <a href="https://brandstory.in/pay-per-click-ppc-services-in-bangalore/"><img src="https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/scc/ppc.png" loading="lazy" class="card-img-top rounded-top-4" alt="Static vs. Dynamic Websites: Understanding the Key Differences in 2025 "></a>
                                <div class="card-body p-0 mt-3 mb-2">
                                    <h4 class="card-title fw-bold fs-24">Pay Per Click (PPC)</h4>
                                    <p class="card-text mb-4 fs-18">We increase your digital footprint with Pay Per Click campaigns or Google Adwords and Bing Adwords. A plan is sketched out and implemented accordingly, with this your campaign has begun. The plan includes specific important keywords…</p>
                                    <a href="https://brandstory.in/pay-per-click-ppc-services-in-bangalore/" class="txt-know fs-18" style="text-decoration: none;">Know more</a>
                                </div>
                            </div>
                        </div>
                        <div class="swiper-slide">
                            <div class="card shadow rounded-4 p-3 h-100">
                                <a href="https://brandstory.in/services/social-media-marketing-agency-bangalore/"><img src="https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/scc/smm.png" loading="lazy" class="card-img-top rounded-top-4" alt="Top 10 E-Commerce Platforms for Your Business in 2025"></a>
                                <div class="card-body p-0 mt-3 mb-2">
                                    <h4 class="card-title fw-bold fs-24">Social Media Marketing</h4>
                                    <p class="card-text mb-4 fs-18">We provide expertise in design implementation providing a full range of social media marketing services(SMM) bound in popular social media platforms, content generation, creative ideation and social branding techniques. Holding it all together…</p>
                                    <a href="https://brandstory.in/services/social-media-marketing-agency-bangalore/" class="txt-know fs-18" style="text-decoration: none;">Know more</a>
                                </div>
                            </div>
                        </div>
                        <div class="swiper-slide">
                            <div class="card shadow rounded-4 p-3 h-100">
                                <a href="https://brandstory.in/email-marketing-services-in-bangalore/"><img src="https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/scc/em.png" loading="lazy" class="card-img-top rounded-top-4" alt="Top 10 E-Commerce Platforms for Your Business in 2025"></a>
                                <div class="card-body p-0 mt-3 mb-2">
                                    <h4 class="card-title fw-bold fs-24">Email Marketing</h4>
                                    <p class="card-text mb-4 fs-18">Email Marketing It's not as easy as it may sound. It's not just composing an email draft, copying a list of contacts, and clicking the "send" button. Invariably, you will face struggles ranging from privacy issues, permission boundaries, technical glitches…</p>
                                    <a href="https://brandstory.in/email-marketing-services-in-bangalore/" class="txt-know fs-18" style="text-decoration: none;">Know more</a>
                                </div>
                            </div>
                        </div>
                        <div class="swiper-slide">
                            <div class="card shadow rounded-4 p-3 h-100">
                                <a href="https://brandstory.in/orm-company-bangalore-india/"><img src="https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/scc/orm.png" loading="lazy" class="card-img-top rounded-top-4" alt="Top 10 E-Commerce Platforms for Your Business in 2025"></a>
                                <div class="card-body p-0 mt-3 mb-2">
                                    <h4 class="card-title fw-bold fs-24">Online Reputation Management</h4>
                                    <p class="card-text mb-4 fs-18">Online reputation management includes managing your business and its brand value across every review and rating forum to every social media platform. It is ideally required for three major purposes adding to the growth of your business…</p>
                                    <a href="https://brandstory.in/orm-company-bangalore-india/" class="txt-know fs-18" style="text-decoration: none;">Know more</a>
                                </div>
                            </div>
                        </div>
                        <div class="swiper-slide">
                            <div class="card shadow rounded-4 p-3 h-100">
                                <a href="https://brandstory.in/analytics-and-reporting/"><img src="https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/scc/anr.png" loading="lazy" class="card-img-top rounded-top-4" alt="Top 10 E-Commerce Platforms for Your Business in 2025"></a>
                                <div class="card-body p-0 mt-3 mb-2">
                                    <h4 class="card-title fw-bold fs-24">Analytics and Reporting</h4>
                                    <p class="card-text mb-4 fs-18">Gripping content, catchy headlines, and constant updates will mean nothing if you can't see the returns on it. So after all the hard work is done, we send you a detailed report and statistics on how well you are doing on digital…</p>
                                    <a href="https://brandstory.in/analytics-and-reporting/" class="txt-know fs-18" style="text-decoration: none;">Know more</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="extra-cta text-center mt-4">
                <a href="https://brandstory.in/contact-us/" class="btn btn-outline-light rounded-pill px-4 py-2">
                    Talk to an Expert Now →
                </a>
            </div>
        </div>
    </section>
    
    <!-- FAQs Section -->
    <section class="spb-100">
        <div class="container">
            <h2 class="text-center text-white mb-5" data-aos="fade-up">${escapeHtml(content.faqs?.heading || "FAQ's")}</h2>
            <div class="row g-4 d-flex align-items-center">
                <div class="col-md-12">
                    <div class="accordion custom-accordion faq-cus-acc" id="faqAccordion">
                        ${(content.faqs?.faqs_list || []).slice(0, 11).map((faq: any, i: number) => `
                        <div class="accordion-item" data-aos="fade-up">
                            <h2 class="accordion-header" id="heading${String(i + 1).padStart(2, '0')}">
                                <button class="accordion-button ${i === 0 ? 'show' : 'collapsed'} fs-24 fw-700" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${String(i + 1).padStart(2, '0')}" aria-expanded="${i === 0 ? 'true' : 'false'}" aria-controls="collapse${String(i + 1).padStart(2, '0')}">
                                    ${escapeHtml(faq.question || '')}
                                </button>
                            </h2>
                            <div id="collapse${String(i + 1).padStart(2, '0')}" class="accordion-collapse collapse ${i === 0 ? 'show' : ''}" aria-labelledby="heading${String(i + 1).padStart(2, '0')}" data-bs-parent="#faqAccordion">
                                <div class="accordion-body">
                                    ${Array.isArray(faq.answer) ? `
                                    <ul class="text-white">
                                        ${faq.answer.map((item: string) => `<li>${escapeHtml(item)}</li>`).join('')}
                                    </ul>
                                    ` : `<p>${escapeHtml(faq.answer || '')}</p>`}
                                </div>
                            </div>
                        </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    
    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
    <script src="https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/js/swiper-bundle.min.js"></script>
    <script src="https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/js/jquery.min.js"></script>
    <script src="https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/js/site.js"></script>
    <script src="https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/js/aos.js"></script>
    <script src="https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/js/menu.js"></script>
    <script src="https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/js/counter.js"></script>
    
    <!-- Initialize AOS -->
    <script>
        AOS.init({
            duration: 1000,
            once: true
        });
    </script>
</body>
</html>`
}

export async function POST(request: NextRequest) {
  try {
    const { userInput } = await request.json()

    if (!userInput || !userInput.trim()) {
      return NextResponse.json(
        { error: 'User input is required' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      )
    }

    // Create the prompt for content generation for template3
    const prompt = `Generate complete content structure for a landing page. User input: "${userInput}"

This is a general landing page template. Generate content based on the user's input topic - it can be about any service, product, or business. Adapt all content sections to match the user's specific topic and industry.

CRITICAL: Generate ALL 17 sections. Every single section is MANDATORY and must be included in your JSON response. Do NOT skip any section. Do NOT use placeholders. Do NOT leave sections empty.

REQUIRED SECTIONS (ALL MUST BE GENERATED):
1. Banner (title, subtitle, cta_text, cta_link) - MANDATORY
2. Intro (paragraph_1, paragraph_2, paragraph_3) - MANDATORY
3. Trusted brands (heading, description) - MANDATORY
4. Reviewed experts (heading) - MANDATORY
5. Track record (heading, 4 stats with number, title and description - title must be 3-5 words, description must be 5-8 words) - MANDATORY
6. Key benefits (heading, 6 benefits with title, description) - MANDATORY
7. Services (heading, description, 12 services with title, description) - MANDATORY
8. Accordion (heading, description, 5 items with title and description) - MANDATORY
9. Why choose (heading, description_1, description_2, paragraph, subheading, points array, cta_text, cta_link) - MANDATORY
10. Platforms (heading, description, platforms_list with name, image, description) - MANDATORY - Generate at least 7 platforms
11. Success stories (heading, 3 stories with description and title) - MANDATORY
12. Tools & Technologies (heading, description, blocks array with title, description, tabs array, use_case) - MANDATORY - Generate at least 8-10 blocks
13. Next-gen technologies (heading, description, technologies array with title, icon, description) - MANDATORY
14. Industries (heading, description, industries_list with name, image, description) - MANDATORY - Generate at least 5 industries
15. Testimonials (heading, testimonials_list with quote and author) - MANDATORY - Generate at least 6 testimonials
16. Marketing solutions (heading, description, solutions array with title, image, description, cta_text, cta_link) - MANDATORY - Generate at least 7 solutions
17. FAQs (heading, faqs_list with question and answer - answer can be string or array of strings for lists) - MANDATORY - Generate at least 10-15 FAQs

IMPORTANT: 
- Generate ALL 18 sections - EVERY section is required, no exceptions
- Write detailed, comprehensive descriptions (3-4 sentences, 60-100 words minimum)
- Make content rich and informative - not just one line
- Services, benefits, tools, FAQs should have substantial descriptions
- Track Record stats: title (heading inside circle) must be 3-5 words, description must be 5-8 words
- Return ONLY valid JSON, no markdown, no code blocks

{
  "page_title": "SEO-optimized page title (60 characters max)",
  "banner": {
    "title": "Compelling main headline for the banner section (H1, 50-60 characters)",
    "subtitle": "Supporting subtitle text (1-2 sentences)",
    "cta_text": "Call-to-action button text",
    "cta_link": "https://brandstory.in/contact-us/"
  },
  "intro": {
    "paragraph_1": "Generate first paragraph (3-4 sentences, 80-120 words) based on user input",
    "paragraph_2": "Generate second paragraph (3-4 sentences, 80-120 words) based on user input",
    "paragraph_3": "Generate third paragraph (3-4 sentences, 80-120 words) based on user input"
  },
  "trusted_brands": {
    "heading": "Generate heading based on user input",
    "description": "Generate description (3-4 sentences, 80-120 words) based on user input"
  },
  "reviewed_experts": {
    "heading": "Rated & Reviewed on Trusted Platforms"
  },
  "track_record": {
    "heading": "Generate heading based on user input",
    "stats": [
      {
        "number": "Generate stat number (e.g., '12+', '500+', '98%')",
        "title": "Generate title (3-5 words)",
        "description": "Generate description (5-8 words)"
      }
    ]
  },
  "key_benefits": {
    "heading": "Generate heading based on user input",
    "benefits": [
      {
        "title": "Generate benefit title based on user input",
        "description": "Generate benefit description (3-4 sentences, 60-100 words) based on user input"
      }
    ]
  },
  "services": {
    "heading": "Generate heading based on user input",
    "description": "Generate description (3-4 sentences, 80-120 words) based on user input",
    "services_list": [
      {
        "title": "Generate service title based on user input",
        "description": "Generate service description (3-4 sentences, 60-100 words) based on user input"
      }
    ]
  },
  "accordion": {
    "heading": "Generate heading based on user input",
    "description": "Generate description (2-3 sentences, 40-60 words) based on user input",
    "items": [
      {
        "title": "Generate accordion item title based on user input",
        "description": "Generate accordion item description (3-4 sentences, 60-100 words) based on user input"
      }
    ]
  },
  "why_choose": {
    "heading": "Generate heading based on user input",
    "description_1": "Generate first description paragraph (3-4 sentences, 80-120 words) based on user input",
    "description_2": "Generate second description paragraph (3-4 sentences, 80-120 words) based on user input",
    "paragraph": "Generate paragraph (2-3 sentences, 40-60 words) based on user input",
    "subheading": "Generate subheading based on user input",
    "points": [
      "Generate point 1 (2-3 sentences, 40-60 words) based on user input",
      "Generate point 2 (2-3 sentences, 40-60 words) based on user input"
    ],
    "cta_text": "Generate CTA text based on user input",
    "cta_link": "https://brandstory.in/contact-us/"
  },
  "platforms": {
    "heading": "Generate heading based on user input",
    "description": "Generate description (2-3 sentences, 40-60 words) based on user input",
    "platforms_list": [
      {
        "name": "Generate platform name based on user input",
        "image": "https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/scc/magneto.png",
        "description": "Generate platform description (3-4 sentences, 60-100 words) based on user input"
      }
    ]
  },
  "success_stories": {
    "heading": "Generate heading based on user input",
    "stories": [
      {
        "description": "Generate success story description (3-4 sentences, 60-100 words) with specific results and metrics based on user input. Include real numbers, percentages, and measurable outcomes.",
        "title": "Generate success story title with REALISTIC company/industry name and achievement (e.g., 'Fashion Retailer | 80% Faster Checkout', 'D2C Skincare Brand | 3X Revenue Growth', 'Electronics Marketplace | 99.9% Uptime'). Use realistic business names like 'Fashion Retailer', 'D2C Skincare Brand', 'Electronics Marketplace', 'Healthcare Platform', 'Food & Beverage Company', etc. - NOT dummy names like 'abc', 'xyz', 'def', 'Company A', 'Client 1'"
      }
    ]
  },
  "tools_technologies": {
    "heading": "Generate heading based on user input",
    "description": "Generate description (3-4 sentences, 100-150 words) based on user input. Explain what tools and technologies are used, their importance, and how they benefit the business.",
    "blocks": [
      {
        "title": "Generate block title based on user input (e.g., 'Frontend Technologies (What the user sees)', 'Backend Technologies (What happens behind the scenes)')",
        "description": "Generate block description (2-3 sentences, 40-60 words) based on user input. Explain what this category of technologies is and why it matters.",
        "tabs": [
          {
            "name": "Generate specific technology/tool name based on user input (e.g., 'HTML5 & CSS3', 'JavaScript', 'React.js / Angular / Vue.js')",
            "description": "Generate detailed tab description (2-3 sentences, 40-60 words) explaining what this technology is, how it's used, and what benefits it provides. Be specific and technical."
          },
          {
            "name": "Generate another specific technology name based on user input",
            "description": "Generate detailed tab description (2-3 sentences, 40-60 words) explaining what this technology is, how it's used, and what benefits it provides."
          },
          {
            "name": "Generate another specific technology name based on user input",
            "description": "Generate detailed tab description (2-3 sentences, 40-60 words) explaining what this technology is, how it's used, and what benefits it provides."
          }
        ],
        "use_case": "Generate use case description (1-2 sentences, 30-50 words) based on user input. Explain a real-world scenario where these technologies are used."
      }
    ]
  },
  "next_gen_tech": {
    "heading": "Generate heading based on user input",
    "description": "Generate description (3-4 sentences, 80-120 words) based on user input",
    "technologies": [
      {
        "title": "Generate technology title based on user input",
        "icon": "https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/scc/arfi.png",
        "description": "Generate technology description (3-4 sentences, 60-100 words) based on user input"
      }
    ]
  },
  "industries": {
    "heading": "Generate heading based on user input",
    "description": "Generate description (2-3 sentences, 40-60 words) based on user input",
    "industries_list": [
      {
        "name": "Generate industry name based on user input",
        "image": "https://brandstory.in/services/ecommerce-website-development-company-bangalore/assets/images/scc/healthcare.png",
        "description": "Generate industry description (2-3 sentences, 40-60 words) based on user input"
      }
    ]
  },
  "testimonials": {
    "heading": "Testimonials",
    "testimonials_list": [
      {
        "quote": "Generate testimonial quote (3-4 sentences, 60-100 words) related to user input topic",
        "author": "Generate author name with title and company (e.g., 'Priya Menon, Retail Industry')"
      }
    ]
  },
  "faqs": {
    "heading": "FAQ's",
    "faqs_list": [
      {
        "question": "Generate realistic FAQ question based on user input",
        "answer": "Generate detailed FAQ answer (3-4 sentences, 60-100 words) based on user input. Can be a string or array of strings for lists."
      }
    ]
  }
}

CRITICAL REQUIREMENTS:
- Generate ALL content sections based on user input: "${userInput}"
- Fill EVERY field with real, specific content - NO placeholders like "Service 1 Title"
- Generate minimum items: 12 services, 11 FAQs, 6 key benefits, 4 track record stats, 6 testimonials, 5 industries, 5 accordion items, 7 platforms, 3 success stories, 10 tools_technologies blocks (each block must have at least 3 tabs with detailed descriptions), 4 next_gen_tech items
- NOTE: marketing_solutions section is hardcoded and should NOT be generated - it will be automatically included in the HTML
- For success_stories: Use REALISTIC business/industry names like "Fashion Retailer", "D2C Skincare Brand", "Electronics Marketplace", "Healthcare Platform", "Food & Beverage Company", "Automotive Parts Supplier", etc. NEVER use dummy names like "abc", "xyz", "def", "Company A", "Client 1", "Test Company", etc.
- For tools_technologies: Each block must have detailed tabs (minimum 3 per block) with specific technology names and comprehensive descriptions explaining what each technology does and how it's used
- DO NOT generate final_cta section - it is not in the preview template
- All content must be specific to the user's input topic
- Use SEO keywords naturally throughout
- Write in professional, conversion-focused tone
- Descriptions should be 3-4 sentences (60-100 words minimum) - make content rich and detailed
- Return ONLY valid JSON, no markdown, no code blocks
- Generate complete content - do not leave any section empty`

    // Call OpenAI API
    const models = [
      { name: 'gpt-4o', maxTokens: 16384 },
      { name: 'gpt-4-turbo', maxTokens: 8192 },
      { name: 'gpt-3.5-turbo', maxTokens: 8192 },
    ]

    let completion
    let lastError: any = null
    let responseContent = ''

    for (const modelConfig of models) {
      try {
        console.log(`Trying model: ${modelConfig.name} with max_tokens: ${modelConfig.maxTokens}`)
        completion = await openai.chat.completions.create({
          model: modelConfig.name,
          messages: [
            {
              role: 'system',
              content: 'You are an expert content writer specializing in creating comprehensive, SEO-optimized landing page content. Generate complete, detailed content structures in valid JSON format only.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: modelConfig.maxTokens,
          temperature: 0.7,
        })

        responseContent = completion.choices[0]?.message?.content || ''
        if (responseContent) {
        console.log(`✓ Successfully used model: ${modelConfig.name}`)
        break
        }
      } catch (error: any) {
        console.error(`Error with model ${modelConfig.name}:`, error.message)
        lastError = error
        continue
      }
    }

    if (!responseContent && lastError) {
      throw new Error(`All models failed. Last error: ${lastError.message || 'Unknown error'}. Please check your API key and model access.`)
    }

    // Parse JSON from response
    let contentData
    try {
      const jsonMatch = responseContent.match(/```json\n([\s\S]*?)\n```/) || responseContent.match(/```\n([\s\S]*?)\n```/)
      let jsonString = jsonMatch ? jsonMatch[1] : responseContent
        contentData = JSON.parse(jsonString)
    } catch (parseError: any) {
      console.error('JSON Parse Error:', parseError)
      throw new Error(`Failed to parse content from API response: ${parseError.message}. Please try again.`)
    }

    // Validate that we have all required content sections for template3
    const requiredSections = [
      'banner', 'intro', 'trusted_brands', 'reviewed_experts', 'track_record', 
      'key_benefits', 'services', 'accordion', 'why_choose', 'platforms', 
      'success_stories', 'tools_technologies', 'next_gen_tech', 'industries', 
      'testimonials', 'faqs'
    ]
    
    const missingSections = requiredSections.filter(section => {
      if (section === 'faqs') return !contentData.faqs?.faqs_list || contentData.faqs.faqs_list.length === 0
      if (section === 'testimonials') return !contentData.testimonials?.testimonials_list || contentData.testimonials.testimonials_list.length === 0
      if (section === 'services') return !contentData.services?.services_list || contentData.services.services_list.length === 0
      if (section === 'key_benefits') return !contentData.key_benefits?.benefits || contentData.key_benefits.benefits.length === 0
      if (section === 'accordion') return !contentData.accordion?.items || contentData.accordion.items.length === 0
      if (section === 'platforms') return !contentData.platforms?.platforms_list || contentData.platforms.platforms_list.length === 0
      if (section === 'success_stories') return !contentData.success_stories?.stories || contentData.success_stories.stories.length === 0
      if (section === 'tools_technologies') return !contentData.tools_technologies?.blocks || contentData.tools_technologies.blocks.length === 0
      if (section === 'next_gen_tech') return !contentData.next_gen_tech?.technologies || contentData.next_gen_tech.technologies.length === 0
      if (section === 'industries') return !contentData.industries?.industries_list || contentData.industries.industries_list.length === 0
      return !contentData[section]
    })
    
    if (missingSections.length > 0) {
      console.warn(`Warning: Missing sections: ${missingSections.join(', ')}`)
    }

    // Generate HTML
    const htmlContent = generateHTMLPage(contentData)

    // Create ZIP file with HTML and assets
    const archive = archiver('zip', { zlib: { level: 9 } })
    const chunks: Buffer[] = []

    archive.on('data', (chunk: Buffer) => {
      chunks.push(chunk)
    })

    // Add HTML file
    archive.append(htmlContent, { name: 'index.html' })

    // Add assets directory
    const assetsPath = join(process.cwd(), 'public', 'assets')
    addDirectoryToZip(archive, assetsPath, 'assets')

    // Finalize the archive and wait for completion
    await new Promise<void>((resolve, reject) => {
      archive.on('end', () => resolve())
      archive.on('error', (err) => reject(err))
      archive.finalize()
    })

    const zipBuffer = Buffer.concat(chunks)

    // Return ZIP file
    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="generated-template3-${Date.now()}.zip"`,
      },
    })
  } catch (error: any) {
    console.error('Generation error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate content',
        message: error.message || 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}

