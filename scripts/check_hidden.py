"""Opens every pre-weave route directly in a fresh tab and checks his face stays hidden; then picks three bands in an
unusual order and checks /bands, Meet him and the share card all show those three in that order (dev only)."""
import asyncio
import json
import sys
from pathlib import Path
from playwright.async_api import async_playwright

URL = sys.argv[1].rstrip("/")
OUT = Path("/app/frontend/public/recordings")
ANS = {"q1": [{"id": "takeout"}], "q2": [{"id": "pancakes"}], "q3": [{"id": "laugh"}], "q4": [{"id": "lastbite"}], "q7": [{"id": "amused"}],
       "sliders": {"out": 80, "love": 50, "feel": 50}, "remembers": [{"id": "jokes"}], "goal": "serious", "interests": [{"id": "books"}], "musts": [{"id": "calm"}]}
INIT = f"sessionStorage.setItem('weave-him-answers', {json.dumps(json.dumps(ANS))});"
PROBE = """() => [...document.querySelectorAll('[data-testid=medallion],[data-testid=weaving-medallion]')].map(m => ({
  woven: m.dataset.woven, y: Math.round(new DOMMatrix(getComputedStyle(m.querySelector('[id$=reveal-rect]')).transform).f),
  masked: !!m.querySelector('[id$=figure]').getAttribute('mask'), sepia: +getComputedStyle(m.querySelector('[id$=img-weave]')).opacity,
  bands: [...m.querySelectorAll('textPath')].filter(t => t.id.match(/band-\\d$/) && t.textContent).map(t => t.textContent) }))"""


async def fresh(b, size, path, wait=2200):
    ctx = await b.new_context(viewport=size)
    await ctx.add_init_script(INIT)
    p = await ctx.new_page()
    await p.goto(URL + path, wait_until="networkidle")
    await p.wait_for_timeout(wait)
    return ctx, p


async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
        bad = 0
        for size in [{"width": 390, "height": 844}, {"width": 1280, "height": 800}]:
            for path in [f"/strand/{n}" for n in range(1, 11)] + ["/bands", "/musthaves"]:
                ctx, p = await fresh(b, size, path)
                for m in await p.evaluate(PROBE):
                    hidden = m["woven"] == "0" and m["masked"] and m["y"] >= 384 and m["sepia"] > 0.99
                    bad += not hidden
                    print(size["width"], path, "->", p.url.replace(URL, ""), m, "" if hidden else "FACE SHOWN")
                if size["width"] == 1280 and path in ("/strand/9", "/strand/10", "/bands"):
                    await p.screenshot(path=str(OUT / f"hidden-{path.strip('/').replace('/', '-')}-desktop.png"))
                if size["width"] == 390 and path in ("/strand/10", "/bands"):
                    await p.screenshot(path=str(OUT / f"hidden-{path.strip('/').replace('/', '-')}-phone.png"), full_page=True)
                await ctx.close()
        # weaving screen, early: still hidden
        ctx, p = await fresh(b, {"width": 390, "height": 844}, "/weaving", 1500)
        print("/weaving early", await p.evaluate(PROBE))
        await ctx.close()
        # three bands in an unusual order: 4th, 1st, 6th label
        ctx, p = await fresh(b, {"width": 1280, "height": 800}, "/bands")
        chips = p.locator("[data-testid^=band-choice-]")
        for i in range(await chips.count()):
            if await chips.nth(i).get_attribute("aria-pressed") == "true":
                await chips.nth(i).click()
        names = []
        for i in [3, 0, 5]:
            names.append((await chips.nth(i).inner_text()).strip())
            await chips.nth(i).click()
            await p.wait_for_timeout(500)
        await p.wait_for_timeout(1200)
        on_bands = (await p.evaluate(PROBE))[0]["bands"]
        await p.screenshot(path=str(OUT / "bands-order-desktop.png"))
        await p.click("[data-testid=weave-him-button]")
        await p.wait_for_url("**/meet/**", timeout=25000)
        await p.wait_for_timeout(2500)
        on_meet = (await p.evaluate(PROBE))[0]["bands"]
        await p.screenshot(path=str(OUT / "meet-order-desktop.png"))
        hid = p.url.rsplit("/", 1)[-1]
        h = await (await p.request.get(f"{URL}/api/husbands/{hid}")).json()
        await p.goto(f"{URL}/api/husbands/{hid}/card.jpg?v=15")
        await p.screenshot(path=str(OUT / "card-order.png"))
        print("tapped", names, "\nbands page", on_bands, "\nmeet", on_meet, "\nrecord band", h["band"], "card woven", h["card"]["woven"])
        print("FACE-SHOWN COUNT", bad)
        await b.close()

asyncio.run(main())
