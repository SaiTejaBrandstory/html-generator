import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

// Call Rephrasy humanizer API (optional)
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

// Humanize HTML by extracting text nodes from the main content and FAQ, sending them to Rephrasy,
// and replacing the original text while preserving HTML structure.
async function humanizeHtmlWithCheerio(html: string): Promise<string> {
  const $ = cheerio.load(html)

  // Collect body paragraph texts (use .blog-content p to target template1 structure)
  const bodyElements: cheerio.Cheerio<any>[] = []
  const bodyTexts: string[] = []

  $('.blog-content p').each((_i, el) => {
    const text = $(el).text().trim()
    if (text.length > 30) {
      bodyElements.push($(el))
      bodyTexts.push(text)
    }
  })

  // Collect FAQ answer texts (if present)
  const faqElements: cheerio.Cheerio<any>[] = []
  const faqTexts: string[] = []

  $('#faqAccordion .accordion-body').each((_i, el) => {
    const text = $(el).text().trim()
    if (text.length > 10) {
      faqElements.push($(el))
      faqTexts.push(text)
    }
  })

  console.log(`Extracted ${bodyTexts.length} body paragraphs and ${faqTexts.length} FAQ answers`)

  // API Call 1: Humanize body paragraphs
  if (bodyTexts.length > 0) {
    const bodyBlob = bodyTexts.join('\n\n')
    const humanizedBody = await callRephrasy(bodyBlob)

    if (humanizedBody) {
      const humanizedParagraphs = humanizedBody.split(/\n\n+/).filter(p => p.trim().length > 0)
      if (humanizedParagraphs.length === bodyTexts.length) {
        for (let i = 0; i < bodyElements.length; i++) {
          bodyElements[i].text(humanizedParagraphs[i].trim())
        }
      } else {
        // Distribute proportionally by character length
        const totalOrigLen = bodyTexts.reduce((sum, t) => sum + t.length, 0)
        const fullHumanized = humanizedParagraphs.join(' ')
        let cursor = 0

        for (let i = 0; i < bodyElements.length; i++) {
          const proportion = bodyTexts[i].length / totalOrigLen
          const chunkLen = Math.round(proportion * fullHumanized.length)
          let chunk: string

          if (i === bodyElements.length - 1) {
            chunk = fullHumanized.substring(cursor).trim()
          } else {
            const targetEnd = cursor + chunkLen
            let endIdx = targetEnd
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
      }
    } else {
      console.warn('Body humanization failed, keeping original text')
    }
  }

  // API Call 2: Humanize FAQ answers
  if (faqTexts.length > 0) {
    const faqBlob = faqTexts.join('\n\n')
    const humanizedFaq = await callRephrasy(faqBlob)

    if (humanizedFaq) {
      const humanizedAnswers = humanizedFaq.split(/\n\n+/).filter(p => p.trim().length > 0)
      if (humanizedAnswers.length === faqTexts.length) {
        for (let i = 0; i < faqElements.length; i++) {
          faqElements[i].text(humanizedAnswers[i].trim())
        }
      } else {
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
            faqElements[i].text(chunk)
          }
        }
      }
    } else {
      console.warn('FAQ humanization failed, keeping original text')
    }
  }

  return $.html()
}

export async function POST(request: NextRequest) {
  try {
    const { userInput, wordCount } = await request.json()

    if (!userInput || !userInput.trim()) {
      return NextResponse.json(
        { error: 'Content input is required' },
        { status: 400 }
      )
    }

    const targetWordCount = parseInt(wordCount) || 3000
    if (targetWordCount < 500 || targetWordCount > 4000) {
      return NextResponse.json(
        { error: 'Word count must be between 500 and 4,000' },
        { status: 400 }
      )
    }

    // Call the existing generate-blog-template1 endpoint internally to get the HTML
    const host = request.headers.get('host') || 'localhost:3000'
    const proto = request.headers.get('x-forwarded-proto') || 'http'
    const origin = `${proto}://${host}`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 180000)

    const genResp = await fetch(`${origin}/api/generate-blog-template1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userInput, wordCount: targetWordCount }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!genResp.ok) {
      const text = await genResp.text()
      console.error('Generator error:', genResp.status, text.substring(0, 500))
      return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 })
    }

    const originalHtml = await genResp.text()

    // Humanize the HTML (if REPHRASY_API_KEY is configured)
    const humanizedHtml = await humanizeHtmlWithCheerio(originalHtml)

    // Return the modified HTML as an attachment
    return new NextResponse(humanizedHtml, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="generated-blog-humanized-${Date.now()}.html"`,
      },
    })
  } catch (error: any) {
    console.error('Humanizer error:', error)
    return NextResponse.json(
      { error: 'Failed to humanize blog content', message: error?.message || 'Unknown error' },
      { status: 500 }
    )
  }
}
