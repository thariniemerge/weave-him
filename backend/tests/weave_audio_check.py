# Weaving audio check: hum loop starts on entry, fades at the end, stinger starts before /meet; mute and back behave
import asyncio, json, sys
from playwright.async_api import async_playwright
BASE = open("/app/frontend/.env").read().split("REACT_APP_BACKEND_URL=")[1].split()[0].rstrip("/")
ANS = {"q1": [{"id": "coffee"}], "q2": [{"id": "pancakes"}], "q3": [{"id": "laugh"}], "q4": [{"id": "small"}], "q7": [{"id": "amused"}],
       "sliders": {"out": 80, "love": 50, "feel": 50}, "remembers": [{"id": "jokes"}], "goal": "serious", "interests": [{"id": "books"}],
       "musts": [{"id": "calm"}], "bandPick": ["LAUGHS", "COFFEE", "PANCAKES"]}
HOOK = """(() => { window.__log = []; const T0 = performance.now(); const log = (m) => window.__log.push([Math.round(performance.now() - T0), m, location.pathname]);
  const st = AudioBufferSourceNode.prototype.start; AudioBufferSourceNode.prototype.start = function (w) {
    const d = this.buffer ? this.buffer.duration.toFixed(2) : '?'; if (+d > 1.4) log('start dur=' + d + ' loop=' + this.loop + ' at+' + ((w || 0) - this.context.currentTime).toFixed(2)); return st.apply(this, arguments); };
  const sp = AudioBufferSourceNode.prototype.stop; AudioBufferSourceNode.prototype.stop = function () { if (this.loop) log('stop loop'); return sp.apply(this, arguments); };
  const ff = window.fetch; window.fetch = function (u) { if (String(u).includes('/assets/audio/')) log('fetch ' + String(u).split('/').pop()); return ff.apply(this, arguments); };
  new MutationObserver(() => {}).observe(document, { childList: true }); let p = location.pathname; setInterval(() => { if (location.pathname !== p) { p = location.pathname; log('nav'); } }, 20); })();"""

async def run(mode):
    async with async_playwright() as p:
        br = await p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox", "--autoplay-policy=no-user-gesture-required"])
        ctx = await br.new_context(viewport={"width": 390, "height": 844})
        await ctx.add_init_script(f"sessionStorage.setItem('weave-him-answers', {json.dumps(json.dumps(ANS))}); localStorage.setItem('weave-him-muted', '{1 if mode == 'muted' else 0}');" + HOOK)
        pg = await ctx.new_page()
        await pg.goto(BASE + "/bands", wait_until="networkidle"); await pg.wait_for_timeout(800)
        await pg.click("[data-testid=weave-him-button]")
        if mode == "back":
            await pg.wait_for_timeout(1500); await pg.go_back(); await pg.wait_for_timeout(1500)
        elif mode == "unmute":
            await pg.wait_for_timeout(1200); await pg.click("[data-testid=sound-toggle]"); await pg.wait_for_timeout(800); await pg.click("[data-testid=sound-toggle]")
            await pg.wait_for_url("**/meet/**", timeout=20000); await pg.wait_for_timeout(500)
        else:
            await pg.wait_for_url("**/meet/**", timeout=20000); await pg.wait_for_timeout(500)
        print(mode, pg.url.split("/")[-2:])
        for r in await pg.evaluate("window.__log"): print("  ", r)
        await br.close()

for m in sys.argv[1:]: asyncio.run(run(m))
