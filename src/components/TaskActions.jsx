import { useState } from "react";

// Round outlined icon buttons that fill with their colour on hover: done (green), edit (yellow), delete (red).
// Only the buttons whose handler is passed are shown.
const BASE =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed";

const ACTION_STYLES = {
  complete: "border-green-600 bg-white/40 text-green-600 hover:bg-green-600 hover:text-white focus-visible:ring-green-500/50",
  completed: "border-green-600 bg-green-600 text-white",
  edit: "border-amber-500 bg-white/40 text-amber-600 hover:border-amber-400 hover:bg-amber-400 hover:text-amber-950 focus-visible:ring-amber-400/60",
  delete: "border-red-600 bg-white/40 text-red-600 hover:bg-red-600 hover:text-white focus-visible:ring-red-500/50",
};

const ICONS = {
  check: "M5 13l4 4L19 7",
  pencil:
    "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125",
  trash:
    "M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0",
};

export default function TaskActions({ task, onComplete, onEdit, onDelete }) {
  const [completing, setCompleting] = useState(false);
  const isCompleted = task.status === "Completed";

  // Stays disabled until the write finishes so rapid clicks can't send it twice
  const handleComplete = async () => {
    setCompleting(true);
    try {
      await onComplete(task);
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="flex shrink-0 items-center gap-2">
      {onComplete && (
        <button
          type="button"
          onClick={handleComplete}
          disabled={completing || isCompleted}
          aria-label={isCompleted ? `${task.title} is completed` : `Mark ${task.title} complete`}
          title={isCompleted ? "Completed" : "Mark complete"}
          className={`${BASE} ${isCompleted ? ACTION_STYLES.completed : ACTION_STYLES.complete}`}
        >
          <Icon d={ICONS.check} strokeWidth={2.5} />
        </button>
      )}
      {onEdit && (
        <button
          type="button"
          onClick={() => onEdit(task)}
          aria-label={`Edit ${task.title}`}
          title="Edit"
          className={`${BASE} ${ACTION_STYLES.edit}`}
        >
          <Icon d={ICONS.pencil} />
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          onClick={() => onDelete(task)}
          aria-label={`Delete ${task.title}`}
          title="Delete"
          className={`${BASE} ${ACTION_STYLES.delete}`}
        >
          <Icon d={ICONS.trash} />
        </button>
      )}
    </div>
  );
}

function Icon({ d, strokeWidth = 1.8 }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="h-4 w-4" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}
