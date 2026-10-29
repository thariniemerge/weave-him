import { useState } from "react";
import { StrandCTA } from "../components/weave/StrandCTA";
import { useNavigate } from "react-router-dom";
import { Plus, X } from "lucide-react";
import { Page, Pill, Art, Chip } from "../components/weave/ui";
import { StrandHeader, WovenProgress } from "../components/weave/StrandHeader";
import { COPY, REMEMBERS } from "../content";
import { useAnswers } from "../lib/store";
import { topByLinks } from "../lib/weave";

const TINTS = ["var(--wisteria)", "var(--ochre)", "var(--sage)", "var(--wedgwood)", "var(--peony)", "var(--wisteria)"];

export default function Remembers() {
  const nav = useNavigate();
  const { answers, set } = useAnswers();
  const picks = answers.remembers;
  const custom = picks.find((p) => p.custom);
  const [draft, setDraft] = useState("");
  const full = picks.length >= 2;
  const shown = topByLinks(REMEMBERS, answers, picks);
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
        <p className="f-sc text-center text-[13px] text-[color:#4A5641]">{COPY.orderTitle}</p>
        <h1 className="f-cg font-bold text-center text-[32px] leading-tight mt-2">
          {COPY.remembersTitle[0]}<span className="italic text-[color:var(--rose)]">{COPY.remembersTitle[1]}</span>{COPY.remembersTitle[2]}
        </h1>
        <p className="f-cg italic text-center text-[17px] text-[color:#4A5641]">{COPY.remembersSub}</p>
        <p data-testid="remembers-count" className="f-sc text-center text-[12px] mt-1 text-[color:var(--rose)]">{picks.length} of 2 chosen</p>
        <div className="flex flex-wrap gap-2.5 justify-center mt-5">
          {shown.map((r, i) => (
            <Chip key={r.id} data-testid={`remember-chip-${r.id}`} active={has(r.id)} tint={has(r.id) ? "var(--rose)" : TINTS[i]}
              disabled={!has(r.id) && full} onClick={() => toggle(r.id)}
              className={`f-body font-semibold text-[16px] ${has(r.id) ? "text-[color:var(--paper)]" : ""} disabled:opacity-60`}>
              <span className="flex items-center gap-2">{has(r.id) && <Art name="heart" className="w-5 h-5" />}{r.label}</span>
            </Chip>
          ))}
          {custom && (
            <Chip active tint="var(--rose)" data-testid="remember-chip-custom" onClick={() => set("remembers", picks.filter((p) => !p.custom))}
              className="f-cg italic text-[17px] text-[color:var(--paper)]">
              <span className="flex items-center gap-2">{custom.custom}<X className="w-4 h-4" /></span>
            </Chip>
          )}
        </div>
        {!custom && (
          <div className="mt-5">
            <label className="block f-cg italic font-semibold text-center text-[17px] mb-2 text-[color:var(--rose)]" htmlFor="remember-own">{COPY.spinOwn}</label>
            <div className="own-pill flex items-center gap-2 pl-4 pr-1.5 rounded-full border-2 transition-colors duration-300 border-dashed border-[color:var(--rose)] bg-[color:rgba(107,46,54,.04)]">
              <input id="remember-own" data-testid="remember-custom-input" maxLength={60} value={draft} disabled={full} placeholder={COPY.remembersOwnPlaceholder}
                onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCustom()}
                aria-label={COPY.remembersOwn}
                className="flex-1 min-w-0 min-h-[52px] bg-transparent outline-none f-cg italic text-[18px] placeholder:text-[color:#5E5A4E] disabled:opacity-40" />
              <button data-testid="remember-custom-add" onClick={addCustom} disabled={!draft.trim() || full} aria-label="Add my own"
                className="w-11 h-11 rounded-full flex items-center justify-center bg-[color:var(--wisteria)] border border-[color:var(--gold)] disabled:opacity-40">
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </section>
      <div className="mt-auto pt-8 hidden">
        <WovenProgress done={5} />
      </div>
      <StrandCTA data-testid="next-feel-button" disabled={!picks.length} onClick={() => { nav("/strand/7"); }}>{COPY.nextFeel}</StrandCTA>
    </Page>
  );
}
