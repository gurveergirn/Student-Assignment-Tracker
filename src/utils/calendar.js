// Pure helpers for the calendar page (SM-12)
import { addDays, startOfWeek, toLocalDateKey } from "./dates";

// Every day shown in a month grid: whole weeks (Sunday to Saturday) covering the month
export function getMonthDays(viewDate) {
  const first = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const last = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
  const days = [];
  for (let d = startOfWeek(first); d <= last || d.getDay() !== 0; d = addDays(d, 1)) days.push(d);
  return days;
}

// The 7 days (Sunday to Saturday) of the week containing viewDate
export function getWeekDays(viewDate) {
  const start = startOfWeek(viewDate);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

// Map of local "YYYY-MM-DD" -> tasks due that day (unfinished first, then by title).
// Tasks with an unreadable due date are left off the calendar.
export function groupTasksByDate(tasks) {
  const byDate = new Map();
  for (const task of tasks) {
    const key = toLocalDateKey(task.dueDate);
    if (!key) continue;
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key).push(task);
  }
  const done = (t) => (t.status === "Completed" ? 1 : 0);
  for (const list of byDate.values()) {
    list.sort((a, b) => done(a) - done(b) || (a.title ?? "").localeCompare(b.title ?? ""));
  }
  return byDate;
}

// Splits a day's tasks so the cell never grows past `max` rows: if they don't all fit,
// show max - 1 tasks and a "+X more" row in the last slot
export function splitForCell(list, max) {
  if (list.length <= max) return { visible: list, hiddenCount: 0 };
  return { visible: list.slice(0, max - 1), hiddenCount: list.length - (max - 1) };
}
