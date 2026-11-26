// Pure helper behind the dashboard progress bar (SM-15)
import { assertTaskList, isCompleted } from "./taskList";

export const PROGRESS_EMPTY_MESSAGE = "No tasks yet. Add a task to start tracking your progress.";

// percent is a whole number from 0 to 100, or null when there are no tasks
// (so the UI shows an empty state instead of "0%" or "NaN%")
export function getProgress(tasks) {
  assertTaskList(tasks, "getProgress");
  const total = tasks.length;
  const completed = tasks.filter(isCompleted).length;
  if (total === 0) return { total, completed, percent: null, isEmpty: true, label: PROGRESS_EMPTY_MESSAGE };
  const percent = Math.round((completed / total) * 100);
  return { total, completed, percent, isEmpty: false, label: `${percent}% complete` };
}
