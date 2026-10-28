"""Iteration 22: /bands pick order -> POST payload -> Meet -> API/card; back nav + reweave with new picks."""
import asyncio, json, sys
from playwright.async_api import async_playwright

URL = sys.argv[1].rstrip("/")
ANS = {"q1": [{"id": "takeout"}], "q2": [{"id": "pancakes"}], "q3": [{"id": "laugh"}], "q4": [{"id": "lastbite"}], "q7": [{"id": "amused"}],
       "sliders": {"out": 80, "love": 50, "feel": 50}, "remembers": [{"id": "jokes"}], "goal": "serious", "interests": [{"id": "books"}], "musts": [{"id": "calm"}]}
# only seed once per tab so reloads/back don't wipe bandPick
INIT = f"if(!sessionStorage.getItem('weave-him-answers')) sessionStorage.setItem('weave-him-answers', {json.dumps(json.dumps(ANS))});"
PROBE = """() => [...document.querySelectorAll('[data-testid=medallion],[data-testid=weaving-medallion]')].map(m => ({
  woven: m.dataset.woven, y: Math.round(new DOMMatrix(getComputedStyle(m.querySelector('[id$=reveal-rect]')).transform).f),
  masked: !!m.querySelector('[id$=figure]').getAttribute('mask'), sepia: +getComputedStyle(m.querySelector('[id$=img-weave]')).opacity,
  emo: m.querySelectorAll('[data-expr]').length, tap: !!m.querySelector('[data-testid=face-tap-target]'),
  heart: getComputedStyle(m.querySelector('[id$=heart]')).opacity, ribbon: getComputedStyle(m.querySelector('[id$=ribbon]')).opacity,
  bandsOp: getComputedStyle(m.querySelector('[id$=bands]')).opacity,
  bands: [...m.querySelectorAll('textPath')].filter(t => t.id.match(/band-\\d$/) && t.textContent).map(t => t.textContent) }))"""


async def chips_state(p):
    return await p.evaluate("""() => [...document.querySelectorAll('[data-testid^=band-choice-]')].map(b => [b.textContent, b.getAttribute('aria-pressed')])""")


async def weave(p, order, posts):
    chips = p.locator("[data-testid^=band-choice-]")
    n = await chips.count()
    for i in range(n):
        if await chips.nth(i).get_attribute("aria-pressed") == "true":
            await chips.nth(i).click(); await p.wait_for_timeout(250)
    names = []
    for i in order:
        names.append((await chips.nth(i).inner_text()).strip().lstrip("0123456789").strip())
        await chips.nth(i).click(); await p.wait_for_timeout(400)
        print("  live after tap", names[-1], (await p.evaluate(PROBE))[0]["bands"])
    print("  sessionStorage bandPick", json.loads(await p.evaluate("sessionStorage.getItem('weave-him-answers')")).get("bandPick"))
    await p.wait_for_timeout(600)
    pr = (await p.evaluate(PROBE))[0]
    print("  bands page", pr)
    await p.click("[data-testid=weave-him-button]")
    seen10 = None
    for _ in range(120):
        await p.wait_for_timeout(150)
        if "/meet/" in p.url: break
        m = await p.evaluate(PROBE)
        if m:
            sc = await p.inner_text("[data-testid=weaving-strand-count]")
            if m[0]["woven"] == "1" and seen10 is None: seen10 = (sc, m[0])
            if m[0]["woven"] == "0" and m[0]["y"] < 384: print("  FACE LEAK on weaving", sc, m[0])
    print("  weaving first woven=1 at:", seen10)
    await p.wait_for_url("**/meet/**", timeout=25000)
    await p.wait_for_timeout(2500)
    meet = (await p.evaluate(PROBE))[0]
    hid = p.url.rsplit("/", 1)[-1]
    h = await (await p.request.get(f"{URL}/api/husbands/{hid}")).json()
    print("  tapped", names, "\n  POST band", posts[-1]["band"] if posts else None, "card", posts[-1]["card"] if posts else None,
          "\n  meet", meet, "\n  api band", h["band"], "card", h["card"])
    return names, hid


async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
        ctx = await b.new_context(viewport={"width": 390, "height": 844})
        await ctx.add_init_script(INIT)
        p = await ctx.new_page()
        posts = []
        p.on("request", lambda r: posts.append(json.loads(r.post_data)) if r.method == "POST" and r.url.endswith("/api/husbands") else None)
        await p.goto(URL + "/bands", wait_until="networkidle"); await p.wait_for_timeout(1500)
        print("initial chips", await chips_state(p))
        print("initial probe", await p.evaluate(PROBE))
        # max 3: 4th tap does nothing
        chips = p.locator("[data-testid^=band-choice-]")
        await chips.nth(3).click(); await p.wait_for_timeout(400)
        print("after 4th tap count:", await p.inner_text("[data-testid=bands-count]"), (await p.evaluate(PROBE))[0]["bands"])
        # deselect one
        await chips.nth(1).click(); await p.wait_for_timeout(400)
        print("after deselect #2:", await p.inner_text("[data-testid=bands-count]"), (await p.evaluate(PROBE))[0]["bands"])
        print("== weave 1: order [3,0,5]")
        names1, h1 = await weave(p, [3, 0, 5], posts)
        card = await p.request.get(f"{URL}/api/husbands/{h1}/card.jpg?v=15")
        print("card.jpg", card.status, card.headers.get("content-type"), len(await card.body()))
        sh = await p.request.get(f"{URL}/api/share/{h1}")
        txt = await sh.text(); i = txt.find("Woven from"); print("share og desc:", txt[i:i + 140])
        # back to bands
        await p.go_back(); await p.wait_for_timeout(2000)
        print("after back url", p.url.replace(URL, ""), await p.evaluate(PROBE))
        if "/bands" not in p.url:
            await p.goto(URL + "/bands", wait_until="networkidle"); await p.wait_for_timeout(1500)
        print("bands after return", await p.evaluate(PROBE))
        print("== weave 2: order [2,4,1]")
        names2, h2 = await weave(p, [2, 4, 1], posts)
        print("new husband?", h1 != h2)
        # /h/{id}
        await p.goto(f"{URL}/h/{h2}", wait_until="networkidle"); await p.wait_for_timeout(2500)
        print("/h probe", await p.evaluate(PROBE))
        # weave another
        btn = p.locator("[data-testid*=weave-another], [data-testid*=weave-your-own]")
        print("weave-another buttons", await btn.count())
        await b.close()

asyncio.run(main())
