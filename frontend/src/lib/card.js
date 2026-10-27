import { toBlob, getFontEmbedCSS } from "html-to-image";
import { toast } from "sonner";
import { COPY } from "../content";

const waitImages = (node) =>
  Promise.all([...node.querySelectorAll("img")].map((img) =>
    img.complete && img.naturalWidth ? img.decode().catch(() => {}) : new Promise((r) => { img.onload = img.onerror = r; })));

export async function renderCard(node) {
  await document.fonts.ready;
  await waitImages(node);
  const opts = { width: 1080, height: 1920, pixelRatio: 1, canvasWidth: 1080, canvasHeight: 1920, cacheBust: false };
  opts.fontEmbedCSS = await getFontEmbedCSS(node).catch(() => undefined);
  opts.type = "image/jpeg"; opts.quality = 0.88;
  await toBlob(node, opts); // warm-up pass so Safari has images & fonts decoded
  return toBlob(node, opts);
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const t = document.createElement("textarea");
    t.value = text; t.style.position = "fixed"; t.style.opacity = "0";
    document.body.appendChild(t); t.select(); document.execCommand("copy"); t.remove();
  }
}

export const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const cardFile = (blob, name) => new File([blob], `${name.toLowerCase()}-woven-by-hand.jpg`, { type: "image/jpeg" });

function download(file) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(file); a.download = file.name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

async function shareFiles(data) {
  try { await navigator.share(data); return "shared"; }
  catch (e) { return e.name === "AbortError" ? "cancelled" : "failed"; }
}

export async function saveVideo({ blob, name, link }) {
  const ext = blob.type.includes("mp4") ? "mp4" : "webm";
  const file = new File([blob], `${name.toLowerCase()}-woven-by-hand.${ext}`, { type: blob.type });
  if (navigator.canShare?.({ files: [file] })) {
    const r = await shareFiles({ files: [file], title: `Meet ${name}`, text: `${COPY.shareText(name)} ${link}` });
    if (r !== "failed") return r;
  }
  download(file);
  toast("His story video is saved", { description: file.name });
  return "downloaded";
}

// iPhone keeps "Save Image" inside the share sheet; elsewhere a plain download
export async function saveCard({ blob, name }) {
  const file = cardFile(blob, name);
  if (isIOS() && navigator.canShare?.({ files: [file] })) {
    const r = await shareFiles({ files: [file] });
    if (r !== "failed") return r;
  }
  download(file);
  toast("His card is saved", { description: file.name });
  return "downloaded";
}

export async function shareCard({ blob, name, link }) {
  const file = cardFile(blob, name);
  if (navigator.canShare?.({ files: [file] })) {
    const r = await shareFiles({ files: [file], title: `Meet ${name}`, text: `${COPY.shareText(name)} ${link}` });
    if (r !== "failed") return r;
  }
  download(file);
  await copyText(link);
  toast(COPY.linkCopied, { description: "His card is downloading, too." });
  return "downloaded";
}

const CARD_FONTS = ['500 104px "Cormorant Garamond"', 'italic 500 54px "Cormorant Garamond"', '600 29px "Cormorant Garamond"', '600 20px "Cormorant SC"', '700 24px "Cormorant SC"', '600 40px "Grenze Gotisch"'];
// Fonts load lazily; request every card face explicitly before measuring
export const loadCardFonts = () => Promise.all(CARD_FONTS.map((f) => document.fonts.load(f))).then(() => document.fonts.ready);
