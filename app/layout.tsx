import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HTML Generator | AI-Powered HTML Templates & Landing Pages',
  description: 'Generate custom HTML pages, landing pages, and pillar content with AI. Choose from premium templates and create SEO-ready, professional web pages in minutes.',
  icons: {
    icon: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}


