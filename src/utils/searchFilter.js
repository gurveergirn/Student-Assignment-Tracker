// Pure helper behind the task list search bar and filters (SM-14)
import { assertTaskList } from "./taskList";

// Keeps tasks that match every active filter:
// - search: case-insensitive substring of the title (blank = no search)
// - course: exact course name, ignoring case and surrounding spaces (blank = all courses)
// - status: exact status (blank = all statuses)
export function filterTasks(tasks, { search = "", course = "", status = "" } = {}) {
  assertTaskList(tasks, "filterTasks");
  const keyword = search.trim().toLowerCase();
  const courseKey = course.trim().toLowerCase();
  return tasks.filter(
    (task) =>
      (!keyword || (task.title ?? "").toLowerCase().includes(keyword)) &&
      (!courseKey || (task.course ?? "").trim().toLowerCase() === courseKey) &&
      (!status || task.status === status)
  );
}
