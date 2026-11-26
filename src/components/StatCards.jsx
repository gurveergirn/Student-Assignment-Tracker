import { STAT_LABELS } from "../utils/dashboard";
import { GLASS_PANEL, HOVER_BLUR } from "../theme";
import EyeOverlay from "./EyeOverlay";

const CARDS = [
  { key: "total", accent: "text-slate-900" },
  { key: "completed", accent: "text-indigo-700" },
  { key: "inProgress", accent: "text-cyan-700" },
  { key: "notStarted", accent: "text-fuchsia-700" },
];

// Four count cards (2x2 on phones, one row on wide screens). Hovering one blurs it and shows an eye; clicking lists its tasks.
// `stats` comes from getTaskStats() in utils/dashboard.js.
export default function StatCards({ stats, onSelect = () => {} }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {CARDS.map(({ key, accent }) => (
        <div key={key} role="group" aria-label={STAT_LABELS[key]} className="h-full">
          <button
            type="button"
            onClick={() => onSelect(key)}
            aria-label={`View tasks: ${STAT_LABELS[key]} (${stats[key]})`}
            className={`group relative flex h-full w-full flex-col justify-center overflow-hidden rounded-3xl p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:p-5 ${GLASS_PANEL}`}
          >
            <span className={`block ${HOVER_BLUR}`}>
              <span className="block text-sm font-medium text-slate-500">{STAT_LABELS[key]}</span>
              <span className={`mt-1 block text-3xl font-bold tabular-nums ${accent}`}>{stats[key]}</span>
            </span>
            <EyeOverlay />
          </button>
        </div>
      ))}
    </div>
  );
}
