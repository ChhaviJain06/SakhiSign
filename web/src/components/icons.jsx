// Minimal stroke icons - each takes className.
const base = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };

export const HomeIcon = (p) => (
  <svg viewBox="0 0 24 24" className={p.className} {...base}><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></svg>
);
export const LearnIcon = (p) => (
  <svg viewBox="0 0 24 24" className={p.className} {...base}><path d="M4 5h11a4 4 0 0 1 4 4v10a3 3 0 0 0-3-3H4z" /><path d="M4 5v11" /></svg>
);
export const CameraIcon = (p) => (
  <svg viewBox="0 0 24 24" className={p.className} {...base}><path d="M3 8h3l2-2h8l2 2h3v11H3z" /><circle cx="12" cy="13" r="3.5" /></svg>
);
export const ChartIcon = (p) => (
  <svg viewBox="0 0 24 24" className={p.className} {...base}><path d="M4 20V10" /><path d="M10 20V4" /><path d="M16 20v-7" /><path d="M22 20H2" /></svg>
);
export const InfoIcon = (p) => (
  <svg viewBox="0 0 24 24" className={p.className} {...base}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>
);
export const MenuIcon = (p) => (
  <svg viewBox="0 0 24 24" className={p.className} {...base}><path d="M3 6h18M3 12h18M3 18h18" /></svg>
);
export const XIcon = (p) => (
  <svg viewBox="0 0 24 24" className={p.className} {...base}><path d="M6 6l12 12M18 6L6 18" /></svg>
);
export const HandIcon = (p) => (
  <svg viewBox="0 0 24 24" className={p.className} {...base}><path d="M8 13V5a1.5 1.5 0 0 1 3 0v6" /><path d="M11 11V4a1.5 1.5 0 0 1 3 0v7" /><path d="M14 11V5.5a1.5 1.5 0 0 1 3 0V13c0 4-2.5 7-6.5 7C7 20 5 18 4 15l-1.2-3a1.4 1.4 0 0 1 2.3-1.5L8 13" /></svg>
);
export const PlayIcon = (p) => (
  <svg viewBox="0 0 24 24" className={p.className} fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
);
export const ShieldIcon = (p) => (
  <svg viewBox="0 0 24 24" className={p.className} {...base}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /><path d="M9 12l2 2 4-4" /></svg>
);
export const HeartIcon = (p) => (
  <svg viewBox="0 0 24 24" className={p.className} {...base}><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" /></svg>
);
export const AlertIcon = (p) => (
  <svg viewBox="0 0 24 24" className={p.className} {...base}><path d="M12 3l9 16H3z" /><path d="M12 10v4" /><path d="M12 17h.01" /></svg>
);

// --- Sign / domain glyphs ---------------------------------------------------
export const PulseIcon = (p) => (
  <svg viewBox="0 0 24 24" className={p.className} {...base}><path d="M3 12h4l2-6 4 12 2-6h6" /></svg>
);
export const StethoscopeIcon = (p) => (
  <svg viewBox="0 0 24 24" className={p.className} {...base}><path d="M5 3v5a4 4 0 0 0 8 0V3" /><path d="M5 3H3.5M13 3h-1.5" /><path d="M9 12v2a5 5 0 0 0 7.5 4.3" /><circle cx="18" cy="8" r="2" /><path d="M18 10v2" /></svg>
);
export const PillIcon = (p) => (
  <svg viewBox="0 0 24 24" className={p.className} {...base}><path d="M10.5 3.6l9.9 9.9a4.9 4.9 0 0 1-7 7l-9.9-9.9a4.9 4.9 0 0 1 7-7z" /><path d="M7 7l10 10" /></svg>
);
export const DropletIcon = (p) => (
  <svg viewBox="0 0 24 24" className={p.className} {...base}><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" /></svg>
);
export const LifeBuoyIcon = (p) => (
  <svg viewBox="0 0 24 24" className={p.className} {...base}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /><path d="M5 5l4 4M15 15l4 4M19 5l-4 4M9 15l-4 4" /></svg>
);

// --- Stat icons -------------------------------------------------------------
export const TrophyIcon = (p) => (
  <svg viewBox="0 0 24 24" className={p.className} {...base}><path d="M7 4h10v4a5 5 0 0 1-10 0V4z" /><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3" /><path d="M9.5 20h5M10 20l.4-3h3.2l.4 3" /></svg>
);
export const TargetIcon = (p) => (
  <svg viewBox="0 0 24 24" className={p.className} {...base}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="0.6" fill="currentColor" /></svg>
);
export const FlameIcon = (p) => (
  <svg viewBox="0 0 24 24" className={p.className} {...base}><path d="M12 3c1 3.5 4.5 4.2 4.5 8.5a4.5 4.5 0 0 1-9 0c0-1.3.6-2.3 1.3-3 .2 1 .9 1.6 1.7 1.7C9.5 8 9.8 5.8 12 3z" /></svg>
);
