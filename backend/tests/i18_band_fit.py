# Iteration 18: band shrink only when longer than data-max-length (Bands page with long picks)
import asyncio, json
from playwright.async_api import async_playwright
BASE = open("/app/frontend/.env").read().split("REACT_APP_BACKEND_URL=")[1].split()[0]
ANS = {"q1": [{"id": "coffee"}], "q2": [{"id": "pancakes"}], "q3": [{"id": "rehearse"}], "q4": [{"id": "small"}], "q7": [{"id": "safe"}], "remembers": [{"id": "mom"}, {"id": "jokes"}]}
async def main():
    async with async_playwright() as p:
        br = await p.chromium.launch(); ctx = await br.new_context(viewport={"width": 390, "height": 844})
        await ctx.add_init_script("if(!sessionStorage.getItem('s')){sessionStorage.setItem('weave-him-answers', %s);sessionStorage.setItem('s','1')}" % json.dumps(json.dumps(ANS)))
        pg = await ctx.new_page(); await pg.goto(BASE + "/bands"); await pg.wait_for_selector('[data-testid=bands-preview] svg'); await pg.wait_for_timeout(600)
        for t in ["patience", "coffee", "small-things"]: await pg.click(f'[data-testid=band-choice-{t}]'); await pg.wait_for_timeout(150)
        for t in ["small-things", "worst-jokes", "mom-s-day"]: await pg.click(f'[data-testid=band-choice-{t}]'); await pg.wait_for_timeout(150)
        await pg.wait_for_timeout(600)
        print(await pg.evaluate("""() => ['band-1','band-2','band-3'].map(s => { const tp = document.querySelector(`[data-testid=bands-preview] [id$="${s}"]`);
          const tl = tp.getAttribute('textLength'), la = tp.getAttribute('lengthAdjust'); tp.removeAttribute('textLength');
          const nat = tp.getComputedTextLength(); if (tl) tp.setAttribute('textLength', tl);
          return [tp.textContent, Math.round(nat), tp.dataset.maxLength, tl, la, Math.round(tp.getComputedTextLength())]; })"""))
        await pg.locator('[data-testid=bands-preview]').screenshot(path="/app/test_reports/img/i18_bands_long.jpg", quality=50)
        await br.close()
asyncio.run(main())
