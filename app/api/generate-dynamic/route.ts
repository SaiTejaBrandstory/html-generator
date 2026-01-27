import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import JSZip from 'jszip'
import { load } from 'cheerio'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

function containsArmenian(text: string) {
  return /[\u0530-\u058F]/.test(text)
}

function nonAsciiRatio(text: string) {
  if (!text) return 0
  const chars = Array.from(text)
  const nonAscii = chars.filter((c) => c.charCodeAt(0) > 127).length
  return chars.length ? nonAscii / chars.length : 0
}

function isBadHumanizedOutput(original: string, output: string) {
  const o = (original || '').trim()
  const out = (output || '').trim()
  if (!out) return true

  // If original is mostly ASCII but output contains Armenian or lots of non-ASCII → reject
  const origNonAscii = nonAsciiRatio(o)
  const outNonAscii = nonAsciiRatio(out)
  if (origNonAscii < 0.05 && (containsArmenian(out) || outNonAscii > 0.25)) return true

  // If output length is wildly different, it's often junk
  if (o.length >= 60) {
    if (out.length < o.length * 0.5) return true
    if (out.length > o.length * 2.5) return true
  }

  // If output contains too many weird symbols compared to letters, reject
  const letters = (out.match(/[A-Za-z]/g) || []).length
  const symbols = (out.match(/[^A-Za-z0-9\s.,'"!?():;\-]/g) || []).length
  if (letters > 0 && symbols / letters > 0.25) return true

  return false
}

// Humanizer (Rephrasy) — mirrors the pillar-page1-humanizer approach
async function humanizeText(text: string, delayMs: number = 50): Promise<string> {
  if (!text || !text.trim()) return text

  if (delayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, delayMs))
  }

  const apiKey = process.env.REPHRASY_API_KEY
  if (!apiKey) return text

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

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

    if (!response.ok) return text
    const data = await response.json().catch(() => null)
    const out = (data && typeof data.output === 'string' && data.output.trim()) ? data.output : text
    return isBadHumanizedOutput(text, out) ? text : out
  } catch {
    return text
  }
}

function shouldHumanize(hint: string, value: string): boolean {
  const v = value.trim()
  if (v.length < 40) return false

  const h = (hint || '').toLowerCase()

  // Skip short UI labels / headings / buttons / nav
  if (h.includes('<h1') || h.includes('<h2') || h.includes('<h3') || h.includes('<button') || h.includes('<nav')) return false
  if (h.includes('<title')) return false

  // Prefer paragraph + list content
  if (h.includes('<p') || h.includes('<li')) return true

  // Otherwise, long-ish text nodes are ok
  return v.length >= 120
}

function pickHtmlEntry(zip: JSZip): string | null {
  if (zip.file('index.html')) return 'index.html'

  // Prefer root-level html files first
  const allHtml = Object.keys(zip.files).filter((p) => p.toLowerCase().endsWith('.html'))
  const rootHtml = allHtml.filter((p) => !p.includes('/'))
  if (rootHtml.length > 0) return rootHtml[0]

  return allHtml.length > 0 ? allHtml[0] : null
}

type RewriteGroup = {
  id: string
  original: string
  hint: string
  applyAll: (replacement: string) => void
}

function normalizeTextKey(text: string) {
  return text.replace(/\s+/g, ' ').trim()
}

function inferSectionTypeFromNode(node: any): string {
  // Heuristic: walk up a few ancestors and infer section intent from id/class/tag.
  // This helps the model write correct conversion copy without copying the old topic.
  const patterns: Array<[string, RegExp]> = [
    ['hero', /(hero|banner|masthead|jumbotron|above-the-fold|intro)/i],
    ['sub-hero', /(subhero|sub-hero|secondary-hero)/i],
    ['features', /(features?|feature-list|capabilit(y|ies))/i],
    ['benefits', /(benefits?|outcomes?|results?|why-us|why-choose)/i],
    ['testimonials', /(testimonials?|reviews?|ratings?|social-proof|trust)/i],
    ['pricing', /(pricing|plans?|packages?)/i],
    ['faq', /(faq|questions|accordion)/i],
    ['cta', /(cta|call-to-action|get-started|book|schedule|contact|enquir|inquir|quote|demo|signup|register)/i],
  ]

  let cur: any = node
  for (let depth = 0; cur && depth < 7; depth++) {
    if (cur.type === 'tag') {
      const tag = String(cur.name || '').toLowerCase()
      const id = typeof cur.attribs?.id === 'string' ? cur.attribs.id : ''
      const cls = typeof cur.attribs?.class === 'string' ? cur.attribs.class : ''
      const blob = `${tag} ${id} ${cls}`
      for (const [label, re] of patterns) {
        if (re.test(blob)) return label
      }
      if (tag === 'section') {
        // If we hit a section and still can't classify, stop early.
        // (Avoid walking into huge parent wrappers like body/html.)
        break
      }
    }
    cur = cur.parent
  }
  return ''
}

function elementHint(el: any) {
  const tag = String(el?.name || '').toLowerCase()
  if (!tag) return ''
  const id = el?.attribs?.id ? `#${el.attribs.id}` : ''
  const cls =
    el?.attribs?.class && typeof el.attribs.class === 'string'
      ? `.${el.attribs.class.split(/\s+/).filter(Boolean).slice(0, 2).join('.')}`
      : ''
  const sectionType = inferSectionTypeFromNode(el)
  return sectionType ? `<${tag}${id}${cls}> [section:${sectionType}]` : `<${tag}${id}${cls}>`
}

function hasClassOrIdMatch(node: any, re: RegExp): boolean {
  const id = typeof node?.attribs?.id === 'string' ? node.attribs.id : ''
  const cls = typeof node?.attribs?.class === 'string' ? node.attribs.class : ''
  return re.test(id) || re.test(cls)
}

function isInHeaderOrFooter(node: any): boolean {
  // Exclude edits inside semantic header/footer + common ARIA landmarks
  let cur: any = node
  while (cur) {
    if (cur.type === 'tag') {
      const tag = String(cur.name || '').toLowerCase()
      if (tag === 'header' || tag === 'footer') return true
      const role = typeof cur.attribs?.role === 'string' ? cur.attribs.role.toLowerCase() : ''
      if (role === 'banner' || role === 'contentinfo') return true
    }
    cur = cur.parent
  }
  return false
}

function getTextFromNode(node: any): string {
  if (!node) return ''
  if (node.type === 'text') return typeof node.data === 'string' ? node.data : ''
  if (Array.isArray(node.children)) return node.children.map(getTextFromNode).join('')
  return ''
}

function isCtaLinkCandidate(node: any, hrefRaw: string): boolean {
  const href = hrefRaw.toLowerCase()
  const looksLikeContact =
    /(\/|#)?contact(-us)?\b/.test(href) ||
    href.includes('get-in-touch') ||
    href.includes('talk-to') ||
    href.includes('book') ||
    href.includes('consult') ||
    href.includes('enquir') ||
    href.includes('inquir') ||
    href.includes('request') ||
    href.includes('quote') ||
    href.includes('demo') ||
    href.includes('schedule')

  if (looksLikeContact) return true

  // Only upgrade placeholder links when the element clearly looks like a CTA
  const isPlaceholder =
    hrefRaw.trim() === '' ||
    href === '#' ||
    href.startsWith('javascript:') ||
    href === 'javascript:void(0)' ||
    href === 'javascript:void(0);'

  if (!isPlaceholder) return false

  const looksLikeCtaClass = hasClassOrIdMatch(node, /(cta|btn|button|primary|contact|book|quote|demo|schedule)/i)
  const text = getTextFromNode(node).toLowerCase()
  const looksLikeCtaText = /(contact|get in touch|book|call|enquir|inquir|quote|demo|schedule|talk)/i.test(text)
  return looksLikeCtaClass || looksLikeCtaText
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key is not configured' }, { status: 500 })
    }

    const form = await request.formData()
    const mode = String(form.get('mode') || 'zip')
    const userInput = String(form.get('userInput') || '')
    const companyName = String(form.get('companyName') || '').trim()
    const ctaLink = String(form.get('ctaLink') || '').trim()
    const tone = String(form.get('tone') || '').trim()
    const location = String(form.get('location') || '').trim()
    const humanize = String(form.get('humanize') || 'false') === 'true'

    if (!userInput.trim()) {
      return NextResponse.json({ error: 'Content input is required' }, { status: 400 })
    }

    let zip: JSZip | null = null
    let htmlPath: string | null = null
    let templateHtml = ''

    const templateZip = form.get('templateZip')
    const templateHtmlField = form.get('templateHtml')

    if (mode === 'zip') {
      if (!(templateZip instanceof File)) {
        return NextResponse.json({ error: 'templateZip is required for zip mode' }, { status: 400 })
      }

      const zipBytes = new Uint8Array(await templateZip.arrayBuffer())
      zip = await JSZip.loadAsync(zipBytes)
      htmlPath = pickHtmlEntry(zip)
      if (!htmlPath) {
        return NextResponse.json({ error: 'No .html file found inside the ZIP' }, { status: 400 })
      }
      const htmlFile = zip.file(htmlPath)
      if (!htmlFile) {
        return NextResponse.json({ error: 'Failed to read HTML file from ZIP' }, { status: 400 })
      }
      templateHtml = await htmlFile.async('string')
    } else if (mode === 'html') {
      templateHtml = String(templateHtmlField || '')
      if (!templateHtml.trim()) {
        return NextResponse.json({ error: 'templateHtml is required for html mode' }, { status: 400 })
      }
      zip = new JSZip()
      htmlPath = 'index.html'
    } else {
      return NextResponse.json({ error: 'Invalid mode. Use "zip" or "html".' }, { status: 400 })
    }

    // Safety limit to reduce prompt blowups
    if (templateHtml.length > 220_000) {
      return NextResponse.json(
        { error: 'Template HTML is too large. Please use a smaller template or remove unused content.' },
        { status: 413 }
      )
    }

    // Capture doctype (cheerio doesn't reliably preserve it)
    const doctypeMatch = templateHtml.match(/<!doctype[^>]*>/i)
    const doctype = doctypeMatch?.[0] || ''

    // Parse HTML and collect ALL user-facing text + common content attributes
    const $ = load(templateHtml)

    const EXCLUDED_TAGS = new Set(['script', 'style', 'noscript'])
    const ATTRS_TO_REWRITE = ['alt', 'aria-label', 'placeholder', 'title']

    // Groups keyed by stable "kind|attr|original"
    const groupsByKey = new Map<string, { original: string; hint: string; appliers: Array<(v: string) => void> }>()

    const ALLOW_EMPTY_ATTRS = new Set(['meta:description'])

    function addGroup(kind: 'text' | 'attr', attr: string | null, original: string, hint: string, apply: (v: string) => void) {
      const normalized = original === '' ? '' : normalizeTextKey(original)
      if (!normalized && !(kind === 'attr' && attr && ALLOW_EMPTY_ATTRS.has(attr))) return
      // Key should NOT be only the text; otherwise identical placeholders in different places
      // get merged and rewritten with the wrong context. Use tag-type from hint to separate.
      const tagFromHint = (hint?.match(/^<([a-z0-9]+)/i)?.[1] || '').toLowerCase()
      const key = `${kind}|${attr || ''}|${tagFromHint}|${normalized}`
      const existing = groupsByKey.get(key)
      if (existing) {
        existing.appliers.push(apply)
        // keep the first hint (usually enough)
        return
      }
      groupsByKey.set(key, { original: normalized, hint: hint || '', appliers: [apply] })
    }

    // Title
    const titleText = $('title').first().text()
    if (titleText && titleText.trim()) {
      addGroup('text', 'title', titleText, '<title>', (v) => {
        $('title').first().text(v)
      })
    }

    // Meta description + keywords (create description if missing)
    const metaDesc = $('meta[name="description"]').first()
    if (metaDesc.length > 0) {
      const content = metaDesc.attr('content') || ''
      if (content.trim()) {
        addGroup('attr', 'meta:description', content, '<meta name="description">', (v) => {
          metaDesc.attr('content', v)
        })
      } else {
        // empty, still ask model to fill it
        addGroup('attr', 'meta:description', '', '<meta name="description">', (v) => {
          metaDesc.attr('content', v)
        })
      }
    } else {
      // create one after we get a value
      addGroup('attr', 'meta:description', '', '<meta name="description">', (v) => {
        const head = $('head').first()
        if (head.length > 0) {
          head.append(`<meta name="description" content="${v.replace(/"/g, '&quot;')}">`)
        }
      })
    }

    const metaKeywords = $('meta[name="keywords"]').first()
    if (metaKeywords.length > 0) {
      const content = metaKeywords.attr('content') || ''
      addGroup('attr', 'meta:keywords', content, '<meta name="keywords">', (v) => {
        metaKeywords.attr('content', v)
      })
    }

    // Traverse body for text nodes + selected attributes
    function traverse(node: any) {
      if (!node) return
      if (isInHeaderOrFooter(node)) return

      if (node.type === 'tag') {
        const tag = String(node.name || '').toLowerCase()
        if (EXCLUDED_TAGS.has(tag)) return

        // Optional: replace ONLY CTA/contact-like links (not every <a>)
        if (ctaLink && tag === 'a' && node.attribs && typeof node.attribs.href === 'string') {
          const hrefRaw = node.attribs.href
          if (isCtaLinkCandidate(node, hrefRaw)) node.attribs.href = ctaLink
        }

        // rewrite common attributes on the element
        if (node.attribs) {
          for (const attr of ATTRS_TO_REWRITE) {
            const val = node.attribs[attr]
            if (typeof val === 'string' && val.trim()) {
              const hint = elementHint(node)
              addGroup('attr', attr, val, hint, (v) => {
                ;(node.attribs as any)[attr] = v
              })
            }
          }
        }

        if (Array.isArray(node.children)) {
          for (const child of node.children) traverse(child)
        }
        return
      }

      if (node.type === 'text') {
        const text = typeof node.data === 'string' ? node.data : ''
        if (!text || !text.trim()) return
        const parentTag = String(node.parent?.name || '').toLowerCase()
        if (EXCLUDED_TAGS.has(parentTag)) return
        if (isInHeaderOrFooter(node.parent)) return
        const hint = elementHint(node.parent)
        addGroup('text', null, text, hint, (v) => {
          node.data = v
        })
      }
    }

    const bodyEl = $('body').get(0)
    if (bodyEl) traverse(bodyEl)

    // Turn groups into tasks for the model
    const rawGroups = Array.from(groupsByKey.values())

    // If there is literally nothing to rewrite, just package original
    if (rawGroups.length === 0) {
      zip.file(htmlPath, templateHtml)
      const zipOut = await zip.generateAsync({ type: 'arraybuffer', compression: 'DEFLATE' })
      return new NextResponse(zipOut, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="generated-template-${Date.now()}.zip"`,
        },
      })
    }

    const MAX_GROUPS = 2500
    if (rawGroups.length > MAX_GROUPS) {
      return NextResponse.json(
        {
          error: 'Template has too many text fields to rewrite in one run.',
          message: `Found ${rawGroups.length} unique text/attribute values. Please simplify the template or remove repeated boilerplate.`,
        },
        { status: 413 }
      )
    }

    const rewriteGroups: RewriteGroup[] = rawGroups.map((g, idx) => {
      const id = `t${idx + 1}`
      return {
        id,
        original: g.original,
        hint: g.hint,
        applyAll: (replacement) => {
          for (const apply of g.appliers) apply(replacement)
        },
      }
    })

    const fallbackMetaDescription = (brief: string) => {
      const oneLine = brief.replace(/\s+/g, ' ').trim()
      if (!oneLine) return companyName ? `${companyName} | Contact us` : 'Contact us'
      return oneLine.length > 155 ? oneLine.slice(0, 155).replace(/\s+\S*$/, '') : oneLine
    }

    // Humanization guardrails
    const MAX_HUMANIZE_ITEMS = 80
    let humanizedCount = 0

    function isLongRewrite(hint: string, text: string) {
      const h = (hint || '').toLowerCase()
      if (h.includes('<meta name="description"')) return false
      if (h.includes('<p') || h.includes('<li')) return true
      return (text || '').length > 80
    }

    const buildPrompt = (
      items: Array<{ id: string; hint: string; text: string; targetChars: number }>
    ) => `You are an expert SEO content writer and UX copy specialist working inside a live landing page codebase.

Your task is to generate replacement content ONLY for the provided sections, strictly following the existing structure, layout, and design constraints.

INPUTS YOU WILL RECEIVE:
- Primary Keyword / Topic
- Secondary Keywords (if any)
- Section-wise content blocks (headings, subheadings, paragraphs, CTAs, bullets) as items[]
- Contextual brief describing the product/service
- Existing copy for each section (as text; for LENGTH + TONE only)
- Optional character constraints (targetChars)

CORE RULES (NON-NEGOTIABLE):

1. LIKE-FOR-LIKE CONTENT REPLACEMENT
- Replace text only.
- Do NOT add new sections, elements, lines, or markup.
- Do NOT exceed the approximate length of the original copy.
- Maintain heading hierarchy, sentence count, and visual rhythm.
- For each item, aim within ±15% of targetChars.

2. DESIGN & CODE SAFETY
- Assume the UI is fixed and fragile.
- Do NOT increase paragraph length beyond what would cause layout overflow.
- Respect button text length, hero headline width, card content balance, and grid symmetry.
- Never suggest design or code changes.

3. SECTION INTELLIGENCE
Use the section context embedded in "hint" like [section:hero], [section:features], [section:cta], etc.
- Hero: clarity, value proposition, keyword prominence
- Social proof/testimonials: trust, authority
- Features: scannable benefits
- Use cases: relevance
- CTA: action-driven, concise

4. SEO & SURFER OPTIMIZATION
- Use the primary keyword and close variants frequently and naturally across the page.
- Distribute keyword usage across headings, body copy, and CTAs.
- Optimize for a Surfer SEO score of 90+ WITHOUT keyword stuffing.
- Maintain semantic relevance and topical depth.
- Avoid repetitive phrasing; use contextual variations.
- IMPORTANT: Do not force the keyword into every single item. Spread it naturally.

5. READABILITY CONSTRAINT
- Target Flesch-Kincaid Reading Ease: 60–70.
- Use short sentences.
- Prefer simple words.
- Avoid jargon unless already present in the original style.
- Write for clarity, not cleverness.

6. TONE & CONSISTENCY
- Match the tone of the existing content (formal, conversational, premium, technical, etc.).
- Ensure consistency across all sections.
- Be conversion-focused but not salesy.

7. CRITICAL TOPIC CONTROL
- The provided "text" is old template copy. Do NOT follow its topic/meaning.
- Use it ONLY for length/rhythm and to infer tone. Generate the subject matter from the brief + keywords.

8. OUTPUT FORMAT
- Return ONLY a JSON object mapping id -> rewritten string.
- Preserve the item ids exactly.
- No markdown. No explanations. No extra keys.
- Output English only.

inputs:
${JSON.stringify({
  primaryKeywordOrTopic: userInput,
  secondaryKeywords: '',
  brief: userInput,
  companyName,
  ctaLink,
  tone,
  location,
})}

items (id, hint, targetChars, text):
${JSON.stringify(items)}

Return JSON only:
{
  "t1": "replacement",
  "t2": "replacement"
}`

    async function fetchMappingForBatch(
      batch: RewriteGroup[],
      maxTokens: number
    ): Promise<Record<string, unknown>> {
      const items = batch
        .map((t) => ({
          id: t.id,
          hint: t.hint || '',
          targetChars: Math.max(0, (t.original || '').length),
          text: t.original,
        }))
        .filter((x) => x.text.length > 0 || x.id)

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        // gpt-4o max output tokens: 16,384
        max_tokens: Math.min(16384, Math.max(800, maxTokens)),
        temperature: 0.4,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: 'Return ONLY valid JSON mapping ids to replacement strings. No markdown. No extra keys.',
          },
          { role: 'user', content: buildPrompt(items) },
        ],
      })

      const content = completion.choices[0]?.message?.content || ''
      try {
        return JSON.parse(content)
      } catch {
        throw new Error('Model returned invalid JSON for replacements.')
      }
    }

    async function applyBatch(batch: RewriteGroup[], maxTokens: number) {
      let mapping = await fetchMappingForBatch(batch, maxTokens)

      // Retry missing ids (common when output is truncated on big pages)
      for (let attempt = 0; attempt < 4; attempt++) {
        const missing = batch.filter((t) => typeof mapping[t.id] !== 'string')
        if (missing.length === 0) break

        // Retry smaller chunks with near-max output budget
        const retryTokens = Math.max(12000, maxTokens)
        const retryBatch = missing.length > 25 ? missing.slice(0, 25) : missing
        const retryMapping = await fetchMappingForBatch(retryBatch, retryTokens)
        mapping = { ...mapping, ...retryMapping }
      }

      for (const t of batch) {
        const v = mapping[t.id]
        if (typeof v === 'string') {
          const next = v.trim()
          if (next.length) {
            let out = next
            if (humanize && humanizedCount < MAX_HUMANIZE_ITEMS && shouldHumanize(t.hint, out)) {
              const humanized = await humanizeText(out, 50)
              // If humanizer returns junk, humanizeText already falls back.
              out = humanized
              humanizedCount++
            }
            t.applyAll(out)
          } else if (t.original.length) {
            t.applyAll(t.original)
          } else {
            t.applyAll(fallbackMetaDescription(userInput))
          }
        } else {
          t.applyAll(t.original.length ? t.original : fallbackMetaDescription(userInput))
        }
      }
    }

    // Split into long/short groups so large pages don't truncate JSON responses
    const longGroups = rewriteGroups.filter((t) => isLongRewrite(t.hint, t.original))
    const shortGroups = rewriteGroups.filter((t) => !isLongRewrite(t.hint, t.original))

    const BATCH_LONG = 30
    const BATCH_SHORT = 120

    for (let i = 0; i < longGroups.length; i += BATCH_LONG) {
      await applyBatch(longGroups.slice(i, i + BATCH_LONG), 14000)
    }

    for (let i = 0; i < shortGroups.length; i += BATCH_SHORT) {
      await applyBatch(shortGroups.slice(i, i + BATCH_SHORT), 6000)
    }

    let generatedHtml = $.html()
    if (doctype && !/^<!doctype/i.test(generatedHtml)) {
      generatedHtml = `${doctype}\n${generatedHtml}`
    }

    if (!zip || !htmlPath) {
      throw new Error('Internal error: ZIP not initialized.')
    }

    // Replace or create the HTML entry
    zip.file(htmlPath, generatedHtml)

    const zipOut = await zip.generateAsync({ type: 'arraybuffer', compression: 'DEFLATE' })
    return new NextResponse(zipOut, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="generated-template-${Date.now()}.zip"`,
      },
    })
  } catch (error: any) {
    console.error('Dynamic generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate', message: error?.message || 'Unknown error occurred' },
      { status: 500 }
    )
  }
}

