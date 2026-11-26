import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { addDays, fromDateKey, startOfDay, toDateKey } from "../utils/dates";
import { getMonthDays, getWeekDays, groupTasksByDate, splitForCell } from "../utils/calendar";
import { PRIORITY_BORDER } from "../utils/priority";
import { GLASS_CONTROL, GLASS_PANEL, HOVER_BLUR } from "../theme";
import Spinner from "../components/Spinner";
import EyeOverlay from "../components/EyeOverlay";
import TaskListDialog from "../components/TaskListDialog";

// How many rows a day can show before the rest collapse into "+X more"
const MAX_ROWS = { month: 3, week: 6 };

export default function Calendar() {
  const { tasks, tasksLoading, openEditTask, openNewTask, requestDelete, completeTask } = useOutletContext();
  const [view, setView] = useState("month");
  const [cursor, setCursor] = useState(() => startOfDay(new Date()));
  const [openDayKey, setOpenDayKey] = useState(null); // day whose task list dialog is open

  const tasksByDate = useMemo(() => groupTasksByDate(tasks), [tasks]);
  const days = view === "month" ? getMonthDays(cursor) : getWeekDays(cursor);
  const today = new Date();
  const todayKey = toDateKey(today);

  const step = (dir) =>
    setCursor((c) => (view === "month" ? new Date(c.getFullYear(), c.getMonth() + dir, 1) : addDays(c, 7 * dir)));

  const changeView = (next) => {
    // Month -> Week: show today's week if we're looking at this month, else the first week shown
    if (next === "week" && cursor.getFullYear() === today.getFullYear() && cursor.getMonth() === today.getMonth()) {
      setCursor(startOfDay(today));
    }
    setView(next);
  };

  const selectTask = (task) => {
    setOpenDayKey(null);
    openEditTask(task);
  };

  const deleteFromDay = (task) => {
    setOpenDayKey(null);
    requestDelete(task);
  };

  const addTaskOn = (key) => {
    setOpenDayKey(null);
    openNewTask(key);
  };

  const title =
    view === "month"
      ? cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })
      : `${days[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${days[6].toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`;

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Calendar</h1>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <NavButton label={`Previous ${view}`} onClick={() => step(-1)} d="M15 19l-7-7 7-7" />
          <NavButton label={`Next ${view}`} onClick={() => step(1)} d="M9 5l7 7-7 7" />
          <button
            onClick={() => setCursor(startOfDay(new Date()))}
            className={`rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-white/80 ${GLASS_CONTROL}`}
          >
            Today
          </button>
          <h2 className="ml-1 text-lg font-semibold text-slate-900" aria-live="polite">
            {title}
          </h2>
        </div>

        <div role="group" aria-label="Calendar view" className={`flex rounded-2xl p-1 ${GLASS_CONTROL}`}>
          {["month", "week"].map((v) => (
            <button
              key={v}
              onClick={() => changeView(v)}
              aria-pressed={view === v}
              className={`rounded-xl px-4 py-1.5 text-sm font-medium capitalize transition ${
                view === v ? "bg-indigo-600/90 text-white shadow-sm" : "text-slate-700 hover:bg-white/70"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {tasksLoading ? (
        <Spinner />
      ) : (
        <div className={`mt-4 rounded-3xl p-2 sm:p-4 ${GLASS_PANEL}`}>
          {/* Weekday header (week view on phones shows the day name in each row instead) */}
          <div className={`mb-2 grid grid-cols-7 text-center text-xs font-medium text-slate-500 ${view === "week" ? "hidden sm:grid" : ""}`}>
            {getWeekDays(cursor).map((d) => (
              <div key={d.getDay()}>
                <span className="sm:hidden">{d.toLocaleDateString(undefined, { weekday: "narrow" })}</span>
                <span className="hidden sm:inline">{d.toLocaleDateString(undefined, { weekday: "short" })}</span>
              </div>
            ))}
          </div>

          <div className={`grid gap-1 sm:gap-2 ${view === "month" ? "grid-cols-7" : "grid-cols-1 sm:grid-cols-7"}`}>
            {days.map((day) => {
              const key = toDateKey(day);
              return (
                <DayCell
                  key={key}
                  day={day}
                  view={view}
                  tasks={tasksByDate.get(key) ?? []}
                  isToday={key === todayKey}
                  outsideMonth={view === "month" && day.getMonth() !== cursor.getMonth()}
                  onOpenDay={() => setOpenDayKey(key)}
                />
              );
            })}
          </div>
        </div>
      )}

      {openDayKey && (
        <TaskListDialog
          title={fromDateKey(openDayKey).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          tasks={tasksByDate.get(openDayKey) ?? []}
          emptyText="Nothing due this day."
          onEditTask={selectTask}
          onDeleteTask={deleteFromDay}
          onCompleteTask={completeTask}
          onClose={() => setOpenDayKey(null)}
        >
          <button
            onClick={() => addTaskOn(openDayKey)}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
          >
            + Add task
          </button>
        </TaskListDialog>
      )}
    </>
  );
}

// The whole day is one button. Hovering (or tabbing to) it blurs the day and shows an eye icon;
// clicking opens the day's task list, where each task can be opened, completed, edited or deleted.
function DayCell({ day, view, tasks, isToday, outsideMonth, onOpenDay }) {
  const { visible, hiddenCount } = splitForCell(tasks, MAX_ROWS[view]);
  const isWeek = view === "week";
  const dayLabel = day.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <button
      type="button"
      onClick={onOpenDay}
      aria-label={`View ${dayLabel}, ${tasks.length} task${tasks.length === 1 ? "" : "s"}`}
      className={`group relative flex min-w-0 flex-col overflow-hidden rounded-xl p-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:rounded-2xl sm:p-2 ${
        isWeek ? "min-h-16 sm:min-h-64" : "min-h-20 sm:min-h-28"
      } ${outsideMonth ? "bg-white/15 text-slate-400" : "bg-white/45"} ${isToday ? "ring-2 ring-indigo-500/60" : ""}`}
    >
      <span className={`flex w-full min-w-0 flex-col ${HOVER_BLUR}`}>
        <span className={`mb-1 flex items-center gap-1.5 px-0.5 text-xs font-semibold ${isToday ? "text-indigo-700" : ""}`}>
          {isWeek && <span className="sm:hidden">{day.toLocaleDateString(undefined, { weekday: "short" })}</span>}
          <span>{day.getDate()}</span>
        </span>
        <span className="flex min-w-0 flex-col gap-1">
          {visible.map((task) => (
            <TaskChip key={task.id} task={task} />
          ))}
          {hiddenCount > 0 && (
            <span className="truncate px-1 text-[10px] font-semibold text-indigo-700 sm:text-xs">+{hiddenCount} more</span>
          )}
        </span>
      </span>

      <EyeOverlay iconClassName="h-3.5 w-3.5 sm:h-5 sm:w-5" padding="p-1.5 sm:p-2" />
    </button>
  );
}

// Compact task label inside a day cell (the day itself is the button)
function TaskChip({ task }) {
  const done = task.status === "Completed";
  return (
    <span
      title={task.title}
      className={`block w-full truncate rounded-md border-l-[3px] bg-white/75 px-1 py-0.5 text-[10px] font-medium text-slate-800 shadow-sm sm:px-1.5 sm:text-xs ${
        PRIORITY_BORDER[task.priority] ?? "border-l-slate-400"
      } ${done ? "line-through opacity-60" : ""}`}
    >
      {task.title}
    </span>
  );
}

function NavButton({ label, onClick, d }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`flex h-9 w-9 items-center justify-center rounded-xl text-slate-700 transition hover:bg-white/80 ${GLASS_CONTROL}`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d={d} />
      </svg>
    </button>
  );
}
