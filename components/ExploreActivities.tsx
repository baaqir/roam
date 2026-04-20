"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Activity, ActivityTag } from "@/lib/types";
import { ActivityCard } from "./ActivityCard";
import { EmptyState } from "./EmptyState";

const ALL_TAGS: ActivityTag[] = [
  "iconic", "outdoor", "foodie", "culture", "nightlife", "adventure", "family", "free",
];

type Props = {
  activities: Activity[];
  /** IDs of activities currently in the itinerary. */
  placedIds: Set<string>;
  travelers: number;
  totalDays: number;
  onAdd: (activityId: string, dayNumber: number) => void;
  /** Called when user clicks an activity name to see details. */
  onActivityClick?: (activityId: string) => void;
  /** Multi-city: returns allowed day numbers for a given activity ID. */
  allowedDaysFn?: (activityId: string) => number[] | undefined;
};

export function ExploreActivities({
  activities,
  placedIds,
  travelers,
  totalDays,
  onAdd,
  onActivityClick,
  allowedDaysFn,
}: Props) {
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState<ActivityTag | null>(null);

  const filtered = useMemo(() => {
    let list = activities;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q),
      );
    }
    if (tagFilter) {
      list = list.filter((a) => a.tags.includes(tagFilter));
    }
    // Show unplaced first, then placed (faded).
    return list.sort((a, b) => {
      const aPlaced = placedIds.has(a.id) ? 1 : 0;
      const bPlaced = placedIds.has(b.id) ? 1 : 0;
      return aPlaced - bPlaced;
    });
  }, [activities, search, tagFilter, placedIds]);

  const unplacedCount = activities.filter((a) => !placedIds.has(a.id)).length;

  // Scroll indicator: detect if there's more content below
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollFade, setShowScrollFade] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setShowScrollFade(el.scrollTop + el.clientHeight < el.scrollHeight - 4);
  }, []);

  useEffect(() => {
    checkScroll();
  }, [filtered, checkScroll]);

  return (
    <div className="card-premium rounded-2xl p-6 no-print">
      <div className="flex items-baseline justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-bold text-[var(--fg)]">
            Things to Explore
          </h2>
          <p className="text-sm text-[var(--muted)]">
            {unplacedCount} activities available
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-5">
        <label htmlFor="activity-search" className="sr-only">Search activities</label>
        <input
          id="activity-search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search activities..."
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--fg)] placeholder:text-[var(--muted)] focus-ring transition-all duration-200"
        />
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by tag">
          <button
            onClick={() => setTagFilter(null)}
            aria-pressed={!tagFilter}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
              !tagFilter
                ? "bg-[var(--gold-400)] text-white shadow-sm"
                : "bg-[var(--surface-hover)] text-[var(--muted)] hover:text-[var(--fg)] border border-[var(--border-subtle)]"
            }`}
          >
            All
          </button>
          {ALL_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setTagFilter(tag === tagFilter ? null : tag)}
              aria-pressed={tag === tagFilter}
              className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-all duration-200 ${
                tag === tagFilter
                  ? "bg-[var(--gold-400)] text-white shadow-sm"
                  : "bg-[var(--surface-hover)] text-[var(--muted)] hover:text-[var(--fg)] border border-[var(--border-subtle)]"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="space-y-2 max-h-[500px] overflow-y-auto pr-1"
          role="region"
          aria-label="Activities"
        >
          {filtered.length === 0 && (
            <EmptyState
              icon="compass"
              title="No matching activities"
              description={search ? `No activities match "${search}"` : "Try a different filter"}
            />
          )}
          {filtered.map((a) => {
            const allowed = allowedDaysFn?.(a.id);
            return (
              <ActivityCard
                key={a.id}
                activity={a}
                travelers={travelers}
                totalDays={totalDays}
                inItinerary={placedIds.has(a.id)}
                onAdd={(day) => onAdd(a.id, day)}
                onActivityClick={onActivityClick ? () => onActivityClick(a.id) : undefined}
                allowedDays={allowed}
              />
            );
          })}
        </div>
        {showScrollFade && (
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[var(--surface)] to-transparent" />
        )}
      </div>
    </div>
  );
}
