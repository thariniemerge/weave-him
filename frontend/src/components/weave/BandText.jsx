import { useLayoutEffect, useRef, useState } from "react";

// Band geometry traced from the storyboard art (viewBox = art width x 3)
export const BANDS = {
  cameo: { box: "0 0 834 780", paths: ["M 250 502 Q 417 522 585 502", "M 240 556 Q 417 578 590 556", "M 265 611 Q 417 630 568 611"], max: 26 },
  hoop: { box: "0 0 834 837", paths: ["M 240 527 Q 417 545 590 527", "M 215 586 Q 417 602 615 586"], max: 22 },
};
const SEP = " · ";
const LS = 0.1;

// Old records stored joined lines; split them back into labels
const toLabels = (band) => band.flatMap((b) => b.split(SEP)).map((s) => s.trim()).filter(Boolean);

// Greedy: up to 2 labels per band; if a pair won't fit at the minimum size, move one to the next band
function layout(labels, lens, measure, minF, maxF) {
  const out = [];
  let i = 0;
  for (let b = 0; b < lens.length && i < labels.length; b++) {
    const room = lens[b] * 0.85;
    let text = labels[i + 1] ? labels[i] + SEP + labels[i + 1] : labels[i];
    let take = labels[i + 1] ? 2 : 1;
    if (take === 2 && measure(text) * minF > room) { text = labels[i]; take = 1; }
    const f = Math.min(maxF, room / measure(text));
    if (f < minF) { i += take; b--; continue; } // a single label too long even alone: skip it
    out.push({ text, f });
    i += take;
  }
  return out;
}

export function BandText({ band, kind, show = true }) {
  const g = BANDS[kind];
  const svg = useRef(null);
  const probe = useRef(null);
  const pathRefs = useRef([]);
  const [lines, setLines] = useState([]);
  const key = band.join("|");

  useLayoutEffect(() => {
    let live = true;
    const run = () => {
      if (!live || !svg.current || !probe.current) return;
      const scale = svg.current.getBoundingClientRect().width / 834 || 0.41;
      const minF = 9 / scale;
      const measure = (t) => { probe.current.textContent = t; return probe.current.getComputedTextLength() / 100; };
      const lens = pathRefs.current.map((p) => p.getTotalLength());
      setLines(layout(toLabels(band), lens, measure, Math.min(minF, g.max), g.max));
    };
    document.fonts.load('600 20px "Cormorant SC"').then(() => document.fonts.ready).then(run);
    run();
    window.addEventListener("resize", run);
    return () => { live = false; window.removeEventListener("resize", run); };
  }, [key, kind]); // eslint-disable-line react-hooks/exhaustive-deps

  const id = `band-${kind}`;
  const txt = { fontFamily: "'Cormorant SC', serif", fontWeight: 600, letterSpacing: `${LS}em` };
  return (
    <svg ref={svg} viewBox={g.box} className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-500" style={{ opacity: show ? 1 : 0 }} aria-hidden data-testid={`band-text-${kind}`}>
      <defs>
        <filter id={`${id}-sh`} x="-5%" y="-40%" width="110%" height="180%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#120805" floodOpacity="0.85" />
        </filter>
        {g.paths.map((d, i) => <path key={i} id={`${id}-${i}`} d={d} ref={(el) => { pathRefs.current[i] = el; }} />)}
      </defs>
      <text ref={probe} x="-9999" y="-9999" fontSize="100" style={txt} />
      {lines.map((l, i) => (
        <text key={i} fontSize={l.f} dy="0.34em" fill="#F6EFE4" filter={`url(#${id}-sh)`} style={txt} data-testid={`band-line-${i}`}>
          <textPath href={`#${id}-${i}`} xlinkHref={`#${id}-${i}`} startOffset="50%" textAnchor="middle">{l.text}</textPath>
        </text>
      ))}
    </svg>
  );
}
