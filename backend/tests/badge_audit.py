# Audit: where the Built with Emergent badge shows on each screen at 390x844
import asyncio, json
from playwright.async_api import async_playwright
BASE = open("/app/frontend/.env").read().split("REACT_APP_BACKEND_URL=")[1].split()[0].rstrip("/")
ANS = {"q1": [{"id": "coffee"}], "q2": [{"id": "pancakes"}], "q3": [{"id": "laugh"}], "q4": [{"id": "small"}], "q7": [{"id": "amused"}],
       "sliders": {"out": 80, "love": 50, "feel": 50}, "remembers": [{"id": "jokes"}], "goal": "serious", "interests": [{"id": "books"}], "musts": [{"id": "calm"}],
       "bandPick": ["LAUGHS", "COFFEE", "PANCAKES"]}
ROUTES = ["/", "/strand/1", "/strand/2", "/strand/3", "/strand/4", "/strand/5", "/strand/6", "/strand/7", "/strand/8", "/strand/9", "/strand/10",
          "/bands", "/weaving", "/meet/4qnv4pay", "/h/4qnv4pay", "/h/doesnotexist", "/tell/4qnv4pay", "/card/4qnv4pay"]
JS = """() => { const r = []; document.querySelectorAll('[data-testid^=emergent-badge]').forEach(b => { const s = getComputedStyle(b); const x = b.getBoundingClientRect();
  const vis = s.display !== 'none' && s.visibility !== 'hidden' && x.width > 0;
  const docY = x.top + window.scrollY; let cover = null;
  if (vis) { window.scrollTo(0, Math.max(0, docY - 400)); const y = b.getBoundingClientRect(); const el = document.elementFromPoint(y.left + y.width / 2, y.top + y.height / 2);
    cover = el && !b.contains(el) ? (el.closest('[data-testid]')?.dataset.testid || el.tagName) : null; }
  r.push({ id: b.dataset.testid, vis, w: Math.round(x.width), h: Math.round(x.height), docTop: Math.round(docY), pos: s.position, covered_by: cover }); });
  return { badges: r, pageH: document.documentElement.scrollHeight, cta: !!document.querySelector('[data-testid=strand-cta-bar]') }; }"""

async def main(w, h, intro):
    async with async_playwright() as p:
        br = await p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
        ctx = await br.new_context(viewport={"width": w, "height": h})
        await ctx.add_init_script(f"sessionStorage.setItem('weave-him-answers', {json.dumps(json.dumps(ANS))});" + ("" if intro else "sessionStorage.setItem('weave-him-intro-seen','1');"))
        pg = await ctx.new_page()
        for r in ROUTES:
            await pg.goto(BASE + r, wait_until="networkidle"); await pg.wait_for_timeout(1800)
            print(r, json.dumps(await pg.evaluate(JS)))
        await br.close()

import sys
asyncio.run(main(int(sys.argv[1]), int(sys.argv[2]), sys.argv[3] == "intro") if len(sys.argv) > 3 else main(390, 844, False))
