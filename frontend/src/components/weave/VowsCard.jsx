import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Feather } from "lucide-react";
import { toast } from "sonner";
import { Art } from "./ui";
import { COPY, ROMAN } from "../../content";
import { reweaveVow } from "../../lib/api";
import { play } from "../../lib/sound";
import { emote } from "./Face";

const Quill = () => (
  <motion.span className="absolute -top-3 left-0 text-[color:var(--rose)] pointer-events-none"
    initial={{ x: "0%" }} animate={{ x: ["0%", "1100%", "0%"] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>
    <Feather className="w-6 h-6 -rotate-45" strokeWidth={1.5} />
  </motion.span>
);

const Vow = ({ i, text, delay, canEdit, open, onOpen, left, busy, onReweave, writing }) => (
  <motion.li data-testid={`vow-${i + 1}`} className="relative"
    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}>
    <div role={canEdit ? "button" : undefined} tabIndex={canEdit ? 0 : undefined} onClick={canEdit ? onOpen : undefined}
      onKeyDown={(e) => canEdit && e.key === "Enter" && onOpen()}
      className={`flex gap-4 items-baseline rounded-lg -mx-2 px-2 py-1 transition-colors ${canEdit ? "cursor-pointer hover:bg-[color:var(--wisteria)]/50" : ""} ${open ? "bg-[color:var(--wisteria)]/60" : ""}`}>
      <span className="f-mark text-[22px] text-[color:var(--rose)] w-8 shrink-0 text-right leading-none">{ROMAN[i + 1]}</span>
      <span className="relative flex-1">
        {(busy || writing) && <Quill />}
        <AnimatePresence mode="wait">
          <motion.span key={text} data-testid={`vow-text-${i + 1}`} className="block f-cg text-[18px] leading-snug font-medium"
            initial={{ clipPath: "inset(0 100% 0 0)" }} animate={{ clipPath: "inset(0 0% 0 0)", opacity: busy ? 0.25 : 1 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: "easeOut", delay: busy === false && delay ? delay : 0 }}>{text}</motion.span>
        </AnimatePresence>
      </span>
    </div>
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden pl-12">
          {left > 0 ? (
            <div className="mt-1 flex items-center gap-3 flex-wrap">
              <button data-testid={`reweave-button-${i + 1}`} disabled={busy} onClick={onReweave}
                className="min-h-[44px] inline-flex items-center gap-2 px-4 rounded-full whitespace-nowrap border border-dashed border-[color:var(--rose)] text-[color:var(--rose)] f-cg italic text-[17px] disabled:opacity-50">
                <Feather className="w-4 h-4" strokeWidth={1.6} />{busy ? "Reweaving…" : COPY.reweave}
              </button>
              {!busy && <span className="f-sc text-[11px] text-[color:#4A5641]">{COPY.reweaveLeft(left)}</span>}
            </div>
          ) : (
            <p data-testid="out-of-willow" className="mt-1 f-cg italic text-[17px] text-[color:#4A5641]">{COPY.outOfWillow}</p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  </motion.li>
);

export const VowsCard = ({ h, setH, canEdit }) => {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(null);
  const [busy, setBusy] = useState(null);
  // Reveal order: card unfolds at 1.2s, then each vow is written ~0.6s apart, then signature & seal
  const unfold = reduce ? 0 : 1.2, step = reduce ? 0 : 0.6, start = reduce ? 0 : 1.8;
  const sigDelay = start + step * 5 + 0.2;
  const [writing, setWriting] = useState(reduce ? -1 : null);
  const [revealed, setRevealed] = useState(reduce);

  useEffect(() => {
    if (reduce) return;
    const ts = [0, 1, 2, 3, 4].map((i) => setTimeout(() => { setWriting(i); play("quill", { rate: 0.9 + i * 0.05 }); }, (start + step * i) * 1000));
    ts.push(setTimeout(() => setWriting(-1), (start + step * 5) * 1000));
    ts.push(setTimeout(() => play("seal"), sigDelay * 1000 + 250));
    ts.push(setTimeout(() => setRevealed(true), sigDelay * 1000 + 900));
    return () => ts.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [h.id]);

  const reweave = async (i) => {
    setBusy(i);
    play("quill");
    const q = setInterval(() => play("quill", { gain: 0.7 }), 800);
    try {
      const nh = await reweaveVow(h.id, i);
      setH(nh);
      emote("hearts");
      play("quill", { rate: 1.1 });
      if (nh.reweaves_left === 0) setOpen(i);
    } catch (e) {
      if (e.response?.status === 409) { setH({ ...h, reweaves_left: 0 }); toast(COPY.outOfWillow); }
      else toast("The thread snapped. Try again in a moment.");
    } finally { clearInterval(q); setBusy(null); }
  };

  return (
    <motion.section className="stitch-card overflow-hidden pb-6" data-testid="vows-card" style={{ transformOrigin: "top center" }}
      initial={reduce ? false : { opacity: 0, scaleY: 0.82, y: 18 }} animate={{ opacity: 1, scaleY: 1, y: 0 }}
      transition={{ delay: unfold, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}>
      <Art name="vow-strip" className="w-full block" />
      <div className="px-7 pt-4">
        <p className="f-sc text-center text-[13px] text-[color:#4A5641]" data-testid="vows-number">{COPY.vowsNo} [{h.number}]</p>
        <p className="f-cg italic text-center text-[19px] text-[color:var(--rose)]">{COPY.dearest}</p>
        <div className="flex items-center justify-center gap-2 my-2 text-[color:var(--rose)]">
          <span className="h-0 w-16 border-t-2 border-dashed border-current opacity-70" /><Art name="heart" className="w-5 h-5" /><span className="h-0 w-16 border-t-2 border-dashed border-current opacity-70" />
        </div>
        {canEdit && <p className="f-sc text-center text-[11px] text-[color:#4A3A2E] -mt-1" data-testid="reweave-tip">{COPY.reweaveTip} · {COPY.reweaveLeft(h.reweaves_left ?? 0)}</p>}
        <ol className="space-y-2.5 mt-3">
          {h.vows.map((v, i) => (
            <Vow key={i} i={i} text={v} delay={revealed ? 0 : start + step * i} writing={writing === i} canEdit={canEdit} open={open === i} left={h.reweaves_left ?? 0}
              busy={busy === null ? false : busy === i} onOpen={() => setOpen(open === i ? null : i)} onReweave={() => reweave(i)} />
          ))}
        </ol>
        <motion.div className="flex items-end justify-between mt-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: sigDelay, duration: 0.5 }}>
          <div>
            <p className="f-cg italic text-[16px]">{COPY.yours}</p>
            <p data-testid="signature-name" className="f-sig text-[46px] leading-none text-[color:#561F28] border-b border-[color:var(--gold)] pb-1 pr-4">{h.name}</p>
          </div>
          <motion.div initial={{ scale: 1.6, opacity: 0, rotate: -20 }} animate={{ scale: 1, opacity: 1, rotate: -6 }}
            transition={{ delay: sigDelay + 0.2, type: "spring", stiffness: 300, damping: 16 }}>
            <Art name="wax-seal" className="w-[70px] mr-[-6px]" />
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};
