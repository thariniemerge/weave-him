# Iteration 17: zoomed cameo shots + art-only (opening hidden) to locate remnants outside the opening
import asyncio, sys
from playwright.async_api import async_playwright
BASE = open("/app/frontend/.env").read().split("REACT_APP_BACKEND_URL=")[1].split()[0].rstrip("/")
OUT = "/app/.screenshots"

async def main():
    bn = sys.argv[1] if len(sys.argv) > 1 else "chromium"
    async with async_playwright() as pw:
        b = await getattr(pw, bn).launch()
        ctx = await b.new_context(viewport={"width": 1280, "height": 800}, device_scale_factor=2)
        p = await ctx.new_page()
        await p.goto(BASE + "/meet/a5yxsmhb", wait_until="networkidle")
        await p.wait_for_timeout(3500)
        face = p.locator('[data-testid=face-cameo]').first
        await face.evaluate("e => e.scrollIntoView({block:'center'})")
        await p.wait_for_timeout(1200)
        o = await p.locator('[data-testid=opening-cameo]').bounding_box()
        clip = {"x": o["x"] - 30, "y": o["y"] - 30, "width": o["width"] + 60, "height": o["height"] + 70}
        await p.screenshot(path=f"{OUT}/i17_zoom_{bn}.png", clip=clip)
        # what's behind: hide the opening and band svgs -> art only
        await p.evaluate("""() => { const f = document.querySelector('[data-testid=face-cameo]'); f.style.visibility='hidden';
          const bt=document.querySelector('[data-testid=band-text-cameo]'); if (bt) bt.style.visibility='hidden'; }""")
        await p.wait_for_timeout(300)
        await p.screenshot(path=f"{OUT}/i17_artonly_{bn}.png", clip=clip)
        # outline opening over art
        await p.evaluate("""() => { const f = document.querySelector('[data-testid=face-cameo]'); f.style.visibility='visible';
          const op=document.querySelector('[data-testid=opening-cameo]'); op.style.background='transparent'; op.querySelector('.hk-move').style.visibility='hidden';
          op.style.outline='none'; op.style.boxShadow='inset 0 0 0 2px red'; f.querySelectorAll('svg').forEach(s=>{ if(!op.contains(s)) s.style.visibility='hidden'; }); }""")
        await p.wait_for_timeout(300)
        await p.screenshot(path=f"{OUT}/i17_outline_{bn}.png", clip=clip)
        # list siblings of face (what draws the art?)
        info = await p.evaluate("""() => { const f=document.querySelector('[data-testid=face-cameo]'); const par=f.parentElement;
          return [...par.children].map(c=>c.tagName+'|'+(c.dataset.testid||'')+'|'+(c.getAttribute('src')||'').slice(-40)+'|'+c.className.toString().slice(0,60)); }""")
        print(o, info)
        await b.close()
asyncio.run(main())
