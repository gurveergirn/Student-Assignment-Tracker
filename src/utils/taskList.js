// Shared guards for the pure task helpers in src/utils/
export const COMPLETED = "Completed";
export const IN_PROGRESS = "In Progress";

export const isCompleted = (task) => task.status === COMPLETED;

// Every helper takes the live task array. Anything else (null, an object, a string) is a bug
// in the caller, so fail loudly instead of returning a misleading count or empty list.
export function assertTaskList(tasks, fnName) {
  if (!Array.isArray(tasks)) {
    const got = tasks === null ? "null" : typeof tasks;
    throw new TypeError(`${fnName} expects an array of tasks, got ${got}`);
  }
}
