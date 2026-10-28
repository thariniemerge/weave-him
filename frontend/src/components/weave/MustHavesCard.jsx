import { COPY } from "../../content";

// Meet him: every one of her must-haves, ticked, because he was woven to order
export const MustHavesCard = ({ musts, name }) => (
  <section className="parchment-card rounded-[12px] px-5 pt-4 pb-4 mt-5" data-testid="musts-checklist">
    <p className="f-sc text-center text-[15px] tracking-[0.12em]">{COPY.mustsCard}</p>
    <p className="f-cg italic text-center text-[15px] text-[color:#4A5641] -mt-0.5">{COPY.mustsCardSub}</p>
    <ul className="mt-3 space-y-1.5">
      {musts.map((m, i) => (
        <li key={i} className="flex items-start gap-2.5 f-cg text-[17px] leading-snug" data-testid={`musts-checklist-item-${i}`}>
          <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center bg-[color:#4A5641] text-[color:#F1ECE1] text-[13px] font-bold mt-0.5" aria-label={`${name} has this`}>✓</span>
          <span>{m.label}</span>
        </li>
      ))}
    </ul>
  </section>
);
