"""Records the opening intro on a phone and a desktop viewport (dev only)."""
import asyncio
import shutil
import sys
from pathlib import Path
from playwright.async_api import async_playwright

URL = sys.argv[1]
OUT = Path("/app/frontend/public/recordings")
OUT.mkdir(exist_ok=True)


async def rec(pw, name, size, mobile, reduce=False):
    b = await pw.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox", "--autoplay-policy=no-user-gesture-required"])
    tmp = Path(f"/tmp/rec_{name}")
    shutil.rmtree(tmp, ignore_errors=True)
    ctx = await b.new_context(viewport=size, is_mobile=mobile, has_touch=mobile, device_scale_factor=2 if mobile else 1,
                              record_video_dir=str(tmp), record_video_size=size, reduced_motion="reduce" if reduce else "no-preference")
    p = await ctx.new_page()
    errs = []
    p.on("pageerror", lambda e: errs.append(str(e)))
    await p.goto(URL, wait_until="networkidle")
    await p.wait_for_timeout(2500)
    shown = await p.locator("[data-testid=intro-veil]").count()
    if mobile:
        await p.tap("[data-testid=intro-veil-enter]")
    else:
        await p.keyboard.press("Enter")
    await p.wait_for_timeout(4500)
    gone = await p.locator("[data-testid=intro-veil]").count()
    focused = await p.evaluate("document.activeElement?.dataset?.testid")
    await p.screenshot(path=f"/tmp/after_{name}.png")
    await ctx.close()
    vid = next(tmp.glob("*.webm"))
    shutil.copy(vid, OUT / f"intro-{name}.webm")
    await b.close()
    print(name, "shown", shown, "removed", gone == 0, "focus", focused, "errors", errs)


async def main():
    async with async_playwright() as pw:
        await rec(pw, "phone", {"width": 390, "height": 844}, True)
        await rec(pw, "desktop", {"width": 1280, "height": 800}, False)
        await rec(pw, "phone-reduced", {"width": 390, "height": 844}, True, reduce=True)

asyncio.run(main())
