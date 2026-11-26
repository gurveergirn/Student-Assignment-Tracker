// Local-time date helpers. Every date shown in the app is a calendar day in the user's own timezone.

const pad = (n) => String(n).padStart(2, "0");
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
// Weeks start on Sunday
export const startOfWeek = (d) => addDays(d, -d.getDay());

// "YYYY-MM-DD" for a Date in local time. Keys compare correctly as plain strings.
export const toDateKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function fromDateKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// Turns a stored due date into a local "YYYY-MM-DD" key, or null if it can't be read.
// - "2026-11-20" (what the task form saves) is already a local calendar day. It must NOT go through
//   new Date("2026-11-20"), which reads it as UTC midnight and shows the day before west of UTC.
// - Full timestamps ("2026-11-20T04:59:00Z", Date, Firestore Timestamp, epoch ms) are converted
//   from UTC to the user's local day.
export function toLocalDateKey(value) {
  if (value == null || value === "") return null;
  if (typeof value === "string" && DATE_ONLY.test(value)) {
    const date = fromDateKey(value);
    return toDateKey(date) === value ? value : null; // rejects 2026-02-31
  }
  let date;
  if (value instanceof Date) date = value;
  else if (typeof value.toDate === "function") date = value.toDate(); // Firestore Timestamp
  else if (typeof value === "string" || typeof value === "number") date = new Date(value);
  else return null;
  return Number.isNaN(date.getTime()) ? null : toDateKey(date);
}

// Whole days from `today` to `key` (negative = in the past)
export function daysUntil(key, today = new Date()) {
  return Math.round((fromDateKey(key) - startOfDay(today)) / 86_400_000);
}

// "Today", "Tomorrow", "In 3 days", "Yesterday", "4 days ago"
export function relativeDay(key, today = new Date()) {
  const diff = daysUntil(key, today);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return diff > 0 ? `In ${diff} days` : `${-diff} days ago`;
}
