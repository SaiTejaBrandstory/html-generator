import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GEO Service Template - HTML Generator',
  description: 'Generative Engine Optimization Services Template',
}

export default function GeoTemplateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

