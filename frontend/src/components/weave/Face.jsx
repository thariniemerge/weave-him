import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BANDS } from "./BandText";

export const EMOTIONS = ["smile", "wink", "blush", "hearts", "kiss", "sigh", "shy"];
const DUR = { smile: 1900, wink: 1800, blush: 2100, hearts: 2000, kiss: 2400, sigh: 2500, shy: 2300 };

// Tiny event bus so pages can make him emote: emote("wink")
const subs = new Set();
export const emote = (name) => subs.forEach((f) => f(name));

// Where the oval/hoop window sits in each art, and where his figure (drawn in a 810x1000 space) goes
const SPOTS = {
  cameo: { box: "0 0 834 780", clip: <ellipse cx="414.5" cy="392" rx="210" ry="256" />, cx: 414.5, cy: 392, s: 0.6, bg: "mist" },
  hoop: { box: "0 0 834 837", clip: <circle cx="414" cy="426" r="301" />, cx: 414, cy: 450, s: 0.6, bg: "cloth" },
};
const INK = "#2A1D14", LANTERN = "#C99A4A";
const fb = { transformBox: "fill-box", transformOrigin: "center" };
const HEART = "M0 3 C -6 -3 -10 2 -5 6 L 0 10 L 5 6 C 10 2 6 -3 0 3 Z";

const Defs = ({ id }) => (
  <defs>
    <pattern id={`${id}-wk`} width="16" height="11" patternUnits="userSpaceOnUse">
      <rect width="16" height="11" fill="#7A583A" />
      <rect x="1" y="1.5" width="6" height="2.6" rx="1.2" fill="#C9965A" opacity=".75" /><rect x="9" y="1.5" width="6" height="2.6" rx="1.2" fill="#A97A48" opacity=".6" />
      <rect x="5" y="7" width="6" height="2.6" rx="1.2" fill="#C9965A" opacity=".6" /><rect x="-3" y="7" width="6" height="2.6" rx="1.2" fill="#B5844E" opacity=".55" /><rect x="13" y="7" width="6" height="2.6" rx="1.2" fill="#B5844E" opacity=".55" />
    </pattern>
    <pattern id={`${id}-hair`} width="12" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(-18)">
      <rect width="12" height="9" fill="#4E3626" /><rect y="2" width="12" height="2.2" rx="1.1" fill="#6A4A33" />
    </pattern>
    <pattern id={`${id}-band`} width="14" height="10" patternUnits="userSpaceOnUse">
      <rect width="14" height="10" fill="#3A2616" /><rect x="1" y="1" width="6" height="3" rx="1.4" fill="#5A3C22" /><rect x="7" y="6" width="6" height="3" rx="1.4" fill="#4E331D" />
    </pattern>
    <radialGradient id={`${id}-mist`} cx="50%" cy="36%" r="70%">
      <stop offset="0" stopColor="#DCE2D2" /><stop offset=".5" stopColor="#A9B49E" /><stop offset="1" stopColor="#5E6B59" />
    </radialGradient>
    <linearGradient id={`${id}-ray`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#FFF6DA" stopOpacity=".45" /><stop offset="1" stopColor="#FFF6DA" stopOpacity="0" />
    </linearGradient>
    <radialGradient id={`${id}-shade`} cx="40%" cy="28%" r="80%">
      <stop offset="0" stopColor="#FFF0D0" stopOpacity=".22" /><stop offset=".6" stopColor="#FFF0D0" stopOpacity="0" /><stop offset="1" stopColor="#1A0F08" stopOpacity=".38" />
    </radialGradient>
    <pattern id={`${id}-cloth`} width="26" height="26" patternUnits="userSpaceOnUse">
      <rect width="26" height="26" fill="#F3F1F2" /><path d="M0 .5 H26 M.5 0 V26" stroke="#C9CEC1" strokeWidth="1" />
    </pattern>
    <filter id={`${id}-soft`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9" /></filter>
    <filter id={`${id}-glow`} x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="2.2" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
  </defs>
);

// Window behind him: misty forest light (cameo) or plain hoop cloth
const Backdrop = ({ id, kind }) => (kind === "mist" ? (
  <g>
    <rect x="0" y="0" width="834" height="840" fill={`url(#${id}-mist)`} />
    {[[150, 225], [258, 290], [560, 610], [640, 690]].map(([a, b], i) => <rect key={i} x={a} y="0" width={b - a} height="840" fill="#56634F" opacity={0.28 + (i % 2) * 0.12} />)}
    {[[180, 250], [300, 340], [420, 470]].map(([a, b], i) => <path key={i} d={`M${a} 0 L${b} 0 L${b + 300} 840 L${a + 220} 840 Z`} fill={`url(#${id}-ray)`} />)}
  </g>
) : <rect x="0" y="0" width="834" height="840" fill={`url(#${id}-cloth)`} />);

// Static wicker figure, drawn in the 810x1000 reference space
const Figure = ({ id }) => {
  const W = `url(#${id}-wk)`;
  return (
    <g>
      <path d="M95 1000 L112 700 C150 650 250 630 330 615 L490 615 C570 630 670 650 704 700 L722 1000 Z" fill={W} />
      <path d="M95 1000 L112 700 C150 650 250 630 330 615 L490 615 C570 630 670 650 704 700 L722 1000 Z" fill={`url(#${id}-shade)`} />
      <path d="M112 700 C150 650 250 630 330 615 L490 615 C570 630 670 650 704 700" fill="none" stroke={INK} strokeWidth="5" />
      <path d="M345 530 L340 622 L480 622 L474 530 Z" fill={W} stroke={INK} strokeWidth="5" />
      <path d="M345 560 C385 590 435 590 474 560 L474 530 L345 530 Z" fill="#1A0F08" opacity=".3" />
      <path d="M268 660 C320 642 380 650 408 664 C436 650 496 642 548 660" fill="none" stroke="#D9A46A" strokeWidth="3" opacity=".6" />
      <g opacity=".55" stroke="#2A1D14" strokeWidth="3"><rect x="248" y="684" width="158" height="104" rx="30" fill="#8A6644" /><rect x="410" y="684" width="158" height="104" rx="30" fill="#8A6644" /></g>
      <g opacity=".4" stroke="#2A1D14" strokeWidth="2.5" fill="#8A6644">
        {[805, 856, 907].map((y) => <g key={y}><rect x="328" y={y} width="76" height="42" rx="14" /><rect x="412" y={y} width="76" height="42" rx="14" /></g>)}
      </g>
      <ellipse cx="265" cy="392" rx="20" ry="40" fill={W} stroke={INK} strokeWidth="4" />
      <ellipse cx="551" cy="392" rx="20" ry="40" fill={W} stroke={INK} strokeWidth="4" />
    </g>
  );
};
const HEAD = "M278 300 C270 380 280 470 320 530 C350 568 380 584 409 584 C440 584 470 568 500 530 C540 470 548 380 540 300 C520 200 300 200 278 300 Z";
const HAIR = "M262 340 C246 232 318 150 420 148 C522 146 572 222 552 306 C548 334 542 362 536 386 L522 334 C504 300 474 288 444 282 C420 298 378 300 340 300 C310 306 292 332 284 384 Z";

function Eyes({ e, blink }) {
  const closed = e === "sigh" || e === "kiss";
  return (
    <g>
      {[-1, 1].map((side) => {
        const winkEye = e === "wink" && side === 1;
        const look = e === "shy" ? { x: [0, -8, -8, -1, 0], y: [0, 5, 5, -1, 0] } : e === "blush" ? { x: 0, y: 4 } : { x: 0, y: 0 };
        return (
          <g key={side} transform={`translate(${side < 0 ? 352 : 459} 376)`}>
            <motion.g style={fb} animate={{ scaleY: blink ? 0.08 : e === "smile" ? 0.6 : 1, opacity: closed || winkEye ? 0 : 1 }} transition={{ duration: blink ? 0.12 : 0.3 }}>
              <path d="M-32 0 Q0 -17 32 0 Q0 13 -32 0 Z" fill="#EEE7DA" />
              <motion.g animate={look} transition={e === "shy" ? { duration: 2.2, times: [0, 0.2, 0.6, 0.85, 1] } : { duration: 0.4 }}>
                <motion.g initial={false} animate={{ opacity: e === "hearts" ? 0 : 1 }}>
                  <circle r="10.5" fill="#4F8F86" /><circle r="4.6" fill="#16120E" /><circle cx="3.5" cy="-3.5" r="2" fill="#fff" />
                </motion.g>
                <motion.g initial={false} animate={{ opacity: e === "hearts" ? 1 : 0 }} filter="url(#hk-glow)">
                  <motion.path d={HEART} transform="translate(0 -8) scale(2.1)" fill={LANTERN} stroke="#8a6428" strokeWidth=".8" style={fb}
                    animate={e === "hearts" ? { scale: [1, 1.25, 1, 1.25, 1] } : { scale: 1 }} transition={{ duration: 1.6 }} />
                </motion.g>
              </motion.g>
              <path d="M-34 1 Q0 -20 34 -1" stroke={INK} strokeWidth="5" fill="none" strokeLinecap="round" />
            </motion.g>
            <motion.path d="M-30 -2 Q0 12 30 -2" stroke={INK} strokeWidth="4.5" fill="none" strokeLinecap="round" initial={false} animate={{ opacity: closed || winkEye ? 1 : 0 }} />
            <motion.path d={`M${side * 30} 6 l${side * 10} 5`} stroke={INK} strokeWidth="2.5" strokeLinecap="round" initial={false} animate={{ opacity: e === "smile" ? 0.8 : 0 }} />
          </g>
        );
      })}
    </g>
  );
}

function Brows({ e, lift }) {
  const R = e === "wink" ? { y: -12, rotate: -5 } : e === "shy" ? { y: [0, 4, 4, -5, 0] } : e === "sigh" ? { y: -4 } : { y: lift ? -7 : 0, rotate: 0 };
  const L = e === "shy" ? { y: [0, 4, 4, -5, 0] } : e === "sigh" ? { y: -4 } : { y: lift ? -7 : 0 };
  const t = e === "shy" ? { duration: 2.2 } : { duration: 0.45 };
  return (
    <g fill="#3A281C">
      <motion.path d="M312 352 C330 334 362 332 388 340 L386 352 C362 346 336 348 316 360 Z" style={fb} animate={L} transition={t} />
      <motion.path d="M424 340 C452 330 482 334 500 352 L496 360 C478 348 452 346 426 352 Z" style={fb} animate={R} transition={t} />
    </g>
  );
}

function Mouth({ e }) {
  const grin = e === "smile" || e === "hearts" || e === "wink";
  const op = (on) => ({ initial: false, animate: { opacity: on ? 1 : 0 }, transition: { duration: 0.25 } });
  return (
    <g fill="none" strokeLinecap="round">
      <motion.path d="M366 494 Q400 510 432 500 Q446 494 456 482" stroke="#5A2A2A" strokeWidth="5.5" {...op(!grin && e !== "kiss")} />
      <motion.g {...op(grin)}>
        <path d="M356 488 Q404 528 450 496 Q460 488 466 476" stroke="#5A2A2A" strokeWidth="6" />
        <path d="M372 496 Q404 514 440 500" stroke="#EEE7DA" strokeWidth="4" opacity=".85" />
      </motion.g>
      <motion.ellipse cx="410" cy="498" rx="10" ry="8.5" stroke="#5A2A2A" strokeWidth="5" {...op(e === "kiss")} />
    </g>
  );
}

const Floater = ({ x, y, dx = 0, delay = 0, scale = 1 }) => (
  <motion.path d={HEART} fill={LANTERN} stroke="#8a6428" strokeWidth="1" style={fb}
    initial={{ opacity: 0, x, y, scale }} animate={{ opacity: [0, 1, 0], x: x + dx, y: y - 130, scale: scale * 1.3 }}
    transition={{ duration: 1.9, delay, ease: "easeOut" }} />
);

// Head + face, animated (also used still on the share card)
function Head({ id, e, blink, lift }) {
  const flush = e === "blush" ? 0.55 : e === "shy" ? 0.4 : e === "kiss" ? 0.3 : 0.1;
  return (
    <motion.g style={{ transformBox: "view-box", transformOrigin: "409px 600px" }} animate={{ rotate: e === "sigh" ? -5 : 0 }} transition={{ duration: 0.7 }}>
      <path d={HEAD} fill={`url(#${id}-wk)`} />
      <path d={HEAD} fill={`url(#${id}-shade)`} />
      <path d="M300 470 C330 540 380 578 409 580 C438 578 488 540 518 470 C500 520 470 556 440 566 C420 556 398 556 378 566 C348 556 318 520 300 470 Z" fill="#2E1E12" opacity=".35" />
      <motion.g initial={false} animate={{ opacity: flush }} transition={{ duration: 0.6 }} filter={`url(#${id}-soft)`}>
        <ellipse cx="330" cy="430" rx="30" ry="12" fill="#B4543F" transform="rotate(-10 330 430)" />
        <ellipse cx="488" cy="430" rx="30" ry="12" fill="#B4543F" transform="rotate(10 488 430)" />
      </motion.g>
      <path d="M408 384 L398 446 Q404 456 420 450" stroke="#D9A46A" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M396 446 Q404 452 412 450" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M408 540 L406 562" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      <path d={HEAD} fill="none" stroke={INK} strokeWidth="5" />
      <Eyes e={e} blink={blink} />
      <Brows e={e} lift={lift} />
      <Mouth e={e} />
      <path d={HAIR} fill={`url(#${id}-hair)`} stroke={INK} strokeWidth="5" />
      <g fill="none" strokeLinecap="round">
        <path d="M300 262 C338 196 428 174 502 204" stroke="#C8A070" strokeWidth="4" opacity=".8" />
        <path d="M330 250 C382 202 452 194 522 234" stroke="#C8A070" strokeWidth="3" opacity=".55" />
        <path d="M480 226 C514 252 530 296 526 344" stroke="#2A1D14" strokeWidth="3" opacity=".7" />
      </g>
    </motion.g>
  );
}

export function Face({ kind = "cameo", ambient = false, show = true, onTapCycle = false }) {
  const reduce = useReducedMotion();
  const spot = SPOTS[kind];
  const id = "hk";
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
        if (k % 3 === 0) { setLift(true); setTimeout(() => setLift(false), 700); } else { setBlink(true); setTimeout(() => setBlink(false), 170); }
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
  const fig = `translate(${spot.cx} ${spot.cy}) scale(${spot.s}) translate(-405 -500)`;
  const op = typeof show === "number" ? show : show ? 1 : 0;
  const bands = BANDS[kind].paths;

  return (
    <svg viewBox={spot.box} className={`absolute inset-0 w-full h-full ${onTapCycle ? "" : "pointer-events-none"}`}
      data-testid={`face-${kind}`} data-emotion={e} aria-hidden={!onTapCycle}>
      <Defs id={id} />
      <clipPath id={`${id}-${kind}-win`}>{spot.clip}</clipPath>
      <g clipPath={`url(#${id}-${kind}-win)`}>
        <Backdrop id={id} kind={spot.bg} />
        <g style={{ opacity: op, transition: "opacity .6s" }}>
          <g transform={fig}>
            <Figure id={id} />
            <Head id={id} e={e} blink={blink && e === "idle"} lift={lift && e === "idle"} />
          </g>
          {bands.map((d, i) => <path key={i} d={d} stroke={`url(#${id}-band)`} strokeWidth="36" fill="none" strokeLinecap="round" data-testid={i === 2 ? "band-strip" : undefined} />)}
          {bands.map((d, i) => <path key={`e${i}`} d={d} stroke="#1A0F08" strokeOpacity=".5" strokeWidth="38" fill="none" strokeLinecap="round" style={{ mixBlendMode: "multiply" }} opacity=".25" />)}
          <g transform={`translate(${spot.cx} ${spot.cy + (kind === "hoop" ? 62 : 60)}) scale(2.3)`} filter={`url(#${id}-glow)`}>
            <path d={HEART} fill={LANTERN} stroke="#7a5a26" strokeWidth=".6" />
          </g>
        </g>
      </g>
      {onTapCycle && <ellipse cx={spot.cx} cy={spot.cy - 130} rx="110" ry="140" fill="transparent" style={{ cursor: "pointer" }} onClick={tap} data-testid="face-tap-target" />}
      <g key={n} className="pointer-events-none" transform={fig}>
        {e === "kiss" && <Floater x={430} y={490} dx={90} delay={0.5} />}
        {e === "sigh" && [0, 1, 2].map((i) => <Floater key={i} x={350 + i * 60} y={170} dx={(i - 1) * 30} delay={0.4 + i * 0.35} scale={1.2} />)}
      </g>
    </svg>
  );
}

// Still portrait for the share card: same figure, idle face, no bands (the card prints his strands itself)
export const StillHusband = ({ className }) => (
  <svg viewBox="0 0 523.5 757.2" className={className} aria-hidden data-testid="card-husband">
    <Defs id="hkc" />
    <clipPath id="hkc-win"><ellipse cx="261.75" cy="378.6" rx="261.75" ry="378.6" /></clipPath>
    <g clipPath="url(#hkc-win)">
      <g transform="scale(.628 .9)"><Backdrop id="hkc" kind="mist" /></g>
      <g transform="translate(261.75 392) scale(.82) translate(-405 -500)">
        <Figure id="hkc" />
        <Head id="hkc" e="idle" />
      </g>
    </g>
  </svg>
);
