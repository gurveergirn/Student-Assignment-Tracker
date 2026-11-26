import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { sortTasks } from "../tasks";
import {
  STAT_LABELS,
  UPCOMING_DAYS,
  getOverdueTasks,
  getTaskStats,
  getTasksForStat,
  getUpcomingTasks,
} from "../utils/dashboard";
import { getProgress } from "../utils/progress";
import StatCards from "../components/StatCards";
import StatusDonut from "../components/StatusDonut";
import TaskListDialog from "../components/TaskListDialog";
import ProgressBar from "../components/ProgressBar";
import DeadlineList from "../components/DeadlineList";
import Spinner from "../components/Spinner";

// Landing page after login. Everything here is derived from the live task list in AppLayout,
// so it updates as soon as a task is added, edited, completed or deleted.
export default function Dashboard() {
  const { name, tasks, tasksLoading, openNewTask, openEditTask, requestDelete, completeTask } = useOutletContext();
  const [openStat, setOpenStat] = useState(null); // stat card / chart segment whose task list is open

  // Cheap to compute, and recomputing each render keeps "today" current
  const stats = getTaskStats(tasks);
  const progress = getProgress(tasks);
  const upcoming = getUpcomingTasks(tasks);
  const overdue = getOverdueTasks(tasks);

  // Completing keeps the list open (it updates live); edit and delete hand off to their own dialogs
  const editFromList = (task) => {
    setOpenStat(null);
    openEditTask(task);
  };
  const deleteFromList = (task) => {
    setOpenStat(null);
    requestDelete(task);
  };

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="break-words text-3xl font-bold tracking-tight text-slate-900">Hi, {name} 👋</h1>
          <p className="mt-2 text-slate-600">Here's where things stand.</p>
        </div>
        <button
          onClick={() => openNewTask()}
          className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          + Add task
        </button>
      </div>

      {tasksLoading ? (
        <Spinner />
      ) : (
        <div className="mt-8 space-y-4 sm:space-y-6">
          <StatusDonut stats={stats} onSelect={setOpenStat} />
          <ProgressBar progress={progress} />
          <StatCards stats={stats} onSelect={setOpenStat} />
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
            <DeadlineList
              id="overdue-heading"
              title="Overdue"
              tone="overdue"
              tasks={overdue}
              emptyText="Nothing overdue. Nice work!"
              onSelect={openEditTask}
              onComplete={completeTask}
            />
            <DeadlineList
              id="upcoming-heading"
              title={`Due in the next ${UPCOMING_DAYS} days`}
              tasks={upcoming}
              emptyText={`Nothing due in the next ${UPCOMING_DAYS} days.`}
              onSelect={openEditTask}
              onComplete={completeTask}
            />
          </div>
        </div>
      )}

      {openStat && (
        <TaskListDialog
          title={STAT_LABELS[openStat]}
          tasks={sortTasks(getTasksForStat(tasks, openStat), "deadline")}
          emptyText="No tasks here."
          showDueDate
          onEditTask={editFromList}
          onDeleteTask={deleteFromList}
          onCompleteTask={completeTask}
          onClose={() => setOpenStat(null)}
        />
      )}
    </>
  );
}
