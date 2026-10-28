// Turns his share card into a 6s story video: he breathes and plays his own expression frames
// (neutral, natural blink, wink, heart eyes, neutral), one frame at a time. The frames are used as provided, never redrawn.
import { portraitSrc, frameSrc } from "../content";

const FACES = ["neutral", "blink_half", "blink", "wink", "heart_eyes"];
// the blink is timed in video frames with hard cuts: half 2 frames, closed 3, half 2 (about 230ms at 30fps)
const BLINK_AT = 27;

const W = 1080, H = 1920, FPS = 30, SECONDS = 6;
// The card's portrait box (sky box grown under the frame rim) and the visible oval inside the frame
const BOX = { x: 254.6, y: 426.6, w: 575.5, h: 817.2 };
const OVAL = { cx: 542.35, cy: 835.2, rx: 250, ry: 366 };
// His painting fills the box like CSS object-fit: cover, anchored at the bottom (frames share the JPG's frame)
const S = Math.max(BOX.w / 1500, BOX.h / 2004);
const FIG = { w: 1500 * S, h: 2004 * S, x: BOX.x + (BOX.w - 1500 * S) / 2, y: BOX.y + BOX.h - 2004 * S };

const pickType = () => ["video/mp4;codecs=avc1", "video/mp4", "video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"]
  .find((t) => window.MediaRecorder?.isTypeSupported?.(t));
export const canMakeVideo = () => !!(window.MediaRecorder && HTMLCanvasElement.prototype.captureStream && pickType());

const canvas = (w, h) => Object.assign(document.createElement("canvas"), { width: Math.round(w), height: Math.round(h) });
const load = (src) => new Promise((res, rej) => { const i = new Image(); i.crossOrigin = "anonymous"; i.onload = () => res(i); i.onerror = rej; i.src = src; });

async function prepare(portrait) {
  const [bg, ...faces] = await Promise.all([load(portraitSrc(portrait, "-bg")), ...FACES.map((e) => load(frameSrc(portrait, e)))]);
  // feathered oval mask: his painting melts into the still card under the frame rim
  const mask = canvas(W, H), o = mask.getContext("2d");
  o.translate(OVAL.cx, OVAL.cy); o.scale(1, OVAL.ry / OVAL.rx);
  const rg = o.createRadialGradient(0, 0, OVAL.rx * 0.86, 0, 0, OVAL.rx);
  rg.addColorStop(0, "#000"); rg.addColorStop(1, "rgba(0,0,0,0)");
  o.fillStyle = rg; o.fillRect(-W, -W, 2 * W, 2 * W);
  return { bg, faces: Object.fromEntries(FACES.map((e, i) => [e, faces[i]])), mask, scratch: canvas(W, H) };
}

const ramp = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)));
// neutral, blink, wink (0.9s hold), heart eyes (1.8s hold), neutral: weights of each frame over the neutral one
export function expressionAt(t) {
  const wink = ramp(t, 1.5, 1.8) * (1 - ramp(t, 2.7, 3.05));
  const heart_eyes = ramp(t, 3.15, 3.45) * (1 - ramp(t, 5.25, 5.6));
  const f = Math.floor(t * FPS + 1e-6) - BLINK_AT;
  return { blink_half: (f >= 0 && f < 2) || (f >= 5 && f < 7) ? 1 : 0, blink: f >= 2 && f < 5 ? 1 : 0, wink, heart_eyes };
}

function frame(c, card, L, t) {
  c.globalCompositeOperation = "source-over";
  c.drawImage(card, 0, 0, W, H);
  // his oval, redrawn from his own frames: the painted background, then his neutral face with today's expression
  const x = L.scratch.getContext("2d");
  x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = "source-over"; x.globalAlpha = 1; x.clearRect(0, 0, W, H);
  // breathing: the whole stack swells by 1.2% from his feet over a 5s loop
  const b = 1 + 0.006 * (1 - Math.cos((2 * Math.PI * t) / 5));
  const ox = OVAL.cx, oy = FIG.y + FIG.h;
  x.translate(ox, oy); x.scale(b, b); x.translate(-ox, -oy);
  x.drawImage(L.bg, FIG.x, FIG.y, FIG.w, FIG.h);
  x.drawImage(L.faces.neutral, FIG.x, FIG.y, FIG.w, FIG.h);
  const w = expressionAt(t);
  ["wink", "heart_eyes", "blink_half", "blink"].forEach((e) => { if (w[e] > 0) { x.globalAlpha = w[e]; x.drawImage(L.faces[e], FIG.x, FIG.y, FIG.w, FIG.h); } });
  x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1;
  x.globalCompositeOperation = "destination-in"; x.drawImage(L.mask, 0, 0);
  c.drawImage(L.scratch, 0, 0);
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
