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

// Generate complete HTML page with all sections
function generateHTMLPage(content: any): string {
  const animations = ['fade-left', 'fade-up', 'fade-right', 'fade-left', 'fade-down', 'fade-right']
  const benefitAnimations = ['fade-left', 'fade-right', 'fade-left', 'fade-right']
  const industryDurations = [1000, 1000, 1000, 1500, 1500, 1500, 2000, 2000, 2000]
  const durations = [1000, 1200, 1400, 1600, 1800]

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(content.page_title || 'Generated Page')}</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Text&family=Hanken+Grotesk&family=Roboto&display=swap" rel="stylesheet">

    <!-- CSS -->
    <link href="assets/css/menu.css" rel="stylesheet">
    <link href="assets/css/bootstrap.min.css" rel="stylesheet">
    <link href="assets/css/global.css" rel="stylesheet">
    <link href="assets/css/style.css" rel="stylesheet">
    <link href="assets/css/swiper.css" rel="stylesheet">
    <link href="assets/css/aos.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">
</head>
<body>
    <!-- Banner Section -->
    <section class="home-banner bg-black mt-100">
        <div class="container-fluid p-0">
            <div class="bnr-slide01 bg-bnr h-600 d-flex align-items-center">
                <div class="container">
                    <div class="row">
                        <div class="col-md-8 text-white">
                            <h1 class="mb-4" data-aos="fade-up" data-aos-duration="1000">${escapeHtml(content.banner?.title || '')}</h1>
                            <div class="smm-uae-btn w-fit" data-aos="fade-up" data-aos-duration="1400">
                                <a href="${escapeHtml(content.banner?.cta_link || '#')}" class="fs-22 cnt-btn fw-700 text-white d-flex align-items-center gap-2">${escapeHtml(content.banner?.cta_text || '')}</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Intro Section (AI Search) -->
    <section class="ai-search bg-bnr sp-100">
        <div class="container">
            <div class="row">
                <div class="col-lg-12">
                    <p class="text-white text-center" data-aos="fade-up" data-aos-duration="1000">${escapeHtml(content.intro?.paragraph_1 || '')}</p>
                    <p class="text-white text-center mb-0" data-aos="fade-up" data-aos-duration="1300">${escapeHtml(content.intro?.paragraph_2 || '')}</p>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Trusted Brands Section -->
    <section class="sp-70">
        <div class="container">
            <div class="row">
                <div class="col-lg-6 col-md-12">
                    <img src="${escapeHtml(content.trusted_brands?.image || 'assets/images/geo-location/robotic.png')}" class="img-fluid mb-4" alt="" data-aos="fade-up" data-aos-duration="1500">
                    <h2 class="text-white mb-4" data-aos="fade-up" data-aos-duration="1600">${escapeHtml(content.trusted_brands?.heading || '')}</h2>
                    <p class="text-white mb-4 mb-md-4 mb-lg-0" data-aos="fade-up" data-aos-duration="1700">${escapeHtml(content.trusted_brands?.description || '')}</p>
                </div>
                <div class="col-md-12 col-lg-3">
                    <div class="swiper clients-swiper" data-aos="fade-up" data-aos-duration="1000">
                        <div class="swiper-wrapper">
                            ${Array.from({ length: 10 }, (_, i) => `
                            <div class="swiper-slide">
                                <img src="assets/images/cilent-logos/client-logo-${i + 1}.svg" class="img-fluid active" alt="">
                            </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                <div class="col-md-12 col-lg-3">
                    <div class="swiper clients-swiper02 pt-5" data-aos="fade-up" data-aos-duration="1000">
                        <div class="swiper-wrapper">
                            ${Array.from({ length: 11 }, (_, i) => `
                            <div class="swiper-slide">
                                <img src="assets/images/cilent-logos/client-logo-${i + 11}.svg" class="img-fluid active" alt="">
                            </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Reviewed by Verified Experts Section -->
    <section class="meet-bsd spb-100 cus-overflow-x">
        <div class="container">
            <div class="row">
                <div class="col-12">
                    <h2 class="text-white text-center mb-5" data-aos="fade-up">${escapeHtml(content.reviewed_experts?.heading || 'Reviewed by Verified Experts')}</h2>
                    <div class="d-flex flex-wrap justify-content-center text-center">
                        ${(content.reviewed_experts?.reviews || []).map((review: any) => `
                        <div class="p-2 custom-col">
                            <div class="review-card ${escapeHtml(review.class || '')}" data-aos="fade-up">
                                <img src="${escapeHtml(review.image || '')}" class="img-fluid cus-w-100" alt="${escapeHtml(review.alt || '')}">
                            </div>
                        </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Track Record Section -->
    <section class="track-record-section bg-bnr sp-100">
        <div class="container">
            <h2 class="text-center mb-5 text-white fw-bold" data-aos="fade-up">${escapeHtml(content.track_record?.heading || 'Our Track Record')}</h2>
            <div class="row g-4">
                ${(content.track_record?.stats || []).map((stat: any, index: number) => `
                <div class="col-md-3" data-aos="fade-up">
                    <div class="custom-card ${index === 0 ? 'first-card' : ''} text-center px-4">
                        <h5>${escapeHtml(stat.title || '')}</h5>
                        <p>${escapeHtml(stat.description || '')}</p>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>
    
    <!-- Key Benefits Section -->
    <section class="key-benefits bg-bnr sp-100 cus-overflow-x">
        <div class="container">
            <div class="row">
                <div class="col-lg-12">
                    <h2 class="text-white text-center mb-5" data-aos="fade-up">${escapeHtml(content.key_benefits?.heading || 'Key Benefits of Our Services')}</h2>
                    <div class="row g-3">
                        ${(content.key_benefits?.benefits || []).map((benefit: any, index: number) => `
                        <div class="col-md-4">
                            <div class="feature-card" data-aos="${animations[index % animations.length]}">
                                <span class="circle-feature-box"></span>
                                <img src="${escapeHtml(benefit.icon || '')}" class="img-fluid mb-4" alt="">
                                <h3 class="text-white mb-3">${escapeHtml(benefit.title || '')}</h3>
                                <p class="text-white fs-18 mb-0">${escapeHtml(benefit.description || '')}</p>
                            </div>
                        </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Services Section (Generative Engine) -->
    <section class="sp-100 gen-engine-main">
        <div class="container">
            <div class="row">
                <div class="col-md-6" data-aos="fade-up">
                    <div class="gen-engine">
                        <h2 class="text-white mb-4">${escapeHtml(content.services?.heading || 'Our Services')}</h2>
                        <p class="text-white fs-18 mb-5 mb-md-0">${escapeHtml(content.services?.description || '')}</p>
                    </div>
                </div>
                <div class="col-md-6">
                    ${(content.services?.services_list || []).map((service: any) => `
                    <div class="gen-en-card text-center px-4 mb-3" data-aos="fade-up">
                        <h4 class="card-title text-start fw-bold fs-24 text-white mb-3">${escapeHtml(service.title || '')}</h4>
                        <p class="card-text text-start text-white fs-18 mb-0">${escapeHtml(service.description || '')}</p>
                    </div>
                    `).join('')}
                </div>
            </div>
        </div>
    </section>
    
    <!-- Process Section (5-Stage Process) -->
    <section class="spb-70">
        <div class="container">
            <h2 class="text-white mb-4 text-center" data-aos="fade-up">${escapeHtml(content.process?.heading || 'Our Process')}</h2>
            <p class="text-white fs-18 text-center mb-5" data-aos="fade-up">${escapeHtml(content.process?.description || '')}</p>
            <div class="ai-first p-0" data-aos="fade-up">
                <div class="row">
                    <div class="col-md-4 d-flex">
                        <img src="${escapeHtml(content.process?.process_image || 'assets/images/geo-location/ai-robot.png')}" class="w-cus-50 w-100 mb-0" alt="">
                    </div>
                    <div class="col-md-8 py-4">
                        ${(content.process?.steps || []).map((step: any) => `
                        <div class="process-sec mb-3 me-4 cus-dott" data-aos="fade-up">
                            <div class="row align-items-center inner-p-sec text-white p-2 mb-3">
                                <div class="col-auto">
                                    <span class="p-2 fs-58">${escapeHtml(step.number || '')}</span>
                                </div>
                                <div class="col">
                                    <h5 class="fw-bold mb-1 fs-24">${escapeHtml(step.title || '')}</h5>
                                    <p class="fs-18 mb-2 fw-700">${escapeHtml(step.subtitle || '')}</p>
                                    <p class="mb-0 fs-16">${escapeHtml(step.description || '')}</p>
                                </div>
                            </div>
                        </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Why Partner Section -->
    <section class="spb-100 spt-70">
        <div class="container">
            <div class="why-prt-card" data-aos="fade-up">
                <div class="row">
                    <div class="col-md-8 why-p-card px-5 py-4">
                        <h2 class="text-white mb-3">${escapeHtml(content.why_partner?.heading || 'Why Partner with Us')}</h2>
                        <p class="text-white fs-18 mb-2">${escapeHtml(content.why_partner?.description || '')}</p>
                    </div>
                    <div class="col-md-4 d-flex">
                        <img src="${escapeHtml(content.why_partner?.image || 'assets/images/geo-location/human-robot.png')}" class="img-fluid w-100 hum-robot mb-0" alt="">
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Why Essential Section -->
    <section class="spb-100">
        <div class="container">
            <h2 class="text-white text-center mb-3" data-aos="fade-up">${escapeHtml(content.why_essential?.heading || 'Why This Is Essential')}${content.why_essential?.heading_span ? ` <span class="db">${escapeHtml(content.why_essential.heading_span)}</span>` : ''}</h2>
            <p class="text-white text-center fs-18 mb-5" data-aos="fade-up">${escapeHtml(content.why_essential?.description || '')}</p>
            <div class="row d-flex align-items-center">
                <div class="col-md-6">
                    <img src="${escapeHtml(content.why_essential?.image || 'assets/images/geo-location/laptop.png')}" class="img-fluid mb-4 mb-md-0" alt="" data-aos="fade-up" data-aos-duration="1600">
                </div>
                <div class="col-md-6">
                    <ul class="text-white fs-18">
                        ${(content.why_essential?.points || []).map((point: string, index: number) => `
                        <li class="mb-3" data-aos="fade-up" data-aos-duration="${durations[index % durations.length]}">${escapeHtml(point)}</li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Benefits of Working Section -->
    <section class="sp-100 bg-bnr benefits-work">
        <div class="container">
            <div class="row mb-4">
                <div class="col-md-5">
                    <h2 class="text-white mb-0" data-aos="fade-up">${escapeHtml(content.benefits_working?.heading || 'Benefits of Working With Our Experts')}</h2>
                </div>
                <div class="col-md-7">
                    <p class="text-white fs-18 mb-0 mt-2" data-aos="fade-up">${escapeHtml(content.benefits_working?.description || '')}</p>
                </div>
            </div>
            <div class="row">
                <div class="col-md-5"></div>
                <div class="col-md-7">
                    <div class="row g-3">
                        ${(content.benefits_working?.benefits || []).map((benefit: any, index: number) => `
                        <div class="col-md-6">
                            <div class="feature-card p-3 border-benefits" data-aos="${benefitAnimations[index % benefitAnimations.length]}">
                                <img src="${escapeHtml(benefit.icon || '')}" class="img-fluid mb-4" alt="">
                                <h3 class="text-white mb-3">${escapeHtml(benefit.title || '')}</h3>
                                <p class="text-white fs-18 mb-0">${escapeHtml(benefit.description || '')}</p>
                            </div>
                        </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Testimonials Section -->
    <section class="spt-70 spb-100">
        <div class="container">
            <h2 class="mb-5 text-center text-white" data-aos="fade-up">${escapeHtml(content.testimonials?.heading || 'Testimonials')}</h2>
            <div class="swiper bsd-testi-swiper" data-aos="fade-up">
                <div class="swiper-wrapper">
                    ${(content.testimonials?.testimonials_list || []).map((testimonial: any) => `
                    <div class="swiper-slide">
                        <div class="card shadow bg-aa rounded-4 p-4 h-100">
                            <img src="assets/images/web-development-company/quotes.svg" class="w-11" alt="UX Animation">
                            <div class="card-body p-0 mt-3 mb-2">
                                <p class="card-text mb-4 fs-18 text-white">${escapeHtml(testimonial.quote || '')}</p>
                                <p class="card-text mb-0 fs-18 text-white fw-700">${escapeHtml(testimonial.author || '')}</p>
                            </div>
                        </div>
                    </div>
                    `).join('')}
                </div>
            </div>
        </div>
    </section>
    
    <!-- Industries Section -->
    <section class="spb-100">
        <div class="container">
            <h2 class="text-white text-center mb-3" data-aos="fade-up">${escapeHtml(content.industries?.heading || 'Industries We Help Succeed')}</h2>
            <p class="text-white text-center fs-18 mb-5" data-aos="fade-up">${escapeHtml(content.industries?.description || '')}${content.industries?.description_span ? ` <span class="db">${escapeHtml(content.industries.description_span)}</span>` : ''}</p>
            <div class="row g-4">
                ${(content.industries?.industries_list || []).map((industry: string, index: number) => `
                <div class="col-md-4">
                    <div class="feature-card" data-aos="fade-up" data-aos-duration="${industryDurations[index % industryDurations.length]}">
                        <h4 class="fs-20 text-center text-white mb-0">${escapeHtml(industry)}</h4>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>
    
    <!-- AI Tools & Technologies Section -->
    <section class="explore-sec ai-tools bg-bnr spt-100 spb-70 cus-overflow-x">
        <div class="container">
            <div class="heading d-flex flex-column align-items-center px-md-5 px-2 mx-md-5 mx-0" data-aos="fade-up">
                <h2 class="text-center text-white mb-4">${escapeHtml(content.ai_tools?.heading || 'AI Tools & Technologies')}</h2>
                <p class="text-white text-center fs-18 mb-5">${escapeHtml(content.ai_tools?.description || '')}</p>
            </div>
            <div class="content-slider position-relative mt-5" data-aos="fade-up">
                <div class="main-next-prev cus">
                    <div class="explore-swiper-button-prev"></div>
                    <div class="explore-swiper-button-next"></div>
                </div>
                <div class="swiper contentSwiper">
                    <div class="swiper-wrapper">
                        ${(content.ai_tools?.tools || []).map((tool: any) => `
                        <div class="swiper-slide">
                            <div class="card bg-aa shadow rounded-4 p-3 h-100">
                                <div class="card-body p-0 mb-2">
                                    <h4 class="card-title fw-bold fs-24 text-white">${escapeHtml(tool.title || '')}</h4>
                                    <p class="card-text mb-4 fs-18 text-white">${escapeHtml(tool.description || '')}</p>
                                </div>
                            </div>
                        </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- FAQ Section -->
    <section class="sp-100">
        <div class="container">
            <h2 class="text-center text-white mb-5" data-aos="fade-up">${escapeHtml(content.faqs?.heading || "FAQ's")}</h2>
            <div class="row g-4 d-flex align-items-center">
                <div class="col-md-12">
                    <div class="accordion custom-accordion faq-cus-acc" id="faqAccordion">
                        ${(content.faqs?.faqs_list || []).map((faq: any, index: number) => {
                          const faqNum = String(index + 1).padStart(2, '0')
                          const isExpanded = faq.expanded === true
                          return `
                        <div class="accordion-item" data-aos="fade-up">
                            <h2 class="accordion-header" id="heading${faqNum}">
                                <button class="accordion-button ${isExpanded ? 'show' : 'collapsed'} fs-24 fw-700" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${faqNum}" aria-expanded="${isExpanded ? 'true' : 'false'}" aria-controls="collapse${faqNum}">
                                    ${escapeHtml(faq.question || '')}
                                </button>
                            </h2>
                            <div id="collapse${faqNum}" class="accordion-collapse collapse ${isExpanded ? 'show' : ''}" aria-labelledby="heading${faqNum}" data-bs-parent="#faqAccordion">
                                <div class="accordion-body">
                                    <p>${escapeHtml(faq.answer || '')}</p>
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
    
    <!-- Final CTA Section -->
    <section class="spb-100">
        <div class="container">
            <div class="card bg-aa shadow rounded-4 h-100 sp-70 px-5" data-aos="fade-up">
                <div class="card-body p-0 mt-3 mb-2 text-center">
                    <h2 class="text-center text-white mb-4" data-aos="fade-up" data-aos-duration="1000">${escapeHtml(content.final_cta?.heading || 'Let Your Brand Be Part of the Conversation')}</h2>
                    <p class="text-white text-center fs-18 mb-5" data-aos="fade-up" data-aos-duration="1500">${escapeHtml(content.final_cta?.description || '')}${content.final_cta?.description_span ? ` <span class="db">${escapeHtml(content.final_cta.description_span)}</span>` : ''}</p>
                    <div class="smm-uae-btn w-fit">
                        <a href="${escapeHtml(content.final_cta?.cta_link || '#')}" class="fs-22 cnt-btn fw-700 text-white d-flex align-items-center gap-2 w-100" data-aos-duration="2000">${escapeHtml(content.final_cta?.cta_text || 'Book Your Free Consultation Now!')}</a>
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="assets/js/swiper-bundle.min.js"></script>
    <script src="assets/js/jquery.min.js"></script>
    <script src="assets/js/site.js"></script>
    <script src="assets/js/aos.js"></script>
    <script src="assets/js/menu.js"></script>
    <script src="assets/js/counter.js"></script>
    
    <script>
        AOS.init({
            duration: 1000,
            once: true
        });
        
        // Initialize Swipers
        if (typeof Swiper !== 'undefined') {
            // Function to get direction based on screen width
            function getSwiperDirection() {
                return window.innerWidth <= 1099 ? 'horizontal' : 'vertical';
            }
            
            // Clients Swiper 1 - moves UP (reverse direction)
            const clientsSwiper = new Swiper('.clients-swiper', {
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
                        spaceBetween: 20,
                    },
                    1024: {
                        slidesPerView: 4,
                        spaceBetween: 20,
                    }
                }
            });
            
            // Re-initialize direction on resize
            window.addEventListener('resize', () => {
                const newDirection = getSwiperDirection();
                if (clientsSwiper.params.direction !== newDirection) {
                    clientsSwiper.changeDirection(newDirection);
                }
            });
            
            // Function to get direction for swiper 2
            function getSwiper02Direction() {
                return window.innerWidth <= 1099 ? 'horizontal' : 'vertical';
            }
            
            // Clients Swiper 2 - moves DOWN (normal direction)
            const clientsSwiper02 = new Swiper('.clients-swiper02', {
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
                        spaceBetween: 20,
                    },
                    1024: {
                        slidesPerView: 4,
                        spaceBetween: 20,
                    }
                }
            });
            
            // Re-initialize direction on resize
            window.addEventListener('resize', () => {
                const newDirection = getSwiper02Direction();
                if (clientsSwiper02.params.direction !== newDirection) {
                    clientsSwiper02.changeDirection(newDirection);
                }
            });
            
            // Testimonials Swiper
            const testimonialsSwiper = new Swiper('.bsd-testi-swiper', {
                slidesPerView: 1,
                spaceBetween: 30,
                loop: true,
                autoplay: {
                    delay: 3000,
                    disableOnInteraction: false,
                },
                breakpoints: {
                    768: {
                        slidesPerView: 2,
                    }
                }
            });
            
            // Content Swiper
            const contentSwiper = new Swiper('.contentSwiper', {
                slidesPerView: 1,
                spaceBetween: 30,
                loop: true,
                navigation: {
                    nextEl: '.explore-swiper-button-next',
                    prevEl: '.explore-swiper-button-prev',
                },
                breakpoints: {
                    768: {
                        slidesPerView: 2,
                    },
                    1024: {
                        slidesPerView: 3,
                    }
                }
            });
        }
    </script>
</body>
</html>`
}

// Recursively add directory to zip
function addDirectoryToZip(archive: archiver.Archiver, dirPath: string, zipPath: string) {
  const files = readdirSync(dirPath)
  
  for (const file of files) {
    const filePath = join(dirPath, file)
    const stat = statSync(filePath)
    
    if (stat.isDirectory()) {
      addDirectoryToZip(archive, filePath, `${zipPath}/${file}`)
    } else {
      archive.file(filePath, { name: `${zipPath}/${file}` })
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userInput } = await request.json()

    if (!userInput || !userInput.trim()) {
      return NextResponse.json(
        { error: 'Content input is required' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      )
    }

    // Create the prompt for content generation
    // Goal: Generate ALL content sections based on user input, matching content-config.php structure
    const prompt = `You are writing as a senior practitioner with real delivery experience.
This is not marketing copy.
This is an explanation of how the work is actually done.

Audience:
A smart client who has worked with agencies before and is skeptical.

Task:
Create a complete landing page based strictly on this input:
"${userInput}"

Core rules:
Say what matters. Skip what doesn't.
Be specific where possible.
If something is common industry talk, rephrase it plainly.
Include trade-offs, constraints, or limits where relevant.
Avoid grand claims unless they are concrete.
Write the way you would explain this on a real call.

Writing style:
Uneven sentence lengths.
Some short, direct lines.
Some longer explanations.
Slight repetition is fine.
Do not polish every sentence.
Do not sound "brand-perfect."

Language rules:
Avoid buzzwords like: seamless, cutting-edge, world-class, best-in-class, user-centric.
Prefer practical wording over abstract language.
If a sentence feels like marketing, rewrite it like advice.

Structure:
Generate ALL of the following sections.
Do not skip any.
Do not use placeholders.

Depth control:
Some sections can be tight.
Some can be more detailed.
Do not make everything equal length.

Output rules:
Return ONLY valid JSON.
No explanations.
No markdown.
Start with { and end with }.

REQUIRED SECTIONS (ALL MUST BE GENERATED):
1. Banner (title, cta_text, cta_link)
2. Intro (paragraph_1, paragraph_2)
3. Trusted brands (heading, description, image)
4. Track record (heading, 4 stats with title and description - title must be 3-5 words, description must be 5-8 words)
5. Key benefits (heading, 6 benefits)
6. Services (heading, description, 13 services)
7. Process (heading, description, 5 steps, process_image)
8. Why partner (heading, description, image)
9. Why essential (heading, heading_span, description, image, 5 points)
10. Benefits working (heading, description, 4 benefits)
11. Testimonials (heading, 3 testimonials)
12. Industries (heading, description, description_span, 9 industries)
13. AI tools (heading, description, 8 tools)
14. FAQs (heading, 16 FAQs)
15. Final CTA (heading, description, description_span, cta_text, cta_link)

IMPORTANT: 
- Generate ALL sections - do not skip any
- Write detailed, comprehensive descriptions (3-4 sentences, 60-100 words minimum)
- Make content rich and informative - not just one line
- Services, benefits, tools, FAQs should have substantial descriptions
- Track Record stats: title (heading inside circle) must be 3-5 words, description must be 5-8 words
- Return ONLY valid JSON, no markdown:

{
  "page_title": "SEO-optimized page title (60 characters max)",
  "banner": {
    "title": "Compelling main headline for the banner section (H1, 50-60 characters)",
    "cta_text": "Call-to-action button text",
    "cta_link": "https://brandstory.in/contact-us/"
  },
  "intro": {
    "paragraph_1": "Generate first paragraph of introduction (4-5 sentences, 150-200 words) based on user input. Make it detailed, informative, and specific to the topic mentioned. Include context and value proposition.",
    "paragraph_2": "Generate second paragraph of introduction (4-5 sentences, 150-200 words) based on user input. Continue the introduction with more specific details, benefits, and compelling information."
  },
  "trusted_brands": {
    "heading": "Generate a heading about being trusted (e.g., 'Trusted PPC Agency in Bangalore with 8+ Years of Experience') based on user input",
    "description": "Generate detailed description about trusted brands and client success (3-4 sentences, 100-150 words) based on user input. Include specific details like years of experience, certifications, team size, etc.",
    "image": "assets/images/geo-location/robotic.png"
  },
  "reviewed_experts": {
    "heading": "Reviewed by Verified Experts",
    "reviews": [
      {
        "image": "assets/images/web-development-company/clutch.svg",
        "class": "bg-review",
        "alt": "Clutch"
      },
      {
        "image": "assets/images/geo-location/g2.svg",
        "class": "bg-review-02",
        "alt": "G2"
      },
      {
        "image": "assets/images/geo-location/trust-pilot.svg",
        "class": "bg-review-trustpilot",
        "alt": "Trustpilot"
      },
      {
        "image": "assets/images/geo-location/good.svg",
        "class": "bg-review-goodfirms",
        "alt": "GoodFirms"
      },
      {
        "image": "assets/images/web-development-company/google-logo.svg",
        "class": "",
        "alt": "Google"
      }
    ]
  },
  "track_record": {
    "heading": "Generate a track record heading based on user input",
    "stats": [
      {
        "title": "Generate a stat title based on user input (3-5 words, e.g., 'Years of Experience', 'Expert Team', etc.)",
        "description": "Generate a stat description based on user input (5-8 words, e.g., 'Over 12 years of strategic expertise')"
      },
      {
        "title": "Generate another stat title based on user input (3-5 words)",
        "description": "Generate another stat description based on user input (5-8 words)"
      },
      {
        "title": "Generate another stat title based on user input (3-5 words)",
        "description": "Generate another stat description based on user input (5-8 words)"
      },
      {
        "title": "Generate another stat title based on user input (3-5 words)",
        "description": "Generate another stat description based on user input (5-8 words)"
      }
    ]
  },
  "key_benefits": {
    "heading": "Generate a compelling heading for key benefits section based on user input",
    "benefits": [
      {
        "icon": "assets/images/geo-location/key-01.svg",
        "title": "Generate a specific benefit title based on user input - NOT 'Benefit 1 Title'",
        "description": "Generate detailed description (3-4 sentences, 60-100 words) describing this specific benefit, explaining what it is, how it helps, and why it matters. Be specific and comprehensive based on user input."
      },
      {
        "icon": "assets/images/geo-location/key-02.svg",
        "title": "Generate another specific benefit title based on user input",
        "description": "Generate detailed description (3-4 sentences, 60-100 words) describing this specific benefit, explaining what it is, how it helps, and why it matters. Be specific and comprehensive based on user input."
      },
      {
        "icon": "assets/images/geo-location/key-03.svg",
        "title": "Generate another specific benefit title based on user input",
        "description": "Generate detailed description (3-4 sentences, 60-100 words) describing this specific benefit, explaining what it is, how it helps, and why it matters. Be specific and comprehensive based on user input."
      },
      {
        "icon": "assets/images/geo-location/key-04.svg",
        "title": "Generate another specific benefit title based on user input",
        "description": "Generate detailed description (3-4 sentences, 60-100 words) describing this specific benefit, explaining what it is, how it helps, and why it matters. Be specific and comprehensive based on user input."
      },
      {
        "icon": "assets/images/geo-location/key-05.svg",
        "title": "Generate another specific benefit title based on user input",
        "description": "Generate detailed description (3-4 sentences, 60-100 words) describing this specific benefit, explaining what it is, how it helps, and why it matters. Be specific and comprehensive based on user input."
      },
      {
        "icon": "assets/images/geo-location/key-06.svg",
        "title": "Generate another specific benefit title based on user input",
        "description": "Generate detailed description (3-4 sentences, 60-100 words) describing this specific benefit, explaining what it is, how it helps, and why it matters. Be specific and comprehensive based on user input."
      }
    ]
  },
  "services": {
    "heading": "Generate a services heading based on user input",
    "description": "Generate detailed services overview (3-4 sentences, 80-120 words) based on user input. Explain what services are offered, their scope, and their value.",
    "services_list": [
      {
        "title": "Generate a specific service title based on user input - NOT 'Service 1 Title'",
        "description": "Generate detailed service description (3-4 sentences, 60-100 words) explaining what this service is, how it works, what it includes, and what benefits it provides. Be specific and comprehensive based on user input."
      },
      {
        "title": "Generate another specific service title based on user input",
        "description": "Generate detailed service description (3-4 sentences, 60-100 words) explaining what this service is, how it works, what it includes, and what benefits it provides. Be specific and comprehensive based on user input."
      },
      {
        "title": "Generate another specific service title based on user input",
        "description": "Generate detailed service description (3-4 sentences, 60-100 words) explaining what this service is, how it works, what it includes, and what benefits it provides. Be specific and comprehensive based on user input."
      },
      {
        "title": "Generate another specific service title based on user input",
        "description": "Generate detailed service description (3-4 sentences, 60-100 words) explaining what this service is, how it works, what it includes, and what benefits it provides. Be specific and comprehensive based on user input."
      },
      {
        "title": "Generate another specific service title based on user input",
        "description": "Generate detailed service description (3-4 sentences, 60-100 words) explaining what this service is, how it works, what it includes, and what benefits it provides. Be specific and comprehensive based on user input."
      },
      {
        "title": "Generate another specific service title based on user input",
        "description": "Generate detailed service description (3-4 sentences, 60-100 words) explaining what this service is, how it works, what it includes, and what benefits it provides. Be specific and comprehensive based on user input."
      },
      {
        "title": "Generate another specific service title based on user input",
        "description": "Generate detailed service description (3-4 sentences, 60-100 words) explaining what this service is, how it works, what it includes, and what benefits it provides. Be specific and comprehensive based on user input."
      },
      {
        "title": "Generate another specific service title based on user input",
        "description": "Generate detailed service description (3-4 sentences, 60-100 words) explaining what this service is, how it works, what it includes, and what benefits it provides. Be specific and comprehensive based on user input."
      },
      {
        "title": "Generate another specific service title based on user input",
        "description": "Generate detailed service description (3-4 sentences, 60-100 words) explaining what this service is, how it works, what it includes, and what benefits it provides. Be specific and comprehensive based on user input."
      },
      {
        "title": "Generate another specific service title based on user input",
        "description": "Generate detailed service description (3-4 sentences, 60-100 words) explaining what this service is, how it works, what it includes, and what benefits it provides. Be specific and comprehensive based on user input."
      },
      {
        "title": "Generate another specific service title based on user input",
        "description": "Generate detailed service description (3-4 sentences, 60-100 words) explaining what this service is, how it works, what it includes, and what benefits it provides. Be specific and comprehensive based on user input."
      },
      {
        "title": "Generate another specific service title based on user input",
        "description": "Generate detailed service description (3-4 sentences, 60-100 words) explaining what this service is, how it works, what it includes, and what benefits it provides. Be specific and comprehensive based on user input."
      },
      {
        "title": "Generate another specific service title based on user input",
        "description": "Generate detailed service description (3-4 sentences, 60-100 words) explaining what this service is, how it works, what it includes, and what benefits it provides. Be specific and comprehensive based on user input."
      }
    ]
  },
  "process": {
    "heading": "Generate a process heading based on user input",
    "description": "Generate detailed process overview (3-4 sentences, 80-120 words) based on user input. Explain the process, its importance, and what clients can expect.",
    "process_image": "assets/images/geo-location/ai-robot.png",
    "steps": [
      {
        "number": "01",
        "title": "Generate step 1 title based on user input - NOT 'Step 1 Title'",
        "subtitle": "Generate step 1 subtitle based on user input (short phrase describing the step)",
        "description": "Generate detailed step description (3-4 sentences, 60-100 words) explaining what happens in this step, why it's important, what the process involves, and what the outcome is. Be specific and actionable based on user input."
      },
      {
        "number": "02",
        "title": "Generate step 2 title based on user input",
        "subtitle": "Generate step 2 subtitle based on user input",
        "description": "Generate detailed step description (3-4 sentences, 60-100 words) explaining what happens in this step, why it's important, what the process involves, and what the outcome is. Be specific and actionable based on user input."
      },
      {
        "number": "03",
        "title": "Generate step 3 title based on user input",
        "subtitle": "Generate step 3 subtitle based on user input",
        "description": "Generate detailed step description (3-4 sentences, 60-100 words) explaining what happens in this step, why it's important, what the process involves, and what the outcome is. Be specific and actionable based on user input."
      },
      {
        "number": "04",
        "title": "Generate step 4 title based on user input",
        "subtitle": "Generate step 4 subtitle based on user input",
        "description": "Generate 2-3 sentences describing step 4 based on user input"
      },
      {
        "number": "05",
        "title": "Generate step 5 title based on user input",
        "subtitle": "Generate step 5 subtitle based on user input",
        "description": "Generate 2-3 sentences describing step 5 based on user input"
      }
    ]
  },
  "why_partner": {
    "heading": "Generate a 'Why Partner' heading based on user input (e.g., 'Why Leading Brands Trust BrandStory for PPC Management')",
    "description": "Generate detailed why partner description (4-5 sentences, 150-200 words) based on user input. Explain why businesses should choose this service, include credentials, experience, and unique value propositions.",
    "image": "assets/images/geo-location/human-robot.png"
  },
  "why_essential": {
    "heading": "Generate a 'Why Essential' heading based on user input",
    "heading_span": "Generate span text for the heading (e.g., 'Business Growth in Bangalore') based on user input",
    "description": "Generate detailed why essential description (3-4 sentences, 100-150 words) explaining why this service/topic is essential. Include context about the digital landscape and business needs.",
    "image": "assets/images/geo-location/laptop.png",
    "points": [
      "Generate point 1 (3-4 sentences, 60-100 words) explaining a key reason why this is essential, with specific details and examples",
      "Generate point 2 (3-4 sentences, 60-100 words) explaining another key reason, with specific details and examples",
      "Generate point 3 (3-4 sentences, 60-100 words) explaining another key reason, with specific details and examples",
      "Generate point 4 (3-4 sentences, 60-100 words) explaining another key reason, with specific details and examples",
      "Generate point 5 (3-4 sentences, 60-100 words) explaining another key reason, with specific details and examples"
    ]
  },
  "benefits_working": {
    "heading": "Generate benefits heading based on user input",
    "description": "Generate detailed benefits overview (3-4 sentences, 80-120 words) based on user input. Explain the key benefits, their value, and what clients can expect.",
    "benefits": [
      {
        "icon": "assets/images/geo-location/goe-01.svg",
        "title": "Generate a specific benefit title based on user input - NOT 'Benefit 1 Title'",
        "description": "Generate benefit description (2-3 sentences, 40-60 words) explaining what this benefit is and why it matters. Be specific to the user's input topic."
      },
      {
        "icon": "assets/images/geo-location/goe-02.svg",
        "title": "Generate another specific benefit title based on user input",
        "description": "Generate detailed description (3-4 sentences, 60-100 words) describing this specific benefit, explaining what it is, how it helps, and why it matters. Be specific and comprehensive based on user input."
      },
      {
        "icon": "assets/images/geo-location/goe-03.svg",
        "title": "Generate another specific benefit title based on user input",
        "description": "Generate detailed description (3-4 sentences, 60-100 words) describing this specific benefit, explaining what it is, how it helps, and why it matters. Be specific and comprehensive based on user input."
      },
      {
        "icon": "assets/images/geo-location/goe-04.svg",
        "title": "Generate another specific benefit title based on user input",
        "description": "Generate detailed description (3-4 sentences, 60-100 words) describing this specific benefit, explaining what it is, how it helps, and why it matters. Be specific and comprehensive based on user input."
      }
    ]
  },
  "testimonials": {
    "heading": "Testimonials",
    "testimonials_list": [
      {
        "quote": "Generate a realistic testimonial quote (3-4 sentences, 60-100 words) related to user input topic. Make it sound like a real customer review with specific results, experiences, and outcomes.",
        "author": "Generate a realistic author name with title and company name - NOT 'Author Name, Company Name'. Format like '— Rajesh Kumar, CEO, Tech Solutions Bangalore'"
      },
      {
        "quote": "Generate another realistic testimonial quote (3-4 sentences, 60-100 words) related to user input. Make it sound like a real customer review with specific results, experiences, and outcomes.",
        "author": "Generate another realistic author name and company"
      },
      {
        "quote": "Generate another realistic testimonial quote (3-4 sentences, 60-100 words) related to user input. Make it sound like a real customer review with specific results, experiences, and outcomes.",
        "author": "Generate another realistic author name and company"
      }
    ]
  },
  "industries": {
    "heading": "Generate industries heading based on user input",
    "description": "Generate industries description based on user input",
    "description_span": "Generate span text based on user input",
    "industries_list": [
      "Generate industry 1 name based on user input - NOT 'Industry 1'",
      "Generate industry 2 name based on user input",
      "Generate industry 3 name based on user input",
      "Generate industry 4 name based on user input",
      "Generate industry 5 name based on user input",
      "Generate industry 6 name based on user input",
      "Generate industry 7 name based on user input",
      "Generate industry 8 name based on user input",
      "Generate industry 9 name based on user input"
    ]
  },
  "ai_tools": {
    "heading": "Generate AI tools heading based on user input",
    "description": "Generate detailed AI tools description (3-4 sentences, 80-120 words) based on user input. Explain what tools are used, their capabilities, and how they benefit clients.",
    "tools": [
      {
        "title": "Generate a specific tool/technology name based on user input - NOT 'Tool 1 Name'",
        "description": "Generate detailed tool description (3-4 sentences, 60-100 words) explaining what this tool is, how it's used, what features it provides, and what benefits it offers. Be specific and comprehensive based on user input."
      },
      {
        "title": "Generate another specific tool name based on user input",
        "description": "Generate detailed tool description (3-4 sentences, 60-100 words) explaining what this tool is, how it's used, what features it provides, and what benefits it offers. Be specific and comprehensive based on user input."
      },
      {
        "title": "Generate another specific tool name based on user input",
        "description": "Generate detailed tool description (3-4 sentences, 60-100 words) explaining what this tool is, how it's used, what features it provides, and what benefits it offers. Be specific and comprehensive based on user input."
      },
      {
        "title": "Generate another specific tool name based on user input",
        "description": "Generate detailed tool description (3-4 sentences, 60-100 words) explaining what this tool is, how it's used, what features it provides, and what benefits it offers. Be specific and comprehensive based on user input."
      },
      {
        "title": "Generate another specific tool name based on user input",
        "description": "Generate detailed tool description (3-4 sentences, 60-100 words) explaining what this tool is, how it's used, what features it provides, and what benefits it offers. Be specific and comprehensive based on user input."
      },
      {
        "title": "Generate another specific tool name based on user input",
        "description": "Generate detailed tool description (3-4 sentences, 60-100 words) explaining what this tool is, how it's used, what features it provides, and what benefits it offers. Be specific and comprehensive based on user input."
      },
      {
        "title": "Generate another specific tool name based on user input",
        "description": "Generate detailed tool description (3-4 sentences, 60-100 words) explaining what this tool is, how it's used, what features it provides, and what benefits it offers. Be specific and comprehensive based on user input."
      },
      {
        "title": "Generate another specific tool name based on user input",
        "description": "Generate detailed tool description (3-4 sentences, 60-100 words) explaining what this tool is, how it's used, what features it provides, and what benefits it offers. Be specific and comprehensive based on user input."
      }
    ]
  },
  "faqs": {
    "heading": "FAQ's",
    "faqs_list": [
      {
        "question": "Generate a realistic FAQ question based on user input - NOT 'FAQ Question 1?'. Make it a question customers would actually ask about the topic.",
        "answer": "Generate detailed FAQ answer (3-4 sentences, 60-100 words) based on user input - NOT 'FAQ Answer 1'. Provide comprehensive, helpful information that directly answers the question with specific details and examples.",
        "expanded": true
      },
      {
        "question": "Generate another realistic FAQ question based on user input",
        "answer": "Generate detailed FAQ answer (3-4 sentences, 60-100 words) based on user input. Provide comprehensive, helpful information that directly answers the question with specific details and examples.",
        "expanded": false
      },
      {
        "question": "Generate another realistic FAQ question based on user input",
        "answer": "Generate detailed FAQ answer (3-4 sentences, 60-100 words) based on user input. Provide comprehensive, helpful information that directly answers the question with specific details and examples.",
        "expanded": false
      },
      {
        "question": "Generate another realistic FAQ question based on user input",
        "answer": "Generate detailed FAQ answer (3-4 sentences, 60-100 words) based on user input. Provide comprehensive, helpful information that directly answers the question with specific details and examples.",
        "expanded": false
      },
      {
        "question": "Generate another realistic FAQ question based on user input",
        "answer": "Generate detailed FAQ answer (3-4 sentences, 60-100 words) based on user input. Provide comprehensive, helpful information that directly answers the question with specific details and examples.",
        "expanded": false
      },
      {
        "question": "Generate another realistic FAQ question based on user input",
        "answer": "Generate detailed FAQ answer (3-4 sentences, 60-100 words) based on user input. Provide comprehensive, helpful information that directly answers the question with specific details and examples.",
        "expanded": false
      },
      {
        "question": "Generate another realistic FAQ question based on user input",
        "answer": "Generate detailed FAQ answer (3-4 sentences, 60-100 words) based on user input. Provide comprehensive, helpful information that directly answers the question with specific details and examples.",
        "expanded": false
      },
      {
        "question": "Generate another realistic FAQ question based on user input",
        "answer": "Generate detailed FAQ answer (3-4 sentences, 60-100 words) based on user input. Provide comprehensive, helpful information that directly answers the question with specific details and examples.",
        "expanded": false
      },
      {
        "question": "Generate another realistic FAQ question based on user input",
        "answer": "Generate detailed FAQ answer (3-4 sentences, 60-100 words) based on user input. Provide comprehensive, helpful information that directly answers the question with specific details and examples.",
        "expanded": false
      },
      {
        "question": "Generate another realistic FAQ question based on user input",
        "answer": "Generate detailed FAQ answer (3-4 sentences, 60-100 words) based on user input. Provide comprehensive, helpful information that directly answers the question with specific details and examples.",
        "expanded": false
      },
      {
        "question": "Generate another realistic FAQ question based on user input",
        "answer": "Generate detailed FAQ answer (3-4 sentences, 60-100 words) based on user input. Provide comprehensive, helpful information that directly answers the question with specific details and examples.",
        "expanded": false
      },
      {
        "question": "Generate another realistic FAQ question based on user input",
        "answer": "Generate detailed FAQ answer (3-4 sentences, 60-100 words) based on user input. Provide comprehensive, helpful information that directly answers the question with specific details and examples.",
        "expanded": false
      },
      {
        "question": "Generate another realistic FAQ question based on user input",
        "answer": "Generate detailed FAQ answer (3-4 sentences, 60-100 words) based on user input. Provide comprehensive, helpful information that directly answers the question with specific details and examples.",
        "expanded": false
      },
      {
        "question": "Generate another realistic FAQ question based on user input",
        "answer": "Generate detailed FAQ answer (3-4 sentences, 60-100 words) based on user input. Provide comprehensive, helpful information that directly answers the question with specific details and examples.",
        "expanded": false
      },
      {
        "question": "Generate another realistic FAQ question based on user input",
        "answer": "Generate detailed FAQ answer (3-4 sentences, 60-100 words) based on user input. Provide comprehensive, helpful information that directly answers the question with specific details and examples.",
        "expanded": false
      },
      {
        "question": "Generate another realistic FAQ question based on user input",
        "answer": "Generate detailed FAQ answer (3-4 sentences, 60-100 words) based on user input. Provide comprehensive, helpful information that directly answers the question with specific details and examples.",
        "expanded": false
      }
    ]
  },
  "final_cta": {
    "heading": "Generate a compelling final CTA heading based on user input (e.g., 'Ready to Increase Your Digital Footprint with PPC Campaigns?')",
    "description": "Generate detailed final CTA description (3-4 sentences, 80-120 words) based on user input. Create urgency, explain the value of taking action, and motivate the reader.",
    "description_span": "Generate span text for the description based on user input (e.g., 'Your business deserves PPC management that delivers real results.')",
    "cta_text": "Generate compelling CTA button text based on user input (e.g., 'Get Your Free PPC Strategy Consultation Now!')",
    "cta_link": "https://brandstory.in/contact-us/"
  }
}

CRITICAL REQUIREMENTS:
- Generate ALL content sections based strictly on user input: "${userInput}"
- Fill EVERY field with real, specific content - NO placeholders
- Generate minimum items: 13 services, 16 FAQs, 6 key benefits, 5 process steps, 4 track record stats, 3 testimonials, 9 industries, 8 AI tools, 4 benefits of working, 5 why essential points
- All content must be specific to the user's input topic
- Use SEO keywords naturally throughout
- Write as a practitioner explaining real work - not marketing copy
- Descriptions should vary in length - some tight, some detailed (60-150 words)
- Return ONLY valid JSON, no markdown, no code blocks, no explanations
- Generate complete content - do not leave any section empty`

    // Call OpenAI API
    // Model list with their max_tokens limits
    const models = [
      { name: 'gpt-4o', maxTokens: 16384 },
      { name: 'gpt-4-turbo', maxTokens: 4096 },
      { name: 'gpt-3.5-turbo', maxTokens: 4096 },
    ]

    let completion
    let lastError: any = null
    let responseContent = ''

    for (const modelConfig of models) {
      try {
        console.log(`Trying model: ${modelConfig.name} with max_tokens: ${modelConfig.maxTokens}`)
        completion = await openai.chat.completions.create({
          model: modelConfig.name,
          max_tokens: modelConfig.maxTokens,
          messages: [
            {
              role: 'system',
              content: 'You are writing as a senior practitioner with real delivery experience. This is not marketing copy. This is an explanation of how the work is actually done. Write for a smart client who has worked with agencies before and is skeptical. Avoid buzzwords like seamless, cutting-edge, world-class, best-in-class, user-centric. Prefer practical wording over abstract language. Write the way you would explain this on a real call. You MUST return valid JSON only - no apologies, no explanations, just the JSON object.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.9,
          response_format: { type: 'json_object' },
        })

        responseContent = completion.choices[0]?.message?.content || ''
        
        // Log response details for debugging
        console.log(`Response from ${modelConfig.name}:`, {
          contentLength: responseContent.length,
          finishReason: completion.choices[0]?.finish_reason,
          hasContent: !!responseContent,
          firstChars: responseContent.substring(0, 100)
        })
        
        // Check if response is empty
        if (!responseContent || responseContent.trim().length === 0) {
          console.warn(`⚠ Empty response from model ${modelConfig.name}`)
          console.warn(`Finish reason: ${completion.choices[0]?.finish_reason}`)
          console.warn(`Completion object:`, JSON.stringify(completion, null, 2).substring(0, 500))
          const currentIndex = models.findIndex(m => m.name === modelConfig.name)
          if (currentIndex < models.length - 1) {
            console.log(`Empty response, trying next model...`)
            continue
          } else {
            throw new Error('API returned empty response. This may be due to content policy restrictions or invalid input. Please try with different content.')
          }
        }
        
        // Check if response was truncated
        if (completion.choices[0]?.finish_reason === 'length') {
          console.warn(`⚠ Response was truncated (max_tokens reached) for model ${modelConfig.name}`)
          // If this is the last model, we'll try to fix the partial JSON
          // Otherwise, try next model
          const currentIndex = models.findIndex(m => m.name === modelConfig.name)
          if (currentIndex < models.length - 1) {
            console.log(`Response truncated, trying next model with higher token limit...`)
            continue
          } else {
            console.warn(`⚠ This is the last available model. Will attempt to fix truncated JSON.`)
          }
        }
        
        console.log(`✓ Successfully used model: ${modelConfig.name}`)
        break
      } catch (error: any) {
        lastError = error
        console.log(`✗ Model ${modelConfig.name} failed: ${error.message || 'Unknown error'}`)
      }
    }

    if (!responseContent || responseContent.trim().length === 0) {
      if (lastError) {
        throw new Error(`All models failed. Last error: ${lastError.message || 'Unknown error'}. Please check your API key and model access.`)
      } else {
        throw new Error('API returned empty response. This may be due to content policy restrictions or invalid input. Please try with different content.')
      }
    }

    // Check if response starts with an error message
    const trimmedContent = responseContent.trim()
    if (trimmedContent.startsWith("I'm sorry") || 
        trimmedContent.startsWith("I cannot") ||
        trimmedContent.startsWith("Sorry") ||
        trimmedContent.toLowerCase().includes("i cannot") ||
        trimmedContent.toLowerCase().includes("i'm unable") ||
        trimmedContent.toLowerCase().includes("i apologize")) {
      console.error('API returned error message instead of JSON:', trimmedContent.substring(0, 200))
      throw new Error('The API returned an error message instead of content. This may be due to content policy restrictions or invalid input. Please try with different content or check your input.')
    }

    // Parse JSON from response
    let contentData
    try {
      const jsonMatch = responseContent.match(/```json\n([\s\S]*?)\n```/) || responseContent.match(/```\n([\s\S]*?)\n```/)
      let jsonString = jsonMatch ? jsonMatch[1] : responseContent
      
      // Remove any leading/trailing whitespace
      jsonString = jsonString.trim()
      
      // If it doesn't start with {, try to find the JSON object
      if (!jsonString.startsWith('{')) {
        const jsonStart = jsonString.indexOf('{')
        if (jsonStart !== -1) {
          jsonString = jsonString.substring(jsonStart)
        } else {
          throw new Error('No JSON object found in response. Response may be empty or invalid.')
        }
      }
      
      // Try to fix truncated JSON by finding the last complete structure
      if (!jsonString.trim().endsWith('}')) {
        console.warn('⚠ JSON appears truncated, attempting to fix...')
        
        // Count all open/close structures to understand nesting
        let braceCount = 0
        let bracketCount = 0
        let inString = false
        let escapeNext = false
        
        for (let i = 0; i < jsonString.length; i++) {
          const char = jsonString[i]
          
          if (escapeNext) {
            escapeNext = false
            continue
          }
          
          if (char === '\\') {
            escapeNext = true
            continue
          }
          
          if (char === '"' && !escapeNext) {
            inString = !inString
            continue
          }
          
          if (!inString) {
            if (char === '{') braceCount++
            if (char === '}') braceCount--
            if (char === '[') bracketCount++
            if (char === ']') bracketCount--
          }
        }
        
        // Work backwards to find the last complete object/array item
        // Look for patterns like: }, }, ], etc.
        let lastCompletePos = -1
        let workingBraceCount = 0
        let workingBracketCount = 0
        inString = false
        escapeNext = false
        
        // Find the last position where we have a complete structure
        for (let i = jsonString.length - 1; i >= 0; i--) {
          const char = jsonString[i]
          
          if (escapeNext) {
            escapeNext = false
            continue
          }
          
          if (char === '\\') {
            escapeNext = true
            continue
          }
          
          if (char === '"' && !escapeNext) {
            inString = !inString
            continue
          }
          
          if (!inString) {
            if (char === '}') workingBraceCount++
            if (char === '{') {
              workingBraceCount--
              if (workingBraceCount === 0 && workingBracketCount === 0) {
                // Found end of a complete object
                lastCompletePos = i
                break
              }
            }
            if (char === ']') workingBracketCount++
            if (char === '[') {
              workingBracketCount--
              if (workingBracketCount === 0 && workingBraceCount === 0) {
                // Found end of a complete array
                lastCompletePos = i
                break
              }
            }
            // Look for complete string values followed by comma or closing
            if (char === ',' && workingBraceCount === 0 && workingBracketCount === 0) {
              // Check if previous character is a quote (end of string)
              let j = i - 1
              while (j >= 0 && /\s/.test(jsonString[j])) j--
              if (j >= 0 && jsonString[j] === '"') {
                // Find the start of this string
                let k = j - 1
                let foundStart = false
                while (k >= 0) {
                  if (jsonString[k] === '\\') {
                    k--
                    continue
                  }
                  if (jsonString[k] === '"') {
                    foundStart = true
                    break
                  }
                  k--
                }
                if (foundStart) {
                  lastCompletePos = j
                  break
                }
              }
            }
          }
        }
        
        // Build closing sequence for open structures
        let closing = ''
        while (bracketCount > 0) {
          closing += ']'
          bracketCount--
        }
        while (braceCount > 0) {
          closing += '}'
          braceCount--
        }
        
        if (lastCompletePos > 0) {
          // Remove everything after last complete position
          let fixedJson = jsonString.substring(0, lastCompletePos + 1)
          
          // Remove any trailing comma before adding closing
          fixedJson = fixedJson.replace(/,\s*$/, '')
          
          // Clean up any trailing commas before the last character
          fixedJson = fixedJson.replace(/,\s*([}\]])/g, '$1')
          
          // Add closing structures
          jsonString = fixedJson + closing
          console.log('✓ Fixed truncated JSON by finding last complete structure')
        } else if (closing) {
          // Last resort: find last comma and close from there
          const lastComma = jsonString.lastIndexOf(',')
          if (lastComma > 0) {
            // Remove incomplete last item and any trailing whitespace
            let fixedJson = jsonString.substring(0, lastComma).trim()
            // Remove any trailing comma
            fixedJson = fixedJson.replace(/,\s*$/, '')
            // Clean up trailing commas before closing
            fixedJson = fixedJson.replace(/,\s*([}\]])/g, '$1')
            jsonString = fixedJson + closing
            console.log('✓ Fixed truncated JSON by removing incomplete last item and closing structures')
          } else {
            // Just close the structures, but remove trailing comma first
            let fixedJson = jsonString.trim().replace(/,\s*$/, '')
            fixedJson = fixedJson.replace(/,\s*([}\]])/g, '$1')
            jsonString = fixedJson + closing
            console.log('✓ Fixed truncated JSON by closing open structures')
          }
        } else {
          console.warn('⚠ Could not automatically fix truncated JSON')
        }
        
        // Final cleanup: remove any trailing commas before closing braces/brackets
        jsonString = jsonString.replace(/,(\s*[}\]])/g, '$1')
      }
      
      // Try to parse - if it fails, use improved recovery
      try {
        contentData = JSON.parse(jsonString)
      } catch (parseError2: any) {
        console.warn('⚠ First fix failed, trying improved recovery...')
        
        // Strategy: Find last complete object/array item by working backwards
        let fixedJson = jsonString
        let lastValidPos = -1
        let braceDepth = 0
        let bracketDepth = 0
        let inString = false
        let escapeNext = false
        
        // First pass: find last balanced position going forward
        for (let i = 0; i < fixedJson.length; i++) {
          const char = fixedJson[i]
          
          if (escapeNext) {
            escapeNext = false
            continue
          }
          
          if (char === '\\') {
            escapeNext = true
            continue
          }
          
          if (char === '"' && !escapeNext) {
            inString = !inString
            continue
          }
          
          if (!inString) {
            if (char === '{') braceDepth++
            if (char === '}') {
              braceDepth--
              if (braceDepth === 0 && bracketDepth === 0) {
                lastValidPos = i
              }
            }
            if (char === '[') bracketDepth++
            if (char === ']') {
              bracketDepth--
              if (braceDepth === 0 && bracketDepth === 0 && lastValidPos < i) {
                lastValidPos = i
              }
            }
          }
        }
        
        // If we found a valid position, try to find the last complete item before truncation
        if (lastValidPos > 100) {
          // Look for the last complete object/array item before the truncation point
          // Find the last complete closing brace or bracket
          let cutPos = lastValidPos
          
          // Work backwards from lastValidPos to find last complete item
          let tempBraceDepth = 0
          let tempBracketDepth = 0
          inString = false
          escapeNext = false
          
          for (let i = lastValidPos; i >= 0; i--) {
            const char = fixedJson[i]
            
            if (escapeNext) {
              escapeNext = false
              continue
            }
            
            if (i > 0 && fixedJson[i - 1] === '\\') {
              escapeNext = true
              continue
            }
            
            if (char === '"' && !escapeNext) {
              inString = !inString
              continue
            }
            
            if (!inString) {
              if (char === '}') tempBraceDepth++
              if (char === '{') {
                tempBraceDepth--
                if (tempBraceDepth === 0 && tempBracketDepth === 0) {
                  // Found a complete object, check if there's a comma before it
                  let j = i - 1
                  while (j >= 0 && /\s/.test(fixedJson[j])) j--
                  if (j >= 0 && fixedJson[j] === ',') {
                    cutPos = j // Cut before the comma
                  } else {
                    cutPos = i - 1 // Cut before the object
                  }
                  break
                }
              }
              if (char === ']') tempBracketDepth++
              if (char === '[') {
                tempBracketDepth--
                if (tempBracketDepth === 0 && tempBraceDepth === 0) {
                  // Found a complete array, check if there's a comma before it
                  let j = i - 1
                  while (j >= 0 && /\s/.test(fixedJson[j])) j--
                  if (j >= 0 && fixedJson[j] === ',') {
                    cutPos = j // Cut before the comma
                  } else {
                    cutPos = i - 1 // Cut before the array
                  }
                  break
                }
              }
            }
          }
          
          fixedJson = fixedJson.substring(0, cutPos + 1)
          
          // Remove trailing comma if exists
          fixedJson = fixedJson.replace(/,\s*([}\]])/g, '$1')
          
          // Count and close open structures
          const openBraces = (fixedJson.match(/{/g) || []).length - (fixedJson.match(/}/g) || []).length
          const openBrackets = (fixedJson.match(/\[/g) || []).length - (fixedJson.match(/\]/g) || []).length
          for (let i = 0; i < openBrackets; i++) fixedJson += ']'
          for (let i = 0; i < openBraces; i++) fixedJson += '}'
          
          try {
            jsonString = fixedJson
            contentData = JSON.parse(jsonString)
            console.log('✓ Fixed truncated JSON with improved recovery')
          } catch (parseError3: any) {
            console.error('⚠ Improved recovery failed:', parseError3.message.substring(0, 100))
            throw parseError2
          }
        } else {
          throw parseError2
        }
      }
      
      // Log received data for debugging
      console.log('Received content data keys:', Object.keys(contentData))
      console.log('Sample content - banner title:', contentData.banner?.title)
      console.log('Sample content - key_benefits count:', contentData.key_benefits?.benefits?.length)
    } catch (parseError: any) {
      console.error('JSON Parse Error:', parseError)
      console.error('JSON Parse Error:', parseError)
      console.error('Response content length:', responseContent.length)
      console.error('Response content (first 1000 chars):', responseContent.substring(0, 1000))
      console.error('Response content (last 500 chars):', responseContent.substring(Math.max(0, responseContent.length - 500)))
      
      // If response is empty
      if (responseContent.length === 0) {
        throw new Error('API returned empty response. This may be due to content policy restrictions or invalid input. Please try with different content.')
      }
      
      // If it's a truncation issue
      if (parseError.message.includes('Unexpected end') || parseError.message.includes('Unterminated')) {
        throw new Error(`Response was truncated. The content is too long for the current token limit. Please try with a shorter input or the system will need more tokens.`)
      }
      
      throw new Error(`Failed to parse content from API response: ${parseError.message}. The API may have returned an error message instead of JSON. Please try again with different input.`)
    }

    // Validate that we have all required content sections
    const requiredSections = [
      'banner', 'intro', 'trusted_brands', 'track_record', 'key_benefits',
      'services', 'process', 'why_partner', 'why_essential', 'benefits_working',
      'testimonials', 'industries', 'ai_tools', 'faqs', 'final_cta'
    ]
    
    const missingSections = requiredSections.filter(section => {
      if (section === 'ai_tools') return !contentData.ai_tools?.tools || contentData.ai_tools.tools.length === 0
      if (section === 'faqs') return !contentData.faqs?.faqs_list || contentData.faqs.faqs_list.length === 0
      return !contentData[section]
    })
    
    if (missingSections.length > 0) {
      console.warn(`Warning: Missing sections: ${missingSections.join(', ')}`)
      
      // Add empty structures for missing critical sections
      if (!contentData.ai_tools) {
        contentData.ai_tools = {
          heading: 'AI Tools & Technologies',
          description: 'Our advanced technology stack',
          tools: []
        }
      }
      if (!contentData.faqs) {
        contentData.faqs = {
          heading: "FAQ's",
          faqs_list: []
        }
      }
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
        'Content-Disposition': `attachment; filename="generated-page-${Date.now()}.zip"`,
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

