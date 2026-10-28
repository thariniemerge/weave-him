# Iter3 weaving timing e2e: early vow draft on musts, band re-draft debounce, weave timing, slow-vows finishing, skip, late upgrade.
# Usage: python i3_weave_timing.py MODE W H   MODE in full|slow|skip
import asyncio, sys, re, json
from playwright.async_api import async_playwright
BASE = open("/app/frontend/.env").read().split("REACT_APP_BACKEND_URL=")[1].split()[0].rstrip("/")
MODE = sys.argv[1] if len(sys.argv) > 1 else "full"
W, H = (int(sys.argv[2]), int(sys.argv[3])) if len(sys.argv) > 3 else (390, 844)
DELAY = float(sys.argv[4]) if len(sys.argv) > 4 else 10.0
NEXT = ["weave-strand-button", "next-feel-button", "next-remembers-button", "next-interests-button", "next-musts-button", "weave-him-musts-button", "weave-him-button"]
ANS = {"q1": [{"id": "takeout"}], "q2": [{"id": "pancakes"}], "q3": [{"id": "laugh"}], "q4": [{"id": "lastbite"}], "q7": [{"id": "amused"}],
       "sliders": {"out": 80, "love": 50, "feel": 50}, "remembers": [{"id": "jokes"}], "goal": "serious", "interests": [{"id": "books"}], "musts": [{"id": "calm"}]}
PROBE = """() => { window.__log = []; let last = {}; const t0 = performance.now();
  setInterval(() => { const q = s => document.querySelector(s); const st = {
    path: location.pathname, count: q('[data-testid=weaving-strand-count]')?.textContent,
    woven: q('[data-testid=weaving-medallion]')?.dataset.woven, fin: q('[data-testid=weaving-medallion-wrap]')?.dataset.finishing,
    line: q('[data-testid=weaving-loading-text]')?.textContent, skip: q('[data-testid=skip-to-him]')?.textContent,
    v1: q('[data-testid=vow-text-1]')?.textContent };
   for (const k in st) if (st[k] !== last[k]) window.__log.push([Math.round(performance.now()), k, st[k]]);
   last = st; }, 40); }"""

async def main():
    async with async_playwright() as p:
        br = await p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
        ctx = await br.new_context(viewport={"width": W, "height": H})
        if MODE != "full":
            await ctx.add_init_script(f"if(!sessionStorage.getItem('weave-him-answers')) sessionStorage.setItem('weave-him-answers', {json.dumps(json.dumps(ANS))});")
        pg = await ctx.new_page(); errs, net = [], []
        pg.on("pageerror", lambda e: errs.append(str(e)[:200]))
        pg.on("console", lambda m: errs.append("console:" + m.text[:200]) if m.type == "error" else None)
        async def now(): return await pg.evaluate("Math.round(performance.now())")
        async def onreq(r):
            if "/api/vows/draft" in r.url or re.search(r"/api/husbands(/\w+/vows)?$", r.url):
                try: t = await now()
                except Exception: t = -1
                body = r.post_data or ""
                net.append([t, "REQ", r.url.split("/api")[1], ("draft" if '"draft":"' in body else "") + (" fast" if '"fast":true' in body else ""), json.loads(body).get("band") if body else None])
        async def onres(r):
            if "/api/vows/draft" in r.url or re.search(r"/api/husbands(/\w+/vows)?$", r.url):
                try: t = await now(); j = await r.json()
                except Exception: t, j = -1, {}
                net.append([t, "RES", r.url.split("/api")[1], r.status, {k: j.get(k) for k in ("draft", "ms", "vows_source", "id") if k in j}])
        pg.on("request", lambda r: asyncio.ensure_future(onreq(r)))
        pg.on("response", lambda r: asyncio.ensure_future(onres(r)))
        if MODE in ("slow", "skip"):
            async def slow(route):
                await asyncio.sleep(DELAY); await route.continue_()
            await pg.route("**/api/vows/draft", slow)
        if MODE == "full":
            await pg.goto(BASE + "/", wait_until="networkidle")
            await pg.click("[data-testid=intro-veil-enter]", force=True); await pg.wait_for_timeout(4500)
            await pg.click("[data-testid=commission-button]"); await pg.wait_for_timeout(1500)
            await pg.evaluate(PROBE)
            last, same = None, 0
            for step in range(40):
                url = pg.url.replace(BASE, "")
                if "/bands" in url: break
                same = same + 1 if url == last else 0; last = url
                if same > 3: print("STUCK", url); break
                for sel in ["[data-testid^=option-]", "[data-testid^=remember-chip-]:not([data-testid=remember-chip-custom])", "[data-testid*=-chip-]:not([data-testid$=-custom])", "[data-testid^=suitor-check-none-]"]:
                    loc = pg.locator(sel)
                    if await loc.count():
                        try:
                            el = loc.first
                            if await el.is_visible() and await el.get_attribute("aria-pressed") != "true" and await el.get_attribute("aria-checked") != "true":
                                await el.click(); await pg.wait_for_timeout(400)
                        except Exception as e: print("click err", sel, str(e)[:80])
                        break
                if await pg.locator("[data-testid^=suitor-check-none-]").count():
                    for el in await pg.locator("[data-testid^=suitor-check-none-]").all():
                        try: await el.click(); await pg.wait_for_timeout(150)
                        except Exception: pass
                for b in NEXT:
                    loc = pg.locator(f"[data-testid={b}]")
                    if await loc.count() and await loc.first.is_visible() and await loc.first.is_enabled():
                        if b == "weave-him-musts-button": print("CLICK musts confirm at", await now())
                        await loc.first.click(); break
                await pg.wait_for_timeout(1500)
        else:
            await pg.goto(BASE + "/bands", wait_until="domcontentloaded"); await pg.evaluate(PROBE)
        await pg.wait_for_selector("[data-testid=bands-preview]", timeout=15000)
        print("on /bands at", await now(), "count", await pg.inner_text("[data-testid=bands-count]"))
        await pg.wait_for_timeout(2500 if MODE == "full" else 200)
        if MODE == "full":
            n0 = len([n for n in net if n[1] == "REQ" and "draft" in n[2]])
            chips = await pg.locator("[data-testid^=band-choice-]").all()
            print("band chips", len(chips))
            # deselect first picked then reselect it -> same set (order changes!) ; then deselect+reselect last -> identical set
            pressed = [c for c in chips if await c.get_attribute("aria-pressed") == "true"]
            last_c = pressed[-1]
            await last_c.click(); await pg.wait_for_timeout(200); await last_c.click()  # back to the same set within debounce
            await pg.wait_for_timeout(1500)
            n1 = len([n for n in net if n[1] == "REQ" and "draft" in n[2]])
            print("re-pick same set (within debounce) new draft reqs:", n1 - n0)
            unp = [c for c in chips if await c.get_attribute("aria-pressed") != "true"]
            t_change = None
            if unp:
                await last_c.click(); await pg.wait_for_timeout(300); await unp[0].click(); t_change = await now()
                await pg.wait_for_timeout(2500)
                n2 = len([n for n in net if n[1] == "REQ" and "draft" in n[2]])
                d = [n for n in net if n[1] == "REQ" and "draft" in n[2]][-1]
                print("changed set: new draft reqs:", n2 - n1, "delay after last click ms:", d[0] - t_change)
                # go back to original set -> already cached, should not refire
                await unp[0].click(); await pg.wait_for_timeout(300); await last_c.click(); await pg.wait_for_timeout(2000)
                n3 = len([n for n in net if n[1] == "REQ" and "draft" in n[2]])
                print("back to earlier set: new draft reqs:", n3 - n2)
            await pg.wait_for_timeout(2500)
        await pg.evaluate("sessionStorage.removeItem('weave-him-last')")
        await pg.click("[data-testid=weave-him-button]"); tw = await now(); print("weave-him clicked at", tw)
        if MODE == "skip":
            await pg.wait_for_timeout(1500); print("clicking skip at", await now() - tw)
            await pg.click("[data-testid=skip-to-him]")
        await pg.wait_for_url(re.compile(r".*/meet/\w+"), timeout=30000)
        hid = pg.url.rstrip("/").split("/")[-1]
        await pg.wait_for_selector("[data-testid=vows-card]", timeout=20000)
        await pg.wait_for_timeout(15000 if MODE == "slow" else 7000)
        if W == 390: await pg.screenshot(path=f"/app/test_reports/img/i3_{MODE}_meet.jpg", quality=40, type="jpeg")
        log = await pg.evaluate("window.__log")
        tw_path = next((t for t, k, v in log if k == "path" and v == "/weaving"), tw)
        print("== timeline relative to /weaving path (ms)")
        for t, k, v in sorted(log, key=lambda x: x[0]):
            if t >= tw_path - 100 and k != "skip" or (k == "skip" and t >= tw_path): print(f"  {t - tw_path:6d} {k}: {v}")
        print("== net (rel to /weaving)")
        for n in sorted(net, key=lambda x: x[0]): print(f"  {n[0] - tw_path:7d}", n[1:])
        h = await (await pg.request.get(f"{BASE}/api/husbands/{hid}")).json()
        print("husband", hid, "vows_source", h["vows_source"])
        print("DOM vow1:", await pg.inner_text("[data-testid=vow-text-1]"))
        print("errors", errs)
        await br.close()

asyncio.run(main())
