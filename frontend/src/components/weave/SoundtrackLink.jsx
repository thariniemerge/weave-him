import { soundtrackUrl } from "../../soundtrack";

// A plain text link out to the official soundtrack (opens in a new tab)
export const SoundtrackLink = ({ text, testid, className = "" }) => {
  const url = soundtrackUrl();
  if (!url) return null;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" data-testid={testid} aria-label="Open the Wicker soundtrack in a new tab"
      className={`block f-cg italic text-center text-[15px] leading-snug text-[color:#4A5641] underline decoration-1 underline-offset-4 decoration-[color:#9AA38A] hover:text-[color:var(--ink)] transition-colors duration-200 ${className}`}>
      <span aria-hidden className="not-italic mr-1">♪</span>{text}
    </a>
  );
};
