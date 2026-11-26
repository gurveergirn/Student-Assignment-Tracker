import { formatDueDate } from "../tasks";
import { daysUntil, relativeDay, toLocalDateKey } from "../utils/dates";
import { GLASS_PANEL } from "../theme";
import TaskActions from "./TaskActions";

// A titled list of tasks on the dashboard (upcoming or overdue). Clicking a row opens the edit form.
export default function DeadlineList({ id, title, tasks, emptyText, tone = "default", onSelect, onComplete }) {
  const overdue = tone === "overdue";
  return (
    <section aria-labelledby={id} className={`rounded-3xl p-5 sm:p-6 ${GLASS_PANEL}`}>
      <h2 id={id} className="flex items-center gap-2 text-lg font-semibold text-slate-900">
        {title}
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${overdue ? "bg-red-100 text-red-800 ring-red-200" : "bg-white/70 text-slate-700 ring-white"}`}>
          {tasks.length}
        </span>
      </h2>

      {tasks.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">{emptyText}</p>
      ) : (
        <ul className="mt-3 divide-y divide-slate-900/5">
          {tasks.map((task) => {
            const key = toLocalDateKey(task.dueDate);
            const late = -daysUntil(key);
            const when = overdue ? `${late} day${late === 1 ? "" : "s"} overdue` : relativeDay(key);
            return (
              <li key={task.id} className="flex items-center gap-2 py-2.5">
                <button
                  onClick={() => onSelect(task)}
                  className="flex min-w-0 flex-1 flex-col rounded-xl px-2 py-1 text-left transition hover:bg-white/60"
                >
                  <span className="truncate font-medium text-slate-900">{task.title}</span>
                  <span className="truncate text-xs text-slate-500">
                    {task.course ? `${task.course} · ` : ""}
                    {formatDueDate(key)}
                  </span>
                </button>
                <span className={`shrink-0 text-xs font-medium ${overdue ? "text-red-700" : "text-slate-600"}`}>{when}</span>
                <TaskActions task={task} onComplete={onComplete} />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
