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

## Implemented (2026-06)- All 7 screens plus /h/{id}. Answers persist in sessionStorage. Live counter on the welcome screen. How-it-works sheet.
- Weaving animation in the hoop and loom, with skip. Reloading does not create a duplicate husband.
- Meet screen with the band text, ribbon, vows card and wax seal. Tell screen with the letter preview, Web Share/sms/WhatsApp fallback and copy link.
- Share card copied exactly from the template at 1080×1920 with pixelRatio 1. It waits for fonts and images, and long text auto-shrinks to fit. Web Share with files, or download + copy link + toast. The card is uploaded for OG previews.

## Iteration 2 (2026-06)
- Each card is drawn on the server when he's created (Pillow over static layers from /app/scripts/build_card_layers.sh) and served as card.png, card.jpg (q88) and og.jpg. CARD_VERSION=3.
- Vow reweaving: up to 3 per husband, protected by an edit token. Share reveal overlay with Save / Share / Copy link. Card thumbnail on the meet screen.
- Web Audio sound effects and Welcome-only music (welcome-theme.ogg/.mp3), with a mute toggle. See /app/CREDITS.md.
- Band labels on SVG textPath that fit each band. Letter card: sign-off and optional his-name greeting. No em dashes anywhere. Favicons, page titles, Wicker credit line and fan disclaimer.
- The new oval-sky.webp shows the wicker husband. On preview hosts the card prints the site as "weavehim.[domain]".

## Iteration 3 (2026-06)
- Responsive layout: mobile under 768px, wider tablet column at 768-1023px, and a split desktop layout at 1024px and up (sticky art panel through PanelOrInline/PanelArt in Layout.jsx). On desktop the reveal puts its buttons beside the card.
- Emergent badge (inline on mobile, fixed bottom-left on desktop). The credit line is now just "Built with Emergent". CARD_VERSION=4.
- Music plays across the whole app (musicForRoute levels 0.22/0.12, duckMusic). Up to 3 picks per question. First-person copy.
- Stitched face with 7 emotions (Face.jsx, emote bus). Text on the top two bands only, labels max 12 chars, squeezed with textLength at 80%.

## Iteration 4 (2026-06)
- Reveal choreography (cameo, then the card unfolds, then vows are written in, then seal). The card renders in the background. Weaving preloads assets.
- No-scroll question screens (StrandCTA: fixed bar on phone, inline on desktop; short-window CSS). /bands chooser. Story video export (cardVideo.js, MediaRecorder).
- New original hero head/face (Face.jsx draws head, hair, beard, neck, shoulders and cravat over the art). Twig strokes were removed from meet-cameo.svg and weave-hoop.svg (originals in /app/scripts/*.orig.svg). The emotion picker was removed.
- NOTE: the Emergent LLM key budget is exhausted, so vows currently fall back to templates.

## Backlog
- P1: Server-side rendering of the OG card, so previews exist even if the creator leaves the page before the card finishes rendering.
- P2: Rate limiting on POST /api/husbands. Option to make share links point to /h/{id} directly once a custom domain with SSR or edge meta is set.

## Iteration 5 (2026-06)
- medallion-K.svg is now one inline component (Medallion.jsx). It's used on Meet, /h, Tell, Bands, Weaving and the desktop strand panel. He animates only through K-* groups (lib/face.js poses). Heart eyes, blush and floaters are hidden layers inside his own groups, and his hearts are #B3263A. The generator is /app/scripts/build_medallion.py.
- Weaving: a bottom-up mask reveal inside #portrait with a golden edge. Bands, heart and ribbon appear only when weaving finishes.
- Share card: CardPortrait (only #portrait, no bands) sits inside the unchanged gilded frame. base.png has been rebuilt and CARD_VERSION=10.
- Video: real face patches (blink, slow smile, wink with brow raise, ends on smile). The old Face.jsx, BandText.jsx and huskK.js were deleted. The /card/{id}?frames=t1,t2 view is for checking frames.
- Opening intro (IntroVeil.jsx + intro.css) is ported from the prototype. It shows only on a fresh page load of "/". It holds the music until the harp finishes, then fades the music in over 3s. Reduced motion gives a 0.5s fade with the sound kept. The veil is removed from the DOM after it opens. Recordings are in /public/recordings.

## Backlog
- P2: Band-3 short label can read weakly (e.g. "REMEMBERS").
- P2: The mute setting defaults to ON for reduced-motion users, so the intro sound only plays once they unmute.
- 2026-06 reveal fix: the desktop strand panel husband (BuildingHusband) is now rendered once in Layout, so it isn't remounted between questions. The reveal levels follow his anatomy (LEVELS in Medallion.jsx: lower abs, upper abs, chest, shoulders, neck, chin, then face). The level is shared at module scope, so a new instance starts from the last level and only grows upward over 0.8s. Medallion props are now `strands` and `finished`. Bands weaves the face in (from VI to VII), then the heart and bands appear. Weaving starts fully revealed. Check script: /app/scripts/record_strands.py.
- 2026-06 weaving screen: the screen starts empty. Strands I-VI rise on a timer (680ms each) up to the chin, and the face waits for the vows or a 9s fallback. Then the face weaves in, the heart pulses once (mk-pulse), and the bands and ribbon appear. After that it goes to Meet. Skip jumps straight to the finished state. Reduced motion uses a fade instead of the reveal (Medallion `fadeOnly` prop). The first mount of a medallion no longer fades the heart or bands out from their SVG defaults. Check script: /app/scripts/record_weaving.py.

## Iteration 6 (2026-06): must-haves
- There are now ten strands. VIII Goal, IX Interests and X Must-haves live in pages/GoalInterests.jsx and MustHaves.jsx (shared ChipPicker). The reveal is spread over ten LEVELS, with the face at X. All labels say "of X".
- Live "Suitors on file" check: SuitorCheck.jsx with the six text-only SUITORS in content.js. Torn-paper ✗ tags, a "None of them have..." note, a snap sound for each ✗, and a verdict on confirm. On desktop it shows in the left panel.
- Her husband is still the single K design with a generated name. The suitors' first names were removed from NAMES. Meet shows MustHavesCard with every must-have ticked. Backend: Must model plus goal and interests; keep_a_must makes sure one vow promises a must-have.
- Share card: the portrait oval is enlarged under the frame rim (sliver fixed) and the card now says "10 Strands". CARD_VERSION=13.
- Held for next round (user's request): Weaving Shimmer, Phone Weaving Preview, Vows Writing In.

## Iteration 7 (2026-06): painted husbands
- There are five user-provided portraits (scripts/portraits, exported by scripts/build_portraits.py to public/assets/husbands: {slug}.webp, {slug}-weave.webp raw-willow sepia at equal brightness, and {slug}-bg.jpg). Assets use ?v=PORTRAIT_V (5).
- pickPortrait(answers) in lib/weave.js uses the PORTRAITS signs in content.js. Ties go to the earliest match, then list order. The pick is sent as `portrait` and saved on the husband (default golden-willow).
- Medallion (assets/medallion.js from build_medallion.py) has the K drawing removed. The image slot is the oval's width, bottom-anchored. Layers: img-glow, img-color and img-weave (sepia while weaving, with a 1s bloom at the final step), plus shimmer masked by his alpha. Floaters rise from the brooch. Light-only effects (lib/face.js useLight): breathing, shimmer, hearts, and a glow on tap.
- Share card: CardPortrait shows {slug}-bg.jpg. The server uses card_assets/base-{slug}.png (build_card_layers.sh loops over all five). CARD_VERSION=14. The video in lib/cardVideo.js is light-only.
- The suitor cards stay portrait-free: a monogram over a dark silhouette.
- Checks: scripts/check_portraits.py and record_full.py.

## Iteration 8 (2026-06): expression frames
- The user's 9 aligned frames for each husband are in public/assets/husbands/{slug}/{expr}.webp (source copies in scripts/emotions). PORTRAIT_V=6.
- lib/face.js useExpressions crossfades the frames over neutral: 0.3s in, a per-emotion hold, 0.35s out. Blink is an instant 150ms swap. Meet him autoplays (blink every 3-5s, an emotion every 6-9s, smile on reveal, wink on Share, heart eyes on reweave), and a tap steps through TAP_ORDER. Floating hearts come from the lips for kiss and from the brooch for heart eyes. Reduced motion: taps only, instant swaps.
- preloadFrames runs during Weaving, and Meet waits until the frames are decoded. The video plays neutral, blink, smile, wink, smile using the frames. The shimmer and glow code was removed.
- Global rule: his face is hidden until the weaving screen finishes. Bands shows strands=9 with the bands visible (showBands).
- Check script: scripts/record_emotions.py. iteration_21: all passed.

## Iteration 9 (2026-06): blink, fades, forest, sliders
- Blink uses hard cuts: blink_half 45ms, blink 90ms, blink_half 45ms (face.js). The video uses frames 27-28 half, 29-31 closed, 32-33 half at 30fps (cardVideo.js expressionAt). Checked: no in-between opacity.
- Page fades: leave .5s ease-in, enter .55s ease-out with a .1s delay (index.css). LEAVE_MS=500. The visible page never drops below about 0.56 opacity (scripts/record_transition.py).
- ForestScene.jsx is a port of forest-panel-prototype.html. It sits behind the desktop art panel, and on phones behind the medallion strip only (PanelOrInline forest on Welcome, Meet, Bands, Weaving). It repaints on resize (ResizeObserver), pauses when the tab is hidden, and is static under reduced motion (no fireflies or leaves).
- Temperament sliders: the thread is an img inside .woven-thread (min(100%-40px,320px)). An invisible native range input overhangs the thread by 20px on each side, so the heart centre maps from 0% at the left end to 100% at the right end. The visible heart sits at left:value%, vertically centred. Labels match the thread's width. Check: scripts/check_sliders.py (mouse and touch at 390 and 1280; all pass).
- Next round (user-approved): a small part-woven husband medallion (120-140px) above the question card on phones. It is sepia with the face hidden, does not react to taps, and must keep the CTA in view at 390x844. The forest goes behind that strip only. Later: the golden weaving shimmer and the faint-ink first vow.

## Iteration 10 (2026-06): "is he already in my life?" recipients
- RECIPIENTS: Significant other (the default), Crush, Best friend, Ex. Each has a `greeting` and `named(n)`: My love, / Hey you, / Dear bestie, / To whom it may concern.
- Strand chips (Tell.jsx strandsFor) show her own threads minus FAMILY_ONLY (Mom's birthday, My childhood pet), then LETTER_STRANDS from content.js filtered by recipient (`to`), up to MAX_LETTER_STRANDS=6. Coffee, unasked and Truly sees me always show. Crush adds: Texts back, promptly, Remembers how we met, Says it plainly. Ex adds, in past tense: Still knows my order, Never really left, Left a thread behind, Remembers how we met. Says it plainly is cut for Ex by the cap.
- When the recipient changes, the selected strand stays selected if the new list has it.
