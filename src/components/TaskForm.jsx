import { useState } from "react";
import { LIMITS, PRIORITIES, STATUSES, isPastDate, taskErrorMessage, validateTask } from "../tasks";
import { ErrorAlert, SubmitButton } from "./AuthLayout";

const EMPTY_TASK = {
  title: "",
  description: "",
  dueDate: "",
  priority: "Medium",
  status: "Not Started",
  course: "",
};

const inputClass =
  "w-full rounded-lg border px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2";
const okClass = "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20";
const badClass = "border-red-400 focus:border-red-500 focus:ring-red-500/20";

// Popup form for creating a task (no initialTask) or editing one (pre-filled from initialTask)
export default function TaskForm({ initialTask, courses, onSubmit, onCancel }) {
  const isEdit = Boolean(initialTask);
  const [values, setValues] = useState(() =>
    isEdit
      ? Object.fromEntries(Object.keys(EMPTY_TASK).map((key) => [key, initialTask[key] ?? EMPTY_TASK[key]]))
      : EMPTY_TASK
  );
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const update = (field) => (e) => {
    setValues({ ...values, [field]: e.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: undefined });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const { task, errors: fieldErrors } = validateTask(values);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      setFormError("Please fix the highlighted fields.");
      return;
    }

    setSaving(true);
    try {
      await onSubmit(task);
    } catch (err) {
      console.error(err);
      setFormError(taskErrorMessage(err));
      setSaving(false);
    }
  };

  const fieldProps = (field) => ({
    id: `task-${field}`,
    name: field,
    value: values[field],
    onChange: update(field),
    "aria-invalid": Boolean(errors[field]),
    "aria-describedby": errors[field] ? `task-${field}-error` : undefined,
    className: `${inputClass} ${errors[field] ? badClass : okClass}`,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 px-4 py-10">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-form-title"
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-100"
      >
        <h2 id="task-form-title" className="text-lg font-semibold text-slate-900">
          {isEdit ? "Edit task" : "Add task"}
        </h2>

        <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
          <ErrorAlert message={formError} />

          <Field label="Title" field="title" required error={errors.title}>
            <input type="text" autoFocus maxLength={LIMITS.title} placeholder="e.g. Lab 3 report" {...fieldProps("title")} />
          </Field>

          <Field label="Description" field="description" error={errors.description}>
            <textarea rows={3} maxLength={LIMITS.description} placeholder="What needs to be done?" {...fieldProps("description")} />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Due date" field="dueDate" required error={errors.dueDate}>
              <input type="date" {...fieldProps("dueDate")} />
            </Field>

            <Field label="Course" field="course" error={errors.course}>
              <input type="text" list="task-course-options" maxLength={LIMITS.course} placeholder="e.g. CPS 714" {...fieldProps("course")} />
              {/* Suggest courses already in use so the same course isn't typed two different ways */}
              <datalist id="task-course-options">
                {courses.map((course) => (
                  <option key={course} value={course} />
                ))}
              </datalist>
            </Field>

            <Field label="Priority" field="priority" required error={errors.priority}>
              <select {...fieldProps("priority")}>
                {PRIORITIES.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </Field>

            <Field label="Status" field="status" required error={errors.status}>
              <select {...fieldProps("status")}>
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
          </div>

          {!errors.dueDate && isPastDate(values.dueDate) && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              This due date is in the past. You can still save the task.
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
            >
              Cancel
            </button>
            <div className="w-32">
              <SubmitButton loading={saving} loadingText="Saving...">
                Save
              </SubmitButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, field, required, error, children }) {
  return (
    <div>
      <label htmlFor={`task-${field}`} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required ? <span className="text-red-500"> *</span> : <span className="font-normal text-slate-400"> (optional)</span>}
      </label>
      {children}
      {error && (
        <p id={`task-${field}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
