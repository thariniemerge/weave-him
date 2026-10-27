import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X } from "lucide-react";
import { Page, Pill, Art, Chip } from "../components/weave/ui";
import { StrandHeader, WovenProgress } from "../components/weave/StrandHeader";
import { COPY, REMEMBERS } from "../content";
import { useAnswers } from "../lib/store";

const TINTS = ["var(--wisteria)", "var(--ochre)", "var(--sage)", "var(--wedgwood)", "var(--peony)", "var(--wisteria)"];

export default function Remembers() {
  const nav = useNavigate();
  const { answers, set } = useAnswers();
  const picks = answers.remembers;
  const custom = picks.find((p) => p.custom);
  const [draft, setDraft] = useState("");
  const full = picks.length >= 3;
  const has = (id) => picks.some((p) => p.id === id);
  const toggle = (id) => set("remembers", has(id) ? picks.filter((p) => p.id !== id) : full ? picks : [...picks, { id }]);
  const addCustom = () => {
    const t = draft.trim();
    if (!t || full) return;
    set("remembers", [...picks.filter((p) => !p.custom), { custom: t }]); setDraft("");
  };

  return (
    <Page>
      <StrandHeader n={6} back="/strand/5" />
      <section className="stitch-card px-6 pt-8 pb-7 mt-3" data-testid="remembers-card">
        <Art name="floral-card" className="absolute -top-5 -left-4 w-14" />
        <p className="f-sc text-center text-[13px] text-[color:#5A3D34]">{COPY.orderTitle}</p>
        <h1 className="f-cg font-bold text-center text-[32px] leading-tight mt-2">
          {COPY.remembersTitle[0]}<span className="italic text-[color:var(--rose)]">{COPY.remembersTitle[1]}</span>
        </h1>
        <p className="f-cg italic text-center text-[17px] text-[color:#5A3D34]">{COPY.remembersSub}</p>
        <p data-testid="remembers-count" className="f-sc text-center text-[12px] mt-1 text-[color:var(--rose)]">{picks.length} of 3 chosen</p>
        <div className="flex flex-wrap gap-2.5 justify-center mt-5">
          {REMEMBERS.map((r, i) => (
            <Chip key={r.id} data-testid={`remember-chip-${r.id}`} active={has(r.id)} tint={has(r.id) ? "var(--rose)" : TINTS[i]}
              disabled={!has(r.id) && full} onClick={() => toggle(r.id)}
              className={`f-body font-semibold text-[16px] ${has(r.id) ? "text-[color:var(--parchment)]" : ""} disabled:opacity-60`}>
              <span className="flex items-center gap-2">{has(r.id) && <Art name="heart" className="w-5 h-5" />}{r.label}</span>
            </Chip>
          ))}
          {custom && (
            <Chip active tint="var(--rose)" data-testid="remember-chip-custom" onClick={() => set("remembers", picks.filter((p) => !p.custom))}
              className="f-cg italic text-[17px] text-[color:var(--parchment)]">
              <span className="flex items-center gap-2">{custom.custom}<X className="w-4 h-4" /></span>
            </Chip>
          )}
        </div>
        {!custom && (
          <div className="mt-5 flex items-center gap-2 border-b-2 border-dotted border-[color:var(--peony)] pb-1">
            <input data-testid="remember-custom-input" maxLength={60} value={draft} disabled={full} placeholder={COPY.remembersOwnPlaceholder}
              onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCustom()}
              aria-label={COPY.remembersOwn}
              className="flex-1 min-h-[44px] bg-transparent outline-none f-cg italic text-[18px] placeholder:text-[color:#9a7f73] disabled:opacity-40" />
            <button data-testid="remember-custom-add" onClick={addCustom} disabled={!draft.trim() || full} aria-label="Add your own"
              className="w-11 h-11 rounded-full flex items-center justify-center bg-[color:var(--wisteria)] border border-[color:var(--gold)] disabled:opacity-40">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        )}
      </section>
      <div className="mt-auto pt-8">
        <WovenProgress done={5} />
        <Pill data-testid="next-feel-button" className="mt-5" disabled={!picks.length} onClick={() => nav("/strand/7")}>{COPY.nextFeel}</Pill>
      </div>
    </Page>
  );
}
