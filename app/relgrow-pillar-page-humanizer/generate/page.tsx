'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function GeneratePage() {
  const [content, setContent] = useState('')
  const [companyName, setCompanyName] = useState('Relgrow')
  const [ctaLink, setCtaLink] = useState('https://relgrow.com/contact-us/')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleGenerate = async () => {
    if (!content.trim()) {
      setError('Please enter some content')
      return
    }

    setIsGenerating(true)
    setError('')

    try {
      const response = await fetch('/api/generate-relgrow-pillar-page-humanizer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userInput: content,
          companyName: companyName.trim() || undefined,
          ctaLink: ctaLink.trim() || undefined,
        }),
      })

      if (!response.ok) {
        let errorMessage = 'Failed to generate content'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch (e) {
          // If response is not JSON (might be HTML error page), get text
          const text = await response.text()
          if (text.includes('<!DOCTYPE') || text.includes('<html')) {
            errorMessage = `Server error (${response.status}): The server returned an HTML error page. Please check the server logs.`
          } else {
            errorMessage = text || errorMessage
          }
        }
        throw new Error(errorMessage)
      }

      // Get the ZIP file as a blob
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      
      // Create a temporary anchor element and trigger download
      const a = document.createElement('a')
      a.href = url
      a.download = `relgrow-pillar-page-generated-${Date.now()}-humanizer.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      // Show success message
      alert('Relgrow pillar page HTML file with humanized content and assets generated and downloaded successfully!')
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating the content')
      console.error('Generation error:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-900 shadow-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                HTML Generator
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Generate Relgrow Pillar Page Content (Humanizer)
          </h2>
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Note:</strong> This generator will create AI content and then humanize it using advanced AI detection bypass technology. The process may take longer than the standard generator.
            </p>
          </div>
          
          <div className="mb-6">
            <label 
              htmlFor="content-input" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Enter the content <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content-input"
              value={content}
              onChange={(e) => {
                setContent(e.target.value)
                setError('')
              }}
              placeholder="Enter your content here... (e.g., 'real estate life cycle management in Bangalore', 'construction and project management', 'residential and commercial development', 'RERA compliant real estate services', 'land acquisition to facility management', etc.)"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
              rows={8}
              disabled={isGenerating}
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              This content will be used to generate all sections of the Relgrow pillar page. Use topics like real estate management, construction, residential/commercial development, RERA compliance, or facility management. Be specific about the topic.
            </p>
          </div>

          <div className="mb-6">
            <label 
              htmlFor="company-name-input" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Company Name <span className="text-gray-400 text-xs">(Optional)</span>
            </label>
            <input
              id="company-name-input"
              type="text"
              value={companyName}
              onChange={(e) => {
                setCompanyName(e.target.value)
                setError('')
              }}
              placeholder="e.g., Relgrow"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              disabled={isGenerating}
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Company name will be used in descriptions and benefits sections where appropriate.
            </p>
          </div>

          <div className="mb-6">
            <label 
              htmlFor="cta-link-input" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              CTA Link <span className="text-gray-400 text-xs">(Optional)</span>
            </label>
            <input
              id="cta-link-input"
              type="url"
              value={ctaLink}
              onChange={(e) => {
                setCtaLink(e.target.value)
                setError('')
              }}
              placeholder="e.g., https://relgrow.com/contact-us/"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              disabled={isGenerating}
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              This link will replace all CTA buttons and links throughout the page.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !content.trim()}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              {isGenerating ? 'Generating...' : 'Generate Pillar Page'}
            </button>
            <button
              onClick={() => router.push('/')}
              disabled={isGenerating}
              className="px-6 py-3 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
