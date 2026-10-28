"""Records Meet him for two husbands tapping through every emotion, plus /bands and the last question (dev only)."""
import asyncio
import json
import shutil
import sys
from pathlib import Path
from playwright.async_api import async_playwright

URL = sys.argv[1].rstrip("/")
OUT = Path("/app/frontend/public/recordings")
HUSBANDS = {"golden-willow": "dx22jcd8", "sunlit-curls": "4dxnbdm4"}
ORDER = ["wink", "blush", "heart_eyes", "kiss", "shy"]
HOLD = {"wink": 0.9, "blush": 1.8, "heart_eyes": 1.8, "kiss": 1.5, "shy": 1.8}
ANS = {"q1": [{"id": "takeout"}], "q2": [{"id": "pancakes"}], "q3": [{"id": "laugh"}], "q4": [{"id": "lastbite"}], "q7": [{"id": "amused"}],
       "sliders": {"out": 80, "love": 50, "feel": 50}, "remembers": [{"id": "jokes"}], "goal": "serious", "interests": [{"id": "books"}], "musts": [{"id": "calm"}]}


async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
        size = {"width": 390, "height": 844}
        tmp = Path("/tmp/rec_emo")
        shutil.rmtree(tmp, ignore_errors=True)
        ctx = await b.new_context(viewport=size, is_mobile=True, has_touch=True, device_scale_factor=2, record_video_dir=str(tmp), record_video_size=size)
        p = await ctx.new_page()
        for slug, hid in HUSBANDS.items():
            await p.goto(f"{URL}/meet/{hid}", wait_until="networkidle")
            await p.wait_for_selector("[data-testid=medallion]")
            await p.wait_for_timeout(3600)  # reveal wink plays on its own
            seen = []
            for e in ORDER:
                await p.click("[data-testid=face-tap-target]")
                await p.wait_for_timeout(450)
                seen.append(await p.get_attribute("[data-testid=medallion]", "data-emotion"))
                await p.wait_for_timeout(int(HOLD[e] * 1000) + 500)
            print(slug, "played", seen, "ok" if seen == ORDER else "MISMATCH")
            await p.wait_for_timeout(1500)
        await ctx.close()
        shutil.copy(next(tmp.glob("*.webm")), OUT / "emotions-two-husbands.webm")
        ctx = await b.new_context(viewport=size, device_scale_factor=2)
        p = await ctx.new_page()
        await p.goto(URL + "/bands", wait_until="networkidle")
        await p.evaluate(f"sessionStorage.setItem('weave-him-answers', {json.dumps(json.dumps(ANS))})")
        await p.goto(URL + "/bands", wait_until="networkidle")
        await p.wait_for_timeout(2500)
        await p.screenshot(path=str(OUT / "bands-face-hidden.png"))
        await p.goto(URL + "/strand/9", wait_until="networkidle")
        await ctx.close()
        ctx = await b.new_context(viewport={"width": 1280, "height": 800})
        p = await ctx.new_page()
        await p.goto(URL + "/strand/9", wait_until="networkidle")
        await p.evaluate(f"sessionStorage.setItem('weave-him-answers', {json.dumps(json.dumps(ANS))})")
        await p.goto(URL + "/strand/9", wait_until="networkidle")
        await p.wait_for_timeout(2000)
        await p.screenshot(path=str(OUT / "strand9-face-hidden-desktop.png"))
        await p.goto(URL + "/strand/10", wait_until="networkidle")
        await p.wait_for_timeout(1500)
        await p.screenshot(path=str(OUT / "strand10-desktop.png"))
        await b.close()

asyncio.run(main())
