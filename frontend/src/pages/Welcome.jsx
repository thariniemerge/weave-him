import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Art, Pill, Page, SoundToggle } from "../components/weave/ui";
import { PanelOrInline, FallingLeaves } from "../components/weave/Layout";
import { COPY } from "../content";
import { getStats } from "../lib/api";
import { SoundtrackLink } from "../components/weave/SoundtrackLink";
import { useAnswers } from "../lib/store";

// The ribbon switches to "now showing" from release day onwards (visitor's local time)
const released = () => new Date() >= new Date(`${COPY.RELEASE_DAY}T00:00:00`);

export default function Welcome() {
  const nav = useNavigate();
  const { reset } = useAnswers();
  const [today, setToday] = useState(null);
  useEffect(() => { getStats().then((d) => setToday(d.today)).catch(() => {}); }, []);
  const start = () => { reset(); nav("/strand/1"); };

  return (
    <Page className="pt-3">
      <FallingLeaves />
      <p data-testid="release-ribbon" className="f-sc text-center text-[12px] tracking-[0.08em] text-[color:#4A5641] opacity-80">
        {released() ? COPY.ribbonAfter : COPY.ribbonBefore}
      </p>
      <header className="flex items-center h-11">
        <div className="flex items-center gap-2 mr-auto">
          <Art name="heart" className="w-6 h-6" />
          <span className="f-sc text-[15px] font-semibold">{COPY.guild}</span>
        </div>
        <SoundToggle className="-mr-2 ml-1" />
      </header>
      <PanelOrInline forest>
        <Art name="welcome-cameo" alt="A cameo portrait framed in roses beside a wicker basket" className="w-full max-h-[31dvh] lg:max-h-[82vh] object-contain -mt-1" />
      </PanelOrInline>
      {/* on desktop the header stays on top and the rest sits centred in the column */}
      <div className="flex flex-col lg:flex-1 lg:justify-center lg:pb-14">
        <p data-testid="welcome-kicker" className="f-cg italic text-center text-[19px] -mt-1 lg:mt-0">{COPY.kicker}</p>
        <h1 data-testid="wordmark" aria-label="Weave your wicker man" className="f-mark text-center text-[color:var(--rose)] text-[52px] lg:text-[64px] leading-[0.95] tracking-[0.01em] lg:mt-1">{COPY.welcomeTitle[0]}<br />{COPY.welcomeTitle[1]}</h1>
        <p data-testid="welcome-tagline" className="f-cg italic text-center text-[19px] leading-snug mt-2 lg:mt-3">{COPY.tagline[0]}<br />{COPY.tagline[1]}</p>
        <Pill data-testid="commission-button" aria-label={COPY.cta} className="mt-4 lg:mt-7" onClick={start}>{COPY.cta}</Pill>
        <p data-testid="husband-counter" className="f-sc text-center text-[12px] tracking-[0.06em] whitespace-nowrap mt-3 text-[color:#4A5641]">{COPY.counter}</p>
        <SoundtrackLink text={COPY.soundtrackWelcome} testid="soundtrack-link-welcome" className="mt-2" />
        <Art name="divider" className="w-full mt-4 lg:mt-7" />
        {/* the space is held while the count loads, so nothing below shifts */}
        <p data-testid="village-today" className={`f-cg italic text-center text-[17px] leading-snug min-h-[24px] mt-2 text-[color:#4A5641] transition-opacity duration-500 ${today === null ? "opacity-0" : "opacity-100"}`}>
          {today === null ? "" : COPY.villageToday(today)}
        </p>
        <div className="mt-5 lg:mt-8" data-testid="welcome-steps">
          <Art name="steps" alt="" className="w-full px-3" />
          <div className="grid grid-cols-3 gap-2 mt-1 text-center">
            {COPY.steps.map((s, i) => (
              <div key={s} data-testid={`welcome-step-${i + 1}`}>
                <span className="f-sc text-[14px] font-semibold block">{s}</span>
                <span className="f-cg italic text-[14px] leading-snug block mt-0.5 text-[color:#4A5641]">{COPY.stepNotes[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Page>
  );
}
