import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Art, Pill, Page, SoundToggle } from "../components/weave/ui";
import { PanelOrInline, FallingLeaves } from "../components/weave/Layout";
import { COPY, CONFIG } from "../content";
import { useAnswers } from "../lib/store";

// The release hook says "till Friday", so it retires after release day (visitor's local time)
const beforeRelease = () => new Date() <= new Date(`${COPY.RELEASE_DAY}T23:59:59`);

export default function Welcome() {
  const nav = useNavigate();
  const { reset } = useAnswers();
  const [count] = useState(() => CONFIG.WOVEN_COUNTS[Math.floor(Math.random() * CONFIG.WOVEN_COUNTS.length)]);
  const start = () => { reset(); nav("/strand/1"); };

  return (
    <Page className="pt-4">
      <FallingLeaves />
      <header className="flex items-center h-11">
        <div className="flex items-center gap-2 mr-auto">
          <Art name="heart" className="w-6 h-6" />
          <span className="f-sc text-[15px] font-semibold">{COPY.guild}</span>
        </div>
        <SoundToggle className="-mr-2 ml-1" />
      </header>
      <PanelOrInline forest>
        <Art name="welcome-cameo" alt="A cameo portrait framed in roses beside a wicker basket" className="w-full max-h-[38.5dvh] lg:max-h-[82vh] object-contain -mt-1" />
      </PanelOrInline>
      <p className="f-cg italic text-center text-[20px] -mt-1">{COPY.kicker}</p>
      <h1 data-testid="wordmark" className="f-mark text-center text-[color:var(--rose)] text-[52px] leading-[0.95] tracking-[0.01em]">{COPY.welcomeTitle[0]}<br />{COPY.welcomeTitle[1]}</h1>
      <Art name="divider" className="w-full mt-1" />
      <p className="f-cg italic text-center text-[21px] leading-snug mt-2">{COPY.tagline[0]}<br />{COPY.tagline[1]}</p>
      <div className="mt-5">
        <Art name="steps" className="w-full px-3" />
        <div className="grid grid-cols-3 mt-1 text-center f-sc text-[14px] font-semibold">
          {COPY.steps.map((s) => <span key={s}>{s}</span>)}
        </div>
      </div>
      <Pill data-testid="commission-button" className="mt-5" onClick={start}>{COPY.cta}</Pill>
      <p data-testid="husband-counter" className="f-sc text-center text-[13px] mt-4 text-[color:#4A5641]">
        {COPY.counter(count)}
      </p>
      {beforeRelease() && <p data-testid="release-hook" className="f-cg italic text-center text-[15px] leading-snug mt-2 px-4 text-[color:var(--rose)] opacity-80">{COPY.releaseHook}</p>}
    </Page>
  );
}
