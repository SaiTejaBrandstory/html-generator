'use client'

import { useEffect } from 'react'

export default function RelgrowPillarPageHumanizerPreview() {
  useEffect(() => {
    document.title = 'Relgrow Pillar Page (Humanizer)'
  }, [])

  return (
    <div style={{ width: '100%', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <iframe
        src="/pillar-page/relgrow-pillar-page.html"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block'
        }}
        title="Relgrow Pillar Page (Humanizer) Preview"
      />
    </div>
  )
}
