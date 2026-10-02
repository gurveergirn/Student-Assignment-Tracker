import { useEffect } from "react";
import { PRIORITY_BADGE, PRIORITY_DOT, STATUS_BADGE } from "../lib/taskMeta";
import { ACCENT_BUTTON, GLASS_CONTROL, GLASS_PANEL } from "../lib/glass";

// Frosted glass panel used for cards, panels and modals
export function GlassCard({ as: Tag = "div", className = "", children, ...props }) {
  return (
    <Tag
      className={`rounded-2xl ${GLASS_PANEL} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}

const BUTTON_VARIANTS = {
  primary: ACCENT_BUTTON,
  secondary: `${GLASS_CONTROL} text-gray-800 hover:bg-white/80`,
  danger: "bg-red-500 text-white shadow-md shadow-red-500/20 hover:bg-red-600 active:bg-red-700",
  ghost: "text-gray-600 hover:bg-white/70 hover:text-gray-900",
};

export function Button({ variant = "secondary", className = "", type = "button", ...props }) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/25 disabled:cursor-not-allowed disabled:opacity-60 ${BUTTON_VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}

// Small round icon button for row actions
export function IconButton({ label, tone = "default", className = "", children, ...props }) {
  const tones = {
    default: "text-gray-500 hover:bg-white hover:text-zinc-900",
    danger: "text-gray-500 hover:bg-red-50 hover:text-red-600",
  };
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/25 ${tones[tone]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function Badge({ className, children }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}>
      {children}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  return (
    <Badge className={PRIORITY_BADGE[priority]}>
      <span className={`h-1.5 w-1.5 rounded-full ${PRIORITY_DOT[priority]}`} />
      {priority}
    </Badge>
  );
}

export function StatusBadge({ status }) {
  return <Badge className={STATUS_BADGE[status]}>{status}</Badge>;
}

export function Spinner({ className = "h-8 w-8" }) {
  return <div className={`animate-spin rounded-full border-4 border-zinc-300/50 border-t-zinc-500 ${className}`} />;
}

// Centered frosted modal. Mount it to open, unmount to close.
export function Modal({ title, onClose, children, maxWidth = "max-w-lg" }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center" role="dialog" aria-modal="true" aria-label={title}>
      {/* Backdrop is a sibling (not a parent) of the panel so the panel's own blur still sees the page */}
      <div
        className="absolute inset-0 bg-zinc-900/10 backdrop-blur-md transition-opacity duration-200 starting:opacity-0"
        onClick={onClose}
      />
      <GlassCard className={`relative max-h-[90vh] w-full overflow-y-auto bg-white/70 p-6 transition-all duration-200 starting:translate-y-2 starting:scale-95 starting:opacity-0 ${maxWidth}`}>
        {children}
      </GlassCard>
    </div>
  );
}
