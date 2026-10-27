import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from "../components/ui/drawer";
import { Art, Pill, Page, Footer } from "../components/weave/ui";
import { COPY, CONFIG } from "../content";
import { getStats } from "../lib/api";
import { useAnswers } from "../lib/store";

const HowItWorks = ({ open, onOpenChange }) => (
  <Drawer open={open} onOpenChange={onOpenChange}>
    <DrawerContent className="mx-auto max-w-[430px] bg-[color:var(--paper)] border-[color:var(--gold)]" data-testid="how-it-works-sheet">
      <div className="px-7 pt-4 pb-10">
        <DrawerTitle className="f-cg text-3xl font-semibold">How it <span className="italic text-[color:var(--rose)]">works</span></DrawerTitle>
        <DrawerDescription className="f-cg italic text-[17px] text-[color:#5A3D34] mt-1">dearest reader, it's quite simple…</DrawerDescription>
        <ol className="mt-6 space-y-5">
          {COPY.howSteps.map((s, i) => (
            <li key={s.title} className="flex gap-4 items-start">
              <span className="f-mark text-3xl text-[color:var(--rose)] w-8 shrink-0 leading-none">{["I", "II", "III"][i]}</span>
              <div>
                <p className="f-sc text-[15px] font-semibold">{s.title}{i < 2 && <span className="text-[color:var(--gold)]"> →</span>}</p>
                <p className="text-[16px] leading-snug mt-0.5">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </DrawerContent>
  </Drawer>
);

export default function Welcome() {
  const nav = useNavigate();
  const { reset } = useAnswers();
  const [count, setCount] = useState(null);
  const [how, setHow] = useState(false);
  useEffect(() => { getStats().then((d) => setCount(d.total)).catch(() => setCount(null)); }, []);
  const start = () => { reset(); nav("/strand/1"); };

  return (
    <Page className="pt-4">
      <header className="flex items-center justify-between h-11">
        <div className="flex items-center gap-2">
          <Art name="heart" className="w-6 h-6" />
          <span className="f-sc text-[15px] font-semibold">{COPY.guild}</span>
        </div>
        <button data-testid="how-it-works-link" onClick={() => setHow(true)} className="f-cg italic text-[17px] text-[color:var(--rose)] min-h-[44px] px-1">
          {COPY.howItWorks}
        </button>
      </header>
      <Art name="welcome-cameo" alt="A cameo portrait framed in roses beside a wicker basket" className="w-full -mt-1" />
      <p className="f-cg italic text-center text-[20px] -mt-1">{COPY.kicker}</p>
      <h1 data-testid="wordmark" className="f-mark text-center text-[color:var(--rose)] text-[68px] leading-[0.95] tracking-[0.01em]">{COPY.wordmark}</h1>
      <Art name="divider" className="w-full mt-1" />
      <p className="f-cg italic text-center text-[21px] leading-snug mt-2">{COPY.tagline[0]}<br />{COPY.tagline[1]}</p>
      <div className="mt-5">
        <Art name="steps" className="w-full px-3" />
        <div className="grid grid-cols-3 mt-1 text-center f-sc text-[14px] font-semibold">
          {COPY.steps.map((s) => <span key={s}>{s}</span>)}
        </div>
      </div>
      <Pill data-testid="commission-button" className="mt-5" onClick={start}>{COPY.cta}</Pill>
      <p data-testid="husband-counter" className="f-sc text-center text-[13px] mt-4 text-[color:#5A3D34]">
        {COPY.counter(count ?? "—")}
      </p>
      <Footer>{CONFIG.CREDIT_LINE}</Footer>
      <HowItWorks open={how} onOpenChange={setHow} />
    </Page>
  );
}
