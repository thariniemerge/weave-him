"""Records the weaving screen from start to Meet him and logs the reveal line over time (dev only)."""
import asyncio
import json
import shutil
import sys
from pathlib import Path
from playwright.async_api import async_playwright

URL = sys.argv[1].rstrip("/")
OUT = Path("/app/frontend/public/recordings")
ANS = {"q1": [{"id": "coffee"}], "q2": [{"id": "pancakes"}], "q3": [{"id": "rehearse"}], "q4": [{"id": "small"}], "q7": [{"id": "safe"}],
       "remembers": [{"id": "mom"}, {"id": "jokes"}], "bandPick": ["PATIENCE", "COFFEE", "SMALL THINGS"]}

TRACE = """() => new Promise((res) => {
  const out = []; const t0 = performance.now(); let last = null;
  const f = () => {
    const r = document.querySelector('[data-testid=weaving-medallion] [id$="reveal-rect"]');
    const h = document.querySelector('[data-testid=weaving-medallion] [id$="-heart"]');
    const s = location.pathname.startsWith('/meet') ? 'MEET' : r ? `${Math.round(new DOMMatrix(getComputedStyle(r).transform).f)} heart=${(+getComputedStyle(h).opacity).toFixed(1)}` : '-';
    if (s !== last) { out.push(`${((performance.now() - t0) / 1000).toFixed(2)}s ${s}`); last = s; }
    if (s !== 'MEET' && performance.now() - t0 < 15000) requestAnimationFrame(f); else res(out);
  };
  f();
})"""


async def rec(pw, name, size, mobile, reduce=False, skip=False):
    b = await pw.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
    tmp = Path(f"/tmp/rec_{name}")
    shutil.rmtree(tmp, ignore_errors=True)
    ctx = await b.new_context(viewport=size, is_mobile=mobile, has_touch=mobile, device_scale_factor=2 if mobile else 1,
                              record_video_dir=str(tmp), record_video_size=size, reduced_motion="reduce" if reduce else "no-preference")
    p = await ctx.new_page()
    await p.goto(URL + "/bands", wait_until="networkidle")
    await p.evaluate(f"sessionStorage.setItem('weave-him-answers', {json.dumps(json.dumps(ANS))}); sessionStorage.removeItem('weave-him-last')")
    await p.goto(URL + "/bands", wait_until="networkidle")
    await p.wait_for_timeout(1500)
    trace = asyncio.ensure_future(p.evaluate(TRACE))
    await p.click("[data-testid=weave-him-button]")
    if skip:
        await p.wait_for_timeout(1500)
        await p.click("[data-testid=skip-to-him]")
    t = await trace
    try:
        t2 = await p.evaluate(TRACE)
    except Exception:
        t2 = []
    await p.wait_for_timeout(3000)
    await ctx.close()
    shutil.copy(next(tmp.glob("*.webm")), OUT / f"weaving-{name}.webm")
    await b.close()
    print(name, t, t2[-1:] if t2 else "")


async def main():
    async with async_playwright() as pw:
        await rec(pw, "phone", {"width": 390, "height": 844}, True)
        await rec(pw, "desktop", {"width": 1280, "height": 800}, False)
        if len(sys.argv) > 2:
            await rec(pw, "phone-reduced", {"width": 390, "height": 844}, True, reduce=True)
            await rec(pw, "skip", {"width": 390, "height": 844}, True, skip=True)

asyncio.run(main())
