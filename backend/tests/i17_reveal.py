# Iteration 17: share reveal card (server image) + forced client ShareCard fallback, chromium + webkit
import asyncio
from playwright.async_api import async_playwright
BASE = open("/app/frontend/.env").read().split("REACT_APP_BACKEND_URL=")[1].split()[0].rstrip("/")
OUT = "/app/.screenshots"

async def one(pw, bn, w, h, block):
    b = await getattr(pw, bn).launch()
    ctx = await b.new_context(viewport={"width": w, "height": h})
    p = await ctx.new_page()
    errs = []; p.on("pageerror", lambda e: errs.append(str(e)))
    if block:
        await p.route("**/card.jpg*", lambda r: r.abort())
    await p.goto(BASE + "/meet/a5yxsmhb", wait_until="networkidle")
    await p.wait_for_timeout(2500)
    await p.locator('[data-testid=share-him-button]').evaluate("e => e.click()")
    await p.wait_for_timeout(7000)
    rv = p.locator('[data-testid=share-reveal]')
    img = p.locator('[data-testid=share-reveal-image]')
    src = (await img.get_attribute("src"))[:60] if await img.count() else None
    ch = p.locator('[data-testid=card-husband]')
    chinfo = await ch.first.evaluate("e => { const s=getComputedStyle(e); const b=e.getBoundingClientRect(); return {clip:s.clipPath||s.webkitClipPath, ov:s.overflow, br:s.borderRadius, w:b.width, h:b.height}; }") if await ch.count() else None
    tag = f"{bn}_{w}{'_fallback' if block else ''}"
    await p.screenshot(path=f"{OUT}/i17_reveal_{tag}.png")
    print(tag, "reveal:", await rv.count(), "img src:", src, "card-husband:", chinfo, "errors:", errs)
    await b.close()

async def main():
    async with async_playwright() as pw:
        for bn in ["chromium", "webkit"]:
            for w, h in [(390, 844), (1280, 800)]:
                for block in [False, True]:
                    try: await one(pw, bn, w, h, block)
                    except Exception as e: print(bn, w, block, "FAIL", str(e)[:200])
asyncio.run(main())
