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

// Generate complete HTML page with all sections
function generateHTMLPage(content: any): string {
  return `<!doctype html>
<html lang="en">
<head>
<!-- Required meta tags -->
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(content.page_title || 'Generated Landing Page')}</title>
<meta name="description" content="${escapeHtml(content.meta_description || '')}">
<meta name="Keywords" content="${escapeHtml(content.meta_keywords || '')}">
<meta name="robots" content="INDEX, FOLLOW">

<!--CSS -->
<link href="https://relgrow.com/assets/css/ionicons.min.css" rel="stylesheet">
<link href="https://relgrow.com/assets/css/menu.css" rel="stylesheet">
<link href="https://relgrow.com/assets/css/bootstrap.min.css" rel="stylesheet">
<link href="https://relgrow.com/assets/css/skin.css" rel="stylesheet">
<link href="https://relgrow.com/assets/css/dev.css" rel="stylesheet">
<link href="https://relgrow.com/assets/css/global.css" rel="stylesheet">
<link href="https://relgrow.com/assets/css/swiper.css" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/fancybox/3.5.7/jquery.fancybox.min.css">
</head>
<body class="new-fire-hydrant landscape-contractors">
<div class="page-content">
<!-- Page Content Start-->

<!-- Section 1: Banner -->
<section class="inner--banner seo--banner bg-lblue">
	<div class="container">
		<div class="row gx-lg-4 col-reverse align-items-center">
			<div class="col-md-6 d-flex align-items-stretch">
				<div class="sp-50 inner--banner-lft">
					<h1>${escapeHtml(content.banner?.title || '')}</h1>
					<p class="mt-3">${escapeHtml(content.banner?.description || '')}</p>
					<div class="mt-4">
						<div class="contact-btns">
							<a class="btn-blue" href="${escapeHtml(content.banner?.cta_link || '#')}">${escapeHtml(content.banner?.cta_text || '')}</a>
						</div>
					</div>
				</div>
			</div>
			<div class="col-md-6 d-flex align-items-stretch">
				<div class="inner--banner-img">
					<img src="https://relgrow.com/assets/images/landscape-contractors-in-bangalore/landscaping-banner.png" class="img-fluid" alt="${escapeHtml(content.banner?.title || '')}">
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Section 2: Our Landscaping Services -->
<section class="sp-50">
	<div class="container">
		<h2 class="text-center mb-3 mt-4 mt-md-2 mt-lg-0">${escapeHtml(content.landscaping_services?.heading || '')}</h2>
		<p class="text-center mb-3">${escapeHtml(content.landscaping_services?.subheading || '')}</p>
		<h4 class="text-center mb-3">${escapeHtml(content.landscaping_services?.section_heading || '')}</h4>
		<p class="text-center mb-4">${escapeHtml(content.landscaping_services?.section_description || '')}</p>
		<div class="row g-4 justify-content-center">
			${(content.landscaping_services?.services_list || []).map((service: any, index: number) => `
			<div class="col-lg-4 col-md-6 d-flex align-items-stretch flex-column">
				<div class="mb-3">
					<img class="img-fluid w-100" src="https://relgrow.com/assets/images/landscape-contractors-in-bangalore/landscaping-img0${index + 1}.png" alt="${escapeHtml(service.title || '')}">
				</div>
				<h4>${escapeHtml(service.title || '')}</h4>
				<p class="mb-0">${escapeHtml(service.description || '')}</p>
			</div>
			`).join('')}
		</div>
	</div>
</section>

<!-- Section 3: Hardscaping Services -->
<section class="sp-50" style="background:#EBEEFF">
	<div class="container">
		<h2 class="text-center mb-3">${escapeHtml(content.hardscaping_services?.heading || '')}</h2>
		<div class="row gx-4 gy-3">
			<p class="text-center mb-0">${escapeHtml(content.hardscaping_services?.description || '')}</p>
			${(content.hardscaping_services?.services_list || []).map((service: any, index: number) => {
				const imgNum = index + 7
				const imgPath = imgNum < 10 ? `landscaping-img0${imgNum}.png` : `landscaping-img${imgNum}.png`
				return `
			<div class="col-lg-6 col-md-6">
				<div class="row">
					<div class="col-lg-6 col-md-12">
						<div class="mb-lg-0 mb-3">
							<img class="w-100 c-shadow" src="https://relgrow.com/assets/images/landscape-contractors-in-bangalore/${imgPath}" alt="${escapeHtml(service.title || '')}">
						</div>
					</div>
					<div class="col-lg-6 col-md-12 align-self-center">
						<h5 class="lh-sm">${escapeHtml(service.title || '')}</h5>
						<p class="mb-0 lh-sm">${escapeHtml(service.description || '')}</p>
					</div>
				</div>
			</div>
			`
			}).join('')}
		</div>
	</div>
</section>

<!-- Section 4: Softscaping Services -->
<section class="sp-50">
	<div class="container">
		<h2 class="text-center mb-3">${escapeHtml(content.softscaping_services?.heading || '')}</h2>
		<p class="text-center mb-4">${escapeHtml(content.softscaping_services?.description || '')}</p>
		<div class="row mb-md-4 mb-5">
			<div class="col-lg-7 col-md-12">
				<div class="mb-lg-0 mb-3">
					<img class="w-100" src="https://relgrow.com/assets/images/landscape-contractors-in-bangalore/landscaping-img11.jpg" alt="${escapeHtml(content.softscaping_services?.lush_landscape?.title || '')}">
				</div>
			</div>
			<div class="col-lg-5 col-md-12 align-self-center mt-0">
				<h4>${escapeHtml(content.softscaping_services?.lush_landscape?.title || '')}</h4>
				<p class="mb-0">${escapeHtml(content.softscaping_services?.lush_landscape?.description || '')}</p>
			</div>
		</div>
		<h2 class="text-center mt-5 mb-3">${escapeHtml(content.softscaping_services?.design_installation?.heading || '')}</h2>
		<p class="text-center mb-4">${escapeHtml(content.softscaping_services?.design_installation?.description || '')}</p>
		<div class="row mb-md-4 mb-5 col-reverse tab-reverse">
			<div class="col-lg-5 col-md-12 align-self-center">
				<h4>${escapeHtml(content.softscaping_services?.design_installation?.residential?.title || '')}</h4>
				<p class="mb-0">${escapeHtml(content.softscaping_services?.design_installation?.residential?.description || '')}</p>
			</div>
			<div class="col-lg-7 col-md-12">
				<div class="mb-lg-0 mb-3">
					<img class="w-100" src="https://relgrow.com/assets/images/landscape-contractors-in-bangalore/landscaping-img12.jpg" alt="${escapeHtml(content.softscaping_services?.design_installation?.residential?.title || '')}">
				</div>
			</div>
		</div>
		<div class="row mb-md-4 mb-5">
			<div class="col-lg-7 col-md-12">
				<div class="mb-lg-0 mb-3">
					<img class="w-100" src="https://relgrow.com/assets/images/landscape-contractors-in-bangalore/landscaping-img13.jpg" alt="${escapeHtml(content.softscaping_services?.design_installation?.commercial?.title || '')}">
				</div>
			</div>
			<div class="col-lg-5 col-md-12 align-self-center">
				<h4>${escapeHtml(content.softscaping_services?.design_installation?.commercial?.title || '')}</h4>
				<p class="mb-0">${escapeHtml(content.softscaping_services?.design_installation?.commercial?.description || '')}</p>
			</div>
		</div>
	</div>
</section>

<!-- Section 5: Water Features -->
<section class="sp-50 bg-dark">
	<div class="container">
		<h2 class="text-center mb-3" style="color:#a6a6a6;">${escapeHtml(content.water_features?.heading || '')}</h2>
		<p class="text-center mb-4" style="color:#A6A6A6;">${escapeHtml(content.water_features?.description || '')}</p>
		<div class="row g-4">
			${(content.water_features?.features_list || []).map((feature: any, index: number) => `
			<div class="col-lg-6 col-md-12 d-flex align-items-strech">
				<div style="border-radius: 32px;border: 1px solid #A6A6A6;padding: 24px 37px;">
					<img class="w-100 mb-3" src="https://relgrow.com/assets/images/landscape-contractors-in-bangalore/landscaping-img1${index + 4}.png" alt="${escapeHtml(feature.title || '')}">
					<h4 class="text-white">${escapeHtml(feature.title || '')}</h4>
					<p style="color:#a6a6a6;">${escapeHtml(feature.description || '')}</p>
				</div>
			</div>
			`).join('')}
		</div>
	</div>
</section>

<!-- Section 6: Our Process -->
<section class="sp-50">
	<div class="container">
		<img class="w-100" src="https://relgrow.com/assets/images/landscape-contractors-in-bangalore/landscaping-img16.png">
		<h2 class="text-center mb-3 mt-4">${escapeHtml(content.process?.heading || '')}</h2>
		<p class="text-center mb-4">${escapeHtml(content.process?.description || '')}</p>
		<div class="row g-5 justify-content-center">
			${(content.process?.steps || []).map((step: any, index: number) => `
			<div class="col-lg-4 col-md-6 mb-4 mb-lg-0">
				<div class="mb-3">
					<img src="https://relgrow.com/assets/images/landscape-contractors-in-bangalore/landscaping-icon0${index + 1}.svg" alt="${escapeHtml(step.title || '')}">
				</div>
				<h4>${escapeHtml(step.title || '')}</h4>
				<p class="mb-0">${escapeHtml(step.description || '')}</p>
			</div>
			`).join('')}
			<div class="col-lg-8 col-md-6 mb-lg-0 mb-4 d-flex">
				<div class="text-center fire-hy-bg w-100 justify-content-center d-flex p-5">
					<div class="align-self-center">
						<h4 class="text-white mb-4">${escapeHtml(content.process?.cta?.text || '')}</h4>
						<div class="contact-btns">
							<a href="${escapeHtml(content.process?.cta?.link || '#')}" contenteditable="false" style="cursor: pointer;">${escapeHtml(content.process?.cta?.button_text || 'Contact Us')}</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Section 7: Why Choose -->
<section class="spb-50">
	<div class="container">
		<h2 class="text-center mb-3">${escapeHtml(content.why_choose?.heading || '')}</h2>
		<p class="text-center mb-4">${escapeHtml(content.why_choose?.description || '')}</p>
		<div class="row g-4 justify-content-center">
			${(content.why_choose?.reasons || []).map((reason: any, index: number) => `
			<div class="col-lg-4 col-md-6 d-flex align-items-stretch flex-column">
				<div class="mb-3">
					<img class="img-fluid" src="https://relgrow.com/assets/images/landscape-contractors-in-bangalore/landscaping-icon0${index + 5}.svg" alt="${escapeHtml(reason.title || '')}">
				</div>
				<h4>${escapeHtml(reason.title || '')}</h4>
				<p class="mb-0">${escapeHtml(reason.description || '')}</p>
			</div>
			`).join('')}
		</div>
	</div>
</section>

<!-- Section 8: Benefits Of Hiring -->
<section class="spb-50 mt-4">
	<div class="container">
		<h2 class="text-center mb-lg-4 mb-3">${escapeHtml(content.benefits?.heading || '')}</h2>
		<p class="text-center mb-4">${escapeHtml(content.benefits?.description || '')}</p>
		<div class="row gx-md-5 mb-lg-4">
			<div class="col-lg-6 col-md-12">
				<div class="mb-lg-0 mb-3">
					<img class="w-100" src="https://relgrow.com/assets/images/landscape-contractors-in-bangalore/landscaping-img17.png" alt="${escapeHtml(content.benefits?.heading || '')}">
				</div>
			</div>
			<div class="col-lg-6 col-md-12 align-self-center">
				${(content.benefits?.benefits_list || []).map((benefit: any) => `
				<h4>${escapeHtml(benefit.title || '')}</h4>
				<p>${escapeHtml(benefit.description || '')}</p>
				`).join('')}
			</div>
		</div>
	</div>
</section>

<!-- Section 9: Testimonials -->
<section class="new-testimonial spb-50">
	<div class="container">
		<h2 class="text-center mb-lg-5 mb-3">${escapeHtml(content.testimonials?.heading || '')}</h2>
		<div class="testi-swiper position-relative">
			<div class="swiper sld-testi">
				<div class="swiper-wrapper">
					${(content.testimonials?.testimonials_list || []).map((testimonial: any, index: number) => `
					<div class="swiper-slide">
						<div class="testimonial-main ${index === 0 ? 'one' : index === 1 ? 'two' : 'three'}">
							<div class="testimonial-quotation mb-2">
								<img src="https://relgrow.com/assets/images/cctv/quotation-mark${index + 1}.svg" alt="Quote">
							</div>
							<div class="testimonial-cnt">
								<p class="mb-3">${escapeHtml(testimonial.text || '')}</p>
								<h4 class="mb-0 text-center">${escapeHtml(testimonial.author || '')}</h4>
							</div>
						</div>
					</div>
					`).join('')}
				</div>
			</div>
			<div class="swiper-pagination testi-pg"></div>
		</div>
	</div>
</section>

<!-- Section 10: FAQ -->
<section class="sp-50">
	<div class="container">
		<h2 class="text-center mb-lg-3">${escapeHtml(content.faqs?.heading || 'FAQs')}</h2>
		<div class="max-1000 site-accord">
			<div class="accordion" id="accordionFAQ">
				${(content.faqs?.faqs_list || []).map((faq: any, index: number) => {
					const isExpanded = index === 0 || faq.expanded === true
					return `
				<div class="accordion-item">
					<h4 class="accordion-header" id="fh${index + 1}">
						<button class="accordion-button ${isExpanded ? '' : 'collapsed'}" type="button" data-bs-toggle="collapse" data-bs-target="#fc${index + 1}" aria-expanded="${isExpanded ? 'true' : 'false'}">
							${escapeHtml(faq.question || '')}
						</button>
					</h4>
					<div id="fc${index + 1}" class="accordion-collapse collapse ${isExpanded ? 'show' : ''}" data-bs-parent="#accordionFAQ">
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
</section>

<a href="javascript:" id="return-to-top" aria-label="up"><span class="upIcon"></span></a>

</div>
<!-- Page Content End-->

<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/fancybox/3.5.7/jquery.fancybox.min.js"></script>
<script>
	$(document).ready(function() {
		$('[data-fancybox="gallery"]').fancybox();
	});
</script>

<script src="https://relgrow.com/assets/js/jquery.min.js"></script>
<script src="https://relgrow.com/assets/js/bootstrap.bundle.min.js"></script>
<script src="https://relgrow.com/assets/js/menu.js"></script>
<script src="https://relgrow.com/assets/js/swiper.js"></script>
<script src="https://relgrow.com/assets/js/site.js"></script>
</body>
</html>`
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

    // Create the prompt for content generation - ALL sections
    const prompt = `Generate complete content structure for Template 8. User input: "${userInput}"

CRITICAL COMPANY INFORMATION:
- The company name is "Relgrow" (NOT "[Your Company Name]", NOT "At [Your Company Name]", NOT any placeholder)
- Always use "Relgrow" or "we at Relgrow" or "Relgrow offers" in all content
- All content must reference Relgrow as the company providing the services
- Use "Relgrow" naturally throughout the content

CRITICAL: Generate ALL sections. All sections are required:
1. Banner (title, description, cta_text, cta_link)
2. Landscaping Services (heading, subheading, section_heading, section_description, 6 services with title and description - 3-4 sentences each)
3. Hardscaping Services (heading, description, 4 services with title and description - 3-4 sentences each)
4. Softscaping Services (heading, description, lush_landscape with title/description, design_installation with heading/description, residential with title/description, commercial with title/description)
5. Water Features (heading, description, 2 features with title and description - 3-4 sentences each)
6. Our Process (heading, description, 4 steps with title and description - 3-4 sentences each, cta with text/button_text/link)
7. Why Choose (heading, description, 3 reasons with title and description - 3-4 sentences each)
8. Benefits Of Hiring (heading, description, 3 benefits with title and description - 3-4 sentences each)
9. Testimonials (heading, 3 testimonials with text and author)
10. FAQs (heading, MINIMUM 20 FAQs with question, answer - 3-4 sentences, expanded true for first)

IMPORTANT:
- Generate ALL sections - do not skip any
- ALL HEADINGS MUST BE CUSTOMIZED based on user input topic - DO NOT use generic headings like "Our Landscaping Services" or "Hardscaping Services"
- If user input is about "Kitchen Design", headings should be "Our Kitchen Design Services", "Kitchen Installation Services", etc.
- If user input is about "Interior Design", headings should be "Our Interior Design Services", "Design Solutions", etc.
- Headings must be relevant and specific to the user's input topic, not generic landscaping terms
- Write detailed, comprehensive descriptions (3-4 sentences, 60-100 words minimum)
- Make content rich and informative
- FAQs: Generate MINIMUM 20 FAQs (not 9, not 10, but AT LEAST 20 FAQs) - this is critical
- Return ONLY valid JSON, no markdown:

{
  "page_title": "SEO-optimized page title (60 characters max)",
  "meta_description": "Meta description (150-160 characters)",
  "meta_keywords": "Keywords separated by commas",
  "banner": {
    "title": "Main heading (H1, 50-60 characters)",
    "description": "Description paragraph (3-4 sentences, 100-150 words)",
    "cta_text": "Call-to-action button text",
    "cta_link": "https://relgrow.com/contact-us/"
  },
  "landscaping_services": {
    "heading": "Generate heading based on user input (e.g., 'Our Kitchen Design Services' if input is about kitchens, 'Our Interior Design Services' if about interiors)",
    "subheading": "Generate subheading based on user input topic",
    "section_heading": "Generate section heading based on user input topic",
    "section_description": "Generate section description based on user input topic",
    "services_list": [
      {"title": "Service 1 title", "description": "Detailed description (3-4 sentences, 60-100 words)"},
      ... (6 services total)
    ]
  },
  "hardscaping_services": {
    "heading": "Generate heading based on user input (e.g., 'Kitchen Installation Services' if input is about kitchens, 'Design Solutions' if about design)",
    "description": "Generate description based on user input topic",
    "services_list": [
      {"title": "Service 1 title", "description": "Detailed description (3-4 sentences, 60-100 words)"},
      ... (4 services total)
    ]
  },
  "softscaping_services": {
    "heading": "Generate heading based on user input (e.g., 'Kitchen Design Solutions' if input is about kitchens, 'Design Services' if about design)",
    "description": "Generate description based on user input topic",
    "lush_landscape": {
      "title": "Generate title based on user input (e.g., 'Premium Kitchen Designs' if input is about kitchens, 'Modern Solutions' if about design)",
      "description": "Detailed description (3-4 sentences, 60-100 words)"
    },
    "design_installation": {
      "heading": "Generate heading based on user input (e.g., 'Design & Installation', 'Design Solutions', 'Installation Services')",
      "description": "Generate description based on user input topic",
      "residential": {
        "title": "Generate title based on user input (e.g., 'Residential [Service]', 'Home [Service]')",
        "description": "Detailed description (3-4 sentences, 60-100 words)"
      },
      "commercial": {
        "title": "Generate title based on user input (e.g., 'Commercial [Service]', 'Business [Service]')",
        "description": "Detailed description (3-4 sentences, 60-100 words)"
      }
    }
  },
  "water_features": {
    "heading": "Generate heading based on user input (e.g., 'Additional Features' if input is about kitchens, 'Premium Add-ons' if about design)",
    "description": "Generate description based on user input topic",
    "features_list": [
      {"title": "Feature 1 title", "description": "Detailed description (3-4 sentences, 60-100 words)"},
      {"title": "Feature 2 title", "description": "Detailed description (3-4 sentences, 60-100 words)"}
    ]
  },
  "process": {
    "heading": "Generate heading based on user input (e.g., 'Our Process', 'How We Work', 'Our Approach')",
    "description": "Generate description based on user input topic",
    "steps": [
      {"title": "Step 1 title", "description": "Detailed description (3-4 sentences, 60-100 words)"},
      {"title": "Step 2 title", "description": "Detailed description (3-4 sentences, 60-100 words)"},
      {"title": "Step 3 title", "description": "Detailed description (3-4 sentences, 60-100 words)"},
      {"title": "Step 4 title", "description": "Detailed description (3-4 sentences, 60-100 words)"}
    ],
    "cta": {
      "text": "Get in Touch with us today for all your construction needs !",
      "button_text": "Contact Us",
      "link": "https://relgrow.com/contact-us/"
    }
  },
  "why_choose": {
    "heading": "Generate heading based on user input (e.g., 'Why Choose Relgrow', 'Why Choose Our [Service]', 'Why Work With Us')",
    "description": "Generate description based on user input topic",
    "reasons": [
      {"title": "Reason 1 title", "description": "Detailed description (3-4 sentences, 60-100 words)"},
      {"title": "Reason 2 title", "description": "Detailed description (3-4 sentences, 60-100 words)"},
      {"title": "Reason 3 title", "description": "Detailed description (3-4 sentences, 60-100 words)"}
    ]
  },
  "benefits": {
    "heading": "Generate heading based on user input (e.g., 'Benefits Of Hiring Relgrow', 'Benefits Of Our [Service]', 'Why Choose Our Services')",
    "description": "Generate description based on user input topic",
    "benefits_list": [
      {"title": "Benefit 1 title", "description": "Detailed description (3-4 sentences, 60-100 words)"},
      {"title": "Benefit 2 title", "description": "Detailed description (3-4 sentences, 60-100 words)"},
      {"title": "Benefit 3 title", "description": "Detailed description (3-4 sentences, 60-100 words)"}
    ]
  },
  "testimonials": {
    "heading": "Testimonials",
    "testimonials_list": [
      {"text": "Testimonial text (3-4 sentences)", "author": "Author Name"},
      {"text": "Testimonial text (3-4 sentences)", "author": "Author Name"},
      {"text": "Testimonial text (3-4 sentences)", "author": "Author Name"}
    ]
  },
  "faqs": {
    "heading": "FAQs",
    "faqs_list": [
      {"question": "Realistic FAQ question", "answer": "Detailed answer (3-4 sentences, 60-100 words)", "expanded": true},
      {"question": "Another realistic FAQ question", "answer": "Detailed answer (3-4 sentences, 60-100 words)", "expanded": false},
      ... (MINIMUM 20 FAQs total - generate at least 20 FAQs)
    ]
  }
}

CRITICAL REQUIREMENTS:
- Generate ALL content sections based on user input: "${userInput}"
- Fill EVERY field with real, specific content - NO placeholders
- All content must be specific to the user's input topic
- HEADINGS: ALL headings must be customized based on user input topic - DO NOT use generic landscaping headings
  * If user input is about "Kitchen Design", use headings like "Our Kitchen Design Services", "Kitchen Installation Services", etc.
  * If user input is about "Interior Design", use headings like "Our Interior Design Services", "Design Solutions", etc.
  * If user input is about "Plumbing Services", use headings like "Our Plumbing Services", "Plumbing Solutions", etc.
  * Headings must reflect the actual service/topic from user input, not generic terms
- COMPANY NAME: Always use "Relgrow" as the company name (NEVER use "[Your Company Name]", "[Company Name]", or any placeholder)
- Use "Relgrow", "we at Relgrow", "Relgrow offers", "Relgrow provides" etc. naturally throughout
- Use SEO keywords naturally throughout
- Write in professional, conversion-focused tone
- Descriptions should be 3-4 sentences (60-100 words minimum)
- FAQs: MUST generate MINIMUM 20 FAQs (not 9, not 10, but AT LEAST 20 FAQs) - this is critical
- Return ONLY valid JSON, no markdown, no code blocks`

    // Call OpenAI API
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
              content: 'You are an expert SEO content writer specializing in creating high-quality, humanized content with optimal readability scores. Always return valid JSON format with ALL sections filled based on the user input. Never use placeholder text or generic examples. The company name is "Relgrow" - always use "Relgrow" instead of any placeholders like "[Your Company Name]" or "[Company Name]".',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' },
        })

        responseContent = completion.choices[0]?.message?.content || ''
        
        if (completion.choices[0]?.finish_reason === 'length') {
          console.warn(`⚠ Response was truncated (max_tokens reached) for model ${modelConfig.name}`)
          const currentIndex = models.findIndex(m => m.name === modelConfig.name)
          if (currentIndex < models.length - 1) {
            console.log(`Response truncated, trying next model with higher token limit...`)
            continue
          }
        }
        
        console.log(`✓ Successfully used model: ${modelConfig.name}`)
        break
      } catch (error: any) {
        lastError = error
        console.log(`✗ Model ${modelConfig.name} failed: ${error.message || 'Unknown error'}`)
      }
    }

    if (!responseContent && lastError) {
      throw new Error(`All models failed. Last error: ${lastError.message || 'Unknown error'}. Please check your API key and model access.`)
    }

    // Parse JSON from response
    let contentData
    try {
      const jsonMatch = responseContent.match(/```json\n([\s\S]*?)\n```/) || responseContent.match(/```\n([\s\S]*?)\n```/)
      const jsonString = jsonMatch ? jsonMatch[1] : responseContent
      contentData = JSON.parse(jsonString)
    } catch (parseError: any) {
      console.error('JSON Parse Error:', parseError)
      throw new Error(`Failed to parse content from API response: ${parseError.message}. Please try again.`)
    }

    // Generate HTML
    const htmlContent = generateHTMLPage(contentData)

    // Create ZIP file with HTML only (no assets folder)
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

    // Return ZIP file (with HTML only, no assets)
    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="generated-template8-${Date.now()}.zip"`,
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

