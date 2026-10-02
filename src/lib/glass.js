// Shared iOS-style frosted glass recipes: heavy blur + saturation, translucent white,
// a bright top-edge highlight and a soft diffused shadow.
export const GLASS_PANEL =
  "border border-white/60 bg-white/55 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.12),inset_0_1px_0_0_rgba(255,255,255,0.85)] ring-1 ring-black/[0.04] backdrop-blur-2xl backdrop-saturate-150";

export const GLASS_CONTROL =
  "border border-white/60 bg-white/50 shadow-[0_1px_3px_rgba(0,0,0,0.06),inset_0_1px_0_0_rgba(255,255,255,0.85)] backdrop-blur-xl backdrop-saturate-150";

// Graphite accent: translucent frosted grey (like iOS's selected segment), not a solid fill.
// ~70% opacity keeps white text readable on the light background.
export const GLASS_ACCENT =
  "border border-white/35 bg-zinc-600/70 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),0_6px_16px_-6px_rgba(0,0,0,0.25)] backdrop-blur-xl backdrop-saturate-150 [text-shadow:0_1px_1px_rgba(0,0,0,0.15)]";

export const ACCENT_BUTTON = `${GLASS_ACCENT} hover:bg-zinc-600/80 active:bg-zinc-600/90`;
