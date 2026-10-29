import { Volume2, VolumeX } from "lucide-react";
import { setMuted, useMuted } from "../../lib/sound";
import { motion } from "framer-motion";
import { EmergentBadge } from "./Layout";

export const Art = ({ name, className = "", alt = "", ...p }) => (
  <img src={`/art/${name}.svg`} alt={alt} draggable={false} className={`select-none ${className}`} {...p} />
);

// Renders "*word*" as a madder-rose italic accent
export const Accent = ({ text, className = "text-[color:var(--rose)] italic" }) => (
  <>{text.split(/(\*[^*]+\*)/).map((s, i) => (s.startsWith("*") ? <span key={i} className={className}>{s.slice(1, -1)}</span> : s))}</>
);

export const Pill = ({ children, variant = "primary", icon = true, className = "", ...p }) => (
  <button className={`pill pill-${variant} ${className}`} {...p}>
    {icon && variant === "primary" && <Art name="heart" className="w-7 h-7 drop-shadow" />}
    <span>{children}</span>
  </button>
);

// A screen; its enter/leave crossfade comes from PageStack (CSS, transform and opacity only)
export const Page = ({ children, className = "" }) => (
  <main className={`relative min-h-[100dvh] px-6 pt-5 pb-6 flex flex-col ${className}`}>
    {children}
    <div className="flex justify-center mt-6 lg:hidden"><EmergentBadge /></div>
  </main>
);

export const SmallCaps = ({ children, className = "" }) => (
  <p className={`f-sc text-[13px] text-[color:#4A5641] ${className}`}>{children}</p>
);

export const Chip = ({ active, tint = "var(--wisteria)", children, className = "", ...p }) => (
  <button
    className={`min-h-[44px] px-5 rounded-full border transition-[background-color,transform,box-shadow] duration-200 active:scale-[0.97] ${active ? "border-[color:#33402f] text-[color:var(--paper)] shadow-[0_4px_10px_-6px_rgba(38,48,42,.7)]" : "border-dashed border-[color:#9AA38A]"} ${className}`}
    style={{ background: active ? "var(--moss)" : "var(--paper)" }}
    {...p}
  >
    {children}
  </button>
);

export const Credit = ({ text }) => (
  <span className="not-italic">{text.split(/(\*[^*]+\*)/).map((s, i) => (s.startsWith("*") ? <i key={i}>{s.slice(1, -1)}</i> : s))}</span>
);

export const Footer = ({ children }) => (
  <p className="f-cg italic text-center text-[14px] text-[color:#4A3A2E] mt-2">{children}</p>
);

export const SoundToggle = ({ className = "" }) => {
  const muted = useMuted();
  return (
    <button data-testid="sound-toggle" aria-label={muted ? "Turn sound effects on" : "Mute sound effects"} aria-pressed={!muted}
      onClick={() => setMuted(!muted)}
      className={`w-11 h-11 flex items-center justify-center rounded-full text-[color:var(--ink)] hover:bg-[color:var(--wisteria)] transition-colors ${className}`}>
      {muted ? <VolumeX className="w-5 h-5" strokeWidth={1.5} /> : <Volume2 className="w-5 h-5" strokeWidth={1.5} />}
    </button>
  );
};
