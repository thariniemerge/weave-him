import { Art } from "./ui";
import { BandText } from "./BandText";
import { Face } from "./Face";
import { useAnswers } from "../../lib/store";
import { resolveChoices } from "../../lib/weave";
import { ROMAN } from "../../content";

// Desktop panel: the husband woven bottom-up as she answers
export const BuildingHusband = ({ done }) => {
  const { answers } = useAnswers();
  const picks = ["q3", "q1", "q4", "q2"].map((k) => resolveChoices(k, answers[k]));
  const band = [...picks.map((l) => l[0]), ...picks.flatMap((l) => l.slice(1))].filter(Boolean).map((o) => o.band);
  const pct = 22 + (done / 7) * 78;
  return (
    <div className="w-full" data-testid="building-husband">
      <div className="relative w-full" style={{ aspectRatio: "278 / 260" }}>
        <Art name="meet-cameo" className="absolute inset-0 w-full h-full opacity-[0.16] grayscale" />
        <div className="absolute inset-0 transition-[clip-path] duration-700 ease-out" style={{ clipPath: `inset(${100 - pct}% 0 0 0)` }}>
          <Art name="meet-cameo" className="absolute inset-0 w-full h-full" alt="Your wicker husband, part-woven" />
          {band.length > 0 && <BandText band={band} kind="cameo" />}
        </div>
        <Face kind="cameo" show={done >= 5} />
      </div>
      <p className="f-sc text-center text-[16px] mt-4 text-[color:#5A3D34]">
        {done ? `${ROMAN[done]} of VII strands woven` : "The basketmaker awaits the first strand"}
      </p>
    </div>
  );
};
