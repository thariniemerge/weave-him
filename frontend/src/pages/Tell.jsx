import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Page, Art, Chip } from "../components/weave/ui";
import { COPY, RECIPIENTS } from "../content";
import { cachedHusband, getHusband, shareLink } from "../lib/api";
import { copyText } from "../lib/card";
import { play } from "../lib/sound";
import { SoundToggle } from "../components/weave/ui";

const STRAND_TINTS = ["var(--peony)", "var(--wisteria)", "var(--ochre)", "var(--sage)", "var(--wedgwood)"];
const greetingFor = (to, his) => {
  const n = his.trim();
  if (!n) return to.greeting;
  return to.id === "partner" ? `My love, ${n},` : `Dear ${n},`;
};
const isMobile = () => /iphone|ipad|android|mobile/i.test(navigator.userAgent);

const Letter = ({ greeting, sentence, name, setName }) => (
  <section className="stitch-card overflow-hidden mt-6" data-testid="letter-preview">
    <Art name="letter-header" className="w-full block" />
    <Art name="stamp" className="absolute right-3 top-2 w-[74px] rotate-3 drop-shadow-md" />
    <div className="px-7 pt-4 pb-7">
      <p data-testid="letter-greeting" className="f-mark text-[40px] leading-none text-[color:var(--rose)]">{greeting}</p>
      <p className="f-body text-[18px] leading-[1.6] mt-3">
        {COPY.letterBody(sentence)[0]}
        <span className="hl font-semibold" data-testid="letter-strand">{sentence}</span>
        {COPY.letterBody(sentence)[2]}
      </p>
      <p className="f-cg italic text-[19px] mt-4" data-testid="letter-sign-off">{COPY.withLove}</p>
      <input data-testid="signature-input" value={name} maxLength={30} onChange={(e) => setName(e.target.value)} placeholder={COPY.herName}
        aria-label="Your name" className="w-full min-h-[44px] bg-transparent outline-none f-cg italic text-[22px] border-b border-dotted border-[color:var(--peony)] placeholder:text-[color:#8a6f64] placeholder:text-[18px]" />
    </div>
  </section>
);

export default function Tell() {
  const { id } = useParams();
  const nav = useNavigate();
  const [h, setH] = useState(() => cachedHusband(id) || null);
  const [to, setTo] = useState(RECIPIENTS[0]);
  const [strand, setStrand] = useState(0);
  const [name, setName] = useState("");
  const [his, setHis] = useState("");
  useEffect(() => { if (!h) getHusband(id).then(setH).catch(() => nav("/")); }, [id, h, nav]);
  if (!h) return <Page className="items-center justify-center"><p className="f-cg italic text-[20px]">Finding his strands…</p></Page>;

  const sentence = h.threads[strand]?.sentence || "";
  const link = shareLink(h.id);
  const greeting = greetingFor(to, his);
  const body = [greeting, COPY.letterBody(sentence).join(""), COPY.withLove, name.trim()].filter(Boolean).join("\n");
  const sendText = async () => {
    play("paper");
    if (navigator.share) {
      try { await navigator.share({ text: `${body}\n${link}` }); return; } catch (e) { if (e.name === "AbortError") return; }
    }
    const msg = encodeURIComponent(`${body}\n${link}`);
    window.location.href = isMobile() ? `sms:?&body=${msg}` : `https://wa.me/?text=${msg}`;
  };
  const copy = async () => { play("paper"); await copyText(link); toast(COPY.linkCopied); };

  return (
    <Page>
      <button data-testid="back-button" aria-label="Back" onClick={() => { play("page"); nav(`/meet/${h.id}`); }} className="w-11 h-11 -ml-2 flex items-center justify-center rounded-full hover:bg-[color:var(--wisteria)]">
        <ChevronLeft className="w-6 h-6" strokeWidth={1.6} />
      </button>
      <Art name="corner-wedgwood" className="absolute right-0 top-0 w-20 pointer-events-none" />
      <SoundToggle className="absolute right-3 top-5 z-10 bg-[color:var(--paper)]/70" />
      <h1 className="f-cg font-bold text-[34px] leading-tight mt-2">
        {COPY.tellTitle[0]}<span className="italic text-[color:var(--rose)]">{COPY.tellTitle[1]}</span>
      </h1>
      <p className="f-cg italic text-[18px] leading-snug text-[color:#4a3029] mt-1">{COPY.tellSub}</p>
      <p className="f-sc text-[13px] mt-5 mb-2">{COPY.sendTo}</p>
      <div className="flex flex-wrap gap-2.5">
        {RECIPIENTS.map((r) => (
          <Chip key={r.id} data-testid={`recipient-${r.id}`} active={to.id === r.id} tint={r.tint} onClick={() => { play("pluck"); setTo(r); }}
            className={`f-body font-semibold text-[17px] min-w-[96px] ${to.id === r.id && r.id === "partner" ? "text-[color:var(--parchment)]" : ""}`}>
            {r.label}
          </Chip>
        ))}
      </div>
      <p className="f-sc text-[13px] mt-5 mb-2">{COPY.strandGave}</p>
      <div className="flex flex-wrap gap-2.5">
        {h.threads.map((t, i) => (
          <Chip key={i} data-testid={`strand-chip-${i}`} active={strand === i} tint={STRAND_TINTS[i % 5]} onClick={() => { play("pluck", { rate: 0.9 + (i % 5) * 0.07 }); setStrand(i); }}
            className="f-cg italic text-[17px]">
            <span className="flex items-center gap-2">{strand === i && <Art name="heart" className="w-5 h-5" />}{t.label}</span>
          </Chip>
        ))}
      </div>
      <label className="block mt-5" htmlFor="his-name">
        <span className="f-sc text-[12px] text-[color:#5A3D34]">{COPY.hisName}</span>
        <input id="his-name" data-testid="his-name-input" value={his} maxLength={30} onChange={(e) => setHis(e.target.value)}
          className="mt-1 w-full min-h-[44px] px-4 rounded-full bg-[color:var(--paper)] border border-dashed border-[color:#b8956a] outline-none f-cg italic text-[18px]" />
      </label>
      <Letter greeting={greeting} sentence={sentence} name={name} setName={setName} />
      <button data-testid="send-text-button" onClick={sendText} className="pill pill-primary mt-6">
        <MessageCircle className="w-5 h-5" strokeWidth={1.8} /><span>{COPY.sendText}</span>
      </button>
      <div className="text-center mt-2"><button data-testid="copy-link-button" onClick={copy} className="text-link">{COPY.copyLink}</button></div>
    </Page>
  );
}
