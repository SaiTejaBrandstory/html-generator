# Vercel Deployment Guide

## Pre-Deployment Checklist

✅ **.gitignore is properly configured:**
- `.env*.local` files are ignored
- `node_modules/` is ignored
- `.next/` build folder is ignored
- `.vercel/` folder is ignored

## Deployment Steps

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings

### 3. Add Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

**Add:**
- **Key:** `OPENAI_API_KEY`
- **Value:** Your OpenAI API key (starts with `sk-...`)
- **Environment:** Production, Preview, Development (select all)

### 4. Deploy

Click "Deploy" - Vercel will:
- Install dependencies (`npm install`)
- Build the project (`npm run build`)
- Deploy to production

## Verification

After deployment, test the generate endpoint:
- Visit: `https://your-project.vercel.app/template/geo/generate`
- Enter content and click "Generate"
- Should download a ZIP file with HTML and assets

## Important Notes

✅ **Environment Variables:**
- Vercel automatically makes `process.env.OPENAI_API_KEY` available
- No need to create `.env` files in production
- Environment variables are encrypted and secure

✅ **API Route:**
- `/app/api/generate/route.ts` will work automatically
- Vercel handles Next.js API routes natively
- No additional configuration needed

✅ **File System:**
- `public/assets/` folder will be served statically
- ZIP file generation uses Node.js `fs` which works on Vercel
- All assets will be included in the ZIP download

## Troubleshooting

If deployment fails:
1. Check build logs in Vercel dashboard
2. Verify `OPENAI_API_KEY` is set correctly
3. Ensure all dependencies are in `package.json`
4. Check that Node.js version is compatible (Vercel uses Node 18+ by default)

