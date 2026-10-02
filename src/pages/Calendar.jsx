import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { GLASS_CONTROL } from "../lib/glass";
import { Button, GlassCard, IconButton, PriorityBadge, Spinner } from "../components/ui";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "../components/icons";
import { PRIORITY_DOT } from "../lib/taskMeta";
import { addDays, formatTime, isSameDay, startOfDay, startOfWeek, toDateKey } from "../lib/dates";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_CHIPS = 3;

// Every day shown in the month grid: whole weeks covering the month
function monthDays(cursor) {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const last = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
  const days = [];
  for (let d = startOfWeek(first); d <= last || d.getDay() !== 0; d = addDays(d, 1)) days.push(d);
  return days;
}

function TaskChip({ task, onClick }) {
  const done = task.status === "Completed";
  return (
    <button
      type="button"
      onClick={onClick}
      title={`${task.hasTime ? `${formatTime(task.dueDate)} · ` : ""}${task.title}${task.course ? ` · ${task.course}` : ""}`}
      className="flex w-full items-center gap-1.5 rounded-lg bg-white/60 px-1.5 py-1 text-left text-xs shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9)] ring-1 ring-black/5 transition-all duration-200 hover:bg-white/90 hover:shadow-sm"
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${PRIORITY_DOT[task.priority]}`} />
      {task.hasTime && <span className="shrink-0 font-medium tabular-nums text-gray-500">{formatTime(task.dueDate)}</span>}
      <span className={`truncate ${done ? "text-gray-400 line-through" : "text-gray-800"}`}>{task.title}</span>
    </button>
  );
}

function AddDayButton({ date, onAdd, revealOnHover = false }) {
  return (
    <IconButton
      label={`Add task on ${date.toDateString()}`}
      className={`h-6 w-6 ${revealOnHover ? "opacity-0 group-hover:opacity-100 focus-visible:opacity-100" : ""}`}
      onClick={() => onAdd(date)}
    >
      <PlusIcon className="h-3.5 w-3.5" />
    </IconButton>
  );
}

function DayNumber({ date, today, muted }) {
  const isToday = isSameDay(date, today);
  return (
    <span
      className={`flex h-7 w-7 items-center justify-center rounded-full text-sm ${
        isToday ? "bg-zinc-800 font-semibold text-white shadow-md shadow-black/20" : muted ? "text-gray-400" : "font-medium text-gray-700"
      }`}
    >
      {date.getDate()}
    </span>
  );
}

function MonthView({ cursor, tasksByDay, today, onOpen, onAdd, onShowWeek }) {
  const days = monthDays(cursor);
  return (
    <GlassCard className="overflow-hidden">
      <div className="grid grid-cols-7 border-b border-gray-900/5">
        {WEEKDAYS.map((d) => (
          <div key={d} className="px-2 py-2.5 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const dayTasks = tasksByDay.get(toDateKey(day)) ?? [];
          const outside = day.getMonth() !== cursor.getMonth();
          const extra = dayTasks.length - MAX_CHIPS;
          return (
            <div
              key={toDateKey(day)}
              className={`group min-h-20 border-gray-900/5 p-1.5 sm:min-h-28 ${i % 7 !== 6 ? "border-r" : ""} ${i < days.length - 7 ? "border-b" : ""} ${outside ? "bg-gray-900/[0.02]" : ""}`}
            >
              <div className="flex items-center justify-between">
                <DayNumber date={day} today={today} muted={outside} />
                <span className="hidden sm:block">
                  <AddDayButton date={day} onAdd={onAdd} revealOnHover />
                </span>
              </div>

              {/* Phones: just priority dots; tap to jump to that week */}
              {dayTasks.length > 0 && (
                <button
                  type="button"
                  onClick={() => onShowWeek(day)}
                  aria-label={`${dayTasks.length} tasks, show week`}
                  className="mt-1 flex flex-wrap gap-1 px-1 sm:hidden"
                >
                  {dayTasks.map((t) => (
                    <span key={t.taskId} className={`h-1.5 w-1.5 rounded-full ${PRIORITY_DOT[t.priority]}`} />
                  ))}
                </button>
              )}

              <div className="mt-1 hidden space-y-1 sm:block">
                {dayTasks.slice(0, MAX_CHIPS).map((t) => (
                  <TaskChip key={t.taskId} task={t} onClick={() => onOpen(t)} />
                ))}
                {extra > 0 && (
                  <button type="button" onClick={() => onShowWeek(day)} className="px-1.5 text-xs font-medium text-zinc-900 underline-offset-2 hover:underline">
                    +{extra} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

function WeekView({ cursor, tasksByDay, today, onOpen, onAdd }) {
  const start = startOfWeek(cursor);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  return (
    <div className="grid gap-3 md:grid-cols-7">
      {days.map((day) => {
        const dayTasks = tasksByDay.get(toDateKey(day)) ?? [];
        const isToday = isSameDay(day, today);
        return (
          <GlassCard key={toDateKey(day)} className={`group flex flex-col p-3 md:min-h-96 ${isToday ? "ring-2 ring-zinc-800/30" : ""}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 md:flex-col md:items-start md:gap-1">
                <span className="text-xs font-medium uppercase tracking-wide text-gray-500">{WEEKDAYS[day.getDay()]}</span>
                <DayNumber date={day} today={today} />
              </div>
              <AddDayButton date={day} onAdd={onAdd} />
            </div>

            <div className="mt-3 space-y-2">
              {dayTasks.length === 0 && <p className="text-xs text-gray-400 md:pt-1">No tasks</p>}
              {dayTasks.map((t) => (
                <button
                  key={t.taskId}
                  type="button"
                  onClick={() => onOpen(t)}
                  className="w-full rounded-xl bg-white/60 p-2.5 text-left shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9)] ring-1 ring-black/5 transition-all duration-200 hover:bg-white/90 hover:shadow-md hover:shadow-black/5"
                >
                  <p className="mb-1 text-xs font-medium tabular-nums text-gray-500">{t.hasTime ? formatTime(t.dueDate) : "All day"}</p>
                  <p className={`text-sm font-medium leading-snug ${t.status === "Completed" ? "text-gray-400 line-through" : ""}`}>{t.title}</p>
                  {t.course && <p className="mt-0.5 truncate text-xs text-gray-500">{t.course}</p>}
                  <div className="mt-2 flex flex-wrap gap-1">
                    <PriorityBadge priority={t.priority} />
                  </div>
                  <p className="mt-1.5 text-xs text-gray-500">{t.status}</p>
                </button>
              ))}
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}

export default function Calendar() {
  const { tasks, loading, openNewTask, openEditTask } = useOutletContext();
  const [view, setView] = useState("month");
  const [cursor, setCursor] = useState(() => startOfDay(new Date()));
  const today = startOfDay(new Date());

  const tasksByDay = useMemo(() => {
    const map = new Map();
    for (const t of tasks) {
      if (!t.dueDate) continue;
      const key = toDateKey(t.dueDate);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(t);
    }
    return map;
  }, [tasks]);

  const step = (dir) =>
    setCursor((c) => (view === "month" ? new Date(c.getFullYear(), c.getMonth() + dir, 1) : addDays(c, 7 * dir)));

  const weekStart = startOfWeek(cursor);
  const weekEnd = addDays(weekStart, 6);
  const label =
    view === "month"
      ? cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })
      : `${weekStart.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${weekEnd.toLocaleDateString(undefined, {
          month: weekEnd.getMonth() === weekStart.getMonth() ? undefined : "short",
          day: "numeric",
          year: "numeric",
        })}`;

  const showWeek = (day) => {
    setCursor(day);
    setView("week");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Calendar</h1>
          <p className="mt-1 text-sm text-gray-500">Click a task to edit it, or + on a day to add one.</p>
        </div>
        <Button variant="primary" onClick={() => openNewTask(view === "week" ? weekStart : undefined)}>
          <PlusIcon /> Add Task
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className={`flex items-center rounded-xl ${GLASS_CONTROL}`}>
            <IconButton label={`Previous ${view}`} onClick={() => step(-1)}>
              <ChevronLeftIcon />
            </IconButton>
            <IconButton label={`Next ${view}`} onClick={() => step(1)}>
              <ChevronRightIcon />
            </IconButton>
          </div>
          <Button onClick={() => setCursor(today)}>Today</Button>
          <h2 className="ml-1 text-lg font-semibold">{label}</h2>
        </div>

        <div className={`inline-flex rounded-xl p-1 ${GLASS_CONTROL}`} role="group" aria-label="Calendar view">
          {["month", "week"].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              aria-pressed={view === v}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition-all duration-200 ${
                view === v ? "bg-white text-gray-900 shadow-sm shadow-black/10" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {v === "month" ? "Monthly" : "Weekly"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Spinner />
        </div>
      ) : view === "month" ? (
        <MonthView cursor={cursor} tasksByDay={tasksByDay} today={today} onOpen={openEditTask} onAdd={openNewTask} onShowWeek={showWeek} />
      ) : (
        <WeekView cursor={cursor} tasksByDay={tasksByDay} today={today} onOpen={openEditTask} onAdd={openNewTask} />
      )}
    </div>
  );
}
