import { useEffect } from "react";

// Yes/no popup used for logging out and deleting tasks
export default function ConfirmDialog({ title, message, confirmText, onConfirm, onCancel, danger = false, busy = false }) {
  useEffect(() => {
    const onKeyDown = (e) => e.key === "Escape" && !busy && onCancel();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel, busy]);

  return (
    // Clicking the dimmed backdrop cancels, clicks inside the card don't
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4" onClick={() => !busy && onCancel()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-title" className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm text-slate-600">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            autoFocus
            onClick={onCancel}
            disabled={busy}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
              danger ? "bg-red-600 hover:bg-red-700" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
