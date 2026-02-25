import { NextRequest, NextResponse } from 'next/server'

const MIN_LENGTH = 30 // Match template2: only humanize strings longer than 30 chars
const SEPARATOR = '\n\n---HUMANIZE_SEPARATOR---\n\n'

// Single Rephrasy API call (same as template2)
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

// Same as template2: one batch for flat description fields, then sequential for arrays (descriptions only)
async function humanizeContent(content: any): Promise<any> {
  const humanized = JSON.parse(JSON.stringify(content))

  // 1) Flat description fields – one batch call (like template2)
  const flatFields = [
    'intro.paragraph_1',
    'intro.paragraph_2',
    'trusted_brands.description',
    'services.description',
    'process.description',
    'why_partner.description',
    'why_essential.description',
    'benefits_working.description',
    'ai_tools.description',
    'final_cta.description',
  ]

  const textsToHumanize: string[] = []
  const fieldRefs: { obj: any; key: string }[] = []

  for (const fieldPath of flatFields) {
    const parts = fieldPath.split('.')
    let current = humanized
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current || typeof current !== 'object') break
      current = current[parts[i]]
    }
    const key = parts[parts.length - 1]
    if (current && typeof current[key] === 'string' && current[key].length >= MIN_LENGTH) {
      textsToHumanize.push(current[key])
      fieldRefs.push({ obj: current, key })
    }
  }

  if (textsToHumanize.length > 0) {
    const combined = textsToHumanize.join(SEPARATOR)
    const humanizedCombined = await humanizeText(combined)
    const results = humanizedCombined.split(SEPARATOR)
    if (results.length === textsToHumanize.length) {
      fieldRefs.forEach((ref, i) => {
        ref.obj[ref.key] = results[i].trim()
      })
    }
  }

  // 2) Arrays – sequential calls, descriptions only (no titles/headings), same as template2
  if (humanized.track_record?.stats) {
    for (const stat of humanized.track_record.stats) {
      if (stat.description && stat.description.length >= MIN_LENGTH) {
        stat.description = await humanizeText(stat.description)
      }
    }
  }
  if (humanized.key_benefits?.benefits) {
    for (const b of humanized.key_benefits.benefits) {
      if (b.description && b.description.length >= MIN_LENGTH) {
        b.description = await humanizeText(b.description)
      }
    }
  }
  if (humanized.services?.services_list) {
    for (const s of humanized.services.services_list) {
      if (s.description && s.description.length >= MIN_LENGTH) {
        s.description = await humanizeText(s.description)
      }
    }
  }
  if (humanized.process?.steps) {
    for (const step of humanized.process.steps) {
      if (step.description && step.description.length >= MIN_LENGTH) {
        step.description = await humanizeText(step.description)
      }
    }
  }
  if (humanized.benefits_working?.benefits) {
    for (const b of humanized.benefits_working.benefits) {
      if (b.description && b.description.length >= MIN_LENGTH) {
        b.description = await humanizeText(b.description)
      }
    }
  }
  if (humanized.testimonials?.testimonials_list) {
    for (const t of humanized.testimonials.testimonials_list) {
      if (t.quote && t.quote.length >= MIN_LENGTH) {
        t.quote = await humanizeText(t.quote)
      }
    }
  }
  if (humanized.ai_tools?.tools) {
    for (const t of humanized.ai_tools.tools) {
      if (t.description && t.description.length >= MIN_LENGTH) {
        t.description = await humanizeText(t.description)
      }
    }
  }
  if (humanized.faqs?.faqs_list) {
    for (const faq of humanized.faqs.faqs_list) {
      if (faq.answer && faq.answer.length >= MIN_LENGTH) {
        faq.answer = await humanizeText(faq.answer)
      }
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
