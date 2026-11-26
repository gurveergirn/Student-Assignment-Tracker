// Frosted glass recipes shared by every signed-in page: translucent white, heavy blur,
// a bright top-edge highlight and a soft shadow. Pair with a bg-white/.. class.
const GLASS =
  "border border-white/60 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.15),inset_0_1px_0_0_rgba(255,255,255,0.85)] ring-1 ring-slate-900/[0.04] backdrop-blur-2xl backdrop-saturate-150";

export const GLASS_PANEL = `${GLASS} bg-white/55`;
// More opaque for dialogs so form text stays easy to read
export const GLASS_MODAL = `${GLASS} bg-white/85`;
export const GLASS_CONTROL =
  "border border-white/70 bg-white/60 shadow-[0_1px_3px_rgba(15,23,42,0.06),inset_0_1px_0_0_rgba(255,255,255,0.85)] backdrop-blur-xl";
// Dimmed, blurred page behind a dialog
export const GLASS_BACKDROP = "bg-slate-900/25 backdrop-blur-sm";

// Inputs and selects on glass panels
export const GLASS_INPUT = `rounded-xl ${GLASS_CONTROL} px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20`;

// Content of a hoverable "group" card blurs and fades while EyeOverlay shows on top
export const HOVER_BLUR =
  "transition duration-200 group-hover:opacity-50 group-hover:blur-[2px] group-focus-visible:opacity-50 group-focus-visible:blur-[2px]";
