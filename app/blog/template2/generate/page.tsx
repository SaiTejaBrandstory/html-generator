'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function GenerateBlogPage() {
  const [content, setContent] = useState('')
  const [wordCount, setWordCount] = useState('3000')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [wordCountError, setWordCountError] = useState('')
  const router = useRouter()

  const handleGenerate = async () => {
    if (!content.trim()) {
      setError('Please enter some content')
      return
    }

    // Validate word count
    const wordCountNum = parseInt(wordCount) || 3000
    if (wordCountNum < 500 || wordCountNum > 4000) {
      setWordCountError('Word count must be between 500 and 4,000')
      return
    }

    setIsGenerating(true)
    setError('')
    setWordCountError('')

    try {
      const response = await fetch('/api/generate-blog-template2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userInput: content,
          wordCount: Math.max(500, Math.min(4000, parseInt(wordCount) || 3000))
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate content')
      }

      // Get the HTML file as a blob
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      
      // Create a temporary anchor element and trigger download
      const a = document.createElement('a')
      a.href = url
      a.download = `generated-blog-${Date.now()}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      // Show success message
      alert('Blog HTML file generated and downloaded successfully!')
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
                Blog Template 2 Generator
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
            Generate Blog Content
          </h2>
          
          <div className="mb-6">
            <label 
              htmlFor="content-input" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Enter blog topic, keywords, or description
            </label>
            <textarea
              id="content-input"
              value={content}
              onChange={(e) => {
                setContent(e.target.value)
                setError('')
              }}
              placeholder="Enter your blog topic here... (e.g., 'The Future of Web Design in 2025', 'Digital Marketing Strategies', etc.)"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
              rows={10}
              disabled={isGenerating}
            />
            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>

          <div className="mb-6">
            <label 
              htmlFor="word-count-input" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Target Word Count
            </label>
            <input
              id="word-count-input"
              type="number"
              value={wordCount}
              onChange={(e) => {
                const value = e.target.value
                // Allow any input while typing (including empty or partial numbers)
                setWordCount(value)
                setWordCountError('')
                setError('')
              }}
              onBlur={(e) => {
                // Validate on blur
                const value = parseInt(e.target.value) || 0
                if (value < 500 || value > 4000) {
                  setWordCountError('Word count must be between 500 and 4,000')
                } else {
                  setWordCountError('')
                }
              }}
              placeholder="3000"
              min="500"
              max="4000"
              step="100"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                wordCountError 
                  ? 'border-red-500 dark:border-red-500' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              disabled={isGenerating}
            />
            {wordCountError ? (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{wordCountError}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Enter a word count between 500 and 4,000 words (recommended: 1,500-4,000 words)
              </p>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !content.trim()}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              {isGenerating ? 'Generating...' : 'Generate Blog'}
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

