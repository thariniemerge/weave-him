import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

// Readable bands stitched across his wicker chest, one per pick, in tap order
const TOPS = ["50%", "64%", "78%"];

export const StitchedBands = ({ picked }) => {
  const reduce = useReducedMotion();
  return (
    <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none" aria-hidden data-testid="stitched-bands">
      <AnimatePresence>
        {picked.map((l, i) => (
          <motion.div key={l} data-testid={`stitched-band-${i + 1}`}
            className="absolute left-1/2 w-[118%] -ml-[59%] lg:w-[90%] lg:-ml-[45%] h-[22px] lg:h-[30px] rounded-full flex items-center justify-center border-y border-dashed shadow-[0_2px_4px_rgba(30,10,14,.35)] origin-left"
            style={{ top: TOPS[i], background: "rgba(94,42,52,.94)", borderColor: "rgba(241,236,225,.6)" }}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}>
            <span className="f-cg font-semibold uppercase text-[12px] lg:text-[15px] tracking-[0.08em] text-[color:#F1ECE1] leading-none whitespace-nowrap">{l}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
