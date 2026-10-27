# Iteration 18: weaving reveal, bands live preview, desktop strand panel, tell panel, card page, video frames
import asyncio, json, sys, re
from playwright.async_api import async_playwright
BASE = open("/app/frontend/.env").read().split("REACT_APP_BACKEND_URL=")[1].split()[0]
HID = "62s6pvau"; OUT = "/app/test_reports/img"
ANS = json.dumps({"q1": [{"id": "coffee"}], "q2": [{"id": "pancakes"}], "q3": [{"id": "rehearse"}], "q4": [{"id": "small"}], "q7": [{"id": "safe"}], "remembers": [{"id": "mom"}, {"id": "jokes"}]})
R = []
def rep(n, ok, info=""):
    R.append(ok); print(("PASS " if ok else "FAIL ") + n + (" :: " + str(info) if info else ""), flush=True)

ST = """(sel) => { const m = document.querySelector(sel); if (!m) return null; const g = s => m.querySelector(`[id$="${s}"]`);
  const r = m.getBoundingClientRect();
  return { mask: g('figure').getAttribute('mask'), rect: g('reveal-rect').style.transform, edge: getComputedStyle(g('reveal-edge')).opacity,
    bands: getComputedStyle(g('-bands')).opacity, heart: getComputedStyle(g('-heart')).opacity, ribbon: getComputedStyle(g('-ribbon')).opacity,
    name: g('name-text').textContent, b1: g('band-1').textContent, b2: g('band-2').textContent, b3: g('band-3').textContent,
    box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], vis: r.width > 0 && r.height > 0,
    sw: document.documentElement.scrollWidth, iw: innerWidth, count: document.querySelectorAll('svg[id$="medallion"]').length }; }"""

async def seeded(br, w, h, reduce=None):
    ctx = await br.new_context(viewport={"width": w, "height": h}, reduced_motion=reduce or "no-preference")
    await ctx.add_init_script(f"if (!sessionStorage.getItem('seeded')) {{ sessionStorage.setItem('weave-him-answers', {json.dumps(ANS)}); sessionStorage.removeItem('weave-him-last'); sessionStorage.setItem('seeded','1'); }}")
    return ctx

async def weaving(br, w, h, skip=False):
    ctx = await seeded(br, w, h); pg = await ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.goto(BASE + "/weaving")
    await pg.wait_for_selector('[data-testid=weaving-medallion] svg', timeout=15000)
    tag = f"weave{w}{'skip' if skip else ''}"
    if skip:
        await pg.wait_for_timeout(500)
        await pg.click('[data-testid=skip-to-him]')
        await pg.wait_for_url(re.compile(r".*/meet/\w+"), timeout=15000)
        rep(f"{tag} skip -> meet", True, pg.url); await ctx.close(); return
    snaps = []
    for k in range(10):
        s = await pg.evaluate(ST, '[data-testid=weaving-medallion]')
        if s is None: break
        snaps.append(s)
        if k == 3: await pg.screenshot(path=f"{OUT}/i18_{tag}_mid.jpg", quality=40)
        await pg.wait_for_timeout(330)
    mid = [s for s in snaps if s["edge"] == "1"]
    rep(f"{tag} medallion visible", snaps and snaps[0]["vis"], snaps[0]["box"] if snaps else None)
    rep(f"{tag} figure masked while weaving", bool(mid) and all(s["mask"] and "reveal-mask" in s["mask"] for s in mid), [s["mask"] for s in snaps[:3]])
    ys = [float(re.findall(r"translateY\(([-\d.]+)px", s["rect"])[0]) for s in snaps if s["rect"]]
    rep(f"{tag} reveal rect moves up stepwise", len(set(ys)) >= 4 and all(b <= a for a, b in zip(ys, ys[1:])), ys)
    rep(f"{tag} bands/heart/ribbon hidden while weaving", bool(mid) and all(s["bands"] == "0" and s["heart"] == "0" and s["ribbon"] == "0" for s in mid))
    rep(f"{tag} no h-overflow", all(s["sw"] <= s["iw"] for s in snaps), snaps[0]["sw"])
    rep(f"{tag} medallion within viewport width", snaps[0]["box"][0] >= 0 and snaps[0]["box"][0] + snaps[0]["box"][2] <= w, snaps[0]["box"])
    rep(f"{tag} one medallion", snaps[0]["count"] == 1, snaps[0]["count"])
    try:
        await pg.wait_for_url(re.compile(r".*/meet/\w+"), timeout=15000); rep(f"{tag} auto-nav to meet", True, pg.url)
    except Exception as e: rep(f"{tag} auto-nav to meet", False, str(e)[:100])
    rep(f"{tag} no page errors", not errs, errs[:2])
    await ctx.close()

async def bands(br):
    for w, h in ((390, 844), (1280, 800)):
        ctx = await seeded(br, w, h); pg = await ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(BASE + "/bands"); await pg.wait_for_selector('[data-testid=bands-preview] [data-testid=medallion] svg', timeout=15000)
        await pg.wait_for_timeout(800)
        s0 = await pg.evaluate(ST, '[data-testid=bands-preview] [data-testid=medallion]')
        rep(f"bands{w} ribbon hidden + no name", s0["ribbon"] == "0" and s0["name"] == "", (s0["ribbon"], s0["name"]))
        rep(f"bands{w} bands visible", s0["bands"] == "1", s0["bands"])
        chips = await pg.locator('[data-testid^=band-choice-]').all()
        pressed = [await c.get_attribute("aria-pressed") for c in chips]
        print("chips", [await c.get_attribute("data-testid") for c in chips], pressed, [s0["b1"], s0["b2"], s0["b3"]])
        on = [c for c, p in zip(chips, pressed) if p == "true"]
        await on[0].click(); await pg.wait_for_timeout(400)
        s1 = await pg.evaluate(ST, '[data-testid=bands-preview] [data-testid=medallion]')
        rep(f"bands{w} untoggle changes band text live", [s1["b1"], s1["b2"], s1["b3"]] != [s0["b1"], s0["b2"], s0["b3"]], [s1["b1"], s1["b2"], s1["b3"]])
        off = [c for c, p in zip(chips, pressed) if p != "true"]
        if off:
            await off[0].click(); await pg.wait_for_timeout(400)
            s2 = await pg.evaluate(ST, '[data-testid=bands-preview] [data-testid=medallion]')
            rep(f"bands{w} toggle-on changes band text", [s2["b1"], s2["b2"], s2["b3"]] != [s1["b1"], s1["b2"], s1["b3"]], [s2["b1"], s2["b2"], s2["b3"]])
        await pg.screenshot(path=f"{OUT}/i18_bands{w}.jpg", quality=40)
        rep(f"bands{w} no errors / overflow", not errs and s0["sw"] <= s0["iw"], (errs[:1], s0["sw"]))
        await ctx.close()

async def strands(br):
    ctx = await seeded(br, 1280, 800); pg = await ctx.new_page()
    ys = []
    for n in range(1, 8):
        await pg.goto(BASE + f"/strand/{n}")
        await pg.wait_for_selector('[data-testid=building-husband] [data-testid=medallion] svg', timeout=15000)
        await pg.wait_for_timeout(500)
        s = await pg.evaluate(ST, '[data-testid=building-husband] [data-testid=medallion]')
        y = float(re.findall(r"translateY\(([-\d.]+)px", s["rect"])[0])
        ys.append(round(y, 1))
        if n in (1, 4, 7): await pg.screenshot(path=f"{OUT}/i18_strand{n}.jpg", quality=40)
    exp = [round(84 + 516 * (1 - (n - 1) / 7), 1) for n in range(1, 8)]
    rep("strand1-7 desktop reveal proportional", ys == exp, (ys, exp))
    await ctx.close()

async def tell(br):
    pg = await br.new_page(viewport={"width": 1280, "height": 800})
    await pg.goto(BASE + f"/tell/{HID}")
    await pg.wait_for_selector('[data-testid=art-panel] [data-testid=meet-cameo] [data-testid=medallion] svg', timeout=15000)
    await pg.wait_for_timeout(800)
    s = await pg.evaluate(ST, '[data-testid=art-panel] [data-testid=medallion]')
    rep("tell1280 medallion in left panel", s["vis"] and s["box"][0] < 640 and s["name"] == "meet Jasper", s["box"])
    await pg.screenshot(path=f"{OUT}/i18_tell1280.jpg", quality=40); await pg.close()

async def card(br):
    pg = await br.new_page(viewport={"width": 1080, "height": 1920}); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.goto(BASE + f"/card/{HID}")
    await pg.wait_for_selector('[data-testid=share-card] [data-testid=card-husband] svg', timeout=15000)
    await pg.wait_for_selector('[data-card-ready="1"]', timeout=15000)
    c = await pg.evaluate("""() => { const c = document.querySelector('[data-testid=card-husband]');
      return { bands: c.querySelectorAll('[id$="-bands"]').length, ribbon: c.querySelectorAll('[id$="-ribbon"]').length, portrait: c.querySelectorAll('[id$="portrait"]').length,
        eyes: c.querySelectorAll('[id$="K-eye-l"]').length, text: document.querySelector('[data-testid=share-card]').innerText.slice(0, 300) }; }""")
    rep("card portrait only (no bands/ribbon)", c["bands"] == 0 and c["ribbon"] == 0 and c["portrait"] >= 1 and c["eyes"] == 1, c)
    rep("card name in cartouche", "Jasper" in c["text"], c["text"][:120])
    await pg.screenshot(path=f"{OUT}/i18_cardpage.jpg", quality=40)
    rep("card no page errors", not errs, errs[:2]); await pg.close()

async def frames(br):
    pg = await br.new_page(viewport={"width": 1080, "height": 1200}); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.goto(BASE + f"/card/{HID}?frames=0.9,2.8,3.6")
    await pg.wait_for_selector('[data-frames-ready="1"]', timeout=60000)
    n = await pg.locator('[data-testid^=video-frame-]').count()
    rep("frames: 3 images", n == 3, n)
    for i in range(n):
        el = pg.locator(f'[data-testid=video-frame-{i}]')
        await el.scroll_into_view_if_needed()
        await el.screenshot(path=f"{OUT}/i18_frame{i}.jpg", quality=60)
        # face zoom: card SKY box at 280,456 + patch 150,250 (230x205)
        bb = await el.bounding_box()
        await pg.screenshot(path=f"{OUT}/i18_frame{i}_face.png", clip={"x": bb["x"] + 400, "y": bb["y"] + 680, "width": 280, "height": 260})
    rep("frames no page errors", not errs, errs[:2]); await pg.close()

async def main():
    which = sys.argv[1:] or ["weave", "bands", "strands", "tell", "card", "frames"]
    async with async_playwright() as p:
        br = await p.chromium.launch()
        if "weave" in which:
            await weaving(br, 390, 844); await weaving(br, 1280, 800); await weaving(br, 390, 844, skip=True)
        if "bands" in which: await bands(br)
        if "strands" in which: await strands(br)
        if "tell" in which: await tell(br)
        if "card" in which: await card(br)
        if "frames" in which: await frames(br)
        await br.close()
    print("SUMMARY", sum(R), "/", len(R))
asyncio.run(main())
