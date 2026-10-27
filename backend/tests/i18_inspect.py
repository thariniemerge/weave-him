# Iteration 18: inspect nested svg, brooch paths, overflow culprit
import asyncio
from playwright.async_api import async_playwright
BASE = open("/app/frontend/.env").read().split("REACT_APP_BACKEND_URL=")[1].split()[0]
async def main():
    async with async_playwright() as p:
        br = await p.chromium.launch(); pg = await br.new_page(viewport={"width": 1280, "height": 800})
        await pg.goto(BASE + "/meet/62s6pvau"); await pg.wait_for_selector('[data-testid=medallion] svg'); await pg.wait_for_timeout(2500)
        print(await pg.evaluate("""() => {
          const m = document.querySelector('[data-testid=meet-cameo] [data-testid=medallion]');
          const svgs = [...m.querySelectorAll('svg')].map(s => [s.id, s.parentNode.id || s.parentNode.tagName, s.getAttribute('viewBox')]);
          const heart = [...m.querySelector('[id$="-heart"]').querySelectorAll('*')].map(e => [e.tagName, e.id, getComputedStyle(e).fill, getComputedStyle(e).stroke, e.getAttribute('class')]);
          const he = [...m.querySelector('[id$="K-hearteyes"]').querySelectorAll('path')].map(e => [getComputedStyle(e).fill, getComputedStyle(e).stroke]);
          const over = []; document.querySelectorAll('body *').forEach(e => { if (e.closest('.mist-layer')) return; const r = e.getBoundingClientRect(); if (r.width && r.right > innerWidth + 1) over.push([e.tagName, e.className && e.className.baseVal !== undefined ? e.className.baseVal : e.className, e.getAttribute('data-testid'), Math.round(r.left), Math.round(r.right), getComputedStyle(e).position]); });
          return JSON.stringify({svgs, heart, he, over: over.slice(0, 10)}, null, 1);
        }"""))
        await br.close()
asyncio.run(main())
