import { GLASS_PANEL } from "../theme";

// Completion bar. `progress` comes from getProgress() in utils/progress.js.
export default function ProgressBar({ progress }) {
  return (
    <section aria-labelledby="progress-heading" className={`rounded-3xl p-5 sm:p-6 ${GLASS_PANEL}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="progress-heading" className="text-lg font-semibold text-slate-900">
          Overall progress
        </h2>
        {!progress.isEmpty && (
          <span className="text-sm text-slate-600">
            {progress.completed} of {progress.total} tasks completed
          </span>
        )}
      </div>

      {progress.isEmpty ? (
        <p className="mt-3 text-sm text-slate-500">{progress.label}</p>
      ) : (
        <div className="mt-4 flex items-center gap-3">
          <div
            role="progressbar"
            aria-label="Tasks completed"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress.percent}
            className="h-3 flex-1 overflow-hidden rounded-full bg-slate-900/[0.07] shadow-[inset_0_1px_2px_rgba(15,23,42,0.08)]"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-400 transition-[width] duration-500"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          <span className="w-12 text-right text-sm font-semibold tabular-nums text-slate-900">{progress.percent}%</span>
        </div>
      )}
    </section>
  );
}
