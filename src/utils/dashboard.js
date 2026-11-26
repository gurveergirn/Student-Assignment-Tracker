// Pure helpers behind the dashboard (SM-13). Dates are compared as local "YYYY-MM-DD" keys.
import { addDays, startOfDay, toDateKey, toLocalDateKey } from "./dates";
import { COMPLETED, IN_PROGRESS, assertTaskList, isCompleted } from "./taskList";

export const UPCOMING_DAYS = 7;

export const STAT_LABELS = {
  total: "Total tasks",
  completed: "Completed",
  inProgress: "In progress",
  notStarted: "Not started",
};

// Which stat bucket a task counts in. A missing or unknown status counts as Not Started,
// the same default subscribeToTasks() applies to older tasks.
function statKeyOf(task) {
  if (task.status === COMPLETED) return "completed";
  if (task.status === IN_PROGRESS) return "inProgress";
  return "notStarted";
}

// Counts for the stat cards and the status chart
export function getTaskStats(tasks) {
  assertTaskList(tasks, "getTaskStats");
  const stats = { total: tasks.length, completed: 0, inProgress: 0, notStarted: 0 };
  for (const task of tasks) stats[statKeyOf(task)]++;
  return stats;
}

// The tasks behind one stat card ("total" = all of them), using the same rules as getTaskStats
export function getTasksForStat(tasks, key) {
  assertTaskList(tasks, "getTasksForStat");
  return key === "total" ? [...tasks] : tasks.filter((task) => statKeyOf(task) === key);
}

// Unfinished tasks due from today up to and including `days` days from today, nearest first
export function getUpcomingTasks(tasks, now = new Date(), days = UPCOMING_DAYS) {
  assertTaskList(tasks, "getUpcomingTasks");
  const today = toDateKey(now);
  const last = toDateKey(addDays(startOfDay(now), days));
  return withDueKeys(tasks)
    .filter(({ task, key }) => !isCompleted(task) && key >= today && key <= last)
    .sort(byDueKey)
    .map(({ task }) => task);
}

// Unfinished tasks whose due date is before today, most overdue first.
// A task due today is not overdue yet.
export function getOverdueTasks(tasks, now = new Date()) {
  assertTaskList(tasks, "getOverdueTasks");
  const today = toDateKey(now);
  return withDueKeys(tasks)
    .filter(({ task, key }) => !isCompleted(task) && key < today)
    .sort(byDueKey)
    .map(({ task }) => task);
}

// Pairs each task with its local due-date key, dropping tasks whose date can't be read
function withDueKeys(tasks) {
  return tasks.map((task) => ({ task, key: toLocalDateKey(task.dueDate) })).filter(({ key }) => key);
}

function byDueKey(a, b) {
  return a.key.localeCompare(b.key) || (a.task.title ?? "").localeCompare(b.task.title ?? "");
}
