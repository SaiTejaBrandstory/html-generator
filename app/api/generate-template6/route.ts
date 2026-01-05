import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import archiver from 'archiver'

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

// Generate complete HTML page with all sections for template6
function generateHTMLPage(content: any): string {
  return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(content.page_title || 'Generated Page')}</title>

    <meta name="description" content="${escapeHtml(content.meta_description || '')}">
    <meta name="keywords" content="${escapeHtml(content.meta_keywords || '')}">
    <link rel="canonical" href="${escapeHtml(content.canonical_url || 'https://brandstory.in/')}">
    <meta name="robots" content="index, follow">
    <meta name="author" content="Brandstory">
    <meta name="publisher" content="Brandstory">

    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous">
    
    <!-- Swiper CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css" />
    
    <!-- Custom Style CSS -->
    <link rel="stylesheet" href="https://brandstory.in/website-development-company-in-bangalore/style/style.css">
    
    <style>
        * {
            box-sizing: border-box;
        }
        html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .website-development-page {
            min-height: 100vh;
            width: 100%;
        }
        .container {
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 15px;
        }
        img {
            max-width: 100%;
            height: auto;
        }
        h1, h2, h3, h4, h5, h6 {
            margin: 1rem 0;
            font-weight: 600;
        }
        p {
            margin: 0 0 1rem 0;
        }
        a {
            color: #007bff;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        
        .info .case-study {
            padding: 2rem 0;
        }
        
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
        
        @media (max-width: 768px) {
            .info .case-study {
                padding: 2rem 0 !important;
            }
            
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
        }
    </style>
</head>

<body>
    <div id="index-scope">
        <div id="header"></div>
        <div class="website-development-page">
            <!-- Banner Section -->
            <div class="banner">
                <div class="container">
                    <div class="inner">
                        <h1 class="slide-up-down">${escapeHtml(content.banner?.title || '')}</h1>
                        <p class="slide-up-downn">${escapeHtml(content.banner?.description || '')}</p>

                        <div class="point">
                            ${(content.banner?.stats || []).map((stat: string) => `<p>${escapeHtml(stat)}</p>`).join('')}
                        </div>
                        <a href="${escapeHtml(content.banner?.cta_link || 'https://brandstory.in/contact-us/')}" class="banner-button">
                            <img src="https://brandstory.in/website-development-company-in-bangalore/images/arrow-right-icon.png" width="24" height="24" alt="">
                            <span>${escapeHtml(content.banner?.cta_text || 'Contact Us')}</span>
                        </a>
                    </div>
                </div>

                <div class="trusted-brands pt-5">
                    <div class="container">
                        <h4>Trusted by Top Brands Across Industries</h4>
                    </div>
                    <div class="partners">
                        <div class="left-to-right">
                            <div class="scroll">
                                <img src="https://brandstory.in/website-development-company-in-bangalore/images/partner/1.png" alt="" />
                                <img src="https://brandstory.in/website-development-company-in-bangalore/images/partner/2.png" alt="" />
                                <img src="https://brandstory.in/website-development-company-in-bangalore/images/partner/3.png" alt="" />
                                <img src="https://brandstory.in/website-development-company-in-bangalore/images/partner/4.png" alt="" />
                                <img src="https://brandstory.in/website-development-company-in-bangalore/images/partner/5.png" alt="" />
                                <img src="https://brandstory.in/website-development-company-in-bangalore/images/partner/1.png" alt="" />
                                <img src="https://brandstory.in/website-development-company-in-bangalore/images/partner/2.png" alt="" />
                                <img src="https://brandstory.in/website-development-company-in-bangalore/images/partner/3.png" alt="" />
                                <img src="https://brandstory.in/website-development-company-in-bangalore/images/partner/4.png" alt="" />
                                <img src="https://brandstory.in/website-development-company-in-bangalore/images/partner/5.png" alt="" />
                                <img src="https://brandstory.in/website-development-company-in-bangalore/images/partner/1.png" alt="" />
                                <img src="https://brandstory.in/website-development-company-in-bangalore/images/partner/2.png" alt="" />
                                <img src="https://brandstory.in/website-development-company-in-bangalore/images/partner/3.png" alt="" />
                                <img src="https://brandstory.in/website-development-company-in-bangalore/images/partner/4.png" alt="" />
                                <img src="https://brandstory.in/website-development-company-in-bangalore/images/partner/5.png" alt="" />
                            </div>
                        </div>
                        <div class="right-to-left">
                            <div class="scroll">
                                <img src="https://brandstory.in/website-development-company-in-bangalore/images/partner/8.png" alt="" />
                                <img src="https://brandstory.in/website-development-company-in-bangalore/images/partner/9.png" alt="" />
                                <img src="https://brandstory.in/website-development-company-in-bangalore/images/partner/10.png" alt="" />
                                <img src="https://brandstory.in/website-development-company-in-bangalore/images/partner/11.png" alt="" />
                                <img src="https://brandstory.in/website-development-company-in-bangalore/images/partner/12.png" alt="" />
                                <img src="https://brandstory.in/website-development-company-in-bangalore/images/partner/13.png" alt="" />
                                <img src="https://brandstory.in/website-development-company-in-bangalore/images/partner/14.png" alt="" />
                                <img src="https://brandstory.in/website-development-company-in-bangalore/images/partner/8.png" alt="" />
                                <img src="https://brandstory.in/website-development-company-in-bangalore/images/partner/9.png" alt="" />
                                <img src="https://brandstory.in/website-development-company-in-bangalore/images/partner/10.png" alt="" />
                                <img src="https://brandstory.in/website-development-company-in-bangalore/images/partner/11.png" alt="" />
                                <img src="https://brandstory.in/website-development-company-in-bangalore/images/partner/12.png" alt="" />
                                <img src="https://brandstory.in/website-development-company-in-bangalore/images/partner/13.png" alt="" />
                                <img src="https://brandstory.in/website-development-company-in-bangalore/images/partner/14.png" alt="" />
                                <img src="https://brandstory.in/website-development-company-in-bangalore/images/partner/8.png" alt="" />
                                <img src="https://brandstory.in/website-development-company-in-bangalore/images/partner/9.png" alt="" />
                                <img src="https://brandstory.in/website-development-company-in-bangalore/images/partner/10.png" alt="" />
                                <img src="https://brandstory.in/website-development-company-in-bangalore/images/partner/11.png" alt="" />
                                <img src="https://brandstory.in/website-development-company-in-bangalore/images/partner/12.png" alt="" />
                                <img src="https://brandstory.in/website-development-company-in-bangalore/images/partner/13.png" alt="" />
                                <img src="https://brandstory.in/website-development-company-in-bangalore/images/partner/14.png" alt="" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Info Section -->
            <div class="info">
                <div class="container">
                    <div class="inner">
                        <h2 class="slide-up-down">${content.info?.heading ? (() => {
                            const heading = content.info.heading
                            if (heading.includes('<span>')) {
                                const parts = heading.split(/(<span>.*?<\/span>)/)
                                return parts.map((part: string) => {
                                    if (part.startsWith('<span>')) {
                                        const inner = part.replace(/<\/?span>/g, '')
                                        return `<span>${escapeHtml(inner)}</span>`
                                    }
                                    return escapeHtml(part)
                                }).join('')
                            }
                            return escapeHtml(heading)
                        })() : 'We Don\'t Just Build Websites- <span>We Build Digital Experiences</span>'}</h2>
                        <div class="info-content slide-up-down">
                            ${(content.info?.paragraphs || []).map((para: string) => `<p>${escapeHtml(para)}</p>`).join('')}
                        </div>

                        <div class="case-study">
                            <div class="inner d-block">
                                <div class="case-wrapper">
                                    <div class="case-arrows">
                                        <div class="custom-prev custom-arrow">
                                            <img src="https://brandstory.in/website-development-company-in-bangalore/images/left-carasol.svg" alt="">
                                        </div>
                                        <div class="custom-next custom-arrow">
                                            <img src="https://brandstory.in/website-development-company-in-bangalore/images/right-carasol.svg" alt="">
                                        </div>
                                    </div>

                                    <div class="swiper myCaseSwiper">
                                        <div class="swiper-wrapper">
                                            <div class="swiper-slide">
                                                <div class="case-card">
                                                    <div class="case-img">
                                                        <img src="https://brandstory.in/website-development-company-in-bangalore/images/weBuildImgSwiper-img (1).png" alt="img">
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="swiper-slide">
                                                <div class="case-card">
                                                    <div class="case-img">
                                                        <img src="https://brandstory.in/website-development-company-in-bangalore/images/weBuildImgSwiper-img (2).png" alt="img">
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="swiper-slide">
                                                <div class="case-card">
                                                    <div class="case-img">
                                                        <img src="https://brandstory.in/website-development-company-in-bangalore/images/weBuildImgSwiper-img (3).png" alt="img">
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="swiper-slide">
                                                <div class="case-card">
                                                    <div class="case-img">
                                                        <img src="https://brandstory.in/website-development-company-in-bangalore/images/weBuildImgSwiper-img (4).png" alt="img">
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="swiper-slide">
                                                <div class="case-card">
                                                    <div class="case-img">
                                                        <img src="https://brandstory.in/website-development-company-in-bangalore/images/weBuildImgSwiper-img (5).png" alt="img">
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="swiper-slide">
                                                <div class="case-card">
                                                    <div class="case-img">
                                                        <img src="https://brandstory.in/website-development-company-in-bangalore/images/weBuildImgSwiper-img (6).png" alt="img">
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="swiper-slide">
                                                <div class="case-card">
                                                    <div class="case-img">
                                                        <img src="https://brandstory.in/website-development-company-in-bangalore/images/weBuildImgSwiper-img (7).png" alt="img">
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <a href="https://brandstory.in/resources/portfolio/explore-our-web-development-portfolio.php" class="bannee-button">
                                <img src="https://brandstory.in/website-development-company-in-bangalore/images/arrow-right-icon.png" width="24" height="24" alt="">
                                <span>View Our Portfolio</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- How We Craft Section -->
            <div class="how-we-craft">
                <div class="container">
                    <div class="inner">
                        <h2 class="slide-up-down">${escapeHtml(content.how_we_craft?.heading || '')}</h2>
                        <p class="slide-up-down">${escapeHtml(content.how_we_craft?.description || '')}</p>
                        <div class="grid-3">
                            ${(content.how_we_craft?.items || []).map((item: any, idx: number) => {
                                const imageUrls = [
                                    'https://brandstory.in/website-development-company-in-bangalore/images/Purpose-Driven-Design.png',
                                    'https://brandstory.in/website-development-company-in-bangalore/images/Builtt-to-Grow-Your-Business.png',
                                    'https://brandstory.in/website-development-company-in-bangalore/images/Insight-Backed-Strategy.png',
                                    'https://brandstory.in/website-development-company-in-bangalore/images/Performance-That-Converts.png',
                                    'https://brandstory.in/website-development-company-in-bangalore/images/Partnership-Beyond-Launch.png'
                                ]
                                return `
                            <div class="box slide-up-down">
                                <img src="${imageUrls[idx] || escapeHtml(item.image || '')}" alt="${escapeHtml(item.title || '')}">
                                <h3>${escapeHtml(item.title || '')}</h3>
                                <p>${escapeHtml(item.description || '')}</p>
                            </div>
                            `
                            }).join('')}
                            <div class="box contact slide-up-down">
                                <a href="${escapeHtml(content.how_we_craft?.cta_link || 'https://brandstory.in/contact-us/')}" class="banner-button">
                                    <img src="https://brandstory.in/website-development-company-in-bangalore/images/arrow-right-icon.png" width="24" height="24" alt="">
                                    <span>${escapeHtml(content.how_we_craft?.cta_text || 'Contact Us')}</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- What's Standing Section -->
            <div class="whats-standing">
                <div class="container">
                    <h2 class="slide-up-down">${escapeHtml(content.whats_standing?.heading || '')}</h2>
                    <div class="wrapperx">
                        <div class="inner">
                            ${(content.whats_standing?.items || []).slice(0, 2).map((item: any, idx: number) => `
                            <div class="box ${idx === 0 ? 'slide-left-right' : 'slide-right-left'}">
                                <h3>${escapeHtml(item.title || '')}</h3>
                                <p>${escapeHtml(item.description || '')}</p>
                            </div>
                            `).join('')}
                        </div>
                        <div class="inner in-last">
                            ${(content.whats_standing?.items || []).slice(2, 4).map((item: any, idx: number) => `
                            <div class="box ${idx === 0 ? 'slide-left-right' : 'slide-right-left'} ${idx === 1 ? 'box-last' : ''}">
                                <h3>${escapeHtml(item.title || '')}</h3>
                                <p>${escapeHtml(item.description || '')}</p>
                            </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>

            <!-- We Are Number One Section -->
            <div class="we-are-number-one">
                <div class="container">
                    <div class="inner h-100">
                        <h2 class="text-white mb-3 pt-5 text-start">${escapeHtml(content.we_are_number_one?.heading || '')}</h2>
                        <p class="text-white text-start mb-3">${escapeHtml(content.we_are_number_one?.description || '')}</p>
                        <div class="row g-4">
                            ${(content.we_are_number_one?.features || []).map((feature: any, idx: number) => {
                                const iconImages = [
                                    'no_1_dev_img1.svg',
                                    'no_1_dev_img2.svg',
                                    'no_1_dev_img3.svg',
                                    'no_1_dev_img4.svg',
                                    'no_1_dev_img5.svg',
                                    'no_1_dev_img6.svg',
                                    'no_1_dev_img7.svg',
                                    'no_1_dev_img8.svg',
                                    'no_1_dev_img9.svg'
                                ]
                                const iconImage = iconImages[idx] || 'no_1_dev_img1.svg'
                                return `
                            <div class="col-lg-4 col-md-6 col-12">
                                <div class="main-dev-agency-wrapper">
                                    <div class="img-wrp">
                                        <img src="https://brandstory.in/website-development-company-in-bangalore/images/${iconImage}" class="img-fluid" alt="${escapeHtml(feature.title || '')}">
                                    </div>
                                    <div class="content-wrp">
                                        <h4>${escapeHtml(feature.title || '')}</h4>
                                        <p>${escapeHtml(feature.description || '')}</p>
                                    </div>
                                </div>
                            </div>
                            `
                            }).join('')}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Premium Website Design Section -->
            <div class="premium-website-design-company-in-bangalore">
                <div class="container h-100">
                    <div class="inner h-100">
                        <div class="d-flex flex-column justify-content-between h-100">
                            <div>
                                <h2 class="text-white mb-3 text-start">${escapeHtml(content.premium_design?.heading || '')}</h2>
                                ${(content.premium_design?.paragraphs || []).map((para: string) => `<p class="text-white text-start mb-3">${escapeHtml(para)}</p>`).join('')}
                            </div>
                            <div>
                                <div class="row">
                                    <div class="col-md-5"></div>
                                    <div class="col-md-7">
                                        <div class="prem-content">
                                            <h4>${escapeHtml(content.premium_design?.list_heading || '')}</h4>
                                            <ul>
                                                ${(content.premium_design?.list_items || []).map((item: string) => `<li>${escapeHtml(item)}</li>`).join('')}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- All-in-One Tab Section -->
            <div class="all-in-one-tab-section">
                <div class="container">
                    <h2 class="text-start text-white mb-3">${escapeHtml(content.all_in_one?.heading || '')}</h2>
                    <p class="text-start text-white mb-3">${escapeHtml(content.all_in_one?.description || '')}</p>
                    <div class="mt-4 custom-pill-tab">
                        <ul class="nav nav-pills mb-4 d-flex justify-content-between tab-top" id="pills-tab" role="tablist">
                            ${(content.all_in_one?.tabs || []).map((tab: any, idx: number) => `
                            <li class="nav-item" role="presentation">
                                <button class="nav-link ${idx === 0 ? 'active' : ''}" id="pills-${tab.id}-tab" data-bs-toggle="tab" data-bs-target="#pills-${tab.id}" type="button" role="tab" aria-controls="pills-${tab.id}" aria-selected="${idx === 0 ? 'true' : 'false'}">${escapeHtml(tab.name || '')}</button>
                            </li>
                            `).join('')}
                        </ul>
                        <div class="tab-content" id="pills-tabContent">
                            ${(content.all_in_one?.tabs || []).map((tab: any, idx: number) => {
                                const imagePrefixes = ['dp-img', 'fd-img', 'hs-img', 'bf-img']
                                const prefix = imagePrefixes[idx] || 'dp-img'
                                return `
                            <div class="tab-pane fade ${idx === 0 ? 'show active' : ''}" id="pills-${tab.id}" role="tabpanel" aria-labelledby="pills-${tab.id}-tab">
                                <div class="row g-3">
                                    ${(tab.items || []).slice(0, 6).map((item: any, itemIdx: number) => {
                                        // For 3rd tab (hs-img), if it's the 6th item (index 5), use hs-img5.png instead of hs-img6.png
                                        let imageNum = itemIdx + 1
                                        if (idx === 2 && itemIdx === 5) {
                                            imageNum = 5 // Use hs-img5.png for the 6th item
                                        }
                                        return `
                                    <div class="col-lg-2 col-md-4 col-6">
                                        <div>
                                            <div>
                                                <img src="https://brandstory.in/website-development-company-in-bangalore/images/${prefix}${imageNum}.png" class="img-fluid" alt="${escapeHtml(item.name || '')}">
                                            </div>
                                            <h5 class="text-center mt-3">${escapeHtml(item.name || '')}</h5>
                                        </div>
                                    </div>
                                    `
                                    }).join('')}
                                </div>
                            </div>
                            `
                            }).join('')}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Development Process Section -->
            <div class="developemt-process">
                <div class="container">
                    <h2 class="slide-up-down">${escapeHtml(content.development_process?.heading || 'Our Web Development Process')}</h2>
                    <p class="slide-up-down">${escapeHtml(content.development_process?.description || '')}</p>
                    <div class="process-wrapper">
                        ${(content.development_process?.steps || []).map((step: any, idx: number) => {
                            const stepNum = idx + 1
                            // Odd steps (1,3,5,7,9) are on the right, even steps (2,4,6,8) are on the left
                            const isOdd = stepNum % 2 === 1
                            if (isOdd) {
                                // Right side: false div → icon-1 → box
                                return `
                        <div class="process-item">
                            <div class="false"></div>
                            <div class="icon-1 slide-up-down">
                                <img src="https://brandstory.in/website-development-company-in-bangalore/images/process/${stepNum}.svg" alt="">
                                <img src="https://brandstory.in/website-development-company-in-bangalore/images/process/right.svg" alt="">
                            </div>
                            <div class="box slide-right-left">
                                <h3>${escapeHtml(step.title || '')}</h3>
                                <p>${escapeHtml(step.description || '')}</p>
                            </div>
                        </div>
                        ${idx < (content.development_process?.steps || []).length - 1 ? '<div class="line-abs slide-up-down"></div>' : ''}
                        `
                            } else {
                                // Left side: box → icon-2 → false div
                                return `
                        <div class="process-item reverse-order-row">
                            <div class="box slide-left-right">
                                <h3>${escapeHtml(step.title || '')}</h3>
                                <p>${escapeHtml(step.description || '')}</p>
                            </div>
                            <div class="icon-2 slide-up-down reverse-order-row">
                                <img class="deg180" src="https://brandstory.in/website-development-company-in-bangalore/images/process/left.svg" alt="">
                                <img src="https://brandstory.in/website-development-company-in-bangalore/images/process/${stepNum}.svg" alt="">
                            </div>
                            <div class="false"></div>
                        </div>
                        ${idx < (content.development_process?.steps || []).length - 1 ? '<div class="line-abs slide-up-down"></div>' : ''}
                        `
                            }
                        }).join('')}
                    </div>
                </div>
            </div>
            
            <!-- Industry We Serve Section -->
            <div class="industry-we-serve">
                <div class="container">
                    <h2 class="slide-up-down">${escapeHtml(content.industry_we_serve?.heading || 'Industry We Serve')}</h2>
                    <div class="inner">
                        ${(content.industry_we_serve?.industries || []).map((industry: any, idx: number) => {
                            const industryImages = [
                                'E-commerce-Website.png',
                                'Healthcare-Website.png',
                                'Real-Estate-Website.png',
                                'Travel-and-Tourism-Website.png',
                                'Technology-Website.png',
                                'Fintech-Website.png'
                            ]
                            const imageName = industryImages[idx] || 'E-commerce-Website.png'
                            return `
                        <div class="box slide-up-down">
                            <div class="show">
                                <img src="https://brandstory.in/website-development-company-in-bangalore/images/industry/${imageName}" alt="${escapeHtml(industry.name || '')}">
                                <h3>${escapeHtml(industry.name || '')}</h3>
                            </div>
                            <div class="hiden">
                                <h3>${escapeHtml(industry.name || '')}</h3>
                                <p>${escapeHtml(industry.description || '')}</p>
                            </div>
                        </div>
                        `
                        }).join('')}
                    </div>
                </div>
            </div>
            
            <!-- Second Case Study Section -->
            <div class="case-study">
                <div class="container">
                    <h2>Case Study</h2>
                    <div class="inner">
                        <div class="case-wrapper">
                            <div class="case-arrows">
                                <div class="custom-prev custom-arrow">
                                    <img src="https://brandstory.in/website-development-company-in-bangalore/images/left-carasol.svg" alt="">
                                </div>
                                <div class="custom-next custom-arrow">
                                    <img src="https://brandstory.in/website-development-company-in-bangalore/images/right-carasol.svg" alt="">
                                </div>
                            </div>
                            <div class="swiper myCaseSwiper">
                                <div class="swiper-wrapper">
                                    <div class="swiper-slide">
                                        <div class="case-card">
                                            <div class="case-img">
                                                <span class="case-badge">Logistics</span>
                                                <img src="https://brandstory.in/website-development-company-in-bangalore/images/case-1.webp" loading="lazy" width="515" height="324"/>
                                            </div>
                                            <h3>Varsha Logistics</h3>
                                            <p>We created a clean, modern website for Varsha Logistics- with clear brand positioning, strong visuals, and a seamless multi-device experience resulting in a 3.5× increase in online service enquiries.</p>
                                            <a href="https://brandstory.in/resources/casestudies/website/varsha-logistics-website-development/" class="read-link">Read more →</a>
                                        </div>
                                    </div>
                                    <div class="swiper-slide">
                                        <div class="case-card">
                                            <div class="case-img">
                                                <span class="case-badge">Software Company</span>
                                                <img src="https://brandstory.in/website-development-company-in-bangalore/images/case-2.png" width="515" height="324" />
                                            </div>
                                            <h3>Website Design for CPaaS provider</h3>
                                            <p>We redesigned and developed Equence's website with a modern UI, improved navigation, and a conversion-focused structure- resulting in 4x higher visitor engagement and stronger brand credibility online.</p>
                                            <a href="https://brandstory.in/resources/casestudies/website/website-design-development-cpaas/" class="read-link">Read more →</a>
                                        </div>
                                    </div>
                                    <div class="swiper-slide">
                                        <div class="case-card">
                                            <div class="case-img">
                                                <span class="case-badge">Restaurant</span>
                                                <img src="https://brandstory.in/resources/casestudies/assets/images/muro/muro-image-1.jpg" width="515" height="324" />
                                            </div>
                                            <h3>Website Development for Muro</h3>
                                            <p>We developed a premium website for Muro a high-end restaurant, giving them a distinctive online identity with immersive visuals, intuitive UX/UI, and an easy reservation flow. The new site enabled Muro to begin online discovery and bookings.</p>
                                            <a href="https://brandstory.in/resources/casestudies/website/muro-website-development/" class="read-link">Read more →</a>
                                        </div>
                                    </div>
                                    <div class="swiper-slide">
                                        <div class="case-card">
                                            <div class="case-img">
                                                <span class="case-badge">Real Estate</span>
                                                <img src="https://brandstory.in/resources/casestudies/assets/images/ferns/ferns-image-1.jpg" width="515" height="324" />
                                            </div>
                                            <h3>Ferns Estates & Developers</h3>
                                            <p>A complete website revamp for Ferns Estates & Developers real‑estate brand improved user experience and navigation, leading to a 3X increase in visitor engagement and 2.5X growth in lead inquiries.</p>
                                            <a href="https://brandstory.in/resources/casestudies/website/ferns-real-estates-website-development/" class="read-link">Read more →</a>
                                        </div>
                                    </div>
                                    <div class="swiper-slide">
                                        <div class="case-card">
                                            <div class="case-img">
                                                <span class="case-badge">Healthcare Wellness</span>
                                                <img src="https://brandstory.in/resources/casestudies/assets/images/kshemavana/kshemavana1.jpg" width="515" height="324" />
                                            </div>
                                            <h3>Wellness Retreat Centre Website Design</h3>
                                            <p>A complete website design for this wellness‑retreat transformed their online presence- improving user experience and site structure, leading to a 3× increase in visitor sessions and a 4× rise in inquiry form submissions.</p>
                                            <a href="https://brandstory.in/resources/casestudies/website/website-design-and-development-for-wellness-retreat-centre/" class="read-link">Read more →</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Why Choose Section -->
            <div class="Why-choose">
                <div class="container">
                    <h2 class="slide-up-down">${escapeHtml(content.why_choose?.heading || '')}</h2>
                    <div class="inner">
                        <div class="box slide-up-down">
                            <img src="https://brandstory.in/website-development-company-in-bangalore/images/why-choos.png" alt="">
                        </div>
                        <div class="box slide-up-down">
                            <p>${escapeHtml(content.why_choose?.description || '')}</p>
                            <a href="${escapeHtml(content.why_choose?.cta_link || 'https://brandstory.in/contact-us/')}" class="banner-button">
                                <img src="https://brandstory.in/website-development-company-in-bangalore/images/arrow-right-icon.png" width="24" height="24" alt="">
                                <span>${escapeHtml(content.why_choose?.cta_text || 'Contact Us')}</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Our Clients Section -->
            <div class="our-clients">
                <div class="container">
                    <h2>Hear Genuine Feedback from Our Clients</h2>
                    <div class="inner">
                        <div class="right-to-left">
                            <div class="scroll">
                                <div class="box">
                                    <img src="https://brandstory.in/website-development-company-in-bangalore/images/our-clients/haa-Digital.png" loading="lazy" alt="">
                                    <p>Fantastic experience from start to finish. The expert developers in BrandStory understood our vision and created a website that truly reflects our brand vision. Great communication and support throughout the process.</p>
                                    <h3>-Saravanan Balasundaram, Founder, CEO</h3>
                                </div>
                                <div class="box">
                                    <img src="https://brandstory.in/website-development-company-in-bangalore/images/our-clients/biogen.png" alt="">
                                    <p>We were impressed by their attention to detail and creativity. Our new website is not only attractive but also runs smoothly on all devices. This website development company is definitely the trusted partner in Bangalore.</p>
                                    <h3>-Chris Viehbacher, CEO</h3>
                                </div>
                                <div class="box">
                                    <img src="https://brandstory.in/website-development-company-in-bangalore/images/partner/8.png" alt="">
                                    <p>BrandStory is among the best website development companies in Bangalore, they helped us revamp our website. Truly remarkable service, they are eager to help always. Thanks for the support!</p>
                                    <h3>-Anil Kumar, Founder, CEO</h3>
                                </div>
                                <div class="box">
                                    <img src="https://brandstory.in/website-development-company-in-bangalore/images/partner/9.png" alt="">
                                    <p>Partnering with BrandStory for our website development project has been one of the best decisions we've made. BrandStory is the one we highly recommend.</p>
                                    <h3>-Vikaas Gutgutia, CEO</h3>
                                </div>
                                <div class="box">
                                    <img src="https://brandstory.in/website-development-company-in-bangalore/images/partner/10.png" alt="">
                                    <p>BrandStory delivered exactly what we needed a fast, secure, and beautifully designed website that truly represents our brand. Very good execution.</p>
                                    <h3>-Vaishnavi Reddy, Founder, CEO</h3>
                                </div>
                                <div class="box">
                                    <img src="https://brandstory.in/website-development-company-in-bangalore/images/partner/5.png" alt="">
                                    <p>Our experience with BrandStory was outstanding from start to finish. They redesigned our entire website with a fresh visual appeal and improved navigation.</p>
                                    <h3>-Chris Viehbacher, CEO</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Trending Blogs Section -->
            <div class="case-study">
                <div class="container">
                    <h2>Trending Blogs</h2>
                    <div class="inner">
                        <div class="case-wrapper blog-add">
                            <div class="case-arrows">
                                <div class="custom-prev custom-arrow">
                                    <img src="https://brandstory.in/website-development-company-in-bangalore/images/left-carasol.svg" alt="">
                                </div>
                                <div class="custom-next custom-arrow">
                                    <img src="https://brandstory.in/website-development-company-in-bangalore/images/right-carasol.svg" alt="">
                                </div>
                            </div>
                            <div class="swiper myCaseSwiper">
                                <div class="swiper-wrapper">
                                    <div class="swiper-slide">
                                        <div class="case-card">
                                            <div class="case-img">
                                                <img src="https://brandstory.in/website-development-company-in-bangalore/images/blog/1.png" />
                                            </div>
                                            <h3>The Future of Web Development: Key Trends for 2025</h3>
                                            <p>Web development is evolving unexpectedly, pushed by new technology, changing consumer expectations, and the need for quicker, more efficient websites.</p>
                                            <a href="https://brandstory.in/blogs/the-future-of-web-development-key-trends-for-2025/" class="read-link">Read more →</a>
                                        </div>
                                    </div>
                                    <div class="swiper-slide">
                                        <div class="case-card">
                                            <div class="case-img">
                                                <img src="https://brandstory.in/website-development-company-in-bangalore/images/blog/2.png" />
                                            </div>
                                            <h3>Top 10 E-Commerce Platforms for Your Business in 2025</h3>
                                            <p>The quickly transforming digital environment demands businesses create robust online identities to succeed in India's competitive market.</p>
                                            <a href="https://brandstory.in/blogs/top-10-e-commerce-platforms-for-your-business-in-2025/" class="read-link">Read more →</a>
                                        </div>
                                    </div>
                                    <div class="swiper-slide">
                                        <div class="case-card">
                                            <div class="case-img">
                                                <img src="https://brandstory.in/website-development-company-in-bangalore/images/blog/3.png" />
                                            </div>
                                            <h3>Static vs. Dynamic Websites: Understanding the Key Differences</h3>
                                            <p>In today's digital world, a well-designed and practical website is essential for businesses, brands, and people.</p>
                                            <a href="https://brandstory.in/blogs/static-vs-dynamic-websites-understanding-the-key-differences/" class="read-link">Read more →</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Second We Are Number One Section (Our Services) -->
            <div class="we-are-number-one">
                <div class="container">
                    <div class="inner h-100">
                        <h2 class="text-white mb-3 pt-5 text-start">Our Services</h2>
                        <p class="text-white text-start mb-3">We are group of passionate digital marketing experts; industry thought leaders and creative designers coming together to produce stunning ROI lead digital marketing campaigns for brands. We are a social media marketing agency based in Bangalore, India providing digital marketing campaign management support to brands across the globe.</p>
                        <div class="row g-4">
                            <div class="col-lg-4 col-md-6 col-12">
                                <div class="main-dev-agency-wrapper">
                                    <div class="img-wrp">
                                        <img src="https://brandstory.in/website-development-company-in-bangalore/images/no_1_dev_img1.svg" class="img-fluid" alt="no_1_dev_img">
                                    </div>
                                    <div class="content-wrp">
                                        <h4>Digital Marketing</h4>
                                        <p>Digital is here to stay and grow exponentially. Increased visibility, marketing opportunity at efficient budgets, and customer engagement – The three benefits of being in digital and breathing digital.</p>
                                        <a href="https://brandstory.in">Know More</a>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-4 col-md-6 col-12">
                                <div class="main-dev-agency-wrapper">
                                    <div class="img-wrp">
                                        <img src="https://brandstory.in/website-development-company-in-bangalore/images/no_1_dev_img2.svg" class="img-fluid" alt="no_1_dev_img">
                                    </div>
                                    <div class="content-wrp">
                                        <h4>UI UX Design</h4>
                                        <p>As an user-centric design agency in Bangalore, India, we create functionally beautiful digital experiences that highly engage with your target audience. We tend to create meaningful relationships amidst brands and their consumers through inspiring design…</p>
                                        <a href="https://brandstory.in/ui-design-company-bangalore/">Know More</a>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-4 col-md-6 col-12">
                                <div class="main-dev-agency-wrapper">
                                    <div class="img-wrp">
                                        <img src="https://brandstory.in/website-development-company-in-bangalore/images/no_1_dev_img3.svg" class="img-fluid" alt="no_1_dev_img">
                                    </div>
                                    <div class="content-wrp">
                                        <h4>Website Development</h4>
                                        <p>Making sure that your website is universally compatible and user friendly, an exclusive expert team of designers and developers are you assigned to to ensure that not only the plan goes according to a timeline but also that your approval is taken…</p>
                                        <a href="https://brandstory.in/website-development-company-in-bangalore/">Know More</a>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-4 col-md-6 col-12">
                                <div class="main-dev-agency-wrapper">
                                    <div class="img-wrp">
                                        <img src="https://brandstory.in/website-development-company-in-bangalore/images/no_1_dev_img9.svg" class="img-fluid" alt="no_1_dev_img">
                                    </div>
                                    <div class="content-wrp">
                                        <h4>Search Engine Optimisation</h4>
                                        <p>Search Engine Optimization (SEO) program increases overall visibility of your business across all search engine platforms. It provides an opportunities for brands to create acquisitions (sales, leads, inquiries etc.), and help consumers to …</p>
                                        <a href="https://brandstory.in/seo-company-bangalore/">Know More</a>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-4 col-md-6 col-12">
                                <div class="main-dev-agency-wrapper">
                                    <div class="img-wrp">
                                        <img src="https://brandstory.in/website-development-company-in-bangalore/images/no_1_dev_img5.svg" class="img-fluid" alt="no_1_dev_img">
                                    </div>
                                    <div class="content-wrp">
                                        <h4>Pay Per Click (PPC)</h4>
                                        <p>We increase your digital footprint with Pay Per Click campaigns or Google Adwords and Bing Adwords. A plan is sketched out and implemented accordingly, with this your campaign has begun. The plan includes specific important keywords …</p>
                                        <a href="https://brandstory.in/pay-per-click-ppc-services-in-bangalore/">Know More</a>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-4 col-md-6 col-12">
                                <div class="main-dev-agency-wrapper">
                                    <div class="img-wrp">
                                        <img src="https://brandstory.in/website-development-company-in-bangalore/images/no_1_dev_img6.svg" class="img-fluid" alt="no_1_dev_img">
                                    </div>
                                    <div class="content-wrp">
                                        <h4>Social Media Marketing</h4>
                                        <p>We provide expertise in design implementation providing a full range of social media marketing services(SMM) bounding in popular social media platforms, content generation, creatives ideation, social branding techniques. Holding it all together …</p>
                                        <a href="https://brandstory.in/services/social-media-marketing-agency-bangalore/">Know More</a>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-4 col-md-6 col-12">
                                <div class="main-dev-agency-wrapper">
                                    <div class="img-wrp">
                                        <img src="https://brandstory.in/website-development-company-in-bangalore/images/no_1_dev_img7.svg" class="img-fluid" alt="no_1_dev_img">
                                    </div>
                                    <div class="content-wrp">
                                        <h4>Ecommerce Website Development</h4>
                                        <p>Ecommerce development is not as simple as adding products and enabling checkout. It demands a seamless user journey, secure payment integrations, responsive layouts, and a smooth backend flow. You will often face challenges with performance, scaling, product management, and customer experience…</p>
                                        <a href="https://brandstory.in/services/ecommerce-website-development-company-bangalore/">Know More</a>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-4 col-md-6 col-12">
                                <div class="main-dev-agency-wrapper">
                                    <div class="img-wrp">
                                        <img src="https://brandstory.in/website-development-company-in-bangalore/images/no_1_dev_img8.svg" class="img-fluid" alt="no_1_dev_img">
                                    </div>
                                    <div class="content-wrp">
                                        <h4>Mobile App Development</h4>
                                        <p>Mobile app development covers everything from UI design and feature flow to backend APIs and flawless performance on every device. It is typically needed to offer customers faster access, personalised experiences, and real-time interactions that boost engagement and growth…</p>
                                        <a href="https://brandstory.in/mobile-app-development-company-bangalore/">Know More</a>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-4 col-md-6 col-12">
                                <div class="main-dev-agency-wrapper">
                                    <div class="img-wrp">
                                        <img src="https://brandstory.in/website-development-company-in-bangalore/images/no_1_dev_img4.svg" class="img-fluid" alt="no_1_dev_img">
                                    </div>
                                    <div class="content-wrp">
                                        <h4>Full Stack Development</h4>
                                        <p>Full stack development includes managing both the frontend interface and backend architecture across every module, feature, and database layer. It is essential for delivering fast, stable, and scalable digital products that support your business needs from end to end…</p>
                                        <a href="https://brandstory.in/full-stack-development-company-in-bangalore/">Know More</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- FAQ Section -->
            <div class="faq-section">
                <div class="container">
                    <h2>${escapeHtml(content.faqs?.heading || 'Frequently Asked Questions')}</h2>
                    <div class="faq-wrapper">
                        ${(content.faqs?.faqs_list || []).map((faq: any, index: number) => `
                        <div class="faq-item slide-up-down">
                            <button class="faq-question ${index === 0 ? 'active' : ''}">
                                ${escapeHtml(faq.question || '')}
                                <span><img src="https://brandstory.in/website-development-company-in-bangalore/images/faq-icon.svg" alt=""></span>
                            </button>
                            <div class="faq-answer" style="${index === 0 ? 'max-height: 500px;' : ''}">
                                <div class="faq-answer-inner">
                                    ${typeof faq.answer === 'string' ? `<p>${escapeHtml(faq.answer)}</p>` : (faq.answer || []).map((ans: any) => {
                                        if (typeof ans === 'string') {
                                            return `<p>${escapeHtml(ans)}</p>`
                                        } else {
                                            return `<${ans.tag || 'p'}>${escapeHtml(ans.content || '')}</${ans.tag || 'p'}>`
                                        }
                                    }).join('')}
                                </div>
                            </div>
                        </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
        
        <div id="footer"></div>
        
        <!-- Scripts -->
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-BBtl+eGJRgqQAUMxJ7pMwbEyER4l1g+O15P+16Ep7Q9Q+zqX6gSbd85u4mG4QzX+" crossorigin="anonymous"></script>
        <script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
        
        <script>
            // Initialize Bootstrap tabs
            function initTabs() {
                const tabButtons = document.querySelectorAll('#pills-tab button[data-bs-toggle="tab"]');
                const tabPanes = document.querySelectorAll('#pills-tabContent .tab-pane');
                
                tabButtons.forEach(button => {
                    button.addEventListener('click', function(e) {
                        e.preventDefault();
                        const targetId = this.getAttribute('data-bs-target');
                        
                        tabButtons.forEach(btn => {
                            btn.classList.remove('active');
                            btn.setAttribute('aria-selected', 'false');
                        });
                        tabPanes.forEach(pane => {
                            pane.classList.remove('show', 'active');
                        });
                        
                        this.classList.add('active');
                        this.setAttribute('aria-selected', 'true');
                        const targetPane = document.querySelector(targetId);
                        if (targetPane) {
                            targetPane.classList.add('show', 'active');
                        }
                        
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
            
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initTabs);
            } else {
                initTabs();
            }
            
            setTimeout(initTabs, 500);
            
            // Swiper initialization
            var swiper = new Swiper(".myCaseSwiper", {
                slidesPerView: 2,
                spaceBetween: 30,
                loop: true,
                navigation: {
                    nextEl: ".custom-next",
                    prevEl: ".custom-prev",
                },
                breakpoints: {
                    0: { slidesPerView: 1 },
                    768: { slidesPerView: 2 },
                },
            });

            // FAQ functionality
            const faqButtons = document.querySelectorAll(".faq-question");
            faqButtons.forEach((btn) => {
                btn.addEventListener("click", function () {
                    const item = this.parentElement;
                    const answer = item.querySelector(".faq-answer");
                    
                    document.querySelectorAll(".faq-item").forEach((faq) => {
                        if (faq !== item) {
                            faq.querySelector(".faq-question").classList.remove("active");
                            let ans = faq.querySelector(".faq-answer");
                            ans.style.maxHeight = null;
                        }
                    });
                    
                    this.classList.toggle("active");
                    if (answer.style.maxHeight) {
                        answer.style.maxHeight = null;
                    } else {
                        answer.style.maxHeight = answer.scrollHeight + "px";
                    }
                });
            });

            // Scroll animations
            function scrollAnimate(className) {
                const elements = document.querySelectorAll(className);
                elements.forEach(el => {
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

            window.addEventListener('scroll', checkScroll);
            window.addEventListener('load', checkScroll);
        </script>
    </div>
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

    // Create the prompt for content generation for template6
    const prompt = `I need you to act like an expert SEO content writer who achieves humanized content with Flesch Kincaid's score between 60 to 70 and also with the Surfer SEO score of 90 and above.

Generate complete content structure for a landing page. User input: "${userInput}"

This is a website development/service landing page template. Generate content based on the user's input topic - adapt all content sections to match the user's specific service, industry, or business type.

CRITICAL: Generate ALL sections. Every single section is MANDATORY and must be included in your JSON response. Do NOT skip any section. Do NOT use placeholders. Do NOT leave sections empty.

REQUIRED SECTIONS (ALL MUST BE GENERATED):
1. Page Meta (page_title, meta_description, meta_keywords, canonical_url) - MANDATORY
2. Banner (title, description, stats array with 3 stats, cta_text, cta_link) - MANDATORY
3. Info Section (heading with span tag like "We Don't Just Build Websites- <span>We Build Digital Experiences</span>", paragraphs array with 2-3 paragraphs, portfolio_link, portfolio_text) - MANDATORY
NOTE: Trusted Brands section uses static content from template, no generation needed.
5. Case Studies (array with at least 6 case studies, each with image, alt) - MANDATORY
6. How We Craft (heading, description, items array with at least 5 items, each with image, title, description, cta_link, cta_text) - MANDATORY
7. What's Standing (heading, items array with 4 items, each with title, description) - MANDATORY
8. We Are Number One (heading, description, features array with at least 9 features, each with image, title, description) - MANDATORY
9. Premium Design (heading, paragraphs array with 2 paragraphs, list_heading, list_items array with at least 8 items) - MANDATORY
10. All-in-One (heading, description, tabs array with 4 tabs, each tab with id, name, items array with EXACTLY 6 items (no more, no less), each item with image, name) - MANDATORY
11. Development Process (heading should be AI-generated based on the service, NOT hardcoded to "Our Web Development Process", description should be AI-generated and related to the service provided, steps array with at least 9 steps, each with title, description) - MANDATORY
13. Industry We Serve (heading, industries array with at least 6 industries, each with name, description) - MANDATORY - NOTE: Images will be auto-assigned, just provide name and description
14. Why Choose (heading, image, description, cta_link, cta_text) - MANDATORY
15. FAQs (heading, faqs_list array with at least 20 FAQs, each with question, answer which can be string or array of objects with tag and content) - MANDATORY

NOTE: Case Study Section, Trending Blogs, and Our Services sections are static and will not be generated - they are kept as original template content.

IMPORTANT: 
- Generate ALL sections listed above - EVERY section is required, no exceptions
- Write detailed, comprehensive descriptions (3-4 sentences, 60-100 words minimum)
- Make content rich and informative - not just one line
- Use realistic image URLs from brandstory.in or similar domains
- Stats should be realistic (e.g., "12+ Years of Excellence", "1000+ Projects")
- Case studies should have realistic image URLs
- Testimonials should be realistic and varied
- FAQs should have detailed answers (3-4 sentences each minimum)
- Return ONLY valid JSON, no markdown, no code blocks

{
  "page_title": "SEO-optimized page title (60 characters max)",
  "meta_description": "Meta description (150-160 characters)",
  "meta_keywords": "comma-separated keywords",
  "canonical_url": "https://brandstory.in/your-page/",
  "banner": {
    "title": "Main headline for banner (H1, 50-70 characters)",
    "description": "Banner description paragraph (3-4 sentences, 100-150 words)",
    "stats": [
      "12+ Years of Excellence",
      "1000+ Projects Completed",
      "4.9★ Client Rating"
    ],
    "cta_text": "Contact Us",
    "cta_link": "https://brandstory.in/contact-us/"
  },
  "trusted_brands": {
    "heading": "Trusted by Top Brands Across Industries",
    "logos": [
      "https://brandstory.in/website-development-company-in-bangalore/images/partner/1.png",
      "https://brandstory.in/website-development-company-in-bangalore/images/partner/2.png"
    ]
  },
  "info": {
    "heading": "We Don't Just Build Websites- <span>We Build Digital Experiences</span>",
    "paragraphs": [
      "First paragraph (3-4 sentences, 100-150 words)",
      "Second paragraph (3-4 sentences, 100-150 words)"
    ],
    "portfolio_link": "https://brandstory.in/resources/portfolio/",
    "portfolio_text": "View Our Portfolio"
  },
  "case_studies": [
    {
      "image": "https://brandstory.in/website-development-company-in-bangalore/images/weBuildImgSwiper-img (1).png",
      "alt": "Case study 1"
    }
  ],
  "how_we_craft": {
    "heading": "How We Craft Digital Identity for Businesses",
    "description": "Description paragraph (3-4 sentences, 100-150 words)",
    "items": [
      {
        "image": "https://brandstory.in/website-development-company-in-bangalore/images/Purpose-Driven-Design.png",
        "title": "Item Title",
        "description": "Item description (2-3 sentences, 50-80 words)"
      }
    ],
    "cta_link": "https://brandstory.in/contact-us/",
    "cta_text": "Contact Us"
  },
  "whats_standing": {
    "heading": "What's Standing Between You and Digital Success?",
    "items": [
      {
        "title": "Challenge Title",
        "description": "Challenge description (2-3 sentences, 60-100 words)"
      }
    ]
  },
  "we_are_number_one": {
    "heading": "We are The No. 1 Service Provider",
    "description": "Description paragraph (3-4 sentences, 100-150 words)",
    "features": [
      {
        "image": "https://brandstory.in/website-development-company-in-bangalore/images/no_1_dev_img1.svg",
        "title": "Feature Title",
        "description": "Feature description (2-3 sentences, 60-100 words)"
      }
    ]
  },
  "premium_design": {
    "heading": "Premier Service Provider",
    "paragraphs": [
      "First paragraph (3-4 sentences, 100-150 words)",
      "Second paragraph (3-4 sentences, 100-150 words)"
    ],
    "list_heading": "Explore what we can deliver:",
    "list_items": [
      "List item 1",
      "List item 2"
    ]
  },
  "all_in_one": {
    "heading": "All-in-One Services - We Have Full-Scale Expertise",
    "description": "Description paragraph (3-4 sentences, 100-150 words)",
    "tabs": [
      {
        "id": "design",
        "name": "Design & Prototyping",
        "items": [
          {
            "image": "https://brandstory.in/website-development-company-in-bangalore/images/dp-img1.png",
            "name": "Adobe Photoshop"
          }
        ]
      }
    ]
  }
  NOTE: Each tab must have EXACTLY 6 items in the items array (no more, no less).
  },
  "development_process": {
    "heading": "AI-generated heading based on the service (e.g., 'Our LinkedIn Marketing Process', 'Our SEO Optimization Process', etc.) - NOT hardcoded to 'Our Web Development Process'",
    "description": "AI-generated description related to the service provided (2-3 sentences, 60-100 words) - must be relevant to the service, not generic web development",
    "steps": [
      {
        "title": "Step Title",
        "description": "Step description (2-3 sentences, 50-80 words)"
      }
    ]
  },
  "industry_we_serve": {
    "heading": "Industry We Serve",
    "industries": [
      {
        "name": "Industry Name",
        "description": "Industry description (2-3 sentences, 60-100 words)"
      }
    ]
  },
  "why_choose": {
    "heading": "Why Choose BrandStory As Your Service Provider?",
    "image": "https://brandstory.in/website-development-company-in-bangalore/images/why-choos.png",
    "description": "Description paragraph (4-5 sentences, 150-200 words)",
    "cta_link": "https://brandstory.in/contact-us/",
    "cta_text": "Contact Us"
  },
  "our_clients": {
    "heading": "Hear Genuine Feedback from Our Clients"
  },
  "faqs": {
    "heading": "Frequently Asked Questions",
    "faqs_list": [
      {
        "question": "FAQ question",
        "answer": "Detailed answer (3-4 sentences, 80-120 words)"
      }
    ]
  }
}
NOTE: Generate at least 20 FAQs in the faqs_list array.
}

CRITICAL REQUIREMENTS:
- Generate ALL content sections based on user input: "${userInput}"
- Fill EVERY field with real, specific content - NO placeholders
- Generate minimum items: 6 case studies (first), 5 how_we_craft items, 4 whats_standing items, 9 features (first we_are_number_one), 8 list items, 4 tabs with EXACTLY 6 items each (no more, no less), 9 development process steps, 6 industries, 20 FAQs
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
              content: 'You are a person. A real human being. You are an expert SEO content writer who writes exactly like a human would write - naturally, conversationally, with imperfections and personality. Achieve Flesch Kincaid\'s score between 60 to 70 and Surfer SEO score of 90 and above. Write as a real person, not as an AI. Generate complete, detailed content structures in valid JSON format only.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: modelConfig.maxTokens,
          temperature: 0.9,
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

    // Validate that we have all required content sections for template6
    const requiredSections = [
      'banner', 'trusted_brands', 'info', 'case_studies', 'how_we_craft', 
      'whats_standing', 'we_are_number_one', 'premium_design', 'all_in_one',
      'development_process', 'industry_we_serve',
      'why_choose', 'faqs'
    ]
    
    const missingSections = requiredSections.filter(section => {
      if (section === 'case_studies') return !contentData.case_studies || contentData.case_studies.length === 0
      if (section === 'trusted_brands') return !contentData.trusted_brands // This is static now
      if (section === 'development_process') return !contentData.development_process?.steps || contentData.development_process.steps.length === 0
      if (section === 'industry_we_serve') return !contentData.industry_we_serve?.industries || contentData.industry_we_serve.industries.length === 0
      if (section === 'faqs') return !contentData.faqs?.faqs_list || contentData.faqs.faqs_list.length < 20
      return !contentData[section]
    })
    
    if (missingSections.length > 0) {
      console.warn(`Warning: Missing sections: ${missingSections.join(', ')}`)
    }

    // Generate HTML
    const htmlContent = generateHTMLPage(contentData)

    // Create ZIP file with HTML only
    const archive = archiver('zip', { zlib: { level: 9 } })
    const chunks: Buffer[] = []

    archive.on('data', (chunk: Buffer) => {
      chunks.push(chunk)
    })

    // Add HTML file only
    archive.append(htmlContent, { name: 'index.html' })

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
        'Content-Disposition': `attachment; filename="generated-template6-${Date.now()}.zip"`,
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

