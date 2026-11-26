// One section per course (case-insensitive, so "cps 714" and "CPS 714" land together).
// Courses are listed A-Z with tasks that have no course at the end.
export function groupByCourse(tasks) {
  const groups = new Map();
  for (const task of tasks) {
    const name = task.course?.trim() || "";
    const key = name.toUpperCase();
    if (!groups.has(key)) groups.set(key, { key: key || "__no_course__", name, tasks: [] });
    groups.get(key).tasks.push(task);
  }
  return [...groups.values()].sort((a, b) => {
    if (!a.name) return 1;
    if (!b.name) return -1;
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });
  });
}
