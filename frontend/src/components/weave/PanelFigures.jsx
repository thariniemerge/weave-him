import { Medallion } from "./Medallion";
import { useAnswers } from "../../lib/store";
import { resolveChoices } from "../../lib/weave";
import { ROMAN } from "../../content";

// Desktop panel: the husband woven bottom-up as she answers
export const BuildingHusband = ({ done }) => {
  const { answers } = useAnswers();
  const picks = ["q3", "q1", "q4", "q2"].map((k) => resolveChoices(k, answers[k]));
  const band = [...picks.map((l) => l[0]), ...picks.flatMap((l) => l.slice(1))].filter(Boolean).map((o) => o.band);
  return (
    <div className="w-full" data-testid="building-husband">
      <div className="w-full max-w-[440px] mx-auto">
        <Medallion band={band} strands={done} finished={false} label="Your wicker husband, part-woven" />
      </div>
      <p className="f-sc text-center text-[16px] mt-4 text-[color:#F1ECE1]">
        {done ? `${ROMAN[done]} of VII strands woven` : "The basketmaker awaits the first strand"}
      </p>
    </div>
  );
};
