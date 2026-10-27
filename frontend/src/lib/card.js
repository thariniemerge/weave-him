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

export async function shareCard({ blob, name, link }) {
  const file = new File([blob], `${name.toLowerCase()}-woven-by-hand.png`, { type: "image/png" });
  const text = `${COPY.shareText(name)} ${link}`;
  if (navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: `Meet ${name}`, text }); return "shared"; }
    catch (e) { if (e.name === "AbortError") return "cancelled"; }
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = file.name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  await copyText(link);
  toast(COPY.linkCopied, { description: "His card is downloading, too." });
  return "downloaded";
}
