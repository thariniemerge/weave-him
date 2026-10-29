import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { X, Share } from "lucide-react";
import { Page, Pill, SoundToggle } from "../components/weave/ui";
import { PanelOrInline, FallingLeaves } from "../components/weave/Layout";
import { VowsCard } from "../components/weave/VowsCard";
import { MustHavesCard } from "../components/weave/MustHavesCard";
import { CardPreview } from "../components/weave/CardPreview";
import { play } from "../lib/sound";
import { SoundtrackLink } from "../components/weave/SoundtrackLink";
import { ShareCard } from "../components/weave/ShareCard";
import { COPY } from "../content";
import { cachedHusband, getCardBlob, getHusband, isMine, shareLink, upgradeVows, rememberHusband } from "../lib/api";
import { peekLateDraft, dropLateDraft } from "../lib/vowDraft";
import { renderCard, shareCard, saveCard, saveVideo, loadCardFonts, copyText, isIOS } from "../lib/card";
import { makeCardVideo, canMakeVideo } from "../lib/cardVideo";
import { ShareReveal } from "../components/weave/ShareReveal";
import { toast } from "sonner";
import { useAnswers } from "../lib/store";
import { Medallion } from "../components/weave/Medallion";
import { emote, preloadFrames, framesLoaded } from "../lib/face";
import { motion, useReducedMotion } from "framer-motion";

export const Cameo = ({ h, alive = false }) => (
  <div className="w-full max-w-[330px] lg:max-w-[440px] mx-auto" data-testid="meet-cameo">
    <Medallion woven name={h.name} band={h.band} portrait={h.portrait} alive={alive} />
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
  const reduce = useReducedMotion();
  const { reset } = useAnswers();
  const [h, setH] = useState(() => cachedHusband(id) || null);
  const [missing, setMissing] = useState(false);
  const { ref, blob, url, fallback, fontsReady } = useCard(h, !isPublic);
  const mine = !isPublic && isMine(id);

  useEffect(() => { if (!h) getHusband(id).then(setH).catch(() => setMissing(true)); }, [id, h]);
  // AI vows that missed the weave can still replace the template ones if they land within 20s
  useEffect(() => {
    if (!mine || h?.vows_source !== "template") return;
    const d = peekLateDraft(id);
    if (!d) return;
    let live = true;
    d.promise.then((draft) => {
      if (!live || !draft || Date.now() - d.at > 20000) return;
      upgradeVows(id, draft).then((nh) => { dropLateDraft(id); rememberHusband(nh); if (live) setH(nh); }).catch(() => dropLateDraft(id));
    });
    return () => { live = false; };
  }, [h?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  // all nine of his expression frames are decoded before he appears, so nothing flashes or swaps late
  const [framesReady, setFramesReady] = useState(() => !!h && framesLoaded(h.portrait));
  useEffect(() => { if (h) preloadFrames(h.portrait).then(() => setFramesReady(true)); }, [h?.portrait]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (isPublic && h) document.title = `Meet ${h.name} · Weave Him`; }, [h, isPublic]);
  useEffect(() => {
    if (!h?.id || !framesReady) return;
    play("harp");
    const t = setTimeout(() => emote("blush"), 1000);
    return () => clearTimeout(t);
  }, [h?.id, framesReady]);

  const [reveal, setReveal] = useState(false);
  const onShare = () => { blob && shareCard({ blob, name: h.name, link: shareLink(h.id) }); };
  const onSave = () => { blob && saveCard({ blob, name: h.name }); };
  const onCopy = async () => { await copyText(shareLink(h.id)); toast(COPY.linkCopied); };
  const [video, setVideo] = useState(null);
  const onVideo = async () => {
    if (!blob || video != null) return;
    setVideo(0);
    try { await saveVideo({ blob: await makeCardVideo(blob, h.portrait, setVideo), name: h.name, link: shareLink(h.id) }); }
    catch { toast(COPY.videoError); }
    finally { setVideo(null); }
  };
  const again = () => { reset(); nav("/strand/1"); };

  if (missing) return (
    <Page className="items-center justify-center text-center">
      <p className="f-cg italic text-[22px]">This thread leads nowhere, dearest reader.</p>
      <Link to="/" className="text-link mt-4" data-testid="missing-home-link">{COPY.weaveOwn}</Link>
    </Page>
  );
  if (!h || !framesReady) return <Page className="items-center justify-center"><p className="f-cg italic text-[20px]">Unrolling the parchment…</p></Page>;

  return (
    <Page>
      <FallingLeaves />
      <header className="flex items-center justify-between h-11">
        <span className="f-mark text-[28px] text-[color:var(--rose)] leading-none">{COPY.wordmark}</span>
        <div className="flex items-center -mr-2">
          <SoundToggle />
          <Link to="/" aria-label="Close" data-testid="close-button" className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-[color:var(--wisteria)]">
            <X className="w-6 h-6" strokeWidth={1.5} />
          </Link>
        </div>
      </header>
      <p className="f-sc text-center text-[13px] text-[color:#4A5641] mt-1">{isPublic ? COPY.readyPublic : COPY.ready}</p>
      <PanelOrInline forest>
        <motion.div initial={reduce ? false : { opacity: 0, y: 28, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
          <Cameo h={h} alive />
        </motion.div>
      </PanelOrInline>
      <p className="f-cg italic text-center text-[18px] mt-1 mb-5">
        {COPY.biceps[0]}<span className="hl">{COPY.biceps[1]}</span>{COPY.biceps[2]}
      </p>
      <VowsCard h={h} setH={setH} canEdit={mine} />
      {h.musts?.length > 0 && (
        <motion.div initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduce ? 0 : 5, duration: 0.5 }}>
          <MustHavesCard musts={h.musts} name={h.name} />
        </motion.div>
      )}
      <motion.div className="space-y-3 mt-6" initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduce ? 0 : 5.4, duration: 0.5 }}>
        <SoundtrackLink text={COPY.soundtrackMeet} testid="soundtrack-link-meet" />
        {isPublic ? (
          <>
            <p data-testid="village-talking" className="f-cg italic text-center text-[15px] text-[color:var(--rose)] opacity-80">{COPY.villageTalking}</p>
            <Pill data-testid="weave-your-own-button" onClick={again}>{COPY.weaveOwn}</Pill>
          </>
        ) : (
          <>
            <CardPreview url={url} name={h.name} onOpen={() => setReveal(true)} />
            <p data-testid="village-talking" className="f-cg italic text-center text-[15px] text-[color:var(--rose)] opacity-80">{COPY.villageTalking}</p>
            <button data-testid="share-him-button" onClick={() => { emote("blush"); setReveal(true); }} className="pill pill-primary">
              <Share className="w-5 h-5" strokeWidth={1.8} /><span>{COPY.share}</span>
            </button>
            <button data-testid="in-your-life-button" onClick={() => { nav(`/tell/${h.id}`); }} className="pill pill-secondary">{COPY.inLife}</button>
            <div className="text-center"><button data-testid="weave-another-link" onClick={again} className="text-link">{COPY.again}</button></div>
          </>
        )}
      </motion.div>
      <ShareReveal open={reveal} onClose={() => setReveal(false)} name={h.name} url={url}
        onSave={onSave} onShare={onShare} onCopy={onCopy} isIOS={isIOS()}
        onVideo={canMakeVideo() ? onVideo : null} video={video} />
      {!isPublic && fallback && (
        <div aria-hidden className="fixed top-0 pointer-events-none" style={{ left: -20000 }}>
          <ShareCard ref={ref} husband={h} fontsReady={fontsReady} />
        </div>
      )}
    </Page>
  );
}
