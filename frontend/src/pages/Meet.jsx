import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { X, Share } from "lucide-react";
import { Page, Pill, Art, SoundToggle, Credit } from "../components/weave/ui";
import { VowsCard } from "../components/weave/VowsCard";
import { CardPreview } from "../components/weave/CardPreview";
import { play } from "../lib/sound";
import { ShareCard } from "../components/weave/ShareCard";
import { COPY, CONFIG } from "../content";
import { cachedHusband, getCardBlob, getHusband, isMine, shareLink } from "../lib/api";
import { renderCard, shareCard, saveCard, loadCardFonts, copyText, isIOS } from "../lib/card";
import { ShareReveal } from "../components/weave/ShareReveal";
import { toast } from "sonner";
import { useAnswers } from "../lib/store";
import { BandText } from "../components/weave/BandText";

export const Cameo = ({ h }) => (
  <div className="relative w-full" style={{ aspectRatio: "278 / 260" }} data-testid="meet-cameo">
    <Art name="meet-cameo" className="absolute inset-0 w-full h-full" alt={`${h.name}, a wicker husband`} />
    <BandText band={h.band} kind="cameo" />
    <p data-testid="ribbon-name" className="absolute left-0 right-0 text-center f-cg italic font-semibold text-[26px] text-[color:var(--parchment)] leading-none" style={{ top: "86.6%" }}>
      meet {h.name}
    </p>
  </div>
);

// Server-rendered card first; client render is only a fallback
function useCard(h, enabled) {
  const ref = useRef(null);
  const [fontsReady, setFontsReady] = useState(false);
  const [blob, setBlob] = useState(null);
  const [fallback, setFallback] = useState(false);
  useEffect(() => {
    if (!h || !enabled) return;
    let live = true;
    getCardBlob(h.id).then((b) => live && setBlob(b)).catch(() => live && setFallback(true));
    return () => { live = false; };
  }, [h?.id, enabled]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (fallback) loadCardFonts().then(() => setFontsReady(true)); }, [fallback]);
  useEffect(() => {
    if (!fallback || !fontsReady || !ref.current) return;
    renderCard(ref.current).then((b) => b && setBlob(b)).catch(() => {});
  }, [fallback, fontsReady]);
  const url = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob]);
  useEffect(() => () => url && URL.revokeObjectURL(url), [url]);
  return { ref, blob, url, fallback, fontsReady };
}

export default function Meet({ isPublic = false }) {
  const { id } = useParams();
  const nav = useNavigate();
  const { reset } = useAnswers();
  const [h, setH] = useState(() => cachedHusband(id) || null);
  const [missing, setMissing] = useState(false);
  const { ref, blob, url, fallback, fontsReady } = useCard(h, !isPublic);
  const mine = !isPublic && isMine(id);

  useEffect(() => { if (!h) getHusband(id).then(setH).catch(() => setMissing(true)); }, [id, h]);
  useEffect(() => { if (isPublic && h) document.title = `Meet ${h.name} · Weave Him`; }, [h, isPublic]);
  useEffect(() => { if (h?.id) play("harp"); }, [h?.id]);

  const [reveal, setReveal] = useState(false);
  const onShare = () => { play("paper"); blob && shareCard({ blob, name: h.name, link: shareLink(h.id) }); };
  const onSave = () => { play("paper"); blob && saveCard({ blob, name: h.name }); };
  const onCopy = async () => { play("paper"); await copyText(shareLink(h.id)); toast(COPY.linkCopied); };
  const again = () => { play("page"); reset(); nav("/strand/1"); };

  if (missing) return (
    <Page className="items-center justify-center text-center">
      <p className="f-cg italic text-[22px]">This thread leads nowhere, dearest reader.</p>
      <Link to="/" className="text-link mt-4" data-testid="missing-home-link">{COPY.weaveOwn}</Link>
    </Page>
  );
  if (!h) return <Page className="items-center justify-center"><p className="f-cg italic text-[20px]">Unrolling the parchment…</p></Page>;

  return (
    <Page>
      <header className="flex items-center justify-between h-11">
        <span className="f-mark text-[28px] text-[color:var(--rose)] leading-none">{COPY.wordmark}</span>
        <div className="flex items-center -mr-2">
          <SoundToggle />
          <Link to="/" aria-label="Close" data-testid="close-button" className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-[color:var(--wisteria)]">
            <X className="w-6 h-6" strokeWidth={1.5} />
          </Link>
        </div>
      </header>
      <p className="f-sc text-center text-[13px] text-[color:#5A3D34] mt-1">{isPublic ? COPY.readyPublic : COPY.ready}</p>
      <Cameo h={h} />
      <p className="f-cg italic text-center text-[18px] mt-3 mb-5">
        {COPY.biceps[0]}<span className="hl">{COPY.biceps[1]}</span>{COPY.biceps[2]}
      </p>
      <VowsCard h={h} setH={setH} canEdit={mine} />
      <div className="space-y-3 mt-6">
        {isPublic ? (
          <Pill data-testid="weave-your-own-button" onClick={again}>{COPY.weaveOwn}</Pill>
        ) : (
          <>
            <CardPreview url={url} name={h.name} onOpen={() => setReveal(true)} />
            <button data-testid="share-him-button" onClick={() => setReveal(true)} className="pill pill-primary">
              <Share className="w-5 h-5" strokeWidth={1.8} /><span>{COPY.share}</span>
            </button>
            <button data-testid="in-your-life-button" onClick={() => { play("page"); nav(`/tell/${h.id}`); }} className="pill pill-secondary">{COPY.inLife}</button>
            <div className="text-center"><button data-testid="weave-another-link" onClick={again} className="text-link">{COPY.again}</button></div>
          </>
        )}
      </div>
      <ShareReveal open={reveal} onClose={() => setReveal(false)} name={h.name} url={url}
        onSave={onSave} onShare={onShare} onCopy={onCopy} isIOS={isIOS()} />
      {isPublic && <p className="f-cg italic text-center text-[14px] text-[color:#6b4f45] mt-6"><Credit text={CONFIG.CREDIT_LINE} /></p>}
      {!isPublic && fallback && (
        <div aria-hidden className="fixed top-0 pointer-events-none" style={{ left: -20000 }}>
          <ShareCard ref={ref} husband={h} fontsReady={fontsReady} />
        </div>
      )}
    </Page>
  );
}
