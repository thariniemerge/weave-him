import { QUESTIONS, SLIDERS, REMEMBERS, CONFIG, siteHost, MUSTHAVES, INTERESTS, GOALS, CUSTOM_NO, PORTRAITS } from "../content";

export const qByKey = (key) => QUESTIONS.find((q) => q.key === key);
const clean = (t) => t.replace(/^\s*(he|he…|he\.\.\.)\s+/i, "").replace(/\s+/g, " ").trim();
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const flat = (s) => s.replace(/,/g, "");
// 1-2 word band label, max 12 chars, cut at a word boundary
export const BAND_MAX = 12;
export function shortLabel(t) {
  const words = t.toUpperCase().replace(/[^\p{L}\p{N}'&\s-]/gu, "").split(/\s+/).filter(Boolean);
  for (let i = 0; i < words.length - 1; i++) {
    const two = `${words[i]} ${words[i + 1]}`;
    if (two.length <= BAND_MAX) return two;
  }
  const one = words.find((w) => w.length <= BAND_MAX);
  return one || (words[0] || "").slice(0, BAND_MAX);
}

// Band lines: three picks or fewer get one label per band (band 1 = first pick); older husbands with more
// labels keep two labels on each top band and one short label on the low band
const SEP = " · ";
const ALIAS = { "SAFE HARBOUR": "SAFE HAVEN", "CHILDHOOD PET": "PET'S NAME", "FAVOURITE SONG": "OUR SONG", "MOM'S BIRTHDAY": "MOM'S DAY" };
export function bandLines(band = []) {
  const all = [...new Set(band.flatMap((b) => b.split(SEP)).map((s) => s.trim()).filter(Boolean)
    .map((s) => ALIAS[s] || s).map((s) => (s.length > BAND_MAX ? shortLabel(s) : s)))];
  if (all.length <= 3) return all;
  const lines = [all.slice(0, 2), all.slice(2, 4)].filter((l) => l.length).map((l) => l.join(SEP));
  const low = all.slice(4).find((l) => l.split(" ").length <= 2) || (all[4] ? shortLabel(all[4]) : null);
  if (low && lines.length === 2) lines.push(low);
  return lines;
}


export const MAX_PICKS = 2;
export const allBandLabels = (a) => {
  const [q1, q2, q3, q4, q7] = [...QK, "q7"].map((k) => resolveChoices(k, a[k]));
  const rem = a.remembers.map(resolveRemember).filter(Boolean);
  const l = [q3[0], q1[0], q4[0], q2[0], q7[0], rem[0], ...q3.slice(1), ...q1.slice(1), ...q4.slice(1), ...q2.slice(1), ...q7.slice(1), ...rem.slice(1)];
  return [...new Set(l.filter(Boolean).map((o) => o.band))];
};
// Answers are lists of picks: [{ id } | { custom }]; older single answers are wrapped
export const asList = (v) => (Array.isArray(v) ? v : v ? [v] : []);

function resolveOne(key, ans) {
  if (ans.custom !== undefined) {
    const t = clean(ans.custom || "");
    if (!t) return null;
    return { id: "custom", label: t, strand: t, tag: t.toLowerCase(), band: shortLabel(t), sentence: `“${t}”` };
  }
  return qByKey(key).options.find((o) => o.id === ans.id) || null;
}
export const resolveChoices = (key, v) => asList(v).map((x) => resolveOne(key, x)).filter(Boolean);

export function resolveRemember(r) {
  if (r.custom) {
    const t = clean(r.custom);
    return { id: "custom", label: t, short: t, band: shortLabel(t), sentence: `you remember ${t}` };
  }
  return REMEMBERS.find((x) => x.id === r.id);
}

export const sliderStep = (v) => (v < 34 ? 0 : v > 66 ? 2 : 1);
export const sliderTags = (sliders) => SLIDERS.map((s) => s.steps[sliderStep(sliders[s.key] ?? s.def)].tag);

const QK = ["q1", "q2", "q3", "q4"];
export function soFarTags(a) {
  return [...QK.flatMap((k) => resolveChoices(k, a[k]).map((o) => o.tag)), ...sliderTags(a.sliders)];
}

export function isComplete(a) {
  return [...QK, "q7"].every((k) => resolveChoices(k, a[k]).length) && a.remembers.length > 0 && !!a.goal && a.musts.length > 0;
}

// Her must-haves and interests: picks are [{ id } | { custom }]
export const resolveMust = (m) => (m.custom ? { id: "custom", label: clean(m.custom), vow: `I'll keep this promise above all: ${clean(m.custom).toLowerCase()}.`, words: [clean(m.custom).toLowerCase()] } : MUSTHAVES.find((x) => x.id === m.id));
export const resolveInterest = (m) => (m.custom ? { id: "custom", label: clean(m.custom) } : INTERESTS.find((x) => x.id === m.id));
// One suitor against one must-have: { ok, reason }
export const suitorVerdict = (s, m) => (m.id === "custom" ? { ok: false, reason: CUSTOM_NO } : s.no[m.id] ? { ok: false, reason: s.no[m.id] } : { ok: true });

// Her answers as signs, in strand order (I to VIII)
export function signs(a) {
  const out = [];
  ["q1", "q2", "q3", "q4"].forEach((k) => resolveChoices(k, a[k]).forEach((o) => out.push(`${k}:${o.id}`)));
  ["out", "love", "feel"].forEach((k) => { const v = a.sliders?.[k]; if (v < 50) out.push(`${k}:low`); else if (v > 50) out.push(`${k}:high`); });
  (a.remembers || []).forEach((r) => r.id && out.push(`rem:${r.id}`));
  resolveChoices("q7", a.q7).forEach((o) => out.push(`q7:${o.id}`));
  if (a.goal) out.push(`goal:${a.goal}`);
  return out;
}

// The `n` options most like her answers so far: score = how many of an option's `links` are among her signs,
// ties keep list order. Anything she already picked always stays. Shown in the list's own order.
export function topByLinks(items, a, picks, n = 3) {
  const s = new Set(signs(a));
  const picked = (id) => picks.some((p) => p.id === id);
  const keep = new Set(items.filter((it) => picked(it.id)).map((it) => it.id));
  items.map((it, i) => ({ id: it.id, score: (it.links || []).filter((l) => s.has(l)).length, i }))
    .filter((x) => !keep.has(x.id))
    .sort((x, y) => y.score - x.score || x.i - y.i)
    .slice(0, Math.max(0, n - keep.size))
    .forEach((x) => keep.add(x.id));
  return items.filter((it) => keep.has(it.id));
}

// The portrait with the most matching signs; ties go to the one she matched first, then list order
export function pickPortrait(a) {
  const s = signs(a);
  const rank = PORTRAITS.map((p, i) => {
    const hits = s.map((x, j) => (p.signs.includes(x) ? j : -1)).filter((j) => j >= 0);
    return { slug: p.slug, score: hits.length, first: hits.length ? hits[0] : 99, i };
  });
  rank.sort((x, y) => y.score - x.score || x.first - y.first || x.i - y.i);
  return rank[0].slug;
}

export function buildPayload(a) {
  const [q1, q2, q3, q4, q7] = [...QK, "q7"].map((k) => resolveChoices(k, a[k]));
  const rem = a.remembers.map(resolveRemember).filter(Boolean);
  const temper = sliderTags(a.sliders).join(", ");
  const remStrand = `remembers ${rem.map((r) => r.short).join(" & ")}`;
  const all = [q1, q2, q3, q4];
  const strands = [...all.flat().map((o) => o.strand), temper, remStrand, ...q7.map((o) => o.strand)];
  const firsts = [q3[0], q1[0], q4[0], q2[0], q7[0], rem[0]];
  const rest = [...q3.slice(1), ...q1.slice(1), ...q4.slice(1), ...q2.slice(1), ...q7.slice(1), ...rem.slice(1)];
  const ids = (l) => l.map((o) => o.id).join(",");
  // her three band picks, in the order she tapped them, are the one source for bands, card, video and vows
  const opts = [...firsts, ...rest];
  const labels = [...new Set(opts.map((o) => o.band))];
  const picks = (a.bandPick || []).filter((l) => labels.includes(l)).slice(0, 3);
  const band = picks.length ? picks : labels.slice(0, 3);
  const strandOf = (l) => { const o = opts.find((x) => x.band === l); return o.strand || `remembers ${o.short}`; };
  const woven = band.map(strandOf);
  return {
    strands,
    keys: { q1: ids(q1), q2: ids(q2), q3: ids(q3), q4: ids(q4), q7: ids(q7) },
    sliders: Object.fromEntries(SLIDERS.map((s) => [s.key, a.sliders[s.key] ?? s.def])),
    remembers: rem.map((r) => r.short),
    remember_keys: rem.map((r) => r.id),
    feel: q7.map((o) => o.label).join(" & "),
    band,
    card: {
      line1: woven.slice(0, 2).map(cap).join(" · "),
      line2: cap(woven[2] || `remembers ${rem[0].short}`),
      woven: woven.map(flat),
    },
    threads: [...all.flat().map((o) => ({ label: cap(o.strand), sentence: o.sentence })),
      ...rem.map((r) => ({ label: cap(r.short), sentence: r.sentence })),
      ...q7.map((o) => ({ label: cap(o.strand), sentence: o.sentence }))].slice(0, 20),
    site: siteHost(),
    credit: CONFIG.CARD_CREDIT_LINE,
    goal: GOALS.find((g) => g.id === a.goal)?.short || "",
    interests: (a.interests || []).map(resolveInterest).filter(Boolean).map((i) => i.label),
    musts: (a.musts || []).map(resolveMust).filter(Boolean).map(({ label, vow, words }) => ({ label, vow, words })),
    portrait: pickPortrait(a),
  };
}

// Short tags shown floating in the weaving hoop
export function hoopTags(a) {
  const [q1, q2, q3, q4, q7] = [...QK, "q7"].map((k) => resolveChoices(k, a[k])[0]);
  const rem = a.remembers.map(resolveRemember)[0];
  return [q1.strand, q2.strand, q3.strand, q4.strand, sliderTags(a.sliders)[0], `remembers ${rem.short}`, q7.strand];
}
