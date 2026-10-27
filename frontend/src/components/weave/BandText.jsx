import { useLayoutEffect, useRef, useState } from "react";

import { shortLabel, BAND_MAX } from "../../lib/weave";

// Band geometry traced from the storyboard art (viewBox = art width x 3). Only the top two bands carry text.
export const BANDS = {
  // bands wrap his chest, following its curve (Husband K)
  cameo: { box: "0 0 834 780", paths: ["M 250 498 Q 414 524 579 498", "M 252 552 Q 414 578 577 552", "M 286 604 Q 414 628 543 604"], font: 23 },
  hoop: { box: "0 0 834 837", paths: ["M 250 556 Q 414 582 578 556", "M 252 611 Q 414 636 576 611", "M 282 664 Q 414 688 546 664"], font: 22 },
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
        if (!natural) natural = lines[i].length * g.font * 0.68; // estimate if the font isn't measurable yet
        const cap = len * (i === 2 ? FILL_LOW : FILL);
        return natural > cap ? cap : null; // squeeze only when it would be too wide
      }));
    };
    document.fonts.load('600 20px "Cormorant SC"').then(() => document.fonts.ready).then(run);
    run();
    return () => { live = false; };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  const id = `band-${kind}`;
  const txt = { fontFamily: "'Cormorant SC', serif", fontWeight: 600, letterSpacing: "0.08em" };
  return (
    <svg viewBox={g.box} className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-500" style={{ opacity: show ? 1 : 0 }} aria-hidden data-testid={`band-text-${kind}`}>
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
