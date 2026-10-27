import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROMAN } from "../../content";
import { Art, SoundToggle } from "./ui";
import { play } from "../../lib/sound";
import { PanelArt } from "./Layout";
import { BuildingHusband } from "./PanelFigures";

export const HeartsRow = ({ current, done, size = "w-[22px]" }) => (
  <div className="flex items-center gap-[3px]" data-testid="hearts-progress">
    {[1, 2, 3, 4, 5, 6, 7].map((n) => (
      <Art key={n} name={n <= done ? "heart-done" : n === current ? "heart-now" : "heart-empty"}
        className={`${n === current ? "w-[30px]" : size} transition-transform duration-300`} />
    ))}
  </div>
);

export const StrandHeader = ({ n, back }) => {
  const nav = useNavigate();
  return (
    <header className="flex items-center justify-between h-12 mb-3 relative z-10">
      <PanelArt><BuildingHusband done={n - 1} /></PanelArt>
      <button data-testid="back-button" aria-label="Back" onClick={() => { play("page"); back ? nav(back) : nav(-1); }}
        className="w-11 h-11 -ml-2 flex items-center justify-center rounded-full hover:bg-[color:var(--wisteria)] transition-colors">
        <ChevronLeft className="w-6 h-6" strokeWidth={1.6} />
      </button>
      <HeartsRow current={n} done={n - 1} />
      <div className="flex items-center -mr-2">
        <span data-testid="strand-roman" className="f-sc text-[15px] font-semibold tracking-[0.12em]">{ROMAN[n]}/VII</span>
        <SoundToggle />
      </div>
    </header>
  );
};

export const WovenProgress = ({ done }) => (
  <div data-testid="woven-progress">
    <div className="flex justify-between items-baseline mb-2">
      <span className="f-sc text-[13px]">Your husband so far</span>
      <span className="f-sc text-[13px] text-[color:#5A3D34]">{ROMAN[done] || "None"} of VII strands</span>
    </div>
    <div className="relative h-[22px] rounded-full border border-[color:#8a6a3c] bg-[color:var(--paper)] overflow-hidden"
      style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent 0 9px, rgba(138,106,60,.35) 9px 10px)" }}>
      <div className="wicker-fill absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-out border-r-4 border-[color:var(--rose)]"
        style={{ width: `${Math.max(done / 7, 0.02) * 100}%` }} />
    </div>
  </div>
);
