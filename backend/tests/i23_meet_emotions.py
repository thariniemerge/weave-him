"""Iteration 23: Meet him 7-frame emotions (layers, intro wink, tap cycle, tap ignore, one-layer invariant) + share video frames + download."""
import asyncio, sys
from playwright.async_api import async_playwright

URL = sys.argv[1].rstrip("/")
IDS = sys.argv[2:] or ["4dxnbdm4", "dx22jcd8"]
SAMPLER = """(() => { window.__s = { maxAbove: 0, bad: [], first: {}, med: null, t0: performance.now() };
  const f = () => { const m = document.querySelector('[data-testid=medallion]'); const t = Math.round(performance.now() - window.__s.t0);
    if (m) { if (window.__s.med === null && m.querySelectorAll('[data-expr]').length) window.__s.med = t;
      const L = [...m.querySelectorAll('[data-expr]')]; const above = L.filter(e => +getComputedStyle(e).opacity > 0.02);
      window.__s.maxAbove = Math.max(window.__s.maxAbove, above.length);
      if (above.length > 1) window.__s.bad.push([t, above.map(e => e.dataset.expr + ':' + (+getComputedStyle(e).opacity).toFixed(2))]);
      L.forEach(e => { if (+getComputedStyle(e).opacity > 0.5 && !(e.dataset.expr in window.__s.first)) window.__s.first[e.dataset.expr] = t; }); }
    requestAnimationFrame(f); }; requestAnimationFrame(f); })()"""
FAIL = []


def check(c, m):
    print(("PASS " if c else "FAIL ") + m)
    if not c:
        FAIL.append(m)


async def emo(p):
    return await p.get_attribute("[data-testid=medallion]", "data-emotion")


async def meet(b, hid, mobile):
    size = {"width": 390, "height": 844} if mobile else {"width": 1280, "height": 800}
    ctx = await b.new_context(viewport=size, is_mobile=mobile, has_touch=mobile)
    p = await ctx.new_page()
    reqs = []
    p.on("request", lambda r: reqs.append(r.url) if "/assets/husbands/" in r.url else None)
    await p.add_init_script(SAMPLER)
    await p.goto(f"{URL}/meet/{hid}", wait_until="domcontentloaded")
    await p.wait_for_selector("[data-testid=face-tap-target]", timeout=30000)
    exprs = await p.evaluate("() => [...document.querySelectorAll('[data-testid=medallion] [data-expr]')].map(e => e.dataset.expr)")
    check(exprs == ["blink", "wink", "blush", "heart_eyes", "kiss", "shy"], f"{hid}: layers {exprs}")
    await p.wait_for_timeout(2900)
    s = await p.evaluate("window.__s")
    wink_at = s["first"].get("wink")
    print(f"   medallion layers mounted at {s['med']}ms, wink >0.5 at {wink_at}ms, first={s['first']}")
    check(wink_at is not None and 900 <= wink_at - s["med"] <= 1900, f"{hid}: intro wink ~1s after appear (delta {wink_at and wink_at - s['med']}ms incl. 300ms fade-in)")
    seq, ignored_ok = [], []
    for k in range(6):
        for _ in range(40):
            if await emo(p) in (None, "neutral"):
                break
            await p.wait_for_timeout(100)
        await p.wait_for_timeout(450)  # past any blink
        await p.click("[data-testid=face-tap-target]")
        await p.wait_for_timeout(120)
        e1 = await emo(p)
        await p.click("[data-testid=face-tap-target]")  # during the emotion -> ignored
        await p.wait_for_timeout(120)
        e2 = await emo(p)
        seq.append(e1); ignored_ok.append(e1 == e2)
    print("   tap seq", seq)
    check(seq == ["wink", "blush", "heart_eyes", "kiss", "shy", "wink"], f"{hid}: tap cycle {seq}")
    check(all(ignored_ok), f"{hid}: tap during emotion ignored {ignored_ok}")
    await p.wait_for_timeout(4000)  # some autoplay
    s = await p.evaluate("window.__s")
    print(f"   sampled for {round((await p.evaluate('performance.now()') - s['t0'])/1000,1)}s")
    check(s["maxAbove"] <= 1, f"{hid}: max layers above 0.02 = {s['maxAbove']} bad={s['bad'][:3]}")
    stale = [u for u in reqs if "smile" in u or "brow_raise" in u]
    check(not stale, f"{hid}: no smile/brow_raise requests {stale[:2]}")
    check(all("v=7" in u for u in reqs if "/weave-him-bloom/" in u or any(x in u for x in ["/neutral.", "/wink."])), f"{hid}: expression frames use ?v=7 ({[u.split('/assets')[1] for u in reqs if 'wink' in u][:1]})")
    if hid == IDS[0] and mobile:
        await p.click("[data-testid=share-him-button]")
        await p.wait_for_timeout(1500)
        try:
            async with p.expect_download(timeout=90000) as dl:
                await p.click("[data-testid=reveal-video-button]")
            d = await dl.value
            path = f"/tmp/i23_{d.suggested_filename}"
            await d.save_as(path)
            import os
            check(os.path.getsize(path) > 50000, f"video download {d.suggested_filename} {os.path.getsize(path)} bytes")
        except Exception as ex:
            check(False, f"video download: {ex}")
    await ctx.close()


async def frames(b, hid):
    ctx = await b.new_context(viewport={"width": 1280, "height": 1400})
    p = await ctx.new_page()
    await p.goto(f"{URL}/card/{hid}?frames=0.95,2.2,4.2,5.9", wait_until="domcontentloaded")
    await p.wait_for_selector("[data-frames-ready='1']", timeout=60000)
    check(True, "frames-ready=1")
    await p.wait_for_timeout(500)
    await p.screenshot(path="/tmp/i23_frames.jpg", quality=40, type="jpeg")
    await ctx.close()


async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
        for i, hid in enumerate(IDS):
            await meet(b, hid, mobile=(i == 0))
        await frames(b, IDS[0])
        await b.close()
    print("FAILS:", len(FAIL)); [print(" -", f) for f in FAIL]

asyncio.run(main())
