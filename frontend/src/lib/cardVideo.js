// Turns his share card into a 6s story video lit by light alone: he breathes, a warm shimmer sweeps across
// the weave, a soft glow pulses and red hearts float up. His painting is never redrawn or retouched.
import { portraitSrc } from "../content";

const W = 1080, H = 1920, FPS = 30, SECONDS = 6;
// The card's portrait box (sky box grown under the frame rim) and the visible oval inside the frame
const BOX = { x: 254.6, y: 426.6, w: 575.5, h: 817.2 };
const OVAL = { cx: 542.35, cy: 835.2, rx: 250, ry: 366 };
// His painting fills the box like CSS object-fit: cover, anchored at the bottom (the PNG shares the JPG's frame)
const S = Math.max(BOX.w / 1500, BOX.h / 2004);
const FIG = { w: 1500 * S, h: 2004 * S, x: BOX.x + (BOX.w - 1500 * S) / 2, y: BOX.y + BOX.h - 2004 * S };
const HEART = new Path2D("M0,9 C-13,0 -13,-10 -6.5,-10 C-3,-10 0,-7 0,-4 C0,-7 3,-10 6.5,-10 C13,-10 13,0 0,9Z");

const pickType = () => ["video/mp4;codecs=avc1", "video/mp4", "video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"]
  .find((t) => window.MediaRecorder?.isTypeSupported?.(t));
export const canMakeVideo = () => !!(window.MediaRecorder && HTMLCanvasElement.prototype.captureStream && pickType());

const bump = (t, a, b) => (t <= a || t >= b ? 0 : Math.sin((Math.PI * (t - a)) / (b - a)));
const canvas = (w, h) => Object.assign(document.createElement("canvas"), { width: Math.round(w), height: Math.round(h) });
const load = (src) => new Promise((res, rej) => { const i = new Image(); i.crossOrigin = "anonymous"; i.onload = () => res(i); i.onerror = rej; i.src = src; });

// Light layers, prepared once: his painting (feathered to the oval), his silhouette and a soft warm glow of it
async function prepare(portrait) {
  const [bg, fig] = await Promise.all([load(portraitSrc(portrait, "-bg")), load(portraitSrc(portrait))]);
  const oval = canvas(W, H), o = oval.getContext("2d");
  o.drawImage(bg, FIG.x, FIG.y, FIG.w, FIG.h);
  o.globalCompositeOperation = "destination-in";
  o.translate(OVAL.cx, OVAL.cy); o.scale(1, OVAL.ry / OVAL.rx);
  const rg = o.createRadialGradient(0, 0, OVAL.rx * 0.86, 0, 0, OVAL.rx);
  rg.addColorStop(0, "#000"); rg.addColorStop(1, "rgba(0,0,0,0)");
  o.fillStyle = rg; o.fillRect(-W, -W, 2 * W, 2 * W);
  // glow: his silhouette blurred by scaling down and up, tinted warm
  const small = canvas(FIG.w / 16, FIG.h / 16), sm = small.getContext("2d");
  sm.drawImage(fig, 0, 0, small.width, small.height);
  sm.globalCompositeOperation = "source-in"; sm.fillStyle = "#FFD58A"; sm.fillRect(0, 0, small.width, small.height);
  const glow = canvas(FIG.w, FIG.h), g = glow.getContext("2d");
  g.imageSmoothingQuality = "high"; g.drawImage(small, 0, 0, FIG.w, FIG.h);
  return { oval, fig, glow, scratch: canvas(W, H) };
}

function frame(c, card, L, t) {
  c.globalCompositeOperation = "source-over";
  c.drawImage(card, 0, 0, W, H);
  // breathing: his oval swells by 1.2% from his feet, twice in six seconds
  const b = 1 + 0.006 * (1 - Math.cos((4 * Math.PI * t) / SECONDS));
  const ox = OVAL.cx, oy = FIG.y + FIG.h;
  c.save(); c.translate(ox, oy); c.scale(b, b); c.translate(-ox, -oy);
  c.drawImage(L.oval, 0, 0);
  c.restore();
  // light layers live in a scratch canvas, limited to his silhouette and feathered to the visible oval
  const s = bump(t, 0.6, 2.6), gp = bump(t, 2.9, 4.3);
  if (s > 0 || gp > 0) {
    const x = L.scratch.getContext("2d");
    x.globalCompositeOperation = "source-over"; x.globalAlpha = 1; x.clearRect(0, 0, W, H);
    if (s > 0) {
      const sx = FIG.x - 200 + (FIG.w + 400) * ((t - 0.6) / 2);
      const lg = x.createLinearGradient(sx - 120, FIG.y, sx + 120, FIG.y + FIG.h * 0.3);
      lg.addColorStop(0, "rgba(255,233,184,0)"); lg.addColorStop(0.5, `rgba(255,233,184,${0.38 * s})`); lg.addColorStop(1, "rgba(255,233,184,0)");
      x.fillStyle = lg; x.fillRect(FIG.x, FIG.y, FIG.w, FIG.h);
    }
    if (gp > 0) { x.globalAlpha = 0.4 * gp; x.drawImage(L.glow, FIG.x, FIG.y); x.globalAlpha = 1; }
    x.globalCompositeOperation = "destination-in"; x.drawImage(L.fig, FIG.x, FIG.y, FIG.w, FIG.h);
    x.drawImage(L.oval, 0, 0);
    c.globalCompositeOperation = "screen"; c.drawImage(L.scratch, 0, 0);
  }
  // red hearts floating up from his chest
  c.globalCompositeOperation = "source-over";
  [[0, 0, 2.2], [0.35, -60, 1.7], [0.7, 50, 1.5]].forEach(([d, dx, sc]) => {
    const k = (t - 3.6 - d) / 2.1;
    if (k <= 0 || k >= 1) return;
    c.save();
    c.globalAlpha = k < 0.2 ? k / 0.2 : 1 - (k - 0.2) / 0.8;
    c.translate(OVAL.cx + dx * k, 1050 - 260 * k); c.scale(sc * (0.6 + 0.65 * k), sc * (0.6 + 0.65 * k));
    c.fillStyle = "#B3263A"; c.fill(HEART);
    c.restore();
  });
  c.globalAlpha = 1;
  // the oval sky breathes with a warm glow and a slow light sweep crosses the gilded frame
  const g = 0.16 + 0.16 * (0.5 - 0.5 * Math.cos((2 * Math.PI * t) / SECONDS));
  const rg = c.createRadialGradient(540, 760, 40, 540, 800, 330);
  rg.addColorStop(0, `rgba(255,226,160,${g})`); rg.addColorStop(1, "rgba(255,226,160,0)");
  c.globalCompositeOperation = "screen"; c.fillStyle = rg; c.fillRect(0, 0, W, H);
  const fx = -600 + 2400 * ((t % SECONDS) / SECONDS);
  const lg = c.createLinearGradient(fx - 220, 0, fx + 220, H * 0.35);
  lg.addColorStop(0, "rgba(255,232,170,0)"); lg.addColorStop(0.5, "rgba(255,232,170,0.16)"); lg.addColorStop(1, "rgba(255,232,170,0)");
  c.fillStyle = lg; c.fillRect(0, 300, W, 1100);
  c.globalCompositeOperation = "source-over";
}

// Renders the frames at the given times (also used for checking frames without recording)
export async function videoFrames(cardBlob, times, portrait) {
  const card = await createImageBitmap(cardBlob);
  const L = await prepare(portrait);
  return times.map((t) => { const cv = canvas(W, H); frame(cv.getContext("2d"), card, L, t); return cv; });
}

export async function makeCardVideo(cardBlob, portrait, onProgress = () => {}) {
  const type = pickType();
  const card = await createImageBitmap(cardBlob);
  const L = await prepare(portrait);
  onProgress(0.1);
  const cv = canvas(W, H), c = cv.getContext("2d");
  frame(c, card, L, 0);
  const stream = cv.captureStream(FPS);
  const rec = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: 6_000_000 });
  const chunks = [];
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  const done = new Promise((r) => { rec.onstop = r; });
  rec.start(250);
  const t0 = performance.now();
  await new Promise((resolve) => {
    const tick = () => {
      const t = (performance.now() - t0) / 1000;
      if (t >= SECONDS) return resolve();
      frame(c, card, L, t); onProgress(0.1 + (0.9 * t) / SECONDS);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  frame(c, card, L, SECONDS);
  rec.stop(); await done;
  stream.getTracks().forEach((tr) => tr.stop());
  return new Blob(chunks, { type: type.split(";")[0] });
}
