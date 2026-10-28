"""Records one full weave on desktop, from question I to Meet him, answering through the real UI (dev only)."""
import asyncio
import shutil
import sys
from pathlib import Path
from playwright.async_api import async_playwright

URL = sys.argv[1].rstrip("/")
OUT = Path("/app/frontend/public/recordings")
NEXT = ["weave-strand-button", "next-remembers-button", "next-feel-button", "next-interests-button", "next-musts-button"]


async def click_next(p):
    for t in NEXT:
        b = p.locator(f"[data-testid={t}]")
        if await b.count() and await b.first.is_visible() and await b.first.is_enabled():
            await b.first.click()
            return t


async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
        tmp = Path("/tmp/rec_full")
        shutil.rmtree(tmp, ignore_errors=True)
        size = {"width": 1280, "height": 800}
        ctx = await b.new_context(viewport=size, record_video_dir=str(tmp), record_video_size=size)
        p = await ctx.new_page()
        await p.goto(URL + "/strand/1", wait_until="networkidle")
        await p.evaluate("sessionStorage.clear()")
        await p.goto(URL + "/strand/1", wait_until="networkidle")
        await p.wait_for_timeout(1200)
        for n in range(1, 10):
            opt = p.locator("[data-testid^=option-]")
            for sel in ["[data-testid^=option-]", "[data-testid^=remember-chip-]", "[data-testid^=interest-chip-]"]:
                loc = p.locator(sel)
                if await loc.count():
                    await loc.nth(1 if sel == "[data-testid^=option-]" and n in (2, 3) else 0).click()
                    break
            await p.wait_for_timeout(700)
            por = await p.get_attribute("[data-testid=building-husband] [data-testid=medallion]", "data-portrait")
            print("strand", n, "leader", por, "->", await click_next(p))
            await p.wait_for_timeout(1300)
        for m in ["calm", "time", "family"]:
            await p.click(f"[data-testid=must-chip-{m}]")
            await p.wait_for_timeout(1300)
        await p.click("[data-testid=weave-him-musts-button]")
        await p.wait_for_url("**/bands", timeout=8000)
        await p.wait_for_timeout(3200)
        await p.click("[data-testid=weave-him-button]")
        await p.wait_for_timeout(2200)
        await p.screenshot(path="/tmp/weaving_mid.png")
        await p.wait_for_url("**/meet/**", timeout=25000)
        await p.wait_for_timeout(6500)
        print("meet", p.url.rsplit("/", 1)[-1], await p.get_attribute("[data-testid=medallion]", "data-portrait"))
        await ctx.close()
        shutil.copy(next(tmp.glob("*.webm")), OUT / "full-weave-desktop.webm")
        await b.close()

asyncio.run(main())
