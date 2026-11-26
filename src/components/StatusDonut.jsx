import { useState } from "react";
import { STAT_LABELS } from "../utils/dashboard";
import { GLASS_PANEL } from "../theme";

// Colours checked with the dataviz palette validator (all pairs, since a donut wraps around):
// colourblind-safe separation passes. Fuchsia is low-contrast on the light glass, so every
// segment is also named and counted in the legend, never colour alone.
const SEGMENTS = [
  { key: "completed", color: "#4f46e5" }, // indigo-600
  { key: "inProgress", color: "#0891b2" }, // cyan-600
  { key: "notStarted", color: "#e879f9" }, // fuchsia-400
];

const SIZE = 168;
const STROKE = 22;
const GROW = 4; // extra stroke on the hovered segment
const RADIUS = (SIZE - STROKE - GROW) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 2; // surface gap between segments

// Lays the non-empty segments end to end from 12 o'clock, leaving a small gap between them
function layoutArcs(parts, total) {
  const shown = parts.filter((p) => p.count > 0);
  const gap = shown.length > 1 ? GAP : 0;
  const arcs = [];
  for (const p of shown) {
    const start = arcs.length ? arcs.at(-1).start + arcs.at(-1).length : 0;
    const length = (p.count / total) * CIRCUMFERENCE;
    arcs.push({ ...p, start, length, dash: Math.max(length - gap, 0.5) });
  }
  return arcs;
}

// Donut of tasks by status. Hovering a segment or legend row shows its count in the centre;
// clicking either opens that status's task list (same as the stat cards).
export default function StatusDonut({ stats, onSelect }) {
  const [active, setActive] = useState(null);
  const parts = SEGMENTS.map((s) => ({ ...s, label: STAT_LABELS[s.key], count: stats[s.key] }));
  const percent = (n) => Math.round((n / stats.total) * 100);

  const arcs = layoutArcs(parts, stats.total);
  const focus = parts.find((p) => p.key === active);
  const summary = parts.map((p) => `${p.label} ${p.count} (${percent(p.count)}%)`).join(", ");

  return (
    <section aria-labelledby="status-chart-heading" className={`rounded-3xl p-5 sm:p-6 ${GLASS_PANEL}`}>
      <h2 id="status-chart-heading" className="text-lg font-semibold text-slate-900">
        Tasks by status
      </h2>

      {stats.total === 0 ? (
        <p className="mt-3 text-sm text-slate-500">No tasks yet. Your status breakdown will show up here.</p>
      ) : (
        <div className="mt-4 flex flex-col items-center gap-5 sm:flex-row sm:justify-center sm:gap-10">
          <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
            <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE} role="img" aria-label={`Tasks by status: ${summary}`}>
              <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
                {arcs.map((a) => (
                  <circle
                    key={a.key}
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={RADIUS}
                    fill="none"
                    stroke={a.color}
                    strokeWidth={active === a.key ? STROKE + GROW : STROKE}
                    strokeDasharray={`${a.dash} ${CIRCUMFERENCE - a.dash}`}
                    strokeDashoffset={-a.start}
                    opacity={active && active !== a.key ? 0.4 : 1}
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setActive(a.key)}
                    onMouseLeave={() => setActive(null)}
                    onClick={() => onSelect(a.key)}
                  />
                ))}
              </g>
            </svg>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-bold tabular-nums text-slate-900">{focus ? focus.count : stats.total}</span>
              <span className="text-xs font-medium text-slate-600">{focus ? focus.label : "total tasks"}</span>
              {focus && <span className="text-xs text-slate-500">{percent(focus.count)}%</span>}
            </div>
          </div>

          <ul className="w-full min-w-0 space-y-1 sm:max-w-xs">
            {parts.map((p) => (
              <li key={p.key}>
                <button
                  type="button"
                  onClick={() => onSelect(p.key)}
                  onMouseEnter={() => setActive(p.key)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(p.key)}
                  onBlur={() => setActive(null)}
                  aria-label={`View tasks: ${p.label} (${p.count})`}
                  className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition ${
                    active === p.key ? "bg-white/70" : "hover:bg-white/60"
                  }`}
                >
                  <span className="h-3 w-3 shrink-0 rounded-[4px]" style={{ backgroundColor: p.color }} />
                  <span className="min-w-0 flex-1 truncate text-sm text-slate-700">{p.label}</span>
                  <span className="text-sm font-semibold tabular-nums text-slate-900">{p.count}</span>
                  <span className="w-10 text-right text-xs tabular-nums text-slate-500">{percent(p.count)}%</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
