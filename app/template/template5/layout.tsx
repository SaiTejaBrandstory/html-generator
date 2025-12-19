import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Template 5 - HTML Generator',
  description: 'Template 5 - HTML Generator',
}

export default function Template5Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

