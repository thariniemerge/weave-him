import { useEffect, useRef } from "react";

// He is a painting, so he moves only with light: breathing (CSS), a warm shimmer across the weave,
// floating red hearts and a soft glow pulse. Nothing is drawn on top of his face.
export const LIGHTS = ["shimmer", "hearts", "glow"];
const ALIAS = { smile: "glow", wink: "hearts", kiss: "hearts", blush: "glow" };
const DUR = { shimmer: 1800, hearts: 2600, glow: 1500 };

const subs = new Set();
export const emote = (name) => subs.forEach((f) => f(ALIAS[name] || name));

let seq = 0;
// Scope every id so several medallions can live on one page
export const scoped = (raw) => {
  const p = `mk${++seq}-`;
  return [p, raw.replace(/id="/g, `id="${p}`).replace(/url\(#/g, `url(#${p}`).replace(/href="#/g, `href="#${p}`)];
};

// Restart a CSS light animation on the medallion wrapper
export function flash(el, name) {
  if (!el || !DUR[name]) return;
  const cls = `mk-${name}`;
  el.classList.remove(cls);
  void el.getBoundingClientRect();
  el.classList.add(cls);
  clearTimeout(el[`_${cls}`]);
  el[`_${cls}`] = setTimeout(() => el.classList.remove(cls), DUR[name]);
}

// Ambient light every 6-9s (with `ambient`), emote() from anywhere, and tap = glow + hearts
export function useLight(ref, { ambient = false, reduce = false }) {
  const n = useRef(0);
  useEffect(() => {
    if (reduce) return;
    const f = (name) => flash(ref.current, name);
    subs.add(f);
    return () => { subs.delete(f); };
  }, [reduce, ref]);
  useEffect(() => {
    if (!ambient || reduce) return;
    let t;
    const loop = () => { t = setTimeout(() => { flash(ref.current, n.current++ % 2 ? "hearts" : "shimmer"); loop(); }, 6000 + Math.random() * 3000); };
    loop();
    return () => clearTimeout(t);
  }, [ambient, reduce, ref]);
  return () => { if (!reduce) { flash(ref.current, "glow"); flash(ref.current, "hearts"); } };
}
