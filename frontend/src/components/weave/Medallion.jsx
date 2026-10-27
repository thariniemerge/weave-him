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

// Reveal line (top of the woven part) per answered strand, by his anatomy: lower abs, upper abs, chest,
// shoulders, neck, chin, then face and hair. Shared across screens so the line only ever grows upward.
const LEVELS = [600, 572, 546, 470, 432, 416, 392, 84];
let lastStrands = null;

function useReveal(root, p, strands, finished, named, fadeOnly) {
  useLayoutEffect(() => {
    const q = (id) => root.current.querySelector(`[id="${p}${id}"]`);
    const fig = q("figure"), rect = q("reveal-rect"), edge = q("reveal-edge");
    const late = [q("bands"), q("heart")], ribbon = q("ribbon");
    if (strands == null) {
      fig.removeAttribute("mask");
      edge.style.opacity = 0;
      late.forEach((el) => { el.style.opacity = 1; });
      ribbon.style.opacity = named ? 1 : 0;
      return;
    }
    fig.setAttribute("mask", `url(#${p}reveal-mask)`);
    const y = fadeOnly ? LEVELS[7] : LEVELS[strands];
    if (fadeOnly && rect.dataset.y) {
      // reduced motion: no wipe, he simply fades in at the end
      rect.style.transition = "opacity .6s ease";
      rect.style.opacity = strands === 7 ? 1 : 0;
    }
    if (!rect.dataset.y) {
      // first paint of this instance: start from the last level any screen showed (never from top or bottom),
      // with nothing fading out from the SVG's defaults
      const grow = lastStrands != null && lastStrands < strands;
      const from = grow ? LEVELS[lastStrands] : y;
      const all = [rect, edge, ...late, ribbon];
      all.forEach((el) => { el.style.transition = "none"; });
      [rect, edge].forEach((el) => { el.style.transform = `translateY(${from}px)`; });
      [...late, ribbon].forEach((el) => { el.style.opacity = finished && !grow ? 1 : 0; });
      edge.style.opacity = 0;
      if (fadeOnly) rect.style.opacity = strands === 7 && !grow ? 1 : 0;
      rect.getBoundingClientRect();
      all.forEach((el) => { el.style.transition = ""; });
      if (fadeOnly) { rect.style.transition = "opacity .6s ease"; rect.style.opacity = strands === 7 ? 1 : 0; }
    }
    [rect, edge].forEach((el) => { el.style.transform = `translateY(${y}px)`; });
    rect.dataset.y = y;
    lastStrands = strands;
    const edgeOn = !fadeOnly && strands > 0 && !(strands === 7 && finished);
    edge.style.transitionDelay = edgeOn ? "0s" : "0s, .8s";
    edge.style.opacity = edgeOn ? 1 : 0;
    late.forEach((el) => { el.style.transitionDelay = finished ? ".8s" : "0s"; el.style.opacity = finished ? 1 : 0; });
    ribbon.style.transitionDelay = finished ? ".8s" : "0s";
    ribbon.style.opacity = finished && named ? 1 : 0;
  }, [strands, finished, named, fadeOnly]); // eslint-disable-line react-hooks/exhaustive-deps
}

// medallion-K.svg as one piece: frame, portrait, bands and ribbon. He moves only through K's own groups.
// `strands` (0-7) weaves him bottom-up; `finished` adds the heart (pulsing once with `pulse`), bands and ribbon.
export function Medallion({ name, band, alive = false, strands, finished = true, pulse = false, fadeOnly = false, testid = "medallion", label }) {
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
  useReveal(root, p, strands, finished, !!name, fadeOnly);
  return (
    <div className={`medallion relative w-full${pulse && finished ? " mk-pulse" : ""}`} data-testid={testid} data-emotion={reduce ? "smile" : e} role="img" aria-label={label || (name ? `${name}, a wicker husband` : "A wicker husband")}>
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
