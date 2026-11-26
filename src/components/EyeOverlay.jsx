import { GLASS_CONTROL } from "../theme";

// Frosted eye icon centred over a "group" button; fades in on hover / keyboard focus.
// Pair with HOVER_BLUR on the button's content. Decorative: the button carries the label.
export default function EyeOverlay({ iconClassName = "h-5 w-5", padding = "p-2" }) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
    >
      <span className={`flex items-center justify-center rounded-full text-slate-800 ${padding} ${GLASS_CONTROL}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClassName}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.04 12.32a1 1 0 010-.64C3.42 7.51 7.36 4.5 12 4.5c4.64 0 8.57 3.01 9.96 7.18a1 1 0 010 .64C20.58 16.49 16.64 19.5 12 19.5c-4.64 0-8.57-3.01-9.96-7.18z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </span>
    </span>
  );
}
