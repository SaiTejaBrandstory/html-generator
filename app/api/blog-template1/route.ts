import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'blog-page1')
    const htmlContent = fs.readFileSync(filePath, 'utf-8')
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
      },
    })
  } catch (error) {
    console.error('Error reading blog-page1:', error)
    return new NextResponse('Error loading blog template', { status: 500 })
  }
}

