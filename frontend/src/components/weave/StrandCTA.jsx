import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Pill } from "./ui";
import { useDesktop } from "./Layout";

// Desktop: directly under the card. Phone/tablet: a fixed, safe-area aware bar so it's always in view.
export const StrandCTA = ({ children, ...props }) => {
  const desk = useDesktop();
  const btn = <Pill {...props}>{children}</Pill>;
  if (desk) return <div className="mt-5">{btn}</div>;
  return (
    <>
      <div className="h-[112px] shrink-0" aria-hidden />
      {createPortal(
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          className="fixed inset-x-0 bottom-0 z-30 pointer-events-none" data-testid="strand-cta-bar">
          <div className="mx-auto w-full max-w-[430px] md:max-w-[640px] px-6 pt-6 pointer-events-auto"
            style={{ paddingBottom: "calc(14px + env(safe-area-inset-bottom))", background: "linear-gradient(to top, var(--parchment) 62%, rgba(246,239,228,0))" }}>
            {btn}
          </div>
        </motion.div>,
        document.body,
      )}
    </>
  );
};
