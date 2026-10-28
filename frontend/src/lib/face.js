import { useEffect, useRef } from "react";
import { EXPRESSIONS, HOLD, TAP_ORDER, frameSrc } from "../content";

// His emotions are the user's aligned expression frames, crossfaded over the neutral one. Nothing is drawn.
const IN = 300, OUT = 350, BLINK = 150;
const MOODS = TAP_ORDER;
const ALIAS = { hearts: "heart_eyes" };

const subs = new Set();
export const emote = (name) => subs.forEach((f) => f(ALIAS[name] || name));

let seq = 0;
// Scope every id so several medallions can live on one page
export const scoped = (raw) => {
  const p = `mk${++seq}-`;
  return [p, raw.replace(/id="/g, `id="${p}`).replace(/url\(#/g, `url(#${p}`).replace(/href="#/g, `href="#${p}`)];
};

// Fetch and decode all nine frames of one husband (once)
const cache = new Map();
const loaded = new Set();
export const framesLoaded = (slug) => loaded.has(slug);
export function preloadFrames(slug) {
  if (!slug) return Promise.resolve();
  if (!cache.has(slug)) {
    cache.set(slug, Promise.all(EXPRESSIONS.map((e) => { const i = new Image(); i.src = frameSrc(slug, e); return i.decode().catch(() => {}); }))
      .then(() => { loaded.add(slug); }));
  }
  return cache.get(slug);
}

// Stack his eight expression frames over the neutral image, all hidden
export function mountFrames(group, neutral, slug) {
  group.innerHTML = "";
  const layers = {};
  EXPRESSIONS.slice(1).forEach((e) => {
    const el = neutral.cloneNode();
    el.removeAttribute("id");
    el.setAttribute("href", frameSrc(slug, e));
    el.setAttribute("opacity", "0");
    el.dataset.expr = e;
    group.appendChild(el);
    layers[e] = el;
  });
  return layers;
}

// Restart a CSS animation class on the medallion wrapper (floating hearts)
function flash(el, cls, ms = 1700) {
  if (!el) return;
  el.classList.remove(cls);
  void el.getBoundingClientRect();
  el.classList.add(cls);
  clearTimeout(el[`_${cls}`]);
  el[`_${cls}`] = setTimeout(() => el.classList.remove(cls), ms);
}

// Plays expressions on the stacked layers, strictly one at a time: a new emotion (or blink) waits until the
// previous one has fully faded back to neutral, so two frames are never above neutral together.
// With `ambient`: blink every 3-5s and a random emotion every 6-9s. Reduced motion: taps only, instant swaps.
export function useExpressions(wrap, layers, { ambient = false, reduce = false }) {
  const st = useRef({ cur: null, timers: [], i: 0 });
  const later = (fn, ms) => st.current.timers.push(setTimeout(fn, ms));
  const set = (el, o, ms) => { el.style.transition = ms ? `opacity ${ms}ms ease` : "none"; el.style.opacity = o; };
  const play = (name) => {
    const L = layers.current, s = st.current;
    if (!L || !L[name] || s.cur) return false;
    s.cur = name;
    if (name === "blink") {
      set(L.blink, 1, 0);
      later(() => { set(L.blink, 0, 0); s.cur = null; }, BLINK);
      return true;
    }
    const fade = reduce ? 0 : IN, back = reduce ? 0 : OUT;
    set(L[name], 1, fade);
    wrap.current?.setAttribute("data-emotion", name);
    if (!reduce && name === "kiss") flash(wrap.current, "mk-kiss");
    if (!reduce && name === "heart_eyes") flash(wrap.current, "mk-hearteyes");
    later(() => {
      set(L[name], 0, back);
      later(() => { s.cur = null; wrap.current?.setAttribute("data-emotion", "neutral"); }, back);
    }, fade + HOLD[name] * 1000);
    return true;
  };
  useEffect(() => {
    if (reduce) return;
    subs.add(play);
    return () => { subs.delete(play); };
  });
  useEffect(() => () => st.current.timers.forEach(clearTimeout), []);
  useEffect(() => {
    if (!ambient || reduce) return;
    let b, m;
    const blinkLoop = () => { b = setTimeout(() => { play("blink"); blinkLoop(); }, 3000 + Math.random() * 2000); };
    const moodLoop = () => { m = setTimeout(() => { if (!st.current.cur) play(MOODS[Math.floor(Math.random() * MOODS.length)]); moodLoop(); }, 6000 + Math.random() * 3000); };
    blinkLoop(); moodLoop();
    return () => { clearTimeout(b); clearTimeout(m); };
  }, [ambient, reduce]); // eslint-disable-line react-hooks/exhaustive-deps
  return () => { if (play(TAP_ORDER[st.current.i % TAP_ORDER.length])) st.current.i += 1; };
}
