"""Iteration 22: 'Weave another' from Meet never shows his face on the following screens."""
import asyncio, json, sys
from playwright.async_api import async_playwright

URL = sys.argv[1].rstrip("/")
ANS = {"q1": [{"id": "takeout"}], "q2": [{"id": "pancakes"}], "q3": [{"id": "laugh"}], "q4": [{"id": "lastbite"}], "q7": [{"id": "amused"}],
       "sliders": {"out": 80, "love": 50, "feel": 50}, "remembers": [{"id": "jokes"}], "goal": "serious", "interests": [{"id": "books"}], "musts": [{"id": "calm"}]}
INIT = f"if(!sessionStorage.getItem('seeded')){{sessionStorage.setItem('seeded','1');sessionStorage.setItem('weave-him-answers', {json.dumps(json.dumps(ANS))});}}"
PROBE = """() => [...document.querySelectorAll('[data-testid=medallion],[data-testid=weaving-medallion]')].map(m => ({
  woven: m.dataset.woven, y: Math.round(new DOMMatrix(getComputedStyle(m.querySelector('[id$=reveal-rect]')).transform).f),
  masked: !!m.querySelector('[id$=figure]').getAttribute('mask'), sepia: +getComputedStyle(m.querySelector('[id$=img-weave]')).opacity }))"""


async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
        for vp in [{"width": 1280, "height": 800}, {"width": 390, "height": 844}]:
            ctx = await b.new_context(viewport=vp); await ctx.add_init_script(INIT)
            p = await ctx.new_page()
            await p.goto(URL + "/bands", wait_until="networkidle"); await p.wait_for_timeout(1000)
            await p.click("[data-testid=weave-him-button]")
            await p.wait_for_url("**/meet/**", timeout=25000); await p.wait_for_timeout(2000)
            btns = await p.evaluate("() => [...document.querySelectorAll('[data-testid]')].map(e=>e.dataset.testid).filter(t=>/another|again|new/.test(t))")
            print(vp["width"], "candidate buttons", btns)
            if not btns: await ctx.close(); continue
            await p.click(f"[data-testid={btns[0]}]", force=True); await p.wait_for_timeout(2500)
            print("  after weave-another url", p.url.replace(URL, ""), await p.evaluate(PROBE))
            # walk forward through whatever strand screen shows, probing
            for n in [1, 5, 9, 10]:
                await p.evaluate(f"history.pushState({{}}, '', '/strand/{n}'); dispatchEvent(new PopStateEvent('popstate'))"); await p.wait_for_timeout(1200)
                print("  ", p.url.replace(URL, ""), await p.evaluate(PROBE))
            await ctx.close()
        await b.close()

asyncio.run(main())
