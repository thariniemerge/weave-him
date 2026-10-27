import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export const EMOTIONS = ["smile", "wink", "blush", "hearts", "kiss", "sigh", "shy"];
const DUR = { smile: 1800, wink: 1600, blush: 2000, hearts: 2000, kiss: 2400, sigh: 2500, shy: 2300 };

// Tiny event bus so pages can make him emote: emote("wink")
const subs = new Set();
export const emote = (name) => subs.forEach((f) => f(name));

// Head centre & scale per art (viewBox = art width x 3)
const HEADS = {
  cameo: { box: "0 0 834 780", x: 414.5, y: 270, s: 1 },
  hoop: { box: "0 0 834 837", x: 414.5, y: 300, s: 0.8 },
};
const INK = "#3A2420", ROSE = "#9C3D4F", PEONY = "#D9A0A6";
const stitch = { fill: "none", strokeLinecap: "round", strokeDasharray: "5 3.5" };
const fb = { transformBox: "fill-box", transformOrigin: "center" };
const HEART = "M0 3 C -6 -3 -10 2 -5 6 L 0 10 L 5 6 C 10 2 6 -3 0 3 Z";

const Show = ({ on, children, ...p }) => (
  <motion.g initial={false} animate={{ opacity: on ? 1 : 0 }} transition={{ duration: 0.25 }} {...p}>{children}</motion.g>
);

const Floater = ({ x, y, dx = 0, delay = 0, scale = 1 }) => (
  <motion.path d={HEART} fill={ROSE} stroke="#7d2e3e" strokeWidth="1" style={fb}
    initial={{ opacity: 0, x, y, scale }} animate={{ opacity: [0, 1, 0], x: x + dx, y: y - 70, scale: scale * 1.2 }}
    transition={{ duration: 1.8, delay, ease: "easeOut" }} />
);

function Eyes({ e, blink }) {
  const open = !["smile", "wink", "hearts", "kiss", "sigh"].includes(e);
  const look = e === "shy" ? { x: [0, -7, -7, 0], y: [0, 6, 6, 0] } : { x: 0, y: 0 };
  return (
    <g>
      {[-1, 1].map((side) => (
        <g key={side} transform={`translate(${side * 25} -8)`}>
          <motion.g animate={look} transition={e === "shy" ? { duration: 2.2, times: [0, 0.2, 0.75, 1] } : { duration: 0.2 }}>
            <Show on={open && !(e === "wink" && side === 1)}>
              <motion.ellipse rx="4.2" ry="6" fill={INK} style={fb} animate={{ scaleY: blink ? 0.12 : 1 }} transition={{ duration: 0.09 }} />
            </Show>
          </motion.g>
          <Show on={e === "smile"}><path d="M -8 2 Q 0 -8 8 2" stroke={INK} strokeWidth="3.4" {...stitch} /></Show>
          <Show on={e === "wink" && side === 1}><path d="M -8 -1 Q 0 7 8 -1" stroke={INK} strokeWidth="3.4" {...stitch} /></Show>
          <Show on={e === "kiss" || e === "sigh"}><path d="M -8 0 Q 0 6 8 0" stroke={INK} strokeWidth="3.2" {...stitch} /></Show>
          <Show on={e === "hearts"}>
            <g transform="translate(0 -6) scale(1.15)">
              <motion.path d={HEART} fill={ROSE} stroke="#7d2e3e" strokeWidth="1" style={fb}
                animate={e === "hearts" ? { scale: [1, 1.35, 1, 1.35, 1] } : { scale: 1 }} transition={{ duration: 1.6 }} />
            </g>
          </Show>
        </g>
      ))}
      <Show on={e === "wink"}>
        <g transform="translate(44 -26)">
          <motion.path d="M0 -7 L1.8 -1.8 L7 0 L1.8 1.8 L0 7 L-1.8 1.8 L-7 0 L-1.8 -1.8 Z" fill="#C9A45C" style={fb}
            animate={e === "wink" ? { scale: [0, 1.3, 0], rotate: [0, 45, 90] } : { scale: 0 }} transition={{ duration: 1.1, delay: 0.2 }} />
        </g>
      </Show>
    </g>
  );
}

function Mouth({ e }) {
  const big = e === "smile" || e === "hearts" || e === "wink";
  return (
    <g transform="translate(0 30)">
      <Show on={!big && e !== "kiss"}><path d="M -15 -2 Q 0 9 15 -2" stroke={ROSE} strokeWidth="3.6" {...stitch} /></Show>
      <Show on={big}><path d="M -20 -4 Q 0 16 20 -4" stroke={ROSE} strokeWidth="3.8" {...stitch} /></Show>
      <Show on={e === "kiss"}><circle r="5.5" stroke={ROSE} strokeWidth="3.4" {...stitch} /></Show>
    </g>
  );
}

export function Face({ kind = "cameo", ambient = false, show = true, onTapCycle = false }) {
  const reduce = useReducedMotion();
  const head = HEADS[kind];
  const [e, setE] = useState("idle");
  const [blink, setBlink] = useState(false);
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

  useEffect(() => { subs.add(play); return () => { subs.delete(play); clearTimeout(timer.current); }; }); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (reduce) return;
    let t;
    const loop = () => { t = setTimeout(() => { setBlink(true); setTimeout(() => setBlink(false), 140); loop(); }, 2800 + Math.random() * 2600); };
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
  const blush = e === "blush" || e === "shy";

  return (
    <svg viewBox={head.box} className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${onTapCycle ? "" : "pointer-events-none"}`}
      style={{ opacity: show ? 1 : 0 }} data-testid={`face-${kind}`} data-emotion={e} aria-hidden={!onTapCycle}>
      <g transform={`translate(${head.x} ${head.y}) scale(${head.s})`}>
        {onTapCycle && <ellipse rx="80" ry="95" fill="transparent" style={{ cursor: "pointer" }} onClick={tap} data-testid="face-tap-target" />}
        <motion.g style={fb} animate={{ rotate: e === "sigh" ? -7 : 0 }} transition={{ duration: 0.6 }} className="pointer-events-none">
          {[-1, 1].map((side) => (
            <g key={side} transform={`translate(${side * 44} 16)`}>
              <ellipse rx="12" ry="7.5" fill={PEONY} opacity="0.5" />
              <motion.ellipse rx="12" ry="7.5" fill={ROSE} initial={false} animate={{ opacity: blush ? 0.75 : 0 }} transition={{ duration: 0.6 }} />
            </g>
          ))}
          <Eyes e={e} blink={blink && e === "idle"} />
          <Mouth e={e} />
        </motion.g>
        <g key={n} className="pointer-events-none">
          {e === "kiss" && <Floater x={10} y={28} dx={50} delay={0.5} />}
          {e === "sigh" && [0, 1, 2].map((i) => <Floater key={i} x={-30 + i * 30} y={-90} dx={(i - 1) * 18} delay={0.4 + i * 0.35} scale={0.8} />)}
        </g>
      </g>
    </svg>
  );
}
