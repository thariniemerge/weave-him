import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { X, Share } from "lucide-react";
import { Page, Pill, Art } from "../components/weave/ui";
import { ShareCard } from "../components/weave/ShareCard";
import { COPY, CONFIG, ROMAN } from "../content";
import { cachedHusband, getHusband, isMine, shareLink, uploadCard } from "../lib/api";
import { renderCard, shareCard } from "../lib/card";
import { useAnswers } from "../lib/store";
import { useFitText } from "../hooks/useFitText";

const BAND_POS = [{ top: "64.2%", w: "38%" }, { top: "71%", w: "44%" }, { top: "77.8%", w: "48%" }];

export const BandLine = ({ text, pos, i, max = 9 }) => {
  const [ref] = useFitText([text], { max, min: 7, step: 0.5, width: "auto" });
  return (
    <div ref={ref} data-testid={`band-line-${i}`} className="absolute left-1/2 -translate-x-1/2 text-center f-sc font-semibold text-[color:#f3e3c4] whitespace-nowrap overflow-hidden leading-none"
      style={{ top: pos.top, width: pos.w, letterSpacing: "0.12em" }}>{text}</div>
  );
};

export const Cameo = ({ h }) => (
  <div className="relative w-full" style={{ aspectRatio: "278 / 260" }} data-testid="meet-cameo">
    <Art name="meet-cameo" className="absolute inset-0 w-full h-full" alt={`${h.name}, a wicker husband`} />
    {h.band.map((b, i) => <BandLine key={i} i={i} text={b} pos={BAND_POS[i]} />)}
    <p data-testid="ribbon-name" className="absolute left-0 right-0 text-center f-cg italic font-semibold text-[26px] text-[color:var(--parchment)] leading-none" style={{ top: "86.6%" }}>
      meet {h.name}
    </p>
  </div>
);

const Vows = ({ h }) => (
  <section className="stitch-card overflow-hidden pb-6" data-testid="vows-card">
    <Art name="vow-strip" className="w-full block" />
    <div className="px-7 pt-4">
      <p className="f-sc text-center text-[13px] text-[color:#5A3D34]" data-testid="vows-number">{COPY.vowsNo} [{h.number}]</p>
      <p className="f-cg italic text-center text-[19px] text-[color:var(--rose)]">{COPY.dearest}</p>
      <div className="flex items-center justify-center gap-2 my-2 text-[color:var(--rose)]">
        <span className="h-0 w-16 border-t-2 border-dashed border-current opacity-70" /><Art name="heart" className="w-5 h-5" /><span className="h-0 w-16 border-t-2 border-dashed border-current opacity-70" />
      </div>
      <ol className="space-y-3.5 mt-3">
        {h.vows.map((v, i) => (
          <li key={i} className="flex gap-4 items-baseline" data-testid={`vow-${i + 1}`}>
            <span className="f-mark text-[22px] text-[color:var(--rose)] w-8 shrink-0 text-right leading-none">{ROMAN[i + 1]}</span>
            <span className="f-cg text-[18px] leading-snug font-medium">{v}</span>
          </li>
        ))}
      </ol>
      <div className="flex items-end justify-between mt-5">
        <div>
          <p className="f-cg italic text-[16px]">{COPY.yours}</p>
          <p data-testid="signature-name" className="f-mark text-[46px] leading-none text-[color:#8a2f42] border-b border-[color:var(--gold)] pb-1 pr-4">{h.name}</p>
        </div>
        <Art name="wax-seal" className="w-[70px] -rotate-6 mr-[-6px]" />
      </div>
    </div>
  </section>
);

function useCardPng(h, isOwner) {
  const ref = useRef(null);
  const [fontsReady, setFontsReady] = useState(false);
  const [blob, setBlob] = useState(null);
  useEffect(() => { document.fonts.ready.then(() => setFontsReady(true)); }, []);
  useEffect(() => {
    if (!h || !fontsReady || !ref.current) return;
    let live = true;
    const t = setTimeout(() => renderCard(ref.current).then((b) => {
      if (!live || !b) return;
      setBlob(b);
      const k = `card-up-${h.id}`;
      if (isOwner && !sessionStorage.getItem(k)) uploadCard(h.id, b).then(() => sessionStorage.setItem(k, "1")).catch(() => {});
    }).catch(() => {}), 150);
    return () => { live = false; clearTimeout(t); };
  }, [h, fontsReady, isOwner]);
  return { ref, blob, fontsReady };
}

export default function Meet({ isPublic = false }) {
  const { id } = useParams();
  const nav = useNavigate();
  const { reset } = useAnswers();
  const [h, setH] = useState(() => cachedHusband(id) || null);
  const [missing, setMissing] = useState(false);
  const [busy, setBusy] = useState(false);
  const { ref, blob, fontsReady } = useCardPng(isPublic ? null : h, isMine(id));

  useEffect(() => { if (!h) getHusband(id).then(setH).catch(() => setMissing(true)); }, [id, h]);
  useEffect(() => { if (h) document.title = `Meet ${h.name} · Weave Him`; }, [h]);

  const onShare = async () => {
    setBusy(true);
    try { await shareCard({ blob: blob || (await renderCard(ref.current)), name: h.name, link: shareLink(h.id) }); }
    finally { setBusy(false); }
  };
  const again = () => { reset(); nav("/strand/1"); };

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
        <Link to="/" aria-label="Close" data-testid="close-button" className="w-11 h-11 -mr-2 flex items-center justify-center rounded-full hover:bg-[color:var(--wisteria)]">
          <X className="w-6 h-6" strokeWidth={1.5} />
        </Link>
      </header>
      <p className="f-sc text-center text-[13px] text-[color:#5A3D34] mt-1">{isPublic ? COPY.readyPublic : COPY.ready}</p>
      <Cameo h={h} />
      <p className="f-cg italic text-center text-[18px] mt-3 mb-5">
        {COPY.biceps[0]}<span className="hl">{COPY.biceps[1]}</span>{COPY.biceps[2]}
      </p>
      <Vows h={h} />
      <div className="space-y-3 mt-6">
        {isPublic ? (
          <Pill data-testid="weave-your-own-button" onClick={again}>{COPY.weaveOwn}</Pill>
        ) : (
          <>
            <button data-testid="share-him-button" onClick={onShare} disabled={busy} className="pill pill-primary">
              <Share className="w-5 h-5" strokeWidth={1.8} /><span>{busy ? COPY.pressing : COPY.share}</span>
            </button>
            <button data-testid="in-your-life-button" onClick={() => nav(`/tell/${h.id}`)} className="pill pill-secondary">{COPY.inLife}</button>
            <div className="text-center"><button data-testid="weave-another-link" onClick={again} className="text-link">{COPY.again}</button></div>
          </>
        )}
      </div>
      {isPublic && <p className="f-cg italic text-center text-[14px] text-[color:#6b4f45] mt-6">{CONFIG.CREDIT_LINE}</p>}
      {!isPublic && (
        <div aria-hidden className="fixed top-0 pointer-events-none" style={{ left: -20000 }}>
          <ShareCard ref={ref} husband={h} fontsReady={fontsReady} />
        </div>
      )}
    </Page>
  );
}
