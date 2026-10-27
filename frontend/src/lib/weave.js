import { QUESTIONS, SLIDERS, REMEMBERS, CONFIG, siteHost } from "../content";

export const qByKey = (key) => QUESTIONS.find((q) => q.key === key);
const clean = (t) => t.replace(/^\s*(he|he…|he\.\.\.)\s+/i, "").replace(/\s+/g, " ").trim();
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const flat = (s) => s.replace(/,/g, "");

export function resolveChoice(key, ans) {
  if (!ans) return null;
  if (ans.custom) {
    const t = clean(ans.custom);
    if (!t) return null;
    return { id: "custom", label: t, strand: t.toLowerCase(), tag: t.toLowerCase(), band: t.toUpperCase(), sentence: `“${t}”` };
  }
  return qByKey(key).options.find((o) => o.id === ans.id) || null;
}

export function resolveRemember(r) {
  if (r.custom) {
    const t = clean(r.custom);
    return { id: "custom", label: t, short: t, band: `REMEMBERS ${t.toUpperCase()}`, sentence: `you remember ${t}` };
  }
  return REMEMBERS.find((x) => x.id === r.id);
}

export const sliderStep = (v) => (v < 34 ? 0 : v > 66 ? 2 : 1);
export const sliderTags = (sliders) => SLIDERS.map((s) => s.steps[sliderStep(sliders[s.key] ?? s.def)].tag);

export function soFarTags(a) {
  const tags = ["q1", "q2", "q3", "q4"].map((k) => resolveChoice(k, a[k])?.tag).filter(Boolean);
  return [...tags, ...sliderTags(a.sliders)];
}

export function isComplete(a) {
  return ["q1", "q2", "q3", "q4", "q7"].every((k) => resolveChoice(k, a[k])) && a.remembers.length > 0;
}

export function buildPayload(a) {
  const [q1, q2, q3, q4, q7] = ["q1", "q2", "q3", "q4", "q7"].map((k) => resolveChoice(k, a[k]));
  const rem = a.remembers.map(resolveRemember).filter(Boolean);
  const temper = sliderTags(a.sliders).join(", ");
  const remStrand = `remembers ${rem.map((r) => r.short).join(" & ")}`;
  const strands = [q1.strand, q2.strand, q3.strand, q4.strand, temper, remStrand, q7.strand];
  return {
    strands,
    keys: { q1: q1.id, q2: q2.id, q3: q3.id, q4: q4.id, q7: q7.id },
    sliders: Object.fromEntries(SLIDERS.map((s) => [s.key, a.sliders[s.key] ?? s.def])),
    remembers: rem.map((r) => r.short),
    remember_keys: rem.map((r) => r.id),
    feel: q7.label,
    band: [`${q3.band} · ${q1.band}`, `${q2.band} · ${q4.band}`, `${rem[0].band.startsWith("REMEMBERS") ? rem[0].band : "REMEMBERS " + rem[0].band} · ${q7.band}`],
    card: {
      line1: `${cap(q3.strand)} · ${cap(q1.strand)}`,
      line2: cap(`remembers ${rem[0].short}`),
      woven: [flat(q3.strand), flat(q1.strand), rem[0].short],
    },
    threads: [q1, q2, q3, q4].map((o) => ({ label: cap(o.strand), sentence: o.sentence }))
      .concat(rem.map((r) => ({ label: cap(r.short), sentence: r.sentence })))
      .concat([{ label: cap(q7.strand), sentence: q7.sentence }]),
    site: siteHost(),
    credit: CONFIG.CARD_CREDIT_LINE,
  };
}

// Short tags shown floating in the weaving hoop
export function hoopTags(a) {
  const p = buildPayload(a);
  const rem = a.remembers.map(resolveRemember)[0];
  return [p.strands[0], p.strands[1], p.strands[2], p.strands[3], sliderTags(a.sliders)[0], `remembers ${rem.short}`, p.strands[6]];
}
