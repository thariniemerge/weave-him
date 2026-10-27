import { useLayoutEffect, useRef, useState } from "react";

import { shortLabel, BAND_MAX } from "../../lib/weave";

// Band geometry traced from the storyboard art (viewBox = art width x 3). Only the top two bands carry text.
export const BANDS = {
  // thin ribbons across his upper chest only (Husband K), so his face and abs stay visible
  cameo: { box: "0 0 834 780", paths: ["M 272 486 Q 414 502 557 486", "M 270 512 Q 414 528 559 512", "M 300 538 Q 414 552 529 538"], font: 19, clip: "ellipse(24.7% 33.08% at 49.7% 50.26%)" },
  hoop: { box: "0 0 834 837", paths: ["M 292 533 Q 414 548 536 533", "M 288 562 Q 414 578 540 562", "M 320 592 Q 414 606 508 592"], font: 20 },
};
const SEP = " · ";
const FILL = 0.8;
const FILL_LOW = 0.55;
// labels renamed after older husbands were saved
const ALIAS = { "SAFE HARBOUR": "SAFE HAVEN", "CHILDHOOD PET": "PET'S NAME", "FAVOURITE SONG": "OUR SONG", "MOM'S BIRTHDAY": "MOM'S DAY" };
const lowOk = (l) => l.length <= BAND_MAX && l.split(" ").length <= 2;

// Old records stored joined lines; split them back into labels and keep each <= 12 chars
const toLabels = (band) => [...new Set(band.flatMap((b) => b.split(SEP)).map((s) => s.trim()).filter(Boolean)
  .map((s) => ALIAS[s] || s).map((s) => (s.length > BAND_MAX ? shortLabel(s) : s)))];

export function BandText({ band, kind, show = true }) {
  const g = BANDS[kind];
  const pathRefs = useRef([]);
  const probe = useRef(null);
  const [fit, setFit] = useState([]);
  const labels = toLabels(band).slice(0, 4);
  const all = toLabels(band);
  const low = all.slice(4).find(lowOk) || (all[4] ? shortLabel(all[4]) : null);
  const lines = [labels.slice(0, 2), labels.slice(2, 4)].filter((l) => l.length).map((l) => l.join(SEP));
  if (low && lines.length === 2) lines.push(low);
  const key = lines.join("|");

  useLayoutEffect(() => {
    let live = true;
    const run = () => {
      if (!live) return;
      setFit(lines.map((_, i) => {
        const len = pathRefs.current[i]?.getTotalLength() || 0;
        let natural = 0;
        if (probe.current) { probe.current.textContent = lines[i]; natural = probe.current.getComputedTextLength(); }
        const est = lines[i].length * g.font * 0.72; // generous estimate in case the font isn't measurable yet
        const cap = len * (i === 2 ? FILL_LOW : FILL);
        // always pin the width: a textPath silently drops glyphs that run past the path's ends
        return Math.min(Math.max(natural, est * 0.85), cap);
      }));
    };
    document.fonts.load('600 20px "Cormorant SC"').then(() => document.fonts.ready).then(run);
    run();
    return () => { live = false; };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  const id = `band-${kind}`;
  const txt = { fontFamily: "'Cormorant SC', serif", fontWeight: 600, letterSpacing: "0.04em" };
  return (
    <svg viewBox={g.box} className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-500" style={{ opacity: show ? 1 : 0, ...(g.clip ? { clipPath: g.clip, WebkitClipPath: g.clip } : {}) }} aria-hidden data-testid={`band-text-${kind}`}>
      <defs>
        <filter id={`${id}-sh`} x="-5%" y="-40%" width="110%" height="180%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#120805" floodOpacity="0.85" />
        </filter>
        {g.paths.map((d, i) => <path key={i} id={`${id}-${i}`} d={d} ref={(el) => { pathRefs.current[i] = el; }} />)}
      </defs>
      <text ref={probe} x="-9999" y="-9999" fontSize={g.font} style={txt} />
      {lines.map((l, i) => (
        <text key={i} fontSize={g.font} dy="0.34em" fill="#F1ECE1" filter={`url(#${id}-sh)`} style={txt} data-testid={`band-line-${i}`}>
          <textPath href={`#${id}-${i}`} xlinkHref={`#${id}-${i}`} startOffset="50%" textAnchor="middle"
            {...(fit[i] ? { textLength: fit[i], lengthAdjust: "spacingAndGlyphs" } : {})}>{l}</textPath>
        </text>
      ))}
    </svg>
  );
}
