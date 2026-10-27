# Iteration 18: medallion-K on Meet/h/Weaving/Bands/Strand/Tell, emotions, reduced motion, card + video frames
import asyncio, json, os, sys
from playwright.async_api import async_playwright

BASE = os.environ.get("BASE") or open("/app/frontend/.env").read().split("REACT_APP_BACKEND_URL=")[1].split()[0]
HID = "62s6pvau"
OUT = "/app/test_reports/img"
ANS = json.dumps({"q1": [{"id": "coffee"}], "q2": [{"id": "pancakes"}], "q3": [{"id": "rehearse"}], "q4": [{"id": "small"}], "q7": [{"id": "safe"}], "remembers": [{"id": "mom"}, {"id": "jokes"}]})
R = []
def rep(name, ok, info=""):
    R.append((name, ok)); print(("PASS " if ok else "FAIL ") + name + (" :: " + str(info) if info else ""), flush=True)

INSPECT = """(sel) => {
  const m = document.querySelector(sel); if (!m) return null;
  const g = (s) => m.querySelector(`[id$="${s}"]`);
  const bands = ['band-1','band-2','band-3'].map(s => { const tp = g(s); if (!tp) return null;
    const had = tp.getAttribute('textLength'); const la = tp.getAttribute('lengthAdjust');
    tp.removeAttribute('textLength'); tp.removeAttribute('lengthAdjust');
    const nat = tp.textContent ? tp.getComputedTextLength() : 0;
    if (had) { tp.setAttribute('textLength', had); tp.setAttribute('lengthAdjust', la); }
    return { text: tp.textContent, tl: had, max: Number(tp.dataset.maxLength), nat, disp: getComputedStyle(tp.parentNode).display }; });
  const r = m.getBoundingClientRect();
  return { count: document.querySelectorAll('svg[id$="medallion"]').length, svgInM: m.querySelectorAll('svg').length,
    name: g('name-text')?.textContent, bands,
    eyesL: m.querySelectorAll('[id$="K-eye-l"]').length, eyesR: m.querySelectorAll('[id$="K-eye-r"]').length,
    emotion: m.dataset.emotion,
    ribbonOp: getComputedStyle(g('ribbon')).opacity, bandsOp: getComputedStyle(g('bands')).opacity, heartOp: getComputedStyle(g('heart')).opacity,
    heartFill: [...g('heart').querySelectorAll('path')].map(p => getComputedStyle(p).fill).slice(0,3),
    figMask: g('figure').getAttribute('mask'), revealT: g('reveal-rect').style.transform, edgeOp: getComputedStyle(g('reveal-edge')).opacity,
    rect: [r.left, r.top, r.width, r.height], vw: innerWidth };
}"""
OLD = """() => ({ old: document.querySelectorAll('[data-testid=face-cameo],[data-testid=face-hoop],[data-testid=opening-cameo],[data-testid=band-text-cameo],.hk,[class*=" hk-"],[class^="hk-"]').length,
  overflow: (() => { let w = 0; document.querySelectorAll('body *').forEach(e => { if (e.closest('.mist-layer')) return; const r = e.getBoundingClientRect(); if (r.width && r.right > w && getComputedStyle(e).position !== 'fixed') w = r.right; }); return [document.documentElement.scrollWidth, innerWidth, Math.round(w)]; })() })"""

def check_bands(tag, info, expect=None):
    for i, b in enumerate(info["bands"]):
        if not b or not b["text"]: continue
        should = b["nat"] > b["max"]
        rep(f"{tag} band-{i+1} textLength only if long ('{b['text']}' nat={b['nat']:.0f} max={b['max']} tl={b['tl']})", bool(b["tl"]) == should)
    txt = [b["text"] for b in info["bands"] if b]
    rep(f"{tag} bands not default", not any("FAITH IN ME" in t for t in txt), txt)
    if expect: rep(f"{tag} bands match husband", txt[:len(expect)] == expect, txt)

async def meet(ctx, path, tag, w, h, expect):
    pg = await ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.set_viewport_size({"width": w, "height": h})
    await pg.goto(BASE + path); await pg.wait_for_selector('[data-testid=meet-cameo] [data-testid=medallion] svg', timeout=20000)
    await pg.wait_for_timeout(2500)
    i = await pg.evaluate(INSPECT, '[data-testid=meet-cameo] [data-testid=medallion]')
    o = await pg.evaluate(OLD)
    rep(f"{tag} one medallion", i["count"] == 1 and i["svgInM"] == 1, (i["count"], i["svgInM"]))
    rep(f"{tag} ribbon name", i["name"] == "meet Jasper", i["name"])
    rep(f"{tag} ribbon visible", float(i["ribbonOp"]) == 1 and float(i["bandsOp"]) == 1, (i["ribbonOp"], i["bandsOp"]))
    rep(f"{tag} single eye set", i["eyesL"] == 1 and i["eyesR"] == 1)
    rep(f"{tag} no old face", o["old"] == 0, o["old"])
    rep(f"{tag} no h-overflow", o["overflow"][0] <= o["overflow"][1] and o["overflow"][2] <= o["overflow"][1] + 1, o["overflow"])
    x, y, ww, hh = i["rect"]
    rep(f"{tag} medallion not cropped horizontally", x >= 0 and x + ww <= w + 0.5, i["rect"])
    rep(f"{tag} brooch red", all(f == "rgb(179, 38, 58)" for f in i["heartFill"]) and i["heartFill"], i["heartFill"])
    check_bands(tag, i, expect)
    await pg.evaluate("document.querySelector('[data-testid=meet-cameo]').scrollIntoView({block:'center'})")
    await pg.wait_for_timeout(300)
    await pg.screenshot(path=f"{OUT}/i18_{tag}.jpg", quality=40)
    return pg, errs

async def taps(pg, tag):
    # wait until any auto emotion is gone
    await pg.wait_for_timeout(2600)
    seen = []
    for k in range(6):
        await pg.click('[data-testid=face-tap-target]', force=True)
        await pg.wait_for_timeout(350)
        e = await pg.get_attribute('[data-testid=meet-cameo] [data-testid=medallion]', 'data-emotion'); seen.append(e)
        if e == "hearts":
            await pg.wait_for_timeout(500)
            he = await pg.evaluate("""() => { const g = document.querySelector('[data-testid=meet-cameo] [id$="K-hearteyes"]');
               return [getComputedStyle(g).opacity, [...g.querySelectorAll('path')].map(p=>getComputedStyle(p).fill).filter((v,i,a)=>a.indexOf(v)===i)]; }""")
            rep(f"{tag} hearts eyes op~1 + red", float(he[0]) > 0.95 and "rgb(179, 38, 58)" in he[1], he)
            await pg.screenshot(path=f"{OUT}/i18_{tag}_hearts.jpg", quality=40)
        if k < 5: await pg.wait_for_timeout(150)
    rep(f"{tag} tap cycle", seen == ["smile", "wink", "blush", "hearts", "shy", "kiss"], seen)
    await pg.wait_for_timeout(2800)
    e = await pg.get_attribute('[data-testid=meet-cameo] [data-testid=medallion]', 'data-emotion')
    rep(f"{tag} back to idle", e == "idle", e)

async def main():
    which = sys.argv[1] if len(sys.argv) > 1 else "all"
    async with async_playwright() as p:
        br = await p.chromium.launch()
        expect = ["PATIENCE · COFFEE", "PANCAKES · SMALL THINGS"]
        if which in ("all", "meet"):
            ctx = await br.new_context()
            for path, tag in ((f"/meet/{HID}", "meet"), (f"/h/{HID}", "pub")):
                for w, h in ((390, 844), (1280, 800)):
                    pg, errs = await meet(ctx, path, f"{tag}{w}", w, h, expect)
                    if w == 390: await taps(pg, f"{tag}{w}")
                    rep(f"{tag}{w} no page errors", not errs, errs[:2]); await pg.close()
            await ctx.close()
        if which in ("all", "reduce"):
            ctx = await br.new_context(reduced_motion="reduce")
            pg = await ctx.new_page(); await pg.set_viewport_size({"width": 390, "height": 844})
            await pg.goto(BASE + f"/meet/{HID}"); await pg.wait_for_selector('[data-testid=meet-cameo] [data-testid=medallion] svg')
            vals = set(); eye = set()
            for _ in range(24):
                vals.add(await pg.get_attribute('[data-testid=meet-cameo] [data-testid=medallion]', 'data-emotion'))
                eye.add(await pg.evaluate("""() => document.querySelector('[data-testid=meet-cameo] [id$="K-eye-l"]').style.transform"""))
                await pg.wait_for_timeout(500)
            rep("reduced: emotion stays smile", vals == {"smile"}, vals)
            rep("reduced: no blinking (eye transform constant)", len(eye) == 1, eye)
            await ctx.close()
        await br.close()
    print("SUMMARY", sum(ok for _, ok in R), "/", len(R))

asyncio.run(main())
