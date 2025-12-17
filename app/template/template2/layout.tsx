import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Template 2 - HTML Generator',
  description: 'Template 2 - HTML Generator',
}

export default function Template2Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

