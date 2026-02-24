'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function GenerateTemplate2() {
  const [content, setContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isHumanizing, setIsHumanizing] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleGenerate = async (humanize = false) => {
    if (!content.trim()) {
      setError('Please enter some content')
      return
    }

    if (humanize) {
      setIsHumanizing(true)
    } else {
      setIsGenerating(true)
    }
    setError('')

    try {
      const endpoint = humanize ? '/api/generate-template2-humanizer' : '/api/generate-template2'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userInput: content }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate content')
      }

      // Get the ZIP file as a blob
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      
      // Create a temporary anchor element and trigger download
      const a = document.createElement('a')
      a.href = url
      a.download = `generated-template2-${Date.now()}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      // Show success message
      alert(humanize ? 'HTML file with humanized content and assets generated and downloaded successfully!' : 'HTML file with assets generated and downloaded successfully!')
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating the content')
      console.error('Generation error:', err)
    } finally {
      if (humanize) {
        setIsHumanizing(false)
      } else {
        setIsGenerating(false)
      }
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-900 shadow-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Template 2 Generator
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
            Generate Template 2 Content
          </h2>
          
          <div className="mb-6">
            <label 
              htmlFor="content-input" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Enter the content/topic
            </label>
            <textarea
              id="content-input"
              value={content}
              onChange={(e) => {
                setContent(e.target.value)
                setError('')
              }}
              placeholder="Enter your content here... (e.g., 'GEO services in Bangalore', 'PPC management services', etc.)"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none"
              rows={10}
              disabled={isGenerating}
            />
            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>

          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => handleGenerate(false)}
              disabled={isGenerating || isHumanizing || !content.trim()}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              {isGenerating ? 'Generating...' : 'Generate'}
            </button>
            <button
              onClick={() => handleGenerate(true)}
              disabled={isGenerating || isHumanizing || !content.trim()}
              className="px-6 py-3 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              {isHumanizing ? 'Generating & Humanizing...' : 'Generate + Humanize'}
            </button>
            <button
              onClick={() => router.push('/')}
              disabled={isGenerating || isHumanizing}
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

