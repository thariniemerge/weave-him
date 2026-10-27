import os
os.makedirs("/app/test_reports/img/iter8", exist_ok=True)
BASE = "https://weave-him-bloom.internal.preview.emergentagent.com"
errs = []
page.on("pageerror", lambda e: errs.append(str(e)))
page.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)

JS = """(kind) => {
  const svg = document.querySelector(`[data-testid=band-text-${kind}]`);
  if (!svg) return null;
  const out = {lines: [], svgRect: svg.getBoundingClientRect().toJSON()};
  const ctm = svg.getScreenCTM();
  for (let i = 0; i < 3; i++) {
    const t = svg.querySelector(`[data-testid=band-line-${i}]`);
    if (!t) { out.lines.push(null); continue; }
    const tp = t.querySelector('textPath');
    const p = document.getElementById(`band-${kind}-${i}`);
    const bb = t.getBBox();
    out.lines.push({text: t.textContent, textLength: tp.getAttribute('textLength'), lengthAdjust: tp.getAttribute('lengthAdjust'),
      bbox: {x: bb.x, y: bb.y, w: bb.width, h: bb.height}, rect: t.getBoundingClientRect().toJSON(), pathLen: p.getTotalLength(),
      opacity: getComputedStyle(svg).opacity});
  }
  const strip = svg.querySelector('[data-testid=band-strip]');
  out.strip = strip ? strip.getBoundingClientRect().toJSON() : null;
  const rib = document.querySelector('[data-testid=ribbon-name]');
  out.ribbon = rib ? rib.getBoundingClientRect().toJSON() : null;
  return out;
}"""

async def check(vw, vh, tag):
    await page.set_viewport_size({"width": vw, "height": vh})
    await page.goto(f"{BASE}/meet/a5yxsmhb")
    await page.wait_for_selector("[data-testid=band-line-1]", timeout=15000)
    await page.wait_for_timeout(2500)
    r = await page.evaluate(JS, "cameo")
    for i, l in enumerate(r["lines"]):
        print(tag, i, l and (l["text"], l["textLength"], round(l["bbox"]["x"]), round(l["bbox"]["w"]), round(l["pathLen"]), round(l["rect"]["bottom"])))
    l2 = r["lines"][2]
    top = " · ".join([r["lines"][0]["text"], r["lines"][1]["text"]]).split(" · ")
    print(tag, "line2:", l2["text"], "len", len(l2["text"]), "words", len(l2["text"].split()), "repeat?", l2["text"] in top)
    print(tag, "line2 bottom", l2["rect"]["bottom"], "ribbon top", r["ribbon"]["top"], "ABOVE" if l2["rect"]["bottom"] < r["ribbon"]["top"] else "OVERLAP!")
    print(tag, "width ratio", round(l2["bbox"]["w"] / l2["pathLen"], 3), "x-range", round(l2["bbox"]["x"]), round(l2["bbox"]["x"] + l2["bbox"]["w"]), "(path 265-568)")
    cam = page.locator("[data-testid=meet-cameo]:visible").first
    await cam.screenshot(path=f"/app/test_reports/img/iter8/{tag}_cameo.jpeg", type="jpeg", quality=60)

try:
    await check(390, 844, "m390")
    await check(1280, 800, "d1280")
except Exception as e:
    print("ERR", e)
print("errors:", errs[:5])
