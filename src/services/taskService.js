import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";

// Tasks are stored at users/{uid}/tasks/{taskId}
const tasksCollection = (uid) => collection(db, "users", uid, "tasks");

// Firestore Timestamps -> JS Dates so the UI never has to think about them.
// "estimate" fills in pending serverTimestamps with the local time until the write is confirmed.
function fromSnapshot(snap) {
  const data = snap.data({ serverTimestamps: "estimate" });
  return {
    ...data,
    taskId: snap.id,
    dueDate: data.dueDate?.toDate() ?? null,
    hasTime: data.hasTime ?? false, // false = all-day; older tasks predate the field
    createdAt: data.createdAt?.toDate() ?? null,
    updatedAt: data.updatedAt?.toDate() ?? null,
  };
}

function toFirestore({ title, description, dueDate, hasTime, priority, course, status }) {
  return {
    title: title.trim(),
    description: description.trim(),
    dueDate: Timestamp.fromDate(dueDate),
    hasTime,
    priority,
    course: course.trim(),
    status,
  };
}

// Live listener for all of a user's tasks, soonest due first. Returns the unsubscribe function.
export function subscribeToTasks(uid, onData, onError) {
  const q = query(tasksCollection(uid), orderBy("dueDate", "asc"));
  return onSnapshot(q, (snapshot) => onData(snapshot.docs.map(fromSnapshot)), onError);
}

export async function createTask(uid, task) {
  const ref = doc(tasksCollection(uid));
  await setDoc(ref, {
    taskId: ref.id,
    ...toFirestore(task),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export function updateTask(uid, taskId, task) {
  return updateDoc(doc(tasksCollection(uid), taskId), {
    ...toFirestore(task),
    updatedAt: serverTimestamp(),
  });
}

export function deleteTask(uid, taskId) {
  return deleteDoc(doc(tasksCollection(uid), taskId));
}
