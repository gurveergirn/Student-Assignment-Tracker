import { CheckIcon, PencilIcon, TrashIcon } from "./icons";
import { ROUND_ACTION } from "../lib/glass";

const SIZES = {
  md: { button: "h-10 w-10", icon: "h-[18px] w-[18px]", gap: "gap-3" },
  sm: { button: "h-6 w-6", icon: "h-3.5 w-3.5", gap: "gap-1.5" },
};

// Frosted edit / delete / done buttons that fade in over a task on hover or focus.
// The parent needs `group/task relative` and should blur its content with HOVER_BLUR (lib/glass).
export default function TaskHoverActions({ task, onEdit, onDelete, onToggleDone, size = "md" }) {
  const done = task.status === "Completed";
  const s = SIZES[size];
  const actions = [
    { label: "Edit task", style: ROUND_ACTION.edit, Icon: PencilIcon, onClick: onEdit },
    { label: "Delete task", style: ROUND_ACTION.delete, Icon: TrashIcon, onClick: onDelete },
    { label: done ? "Mark as not done" : "Mark as done", style: ROUND_ACTION.done, Icon: CheckIcon, onClick: onToggleDone },
  ];

  return (
    <div
      className={`pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover/task:pointer-events-auto group-hover/task:opacity-100 group-focus-within/task:pointer-events-auto group-focus-within/task:opacity-100 ${s.gap}`}
    >
      {actions.map(({ label, style, Icon, onClick }) => (
        <button
          key={label}
          type="button"
          aria-label={label}
          title={label}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className={`flex scale-90 items-center justify-center rounded-full transition-all duration-200 group-hover/task:scale-100 group-focus-within/task:scale-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/30 ${s.button} ${style}`}
        >
          <Icon className={s.icon} />
        </button>
      ))}
    </div>
  );
}
