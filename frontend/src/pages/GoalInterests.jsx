import { useNavigate } from "react-router-dom";
import { Page } from "../components/weave/ui";
import { StrandHeader } from "../components/weave/StrandHeader";
import { StrandCTA } from "../components/weave/StrandCTA";
import { ChipPicker, PickCard } from "../components/weave/ChipPicker";
import { Option } from "../components/weave/QuestionCard";
import { COPY, GOALS, INTERESTS } from "../content";
import { useAnswers } from "../lib/store";

// Strand VIII: one relationship goal
export function Goal() {
  const nav = useNavigate();
  const { answers, set } = useAnswers();
  return (
    <Page>
      <StrandHeader n={8} back="/strand/7" />
      <PickCard testid="goal-card" title={COPY.goalTitle} sub={COPY.goalSub}>
        <div className="space-y-3 mt-5">
          {GOALS.map((g, i) => (
            <Option key={g.id} opt={g} i={i} active={answers.goal === g.id}
              onPick={() => { set("goal", answers.goal === g.id ? null : g.id); }} />
          ))}
        </div>
      </PickCard>
      <StrandCTA data-testid="next-interests-button" disabled={!answers.goal} onClick={() => { nav("/strand/9"); }}>{COPY.nextInterests}</StrandCTA>
    </Page>
  );
}

// Strand IX: up to five things I love
export function Interests() {
  const nav = useNavigate();
  const { answers, set } = useAnswers();
  const picks = answers.interests || [];
  const chosen = picks.filter((p) => !p.custom).length;
  return (
    <Page>
      <StrandHeader n={9} back="/strand/8" />
      <PickCard testid="interests-card" title={COPY.interestsTitle} sub={COPY.interestsSub} count={`${chosen} of 5 chosen${picks.length > chosen ? " · plus my own" : ""}`}>
        <ChipPicker items={INTERESTS} picks={picks} onChange={(v) => set("interests", v)} max={5} prefix="interest"
          placeholder={COPY.interestsOwnPlaceholder} ownLabel="Add a thing I love" />
      </PickCard>
      <StrandCTA data-testid="next-musts-button" disabled={!picks.length} onClick={() => { nav("/strand/10"); }}>{COPY.nextMusts}</StrandCTA>
    </Page>
  );
}
