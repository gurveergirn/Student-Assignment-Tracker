import { formatDueDate } from "../tasks";

const PRIORITY_STYLES = {
  Low: "bg-green-100 text-green-800 ring-green-200",
  Medium: "bg-amber-100 text-amber-800 ring-amber-200",
  High: "bg-red-100 text-red-800 ring-red-200",
};

const STATUS_STYLES = {
  "Not Started": "bg-slate-100 text-slate-700 ring-slate-200",
  "In Progress": "bg-sky-100 text-sky-800 ring-sky-200",
  Completed: "bg-indigo-100 text-indigo-800 ring-indigo-200",
};

export default function TaskCard({ task, onEdit, onDelete }) {
  return (
    <li className="flex flex-col rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-wrap items-center gap-2">
        {task.course && (
          <span className="rounded-md bg-indigo-600 px-2 py-0.5 text-xs font-semibold text-white">{task.course}</span>
        )}
        <Badge className={PRIORITY_STYLES[task.priority]}>{task.priority} priority</Badge>
        <Badge className={STATUS_STYLES[task.status]}>{task.status}</Badge>
      </div>

      <h3 className="mt-3 break-words font-semibold text-slate-900">{task.title}</h3>
      {task.description && (
        <p className="mt-1 whitespace-pre-line break-words text-sm text-slate-600">{task.description}</p>
      )}

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <span className="text-sm text-slate-500">
          Due <span className="font-medium text-slate-700">{formatDueDate(task.dueDate)}</span>
        </span>
        <div className="flex gap-2">
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
