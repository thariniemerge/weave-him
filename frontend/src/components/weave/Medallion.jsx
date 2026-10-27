import { useLayoutEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { MEDALLION, PORTRAIT } from "../../assets/medallionK";
import { scoped, faceParts, applyPose, floatHearts, useFaceLife, POSES } from "../../lib/face";
import { bandLines } from "../../lib/weave";

const NAME_MAX = 320;
// Shrink only when the text is longer than its band allows; short text keeps its natural width
const fit = (tp, max) => {
  tp.removeAttribute("textLength"); tp.removeAttribute("lengthAdjust");
  if (tp.getComputedTextLength() > max) { tp.setAttribute("textLength", max); tp.setAttribute("lengthAdjust", "spacingAndGlyphs"); }
};
const REVEAL_TOP = 84, REVEAL_BOTTOM = 600;

function useTexts(root, p, name, lines) {
  const key = `${name}|${lines.join("|")}`;
  useLayoutEffect(() => {
    const q = (id) => root.current.querySelector(`[id="${p}${id}"]`);
    const run = () => {
      const nt = q("name-text");
      nt.textContent = name ? `meet ${name}` : "";
      if (name) fit(nt, NAME_MAX);
      ["band-1", "band-2", "band-3"].forEach((id, i) => {
        const tp = q(id), text = tp.parentNode, strip = text.previousElementSibling;
        text.style.display = strip.style.display = lines[i] ? "" : "none";
        tp.textContent = lines[i] || "";
        if (lines[i]) fit(tp, Number(tp.dataset.maxLength));
      });
    };
    run();
    document.fonts.ready.then(() => root.current && run());
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
}

function useReveal(root, p, progress, named) {
  useLayoutEffect(() => {
    const q = (id) => root.current.querySelector(`[id="${p}${id}"]`);
    const weaving = progress != null && progress < 1;
    const fig = q("figure");
    if (progress == null) fig.removeAttribute("mask"); else fig.setAttribute("mask", `url(#${p}reveal-mask)`);
    const y = REVEAL_TOP + (REVEAL_BOTTOM - REVEAL_TOP) * (1 - Math.min(1, progress ?? 1));
    [q("reveal-rect"), q("reveal-edge")].forEach((el) => { el.style.transform = `translateY(${y}px)`; });
    q("reveal-edge").style.opacity = weaving && progress > 0 ? 1 : 0;
    [q("bands"), q("heart")].forEach((el) => { el.style.opacity = weaving ? 0 : 1; });
    q("ribbon").style.opacity = !weaving && named ? 1 : 0;
  }, [progress, named]); // eslint-disable-line react-hooks/exhaustive-deps
}

// medallion-K.svg as one piece: frame, portrait, bands and ribbon. He moves only through K's own groups.
export function Medallion({ name, band, alive = false, progress, testid = "medallion", label }) {
  const reduce = useReducedMotion();
  const [[p, html]] = useState(() => scoped(MEDALLION));
  const root = useRef(null);
  const parts = useRef(null);
  const { e, blink, lift, n, tap } = useFaceLife({ ambient: alive, reduce });
  useLayoutEffect(() => { root.current.innerHTML = html; }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useLayoutEffect(() => { parts.current = faceParts(root.current, p, !reduce); }, [p, reduce]);
  useLayoutEffect(() => {
    applyPose(parts.current, reduce ? POSES.smile : POSES[e], { blink, lift });
  }, [e, blink, lift, reduce]);
  useLayoutEffect(() => { if (!reduce && (e === "kiss" || e === "hearts")) floatHearts(parts.current); }, [n]); // eslint-disable-line react-hooks/exhaustive-deps
  useTexts(root, p, name, bandLines(band));
  useReveal(root, p, progress, !!name);
  return (
    <div className="medallion relative w-full" data-testid={testid} data-emotion={reduce ? "smile" : e} role="img" aria-label={label || (name ? `${name}, a wicker husband` : "A wicker husband")}>
      <div ref={root} />
      {alive && <button type="button" aria-label="Make him react" onClick={tap} data-testid="face-tap-target"
        className="absolute rounded-full cursor-pointer" style={{ left: "32%", top: "12%", width: "36%", height: "40%" }} />}
    </div>
  );
}

// Share card: only K's portrait (misty background, figure, red heart), filling the card's oval
export const CardPortrait = ({ className }) => {
  const [[, html]] = useState(() => scoped(PORTRAIT));
  return <div className={className} aria-hidden data-testid="card-husband" style={{ overflow: "hidden", borderRadius: "50%", clipPath: "ellipse(50% 50% at 50% 50%)", WebkitClipPath: "ellipse(50% 50% at 50% 50%)" }} dangerouslySetInnerHTML={{ __html: html }} />;
};
