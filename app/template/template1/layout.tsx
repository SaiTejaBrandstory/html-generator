import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Template 1 - HTML Generator',
  description: 'Template 1 - HTML Generator',
}

export default function Template1Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

