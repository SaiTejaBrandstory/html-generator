import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

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

// Generate complete blog HTML page
function generateBlogHTML(content: any): string {
  return `<!doctype html>
<html lang="en">
<head>
	<!-- Required meta tags -->
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
	<meta property="og:image" content="https://brandstory.in/blogs/assets/images/og-logo.png">
	<meta property="og:image:type" content="image/jpeg">
	<meta property="og:image:width" content="200">
	<meta property="og:image:height" content="200">
	<title>${escapeHtml(content.meta?.title || content.banner?.title || 'Blog Post')}</title>
	<meta name="description" content="${escapeHtml(content.meta?.description || '')}" />
	<meta name="Keywords" content="${escapeHtml(content.meta?.keywords || '')}" />
	<link rel="canonical" href="${escapeHtml(content.meta?.canonical || '#')}" />
	<meta name="robots" content="INDEX, FOLLOW" />
	
	<!--CSS -->
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">
	<link href="https://brandstory.in/blogs/assets/css/menu.css?key=1766575958" rel="stylesheet">
	<link href="https://brandstory.in/blogs/assets/css/bootstrap.min.css" rel="stylesheet">
	<link href="https://brandstory.in/resources/casestudies/assets/css/style.css?key=1766575958" rel="stylesheet">
	<link href="https://brandstory.in/resources/casestudies/assets/css/global.css?key=1766575958" rel="stylesheet">
	<link href="https://brandstory.in/blogs/assets/css/swiper.css?key=1766575958" rel="stylesheet">
	<link href="https://brandstory.in/blogs/assets/css/global.css?key=1766575958" rel="stylesheet">
	<link href="https://brandstory.in/blogs/assets/css/style.css?key=1766575958" rel="stylesheet">
	<link href="https://brandstory.in/blogs/assets/css/my-styles.css?key=1766575958" rel="stylesheet">
	<link href="https://brandstory.in/blogs/assets/css/animation.css?key=1766575958" rel="stylesheet">
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.12/css/intlTelInput.min.css">

	<!--Favicon start-->
	<link rel="icon" type="image/png" sizes="32x32" href="https://brandstory.in/assets/images/wp-content/uploads/2018/04/favicon.png">
	<!--Favicon start-->
</head>

<body class="linkedIn-recruiting-blog">

<section class="blog-main-banner bg-white  d-flex align-items-center justify-content-center">
    <div class="container d-flex align-items-center flex-column">
        <span id="topic" class="d-none">${escapeHtml(content.banner?.topic || '')}</span>
        <p class="pill-yellow text-center" id="category">${escapeHtml(content.banner?.category || 'Blog')}</p>
        <h1 class="text-center" id="title">${escapeHtml(content.banner?.title || '')}</h1>
        <p class="pill-purple text-center mt-4"><a class="text-decoration-none text-white" href="https://brandstory.in/contact-us/">Contact Us</a></p>
    </div>
</section>
<section class="d-flex align-items-center justify-content-center">
    <img id="image" src="https://cdn.searchenginejournal.com/wp-content/uploads/2020/10/5-fundamental-shifts-that-are-shaping-search-digital-marketing-5f7f23593ac21-1280x720.png" class="w-100" alt="${escapeHtml(content.banner?.title || '')}">
</section>

<section class="blog-content sp-50">
    <div class="container">
        <div class="row">
            <div class="col-lg-3 col-md-4 d-md-block d-none me-lg-2">
                <div class="sticky-box">
                    <ul class="stickymin">
                        ${(content.sections || []).map((section: any, index: number) => `
                        <li><a href="#sec${String(index + 1).padStart(2, '0')}">${escapeHtml(section.heading || `Section ${index + 1}`)}</a></li>
                        `).join('')}
                    </ul>
                </div>
            </div>
            <div class="col-md-7 ps-lg-5">
                ${(content.sections || []).map((section: any, index: number) => {
                  const sectionId = `sec${String(index + 1).padStart(2, '0')}`
                  // Use images from the original template and additional images for all sections
                  const sectionImages = [
                    'https://cdn.searchenginejournal.com/wp-content/uploads/2020/10/5-fundamental-shifts-that-are-shaping-search-digital-marketing-5f7f23593ac21-1280x720.png', // sec01 - Introduction
                    'https://brandstory.in/blogs/assets/images/linkedIn-recruiting/evolution-of-linkedin.png', // sec02
                    'https://themexriver.com/wp/gesto/wp-content/uploads/2023/10/img_01-1.jpg', // sec03
                    'https://thumbs.dreamstime.com/b/businessman-holding-global-network-connection-big-data-analytics-business-intelligence-concept-world-map-point-line-comp-183397623.jpg', // sec04
                    'https://brandstory.in/blogs/assets/images/linkedIn-recruiting/leveraging.png', // sec05
                    'https://brandstory.in/blogs/assets/images/linkedIn-recruiting/measuring-the-sucess.png', // sec06
                    'https://cdn.searchenginejournal.com/wp-content/uploads/2020/10/5-fundamental-shifts-that-are-shaping-search-digital-marketing-5f7f23593ac21-1280x720.png', // sec07 - Conclusion
                    'https://brandstory.in/blogs/assets/images/linkedIn-recruiting/evolution-of-linkedin.png', // sec08 - Additional sections
                    'https://themexriver.com/wp/gesto/wp-content/uploads/2023/10/img_01-1.jpg', // sec09
                    'https://thumbs.dreamstime.com/b/businessman-holding-global-network-connection-big-data-analytics-business-intelligence-concept-world-map-point-line-comp-183397623.jpg', // sec10
                  ]
                  // Use image from array, or from section data, or fallback to first available image
                  const sectionImage = sectionImages[index] || sectionImages[index % sectionImages.length] || section.image || sectionImages[0]
                  return `
                <div id="${sectionId}" class="mb-50">
                    <h2 class="text-vilot mb-30">${escapeHtml(section.heading || '')}</h2>
                    ${sectionImage ? `<img class="w-100 mb-50" src="${escapeHtml(sectionImage)}" alt="${escapeHtml(section.heading || '')}">` : ''}
                    ${(section.subsections || []).map((subsection: any) => {
                      let html = ''
                      if (subsection.type === 'heading') {
                        html += `<ul class="mb-20"><li><h3 class="mb-0 fs-24">${escapeHtml(subsection.text || '')}</h3></li></ul>`
                      } else if (subsection.type === 'subheading') {
                        html += `<h4 class="fs-20">${escapeHtml(subsection.text || '')}</h4>`
                      } else if (subsection.type === 'paragraph') {
                        html += `<p>${subsection.text ? subsection.text.split('\n').map((p: string) => {
                          // Convert markdown links to HTML
                          const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
                          let processed = escapeHtml(p)
                          processed = processed.replace(linkRegex, (match, text, url) => {
                            return `<a class="text-vilot" href="${escapeHtml(url)}">${escapeHtml(text)}</a>`
                          })
                          return processed
                        }).join('</p><p>') : ''}</p>`
                      } else if (subsection.type === 'list' && subsection.items) {
                        const listTag = subsection.ordered ? 'ol' : 'ul'
                        const listClass = subsection.ordered ? 'ps-5 mb-30' : 'ps-5 mb-50'
                        html += `<${listTag} class="${listClass}">`
                        subsection.items.forEach((item: any) => {
                          if (typeof item === 'string') {
                            html += `<li>${escapeHtml(item)}</li>`
                          } else {
                            html += `<li><b>${escapeHtml(item.title || '')}:</b> ${escapeHtml(item.description || '')}</li>`
                          }
                        })
                        html += `</${listTag}>`
                      } else if (subsection.type === 'example') {
                        html += `<h4 class="fs-20">Example:</h4>`
                        html += `<p class="mb-50">${subsection.text ? subsection.text.split('\n').map((p: string) => {
                          const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
                          let processed = escapeHtml(p)
                          processed = processed.replace(linkRegex, (match, text, url) => {
                            return `<a class="text-vilot" href="${escapeHtml(url)}">${escapeHtml(text)}</a>`
                          })
                          return processed
                        }).join('</p><p>') : ''}</p>`
                      }
                      return html
                    }).join('')}
                </div>
                `
                }).join('')}
            </div>
        </div>
    </div>
</section>

<section class="spb-50">
    <div class="container">
        <div class="weare-brandstory-main sp-50">
    <h2 class="text-center text-white mb-2">We are <span class="text-red">BrandStory</span></h2>
    <p class="text-center mb-0 text-white">Get in touch with us at <a class="text-highlight text-decoration-none fw-700" href="mailto:info@brandstory.in">info@brandstory.in</a> to create a pleasant experience 
        <span class="db">for your audience and a great success for your business.</span></p>
</div>    </div>
</section>

<section class="spt-50 bg-black">
    <div class="container">
        <h2 class="text-white mb-3 text-center">Experience actionable strategies. Customizable to fit your goals.</h2>
        <div class="goalsbtn d-flex justify-content-center">
            <a class="text-black bg-white text-decoration-none" href="https://brandstory.in/contact-us/">Contact Us</a>
        </div>
        <img class="w-100" src="https://brandstory.in/blogs/assets/images/goals.svg">
</div></section>

<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

<script>
    document.addEventListener("DOMContentLoaded", function() {
        const sections = document.querySelectorAll(".blog-content div[id]");
        const navLinks = document.querySelectorAll(".stickymin li a");

        const observerOptions = {
            root: null,
            rootMargin: "-50% 0px -50% 0px",
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    let activeId = entry.target.id;
                    navLinks.forEach(link => link.parentElement.classList.remove("active"));
                    let activeLink = document.querySelector(\`.stickymin li a[href="#\${activeId}"]\`);
                    if (activeLink) {
                        activeLink.parentElement.classList.add("active");
                    }
                }
            });
        }, observerOptions);

        sections.forEach(section => observer.observe(section));
    });
</script>

<script src="https://brandstory.in/blogs/assets/js/bootstrap.bundle.min.js"></script>
<script src="https://brandstory.in/blogs/assets/js/menu.js?key=1766575958"></script>
<script src="https://brandstory.in/blogs/assets/js/swiper.js?key=1766575958"></script>
<script src="https://brandstory.in/blogs/assets/js/animation.js?key=1766575958"></script>
<script src="https://brandstory.in/blogs/assets/js/site.js?key=1766575958"></script>
<script src="https://brandstory.in/blogs/assets/js/jquery.min.js?key=1766575958"></script>

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

    // Create prompt for blog content generation
    const prompt = `You are writing as a senior practitioner with real delivery experience.
This is not marketing copy.
This is an explanation of how the work is actually done.

Audience:
A smart client who has worked with agencies before and is skeptical.

Task:
Write a comprehensive, detailed blog post specifically about "${userInput}".

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

CRITICAL REQUIREMENTS:
- Focus ONLY on the topic: "${userInput}". All content must be directly related to this topic.
- Write accurate, factual content. Do not make up specific statistics, company names, or claims unless they are general knowledge.
- Write 3000-5000 words with Flesch-Kincaid readability 60-70 and Surfer SEO score 90+.
- Generate 15-20 sections, each with 6-10 detailed paragraphs (4-6 sentences each, 80-120 words per paragraph).
- Based on the topic, determine the appropriate category (e.g., Guide, Blog, Tutorial, Tips, etc.) and topic/category name.
- All headings, content, and examples must be relevant to "${userInput}" only.
- Write as a practitioner explaining real work - not marketing copy.

Output rules:
Return ONLY valid JSON.
No explanations.
No markdown.
Start with { and end with }.

JSON Format:
{
  "meta": {
    "title": "...",
    "description": "...",
    "keywords": "...",
    "canonical": "..."
  },
  "banner": {
    "topic": "Main topic/category based on the input",
    "category": "Appropriate category based on the topic (e.g., Guide, Blog, Tutorial, etc.)",
    "title": "...",
    "image": "..."
  },
  "sections": [
    {
      "heading": "Section 1 Heading",
      "image": "optional-image-url",
      "subsections": [
        {
          "type": "paragraph",
          "text": "Paragraph text with [link text](url) for links"
        },
        {
          "type": "heading",
          "text": "H3 Heading"
        },
        {
          "type": "list",
          "ordered": false,
          "items": ["Item 1", "Item 2", {"title": "Item Title", "description": "Item description"}]
        }
      ]
    }
  ]
}`

    // Call OpenAI API with higher token limit for comprehensive content
    const models = [
      { name: 'gpt-4o', maxTokens: 16384 },
      { name: 'gpt-4-turbo', maxTokens: 4096 },
    ]

    let completion
    let responseContent = ''

    for (const modelConfig of models) {
      try {
        console.log(`Trying model: ${modelConfig.name} with max_tokens: ${modelConfig.maxTokens}`)
        completion = await openai.chat.completions.create({
          model: modelConfig.name,
          messages: [
            {
              role: 'system',
              content: 'You are writing as a senior practitioner with real delivery experience. This is not marketing copy. This is an explanation of how the work is actually done. Write for a smart client who has worked with agencies before and is skeptical. Avoid buzzwords like seamless, cutting-edge, world-class, best-in-class, user-centric. Prefer practical wording over abstract language. Write the way you would explain this on a real call. Write comprehensive, accurate blog posts that are DIRECTLY and SPECIFICALLY about the user\'s exact topic. All content must be relevant to the exact topic provided. Write factual, accurate content - avoid making up specific statistics, company names, or unverified claims. Generate 15-20 sections, each with 6-10 detailed paragraphs (4-6 sentences, 80-120 words each). Total 3000-5000 words. You MUST return valid JSON only - no apologies, no explanations, just the JSON object. Write ONLY about the specific topic - do not write generic, irrelevant, or hallucinated content.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.9,
          response_format: { type: 'json_object' },
          max_tokens: modelConfig.maxTokens,
        })

        responseContent = completion.choices[0]?.message?.content || ''
        
        if (completion.choices[0]?.finish_reason === 'length') {
          console.warn(`⚠ Response was truncated (max_tokens reached) for model ${modelConfig.name}`)
          if (modelConfig.name === 'gpt-4o') {
            console.log('Using truncated response from gpt-4o')
            break
          }
          continue
        }
        
        console.log(`✓ Successfully used model: ${modelConfig.name}`)
        break
      } catch (error: any) {
        console.log(`✗ Model ${modelConfig.name} failed: ${error.message || 'Unknown error'}`)
        if (modelConfig.name === models[models.length - 1].name) {
          throw error
        }
      }
    }

    if (!responseContent) {
      throw new Error('Failed to generate content from any model')
    }

    // Parse JSON from response
    let contentData
    try {
      const jsonMatch = responseContent.match(/```json\n([\s\S]*?)\n```/) || responseContent.match(/```\n([\s\S]*?)\n```/)
      const jsonString = jsonMatch ? jsonMatch[1] : responseContent
      contentData = JSON.parse(jsonString)
    } catch (parseError: any) {
      console.error('JSON Parse Error:', parseError)
      console.error('Response content:', responseContent.substring(0, 1000))
      throw new Error(`Failed to parse content from API response: ${parseError.message}`)
    }

    // Generate HTML
    const htmlContent = generateBlogHTML(contentData)

    // Return HTML file
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="generated-blog-${Date.now()}.html"`,
      },
    })
  } catch (error: any) {
    console.error('Generation error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate blog content',
        message: error.message || 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}

