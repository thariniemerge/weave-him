import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import RAW from "../../assets/huskK";
import { BANDS } from "./BandText";

export const EMOTIONS = ["smile", "wink", "blush", "hearts", "kiss", "sigh", "shy"];
const DUR = { smile: 1900, wink: 1800, blush: 2100, hearts: 2000, kiss: 2400, sigh: 2500, shy: 2300 };

// Tiny event bus so pages can make him emote: emote("wink")
const subs = new Set();
export const emote = (name) => subs.forEach((f) => f(name));

// The oval/hoop window in each art, and where his 400x500 figure sits (percent of the art box)
const SPOTS = {
  // cameo: `open` is the frame's innermost ring; he's 122% of its width, bottom-anchored and dropped 10%
  cameo: { box: "0 0 834 780", clip: <ellipse cx="414.5" cy="392" rx="230" ry="317" />, bg: "mist", cx: 414.5, cy: 392, tapY: 320,
    open: { left: "22.12%", top: "9.62%", width: "55.16%", height: "81.28%" },
    fig: { left: "19.72%", top: "10.19%", width: "59.95%", height: "80.13%", clipPath: "ellipse(42% 41% at 50% 50%)" } },
  hoop: { box: "0 0 834 837", clip: <circle cx="414" cy="426" r="301" />, bg: "cloth", cx: 414, cy: 426,
    fig: { left: "17.69%", top: "11.11%", width: "63.91%", height: "79.57%", clipPath: "ellipse(56.5% 45.2% at 50% 50%)" } },
};
const LANTERN = "#C99A4A";
const HEART = "M0 3 C -6 -3 -10 2 -5 6 L 0 10 L 5 6 C 10 2 6 -3 0 3 Z";
const fb = { transformBox: "fill-box", transformOrigin: "center" };

const BackDefs = ({ id }) => (
  <defs>
    <radialGradient id={`${id}-mist`} cx="50%" cy="36%" r="70%">
      <stop offset="0" stopColor="#DCE2D2" /><stop offset=".5" stopColor="#A9B49E" /><stop offset="1" stopColor="#5E6B59" />
    </radialGradient>
    <linearGradient id={`${id}-ray`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#FFF6DA" stopOpacity=".45" /><stop offset="1" stopColor="#FFF6DA" stopOpacity="0" />
    </linearGradient>
    <pattern id={`${id}-cloth`} width="26" height="26" patternUnits="userSpaceOnUse">
      <rect width="26" height="26" fill="#F3F1F2" /><path d="M0 .5 H26 M.5 0 V26" stroke="#C9CEC1" strokeWidth="1" />
    </pattern>
  </defs>
);

// Window behind him: misty forest light (cameo) or plain hoop cloth. Hides the storyboard's old figure.
const Backdrop = ({ id, kind }) => (kind === "mist" ? (
  <g>
    <rect x="0" y="0" width="834" height="840" fill={`url(#${id}-mist)`} />
    {[[150, 225], [258, 290], [560, 610], [640, 690]].map(([a, b], i) => <rect key={i} x={a} y="0" width={b - a} height="840" fill="#56634F" opacity={0.28 + (i % 2) * 0.12} />)}
    {[[180, 250], [300, 340], [420, 470]].map(([a, b], i) => <path key={i} d={`M${a} 0 L${b} 0 L${b + 300} 840 L${a + 220} 840 Z`} fill={`url(#${id}-ray)`} />)}
  </g>
) : <rect x="0" y="0" width="834" height="840" fill={`url(#${id}-cloth)`} />);

const On = ({ on, children }) => <motion.g initial={false} animate={{ opacity: on ? 1 : 0 }} transition={{ duration: 0.25 }}>{children}</motion.g>;

const Floater = ({ x, y, dx = 0, delay = 0, scale = 1 }) => (
  <motion.path d={HEART} fill={LANTERN} stroke="#8a6428" strokeWidth=".6" style={fb}
    initial={{ opacity: 0, x, y, scale }} animate={{ opacity: [0, 1, 0], x: x + dx, y: y - 70, scale: scale * 1.3 }}
    transition={{ duration: 1.9, delay, ease: "easeOut" }} />
);

// Additions drawn over his face (same 400x500 space as the figure): closed lids, grin, pucker, flush, heart irises
function Overlay({ e, n }) {
  const closed = e === "sigh" || e === "kiss";
  const lid = (x) => <path d={`M${x - 15} 184 Q${x} 192 ${x + 14} 184`} stroke="#24170E" strokeWidth="2.6" fill="none" strokeLinecap="round" />;
  return (
    <>
      <defs><filter id="hko-soft" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="4" /></filter>
        <filter id="hko-glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="1.4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
      <motion.g initial={false} animate={{ opacity: e === "blush" ? 0.6 : e === "shy" ? 0.45 : e === "kiss" ? 0.3 : 0 }} transition={{ duration: 0.6 }} filter="url(#hko-soft)">
        <ellipse cx="160" cy="210" rx="15" ry="7" fill="#B4543F" /><ellipse cx="240" cy="210" rx="15" ry="7" fill="#B4543F" />
      </motion.g>
      <On on={closed}>{lid(176)}{lid(224)}</On>
      <On on={e === "wink"}>{lid(224)}<path d="M246 168 l3 -6 l3 6 l-3 6z" fill="#F0C978" /></On>
      <On on={e === "smile"}><path d="M160 190 l-5 3 M240 190 l5 3" stroke="#3A2614" strokeWidth="1.6" strokeLinecap="round" /></On>
      <On on={e === "smile" || e === "wink" || e === "hearts"}>
        <path d="M178 242 Q199 262 224 236" stroke="#5A2A26" strokeWidth="3.4" fill="none" strokeLinecap="round" />
        <path d="M186 248 Q200 256 216 245" stroke="#EFE6D2" strokeWidth="2.2" fill="none" opacity=".85" />
      </On>
      <On on={e === "kiss"}><ellipse cx="201" cy="247" rx="5.5" ry="5" stroke="#5A2A26" strokeWidth="2.8" fill="none" /></On>
      <On on={e === "hearts"}>
        {[177, 225].map((x) => (
          <g key={x} transform={`translate(${x} 179.5)`} filter="url(#hko-glow)">
            <motion.path d={HEART} transform="scale(.95)" fill={LANTERN} stroke="#8a6428" strokeWidth=".5" style={fb}
              animate={e === "hearts" ? { scale: [1, 1.25, 1, 1.25, 1] } : { scale: 1 }} transition={{ duration: 1.6 }} />
          </g>
        ))}
      </On>
      <g transform="translate(200 300) scale(1.25)" filter="url(#hko-glow)"><path d={HEART} fill={LANTERN} stroke="#7a5a26" strokeWidth=".5" /></g>
      <g key={n}>
        {e === "kiss" && <Floater x={210} y={245} dx={50} delay={0.5} />}
        {e === "sigh" && [0, 1, 2].map((i) => <Floater key={i} x={170 + i * 30} y={80} dx={(i - 1) * 14} delay={0.4 + i * 0.35} scale={0.9} />)}
      </g>
    </>
  );
}

export function Face({ kind = "cameo", ambient = false, show = true, onTapCycle = false }) {
  const reduce = useReducedMotion();
  const spot = SPOTS[kind];
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
  const op = typeof show === "number" ? show : show ? 1 : 0;
  const cls = `hk e-${e}${blink && e === "idle" ? " blink" : ""}${lift && e === "idle" ? " lift" : ""}`;

  const figure = (
    <>
      <div className="hk-fig absolute inset-0" dangerouslySetInnerHTML={{ __html: RAW }} />
      <svg viewBox="0 0 400 500" className="absolute inset-0 w-full h-full" aria-hidden><Overlay e={e} n={n} /></svg>
    </>
  );
  return (
    <div className={`absolute inset-0 ${cls} ${onTapCycle ? "" : "pointer-events-none"}`} data-testid={`face-${kind}`} data-emotion={e}>
      {spot.open ? (
        <div className="absolute overflow-hidden rounded-[50%]" data-testid={`opening-${kind}`}
          style={{ ...spot.open, background: "radial-gradient(75% 60% at 50% 30%, #DCE2D2 0%, #A9B49E 55%, #5E6B59 100%)" }}>
          <div className="hk-move absolute" style={{ left: "-11%", width: "122%", bottom: "-10%", aspectRatio: "400 / 500", opacity: op, transition: "opacity .6s" }}>{figure}</div>
        </div>
      ) : (
        <>
          <svg viewBox={spot.box} className="absolute inset-0 w-full h-full" aria-hidden>
            <BackDefs id={`hkb-${kind}`} />
            <clipPath id={`hkb-${kind}-win`}>{spot.clip}</clipPath>
            <g clipPath={`url(#hkb-${kind}-win)`}><Backdrop id={`hkb-${kind}`} kind={spot.bg} /></g>
          </svg>
          <div className="hk-move absolute" style={{ ...spot.fig, opacity: op, transition: "opacity .6s" }}>{figure}</div>
        </>
      )}
      <svg viewBox={spot.box} className="absolute inset-0 w-full h-full" aria-hidden={!onTapCycle}>
        <g style={{ opacity: op, transition: "opacity .6s" }}>
          {BANDS[kind].paths.map((d, i) => (
            <path key={i} d={d} stroke="#4F1F27" strokeOpacity=".5" strokeWidth={BANDS[kind].font + 9} fill="none" strokeLinecap="round" data-testid={i === 2 ? "band-strip" : undefined} />
          ))}
        </g>
        {onTapCycle && <ellipse cx={spot.cx} cy={spot.tapY || spot.cy - 110} rx="110" ry="140" fill="transparent" style={{ cursor: "pointer" }} onClick={tap} data-testid="face-tap-target" />}
      </svg>
    </div>
  );
}

// Still portrait for the share card: the same figure file, idle, filling the card's oval
export const StillHusband = ({ className }) => (
  <div className={className} aria-hidden data-testid="card-husband" style={{ overflow: "hidden", borderRadius: "50%" }}>
    <svg viewBox="0 0 523.5 757.2" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
      <BackDefs id="hkc" /><g transform="scale(.628 .9)"><Backdrop id="hkc" kind="mist" /></g>
    </svg>
    <div className="hk-fig absolute" style={{ left: "-11%", width: "122%", bottom: "-10%", aspectRatio: "400 / 500" }} dangerouslySetInnerHTML={{ __html: RAW }} />
  </div>
);
