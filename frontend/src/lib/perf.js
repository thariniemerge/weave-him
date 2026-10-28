// Phones and touch devices get the light path: fewer particles, 30fps live layer, no costly blends or blurs
const mq = (q) => typeof window !== "undefined" && window.matchMedia(q).matches;
export const LITE = mq("(max-width: 767px), (pointer: coarse)");
export const isPhone = () => mq("(max-width: 767px)");
export const maxDpr = () => Math.min(LITE ? 1.5 : 2, window.devicePixelRatio || 1);

// One requestAnimationFrame loop shared by every animated canvas
const subs = new Set();
let raf = 0;
const loop = (now) => { subs.forEach((f) => f(now)); raf = subs.size ? requestAnimationFrame(loop) : 0; };
export function onFrame(fn) {
  subs.add(fn);
  if (!raf) raf = requestAnimationFrame(loop);
  return () => { subs.delete(fn); };
}
