import { useCallback, useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createTask, deleteTask, setTaskStatus, subscribeToTasks, updateTask } from "../services/taskService";
import TaskFormModal from "./TaskFormModal";
import ConfirmDialog from "./ConfirmDialog";
import { GLASS_ACCENT } from "../lib/glass";
import { CalendarIcon, HomeIcon, ListIcon, LogoIcon, LogoutIcon } from "./icons";

const navPill = ({ isActive }) =>
  `inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
    isActive ? GLASS_ACCENT : "border border-transparent text-gray-700 hover:bg-white/70"
  }`;

// Shell for every signed-in page: frosted nav, one live task subscription,
// and the shared add/edit/delete dialogs. Pages read all of it via useOutletContext().
export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(null); // { task?, defaultDate? } while the form is open
  const [pendingDelete, setPendingDelete] = useState(null);
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  useEffect(
    () =>
      subscribeToTasks(
        user.uid,
        (data) => {
          setTasks(data);
          setError("");
          setLoading(false);
        },
        (err) => {
          console.error(err);
          setError("Couldn't load your tasks from Firestore.");
          setLoading(false);
        }
      ),
    [user.uid]
  );

  const openNewTask = useCallback((defaultDate) => setForm({ defaultDate }), []);
  const openEditTask = useCallback((task) => setForm({ task }), []);
  const requestDelete = useCallback((task) => setPendingDelete(task), []);
  const changeStatus = useCallback(
    (task, status) =>
      setTaskStatus(user.uid, task, status).catch((err) => {
        console.error(err);
        setError("Couldn't update the task. Please try again.");
      }),
    [user.uid]
  );
  const closeForm = useCallback(() => setForm(null), []);
  const closeDelete = useCallback(() => setPendingDelete(null), []);
  const closeLogout = useCallback(() => setConfirmingLogout(false), []);

  const handleSave = (fields) =>
    form.task ? updateTask(user.uid, form.task.taskId, fields) : createTask(user.uid, fields);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="relative min-h-screen bg-[#e8eaee] font-sans text-gray-900">
      {/* Soft neutral shapes behind everything; the frosted panels blur these, like iOS glass over a wallpaper */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-32 h-[34rem] w-[34rem] rounded-full bg-white blur-3xl" />
        <div className="absolute top-1/4 -right-40 h-[30rem] w-[30rem] rounded-full bg-zinc-400/35 blur-3xl" />
        <div className="absolute -bottom-48 left-1/5 h-[32rem] w-[32rem] rounded-full bg-slate-300/60 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-white/80 blur-3xl" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/60 bg-white/45 shadow-[0_1px_0_rgba(0,0,0,0.04),0_8px_30px_-12px_rgba(0,0,0,0.1)] backdrop-blur-2xl backdrop-saturate-150">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <NavLink to="/dashboard" className="flex items-center gap-2.5 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/25">
            <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${GLASS_ACCENT}`}>
              <LogoIcon className="h-5 w-5" />
            </span>
            <span className="hidden font-semibold tracking-tight sm:inline">Student Task Tracker</span>
          </NavLink>

          <div className="flex items-center gap-1 rounded-2xl border border-white/60 bg-white/40 p-1 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.85)]">
            {/* Labels collapse to icons on phones so all four buttons fit */}
            <NavLink to="/dashboard" className={navPill} aria-label="Dashboard">
              <HomeIcon />
              <span className="hidden sm:inline">Dashboard</span>
            </NavLink>
            <NavLink to="/tasks" className={navPill} aria-label="My Tasks">
              <ListIcon />
              <span className="hidden sm:inline">My Tasks</span>
            </NavLink>
            <NavLink to="/calendar" className={navPill} aria-label="Calendar">
              <CalendarIcon />
              <span className="hidden sm:inline">Calendar</span>
            </NavLink>
            <button
              type="button"
              onClick={() => setConfirmingLogout(true)}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-white/70 hover:text-red-600"
              aria-label="Log out"
            >
              <LogoutIcon />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </nav>
      </header>

      <main className="relative mx-auto max-w-6xl px-4 py-8">
        {error && (
          <p className="mb-6 rounded-xl bg-amber-400/15 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-500/25">{error}</p>
        )}
        <Outlet context={{ tasks, loading, openNewTask, openEditTask, requestDelete, changeStatus }} />
      </main>

      {form && (
        <TaskFormModal
          task={form.task}
          defaultDate={form.defaultDate}
          onSave={handleSave}
          onClose={closeForm}
          onDelete={
            form.task &&
            (() => {
              setPendingDelete(form.task);
              setForm(null);
            })
          }
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete task?"
          message={`"${pendingDelete.title}" will be permanently deleted. This can't be undone.`}
          onConfirm={() => deleteTask(user.uid, pendingDelete.taskId)}
          onClose={closeDelete}
        />
      )}

      {confirmingLogout && (
        <ConfirmDialog
          title="Log out?"
          message="Are you sure you want to log out? You'll need to sign in again to see your tasks."
          confirmLabel="Log out"
          busyLabel="Logging out…"
          onConfirm={handleLogout}
          onClose={closeLogout}
        />
      )}
    </div>
  );
}
