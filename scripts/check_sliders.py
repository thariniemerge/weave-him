"""Drags every temperament heart hard past both ends (mouse + touch, 390 and 1280) and checks it stays on the thread."""
import asyncio, sys
from pathlib import Path
from playwright.async_api import async_playwright

URL = sys.argv[1].rstrip("/")
OUT = Path("/app/frontend/public/recordings/sliders"); OUT.mkdir(parents=True, exist_ok=True)
KEYS = ["out", "love", "feel"]


async def geo(p, k):
    return await p.evaluate("""k => { const r = e => e.getBoundingClientRect();
      const t = r(document.querySelector(`[data-testid=slider-track-${k}] img`)), h = r(document.querySelector(`[data-testid=slider-heart-${k}]`));
      const l = document.querySelector(`[data-testid=slider-card-${k}] .woven-thread + .woven-thread`).children;
      return { v: +document.querySelector(`[data-testid=slider-${k}]`).value, hc: h.left + h.width / 2, hy: h.top + h.height / 2,
        tl: t.left, tr: t.right, ty: t.top + t.height / 2, ll: r(l[0]).left, lr: r(l[1]).right }; }""", k)


async def drag(p, cdp, k, x0, x1, y, touch):
    if touch:
        for typ, x in [("touchStart", x0)] + [("touchMove", x0 + (x1 - x0) * i / 12) for i in range(1, 13)] + [("touchEnd", None)]:
            await cdp.send("Input.dispatchTouchEvent", {"type": typ, "touchPoints": [] if x is None else [{"x": x, "y": y}]})
            await p.wait_for_timeout(16)
    else:
        await p.mouse.move(x0, y); await p.mouse.down(); await p.mouse.move(x1, y, steps=12); await p.mouse.up()


async def main():
    ok = True
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
        for name, size, touch in [("phone", {"width": 390, "height": 844}, True), ("desktop", {"width": 1280, "height": 800}, False)]:
            ctx = await b.new_context(viewport=size, is_mobile=touch, has_touch=touch, device_scale_factor=2 if touch else 1)
            p = await ctx.new_page(); cdp = await ctx.new_cdp_session(p)
            await p.goto(URL + "/strand/5", wait_until="networkidle"); await p.wait_for_timeout(1500)
            for k in KEYS:
                await p.locator(f"[data-testid=slider-card-{k}]").scroll_into_view_if_needed()
                for end, far in [(0, -400), (100, 400)]:
                    for dev in (["touch", "mouse"] if touch else ["mouse"]):
                        g = await geo(p, k)
                        await drag(p, cdp, k, g["hc"], g["hc"] + far, g["ty"], dev == "touch")
                        await p.wait_for_timeout(250)
                        g = await geo(p, k)
                        edge = g["tl"] if end == 0 else g["tr"]
                        good = g["v"] == end and abs(g["hc"] - edge) <= 1 and abs(g["hy"] - g["ty"]) <= 1
                        ok &= good
                        print(name, k, dev, f"{end}%", "value", g["v"], "heart-x minus thread end", round(g["hc"] - edge, 1), "heart-y minus thread-y", round(g["hy"] - g["ty"], 1), "PASS" if good else "FAIL")
                    await p.locator(f"[data-testid=slider-card-{k}]").screenshot(path=str(OUT / f"{name}-{k}-{end}.png"))
                g = await geo(p, k)
                print(name, k, "labels: left edge vs thread", round(g["ll"] - g["tl"], 1), "right edge vs thread", round(g["lr"] - g["tr"], 1))
                await p.focus(f"[data-testid=slider-{k}]")
                for _ in range(5): await p.keyboard.press("ArrowRight")
                v = (await geo(p, k))["v"]
                for _ in range(10): await p.keyboard.press("ArrowLeft")
                print(name, k, "keyboard: +5 ->", v, "| then -10 ->", (await geo(p, k))["v"])
            await ctx.close()
        await b.close()
    print("ALL PASS" if ok else "SOME FAILED")

asyncio.run(main())
