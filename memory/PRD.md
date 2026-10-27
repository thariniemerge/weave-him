# Weave Him · Bloom Edition — PRD

## Original problem statement
Mobile-first promo fan app (inspired by The Wicker Man, Regency/Bridgerton tone). The user answers 7 strands, watches a basketmaker weave a wicker husband, meets him (1800s name + 5 vows), then shares a 1080×1920 story card or tells a real person they're one of his strands. The full brief, storyboard and share-card template are in /app/scripts (storyboard.pdf, share-card-template.html).

## User choices
- Vows written by Claude Sonnet 5.5 through the Emergent LLM key, with an 8s timeout and template fallback.
- SITE_URL is one config value in `frontend/src/content.js`. It defaults to window.location.host (no https/www).
- All copy is in `frontend/src/content.js`. Backend vow templates and the prompt are in `backend/content.py`.

## Architecture
- Frontend: React + Tailwind + framer-motion + html-to-image. Fonts are self-hosted in /public/fonts. Storyboard vector art was extracted from the PDF into /public/art (script: /app/scripts/extract_art.py). The user's assets are in /public/assets.
- Backend: FastAPI + MongoDB, with collections `husbands` and `cards` (PNG + OG JPEG).
- Endpoints: GET /api/stats, POST /api/husbands, GET /api/husbands/{id}, POST /api/husbands/{id}/card, GET /api/husbands/{id}/card.png, GET /api/husbands/{id}/og.jpg, GET /api/share/{id} (an OG meta page that redirects to /h/{id}).

## Implemented (2026-06)
- All 7 screens plus /h/{id}. Answers persist in sessionStorage. Live counter on the welcome screen. How-it-works sheet.
- Weaving animation in the hoop and loom, with skip. Reloading does not create a duplicate husband.
- Meet screen with the band text, ribbon, vows card and wax seal. Tell screen with the letter preview, Web Share/sms/WhatsApp fallback and copy link.
- Share card copied exactly from the template at 1080×1920 with pixelRatio 1. It waits for fonts and images, and long text auto-shrinks to fit. Web Share with files, or download + copy link + toast. The card is uploaded for OG previews.

## Backlog
- P1: Server-side rendering of the OG card, so previews exist even if the creator leaves the page before the card finishes rendering.
- P2: Rate limiting on POST /api/husbands. Option to make share links point to /h/{id} directly once a custom domain with SSR or edge meta is set.
