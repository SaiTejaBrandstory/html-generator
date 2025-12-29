import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Template 7 - HTML Generator',
  description: 'Template 7 - HTML Generator',
}

export default function Template7Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

