import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import archiver from 'archiver'
import { readdirSync, statSync, readFileSync } from 'fs'
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

// Generate complete HTML page with all sections - returns full HTML like template9
// This reads the entire template HTML file and replaces hardcoded content with AI-generated content
function generateHTMLPage(content: any, companyName?: string, ctaLink?: string): string {
  // Read the complete template HTML file
  const templatePath = join(process.cwd(), 'public', 'template9.html')
  let html = readFileSync(templatePath, 'utf-8')

  // Convert absolute paths to relative paths for ZIP file
  html = html.replace(/href="\/relgrow-interior-design-services\//g, 'href="')
  html = html.replace(/src="\/relgrow-interior-design-services\//g, 'src="')
  html = html.replace(/url\("\/relgrow-interior-design-services\//g, 'url("')
  html = html.replace(/url\('\/relgrow-interior-design-services\//g, "url('")

  // Replace ALL hardcoded content with AI-generated content
  // This preserves the exact HTML structure, all styles, and all scripts

  // 1. Page title
  if (content.page_title) {
    html = html.replace(/<title>Trusted Interior Design Services in Coimbatore<\/title>/, `<title>${escapeHtml(content.page_title)}</title>`)
  }

  // 2. Hero section
  if (content.hero?.title) {
    html = html.replace(/<h1>Trusted Interior Design Services in Coimbatore<\/h1>/, `<h1>${escapeHtml(content.hero.title)}</h1>`)
  }

  if (content.hero?.cta_text) {
    html = html.replace(/Book Your Free Interior Design Consultation Now!/, escapeHtml(content.hero.cta_text))
  }

  // 3. About section
  if (content.intro?.heading) {
    html = html.replace(/<h2>Trusted Interior Design Company in Coimbatore<\/h2>/, `<h2>${escapeHtml(content.intro.heading)}</h2>`)
  }

  if (content.intro?.paragraphs && content.intro.paragraphs.length > 0) {
    // Replace the about paragraphs
    const aboutSection = html.match(/<section class="about">[\s\S]*?<\/section>/)
    if (aboutSection) {
      let newAboutSection = aboutSection[0]
      const newParagraphs = content.intro.paragraphs.map((p: string) => `<p>\n          ${escapeHtml(p)}\n        </p>`).join('\n')
      newAboutSection = newAboutSection.replace(/<p>[\s\S]*?<\/p>[\s\S]*?<p>[\s\S]*?<\/p>/, newParagraphs)
      html = html.replace(aboutSection[0], newAboutSection)
    }
  }

  // 4. Gallery section
  if (content.gallery?.heading) {
    html = html.replace(/<h2>Interior Design Ideas<\/h2>/, `<h2>${escapeHtml(content.gallery.heading)}</h2>`)
  }

  if (content.gallery?.description) {
    html = html.replace(/Explore our diverse range of interior design ideas for 2026, where creativity meets functionality\./, escapeHtml(content.gallery.description))
  }

  // Replace gallery tabs if provided
  if (content.gallery?.tabs && content.gallery.tabs.length > 0) {
    const tabs = content.gallery.tabs.slice(0, 5)
    const tabsHTML = tabs.map((tab: any, index: number) => `
          <button class="tab-btn${index === 0 ? ' active' : ''}" data-filter="${escapeHtml(tab.filter || 'all')}">${escapeHtml(tab.name)}</button>`).join('\n')

    const tabsMatch = html.match(/(<div class="gallery-tabs">)([\s\S]*?)(<\/div>)/)
    if (tabsMatch) {
      html = html.replace(tabsMatch[0], tabsMatch[1] + '\n' + tabsHTML + '\n        </div>')
    }
  }

  // Replace gallery items if provided - keep original images, only change text
  if (content.gallery?.items && content.gallery.items.length > 0) {
    const items = content.gallery.items.slice(0, 6)
    // Get original image sources from the HTML to preserve them
    const originalImages = html.match(/<div class="gallery-item[^"]*">[\s\S]*?<img src="([^"]+)"/g) || []
    const imageSrcs = originalImages.map((match: string) => {
      const srcMatch = match.match(/src="([^"]+)"/)
      return srcMatch ? srcMatch[1] : 'images/placeholder.jpg'
    })

    const galleryHTML = items.map((item: any, index: number) => {
      const imgSrc = imageSrcs[index] || 'images/placeholder.jpg'
      return `
          <div class="gallery-item ${escapeHtml(item.category || 'all')}">
            <div class="project-image">
              <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(item.title)}">
              <div class="project-overlay">
                <div class="project-info">
                  <h3>${escapeHtml(item.title)}</h3>
                  <span>${escapeHtml(item.type)}</span>
                </div>
              </div>
            </div>
          </div>`
    }).join('\n')

    const galleryGridMatch = html.match(/(<div class="gallery-grid">)([\s\S]*?)(<\/div>\s*<\/div>\s*<\/section>)/)
    if (galleryGridMatch) {
      html = html.replace(galleryGridMatch[0], galleryGridMatch[1] + '\n' + galleryHTML + '\n        </div>\n      </div>\n    </section>')
    }
  }

  // 5. Reviews section - make heading dynamic from AI content
  if (content.reviews?.heading) {
    html = html.replace(/(<section class="review">[\s\S]*?<h2>)(Reviewed by Verified Experts)(<\/h2>)/, `$1${escapeHtml(content.reviews.heading)}$3`)
  }

  // 6. Success/Track record section - template uses success-layout (not success-grid)
  if (content.track_record?.heading) {
    html = html.replace(/(<h2>)(Proven Success in Interior Design)(<\/h2>)/, `$1${escapeHtml(content.track_record.heading)}$3`)
  }

  // Replace stats if provided - match actual template structure: two success-column divs inside success-layout
  if (content.track_record?.stats && content.track_record.stats.length >= 4) {
    const stats = content.track_record.stats
    const bg1 = 'url(&quot;images/blue-bg.webp&quot;)'
    const bg2 = 'url(&quot;images/darkblue-bg.webp&quot;)'
    const leftColumnCards = [
      `<div class="success-card" style="background-image: ${bg1}"><div class="card-content"><h3>${escapeHtml(stats[0].number)}</h3><h4>${escapeHtml(stats[0].label)}</h4><p>${escapeHtml(stats[0].description)}</p></div></div>`,
      `<div class="success-card" style="background-image: ${bg2}"><div class="card-content"><h3>${escapeHtml(stats[1].number)}</h3><h4>${escapeHtml(stats[1].label)}</h4><p>${escapeHtml(stats[1].description)}</p></div></div>`,
    ].join('\n            ')
    const rightColumnCards = [
      `<div class="success-card" style="background-image: ${bg2}"><div class="card-content"><h3>${escapeHtml(stats[2].number)}</h3><h4>${escapeHtml(stats[2].label)}</h4><p>${escapeHtml(stats[2].description)}</p></div></div>`,
      `<div class="success-card" style="background-image: ${bg2}"><div class="card-content"><h3>${escapeHtml(stats[3].number)}</h3><h4>${escapeHtml(stats[3].label)}</h4><p>${escapeHtml(stats[3].description)}</p></div></div>`,
    ].join('\n            ')
    const newLeftColumn = `<div class="success-column">\n            ${leftColumnCards}\n          </div>`
    const newRightColumn = `<div class="success-column">\n            ${rightColumnCards}\n          </div>`
    // Replace first success-column block (left)
    html = html.replace(/(<section class="success">[\s\S]*?<div class="success-column">)[\s\S]*?(<\/div>\s*<div class="success-main-img">)/, `$1\n            ${leftColumnCards}\n          $2`)
    // Replace second success-column block (right)
    html = html.replace(/(<div class="success-main-img">[\s\S]*?<\/div>\s*<div class="success-column">)[\s\S]*?(<\/div>\s*<\/div>\s*<\/div>\s*<\/section>)/, `$1\n            ${rightColumnCards}\n          $2`)
  }

  // 7. Services section
  if (content.services?.heading) {
    html = html.replace(/<h2>Comprehensive Interior Design Services in Coimbatore<\/h2>/, `<h2>${escapeHtml(content.services.heading)}</h2>`)
  }

  if (content.services?.description) {
    // Template has newlines in the paragraph - use flexible whitespace match
    html = html.replace(/Relgrow offers\s+a wide range of interior design services tailored\s+to meet the diverse needs of our clients in Coimbatore\.\s+From\s+residential projects to commercial spaces,[\s\S]*?ensuring a seamless transformation of\s+your space\./, escapeHtml(content.services.description))
  }

  // Dynamically build service cards (generate 5 cards like the template)
  if (content.services?.cards && content.services.cards.length > 0) {
    // Pad to 5 cards if less provided
    const cards = [...content.services.cards]
    while (cards.length < 5) {
      cards.push({
        title: `Service ${cards.length + 1}`,
        description: 'Comprehensive solutions tailored to meet your specific needs with expert professional execution.'
      })
    }

    const servicesCardsHTML = cards.slice(0, 5).map((card: any, index: number) => `
            <div class="service-card${index === 0 ? ' active' : ''}">
              <h3>${escapeHtml(card.title)}</h3>
              <p>${escapeHtml(card.description)}</p>
            </div>`).join('\n')

    const cardsContainerMatch = html.match(/(<div class="services-cards">)([\s\S]*?)(<\/div>\s*<\/div>\s*<\/section>)/)
    if (cardsContainerMatch) {
      html = html.replace(cardsContainerMatch[0], cardsContainerMatch[1] + servicesCardsHTML + '\n          </div>\n        </div>\n      </div>\n    </section>')
    }
  }

  // 8. Why Choose section - dynamically build exactly 6 cards
  if (content.why_choose?.heading) {
    html = html.replace(/(<h2>)(Why Choose Relgrow for Interior Design)(<\/h2>)/, `$1${escapeHtml(content.why_choose.heading)}$3`)
  }

  // Replace intro paragraph if provided
  if (content.why_choose?.intro) {
    const whyIntroMatch = html.match(/(<section class="why-choose">[\s\S]*?<h2>[\s\S]*?<\/h2>\s*<p>)[\s\S]*?(<\/p>)/)
    if (whyIntroMatch) {
      html = html.replace(whyIntroMatch[0], whyIntroMatch[1] + escapeHtml(content.why_choose.intro) + whyIntroMatch[2])
    }
  }

  // Always generate 6 cards for why-choose section
  if (content.why_choose?.reasons && content.why_choose.reasons.length > 0) {
    // Pad to 6 reasons if less provided
    const reasons = [...content.why_choose.reasons]
    while (reasons.length < 6) {
      reasons.push({
        title: `Reason ${reasons.length + 1}`,
        description: 'Custom tailored solutions for your specific needs with expert guidance and professional execution.'
      })
    }

    const cardsHTML = reasons.slice(0, 6).map((reason: any, index: number) => `
          <!-- Card ${index + 1} -->
          <div class="why-card">
            <div class="why-icon">
              <svg width="65" height="65" viewBox="0 0 65 65" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32.5" cy="32.5" r="30" fill="#2563eb" stroke="#ffffff" stroke-width="2"/>
                <text x="32.5" y="40" text-anchor="middle" fill="white" font-size="20" font-weight="bold">${index + 1}</text>
              </svg>
            </div>
            <h3>${escapeHtml(reason.title)}</h3>
            <p>${escapeHtml(reason.description)}</p>
          </div>`).join('\n')

    // Replace the why-choose-cards container
    const cardsMatch = html.match(/(<div class="why-choose-cards">)([\s\S]*?)(<\/div>\s*<\/div>\s*<\/section>)/)
    if (cardsMatch) {
      html = html.replace(cardsMatch[0], cardsMatch[1] + cardsHTML + '\n        </div>\n      </div>\n    </section>')
    }
  }

  // 9. Process section - dynamically build all 5 steps
  if (content.process?.heading) {
    html = html.replace(/(<h2>)(Our Streamlined Interior Design Process)(<\/h2>)/, `$1${escapeHtml(content.process.heading)}$3`)
  }
  if (content.process?.intro) {
    html = html.replace(/(<p class="process-intro">)[\s\S]*?(<\/p>)/, `$1${escapeHtml(content.process.intro)}$2`)
  }

  if (content.process?.steps && content.process.steps.length > 0) {
    // Build process items matching the HTML structure
    const processHTML = content.process.steps.map((step: any, index: number) => `
          <div class="process-item">
            <div class="process-num">${String(index + 1).padStart(2, '0')}</div>
            <div class="process-title">${escapeHtml(step.title)}</div>
            <div class="process-details">
              <h3>${escapeHtml(step.title)}</h3>
              <p>${escapeHtml(step.description)}</p>
            </div>
          </div>`).join('\n')

    const processListMatch = html.match(/(<div class="process-list">)([\s\S]*?)(<\/div>\s*<\/div>\s*<\/section>)/)
    if (processListMatch) {
      html = html.replace(processListMatch[0], processListMatch[1] + processHTML + '\n        </div>\n      </div>\n    </section>')
    }
  }

  // 10. Trust section (trust-relgrow)
  if (content.trust?.heading) {
    html = html.replace(/(<h2>)(Why Leading Brands Trust Relgrow for Interior Design)(<\/h2>)/, `$1${escapeHtml(content.trust.heading)}$3`)
  }
  if (content.trust?.description) {
    // Replace the paragraph in trust-content
    const trustMatch = html.match(/(<section class="trust-relgrow">[\s\S]*?<div class="trust-content">[\s\S]*?<p>)[\s\S]*?(<\/p>)/)
    if (trustMatch) {
      html = html.replace(trustMatch[0], trustMatch[1] + escapeHtml(content.trust.description) + trustMatch[2])
    }
  }

  // 11. Professional Importance section - heading is multiline in template
  if (content.professional_importance?.heading) {
    // Match the full h2 (including newlines) inside professional-importance section only
    html = html.replace(/(<section class="professional-importance">[\s\S]*?<div class="pro-header">\s*<h2>)\s*[\s\S]*?(<\/h2>)/, `$1\n            ${escapeHtml(content.professional_importance.heading)}\n          $2`)
  }
  if (content.professional_importance?.intro) {
    const proHeaderMatch = html.match(/(<section class="professional-importance">[\s\S]*?<div class="pro-header">[\s\S]*?<p>)[\s\S]*?(<\/p>)/)
    if (proHeaderMatch) {
      html = html.replace(proHeaderMatch[0], proHeaderMatch[1] + escapeHtml(content.professional_importance.intro) + proHeaderMatch[2])
    }
  }

  // Always generate 5 professional importance points
  if (content.professional_importance?.points && content.professional_importance.points.length > 0) {
    // Pad to 5 points if less provided
    const points = [...content.professional_importance.points]
    while (points.length < 5) {
      points.push({
        title: `Point ${points.length + 1}`,
        description: 'Expert professionals ensure quality results and optimal outcomes for your project.'
      })
    }

    const listItemsHTML = points.slice(0, 5).map((point: any) => `
              <li>${escapeHtml(point.description)}</li>`).join('\n')

    const proListMatch = html.match(/(<div class="pro-list">[\s\S]*?<ul>)([\s\S]*?)(<\/ul>)/)
    if (proListMatch) {
      html = html.replace(proListMatch[0], proListMatch[1] + listItemsHTML + proListMatch[3])
    }
  }

  // 12. Benefits section - dynamically build all benefit cards
  if (content.benefits?.heading) {
    html = html.replace(/(<h2>)(Benefits of Partnering with Relgrow)(<\/h2>)/, `$1${escapeHtml(content.benefits.heading)}$3`)
  }

  // Replace intro paragraph in benefits-left
  if (content.benefits?.intro) {
    const benefitsIntroMatch = html.match(/(<div class="benefits-left">[\s\S]*?<p>)[\s\S]*?(<\/p>)/)
    if (benefitsIntroMatch) {
      html = html.replace(benefitsIntroMatch[0], benefitsIntroMatch[1] + escapeHtml(content.benefits.intro) + benefitsIntroMatch[2])
    }
  }

  // Always generate 4 benefit cards
  if (content.benefits?.items && content.benefits.items.length > 0) {
    // Pad to 4 items if less provided
    const items = [...content.benefits.items]
    while (items.length < 4) {
      items.push({
        title: `Benefit ${items.length + 1}`,
        description: 'Comprehensive solutions tailored to meet your specific needs with expert professional execution.'
      })
    }
    const benefitsHTML = items.slice(0, 4).map((item: any, index: number) => `
            <div class="benefit-card">
              <div class="benefit-icon">
                <img src="images/benifits-icon-${(index % 4) + 1}.png" alt="${escapeHtml(item.title)}" />
              </div>
              <h3>${escapeHtml(item.title)}</h3>
              <p>${escapeHtml(item.description)}</p>
            </div>`).join('\n')

    const benefitsRightMatch = html.match(/(<div class="benefits-right">)([\s\S]*?)(<\/div>\s*<\/div>\s*<\/section>)/)
    if (benefitsRightMatch) {
      html = html.replace(benefitsRightMatch[0], benefitsRightMatch[1] + '\n' + benefitsHTML + '\n          </div>\n        </div>\n      </div>\n    </section>')
    }
  }

  // 13. Testimonials section - dynamically build exactly 4 testimonials
  if (content.testimonials?.heading) {
    html = html.replace(/(<h2>)(Testimonials)(<\/h2>)/, `$1${escapeHtml(content.testimonials.heading)}$3`)
  }

  // Always generate exactly 4 testimonials
  if (content.testimonials?.items && content.testimonials.items.length > 0) {
    // Pad to exactly 4 testimonials if less provided
    const items = [...content.testimonials.items]
    while (items.length < 4) {
      items.push({
        name: 'Happy Client',
        role: 'Customer',
        content: 'Excellent service and professional team. Highly recommended for anyone looking for quality solutions.'
      })
    }

    const testimonialsHTML = items.slice(0, 4).map((testimonial: any) => `
          <div class="swiper-slide">
            <div class="testimonial-card">
              <div class="quote-icon">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M49.8611 30.7737C48.2771 30.6157 44.7921 30.6157 44.7921 28.3977C44.7921 25.3887 49.2271 21.4287 56.3551 17.1517C58.5721 15.7257 63.1671 13.5087 63.1671 10.4987C63.1671 8.12274 61.4241 6.38074 57.7811 6.85574C54.2961 7.33074 48.9101 9.70674 41.7831 15.7257C34.3381 21.9037 27.3691 32.1997 27.3691 42.3367C27.3691 52.6327 34.3381 62.9287 45.5851 62.9287C54.6131 62.9287 62.3751 56.1177 62.3751 46.7717C62.3741 39.6437 57.4641 31.4077 49.8611 30.7737Z" fill="white"/>
                  <path d="M27.594 26.3197C26.293 25.6397 24.866 25.1947 23.326 25.0667C21.742 24.9087 18.257 24.9087 18.257 22.6907C18.257 19.6817 22.692 15.7217 29.82 11.4447C32.038 10.0187 36.631 7.80171 36.631 4.79171C36.631 2.41571 34.888 0.673707 31.245 1.14871C27.76 1.62371 22.374 3.99971 15.247 10.0187C7.80301 16.1967 0.833008 26.4927 0.833008 36.6307C0.833008 46.9267 7.80201 57.2227 19.049 57.2227C21.693 57.2227 24.227 56.6347 26.49 55.5737C24.271 51.5617 23.088 46.9197 23.088 42.3377C23.089 36.6797 24.911 31.1927 27.594 26.3197Z" fill="white"/>
                </svg>
              </div>
              <p class="testimonial-text">${escapeHtml(testimonial.content)}</p>
              <p class="testimonial-author">— ${escapeHtml(testimonial.name)}, ${escapeHtml(testimonial.role)}</p>
            </div>
          </div>`).join('\n')

    // Scope to testimonials section; allow comment "<!-- Pagination -->" between </div> and swiper-pagination
    const testimonialsSectionMatch = html.match(/(<section class="testimonials">[\s\S]*?<div class="swiper-wrapper">)([\s\S]*)(<\/div>[\s\S]*?<div class="swiper-pagination">)/)
    if (testimonialsSectionMatch) {
      html = html.replace(testimonialsSectionMatch[0], testimonialsSectionMatch[1] + testimonialsHTML + '\n          </div>\n          <!-- Pagination -->\n          <div class="swiper-pagination">')
    }
  }

  // 14. Industries section
  if (content.industries?.heading) {
    html = html.replace(/(<h2>)(Industries We Serve)(<\/h2>)/, `$1${escapeHtml(content.industries.heading)}$3`)
  }
  if (content.industries?.description) {
    html = html.replace(/(<p class="industries-desc">)[\s\S]*?(<\/p>)/, `$1${escapeHtml(content.industries.description)}$2`)
  }

  // Dynamically build industry cards - ensure 9 minimum
  if (content.industries?.items && content.industries.items.length > 0) {
    // Pad to 9 industries if less provided
    const industries = [...content.industries.items]
    while (industries.length < 9) {
      industries.push(`Industry ${industries.length + 1}`)
    }

    const industriesHTML = industries.slice(0, 9).map((industry: string) => `
          <a href="#" class="industry-card">
            <span>${escapeHtml(industry)}</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 17L17 7M17 7H7M17 7V17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>`).join('\n')

    const industriesGridMatch = html.match(/(<div class="industries-grid">)([\s\S]*?)(<\/div>\s*<\/div>\s*<\/section>)/)
    if (industriesGridMatch) {
      html = html.replace(industriesGridMatch[0], industriesGridMatch[1] + '\n' + industriesHTML + '\n        </div>\n      </div>\n    </section>')
    }
  }

  // 15. Design Tools section (replace only the section-desc inside this section, not gallery's)
  if (content.design_tools?.heading) {
    html = html.replace(/(<h2>)(Advanced Design Tools & Technologies)(<\/h2>)/, `$1${escapeHtml(content.design_tools.heading)}$3`)
  }
  if (content.design_tools?.description) {
    // Match section-desc only inside design-tools section (gallery also has section-desc)
    html = html.replace(/(<section class="design-tools">[\s\S]*?<p class="section-desc">)[\s\S]*?(<\/p>)/, `$1${escapeHtml(content.design_tools.description)}$2`)
  }

  // Dynamically build tools accordion items - ensure 8 minimum
  if (content.design_tools?.tools && content.design_tools.tools.length > 0) {
    // Pad to 8 tools if less provided
    const tools = [...content.design_tools.tools]
    while (tools.length < 8) {
      tools.push({
        name: `Tool ${tools.length + 1}`,
        description: 'Advanced technology and tools to enhance service delivery and ensure optimal results for your project.'
      })
    }

    const toolsHTML = tools.slice(0, 8).map((tool: any, index: number) => `
            <div class="accordion-item${index === 0 ? ' active' : ''}">
              <div class="accordion-header">
                <h3>${escapeHtml(tool.name)}</h3>
                <span class="accordion-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="${index === 0 ? 'M18 15L12 9L6 15' : 'M6 9L12 15L18 9'}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
              </div>
              <div class="accordion-content">
                <p>${escapeHtml(tool.description)}</p>
              </div>
            </div>`).join('\n')

    const toolsAccordionMatch = html.match(/(<div class="tools-accordion">)([\s\S]*?)(<\/div>\s*<\/div>\s*<\/section>)/)
    if (toolsAccordionMatch) {
      html = html.replace(toolsAccordionMatch[0], toolsAccordionMatch[1] + '\n' + toolsHTML + '\n          </div>\n        </div>\n      </div>\n    </section>')
    }
  }

  // 16. FAQ section - dynamically build all FAQs
  if (content.faq?.heading) {
    html = html.replace(/(<h2>)(FAQ)(<\/h2>)/, `$1${escapeHtml(content.faq.heading)}$3`)
  }

  if (content.faq?.items && content.faq.items.length > 0) {
    const faqHTML = content.faq.items.map((faq: any, index: number) => `
          <div class="faq-item${index === 0 ? ' active' : ''}">
            <div class="faq-header">
              <h3>${escapeHtml(faq.question)}</h3>
              <span class="faq-icon">
                <svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1.5L9 9.5L17 1.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            </div>
            <div class="faq-content">
              <p>${escapeHtml(faq.answer)}</p>
            </div>
          </div>`).join('\n')

    const faqAccordionMatch = html.match(/(<div class="faq-accordion">)([\s\S]*?)(<\/div>\s*<\/div>\s*<\/section>)/)
    if (faqAccordionMatch) {
      html = html.replace(faqAccordionMatch[0], faqAccordionMatch[1] + faqHTML + '\n        </div>\n      </div>\n    </section>')
    }
  }

  // 17. Final CTA section
  if (content.cta?.heading) {
    html = html.replace(/(<h2>)(Ready to Transform Your Space with Relgrow\?)(<\/h2>)/, `$1${escapeHtml(content.cta.heading)}$3`)
  }
  if (content.cta?.description) {
    html = html.replace(/(<p class="cta-desc">)[\s\S]*?(<\/p>)/, `$1${escapeHtml(content.cta.description)}$2`)
  }
  if (content.cta?.subtext) {
    html = html.replace(/Your home deserves the best in interior design\./, escapeHtml(content.cta.subtext))
  }
  if (content.cta?.button_text) {
    html = html.replace(/Book Your Free Interior Design Consultation Now!/, escapeHtml(content.cta.button_text))
  }

  // Replace all CTA links if provided
  if (ctaLink) {
    html = html.replace(/href="#"/g, `href="${escapeHtml(ctaLink)}"`)
  }

  // Replace hardcoded interior-design-specific image alt texts with generic text
  html = html.replace(/alt="Professional Interior Design Importance"/g, 'alt="Professional Services"')
  html = html.replace(/alt="Interior Designer with Tools"/g, 'alt="Expert with Tools"')

  // Replace company name - if provided use it, otherwise use generic professional name
  const finalCompanyName = companyName || 'Our Company'
  html = html.replace(/Relgrow/g, escapeHtml(finalCompanyName))

  return html
}

export async function POST(request: NextRequest) {
  try {
    const { content, companyName, ctaLink } = await request.json()

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    // Generate comprehensive landing page content based on user input
    const prompt = `Task:
Create a complete interior design landing page based strictly on this input:
"${content}"

Content Refinement:
Infuse your unique voice: Edit the draft to add your own insights, style, and personality to make it sound human and original.
Add credible details: Enhance the content with statistics, facts, and specifics from reliable sources to back up any claims.
Trim unnecessary words: Remove fluff and generic statements to make the content more direct and impactful.
Check for SEO alignment: Review and tweak keyword density to ensure it sounds natural and aligns with the search intent.
Proofread carefully: Check for any errors or awkward phrasing that the AI may have generated.
Use simple, clear language and an informal style, including contractions.
Vary sentence and paragraph lengths significantly, including occasional one-sentence paragraphs for emphasis.
Avoid corporate jargon and clichés (e.g., 'leverage,' 'cutting-edge,' 'game-changer', 'in today's world').
Inject your own personality and perspective, and include one or two personal asides or relevant mini-anecdotes that relate to the topic.
Use active voice and address the reader directly with 'you' and 'your'.
Avoid excessive em dashes (—) or overly formal transition words like 'furthermore,' 'moreover,' or 'thus.'
End with a clear, actionable takeaway or an open question to the reader to invite reflection or engagement.

${companyName ? `Use the company name "${companyName}" throughout the content instead of generic company names.` : 'Use a professional interior design company name.'}
${ctaLink ? `The CTA buttons should link to "${ctaLink}" - make the call-to-action text compelling for this destination.` : 'Use generic call-to-action text.'}

REQUIRED SECTIONS (generate CUSTOM content based on "${content}" - DO NOT use the example values below literally, they are just showing the structure):
1. Page Title (SEO-optimized, 60 chars max - based on user's service)
2. Hero (title about the specific service, cta_text)
3. About/Intro (heading about the service, 2 detailed paragraphs about the user's specific service)
4. Gallery (heading relevant to service, description about project showcase, 5 filter tabs with names relevant to service, 6 gallery items with titles and types)
5. Reviews (heading)
6. Track Record/Success (heading, 4 custom stats RELEVANT to the service type with realistic numbers)
7. Services (heading about what they offer, detailed description 200-250 words, 5 service cards with title and detailed description)
8. Why Choose (heading, intro paragraph 100-150 words, 6 reasons SPECIFIC to this service with detailed descriptions)
9. Process (heading, intro paragraph 100-150 words, 5 steps for this specific service with detailed descriptions)
10. Trust Section (heading, detailed description 150-200 words about trusting this service)
11. Professional Importance (heading, intro paragraph 100-150 words, 5 points with rich content about why professionals matter)
12. Benefits (heading, intro paragraph 100-150 words, 5 benefits SPECIFIC to this service type with detailed descriptions)
13. Testimonials (heading, exactly 4 realistic testimonials with Indian names, roles related to service, detailed content - 80-100 words each)
14. Industries (heading, description 150-200 words, 9 industries this service serves with brief descriptions)
15. Design Tools (heading, description 150-200 words, 8 relevant tools/technologies with detailed descriptions for this service)
16. FAQ (heading, 20 FAQs minimum about this SPECIFIC service with detailed answers)
17. Final CTA (heading, detailed description, subtext, button_text)

CRITICAL: Generate ALL content based on "${content}". If user says "Dental Clinic", generate dental clinic content, NOT interior design. If user says "Car Service", generate auto repair content, NOT interior design. Replace ALL interior design references with the user's service.

IMPORTANT: 
- Generate ALL sections - do not skip any
- Write detailed, comprehensive descriptions (3-4 sentences, 60-100 words minimum)
- Make content rich and informative - not just one line
- Intro paragraphs should be 150-200 words each
- Services, benefits, tools descriptions should be detailed and comprehensive
- FAQ answers should be detailed (3-5 sentences)
- Testimonials should sound authentic and specific
- Return ONLY valid JSON, no markdown:

{
  "page_title": "Custom SEO title based on user's service (60 chars max)",
  "hero": {
    "title": "Compelling headline about the specific service (H1)",
    "cta_text": "Call-to-action button text relevant to service"
  },
  "intro": {
    "heading": "About/intro heading about the service",
    "paragraphs": [
      "First paragraph about the specific service (4-5 sentences, 150-200 words).",
      "Second paragraph about the service benefits (4-5 sentences, 150-200 words)."
    ]
  },
  "gallery": {
    "heading": "Gallery/project showcase heading",
    "description": "Description about the service portfolio (3-4 sentences, 100-150 words).",
    "tabs": [
      {"name": "All Projects", "filter": "all"},
      {"name": "Category 1", "filter": "category1"},
      {"name": "Category 2", "filter": "category2"},
      {"name": "Category 3", "filter": "category3"},
      {"name": "Category 4", "filter": "category4"}
    ],
    "items": [
      {"title": "Project Title 1", "type": "Project Type", "category": "category1", "image": "https://images.unsplash.com/photo-xxx"},
      {"title": "Project Title 2", "type": "Project Type", "category": "category2", "image": "https://images.unsplash.com/photo-xxx"},
      {"title": "Project Title 3", "type": "Project Type", "category": "category3", "image": "https://images.unsplash.com/photo-xxx"},
      {"title": "Project Title 4", "type": "Project Type", "category": "category1", "image": "https://images.unsplash.com/photo-xxx"},
      {"title": "Project Title 5", "type": "Project Type", "category": "category4", "image": "https://images.unsplash.com/photo-xxx"},
      {"title": "Project Title 6", "type": "Project Type", "category": "category2", "image": "https://images.unsplash.com/photo-xxx"}
    ]
  },
  "reviews": {
    "heading": "Reviews heading"
  },
  "track_record": {
    "heading": "Track record heading",
    "stats": [
      {"number": "X+", "label": "Custom Metric", "description": "Relevant to service"},
      {"number": "X+", "label": "Custom Metric", "description": "Relevant to service"},
      {"number": "X%", "label": "Custom Metric", "description": "Relevant to service"},
      {"number": "X+", "label": "Custom Metric", "description": "Relevant to service"}
    ]
  },
  "services": {
    "heading": "Services heading",
    "description": "Detailed services description (200-250 words, comprehensive content).",
    "cards": [
      {"title": "Service 1 Title", "description": "Detailed service description (4-5 sentences, 80-100 words)"},
      {"title": "Service 2 Title", "description": "Detailed service description (4-5 sentences, 80-100 words)"},
      {"title": "Service 3 Title", "description": "Detailed service description (4-5 sentences, 80-100 words)"},
      {"title": "Service 4 Title", "description": "Detailed service description (4-5 sentences, 80-100 words)"},
      {"title": "Service 5 Title", "description": "Detailed service description (4-5 sentences, 80-100 words)"}
    ]
  },
  "why_choose": {
    "heading": "Why choose heading",
    "intro": "Intro paragraph about why choose this service (100-150 words)",
    "reasons": [
      {"title": "Reason 1 specific to service", "description": "Detailed description (4-5 sentences, 80-100 words)"},
      {"title": "Reason 2 specific to service", "description": "Detailed description (4-5 sentences, 80-100 words)"},
      {"title": "Reason 3 specific to service", "description": "Detailed description (4-5 sentences, 80-100 words)"},
      {"title": "Reason 4 specific to service", "description": "Detailed description (4-5 sentences, 80-100 words)"},
      {"title": "Reason 5 specific to service", "description": "Detailed description (4-5 sentences, 80-100 words)"},
      {"title": "Reason 6 specific to service", "description": "Detailed description (4-5 sentences, 80-100 words)"}
    ]
  },
  "process": {
    "heading": "Process heading",
    "intro": "Process introduction (100-150 words about the process)",
    "steps": [
      {"title": "Step 1 relevant to service", "description": "Detailed step description (4-5 sentences, 80-100 words)"},
      {"title": "Step 2 relevant to service", "description": "Detailed step description (4-5 sentences, 80-100 words)"},
      {"title": "Step 3 relevant to service", "description": "Detailed step description (4-5 sentences, 80-100 words)"},
      {"title": "Step 4 relevant to service", "description": "Detailed step description (4-5 sentences, 80-100 words)"},
      {"title": "Step 5 relevant to service", "description": "Detailed step description (4-5 sentences, 80-100 words)"}
    ]
  },
  "trust": {
    "heading": "Trust section heading",
    "description": "Detailed trust description (150-200 words, comprehensive content about why trust this service)"
  },
  "professional_importance": {
    "heading": "Professional importance heading",
    "intro": "Intro paragraph about professional importance (100-150 words)",
    "points": [
      {"title": "Point 1 about professionals", "description": "Detailed description (4-5 sentences, 80-100 words)"},
      {"title": "Point 2 about professionals", "description": "Detailed description (4-5 sentences, 80-100 words)"},
      {"title": "Point 3 about professionals", "description": "Detailed description (4-5 sentences, 80-100 words)"},
      {"title": "Point 4 about professionals", "description": "Detailed description (4-5 sentences, 80-100 words)"},
      {"title": "Point 5 about professionals", "description": "Detailed description (4-5 sentences, 80-100 words)"}
    ]
  },
  "benefits": {
    "heading": "Benefits heading",
    "intro": "Intro paragraph about benefits (100-150 words)",
    "items": [
      {"title": "Benefit 1 for this service", "description": "Detailed description (4-5 sentences, 80-100 words)"},
      {"title": "Benefit 2 for this service", "description": "Detailed description (4-5 sentences, 80-100 words)"},
      {"title": "Benefit 3 for this service", "description": "Detailed description (4-5 sentences, 80-100 words)"},
      {"title": "Benefit 4 for this service", "description": "Detailed description (4-5 sentences, 80-100 words)"},
      {"title": "Benefit 5 for this service", "description": "Detailed description (4-5 sentences, 80-100 words)"}
    ]
  },
  "testimonials": {
    "heading": "Testimonials heading",
    "items": [
      {"name": "Realistic Name", "role": "Role related to service", "content": "Detailed authentic testimonial (80-100 words about their experience)", "rating": 5},
      {"name": "Realistic Name", "role": "Role related to service", "content": "Detailed authentic testimonial (80-100 words about their experience)", "rating": 5},
      {"name": "Realistic Name", "role": "Role related to service", "content": "Detailed authentic testimonial (80-100 words about their experience)", "rating": 5},
      {"name": "Realistic Name", "role": "Role related to service", "content": "Detailed authentic testimonial (80-100 words about their experience)", "rating": 5}
    ]
  },
  "industries": {
    "heading": "Industries heading",
    "description": "Industries description (150-200 words)",
    "items": ["Industry 1", "Industry 2", "Industry 3", "Industry 4", "Industry 5", "Industry 6", "Industry 7", "Industry 8", "Industry 9"]
  },
  "design_tools": {
    "heading": "Tools/Technologies heading",
    "description": "Tools description (150-200 words)",
    "tools": [
      {"name": "Tool/Technology 1", "description": "Detailed description (4-5 sentences, 80-100 words)"},
      {"name": "Tool/Technology 2", "description": "Detailed description (4-5 sentences, 80-100 words)"},
      {"name": "Tool/Technology 3", "description": "Detailed description (4-5 sentences, 80-100 words)"},
      {"name": "Tool/Technology 4", "description": "Detailed description (4-5 sentences, 80-100 words)"},
      {"name": "Tool/Technology 5", "description": "Detailed description (4-5 sentences, 80-100 words)"},
      {"name": "Tool/Technology 6", "description": "Detailed description (4-5 sentences, 80-100 words)"},
      {"name": "Tool/Technology 7", "description": "Detailed description (4-5 sentences, 80-100 words)"},
      {"name": "Tool/Technology 8", "description": "Detailed description (4-5 sentences, 80-100 words)"}
    ]
  },
  "faq": {
    "heading": "FAQ heading",
    "items": [
      {"question": "FAQ question about service?", "answer": "Detailed answer (3-5 sentences)"},
      {"question": "FAQ question about service?", "answer": "Detailed answer (3-5 sentences)"},
      {"question": "FAQ question about service?", "answer": "Detailed answer (3-5 sentences)"},
      {"question": "FAQ question about service?", "answer": "Detailed answer (3-5 sentences)"},
      {"question": "FAQ question about service?", "answer": "Detailed answer (3-5 sentences)"},
      {"question": "FAQ question about service?", "answer": "Detailed answer (3-5 sentences)"},
      {"question": "FAQ question about service?", "answer": "Detailed answer (3-5 sentences)"},
      {"question": "FAQ question about service?", "answer": "Detailed answer (3-5 sentences)"},
      {"question": "FAQ question about service?", "answer": "Detailed answer (3-5 sentences)"},
      {"question": "FAQ question about service?", "answer": "Detailed answer (3-5 sentences)"},
      {"question": "FAQ question about service?", "answer": "Detailed answer (3-5 sentences)"},
      {"question": "FAQ question about service?", "answer": "Detailed answer (3-5 sentences)"},
      {"question": "FAQ question about service?", "answer": "Detailed answer (3-5 sentences)"},
      {"question": "FAQ question about service?", "answer": "Detailed answer (3-5 sentences)"},
      {"question": "FAQ question about service?", "answer": "Detailed answer (3-5 sentences)"},
      {"question": "FAQ question about service?", "answer": "Detailed answer (3-5 sentences)"},
      {"question": "FAQ question about service?", "answer": "Detailed answer (3-5 sentences)"},
      {"question": "FAQ question about service?", "answer": "Detailed answer (3-5 sentences)"},
      {"question": "FAQ question about service?", "answer": "Detailed answer (3-5 sentences)"},
      {"question": "FAQ question about service?", "answer": "Detailed answer (3-5 sentences)"}
    ]
  },
  "cta": {
    "heading": "CTA heading",
    "description": "CTA description (3-4 sentences, 100-150 words)",
    "subtext": "Compelling subtext",
    "button_text": "Action button text"
  }
}`

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
              content: 'You are a professional content writer for interior design companies. Create compelling, detailed content that showcases expertise and builds trust with potential clients. You MUST return valid JSON only - no apologies, no explanations, just the JSON object.',
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

        if (responseContent && responseContent.trim().length > 0) {
          console.log(`Successfully generated content with model: ${modelConfig.name}`)
          break
        }
      } catch (error: any) {
        console.error(`Error with model ${modelConfig.name}:`, error)
        lastError = error
        continue
      }
    }

    if (!responseContent || responseContent.trim().length === 0) {
      throw lastError || new Error('Failed to generate content with all models')
    }

    let contentData
    try {
      const jsonString = responseContent.trim()
      contentData = JSON.parse(jsonString)
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError)
      throw new Error('Failed to parse generated content')
    }

    // Generate HTML content using the template9.html structure
    const htmlContent = generateHTMLPage(contentData, companyName, ctaLink)

    // Create ZIP file
    const archive = archiver('zip', { zlib: { level: 9 } })

    // Convert archive to buffer
    const chunks: Buffer[] = []

    return new Promise<Response>((resolve) => {
      archive.on('data', (chunk: Buffer) => {
        chunks.push(chunk)
      })

      archive.on('end', () => {
        const buffer = Buffer.concat(chunks)

        resolve(new NextResponse(buffer, {
          status: 200,
          headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': 'attachment; filename="template9-interior-design.zip"',
            'Cache-Control': 'no-cache',
          },
        }))
      })

      archive.on('error', (error: any) => {
        console.error('Archive error:', error)
        resolve(NextResponse.json(
          { error: 'Failed to create ZIP file' },
          { status: 500 }
        ))
      })

      // Add HTML file
      archive.append(htmlContent, { name: 'index.html' })

      // Add CSS files
      const assetDir = join(process.cwd(), 'public', 'relgrow-interior-design-services')

      // Add style.css
      try {
        const styleContent = readFileSync(join(assetDir, 'style.css'))
        archive.append(styleContent, { name: 'style.css' })
      } catch (error) {
        console.error('Error adding style.css:', error)
      }

      // Add mobileresponsive.css
      try {
        const mobileStyleContent = readFileSync(join(assetDir, 'mobileresponsive.css'))
        archive.append(mobileStyleContent, { name: 'mobileresponsive.css' })
      } catch (error) {
        console.error('Error adding mobileresponsive.css:', error)
      }

      // Add images directory
      try {
        const imagesDir = join(assetDir, 'images')
        const imageFiles = readdirSync(imagesDir)

        for (const file of imageFiles) {
          const filePath = join(imagesDir, file)
          const stats = statSync(filePath)

          if (stats.isFile()) {
            const imageContent = readFileSync(filePath)
            archive.append(imageContent, { name: `images/${file}` })
          }
        }
      } catch (error) {
        console.error('Error adding images:', error)
      }

      // Add fonts directory
      try {
        const fontsDir = join(assetDir, 'fonts')
        const fontFiles = readdirSync(fontsDir)

        for (const file of fontFiles) {
          const filePath = join(fontsDir, file)
          const stats = statSync(filePath)

          if (stats.isFile()) {
            const fontContent = readFileSync(filePath)
            archive.append(fontContent, { name: `fonts/${file}` })
          }
        }
      } catch (error) {
        console.error('Error adding fonts:', error)
      }

      // Finalize the archive
      archive.finalize()
    })

  } catch (error: any) {
    console.error('Generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate landing page' },
      { status: 500 }
    )
  }
}