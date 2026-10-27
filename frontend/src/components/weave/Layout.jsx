import { createContext, useContext, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Art } from "./ui";

export const useMedia = (q) => useSyncExternalStore(
  (f) => { const m = window.matchMedia(q); m.addEventListener("change", f); return () => m.removeEventListener("change", f); },
  () => window.matchMedia(q).matches,
);
export const useDesktop = () => useMedia("(min-width: 1024px)");

const PanelCtx = createContext(null);

// On desktop, renders its art into the sticky left panel; otherwise inline
export const PanelOrInline = ({ children }) => {
  const el = useContext(PanelCtx);
  const desk = useDesktop();
  if (!desk) return children;
  return el ? createPortal(<div className="w-full">{children}</div>, el) : null;
};
// Desktop-only art for the panel (nothing on phones)
export const PanelArt = ({ children }) => {
  const el = useContext(PanelCtx);
  return useDesktop() && el ? createPortal(<div className="w-full">{children}</div>, el) : null;
};

export const EmergentBadge = ({ fixed = false }) => (
  <a href="https://emergent.sh" target="_blank" rel="noopener" data-testid={fixed ? "emergent-badge-fixed" : "emergent-badge"}
    className={`${fixed ? "hidden lg:inline-flex fixed bottom-4 left-4 z-40" : "inline-flex lg:hidden"} items-center gap-2 h-9 pl-1.5 pr-4 rounded-full bg-[color:var(--paper)] border border-[color:var(--gold)] text-[color:var(--ink)] shadow-[0_6px_14px_-10px_rgba(58,36,32,.6)] transition-transform duration-200 hover:-translate-y-0.5`}>
    <img src="/assets/emergent-logo.png" alt="" className="w-6 h-6 rounded-full" />
    <span className="f-sc text-[13px] font-semibold tracking-[0.06em]">Built with Emergent</span>
  </a>
);

const Ornaments = () => (
  <div className="hidden md:block pointer-events-none fixed inset-0 z-0" aria-hidden>
    <Art name="corner-ochre" className="absolute -top-6 -left-6 w-[min(26vw,360px)] opacity-30" />
    <Art name="corner-wedgwood" className="absolute -top-6 -right-6 w-[min(26vw,360px)] opacity-30" />
    <Art name="corner-ochre" className="absolute -bottom-6 -right-6 w-[min(26vw,360px)] opacity-25 rotate-180" />
    <Art name="corner-wedgwood" className="absolute -bottom-6 -left-6 w-[min(26vw,360px)] opacity-25 rotate-180" />
    <div className="lg:hidden">
      <Art name="floral-card" className="absolute left-3 top-[42%] w-[9vw] opacity-60" />
      <Art name="hoop-small" className="absolute right-3 top-[52%] w-[8vw] opacity-50" />
      <Art name="floral-card" className="absolute right-4 top-[22%] w-[7vw] opacity-50 -scale-x-100" />
    </div>
  </div>
);

export function Layout({ children }) {
  const desk = useDesktop();
  const [panel, setPanel] = useState(null);
  return (
    <PanelCtx.Provider value={panel}>
      <Ornaments />
      {desk ? (
        <div className="relative z-10 grid grid-cols-2 min-h-[100dvh]" data-testid="desktop-layout">
          <aside className="sticky top-0 h-[100dvh] flex items-center justify-center px-[5vw] py-10" data-testid="art-panel">
            <div ref={setPanel} className="relative w-full max-w-[min(640px,80vh)] flex flex-col items-center" />
          </aside>
          <div className="flex justify-center px-8">
            <div className="desk-col w-full max-w-[560px] min-h-[100dvh] flex flex-col justify-center">{children}</div>
          </div>
        </div>
      ) : (
        <div className="relative z-10 mx-auto w-full max-w-[430px] md:max-w-[572px] tablet-col overflow-x-hidden">{children}</div>
      )}
      <EmergentBadge fixed />
    </PanelCtx.Provider>
  );
}
