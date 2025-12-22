import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Template 6 - HTML Generator',
  description: 'Template 6 - HTML Generator',
}

export default function Template6Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

