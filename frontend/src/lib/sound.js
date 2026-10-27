// Quiet workshop sounds, synthesised in the browser with the Web Audio API (no audio files).
import { useSyncExternalStore } from "react";

const KEY = "weave-him-muted";
const SR = 44100;
const MASTER = Math.pow(10, -18 / 20); // about -18 dB
let ctx = null;
let master = null;
let buffers = {};
let loop = null;
const subs = new Set();

const reduced = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
let muted = (() => {
  const v = localStorage.getItem(KEY);
  return v === null ? !!reduced() : v === "1";
})();

// ---------- tiny DSP helpers ----------
const rnd = (() => { let s = 1234567; return () => ((s = (s * 16807) % 2147483647) / 2147483647) * 2 - 1; })();
const buf = (sec) => new Float32Array(Math.floor(sec * SR));
function biquad(x, type, f, q = 0.7) {
  const w = (2 * Math.PI * f) / SR, cs = Math.cos(w), al = Math.sin(w) / (2 * q);
  let b0, b1, b2;
  if (type === "lp") { b0 = (1 - cs) / 2; b1 = 1 - cs; b2 = b0; }
  else if (type === "hp") { b0 = (1 + cs) / 2; b1 = -(1 + cs); b2 = b0; }
  else { b0 = al; b1 = 0; b2 = -al; }
  const a0 = 1 + al, a1 = -2 * cs, a2 = 1 - al;
  const y = new Float32Array(x.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) {
    const v = (b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v;
  }
  return y;
}
const noise = (sec) => buf(sec).map(() => rnd());
const env = (x, fn) => x.map((v, i) => v * fn(i / SR, x.length / SR));
const norm = (x, peak) => { let m = 0; for (const v of x) m = Math.max(m, Math.abs(v)); return x.map((v) => (v / (m || 1)) * peak); };
const mix = (a, b, at = 0) => { const out = new Float32Array(Math.max(a.length, b.length + at)); out.set(a); b.forEach((v, i) => { out[i + at] += v; }); return out; };

function string(freq, sec, damp = 0.996) {
  const x = buf(sec), n = Math.round(SR / freq), ring = new Float32Array(n).map(() => rnd() * 0.5);
  let p = 0;
  for (let i = 0; i < x.length; i++) {
    const nx = (p + 1) % n;
    ring[p] = (ring[p] + ring[nx]) * 0.5 * damp;
    x[i] = ring[p]; p = nx;
  }
  return biquad(x, "lp", 3200);
}

const SYNTH = {
  pluck: () => norm(env(string(392, 0.45, 0.994), (t) => Math.exp(-t * 7)), 0.35),
  tick: () => norm(env(biquad(noise(0.03), "bp", 2400, 6), (t) => Math.exp(-t * 180)), 0.22),
  creak: () => norm(env(biquad(noise(0.16).map((v, i) => v * (0.5 + 0.5 * Math.sin(i / SR * 2 * Math.PI * 38))), "bp", 700, 3),
    (t, d) => Math.sin(Math.PI * t / d)), 0.2),
  page: () => {
    const x = noise(0.42).map((v, i) => v);
    let y = new Float32Array(x.length);
    for (let s = 0; s < 6; s++) {
      const seg = biquad(x, "bp", 700 + s * 450, 1.2);
      y = y.map((v, i) => v + seg[i] * Math.max(0, 1 - Math.abs(i / x.length - s / 6) * 4));
    }
    return norm(env(y, (t, d) => Math.min(1, t / 0.07) * Math.pow(1 - t / d, 1.6)), 0.5);
  },
  rustle: () => {
    const x = biquad(noise(2.4), "lp", 1500);
    const crackle = biquad(noise(2.4).map((v) => (Math.abs(v) > 0.985 ? v : 0)), "bp", 2600, 2);
    const y = x.map((v, i) => v * (0.55 + 0.45 * Math.sin((i / SR) * 2 * Math.PI * 1.25)) + crackle[i] * 2.5);
    return norm(env(y, (t, d) => Math.min(1, t / 0.15, (d - t) / 0.15)), 0.12);
  },
  harp: () => {
    let y = buf(1.7);
    [293.66, 369.99, 440, 587.33, 739.99].forEach((f, k) => {
      y = mix(y, env(string(f, 1.7 - k * 0.12, 0.9985), (t) => Math.exp(-t * 2.6)), Math.round(k * 0.12 * SR));
    });
    return norm(env(y, (t, d) => Math.min(1, (d - t) / 0.3)), 0.4);
  },
  quill: () => {
    const x = biquad(noise(0.5), "hp", 3200);
    const strokes = [0.02, 0.17, 0.31];
    return norm(env(x, (t) => strokes.reduce((a, s) => a + Math.max(0, Math.sin(Math.PI * Math.min(1, Math.max(0, (t - s) / 0.12)))) * (0.7 + 0.3 * Math.abs(rnd())), 0)), 0.16);
  },
  seal: () => {
    const thump = buf(0.32).map((_, i) => { const t = i / SR; return Math.sin(2 * Math.PI * (110 - 60 * t) * t) * Math.exp(-t * 16); });
    const squish = env(biquad(noise(0.32), "lp", 600), (t) => Math.exp(-t * 12) * 0.35);
    return norm(mix(thump, squish), 0.42);
  },
  paper: () => {
    let y = buf(0.32);
    for (let k = 0; k < 7; k++) {
      const b = env(biquad(noise(0.035), "bp", 2000 + Math.abs(rnd()) * 3000, 2), (t) => Math.exp(-t * 90));
      y = mix(y, b, Math.round(Math.abs(rnd()) * 0.27 * SR));
    }
    return norm(y, 0.28);
  },
};

function init() {
  if (ctx) return;
  try {
    if (navigator.audioSession) navigator.audioSession.type = "ambient"; // follow the phone's silent switch
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  } catch { return; }
  master = ctx.createGain();
  master.gain.value = MASTER;
  master.connect(ctx.destination);
  buffers = Object.fromEntries(Object.entries(SYNTH).map(([k, fn]) => {
    const data = fn();
    const b = ctx.createBuffer(1, data.length, SR);
    b.copyToChannel(data, 0);
    return [k, b];
  }));
}

function unlock() {
  init();
  ctx?.resume?.().then(() => { if (loop?.pending) startLoop(loop.name); }).catch(() => {});
}
["pointerdown", "keydown", "touchend"].forEach((e) => window.addEventListener(e, unlock, { passive: true }));

const ready = () => !muted && ctx && ctx.state === "running";

export function play(name, { rate = 1, gain = 1 } = {}) {
  if (!ready() || !buffers[name]) return;
  const src = ctx.createBufferSource(), g = ctx.createGain();
  src.buffer = buffers[name]; src.playbackRate.value = rate; g.gain.value = gain;
  src.connect(g).connect(master); src.start();
}

export function startLoop(name) {
  stopLoop();
  if (!ready()) { loop = { name, pending: true }; return; }
  const src = ctx.createBufferSource(), g = ctx.createGain();
  src.buffer = buffers[name]; src.loop = true;
  g.gain.setValueAtTime(0, ctx.currentTime); g.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.4);
  src.connect(g).connect(master); src.start();
  loop = { name, src, g };
}

export function stopLoop() {
  if (loop?.src) {
    const { src, g } = loop;
    g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
    src.stop(ctx.currentTime + 0.35);
  }
  loop = null;
}

export function setMuted(m) {
  muted = m;
  localStorage.setItem(KEY, m ? "1" : "0");
  if (m && loop?.src) { const n = loop.name; stopLoop(); loop = { name: n, pending: true }; }
  else if (!m) { unlock(); }
  subs.forEach((f) => f());
}

export const useMuted = () => useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => muted);
