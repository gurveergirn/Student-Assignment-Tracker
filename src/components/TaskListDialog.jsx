import { useEffect } from "react";
import { formatDueDate } from "../tasks";
import { PRIORITY_BORDER } from "../utils/priority";
import { GLASS_BACKDROP, GLASS_MODAL } from "../theme";
import TaskActions from "./TaskActions";

// A popup list of tasks with done / edit / delete on the right of each row.
// Used for a calendar day and for a dashboard stat card. Extra footer buttons go in `children`.
export default function TaskListDialog({
  title,
  tasks,
  emptyText,
  showDueDate = false,
  onEditTask,
  onDeleteTask,
  onCompleteTask,
  onClose,
  children,
}) {
  useEffect(() => {
    const onKeyDown = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center px-4 ${GLASS_BACKDROP}`} onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-list-dialog-title"
        className={`max-h-[80vh] w-full max-w-md overflow-y-auto rounded-3xl p-5 sm:p-6 ${GLASS_MODAL}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="task-list-dialog-title" className="text-lg font-semibold text-slate-900">
          {title}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {tasks.length === 0 ? emptyText : `${tasks.length} task${tasks.length === 1 ? "" : "s"}`}
        </p>

        {tasks.length > 0 && (
          <ul className="mt-4 space-y-2">
            {tasks.map((task) => {
              const done = task.status === "Completed";
              const meta = [
                showDueDate && `Due ${formatDueDate(task.dueDate)}`,
                task.course,
                `${task.priority} priority`,
                task.status,
              ];
              return (
                <li key={task.id} className="flex items-center gap-3 rounded-2xl bg-white/60 p-2.5 ring-1 ring-white">
                  <button
                    type="button"
                    onClick={() => onEditTask(task)}
                    aria-label={`${task.title} (${task.status}), open details`}
                    className={`min-w-0 flex-1 rounded-lg border-l-[3px] py-0.5 pl-2.5 text-left transition hover:bg-white/70 ${
                      PRIORITY_BORDER[task.priority] ?? "border-l-slate-400"
                    }`}
                  >
                    <span className={`block truncate text-sm font-medium ${done ? "text-slate-500 line-through" : "text-slate-900"}`}>
                      {task.title}
                    </span>
                    <span className="block truncate text-xs text-slate-500">{meta.filter(Boolean).join(" · ")}</span>
                  </button>
                  <TaskActions task={task} onComplete={onCompleteTask} onEdit={onEditTask} onDelete={onDeleteTask} />
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            autoFocus
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-white/70"
          >
            Close
          </button>
          {children}
        </div>
      </div>
    </div>
  );
}
