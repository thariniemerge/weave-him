"""Records all 7 strands on desktop and checks every frame that the panel husband is never unmasked or shrinking (dev only)."""
import asyncio
import shutil
import sys
from pathlib import Path
from playwright.async_api import async_playwright

URL = sys.argv[1].rstrip("/")
OUT = Path("/app/frontend/public/recordings")
OUT.mkdir(exist_ok=True)

WATCH = """() => new Promise((res) => {
  const out = []; const t0 = performance.now();
  const f = () => {
    const m = document.querySelectorAll('[data-testid=building-husband] [id$="figure"]');
    const r = document.querySelector('[data-testid=building-husband] [id$="reveal-rect"]');
    out.push({ n: m.length, mask: m[0]?.getAttribute('mask') || null, y: r ? new DOMMatrix(getComputedStyle(r).transform).f : null, id: r?.id });
    if (performance.now() - t0 < 1300) requestAnimationFrame(f); else res(out);
  };
  f();
})"""


async def next_step(p):
    for sel in ["[data-testid=weave-strand-button]", "[data-testid=next-remembers-button]", "[data-testid=next-feel-button]"]:
        b = p.locator(sel)
        if await b.count() and await b.first.is_visible():
            await b.first.click()
            return


async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
        tmp = Path("/tmp/rec_strands")
        shutil.rmtree(tmp, ignore_errors=True)
        size = {"width": 1280, "height": 800}
        ctx = await b.new_context(viewport=size, record_video_dir=str(tmp), record_video_size=size)
        p = await ctx.new_page()
        await p.goto(URL + "/strand/1", wait_until="networkidle")
        await p.evaluate("sessionStorage.clear()")
        await p.goto(URL + "/strand/1", wait_until="networkidle")
        await p.wait_for_timeout(1200)
        ids, prev_y = set(), 600
        for n in range(1, 8):
            opt = p.locator("[data-testid^=option-]")
            chip = p.locator("[data-testid^=remember-chip-]")
            if await opt.count():
                await opt.first.click()
            elif await chip.count():
                await chip.first.click()
            await p.wait_for_timeout(700)
            watch = asyncio.ensure_future(p.evaluate(WATCH))
            await next_step(p)
            frames = await watch
            bad = [f for f in frames if f["n"] and (not f["mask"] or (f["y"] is not None and f["y"] > prev_y + 0.5))]
            ids |= {f["id"] for f in frames if f["id"]}
            ys = [round(f["y"]) for f in frames if f["y"] is not None]
            print(f"after strand {n}: url={p.url.split('/', 3)[-1]} frames={len(frames)} bad={len(bad)} y {ys[:1]}..{ys[-1:] if ys else ''}")
            if ys:
                prev_y = min(ys)
            await p.wait_for_timeout(1300)
        print("medallion instances across strands:", ids)
        await p.wait_for_timeout(3000)
        await p.click("[data-testid=weave-him-button]")
        await p.wait_for_timeout(1500)
        y = await p.evaluate("""() => new DOMMatrix(getComputedStyle(document.querySelector('[data-testid=weaving-medallion] [id$="reveal-rect"]')).transform).f""")
        print("weaving starts at y", y)
        await p.wait_for_timeout(5000)
        print("ended at", p.url)
        await ctx.close()
        shutil.copy(next(tmp.glob("*.webm")), OUT / "strands-desktop.webm")
        await b.close()

asyncio.run(main())
