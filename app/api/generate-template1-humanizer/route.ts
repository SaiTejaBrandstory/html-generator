import { NextRequest, NextResponse } from 'next/server'

// Helper function to humanize text using Rephrasy API
async function humanizeText(text: string): Promise<string> {
  if (!text || text.length < 20) return text

  const apiKey = process.env.REPHRASY_API_KEY
  if (!apiKey) {
    console.warn('REPHRASY_API_KEY not found, skipping humanization')
    return text
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000)

    const response = await fetch('https://v2-humanizer.rephrasy.ai/api', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
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
      console.error('Humanizer API error:', await response.text())
      return text
    }

    const data = await response.json()
    return data.output || text
  } catch (error: any) {
    console.error('Humanization failed:', error.message)
    return text
  }
}

// Humanize template1 content structure (banner, intro, track_record, key_benefits, services, process, why_partner, why_essential, benefits_working, testimonials, ai_tools, faqs, final_cta)
async function humanizeContent(content: any): Promise<any> {
  const humanized = JSON.parse(JSON.stringify(content))

  const separator = '\n\n---HUMANIZE_SEPARATOR---\n\n'

  // Batch: intro paragraphs
  const introTexts: string[] = []
  if (humanized.intro?.paragraph_1 && humanized.intro.paragraph_1.length > 30) introTexts.push(humanized.intro.paragraph_1)
  if (humanized.intro?.paragraph_2 && humanized.intro.paragraph_2.length > 30) introTexts.push(humanized.intro.paragraph_2)
  if (introTexts.length > 0) {
    const combined = introTexts.join(separator)
    const out = await humanizeText(combined)
    const results = out.split(separator)
    if (results.length >= 1 && humanized.intro) humanized.intro.paragraph_1 = results[0].trim()
    if (results.length >= 2 && humanized.intro) humanized.intro.paragraph_2 = results[1].trim()
  }

  // Single fields
  if (humanized.trusted_brands?.description?.length > 30) {
    humanized.trusted_brands.description = await humanizeText(humanized.trusted_brands.description)
  }
  if (humanized.services?.description?.length > 30) {
    humanized.services.description = await humanizeText(humanized.services.description)
  }
  if (humanized.process?.description?.length > 30) {
    humanized.process.description = await humanizeText(humanized.process.description)
  }
  if (humanized.why_partner?.description?.length > 30) {
    humanized.why_partner.description = await humanizeText(humanized.why_partner.description)
  }
  if (humanized.why_essential?.description?.length > 30) {
    humanized.why_essential.description = await humanizeText(humanized.why_essential.description)
  }
  if (humanized.benefits_working?.description?.length > 30) {
    humanized.benefits_working.description = await humanizeText(humanized.benefits_working.description)
  }
  if (humanized.ai_tools?.description?.length > 30) {
    humanized.ai_tools.description = await humanizeText(humanized.ai_tools.description)
  }
  if (humanized.final_cta?.description?.length > 30) {
    humanized.final_cta.description = await humanizeText(humanized.final_cta.description)
  }

  // track_record.stats
  if (humanized.track_record?.stats) {
    for (const stat of humanized.track_record.stats) {
      if (stat.title) stat.title = await humanizeText(stat.title)
      if (stat.description) stat.description = await humanizeText(stat.description)
    }
  }

  // key_benefits.benefits
  if (humanized.key_benefits?.benefits) {
    for (const b of humanized.key_benefits.benefits) {
      if (b.description) b.description = await humanizeText(b.description)
    }
  }

  // services.services_list
  if (humanized.services?.services_list) {
    for (const s of humanized.services.services_list) {
      if (s.description) s.description = await humanizeText(s.description)
    }
  }

  // process.steps
  if (humanized.process?.steps) {
    for (const step of humanized.process.steps) {
      if (step.description) step.description = await humanizeText(step.description)
    }
  }

  // why_essential.points
  if (humanized.why_essential?.points) {
    for (let i = 0; i < humanized.why_essential.points.length; i++) {
      if (typeof humanized.why_essential.points[i] === 'string' && humanized.why_essential.points[i].length > 30) {
        humanized.why_essential.points[i] = await humanizeText(humanized.why_essential.points[i])
      }
    }
  }

  // benefits_working.benefits
  if (humanized.benefits_working?.benefits) {
    for (const b of humanized.benefits_working.benefits) {
      if (b.description) b.description = await humanizeText(b.description)
    }
  }

  // testimonials.testimonials_list
  if (humanized.testimonials?.testimonials_list) {
    for (const t of humanized.testimonials.testimonials_list) {
      if (t.quote) t.quote = await humanizeText(t.quote)
    }
  }

  // ai_tools.tools
  if (humanized.ai_tools?.tools) {
    for (const t of humanized.ai_tools.tools) {
      if (t.description) t.description = await humanizeText(t.description)
    }
  }

  // faqs.faqs_list
  if (humanized.faqs?.faqs_list) {
    for (const faq of humanized.faqs.faqs_list) {
      if (faq.answer) faq.answer = await humanizeText(faq.answer)
    }
  }

  return humanized
}

export async function POST(request: NextRequest) {
  try {
    const { userInput } = await request.json()

    if (!userInput || !userInput.trim()) {
      return NextResponse.json({ error: 'Content input is required' }, { status: 400 })
    }

    const origin = new URL(request.url).origin

    // 1) Get content JSON from generate-template1 (returnJson: true)
    const jsonRes = await fetch(`${origin}/api/generate-template1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userInput: userInput.trim(), returnJson: true }),
    })

    if (!jsonRes.ok) {
      const err = await jsonRes.json().catch(() => ({}))
      throw new Error(err.error || err.message || 'Failed to generate content')
    }

    const contentData = await jsonRes.json()

    // 2) Humanize the content
    console.log('Starting humanization process (template1)...')
    const humanizedContent = await humanizeContent(contentData)
    console.log('Humanization complete (template1)')

    // 3) Get ZIP by posting contentData to generate-template1
    const zipRes = await fetch(`${origin}/api/generate-template1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentData: humanizedContent }),
    })

    if (!zipRes.ok) {
      const err = await zipRes.json().catch(() => ({}))
      throw new Error(err.error || err.message || 'Failed to build ZIP')
    }

    const zipBuffer = await zipRes.arrayBuffer()

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="template1-humanized-${Date.now()}.zip"`,
      },
    })
  } catch (error: any) {
    console.error('Template1 humanizer error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate humanized content' },
      { status: 500 }
    )
  }
}
