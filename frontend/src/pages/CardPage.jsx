import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { ShareCard } from "../components/weave/ShareCard";
import { getCardBlob, getHusband } from "../lib/api";
import { loadCardFonts } from "../lib/card";
import { videoFrames } from "../lib/cardVideo";

const DUMMY = { name: "Rowan", number: "0417", card: { line1: "Patience", line2: "Remembers", woven: ["a", "b", "c"] } };

// Story-video frames at the given times (?frames=1.6,3.6,4.6), for checking the light effects
function Frames({ id, times }) {
  const [urls, setUrls] = useState([]);
  useEffect(() => {
    Promise.all([getCardBlob(id), getHusband(id)]).then(([b, h]) => videoFrames(b, times, h.portrait)).then((cs) => setUrls(cs.map((c) => c.toDataURL("image/jpeg", 0.92))));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  return <div data-frames-ready={urls.length ? "1" : "0"}>{urls.map((u, i) => <img key={i} src={u} alt="" data-testid={`video-frame-${i}`} style={{ width: 1080, display: "block" }} />)}</div>;
}

// Bare 1080x1920 card, used to build/compare the server-rendered card layers
export default function CardPage() {
  const { id } = useParams();
  const [q] = useSearchParams();
  const layer = q.get("layer") || "full";
  const frames = q.get("frames");
  const [h, setH] = useState(id === "_layers" ? { ...DUMMY, portrait: q.get("portrait") || undefined } : null);
  const [fontsReady, setFontsReady] = useState(false);
  useEffect(() => {
    document.documentElement.style.background = layer === "over" ? "transparent" : "#16201A";
    document.body.style.cssText = "background:transparent;margin:0";
    loadCardFonts().then(() => setFontsReady(true));
  }, [layer]);
  useEffect(() => { if (!h && !frames) getHusband(id).then(setH); }, [id, h, frames]);
  if (frames) return <Frames id={id} times={frames.split(",").map(Number)} />;
  if (!h) return null;
  return (
    <div data-card-ready={fontsReady ? "1" : "0"}>
      <ShareCard husband={h} fontsReady={fontsReady} layer={layer} site={q.get("site") || undefined} />
    </div>
  );
}
