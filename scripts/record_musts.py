"""Records picking must-haves with the live suitor check, then the weave through to Meet him (dev only)."""
import asyncio
import json
import shutil
import sys
from pathlib import Path
from playwright.async_api import async_playwright

URL = sys.argv[1].rstrip("/")
OUT = Path("/app/frontend/public/recordings")
ANS = {"q1": [{"id": "coffee"}], "q2": [{"id": "pancakes"}], "q3": [{"id": "rehearse"}], "q4": [{"id": "small"}], "q7": [{"id": "safe"}],
       "remembers": [{"id": "mom"}, {"id": "jokes"}], "goal": "serious", "interests": [{"id": "books"}, {"id": "coffee"}, {"id": "walks"}], "musts": []}
PICKS = ["calm", "time", "family", "honest"]


async def rec(pw, name, size, mobile):
    b = await pw.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
    tmp = Path(f"/tmp/rec_{name}")
    shutil.rmtree(tmp, ignore_errors=True)
    ctx = await b.new_context(viewport=size, is_mobile=mobile, has_touch=mobile, device_scale_factor=2 if mobile else 1,
                              record_video_dir=str(tmp), record_video_size=size)
    p = await ctx.new_page()
    errs = []
    p.on("pageerror", lambda e: errs.append(str(e)))
    await p.goto(URL + "/strand/9", wait_until="networkidle")
    await p.evaluate(f"sessionStorage.setItem('weave-him-answers', {json.dumps(json.dumps(ANS))}); sessionStorage.removeItem('weave-him-last')")
    await p.goto(URL + "/strand/9", wait_until="networkidle")
    await p.wait_for_timeout(1200)
    await p.click("[data-testid=next-musts-button]")
    await p.wait_for_timeout(1400)
    for m in PICKS:
        chip = p.locator(f"[data-testid=must-chip-{m}]")
        await chip.scroll_into_view_if_needed()
        await chip.click()
        await p.wait_for_timeout(250)
        nos = await p.locator(f"[data-testid$=-no-{m}]").count()
        if mobile:
            await p.locator("[data-testid=suitor-check]").scroll_into_view_if_needed()
        await p.wait_for_timeout(1500)
        if mobile:
            await p.locator("[data-testid=musts-card]").scroll_into_view_if_needed()
            await p.wait_for_timeout(400)
        print(name, m, "fails:", nos, "none-note:", await p.locator(f"[data-testid=suitor-check-none-{m}]").count())
    await p.fill("[data-testid=must-custom-input]", "Laughs at my puns")
    await p.click("[data-testid=must-custom-add]")
    await p.wait_for_timeout(300)
    await p.locator("[data-testid=suitor-check-none-custom]").scroll_into_view_if_needed()
    await p.wait_for_timeout(1800)
    await p.click("[data-testid=weave-him-musts-button]")
    await p.wait_for_timeout(600)
    print(name, "verdict:", await p.locator("[data-testid=suitor-check-verdict]").inner_text())
    await p.wait_for_timeout(2600)
    print(name, "after confirm:", p.url.rsplit("/", 1)[-1])
    await p.wait_for_timeout(1800)
    await p.click("[data-testid=weave-him-button]")
    await p.wait_for_url("**/meet/**", timeout=20000)
    await p.wait_for_timeout(2500)
    card = p.locator("[data-testid=musts-checklist]")
    await card.scroll_into_view_if_needed()
    await p.wait_for_timeout(800)
    print(name, "checklist:", (await card.inner_text()).replace("\n", " | "))
    await p.screenshot(path=f"/app/frontend/public/recordings/meet-musts-{name}.png")
    hid = p.url.rsplit("/", 1)[-1]
    await ctx.close()
    shutil.copy(next(tmp.glob("*.webm")), OUT / f"musts-{name}.webm")
    await b.close()
    print(name, "husband", hid, "errors", errs)


async def main():
    async with async_playwright() as pw:
        await rec(pw, "phone", {"width": 390, "height": 844}, True)
        await rec(pw, "desktop", {"width": 1280, "height": 800}, False)

asyncio.run(main())
