import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Template 4 - HTML Generator',
  description: 'Template 4 - HTML Generator',
}

export default function Template4Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

