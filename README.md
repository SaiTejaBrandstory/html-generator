# HTML Generator

A Next.js application for generating SEO-optimized HTML pages using OpenAI's GPT models.

## Features

- Generate complete HTML pages based on user input
- SEO-optimized content with Flesch Kincaid readability score (60-70)
- Surfer SEO score optimization (90+)
- Template-based page generation
- Download generated HTML files

## Getting Started

### Prerequisites

- Node.js 18+ installed
- OpenAI API key

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory:
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

You can get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Navigate to the homepage
2. Click "Generate" button on the template card
3. Enter your content/topic in the textarea
4. Click "Generate" to create the HTML page
5. The generated HTML file will be automatically downloaded

## Project Structure

- `app/page.tsx` - Homepage with template cards
- `app/template/geo/page.tsx` - View template page
- `app/template/geo/generate/page.tsx` - Generate page with input form
- `app/api/generate/route.ts` - API route for content generation

## Environment Variables

Create a `.env.local` file with:
```
OPENAI_API_KEY=your_openai_api_key_here
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
