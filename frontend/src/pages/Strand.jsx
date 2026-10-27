import { useNavigate, useParams, Navigate } from "react-router-dom";
import { Page, Pill, Art } from "../components/weave/ui";
import { StrandHeader, WovenProgress } from "../components/weave/StrandHeader";
import { QuestionCard } from "../components/weave/QuestionCard";
import { COPY, QUESTIONS } from "../content";
import { useAnswers } from "../lib/store";
import { resolveChoice } from "../lib/weave";
import Temperament from "./Temperament";
import Remembers from "./Remembers";

export const nextPath = (n) => (n < 7 ? `/strand/${n + 1}` : "/weaving");
export const prevPath = (n) => (n > 1 ? `/strand/${n - 1}` : "/");

const Aside = () => (
  <div className="relative text-center mt-6 mb-5">
    <p className="f-cg italic text-[17px]">{COPY.asideA}</p>
    <p className="f-cg italic text-[17px]"><span className="hl">{COPY.asideB}</span></p>
  </div>
);

function Question({ n }) {
  const nav = useNavigate();
  const { answers, set } = useAnswers();
  const q = QUESTIONS.find((x) => x.n === n);
  const value = answers[q.key];
  const ok = !!resolveChoice(q.key, value);
  return (
    <Page>
      <StrandHeader n={n} back={prevPath(n)} />
      <QuestionCard key={q.key} q={q} value={value} onChange={(v) => set(q.key, v)} />
      <Aside />
      <div className="mt-auto">
        <div className="relative">
          <Art name="corner-wedgwood" className="absolute -left-10 -top-8 w-12 opacity-80 -scale-x-100 pointer-events-none" />
          <WovenProgress done={n - 1} />
        </div>
        <Pill data-testid="weave-strand-button" className="mt-5" disabled={!ok} onClick={() => nav(nextPath(n))}>
          {n === 7 ? COPY.weaveHim : COPY.weaveStrand}
        </Pill>
      </div>
    </Page>
  );
}

export default function Strand() {
  const n = Number(useParams().n);
  if (!(n >= 1 && n <= 7)) return <Navigate to="/strand/1" replace />;
  if (n === 5) return <Temperament />;
  if (n === 6) return <Remembers />;
  return <Question key={n} n={n} />;
}
