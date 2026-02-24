'use client'

import { useEffect } from 'react'

export default function Template9() {
  useEffect(() => {
    document.title = 'Template 9 - Interior Design Services'
  }, [])

  return (
    <div style={{ width: '100%', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <iframe
        src="/template9.html"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block'
        }}
        title="Template 9 - Interior Design Services Preview"
      />
    </div>
  )
}
