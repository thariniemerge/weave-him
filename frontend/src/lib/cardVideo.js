// Turns his share card into a 6s story video: the sky glows and his real face (K's own groups) blinks, smiles slowly, winks.
import { PORTRAIT } from "../assets/medallionK";
import { scoped, faceParts, applyPose } from "./face";

const W = 1080, H = 1920, FPS = 30, SECONDS = 6;
const SKY = { x: 280.6, y: 456.6, w: 523.5, h: 757.2 };
// His face inside the sky box (brows to chin), redrawn each frame with a feathered edge
const PATCH = { x: 150, y: 250, w: 230, h: 205 };

const pickType = () => ["video/mp4;codecs=avc1", "video/mp4", "video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"]
  .find((t) => window.MediaRecorder?.isTypeSupported?.(t));
export const canMakeVideo = () => !!(window.MediaRecorder && HTMLCanvasElement.prototype.captureStream && pickType());

const ease = (x) => 0.5 - Math.cos(Math.PI * Math.min(1, Math.max(0, x))) / 2;
const q = (v) => Math.round(v * 20) / 20;

// blink -> slow smile -> wink with a brow raise -> ends on the smile
export function poseAt(t) {
  const blink = Math.abs(t - 0.9) < 0.08 ? 1 : 0;
  const smile = ease((t - 1.3) / 1.5);
  const w = t < 3.2 ? 0 : t < 3.4 ? ease((t - 3.2) / 0.2) : t < 4.0 ? 1 : 1 - ease((t - 4.0) / 0.25);
  return { pose: { smile: q(smile), wink: q(w), browR: q(1.6 * w) }, blink };
}

// Same portrait SVG as the card, posed, with the card's sky filter baked in
async function poseImage(pose, blink) {
  const [p, html] = scoped(PORTRAIT);
  const host = document.createElement("div");
  host.innerHTML = html;
  const svg = host.firstElementChild;
  applyPose(faceParts(svg, p), pose, { blink });
  svg.setAttribute("width", SKY.w); svg.setAttribute("height", SKY.h);
  svg.querySelector("defs").insertAdjacentHTML("beforeend",
    `<filter id="${p}sky" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values=".95"/><feComponentTransfer><feFuncR type="linear" slope=".93"/><feFuncG type="linear" slope=".93"/><feFuncB type="linear" slope=".93"/></feComponentTransfer></filter>`);
  const g = svg.querySelector(`[id="${p}portrait"]`);
  g.setAttribute("filter", `url(#${p}sky)`);
  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`;
  await img.decode();
  const c = Object.assign(document.createElement("canvas"), { width: PATCH.w, height: PATCH.h });
  const x = c.getContext("2d");
  x.drawImage(img, -PATCH.x, -PATCH.y, SKY.w, SKY.h);
  // feathered ellipse so the patch melts into the still card
  x.globalCompositeOperation = "destination-in";
  x.translate(PATCH.w / 2, PATCH.h / 2); x.scale(1, PATCH.h / PATCH.w);
  const rg = x.createRadialGradient(0, 0, PATCH.w * 0.3, 0, 0, PATCH.w / 2);
  rg.addColorStop(0, "#000"); rg.addColorStop(1, "rgba(0,0,0,0)");
  x.fillStyle = rg; x.fillRect(-PATCH.w, -PATCH.w, PATCH.w * 2, PATCH.w * 2);
  return c;
}

async function buildFaces(onProgress) {
  const frames = [], cache = new Map();
  for (let i = 0; i <= SECONDS * FPS; i++) {
    const { pose, blink } = poseAt(i / FPS);
    const key = JSON.stringify([pose, blink]);
    if (!cache.has(key)) cache.set(key, await poseImage(pose, blink));
    frames.push(cache.get(key));
    onProgress((0.25 * i) / (SECONDS * FPS));
  }
  return frames;
}

function frame(c, img, face, t) {
  c.globalCompositeOperation = "source-over";
  c.drawImage(img, 0, 0, W, H);
  c.drawImage(face, SKY.x + PATCH.x, SKY.y + PATCH.y);
  // the oval sky breathes with a warm glow (loops seamlessly)
  const g = 0.16 + 0.16 * (0.5 - 0.5 * Math.cos((2 * Math.PI * t) / SECONDS));
  const rg = c.createRadialGradient(540, 760, 40, 540, 800, 330);
  rg.addColorStop(0, `rgba(255,226,160,${g})`); rg.addColorStop(1, "rgba(255,226,160,0)");
  c.globalCompositeOperation = "screen"; c.fillStyle = rg; c.fillRect(0, 0, W, H);
  // a slow light sweep over the gilded frame
  const sx = -600 + 2400 * ((t % SECONDS) / SECONDS);
  const lg = c.createLinearGradient(sx - 220, 0, sx + 220, H * 0.35);
  lg.addColorStop(0, "rgba(255,232,170,0)"); lg.addColorStop(0.5, "rgba(255,232,170,0.16)"); lg.addColorStop(1, "rgba(255,232,170,0)");
  c.fillStyle = lg; c.fillRect(0, 300, W, 1100);
  c.globalCompositeOperation = "source-over";
}

// Renders the frame at time t (also used for checking frames without recording)
export async function videoFrames(cardBlob, times) {
  const img = await createImageBitmap(cardBlob);
  const faces = await buildFaces(() => {});
  return times.map((t) => {
    const cv = Object.assign(document.createElement("canvas"), { width: W, height: H });
    frame(cv.getContext("2d"), img, faces[Math.min(faces.length - 1, Math.round(t * FPS))], t);
    return cv;
  });
}

export async function makeCardVideo(cardBlob, onProgress = () => {}) {
  const type = pickType();
  const img = await createImageBitmap(cardBlob);
  const faces = await buildFaces(onProgress);
  const at = (t) => faces[Math.min(faces.length - 1, Math.round(t * FPS))];
  const canvas = Object.assign(document.createElement("canvas"), { width: W, height: H });
  const c = canvas.getContext("2d");
  frame(c, img, at(0), 0);
  const stream = canvas.captureStream(FPS);
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
      frame(c, img, at(t), t); onProgress(0.25 + (0.75 * t) / SECONDS);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  frame(c, img, at(SECONDS), SECONDS);
  rec.stop(); await done;
  stream.getTracks().forEach((tr) => tr.stop());
  return new Blob(chunks, { type: type.split(";")[0] });
}
