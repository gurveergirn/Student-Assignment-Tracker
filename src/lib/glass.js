// Shared iOS-style frosted glass recipes: heavy blur + saturation, translucent white,
// a bright top-edge highlight and a soft diffused shadow.
export const GLASS_PANEL =
  "border border-white/60 bg-white/55 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.12),inset_0_1px_0_0_rgba(255,255,255,0.85)] ring-1 ring-black/[0.04] backdrop-blur-2xl backdrop-saturate-150";

export const GLASS_CONTROL =
  "border border-white/60 bg-white/50 shadow-[0_1px_3px_rgba(0,0,0,0.06),inset_0_1px_0_0_rgba(255,255,255,0.85)] backdrop-blur-xl backdrop-saturate-150";

// Graphite accent: translucent frosted grey (like iOS's selected segment), not a solid fill.
// ~70% opacity keeps white text readable on the light background.
export const GLASS_ACCENT =
  "border border-white/35 bg-zinc-700/70 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),0_6px_16px_-6px_rgba(0,0,0,0.25)] backdrop-blur-xl backdrop-saturate-150 [text-shadow:0_1px_1px_rgba(0,0,0,0.15)]";

// Round frosted action buttons (edit / delete / done)
const ROUND_GLASS =
  "border border-white/40 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.45),0_6px_16px_-6px_rgba(0,0,0,0.3)] backdrop-blur-xl backdrop-saturate-150";
export const ROUND_ACTION = {
  edit: `${ROUND_GLASS} bg-zinc-700/70 hover:bg-zinc-700/85`,
  delete: `${ROUND_GLASS} bg-red-500/80 hover:bg-red-500/95`,
  done: `${ROUND_GLASS} bg-green-500/80 hover:bg-green-500/95`,
};

// Applied to a task's content when TaskHoverActions shows over it
export const HOVER_BLUR =
  "transition-all duration-300 group-hover/task:opacity-60 group-hover/task:blur-[3px] group-focus-within/task:opacity-60 group-focus-within/task:blur-[3px]";

export const ACCENT_BUTTON = `${GLASS_ACCENT} hover:bg-zinc-700/80 active:bg-zinc-700/90`;
