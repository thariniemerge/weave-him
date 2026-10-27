# Iteration 17: cameo clip check in Chromium + WebKit (meet, husband page, share reveal)
import asyncio, json, sys
from playwright.async_api import async_playwright

BASE = open("/app/frontend/.env").read().split("REACT_APP_BACKEND_URL=")[1].split()[0].rstrip("/")
OUT = "/app/.screenshots"
SIZES = [(390, 844), (1280, 800)]

JS_INFO = """() => {
  const q = s => document.querySelector(s);
  const r = el => { if (!el) return null; const b = el.getBoundingClientRect(); return {x:b.x,y:b.y,w:b.width,h:b.height}; };
  const op = q('[data-testid=opening-cameo]');
  const cs = op ? getComputedStyle(op) : null;
  const bt = q('[data-testid=band-text-cameo]');
  const lines = [...document.querySelectorAll('[data-testid^=band-line-]')].map(t => {
    const tp = t.querySelector('textPath'); let n = 0, ok = 0;
    try { n = t.getNumberOfChars(); for (let i=0;i<n;i++){ try { const e = t.getExtentOfChar(i); if (e.width>0) ok++; } catch(_){} } } catch(_){}
    return {text: t.textContent, tl: tp && tp.getAttribute('textLength'), n, ok, box: r(t)};
  });
  return { opening: r(op), clip: cs && (cs.clipPath || cs.webkitClipPath), wclip: cs && cs.webkitClipPath,
    br: cs && cs.borderRadius, ov: cs && cs.overflow, bandClip: bt && (getComputedStyle(bt).clipPath || getComputedStyle(bt).webkitClipPath),
    face: r(q('[data-testid=face-cameo]')), lines,
    ribbon: [...document.querySelectorAll('[data-testid*=ribbon], [data-testid*=meet-name]')].map(e => ({id:e.dataset.testid, t:e.textContent.trim().slice(0,40), b:r(e)})),
    emotion: q('[data-testid=face-cameo]')?.dataset.emotion };
}"""

async def run(pw, bname, path, tag):
    b = await getattr(pw, bname).launch(**({"executable_path": None} if False else {}))
    res = []
    for w, h in SIZES:
        ctx = await b.new_context(viewport={"width": w, "height": h}, device_scale_factor=2 if w == 390 else 1)
        p = await ctx.new_page()
        errs = []
        p.on("pageerror", lambda e: errs.append(str(e)))
        await p.goto(BASE + path, wait_until="networkidle", timeout=60000)
        await p.wait_for_timeout(3500)
        # reveal anything gated by scroll
        face = p.locator('[data-testid=face-cameo]').first
        info = {"browser": bname, "w": w, "path": path, "errors": errs}
        if await face.count():
            await face.evaluate("e => e.scrollIntoView({block: \"center\"})")
            await p.wait_for_timeout(1500)
            info.update(await p.evaluate(JS_INFO))
            fb = await face.bounding_box()
            # cameo frame screenshot: parent art box
            await p.screenshot(path=f"{OUT}/i17_{tag}_{bname}_{w}.png", clip={"x": max(fb["x"]-10,0), "y": max(fb["y"]-10,0), "width": fb["width"]+20, "height": fb["height"]+60})
            await p.screenshot(path=f"{OUT}/i17_{tag}_{bname}_{w}_view.png")
            tt = p.locator('[data-testid=face-tap-target]').first
            ems = []
            if await tt.count():
                for _ in range(3):
                    await tt.click(force=True); await p.wait_for_timeout(300)
                    ems.append(await face.get_attribute("data-emotion"))
            info["emotions"] = ems
        else:
            info["missing_face"] = True
            await p.screenshot(path=f"{OUT}/i17_{tag}_{bname}_{w}_view.png")
        res.append(info)
        await ctx.close()
    await b.close()
    return res

async def main():
    path, tag = sys.argv[1], sys.argv[2]
    async with async_playwright() as pw:
        out = []
        for bn in (sys.argv[3].split(",") if len(sys.argv)>3 else ["chromium","webkit"]):
            try:
                out += await run(pw, bn, path, tag)
            except Exception as e:
                out.append({"browser": bn, "fatal": str(e)[:300]})
        print(json.dumps(out, indent=1))

asyncio.run(main())
