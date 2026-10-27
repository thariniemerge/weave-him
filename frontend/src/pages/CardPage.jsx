import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { ShareCard } from "../components/weave/ShareCard";
import { getHusband } from "../lib/api";
import { loadCardFonts } from "../lib/card";

const DUMMY = { name: "Rowan", number: "0417", card: { line1: "Patience", line2: "Remembers", woven: ["a", "b", "c"] } };

// Bare 1080x1920 card, used to build/compare the server-rendered card layers
export default function CardPage() {
  const { id } = useParams();
  const [q] = useSearchParams();
  const layer = q.get("layer") || "full";
  const [h, setH] = useState(id === "_layers" ? DUMMY : null);
  const [fontsReady, setFontsReady] = useState(false);
  useEffect(() => {
    document.documentElement.style.background = layer === "over" ? "transparent" : "#16201A";
    document.body.style.cssText = "background:transparent;margin:0";
    loadCardFonts().then(() => setFontsReady(true));
  }, [layer]);
  useEffect(() => { if (!h) getHusband(id).then(setH); }, [id, h]);
  if (!h) return null;
  return (
    <div data-card-ready={fontsReady ? "1" : "0"}>
      <ShareCard husband={h} fontsReady={fontsReady} layer={layer} site={q.get("site") || undefined} />
    </div>
  );
}
