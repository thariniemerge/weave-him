import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Page, Pill, Art } from "../components/weave/ui";
import { StrandHeader } from "../components/weave/StrandHeader";
import { COPY, SLIDERS } from "../content";
import { useAnswers } from "../lib/store";
import { sliderStep, soFarTags } from "../lib/weave";

const CHIP_TINTS = ["var(--peony)", "var(--sage)", "var(--wisteria)", "var(--ochre)", "var(--wedgwood)"];

const Slider = ({ s, value, onChange }) => {
  const step = s.steps[sliderStep(value)];
  return (
    <section className="stitch-card px-5 pt-5 pb-4" style={{ background: s.tint }} data-testid={`slider-card-${s.key}`}>
      <h2 className="f-cg font-semibold text-center text-[21px]">{s.title}</h2>
      <input
        type="range" min={0} max={100} value={value} aria-label={s.title} data-testid={`slider-${s.key}`}
        onChange={(e) => onChange(Number(e.target.value))} className="woven-range mt-1"
        style={{ "--track-img": "url(/art/slider-track.svg)", "--thumb-img": "url(/art/heart.svg)" }}
      />
      <div className="flex justify-between f-sc text-[11.5px] text-[color:#4a3029] -mt-1">
        <span>{s.left}</span><span>{s.right}</span>
      </div>
      <div className="h-7 mt-1 relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p key={step.caption} data-testid={`slider-caption-${s.key}`}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}
            className="f-cg italic text-center text-[17px] text-[color:var(--rose)]">{step.caption}</motion.p>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default function Temperament() {
  const nav = useNavigate();
  const { answers, set } = useAnswers();
  const tags = soFarTags(answers);
  return (
    <Page>
      <StrandHeader n={5} back="/strand/4" />
      <Art name="corner-ochre" className="absolute right-0 top-0 w-20 pointer-events-none opacity-90" />
      <h1 className="f-cg font-bold text-[34px] leading-tight text-center mt-1">
        {COPY.temperTitle[0]}<span className="italic text-[color:var(--rose)]">{COPY.temperTitle[1]}</span>
      </h1>
      <p className="f-cg italic text-center text-[18px] text-[color:#5A3D34] mb-4">{COPY.temperSub}</p>
      <div className="space-y-4">
        {SLIDERS.map((s) => (
          <Slider key={s.key} s={s} value={answers.sliders[s.key] ?? s.def}
            onChange={(v) => set("sliders", { ...answers.sliders, [s.key]: v })} />
        ))}
      </div>
      <div className="mt-5 flex flex-wrap justify-center items-center gap-2" data-testid="so-far-tags">
        <span className="f-sc text-[12px] mr-1">{COPY.wovenFrom}</span>
        {tags.map((t, i) => (
          <motion.span key={t + i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="f-cg italic text-[16px] px-3 py-1 rounded-full border border-[color:#b8956a]" style={{ background: CHIP_TINTS[i % 5] }}>
            {t}
          </motion.span>
        ))}
      </div>
      <div className="flex flex-col items-center mt-4">
        <Art name="hoop-small" className="w-24 floaty" />
        <p className="f-cg italic text-[16px] text-[color:#5A3D34] mt-1">{COPY.comingTogether}</p>
      </div>
      <Pill data-testid="next-remembers-button" className="mt-5" onClick={() => nav("/strand/6")}>{COPY.nextRemembers}</Pill>
    </Page>
  );
}
