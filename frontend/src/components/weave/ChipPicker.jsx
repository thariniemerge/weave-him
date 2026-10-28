import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Art, Chip } from "./ui";
import { COPY } from "../../content";

const TINTS = ["var(--wisteria)", "var(--ochre)", "var(--sage)", "var(--wedgwood)", "var(--peony)", "var(--wisteria)"];

// Chips she can pick (up to `max`) plus one chip in her own words on top; picks are [{ id } | { custom }]
// `countOwn`: her own chip counts towards `max` (otherwise it comes on top)
export function ChipPicker({ items, picks, onChange, max, prefix, placeholder, ownLabel, countOwn = false }) {
  const custom = picks.find((p) => p.custom);
  const [draft, setDraft] = useState("");
  const full = (countOwn ? picks.length : picks.filter((p) => !p.custom).length) >= max;
  const ownBlocked = countOwn && full;
  const has = (id) => picks.some((p) => p.id === id);
  const toggle = (id) => {
    onChange(has(id) ? picks.filter((p) => p.id !== id) : full ? picks : [...picks, { id }]);
  };
  const addCustom = () => {
    const t = draft.trim();
    if (!t || ownBlocked) return;
    onChange([...picks.filter((p) => !p.custom), { custom: t }]); setDraft("");
  };
  return (
    <>
      <div className="flex flex-wrap gap-2.5 justify-center mt-5" data-testid={`${prefix}-chips`}>
        {items.map((r, i) => (
          <Chip key={r.id} data-testid={`${prefix}-chip-${r.id}`} active={has(r.id)} tint={has(r.id) ? "var(--rose)" : TINTS[i % TINTS.length]}
            disabled={!has(r.id) && full} onClick={() => toggle(r.id)} aria-pressed={has(r.id)}
            className={`f-body font-semibold text-[15px] ${has(r.id) ? "text-[color:var(--paper)]" : ""} disabled:opacity-60`}>
            <span className="flex items-center gap-2">{has(r.id) && <Art name="heart" className="w-5 h-5" />}{r.label}</span>
          </Chip>
        ))}
        {custom && (
          <Chip active tint="var(--rose)" data-testid={`${prefix}-chip-custom`} onClick={() => onChange(picks.filter((p) => !p.custom))}
            className="f-cg italic text-[17px] text-[color:var(--paper)]">
            <span className="flex items-center gap-2">{custom.custom}<X className="w-4 h-4" /></span>
          </Chip>
        )}
      </div>
      {!custom && (
        <div className="mt-5">
          <label className="block f-cg italic font-semibold text-center text-[17px] mb-2 text-[color:var(--rose)]" htmlFor={`${prefix}-own`}>{COPY.spinOwn}</label>
          <div className="flex items-center gap-2 pl-4 pr-1.5 rounded-full border-2 transition-colors duration-300 border-dashed border-[color:var(--rose)] bg-[color:rgba(107,46,54,.04)]">
            <input id={`${prefix}-own`} data-testid={`${prefix}-custom-input`} maxLength={50} value={draft} placeholder={placeholder} disabled={ownBlocked}
              onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCustom()} aria-label={ownLabel}
              className="flex-1 min-w-0 min-h-[52px] bg-transparent outline-none f-cg italic text-[18px] placeholder:text-[color:#5E5A4E] disabled:opacity-40" />
            <button data-testid={`${prefix}-custom-add`} onClick={addCustom} disabled={!draft.trim() || ownBlocked} aria-label={ownLabel}
              className="w-11 h-11 rounded-full flex items-center justify-center bg-[color:var(--wisteria)] border border-[color:var(--gold)] disabled:opacity-40">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// The stitched card shared by strands VIII to X
export const PickCard = ({ testid, title, sub, count, children }) => (
  <section className="stitch-card px-6 pt-8 pb-7 mt-3" data-testid={testid}>
    <Art name="floral-card" className="absolute -top-5 -left-4 w-14" />
    <h1 className="f-cg font-bold text-center text-[32px] leading-tight mt-1">
      {title[0]}<span className="italic text-[color:var(--rose)]">{title[1]}</span>
    </h1>
    <p className="f-cg italic text-center text-[17px] text-[color:#4A5641]">{sub}</p>
    {count && <p data-testid={`${testid}-count`} className="f-sc text-center text-[12px] mt-1 text-[color:var(--rose)]">{count}</p>}
    {children}
  </section>
);
