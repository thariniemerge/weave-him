import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Download, Film, Share, X } from "lucide-react";
import { COPY } from "../../content";
import { duckMusic } from "../../lib/sound";
import { useDesktop } from "./Layout";

const DUST = Array.from({ length: 14 }, (_, i) => ({
  left: 12 + ((i * 53) % 76), top: 30 + ((i * 37) % 55), size: 2 + (i % 3), dx: ((i % 5) - 2) * 9,
  delay: 0.1 + (i % 7) * 0.12, dur: 2.2 + (i % 4) * 0.35,
}));

const Dust = () => (
  <div className="absolute inset-0 pointer-events-none" aria-hidden>
    {DUST.map((d, i) => (
      <motion.span key={i} className="absolute rounded-full bg-[#F0C978]"
        style={{ left: `${d.left}%`, top: `${d.top}%`, width: d.size, height: d.size, boxShadow: "0 0 6px 2px rgba(243,213,138,.6)" }}
        initial={{ opacity: 0, y: 0, x: 0 }} animate={{ opacity: [0, 1, 0], y: -90, x: d.dx }}
        transition={{ delay: d.delay, duration: d.dur, ease: "easeOut" }} />
    ))}
  </div>
);

const Shimmer = ({ loop, delay = 0.45 }) => (
  <motion.div className="absolute inset-y-0 -inset-x-1/2 pointer-events-none mix-blend-screen" aria-hidden
    style={{ background: "linear-gradient(105deg, transparent 38%, rgba(255,232,170,.55) 50%, transparent 62%)" }}
    initial={{ x: "-60%" }} animate={{ x: "60%" }}
    transition={{ delay, duration: 1.1, ease: "easeInOut", repeat: loop ? Infinity : 0, repeatDelay: 0.2 }} />
);

export const ShareReveal = ({ open, onClose, name, url, onSave, onShare, onCopy, isIOS, onVideo, video }) => {
  const reduce = useReducedMotion();
  const [revealed, setRevealed] = useState(false);
  const [dust, setDust] = useState(false);
  const dur = reduce ? 0.3 : 1.5;

  useEffect(() => {
    if (!open) { setRevealed(false); setDust(false); return; }
    duckMusic(1.8);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open || !url) return;
    const t1 = setTimeout(() => setRevealed(true), dur * 1000 + 100);
    const t2 = setTimeout(() => setDust(!reduce), (dur - 0.2) * 1000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [open, url, dur, reduce]);

  const desk = useDesktop();
  const size = useMemo(() => ({ height: desk ? "calc(100dvh - 72px)" : "min(calc(100dvh - 210px), calc((100vw - 40px) * 16 / 9), 860px)", aspectRatio: "9 / 16" }), [desk]);
  if (!open) return null;

  return createPortal(
    <motion.div data-testid="share-reveal" role="dialog" aria-modal="true" aria-label={`${name}'s story card`}
      className="fixed inset-0 z-50 flex flex-col lg:flex-row items-center justify-center lg:gap-14 px-5 py-4 bg-[#16201A]/85 backdrop-blur-md"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} onClick={() => revealed && onClose()}>
      <p className="absolute top-4 left-0 right-0 text-center f-sc text-[12px] text-[#cdb79c] pointer-events-none">Tap to close</p>
      <button data-testid="share-reveal-close" aria-label="Close" onClick={onClose}
        className="z-30 absolute top-2 right-2 w-11 h-11 rounded-full flex items-center justify-center text-[#f3e3c4] hover:bg-white/10">
        <X className="w-6 h-6" strokeWidth={1.5} />
      </button>
      <motion.div className="relative rounded-xl overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,.9)] ring-1 ring-[#A8823F]/60 bg-[#16201A]"
        style={size} onClick={(e) => e.stopPropagation()}
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.84, y: 70 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: dur, ease: [0.16, 1, 0.3, 1] }}>
        {url && (
          <motion.img data-testid="share-reveal-image" src={url} alt={`${name}'s story card`} className="absolute inset-0 w-full h-full"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduce ? 0.2 : 0.6 }} />
        )}
        {!reduce && (
          <>
            <Shimmer loop={!url} />
            <motion.div className="absolute pointer-events-none mix-blend-screen rounded-[50%]" aria-hidden
              style={{ left: "26%", width: "48%", top: "23.5%", height: "40%", background: "radial-gradient(closest-side, rgba(255,226,160,.75), rgba(255,226,160,0))" }}
              initial={{ opacity: 0 }} animate={url ? { opacity: [0, 0.85, 0.15] } : { opacity: 0 }} transition={{ delay: 1.0, duration: 1.3 }} />
          </>
        )}
        {dust && <Dust />}
      </motion.div>
      <motion.div className="w-full max-w-[400px] lg:w-[300px] mt-4 lg:mt-0"
        initial={{ opacity: 0, y: 10 }} animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }} transition={{ duration: 0.35 }}
        data-testid="share-reveal-actions" onClick={(e) => e.stopPropagation()}>
        <fieldset disabled={!revealed} className="contents">
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
          <button data-testid="reveal-save-button" onClick={onSave} className="pill pill-primary !min-h-[50px] !text-[18px]">
            <Download className="w-5 h-5" strokeWidth={1.7} /><span>{COPY.saveImage}</span>
          </button>
          <button data-testid="reveal-share-button" onClick={onShare}
            className="pill !min-h-[50px] !text-[18px] border border-[#A8823F] text-[#F1ECE1] bg-white/5 hover:bg-white/10">
            <Share className="w-5 h-5" strokeWidth={1.7} /><span>{COPY.shareShort}</span>
          </button>
        </div>
        {isIOS && <p className="text-center f-cg italic text-[14px] text-[#cdb79c] mt-1.5" data-testid="ios-save-hint">or press and hold the card to save</p>}
        <div className="text-center">
          {onVideo && (
            <button data-testid="reveal-video-button" onClick={onVideo} disabled={video != null}
              className="pill !min-h-[48px] !text-[17px] mt-3 w-full border border-dashed border-[#A8823F] text-[#F1ECE1] bg-white/5 hover:bg-white/10 disabled:opacity-80">
              <Film className="w-5 h-5" strokeWidth={1.7} />
              <span data-testid="reveal-video-label">{video != null ? `Weaving his story… ${Math.round(video * 100)}%` : "Save as story video"}</span>
            </button>
          )}
          <button data-testid="reveal-copy-link" onClick={onCopy} className="text-link !text-[#F0C978]">Copy link</button>
        </div>
        </fieldset>
      </motion.div>
    </motion.div>,
    document.body
  );
};
