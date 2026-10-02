import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Modal, StatusBadge } from "./ui";
import { ChevronRightIcon } from "./icons";
import { PRIORITY_DOT, courseKey, isOverdue } from "../lib/taskMeta";
import { addDays, formatTime, formatWeekday, fromDateKey, startOfDay, toDateKey } from "../lib/dates";

const ATTENTION_DAYS = 3; // "due soon" window for the needs-attention score
const LOOKAHEAD_DAYS = 14; // window for the busiest-day insight

const isOpen = (t) => t.status !== "Completed";

// Completion broken down per course, least-finished first.
// Tasks arrive sorted by due date, so each group's tasks stay in due order.
function groupByCourse(tasks, now) {
  const soonCutoff = addDays(startOfDay(now), ATTENTION_DAYS + 1);
  const groups = new Map();
  for (const t of tasks) {
    const key = courseKey(t.course);
    if (!groups.has(key)) groups.set(key, { key, name: t.course.trim() || "No course", tasks: [] });
    groups.get(key).tasks.push(t);
  }
  return [...groups.values()]
    .map((g) => {
      const count = (fn) => g.tasks.filter(fn).length;
      const done = count((t) => t.status === "Completed");
      const overdue = count((t) => isOverdue(t, now));
      const highNotStarted = count((t) => t.priority === "High" && t.status === "Not Started");
      const dueSoon = count((t) => isOpen(t) && !isOverdue(t, now) && t.dueDate < soonCutoff);
      return {
        ...g,
        done,
        inProgress: count((t) => t.status === "In Progress"),
        percent: Math.round((done / g.tasks.length) * 100),
        overdue,
        highNotStarted,
        dueSoon,
        // Overdue work weighs most, then untouched high-priority work, then anything due within a few days
        risk: overdue * 3 + highNotStarted * 2 + dueSoon,
        next: g.tasks.find((t) => isOpen(t) && !isOverdue(t, now)) ?? null,
      };
    })
    .sort((a, b) => a.percent - b.percent || b.overdue - a.overdue || a.name.localeCompare(b.name));
}

// Day in the next two weeks with the most unfinished deadlines (earliest wins ties)
function busiestDay(tasks, now) {
  const today = startOfDay(now);
  const end = addDays(today, LOOKAHEAD_DAYS);
  const byDay = new Map();
  for (const t of tasks) {
    if (!isOpen(t) || t.dueDate < today || t.dueDate >= end) continue;
    const key = toDateKey(t.dueDate);
    byDay.set(key, [...(byDay.get(key) ?? []), t]);
  }
  let best = null;
  for (const [key, dayTasks] of byDay) {
    if (!best || dayTasks.length > best.tasks.length || (dayTasks.length === best.tasks.length && key < best.key)) {
      best = { key, tasks: dayTasks };
    }
  }
  return best && { date: fromDateKey(best.key), tasks: best.tasks };
}

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

function InsightTile({ label, title, detail, onClick, tone = "default" }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      {...(onClick && { type: "button", onClick })}
      className={`min-w-0 rounded-xl bg-white/50 p-3.5 text-left shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9)] ring-1 ring-black/5 ${
        onClick ? "transition-colors duration-200 hover:bg-white/75" : ""
      }`}
    >
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className={`mt-1 truncate font-semibold ${tone === "alert" ? "text-red-700" : "text-gray-900"}`}>{title}</p>
      <p className="mt-0.5 text-xs text-gray-500">{detail}</p>
    </Tag>
  );
}

export default function CourseProgressModal({ tasks, onClose }) {
  const [now] = useState(() => new Date());
  const courses = useMemo(() => groupByCourse(tasks, now), [tasks, now]);
  const crunch = useMemo(() => busiestDay(tasks, now), [tasks, now]);
  const [openKey, setOpenKey] = useState(null);

  const atRisk = courses.reduce((top, c) => (c.risk > (top?.risk ?? 0) ? c : top), null);
  const riskReasons = atRisk
    ? [
        atRisk.overdue && `${atRisk.overdue} overdue`,
        atRisk.highNotStarted && `${atRisk.highNotStarted} high priority not started`,
        atRisk.dueSoon && `${atRisk.dueSoon} due within ${ATTENTION_DAYS} days`,
      ].filter(Boolean)
    : [];

  return (
    <Modal title="Progress by course" onClose={onClose} maxWidth="max-w-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Progress by course</h2>
          <p className="mt-0.5 text-sm text-gray-500">Courses you're furthest behind in are listed first.</p>
        </div>
        <button type="button" onClick={onClose} className="rounded-full px-3 py-1 text-sm font-medium text-gray-500 hover:bg-white/70 hover:text-gray-900">
          Done
        </button>
      </div>

      {courses.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-gray-300/70 p-8 text-center text-sm text-gray-500">No tasks yet.</p>
      ) : (
        <>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {atRisk ? (
              <InsightTile
                label="Needs attention"
                title={atRisk.name}
                detail={riskReasons.join(" · ")}
                tone={atRisk.overdue ? "alert" : "default"}
                onClick={() => setOpenKey(atRisk.key)}
              />
            ) : (
              <InsightTile label="Needs attention" title="All caught up" detail="Nothing overdue or urgent right now" />
            )}
            {crunch ? (
              <InsightTile
                label="Busiest day ahead"
                title={`${formatWeekday(crunch.date)} · ${plural(crunch.tasks.length, "task")}`}
                detail={crunch.tasks.map((t) => t.title).join(", ")}
              />
            ) : (
              <InsightTile label="Busiest day ahead" title="Clear schedule" detail={`Nothing due in the next ${LOOKAHEAD_DAYS} days`} />
            )}
          </div>

          <ul className="mt-4 space-y-2">
            {courses.map((c) => {
              const open = openKey === c.key;
              return (
                <li key={c.key} className="overflow-hidden rounded-xl bg-white/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9)] ring-1 ring-black/5">
                  <button
                    type="button"
                    onClick={() => setOpenKey(open ? null : c.key)}
                    aria-expanded={open}
                    className="w-full px-4 py-3 text-left transition-colors duration-200 hover:bg-white/60"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex min-w-0 items-center gap-2">
                        <ChevronRightIcon className={`h-3.5 w-3.5 shrink-0 text-gray-400 transition-transform duration-200 ${open ? "rotate-90" : ""}`} />
                        <span className={`truncate font-medium ${c.key ? "" : "text-gray-500"}`}>{c.name}</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2 text-sm">
                        {c.overdue > 0 && (
                          <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-red-500/20">
                            {c.overdue} overdue
                          </span>
                        )}
                        <span className="text-gray-500">
                          {c.done} of {c.tasks.length}
                        </span>
                        <span className="w-10 text-right font-semibold tabular-nums">{c.percent}%</span>
                      </span>
                    </div>
                    <div className="mt-2.5 ml-5.5 flex h-1.5 overflow-hidden rounded-full bg-gray-900/5">
                      <div className="h-full bg-green-500 transition-all duration-700" style={{ width: `${(c.done / c.tasks.length) * 100}%` }} />
                      <div className="h-full bg-zinc-500/70 transition-all duration-700" style={{ width: `${(c.inProgress / c.tasks.length) * 100}%` }} />
                    </div>
                    <p className="mt-1.5 ml-5.5 truncate text-xs text-gray-500">
                      {c.next ? (
                        <>
                          Next: <span className="font-medium text-gray-700">{c.next.title}</span> · {formatWeekday(c.next.dueDate)}
                          {c.next.hasTime && ` · ${formatTime(c.next.dueDate)}`}
        </>
                    ) : c.done === c.tasks.length ? (
                      "All done"
                    ) : (
                      "No upcoming deadlines"
                    )}
                  </p>
                </button>

                {open && (
                  <div className="border-t border-gray-900/5 px-4 pt-2 pb-3">
                    <ul className="divide-y divide-gray-900/5">
                      {c.tasks.map((t) => {
                        const overdue = isOverdue(t, now);
                        return (
                          <li key={t.taskId} className="flex items-center gap-3 py-2 pl-5.5">
                            <span className={`h-2 w-2 shrink-0 rounded-full ${PRIORITY_DOT[t.priority]}`} />
                            <div className="min-w-0 flex-1">
                              <p className={`truncate text-sm font-medium ${t.status === "Completed" ? "text-gray-400 line-through" : ""}`}>{t.title}</p>
                              <p className={`text-xs ${overdue ? "font-medium text-red-600" : "text-gray-500"}`}>
                                {overdue && "Overdue · "}
                                {formatWeekday(t.dueDate)}
                                {t.hasTime && ` · ${formatTime(t.dueDate)}`}
                              </p>
                            </div>
                            <StatusBadge status={t.status} />
                          </li>
                        );
                      })}
                    </ul>
                    <Link
                      to={`/tasks?course=${encodeURIComponent(c.key ? c.name : "")}`}
                      onClick={onClose}
                      className="mt-2 ml-5.5 inline-flex items-center gap-1 text-sm font-medium text-zinc-900 underline-offset-2 hover:underline"
                    >
                      View in My Tasks <ChevronRightIcon className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        <p className="mt-3 flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green-500" />Completed</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-zinc-500/70" />In progress</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-gray-900/10" />Not started</span>
        </p>
        </>
      )}
    </Modal>
  );
}
