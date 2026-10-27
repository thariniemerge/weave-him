import { useEffect, useRef, useState } from "react";

// His love emotions (Meet him). Each is a pose of K's own groups; nothing is drawn over his face.
export const EMOTIONS = ["smile", "wink", "blush", "hearts", "shy", "kiss"];
export const POSES = {
  idle: {},
  smile: { smile: 1 },
  wink: { smile: 0.7, wink: 1, browR: 1 },
  blush: { blush: 1, smile: 0.5, look: [0, 1.5] },
  hearts: { hearts: 1, smile: 0.8 },
  shy: { look: [-3.2, 2.4], blush: 0.55, smile: 0.35, browDown: 1 },
  kiss: { kiss: 1, closed: 1, blush: 0.35 },
};
const DUR = { smile: 2200, wink: 1700, blush: 2300, hearts: 2300, shy: 2400, kiss: 2400 };

const subs = new Set();
export const emote = (name) => subs.forEach((f) => f(name));

let seq = 0;
// Scope every id so several medallions can live on one page
export const scoped = (raw) => {
  const p = `mk${++seq}-`;
  return [p, raw.replace(/id="/g, `id="${p}`).replace(/url\(#/g, `url(#${p}`).replace(/href="#/g, `href="#${p}`)];
};

export function faceParts(root, p, animate = false) {
  const q = (id) => root.querySelector(`[id="${p}${id}"]`);
  const brows = q("K-brows").children, lids = q("K-lids").children;
  const P = {
    eyeL: q("K-eye-l"), eyeR: q("K-eye-r"), pupL: q("K-pupil-l"), pupR: q("K-pupil-r"),
    hearts: q("K-hearteyes"), heartEach: [...q("K-hearteyes").querySelectorAll(".mk-he")],
    browL: brows[0], browR: brows[1], lidL: [lids[0], lids[1]], lidR: [lids[2], lids[3]],
    mouth: q("K-mouth"), cheeks: q("K-cheeks"), blush: q("K-blush"), floaters: q("K-floaters"),
  };
  Object.entries(P).forEach(([k, v]) => [v].flat().forEach((el) => {
    el.style.transformBox = "fill-box"; el.style.transformOrigin = "center";
    if (animate) el.style.transition = /eye|lid|pup/.test(k) ? "transform .12s ease, opacity .25s ease" : "transform .6s ease, opacity .5s ease";
  }));
  return P;
}

const put = (els, t, o) => [els].flat().forEach((el) => { if (t != null) el.style.transform = t; if (o != null) el.style.opacity = o; });

export function applyPose(P, pose = {}, { blink = 0, lift = 0 } = {}) {
  const s = pose.smile || 0, h = pose.hearts || 0, k = pose.kiss || 0, br = pose.browR || 0;
  const shut = Math.max(pose.closed || 0, blink), shutR = Math.max(shut, pose.wink || 0);
  const open = (c) => 1 - 0.92 * c - 0.18 * s * (1 - h) * (1 - c);
  const [lx, ly] = pose.look || [0, 0];
  put(P.eyeL, `scaleY(${open(shut)})`);
  put(P.eyeR, `scaleY(${open(shutR)})`);
  put(P.lidL, `translateY(${3 * shut - 2.5 * h}px)`);
  put(P.lidR, `translateY(${3 * shutR - 2.5 * h}px)`);
  put([P.pupL, P.pupR], `translate(${lx}px, ${ly}px)`, 1 - h);
  put(P.hearts, null, h);
  put(P.heartEach, `scale(${0.5 + 0.5 * h})`);
  const up = 4 * lift + 3 * h - 2 * (pose.browDown || 0);
  put(P.browL, `translateY(${-up}px)`);
  put(P.browR, `translateY(${-up - 6 * br}px) rotate(${-7 * br}deg)`);
  put(P.mouth, k ? `translate(${3 * k}px, ${1.5 * k}px) scale(${1 - 0.5 * k}, ${1 + 0.25 * k})`
    : `translateY(${-1.2 * s}px) rotate(${3 * s}deg) scale(${1 + 0.08 * s}, ${1 + 0.55 * s})`);
  put(P.cheeks, `translateY(${-2.5 * s}px)`);
  put(P.blush, null, 0.75 * (pose.blush || 0));
}

// Restart the floating red hearts
export const floatHearts = (P) => {
  P.floaters.classList.remove("mk-float");
  void P.floaters.getBoundingClientRect();
  P.floaters.classList.add("mk-float");
};

// Blinks every 3-5s (every third beat a brow raise); with `ambient`, a love emotion every 6-9s
export function useFaceLife({ ambient = false, reduce = false }) {
  const [e, setE] = useState("idle");
  const [blink, setBlink] = useState(0);
  const [lift, setLift] = useState(0);
  const [n, setN] = useState(0);
  const timer = useRef(null), last = useRef(0), cycle = useRef(0);
  const play = (name, auto = false) => {
    if (reduce || !POSES[name]) return;
    if (!auto) last.current = Date.now();
    clearTimeout(timer.current);
    setE(name); setN((x) => x + 1);
    timer.current = setTimeout(() => setE("idle"), DUR[name] || 2000);
  };
  useEffect(() => { subs.add(play); return () => { subs.delete(play); }; });
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (reduce) return;
    let t, beat = 0;
    const loop = () => { t = setTimeout(() => {
      beat += 1;
      if (beat % 3 === 0) { setLift(1); setTimeout(() => setLift(0), 800); } else { setBlink(1); setTimeout(() => setBlink(0), 150); }
      loop();
    }, 3000 + Math.random() * 2000); };
    loop();
    return () => clearTimeout(t);
  }, [reduce]);
  useEffect(() => {
    if (!ambient || reduce) return;
    let t;
    const loop = () => { t = setTimeout(() => {
      if (Date.now() - last.current > 6000) play(EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)], true);
      loop();
    }, 6000 + Math.random() * 3000); };
    loop();
    return () => clearTimeout(t);
  }, [ambient, reduce]); // eslint-disable-line react-hooks/exhaustive-deps
  const tap = () => { play(EMOTIONS[cycle.current % EMOTIONS.length]); cycle.current += 1; };
  return { e, blink, lift, n, tap };
}
