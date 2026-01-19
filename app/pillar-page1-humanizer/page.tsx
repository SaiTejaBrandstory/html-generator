'use client'

import { useEffect } from 'react'

export default function PillarPage1HumanizerPreview() {
  useEffect(() => {
    document.title = 'Pillar Page 1 - Humanizer'
  }, [])

  return (
    <div style={{ width: '100%', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <iframe
        src="/pillar-page/pillar-page1.html"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block'
        }}
        title="Pillar Page 1 - Humanizer Preview"
      />
    </div>
  )
}
