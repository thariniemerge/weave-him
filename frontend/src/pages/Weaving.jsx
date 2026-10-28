import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Page, Art } from "../components/weave/ui";
import { HeartsRow } from "../components/weave/StrandHeader";
import { COPY, ROMAN } from "../content";
import { useAnswers } from "../lib/store";
import { buildPayload, hoopTags, isComplete, pickPortrait } from "../lib/weave";
import { createHusband, getHusband, rememberHusband } from "../lib/api";
import { Medallion } from "../components/weave/Medallion";
import { PanelOrInline } from "../components/weave/Layout";
import { play, startLoop, stopLoop } from "../lib/sound";
import { SoundToggle } from "../components/weave/ui";

const STEP_MS = 460;
const FALLBACK_MS = 9000;
// face weaves in (0.8s), then the heart pulses and the bands appear
const FINISH_MS = 2600;
const TAGS = [
  { pos: { left: "0%", top: "12%" }, rot: -6, bg: "var(--wedgwood)" },
  { pos: { right: "0%", top: "13%" }, rot: 6, bg: "var(--ochre)" },
  { pos: { left: "0%", top: "56%" }, rot: -4, bg: "var(--sage)" },
  { pos: { right: "0%", top: "53%" }, rot: 5, bg: "var(--rose)", light: true },
  { pos: { left: "3%", top: "34%" }, rot: 3, bg: "var(--wisteria)" },
  { pos: { right: "2%", top: "33%" }, rot: -5, bg: "var(--peony)" },
  { pos: { left: "0%", top: "72%" }, rot: -2, bg: "var(--ochre)" },
];

const Tag = ({ text, i, shown }) => {
  const t = TAGS[i];
  return (
    <motion.span data-testid={`hoop-tag-${i}`}
      initial={false} animate={shown ? { opacity: 1, scale: 1, y: 0, rotate: t.rot } : { opacity: 0, scale: 0.6, y: -24, rotate: t.rot * 3 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={`absolute z-20 max-w-[30%] px-2.5 py-1 rounded-md border border-[color:#7D7462] shadow-[0_4px_8px_-4px_rgba(42,33,27,.55)] f-cg italic text-[14px] leading-tight [overflow-wrap:anywhere] line-clamp-2 ${t.light ? "text-[color:var(--paper)]" : ""}`}
      style={{ ...t.pos, background: t.bg }}>
      {text}
    </motion.span>
  );
};

export default function Weaving() {
  const nav = useNavigate();
  const { answers } = useAnswers();
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [husband, setHusband] = useState(null);
  const [error, setError] = useState(false);
  const [skip, setSkip] = useState(false);
  const started = useRef(false);
  const ready = isComplete(answers);

  const weave = () => {
    setError(false);
    const payload = buildPayload(answers);
    const sig = JSON.stringify(payload);
    const last = JSON.parse(sessionStorage.getItem("weave-him-last") || "null");
    const req = last?.sig === sig ? getHusband(last.id) : createHusband(payload).then((h) => {
      sessionStorage.setItem("weave-him-last", JSON.stringify({ sig, id: h.id }));
      rememberHusband(h);
      return h;
    });
    req.then(setHusband).catch(() => setError(true));
  };
  useEffect(() => {
    if (!ready || started.current) return;
    started.current = true;
    weave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { startLoop("rustle"); return () => stopLoop(); }, []);
  // Warm up everything Meet him needs so nothing pops in late
  useEffect(() => {
    ["vow-strip", "wax-seal", "heart", "heart-empty"].forEach((n) => { new Image().src = `/art/${n}.svg`; });
    ["400 40px 'Grenze Gotisch'", "500 20px 'Cormorant Garamond'", "italic 400 20px 'Cormorant Garamond'", "600 20px 'Cormorant SC'", "400 20px 'EB Garamond'"]
      .forEach((f) => document.fonts.load(f).catch(() => {}));
  }, []);
  useEffect(() => { if (step > 0) play("pluck", { rate: [1, 1.06, 1.12, 1.19, 1.26, 1.33, 1.41, 1.5, 1.68, 2][step - 1] }); }, [step]);
  // Strands I-IX weave him up to the chin on a timer; his face waits for the vows (or the 9s fallback)
  const [late, setLate] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s < 9 ? s + 1 : s)), reduce ? 400 : STEP_MS);
    const f = setTimeout(() => setLate(true), FALLBACK_MS);
    return () => { clearInterval(t); clearTimeout(f); };
  }, [reduce]);
  useEffect(() => {
    if (skip) { setStep(10); return; }
    if (step === 9 && (husband || late)) {
      const t = setTimeout(() => setStep(10), 350);
      return () => clearTimeout(t);
    }
  }, [step, husband, late, skip]);
  useEffect(() => {
    if (husband && step >= 10) {
      const t = setTimeout(() => nav(`/meet/${husband.id}`, { replace: true }), skip ? 0 : FINISH_MS);
      return () => clearTimeout(t);
    }
  }, [husband, step, skip, nav]);

  if (!ready) return <Navigate to="/strand/1" replace />;
  const tags = hoopTags(answers);
  const p = step / 10;
  const band = buildPayload(answers).band;

  return (
    <Page className="items-center">
      <SoundToggle className="absolute right-4 top-4" />
      <p className="f-mark text-[34px] text-[color:var(--rose)] leading-none mt-2">{COPY.wordmark}</p>
      <PanelOrInline>
      <div className="relative w-full max-w-[400px] lg:max-w-[540px] mx-auto mt-3" data-testid="weaving-hoop">
        <div className="w-[72%] mx-auto"><Medallion band={band} portrait={husband?.portrait || pickPortrait(answers)} strands={step} finished={step >= 10} pulse fadeOnly={!!reduce} name={step >= 10 ? husband?.name : undefined} testid="weaving-medallion" label="A wicker husband being woven" /></div>
        {tags.map((t, i) => <Tag key={i} text={t} i={i} shown={step > i} />)}
      </div>
      </PanelOrInline>
      <h1 className="f-cg font-bold italic text-[32px] mt-3 text-center">{COPY.weaving}</h1>
      <p data-testid="weaving-strand-count" className="f-sc text-[14px] mt-1">Strand {ROMAN[Math.max(1, step)]} of X</p>
      <div className="mt-3"><HeartsRow current={Math.min(step + 1, 10)} done={step} size="w-[20px]" now="w-[26px]" /></div>
      <div className="relative w-[70%] mt-6" style={{ aspectRatio: "192 / 102" }}>
        <Art name="loom" className="absolute inset-0 w-full h-full" />
        <div className="absolute left-[9%] right-[9%] top-[22%] transition-[height] duration-500 ease-out bg-[color:#fbf7ef]"
          style={{ height: `${(1 - p) * 62}%` }} />
      </div>
      <p className="f-cg italic text-center text-[18px] mt-6 leading-snug">
        {COPY.weavingAside[0]}<br />{COPY.weavingAside[1]}<span className="hl-peony">{COPY.weavingAside[2]}</span>{COPY.weavingAside[3]}
      </p>
      {error ? (
        <button data-testid="weave-retry" onClick={weave} className="text-link mt-4">The thread snapped. Try again</button>
      ) : (
        <button data-testid="skip-to-him" onClick={() => { play("page"); setSkip(true); }} className="text-link mt-4">
          {skip && !husband ? "Tying the last knot…" : COPY.skip}
        </button>
      )}
    </Page>
  );
}
