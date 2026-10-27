import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export const EMOTIONS = ["smile", "wink", "blush", "hearts", "kiss", "sigh", "shy"];
const DUR = { smile: 1900, wink: 1800, blush: 2100, hearts: 2000, kiss: 2400, sigh: 2500, shy: 2300 };

// Tiny event bus so pages can make him emote: emote("wink")
const subs = new Set();
export const emote = (name) => subs.forEach((f) => f(name));

// Head centre per art (viewBox = art width x 3); `low` = how far the shoulders reach down
const HEADS = {
  cameo: { box: "0 0 834 780", x: 414.5, y: 263, low: 212 },
  hoop: { box: "0 0 834 837", x: 414.5, y: 252, low: 250 },
};
const INK = "#3A2420", ROSE = "#9C3D4F", AMBER = "#C98A2E", LINEN = "#F3EAD8";
const stitch = { fill: "none", strokeLinecap: "round", strokeLinejoin: "round", strokeDasharray: "6 3.5" };
const fb = { transformBox: "fill-box", transformOrigin: "center" };
const HEART = "M0 3 C -6 -3 -10 2 -5 6 L 0 10 L 5 6 C 10 2 6 -3 0 3 Z";

const HEAD = "M -62 -78 C -72 -50 -80 -22 -83 4 L -75 40 C -66 62 -42 86 -18 95 L 18 95 C 42 86 66 62 75 40 L 83 4 C 80 -22 72 -50 62 -78 C 40 -102 -40 -102 -62 -78 Z";
const BEARD = "M -79 20 L -75 40 C -66 62 -42 86 -18 96 L 18 96 C 42 86 66 62 75 40 L 79 20 C 70 42 56 56 38 60 C 24 54 10 58 0 57 C -10 58 -24 54 -38 60 C -56 56 -70 42 -79 20 Z";
const HAIR = "M -76 -40 C -92 -84 -66 -128 -12 -130 C 42 -134 92 -110 90 -64 C 92 -40 86 -18 79 -4 C 76 -30 66 -52 46 -62 C 26 -54 6 -66 -14 -60 C -34 -54 -54 -60 -76 -40 Z";

const Show = ({ on, children, ...p }) => (
  <motion.g initial={false} animate={{ opacity: on ? 1 : 0 }} transition={{ duration: 0.25 }} {...p}>{children}</motion.g>
);

const Floater = ({ x, y, dx = 0, delay = 0, scale = 1 }) => (
  <motion.path d={HEART} fill={ROSE} stroke="#7d2e3e" strokeWidth="1" style={fb}
    initial={{ opacity: 0, x, y, scale }} animate={{ opacity: [0, 1, 0], x: x + dx, y: y - 80, scale: scale * 1.2 }}
    transition={{ duration: 1.8, delay, ease: "easeOut" }} />
);

const Defs = ({ id }) => (
  <defs>
    <pattern id={`${id}-wk`} width="14" height="10" patternUnits="userSpaceOnUse">
      <rect width="14" height="10" fill="#9a6633" />
      <rect y="1" width="7" height="3.6" rx="1.6" fill="#c99352" /><rect x="7" y="6" width="7" height="3.6" rx="1.6" fill="#c08945" />
      <rect x="7" y="1" width="7" height="3.6" rx="1.6" fill="#8a5a2c" /><rect y="6" width="7" height="3.6" rx="1.6" fill="#7f522a" />
      <path d="M0 5 H14" stroke="#5c3a1a" strokeWidth=".8" />
    </pattern>
    <pattern id={`${id}-hair`} width="10" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-24)">
      <rect width="10" height="8" fill="#6e4520" /><rect y="1" width="10" height="2.6" rx="1.3" fill="#9c6a33" /><rect y="5" width="10" height="1.6" rx=".8" fill="#86592a" />
    </pattern>
    <pattern id={`${id}-beard`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(12)">
      <rect width="6" height="6" fill="#4d3016" /><rect x="1" width="1.6" height="6" fill="#6b4422" /><rect x="4" width="1" height="6" fill="#5a391b" />
    </pattern>
    <radialGradient id={`${id}-shade`} cx="38%" cy="30%" r="75%">
      <stop offset="0" stopColor="#fff3d6" stopOpacity=".28" /><stop offset=".55" stopColor="#fff3d6" stopOpacity="0" />
      <stop offset="1" stopColor="#2a1608" stopOpacity=".42" />
    </radialGradient>
    <filter id={`${id}-soft`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" /></filter>
  </defs>
);

// Neck, square shoulders and the linen cravat with the heart brooch
const Body = ({ id, low }) => (
  <g>
    <path d={`M -150 ${low} L -142 180 C -134 166 -110 160 -62 157 L 62 157 C 110 160 134 166 142 180 L 150 ${low} Z`} fill={`url(#${id}-wk)`} />
    <path d={`M -150 ${low} L -142 180 C -134 166 -110 160 -62 157 L 62 157 C 110 160 134 166 142 180 L 150 ${low} Z`} fill={`url(#${id}-shade)`} />
    <path d={`M -150 ${low} L -142 180 C -134 166 -110 160 -62 157 L 62 157 C 110 160 134 166 142 180 L 150 ${low}`} fill="none" stroke="#4a2c14" strokeWidth="4" />
    <path d="M -38 70 L -40 170 L 40 170 L 38 70 Z" fill={`url(#${id}-wk)`} stroke="#4a2c14" strokeWidth="4" />
    <path d="M -38 92 C -14 106 14 106 38 92 L 38 70 L -38 70 Z" fill="#2a1608" opacity=".35" />
    <g stroke="#b9a586" strokeWidth="2">
      <path d="M -50 148 C -26 158 -12 162 0 170 C -16 186 -34 198 -54 202 C -46 186 -50 166 -50 148 Z" fill={LINEN} />
      <path d="M 50 148 C 26 158 12 162 0 170 C 16 186 34 198 54 202 C 46 186 50 166 50 148 Z" fill={LINEN} />
      <path d="M -8 178 C -20 196 -18 212 -10 222 L 6 220 C 10 206 10 192 6 178 Z" fill="#eadfc8" />
      <path d="M 4 178 C 16 194 20 208 16 218 L 26 214 C 26 200 20 188 10 178 Z" fill="#e6d9bf" />
      <ellipse cy="170" rx="17" ry="13" fill={LINEN} />
    </g>
    <path d="M -40 156 C -24 162 -10 165 0 170 M 40 156 C 24 162 10 165 0 170" stroke="#cdbb98" strokeWidth="1.5" fill="none" />
    <g transform="translate(0 164) scale(1.9)">
      <path d={HEART} fill={ROSE} stroke="#C9A45C" strokeWidth="1.1" />
      <circle cy="5" r="1.1" fill="#f3d58a" />
    </g>
  </g>
);

function Eyes({ e, blink }) {
  const closed = e === "sigh" || e === "kiss";
  const crinkle = e === "smile";
  return (
    <g>
      {[-1, 1].map((side) => {
        const winkEye = e === "wink" && side === 1;
        const look = e === "shy" ? { x: [0, -5, -5, -1, 0], y: [0, 3, 3, -1, 0] } : e === "blush" ? { x: 0, y: 2.5 } : { x: 0, y: 0 };
        return (
          <g key={side} transform={`translate(${side * 33} -12)`}>
            <motion.g style={fb} animate={{ scaleY: blink ? 0.08 : crinkle ? 0.55 : e === "blush" ? 0.8 : 1, opacity: closed || winkEye ? 0 : 1 }}
              transition={{ duration: blink ? 0.12 : 0.3 }}>
              <path d="M -15 0 Q 0 -9 15 0 Q 0 7 -15 0 Z" fill="#f4e8d2" />
              <motion.g animate={look} transition={e === "shy" ? { duration: 2.2, times: [0, 0.2, 0.6, 0.85, 1] } : { duration: 0.4 }}>
                <Show on={e !== "hearts"}>
                  <circle r="4.8" fill={AMBER} /><circle r="2.1" fill={INK} /><circle cx="1.6" cy="-1.6" r="0.9" fill="#fff8e6" />
                </Show>
                <Show on={e === "hearts"}>
                  <g transform="translate(0 -4.5) scale(.9)">
                    <motion.path d={HEART} fill={ROSE} stroke="#7d2e3e" strokeWidth="1" style={fb}
                      animate={e === "hearts" ? { scale: [1, 1.3, 1, 1.3, 1] } : { scale: 1 }} transition={{ duration: 1.6 }} />
                  </g>
                </Show>
              </motion.g>
              <path d="M -16 0.5 Q 0 -11 16 -1" stroke={INK} strokeWidth="3.4" {...stitch} strokeDasharray="5 2.5" />
              <path d="M -11 4 Q 0 7 11 3.5" stroke={INK} strokeWidth="1.4" fill="none" opacity=".45" />
            </motion.g>
            <Show on={closed || winkEye}><path d="M -15 -1 Q 0 7 15 -1" stroke={INK} strokeWidth="3.2" {...stitch} /></Show>
            <Show on={crinkle}><path d={`M ${side * 18} -4 l ${side * 7} -4 M ${side * 19} 1 l ${side * 8} 1`} stroke={INK} strokeWidth="1.8" strokeLinecap="round" /></Show>
          </g>
        );
      })}
    </g>
  );
}

function Brows({ e, lift }) {
  const L = e === "wink" ? { y: -7, rotate: -6 } : e === "shy" ? { y: [0, 3, 3, -3, 0] } : { y: lift ? -4 : 0, rotate: 0 };
  const R = e === "shy" ? { y: [0, 3, 3, -3, 0] } : e === "sigh" ? { y: -2 } : { y: lift ? -4 : 0 };
  const t = e === "shy" ? { duration: 2.2 } : { duration: 0.45 };
  return (
    <g>
      <motion.path d="M -54 -33 Q -36 -43 -15 -34" stroke={INK} strokeWidth="5.5" {...stitch} style={fb} animate={L} transition={t} />
      <motion.path d="M 15 -34 Q 36 -43 54 -33" stroke={INK} strokeWidth="5.5" {...stitch} style={fb} animate={R} transition={t} />
    </g>
  );
}

function Mouth({ e }) {
  const grin = e === "smile" || e === "hearts" || e === "wink";
  return (
    <g transform="translate(0 47)">
      <Show on={!grin && e !== "kiss"}>
        <path d="M -19 0 Q -4 5 11 -1 Q 17 -4 21 -9" stroke={ROSE} strokeWidth="3.4" {...stitch} />
        <path d="M -9 6 Q 0 8 9 5" stroke="#c9737f" strokeWidth="1.6" fill="none" opacity=".6" />
      </Show>
      <Show on={grin}>
        <path d="M -24 -3 Q -4 12 16 2 Q 23 -2 27 -10" stroke={ROSE} strokeWidth="3.8" {...stitch} />
        <path d="M -14 3 Q 0 9 14 4" stroke="#f4e8d2" strokeWidth="2.4" fill="none" opacity=".8" />
      </Show>
      <Show on={e === "kiss"}><ellipse cx="2" rx="6" ry="5" stroke={ROSE} strokeWidth="3.4" {...stitch} /></Show>
    </g>
  );
}

export function Face({ kind = "cameo", ambient = false, show = true, onTapCycle = false }) {
  const reduce = useReducedMotion();
  const head = HEADS[kind];
  const id = `hero-${kind}`;
  const [e, setE] = useState("idle");
  const [blink, setBlink] = useState(false);
  const [lift, setLift] = useState(false);
  const [n, setN] = useState(0);
  const cycle = useRef(2);
  const timer = useRef(null);
  const last = useRef(0);

  const play = (name, ambientCall = false) => {
    if (reduce) return;
    if (!ambientCall) last.current = Date.now();
    clearTimeout(timer.current);
    setE(name); setN((x) => x + 1);
    timer.current = setTimeout(() => setE("idle"), DUR[name] || 2000);
  };

  useEffect(() => { subs.add(play); return () => { subs.delete(play); }; }); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    if (reduce) return;
    let t, k = 0;
    const loop = () => {
      t = setTimeout(() => {
        k += 1;
        if (k % 3 === 0) { setLift(true); setTimeout(() => setLift(false), 700); }
        else { setBlink(true); setTimeout(() => setBlink(false), 170); }
        loop();
      }, 2600 + Math.random() * 2600);
    };
    loop();
    return () => clearTimeout(t);
  }, [reduce]);

  useEffect(() => {
    if (!ambient || reduce) return;
    let t;
    const loop = () => {
      t = setTimeout(() => {
        if (Date.now() - last.current > 6000) play(EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)], true);
        loop();
      }, 6000 + Math.random() * 3000);
    };
    loop();
    return () => clearTimeout(t);
  }, [ambient, reduce]); // eslint-disable-line react-hooks/exhaustive-deps

  const tap = () => { play(EMOTIONS[cycle.current % EMOTIONS.length]); cycle.current += 1; };
  const flush = e === "blush" ? 0.55 : e === "shy" ? 0.4 : e === "kiss" ? 0.3 : 0.14;

  return (
    <svg viewBox={head.box} className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${onTapCycle ? "" : "pointer-events-none"}`}
      style={{ opacity: show ? 1 : 0 }} data-testid={`face-${kind}`} data-emotion={e} aria-hidden={!onTapCycle}>
      <Defs id={id} />
      <g transform={`translate(${head.x} ${head.y})`}>
        <Body id={id} low={head.low} />
        <motion.g style={{ transformBox: "view-box", transformOrigin: `${head.x}px ${head.y + 92}px` }} animate={{ rotate: e === "sigh" ? -5 : 0 }} transition={{ duration: 0.7 }}>
          <path d={HEAD} fill={`url(#${id}-wk)`} />
          <path d={HEAD} fill={`url(#${id}-shade)`} />
          <path d="M -4 -24 L -6 26 M 4 -24 L 6 26" stroke="#e0a965" strokeWidth="3" strokeLinecap="round" opacity=".75" />
          <path d="M -10 -22 L -12 24 M 10 -22 L 12 24" stroke="#6b4422" strokeWidth="1.6" opacity=".5" />
          <path d="M -12 27 Q 0 34 12 27" stroke="#5c3a1a" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <motion.g initial={false} animate={{ opacity: flush }} transition={{ duration: 0.6 }} filter={`url(#${id}-soft)`}>
            <ellipse cx="-50" cy="12" rx="19" ry="7" fill={ROSE} transform="rotate(-12 -50 12)" />
            <ellipse cx="50" cy="12" rx="19" ry="7" fill={ROSE} transform="rotate(12 50 12)" />
          </motion.g>
          <path d={BEARD} fill={`url(#${id}-beard)`} opacity=".92" />
          <path d="M -24 37 Q -12 31 0 34 Q 12 31 24 37" stroke="#4d3016" strokeWidth="4" strokeLinecap="round" fill="none" opacity=".85" />
          <path d={HEAD} fill="none" stroke="#4a2c14" strokeWidth="4" />
          <Eyes e={e} blink={blink && e === "idle"} />
          <Brows e={e} lift={lift && e === "idle"} />
          <Mouth e={e} />
          <path d={HAIR} fill={`url(#${id}-hair)`} stroke="#3a2410" strokeWidth="3.5" />
          <g fill="none" stroke="#b07a3c" strokeWidth="3" strokeLinecap="round">
            <path d="M -60 -70 C -40 -112 20 -122 70 -96" /><path d="M -50 -58 C -24 -96 30 -104 80 -74" />
            <path d="M -30 -62 C -6 -90 40 -92 84 -50" opacity=".8" />
          </g>
          <g fill="none" stroke="#7a4e22" strokeWidth="2.4" strokeLinecap="round">
            <path d="M 82 -60 C 96 -46 98 -30 92 -16" /><path d="M -72 -46 C -86 -40 -92 -30 -90 -18" />
            <path d="M 10 -126 C 22 -142 40 -146 54 -140" /><path d="M 44 -60 C 40 -44 30 -38 22 -36" />
          </g>
        </motion.g>
        {onTapCycle && <ellipse cy="-10" rx="92" ry="120" fill="transparent" style={{ cursor: "pointer" }} onClick={tap} data-testid="face-tap-target" />}
        <g key={n} className="pointer-events-none">
          {e === "kiss" && <Floater x={12} y={44} dx={60} delay={0.5} />}
          {e === "sigh" && [0, 1, 2].map((i) => <Floater key={i} x={-34 + i * 34} y={-120} dx={(i - 1) * 20} delay={0.4 + i * 0.35} scale={0.8} />)}
        </g>
      </g>
    </svg>
  );
}
