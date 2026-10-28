"""Records Welcome -> 'Commission your husband' -> two questions (phone + desktop), probing every frame that the panel
never stacks art in flow and the right side is never blank; then 6 taps on Meet him and the exported video (dev only)."""
import asyncio
import shutil
import sys
from pathlib import Path
from playwright.async_api import async_playwright

URL = sys.argv[1].rstrip("/")
OUT = Path("/app/frontend/public/recordings")
PROBE = """() => new Promise(res => { const o = []; const t0 = performance.now(); const f = () => {
  const mains = [...document.querySelectorAll('.page-cell')].map(m => +getComputedStyle(m).opacity);
  const panel = document.querySelector('[data-testid=art-panel] .panel-stack');
  const kids = panel ? [...panel.querySelectorAll(':scope > *, :scope > .panel-stack > *')].filter(k => k.getBoundingClientRect().height > 0).map(k => Math.round(k.getBoundingClientRect().top)) : [];
  o.push({ t: Math.round(performance.now() - t0), mains: mains.map(v => v.toFixed(2)).join('/'), maxOpacity: Math.max(...mains), panelTops: kids.join(',') });
  if (performance.now() - t0 < 900) requestAnimationFrame(f); else res(o); }; f(); })"""


async def run(b, name, size, mobile):
    tmp = Path(f"/tmp/rec_tr_{name}")
    shutil.rmtree(tmp, ignore_errors=True)
    ctx = await b.new_context(viewport=size, is_mobile=mobile, has_touch=mobile, device_scale_factor=2 if mobile else 1, record_video_dir=str(tmp), record_video_size=size)
    p = await ctx.new_page()
    await p.goto(URL + "/", wait_until="networkidle")
    await p.evaluate("sessionStorage.clear()")
    await p.goto(URL + "/", wait_until="networkidle")
    await p.wait_for_timeout(1500)
    if await p.locator("[data-testid=intro-veil-enter]").count():
        await p.click("[data-testid=intro-veil-enter]")
        await p.wait_for_timeout(5500)
    worst = 1
    for step, (click, after) in enumerate([("[data-testid=commission-button]", None), ("[data-testid^=option-]", "[data-testid=weave-strand-button]"), ("[data-testid^=option-]", "[data-testid=weave-strand-button]")]):
        if after:
            await p.locator(click).first.click()
            await p.wait_for_timeout(700)
            click = after
        probe = asyncio.ensure_future(p.evaluate(PROBE))
        await p.locator(click).first.click()
        frames = await probe
        low = min(f["maxOpacity"] for f in frames)
        worst = min(worst, low)
        tops = sorted({f["panelTops"] for f in frames if f["panelTops"]})
        print(name, "step", step, "-> lowest visible-page opacity", round(low, 2), "| distinct panel top sets", tops[:4])
        print("   ", [(f["t"], f["mains"]) for f in frames][::3][:14])
        await p.wait_for_timeout(1600)
    await ctx.close()
    shutil.copy(next(tmp.glob("*.webm")), OUT / f"transition-{name}.webm")
    return worst


async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
        for n, s, m in [("phone", {"width": 390, "height": 844}, True)][:int(sys.argv[2]) if len(sys.argv) > 2 else 2] + [("desktop", {"width": 1280, "height": 800}, False)][:0 if len(sys.argv) > 2 else 1]:
            print(n, "never blank:", (await run(b, n, s, m)) > 0.5)
        # Meet him: six taps, then the exported story video
        tmp = Path("/tmp/rec_taps")
        shutil.rmtree(tmp, ignore_errors=True)
        size = {"width": 390, "height": 844}
        ctx = await b.new_context(viewport=size, is_mobile=True, has_touch=True, device_scale_factor=2, record_video_dir=str(tmp), record_video_size=size, accept_downloads=True)
        p = await ctx.new_page()
        await p.goto(URL + "/meet/4dxnbdm4", wait_until="networkidle")
        await p.wait_for_selector("[data-testid=medallion]")
        await p.wait_for_timeout(3200)
        seen = []
        for _ in range(6):
            await p.click("[data-testid=face-tap-target]")
            await p.wait_for_timeout(400)
            seen.append(await p.get_attribute("[data-testid=medallion]", "data-emotion"))
            above = await p.evaluate("() => [...document.querySelectorAll('[data-testid=medallion] [data-expr]')].filter(e => +getComputedStyle(e).opacity > 0.02).length")
            seen.append(f"layers>{above}")
            await p.wait_for_timeout(2600)
        print("taps", seen)
        await p.click("[data-testid=share-him-button]")
        await p.wait_for_timeout(1500)
        async with p.expect_download(timeout=60000) as dl:
            await p.click("[data-testid=reveal-video-button]")
        d = await dl.value
        await d.save_as(str(OUT / "story-video-sunlit-curls.mp4"))
        await ctx.close()
        shutil.copy(next(tmp.glob("*.webm")), OUT / "meet-six-taps.webm")
        await b.close()

asyncio.run(main())
