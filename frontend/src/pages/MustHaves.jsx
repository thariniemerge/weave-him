import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page } from "../components/weave/ui";
import { StrandHeader } from "../components/weave/StrandHeader";
import { StrandCTA } from "../components/weave/StrandCTA";
import { ChipPicker, PickCard } from "../components/weave/ChipPicker";
import { PanelOrInline } from "../components/weave/Layout";
import { SuitorCheck, checkVerdict, failCount } from "../components/weave/SuitorCheck";
import { COPY, MUSTHAVES } from "../content";
import { useAnswers } from "../lib/store";
import { resolveMust, resolveInterest } from "../lib/weave";
import { play } from "../lib/sound";

// Strand X: her non-negotiables, checked live against the suitors on file
export default function MustHaves() {
  const nav = useNavigate();
  const { answers, set } = useAnswers();
  const picks = answers.musts || [];
  const musts = picks.map(resolveMust).filter(Boolean);
  const interests = (answers.interests || []).map(resolveInterest).filter(Boolean).map((i) => i.id);
  const [verdict, setVerdict] = useState(null);
  const timers = useRef([]);
  const onChange = (next) => {
    const added = next.filter((p) => !picks.includes(p)).map(resolveMust).filter(Boolean);
    // a thread snaps for every suitor who fails the new must-have
    added.forEach((m) => { for (let i = 0; i < failCount(m); i++) timers.current.push(setTimeout(() => play("snap", { rate: 0.9 + i * 0.05 }), 140 + i * 110)); });
    setVerdict(null);
    set("musts", next);
  };
  const confirm = () => {
    play("harp");
    setVerdict(checkVerdict(musts));
    setTimeout(() => document.querySelector("[data-testid=suitor-check-verdict]")?.scrollIntoView({ behavior: "smooth", block: "center" }), 60);
    setTimeout(() => nav("/bands"), 2400);
  };
  const check = <SuitorCheck musts={musts} interests={interests} verdict={verdict} />;
  return (
    <Page>
      <StrandHeader n={10} back="/strand/9" />
      <PickCard testid="musts-card" title={COPY.mustsTitle} sub={COPY.mustsSub} count={`${picks.length} of 5 chosen`}>
        <ChipPicker items={MUSTHAVES} picks={picks} onChange={onChange} max={5} prefix="must"
          placeholder={COPY.mustsOwnPlaceholder} ownLabel="Add my own must-have" />
      </PickCard>
      <PanelOrInline><div className="mt-5 lg:mt-0 w-full lg:max-h-[88vh] lg:overflow-y-auto check-panel">{check}</div></PanelOrInline>
      {verdict && <p className="hidden lg:block f-cg italic font-semibold text-center text-[19px] mt-4 text-[color:var(--rose)]" data-testid="musts-verdict">{verdict}</p>}
      <StrandCTA data-testid="weave-him-musts-button" disabled={!picks.length || !!verdict} onClick={confirm}>{COPY.weaveHim}</StrandCTA>
    </Page>
  );
}
