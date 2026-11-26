import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { SORT_OPTIONS, STATUSES, sortTasks } from "../tasks";
import { groupByCourse } from "../utils/courses";
import { filterTasks } from "../utils/searchFilter";
import { GLASS_INPUT } from "../theme";
import TaskCard from "../components/TaskCard";
import Spinner from "../components/Spinner";

export default function Tasks() {
  const { tasks, tasksLoading, courseNames, openNewTask, openEditTask, requestDelete, completeTask } = useOutletContext();
  const [sortBy, setSortBy] = useState("course");
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // If the selected course no longer exists (its last task was deleted or renamed), stop filtering by it
  const activeCourse = courseNames.some((c) => c.toLowerCase() === courseFilter.toLowerCase()) ? courseFilter : "";
  const filtersActive = Boolean(search.trim() || activeCourse || statusFilter);

  const filteredTasks = useMemo(
    () => filterTasks(tasks, { search, course: activeCourse, status: statusFilter }),
    [tasks, search, activeCourse, statusFilter]
  );
  const courseGroups = useMemo(() => groupByCourse(filteredTasks), [filteredTasks]);
  const sortedTasks = useMemo(() => sortTasks(filteredTasks, sortBy), [filteredTasks, sortBy]);

  const clearFilters = () => {
    setSearch("");
    setCourseFilter("");
    setStatusFilter("");
  };

  const renderCard = (task) => (
    <TaskCard key={task.id} task={task} onEdit={openEditTask} onDelete={requestDelete} onComplete={completeTask} />
  );

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">My tasks</h1>
          <p className="mt-2 text-slate-600">
            {sortBy === "course" ? "Your tasks, organized by course." : "All of your tasks."}
          </p>
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
      ) : tasks.length === 0 ? (
        <div className="mt-8 rounded-3xl border-2 border-dashed border-white/80 bg-white/40 p-12 text-center text-slate-500 backdrop-blur-xl">
          No tasks yet. Click <span className="font-medium text-slate-700">+ Add task</span> to create your first one.
        </div>
      ) : (
        <>
          <div role="search" className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="task-search" className="sr-only">
                Search tasks by title
              </label>
              <input
                id="task-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title…"
                className={`w-full ${GLASS_INPUT}`}
              />
            </div>
            <FilterSelect id="task-course-filter" label="Filter by course" value={activeCourse} onChange={setCourseFilter}>
              <option value="">All courses</option>
              {courseNames.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </FilterSelect>
            <FilterSelect id="task-status-filter" label="Filter by status" value={statusFilter} onChange={setStatusFilter}>
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </FilterSelect>
            <FilterSelect id="task-sort" label="Sort tasks" value={sortBy} onChange={setSortBy} className="col-span-2 sm:col-span-1">
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FilterSelect>
          </div>

          {filtersActive && (
            <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-600" aria-live="polite">
              Showing {filteredTasks.length} of {tasks.length} tasks
              <button onClick={clearFilters} className="font-medium text-indigo-700 hover:text-indigo-900">
                Clear filters
              </button>
            </p>
          )}

          {filteredTasks.length === 0 ? (
            <div className="mt-6 rounded-3xl border-2 border-dashed border-white/80 bg-white/40 p-10 text-center text-slate-500 backdrop-blur-xl">
              No tasks match your search and filters.
            </div>
          ) : sortBy === "course" ? (
            <div className="mt-6 space-y-10">
              {courseGroups.map((group, i) => (
                <section key={group.key} aria-labelledby={`course-${i}`}>
                  <h2 id={`course-${i}`} className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                    {group.name || "No course"}
                    <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-white">
                      {group.tasks.length}
                    </span>
                  </h2>
                  <ul className="mt-3 flex flex-col gap-3">{group.tasks.map(renderCard)}</ul>
                </section>
              ))}
            </div>
          ) : (
            <ul className="mt-6 flex flex-col gap-3">{sortedTasks.map(renderCard)}</ul>
          )}
        </>
      )}
    </>
  );
}

function FilterSelect({ id, label, value, onChange, className = "", children }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={`w-full ${GLASS_INPUT}`}>
        {children}
      </select>
    </div>
  );
}
