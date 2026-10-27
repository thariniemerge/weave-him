import { motion } from "framer-motion";
import { emote } from "./Face";
import { play } from "../../lib/sound";

const ROSE = "#9C3D4F", INK = "#3A2420", PEONY = "#D9A0A6";
const st = { fill: "none", strokeLinecap: "round", strokeDasharray: "3.2 2.4" };
const HEART = "M0 2 C -4 -2 -7 1.5 -3.5 4.2 L 0 7 L 3.5 4.2 C 7 1.5 4 -2 0 2 Z";

// Tiny stitched glyphs, drawn on a 40x40 grid
const GLYPHS = {
  smile: <><path d="M12 17 Q15 13 18 17 M22 17 Q25 13 28 17" stroke={INK} strokeWidth="2" {...st} /><path d="M12 24 Q20 32 28 24" stroke={ROSE} strokeWidth="2.2" {...st} /></>,
  wink: <><ellipse cx="15" cy="16" rx="2" ry="3" fill={INK} /><path d="M22 16 Q25 19 28 16" stroke={INK} strokeWidth="2" {...st} /><path d="M13 25 Q20 31 27 25" stroke={ROSE} strokeWidth="2.2" {...st} /></>,
  blush: <><ellipse cx="15" cy="16" rx="2" ry="3" fill={INK} /><ellipse cx="25" cy="16" rx="2" ry="3" fill={INK} /><ellipse cx="11" cy="23" rx="4" ry="2.6" fill={ROSE} opacity=".75" /><ellipse cx="29" cy="23" rx="4" ry="2.6" fill={ROSE} opacity=".75" /><path d="M16 26 Q20 29 24 26" stroke={ROSE} strokeWidth="2" {...st} /></>,
  hearts: <><path d={HEART} transform="translate(15 13)" fill={ROSE} /><path d={HEART} transform="translate(25 13)" fill={ROSE} /><path d="M13 25 Q20 31 27 25" stroke={ROSE} strokeWidth="2.2" {...st} /></>,
  kiss: <><path d="M12 17 Q15 19 18 17 M22 17 Q25 19 28 17" stroke={INK} strokeWidth="2" {...st} /><circle cx="20" cy="26" r="2.8" stroke={ROSE} strokeWidth="2" {...st} /><path d={HEART} transform="translate(30 6) scale(.8)" fill={ROSE} /></>,
  sigh: <><path d="M12 18 Q15 20 18 18 M22 18 Q25 20 28 18" stroke={INK} strokeWidth="2" {...st} /><path d="M16 26 Q20 28 24 26" stroke={ROSE} strokeWidth="2" {...st} /><path d={HEART} transform="translate(13 4) scale(.6)" fill={PEONY} /><path d={HEART} transform="translate(21 2) scale(.7)" fill={ROSE} /><path d={HEART} transform="translate(29 5) scale(.55)" fill={PEONY} /></>,
  shy: <><ellipse cx="13" cy="19" rx="2" ry="2.6" fill={INK} /><ellipse cx="23" cy="19" rx="2" ry="2.6" fill={INK} /><ellipse cx="11" cy="25" rx="3.6" ry="2.3" fill={PEONY} /><ellipse cx="29" cy="25" rx="3.6" ry="2.3" fill={PEONY} /><path d="M16 27 Q19 29 22 27" stroke={ROSE} strokeWidth="2" {...st} /></>,
};
const ITEMS = [["smile", "Smile"], ["wink", "Wink"], ["blush", "Blush"], ["hearts", "Heart eyes"], ["kiss", "Kiss"], ["sigh", "Sigh"], ["shy", "Shy"]];

export const EmotionPicker = () => (
  <div className="mt-3 flex justify-center gap-1 flex-wrap" role="group" aria-label="Make him feel" data-testid="emotion-picker">
    {ITEMS.map(([id, label], i) => (
      <motion.button key={id} type="button" data-testid={`emotion-${id}`} aria-label={label} title={label}
        whileTap={{ scale: 0.88 }} onClick={() => { play("pluck", { rate: 1 + i * 0.07 }); emote(id); }}
        className="group flex flex-col items-center w-[42px] min-h-[44px]">
        <span className="w-10 h-10 rounded-full bg-[color:var(--paper)] border border-dashed border-[color:var(--rose)] shadow-[0_3px_8px_-5px_rgba(58,36,32,.6)] flex items-center justify-center transition-[background-color,transform] duration-200 group-hover:-translate-y-0.5 group-hover:bg-[color:var(--wisteria)]">
          <svg viewBox="0 0 40 40" className="w-9 h-9" aria-hidden>{GLYPHS[id]}</svg>
        </span>
        <span className="f-sc text-[10px] leading-tight mt-1 text-[color:#5A3D34] text-center">{label}</span>
      </motion.button>
    ))}
  </div>
);
