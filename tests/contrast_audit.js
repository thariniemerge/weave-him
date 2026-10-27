(label) => {
  const parse = (s) => {
    const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null;
    const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const allColors = (s) => (s.match(/rgba?\([^)]+\)/g) || []).map(parse);
  const blend = (top, bot) => ({ r: top.r * top.a + bot.r * (1 - top.a), g: top.g * top.a + bot.g * (1 - top.a), b: top.b * top.a + bot.b * (1 - top.a), a: 1 });
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };
  const BODY = [{ r: 233, g: 229, b: 219, a: 1 }, { r: 220, g: 217, b: 204, a: 1 }, { r: 241, g: 236, b: 225, a: 1 }];
  // background candidates for an element: walk up, stacking bg colors; gradients -> each stop is a candidate
  const bgsFor = (el) => {
    const layers = []; let cur = el; let opq = null;
    while (cur && cur.nodeType === 1) {
      const cs = getComputedStyle(cur);
      const img = cs.backgroundImage;
      if (img && img !== "none" && /gradient/.test(img)) {
        const cols = allColors(img).filter((c) => c.a > 0.5);
        if (cols.length && !/radial-gradient\(circle/.test(img.slice(0, 30))) { opq = cols; break; }
        if (cols.length) { opq = cols; break; }
      }
      const bc = parse(cs.backgroundColor);
      if (bc && bc.a > 0) { layers.push(bc); if (bc.a >= 0.99) { opq = [bc]; break; } }
      cur = cur.parentElement;
    }
    if (!opq) opq = BODY;
    return opq.map((base) => { let c = { ...base, a: 1 }; for (let i = layers.length - 1; i >= 0; i--) if (layers[i].a < 0.99) c = blend(layers[i], c); return c; });
  };
  const out = [];
  const els = Array.from(document.querySelectorAll("body *"));
  for (const el of els) {
    if (["SCRIPT", "STYLE", "SVG", "svg", "path"].includes(el.tagName)) continue;
    let text = Array.from(el.childNodes).filter((n) => n.nodeType === 3).map((n) => n.textContent).join("").trim();
    if ((el.tagName === "INPUT" || el.tagName === "TEXTAREA") && el.value) text = el.value;
    if (!text) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1 || r.bottom < 0 || r.top > innerHeight * 3) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none") continue;
    let op = 1, cur = el; while (cur && cur.nodeType === 1) { op *= Number(getComputedStyle(cur).opacity); cur = cur.parentElement; }
    if (op < 0.05) continue;
    const fg0 = parse(cs.color);
    const bgs = bgsFor(el);
    // over an image? check element stack at centre
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    let overImg = false;
    if (cy >= 0 && cy <= innerHeight) {
      const stack = document.elementsFromPoint(cx, cy);
      const idx = stack.indexOf(el);
      for (const s of stack.slice(idx + 1)) { if (s.tagName === "IMG") { overImg = s.getAttribute("src") || "img"; break; } if (s.contains(el)) break; }
    }
    let worst = 99, worstBg = null;
    for (const bg of bgs) {
      const fg = blend({ ...fg0, a: fg0.a * op }, bg);
      const rr = ratio(fg, bg); if (rr < worst) { worst = rr; worstBg = bg; }
    }
    const size = parseFloat(cs.fontSize), weight = Number(cs.fontWeight) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const need = large ? 3 : 4.5;
    out.push({ label, tid: el.getAttribute("data-testid") || (el.closest("[data-testid]") || {}).getAttribute?.("data-testid") || "", tag: el.tagName, text: text.slice(0, 40), color: cs.color, bg: worstBg ? `rgb(${worstBg.r|0},${worstBg.g|0},${worstBg.b|0})` : "", ratio: Math.round(worst * 100) / 100, need, size, weight, op: Math.round(op * 100) / 100, overImg, fail: worst < need });
  }
  return out;
}
