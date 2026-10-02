import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { Button, GlassCard, PriorityBadge, Spinner, StatusBadge } from "../components/ui";
import { PlusIcon } from "../components/icons";
import TaskHoverActions from "../components/TaskHoverActions";
import { HOVER_BLUR } from "../lib/glass";
import { PRIORITY_DOT, isOverdue } from "../lib/taskMeta";
import { addDays, formatTime, formatWeekday, relativeDay, startOfDay } from "../lib/dates";

function StatCard({ label, value, accent }) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${accent}`} />
        <p className="text-sm text-gray-500">{label}</p>
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
    </GlassCard>
  );
}

function ProgressRing({ percent }) {
  const r = 52;
  const circumference = 2 * Math.PI * r;
  return (
    <div className="relative h-36 w-36 shrink-0">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" className="stroke-gray-900/5" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          className="stroke-zinc-500/80 transition-all duration-700"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - percent / 100)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold tracking-tight">{percent}%</span>
        <span className="text-xs text-gray-500">complete</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { tasks, loading, openNewTask, openEditTask, requestDelete, changeStatus } = useOutletContext();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // Live listener so the name shows up as soon as the profile doc is written on signup
    return onSnapshot(
      doc(db, "users", user.uid),
      (snap) => setProfile(snap.exists() ? snap.data() : null),
      (err) => console.error(err)
    );
  }, [user.uid]);

  const stats = useMemo(() => {
    const today = startOfDay(new Date());
    const weekEnd = addDays(today, 8); // through the end of day 7
    const count = (status) => tasks.filter((t) => t.status === status).length;
    const completed = count("Completed");
    return {
      total: tasks.length,
      completed,
      inProgress: count("In Progress"),
      notStarted: count("Not Started"),
      percent: tasks.length ? Math.round((completed / tasks.length) * 100) : 0,
      overdue: tasks.filter((t) => isOverdue(t)).length,
      upcoming: tasks.filter((t) => t.status !== "Completed" && !isOverdue(t) && t.dueDate >= today && t.dueDate < weekEnd),
    };
  }, [tasks]);

  const name = profile?.firstName || user.displayName || user.email;

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  const segments = [
    { label: "Completed", value: stats.completed, color: "bg-green-500" },
    { label: "In progress", value: stats.inProgress, color: "bg-zinc-500/70" },
    { label: "Not started", value: stats.notStarted, color: "bg-zinc-300" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Hi, {name}</h1>
        </div>
        <Button variant="primary" onClick={() => openNewTask()}>
          <PlusIcon /> Add Task
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total tasks" value={stats.total} accent="bg-zinc-500" />
        <StatCard label="Completed" value={stats.completed} accent="bg-green-500" />
        <StatCard label="In progress" value={stats.inProgress} accent="bg-zinc-400" />
        <StatCard label="Not started" value={stats.notStarted} accent="bg-zinc-300" />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <GlassCard className="p-6 lg:col-span-2">
          <h2 className="font-semibold">Progress</h2>
          <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row lg:flex-col xl:flex-row">
            <ProgressRing percent={stats.percent} />
            <div className="w-full space-y-4">
              <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-gray-900/5">
                {stats.total > 0 &&
                  segments.map((s) => (
                    <div key={s.label} className={`${s.color} transition-all duration-700`} style={{ width: `${(s.value / stats.total) * 100}%` }} />
                  ))}
              </div>
              <ul className="space-y-2 text-sm">
                {segments.map((s) => (
                  <li key={s.label} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-gray-500">
                      <span className={`h-2 w-2 rounded-full ${s.color}`} />
                      {s.label}
                    </span>
                    <span className="font-medium">{s.value}</span>
                  </li>
                ))}
              </ul>
              {stats.overdue > 0 && (
                <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-700 ring-1 ring-red-500/20">
                  {stats.overdue} overdue {stats.overdue === 1 ? "task" : "tasks"}
                </p>
              )}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Upcoming deadlines</h2>
            <span className="text-sm text-gray-500">Next 7 days</span>
          </div>

          {stats.upcoming.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-gray-300/70 p-8 text-center text-sm text-gray-500">
              Nothing due in the next week.{" "}
              <Link to="/tasks" className="font-medium text-zinc-900 underline-offset-2 hover:underline">
                View all tasks
              </Link>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-gray-900/5">
              {stats.upcoming.map((task) => (
                // tabIndex lets a tap (touch has no hover) or Tab reveal the actions via focus-within
                <li key={task.taskId} tabIndex={0} className="group/task relative -mx-3 rounded-xl focus:outline-none">
                  <div className={`flex items-center gap-3 rounded-xl px-3 py-3 group-hover/task:bg-white/60 group-focus-within/task:bg-white/60 ${HOVER_BLUR}`}>
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${PRIORITY_DOT[task.priority]}`} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{task.title}</p>
                      <p className="truncate text-sm text-gray-500">
                        {task.course || "No course"} · {formatWeekday(task.dueDate)}
                        {task.hasTime && ` · ${formatTime(task.dueDate)}`}
                      </p>
                    </div>
                    <div className="hidden shrink-0 items-center gap-2 sm:flex">
                      <PriorityBadge priority={task.priority} />
                      <StatusBadge status={task.status} />
                    </div>
                    <span className="w-20 shrink-0 text-right text-sm font-medium text-gray-700">{relativeDay(task.dueDate)}</span>
                  </div>

                  <TaskHoverActions
                    task={task}
                    onEdit={() => openEditTask(task)}
                    onDelete={() => requestDelete(task)}
                    onToggleDone={() => changeStatus(task, "Completed")}
                  />
                </li>
              ))}
            </ul>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
