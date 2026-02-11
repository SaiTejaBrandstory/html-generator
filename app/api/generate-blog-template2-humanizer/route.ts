import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import * as cheerio from 'cheerio'

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

// Helper function to escape HTML for content (less aggressive - allows apostrophes)
function escapeHtmlContent(str: string): string {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    // Don't escape apostrophes in content - they're safe in HTML text nodes
}

// Helper function to process text content (handles links and preserves formatting)
function processTextContent(text: string): string {
  if (!text) return ''
  // First escape HTML (but allow apostrophes)
  let processed = escapeHtmlContent(text)
  // Then convert markdown links to HTML links
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
  processed = processed.replace(linkRegex, (match, text, url) => {
    return '<a href="' + escapeHtml(url) + '">' + escapeHtmlContent(text) + '</a>'
  })
  return processed
}

// Helper function to clean heading (remove existing numbering)
function cleanHeading(heading: string): string {
  if (!heading) return ''
  // Remove leading numbers and dots (e.g., "1. ", "2. ", "10. ")
  return heading.replace(/^\d+\.\s*/, '').trim()
}

// ===== HUMANIZATION FUNCTIONS (Cheerio-based) =====

// Send plain text to Rephrasy API, get humanized text back. 1 API call.
async function callRephrasy(text: string): Promise<string | null> {
  const apiKey = process.env.REPHRASY_API_KEY
  if (!apiKey) {
    console.warn('REPHRASY_API_KEY not found, skipping humanization')
    return null
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 180000) // 3 min timeout

    const response = await fetch('https://v2-humanizer.rephrasy.ai/api', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model: 'undetectable',
        words: true,
        costs: false,
        language: 'English',
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Rephrasy API error (${response.status}):`, errorText)
      return null
    }

    const data = await response.json()
    return (data.output || '').trim() || null
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('Rephrasy API request timed out (3 min)')
    } else {
      console.error('Rephrasy API request failed:', error.message)
    }
    return null
  }
}

// Parse HTML → extract text nodes from content areas → humanize → replace back.
// Uses Cheerio to safely manipulate text without breaking HTML structure.
// Makes 2 API calls: one for body paragraphs, one for FAQ answers.
async function humanizeHtmlWithCheerio(html: string): Promise<string> {
  const $ = cheerio.load(html)

  // --- Collect body paragraph texts (from <p> inside .blog-inner) ---
  const bodyElements: cheerio.Cheerio<any>[] = []
  const bodyTexts: string[] = []
  
  $('.blog-inner p').each((_i, el) => {
    const text = $(el).text().trim()
    if (text.length > 30) {
      bodyElements.push($(el))
      bodyTexts.push(text)
    }
  })

  // --- Collect FAQ answer texts ---
  const faqElements: cheerio.Cheerio<any>[] = []
  const faqTexts: string[] = []
  
  $('#faqAccordion .accordion-body').each((_i, el) => {
    const text = $(el).text().trim()
    if (text.length > 10) {
      faqElements.push($(el))
      faqTexts.push(text)
    }
  })

  console.log(`📝 Extracted ${bodyTexts.length} body paragraphs and ${faqTexts.length} FAQ answers`)

  // --- API Call 1: Humanize all body paragraphs as one text ---
  if (bodyTexts.length > 0) {
    const bodyBlob = bodyTexts.join('\n\n')
    console.log(`🔄 [API Call 1/2] Humanizing body text (${bodyBlob.length} chars, ${bodyTexts.length} paragraphs)...`)
    
    const humanizedBody = await callRephrasy(bodyBlob)
    
    if (humanizedBody) {
      // Split humanized output back into paragraphs
      const humanizedParagraphs = humanizedBody.split(/\n\n+/).filter(p => p.trim().length > 0)
      console.log(`   Got back ${humanizedParagraphs.length} paragraphs (expected ${bodyTexts.length})`)
      
      if (humanizedParagraphs.length === bodyTexts.length) {
        // Perfect match — assign 1:1
        for (let i = 0; i < bodyElements.length; i++) {
          bodyElements[i].text(humanizedParagraphs[i].trim())
        }
        console.log(`✓ Body: all ${bodyTexts.length} paragraphs replaced (exact match)`)
      } else {
        // Count mismatch — distribute proportionally by character length
        console.log(`⚠ Paragraph count mismatch. Distributing proportionally...`)
        const totalOrigLen = bodyTexts.reduce((sum, t) => sum + t.length, 0)
        const fullHumanized = humanizedParagraphs.join(' ')
        let cursor = 0
        
        for (let i = 0; i < bodyElements.length; i++) {
          const proportion = bodyTexts[i].length / totalOrigLen
          const chunkLen = Math.round(proportion * fullHumanized.length)
          let chunk: string
          
          if (i === bodyElements.length - 1) {
            // Last element gets the rest
            chunk = fullHumanized.substring(cursor).trim()
          } else {
            // Find a sentence boundary near the target length
            const targetEnd = cursor + chunkLen
            let endIdx = targetEnd
            // Look for sentence end (. ! ?) within ±100 chars of target
            const searchStart = Math.max(cursor, targetEnd - 100)
            const searchEnd = Math.min(fullHumanized.length, targetEnd + 100)
            const searchRegion = fullHumanized.substring(searchStart, searchEnd)
            const sentenceEnd = searchRegion.search(/[.!?]\s/)
            if (sentenceEnd !== -1) {
              endIdx = searchStart + sentenceEnd + 1
            }
            chunk = fullHumanized.substring(cursor, endIdx).trim()
            cursor = endIdx
          }
          
          if (chunk.length > 0) {
            bodyElements[i].text(chunk)
          }
        }
        console.log(`✓ Body: ${bodyElements.length} paragraphs replaced (proportional distribution)`)
      }
    } else {
      console.warn('⚠ Body humanization failed, keeping original text')
    }
  }

  // --- API Call 2: Humanize all FAQ answers as one text ---
  if (faqTexts.length > 0) {
    const faqBlob = faqTexts.join('\n\n')
    console.log(`🔄 [API Call 2/2] Humanizing FAQ answers (${faqBlob.length} chars, ${faqTexts.length} answers)...`)
    
    const humanizedFaq = await callRephrasy(faqBlob)
    
    if (humanizedFaq) {
      const humanizedAnswers = humanizedFaq.split(/\n\n+/).filter(p => p.trim().length > 0)
      console.log(`   Got back ${humanizedAnswers.length} answers (expected ${faqTexts.length})`)
      
      if (humanizedAnswers.length === faqTexts.length) {
        for (let i = 0; i < faqElements.length; i++) {
          faqElements[i].text(humanizedAnswers[i].trim())
        }
        console.log(`✓ FAQ: all ${faqTexts.length} answers replaced (exact match)`)
      } else {
        // Distribute proportionally
        console.log(`⚠ FAQ answer count mismatch. Distributing proportionally...`)
        const totalOrigLen = faqTexts.reduce((sum, t) => sum + t.length, 0)
        const fullHumanized = humanizedAnswers.join(' ')
        let cursor = 0
        
        for (let i = 0; i < faqElements.length; i++) {
          const proportion = faqTexts[i].length / totalOrigLen
          const chunkLen = Math.round(proportion * fullHumanized.length)
          let chunk: string
          
          if (i === faqElements.length - 1) {
            chunk = fullHumanized.substring(cursor).trim()
          } else {
            const targetEnd = cursor + chunkLen
            let endIdx = targetEnd
            const searchStart = Math.max(cursor, targetEnd - 80)
            const searchEnd = Math.min(fullHumanized.length, targetEnd + 80)
            const searchRegion = fullHumanized.substring(searchStart, searchEnd)
            const sentenceEnd = searchRegion.search(/[.!?]\s/)
            if (sentenceEnd !== -1) {
              endIdx = searchStart + sentenceEnd + 1
            }
            chunk = fullHumanized.substring(cursor, endIdx).trim()
            cursor = endIdx
          }
          
          if (chunk.length > 0) {
            faqElements[i].text(chunk)
          }
        }
        console.log(`✓ FAQ: ${faqElements.length} answers replaced (proportional distribution)`)
      }
    } else {
      console.warn('⚠ FAQ humanization failed, keeping original text')
    }
  }

  return $.html()
}

// ===== END HUMANIZATION FUNCTIONS =====

// Generate complete blog HTML page for template 2
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
	<link rel="preload" href="https://brandstory.in/blogs/assets/fonts/HankenGrotesk-Regular.woff2" as="font" type="font/woff2" crossorigin>
	<!--CSS -->
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">
	<link href="https://brandstory.in/blogs/assets/css/menu.css?key=1766724887" rel="stylesheet">
	<link href="https://brandstory.in/blogs/assets/css/bootstrap.min.css" rel="stylesheet">
	<link href="https://brandstory.in/resources/casestudies/assets/css/style.css?key=1766724887" rel="stylesheet">
	<link href="https://brandstory.in/resources/casestudies/assets/css/global.css?key=1766724887" rel="stylesheet">
	<link href="https://brandstory.in/blogs/assets/css/swiper.css?key=1766724887" rel="stylesheet">
	<link href="https://brandstory.in/blogs/assets/css/global.css?key=1766724887" rel="stylesheet">
	<link href="https://brandstory.in/blogs/assets/css/style.css?key=1766724887" rel="stylesheet">
	<link href="https://brandstory.in/blogs/assets/css/my-styles.css?key=1766724887" rel="stylesheet">
	<link href="https://brandstory.in/blogs/assets/css/animation.css?key=1766724887" rel="stylesheet">
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.12/css/intlTelInput.min.css">

	<!--Favicon start-->
	<link rel="icon" type="image/png" sizes="32x32" href="https://brandstory.in/assets/images/wp-content/uploads/2018/04/favicon.png">
	<!--Favicon start-->
</head>

<body class="future-webdesign-pg">

<section class="blog-main-banner employer-banner d-flex align-items-center justify-content-center">
    <div class="container d-flex align-items-center flex-column">
    <span id="topic" class="d-none">${escapeHtml(content.banner?.topic || '')}</span>
        <p class="pill-yellow text-center" id="category">${escapeHtml(content.banner?.category || 'Blog')}</p>
        <h1 class="heading-color text-center" id="title">${escapeHtml(content.banner?.title || '')}</h1>       
         <p class="pill-purple text-center mt-4"><a class="text-decoration-none text-white" href="https://brandstory.in/contact-us/">Contact Us</a></p>
         <img class="d-none" id="image" src="https://brandstory.in/blogs/assets/images/future-webdesign/banner.jpg" alt="${escapeHtml(content.banner?.title || '')}">
    </div>
</section>

<section class="blog-content sp-50">
    <div class="container">
        <div class="row gx-lg-5">
            <div class="col-lg-8">
                <div class="blog-inner section">
                   ${content.intro ? '<p class="mb-4">' + content.intro.split('\n').map((p: string) => {
                     return processTextContent(p)
                   }).join('</p><p class="mb-4">') + '</p>' : ''}
                   ${(content.sections || []).map((section: any, index: number) => {
                     const sectionImages = [
                       'https://brandstory.in/blogs/assets/images/future-webdesign/img1.jpg',
                       'https://brandstory.in/blogs/assets/images/future-webdesign/img2.jpg',
                       'https://brandstory.in/blogs/assets/images/future-webdesign/img3.jpg',
                       'https://brandstory.in/blogs/assets/images/future-webdesign/img1.jpg',
                       'https://brandstory.in/blogs/assets/images/future-webdesign/img2.jpg',
                     ]
                     const sectionImage = sectionImages[index % sectionImages.length] || section.image || ''
                     
                     // Clean heading to remove existing numbering, then add our own
                     const cleanHeadingText = cleanHeading(section.heading || '')
                     let html = '<h2 class="text-purple mb-3">' + (index + 1) + '. ' + escapeHtmlContent(cleanHeadingText) + '</h2>'
                     
                     if (sectionImage && section.showImage !== false) {
                       html += '<img class="w-100 mb-3" src="' + escapeHtml(sectionImage) + '" alt="' + escapeHtml(cleanHeadingText) + '">'
                     }
                     
                     if (section.content) {
                       html += '<p class="mb-4">' + processTextContent(section.content) + '</p>'
                     }
                     if (section.paragraphs && Array.isArray(section.paragraphs)) {
                       section.paragraphs.forEach((para: string) => {
                         if (para && para.trim()) {
                           html += '<p class="mb-4">' + processTextContent(para) + '</p>'
                         }
                       })
                     }
                     
                     return html
                   }).join('')}
                   
                   ${content.faq && Array.isArray(content.faq) && content.faq.length > 0 ? `
                   <style>
                   /* Ensure FAQ accordion content is visible when expanded - smooth slide and fade transition */
                   #faqAccordion .accordion-collapse {
                       visibility: visible !important;
                       overflow: hidden !important;
                       display: block !important;
                   }
                   
                   #faqAccordion .accordion-collapse.collapse.show {
                       visibility: visible !important;
                       opacity: 1 !important;
                       transform: translateY(0) !important;
                       transition: opacity 0.3s ease, transform 0.3s ease !important;
                       max-height: 2000px !important;
                   }
                   
                   #faqAccordion .accordion-collapse.collapse:not(.show) {
                       visibility: visible !important;
                       opacity: 0 !important;
                       transform: translateY(-10px) !important;
                       transition: opacity 0.25s ease, transform 0.25s ease, max-height 0.3s ease !important;
                       max-height: 0 !important;
                       padding: 0 !important;
                       margin: 0 !important;
                   }
                   
                   #faqAccordion .accordion-body {
                       display: block !important;
                       visibility: visible !important;
                       padding: 1rem 1.25rem;
                       color: #333;
                       transform: translateY(0);
                       transition: transform 0.3s ease;
                   }
                   
                   #faqAccordion .accordion-collapse:not(.show) .accordion-body {
                       transform: translateY(-5px);
                   }
                   
                   #faqAccordion .accordion-button {
                       transition: all 0.2s ease !important;
                       position: relative;
                   }
                   
                   #faqAccordion .accordion-button:not(.collapsed) {
                       box-shadow: none !important;
                   }
                   
                   #faqAccordion .accordion-button::after {
                       transition: transform 0.3s ease !important;
                   }
                   </style>
                   <div class="faq-section mt-5">
                       <h2 class="text-purple mb-4">Frequently Asked Questions</h2>
                       <div class="accordion" id="faqAccordion">
                           ${content.faq.map((faq: any, faqIndex: number) => {
                             const questionId = `faq-${faqIndex}`
                             const headingId = `heading-${faqIndex}`
                             const collapseId = `collapse-${faqIndex}`
                             return `
                           <div class="accordion-item mb-3">
                               <h3 class="accordion-header" id="${headingId}">
                                   <button class="accordion-button ${faqIndex === 0 ? '' : 'collapsed'}" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="${faqIndex === 0 ? 'true' : 'false'}" aria-controls="${collapseId}">
                                       ${escapeHtmlContent(faq.question || '')}
                                   </button>
                               </h3>
                               <div id="${collapseId}" class="accordion-collapse collapse ${faqIndex === 0 ? 'show' : ''}" aria-labelledby="${headingId}" data-bs-parent="#faqAccordion">
                                   <div class="accordion-body">
                                       ${processTextContent(faq.answer || '')}
                                   </div>
                               </div>
                           </div>
                           `
                           }).join('')}
                       </div>
                   </div>
                   ` : ''}
                </div>  
            </div>
              <!-- index interlinking -->
            <div class="col-lg-4 d-lg-block d-none">
                <div class="breadcrumbs forms">
                    <div class="blog-form-main">
    <form action="/blogs/blog-form-validation.php" method="post">
        <h3 class="text-center">Get Quote</h3>

        <div class="mb-3 form-check">
            <input type="text" id="name" name="name" placeholder="Enter Name" required>
        </div>

        <div class="mb-3 form-check">
            <input type="email" id="email" name="email" placeholder="Enter Email" required>
        </div>

        <div class="mb-3 form-check">
            <input type="text" id="company" name="company" placeholder="Enter Company Name" required>
        </div>

        <div class="mb-3 form-check">
            <input type="tel" id="phone" name="phone" placeholder="Enter Mobile Number" required>
        </div>

        <div class="mb-3 form-check">
            <input type="text" id="designation" name="designation" placeholder="Enter Designation" required>
        </div>

        <!-- Services Dropdown with Checkboxes -->
        <div class="mb-3 form-check">

            <div class="multiselect">
                <div class="multiselect-btn" onclick="toggleCheckboxList()">Select services</div>
                <div class="checkbox-list" id="checkboxList">
                    <label><input type="checkbox" name="services[]" value="SEO" onchange="updateSelected()"> SEO</label>
                    <label><input type="checkbox" name="services[]" value="Social Media" onchange="updateSelected()"> Social Media</label>
                    <label><input type="checkbox" name="services[]" value="Performance Marketing" onchange="updateSelected()"> Performance Marketing</label>
                    <label><input type="checkbox" name="services[]" value="Website Development" onchange="updateSelected()"> Website Development</label>
                    <label><input type="checkbox" name="services[]" value="Branding" onchange="updateSelected()"> Branding</label>
                    <label><input type="checkbox" name="services[]" value="PR Service" onchange="updateSelected()"> PR Service</label>
                    <label><input type="checkbox" name="services[]" value="ABM" onchange="updateSelected()"> ABM</label>
                    <label><input type="checkbox" name="services[]" value="Production" onchange="updateSelected()"> Production</label>
                    <label><input type="checkbox" name="services[]" value="Design Service" onchange="updateSelected()"> Design Service</label>
                    <label><input type="checkbox" name="services[]" value="GTM Campaign" onchange="updateSelected()"> GTM Campaign</label>
                    <label><input type="checkbox" name="services[]" value="Website Maintenance" onchange="updateSelected()"> Website Maintenance</label>
                    <label><input type="checkbox" name="services[]" value="Design Collateral" onchange="updateSelected()"> Design Collateral</label>
                    <label><input type="checkbox" name="services[]" value="Influencer Marketing" onchange="updateSelected()"> Influencer Marketing</label>
                    <label><input type="checkbox" name="services[]" value="Video Editing" onchange="updateSelected()"> Video Editing</label>
                    <label><input type="checkbox" name="services[]" value="Employer Branding" onchange="updateSelected()"> Employer Branding</label>
                    <label><input type="checkbox" name="services[]" value="Content Marketing" onchange="updateSelected()"> Content Marketing</label>
                    <label><input type="checkbox" name="services[]" value="Database" onchange="updateSelected()"> Database</label>
                    <label><input type="checkbox" name="services[]" value="Digital Marketing" onchange="updateSelected()"> Digital Marketing</label>
                    <label><input type="checkbox" name="services[]" value="Brand Consulting" onchange="updateSelected()"> Brand Consulting</label>
                    <label><input type="checkbox" name="services[]" value="Others" onchange="updateSelected()"> Others</label>
                </div>
            </div>
        </div>

        <div class="mb-3 form-check">
            <select class="budget" id="budget" name="budget" required>
                <option value="" disabled selected>Select your budget</option>
                <option>75,000 - 2 Lakhs</option>
                <option>2 Lakhs - 5 Lakhs</option>
                <option>5 Lakhs - 8 Lakhs</option>
                <option>8 Lakhs - 10 Lakhs</option>
                <option>Above 10 Lakhs</option>
            </select>
        </div>
        
        <!-- Hidden field for current page URL -->
    <input type="hidden" name="page_url" value="${escapeHtml(content.meta?.canonical || '#')}">

        <div class="mb-3 form-check">
            <textarea id="message" name="message" placeholder="Enter your message" required></textarea>
        </div>

        <div class="mb-3 form-check">
            <input type="checkbox" class="form-check-input" id="terms" required>
            <label class="form-check-label" for="terms">I agree to the Terms and Conditions</label>
        </div>

        <button type="submit" class="btn">Submit</button>
    </form>
</div>

<style>
.blog-form-main select.budget {
    width: 210px;
    padding: 8px 35px 8px 8px;
    border: 1px solid #ccc;
    border-radius: 12px;
    box-sizing: border-box;
}

.multiselect {
    position: relative;
    width: 90%;
}

.multiselect-btn {
    width: 90%;
    padding: 8px 35px 8px 8px;
    border: 1px solid #ccc;
    border-radius: 12px;
    background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='none' stroke='%23000' stroke-width='1.5' d='M1 1l4 4 4-4'/%3E%3C/svg%3E") no-repeat right 10px center;
    background-size: 12px auto;
    cursor: pointer;
    box-sizing: border-box;
}

.checkbox-list {
    display: none;
    position: absolute;
    width: 100%;
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 8px;
    z-index: 1000;
    max-height: 200px;
    overflow-y: auto;
    box-sizing: border-box;
}

.checkbox-list label {
    display: block;
    padding: 5px 10px;
    cursor: pointer;
}

.checkbox-list label:hover {
    background-color: #f0f0f0;
}
</style>

<script>
function toggleCheckboxList() {
    const list = document.getElementById("checkboxList");
    list.style.display = (list.style.display === "block") ? "none" : "block";
}
function updateSelected() {
    const checked = Array.from(document.querySelectorAll("#checkboxList input:checked"))
        .map(cb => cb.value);
    document.querySelector(".multiselect-btn").innerText = checked.length ? checked.join(", ") : "Select services";
}
document.addEventListener("click", function (e) {
    if (!document.querySelector(".multiselect").contains(e.target)) {
        document.getElementById("checkboxList").style.display = "none";
    }
});
</script>                </div>
            </div>
            <!-- index interlinking end -->
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

<script src="https://brandstory.in/blogs/assets/js/bootstrap.bundle.min.js"></script>
<script src="https://brandstory.in/blogs/assets/js/menu.js?key=1766724887"></script>
<script src="https://brandstory.in/blogs/assets/js/swiper.js?key=1766724887"></script>
<script src="https://brandstory.in/blogs/assets/js/animation.js?key=1766724887"></script>
<script src="https://brandstory.in/blogs/assets/js/site.js?key=1766724887"></script>
<script src="https://brandstory.in/blogs/assets/js/jquery.min.js?key=1766724887"></script>

<script>
// Fix FAQ accordion - prevent site.js interference
// Run after all scripts load
window.addEventListener('load', function() {
    setTimeout(function() {
        const faqButtons = document.querySelectorAll('#faqAccordion .accordion-button');
        
        faqButtons.forEach(function(button, index) {
            // Create completely new button to remove all listeners
            const newBtn = button.cloneNode(true);
            button.parentNode.replaceChild(newBtn, button);
            
            // Add click handler that runs FIRST and prevents others
            newBtn.addEventListener('click', function handler(e) {
                e.stopImmediatePropagation();
                e.stopPropagation();
                e.preventDefault();
                
                const targetId = newBtn.getAttribute('data-bs-target');
                if (!targetId) return;
                
                const target = document.querySelector(targetId);
                if (!target) return;
                
                // Manually toggle - more reliable
                const isCurrentlyExpanded = target.classList.contains('show');
                
                if (isCurrentlyExpanded) {
                    // Collapse with smooth transition
                    target.classList.remove('show');
                    newBtn.classList.add('collapsed');
                    newBtn.setAttribute('aria-expanded', 'false');
                } else {
                    // Expand with smooth transition
                    // First close any other open items in this accordion
                    const accordion = document.getElementById('faqAccordion');
                    if (accordion) {
                        const allCollapses = accordion.querySelectorAll('.accordion-collapse.show');
                        allCollapses.forEach(function(collapse) {
                            if (collapse !== target) {
                                collapse.classList.remove('show');
                                const btn = accordion.querySelector('[data-bs-target="#' + collapse.id + '"]');
                                if (btn) {
                                    btn.classList.add('collapsed');
                                    btn.setAttribute('aria-expanded', 'false');
                                }
                            }
                        });
                    }
                    
                    // Expand this one
                    target.style.display = 'block';
                    target.classList.add('show');
                    newBtn.classList.remove('collapsed');
                    newBtn.setAttribute('aria-expanded', 'true');
                }
            }, true); // Capture phase - highest priority
        });
    }, 500);
});
</script>

</body>
</html>`
}

export async function POST(request: NextRequest) {
  try {
    const { userInput, wordCount = 3000 } = await request.json()

    if (!userInput || !userInput.trim()) {
      return NextResponse.json(
        { error: 'Content input is required' },
        { status: 400 }
      )
    }

    const targetWordCount = parseInt(wordCount) || 3000
    
    // Validate word count range
    if (targetWordCount < 500 || targetWordCount > 4000) {
      return NextResponse.json(
        { error: 'Word count must be between 500 and 4,000 words' },
        { status: 400 }
      )
    }
    
    const minWordCount = Math.max(500, Math.floor(targetWordCount * 0.9))
    const maxWordCount = Math.min(4000, Math.floor(targetWordCount * 1.1))

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      )
    }

    // Calculate number of sections based on word count
    let estimatedSections
    let paragraphDescription
    let introDescription
    
    if (targetWordCount <= 1000) {
      estimatedSections = Math.max(3, Math.min(6, Math.floor(targetWordCount / 150)))
      paragraphDescription = "2-3 comprehensive paragraphs (each paragraph should be 6-10 sentences, 100-180 words per paragraph)"
      introDescription = "Comprehensive introductory paragraph (8-12 sentences, 150-200 words)"
    } else if (targetWordCount <= 3000) {
      estimatedSections = Math.max(6, Math.min(12, Math.floor(targetWordCount / 200)))
      paragraphDescription = "2-3 LONG, comprehensive paragraphs (each paragraph should be 8-12 sentences, 150-250 words per paragraph)"
      introDescription = "Comprehensive introductory paragraph (10-15 sentences, 200-300 words)"
    } else {
      estimatedSections = Math.max(10, Math.min(20, Math.floor(targetWordCount / 250)))
      paragraphDescription = "2-3 LONG, comprehensive paragraphs (each paragraph should be 10-15 sentences, 200-300 words per paragraph)"
      introDescription = "Comprehensive introductory paragraph (12-18 sentences, 250-350 words)"
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
- Write approximately ${targetWordCount} words (between ${minWordCount} and ${maxWordCount} words) with Flesch-Kincaid readability 60-70 and Surfer SEO score 90+.
- Generate ${estimatedSections} sections, each with ${paragraphDescription}.
- Each paragraph must be substantial, well-developed, and cohesive. Avoid short 2-4 line paragraphs. Write in-depth, detailed content that thoroughly explores each aspect of the topic.
- Generate a comprehensive FAQ section with MINIMUM 20 frequently asked questions and detailed answers related to "${userInput}". Each FAQ should have a clear, specific question and a comprehensive answer (3-5 sentences, 50-100 words per answer). Questions should cover common concerns, important aspects, and practical information about the topic.
- Based on the topic, determine the appropriate category (e.g., Guide, Blog, Tutorial, Tips, etc.) and topic/category name.
- All headings, content, examples, and FAQs must be relevant to "${userInput}" only.
- Write as a practitioner explaining real work - not marketing copy. Use smooth transitions between ideas within paragraphs.

Use plain text only - NO HTML entities. Use regular apostrophes (') and quotes (").

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
    "title": "..."
  },
  "intro": "${introDescription}",
  "sections": [
    {
      "heading": "Section heading directly related to the topic",
      "content": "First comprehensive, detailed paragraph about this specific aspect of the topic. This should be a substantial, well-developed paragraph that thoroughly explores the topic.",
      "paragraphs": [
        "Second comprehensive, detailed paragraph continuing the discussion. Develop ideas fully with examples, explanations, and insights.",
        "Third comprehensive, detailed paragraph if needed. Ensure each paragraph is substantial and adds significant value."
      ],
      "showImage": true
    }
  ],
  "faq": [
    {
      "question": "A relevant question about the topic",
      "answer": "A comprehensive answer (3-5 sentences, 50-100 words) that provides valuable information about the topic."
    }
  ]
}`

    // Always use maximum tokens - let the model handle allocation naturally
    const models = [
      { 
        name: 'gpt-4o', 
        maxTokens: 16384
      }
    ]

    let completion
    let responseContent = ''

    for (const modelConfig of models) {
      try {
        console.log(`[Humanizer] Using model: ${modelConfig.name} with max_tokens: ${modelConfig.maxTokens} (target: ${targetWordCount} words)`)
        completion = await openai.chat.completions.create({
          model: modelConfig.name,
          messages: [
            {
              role: 'system',
              content: `You are writing as a senior practitioner with real delivery experience. This is not marketing copy. This is an explanation of how the work is actually done. Write for a smart client who has worked with agencies before and is skeptical. Avoid buzzwords like seamless, cutting-edge, world-class, best-in-class, user-centric. Prefer practical wording over abstract language. Write the way you would explain this on a real call. Write comprehensive, accurate blog posts that are DIRECTLY and SPECIFICALLY about the user's exact topic. All content must be relevant to the exact topic provided. Write factual, accurate content - avoid making up specific statistics, company names, or unverified claims. Generate ${estimatedSections} sections, each with 2-3 LONG, comprehensive paragraphs (8-12 sentences each, 150-250 words per paragraph). Each paragraph must be substantial and well-developed - avoid short 2-4 line paragraphs. Generate a comprehensive FAQ section with MINIMUM 20 frequently asked questions and detailed answers (3-5 sentences, 50-100 words per answer). Total approximately ${targetWordCount} words. You MUST return valid JSON only - no apologies, no explanations, just the JSON object. Write ONLY about the specific topic - do not write generic, irrelevant, or hallucinated content.`,
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
          console.warn(`⚠ Response was truncated (max_tokens: ${modelConfig.maxTokens} reached) for model ${modelConfig.name}`)
          console.warn(`Target word count: ${targetWordCount}`)
          
          // Try to fix truncated JSON by closing any open structures
          if (responseContent) {
            try {
              let fixedContent = responseContent.trim()
              
              const openBraces = (fixedContent.match(/\{/g) || []).length
              const closeBraces = (fixedContent.match(/\}/g) || []).length
              const openBrackets = (fixedContent.match(/\[/g) || []).length
              const closeBrackets = (fixedContent.match(/\]/g) || []).length
              
              if (fixedContent.match(/"[^"]*$/)) {
                fixedContent = fixedContent.replace(/"[^"]*$/, '"')
              }
              
              for (let i = 0; i < openBrackets - closeBrackets; i++) {
                fixedContent += ']'
              }
              
              for (let i = 0; i < openBraces - closeBraces; i++) {
                fixedContent += '}'
              }
              
              JSON.parse(fixedContent)
              responseContent = fixedContent
              console.log('✓ Fixed truncated JSON response')
            } catch (fixError) {
              console.warn('Could not fix truncated JSON')
              throw new Error(`Response was truncated at maximum token limit (16384). The content is too long. Please try with a lower word count (suggested: ${Math.floor(targetWordCount * 0.7)} words).`)
            }
          } else {
            throw new Error(`Response was truncated at maximum token limit (16384). The content is too long. Please try with a lower word count (suggested: ${Math.floor(targetWordCount * 0.7)} words).`)
          }
          
          break
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
      let jsonString = jsonMatch ? jsonMatch[1] : responseContent
      
      jsonString = jsonString.trim()
      
      if (!jsonString.endsWith('}')) {
        const openBraces = (jsonString.match(/\{/g) || []).length
        const closeBraces = (jsonString.match(/\}/g) || []).length
        const openBrackets = (jsonString.match(/\[/g) || []).length
        const closeBrackets = (jsonString.match(/\]/g) || []).length
        
        if (jsonString.match(/"[^"]*$/)) {
          jsonString = jsonString.replace(/"[^"]*$/, '"')
        }
        
        for (let i = 0; i < openBrackets - closeBrackets; i++) {
          jsonString += ']'
        }
        
        for (let i = 0; i < openBraces - closeBraces; i++) {
          jsonString += '}'
        }
      }
      
      contentData = JSON.parse(jsonString)
    } catch (parseError: any) {
      console.error('JSON Parse Error:', parseError)
      console.error('Response content length:', responseContent.length)
      console.error('Response content (first 2000 chars):', responseContent.substring(0, 2000))
      
      if (parseError.message.includes('Unterminated') || parseError.message.includes('Unexpected end')) {
        throw new Error(`Response was truncated. The content is too long for the current token limit. Please try with a lower word count (suggested: ${Math.floor(targetWordCount * 0.7)} words) or the system will need more tokens.`)
      }
      
      throw new Error(`Failed to parse content from API response: ${parseError.message}`)
    }

    // Step 1: Generate HTML from content
    const rawHtml = generateBlogHTML(contentData)

    // Step 2: Humanize text nodes in the HTML using Cheerio (2 API calls)
    console.log('🔄 Starting Cheerio-based humanization (2 API calls)...')
    let htmlContent = rawHtml
    try {
      const humanizePromise = humanizeHtmlWithCheerio(rawHtml)
      const timeoutPromise = new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error('Humanization timed out after 5 minutes')), 300000)
      )
      htmlContent = await Promise.race([humanizePromise, timeoutPromise])
      console.log('✓ Humanization completed successfully')
    } catch (humanizeError: any) {
      console.error('⚠ Humanization failed, returning original HTML:', humanizeError.message)
    }

    // Return HTML file
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="generated-blog-humanized-${Date.now()}.html"`,
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
