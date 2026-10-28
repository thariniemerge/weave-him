import { useLayoutEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { MEDALLION } from "../../assets/medallion";
import { scoped, useLight } from "../../lib/face";
import { PORTRAITS, portraitSrc } from "../../content";
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

// Reveal line (top of the woven part) per answered strand: chest up to the neck over strands I-IX (his chin
// sits near y 360), then face and hair last at X. Shared across screens so the line only ever grows upward.
const LEVELS = [600, 575, 551, 527, 503, 479, 455, 431, 407, 384, 30];
const LAST = LEVELS.length - 1;
let lastStrands = null;

function useReveal(root, p, strands, finished, named, fadeOnly) {
  useLayoutEffect(() => {
    const q = (id) => root.current.querySelector(`[id="${p}${id}"]`);
    const fig = q("figure"), rect = q("reveal-rect"), edge = q("reveal-edge");
    const late = [q("bands"), q("heart")], ribbon = q("ribbon"), weave = q("img-weave");
    // raw-willow sepia while he is being woven; his true colours bloom in once his face is done
    const color = strands == null || (strands === LAST && finished);
    if (strands == null) {
      weave.style.transition = "none";
      weave.style.opacity = 0;
      fig.removeAttribute("mask");
      edge.style.opacity = 0;
      late.forEach((el) => { el.style.opacity = 1; });
      ribbon.style.opacity = named ? 1 : 0;
      return;
    }
    fig.setAttribute("mask", `url(#${p}reveal-mask)`);
    const y = fadeOnly ? LEVELS[LAST] : LEVELS[strands];
    if (fadeOnly && rect.dataset.y) {
      // reduced motion: no wipe, he simply fades in at the end
      rect.style.transition = "opacity .6s ease";
      rect.style.opacity = strands === LAST ? 1 : 0;
    }
    if (!rect.dataset.y) {
      // first paint of this instance: start from the last level any screen showed (never from top or bottom),
      // with nothing fading out from the SVG's defaults
      // with no earlier screen (phones), the final step still weaves his face in from the chin
      const prev = lastStrands ?? (strands === LAST ? LAST - 1 : null);
      const grow = prev != null && prev < strands;
      const from = grow ? LEVELS[prev] : y;
      const all = [rect, edge, ...late, ribbon, weave];
      weave.style.opacity = color && !grow ? 0 : 1;
      all.forEach((el) => { el.style.transition = "none"; });
      [rect, edge].forEach((el) => { el.style.transform = `translateY(${from}px)`; });
      [...late, ribbon].forEach((el) => { el.style.opacity = finished && !grow ? 1 : 0; });
      edge.style.opacity = 0;
      if (fadeOnly) rect.style.opacity = strands === LAST && !grow ? 1 : 0;
      rect.getBoundingClientRect();
      all.forEach((el) => { el.style.transition = ""; });
      if (fadeOnly) { rect.style.transition = "opacity .6s ease"; rect.style.opacity = strands === LAST ? 1 : 0; }
    }
    [rect, edge].forEach((el) => { el.style.transform = `translateY(${y}px)`; });
    rect.dataset.y = y;
    lastStrands = strands;
    const edgeOn = !fadeOnly && strands > 0 && !(strands === LAST && finished);
    edge.style.transitionDelay = edgeOn ? "0s" : "0s, .8s";
    edge.style.opacity = edgeOn ? 1 : 0;
    late.forEach((el) => { el.style.transitionDelay = finished ? ".8s" : "0s"; el.style.opacity = finished ? 1 : 0; });
    ribbon.style.transitionDelay = finished ? ".8s" : "0s";
    ribbon.style.opacity = finished && named ? 1 : 0;
    weave.style.transition = "opacity 1s ease .7s";
    weave.style.opacity = color ? 0 : 1;
  }, [strands, finished, named, fadeOnly]); // eslint-disable-line react-hooks/exhaustive-deps
}

// The medallion frame as one piece, with her painted husband in the oval: bottom-anchored, clipped by the oval.
// `portrait` picks the painting; `strands` (0-10) weaves him bottom-up in raw willow; `finished` blooms his colours
// and adds the heart (pulsing once with `pulse`), bands and ribbon. He moves only with light.
export function Medallion({ name, band, portrait, alive = false, strands, finished = true, pulse = false, fadeOnly = false, testid = "medallion", label }) {
  const reduce = useReducedMotion();
  const [[p, html]] = useState(() => scoped(MEDALLION));
  const root = useRef(null);
  const wrap = useRef(null);
  const tap = useLight(wrap, { ambient: alive, reduce });
  useLayoutEffect(() => { if (!root.current.firstChild) root.current.innerHTML = html; }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    const q = (id) => root.current.querySelector(`[id="${p}${id}"]`);
    const slug = portrait || PORTRAITS[0].slug;
    ["img-color", "img-glow", "img-mask"].forEach((id) => q(id).setAttribute("href", portraitSrc(slug)));
    q("img-weave").setAttribute("href", portraitSrc(slug, "-weave"));
  }, [portrait]); // eslint-disable-line react-hooks/exhaustive-deps
  useTexts(root, p, name, bandLines(band));
  useReveal(root, p, strands, finished, !!name, fadeOnly);
  return (
    <div ref={wrap} className={`medallion relative w-full${reduce ? "" : " breathing"}${pulse && finished ? " mk-pulse" : ""}`} data-testid={testid}
      data-portrait={portrait || PORTRAITS[0].slug} role="img" aria-label={label || (name ? `${name}, a wicker husband` : "A wicker husband")}>
      <div ref={root} />
      {alive && <button type="button" aria-label="Make him glow" onClick={tap} data-testid="face-tap-target"
        className="absolute rounded-full cursor-pointer" style={{ left: "24%", top: "10%", width: "52%", height: "56%" }} />}
    </div>
  );
}

// Share card: his full-background painting filling the card's oval (bottom-anchored)
export const CardPortrait = ({ className, portrait }) => (
  <div className={className} aria-hidden data-testid="card-husband" style={{ overflow: "hidden", borderRadius: "50%", clipPath: "ellipse(50% 50% at 50% 50%)", WebkitClipPath: "ellipse(50% 50% at 50% 50%)" }}>
    <img src={portraitSrc(portrait || PORTRAITS[0].slug, "-bg")} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 100%", display: "block" }} />
  </div>
);
