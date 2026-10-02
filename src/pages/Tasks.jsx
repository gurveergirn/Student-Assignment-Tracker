import { useOutletContext, useSearchParams } from "react-router-dom";
import { GLASS_CONTROL } from "../lib/glass";
import { Button, GlassCard, IconButton, PriorityBadge, Spinner, StatusBadge } from "../components/ui";
import { CheckIcon, PencilIcon, PlusIcon, TrashIcon } from "../components/icons";
import { PRIORITY_DOT, STATUSES, courseKey, isOverdue } from "../lib/taskMeta";
import { formatDate, formatTime, relativeDay } from "../lib/dates";

const FILTERS = ["All", ...STATUSES];
const ROW_GRID = "md:grid md:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,1.1fr)_7rem_7.5rem_6.5rem] md:items-center md:gap-4";

// Toggles completion; filled green once the task is done
function DoneButton({ done, onClick }) {
  return (
    <IconButton
      label={done ? "Mark as not done" : "Mark as done"}
      aria-pressed={done}
      onClick={onClick}
      tone={done ? "successActive" : "success"}
    >
      <CheckIcon />
    </IconButton>
  );
}

export default function Tasks() {
  const { tasks, loading, openNewTask, openEditTask, requestDelete, changeStatus } = useOutletContext();
  // Filters live in the URL (?status=Completed&course=CPS714) so the dashboard can link straight to them.
  // course="" means "tasks with no course".
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = STATUSES.includes(searchParams.get("status")) ? searchParams.get("status") : "All";
  const course = searchParams.has("course") ? searchParams.get("course") : null;

  const updateParams = (changes) => {
    const next = new URLSearchParams(searchParams);
    for (const [k, v] of Object.entries(changes)) v === null ? next.delete(k) : next.set(k, v);
    setSearchParams(next, { replace: true });
  };
  const setFilter = (f) => updateParams({ status: f === "All" ? null : f });

  const inCourse = course === null ? tasks : tasks.filter((t) => courseKey(t.course) === courseKey(course));
  const visible = filter === "All" ? inCourse : inCourse.filter((t) => t.status === filter);
  const countFor = (f) => (f === "All" ? inCourse.length : inCourse.filter((t) => t.status === f).length);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">My Tasks</h1>
          <p className="mt-1 text-sm text-gray-500">Everything you've got on the go, soonest due first.</p>
        </div>
        <Button variant="primary" onClick={() => openNewTask()}>
          <PlusIcon /> Add Task
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className={`flex gap-1 overflow-x-auto rounded-2xl p-1 sm:inline-flex ${GLASS_CONTROL}`}>
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`whitespace-nowrap rounded-xl px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                filter === f ? "bg-white text-gray-900 shadow-sm shadow-black/10" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {f} <span className="text-gray-400">{countFor(f)}</span>
            </button>
          ))}
        </div>
        {course !== null && (
          <span className={`inline-flex items-center gap-1 rounded-full py-1 pr-1 pl-3 text-sm ${GLASS_CONTROL}`}>
            <span className="text-gray-500">Course:</span>
            <span className="max-w-48 truncate font-medium">{course || "No course"}</span>
            <button
              type="button"
              onClick={() => updateParams({ course: null })}
              aria-label="Clear course filter"
              className="flex h-6 w-6 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-white hover:text-gray-900"
            >
              ×
            </button>
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Spinner />
        </div>
      ) : visible.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <p className="font-medium">{tasks.length === 0 ? "No tasks yet" : `No ${filter === "All" ? "" : `${filter.toLowerCase()} `}tasks${course !== null ? ` in ${course || "No course"}` : ""}`}</p>
          <p className="mt-1 text-sm text-gray-500">
            {tasks.length === 0 ? "Add your first assignment to start tracking it." : "Try a different filter."}
          </p>
          {tasks.length === 0 && (
            <Button variant="primary" className="mt-5" onClick={() => openNewTask()}>
              <PlusIcon /> Add Task
            </Button>
          )}
        </GlassCard>
      ) : (
        <GlassCard className="overflow-hidden">
          <div className={`hidden border-b border-gray-900/5 px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 ${ROW_GRID}`}>
            <span>Task</span>
            <span>Course</span>
            <span>Due</span>
            <span>Priority</span>
            <span>Status</span>
            <span className="sr-only">Actions</span>
          </div>

          <ul className="divide-y divide-gray-900/5">
            {visible.map((task) => {
              const overdue = isOverdue(task);
              const done = task.status === "Completed";
              return (
                <li key={task.taskId} className={`px-5 py-4 transition-colors duration-200 hover:bg-white/50 ${ROW_GRID}`}>
                  <div className="flex min-w-0 items-start gap-3">
                    <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${PRIORITY_DOT[task.priority]}`} />
                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => openEditTask(task)}
                        className={`block max-w-full truncate text-left font-medium hover:text-zinc-600 ${done ? "text-gray-400 line-through" : ""}`}
                      >
                        {task.title}
                      </button>
                      {task.description && <p className="truncate text-sm text-gray-500">{task.description}</p>}
                    </div>
                    {/* Mobile: actions sit beside the title */}
                    <div className="flex shrink-0 md:hidden">
                      <IconButton label="Edit task" onClick={() => openEditTask(task)}>
                        <PencilIcon />
                      </IconButton>
                      <IconButton label="Delete task" tone="danger" onClick={() => requestDelete(task)}>
                        <TrashIcon />
                      </IconButton>
                      <DoneButton done={done} onClick={() => changeStatus(task, done ? "Not Started" : "Completed")} />
                    </div>
                  </div>

                  <p className="mt-2 truncate pl-5.5 text-sm text-gray-700 md:mt-0 md:pl-0">
                    <span className="text-gray-500 md:hidden">Course: </span>
                    {task.course || <span className="text-gray-400">—</span>}
                  </p>

                  <p className={`mt-1 pl-5.5 text-sm md:mt-0 md:pl-0 ${overdue ? "font-medium text-red-600" : "text-gray-700"}`}>
                    <span className="text-gray-500 md:hidden">Due: </span>
                    {formatDate(task.dueDate)}
                    {task.hasTime && <span className="whitespace-nowrap"> · {formatTime(task.dueDate)}</span>}
                    <span className="md:hidden"> · </span>
                    <span className={`text-xs md:block ${overdue ? "text-red-500" : "text-gray-500"}`}>
                      {overdue ? `Overdue · ${relativeDay(task.dueDate)}` : relativeDay(task.dueDate)}
                    </span>
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2 pl-5.5 md:contents">
                    <div>
                      <PriorityBadge priority={task.priority} />
                    </div>
                    <div>
                      <StatusBadge status={task.status} />
                    </div>
                  </div>

                  <div className="hidden justify-end md:flex">
                    <IconButton label="Edit task" onClick={() => openEditTask(task)}>
                      <PencilIcon />
                    </IconButton>
                    <IconButton label="Delete task" tone="danger" onClick={() => requestDelete(task)}>
                      <TrashIcon />
                    </IconButton>
                    <DoneButton done={done} onClick={() => changeStatus(task, done ? "Not Started" : "Completed")} />
                  </div>
                </li>
              );
            })}
          </ul>
        </GlassCard>
      )}
    </div>
  );
}
