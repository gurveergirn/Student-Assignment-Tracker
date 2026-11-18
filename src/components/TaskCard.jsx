import { useState } from "react";
import { formatDueDate } from "../tasks";
import { priorityStyle } from "../utils/priority";

const STATUS_STYLES = {
  "Not Started": "bg-slate-100 text-slate-700 ring-slate-200",
  "In Progress": "bg-sky-100 text-sky-800 ring-sky-200",
  Completed: "bg-indigo-100 text-indigo-800 ring-indigo-200",
};

export default function TaskCard({ task, onEdit, onDelete, onComplete }) {
  const [completing, setCompleting] = useState(false);
  const isCompleted = task.status === "Completed";

  // Button stays disabled until the write finishes so rapid clicks can't send it twice
  const handleComplete = async () => {
    setCompleting(true);
    await onComplete(task);
    setCompleting(false);
  };

  return (
    <li className={`flex flex-col rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 ${isCompleted ? "opacity-60" : ""}`}>
      <div className="flex flex-wrap items-center gap-2">
        {task.course && (
          <span className="rounded-md bg-indigo-600 px-2 py-0.5 text-xs font-semibold text-white">{task.course}</span>
        )}
        <Badge className={priorityStyle(task.priority)}>{task.priority} priority</Badge>
        <Badge className={STATUS_STYLES[task.status]}>{task.status}</Badge>
      </div>

      <h3 className={`mt-3 break-words font-semibold text-slate-900 ${isCompleted ? "line-through" : ""}`}>{task.title}</h3>
      {task.description && (
        <p className="mt-1 whitespace-pre-line break-words text-sm text-slate-600">{task.description}</p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <span className="text-sm text-slate-500">
          Due <span className="font-medium text-slate-700">{formatDueDate(task.dueDate)}</span>
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleComplete}
            disabled={completing || isCompleted}
            aria-label={isCompleted ? `${task.title} is completed` : `Mark ${task.title} complete`}
            className="rounded-lg border border-indigo-200 px-3 py-1.5 text-sm font-medium text-indigo-700 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            {isCompleted ? "Completed" : "Mark Complete"}
          </button>
          <button
            onClick={() => onEdit(task)}
            aria-label={`Edit ${task.title}`}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(task)}
            aria-label={`Delete ${task.title}`}
            className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>
    </li>
  );
}

function Badge({ className, children }) {
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}>{children}</span>;
}
