import { COPY } from "../../content";

export const CardPreview = ({ url, name, onOpen }) => (
  <button data-testid="card-thumbnail" onClick={onOpen}
    className="w-full flex items-center gap-4 p-3 rounded-2xl border border-dashed border-[color:#b8956a] bg-[color:var(--paper)]/70 text-left transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_20px_-12px_rgba(58,36,32,.6)]">
    <div className="w-[64px] shrink-0 rounded-md overflow-hidden ring-1 ring-[color:var(--gold)] shadow-[0_6px_14px_-6px_rgba(33,21,15,.8)] bg-[#21150f]" style={{ aspectRatio: "9 / 16" }}>
      {url ? <img src={url} alt={`${name}'s story card`} className="w-full h-full object-cover" /> : <div className="w-full h-full animate-pulse bg-[#3a2a20]" />}
    </div>
    <div>
      <p className="f-sc text-[14px] font-semibold">{COPY.cardThumb}</p>
      <p className="f-cg italic text-[16px] text-[color:#5A3D34]">{COPY.cardThumbSub}</p>
    </div>
  </button>
);
