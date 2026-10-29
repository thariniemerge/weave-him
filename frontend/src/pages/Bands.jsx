import { useEffect, useRef } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Page, SoundToggle } from "../components/weave/ui";
import { Medallion } from "../components/weave/Medallion";
import { PanelOrInline } from "../components/weave/Layout";
import { StrandCTA } from "../components/weave/StrandCTA";
import { StitchedBands } from "../components/weave/StitchedBands";
import { useAnswers } from "../lib/store";
import { allBandLabels, isComplete, pickPortrait } from "../lib/weave";
import { COPY } from "../content";
import { vowsFor } from "../lib/vowDraft";
import { preloadClips } from "../lib/sound";

const MAX = 3;

export default function Bands() {
  const nav = useNavigate();
  const { answers, set } = useAnswers();
  const chipsRef = useRef(null);
  const ready = isComplete(answers);
  const labels = ready ? allBandLabels(answers) : [];
  // nothing is pre-ticked: she chooses all three herself
  const picked = (answers.bandPick || []).filter((l) => labels.includes(l));
  // her band picks feed the vows too: rewrite them in the background once she settles
  const pickKey = picked.join("|");
  // the weaving screen's hum and finishing chime load now, so they play without a delay
  useEffect(() => { preloadClips(["weave-hum", "weave-done"]); }, []);
  useEffect(() => {
    if (!ready || !picked.length) return;
    const t = setTimeout(() => vowsFor(answers), 700);
    return () => clearTimeout(t);
  }, [pickKey]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!ready) return <Navigate to="/strand/1" replace />;

  const toChips = () => chipsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  const cta = picked.length >= MAX ? COPY.weaveHim : COPY.bandsLeft(MAX - picked.length);
  const toggle = (l) => {
    if (picked.includes(l)) { set("bandPick", picked.filter((x) => x !== l)); return; }
    if (picked.length >= MAX) return;
    set("bandPick", [...picked, l]);
  };

  return (
    <Page>
      <header className="flex items-center justify-between h-12 mb-2">
        <Link to="/strand/10" aria-label="Back" data-testid="back-button" className="w-11 h-11 -ml-2 flex items-center justify-center rounded-full hover:bg-[color:var(--wisteria)]">
          <ChevronLeft className="w-6 h-6" strokeWidth={1.5} />
        </Link>
        <SoundToggle />
      </header>
      <p className="f-sc text-center text-[13px] text-[color:#4A5641]">{COPY.bandsKicker}</p>
      <h1 className="f-cg font-bold text-center text-[30px] leading-tight mt-1">
        {COPY.bandsTitle[0]}<span className="italic text-[color:var(--rose)]">{COPY.bandsTitle[1]}</span>
      </h1>
      <p data-testid="bands-instruction" className="f-cg italic text-center text-[17px] leading-snug mt-1 text-[color:#4A5641]">{COPY.bandsSub}</p>
      <PanelOrInline forest>
        <button type="button" onClick={toChips} aria-label={COPY.bandsPreviewLabel} data-testid="bands-preview"
          className="relative block w-full max-w-[138px] lg:max-w-[440px] mx-auto my-1 lg:my-0">
          <Medallion band={[]} portrait={pickPortrait(answers)} label={COPY.bandsPreviewLabel} />
          <StitchedBands picked={picked} />
        </button>
      </PanelOrInline>
      <p className="f-cg italic text-center text-[15px] mt-3 text-[color:#4A3A2E]" data-testid="bands-count" aria-live="polite">{picked.length} of {MAX} chosen</p>
      <div ref={chipsRef} className="flex flex-wrap justify-center gap-2 mt-2" data-testid="band-choices">
        {labels.map((l, n) => {
          const i = picked.indexOf(l);
          return (
            <motion.button key={l} type="button" whileTap={{ scale: 0.95 }} onClick={() => toggle(l)} aria-pressed={i >= 0}
              aria-label={i >= 0 ? `${l}, band ${i + 1} of ${MAX}. Tap to remove` : `Add band ${l}`} data-testid={`band-choice-${l.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
              className={`relative min-h-[44px] pl-4 pr-4 rounded-full f-sc text-[14px] font-semibold tracking-[0.06em] transition-colors duration-200 ${n === 0 && !picked.length ? "band-hint" : ""} ${i >= 0 ? "bg-[color:var(--rose)] text-[color:var(--paper)] border border-[color:#4F1F27]" : "border border-dashed border-[color:#9AA38A] bg-[color:var(--paper)]"}`}>
              {i >= 0 && <span className="absolute -top-2 -left-1 w-5 h-5 rounded-full bg-[color:var(--ochre)] text-[color:var(--ink)] text-[11px] flex items-center justify-center border border-[color:#7D7462]">{i + 1}</span>}
              {l}
            </motion.button>
          );
        })}
      </div>
      <div className="mt-auto" />
      <StrandCTA data-testid="weave-him-button" disabled={picked.length < MAX} aria-label={cta} onClick={() => { nav("/weaving"); }}>{cta}</StrandCTA>
    </Page>
  );
}
