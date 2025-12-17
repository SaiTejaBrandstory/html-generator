import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Template 3 - HTML Generator',
  description: 'Template 3 - HTML Generator',
}

export default function Template3Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

