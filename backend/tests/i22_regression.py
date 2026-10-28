"""Iteration 22 regression: emotions on Meet, must-haves, card frames, old 6-label husband, /musthaves redirect, desktop strand 10, weaving early."""
import asyncio, json, sys
from playwright.async_api import async_playwright

URL = sys.argv[1].rstrip("/")
HID = sys.argv[2]
ANS = {"q1": [{"id": "takeout"}], "q2": [{"id": "pancakes"}], "q3": [{"id": "laugh"}], "q4": [{"id": "lastbite"}], "q7": [{"id": "amused"}],
       "sliders": {"out": 80, "love": 50, "feel": 50}, "remembers": [{"id": "jokes"}], "goal": "serious", "interests": [{"id": "books"}], "musts": [{"id": "calm"}]}
INIT = f"sessionStorage.setItem('weave-him-answers', {json.dumps(json.dumps(ANS))});"
PROBE = """() => [...document.querySelectorAll('[data-testid=medallion],[data-testid=weaving-medallion]')].map(m => ({
  woven: m.dataset.woven, y: Math.round(new DOMMatrix(getComputedStyle(m.querySelector('[id$=reveal-rect]')).transform).f),
  masked: !!m.querySelector('[id$=figure]').getAttribute('mask'), sepia: +getComputedStyle(m.querySelector('[id$=img-weave]')).opacity,
  emo: m.querySelectorAll('[data-expr]').length, tap: !!m.querySelector('[data-testid=face-tap-target]'),
  bands: [...m.querySelectorAll('textPath')].filter(t => t.id.match(/band-\\d$/) && t.textContent).map(t => t.textContent) }))"""


async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
        ctx = await b.new_context(viewport={"width": 1280, "height": 800})
        await ctx.add_init_script(INIT)
        p = await ctx.new_page()
        errs = []
        p.on("pageerror", lambda e: errs.append(str(e)))
        # /musthaves redirect + desktop strand 10
        await p.goto(URL + "/musthaves", wait_until="networkidle"); await p.wait_for_timeout(1500)
        print("/musthaves ->", p.url.replace(URL, ""), await p.evaluate(PROBE))
        await p.goto(URL + "/strand/10", wait_until="networkidle"); await p.wait_for_timeout(1500)
        print("/strand/10 desktop medallions", await p.evaluate(PROBE), "suitor testids",
              await p.evaluate("() => [...document.querySelectorAll('[data-testid]')].map(e=>e.dataset.testid).filter(t=>/suitor/.test(t)).slice(0,6)"))
        await p.screenshot(path="/app/test_reports/img/i22-strand10-desktop.jpg", quality=40, type="jpeg")
        # weaving early desktop
        await p.goto(URL + "/weaving"); await p.wait_for_timeout(1200)
        print("/weaving early desktop", await p.evaluate(PROBE))
        await p.wait_for_url("**/meet/**", timeout=25000)
        # emotions on Meet
        await p.goto(f"{URL}/meet/{HID}", wait_until="networkidle"); await p.wait_for_timeout(2500)
        await p.evaluate("""() => { window.__emo=[]; const m=document.querySelector('[data-testid=medallion]');
          new MutationObserver(()=>{ const e=m.dataset.emotion; if(window.__emo[window.__emo.length-1]!==e) window.__emo.push(e); }).observe(m,{attributes:true,attributeFilter:['data-emotion']}); }""")
        await p.wait_for_timeout(1500)
        await p.evaluate("window.__emo=[]")
        for _ in range(7):
            await p.click("[data-testid=face-tap-target]", force=True); await p.wait_for_timeout(2300)
        print("emotion timeline", [e for e in await p.evaluate("window.__emo") if e != "neutral"])
        musts = await p.evaluate("() => [...document.querySelectorAll('[data-testid]')].map(e=>e.dataset.testid).filter(t=>/must/.test(t))")
        print("must testids", musts[:8])
        print("meet text has 'calmly':", "calmly" in (await p.inner_text("body")).lower())
        # card frames
        await p.goto(f"{URL}/card/{HID}?frames=0.95,2.6,4.1,5.6", wait_until="networkidle")
        try:
            await p.wait_for_selector("[data-frames-ready='1']", timeout=20000); print("card frames ready")
        except Exception as e:
            print("card frames NOT ready", e)
        # old husband with 6 labels
        await p.goto(f"{URL}/meet/w98cta5z", wait_until="networkidle"); await p.wait_for_timeout(2500)
        print("old husband", await p.evaluate(PROBE))
        await p.screenshot(path="/app/test_reports/img/i22-old-husband.jpg", quality=40, type="jpeg")
        print("page errors", errs)
        await b.close()

asyncio.run(main())
