import { useState } from "react";
import { Feather } from "lucide-react";
import { Art, Accent } from "./ui";
import { COPY } from "../../content";
import { play } from "../../lib/sound";

const TINTS = ["var(--wisteria)", "var(--ochre)", "var(--sage)", "var(--wedgwood)"];

const Option = ({ opt, i, active, onPick }) => (
  <button
    data-testid={`option-${opt.id}`} onClick={onPick} aria-pressed={active}
    className={`w-full min-h-[56px] flex items-center justify-between gap-3 pl-5 pr-3 py-2 rounded-full text-left transition-[background-color,transform,box-shadow] duration-250 active:scale-[0.985] ${active ? "bg-[color:var(--rose)] text-[color:var(--parchment)] shadow-[0_8px_16px_-8px_rgba(156,61,79,.8)] border border-[color:#7d2e3e]" : "border border-dashed border-[color:#b8956a]"}`}
    style={active ? undefined : { background: TINTS[i % 4] }}
  >
    <span className="f-body font-semibold text-[16px] leading-tight">{opt.label}</span>
    <Art name={active ? "heart" : "heart-empty"} className={`shrink-0 transition-transform duration-300 ${active ? "w-9 h-9 scale-105" : "w-7 h-7 opacity-80"}`} />
  </button>
);

export const QuestionCard = ({ q, value, onChange }) => {
  const [text, setText] = useState(value?.custom || "");
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
      <div className="space-y-3">
        {q.options.map((o, i) => (
          <Option key={o.id} opt={o} i={i} active={value?.id === o.id} onPick={() => { play("pluck", { rate: 0.9 + i * 0.08 }); setText(""); onChange({ id: o.id }); }} />
        ))}
      </div>
      <label className="block f-sc text-[12px] mt-5 mb-1 text-[color:#5A3D34]" htmlFor={`own-${q.key}`}>{COPY.spinOwn}</label>
      <div className={`flex items-center gap-2 border-b-2 border-dotted pb-1 ${value?.custom ? "border-[color:var(--rose)]" : "border-[color:var(--peony)]"}`}>
        <Feather className="w-5 h-5 text-[color:var(--rose)] shrink-0" strokeWidth={1.5} />
        <input
          id={`own-${q.key}`} data-testid="custom-answer-input" maxLength={60} value={text} placeholder={COPY.spinPlaceholder}
          onChange={(e) => { setText(e.target.value); onChange(e.target.value.trim() ? { custom: e.target.value } : null); }}
          className="flex-1 min-h-[44px] bg-transparent outline-none f-cg italic text-[19px] placeholder:text-[color:#9a7f73]"
        />
        <span className="f-sc text-[11px] text-[color:#9a7f73]">{text.length}/60</span>
      </div>
    </section>
  );
};
