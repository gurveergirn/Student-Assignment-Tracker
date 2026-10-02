export const PRIORITIES = ["Low", "Medium", "High"];
export const STATUSES = ["Not Started", "In Progress", "Completed"];

export const PRIORITY_BADGE = {
  High: "bg-red-500/10 text-red-700 ring-red-500/20",
  Medium: "bg-amber-400/15 text-amber-700 ring-amber-500/25",
  Low: "bg-green-500/10 text-green-700 ring-green-500/20",
};

export const PRIORITY_DOT = {
  High: "bg-red-500",
  Medium: "bg-amber-400",
  Low: "bg-green-500",
};

export const STATUS_BADGE = {
  "Not Started": "bg-gray-500/10 text-gray-600 ring-gray-500/15",
  "In Progress": "bg-zinc-700/70 text-white ring-white/30 backdrop-blur-md",
  Completed: "bg-green-500/10 text-green-700 ring-green-500/20",
};

// Timed tasks are overdue once their time passes; all-day tasks once their day ends
export function isOverdue(task, now = new Date()) {
  if (task.status === "Completed" || !task.dueDate) return false;
  const cutoff = task.hasTime ? now : new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return task.dueDate < cutoff;
}

// Courses are free text, so "CPS 714" and "cps 714 " should count as the same course
export const courseKey = (course = "") => course.trim().toLowerCase();
