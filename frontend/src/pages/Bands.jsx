import { useEffect } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Page, SoundToggle } from "../components/weave/ui";
import { Medallion } from "../components/weave/Medallion";
import { PanelOrInline } from "../components/weave/Layout";
import { StrandCTA } from "../components/weave/StrandCTA";
import { useAnswers } from "../lib/store";
import { allBandLabels, isComplete, orderBands, pickPortrait } from "../lib/weave";
import { play } from "../lib/sound";
import { COPY } from "../content";

const MAX = 3;

export default function Bands() {
  const nav = useNavigate();
  const { answers, set } = useAnswers();
  const ready = isComplete(answers);
  const labels = ready ? allBandLabels(answers) : [];
  const picked = (answers.bandPick || labels.slice(0, MAX)).filter((l) => labels.includes(l));
  useEffect(() => { if (ready && !answers.bandPick) set("bandPick", labels.slice(0, MAX)); }); // eslint-disable-line react-hooks/exhaustive-deps
  if (!ready) return <Navigate to="/strand/1" replace />;

  const toggle = (l) => {
    if (picked.includes(l)) { play("pluck", { rate: 0.8 }); set("bandPick", picked.filter((x) => x !== l)); return; }
    if (picked.length >= MAX) { play("tick", { rate: 0.6 }); return; }
    play("pluck", { rate: 1 + picked.length * 0.12 });
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
      <p className="f-cg italic text-center text-[17px] mt-1 text-[color:#4A5641]">{COPY.bandsSub}</p>
      <PanelOrInline>
        <div className="w-full max-w-[230px] lg:max-w-[440px] mx-auto mt-2" data-testid="bands-preview">
          <Medallion band={orderBands(labels, picked)} portrait={pickPortrait(answers)} strands={10} label="Your wicker husband wearing the chosen strands" />
        </div>
      </PanelOrInline>
      <div className="flex flex-wrap justify-center gap-2 mt-3" data-testid="band-choices">
        {labels.map((l) => {
          const i = picked.indexOf(l);
          return (
            <motion.button key={l} type="button" whileTap={{ scale: 0.95 }} onClick={() => toggle(l)} aria-pressed={i >= 0} data-testid={`band-choice-${l.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
              className={`relative min-h-[44px] pl-4 pr-4 rounded-full f-sc text-[14px] font-semibold tracking-[0.06em] transition-colors duration-200 ${i >= 0 ? "bg-[color:var(--rose)] text-[color:var(--paper)] border border-[color:#4F1F27]" : "border border-dashed border-[color:#9AA38A] bg-[color:var(--paper)]"}`}>
              {i >= 0 && <span className="absolute -top-2 -left-1 w-5 h-5 rounded-full bg-[color:var(--ochre)] text-[color:var(--ink)] text-[11px] flex items-center justify-center border border-[color:#7D7462]">{i + 1}</span>}
              {l}
            </motion.button>
          );
        })}
      </div>
      <p className="f-cg italic text-center text-[15px] mt-2 text-[color:#4A3A2E]" data-testid="bands-count">{picked.length} of {MAX} chosen</p>
      <div className="mt-auto" />
      <StrandCTA data-testid="weave-him-button" disabled={!picked.length} onClick={() => { play("page"); nav("/weaving"); }}>{COPY.weaveHim}</StrandCTA>
    </Page>
  );
}
