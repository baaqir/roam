"use client";

import type { Activity } from "@/lib/types";
import { useCurrency } from "./CurrencyContext";

type Props = {
  activity: Activity;
  travelers: number;
  /** When provided, shows "Add to Day X" picker. */
  onAdd?: (dayNumber: number) => void;
  /** When provided, shows "Remove" button. */
  onRemove?: () => void;
  /** Total days available for the "add to" picker. */
  totalDays?: number;
  /** True when this activity is already in the itinerary. */
  inItinerary?: boolean;
  /** Called when user clicks the activity name to see details. */
  onActivityClick?: () => void;
  /** Multi-city: restrict day picker to only these day numbers. */
  allowedDays?: number[];
};

const TAG_COLORS: Record<string, string> = {
  iconic: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50",
  outdoor: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50",
  foodie: "bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800/50",
  culture: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50",
  nightlife: "bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800/50",
  adventure: "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/50",
  family: "bg-yellow-50 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800/50",
  free: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50",
};

export function ActivityCard({
  activity,
  travelers,
  onAdd,
  onRemove,
  totalDays,
  inItinerary,
  onActivityClick,
  allowedDays,
}: Props) {
  const totalCost = activity.cost * travelers;
  const { fmt } = useCurrency();
  return (
    <div
      className={`card-premium card-premium-hover rounded-xl p-4 transition-all duration-200 ${
        inItinerary
          ? "opacity-60 border-[var(--gold-200)]"
          : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {onActivityClick ? (
              <button
                onClick={onActivityClick}
                className="font-semibold text-[var(--fg)] hover:text-[var(--accent)] transition-colors duration-200 text-left cursor-pointer"
              >
                {activity.name}
              </button>
            ) : (
              <span className="font-semibold text-[var(--fg)]">{activity.name}</span>
            )}
            {inItinerary && (
              <span className="chip-gold">
                in plan
              </span>
            )}
          </div>
          {activity.description && (
            <p className="mt-1 text-sm text-[var(--muted)] leading-relaxed line-clamp-2">
              {activity.description}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {activity.tags.map((t) => (
              <span
                key={t}
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${TAG_COLORS[t] ?? "bg-gray-50 dark:bg-gray-800/40 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700/50"}`}
              >
                {t}
              </span>
            ))}
            <span className="text-xs text-[var(--muted)]">
              ~{activity.durationHours}h
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <div className="text-right">
            <div className="text-lg font-bold tabular-nums text-[var(--fg)]">
              {activity.cost === 0 ? "Free" : fmt(activity.cost)}
            </div>
            {activity.cost > 0 && travelers > 1 && (
              <div className="text-xs tabular-nums text-[var(--muted)]">
                {fmt(totalCost)} total
              </div>
            )}
          </div>
          {onRemove && (
            <button
              onClick={onRemove}
              aria-label={`Remove ${activity.name} from itinerary`}
              className="rounded-lg border border-[var(--border)] px-2 py-1 text-xs text-[var(--muted)] hover:border-red-300 hover:text-red-600 dark:hover:border-red-800 dark:hover:text-red-400 transition-all duration-200"
            >
              Remove
            </button>
          )}
          {onAdd && !inItinerary && totalDays && (
            <DayPicker totalDays={totalDays} onSelect={onAdd} allowedDays={allowedDays} />
          )}
        </div>
      </div>
    </div>
  );
}

function DayPicker({
  totalDays,
  onSelect,
  allowedDays,
}: {
  totalDays: number;
  onSelect: (day: number) => void;
  allowedDays?: number[];
}) {
  // When allowedDays is provided (multi-city), only show those days.
  // Otherwise show all days 1..totalDays.
  const dayNumbers = allowedDays ?? Array.from({ length: totalDays }, (_, i) => i + 1);

  return (
    <select
      defaultValue=""
      onChange={(e) => {
        const v = e.target.value;
        if (v) onSelect(parseInt(v, 10));
        e.target.value = "";
      }}
      aria-label="Add to day"
      className="rounded-lg border border-[var(--gold-400)] bg-[var(--accent-light)] px-2.5 py-1 text-xs font-medium text-[var(--accent)] cursor-pointer focus-ring transition-all duration-200"
    >
      <option value="" disabled>
        + Add to...
      </option>
      {dayNumbers.map((d) => (
        <option key={d} value={d}>
          Day {d}
        </option>
      ))}
    </select>
  );
}
