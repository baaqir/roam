"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Activity, DayItem, DayPlan, MultiCityTripPlan, TripPlan } from "@/lib/types";
import type { DayWeather } from "@/lib/weather";
import type { LegBoundary } from "./TripPageClient";
import { DayCard } from "./DayCard";
import { DayNav } from "./DayNav";
import { ExploreActivities } from "./ExploreActivities";
import { ActivityModal } from "./ActivityModal";

type Props = {
  plan: TripPlan;
  /** Multi-city plan (when present, enables city dividers + multi-city explore). */
  multiPlan?: MultiCityTripPlan;
  /** Leg boundaries mapping day ranges to legs. */
  legBoundaries?: LegBoundary[];
  /** Weather data keyed by date (YYYY-MM-DD). */
  weatherByDate?: Record<string, DayWeather>;
  /** Whether to show temps in Fahrenheit. */
  useFahrenheit?: boolean;
  /** Called whenever the days state changes (for persisting customizations). */
  onDaysChange?: (days: DayPlan[]) => void;
  /** Booking URLs for activities, keyed by activity ID. */
  activityBookingUrls?: Record<string, string>;
};

/**
 * Interactive itinerary editor. Takes the auto-generated plan as the
 * starting point, then lets the user:
 *
 *   - Remove activities from any day (they return to "Explore")
 *   - Add activities from "Explore" to a specific day
 *   - Move activities between days
 *   - See live cost updates as they customize
 *
 * For multi-city trips, renders city dividers between legs and groups
 * explore activities by city.
 *
 * State is managed entirely client-side. The parent TripPlan is not mutated.
 */
export function EditableItinerary({
  plan,
  multiPlan,
  legBoundaries,
  weatherByDate,
  useFahrenheit,
  onDaysChange,
  activityBookingUrls,
}: Props) {
  // Mutable copy of the day plans, optionally restored from a saved edit session.
  const [days, setDays] = useState<DayPlan[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("roam.edit-plan");
        if (stored) {
          sessionStorage.removeItem("roam.edit-plan");
          const parsed = JSON.parse(stored) as DayPlan[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((d) => ({ ...d, items: [...d.items] }));
          }
        }
      } catch {
        // Ignore parse errors, fall through to default
      }
    }
    return plan.days.map((d) => ({ ...d, items: [...d.items] }));
  });

  // Track the original days for unsaved-changes detection.
  const originalDaysRef = useRef(JSON.stringify(plan.days));

  // Feature 10: warn before navigating away with unsaved changes.
  useEffect(() => {
    const hasChanges = JSON.stringify(days) !== originalDaysRef.current;
    if (!hasChanges) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [days]);

  // Notify parent of days changes for save/share awareness.
  useEffect(() => {
    onDaysChange?.(days);
  }, [days, onDaysChange]);

  // Highlight state for newly added activities (Task 14).
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Modal state: which activity is currently open for detail view.
  const [modalActivityId, setModalActivityId] = useState<string | null>(null);

  // All activities: for multi-city, combine from all legs. For single-city, use plan's.
  const allActivities = useMemo(() => {
    if (multiPlan) {
      // Combine activities from all legs, deduplicating by ID
      const seen = new Set<string>();
      const combined: Activity[] = [];
      for (const lp of multiPlan.legs) {
        for (const a of lp.destination.activities) {
          if (!seen.has(a.id)) {
            seen.add(a.id);
            combined.push(a);
          }
        }
      }
      return combined;
    }
    return plan.destination.activities;
  }, [plan.destination.activities, multiPlan]);

  // For multi-city, build a map of activity ID -> city name (for grouping)
  const activityCityMap = useMemo(() => {
    if (!multiPlan) return undefined;
    const map = new Map<string, string>();
    for (const lp of multiPlan.legs) {
      const cityName = lp.destination.name.split(",")[0].trim();
      for (const a of lp.destination.activities) {
        if (!map.has(a.id)) {
          map.set(a.id, cityName);
        }
      }
    }
    return map;
  }, [multiPlan]);

  // Track which activity IDs are currently placed in the itinerary.
  const placedIds = useMemo(() => {
    const ids = new Set<string>();
    for (const day of days) {
      for (const item of day.items) {
        if (item.activityId) ids.add(item.activityId);
      }
    }
    return ids;
  }, [days]);

  // Compute the updated total activities cost.
  const activitiesCost = useMemo(() => {
    let total = 0;
    for (const day of days) {
      for (const item of day.items) {
        if (item.type === "activity") {
          total += item.costPerPerson * plan.input.travelers;
        }
      }
    }
    return total;
  }, [days, plan.input.travelers]);

  // Original activities cost from the auto-generated plan.
  const originalActivitiesCost = useMemo(() => {
    return plan.breakdown.find((r) => r.key === "activities")?.amount ?? 0;
  }, [plan.breakdown]);

  const costDelta = activitiesCost - originalActivitiesCost;

  const recalcDayCost = useCallback(
    (items: DayItem[]) =>
      Math.round(
        items.reduce((s, i) => {
          // Meals are included in the food budget (costPerPerson is 0), so
          // only activities, transport, etc. contribute to the daily cost.
          return s + i.costPerPerson * plan.input.travelers;
        }, 0),
      ),
    [plan.input.travelers],
  );

  // For multi-city, build a map of dayNumber -> allowed day numbers
  // (only same city) for the "Add to Day X" dropdown restriction.
  const dayToLeg = useMemo(() => {
    if (!legBoundaries) return undefined;
    const map = new Map<number, LegBoundary>();
    for (const lb of legBoundaries) {
      for (let d = lb.startDay; d <= lb.endDay; d++) {
        map.set(d, lb);
      }
    }
    return map;
  }, [legBoundaries]);

  // For multi-city: which city does a given day belong to?
  function getCityForDay(dayNumber: number): string | undefined {
    if (!dayToLeg) return undefined;
    return dayToLeg.get(dayNumber)?.cityName;
  }

  function removeActivity(activityId: string) {
    setDays((prev) =>
      prev.map((day) => {
        const newItems = day.items.filter((i) => i.activityId !== activityId);
        if (newItems.length === day.items.length) return day;
        return { ...day, items: newItems, dailyCost: recalcDayCost(newItems) };
      }),
    );
  }

  function addActivity(activityId: string, dayNumber: number) {
    const activity = allActivities.find((a) => a.id === activityId);
    if (!activity) return;

    const newItem: DayItem = {
      time: "afternoon",
      type: "activity",
      emoji: activityEmoji(activity),
      title: activity.name,
      description: activity.description,
      costPerPerson: activity.cost,
      durationHours: activity.durationHours,
      activityId: activity.id,
    };

    setDays((prev) =>
      prev.map((day) => {
        if (day.dayNumber !== dayNumber) return day;
        // Insert before evening meals/free items.
        const insertIdx = day.items.findIndex(
          (i) => (i.time as string) === "evening",
        );
        const newItems = [...day.items];
        if (insertIdx >= 0) {
          newItems.splice(insertIdx, 0, newItem);
        } else {
          newItems.push(newItem);
        }
        return { ...day, items: newItems, dailyCost: recalcDayCost(newItems) };
      }),
    );

    // Briefly highlight the newly added item.
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    setHighlightId(activityId);
    highlightTimerRef.current = setTimeout(() => setHighlightId(null), 1500);
  }

  /** Move an activity from one day to another. */
  function moveActivity(activityId: string, toDayNumber: number) {
    setDays((prev) => {
      // Find the item to move
      let movedItem: DayItem | null = null;
      for (const day of prev) {
        const item = day.items.find((i) => i.activityId === activityId);
        if (item) {
          movedItem = item;
          break;
        }
      }
      if (!movedItem) return prev;

      return prev.map((day) => {
        // Remove from source day
        if (day.items.some((i) => i.activityId === activityId)) {
          const newItems = day.items.filter((i) => i.activityId !== activityId);
          return { ...day, items: newItems, dailyCost: recalcDayCost(newItems) };
        }
        // Add to target day
        if (day.dayNumber === toDayNumber) {
          const insertIdx = day.items.findIndex(
            (i) => (i.time as string) === "evening",
          );
          const newItems = [...day.items];
          if (insertIdx >= 0) {
            newItems.splice(insertIdx, 0, movedItem!);
          } else {
            newItems.push(movedItem!);
          }
          return { ...day, items: newItems, dailyCost: recalcDayCost(newItems) };
        }
        return day;
      });
    });
  }

  // Look up the full Activity object for the modal.
  const modalActivity = modalActivityId
    ? allActivities.find((a) => a.id === modalActivityId) ?? null
    : null;

  const modalIsInItinerary = modalActivityId ? placedIds.has(modalActivityId) : false;

  function handleActivityClick(activityId: string) {
    setModalActivityId(activityId);
  }

  // ─── Weather-aware itinerary optimization (Task 18) ──────────────────
  // On initial mount, if weather data is available, do a one-time smart
  // reorder: swap outdoor activities from rainy days to sunny days.
  const weatherOptimizedRef = useRef(false);

  useEffect(() => {
    if (weatherOptimizedRef.current) return;
    if (!weatherByDate || Object.keys(weatherByDate).length === 0) return;
    weatherOptimizedRef.current = true;

    setDays((prev) => optimizeForWeather(prev, weatherByDate));
  }, [weatherByDate]);

  const cityName = plan.destination.name.split(",")[0].trim();
  const isMulti = !!multiPlan && !!legBoundaries && legBoundaries.length > 1;

  // Build the rendered day list with city dividers for multi-city
  const dayElements = useMemo(() => {
    const elements: React.ReactNode[] = [];
    let currentLegIndex = -1;

    for (const day of days) {
      // Check if we're entering a new leg
      if (isMulti && legBoundaries) {
        const lb = legBoundaries.find(
          (b) => day.dayNumber >= b.startDay && day.dayNumber <= b.endDay,
        );
        if (lb && lb.legIndex !== currentLegIndex) {
          // Insert city divider before the first day of a new leg (except the very first leg)
          if (currentLegIndex >= 0) {
            elements.push(
              <CityDivider
                key={`divider-${lb.legIndex}`}
                cityName={lb.cityName}
                nights={lb.nights}
                style={lb.style}
              />,
            );
          }
          currentLegIndex = lb.legIndex;
        }
      }

      const dayCityName = isMulti ? (getCityForDay(day.dayNumber) ?? cityName) : cityName;

      elements.push(
        <DayCard
          key={day.dayNumber}
          day={day}
          travelers={plan.input.travelers}
          totalDays={days.length}
          onRemoveActivity={removeActivity}
          onActivityClick={handleActivityClick}
          onMoveActivity={moveActivity}
          weather={weatherByDate?.[day.date]}
          useFahrenheit={useFahrenheit}
          cityName={dayCityName}
          highlightId={highlightId}
          activityBookingUrls={activityBookingUrls}
        />,
      );
    }
    return elements;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, isMulti, legBoundaries, plan.input.travelers, weatherByDate, useFahrenheit, highlightId, cityName, activityBookingUrls]);

  // For multi-city explore: group activities by city
  const activitiesByCityGroups = useMemo(() => {
    if (!multiPlan || !activityCityMap) return undefined;
    const groups: { cityName: string; activities: Activity[] }[] = [];
    const seen = new Set<string>();
    for (const lp of multiPlan.legs) {
      const cn = lp.destination.name.split(",")[0].trim();
      if (seen.has(cn)) continue;
      seen.add(cn);
      groups.push({
        cityName: cn,
        activities: lp.destination.activities,
      });
    }
    return groups;
  }, [multiPlan, activityCityMap]);

  // For multi-city "add to day" restrictions: get allowed days for a given activity's city
  const getAllowedDaysForActivity = useCallback(
    (activityId: string): number[] | undefined => {
      if (!activityCityMap || !dayToLeg) return undefined;
      const activityCity = activityCityMap.get(activityId);
      if (!activityCity) return undefined;
      const allowed: number[] = [];
      for (const [dayNum, lb] of dayToLeg) {
        if (lb.cityName === activityCity) {
          allowed.push(dayNum);
        }
      }
      return allowed.sort((a, b) => a - b);
    },
    [activityCityMap, dayToLeg],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          Your Itinerary
        </h2>
        {costDelta !== 0 && (
          <span
            className={`text-xs font-semibold tabular-nums ${
              costDelta > 0
                ? "text-red-600 dark:text-red-400"
                : "text-emerald-600 dark:text-emerald-400"
            }`}
          >
            Activities: {costDelta > 0 ? "+" : ""}${costDelta.toLocaleString()} vs auto-plan
          </span>
        )}
      </div>

      {/* Sticky day navigation for 5+ day trips */}
      {days.length >= 5 && <DayNav days={days} />}

      <div className="stagger-children space-y-6">
        {dayElements}
      </div>

      {/* Explore section: for multi-city, group by city */}
      {isMulti && activitiesByCityGroups ? (
        <div className="space-y-6">
          {activitiesByCityGroups.map((group) => (
            <div key={group.cityName}>
              <div className="flex items-center gap-3 mb-3">
                <div className="divider-gradient flex-1" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  {group.cityName} Activities
                </span>
                <div className="divider-gradient flex-1" />
              </div>
              <ExploreActivities
                activities={group.activities}
                placedIds={placedIds}
                travelers={plan.input.travelers}
                totalDays={days.length}
                onAdd={addActivity}
                onActivityClick={handleActivityClick}
                allowedDaysFn={getAllowedDaysForActivity}
              />
            </div>
          ))}
        </div>
      ) : (
        <ExploreActivities
          activities={allActivities}
          placedIds={placedIds}
          travelers={plan.input.travelers}
          totalDays={days.length}
          onAdd={addActivity}
          onActivityClick={handleActivityClick}
        />
      )}

      {modalActivity && (
        <ActivityModal
          activity={modalActivity}
          travelers={plan.input.travelers}
          totalDays={days.length}
          isInItinerary={modalIsInItinerary}
          onAdd={(dayNumber) => {
            addActivity(modalActivity.id, dayNumber);
          }}
          onRemove={() => {
            removeActivity(modalActivity.id);
          }}
          onClose={() => setModalActivityId(null)}
          bookingUrl={activityBookingUrls?.[modalActivity.id]}
        />
      )}
    </div>
  );
}

// ─── City Divider (between legs in multi-city itinerary) ─────────────

function CityDivider({
  cityName,
  nights,
  style,
}: {
  cityName: string;
  nights: number;
  style?: string;
}) {
  return (
    <div className="relative my-6 flex items-center gap-4">
      <div className="divider-gradient flex-1" />
      <div className="card-premium rounded-xl px-4 py-2 text-center">
        <div className="text-xs text-[var(--muted)]">Travel to</div>
        <div className="font-semibold text-[var(--fg)]">{cityName}</div>
        <div className="text-xs text-[var(--muted)]">
          {nights} night{nights !== 1 ? "s" : ""}
          {style ? ` \u00B7 ${style.charAt(0).toUpperCase() + style.slice(1)}` : ""}
        </div>
      </div>
      <div className="divider-gradient flex-1" />
    </div>
  );
}

function activityEmoji(a: Activity): string {
  if (a.tags.includes("outdoor") || a.tags.includes("adventure")) return "\uD83C\uDFDE\uFE0F";
  if (a.tags.includes("foodie")) return "\uD83C\uDF74";
  if (a.tags.includes("culture")) return "\uD83C\uDFDB\uFE0F";
  if (a.tags.includes("nightlife")) return "\uD83C\uDFB6";
  if (a.tags.includes("family")) return "\uD83C\uDFA0";
  if (a.tags.includes("iconic")) return "\uD83C\uDF9F\uFE0F";
  if (a.cost === 0) return "\uD83D\uDEB6";
  return "\uD83C\uDF9F\uFE0F";
}

// ─── Weather-aware itinerary reorder ──────────────────────────────────
// If a rainy day has outdoor activities AND a sunny day has indoor activities,
// swap them to optimize the experience.

function isOutdoorItem(item: DayItem): boolean {
  // Check by activityId tags pattern or emoji heuristic
  const title = item.title.toLowerCase();
  const emoji = item.emoji;
  return (
    item.type === "activity" &&
    (emoji === "\uD83C\uDFDE\uFE0F" || // outdoor/adventure emoji
     title.includes("hike") ||
     title.includes("beach") ||
     title.includes("walk") ||
     title.includes("park") ||
     title.includes("garden") ||
     title.includes("kayak") ||
     title.includes("bike") ||
     title.includes("cliff") ||
     title.includes("canyon") ||
     title.includes("stroll"))
  );
}

function isIndoorItem(item: DayItem): boolean {
  const emoji = item.emoji;
  const title = item.title.toLowerCase();
  return (
    item.type === "activity" &&
    (emoji === "\uD83C\uDFDB\uFE0F" || // culture emoji
     emoji === "\uD83C\uDFB6" ||       // nightlife emoji
     title.includes("museum") ||
     title.includes("gallery") ||
     title.includes("show") ||
     title.includes("theater") ||
     title.includes("theatre") ||
     title.includes("temple") ||
     title.includes("church") ||
     title.includes("cathedral"))
  );
}

function optimizeForWeather(
  days: DayPlan[],
  weather: Record<string, DayWeather>,
): DayPlan[] {
  // Build a mutable copy
  const result = days.map((d) => ({ ...d, items: [...d.items] }));

  // Classify days as rainy (weatherCode >= 51) or sunny
  const rainyDayIndices: number[] = [];
  const sunnyDayIndices: number[] = [];

  for (let i = 0; i < result.length; i++) {
    const w = weather[result[i].date];
    if (!w) continue;
    if (w.weatherCode >= 51) {
      rainyDayIndices.push(i);
    } else {
      sunnyDayIndices.push(i);
    }
  }

  if (rainyDayIndices.length === 0 || sunnyDayIndices.length === 0) return result;

  // For each rainy day, find outdoor activities that could swap with
  // indoor activities on a sunny day.
  let swapped = false;
  for (const rainyIdx of rainyDayIndices) {
    const rainyDay = result[rainyIdx];
    for (let ri = 0; ri < rainyDay.items.length; ri++) {
      if (!isOutdoorItem(rainyDay.items[ri])) continue;
      // Find a sunny day with an indoor activity to swap
      for (const sunnyIdx of sunnyDayIndices) {
        const sunnyDay = result[sunnyIdx];
        for (let si = 0; si < sunnyDay.items.length; si++) {
          if (!isIndoorItem(sunnyDay.items[si])) continue;
          // Swap the two activity items
          const temp = rainyDay.items[ri];
          rainyDay.items[ri] = sunnyDay.items[si];
          sunnyDay.items[si] = temp;
          swapped = true;
          break; // one swap per outdoor activity
        }
        if (swapped) break;
      }
      // Reset for next outdoor item
      if (swapped) {
        swapped = false;
        continue;
      }
    }
  }

  return result;
}
