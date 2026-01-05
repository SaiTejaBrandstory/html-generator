import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import archiver from 'archiver'
import { createReadStream, readdirSync, statSync } from 'fs'
import { join } from 'path'

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

// Generate complete HTML page with all sections for template4
function generateHTMLPage(content: any): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(content.page_title || 'Generated Page')}</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
    
    <!-- CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link href="https://brandstory.in/pr-agency-in-bangalore/assets/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://brandstory.in/pr-agency-in-bangalore/assets/css/menu.css?key=1765973977" rel="stylesheet">
    <link href="https://brandstory.in/pr-agency-in-bangalore/assets/css/global.css?key=1765973977" rel="stylesheet">
    <link href="https://brandstory.in/pr-agency-in-bangalore/assets/css/style.css?key=1765973977" rel="stylesheet">
    <link href="https://brandstory.in/pr-agency-in-bangalore/assets/css/mystyle.css?key=1765973977" rel="stylesheet">
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
    
    <style>
      body.pr-company-in-blr {
        font-family: 'Hanken Grotesk', sans-serif;
      }
      .accordion-collapse.show .accordion-body {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      .custom-accordion .accordion-collapse.show .accordion-body {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      .real-pr-accordion .accordion-collapse.show .accordion-body {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      .real-pr-accordion .accordion-collapse.show {
        display: block !important;
      }
      .faq-accordion .accordion-collapse.show .accordion-body {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      .faq-accordion .accordion-collapse.show {
        display: block !important;
      }
      .accordion-collapse.show .solution-box {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      /* Smooth tab transitions */
      .tab-pane {
        transition: opacity 0.3s ease-in-out;
      }
      .tab-pane.fade {
        opacity: 0;
        transition: opacity 0.3s ease-in-out;
      }
      .tab-pane.fade.show {
        opacity: 1;
      }
      .nav-tabs .nav-link {
        transition: all 0.3s ease-in-out;
      }
      .nav-tabs .nav-link:hover {
        transition: all 0.3s ease-in-out;
      }
    </style>
</head>
<body class="pr-company-in-blr">
    <!-- Hero Banner -->
    <section class="sp-100 pr-banner cus-pr-banner" fetchpriority="high">
        <div class="container">
            <div class="row" data-aos="fade-up">
                <div class="col-lg-8 col-12">
                    <h1 class="text-white">${escapeHtml(content.hero?.title || '')} <span class="db">${escapeHtml(content.hero?.subtitle || '')}</span></h1>
                    <p class="text-start text-white">${escapeHtml(content.hero?.description || '')}</p>
                    <div class="my-5" data-aos="fade-up">
                        <a href="${escapeHtml(content.hero?.cta_link || 'https://brandstory.in/contact-us/')}" class="explore-btn my-4">${escapeHtml(content.hero?.cta_text || '')}</a>
                    </div>
                </div>
                <div class="col-lg-4 d-lg-block d-none col-12"></div>
            </div>
        </div>
    </section>

    <!-- PR Agency Hero Section with Image -->
    <section class="sp-60 bg-white" style="padding-top: 4rem; padding-bottom: 4rem;">
        <div class="container">
            <div class="row align-items-center justify-content-center">
                <div class="col-lg-6 mb-4 mb-lg-0 order-lg-1 order-2" data-aos="fade-up">
                    <div class="text-center">
                        <img src="https://brandstory.in/pr-agency-in-bangalore/assets/images/pr-company-in-blr/what-makes-bsd.png" loading="lazy" alt="${escapeHtml(content.hero_section?.image_alt || '')}" class="img-fluid rounded-4 shadow" style="max-width: 100%; height: auto;">
                    </div>
                </div>
                <div class="col-lg-6 order-lg-2 order-1" data-aos="fade-up">
                    <h2 class="fw-bold mb-3">${escapeHtml(content.hero_section?.heading || '')}</h2>
                    ${(content.hero_section?.paragraphs || []).map((para: string) => `<p class="mb-3">${escapeHtml(para)}</p>`).join('')}
                </div>
            </div>
        </div>
    </section>

    <!-- PR Challenges Section -->
    <section class="pr-challenges-section py-3">
        <div class="container">
            <h2 class="fw-bold mb-4 text-center">${escapeHtml(content.challenges?.heading || '')}</h2>
            <div class="row align-items-center">
                <div class="col-lg-7 mb-4 mb-lg-0" data-aos="fade-up">
                    <div class="accordion custom-accordion real-pr-accordion" id="prChallengesAccordion">
                        ${(content.challenges?.items || []).map((item: any, index: number) => {
                          // Ensure at least one item is open (preferably 3rd item, or first if less than 3)
                          const shouldBeOpen = item.open !== undefined ? item.open : (index === 2 || (index === 0 && (content.challenges?.items || []).length < 3))
                          return `
                        <div class="accordion-item border-0 mb-2">
                            <h2 class="accordion-header" id="challenge${item.id || index}">
                                <button class="accordion-button ${shouldBeOpen ? '' : 'collapsed'} d-flex align-items-center" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${item.id || index}" aria-expanded="${shouldBeOpen ? 'true' : 'false'}" aria-controls="collapse${item.id || index}">
                                    <span class="icon-circle bg-danger me-3"><i class="bi bi-x-lg text-white"></i></span>
                                    <span class="fw-semibold">"${escapeHtml(item.challenge || '')}"</span>
                                </button>
                            </h2>
                            <div id="collapse${item.id || index}" class="accordion-collapse collapse ${shouldBeOpen ? 'show' : ''}" aria-labelledby="challenge${item.id || index}" data-bs-parent="#prChallengesAccordion">
                                <div class="accordion-body p-0">
                                    <div class="solution-box mt-3 mb-2 p-3">
                                        <div class="d-flex align-items-center mb-2">
                                            <span class="icon-circle bg-success me-2"><i class="bi bi-check-lg text-white"></i></span>
                                            <span class="fw-bold text-success">${escapeHtml(item.solution || '')}</span>
                                        </div>
                                        <div class="solution-desc text-muted ps-4">
                                            ${escapeHtml(item.description || '')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        `
                        }).join('')}
                    </div>
                </div>
                <div class="col-lg-5 text-center" data-aos="fade-up">
                    <img src="https://brandstory.in/pr-agency-in-bangalore/assets/images/pr-company-in-blr/solv-pr-challenge-sec.png" loading="lazy" alt="Challenges" class="img-fluid rounded-4 shadow mb-4 mb-md-0" style="max-width: 100%; height: auto;">
                </div>
            </div>
        </div>
    </section>

    <!-- Strategic PR Services Section -->
    <section class="pr-services-section sp-60" style="padding-top: 4rem; padding-bottom: 4rem;">
        <div class="container" data-aos="fade-up">
            <h2 class="fw-bold text-center mb-3">${escapeHtml(content.services?.heading || '')}</h2>
            <p class="text-center mb-4">${escapeHtml(content.services?.description || '')}</p>
            <ul class="nav nav-tabs pr-services-tabs justify-content-center mb-4" id="prServicesTab" role="tablist">
                ${(content.services?.tabs || []).map((tab: any, idx: number) => `
                <li class="nav-item" role="presentation">
                    <button class="nav-link ${idx === 0 ? 'active' : ''}" id="${tab.id || `tab-${idx}`}-tab" data-bs-toggle="tab" data-bs-target="#${tab.id || `tab-${idx}`}" type="button" role="tab" aria-controls="${tab.id || `tab-${idx}`}" aria-selected="${idx === 0 ? 'true' : 'false'}">${escapeHtml(tab.name || '')}</button>
                </li>
                `).join('')}
            </ul>
            <div class="tab-content pr-services-tab-content" id="prServicesTabContent">
                ${(content.services?.tabs || []).map((tab: any, idx: number) => `
                <div class="tab-pane fade ${idx === 0 ? 'show active' : ''}" id="${tab.id || `tab-${idx}`}" role="tabpanel" aria-labelledby="${tab.id || `tab-${idx}`}-tab">
                    <div class="row align-items-start g-4">
                        <div class="col-lg-6" data-aos="fade-up">
                            <p>${escapeHtml(tab.description || '')}</p>
                            <ul>
                                ${(tab.features || []).map((feature: string) => `<li>${escapeHtml(feature)}</li>`).join('')}
                            </ul>
                        </div>
                        <div class="col-lg-6 text-center" data-aos="fade-up">
                            <img src="${escapeHtml(tab.image || 'https://brandstory.in/pr-agency-in-bangalore/assets/images/pr-company-in-blr/str-serv-img1.png')}" loading="lazy" alt="${escapeHtml(tab.name || '')}" class="img-fluid rounded-4 shadow" style="max-width: 100%; height: auto;">
                        </div>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>

    <!-- What Makes BrandStory Your Right PR Partner Section -->
    <section class="pr-right-partner-section py-5 bg-black what-makes-bsd-sec">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-12 mb-4" data-aos="fade-up">
                    <h2 class="fw-bold mb-2 pr-right-heading">
                        ${escapeHtml(content.partner_section?.heading || '')} <br>
                        <span class="text-violet" style="color: #8f5fe8;">${escapeHtml(content.partner_section?.heading_highlight || '')}</span>
                    </h2>
                    <p class="pr-right-desc" style="color: #d1d1d1; text-align: left; max-width: 700px;">
                        ${escapeHtml(content.partner_section?.description || '')}
                    </p>
                </div>
                <div class="col-lg-6 mb-4 mb-lg-0" data-aos="fade-up">
                    <img src="https://brandstory.in/pr-agency-in-bangalore/assets/images/pr-company-in-blr/what-makes-bsd.png" loading="lazy" alt="Partner" class="img-fluid rounded-4 shadow" style="max-width: 100%; height: auto;">
                </div>
                <div class="col-lg-6" data-aos="fade-up">
                    <div class="accordion custom-accordion" id="rightPartnerAccordion">
                        ${(content.partner_section?.items || []).map((item: any, index: number) => {
                          // Ensure first item is open by default
                          const shouldBeOpen = item.open !== undefined ? item.open : (index === 0)
                          return `
                        <div class="accordion-item mb-2">
                            <h2 class="accordion-header" id="heading${item.id || index}">
                                <button class="accordion-button ${shouldBeOpen ? '' : 'collapsed'}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${item.id || index}" aria-expanded="${shouldBeOpen ? 'true' : 'false'}" aria-controls="collapse${item.id || index}">
                                    ${escapeHtml(item.title || '')}
                                    <span class="accordion-arrow"></span>
                                </button>
                            </h2>
                            <div id="collapse${item.id || index}" class="accordion-collapse collapse ${shouldBeOpen ? 'show' : ''}" aria-labelledby="heading${item.id || index}" data-bs-parent="#rightPartnerAccordion">
                                <div class="accordion-body">
                                    ${escapeHtml(item.content || '')}
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

    <!-- Industries We Serve Section -->
    <section class="industries-section py-5 bg-light custom-pr-industries">
        <div class="container">
            <h2 class="fw-bold text-center mb-3" style="font-size: 2.1rem; color: #18171d;">
                ${escapeHtml(content.industries?.heading || '')}
            </h2>
            <p class="text-center mb-5 mx-auto" style="max-width: 1010px; color: #444;">
                ${escapeHtml(content.industries?.description || '')}
            </p>
            <div class="industries-grid bg-white rounded-4 p-4 mt-4 shadow-sm">
                <div class="row g-3 justify-content-start">
                    ${(content.industries?.industries_list || []).map((industry: any, idx: number) => `
                    <div class="col-6 col-md-3 d-flex align-items-center mb-3">
                        <img src="${escapeHtml(industry.icon || `https://brandstory.in/pr-agency-in-bangalore/assets/images/pr-company-in-blr/icon-${String(idx + 1).padStart(2, '0')}.svg`)}" loading="lazy" alt="${escapeHtml(industry.name || '')}" class="me-2 me-md-3" width="38" height="38">
                        <p class="mb-0 fw-600 fs-20">${escapeHtml(industry.name || '')}</p>
                    </div>
                    `).join('')}
                </div>
            </div>
        </div>
    </section>

    <!-- FAQ Section -->
    <section class="faq-section py-5 faq-pr-sec">
        <div class="container">
            <h2 class="fw-bold text-center mb-4">${escapeHtml(content.faqs?.heading || 'Frequently Asked Questions')}</h2>
            <div class="accordion faq-accordion" id="faqAccordion">
                ${(content.faqs?.faqs_list || []).map((faq: any, index: number) => `
                <div class="accordion-item">
                    <h2 class="accordion-header" id="faqHeading${index}">
                        <button class="accordion-button ${index === 0 ? '' : 'collapsed'}" type="button" data-bs-toggle="collapse" data-bs-target="#faqCollapse${index}" aria-expanded="${index === 0 ? 'true' : 'false'}" aria-controls="faqCollapse${index}">
                            ${escapeHtml(faq.question || '')}
                        </button>
                    </h2>
                    <div id="faqCollapse${index}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" aria-labelledby="faqHeading${index}" data-bs-parent="#faqAccordion">
                        <div class="accordion-body">
                            ${escapeHtml(faq.answer || '')}
                        </div>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="spt-60 bg-black" style="padding-top: 3rem;">
        <div class="container">
            <h2 class="text-white mb-3 text-center mb-4">${escapeHtml(content.cta?.heading || '')}</h2>
            <div class="goalsbtn d-flex justify-content-center mb-5">
                <a class="text-black bg-white text-decoration-none px-4 py-2 rounded-pill" href="${escapeHtml(content.cta?.cta_link || 'https://brandstory.in/contact-us/')}">${escapeHtml(content.cta?.cta_text || 'Contact Us')}</a>
            </div>
            <div class="row">
                <div class="col-md-4 col-4 text-center"><img class="w-90 image-fluid" src="https://brandstory.in/pr-agency-in-bangalore/assets/images/real-estate-video-production-company/call-semi.svg" alt="Call"></div>
                <div class="col-md-4 col-4 text-center"><img class="w-90 image-fluid" src="https://brandstory.in/pr-agency-in-bangalore/assets/images/real-estate-video-production-company/mail-semi.svg" alt="Email"></div>
                <div class="col-md-4 col-4 text-center"><img class="w-90 image-fluid" src="https://brandstory.in/pr-agency-in-bangalore/assets/images/real-estate-video-production-company/c-semi.svg" loading="lazy" alt="Contact"></div>
            </div>
        </div>
    </section>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/js/bootstrap.bundle.min.js" integrity="sha384-k6d4wzSIapyDyv1kpU366/PK5hCdSbCRGRCMv+eplOQJWyd1fbcAu9OCUj5zNLiq" crossorigin="anonymous"></script>
    <script src="https://brandstory.in/pr-agency-in-bangalore/assets/js/jquery.min.js"></script>
    <script src="https://brandstory.in/pr-agency-in-bangalore/assets/js/menu.js"></script>
    <script src="https://brandstory.in/pr-agency-in-bangalore/assets/js/site.js"></script>
    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
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

    // Create the prompt for content generation for template4
    const prompt = `I need you to act like an expert SEO content writer who achieves humanized content with Flesch Kincaid's score between 60 to 70 and also with the Surfer SEO score of 90 and above.

Generate complete content structure for a landing page. User input: "${userInput}"

This is a PR agency/service landing page template. Generate content based on the user's input topic - adapt all content sections to match the user's specific service, industry, or business type.

CRITICAL: Generate ALL 8 sections. Every single section is MANDATORY and must be included in your JSON response. Do NOT skip any section. Do NOT use placeholders. Do NOT leave sections empty.

REQUIRED SECTIONS (ALL MUST BE GENERATED):
1. Hero (title, subtitle, description, cta_text, cta_link) - MANDATORY
2. Hero Section (heading, paragraphs array with 3 paragraphs, image_alt) - MANDATORY
3. Challenges (heading, items array with challenge, solution, description, id, open boolean) - MANDATORY - Generate at least 5-7 challenge items. IMPORTANT: Set open: true for the 3rd item (index 2) OR the first item if less than 3 items. All other items should have open: false.
4. Services (heading, description, tabs array with name, id, description, features array, image) - MANDATORY - Generate at least 5 service tabs
5. Partner Section (heading, heading_highlight, description, items array with title, content, id, open boolean) - MANDATORY - Generate at least 5 items. IMPORTANT: Set open: true for the FIRST item (index 0). All other items should have open: false.
6. Industries (heading, description, industries_list array with name, icon) - MANDATORY - Generate at least 12-18 industries
7. FAQs (heading, faqs_list array with question, answer) - MANDATORY - Generate at least 8-10 FAQs
8. CTA (heading, cta_text, cta_link) - MANDATORY

IMPORTANT: 
- Generate ALL 8 sections listed above - EVERY section is required, no exceptions
- Write detailed, comprehensive descriptions (3-4 sentences, 60-100 words minimum)
- Make content rich and informative - not just one line
- Challenges: Each item needs challenge (problem statement), solution (brief solution title), description (detailed explanation)
- Services: Each tab needs name, description, and features array (at least 4-6 features per service)
- Partner Section: Each item needs title and detailed content (3-4 sentences)
- Industries: Generate realistic industry names based on user input
- FAQs: Generate realistic questions and detailed answers (3-4 sentences each)
- Return ONLY valid JSON, no markdown, no code blocks

{
  "page_title": "SEO-optimized page title (60 characters max)",
  "hero": {
    "title": "Main headline for hero banner (H1, 50-60 characters)",
    "subtitle": "Subtitle text (20-30 characters)",
    "description": "Hero description paragraph (3-4 sentences, 80-120 words)",
    "cta_text": "Call-to-action button text",
    "cta_link": "https://brandstory.in/contact-us/"
  },
  "hero_section": {
    "heading": "Main heading for hero section with image",
    "paragraphs": [
      "First paragraph (3-4 sentences, 80-120 words)",
      "Second paragraph (3-4 sentences, 80-120 words)",
      "Third paragraph (3-4 sentences, 80-120 words)"
    ],
    "image_alt": "Alt text for image"
  },
  "challenges": {
    "heading": "Heading for challenges section",
    "items": [
      {
        "id": "One",
        "challenge": "Problem statement (1-2 sentences)",
        "solution": "Solution title (5-10 words)",
        "description": "Detailed solution description (3-4 sentences, 60-100 words)",
        "open": false
      }
    ]
    NOTE: Set open: true for the 3rd item (index 2) OR first item if less than 3 items. All others should be false.
    ]
  },
  "services": {
    "heading": "Heading for services section",
    "description": "Services section description (3-4 sentences, 80-120 words)",
    "tabs": [
      {
        "name": "Service name",
        "id": "service-1",
        "description": "Service description (3-4 sentences, 80-120 words)",
        "features": [
          "Feature 1",
          "Feature 2",
          "Feature 3",
          "Feature 4"
        ],
        "image": "https://brandstory.in/pr-agency-in-bangalore/assets/images/pr-company-in-blr/str-serv-img1.png"
      }
    ]
  },
  "partner_section": {
    "heading": "Main heading",
    "heading_highlight": "Highlighted part of heading",
    "description": "Description paragraph (3-4 sentences, 80-120 words)",
    "items": [
      {
        "id": "OneRight",
        "title": "Item title",
        "content": "Detailed content (3-4 sentences, 60-100 words)",
        "open": true
      }
    ]
    NOTE: Set open: true for the FIRST item only. All others should be false.
    ]
  },
  "industries": {
    "heading": "Heading for industries section",
    "description": "Industries description (3-4 sentences, 80-120 words)",
    "industries_list": [
      {
        "name": "Industry name",
        "icon": "https://brandstory.in/pr-agency-in-bangalore/assets/images/pr-company-in-blr/icon-01.svg"
      }
    ]
  },
  "faqs": {
    "heading": "Frequently Asked Questions",
    "faqs_list": [
      {
        "question": "FAQ question",
        "answer": "Detailed answer (3-4 sentences, 60-100 words)"
      }
    ]
  },
  "cta": {
    "heading": "CTA heading",
    "cta_text": "CTA button text",
    "cta_link": "https://brandstory.in/contact-us/"
  }
}

CRITICAL REQUIREMENTS:
- Generate ALL content sections based on user input: "${userInput}"
- Fill EVERY field with real, specific content - NO placeholders
- Generate minimum items: 5-7 challenges, 5 services, 5 partner items, 12-18 industries, 8-10 FAQs
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

    // Validate that we have all required content sections for template4
    const requiredSections = [
      'hero', 'hero_section', 'challenges', 'services', 'partner_section', 
      'industries', 'faqs', 'cta'
    ]
    
    const missingSections = requiredSections.filter(section => {
      if (section === 'challenges') return !contentData.challenges?.items || contentData.challenges.items.length === 0
      if (section === 'services') return !contentData.services?.tabs || contentData.services.tabs.length === 0
      if (section === 'partner_section') return !contentData.partner_section?.items || contentData.partner_section.items.length === 0
      if (section === 'industries') return !contentData.industries?.industries_list || contentData.industries.industries_list.length === 0
      if (section === 'faqs') return !contentData.faqs?.faqs_list || contentData.faqs.faqs_list.length === 0
      return !contentData[section]
    })
    
    if (missingSections.length > 0) {
      console.warn(`Warning: Missing sections: ${missingSections.join(', ')}`)
    }

    // Generate HTML
    const htmlContent = generateHTMLPage(contentData)

    // Create ZIP file with HTML only (no assets needed for template 4)
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
        'Content-Disposition': `attachment; filename="generated-template4-${Date.now()}.zip"`,
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

