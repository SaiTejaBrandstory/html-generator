'use client'

import { useEffect } from 'react'

export default function BrandstoryPillarPageHumanizerPreview() {
  useEffect(() => {
    document.title = 'Brandstory Pillar Page (Humanizer)'
  }, [])

  return (
    <div style={{ width: '100%', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <iframe
        src="/pillar-page/brandstory-pillar-page.html"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block'
        }}
        title="Brandstory Pillar Page (Humanizer) Preview"
      />
    </div>
  )
}
