// Small local-time date helpers. Due dates are stored as local midnight of the chosen day.

const pad = (n) => String(n).padStart(2, "0");

export const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

export const startOfWeek = (d) => addDays(d, -d.getDay());

export const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

// "YYYY-MM-DD" in local time; used for <input type="date"> and as a grouping key
export const toDateKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const fromDateKey = (key) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};

// "HH:MM" (24h) for <input type="time">
export const toTimeKey = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

export const formatTime = (d) => d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

export const formatDate = (d) => d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

export const formatWeekday = (d) => d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

// "Today", "Tomorrow", "In 3 days", "2 days ago"
export function relativeDay(d, today = new Date()) {
  const diff = Math.round((startOfDay(d) - startOfDay(today)) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return diff > 0 ? `In ${diff} days` : `${-diff} days ago`;
}
