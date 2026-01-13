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
</head>
<body class="seo-page-villa-bangalore">
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
					<div class="mt-4"><a href="${escapeHtml(content.banner?.cta_link || '#')}" class="btn btn-blue btn-rounded">${escapeHtml(content.banner?.cta_text || '')}</a></div>
				</div>
			</div>
			<div class="col-md-6 d-flex align-items-stretch">
				<div class="inner--banner-img">
					<img src="https://relgrow.com/assets/images/seo/vid/bangalore/bangalore-banner.jpg" class="img-fluid" alt="${escapeHtml(content.banner?.title || '')}">
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Section 2: Types -->
<section class="sp-50">
	<div class="container">
		<h2 class="text-center spb-50">${escapeHtml(content.types?.heading || '')}</h2>
		<div class="types-slider site--slider">
			<div class="swiper typeSwiper">
				<div class="swiper-wrapper">
					${(content.types?.types_list || []).map((type: any, index: number) => `
					<div class="swiper-slide">
						<div class="typ--box">
							<div class="mb-3 typImg"><img data-src="https://relgrow.com/assets/images/seo/vid/bangalore/typ${index + 1}.jpg" class="img-fluid swiper-lazy" alt="${escapeHtml(type.title || '')}"></div>
							<h4>${escapeHtml(type.title || '')}</h4>
							<p class="mt-3">${escapeHtml(type.description || '')}</p>
						</div>
						<div class="swiper-lazy-preloader swiper-lazy-preloader-black"></div>
					</div>
					`).join('')}
				</div>
			</div>
			<div class="swiper-pagination typ-pagi"></div>
			<div class="swiper-button-next typ-next"></div>
			<div class="swiper-button-prev typ-prev"></div>
		</div>
	</div>
</section>

<!-- Section 3: Process -->
<section class="spb-50">
	<div class="container">
		<h2 class="text-center spb-50">${escapeHtml(content.process?.heading || '')}</h2>
		<div class="proc-slider site--slider">
			<div class="swiper procSwiper">
				<div class="swiper-wrapper">
					${(content.process?.steps || []).map((step: any, index: number) => `
					<div class="swiper-slide">
						<div class="proc--box">
							<div class="mb-3"><img src="https://relgrow.com/assets/images/seo/vid/bangalore/p${index + 1}.svg" class="img-fluid" alt="${escapeHtml(step.title || '')}"></div>
							<h4 class="mb-3">${escapeHtml(step.title || '')}</h4>
							<p>${escapeHtml(step.description || '')}</p>
						</div>
					</div>
					`).join('')}
				</div>
			</div>
			<div class="swiper-pagination proc-pagi"></div>
			<div class="swiper-button-next proc-next"></div>
			<div class="swiper-button-prev proc-prev"></div>
		</div>
	</div>
</section>

<!-- Section 4: Services -->
<section class="pro-slid-sec spb-50">
	<div class="container">
		<div class="pro-slid-inner bg-lblue">
			<h2 class="text-center spb-50">${escapeHtml(content.services?.heading || '')}</h2>
			<div class="pro--slider">
				<div thumbsSlider="" class="swiper proSlider">
					<div class="swiper-wrapper">
						${(content.services?.services_list || []).map((service: any) => `
						<div class="swiper-slide">
							<div class="protabBtn">${escapeHtml(service.title || '')}</div>
						</div>
						`).join('')}
					</div>
				</div>
				<div class="swiper proSlider2">
					<div class="swiper-wrapper">
						${(content.services?.services_list || []).map((service: any, index: number) => `
						<div class="swiper-slide">
							<div class="protabtxt max-1000">
								<div class="row gx-lg-5">
									<div class="col-md-6">
										<img src="https://relgrow.com/assets/images/seo/vid/bangalore/ridt${index + 1}.jpg" class="img-fluid swiper-lazy xs-mb-20" alt="${escapeHtml(service.title || '')}">
									</div>
									<div class="col-md-6">
										<h4 class="mb-3">${escapeHtml(service.title || '')}</h4>
										<p>${escapeHtml(service.description || '')}</p>
									</div>
								</div>
							</div>
							<div class="swiper-lazy-preloader swiper-lazy-preloader-black"></div>
						</div>
						`).join('')}
					</div>
				</div>
				<div class="swiper-button-next pro-nxt"></div>
				<div class="swiper-button-prev pro-pre"></div>
			</div>
		</div>
	</div>
</section>

<!-- Section 5: Our Projects -->
<section class="lp--sec spb-50">
	<div class="container">
		<h2 class="text-center spb-50">${escapeHtml(content.projects?.heading || '')}</h2>
		<p><figure><img src="https://relgrow.com/assets/images/seo/id/kochi/lp-img.jpg" class="img-fluid" alt="${escapeHtml(content.projects?.heading || '')}"></figure></p>
	</div>
</section>

<!-- Section 6: One Destination / Stats -->
<section class="sp-50 bg-lblue">
	<div class="container">
		<div class="row gy-5 gy-md-0 gx-md-5">
			<div class="col-md-4">
				<h3 class="spb-50">${escapeHtml(content.stats?.heading || '')}</h3>
				${(content.stats?.features || []).map((feature: any, index: number) => `
				<div class="d-flex align-items-center ${index > 0 ? 'spt-50' : ''}">
					<div class="od-img">
						<figure><img src="https://relgrow.com/assets/images/seo/id/bangalore/od${index + 1}.svg" class="img-fluid" alt="${escapeHtml(feature.title || '')}"></figure>
					</div>
					<div class="od-text">
						<h3>${escapeHtml(feature.title || '')}</h3>
						<p class="txt-20">${escapeHtml(feature.subtitle || '')}</p>
					</div>
				</div>
				`).join('')}
			</div>
			<div class="col-md-8">
				<div class="count-sec-bg">
					${(content.stats?.stats_list || []).map((stat: any, index: number) => `
					<div class="count-box ${index > 0 ? 'mt-3' : ''}">
						<div class="row">
							<div class="col-md-3">
								<h2 class="color-dblue h1">${escapeHtml(stat.number || '')}</h2>
							</div>
							<div class="col-md-9 m-auto">
								<h4>${escapeHtml(stat.title || '')}</h4>
							</div>
						</div>
					</div>
					`).join('')}
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Section 7: Our Clients -->
<section class="our--clients-sec sp-50">
	<div class="container">
		<h2 class="text-center spb-50">${escapeHtml(content.clients?.heading || '')}</h2>
		<div class="client-sec">
			${Array.from({ length: 5 }, (_, i) => `
			<figure><img src="https://relgrow.com/assets/images/seo/clients/client-${i + 1}.png" class="img-fluid" alt="Our Clients"></figure>
			`).join('')}
		</div>
	</div>
</section>

<!-- Section 8: Interior Design Packages -->
<section class="sp-50 idp-sec">
	<div class="container">
		<h2 class="text-center spb-50">${escapeHtml(content.packages?.heading || '')}</h2>
		<div class="row gy-3 gy-md-0 gx-md-5">
			${(content.packages?.packages_list || []).map((pkg: any, index: number) => `
			<div class="col-md-4 d-flex align-items-stretch">
				<div class="idp-box idp-box-bg-${index + 1}">
					<div class="idp-icon-sec">
						<div class="mb-3 me-4"><figure><img src="https://relgrow.com/assets/images/seo/vid/kochi/idp-icon${index + 1}.svg" class="img-fluid" alt="${escapeHtml(pkg.title || '')}"></figure></div>
						<h4>${escapeHtml(pkg.title || '')}</h4>
					</div>
					<div class="idp-text-sec ${index === 2 ? 'd-flex' : ''}">
						<p>${escapeHtml(pkg.description || '')}</p>
						<div class="idp-link">
							<a href="${escapeHtml(pkg.cta_link || '#')}">${escapeHtml(pkg.cta_text || 'Enquire Now')}</a>
						</div>
					</div>
				</div>
			</div>
			`).join('')}
		</div>
	</div>
</section>

<!-- Section 9: Blogs (Static - Same as Original) -->
<section class="trending-blog spb-50">
	<div class="container">
		<h2 class="spb-50 text-center">Blogs</h2>
		<div class="blog-slider site--slider">
			<div class="swiper blogSwiper">
				<div class="swiper-wrapper">
					<div class="swiper-slide">
						<div class="hblog--box">
							<figure><img data-src="https://relgrow.com/assets/images/blog/blog1.jpg" class="img-fluid swiper-lazy" alt="img" width="629px" height="375px"></figure>
							<div class="hblog--box-txt">
								<h4>How To Create Office Spaces That Reflect Your Brand</h4>
								<p class="mt-3">A workspace needs to reflect the company ideals that will ultimately determine the health and well-being of the organization...</p>
								<div class="rm-link"><a href="https://relgrow.com/resources/how-to-create-office-spaces-that-reflect-your-brand/">Read More</a></div>
							</div>
						</div>
						<div class="swiper-lazy-preloader swiper-lazy-preloader-black"></div>
					</div>
					<div class="swiper-slide">
						<div class="hblog--box">
							<figure><img data-src="https://relgrow.com/assets/images/blog/blog2.jpg" class="img-fluid swiper-lazy" alt="img" width="629px" height="375px"></figure>
							<div class="hblog--box-txt">
								<h4>Designing Your First Apartment: What to Keep in Mind</h4>
								<p class="mt-3">Decorating your first apartment can be exciting and intimidating. It comes with lots of emotions and questions. Where do I...</p>
								<div class="rm-link"><a href="https://relgrow.com/resources/designing-your-first-apartment-what-to-keep-in-mind/">Read More</a></div>
							</div>
						</div>
						<div class="swiper-lazy-preloader swiper-lazy-preloader-black"></div>
					</div>
					<div class="swiper-slide">
						<div class="hblog--box">
							<figure><img data-src="https://relgrow.com/assets/images/blog/blog3.jpg" class="img-fluid swiper-lazy" alt="img" width="629px" height="375px"></figure>
							<div class="hblog--box-txt">
								<h4>Interior Design Trends for 2022</h4>
								<p class="mt-3">Interiors are a home's visual soul; they create the atmosphere and personality that define a place as a home. Interior design...</p>
								<div class="rm-link"><a href="https://relgrow.com/resources/interior-design-trends-for-2022/">Read More</a></div>
							</div>
						</div>
						<div class="swiper-lazy-preloader swiper-lazy-preloader-black"></div>
					</div>
				</div>
			</div>
			<div class="swiper-pagination bl-pagi"></div>
			<div class="swiper-button-next bl-next"></div>
			<div class="swiper-button-prev bl-prev"></div>
		</div>
	</div>
</section>

<!-- Section 10: FAQ -->
<section class="spb-50">
	<div class="container">
		<h2 class="text-center">${escapeHtml(content.faqs?.heading || 'Frequently Asked Questions')}</h2>
		<div class="max-1000 site-accord">
			<div class="accordion spt-50" id="accordionFAQ">
				${(content.faqs?.faqs_list || []).map((faq: any, index: number) => {
					const isExpanded = index === 0 || faq.expanded === true
					return `
				<div class="accordion-item">
					<h2 class="accordion-header" id="fh${index + 1}">
						<button class="accordion-button ${isExpanded ? '' : 'collapsed'}" type="button" data-bs-toggle="collapse" data-bs-target="#fc${index + 1}" aria-expanded="${isExpanded ? 'true' : 'false'}">
							${escapeHtml(faq.question || '')}
						</button>
					</h2>
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

<!-- Page Content End-->
</div>

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

    // Create the prompt for content generation - ALL 10 sections
    const prompt = `

	You are writing as a senior practitioner with real delivery experience.
This is not marketing copy.
This is an explanation of how the work is actually done.

Audience:
A smart client who has worked with agencies before and is skeptical.

Task:
Create a complete landing page based strictly on this input:
"${userInput}"

Core rules:
Say what matters. Skip what doesn’t.
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
Do not sound “brand-perfect.”

Language rules:
Avoid buzzwords like: seamless, cutting-edge, world-class, best-in-class, user-centric.
Prefer practical wording over abstract language.
If a sentence feels like marketing, rewrite it like advice.


CRITICAL: Generate ALL sections (Blogs section is static, don't generate it). All sections are required:
1. Banner (title, description, cta_text, cta_link)
2. Types (heading, 4 types with title and description - 3-4 sentences each)
3. Process (heading, 3 steps with title and description - 3-4 sentences each)
4. Services (heading, 12 services with title and description - 3-4 sentences each)
5. Projects (heading)
6. Stats (heading, 2 features with title/subtitle, 3 stats with number and title)
7. Clients (heading)
8. Packages (heading, 3 packages with title, description, cta_text, cta_link)
9. FAQs (heading, MINIMUM 20 FAQs with question, answer - 3-4 sentences, expanded true for first)

IMPORTANT:
- Generate ALL sections - do not skip any (EXCEPT Blogs - Blogs section is static and will not be generated)
- Write detailed, comprehensive descriptions (3-4 sentences, 60-100 words minimum)
- Make content rich and informative
- FAQs: Generate MINIMUM 20 FAQs (not 6) - this is critical
- Return ONLY valid JSON, no markdown:

Depth control:
Some sections can be tight.
Some can be more detailed.
Do not make everything equal length.

Output rules:
Return ONLY valid JSON.
No explanations.
No markdown.
Start with { and end with }.

{
  "page_title": "SEO-optimized page title (60 characters max)",
  "meta_description": "Meta description (150-160 characters)",
  "meta_keywords": "Keywords separated by commas",
  "banner": {
    "title": "Main heading (H1, 50-60 characters)",
    "description": "Description paragraph (3-4 sentences, 100-150 words)",
    "cta_text": "Call-to-action button text",
    "cta_link": "https://brandstory.in/contact-us/"
  },
  "types": {
    "heading": "Types heading",
    "types_list": [
      {"title": "Type 1 title", "description": "Detailed description (3-4 sentences, 60-100 words)"},
      {"title": "Type 2 title", "description": "Detailed description (3-4 sentences, 60-100 words)"},
      {"title": "Type 3 title", "description": "Detailed description (3-4 sentences, 60-100 words)"},
      {"title": "Type 4 title", "description": "Detailed description (3-4 sentences, 60-100 words)"}
    ]
  },
  "process": {
    "heading": "Process heading",
    "steps": [
      {"title": "Step 1 title", "description": "Detailed description (3-4 sentences, 60-100 words)"},
      {"title": "Step 2 title", "description": "Detailed description (3-4 sentences, 60-100 words)"},
      {"title": "Step 3 title", "description": "Detailed description (3-4 sentences, 60-100 words)"}
    ]
  },
  "services": {
    "heading": "Services heading",
    "services_list": [
      {"title": "Service 1 title", "description": "Detailed description (3-4 sentences, 60-100 words)"},
      ... (12 services total)
    ]
  },
  "projects": {
    "heading": "Projects heading"
  },
  "stats": {
    "heading": "Stats section heading",
    "features": [
      {"title": "Feature 1 title", "subtitle": "Feature 1 subtitle"},
      {"title": "Feature 2 title", "subtitle": "Feature 2 subtitle"}
    ],
    "stats_list": [
      {"number": "2200+", "title": "Completed Projects"},
      {"number": "50+", "title": "Expert Professionals"},
      {"number": "10+", "title": "Years of Experience"}
    ]
  },
  "clients": {
    "heading": "Clients heading"
  },
  "packages": {
    "heading": "Packages heading",
    "packages_list": [
      {"title": "Package 1 title", "description": "Package description (2-3 sentences)", "cta_text": "Enquire Now", "cta_link": "https://brandstory.in/contact-us/"},
      {"title": "Package 2 title", "description": "Package description (2-3 sentences)", "cta_text": "Enquire Now", "cta_link": "https://brandstory.in/contact-us/"},
      {"title": "Package 3 title", "description": "Package description (2-3 sentences)", "cta_text": "Enquire Now", "cta_link": "https://brandstory.in/contact-us/"}
    ]
  },
  "faqs": {
    "heading": "FAQ's",
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
- Use SEO keywords naturally throughout
- Write in professional, conversion-focused tone
- Descriptions should be 3-4 sentences (60-100 words minimum)
- FAQs: MUST generate MINIMUM 20 FAQs (not 6, not 10, but AT LEAST 20 FAQs) - this is critical
- Blogs section: DO NOT generate - it will remain static
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
              content: 'You are a person. A real human being. You are an expert SEO content writer who writes exactly like a human would write - naturally, conversationally, with imperfections and personality. Achieve Flesch Kincaid\'s score between 60 to 70 and Surfer SEO score of 90 and above. Write as a real person, not as an AI. Always return valid JSON format with ALL sections filled based on the user input. Never use placeholder text or generic examples.',
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
        'Content-Disposition': `attachment; filename="generated-template7-${Date.now()}.zip"`,
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
