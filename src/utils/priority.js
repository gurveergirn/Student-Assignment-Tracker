// Badge colours for each priority: Low = green, Medium = amber, High = red
export const PRIORITY_STYLES = {
  Low: "bg-green-100 text-green-800 ring-green-200",
  Medium: "bg-amber-100 text-amber-800 ring-amber-200",
  High: "bg-red-100 text-red-800 ring-red-200",
};

// Tailwind classes for a priority badge (undefined for an unknown priority, same as the old inline lookup)
export function priorityStyle(priority) {
  return PRIORITY_STYLES[priority];
}
