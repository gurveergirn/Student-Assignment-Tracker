import { formatDueDate } from "../tasks";
import { priorityStyle } from "../utils/priority";
import { GLASS_PANEL } from "../theme";
import TaskActions from "./TaskActions";

const STATUS_STYLES = {
  "Not Started": "bg-slate-100 text-slate-700 ring-slate-200",
  "In Progress": "bg-sky-100 text-sky-800 ring-sky-200",
  Completed: "bg-indigo-100 text-indigo-800 ring-indigo-200",
};

// Full-width row card: details on the left, due date and done / edit / delete on the right.
// On phones the right side drops below the details.
export default function TaskCard({ task, onEdit, onDelete, onComplete }) {
  const isCompleted = task.status === "Completed";

  return (
    <li
      className={`flex flex-col gap-4 rounded-3xl p-5 sm:flex-row sm:items-center sm:gap-6 ${GLASS_PANEL} ${isCompleted ? "opacity-60" : ""}`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {task.course && (
            <span className="rounded-md bg-indigo-600 px-2 py-0.5 text-xs font-semibold text-white">{task.course}</span>
          )}
          <Badge className={priorityStyle(task.priority)}>{task.priority} priority</Badge>
          <Badge className={STATUS_STYLES[task.status]}>{task.status}</Badge>
        </div>

        <h3 className={`mt-2 break-words font-semibold text-slate-900 ${isCompleted ? "line-through" : ""}`}>{task.title}</h3>
        {task.description && (
          <p className="mt-1 whitespace-pre-line break-words text-sm text-slate-600">{task.description}</p>
        )}
      </div>

      <div className="flex shrink-0 items-center justify-between gap-4 border-t border-slate-900/5 pt-3 sm:border-0 sm:pt-0">
        <span className="whitespace-nowrap text-sm text-slate-500">
          Due <span className="font-medium text-slate-700">{formatDueDate(task.dueDate)}</span>
        </span>
        <TaskActions task={task} onComplete={onComplete} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </li>
  );
}

function Badge({ className, children }) {
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}>{children}</span>;
}
