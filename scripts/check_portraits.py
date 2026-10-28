"""Weaves five husbands from five answer sets (plus a repeat) and screenshots each on Meet him and his share card (dev only)."""
import asyncio
import json
import sys
from pathlib import Path
from playwright.async_api import async_playwright

URL = sys.argv[1].rstrip("/")
OUT = Path("/app/frontend/public/recordings")
BASE = {"goal": "serious", "interests": [{"id": "books"}], "musts": [{"id": "calm"}, {"id": "loyal"}]}
SETS = {
    "golden-willow": dict(q1="coffee", q2="market", q3="squeeze", q4="small", q7="safe", out=50, love=25, feel=25, rem="mom"),
    "candlelit-rogue": dict(q1="takeout", q2="market", q3="rehearse", q4="voice", q7="seen", out=50, love=80, feel=80, rem="song"),
    "sunlit-curls": dict(q1="takeout", q2="pancakes", q3="laugh", q4="lastbite", q7="amused", out=80, love=50, feel=50, rem="jokes"),
    "lantern-woodsman": dict(q1="holds", q2="adventure", q3="squeeze", q4="fixing", q7="alone", out=50, love=50, feel=50, rem="mom"),
    "moorland-scholar": dict(q1="vent", q2="reads", q3="rehearse", q4="lastbite", q7="safe", out=20, love=50, feel=50, rem="pet"),
}


def answers(s):
    a = {k: [{"id": s[k]}] for k in ["q1", "q2", "q3", "q4", "q7"]}
    a.update(BASE, sliders={"out": s["out"], "love": s["love"], "feel": s["feel"]}, remembers=[{"id": s["rem"]}])
    return a


async def weave(p, a):
    await p.goto(URL + "/bands", wait_until="networkidle")
    await p.evaluate(f"sessionStorage.setItem('weave-him-answers', {json.dumps(json.dumps(a))}); sessionStorage.removeItem('weave-him-last')")
    await p.goto(URL + "/bands", wait_until="networkidle")
    await p.wait_for_timeout(800)
    await p.click("[data-testid=weave-him-button]")
    await p.wait_for_url("**/meet/**", timeout=25000)
    await p.wait_for_timeout(2500)
    return p.url.rsplit("/", 1)[-1], await p.get_attribute("[data-testid=medallion]", "data-portrait")


async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
        p = await (await b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2)).new_page()
        got = {}
        for want, s in SETS.items():
            hid, por = await weave(p, answers(s))
            got[want] = (hid, por)
            await p.locator("[data-testid=medallion]").screenshot(path=str(OUT / f"meet-{por}.png"))
            print(want, "->", por, hid, "OK" if want == por else "MISMATCH")
        hid, por = await weave(p, answers(SETS["sunlit-curls"]))
        print("repeat sunlit-curls ->", por, "same" if por == "sunlit-curls" else "DIFFERENT")
        for want, (hid, _) in got.items():
            await p.goto(f"{URL}/api/husbands/{hid}/card.jpg?v=14")
            await p.screenshot(path=str(OUT / f"card-{want}.png"))
        print(json.dumps({k: v[0] for k, v in got.items()}))
        await b.close()

asyncio.run(main())
