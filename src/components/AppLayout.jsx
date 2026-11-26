import { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { createTask, deleteTask, markTaskComplete, subscribeToTasks, taskErrorMessage, updateTask } from "../tasks";
import { groupByCourse } from "../utils/courses";
import ConfirmDialog from "./ConfirmDialog";
import TaskForm from "./TaskForm";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: "M3 12l9-9 9 9M5 10v10h5v-6h4v6h5V10" },
  { to: "/tasks", label: "Tasks", icon: "M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" },
  { to: "/calendar", label: "Calendar", icon: "M8 3v4M16 3v4M4 9h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z" },
];

const navPill = ({ isActive }) =>
  `inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-indigo-600/90 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),0_6px_16px_-6px_rgba(79,70,229,0.5)]"
      : "text-slate-700 hover:bg-white/70"
  }`;

// Shell for every signed-in page: frosted nav, ONE live Firestore listener for the user's tasks,
// and the shared add/edit/delete/logout dialogs. Pages read it all with useOutletContext().
export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState("");
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState("");
  // null = form closed, { task: null, defaultDueDate } = creating, { task } = editing that task
  const [formState, setFormState] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [notice, setNotice] = useState("");

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
    // Real-time listener: every page (stats, progress, calendar, list) re-renders when a task changes
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

  const courseNames = useMemo(() => groupByCourse(tasks).filter((g) => g.name).map((g) => g.name), [tasks]);

  const openNewTask = useCallback((defaultDueDate = "") => setFormState({ task: null, defaultDueDate }), []);
  const openEditTask = useCallback((task) => setFormState({ task }), []);
  const requestDelete = useCallback((task) => setTaskToDelete(task), []);
  const completeTask = useCallback(
    async (task) => {
      try {
        await markTaskComplete(user.uid, task);
        setNotice("Task completed.");
      } catch (err) {
        console.error(err);
        setTasksError(taskErrorMessage(err));
      }
    },
    [user.uid]
  );

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

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const name = profile?.firstName || user.displayName || user.email;

  return (
    <div className="relative min-h-screen bg-[#e9ecf3] text-slate-800">
      {/* Soft shapes behind everything; the frosted panels blur these */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-32 h-[34rem] w-[34rem] rounded-full bg-white blur-3xl" />
        <div className="absolute top-1/4 -right-40 h-[30rem] w-[30rem] rounded-full bg-indigo-300/35 blur-3xl" />
        <div className="absolute -bottom-48 left-1/5 h-[32rem] w-[32rem] rounded-full bg-sky-200/60 blur-3xl" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/60 bg-white/45 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)] backdrop-blur-2xl backdrop-saturate-150">
        <nav aria-label="Main" className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <NavLink to="/dashboard" className="flex min-w-0 items-center gap-2.5 rounded-xl">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600/90 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]">
              <Icon d="M9 12l2 2 4-4M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
            </span>
            <span className="hidden font-semibold tracking-tight text-slate-900 md:inline">Student Task Tracker</span>
          </NavLink>

          {/* Labels collapse to icons on phones so all four buttons fit */}
          <div className="flex items-center gap-1 rounded-2xl border border-white/60 bg-white/40 p-1 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.85)]">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} className={navPill} aria-label={item.label}>
                <Icon d={item.icon} />
                <span className="hidden sm:inline">{item.label}</span>
              </NavLink>
            ))}
            <button
              onClick={() => setConfirmingLogout(true)}
              aria-label="Log out"
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-white/70 hover:text-red-600"
            >
              <Icon d="M15 12H4m0 0l4-4m-4 4l4 4M14 4h4a2 2 0 012 2v12a2 2 0 01-2 2h-4" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </nav>
      </header>

      <main className="relative mx-auto max-w-5xl px-4 py-8 sm:py-10">
        {profileError && (
          <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-2 text-sm text-amber-800">{profileError}</p>
        )}
        {tasksError && (
          <div role="alert" className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50/80 px-3 py-2 text-sm text-red-700">
            <span>{tasksError}</span>
            <button onClick={() => setTasksError("")} aria-label="Dismiss" className="font-medium hover:text-red-900">
              ✕
            </button>
          </div>
        )}
        <Outlet
          context={{ user, name, tasks, tasksLoading, courseNames, openNewTask, openEditTask, requestDelete, completeTask }}
        />
      </main>

      {notice && (
        <div role="status" className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-xl bg-slate-900/85 px-4 py-2 text-sm text-white shadow-lg backdrop-blur-md">
          {notice}
        </div>
      )}

      {formState && (
        <TaskForm
          initialTask={formState.task}
          defaultDueDate={formState.defaultDueDate}
          courses={courseNames} onSubmit={handleSave} onCancel={() => setFormState(null)} />
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

function Icon({ d }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}
