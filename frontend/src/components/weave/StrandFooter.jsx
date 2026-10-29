import { STRAND_FOOTERS } from "../../content";

// The two-line aside under each strand: an italic setup, then the highlighted punchline
export const StrandFooter = ({ n }) => {
  const f = STRAND_FOOTERS[n];
  if (!f) return null;
  return (
    <div data-testid="strand-footer" className="relative text-center mt-5 mb-4 lg:order-last lg:mt-4 [@media(max-height:820px)]:lg:hidden">
      <p data-testid="strand-footer-setup" className="f-cg italic text-[17px]">{f.footerSetup}</p>
      <p className="f-cg italic text-[17px]"><span data-testid="strand-footer-punch" className="hl">{f.footerPunch}</span></p>
    </div>
  );
};
