import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export const PRIORITIES = ["Low", "Medium", "High"];
export const STATUSES = ["Not Started", "In Progress", "Completed"];

// Keep these in sync with isValidTask() in firestore.rules
export const LIMITS = { title: 100, description: 1000, course: 50 };

// Tasks live under each user's own doc: users/{uid}/tasks/{taskId}
const tasksCollection = (uid) => collection(db, "users", uid, "tasks");

// Live list of the user's tasks, newest first
export function subscribeToTasks(uid, onChange, onError) {
  const q = query(tasksCollection(uid), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) =>
      onChange(
        // "estimate" fills in createdAt/updatedAt while a local write is still pending
        snap.docs.map((d) => ({ id: d.id, ...d.data({ serverTimestamps: "estimate" }) }))
      ),
    onError
  );
}

export function createTask(uid, task) {
  return addDoc(tasksCollection(uid), {
    ...task,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

// Refuses to save if the task was changed somewhere else after the edit form was opened,
// so one open tab can't silently overwrite another's changes
export function updateTask(uid, taskId, task, loadedUpdatedAt) {
  const ref = doc(tasksCollection(uid), taskId);
  return runTransaction(db, async (transaction) => {
    const snap = await transaction.get(ref);
    if (!snap.exists()) throw taskError("not-found");

    const currentUpdatedAt = snap.data().updatedAt;
    if (loadedUpdatedAt && currentUpdatedAt && !currentUpdatedAt.isEqual(loadedUpdatedAt)) {
      throw taskError("stale");
    }

    transaction.update(ref, { ...task, updatedAt: serverTimestamp() });
  });
}

export function deleteTask(uid, taskId) {
  return deleteDoc(doc(tasksCollection(uid), taskId));
}

function taskError(code) {
  const err = new Error(code);
  err.code = code;
  return err;
}

export function taskErrorMessage(err) {
  switch (err?.code) {
    case "stale":
      return "This task was changed in another tab or window. Cancel and reopen it to see the latest version.";
    case "not-found":
      return "This task no longer exists. It may have been deleted somewhere else.";
    case "permission-denied":
      return "Firestore blocked this change. Check that the latest firestore.rules are published.";
    case "unavailable":
      return "Couldn't reach the server. Check your connection and try again.";
    default:
      return "Something went wrong saving your task. Please try again.";
  }
}

// Today's date as YYYY-MM-DD in the user's local timezone (matches <input type="date">)
export function todayString() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function isValidDateString(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

export function isPastDate(value) {
  return isValidDateString(value) && value < todayString();
}

export function formatDueDate(value) {
  if (!isValidDateString(value)) return value;
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Trims the form values and checks them. Returns the cleaned task and any field errors.
export function validateTask(values) {
  const task = {
    title: values.title.trim(),
    description: values.description.trim(),
    dueDate: values.dueDate,
    priority: values.priority,
    status: values.status,
    course: values.course.trim(),
  };
  const errors = {};

  if (!task.title) errors.title = "Title is required.";
  else if (task.title.length > LIMITS.title) errors.title = `Title must be ${LIMITS.title} characters or less.`;

  if (task.description.length > LIMITS.description)
    errors.description = `Description must be ${LIMITS.description} characters or less.`;

  if (!task.dueDate) errors.dueDate = "Due date is required.";
  else if (!isValidDateString(task.dueDate)) errors.dueDate = "Enter a valid date.";

  if (!PRIORITIES.includes(task.priority)) errors.priority = "Choose a priority.";
  if (!STATUSES.includes(task.status)) errors.status = "Choose a status.";

  if (task.course.length > LIMITS.course) errors.course = `Course must be ${LIMITS.course} characters or less.`;

  return { task, errors };
}
