// Turns his share card into a short looping story video: the sky glows and he winks.
const W = 1080, H = 1920, FPS = 30, SECONDS = 6;
const HEAD = { x: 545, y: 695 };
const INK = "#2A211B", ROSE = "#6B2E36", PEONY = "rgba(217,160,166,";

const pickType = () => ["video/mp4;codecs=avc1", "video/mp4", "video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"]
  .find((t) => window.MediaRecorder?.isTypeSupported?.(t));
export const canMakeVideo = () => !!(window.MediaRecorder && HTMLCanvasElement.prototype.captureStream && pickType());

const ease = (x) => 0.5 - Math.cos(Math.PI * Math.min(1, Math.max(0, x))) / 2;

function stitch(c, color, width, draw) {
  c.save(); c.strokeStyle = color; c.lineWidth = width; c.lineCap = "round"; c.setLineDash([7, 5]);
  c.beginPath(); draw(); c.stroke(); c.restore();
}

function face(c, t) {
  const wink = t > 1.6 && t < 2.5, blush = 0.35 + 0.4 * ease((t - 1.4) / 0.6) * (t < 3.2 ? 1 : Math.max(0, 1 - (t - 3.2) / 0.8));
  const blink = Math.abs(t - 4.6) < 0.07;
  c.save(); c.translate(HEAD.x, HEAD.y);
  [-1, 1].forEach((s) => {
    c.fillStyle = `${PEONY}${blush})`; c.beginPath(); c.ellipse(s * 35, 14, 11, 7, 0, 0, Math.PI * 2); c.fill();
    if (wink && s === 1) stitch(c, INK, 3.6, () => { c.moveTo(s * 20 - 8, -4); c.quadraticCurveTo(s * 20, 4, s * 20 + 8, -4); });
    else { c.fillStyle = INK; c.beginPath(); c.ellipse(s * 20, -6, 4.2, blink ? 0.8 : 6, 0, 0, Math.PI * 2); c.fill(); }
  });
  const big = wink ? 1 : 0;
  stitch(c, ROSE, 3.8, () => { c.moveTo(-15 - big * 4, 22); c.quadraticCurveTo(0, 33 + big * 6, 15 + big * 4, 22); });
  if (wink) { // tiny gold sparkle by the winking eye
    const k = Math.sin(Math.PI * (t - 1.6) / 0.9), r = 10 * k;
    c.translate(40, -26); c.rotate(k); c.fillStyle = `rgba(233,200,120,${k})`;
    c.beginPath(); c.moveTo(0, -r); c.lineTo(r * 0.25, -r * 0.25); c.lineTo(r, 0); c.lineTo(r * 0.25, r * 0.25);
    c.lineTo(0, r); c.lineTo(-r * 0.25, r * 0.25); c.lineTo(-r, 0); c.lineTo(-r * 0.25, -r * 0.25); c.closePath(); c.fill();
  }
  c.restore();
}

function frame(c, img, t) {
  c.globalCompositeOperation = "source-over";
  c.drawImage(img, 0, 0, W, H);
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
  face(c, t);
}

export async function makeCardVideo(cardBlob, onProgress = () => {}) {
  const type = pickType();
  const img = await createImageBitmap(cardBlob);
  const canvas = Object.assign(document.createElement("canvas"), { width: W, height: H });
  const c = canvas.getContext("2d");
  frame(c, img, 0);
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
      frame(c, img, t); onProgress(t / SECONDS);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  frame(c, img, SECONDS);
  rec.stop(); await done;
  stream.getTracks().forEach((tr) => tr.stop());
  const base = type.split(";")[0];
  return new Blob(chunks, { type: base });
}
