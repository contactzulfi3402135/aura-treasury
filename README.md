# AURA Treasury

Vite + React + TypeScript institutional treasury experience, prepared for Vercel deployment.

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

Vercel is configured to run `npm run build` and publish `dist/`. No environment variables are required.

## Deploy with Vercel CLI

```bash
npx vercel
npx vercel --prod
```

The deployment includes the six optimized image assets in `public/assets/images/` and the SPA fallback configured in `vercel.json`.
