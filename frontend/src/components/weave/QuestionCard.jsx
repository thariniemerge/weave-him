import { useState } from "react";
import { motion } from "framer-motion";
import { asList, MAX_PICKS } from "../../lib/weave";
import { Feather } from "lucide-react";
import { Art, Accent } from "./ui";
import { COPY } from "../../content";
import { play } from "../../lib/sound";

const TINTS = ["var(--wisteria)", "var(--ochre)", "var(--sage)", "var(--wedgwood)"];

const SHAKE = { x: [0, -7, 7, -5, 5, 0], transition: { duration: 0.4 } };

const Option = ({ opt, i, active, onPick, shake }) => (
  <motion.button animate={shake ? SHAKE : { x: 0 }}
    data-testid={`option-${opt.id}`} onClick={onPick} aria-pressed={active}
    className={`w-full min-h-[56px] flex items-center justify-between gap-3 pl-5 pr-3 py-2 rounded-full text-left transition-[background-color,transform,box-shadow] duration-250 active:scale-[0.985] ${active ? "bg-[color:var(--rose)] text-[color:var(--parchment)] shadow-[0_8px_16px_-8px_rgba(156,61,79,.8)] border border-[color:#7d2e3e]" : "border border-dashed border-[color:#b8956a]"}`}
    style={active ? undefined : { background: TINTS[i % 4] }}
  >
    <span className="f-body font-semibold text-[16px] leading-tight">{opt.label}</span>
    <Art name={active ? "heart" : "heart-empty"} className={`shrink-0 transition-transform duration-300 ${active ? "w-9 h-9 scale-105" : "w-7 h-7 opacity-80"}`} />
  </motion.button>
);

export const QuestionCard = ({ q, value, onChange }) => {
  const picks = asList(value);
  const custom = picks.find((p) => p.custom !== undefined);
  const others = picks.filter((p) => p.custom === undefined);
  const [text, setText] = useState(custom?.custom || "");
  const [shake, setShake] = useState(null);
  const nope = (id) => { setShake(`${id}-${Date.now()}`); play("tick", { rate: 0.6 }); };
  const toggle = (o, i) => {
    if (others.some((p) => p.id === o.id)) { play("pluck", { rate: 0.8 }); onChange(picks.filter((p) => p.id !== o.id)); return; }
    if (picks.length >= MAX_PICKS) return nope(o.id);
    play("pluck", { rate: 0.9 + i * 0.08 });
    onChange([...picks, { id: o.id }]);
  };
  const onText = (t) => {
    if (t.trim() && !custom && others.length >= MAX_PICKS) return nope("custom");
    setText(t);
    onChange(t.trim() ? [...others, { custom: t }] : others);
  };
  return (
    <section className="stitch-card px-6 pt-8 pb-6 mt-3" data-testid="question-card">
      <Art name="floral-card" className="absolute -top-5 -left-4 w-14" />
      <div className="absolute -top-5 -right-4 w-14 h-14 rounded-full bg-[color:var(--rose)] border-[3px] border-[color:var(--paper)] shadow-[0_0_0_1.5px_#7d2e3e,0_4px_10px_-4px_rgba(58,36,32,.6)] flex items-center justify-center">
        <span className="absolute inset-[4px] rounded-full border border-dashed border-[color:rgba(246,239,228,.6)]" />
        <span className="f-mark text-[26px] leading-none text-[color:var(--parchment)]">W</span>
      </div>
      <p className="f-sc text-center text-[13px] text-[color:#5A3D34]">{q.kicker || COPY.orderTitle}</p>
      <div className="flex items-center justify-center gap-2 my-2 text-[color:var(--rose)]">
        <span className="h-0 w-14 border-t-2 border-dashed border-current opacity-70" />
        <Art name="heart" className="w-5 h-5" />
        <span className="h-0 w-14 border-t-2 border-dashed border-current opacity-70" />
      </div>
      <h1 data-testid="question-text" className="f-cg font-bold italic text-center text-[30px] leading-[1.1] mb-5">
        <Accent text={q.text} className="text-[color:var(--rose)]" />
      </h1>
      <p data-testid="up-to-three" className={`f-cg italic text-center text-[16px] -mt-3 mb-4 transition-colors ${shake ? "text-[color:var(--rose)]" : "text-[color:#6b4f45]"}`}>
        {COPY.upToThree}{picks.length ? ` · ${picks.length} of ${MAX_PICKS}` : ""}
      </p>
      <div className="space-y-3">
        {q.options.map((o, i) => (
          <Option key={o.id} opt={o} i={i} active={others.some((p) => p.id === o.id)} shake={shake?.startsWith(`${o.id}-`) ? shake : null} onPick={() => toggle(o, i)} />
        ))}
      </div>
      <label className="block f-sc text-[12px] mt-5 mb-1 text-[color:#5A3D34]" htmlFor={`own-${q.key}`}>{COPY.spinOwn}</label>
      <motion.div animate={shake?.startsWith("custom-") ? SHAKE : { x: 0 }} key={shake?.startsWith("custom-") ? shake : "c"}
        className={`flex items-center gap-2 border-b-2 border-dotted pb-1 ${custom ? "border-[color:var(--rose)]" : "border-[color:var(--peony)]"}`}>
        <Feather className="w-5 h-5 text-[color:var(--rose)] shrink-0" strokeWidth={1.5} />
        <input
          id={`own-${q.key}`} data-testid="custom-answer-input" maxLength={60} value={text} placeholder={COPY.spinPlaceholder}
          onChange={(e) => onText(e.target.value)}
          className="flex-1 min-h-[44px] bg-transparent outline-none f-cg italic text-[19px] placeholder:text-[color:#9a7f73]"
        />
        <span className="f-sc text-[11px] text-[color:#9a7f73]">{text.length}/60</span>
      </motion.div>
    </section>
  );
};
