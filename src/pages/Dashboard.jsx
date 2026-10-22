import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { createTask, deleteTask, subscribeToTasks, taskErrorMessage, updateTask } from "../tasks";
import ConfirmDialog from "../components/ConfirmDialog";
import TaskForm from "../components/TaskForm";
import TaskCard from "../components/TaskCard";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState("");
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState("");
  // null = form closed, { task: null } = creating, { task } = editing that task
  const [formState, setFormState] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Live listener so the name shows up as soon as the profile doc is written on signup
    return onSnapshot(
      doc(db, "users", user.uid),
      (snap) => setProfile(snap.exists() ? snap.data() : null),
      (err) => {
        console.error(err);
        setProfileError("Couldn't load your profile from Firestore.");
      }
    );
  }, [user.uid]);

  useEffect(() => {
    return subscribeToTasks(
      user.uid,
      (list) => {
        setTasks(list);
        setTasksLoading(false);
      },
      (err) => {
        console.error(err);
        setTasksError("Couldn't load your tasks from Firestore.");
        setTasksLoading(false);
      }
    );
  }, [user.uid]);

  // Success message fades after a few seconds
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 3000);
    return () => clearTimeout(timer);
  }, [notice]);

  const courseGroups = useMemo(() => groupByCourse(tasks), [tasks]);
  const courseNames = useMemo(() => courseGroups.filter((g) => g.name).map((g) => g.name), [courseGroups]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleSave = async (task) => {
    if (formState.task) {
      await updateTask(user.uid, formState.task.id, task, formState.task.updatedAt);
      setNotice("Task updated.");
    } else {
      await createTask(user.uid, task);
      setNotice("Task created.");
    }
    setFormState(null);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteTask(user.uid, taskToDelete.id);
      setNotice("Task deleted.");
    } catch (err) {
      console.error(err);
      setTasksError(taskErrorMessage(err));
    } finally {
      setDeleting(false);
      setTaskToDelete(null);
    }
  };

  const name = profile?.firstName || user.displayName || user.email;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <span className="font-semibold text-slate-900">Student Task Tracker</span>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-slate-500 sm:inline">{user.email}</span>
            <button
              onClick={() => setConfirmingLogout(true)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Hi, {name} 👋</h1>
            <p className="mt-2 text-slate-600">Here are your tasks, organized by course.</p>
          </div>
          <button
            onClick={() => setFormState({ task: null })}
            className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            + Add task
          </button>
        </div>

        {profileError && (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {profileError}
          </p>
        )}

        {tasksError && (
          <div role="alert" className="mt-4 flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <span>{tasksError}</span>
            <button onClick={() => setTasksError("")} aria-label="Dismiss" className="font-medium hover:text-red-900">
              ✕
            </button>
          </div>
        )}

        {tasksLoading ? (
          <div className="mt-8 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="mt-8 rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center text-slate-500">
            No tasks yet. Click <span className="font-medium text-slate-700">+ Add task</span> to create your first one.
          </div>
        ) : (
          <div className="mt-8 space-y-10">
            {courseGroups.map((group, i) => (
              <section key={group.key} aria-labelledby={`course-${i}`}>
                <h2 id={`course-${i}`} className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                  {group.name || "No course"}
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
                    {group.tasks.length}
                  </span>
                </h2>
                <ul className="mt-3 grid gap-4 sm:grid-cols-2">
                  {group.tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={(t) => setFormState({ task: t })}
                      onDelete={setTaskToDelete}
                    />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </main>

      {notice && (
        <div role="status" className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">
          {notice}
        </div>
      )}

      {formState && (
        <TaskForm
          initialTask={formState.task}
          courses={courseNames}
          onSubmit={handleSave}
          onCancel={() => setFormState(null)}
        />
      )}

      {taskToDelete && (
        <ConfirmDialog
          title="Delete task?"
          message={`"${taskToDelete.title}" will be permanently deleted. This can't be undone.`}
          confirmText={deleting ? "Deleting..." : "Delete"}
          danger
          busy={deleting}
          onConfirm={handleDelete}
          onCancel={() => setTaskToDelete(null)}
        />
      )}

      {confirmingLogout && (
        <ConfirmDialog
          title="Log out?"
          message="Are you sure you want to log out?"
          confirmText="Log out"
          onConfirm={handleLogout}
          onCancel={() => setConfirmingLogout(false)}
        />
      )}
    </div>
  );
}

// One section per course (case-insensitive, so "cps 714" and "CPS 714" land together).
// Courses are listed A-Z with tasks that have no course at the end.
function groupByCourse(tasks) {
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
