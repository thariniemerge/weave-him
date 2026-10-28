# Env-import e2e: intro veil -> welcome -> 10 strands -> bands -> weaving -> meet -> share -> /h/{id} fresh ctx -> deep-link refresh. Usage: python env_ui_flow.py [w h]
import asyncio, sys, re
from playwright.async_api import async_playwright
BASE = open("/app/frontend/.env").read().split("REACT_APP_BACKEND_URL=")[1].split()[0].rstrip("/")
W, H = (int(sys.argv[1]), int(sys.argv[2])) if len(sys.argv) > 2 else (390, 844)
OUT = "/app/test_reports/img"; TAG = f"env{W}"
NEXT = ["weave-strand-button", "next-feel-button", "next-remembers-button", "next-interests-button", "next-musts-button", "weave-him-musts-button", "weave-him-button"]
R = []
def rep(n, ok, info=""):
    R.append(ok); print(("PASS " if ok else "FAIL ") + n + (" :: " + str(info) if info else ""), flush=True)

def watch(pg, bad, errs):
    pg.on("pageerror", lambda e: errs.append(str(e)[:200]))
    pg.on("response", lambda r: bad.append(f"{r.status} {r.url[:140]}") if r.status >= 400 else None)
    pg.on("requestfailed", lambda r: bad.append(f"FAILED {r.url[:140]} {r.failure}") if "posthog" not in r.url and "emergent" not in r.url.split('/')[2] else None)

async def vis(pg, tid):
    loc = pg.locator(f"[data-testid={tid}]")
    return await loc.count() and await loc.first.is_visible()

async def main():
    import os; os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        br = await p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox", "--autoplay-policy=no-user-gesture-required"])
        ctx = await br.new_context(viewport={"width": W, "height": H}, accept_downloads=True)
        pg = await ctx.new_page(); bad, errs = [], []; watch(pg, bad, errs)
        await pg.goto(BASE + "/", wait_until="networkidle")
        rep("intro veil shown", await vis(pg, "intro-veil"))
        await pg.screenshot(path=f"{OUT}/{TAG}_intro.jpg", quality=40)
        await pg.click("[data-testid=intro-veil-enter]", force=True)
        await pg.wait_for_timeout(4500)
        rep("intro veil gone", not await vis(pg, "intro-veil"))
        rep("commission button visible", await vis(pg, "commission-button"))
        rep("husband counter", await vis(pg, "husband-counter"), await pg.inner_text("[data-testid=husband-counter]"))
        print("village-today:", await pg.inner_text("[data-testid=village-today]"))
        await pg.screenshot(path=f"{OUT}/{TAG}_welcome.jpg", quality=40)
        await pg.click("[data-testid=commission-button]")
        await pg.wait_for_timeout(1500)
        last = None; same = 0
        for step in range(40):
            url = pg.url.replace(BASE, "")
            if "/bands" in url or "/weaving" in url or "/meet/" in url: break
            same = same + 1 if url == last else 0; last = url
            if same > 3: rep("strand walker stuck", False, url); break
            # pick options / chips
            for sel in ["[data-testid^=option-]", "[data-testid^=remember-chip-]:not([data-testid=remember-chip-custom])", "[data-testid*=-chip-]:not([data-testid$=-custom])", "[data-testid^=suitor-check-none-]"]:
                loc = pg.locator(sel)
                if await loc.count():
                    try:
                        el = loc.first
                        if await el.is_visible() and await el.get_attribute("aria-pressed") != "true" and await el.get_attribute("aria-checked") != "true":
                            await el.click(); await pg.wait_for_timeout(500)
                    except Exception as e: print("click err", sel, str(e)[:80])
                    break
            if await pg.locator("[data-testid^=suitor-check-none-]").count():
                for el in await pg.locator("[data-testid^=suitor-check-none-]").all():
                    try: await el.click(); await pg.wait_for_timeout(200)
                    except Exception: pass
            clicked = False
            for b in NEXT:
                loc = pg.locator(f"[data-testid={b}]")
                if await loc.count() and await loc.first.is_visible() and await loc.first.is_enabled():
                    await loc.first.click(); clicked = b; break
            print(f"step {step} {url} -> {clicked}")
            await pg.wait_for_timeout(1800 if clicked else 800)
        if step == 4: await pg.screenshot(path=f"{OUT}/{TAG}_strand.jpg", quality=40)
        url = pg.url.replace(BASE, "")
        rep("reached /bands", "/bands" in url, url)
        await pg.wait_for_selector("[data-testid=bands-preview]", timeout=15000)
        print("bands-count:", await pg.inner_text("[data-testid=bands-count]"))
        await pg.screenshot(path=f"{OUT}/{TAG}_bands.jpg", quality=40)
        btn = pg.locator("[data-testid=weave-him-button]")
        rep("weave-him enabled on bands", await btn.count() and await btn.is_enabled())
        await btn.click()
        await pg.wait_for_url("**/weaving", timeout=10000); rep("weaving screen", True)
        await pg.wait_for_timeout(2500); await pg.screenshot(path=f"{OUT}/{TAG}_weaving.jpg", quality=40)
        await pg.wait_for_url(re.compile(r".*/meet/\w+"), timeout=40000)
        hid = pg.url.rstrip("/").split("/")[-1]; rep("meet page", True, pg.url)
        await pg.wait_for_selector("[data-testid=vows-card]", timeout=20000); await pg.wait_for_timeout(3000)
        vows = [await pg.inner_text(f"[data-testid=vow-text-{i}]") for i in range(1, 6) if await pg.locator(f"[data-testid=vow-text-{i}]").count()]
        rep("5 vows", len(vows) == 5, vows)
        h = await (await pg.request.get(f"{BASE}/api/husbands/{hid}")).json()
        print("vows_source:", h["vows_source"], "name:", h["name"])
        await pg.screenshot(path=f"{OUT}/{TAG}_meet.jpg", quality=40)
        # expressions
        emos = set()
        if await pg.locator("[data-testid=face-tap-target]").count():
            for _ in range(4):
                await pg.click("[data-testid=face-tap-target]", force=True); await pg.wait_for_timeout(700)
                e = await pg.evaluate("() => document.querySelector('[data-testid=medallion]')?.dataset.emotion")
                emos.add(e); await pg.wait_for_timeout(1300)
        rep("expressions change on face tap", len(emos - {None, "neutral"}) >= 1, emos)
        imgs = await pg.evaluate("() => [...document.querySelectorAll('img, image')].map(i => ({src: i.currentSrc || i.getAttribute('href') || i.src, ok: i.tagName==='IMG' ? (i.complete && i.naturalWidth>0) : true})).filter(x=>!x.ok)")
        rep("no broken imgs on meet", not imgs, imgs[:3])
        # share
        sb = pg.locator("[data-testid=share-him-button]")
        if await sb.count():
            await sb.first.click(); await pg.wait_for_timeout(5000)
            rep("share reveal opens", await vis(pg, "share-reveal"))
            ok = await pg.evaluate("() => { const i=document.querySelector('[data-testid=share-reveal-image] img, img[data-testid=share-reveal-image]'); return i ? [i.src.slice(0,80), i.naturalWidth] : null }")
            rep("share image rendered", bool(ok) and ok[1] > 0, ok)
            await pg.screenshot(path=f"{OUT}/{TAG}_share.jpg", quality=40)
            sv = pg.locator("[data-testid=reveal-save-button]")
            if await sv.count() and await sv.is_visible():
                try:
                    async with pg.expect_download(timeout=15000) as d:
                        await sv.click()
                    dl = await d.value; rep("save card download", True, dl.suggested_filename)
                except Exception as e: rep("save card download", False, str(e)[:120])
        else: rep("share-him-button present", False)
        # fresh context /h/{id}
        c2 = await br.new_context(viewport={"width": W, "height": H}); p2 = await c2.new_page(); b2, e2 = [], []; watch(p2, b2, e2)
        await p2.goto(f"{BASE}/h/{hid}", wait_until="networkidle")
        if await vis(p2, "intro-veil"): await p2.click("[data-testid=intro-veil-enter]", force=True); await p2.wait_for_timeout(4500)
        await p2.wait_for_timeout(2000)
        body = await p2.inner_text("body")
        rep("/h/{id} fresh ctx shows husband", h["name"] in body and await p2.locator("[data-testid=vows-card]").count() > 0, h["name"])
        await p2.screenshot(path=f"{OUT}/{TAG}_public.jpg", quality=40)
        # /api/share redirect
        await p2.goto(f"{BASE}/api/share/{hid}"); await p2.wait_for_timeout(2500)
        rep("/api/share redirects to /h", f"/h/{hid}" in p2.url, p2.url)
        # deep link refresh
        for path in [f"/h/{hid}", "/bands", f"/meet/{hid}", "/strand/3"]:
            await p2.goto(BASE + path, wait_until="networkidle")
            if await vis(p2, "intro-veil"): await p2.click("[data-testid=intro-veil-enter]", force=True); await p2.wait_for_timeout(4000)
            await p2.reload(wait_until="networkidle"); await p2.wait_for_timeout(2500)
            if await vis(p2, "intro-veil"): await p2.click("[data-testid=intro-veil-enter]", force=True); await p2.wait_for_timeout(4000)
            txt = (await p2.inner_text("body")).strip()
            rep(f"refresh {path} not blank", len(txt) > 20, p2.url.replace(BASE, "") + " | " + txt[:60].replace("\n", " "))
        rep("no 4xx/5xx/failed requests (main)", not bad, bad[:8])
        rep("no 4xx/5xx/failed requests (fresh)", not b2, b2[:8])
        rep("no page errors", not errs and not e2, (errs + e2)[:4])
        print(f"HID={hid}  RESULT {sum(R)}/{len(R)}")
        await br.close()

asyncio.run(main())
