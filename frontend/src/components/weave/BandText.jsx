import { useLayoutEffect, useRef, useState } from "react";

import { shortLabel, BAND_MAX } from "../../lib/weave";

// Band geometry traced from the storyboard art (viewBox = art width x 3). Only the top two bands carry text.
export const BANDS = {
  cameo: { box: "0 0 834 780", paths: ["M 250 502 Q 417 522 585 502", "M 240 556 Q 417 578 590 556"], font: 24 },
  hoop: { box: "0 0 834 837", paths: ["M 240 527 Q 417 545 590 527", "M 215 586 Q 417 602 615 586"], font: 21 },
};
const SEP = " · ";
const FILL = 0.8;

// Old records stored joined lines; split them back into labels and keep each <= 12 chars
const toLabels = (band) => [...new Set(band.flatMap((b) => b.split(SEP)).map((s) => s.trim()).filter(Boolean)
  .map((s) => (s.length > BAND_MAX ? shortLabel(s) : s)))];

export function BandText({ band, kind, show = true }) {
  const g = BANDS[kind];
  const pathRefs = useRef([]);
  const probe = useRef(null);
  const [fit, setFit] = useState([]);
  const labels = toLabels(band).slice(0, 4);
  const lines = [labels.slice(0, 2), labels.slice(2, 4)].filter((l) => l.length).map((l) => l.join(SEP));
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
        return natural > len * FILL ? len * FILL : null; // squeeze only when it would be too wide
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
        <text key={i} fontSize={g.font} dy="0.34em" fill="#F6EFE4" filter={`url(#${id}-sh)`} style={txt} data-testid={`band-line-${i}`}>
          <textPath href={`#${id}-${i}`} xlinkHref={`#${id}-${i}`} startOffset="50%" textAnchor="middle"
            {...(fit[i] ? { textLength: fit[i], lengthAdjust: "spacingAndGlyphs" } : {})}>{l}</textPath>
        </text>
      ))}
    </svg>
  );
}
