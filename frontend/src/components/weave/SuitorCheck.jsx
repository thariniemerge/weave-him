import { motion, AnimatePresence } from "framer-motion";
import { COPY, GOALS, SUITORS } from "../../content";
import { suitorVerdict } from "../../lib/weave";

const first = (n) => n.split(" ")[0];
const goalLabel = (id) => GOALS.find((g) => g.id === id)?.label;

// Torn-paper tag carrying a suitor's playful "no"
const Torn = ({ name, reason, testid }) => (
  <motion.p initial={{ opacity: 0, y: -4, rotate: -3 }} animate={{ opacity: 1, y: 0, rotate: -1 }} transition={{ duration: 0.3 }}
    data-testid={testid} className="torn-tag f-cg italic text-[13px] leading-snug text-[color:#2A211B] px-2.5 py-1 mt-1.5">
    <span className="not-italic font-bold text-[color:#8A2F3A]">✗ </span>{name}: {reason}
  </motion.p>
);

// Woven monogram initial over a dark woven silhouette (no portrait: the paintings are only for her husband)
const Monogram = ({ letter }) => (
  <span className="monogram relative shrink-0 w-9 h-9 rounded-full overflow-hidden flex items-center justify-center f-mark text-[19px] text-[color:#F1ECE1]" aria-hidden>
    <svg viewBox="0 0 36 36" className="absolute inset-0 w-full h-full"><path d="M18 7a6 6 0 1 1 0 12a6 6 0 1 1 0-12zM5 36c1-8 6-13 13-13s12 5 13 13z" fill="#2E2116" opacity=".6" /></svg>
    <span className="relative">{letter}</span>
  </span>
);

function SuitorCard({ s, musts, interests }) {
  const passes = musts.filter((m) => suitorVerdict(s, m).ok);
  return (
    <article className="parchment-card rounded-[10px] px-3 pt-2.5 pb-3" data-testid={`suitor-${s.id}`}>
      <div className="flex items-center gap-2">
        <Monogram letter={s.name[0]} />
        <div className="min-w-0">
          <p className="f-cg font-bold text-[15px] leading-[1.1]">{s.name}</p>
          <p className="f-sc text-[10.5px] tracking-[0.08em] text-[color:#4A5641] leading-tight">{s.title} · {goalLabel(s.goal)}</p>
        </div>
      </div>
      <p className="f-cg italic text-[12.5px] text-[color:#4A3A2E] mt-1 leading-snug">
        {s.interests.map((i, k) => <span key={i}>{k ? ", " : ""}<span className={interests.includes(i) ? "text-[color:#8A2F3A] font-semibold not-italic" : ""}>{i === "walks" ? "nature walks" : i}</span></span>)}
      </p>
      {passes.length > 0 && (
        <p className="f-cg text-[13px] text-[color:#3E5A3A] mt-1.5 leading-snug" data-testid={`suitor-${s.id}-passes`}>
          <span className="font-bold">✓ </span>{passes.map((m) => m.label).join(" · ")}
        </p>
      )}
      <AnimatePresence initial={false}>
        {musts.map((m) => {
          const v = suitorVerdict(s, m);
          return v.ok ? null : <Torn key={m.label} name={first(s.name)} reason={v.reason} testid={`suitor-${s.id}-no-${m.id}`} />;
        })}
      </AnimatePresence>
    </article>
  );
}

export function SuitorCheck({ musts, interests, verdict }) {
  const allFail = musts.filter((m) => SUITORS.every((s) => !suitorVerdict(s, m).ok));
  return (
    <section className="w-full" data-testid="suitor-check" aria-live="polite">
      <div className="flex items-baseline justify-between mb-2">
        <p className="f-sc text-[14px] tracking-[0.1em] text-[color:var(--check-ink,#2A211B)]">{COPY.checkTitle}</p>
        <p className="f-sc text-[12px] text-[color:var(--check-ink,#4A5641)]">{musts.length} checked</p>
      </div>
      {!musts.length && <p className="f-cg italic text-[16px] text-[color:var(--check-ink,#4A3A2E)] mb-2" data-testid="suitor-check-empty">{COPY.checkEmpty}</p>}
      {allFail.map((m) => (
        <p key={m.label} data-testid={`suitor-check-none-${m.id}`} className="f-cg italic text-[15px] mb-2 px-3 py-1.5 rounded-md bg-[color:#6B2E36] text-[color:#F1ECE1]">
          {COPY.checkNone(m.label)}
        </p>
      ))}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5">
        {SUITORS.map((s) => <SuitorCard key={s.id} s={s} musts={musts} interests={interests} />)}
      </div>
      {verdict && (
        <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} data-testid="suitor-check-verdict"
          className="lg:hidden f-cg italic font-semibold text-center text-[19px] mt-3 text-[color:var(--check-ink,#6B2E36)]">{verdict}</motion.p>
      )}
    </section>
  );
}

// "None of them had it all" when every suitor misses one; otherwise name the closest
export function checkVerdict(musts) {
  const full = SUITORS.find((s) => musts.every((m) => suitorVerdict(s, m).ok));
  return full ? COPY.checkClose(first(full.name)) : COPY.checkVerdict;
}
export const failCount = (m) => SUITORS.filter((s) => !suitorVerdict(s, m).ok).length;
