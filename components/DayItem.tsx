"use client";

import type { DayItem as DayItemType } from "@/lib/types";
import { useCurrency } from "./CurrencyContext";

type Props = {
  item: DayItemType;
  travelers: number;
  onRemove?: () => void;
  onActivityClick?: (activityId: string) => void;
  /** Called when user wants to move this item to a different day. */
  onMove?: (dayNumber: number) => void;
  /** Total days available for the "move to" picker. */
  totalDays?: number;
  /** Current day number (excluded from move options). */
  currentDay?: number;
  /** Whether this item should show a highlight animation (newly added). */
  isHighlighted?: boolean;
  /** Booking URL for this activity (GetYourGuide search). */
  bookingUrl?: string;
};

function getTimingHint(item: DayItemType): string | null {
  const text = `${item.title} ${item.description ?? ""}`.toLowerCase();
  if (text.includes("sunset") || text.includes("golden hour")) return "Best at sunset";
  if (text.includes("early morning") || text.includes("at opening") || text.includes("before 8am") || text.includes("sunrise")) return "Best in the morning";
  if (text.includes("after dark") || text.includes("night") || text.includes("evening") || text.includes("after 8pm") || text.includes("after 10pm")) return "Evening activity";
  return null;
}

export function DayItem({ item, travelers, onRemove, onActivityClick, onMove, totalDays, currentDay, isHighlighted, bookingUrl }: Props) {
  const totalCost = item.costPerPerson * travelers;
  const { fmt } = useCurrency();
  const timingHint = item.type === "activity" ? getTimingHint(item) : null;
  return (
    <div className="relative flex items-start gap-3 py-3 group">
      {isHighlighted && (
        <div className="absolute inset-0 rounded-lg bg-[var(--accent)]/10 animate-fade-in pointer-events-none" />
      )}
      <span className="mt-0.5 text-xl leading-none" aria-hidden="true">{item.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          {item.activityId && onActivityClick ? (
            <button
              onClick={() => onActivityClick(item.activityId!)}
              className="font-medium text-[var(--fg)] hover:text-[var(--accent)] transition-colors duration-200 text-left cursor-pointer min-h-[44px] flex items-center"
            >
              {item.title}
            </button>
          ) : (
            <span className="font-medium text-[var(--fg)]">{item.title}</span>
          )}
          <div className="flex items-center gap-2">
            {totalCost > 0 && (
              <span className="text-sm tabular-nums text-[var(--muted)] whitespace-nowrap">
                {fmt(item.costPerPerson)}/p
              </span>
            )}
            {totalCost === 0 && item.type === "activity" && (
              <span className="text-xs text-[var(--muted)]">free</span>
            )}
            {totalCost === 0 && item.type === "meal" && (
              <span className="text-xs text-[var(--muted)] whitespace-nowrap">incl. in budget</span>
            )}
            {item.type === "activity" && bookingUrl && (
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[var(--muted)] hover:text-[var(--accent)]"
                title="Book on GetYourGuide"
                onClick={(e) => e.stopPropagation()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
              </a>
            )}
            {onMove && totalDays && totalDays > 1 && (
              <select
                defaultValue=""
                onChange={(e) => {
                  const v = e.target.value;
                  if (v) onMove(parseInt(v, 10));
                  e.target.value = "";
                }}
                aria-label={`Move ${item.title} to another day`}
                className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-1.5 py-0.5 text-xs text-[var(--muted)] cursor-pointer focus-ring transition-all duration-200"
              >
                <option value="" disabled>
                  Move to...
                </option>
                {Array.from({ length: totalDays }, (_, i) => i + 1)
                  .filter((d) => d !== currentDay)
                  .map((d) => (
                    <option key={d} value={d}>
                      Day {d}
                    </option>
                  ))}
              </select>
            )}
            {onRemove && (
              <button
                onClick={onRemove}
                aria-label={`Remove ${item.title} from itinerary`}
                className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 translate-x-0 sm:translate-x-1 sm:group-hover:translate-x-0 rounded-lg px-2 py-0.5 text-xs text-[var(--muted)] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-all duration-200"
                title="Remove from itinerary"
              >
                Remove
              </button>
            )}
          </div>
        </div>
        {item.description && (
          <p className="mt-0.5 text-xs italic text-[var(--muted)] leading-relaxed">
            {item.description}
          </p>
        )}
        {((item.durationHours != null && item.durationHours > 0) || timingHint) && (
          <div className="flex items-center gap-2 mt-0.5">
            {item.durationHours != null && item.durationHours > 0 && (
              <span className="text-xs text-[var(--muted)]">~{item.durationHours}h</span>
            )}
            {timingHint && <span className="chip-muted text-[10px]">{timingHint}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
