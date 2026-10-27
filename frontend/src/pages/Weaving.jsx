import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Page, Art } from "../components/weave/ui";
import { HeartsRow } from "../components/weave/StrandHeader";
import { COPY, ROMAN } from "../content";
import { useAnswers } from "../lib/store";
import { buildPayload, hoopTags, isComplete } from "../lib/weave";
import { createHusband, getHusband, rememberHusband } from "../lib/api";
import { BandText } from "../components/weave/BandText";
import { Face } from "../components/weave/Face";
import { PanelOrInline } from "../components/weave/Layout";
import { play, startLoop, stopLoop } from "../lib/sound";
import { SoundToggle } from "../components/weave/ui";

const STEP_MS = 680;
const TAGS = [
  { pos: { left: "0%", top: "12%" }, rot: -6, bg: "var(--wedgwood)" },
  { pos: { right: "0%", top: "13%" }, rot: 6, bg: "var(--ochre)" },
  { pos: { left: "0%", top: "56%" }, rot: -4, bg: "var(--sage)" },
  { pos: { right: "0%", top: "53%" }, rot: 5, bg: "var(--rose)", light: true },
  { pos: { left: "3%", top: "34%" }, rot: 3, bg: "var(--wisteria)" },
  { pos: { right: "2%", top: "33%" }, rot: -5, bg: "var(--peony)" },
  { pos: { left: "31%", top: "86%" }, rot: -2, bg: "var(--ochre)" },
];
const cloth = { backgroundColor: "#fcfbf8", backgroundImage: "linear-gradient(rgba(180,170,210,.22) 1px, transparent 1px), linear-gradient(90deg, rgba(180,170,210,.22) 1px, transparent 1px)", backgroundSize: "7px 7px" };

const Tag = ({ text, i, shown }) => {
  const t = TAGS[i];
  return (
    <motion.span data-testid={`hoop-tag-${i}`}
      initial={false} animate={shown ? { opacity: 1, scale: 1, y: 0, rotate: t.rot } : { opacity: 0, scale: 0.6, y: -24, rotate: t.rot * 3 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={`absolute z-20 max-w-[34%] px-2.5 py-1 rounded-md border border-[color:#7D7462] shadow-[0_4px_8px_-4px_rgba(42,33,27,.55)] f-cg italic text-[14px] leading-tight [overflow-wrap:anywhere] line-clamp-2 ${t.light ? "text-[color:var(--paper)]" : ""}`}
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
    ["meet-cameo", "vow-strip", "wax-seal", "heart", "heart-empty"].forEach((n) => { new Image().src = `/art/${n}.svg`; });
    ["400 40px 'Grenze Gotisch'", "500 20px 'Cormorant Garamond'", "italic 400 20px 'Cormorant Garamond'", "600 20px 'Cormorant SC'", "400 20px 'EB Garamond'"]
      .forEach((f) => document.fonts.load(f).catch(() => {}));
  }, []);
  useEffect(() => { if (step > 0) play("pluck", { rate: [1, 1.12, 1.26, 1.33, 1.5, 1.68, 2][step - 1] }); }, [step]);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => Math.min(s + 1, 7)), reduce ? 400 : STEP_MS);
    return () => clearInterval(t);
  }, [reduce]);
  useEffect(() => {
    if (husband && (step >= 7 || skip)) {
      const t = setTimeout(() => nav(`/meet/${husband.id}`, { replace: true }), skip ? 0 : 600);
      return () => clearTimeout(t);
    }
  }, [husband, step, skip, nav]);

  if (!ready) return <Navigate to="/strand/1" replace />;
  const tags = hoopTags(answers);
  const p = step / 7;
  const band = buildPayload(answers).band;

  return (
    <Page className="items-center">
      <SoundToggle className="absolute right-4 top-4" />
      <p className="f-mark text-[34px] text-[color:var(--rose)] leading-none mt-2">{COPY.wordmark}</p>
      <PanelOrInline>
      <div className="relative w-full mt-3" style={{ aspectRatio: "294 / 295" }} data-testid="weaving-hoop">
        <Art name="weave-hoop" className="absolute inset-0 w-full h-full" alt="An embroidery hoop where a wicker figure is being woven" />
        <div className="absolute rounded-full overflow-hidden" style={{ left: "13.6%", top: "11.4%", width: "72.8%", height: "72.6%" }}>
          <div className="absolute inset-x-0 top-0 border-b-2 border-dashed border-[color:var(--rose)] transition-[height] duration-500 ease-out"
            style={{ ...cloth, height: `${(1 - p) * 100}%` }} />
        </div>
        <Face kind="hoop" show={Math.min(1, 0.2 + step * 0.14)} />
        <BandText band={band} kind="hoop" show={step >= 4} />
        {tags.map((t, i) => <Tag key={i} text={t} i={i} shown={step > i} />)}
      </div>
      </PanelOrInline>
      <h1 className="f-cg font-bold italic text-[32px] mt-3 text-center">{COPY.weaving}</h1>
      <p data-testid="weaving-strand-count" className="f-sc text-[14px] mt-1">Strand {ROMAN[Math.max(1, step)]} of VII</p>
      <div className="mt-3"><HeartsRow current={Math.min(step + 1, 7)} done={step} size="w-[26px]" /></div>
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
