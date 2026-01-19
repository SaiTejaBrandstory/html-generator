'use client'

import { useEffect } from 'react'

export default function PillarPage1Preview() {
  useEffect(() => {
    document.title = 'Pillar Page 1'
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
        title="Pillar Page 1 Preview"
      />
    </div>
  )
}
