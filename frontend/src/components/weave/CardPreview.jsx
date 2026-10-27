import { useState } from "react";
import { Download, Share } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../ui/dialog";
import { COPY } from "../../content";

export const CardPreview = ({ url, name, onShare, onSave, busy }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button data-testid="card-thumbnail" onClick={() => setOpen(true)} disabled={!url}
        className="w-full flex items-center gap-4 p-3 rounded-2xl border border-dashed border-[color:#b8956a] bg-[color:var(--paper)]/70 text-left transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_20px_-12px_rgba(58,36,32,.6)] disabled:opacity-70">
        <div className="w-[64px] shrink-0 rounded-md overflow-hidden ring-1 ring-[color:var(--gold)] shadow-[0_6px_14px_-6px_rgba(33,21,15,.8)] bg-[#21150f]" style={{ aspectRatio: "9 / 16" }}>
          {url ? <img src={url} alt={`${name}'s story card`} className="w-full h-full object-cover" /> : <div className="w-full h-full animate-pulse bg-[#3a2a20]" />}
        </div>
        <div>
          <p className="f-sc text-[14px] font-semibold">{COPY.cardThumb}</p>
          <p className="f-cg italic text-[16px] text-[color:#5A3D34]">{url ? COPY.cardThumbSub : COPY.pressing}</p>
        </div>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-testid="card-lightbox" className="max-w-[430px] w-[92vw] p-4 bg-[#21150f] border-[color:var(--gold)] text-[color:var(--parchment)]">
          <DialogTitle className="sr-only">{name}'s story card</DialogTitle>
          <DialogDescription className="sr-only">Preview of the 1080 by 1920 share card</DialogDescription>
          <img src={url} alt={`${name}'s story card`} className="mx-auto h-[min(70dvh,640px)] w-auto rounded-lg" data-testid="card-lightbox-image" />
          <div className="grid grid-cols-2 gap-3 mt-3">
            <button data-testid="card-save-button" onClick={onSave} className="pill pill-secondary !min-h-[48px] !text-[18px]">
              <Download className="w-5 h-5" strokeWidth={1.6} /><span>{COPY.saveImage}</span>
            </button>
            <button data-testid="card-share-button" onClick={onShare} disabled={busy} className="pill pill-primary !min-h-[48px] !text-[18px]">
              <Share className="w-5 h-5" strokeWidth={1.8} /><span>{COPY.shareShort}</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
