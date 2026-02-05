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

// Helper function to humanize multiple texts in a single batch API call
async function humanizeBatch(texts: string[], delay: number = 50): Promise<string[]> {
  if (!texts || texts.length === 0) return texts
  
  const apiKey = process.env.REPHRASY_API_KEY
  if (!apiKey) {
    console.warn('REPHRASY_API_KEY not found, skipping humanization')
    return texts
  }

  // Add delay to avoid rate limiting
  if (delay > 0) {
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  try {
    // Combine texts with a unique separator that won't appear in content
    const separator = '\n\n---REPHRASY_BATCH_SEPARATOR---\n\n'
    const combinedText = texts.join(separator)
    
    // Add timeout to prevent hanging requests (90 seconds for larger batches)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 90000) // 90 second timeout for batches
    
    const response = await fetch('https://v2-humanizer.rephrasy.ai/api', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: combinedText,
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
      console.error(`Humanizer API error (${response.status}):`, errorText)
      return texts // Return original texts if API fails
    }

    const data = await response.json()
    const humanizedCombined = data.output || combinedText
    
    // Split back using the separator
    const humanizedTexts = humanizedCombined.split(separator)
    
    // Ensure we return the same number of texts
    if (humanizedTexts.length !== texts.length) {
      console.warn(`⚠ Batch split mismatch: expected ${texts.length}, got ${humanizedTexts.length}`)
      // Return original if count doesn't match
      return texts
    }
    
    return humanizedTexts.map((text: string, index: number) => text.trim() || texts[index])
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('Humanizer API batch request timed out')
    } else {
      console.error('Humanizer API batch request failed:', error.message)
    }
    return texts // Return original texts if request fails
  }
}

// Check if a field should be humanized based on key name and content
function shouldHumanize(key: string, value: string): boolean {
  // Skip short strings (less than 25 characters)
  if (value.length < 25) return false
  
  // Skip promise_stats.text fields - these are short labels (2-4 words per line, format "Line 1|Line 2")
  if (key.includes('promise_stats') && key.includes('text')) {
    return false
  }
  
  // Skip fields that are typically not content (including short badge/label text)
  const skipKeys = [
    'rating', 'rating_text', 'title', 'name', 'location', 
    'button_text', 'cta_button_text', 'price_text', 'tab_label',
    'table_header_1', 'table_header_2', 'table_header_3',
    'type1_name', 'type2_name', 'type3_name', 'column1', 'column2', 'column3',
    'manager_badge_text', 'value' // Skip stat values (like "10K+", "99%")
  ]
  
  if (skipKeys.some(skipKey => key.toLowerCase().includes(skipKey.toLowerCase()))) {
    return false
  }
  
  // Humanize fields that typically contain substantial content
  const humanizeKeys = [
    'description', 'intro', 'text', 'answer', 'content', 
    'paragraph', 'subtitle', 'feature', 'benefit', 'reason',
    'step', 'item', 'list', 'point', 'detail', 'explanation'
  ]
  
  return humanizeKeys.some(humanizeKey => key.toLowerCase().includes(humanizeKey.toLowerCase()))
}

// Collect all texts that need humanization with their paths
function collectTextsToHumanize(data: any, parentKey: string = '', texts: Array<{path: string, value: string}> = []): Array<{path: string, value: string}> {
  if (typeof data === 'string') {
    if (shouldHumanize(parentKey, data)) {
      texts.push({ path: parentKey, value: data })
    }
  } else if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      collectTextsToHumanize(data[i], `${parentKey}[${i}]`, texts)
    }
  } else if (data && typeof data === 'object') {
    const keys = Object.keys(data)
    for (const key of keys) {
      const currentKey = parentKey ? `${parentKey}.${key}` : key
      collectTextsToHumanize(data[key], currentKey, texts)
    }
  }
  return texts
}

// Set a value in nested object using dot notation path
function setNestedValue(obj: any, path: string, value: string): void {
  const keys = path.split(/[\.\[\]]+/).filter(k => k !== '')
  let current = obj
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key]
  }
  const lastKey = keys[keys.length - 1]
  current[lastKey] = value
}

// Recursively humanize all string values in an object with smart batching
async function humanizeContentData(data: any, parentKey: string = '', delay: number = 50, batchSize: number = 10): Promise<any> {
  // First, collect all texts that need humanization
  const textsToHumanize = collectTextsToHumanize(data, parentKey)
  
  if (textsToHumanize.length === 0) {
    console.log('✓ No texts to humanize')
    return data
  }
  
  console.log(`🔄 Collected ${textsToHumanize.length} texts to humanize. Batching into groups of ${batchSize}...`)
  
  // Process in batches
  const totalBatches = Math.ceil(textsToHumanize.length / batchSize)
  let processedCount = 0
  
  for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
    const startIdx = batchIndex * batchSize
    const endIdx = Math.min(startIdx + batchSize, textsToHumanize.length)
    const batch = textsToHumanize.slice(startIdx, endIdx)
    
    console.log(`🔄 Processing batch ${batchIndex + 1}/${totalBatches} (${batch.length} texts)...`)
    
    try {
      const texts = batch.map(item => item.value)
      const humanizedTexts = await humanizeBatch(texts, delay)
      
      // Map humanized texts back to their paths
      for (let i = 0; i < batch.length; i++) {
        setNestedValue(data, batch[i].path, humanizedTexts[i])
        processedCount++
      }
      
      console.log(`✓ Batch ${batchIndex + 1}/${totalBatches} completed (${processedCount}/${textsToHumanize.length} total)`)
    } catch (error: any) {
      console.error(`✗ Batch ${batchIndex + 1} failed:`, error.message)
      // Continue with remaining batches even if one fails
    }
  }
  
  console.log(`✓ Humanization complete: ${processedCount}/${textsToHumanize.length} texts processed`)
  return data
}

// Generate complete HTML page with all sections - returns full HTML like template6
// This reads the entire template and replaces hardcoded content with AI-generated content
function generateHTMLPage(content: any, companyName?: string, ctaLink?: string): string {
  // Read the complete template HTML file (10K+ lines, full structure from <!DOCTYPE html> to </html>)
  const templatePath = join(process.cwd(), 'public', 'pillar-page', 'brandstory-pillar-page.html')
  let html = readFileSync(templatePath, 'utf-8')
  
  // Replace ALL hardcoded content with AI-generated content
  // This preserves the exact HTML structure, all styles, and all scripts
  
  // 1. Page title and meta tags
  if (content.page_title) {
    html = html.replace(/<title>BrandStory - Digital Marketing Agency \| UI\/UX, SEO & Brand Storytelling in Bangalore<\/title>/, `<title>${escapeHtml(content.page_title)}</title>`)
  }
  
  // Meta description
  if (content.meta_description) {
    // Add meta description if it doesn't exist, or replace existing one
    if (html.includes('<meta name="description"')) {
      html = html.replace(/(<meta name="description"[^>]*content=["'])([^"']*)(["'][^>]*>)/, `$1${escapeHtml(content.meta_description)}$3`)
    } else {
      // Insert after viewport meta tag
      html = html.replace(/(<meta name="viewport"[^>]*>)/, `$1\n    <meta name="description" content="${escapeHtml(content.meta_description)}">`)
    }
  }
  
  // 2. Header section
  if (content.header?.title) {
    html = html.replace(/<h1 class="page-title">Your Trusted Partner for Digital Transformation & Brand Storytelling<\/h1>/, `<h1 class="page-title">${escapeHtml(content.header.title)}</h1>`)
  }
  if (content.header?.description_short) {
    html = html.replace(/(<span class="description-short">)(.*?)(<\/span>)/, `$1${escapeHtml(content.header.description_short)}$3`)
  }
  if (content.header?.description_full) {
    html = html.replace(/(<span class="description-full">)(.*?)(<\/span>)/, `$1${escapeHtml(content.header.description_full)}$3`)
  }
  
  // 3. Banner section - main heading (in banner-overlay h1)
  if (content.banner?.main_heading) {
    html = html.replace(/<h1>Design-Led Digital Marketing & Brand Storytelling<\/h1>/, `<h1>${escapeHtml(content.banner.main_heading)}</h1>`)
  }
  
  // 4. Banner section - CTA button text
  if (content.banner?.cta_button_text) {
    html = html.replace(/>Get in Touch\s*</, `>${escapeHtml(content.banner.cta_button_text)} `)
  }
  
  // 5. Banner section - service features (dynamic, 4-6 features from user input)
  if (content.banner?.service_features && content.banner.service_features.length >= 4) {
    const features = content.banner.service_features.slice(0, 6)
    const serviceFeaturesHTML = features.map((f: string) =>
      `                    <div class="service-feature-item">
                        <div class="service-feature-icon">
                            <img src="brandstory-images/service-features.svg" alt="${escapeHtml(f)} icon">
                        </div>
                        <span class="service-feature-text">${escapeHtml(f)}</span>
                    </div>`
    ).join('\n                ')
    const rowMatch = html.match(/(<div class="service-features-card">\s*<div class="service-features-row">)([\s\S]*?)(<\/div>\s*<\/div>)(\s*<\/div>\s*<\/div>\s*<\/section>)/)
    if (rowMatch) {
      html = html.replace(rowMatch[0], rowMatch[1] + serviceFeaturesHTML + '\n                </div>\n            </div>' + rowMatch[4])
    }
  }
  
  // 7. Features section
  if (content.features?.title) {
    html = html.replace(/<h2 class="features-title">Why Choose BrandStory for Digital Marketing<\/h2>/, `<h2 class="features-title">${escapeHtml(content.features.title)}</h2>`)
  }
  if (content.features?.intro) {
    html = html.replace(/<p class="features-intro">BrandStory offers a complete suite of digital marketing and design-led technology services, from brand identity to market-ready digital solutions.<\/p>/, `<p class="features-intro">${escapeHtml(content.features.intro)}</p>`)
  }
  if (content.features?.list && content.features.list.length >= 5) {
    // Replace each list item
    const listItems = content.features.list.map((item: string, index: number) => {
      return `<li>\n                            ${escapeHtml(item)}\n                        </li>`
    }).join('\n                        ')
    html = html.replace(/(<ul class="features-list">)([\s\S]*?)(<\/ul>)/, `$1\n                        ${listItems}\n                    $3`)
  }
  
  // 8. Exclusive benefits section
  if (content.exclusive_benefits?.title) {
    html = html.replace(/<h2 class="exclusive-benefits-title">Brandstory Exclusive Benefits<\/h2>/, `<h2 class="exclusive-benefits-title">${escapeHtml(content.exclusive_benefits.title)}</h2>`)
  }
  if (content.exclusive_benefits?.promise_stats && content.exclusive_benefits.promise_stats.length >= 6) {
    // Replace "Our promise to you" card (first 3 stats)
    const promiseCardMatch = html.match(/(<div class="benefits-card promise-card">)([\s\S]*?)(<\/div>\s*<\/div>\s*<\/div>)/)
    if (promiseCardMatch) {
      let promiseCardHTML = promiseCardMatch[2]
      const promiseValueRegex = /<div class="benefit-value">[^<]*<\/div>/g
      const promiseTextRegex = /<div class="benefit-text">[\s\S]*?<\/div>/g
      const promiseValueMatches = Array.from(promiseCardHTML.matchAll(promiseValueRegex))
      const promiseTextMatches = Array.from(promiseCardHTML.matchAll(promiseTextRegex))
      
      // Replace first 3 stats (Our promise to you)
      for (let i = 0; i < 3 && i < content.exclusive_benefits.promise_stats.length; i++) {
        const stat = content.exclusive_benefits.promise_stats[i]
        if (promiseValueMatches[i]) {
          promiseCardHTML = promiseCardHTML.replace(promiseValueMatches[i][0], `<div class="benefit-value">${escapeHtml(stat.value)}</div>`)
        }
        if (promiseTextMatches[i] && stat.text) {
          const textParts = stat.text.split('|')
          // Limit each part to max 4 words (2-4 words per line)
          const textHTML = textParts.map((part: string) => {
            const trimmed = part.trim()
            const words = trimmed.split(/\s+/).slice(0, 4) // Max 4 words
            return `<span>${escapeHtml(words.join(' '))}</span>`
          }).join('\n                                ')
          promiseCardHTML = promiseCardHTML.replace(promiseTextMatches[i][0], `<div class="benefit-text">\n                                ${textHTML}\n                            </div>`)
        }
      }
      html = html.replace(promiseCardMatch[0], promiseCardMatch[1] + promiseCardHTML + promiseCardMatch[3])
    }
    
    // Replace "Advantage you get" card (last 3 stats + manager badge) - enforce max 3 words for badge
    if (content.exclusive_benefits?.manager_badge_text) {
      const badgeRaw = content.exclusive_benefits.manager_badge_text.trim()
      const badgeWords = badgeRaw.split(/\s+/).slice(0, 3)
      const badgeShort = badgeWords.join(' ')
      html = html.replace(/<span>A dedicated Project Manager<\/span>/, `<span>${escapeHtml(badgeShort)}</span>`)
    }
    
    const advantageCardMatch = html.match(/(<div class="benefits-card advantage-card">)([\s\S]*?)(<\/div>\s*<\/div>\s*<\/div>\s*<\/div>)/)
    if (advantageCardMatch) {
      let advantageCardHTML = advantageCardMatch[2]
      const advantageValueRegex = /<div class="benefit-value">[^<]*<\/div>/g
      const advantageTextRegex = /<div class="benefit-text">[\s\S]*?<\/div>/g
      const advantageValueMatches = Array.from(advantageCardHTML.matchAll(advantageValueRegex))
      const advantageTextMatches = Array.from(advantageCardHTML.matchAll(advantageTextRegex))
      
      // Replace last 3 stats (Advantage you get)
      for (let i = 3; i < 6 && i < content.exclusive_benefits.promise_stats.length; i++) {
        const stat = content.exclusive_benefits.promise_stats[i]
        const advantageIndex = i - 3
        if (advantageValueMatches[advantageIndex]) {
          advantageCardHTML = advantageCardHTML.replace(advantageValueMatches[advantageIndex][0], `<div class="benefit-value">${escapeHtml(stat.value)}</div>`)
        }
        if (advantageTextMatches[advantageIndex] && stat.text) {
          const textParts = stat.text.split('|')
          // Limit each part to max 4 words (2-4 words per line)
          const textHTML = textParts.map((part: string) => {
            const trimmed = part.trim()
            const words = trimmed.split(/\s+/).slice(0, 4) // Max 4 words
            return `<span>${escapeHtml(words.join(' '))}</span>`
          }).join('\n                                ')
          advantageCardHTML = advantageCardHTML.replace(advantageTextMatches[advantageIndex][0], `<div class="benefit-text">\n                                ${textHTML}\n                            </div>`)
        }
      }
      html = html.replace(advantageCardMatch[0], advantageCardMatch[1] + advantageCardHTML + advantageCardMatch[3])
    }
  }
  
  // 9. Types section
  if (content.types?.title) {
    html = html.replace(/<h2 class="types-title">Tailored Digital Marketing Services<\/h2>/, `<h2 class="types-title">${escapeHtml(content.types.title)}</h2>`)
  }
  if (content.types?.intro) {
    html = html.replace(/<p class="types-intro">Discover the extensive portfolio of digital marketing and technology solutions available at BrandStory, tailored to the needs of diverse industries and business goals.<\/p>/, `<p class="types-intro">${escapeHtml(content.types.intro)}</p>`)
  }
  if (content.types?.items && content.types.items.length > 0) {
    // Dynamically build accordion items based on the number of items
    const accordionItems = content.types.items.map((item: any, index: number) => {
      // Handle description - can be single paragraph or multiple paragraphs
      let descHTML = ''
      if (typeof item.description === 'string') {
        // Split by newlines if multiple paragraphs
        const paragraphs = item.description.split('\n').filter((p: string) => p.trim())
        descHTML = paragraphs.map((p: string) => `<p>${escapeHtml(p.trim())}</p>`).join('\n                        ')
      } else {
        descHTML = `<p>${escapeHtml(item.description)}</p>`
      }
      
      // Use service-icon-1 through service-icon-7 (cycle 1-7 for 7 items)
      const imageIndex = (index % 7) + 1
      const isActive = index === 0 ? ' active' : ''
      
      return `
                <div class="accordion-item${isActive}">
                    <div class="accordion-header" onclick="toggleAccordion(this)">
                        <div class="accordion-icon">
                            <img src="brandstory-images/service-icon-${imageIndex}.svg" alt="${escapeHtml(item.title)}">
                        </div>
                        <h3 class="accordion-title">${escapeHtml(item.title)}</h3>
                        <svg class="accordion-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M6 9l6 6 6-6"/>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        ${descHTML}
                    </div>
                </div>`
    }).join('\n                ')
    
    // Replace the entire types-accordion section with dynamically built items
    // Find the opening tag and match everything until the closing </div> of types-accordion (before types-cta)
    const accordionStart = html.indexOf('<div class="types-accordion">')
    if (accordionStart !== -1) {
      // Find the matching closing div by tracking depth
      let depth = 1
      let pos = accordionStart + '<div class="types-accordion">'.length
      let accordionEnd = -1
      
      while (pos < html.length && depth > 0) {
        if (html.substring(pos, pos + 4) === '<div') {
          depth++
        } else if (html.substring(pos, pos + 6) === '</div>') {
          depth--
          if (depth === 0) {
            accordionEnd = pos + 6
            break
          }
        }
        pos++
      }
      
      if (accordionEnd !== -1) {
        // Replace the content between opening and closing tags
        const before = html.substring(0, accordionStart + '<div class="types-accordion">'.length)
        const after = html.substring(accordionEnd)
        html = before + accordionItems + '\n                        </div>' + after
      } else {
        // Fallback: use regex with a more specific end pattern
        html = html.replace(/(<div class="types-accordion">)([\s\S]*?)(<\/div>\s*<div class="types-cta">)/, `<div class="types-accordion">${accordionItems}\n                        </div>\n            \n            <div class="types-cta">`)
      }
    }
  }
  
  // Replace Explore Plans button text and add onclick (in types section)
  if (content.types?.button_text) {
    // Find the button in types-section and replace text and add onclick
    const typesSectionMatch = html.match(/(<section class="types-section">)([\s\S]*?)(<\/section>)/)
    if (typesSectionMatch) {
      let typesSectionHTML = typesSectionMatch[2]
      // Replace button text and add onclick attribute
      typesSectionHTML = typesSectionHTML.replace(/(<button class="explore-plans-btn")([^>]*>)\s*Browse Our Services\s*(<svg[\s\S]*?<\/svg>)\s*(<\/button>)/, (match, before, afterOpen, svg, after) => {
        const onClickAttr = ctaLink ? ` onclick="window.open('${escapeHtml(ctaLink)}', '_blank', 'noopener,noreferrer')"` : ` onclick="javascript:void(0)"`
        return `${before}${onClickAttr}${afterOpen}\n                    ${escapeHtml(content.types.button_text)}\n                    ${svg}\n                ${after}`
      })
      html = html.replace(typesSectionMatch[0], typesSectionMatch[1] + typesSectionHTML + typesSectionMatch[3])
    }
  }
  
  // 10. Coverages section
  if (content.coverages?.title) {
    html = html.replace(/<h2 class="coverages-title">Comprehensive Digital Marketing Services<\/h2>/, `<h2 class="coverages-title">${escapeHtml(content.coverages.title)}</h2>`)
  }
  if (content.coverages?.intro) {
    html = html.replace(/(<p class="coverages-intro">)(.*?)(<\/p>)/, `$1${escapeHtml(content.coverages.intro)}$3`)
  }
  
  // Replace card headers
  // Left card = Other agencies (coverage-card covered class, but shows not_covered_items with cross icon)
  if (content.coverages?.left_card_title) {
    html = html.replace(/(<div class="coverage-card covered">\s*<div class="coverage-card-header">)(.*?)(<\/div>)/, `$1${escapeHtml(content.coverages.left_card_title)}$3`)
  }
  // Right card = Our agency (coverage-card not-covered class, but shows covered_items with tick icon)
  if (content.coverages?.right_card_title) {
    html = html.replace(/(<div class="coverage-card not-covered">\s*<div class="coverage-card-header">)(.*?)(<\/div>)/, `$1${escapeHtml(content.coverages.right_card_title)}$3`)
  }
  
  // Dynamically build coverage items
  // Right card = Our agency (coverage-card not-covered class, but shows covered_items with tick icon - green)
  if (content.coverages?.covered_items && content.coverages.covered_items.length > 0) {
    const coveredItemsHTML = content.coverages.covered_items.map((item: any, index: number) => {
      const descHTML = `<p>${escapeHtml(item.description)}</p>`
      const isActive = index === 0 ? ' active' : ''
      
      return `
                        <div class="coverage-accordion-item${isActive}">
                            <div class="coverage-accordion-header">
                                <div class="coverage-icon">
                                    <img src="brandstory-images/tick-in-circle.svg" alt="Tick">
                                </div>
                                <h3 class="coverage-accordion-title">${escapeHtml(item.title)}</h3>
                                <div class="coverage-accordion-arrow">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </div>
                            </div>
                            <div class="coverage-accordion-content">
                                ${descHTML}
                            </div>
                        </div>`
    }).join('\n                        ')
    
    // Replace the right card's accordion items (coverage-card not-covered class, but shows Our agency with tick icon)
    const rightCardMatch = html.match(/(<div class="coverage-card not-covered">[\s\S]*?<div class="coverage-accordion">)([\s\S]*?)(<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/section>)/)
    if (rightCardMatch) {
      html = html.replace(rightCardMatch[0], rightCardMatch[1] + coveredItemsHTML + '\n                    </div>\n                </div>\n            </div>\n        </div>\n    </section>')
    }
  }
  
  // Left card = Other agencies (coverage-card covered class, but shows not_covered_items with cross icon - red)
  if (content.coverages?.not_covered_items && content.coverages.not_covered_items.length > 0) {
    const notCoveredItemsHTML = content.coverages.not_covered_items.map((item: any, index: number) => {
      const descHTML = `<p>${escapeHtml(item.description)}</p>`
      const isActive = index === 0 ? ' active' : ''
      
      return `
                        <div class="coverage-accordion-item${isActive}">
                            <div class="coverage-accordion-header">
                                <div class="coverage-icon">
                                    <img src="brandstory-images/cross-in-circle.svg" alt="Cross">
                                </div>
                                <h3 class="coverage-accordion-title">${escapeHtml(item.title)}</h3>
                                <div class="coverage-accordion-arrow">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </div>
                            </div>
                            <div class="coverage-accordion-content">
                                ${descHTML}
                            </div>
                        </div>`
    }).join('\n                        ')
    
    // Replace the left card's accordion items (coverage-card covered class, but shows Other agencies with cross icon)
    const leftCardMatch = html.match(/(<div class="coverage-card covered">[\s\S]*?<div class="coverage-accordion">)([\s\S]*?)(<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<!-- What is Not Covered Card -->)/)
    if (leftCardMatch) {
      html = html.replace(leftCardMatch[0], leftCardMatch[1] + notCoveredItemsHTML + '\n                    </div>\n                </div>\n                <!-- What is Not Covered Card -->')
    }
  }
  
  // 11. Why buy section
  if (content.why_buy?.title) {
    html = html.replace(/<h2 class="why-buy-title">Why Choose BrandStory for Digital Marketing\?<\/h2>/, `<h2 class="why-buy-title">${escapeHtml(content.why_buy.title)}</h2>`)
  }
  
  // Replace all intro paragraphs (can be multiple)
  if (content.why_buy?.intro) {
    // Handle multiple intro paragraphs - split by newlines if provided as array or newline-separated string
    let introParagraphs: string[] = []
    if (Array.isArray(content.why_buy.intro)) {
      introParagraphs = content.why_buy.intro
    } else if (typeof content.why_buy.intro === 'string') {
      introParagraphs = content.why_buy.intro.split('\n').filter((p: string) => p.trim())
    } else {
      introParagraphs = [content.why_buy.intro]
    }
    
    // Build intro paragraphs HTML
    const introHTML = introParagraphs.map((p: string) => 
      `\n            <p class="why-buy-intro">${escapeHtml(p.trim())}</p>`
    ).join('')
    
    // Replace all intro paragraphs in the why-buy-section (between title and why-buy-content)
    const whyBuySectionMatch = html.match(/(<section class="why-buy-section">[\s\S]*?<h2 class="why-buy-title">[\s\S]*?<\/h2>)([\s\S]*?)(<div class="why-buy-content">)/)
    if (whyBuySectionMatch) {
      // Find and remove all existing intro paragraphs
      let introSectionHTML = whyBuySectionMatch[2]
      introSectionHTML = introSectionHTML.replace(/<p class="why-buy-intro">.*?<\/p>/g, '')
      // Add new intro paragraphs
      introSectionHTML = introSectionHTML.trim() + introHTML + '\n            '
      
      html = html.replace(whyBuySectionMatch[0], whyBuySectionMatch[1] + introSectionHTML + whyBuySectionMatch[3])
    }
  }
  
  // Replace feature items dynamically
  if (content.why_buy?.points && content.why_buy.points.length > 0) {
    const featureItemsHTML = content.why_buy.points.map((point: string) => 
      `
                    <div class="feature-item">
                        <div class="feature-icon">
                            <img src="brandstory-images/star-icon.svg" alt="Star icon">
                        </div>
                        <p class="feature-text">${escapeHtml(point)}</p>
                    </div>`
    ).join('\n                    ')
    
    // Replace the why-buy-features section
    const whyBuyFeaturesMatch = html.match(/(<div class="why-buy-features">)([\s\S]*?)(<\/div>\s*<\/div>\s*<div class="why-buy-illustration">)/)
    if (whyBuyFeaturesMatch) {
      html = html.replace(whyBuyFeaturesMatch[0], whyBuyFeaturesMatch[1] + featureItemsHTML + '\n                </div>\n                <div class="why-buy-illustration">')
    }
  }
  
  // 12. Factors section
  if (content.factors?.title) {
    html = html.replace(/(<h2 class="factors-title">)(.*?)(<\/h2>)/, `$1${escapeHtml(content.factors.title)}$3`)
  }
  if (content.factors?.intro) {
    html = html.replace(/(<p class="factors-subtitle">)(.*?)(<\/p>)/, `$1${escapeHtml(content.factors.intro)}$3`)
  }
  
  // Dynamically build all factors cards
  if (content.factors?.items && content.factors.items.length > 0) {
    const factorsCardsHTML = content.factors.items.map((item: any, index: number) => {
      // Cycle through icons (service-icon-1.svg through service-icon-7.svg - factors-icon not in assets)
      const iconIndex = (index % 7) + 1
      
      return `
                        <div class="factors-card">
                            <div class="factors-card-icon-wrapper">
                                <div class="factors-card-icon">
                                    <img src="brandstory-images/service-icon-${iconIndex}.svg" alt="${escapeHtml(item.title)} icon">
                                </div>
                            </div>
                            <h3 class="factors-card-title">${escapeHtml(item.title)}</h3>
                            <p class="factors-card-description">${escapeHtml(item.description)}</p>
                        </div>`
    }).join('\n                        ')
    
    // Replace the entire factors-carousel-track content
    const factorsCarouselTrackMatch = html.match(/(<div class="factors-carousel-track" id="factorsCarouselTrack">)([\s\S]*?)(<\/div>\s*<\/div>\s*<\/div>\s*<button class="factors-carousel-nav next")/)
    if (factorsCarouselTrackMatch) {
      html = html.replace(factorsCarouselTrackMatch[0], factorsCarouselTrackMatch[1] + factorsCardsHTML + '\n                    </div>\n                </div>\n                <button class="factors-carousel-nav next"')
    }
  }
  
  // 13. How to buy section (first occurrence - "How to Buy/Get Started")
  if (content.how_to_buy?.title) {
    // Replace first occurrence (before claim-filing-section)
    html = html.replace(/(<section class="how-to-buy-section">[\s\S]*?<h2 class="how-to-buy-title">)(.*?)(<\/h2>)/, `$1${escapeHtml(content.how_to_buy.title)}$3`)
  }
  if (content.how_to_buy?.intro) {
    // Replace first occurrence
    html = html.replace(/(<section class="how-to-buy-section">[\s\S]*?<p class="how-to-buy-intro">)(.*?)(<\/p>)/, `$1${escapeHtml(content.how_to_buy.intro)}$3`)
  }
  
  // Dynamically build all step items for first section
  if (content.how_to_buy?.steps && content.how_to_buy.steps.length > 0) {
    const stepsHTML = content.how_to_buy.steps.map((step: any, index: number) => {
      // Combine title and description into one text
      const combinedText = step.title ? `${step.title}: ${step.description}` : step.description
      
      return `
                        <div class="how-to-buy-step-item">
                            <div class="how-to-buy-step-number"></div>
                            <p class="how-to-buy-step-text">${escapeHtml(combinedText)}</p>
                        </div>`
    }).join('\n                        ')
    
    // Replace the first how-to-buy-section (before claim-filing-section)
    const firstSectionMatch = html.match(/(<section class="how-to-buy-section">[\s\S]*?<div class="how-to-buy-steps-container">)([\s\S]*?)(<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/section>\s*<!-- Explore Add-ons Section -->)/)
    if (firstSectionMatch) {
      html = html.replace(firstSectionMatch[0], firstSectionMatch[1] + stepsHTML + '\n                    </div>\n                </div>\n            </div>\n        </div>\n    </section>\n    <!-- Explore Add-ons Section -->')
    }
  }
  
  // Handle second how-to-buy-section (Documents/Requirements section after claim-filing)
  if (content.claim_filing?.documents_title) {
    // Replace title in second section (after claim-filing-section, before FAQs)
    html = html.replace(/(<section class="claim-filing-section">[\s\S]*?<\/section>\s*<section class="how-to-buy-section">[\s\S]*?<h2 class="how-to-buy-title">)(.*?)(<\/h2>)/, `$1${escapeHtml(content.claim_filing.documents_title)}$3`)
  }
  if (content.claim_filing?.documents_intro) {
    // Replace intro in second section
    html = html.replace(/(<section class="claim-filing-section">[\s\S]*?<\/section>\s*<section class="how-to-buy-section">[\s\S]*?<p class="how-to-buy-intro">)(.*?)(<\/p>)/, `$1${escapeHtml(content.claim_filing.documents_intro)}$3`)
  }
  if (content.claim_filing?.documents_list && content.claim_filing.documents_list.length > 0) {
    const documentsHTML = content.claim_filing.documents_list.map((item: string) => 
      `
                        <div class="how-to-buy-step-item">
                            <div class="how-to-buy-step-number"></div>
                            <p class="how-to-buy-step-text">${escapeHtml(item)}</p>
                        </div>`
    ).join('\n                        ')
    
    // Replace steps in second section (after claim-filing-section, before FAQs)
    html = html.replace(/(<section class="claim-filing-section">[\s\S]*?<\/section>\s*<section class="how-to-buy-section">[\s\S]*?<div class="how-to-buy-steps-container">)([\s\S]*?)(<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/section>\s*<!-- FAQs Section -->)/, `$1${documentsHTML}\n                    </div>\n                </div>\n            </div>\n        </div>\n    </section>\n    <!-- FAQs Section -->`)
  }
  
  // 14. Benefits online section
  if (content.benefits_online?.title) {
    html = html.replace(/(<h2 class="buy-online-title">)(.*?)(<\/h2>)/, `$1${escapeHtml(content.benefits_online.title)}$3`)
  }
  if (content.benefits_online?.intro) {
    html = html.replace(/(<p class="buy-online-intro">)(.*?)(<\/p>)/, `$1${escapeHtml(content.benefits_online.intro || '')}$3`)
  }
  
  // Dynamically build all benefit items
  if (content.benefits_online?.items && content.benefits_online.items.length > 0) {
    const benefitItemsHTML = content.benefits_online.items.map((item: any) => {
      // Combine title and description into one text
      const combinedText = item.title ? `${item.title}: ${item.description}` : item.description
      
      return `
                    <div class="buy-online-item">
                        <div class="buy-online-bullet"></div>
                        <p class="buy-online-text">${escapeHtml(combinedText)}</p>
                    </div>`
    }).join('\n                    ')
    
    // Replace the entire buy-online-list content
    const buyOnlineListMatch = html.match(/(<div class="buy-online-list">)([\s\S]*?)(<\/div>\s*<\/div>\s*<div class="buy-online-illustration">)/)
    if (buyOnlineListMatch) {
      html = html.replace(buyOnlineListMatch[0], buyOnlineListMatch[1] + benefitItemsHTML + '\n                </div>\n                <div class="buy-online-illustration">')
    }
  }
  
  // 15. Vehicle types section
  if (content.vehicle_types?.title) {
    html = html.replace(/(<h2 class="vehicle-types-title">)(.*?)(<\/h2>)/, `$1${escapeHtml(content.vehicle_types.title)}$3`)
  }
  if (content.vehicle_types?.intro) {
    html = html.replace(/(<p class="vehicle-types-intro">)(.*?)(<\/p>)/, `$1${escapeHtml(content.vehicle_types.intro)}$3`)
  }
  if (content.vehicle_types?.items && content.vehicle_types.items.length > 0) {
    // Dynamically build accordion items based on the number of items
    const vehicleAccordionItems = content.vehicle_types.items.map((item: any, index: number) => {
      // Handle description - can be single paragraph or multiple paragraphs
      let descHTML = ''
      if (typeof item.description === 'string') {
        // Split by newlines if multiple paragraphs
        const paragraphs = item.description.split('\n').filter((p: string) => p.trim())
        descHTML = paragraphs.map((p: string) => `<p>${escapeHtml(p.trim())}</p>`).join('\n                        ')
      } else {
        descHTML = `<p>${escapeHtml(item.description)}</p>`
      }
      
      // Use service-icon-1 through service-icon-7 (cycle 1-7 for 7 items)
      const imageIndex = (index % 7) + 1
      const isActive = index === 0 ? ' active' : ''
      
      return `
                <div class="accordion-item${isActive}">
                    <div class="accordion-header" onclick="toggleAccordion(this)">
                        <div class="accordion-icon">
                            <img src="brandstory-images/service-icon-${imageIndex}.svg" alt="${escapeHtml(item.title)}">
                        </div>
                        <h3 class="accordion-title">${escapeHtml(item.title)}</h3>
                        <svg class="accordion-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M6 9l6 6 6-6"/>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        ${descHTML}
                    </div>
                </div>`
    }).join('\n                ')
    
    // Replace the entire vehicle-types-accordion section with dynamically built items
    // Find the opening tag and match everything until the closing </div> of vehicle-types-accordion
    const accordionStart = html.indexOf('<div class="vehicle-types-accordion">')
    if (accordionStart !== -1) {
      // Find the matching closing div by tracking depth
      let depth = 1
      let pos = accordionStart + '<div class="vehicle-types-accordion">'.length
      let accordionEnd = -1
      
      while (pos < html.length && depth > 0) {
        if (html.substring(pos, pos + 4) === '<div') {
          depth++
        } else if (html.substring(pos, pos + 6) === '</div>') {
          depth--
          if (depth === 0) {
            accordionEnd = pos + 6
            break
          }
        }
        pos++
      }
      
      if (accordionEnd !== -1) {
        // Replace the content between opening and closing tags
        const before = html.substring(0, accordionStart + '<div class="vehicle-types-accordion">'.length)
        const after = html.substring(accordionEnd)
        html = before + vehicleAccordionItems + '\n            </div>' + after
      } else {
        // Fallback: use regex with a more specific end pattern
        html = html.replace(/(<div class="vehicle-types-accordion">)([\s\S]*?)(<\/div>\s*<div class="types-cta">)/, `<div class="vehicle-types-accordion">${vehicleAccordionItems}\n            </div>\n            \n            <div class="types-cta">`)
      }
    }
  }
  
  // Replace Explore Plans button text and add onclick in vehicle-types section
  if (content.vehicle_types?.button_text) {
    // Find the vehicle-types-section and replace the button within it
    const vehicleTypesSectionMatch = html.match(/(<section class="vehicle-types-section">)([\s\S]*?)(<\/section>)/)
    if (vehicleTypesSectionMatch) {
      let vehicleTypesSectionHTML = vehicleTypesSectionMatch[2]
      // Replace the button text and add onclick attribute
      vehicleTypesSectionHTML = vehicleTypesSectionHTML.replace(/(<button class="explore-plans-btn")([^>]*>)\s*Explore Services\s*(<svg[\s\S]*?<\/svg>)\s*(<\/button>)/, (match, before, afterOpen, svg, after) => {
        const onClickAttr = ctaLink ? ` onclick="window.open('${escapeHtml(ctaLink)}', '_blank', 'noopener,noreferrer')"` : ` onclick="javascript:void(0)"`
        return `${before}${onClickAttr}${afterOpen}\n                    ${escapeHtml(content.vehicle_types.button_text)}\n                    ${svg}\n                ${after}`
      })
      html = html.replace(vehicleTypesSectionMatch[0], vehicleTypesSectionMatch[1] + vehicleTypesSectionHTML + vehicleTypesSectionMatch[3])
    }
  }
  
  // 16. Comparison table section
  if (content.comparison_table?.title) {
    html = html.replace(/(<h2 class="comparison-title">)(.*?)(<\/h2>)/, `$1${escapeHtml(content.comparison_table.title)}$3`)
  }
  if (content.comparison_table?.subtitle) {
    html = html.replace(/(<p class="comparison-subtitle">)(.*?)(<\/p>)/, `$1${escapeHtml(content.comparison_table.subtitle)}$3`)
  }
  
  // Replace table headers
  if (content.comparison_table?.type1_name) {
    html = html.replace(/(<th>)(Third-Party Insurance|Third Party Insurance)(<\/th>)/, `$1${escapeHtml(content.comparison_table.type1_name)}$3`)
  }
  if (content.comparison_table?.type2_name) {
    html = html.replace(/(<th>)(Comprehensive Insurance)(<\/th>)/, `$1${escapeHtml(content.comparison_table.type2_name)}$3`)
  }
  if (content.comparison_table?.type3_name) {
    html = html.replace(/(<th>)(Own Damage Insurance|OD Insurance)(<\/th>)/, `$1${escapeHtml(content.comparison_table.type3_name)}$3`)
  }
  
  if (content.comparison_table?.rows && content.comparison_table.rows.length > 0) {
    const rowsHTML = content.comparison_table.rows.map((row: any) => {
      // Handle check/cross icons - if value is boolean or check/cross, convert to icon
      const formatCell = (value: string) => {
        if (value.toLowerCase() === 'yes' || value.toLowerCase() === 'true' || value === '✓' || value === 'check') {
          return '<span class="comparison-icon check">✓</span>'
        } else if (value.toLowerCase() === 'no' || value.toLowerCase() === 'false' || value === '✗' || value === 'cross') {
          return '<span class="comparison-icon cross">✗</span>'
        } else {
          return escapeHtml(value)
        }
      }
      
      return `
                        <tr>
                            <td>${escapeHtml(row.feature)}</td>
                            <td>${formatCell(row.type1)}</td>
                            <td>${formatCell(row.type2)}</td>
                            <td>${formatCell(row.type3)}</td>
                        </tr>`
    }).join('\n')
    // Find the comparison table tbody
    const comparisonTableMatch = html.match(/(<table[^>]*class="[^"]*comparison[^"]*"[^>]*>[\s\S]*?<tbody>)([\s\S]*?)(<\/tbody>[\s\S]*?<\/table>)/)
    if (comparisonTableMatch) {
      html = html.replace(comparisonTableMatch[0], comparisonTableMatch[1] + '\n                    ' + rowsHTML + '\n                </tbody>' + comparisonTableMatch[3])
    }
  }
  
  // Replace button text in comparison section (replace all instances)
  if (content.comparison_table?.button_text) {
    html = html.replace(/(<button class="insure-now-btn")([^>]*>)\s*Choose Plan\s*(<svg[\s\S]*?<\/svg>)\s*(<\/button>)/g, (match, before, afterOpen, svg, after) => {
      const onClickAttr = ctaLink ? ` onclick="window.open('${escapeHtml(ctaLink)}', '_blank', 'noopener,noreferrer')"` : ''
      return `${before}${onClickAttr}${afterOpen}\n                    ${escapeHtml(content.comparison_table.button_text)}\n                    ${svg}\n                ${after}`
    })
  }
  
  // 17. Things to consider section
  if (content.things_consider?.title) {
    html = html.replace(/<h2 class="things-consider-title">Things to Consider When Choosing a Digital Agency<\/h2>/, `<h2 class="things-consider-title">${escapeHtml(content.things_consider.title)}</h2>`)
  }
  if (content.things_consider?.subtitle) {
    html = html.replace(/<p class="things-consider-subtitle">Select the right partner and services to ensure successful digital transformation and brand growth.<\/p>/, `<p class="things-consider-subtitle">${escapeHtml(content.things_consider.subtitle)}</p>`)
  }
  
  // Dynamically build all consider cards
  if (content.things_consider?.items && content.things_consider.items.length > 0) {
    const considerCardsHTML = content.things_consider.items.map((item: any, index: number) => {
      // Same icon for all cards - relgrow template uses things-to-consider.svg
      return `
                        <div class="consider-card">
                            <div class="consider-card-icon-wrapper">
                                <div class="consider-card-icon">
                                    <img src="brandstory-images/things-to-consider.svg" alt="${escapeHtml(item.title)} icon">
                                </div>
                            </div>
                            <h3 class="consider-card-title">${escapeHtml(item.title)}</h3>
                            <p class="consider-card-description">${escapeHtml(item.description)}</p>
                        </div>`
    }).join('\n                        ')
    
    // Replace the entire carousel-track content
    const carouselTrackMatch = html.match(/(<div class="carousel-track" id="carouselTrack">)([\s\S]*?)(<\/div>\s*<\/div>\s*<\/div>\s*<button class="carousel-nav next")/)
    if (carouselTrackMatch) {
      html = html.replace(carouselTrackMatch[0], carouselTrackMatch[1] + considerCardsHTML + '\n                    </div>\n                </div>\n                <button class="carousel-nav next"')
    }
  }
  
  // Replace button text in things-consider section
  if (content.things_consider?.button_text) {
    html = html.replace(/(<div class="things-consider-cta">\s*<button class="insure-now-btn")([^>]*>)\s*Choose Plan\s*(<svg[\s\S]*?<\/svg>)\s*(<\/button>)/, (match, before, afterOpen, svg, after) => {
      const onClickAttr = ctaLink ? ` onclick="window.open('${escapeHtml(ctaLink)}', '_blank', 'noopener,noreferrer')"` : ''
      return `${before}${onClickAttr}${afterOpen}\n                    ${escapeHtml(content.things_consider.button_text)}\n                    ${svg}\n                ${after}`
    })
  }
  
  // 18. Addons explore section
  if (content.addons_explore?.title) {
    html = html.replace(/(<h2 class="addons-explore-title">)(.*?)(<\/h2>)/, `$1${escapeHtml(content.addons_explore.title)}$3`)
  }
  
  // Dynamically build all addon cards
  if (content.addons_explore?.items && content.addons_explore.items.length > 0) {
    const addonCardsHTML = content.addons_explore.items.map((item: any, index: number) => {
      // Cycle through icons (additional-icon-1.svg through additional-icon-12.svg) - relgrow template
      const iconIndex = (index % 12) + 1
      // First 8 cards are visible, rest have "hidden" class
      const hiddenClass = index >= 8 ? ' hidden' : ''
      
      return `
                    <div class="addon-explore-card${hiddenClass}">
                        <div class="addon-explore-icon">
                            <img src="brandstory-images/additional-icon-${iconIndex}.svg" alt="${escapeHtml(item.name)}">
                        </div>
                        <h3 class="addon-explore-name">${escapeHtml(item.name)}</h3>
                        <div class="addon-explore-arrow">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
                        </div>
                    </div>`
    }).join('\n                    ')
    
    // Replace the entire addons-explore-grid content
    const addonsGridMatch = html.match(/(<div class="addons-explore-grid">)([\s\S]*?)(<\/div>\s*<\/div>\s*<div class="addons-load-more-container">)/)
    if (addonsGridMatch) {
      html = html.replace(addonsGridMatch[0], addonsGridMatch[1] + addonCardsHTML + '\n                </div>\n                <div class="addons-load-more-container">')
    }
  }
  
  // 19. Explore more section
  if (content.explore_more?.title) {
    html = html.replace(/(<h2 class="explore-more-title">)(.*?)(<\/h2>)/, `$1${escapeHtml(content.explore_more.title)}$3`)
  }
  
  // Dynamically build all explore more items
  if (content.explore_more?.items && content.explore_more.items.length > 0) {
    const exploreItemsHTML = content.explore_more.items.map((item: any, index: number) => {
      // First 6 items are visible, rest have "hidden" class
      const hiddenClass = index >= 6 ? ' hidden' : ''
      
      return `
                    <a href="javascript:void(0)" class="explore-more-item${hiddenClass}">
                        <span class="explore-more-item-text">${escapeHtml(item.title)}</span>
                        <div class="explore-more-item-icon">
                            <img src="brandstory-images/explore-more-icon.svg" alt="Arrow icon">
                        </div>
                    </a>`
    }).join('\n                    ')
    
    // Replace the entire explore-more-grid content
    // Find the opening div and match until the closing div before explore-more-button-container
    const gridStart = html.indexOf('<div class="explore-more-grid">')
    if (gridStart !== -1) {
      // Find the matching closing div by tracking depth
      let depth = 1
      let pos = gridStart + '<div class="explore-more-grid">'.length
      let gridEnd = -1
      
      while (pos < html.length && depth > 0) {
        if (html.substring(pos, pos + 4) === '<div') {
          depth++
        } else if (html.substring(pos, pos + 6) === '</div>') {
          depth--
          if (depth === 0) {
            gridEnd = pos + 6
            break
          }
        }
        pos++
      }
      
      if (gridEnd !== -1) {
        // Replace the content between opening and closing tags
        const before = html.substring(0, gridStart + '<div class="explore-more-grid">'.length)
        const after = html.substring(gridEnd)
        html = before + exploreItemsHTML + '\n                </div>' + after
      } else {
        // Fallback: use regex
        html = html.replace(/(<div class="explore-more-grid">)([\s\S]*?)(<\/div>\s*<\/div>\s*<div class="explore-more-button-container">)/, `$1${exploreItemsHTML}\n                </div>\n                <div class="explore-more-button-container">`)
      }
    }
  }
  
  // 19. Documents required section
  // 20. Documents required section (can be about anything based on topic, not just documents)
  if (content.documents_required?.title) {
    html = html.replace(/(<h2 class="documents-required-title">)(.*?)(<\/h2>)/, `$1${escapeHtml(content.documents_required.title)}$3`)
  }
  if (content.documents_required?.intro) {
    html = html.replace(/(<p class="documents-required-intro">)(.*?)(<\/p>)/, `$1${escapeHtml(content.documents_required.intro)}$3`)
  }
  
  // Dynamically build all cards (EXACTLY 3 cards for documents-required section)
  if (content.documents_required?.items && content.documents_required.items.length > 0) {
    const items = content.documents_required.items.slice(0, 3)
    const cardsHTML = items.map((item: any, index: number) => {
      // Relgrow template uses essential-components.svg for all documents-required cards
      return `
                <div class="documents-required-card">
                    <div class="documents-required-card-header">
                        <div class="documents-required-icon-wrapper">
                            <img src="brandstory-images/essential-components.svg" alt="${escapeHtml(item.title)}">
                        </div>
                        <div class="documents-required-card-content">
                            <h3 class="documents-required-card-title">${escapeHtml(item.title)}</h3>
                            <p class="documents-required-card-description">${escapeHtml(item.description)}</p>
                        </div>
                    </div>
                </div>`
    }).join('\n                ')
    
    // Replace the entire documents-required-cards content
    const cardsContainerMatch = html.match(/(<div class="documents-required-cards">)([\s\S]*?)(<\/div>\s*<\/div>\s*<div class="documents-required-cta">)/)
    if (cardsContainerMatch) {
      html = html.replace(cardsContainerMatch[0], cardsContainerMatch[1] + cardsHTML + '\n            </div>\n            <div class="documents-required-cta">')
    }
  }
  
  // Replace button text and link
  if (content.documents_required?.button_text) {
    html = html.replace(/(<button class="documents-required-btn")([^>]*>)\s*Learn More\s*(<svg[\s\S]*?<\/svg>)\s*(<\/button>)/, (match, before, afterOpen, svg, after) => {
      const onClickAttr = ctaLink ? ` onclick="window.open('${escapeHtml(ctaLink)}', '_blank', 'noopener,noreferrer')"` : ''
      return `${before}${onClickAttr}${afterOpen}\n                    ${escapeHtml(content.documents_required.button_text)}\n                    ${svg}\n                ${after}`
    })
  }
  
  // 21. Motor rules section (flexible section - can be about updates, comparisons, features, etc. based on topic)
  if (content.motor_rules?.title) {
    html = html.replace(/(<h2 class="motor-rules-title">)(.*?)(<\/h2>)/, `$1${escapeHtml(content.motor_rules.title)}$3`)
  }
  if (content.motor_rules?.intro) {
    html = html.replace(/(<p class="motor-rules-intro">)(.*?)(<\/p>)/, `$1${escapeHtml(content.motor_rules.intro)}$3`)
  }
  
  // Replace table headers dynamically (BrandStory: Aspect, 2025 Update, 2026 Update)
  if (content.motor_rules?.table_header_1) {
    html = html.replace(/(<th>)(Aspect)(<\/th>)/, `$1${escapeHtml(content.motor_rules.table_header_1)}$3`)
  }
  if (content.motor_rules?.table_header_2) {
    html = html.replace(/(<th>)(2025 Update)(<\/th>)/, `$1${escapeHtml(content.motor_rules.table_header_2)}$3`)
  }
  if (content.motor_rules?.table_header_3) {
    html = html.replace(/(<th>)(2026 Update)(<\/th>)/, `$1${escapeHtml(content.motor_rules.table_header_3)}$3`)
  }
  
  // Dynamically build table rows
  if (content.motor_rules?.table_rows && content.motor_rules.table_rows.length > 0) {
    const tableRowsHTML = content.motor_rules.table_rows.map((row: any) => `
                            <tr>
                                <td>${escapeHtml(row.column1 || row.cover || '')}</td>
                                <td>${escapeHtml(row.column2 || row.regulation_2018 || '')}</td>
                                <td>${escapeHtml(row.column3 || row.regulation_2020 || '')}</td>
                            </tr>
                        `).join('\n')
    // More specific match for motor-rules-table
    const motorRulesTableMatch = html.match(/(<table class="motor-rules-table">[\s\S]*?<tbody>)([\s\S]*?)(<\/tbody>[\s\S]*?<\/table>)/)
    if (motorRulesTableMatch) {
      html = html.replace(motorRulesTableMatch[0], motorRulesTableMatch[1] + '\n                        ' + tableRowsHTML + '\n                    </tbody>' + motorRulesTableMatch[3])
    }
  }
  
  if (content.motor_rules?.intro_second) {
    html = html.replace(/(<p class="motor-rules-intro-second">)(.*?)(<\/p>)/, `$1${escapeHtml(content.motor_rules.intro_second)}$3`)
  }
  
  // Dynamically build list items
  if (content.motor_rules?.list_items && content.motor_rules.list_items.length > 0) {
    const listItemsHTML = content.motor_rules.list_items.map((item: string) => 
      `<li class="motor-rules-list-item">
                    <div class="motor-rules-list-icon">
                        <img src="brandstory-images/green-check-icon.svg" alt="Checkmark">
                    </div>
                    <p class="motor-rules-list-text">${escapeHtml(item)}</p>
                </li>`
    ).join('\n                ')
    html = html.replace(/(<ul class="motor-rules-list">)([\s\S]*?)(<\/ul>)/, `$1\n                ${listItemsHTML}\n            $3`)
  }
  
  // Replace button text and link
  if (content.motor_rules?.button_text) {
    html = html.replace(/(<button class="motor-rules-btn")([^>]*>)\s*Explore Options\s*(<svg[\s\S]*?<\/svg>)\s*(<\/button>)/, (match, before, afterOpen, svg, after) => {
      const onClickAttr = ctaLink ? ` onclick="window.open('${escapeHtml(ctaLink)}', '_blank', 'noopener,noreferrer')"` : ''
      return `${before}${onClickAttr}${afterOpen}\n                    ${escapeHtml(content.motor_rules.button_text)}\n                    ${svg}\n                ${after}`
    })
  }
  
  // 22. Why buy from company section
  if (content.why_buy_from_company?.title) {
    html = html.replace(/(<h2 class="why-buy-online-title">)(.*?)(<\/h2>)/, `$1${escapeHtml(content.why_buy_from_company.title)}$3`)
  }
  if (content.why_buy_from_company?.intro) {
    html = html.replace(/(<p class="why-buy-online-intro">)(.*?)(<\/p>)/, `$1${escapeHtml(content.why_buy_from_company.intro || '')}$3`)
  }
  
  // Dynamically build all accordion items
  if (content.why_buy_from_company?.items && content.why_buy_from_company.items.length > 0) {
    const accordionItemsHTML = content.why_buy_from_company.items.map((item: any, index: number) => {
      // Cycle through icons (why-choose-icon-1.svg through why-choose-icon-6.svg) - relgrow template
      const iconIndex = (index % 6) + 1
      const isActive = index === 0 ? ' active' : ''
      
      return `
                <div class="why-buy-online-item${isActive}">
                    <div class="why-buy-online-item-header">
                        <div class="why-buy-online-item-left">
                            <div class="why-buy-online-item-icon">
                                <img src="brandstory-images/why-choose-icon-${iconIndex}.svg" alt="${escapeHtml(item.title)}">
                            </div>
                            <h3 class="why-buy-online-item-title">${escapeHtml(item.title)}</h3>
                        </div>
                        <div class="why-buy-online-item-arrow">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M6 9l6 6 6-6"/>
                            </svg>
                        </div>
                    </div>
                    <div class="why-buy-online-item-content">
                        <p class="why-buy-online-item-description">${escapeHtml(item.description)}</p>
                    </div>
                </div>`
    }).join('\n                ')
    
    // Replace the entire why-buy-online-accordion content
    const accordionMatch = html.match(/(<div class="why-buy-online-accordion">)([\s\S]*?)(<\/div>\s*<\/div>\s*<\/section>)/)
    if (accordionMatch) {
      html = html.replace(accordionMatch[0], accordionMatch[1] + accordionItemsHTML + '\n            </div>\n        </div>\n    </section>')
    }
  }
  
  // 23. Claim filing section (flexible section - can be about any process with two approaches/methods)
  if (content.claim_filing?.title) {
    html = html.replace(/(<h2 class="claim-filing-title">)(.*?)(<\/h2>)/, `$1${escapeHtml(content.claim_filing.title)}$3`)
  }
  if (content.claim_filing?.intro) {
    html = html.replace(/(<p class="claim-filing-intro">)(.*?)(<\/p>)/, `$1${escapeHtml(content.claim_filing.intro)}$3`)
  }
  if (content.claim_filing?.subtitle) {
    html = html.replace(/(<p class="claim-filing-subtitle">)(.*?)(<\/p>)/, `$1${escapeHtml(content.claim_filing.subtitle)}$3`)
  }
  
  // Replace tab labels
  if (content.claim_filing?.tab1_label) {
    html = html.replace(/(<button class="claim-tab active" data-tab="own-damage">)(.*?)(<\/button>)/, `$1${escapeHtml(content.claim_filing.tab1_label)}$3`)
  }
  if (content.claim_filing?.tab2_label) {
    html = html.replace(/(<button class="claim-tab" data-tab="third-party">)(.*?)(<\/button>)/, `$1${escapeHtml(content.claim_filing.tab2_label)}$3`)
  }
  
  // Dynamically build steps for tab 1 (own-damage)
  if (content.claim_filing?.own_damage_steps && content.claim_filing.own_damage_steps.length > 0) {
    const tab1StepsHTML = content.claim_filing.own_damage_steps.map((step: string) => 
      `
                        <div class="claim-step">
                            <div class="claim-step-number"></div>
                            <p class="claim-step-text">${escapeHtml(step)}</p>
                        </div>`
    ).join('\n                        ')
    
    // Replace steps in own-damage-content
    const ownDamageContentMatch = html.match(/(<div class="claim-tab-content active" id="own-damage-content">[\s\S]*?<div class="claim-steps">)([\s\S]*?)(<\/div>\s*<\/div>\s*<div class="claim-illustration">)/)
    if (ownDamageContentMatch) {
      html = html.replace(ownDamageContentMatch[0], ownDamageContentMatch[1] + tab1StepsHTML + '\n                    </div>\n                    <div class="claim-illustration">')
    }
  }
  
  // Dynamically build steps for tab 2 (third-party)
  if (content.claim_filing?.third_party_steps && content.claim_filing.third_party_steps.length > 0) {
    const tab2StepsHTML = content.claim_filing.third_party_steps.map((step: string) => 
      `
                        <div class="claim-step">
                            <div class="claim-step-number"></div>
                            <p class="claim-step-text">${escapeHtml(step)}</p>
                        </div>`
    ).join('\n                        ')
    
    // Replace steps in third-party-content
    const thirdPartyContentMatch = html.match(/(<div class="claim-tab-content" id="third-party-content">[\s\S]*?<div class="claim-steps">)([\s\S]*?)(<\/div>\s*<\/div>\s*<div class="claim-illustration">)/)
    if (thirdPartyContentMatch) {
      html = html.replace(thirdPartyContentMatch[0], thirdPartyContentMatch[1] + tab2StepsHTML + '\n                    </div>\n                    <div class="claim-illustration">')
    }
  }
  
  
  // Replace button text and link (both buttons)
  if (content.claim_filing?.button_text) {
    html = html.replace(/(<button class="view-plans-btn")([^>]*>)\s*Learn More\s*(<svg[\s\S]*?<\/svg>)\s*(<\/button>)/g, (match, before, afterOpen, svg, after) => {
      const onClickAttr = ctaLink ? ` onclick="window.open('${escapeHtml(ctaLink)}', '_blank', 'noopener,noreferrer')"` : ''
      return `${before}${onClickAttr}${afterOpen}\n                        ${escapeHtml(content.claim_filing.button_text)}\n                        ${svg}\n                    ${after}`
    })
  }
  
  // 24. FAQs section
  if (content.faqs?.heading) {
    html = html.replace(/(<h2 class="faq-title">)([^<]*)(<\/h2>)/, (_, open, __, close) => `${open}${escapeHtml(content.faqs.heading)}${close}`)
  }
  
  // Replace FAQ tabs dynamically
  if (content.faqs?.tabs && content.faqs.tabs.length > 0) {
    const tabsHTML = content.faqs.tabs.map((tab: any, index: number) => {
      const activeClass = index === 0 ? ' active' : ''
      const tabId = tab.id || `tab-${index + 1}`
      return `                <button class="faq-tab${activeClass}" data-tab="${tabId}">${escapeHtml(tab.label)}</button>`
    }).join('\n')
    
    // Replace the entire faq-tabs container
    const tabsContainerMatch = html.match(/(<div class="faq-tabs">)([\s\S]*?)(<\/div>\s*<div class="faq-content">)/)
    if (tabsContainerMatch) {
      html = html.replace(tabsContainerMatch[0], tabsContainerMatch[1] + tabsHTML + '\n            </div>\n            \n            <div class="faq-content">')
    }
    
    // Dynamically build all FAQ tab panels
    const tabPanelsHTML = content.faqs.tabs.map((tab: any, tabIndex: number) => {
      const activeClass = tabIndex === 0 ? ' active' : ''
      const tabId = tab.id || `tab-${tabIndex + 1}`
      const panelId = `${tabId}-content`
      
      if (!tab.items || tab.items.length === 0) {
        return ''
      }
      
      const faqItemsHTML = tab.items.map((faq: any, faqIndex: number) => 
        `                    <div class="faq-item">
                        <div class="faq-question">
                            <p class="faq-question-text">${escapeHtml(faq.question)}</p>
                            <div class="faq-icon">+</div>
                        </div>
                        <div class="faq-answer">
                            <p class="faq-answer-text">${escapeHtml(faq.answer)}</p>
                        </div>
                    </div>`
      ).join('\n                    \n')
      
      return `                <!-- ${tab.label} Tab -->
                <div class="faq-tab-panel${activeClass}" id="${panelId}">
                    ${faqItemsHTML}
                </div>`
    }).join('\n                \n')
    
    // Replace the entire faq-content container
    const contentContainerMatch = html.match(/(<div class="faq-content">)([\s\S]*?)(<\/div>\s*<\/div>\s*<\/section>)/)
    if (contentContainerMatch) {
      html = html.replace(contentContainerMatch[0], contentContainerMatch[1] + tabPanelsHTML + '\n            </div>\n        </div>\n    </section>')
    }
  }
  
  // 25. Reviews section
  if (content.reviews?.title) {
    html = html.replace(/<h2 class="reviews-title">BrandStory Client Reviews<\/h2>/, `<h2 class="reviews-title">${escapeHtml(content.reviews.title)}</h2>`)
  }
  if (content.reviews?.rating) {
    html = html.replace(/(<span class="reviews-rating">)(.*?)(<\/span>)/, `$1${escapeHtml(content.reviews.rating)}$3`)
  }
  if (content.reviews?.rating_text) {
    html = html.replace(/(<span class="reviews-rating-text">)(.*?)(<\/span>)/, `$1${escapeHtml(content.reviews.rating_text)}$3`)
  }
  if (content.reviews?.subtitle) {
    html = html.replace(/(<p class="reviews-subtitle">)(.*?)(<\/p>)/, `$1${escapeHtml(content.reviews.subtitle)}$3`)
  }
  if (content.reviews?.items && content.reviews.items.length > 0) {
    // Calculate current date and ensure review dates are within 30 days from current date
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() // 0-11
    const currentDay = now.getDate()
    
    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(now.getDate() - 30)
    const minYear = thirtyDaysAgo.getFullYear()
    const minMonth = thirtyDaysAgo.getMonth()
    const minDay = thirtyDaysAgo.getDate()
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    
    const reviewsHTML = content.reviews.items.map((review: any, index: number) => {
      // Process location to ensure dates are within 30 days from current date
      let locationText = review.location || ''
      
      // Generate a random date within the last 30 days
      // Distribute reviews across the 30-day period
      const daysAgo = Math.floor(Math.random() * 30) // 0-29 days ago
      const reviewDate = new Date(now)
      reviewDate.setDate(now.getDate() - daysAgo)
      
      const reviewYear = reviewDate.getFullYear()
      const reviewMonthIndex = reviewDate.getMonth()
      const reviewDay = reviewDate.getDate()
      const reviewMonthName = monthNames[reviewMonthIndex]
      
      // Extract location name (text before comma or before date)
      let locationName = locationText
      const locationMatch = locationText.match(/^([^,]+)/)
      if (locationMatch) {
        locationName = locationMatch[1].trim()
      } else {
        // Remove any existing date patterns
        locationName = locationText.replace(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}\b/i, '').trim()
        locationName = locationName.replace(/\b(19|20)\d{2}\b/, '').trim()
        locationName = locationName.replace(/,\s*$/, '').trim()
      }
      
      // If location name is empty or just numbers, use a default
      if (!locationName || locationName.match(/^\d+$/)) {
        locationName = 'Location'
      }
      
      // Build the final location text with date within 30 days
      locationText = `${locationName}, ${reviewMonthName} ${reviewDay}, ${reviewYear}`
      
      const stars = Array(review.rating || 5).fill(0).map(() => `
                            <svg class="review-card-star" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                        `).join('\n                            ')
      return `
                    <div class="review-card">
                        <div class="review-card-header">
                            <div class="review-card-avatar">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                    <circle cx="12" cy="7" r="4"/>
                                </svg>
                            </div>
                            <div class="review-card-user-info">
                                <h4 class="review-card-name">${escapeHtml(review.name)}</h4>
                                <p class="review-card-location">${escapeHtml(locationText)}</p>
                            </div>
                        </div>
                        <div class="review-card-stars">
                            ${stars}
                        </div>
                        <div class="review-card-content">
                            <h5 class="review-card-title">${escapeHtml(review.title)}</h5>
                            <p class="review-card-text">${escapeHtml(review.text)}</p>
                        </div>
                    </div>
                `
    }).join('\n                    ')
    
    // Replace all content inside reviews-carousel
    // Find the opening tag and match everything until the matching closing </div> of reviews-carousel
    const carouselStart = html.indexOf('<div class="reviews-carousel" id="reviews-carousel">')
    if (carouselStart !== -1) {
      // Find the matching closing div by tracking depth
      let depth = 1
      let pos = carouselStart + '<div class="reviews-carousel" id="reviews-carousel">'.length
      let carouselEnd = -1
      
      while (pos < html.length && depth > 0) {
        if (html.substring(pos, pos + 4) === '<div') {
          depth++
        } else if (html.substring(pos, pos + 6) === '</div>') {
          depth--
          if (depth === 0) {
            carouselEnd = pos + 6
            break
          }
        }
        pos++
      }
      
      if (carouselEnd !== -1) {
        // Replace the content between opening and closing tags
        const before = html.substring(0, carouselStart + '<div class="reviews-carousel" id="reviews-carousel">'.length)
        const after = html.substring(carouselEnd)
        html = before + '\n                    ' + reviewsHTML + '\n                </div>' + after
      } else {
        // Fallback: use regex with a more specific end pattern
        html = html.replace(/(<div class="reviews-carousel" id="reviews-carousel">)([\s\S]*?)(<\/div>\s*<\/div>\s*<\/div>)/, `$1\n                    ${reviewsHTML}\n                </div>\n            </div>\n            \n        </div>`)
      }
    }
  }
  
  // Replace company name throughout (if provided)
  if (companyName) {
    html = html.replace(/Policybazaar/gi, escapeHtml(companyName))
    html = html.replace(/PolicyBazaar/gi, escapeHtml(companyName))
  }
  
  // Replace all CTA links (if provided)
  if (ctaLink) {
    html = html.replace(/href="#"/g, `href="${escapeHtml(ctaLink)}"`)
    html = html.replace(/href="https:\/\/[^"]*policybazaar[^"]*"/gi, `href="${escapeHtml(ctaLink)}"`)
  }
  
  // Return the complete HTML - same structure as template, just with replaced content
  return html
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
    const { userInput, companyName, ctaLink } = await request.json()

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

    // Create comprehensive prompt for all 21+ sections
    const companyContext = companyName ? `\nCompany Name: "${companyName}" - Use this company name in descriptions and benefits sections where appropriate.` : ''
    const ctaContext = ctaLink ? `\nCTA Link: "${ctaLink}" - This is the link for all call-to-action buttons.` : ''
    
    // Get current date information for year calculations
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1 // 1-12
    const currentDay = now.getDate()
    const previousYear = currentYear - 1
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const currentMonthName = monthNames[now.getMonth()]
    
    const prompt = `You are writing content for a comprehensive pillar/service page. This can be for ANY topic - services, products, agencies, industries, etc.

CURRENT DATE INFORMATION:
- Current Year: ${currentYear}
- Current Month: ${currentMonthName} ${currentDay}, ${currentYear}
- Previous Year: ${previousYear}
- IMPORTANT: When generating dates in reviews or comparison sections, use ${previousYear} or earlier for comparison/previous versions, and ${currentYear} for current versions. NEVER use dates that exceed ${currentMonthName} ${currentDay}, ${currentYear}.
- REVIEWS DATES: For reviews section, only provide location names (e.g., 'New York', 'Bangalore'). Dates will be automatically calculated to be within the last 30 days from current date (${currentMonthName} ${currentDay}, ${currentYear}). Do NOT include dates in review locations.
- TRENDS & CONTENT: When comparing ${previousYear} vs ${currentYear}, ensure content reflects LATEST industry trends, technologies, features, and improvements. Column 2 (${previousYear}) should show what was standard/available then, Column 3 (${currentYear}) should show current state-of-the-art, latest features, and modern capabilities that reflect 2024-${currentYear} trends.

User Input: "${userInput}"${companyContext}${ctaContext}

IMPORTANT: The user input "${userInput}" can be ANY topic - NOT just insurance. Examples:
- "website development agency"
- "digital marketing services"
- "ecommerce solutions"
- "cloud hosting services"
- "health insurance" (if insurance-related)
- "car insurance" (if insurance-related)
- ANY service, product, or topic

Task: Generate ALL content sections for a comprehensive pillar/service page based on the user input. The page should be comprehensive, informative, and SEO-optimized.

Core rules:
- Write detailed, informative content (not marketing fluff)
- Be specific and practical - explain how things actually work
- Include relevant examples and use cases
- Write naturally - some sections longer, some shorter
- Avoid buzzwords like "seamless", "cutting-edge", "world-class"
- ${companyName ? `Mention "${companyName}" naturally in descriptions where it makes sense` : 'Do not include specific company names unless provided'}
- Make all content specific to: "${userInput}" - adapt EVERY section to this exact topic
- DO NOT assume it's insurance - adapt to whatever topic the user provides
- If user says "website development agency", generate content about web development services
- If user says "digital marketing", generate content about digital marketing services
- Adapt section names, titles, and content to match the user's topic

Output ONLY valid JSON. No explanations. No markdown. Start with { and end with }.

IMPORTANT NOTE ABOUT EXCLUSIVE BENEFITS SECTION:
- This section has TWO separate cards with DIFFERENT purposes:
  * Left card "Our promise to you": Company achievements, credentials, track record, scale (e.g., "10K+ Projects", "15+ Years Experience", "99% Satisfaction")
  * Right card "Advantage you get": Customer benefits, service advantages, support features (e.g., "24/7 Support", "Free Consultation", "Money-Back Guarantee")
- The right card content MUST be completely different from the left card - focus on what customers GET, not company stats
- Adapt ALL content to the user's topic - DO NOT use insurance-specific terms unless the topic is insurance

REQUIRED SECTIONS (generate ALL of these - 21+ sections):
{
  "page_title": "SEO-optimized page title based on user input (60 characters max, include main keyword)",
  "meta_description": "SEO-optimized meta description based on user input (150-160 characters, include main keyword and compelling description)",
  "header": {
    "title": "Main page title based on user input",
    "description_short": "Short description (1-2 sentences, 100-150 characters) - first part visible by default",
    "description_full": "Full description (4-5 sentences, 250-350 words) - expanded content"
  },
  "banner": {
    "price_text": "Price/offer banner text adapted to user input",
    "main_heading": "Main banner heading adapted to user input",
    "cta_button_text": "CTA button text adapted to user input (e.g., 'Get Started Now', 'Request a Quote', 'Explore Services') - should be action-oriented and relevant to the topic",
    "service_features": [
      "Feature 1 name (2-4 words)",
      "Feature 2 name (2-4 words)",
      "Feature 3 name (2-4 words)",
      "Feature 4 name (2-4 words)"
    ]
  },
  "features": {
    "title": "Features section title",
    "intro": "Introduction paragraph (2-3 sentences)",
    "list": [
      "Feature 1 detailed description (3-4 sentences, 60-80 words)",
      "Feature 2 detailed description (3-4 sentences, 60-80 words)",
      "Feature 3 detailed description (3-4 sentences, 60-80 words)",
      "Feature 4 detailed description (3-4 sentences, 60-80 words)",
      "Feature 5 detailed description (3-4 sentences, 60-80 words)"
    ]
  },
  "exclusive_benefits": {
    "title": "${companyName ? `${companyName} Exclusive Benefits` : 'Exclusive Benefits'}",
    "promise_stats": [
      {
        "value": "Stat value for 'Our promise to you' card - company achievements/credentials (e.g., '10K+', '500+', '15+ Years', '99%', 'ISO Certified')",
        "text": "MUST be format 'Line 1|Line 2' where EACH line is 2-4 words ONLY (e.g., 'Happy Customers|Trusted Partner', 'Years Experience|Proven Track')"
      },
      {
        "value": "Stat value 2 for 'Our promise to you' card - company track record/experience",
        "text": "MUST be format 'Line 1|Line 2' where EACH line is 2-4 words ONLY (e.g., 'Expert Team|Quality Service', 'Global Reach|Local Expertise')"
      },
      {
        "value": "Stat value 3 for 'Our promise to you' card - company scale/reach",
        "text": "MUST be format 'Line 1|Line 2' where EACH line is 2-4 words ONLY (e.g., 'Wide Coverage|Nationwide Service', 'Large Network|Trusted Brand')"
      },
      {
        "value": "Stat value 1 for 'Advantage you get' card - customer service benefit (e.g., '24/7 Support', 'Same-Day Response', 'Free Consultation', 'Lifetime Access', '30-Day Trial')",
        "text": "MUST be format 'Line 1|Line 2' where EACH line is 2-4 words ONLY (e.g., '24/7 Support|Always Available', 'Free Consultation|Expert Advice')"
      },
      {
        "value": "Stat value 2 for 'Advantage you get' card - delivery/service speed benefit (e.g., 'Fast Delivery', 'Quick Turnaround', 'Express Service', 'Instant Setup')",
        "text": "MUST be format 'Line 1|Line 2' where EACH line is 2-4 words ONLY (e.g., 'Fast Delivery|Quick Response', 'Express Service|Same Day')"
      },
      {
        "value": "Stat value 3 for 'Advantage you get' card - value-added benefit (e.g., 'Free Updates', 'Money-Back Guarantee', 'No Hidden Fees', 'Free Training')",
        "text": "MUST be format 'Line 1|Line 2' where EACH line is 2-4 words ONLY (e.g., 'Free Updates|No Hidden Fees', 'Money Back|Full Refund')"
      }
    ],
    "manager_badge_text": "MUST be 2-3 words only - badge for dedicated support/manager (e.g., 'Dedicated Project Manager', 'Personal Account Manager', 'Expert Consultant', 'Assigned Support Team') - NO sentences or paragraphs"
  },
  "types": {
    "title": "Types section title",
    "intro": "Introduction paragraph explaining the types/variants (2-3 sentences, adapt to user input - e.g., 'SEO services can be broadly classified into the following types:' or 'Web development services include:' - DO NOT use 'Motor insurance' text)",
    "button_text": "CTA button text for types section (e.g., 'Explore Plans', 'View All Services', 'Browse Options', 'Get Started') - adapt to topic",
    "items": [
      {
        "title": "Type 1 name - MUST be relevant to user input topic",
        "description": "Type 1 detailed description (4-5 sentences, 100-150 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Type 2 name - MUST be relevant to user input topic",
        "description": "Type 2 detailed description (4-5 sentences, 100-150 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Type 3 name - MUST be relevant to user input topic",
        "description": "Type 3 detailed description (4-5 sentences, 100-150 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Type 4 name - MUST be relevant to user input topic",
        "description": "Type 4 detailed description (4-5 sentences, 100-150 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Type 5 name - MUST be relevant to user input topic",
        "description": "Type 5 detailed description (4-5 sentences, 100-150 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Type 6 name - MUST be relevant to user input topic",
        "description": "Type 6 detailed description (4-5 sentences, 100-150 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Type 7 name - MUST be relevant to user input topic (generate EXACTLY 7 items total for digital agency/marketing topics)",
        "description": "Type 7 detailed description (4-5 sentences, 100-150 words) - MUST be related to the title and user input topic"
      }
    ]
  },
  "coverages": {
    "title": "What's Included/Services Included section title - adapt to user input topic",
    "intro": "Introduction paragraph (2-3 sentences) - adapt to user input topic",
    "left_card_title": "Left card header title - 'Other Agencies' or similar (e.g., 'Other Providers', 'Competitors', 'Other Services') - adapt to topic",
    "right_card_title": "Right card header title - 'Our Agency' or similar (e.g., 'Our Service', 'What We Offer', 'Our Benefits', 'Our Features') - adapt to topic",
    "covered_items": [
      {
        "title": "Included item 1 name - MUST be relevant to user input topic",
        "description": "Item 1 description (2-3 sentences, 50-80 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Included item 2 name - MUST be relevant to user input topic",
        "description": "Item 2 description (2-3 sentences, 50-80 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Included item 3 name - MUST be relevant to user input topic",
        "description": "Item 3 description (2-3 sentences, 50-80 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Included item 4 name - MUST be relevant to user input topic",
        "description": "Item 4 description (2-3 sentences, 50-80 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Included item 5 name - MUST be relevant to user input topic (generate MINIMUM 5 items for covered_items/Our Agency, can be more up to 8-10 items based on topic)",
        "description": "Item 5 description (2-3 sentences, 50-80 words) - MUST be related to the title and user input topic"
      }
    ],
    "not_covered_items": [
      {
        "title": "Not included item 1 name - MUST be relevant to user input topic",
        "description": "Item 1 description of what's NOT included (2-3 sentences, 50-80 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Not included item 2 name - MUST be relevant to user input topic",
        "description": "Item 2 description of what's NOT included (2-3 sentences, 50-80 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Not included item 3 name - MUST be relevant to user input topic (generate 4-8 items total, can be more or fewer based on topic)",
        "description": "Item 3 description of what's NOT included (2-3 sentences, 50-80 words) - MUST be related to the title and user input topic"
      }
    ]
  },
  "why_buy": {
    "title": "Why Should You Choose [TOPIC]? section title - adapt to user input topic",
    "intro": "Introduction paragraphs (2-4 paragraphs, each 2-3 sentences) - can be array of paragraphs or newline-separated string. MUST be relevant to user input topic, NOT insurance-specific unless topic is insurance",
    "points": [
      "Point 1 - feature/benefit text (1-2 sentences, 10-30 words) - MUST be relevant to user input topic",
      "Point 2 - feature/benefit text (1-2 sentences, 10-30 words) - MUST be relevant to user input topic",
      "Point 3 - feature/benefit text (1-2 sentences, 10-30 words) - MUST be relevant to user input topic",
      "Point 4 - feature/benefit text (1-2 sentences, 10-30 words) - MUST be relevant to user input topic (generate 4-8 points total, can be more or fewer based on topic)"
    ]
  },
  "factors": {
    "title": "Factors That Affect [TOPIC] section title - adapt to user input topic",
    "intro": "Introduction paragraph (2-3 sentences) - adapt to user input topic",
    "items": [
      {
        "title": "Factor 1 name - MUST be relevant to user input topic",
        "description": "Factor 1 description (3-4 sentences, 80-120 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Factor 2 name - MUST be relevant to user input topic",
        "description": "Factor 2 description (3-4 sentences, 80-120 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Factor 3 name - MUST be relevant to user input topic",
        "description": "Factor 3 description (3-4 sentences, 80-120 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Factor 4 name - MUST be relevant to user input topic",
        "description": "Factor 4 description (3-4 sentences, 80-120 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Factor 5 name - MUST be relevant to user input topic",
        "description": "Factor 5 description (3-4 sentences, 80-120 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Factor 6 name - MUST be relevant to user input topic",
        "description": "Factor 6 description (3-4 sentences, 80-120 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Factor 7 name - MUST be relevant to user input topic (generate 5-10 items total, can be more or fewer based on topic)",
        "description": "Factor 7 description (3-4 sentences, 80-120 words) - MUST be related to the title and user input topic"
      }
    ]
  },
  "how_to_buy": {
    "title": "How to Get Started with [TOPIC] section title - adapt to user input topic",
    "intro": "Introduction paragraph (2-3 sentences) - adapt to user input topic, explain how to get started with the topic",
    "steps": [
      {
        "title": "Step 1 title - MUST be relevant to user input topic",
        "description": "Step 1 description (2-3 sentences, 40-60 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Step 2 title - MUST be relevant to user input topic",
        "description": "Step 2 description (2-3 sentences, 40-60 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Step 3 title - MUST be relevant to user input topic",
        "description": "Step 3 description (2-3 sentences, 40-60 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Step 4 title - MUST be relevant to user input topic",
        "description": "Step 4 description (2-3 sentences, 40-60 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Step 5 title - MUST be relevant to user input topic",
        "description": "Step 5 description (2-3 sentences, 40-60 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Step 6 title - MUST be relevant to user input topic (generate 4-8 steps total, can be more or fewer based on topic)",
        "description": "Step 6 description (2-3 sentences, 40-60 words) - MUST be related to the title and user input topic"
      }
    ]
  },
  "benefits_online": {
    "title": "Benefits of Choosing [TOPIC] Online section title - adapt to user input topic",
    "intro": "Introduction paragraph (2-3 sentences) - adapt to user input topic, explain benefits of choosing the topic online",
    "items": [
      {
        "title": "Benefit 1 title - MUST be relevant to user input topic",
        "description": "Benefit 1 description (2-3 sentences, 50-70 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Benefit 2 title - MUST be relevant to user input topic",
        "description": "Benefit 2 description (2-3 sentences, 50-70 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Benefit 3 title - MUST be relevant to user input topic",
        "description": "Benefit 3 description (2-3 sentences, 50-70 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Benefit 4 title - MUST be relevant to user input topic",
        "description": "Benefit 4 description (2-3 sentences, 50-70 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Benefit 5 title - MUST be relevant to user input topic",
        "description": "Benefit 5 description (2-3 sentences, 50-70 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Benefit 6 title - MUST be relevant to user input topic",
        "description": "Benefit 6 description (2-3 sentences, 50-70 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Benefit 7 title - MUST be relevant to user input topic (generate 5-10 items total, can be more or fewer based on topic)",
        "description": "Benefit 7 description (2-3 sentences, 50-70 words) - MUST be related to the title and user input topic"
      }
    ]
  },
  "vehicle_types": {
    "title": "Types/Variants of [TOPIC] section title",
    "intro": "Introduction paragraph (2-3 sentences)",
    "button_text": "CTA button text for vehicle types section (e.g., 'Explore Plans', 'View All Options', 'Browse Variants', 'Get Started') - adapt to topic",
    "items": [
      {
        "title": "Type 1 name - MUST be relevant to user input topic",
        "description": "Type 1 description (3-4 sentences, 80-120 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Type 2 name - MUST be relevant to user input topic",
        "description": "Type 2 description (3-4 sentences, 80-120 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Type 3 name - MUST be relevant to user input topic",
        "description": "Type 3 description (3-4 sentences, 80-120 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Type 4 name - MUST be relevant to user input topic",
        "description": "Type 4 description (3-4 sentences, 80-120 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Type 5 name - MUST be relevant to user input topic",
        "description": "Type 5 description (3-4 sentences, 80-120 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Type 6 name - MUST be relevant to user input topic",
        "description": "Type 6 description (3-4 sentences, 80-120 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Type 7 name - MUST be relevant to user input topic (generate EXACTLY 7 items total for digital agency/marketing topics)",
        "description": "Type 7 description (3-4 sentences, 80-120 words) - MUST be related to the title and user input topic"
      }
    ]
  },
  "comparison_table": {
    "title": "Comparison table section title - adapt to user input topic (e.g., 'Comparison of Plans', 'Pricing Tiers Comparison', 'Service Levels Comparison')",
    "subtitle": "Subtitle explaining the comparison (2-3 sentences) - adapt to user input topic",
    "type1_name": "Name for Type 1 column header - adapt to topic (e.g., 'Basic Plan', 'Starter', 'Essential', 'Individual', 'Startup')",
    "type2_name": "Name for Type 2 column header - adapt to topic (e.g., 'Standard Plan', 'Professional', 'Business', 'Team', 'Mid-Size')",
    "type3_name": "Name for Type 3 column header - adapt to topic (e.g., 'Premium Plan', 'Enterprise', 'Advanced', 'Organization', 'Enterprise')",
    "button_text": "CTA button text for comparison section (e.g., 'Get Started', 'Choose Plan', 'Select Option', 'Contact Us') - adapt to topic",
    "rows": [
      {
        "feature": "Feature 1 name - MUST be relevant to user input topic",
        "type1": "Value/Status for Type 1 (use 'yes'/'no', '✓'/'✗', 'check'/'cross', or text) - MUST be relevant to topic",
        "type2": "Value/Status for Type 2 (use 'yes'/'no', '✓'/'✗', 'check'/'cross', or text) - MUST be relevant to topic",
        "type3": "Value/Status for Type 3 (use 'yes'/'no', '✓'/'✗', 'check'/'cross', or text) - MUST be relevant to topic"
      },
      {
        "feature": "Feature 2 name - MUST be relevant to user input topic",
        "type1": "Value/Status for Type 1 (use 'yes'/'no', '✓'/'✗', 'check'/'cross', or text) - MUST be relevant to topic",
        "type2": "Value/Status for Type 2 (use 'yes'/'no', '✓'/'✗', 'check'/'cross', or text) - MUST be relevant to topic",
        "type3": "Value/Status for Type 3 (use 'yes'/'no', '✓'/'✗', 'check'/'cross', or text) - MUST be relevant to topic"
      }
    ]
  },
  "things_consider": {
    "title": "Things to Consider While Choosing/Buying [TOPIC] section title - adapt to user input topic",
    "subtitle": "Subtitle (2-3 sentences) - adapt to user input topic",
    "button_text": "CTA button text for things to consider section (e.g., 'Get Started', 'Choose Now', 'Select Option', 'Contact Us') - adapt to topic",
    "items": [
      {
        "title": "Consideration 1 title - MUST be relevant to user input topic",
        "description": "Consideration 1 description (2-3 sentences, 50-70 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Consideration 2 title - MUST be relevant to user input topic",
        "description": "Consideration 2 description (2-3 sentences, 50-70 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Consideration 3 title - MUST be relevant to user input topic",
        "description": "Consideration 3 description (2-3 sentences, 50-70 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Consideration 4 title - MUST be relevant to user input topic",
        "description": "Consideration 4 description (2-3 sentences, 50-70 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Consideration 5 title - MUST be relevant to user input topic",
        "description": "Consideration 5 description (2-3 sentences, 50-70 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Consideration 6 title - MUST be relevant to user input topic",
        "description": "Consideration 6 description (2-3 sentences, 50-70 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Consideration 7 title - MUST be relevant to user input topic (generate 5-10 items total, can be more or fewer based on topic)",
        "description": "Consideration 7 description (2-3 sentences, 50-70 words) - MUST be related to the title and user input topic"
      }
    ]
  },
  "addons_explore": {
    "title": "Explore Additional Services/Features for [TOPIC] section title - adapt to user input topic (e.g. 'Explore Additional Digital Services' for digital marketing)",
    "items": [
      {
        "name": "Additional service/feature 1 name - MUST be relevant to user input topic",
        "description": "Service/feature 1 brief description (1-2 sentences) - MUST be related to the name and user input topic"
      },
      {
        "name": "Additional service/feature 2 name - MUST be relevant to user input topic",
        "description": "Service/feature 2 brief description (1-2 sentences) - MUST be related to the name and user input topic"
      },
      {
        "name": "Additional service/feature 3 name - MUST be relevant to user input topic",
        "description": "Service/feature 3 brief description (1-2 sentences) - MUST be related to the name and user input topic"
      },
      {
        "name": "Additional service/feature 4 name - MUST be relevant to user input topic",
        "description": "Service/feature 4 brief description (1-2 sentences) - MUST be related to the name and user input topic"
      },
      {
        "name": "Additional service/feature 5 name - MUST be relevant to user input topic",
        "description": "Service/feature 5 brief description (1-2 sentences) - MUST be related to the name and user input topic"
      },
      {
        "name": "Additional service/feature 6 name - MUST be relevant to user input topic",
        "description": "Service/feature 6 brief description (1-2 sentences) - MUST be related to the name and user input topic"
      },
      {
        "name": "Additional service/feature 7 name - MUST be relevant to user input topic",
        "description": "Service/feature 7 brief description (1-2 sentences) - MUST be related to the name and user input topic"
      },
      {
        "name": "Additional service/feature 8 name - MUST be relevant to user input topic",
        "description": "Service/feature 8 brief description (1-2 sentences) - MUST be related to the name and user input topic"
      },
      {
        "name": "Additional service/feature 9 name - MUST be relevant to user input topic",
        "description": "Service/feature 9 brief description (1-2 sentences) - MUST be related to the name and user input topic"
      },
      {
        "name": "Additional service/feature 10 name - MUST be relevant to user input topic",
        "description": "Service/feature 10 brief description (1-2 sentences) - MUST be related to the name and user input topic"
      },
      {
        "name": "Additional service/feature 11 name - MUST be relevant to user input topic",
        "description": "Service/feature 11 brief description (1-2 sentences) - MUST be related to the name and user input topic"
      },
      {
        "name": "Additional service/feature 12 name - MUST be strictly relevant to user input topic only (generate 12 items, each must relate to the topic - NO irrelevant/off-topic services)",
        "description": "Service/feature 12 brief description (1-2 sentences) - MUST be related to the name and user input topic"
      }
    ]
  },
  "explore_more": {
    "title": "Explore More About [TOPIC] section title - adapt to user input topic",
    "items": [
      {
        "title": "Related topic 1 to explore - MUST be relevant to user input topic",
        "description": "Topic 1 description (2-3 sentences, 50-70 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Related topic 2 to explore - MUST be relevant to user input topic",
        "description": "Topic 2 description (2-3 sentences, 50-70 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Related topic 3 to explore - MUST be relevant to user input topic",
        "description": "Topic 3 description (2-3 sentences, 50-70 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Related topic 4 to explore - MUST be relevant to user input topic",
        "description": "Topic 4 description (2-3 sentences, 50-70 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Related topic 5 to explore - MUST be relevant to user input topic",
        "description": "Topic 5 description (2-3 sentences, 50-70 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Related topic 6 to explore - MUST be relevant to user input topic",
        "description": "Topic 6 description (2-3 sentences, 50-70 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Related topic 7 to explore - MUST be relevant to user input topic",
        "description": "Topic 7 description (2-3 sentences, 50-70 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Related topic 8 to explore - MUST be relevant to user input topic",
        "description": "Topic 8 description (2-3 sentences, 50-70 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Related topic 9 to explore - MUST be relevant to user input topic",
        "description": "Topic 9 description (2-3 sentences, 50-70 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Related topic 10 to explore - MUST be relevant to user input topic",
        "description": "Topic 10 description (2-3 sentences, 50-70 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Related topic 11 to explore - MUST be relevant to user input topic",
        "description": "Topic 11 description (2-3 sentences, 50-70 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Related topic 12 to explore - MUST be relevant to user input topic (generate MINIMUM 12 items, can be more up to 15-18 items based on topic)",
        "description": "Topic 12 description (2-3 sentences, 50-70 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Related topic 5 to explore - MUST be relevant to user input topic",
        "description": "Topic 5 description (2-3 sentences, 50-70 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Related topic 6 to explore - MUST be relevant to user input topic",
        "description": "Topic 6 description (2-3 sentences, 50-70 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Related topic 7 to explore - MUST be relevant to user input topic",
        "description": "Topic 7 description (2-3 sentences, 50-70 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Related topic 8 to explore - MUST be relevant to user input topic",
        "description": "Topic 8 description (2-3 sentences, 50-70 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Related topic 9 to explore - MUST be relevant to user input topic",
        "description": "Topic 9 description (2-3 sentences, 50-70 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Related topic 10 to explore - MUST be relevant to user input topic",
        "description": "Topic 10 description (2-3 sentences, 50-70 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Related topic 11 to explore - MUST be relevant to user input topic",
        "description": "Topic 11 description (2-3 sentences, 50-70 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Related topic 12 to explore - MUST be relevant to user input topic (generate at least 12 items, can be more based on topic)",
        "description": "Topic 12 description (2-3 sentences, 50-70 words) - MUST be related to the title and user input topic"
      }
    ]
  },
  "documents_required": {
    "title": "Section title - adapt to user input topic (can be about requirements, features, components, steps, etc. - NOT just documents unless topic is about documents)",
    "intro": "Introduction paragraph (2-3 sentences) - adapt to user input topic, explain what this section is about",
    "button_text": "CTA button text (e.g., 'View Plans', 'Get Started', 'Learn More', 'Explore Options') - adapt to topic",
    "items": [
      {
        "title": "Item 1 name - MUST be relevant to user input topic (can be requirement, feature, component, step, etc.)",
        "description": "Item 1 details (2-3 sentences, 40-60 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Item 2 name - MUST be relevant to user input topic (can be requirement, feature, component, step, etc.)",
        "description": "Item 2 details (2-3 sentences, 40-60 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Item 3 name - MUST be relevant to user input topic (can be requirement, feature, component, step, etc.) - generate 3-6 items total, can be more or fewer based on topic",
        "description": "Item 3 details (2-3 sentences, 40-60 words) - MUST be related to the title and user input topic"
      }
    ]
  },
  "motor_rules": {
    "title": "Section title - adapt to user input topic (can be about updates, comparisons, features, timeline, etc. - NOT just regulations unless topic is about regulations)",
    "intro": "Introduction paragraph (2-3 sentences) - adapt to user input topic, explain that this section compares [CURRENT_YEAR - 1] vs [CURRENT_YEAR] to show latest trends, improvements, and what's new in the industry",
    "table_header_1": "First column header - adapt to topic (e.g., 'Category', 'Type', 'Feature', 'Plan', 'Version')",
    "table_header_2": "Second column header - adapt to topic (e.g., 'Previous Version', 'Basic Plan', 'Standard', '[CURRENT_YEAR - 1] Update' - use current year minus 1, e.g., if current year is 2025, use '2024 Update')",
    "table_header_3": "Third column header - adapt to topic (e.g., 'Current Version', 'Premium Plan', 'Advanced', '[CURRENT_YEAR] Update' - use current year, e.g., if current year is 2025, use '2025 Update')",
    "table_rows": [
      {
        "column1": "Row 1, Column 1 value - MUST be relevant to user input topic (e.g., feature name, category, aspect)",
        "column2": "Row 1, Column 2 value for [CURRENT_YEAR - 1] - MUST show what was available/used in previous year, reflect trends and capabilities from that time",
        "column3": "Row 1, Column 3 value for [CURRENT_YEAR] - MUST show what is available/used in current year, reflect LATEST trends, improvements, and modern capabilities"
      },
      {
        "column1": "Row 2, Column 1 value - MUST be relevant to user input topic (e.g., feature name, category, aspect)",
        "column2": "Row 2, Column 2 value for [CURRENT_YEAR - 1] - MUST show what was available/used in previous year, reflect trends and capabilities from that time",
        "column3": "Row 2, Column 3 value for [CURRENT_YEAR] - MUST show what is available/used in current year, reflect LATEST trends, improvements, and modern capabilities"
      },
      {
        "column1": "Row 3, Column 1 value - MUST be relevant to user input topic (e.g., feature name, category, aspect)",
        "column2": "Row 3, Column 2 value for [CURRENT_YEAR - 1] - MUST show what was available/used in previous year, reflect trends and capabilities from that time",
        "column3": "Row 3, Column 3 value for [CURRENT_YEAR] - MUST show what is available/used in current year, reflect LATEST trends, improvements, and modern capabilities"
      },
      {
        "column1": "Row 4, Column 1 value - MUST be relevant to user input topic (e.g., feature name, category, aspect)",
        "column2": "Row 4, Column 2 value for [CURRENT_YEAR - 1] - MUST show what was available/used in previous year, reflect trends and capabilities from that time",
        "column3": "Row 4, Column 3 value for [CURRENT_YEAR] - MUST show what is available/used in current year, reflect LATEST trends, improvements, and modern capabilities"
      },
      {
        "column1": "Row 5, Column 1 value - MUST be relevant to user input topic (e.g., feature name, category, aspect)",
        "column2": "Row 5, Column 2 value for [CURRENT_YEAR - 1] - MUST show what was available/used in previous year, reflect trends and capabilities from that time",
        "column3": "Row 5, Column 3 value for [CURRENT_YEAR] - MUST show what is available/used in current year, reflect LATEST trends, improvements, and modern capabilities (generate MINIMUM 5 table rows, can be more up to 7-10 rows based on topic - each row MUST show clear differences between previous year and current year)"
      }
    ],
    "intro_second": "Additional intro paragraph (2-3 sentences) - adapt to user input topic",
    "list_items": [
      "Point/item 1 - MUST be relevant to user input topic (2-3 sentences, 50-70 words)",
      "Point/item 2 - MUST be relevant to user input topic (2-3 sentences, 50-70 words)",
      "Point/item 3 - MUST be relevant to user input topic (2-3 sentences, 50-70 words)",
      "Point/item 4 - MUST be relevant to user input topic (2-3 sentences, 50-70 words) - generate 3-6 list items total, can be more or fewer based on topic"
    ],
    "button_text": "CTA button text (e.g., 'View Plans', 'Get Started', 'Learn More', 'Explore Options') - adapt to topic"
  },
  "why_buy_from_company": {
    "title": "${companyName ? `Why Choose [TOPIC] From ${companyName}` : 'Why Choose [TOPIC]'} - adapt verb to topic",
    "intro": "Introduction paragraph (2-3 sentences) - adapt to user input topic, explain why to choose this topic/company",
    "items": [
      {
        "title": "Reason 1 title - MUST be relevant to user input topic",
        "description": "Reason 1 description (3-4 sentences, 80-120 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Reason 2 title - MUST be relevant to user input topic",
        "description": "Reason 2 description (3-4 sentences, 80-120 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Reason 3 title - MUST be relevant to user input topic",
        "description": "Reason 3 description (3-4 sentences, 80-120 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Reason 4 title - MUST be relevant to user input topic",
        "description": "Reason 4 description (3-4 sentences, 80-120 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Reason 5 title - MUST be relevant to user input topic",
        "description": "Reason 5 description (3-4 sentences, 80-120 words) - MUST be related to the title and user input topic"
      },
      {
        "title": "Reason 6 title - MUST be relevant to user input topic (generate 4-8 items total, can be more or fewer based on topic)",
        "description": "Reason 6 description (3-4 sentences, 80-120 words) - MUST be related to the title and user input topic"
      }
    ]
  },
  "claim_filing": {
    "title": "How to Get Started/Process [TOPIC]? section title - adapt to user input topic (can be about any process, not just claim filing)",
    "intro": "Introduction paragraph (2-3 sentences) - adapt to user input topic",
    "subtitle": "Subtitle explaining different process types/approaches - adapt to user input topic",
    "tab1_label": "Tab 1 label - adapt to topic (e.g., 'Method 1', 'Approach A', 'Basic Process', 'Standard Method')",
    "tab2_label": "Tab 2 label - adapt to topic (e.g., 'Method 2', 'Approach B', 'Advanced Process', 'Alternative Method')",
    "button_text": "CTA button text (e.g., 'View Plans', 'Get Started', 'Learn More', 'Explore Options') - adapt to topic",
    "own_damage_steps": [
      "Step 1 description - MUST be relevant to user input topic (1-2 sentences)",
      "Step 2 description - MUST be relevant to user input topic (1-2 sentences)",
      "Step 3 description - MUST be relevant to user input topic (1-2 sentences)",
      "Step 4 description - MUST be relevant to user input topic (1-2 sentences)",
      "Step 5 description - MUST be relevant to user input topic (1-2 sentences)",
      "Step 6 description - MUST be relevant to user input topic (1-2 sentences) - generate 4-8 steps total, can be more or fewer based on topic"
    ],
    "third_party_steps": [
      "Alternative step 1 description - MUST be relevant to user input topic (1-2 sentences)",
      "Alternative step 2 description - MUST be relevant to user input topic (1-2 sentences)",
      "Alternative step 3 description - MUST be relevant to user input topic (1-2 sentences)",
      "Alternative step 4 description - MUST be relevant to user input topic (1-2 sentences) - generate 4-8 steps total, can be more or fewer based on topic"
    ],
    "documents_title": "Documents/Requirements/Items Needed section title - adapt to user input topic (can be about requirements, items needed, prerequisites, etc.)",
    "documents_intro": "Introduction paragraph (2-3 sentences) - adapt to user input topic, explain what documents/requirements/items are needed",
    "documents_list": [
      "Item/requirement 1 - MUST be relevant to user input topic",
      "Item/requirement 2 - MUST be relevant to user input topic",
      "Item/requirement 3 - MUST be relevant to user input topic",
      "Item/requirement 4 - MUST be relevant to user input topic",
      "Item/requirement 5 - MUST be relevant to user input topic",
      "Item/requirement 6 - MUST be relevant to user input topic",
      "Item/requirement 7 - MUST be relevant to user input topic",
      "Item/requirement 8 - MUST be relevant to user input topic (generate 5-10 items total, can be more or fewer based on topic)"
    ]
  },
  "faqs": {
    "heading": "FAQs",
    "tabs": [
      {
        "id": "general",
        "label": "Tab 1 label - adapt to topic (e.g., 'General', 'Basics', 'Overview', 'Getting Started', 'Introduction')",
        "items": [
          {
            "question": "FAQ question 1 - MUST be relevant to user input topic",
            "answer": "Detailed answer (4-5 sentences, 100-150 words) - MUST be relevant to the question and user input topic"
          },
          {
            "question": "FAQ question 2 - MUST be relevant to user input topic",
            "answer": "Detailed answer (4-5 sentences, 100-150 words) - MUST be relevant to the question and user input topic"
          },
          {
            "question": "FAQ question 3 - MUST be relevant to user input topic",
            "answer": "Detailed answer (4-5 sentences, 100-150 words) - MUST be relevant to the question and user input topic"
          },
          {
            "question": "FAQ question 4 - MUST be relevant to user input topic",
            "answer": "Detailed answer (4-5 sentences, 100-150 words) - MUST be relevant to the question and user input topic"
          },
          {
            "question": "FAQ question 5 - MUST be relevant to user input topic",
            "answer": "Detailed answer (4-5 sentences, 100-150 words) - MUST be relevant to the question and user input topic"
          },
          {
            "question": "FAQ question 6 - MUST be relevant to user input topic",
            "answer": "Detailed answer (4-5 sentences, 100-150 words) - MUST be relevant to the question and user input topic"
          },
          {
            "question": "FAQ question 7 - MUST be relevant to user input topic",
            "answer": "Detailed answer (4-5 sentences, 100-150 words) - MUST be relevant to the question and user input topic"
          },
          {
            "question": "FAQ question 8 - MUST be relevant to user input topic",
            "answer": "Detailed answer (4-5 sentences, 100-150 words) - MUST be relevant to the question and user input topic"
          },
          {
            "question": "FAQ question 9 - MUST be relevant to user input topic",
            "answer": "Detailed answer (4-5 sentences, 100-150 words) - MUST be relevant to the question and user input topic"
          },
          {
            "question": "FAQ question 10 - MUST be relevant to user input topic (generate MINIMUM 10 FAQs per tab, can be more up to 12-15 per tab based on topic)",
            "answer": "Detailed answer (4-5 sentences, 100-150 words) - MUST be relevant to the question and user input topic"
          }
        ]
      },
      {
        "id": "purchase",
        "label": "Tab 2 label - adapt to topic (e.g., 'Purchase', 'Buying', 'Getting Started', 'Setup', 'Implementation', 'How to Get')",
        "items": [
          {
            "question": "FAQ question 1 - MUST be relevant to user input topic and this tab's theme",
            "answer": "Detailed answer (4-5 sentences, 100-150 words) - MUST be relevant to the question and user input topic"
          },
          {
            "question": "FAQ question 2 - MUST be relevant to user input topic and this tab's theme",
            "answer": "Detailed answer (4-5 sentences, 100-150 words) - MUST be relevant to the question and user input topic"
          },
          {
            "question": "FAQ question 3 - MUST be relevant to user input topic and this tab's theme",
            "answer": "Detailed answer (4-5 sentences, 100-150 words) - MUST be relevant to the question and user input topic"
          },
          {
            "question": "FAQ question 4 - MUST be relevant to user input topic and this tab's theme",
            "answer": "Detailed answer (4-5 sentences, 100-150 words) - MUST be relevant to the question and user input topic"
          },
          {
            "question": "FAQ question 5 - MUST be relevant to user input topic and this tab's theme",
            "answer": "Detailed answer (4-5 sentences, 100-150 words) - MUST be relevant to the question and user input topic"
          },
          {
            "question": "FAQ question 6 - MUST be relevant to user input topic and this tab's theme",
            "answer": "Detailed answer (4-5 sentences, 100-150 words) - MUST be relevant to the question and user input topic"
          },
          {
            "question": "FAQ question 7 - MUST be relevant to user input topic and this tab's theme",
            "answer": "Detailed answer (4-5 sentences, 100-150 words) - MUST be relevant to the question and user input topic"
          },
          {
            "question": "FAQ question 8 - MUST be relevant to user input topic and this tab's theme",
            "answer": "Detailed answer (4-5 sentences, 100-150 words) - MUST be relevant to the question and user input topic"
          },
          {
            "question": "FAQ question 9 - MUST be relevant to user input topic and this tab's theme",
            "answer": "Detailed answer (4-5 sentences, 100-150 words) - MUST be relevant to the question and user input topic"
          },
          {
            "question": "FAQ question 10 - MUST be relevant to user input topic and this tab's theme (generate MINIMUM 10 FAQs per tab, can be more up to 12-15 per tab based on topic)",
            "answer": "Detailed answer (4-5 sentences, 100-150 words) - MUST be relevant to the question and user input topic"
          }
        ]
      },
      {
        "id": "features",
        "label": "Tab 3 label - adapt to topic (e.g., 'Features', 'Coverage', 'Benefits', 'Options', 'Plans', 'Pricing')",
        "items": [
          {
            "question": "FAQ question 1 - MUST be relevant to user input topic and this tab's theme",
            "answer": "Detailed answer (4-5 sentences, 100-150 words) - MUST be relevant to the question and user input topic"
          },
          {
            "question": "FAQ question 2 - MUST be relevant to user input topic and this tab's theme",
            "answer": "Detailed answer (4-5 sentences, 100-150 words) - MUST be relevant to the question and user input topic"
          },
          {
            "question": "FAQ question 3 - MUST be relevant to user input topic and this tab's theme",
            "answer": "Detailed answer (4-5 sentences, 100-150 words) - MUST be relevant to the question and user input topic"
          },
          {
            "question": "FAQ question 4 - MUST be relevant to user input topic and this tab's theme",
            "answer": "Detailed answer (4-5 sentences, 100-150 words) - MUST be relevant to the question and user input topic"
          },
          {
            "question": "FAQ question 5 - MUST be relevant to user input topic and this tab's theme",
            "answer": "Detailed answer (4-5 sentences, 100-150 words) - MUST be relevant to the question and user input topic"
          },
          {
            "question": "FAQ question 6 - MUST be relevant to user input topic and this tab's theme",
            "answer": "Detailed answer (4-5 sentences, 100-150 words) - MUST be relevant to the question and user input topic"
          },
          {
            "question": "FAQ question 7 - MUST be relevant to user input topic and this tab's theme",
            "answer": "Detailed answer (4-5 sentences, 100-150 words) - MUST be relevant to the question and user input topic"
          },
          {
            "question": "FAQ question 8 - MUST be relevant to user input topic and this tab's theme",
            "answer": "Detailed answer (4-5 sentences, 100-150 words) - MUST be relevant to the question and user input topic"
          },
          {
            "question": "FAQ question 9 - MUST be relevant to user input topic and this tab's theme",
            "answer": "Detailed answer (4-5 sentences, 100-150 words) - MUST be relevant to the question and user input topic"
          },
          {
            "question": "FAQ question 10 - MUST be relevant to user input topic and this tab's theme (generate MINIMUM 10 FAQs per tab, can be more up to 12-15 per tab based on topic)",
            "answer": "Detailed answer (4-5 sentences, 100-150 words) - MUST be relevant to the question and user input topic"
          }
        ]
      },
      {
        "id": "support",
        "label": "Tab 4 label - adapt to topic (e.g., 'Support', 'Help', 'Troubleshooting', 'Common Issues', 'Maintenance', 'Usage')",
        "items": [
          {
            "question": "FAQ question 1 - MUST be relevant to user input topic and this tab's theme",
            "answer": "Detailed answer (4-5 sentences, 100-150 words) - MUST be relevant to the question and user input topic"
          },
          {
            "question": "FAQ question 2 - MUST be relevant to user input topic and this tab's theme",
            "answer": "Detailed answer (4-5 sentences, 100-150 words) - MUST be relevant to the question and user input topic"
          },
          {
            "question": "FAQ question 3 - MUST be relevant to user input topic and this tab's theme",
            "answer": "Detailed answer (4-5 sentences, 100-150 words) - MUST be relevant to the question and user input topic"
          },
          {
            "question": "FAQ question 4 - MUST be relevant to user input topic and this tab's theme",
            "answer": "Detailed answer (4-5 sentences, 100-150 words) - MUST be relevant to the question and user input topic"
          },
          {
            "question": "FAQ question 5 - MUST be relevant to user input topic and this tab's theme",
            "answer": "Detailed answer (4-5 sentences, 100-150 words) - MUST be relevant to the question and user input topic"
          },
          {
            "question": "FAQ question 6 - MUST be relevant to user input topic and this tab's theme",
            "answer": "Detailed answer (4-5 sentences, 100-150 words) - MUST be relevant to the question and user input topic"
          },
          {
            "question": "FAQ question 7 - MUST be relevant to user input topic and this tab's theme",
            "answer": "Detailed answer (4-5 sentences, 100-150 words) - MUST be relevant to the question and user input topic"
          },
          {
            "question": "FAQ question 8 - MUST be relevant to user input topic and this tab's theme",
            "answer": "Detailed answer (4-5 sentences, 100-150 words) - MUST be relevant to the question and user input topic"
          },
          {
            "question": "FAQ question 9 - MUST be relevant to user input topic and this tab's theme",
            "answer": "Detailed answer (4-5 sentences, 100-150 words) - MUST be relevant to the question and user input topic"
          },
          {
            "question": "FAQ question 10 - MUST be relevant to user input topic and this tab's theme (generate MINIMUM 10 FAQs per tab, can be more up to 12-15 per tab based on topic)",
            "answer": "Detailed answer (4-5 sentences, 100-150 words) - MUST be relevant to the question and user input topic"
          }
        ]
      }
    ]
  },
  "reviews": {
    "title": "[TOPIC] Reviews & Ratings section title",
    "rating": "4.6",
    "rating_text": "Based on [NUMBER] Reviews - adapt to number of reviews generated",
    "subtitle": "(Showing Newest [NUMBER] reviews) - adapt to number of reviews generated",
    "items": [
      {
        "name": "Reviewer name",
        "location": "Location name (e.g., 'New York', 'Bangalore', 'London') - date will be automatically set within last 30 days from current date",
        "rating": 5,
        "title": "Review title - MUST be relevant to user input topic",
        "text": "Review text (2-3 sentences, 40-60 words) - MUST be relevant to user input topic"
      },
      {
        "name": "Reviewer name 2",
        "location": "Location name (e.g., 'New York', 'Bangalore', 'London') - date will be automatically set within last 30 days from current date",
        "rating": 4,
        "title": "Review title 2 - MUST be relevant to user input topic",
        "text": "Review text (2-3 sentences, 40-60 words) - MUST be relevant to user input topic"
      },
      {
        "name": "Reviewer name 3",
        "location": "Location name (e.g., 'New York', 'Bangalore', 'London') - date will be automatically set within last 30 days from current date",
        "rating": 5,
        "title": "Review title 3 - MUST be relevant to user input topic",
        "text": "Review text (2-3 sentences, 40-60 words) - MUST be relevant to user input topic"
      },
      {
        "name": "Reviewer name 4",
        "location": "Location, Month DD, YYYY (use current year - 1 or earlier, e.g., if current year is 2025, use 2024 or 2023. IMPORTANT: Date must NEVER exceed current date/month - if current date is March 15, 2025, use dates up to March 15, 2024 or earlier) - generate MINIMUM 4 review items, can be more up to 6-12 items based on topic - ALL reviews MUST be placed in the carousel",
        "rating": 4,
        "title": "Review title 4 - MUST be relevant to user input topic",
        "text": "Review text (2-3 sentences, 40-60 words) - MUST be relevant to user input topic"
      }
    ]
  }
}

CRITICAL REQUIREMENTS:
- Generate ALL 21+ sections based STRICTLY on user input: "${userInput}"
- ${companyName ? `Use "${companyName}" naturally in descriptions where appropriate` : 'Do not include company names'}
- DO NOT assume it's insurance - adapt to whatever topic the user provides
- Generate EXACTLY 4 FAQ tabs with relevant tab labels for the user's topic
- Generate MINIMUM 10 FAQ items per tab with detailed answers - all FAQs MUST be about BrandStory only (services, processes, team, approach, industries served, how to work with BrandStory, digital marketing, UI/UX, SEO, etc.). NO generic/off-topic FAQs (e.g. no real estate, property, tenant, facility management)
- Generate MINIMUM 4 review items (can be more up to 6-12 items based on topic) with realistic reviews - ALL reviews MUST be relevant to user input topic and MUST be placed inside the carousel as review cards
- Generate at least 4-6 comparison table rows with type1_name, type2_name, type3_name (e.g., 'Startup', 'Mid', 'Enterprise' or 'Basic', 'Standard', 'Premium' - adapt to topic) - all content MUST be relevant to user input topic, NOT insurance-specific
- Generate at least 5-10 things to consider items - each item should have a title and description that are related and relevant to the user's topic
- Generate addons_explore items: 12 items STRICTLY relevant to the user's input topic only. Each item must be a related additional service/feature for that topic. DO NOT include irrelevant services (e.g. no real estate, facility management, property, tenant, lease items for digital marketing topics). Base every item on user input context.
- Generate at least 12 explore more items (can be more) - first 6 visible by default, rest hidden (shown on "View more" click) - each item should have a title that is relevant to the user's topic
- Generate EXACTLY 3 items for documents_required section (requirements, features, components, or steps - NOT just documents unless topic is about documents) - each item should have a title and description that are related and relevant to the user's topic
- Generate motor_rules section: MINIMUM 5 table rows (with dynamic column headers showing [CURRENT_YEAR - 1] vs [CURRENT_YEAR] comparison) and 3-6 list items - this section can be about updates, comparisons, features, timeline, etc. based on topic, NOT just regulations unless topic is about regulations - all content MUST be relevant to user input topic - CRITICAL: Each table row MUST show clear, meaningful differences between previous year and current year, reflecting LATEST trends, technologies, features, and improvements in the industry - Column 2 should reflect what was available/standard in [CURRENT_YEAR - 1], Column 3 should reflect what is available/standard in [CURRENT_YEAR] with latest trends and modern capabilities
- Generate at least 4-8 process steps for how_to_buy section - each step should have a title and description that are related and relevant to the user's topic
- Generate EXACTLY 6 promise_stats: first 3 for 'Our promise to you' card (company achievements/credentials/track record), last 3 for 'Advantage you get' card (customer benefits/services/advantages - MUST be different from left card, focus on what customers get). Each promise_stats[].text should have format "Line 1|Line 2" where EACH line is 2-4 words ONLY (e.g., "Happy Customers|Trusted Partner", "Fast Delivery|Quick Response") - NO long sentences. exclusive_benefits.manager_badge_text MUST be 2-3 words only (e.g. "Dedicated Project Manager", "Expert Consultant") - never a sentence or paragraph
- Generate coverage items: covered_items (MINIMUM 5 items, typically 5-10 items for right card - Our Agency) and not_covered_items (typically 3-6 items for left card - Other Agencies) - each item should have a title and description that are related and relevant to the user's topic
- Generate types items: EXACTLY 7 items for "Tailored Digital Marketing Services" - e.g. UI/UX Design, SEO & SEM, Social Media, Web Development, PR, Employer Branding, Performance Marketing - each with title and description. DO NOT include BrandStory Academy. These are SERVICE CATEGORIES.
- Generate vehicle_types items: EXACTLY 7 items for "Types of Digital Marketing Solutions" - MUST BE DIFFERENT from types. E.g. Content Marketing, Paid Ads, Email Marketing, Influencer Marketing, Analytics, CRM, Video Marketing - each with title and description. DO NOT duplicate types items. These are SOLUTION/DELIVERY TYPES.
- All content must be relevant to: "${userInput}" - NOT generic insurance content
- DO NOT use insurance-related terms like 'vehicle', 'car insurance', 'motor insurance', 'policy', 'claims', 'premium' unless the user input is actually about insurance
- Return ONLY valid JSON, no markdown, no code blocks, no explanations`

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
        console.log(`Trying model: ${modelConfig.name}`)
        completion = await openai.chat.completions.create({
          model: modelConfig.name,
          max_tokens: modelConfig.maxTokens,
          messages: [
            {
              role: 'system',
              content: 'You are a content writer creating comprehensive pillar page content. You MUST return valid JSON only - no apologies, no explanations, just the JSON object.',
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
        
        if (responseContent && responseContent.trim().length > 0) {
          console.log(`✓ Successfully used model: ${modelConfig.name}`)
          break
        }
      } catch (error: any) {
        lastError = error
        console.log(`✗ Model ${modelConfig.name} failed: ${error.message || 'Unknown error'}`)
      }
    }

    if (!responseContent || responseContent.trim().length === 0) {
      throw new Error(`All models failed. Last error: ${lastError?.message || 'Unknown error'}`)
    }

    // Parse JSON from response
    let contentData
    try {
      const jsonMatch = responseContent.match(/```json\n([\s\S]*?)\n```/) || responseContent.match(/```\n([\s\S]*?)\n```/)
      let jsonString = jsonMatch ? jsonMatch[1] : responseContent
      jsonString = jsonString.trim()
      
      if (!jsonString.startsWith('{')) {
        const jsonStart = jsonString.indexOf('{')
        if (jsonStart !== -1) {
          jsonString = jsonString.substring(jsonStart)
        }
      }
      
      contentData = JSON.parse(jsonString)
      console.log('✓ JSON parsed successfully')
    } catch (parseError: any) {
      console.error('JSON Parse Error:', parseError)
      throw new Error(`Failed to parse content from API response: ${parseError.message}`)
    }

    // Humanize the content data (with timeout protection and smart batching)
    console.log('🔄 Starting humanization process...')
    try {
      // Set a maximum time limit for humanization (5 minutes)
      // Batch size of 25 means ~4 API calls instead of 100+ individual calls (75% cost reduction)
      const humanizationPromise = humanizeContentData(contentData, '', 50, 25)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Humanization timeout')), 300000) // 5 minutes
      )
      
      contentData = await Promise.race([humanizationPromise, timeoutPromise]) as any
      console.log('✓ Content humanized successfully')
    } catch (humanizeError: any) {
      console.error('Humanization error:', humanizeError)
      // Continue with original content if humanization fails
      console.warn('⚠ Continuing with original (non-humanized) content')
    }

    // Generate HTML page - returns full HTML like template6
    const generatedHTML = generateHTMLPage(contentData, companyName, ctaLink)

    // Create ZIP file with HTML and assets
    const archive = archiver('zip', { zlib: { level: 9 } })
    const chunks: Buffer[] = []

    archive.on('data', (chunk: Buffer) => {
      chunks.push(chunk)
    })

    // Add HTML file as index.html
    archive.append(generatedHTML, { name: 'index.html' })

    // Add pillar-page brandstory-images directory
    const pillarImagesPath = join(process.cwd(), 'public', 'pillar-page', 'brandstory-images')
    try {
      if (statSync(pillarImagesPath).isDirectory()) {
        addDirectoryToZip(archive, pillarImagesPath, 'brandstory-images')
        console.log('✓ Added pillar-page brandstory-images directory to ZIP')
      }
    } catch (e) {
      console.warn('Pillar-page brandstory-images directory not found, skipping...')
    }

    // Finalize the archive
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
        'Content-Disposition': `attachment; filename="brandstory-pillar-page-generated-${Date.now()}-humanizer.zip"`,
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
