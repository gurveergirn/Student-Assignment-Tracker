import { useState } from "react";
import { Button, Modal } from "./ui";
import { PRIORITIES, STATUSES } from "../lib/taskMeta";
import { fromDateKey, toDateKey, toTimeKey } from "../lib/dates";

const inputClass =
  "w-full rounded-xl border border-white/70 bg-white/60 px-3 py-2 text-gray-900 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-black/5 backdrop-blur-md transition-all duration-200 placeholder:text-gray-400 focus:bg-white/90 focus:outline-none focus:ring-2 focus:ring-zinc-900/20";

function Field({ label, htmlFor, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
    </div>
  );
}

// Add/edit form. Pass `task` to edit, or `defaultDate` to pre-fill a new task's due date.
export default function TaskFormModal({ task, defaultDate, onSave, onDelete, onClose }) {
  const isEdit = Boolean(task);
  const [form, setForm] = useState(() => ({
    title: task?.title ?? "",
    description: task?.description ?? "",
    dueDate: toDateKey(task?.dueDate ?? defaultDate ?? new Date()),
    dueTime: task?.hasTime ? toTimeKey(task.dueDate) : "", // "" = all day
    priority: task?.priority ?? "Medium",
    course: task?.course ?? "",
    status: task?.status ?? "Not Started",
  }));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError("Please give the task a title.");
    if (!form.dueDate) return setError("Please pick a due date.");

    setError("");
    setSaving(true);
    try {
      const { dueTime, ...fields } = form;
      const dueDate = fromDateKey(form.dueDate);
      if (dueTime) {
        const [h, m] = dueTime.split(":").map(Number);
        dueDate.setHours(h, m);
      }
      await onSave({ ...fields, dueDate, hasTime: Boolean(dueTime) });
      onClose();
    } catch (err) {
      console.error(err);
      setError(
        err.code === "permission-denied"
          ? "Firestore rejected the save (permission denied). Check that the latest firestore.rules are published."
          : "Couldn't save the task. Please try again."
      );
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? "Edit task" : "New task"} onClose={onClose}>
      <h2 className="text-lg font-semibold text-gray-900">{isEdit ? "Edit task" : "New task"}</h2>
      {isEdit && task.updatedAt && (
        <p className="mt-0.5 text-xs text-gray-500">Last updated {task.updatedAt.toLocaleString()}</p>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {error && (
          <div role="alert" className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-700 ring-1 ring-red-500/20">
            {error}
          </div>
        )}

        <Field label="Title" htmlFor="task-title">
          <input id="task-title" className={inputClass} value={form.title} onChange={set("title")} maxLength={200} placeholder="e.g. Lab report 3" autoFocus required />
        </Field>

        <Field label="Description" htmlFor="task-description">
          <textarea id="task-description" className={`${inputClass} min-h-24 resize-y`} value={form.description} onChange={set("description")} maxLength={2000} placeholder="Notes, requirements, links…" />
        </Field>

        <Field label="Course" htmlFor="task-course">
          <input id="task-course" className={inputClass} value={form.course} onChange={set("course")} maxLength={100} placeholder="e.g. CPS 630" />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Due date" htmlFor="task-due">
            <input id="task-due" type="date" className={inputClass} value={form.dueDate} onChange={set("dueDate")} required />
          </Field>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="task-time" className="text-sm font-medium text-gray-700">
                Time <span className="font-normal text-gray-500">(optional)</span>
              </label>
              {form.dueTime && (
                <button type="button" onClick={() => setForm((f) => ({ ...f, dueTime: "" }))} className="text-xs font-medium text-gray-500 hover:text-gray-900">
                  Clear
                </button>
              )}
            </div>
            <input id="task-time" type="time" className={inputClass} value={form.dueTime} onChange={set("dueTime")} />
          </div>
          <Field label="Priority" htmlFor="task-priority">
            <select id="task-priority" className={inputClass} value={form.priority} onChange={set("priority")}>
              {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Status" htmlFor="task-status">
            <select id="task-status" className={inputClass} value={form.status} onChange={set("status")}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
        </div>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:items-center">
          {isEdit && onDelete && (
            <Button variant="ghost" className="text-red-600 hover:text-red-700 sm:mr-auto" onClick={onDelete}>
              Delete
            </Button>
          )}
          <div className="flex flex-col-reverse gap-2 sm:ml-auto sm:flex-row">
            <Button onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Save changes" : "Add task"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
