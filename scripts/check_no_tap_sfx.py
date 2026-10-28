"""Taps every interactive element on every screen (phone 390x844) and reports any one-shot sound started by a tap.
Looping sources (background music, weaving rustle) are ignored; one-shot sounds are logged with their duration."""
import asyncio, sys
from playwright.async_api import async_playwright

URL = sys.argv[1].rstrip("/")
HOOK = """(() => { window.__sfx = []; const s = AudioBufferSourceNode.prototype.start;
  AudioBufferSourceNode.prototype.start = function (...a) { if (!this.loop) window.__sfx.push({ t: performance.now(), d: +(this.buffer?.duration || 0).toFixed(3) }); return s.apply(this, a); }; })()"""
CHIPS = "[data-testid^=option-], [data-testid*=-chip-], [data-testid^=band-choice-], [data-testid^=recipient-], [data-testid^=strand-chip-], [data-testid^=musts-checklist-item-]"
report = []


async def tap(p, sel, label=None, nth=0, wait=450):
    loc = p.locator(sel).nth(nth)
    if not await loc.count() or not await loc.is_visible() or not await loc.is_enabled():
        return False
    t = await p.evaluate("performance.now()")
    try:
        await loc.click(timeout=4000)
    except Exception:
        print("skipped (moved away):", label or sel)
        await p.screenshot(path=f"/app/scripts/skip-{len(report)}.png")
        return False
    await p.wait_for_timeout(wait)
    hits = await p.evaluate(f"window.__sfx.filter(x => x.t >= {t} && x.t < {t} + {wait})")
    report.append((p.url.split('.com')[-1], label or sel, hits))
    return True


async def tap_all(p):
    tids = await p.eval_on_selector_all(CHIPS, "els => els.map(e => e.dataset.testid)")
    for tid in tids:
        await tap(p, f"[data-testid='{tid}']", tid, wait=300)
        await tap(p, f"[data-testid='{tid}']", tid + " (again)", wait=300)


async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox", "--autoplay-policy=no-user-gesture-required"])
        ctx = await b.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=False, device_scale_factor=2)
        await ctx.add_init_script(HOOK)
        p = await ctx.new_page()
        await p.goto(URL + "/", wait_until="networkidle")
        await p.evaluate("sessionStorage.clear(); localStorage.clear()")
        await p.goto(URL + "/", wait_until="networkidle")
        await p.wait_for_timeout(1200)
        await p.wait_for_timeout(1500)
        print("veil tapped:", await tap(p, "[data-testid=intro-veil-enter]", wait=5500))
        await p.screenshot(path="/app/scripts/out/welcome-phone.png")
        print("village line:", await p.text_content("[data-testid=village-today]"))
        await tap(p, "[data-testid=how-it-works-link]")
        await p.mouse.click(195, 40); await p.wait_for_timeout(1200)
        await tap(p, "[data-testid=commission-button]", wait=900)
        for n in range(1, 11):
            await p.wait_for_timeout(500)
            if n == 5:
                for k in ["out", "love", "feel"]:
                    box = await p.locator(f"[data-testid=slider-track-{k}]").bounding_box()
                    t = await p.evaluate("performance.now()")
                    await p.mouse.move(box["x"] + 5, box["y"] + box["height"] / 2); await p.mouse.down()
                    await p.mouse.move(box["x"] + box["width"] - 5, box["y"] + box["height"] / 2, steps=20); await p.mouse.up()
                    await p.wait_for_timeout(300)
                    report.append((f"/strand/5", f"drag slider {k}", await p.evaluate(f"window.__sfx.filter(x => x.t >= {t})")))
            else:
                await tap_all(p)
                if n in (1, 2, 3, 4, 7):  # leave one answer picked
                    await tap(p, "[data-testid^=option-]", "option (pick)", wait=300)
                if n in (6, 8, 9, 10):
                    first = p.locator(CHIPS).first
                    if await first.count(): await tap(p, f"[data-testid='{await first.get_attribute('data-testid')}']", "chip (pick)", wait=300)
            if n == 2:
                await tap(p, "[data-testid=back-button]", "back-button", wait=900)
                await tap(p, "[data-testid=weave-strand-button]", "weave-strand-button (to II again)", wait=900)
            cta = {5: "next-remembers-button", 6: "next-feel-button", 8: "next-interests-button", 9: "next-musts-button", 10: "weave-him-musts-button"}.get(n, "weave-strand-button")
            if not await tap(p, f"[data-testid={cta}]", wait=900):
                print("could not continue at strand", n, cta); break
        await p.wait_for_url("**/bands", timeout=8000)
        await p.wait_for_timeout(800)
        await tap_all(p)
        print("bands:", await p.text_content("[data-testid=bands-count]"), "cells:", await p.locator(".page-cell").count())
        async def slow(route):
            await asyncio.sleep(8); await route.continue_()
        await p.route("**/api/husbands", slow)
        await tap(p, "[data-testid=weave-him-button]", wait=300)
        seen = []
        for k in range(16):
            el = p.locator("[data-testid=weaving-loading-text]")
            seen.append(await el.text_content() if await el.count() else None)
            if k == 9: await p.screenshot(path="/app/scripts/out/weaving-phone.png")
            await p.wait_for_timeout(500)
        print("loading lines over 8s:", [x for i, x in enumerate(seen) if i == 0 or x != seen[i - 1]])
        await p.unroute("**/api/husbands")
        await tap(p, "[data-testid=skip-to-him]", wait=800)
        print("url after weave/skip:", p.url)
        try:
            await p.wait_for_url("**/meet/**", timeout=60000)
        except Exception:
            await p.screenshot(path="/tmp/stuck.png"); raise
        await p.wait_for_timeout(4000)
        for i in range(4): await tap(p, "[data-testid=face-tap-target]", "face tap", wait=300)
        await p.locator("[data-testid=village-talking]").scroll_into_view_if_needed(); await p.wait_for_timeout(2500)
        await p.screenshot(path="/app/scripts/out/meet-phone.png")
        await p.evaluate("window.scrollTo(0,0)")
        await tap(p, "[data-testid=reweave-button-1]", wait=300)
        await p.wait_for_timeout(8000)
        await tap(p, "[data-testid=share-him-button]", wait=1500)
        await tap(p, "[data-testid=share-reveal-close]", wait=700)
        await tap(p, "[data-testid=in-your-life-button]", wait=1200)
        await tap_all(p)
        await tap(p, "[data-testid=copy-link-button]")
        await tap(p, "[data-testid=sound-toggle]", "sound-toggle (mute)")
        await tap(p, "[data-testid=sound-toggle]", "sound-toggle (unmute)")
        print("one-shot sounds heard in total (automatic ones: weaving plucks, meet harp, vow quills, blinks):", await p.evaluate("window.__sfx.length"))
        await b.close()
    bad = [r for r in report if r[2]]
    print("taps checked:", len(report), "| screens:", sorted({r[0].split('?')[0] for r in report}))
    for r in bad: print("SOUND ON TAP:", r)
    print("NO TAP SOUNDS" if not bad else f"{len(bad)} taps made a sound")

asyncio.run(main())
