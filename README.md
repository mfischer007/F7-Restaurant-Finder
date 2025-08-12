# F7LTD Restaurant Aggregator – Backend (TypeScript)

API-first, ToS-compliant aggregator for U.S. restaurants by ZIP.

## Quick Start
1. Copy `.env.development.local.example` to `.env.development.local` and fill placeholders.
2. `npm i`
3. `npm run db:push`
4. `npm run dev`
5. Swagger: `http://localhost:8080/api/docs` (use `x-api-key` header).

## Deploy to Render
- Edit nothing. Push to GitHub. Use `render.yaml` Blueprint.
- Set env vars in Render (keys redacted in `.env.production.example`).

## Squarespace Iframe
```
<iframe src="https://YOUR-API-HOST/ui/ui.html?zip=44113&apiBase=/api&key=PUBLIC_KEY" width="100%" height="900" style="border:0"></iframe>
```
