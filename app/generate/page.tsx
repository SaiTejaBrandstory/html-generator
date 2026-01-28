'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

type Mode = 'zip' | 'html'
type Action = 'generate' | 'humanise'

export default function GenerateDynamic() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('zip')
  const [templateZip, setTemplateZip] = useState<File | null>(null)
  const [templateHtml, setTemplateHtml] = useState('')
  const [userInput, setUserInput] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [ctaLink, setCtaLink] = useState('')
  const [tone, setTone] = useState('')
  const [location, setLocation] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeAction, setActiveAction] = useState<Action | null>(null)
  const [error, setError] = useState<string>('')

  const canGenerate = useMemo(() => {
    if (!userInput.trim()) return false
    if (mode === 'zip') return !!templateZip
    return !!templateHtml.trim()
  }, [mode, templateHtml, templateZip, userInput])

  const handleGenerate = async (humanize: boolean) => {
    setError('')

    if (!userInput.trim()) {
      setError('Please enter page content / topic.')
      return
    }

    if (mode === 'zip' && !templateZip) {
      setError('Please upload a template ZIP.')
      return
    }

    if (mode === 'html' && !templateHtml.trim()) {
      setError('Please paste your HTML template.')
      return
    }

    setActiveAction(humanize ? 'humanise' : 'generate')
    setIsGenerating(true)
    try {
      const form = new FormData()
      form.set('mode', mode)
      form.set('userInput', userInput)
      form.set('humanize', humanize ? 'true' : 'false')
      if (mode === 'zip' && templateZip) form.set('templateZip', templateZip)
      if (mode === 'html') form.set('templateHtml', templateHtml)
      if (companyName.trim()) form.set('companyName', companyName.trim())
      if (ctaLink.trim()) form.set('ctaLink', ctaLink.trim())
      if (tone.trim()) form.set('tone', tone.trim())
      if (location.trim()) form.set('location', location.trim())

      const res = await fetch('/api/generate-dynamic', {
        method: 'POST',
        body: form,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.message || data?.error || 'Failed to generate')
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `generated-template-${Date.now()}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      alert(humanize ? 'Humanized ZIP generated and downloaded successfully!' : 'ZIP generated and downloaded successfully!')
    } catch (e: any) {
      setError(e?.message || 'An error occurred while generating the ZIP.')
    } finally {
      setIsGenerating(false)
      setActiveAction(null)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-900 shadow-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Dynamic Generator
              </h1>
            </div>
            <button
              onClick={() => router.push('/')}
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Generate from your own template
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Upload a template ZIP (recommended) or paste a full HTML document. Then describe what the page should be about and download the generated ZIP.
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Template input
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode('zip')}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  mode === 'zip'
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600'
                }`}
              >
                Upload ZIP
              </button>
              <button
                type="button"
                onClick={() => setMode('html')}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  mode === 'html'
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600'
                }`}
              >
                Paste HTML
              </button>
            </div>
          </div>

          {mode === 'zip' ? (
            <div className="mb-6">
              <label
                htmlFor="template-zip"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Upload template ZIP
              </label>
              <input
                id="template-zip"
                type="file"
                accept=".zip"
                onChange={(e) => {
                  setTemplateZip(e.target.files?.[0] || null)
                  setError('')
                }}
                className="block w-full text-sm text-gray-700 dark:text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                disabled={isGenerating}
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                ZIP should contain an <code className="font-mono">index.html</code> (preferred). Assets will be kept as-is.
              </p>
            </div>
          ) : (
            <div className="mb-6">
              <label
                htmlFor="template-html"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Paste full HTML
              </label>
              <textarea
                id="template-html"
                value={templateHtml}
                onChange={(e) => {
                  setTemplateHtml(e.target.value)
                  setError('')
                }}
                placeholder="Paste a full HTML document here (starting with <!doctype html> or <html> ...)"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none font-mono text-xs"
                rows={12}
                disabled={isGenerating}
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                This mode returns a ZIP with only <code className="font-mono">index.html</code>.
              </p>
            </div>
          )}

          <div className="mb-6">
            <label
              htmlFor="content-input"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Page content / topic
            </label>
            <textarea
              id="content-input"
              value={userInput}
              onChange={(e) => {
                setUserInput(e.target.value)
                setError('')
              }}
              placeholder="Example: 'Landing page for a dental clinic in Bangalore. Services: implants, braces. Tone: friendly, trustworthy. Add strong CTAs, FAQs, and detailed benefit copy.'"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
              rows={6}
              disabled={isGenerating}
            />
            {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
          </div>

          <details className="mb-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20 p-4">
            <summary className="cursor-pointer select-none text-sm font-semibold text-gray-800 dark:text-gray-200">
              Optional fields (recommended)
            </summary>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="company-name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Company name
                </label>
                <input
                  id="company-name"
                  value={companyName}
                  onChange={(e) => {
                    setCompanyName(e.target.value)
                    setError('')
                  }}
                  placeholder="Example: BrandStory"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  disabled={isGenerating}
                />
              </div>

              <div>
                <label
                  htmlFor="cta-link"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Primary CTA link
                </label>
                <input
                  id="cta-link"
                  value={ctaLink}
                  onChange={(e) => {
                    setCtaLink(e.target.value)
                    setError('')
                  }}
                  placeholder="Example: https://example.com/contact"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  disabled={isGenerating}
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  If provided, the generator will also replace placeholder links like <code className="font-mono">#</code> / <code className="font-mono">javascript:</code> in CTA buttons.
                </p>
              </div>

              <div>
                <label
                  htmlFor="tone"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Tone / voice
                </label>
                <input
                  id="tone"
                  value={tone}
                  onChange={(e) => {
                    setTone(e.target.value)
                    setError('')
                  }}
                  placeholder="Example: confident, friendly, premium"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  disabled={isGenerating}
                />
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Location (optional)
                </label>
                <input
                  id="location"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value)
                    setError('')
                  }}
                  placeholder="Example: Bangalore"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  disabled={isGenerating}
                />
              </div>
            </div>
          </details>

          <div className="mb-3 text-xs text-gray-600 dark:text-gray-300">
            <strong>Generate</strong> rewrites your template text. <strong>Humanise</strong> rewrites + runs longer text through a humanizer (needs <code className="font-mono">REPHRASY_API_KEY</code>; may take longer).
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => handleGenerate(false)}
              disabled={isGenerating || !canGenerate}
              className="px-6 py-3 rounded-xl font-semibold text-white shadow-lg transition-all
              bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600
              hover:from-indigo-700 hover:via-purple-700 hover:to-fuchsia-700 hover:shadow-xl hover:scale-[1.01]
              focus:outline-none focus:ring-2 focus:ring-fuchsia-400/60 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900
              disabled:opacity-60 disabled:hover:scale-100 disabled:hover:shadow-lg disabled:cursor-not-allowed"
            >
              {isGenerating && activeAction === 'generate' ? 'Generating...' : 'Generate'}
            </button>
            <button
              onClick={() => handleGenerate(true)}
              disabled={isGenerating || !canGenerate}
              className="px-6 py-3 rounded-xl font-semibold text-white shadow-lg transition-all
              bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500
              hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 hover:shadow-xl hover:scale-[1.01]
              focus:outline-none focus:ring-2 focus:ring-cyan-400/60 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900
              disabled:opacity-60 disabled:hover:scale-100 disabled:hover:shadow-lg disabled:cursor-not-allowed"
            >
              {isGenerating && activeAction === 'humanise' ? 'Generating...' : 'Humanise'}
            </button>
            <button
              onClick={() => router.push('/')}
              disabled={isGenerating}
              className="px-6 py-3 rounded-xl font-semibold text-white shadow-lg transition-all
              bg-gradient-to-r from-slate-700 to-slate-900
              hover:from-slate-800 hover:to-slate-950 hover:shadow-xl hover:scale-[1.01]
              focus:outline-none focus:ring-2 focus:ring-slate-400/60 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900
              disabled:opacity-60 disabled:hover:scale-100 disabled:hover:shadow-lg disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

