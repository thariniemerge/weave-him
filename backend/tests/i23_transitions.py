"""Iteration 23: CSS PageStack crossfade probes (Welcome->strand1, strand->strand, ->bands->weaving->meet), phone CTA bar, back, reduced motion."""
import asyncio, json, sys
from playwright.async_api import async_playwright

URL = sys.argv[1].rstrip("/")
ANS = {"q1": [{"id": "takeout"}], "q2": [{"id": "pancakes"}], "q3": [{"id": "laugh"}], "q4": [{"id": "lastbite"}], "q7": [{"id": "amused"}],
       "sliders": {"out": 80, "love": 50, "feel": 50}, "remembers": [{"id": "jokes"}], "goal": "serious", "interests": [{"id": "books"}], "musts": [{"id": "calm"}]}
SEED = f"sessionStorage.setItem('weave-him-answers', {json.dumps(json.dumps(ANS))});"

PROBE = """(ms) => new Promise(res => { const o = []; const t0 = performance.now(); const f = () => {
  const cells = [...document.querySelectorAll('.page-cell')];
  const ops = cells.map(c => +getComputedStyle(c).opacity);
  const ctas = [...document.querySelectorAll('[data-testid^=strand-cta-bar]')].map(c => +getComputedStyle(c).opacity);
  const ps = document.querySelector('[data-testid=art-panel] .panel-stack');
  let kids = [];
  if (ps) kids = [...ps.querySelectorAll(':scope > div > .w-full, :scope > .panel-stack > *, :scope > div[class*=panel-]')]
     .map(k => { const r = k.getBoundingClientRect(); return { cls: k.className.split(' ').filter(c => c.startsWith('panel-')).join(), top: Math.round(r.top), h: Math.round(r.height), bh: !!k.querySelector('[data-testid=building-husband]') }; });
  const bm = document.querySelector('[data-testid=building-husband] [data-testid=medallion]');
  // transforms on animated page content
  const tf = cells.map(c => { const m = c.querySelector(':scope > main > *'); return m ? getComputedStyle(m).transform : '-'; });
  o.push({ t: Math.round(performance.now() - t0), n: cells.length, ops, max: Math.max(0, ...ops), ctas, kids, bmTop: bm ? Math.round(bm.getBoundingClientRect().top) : null, tf,
    docH: document.documentElement.scrollHeight });
  if (performance.now() - t0 < ms) requestAnimationFrame(f); else res(o); }; f(); })"""

FAIL = []


def check(cond, msg):
    print(("PASS " if cond else "FAIL ") + msg)
    if not cond:
        FAIL.append(msg)


def analyse(name, fr, desk, phone_cta=False):
    lo = min(f["max"] for f in fr)
    maxn = max(f["n"] for f in fr)
    two = [f["t"] for f in fr if f["n"] == 2]
    t2 = two[0] if two else 0
    late = [f["n"] for f in fr if f["t"] > t2 + 420]
    drops = [(fr[i]["t"], round(fr[i-1]["max"], 2), round(fr[i]["max"], 2)) for i in range(1, len(fr)) if fr[i-1]["max"] - fr[i]["max"] > 0.3]
    check(not drops, f"{name}: no single-frame visible-opacity drop > 0.3 {drops[:3]}")
    print(f"   2-cell window {two and (two[0], two[-1])} frames={len(fr)}")
    check(lo > 0.2, f"{name}: min max-page-opacity {lo:.2f} > 0.2")
    check(maxn <= 2, f"{name}: max page-cell count {maxn} <= 2")
    check(all(n == 1 for n in late), f"{name}: exactly 1 page-cell after 420ms ({sorted(set(late))})")
    if desk:
        tops = [f["bmTop"] for f in fr if f["bmTop"] is not None]
        if tops:
            check(max(tops) - min(tops) <= 14, f"{name}: building medallion top stable {min(tops)}..{max(tops)}")
        # all visible panel kids share the same top (same grid cell)
        cen = lambda f: [k["top"] + k["h"] / 2 for k in f["kids"] if k["h"] > 0]
        bad = [f for f in fr if cen(f) and max(cen(f)) - min(cen(f)) > 20]
        check(not bad, f"{name}: panel items never stacked in flow (bad frames {len(bad)}) {bad[:1] and bad[0]['kids']}")
    if phone_cta:
        vis = [max(f["ctas"] or [0]) for f in fr]
        check(min(vis) > 0.2, f"{name}: phone CTA bar never fully gone (min {min(vis):.2f})")
    print("   samples", [(f["t"], f["n"], [round(x, 2) for x in f["ops"]], f["bmTop"]) for f in fr][::3][:16])


CTA = "[data-testid=weave-strand-button],[data-testid=next-remembers-button],[data-testid=next-feel-button],[data-testid=next-interests-button],[data-testid=next-musts-button],[data-testid=weave-him-musts-button]"


def window(fr):
    i = next((k for k, f in enumerate(fr) if f["n"] == 2), None)
    if i is None:
        return fr[-30:]
    i = max(0, i - 2)
    return [dict(f, t=f["t"] - fr[i]["t"]) for f in fr[i:i + 45]]


async def probe_click(p, sel, ms=900):
    pr = asyncio.ensure_future(p.evaluate(PROBE, ms))
    await p.wait_for_timeout(16)
    await p.locator(sel).first.click()
    return await pr


async def run(b, name, size, mobile, reduce=False):
    ctx = await b.new_context(viewport=size, is_mobile=mobile, has_touch=mobile, reduced_motion="reduce" if reduce else "no-preference")
    p = await ctx.new_page()
    await p.goto(URL + "/", wait_until="networkidle")
    await p.evaluate("sessionStorage.clear()")
    await p.goto(URL + "/", wait_until="networkidle")
    await p.wait_for_timeout(1500)
    if await p.locator("[data-testid=intro-veil-enter]").count():
        await p.click("[data-testid=intro-veil-enter]")
        await p.wait_for_timeout(5000)
    await p.evaluate(SEED)
    desk = size["width"] >= 1024
    fr = await probe_click(p, "[data-testid=commission-button]")
    check(p.url.endswith("/strand/1"), f"{name}: welcome -> {p.url}")
    if reduce:
        # in reduce: any frame where a transform is not none, and fade length
        tfs = [t for f in fr for t in f["tf"] if t not in ("none", "-")]
        partial = [f for f in fr if any(0.05 < o < 0.95 for o in f["ops"])]
        print(f"   reduce: frames with non-none transform {len(tfs)} e.g. {tfs[:2]}; frames with partial opacity {len(partial)} span {partial and (partial[0]['t'], partial[-1]['t'])}")
        check(not tfs, f"{name}: reduced motion has no slide transform")
        check(len(partial) >= 4, f"{name}: reduced motion shows a ~200ms fade (partial-opacity frames {len(partial)})")
        await ctx.close(); return
    analyse(f"{name} welcome->s1", fr, desk, phone_cta=False)
    await p.wait_for_timeout(1200)
    await p.evaluate(SEED)
    await p.goto(URL + "/strand/1", wait_until="networkidle")
    await p.wait_for_timeout(1500)
    n = 1
    while "/strand/" in p.url and n < 12:
        fr = await probe_click(p, CTA, 6000 if p.url.endswith("/strand/10") else 1000)
        await p.wait_for_timeout(400)
        analyse(f"{name} s{n}->{p.url.split('/', 3)[-1]}", window(fr), desk, phone_cta=not desk)
        n += 1
        await p.wait_for_timeout(900)
    check(p.url.endswith("/bands"), f"{name}: reached {p.url}")
    # back from bands to strand 10, then forward again
    fr = await probe_click(p, "[data-testid=back-button]")
    await p.wait_for_timeout(500)
    check(p.url.endswith("/strand/10"), f"{name}: back -> {p.url}")
    analyse(f"{name} bands->back s10", fr, desk)
    musts = await p.locator("[data-testid=musts-card]").count() + await p.locator("[data-testid^=must-]").count()
    print("   musts testids", await p.evaluate("() => [...document.querySelectorAll('[data-testid*=must]')].slice(0,6).map(e=>e.dataset.testid)"))
    check(musts > 0, f"{name}: must-haves elements on strand 10 ({musts})")
    await p.wait_for_timeout(800)
    await p.locator(CTA).first.click()
    await p.wait_for_timeout(6000)
    # pick a band and weave
    chips = p.locator("[data-testid^=band-choice-]")
    if not await p.locator("[data-testid^=band-choice-][aria-pressed=true]").count():
        await chips.first.click(); await p.wait_for_timeout(300)
    fr = await probe_click(p, "[data-testid=weave-him-button]")
    analyse(f"{name} bands->weaving", fr, desk, phone_cta=False)
    w = await p.evaluate("() => [...document.querySelectorAll('[data-testid=weaving-medallion],[data-testid=medallion]')].map(m => m.dataset.woven)")
    check(all(x == "0" for x in w), f"{name}: weaving early woven flags {w}")
    # wait for weaving -> meet, probing the transition
    for _ in range(80):
        txt = await p.locator("[data-testid=weaving-strand-count]").inner_text() if await p.locator("[data-testid=weaving-strand-count]").count() else ""
        if "X of X" in txt:
            break
        await p.wait_for_timeout(250)
    fr = await p.evaluate(PROBE, 4500)
    seg = [f for f in fr if f["n"] == 2]
    check("/meet/" in p.url, f"{name}: weaving -> {p.url}")
    if seg:
        i0 = fr.index(seg[0]); sub = [dict(f, t=f["t"] - fr[i0]["t"]) for f in fr[i0:]]
        analyse(f"{name} weaving->meet", sub[:60], False)
    else:
        print("   no 2-cell frames seen for weaving->meet")
    await p.wait_for_timeout(2000)
    m = await p.evaluate("() => { const m = document.querySelector('[data-testid=medallion]'); return m && [m.dataset.woven, m.querySelectorAll('[data-expr]').length] }")
    check(m and m[0] == "1" and m[1] == 6, f"{name}: meet medallion woven/layers {m}")
    await ctx.close()


async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
        await run(b, "desktop", {"width": 1280, "height": 800}, False)
        await run(b, "phone", {"width": 390, "height": 844}, True)
        await run(b, "desktop-reduce", {"width": 1280, "height": 800}, False, reduce=True)
        await run(b, "phone-reduce", {"width": 390, "height": 844}, True, reduce=True)
        await b.close()
    print("FAILS:", len(FAIL)); [print(" -", f) for f in FAIL]

asyncio.run(main())
