import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Template 8 - HTML Generator',
  description: 'Template 8 - HTML Generator',
}

export default function Template8Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

