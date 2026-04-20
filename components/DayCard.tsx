"use client";

import { useState } from "react";
import type { DayPlan, DayItem as DayItemType } from "@/lib/types";
import type { DayWeather } from "@/lib/weather";
import { cToF } from "@/lib/weather";
import { DayItem } from "./DayItem";
import { useCurrency } from "./CurrencyContext";

type Props = {
  day: DayPlan;
  travelers: number;
  totalDays: number;
  /** Called when user removes an activity item. */
  onRemoveActivity?: (activityId: string) => void;
  /** Called when user clicks an activity title to see details. */
  onActivityClick?: (activityId: string) => void;
  /** Called when user moves an activity to a different day. */
  onMoveActivity?: (activityId: string, toDayNumber: number) => void;
  /** Weather data for this day (optional). */
  weather?: DayWeather;
  /** Whether to show temps in Fahrenheit (true for US destinations). */
  useFahrenheit?: boolean;
  /** Destination city name for map links. */
  cityName?: string;
  /** Activity ID to highlight (newly added). */
  highlightId?: string | null;
  /** Booking URLs for activities, keyed by activity ID. */
  activityBookingUrls?: Record<string, string>;
};

/** Generate a Google Maps search URL for a day's activities. */
function dayMapUrl(activities: { title: string }[], city: string): string {
  const names = activities
    .filter((a) => a.title)
    .map((a) => a.title)
    .join(" / ");
  return `https://www.google.com/maps/search/${encodeURIComponent(names + ", " + city)}`;
}

export function DayCard({ day, travelers, totalDays, onRemoveActivity, onActivityClick, onMoveActivity, weather, useFahrenheit, cityName, highlightId, activityBookingUrls }: Props) {
  const { fmt } = useCurrency();
  const [collapsed, setCollapsed] = useState(false);

  // Format temperature string
  const tempStr = weather
    ? useFahrenheit
      ? `${cToF(weather.tempHigh)}\u00B0/${cToF(weather.tempLow)}\u00B0`
      : `${weather.tempHigh}\u00B0/${weather.tempLow}\u00B0`
    : null;

  // Activities for map link
  const activityItems = day.items.filter((i) => i.type === "activity");
  const mealItems = day.items.filter((i) => i.type === "meal");

  // Over-packing warning: total activity hours for the day
  const totalActivityHours = day.items
    .filter((i) => i.type === "activity")
    .reduce((s, i) => s + (i.durationHours ?? 0), 0);
  const isOverpacked = totalActivityHours > 8;

  // Mobile collapse summary
  const collapseSummary = `${activityItems.length} activit${activityItems.length === 1 ? "y" : "ies"} \u00B7 ${mealItems.length} meal${mealItems.length === 1 ? "" : "s"}`;

  // Full Day cards get a gold left border accent
  const isFullDay = day.label === "Full Day";

  return (
    <div className={`card-premium card-premium-hover rounded-2xl p-5 ${isFullDay ? "border-l-[2px] border-l-[var(--gold-400)]" : ""}`} id={`day-${day.dayNumber}`}>
      {isOverpacked && (
        <div className="mb-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-700 px-3 py-2 text-xs text-amber-700 dark:text-amber-300 animate-fade-in">
          This day has ~{Math.round(totalActivityHours)}h of activities — consider spreading some to another day
        </div>
      )}
      <div
        className="mb-3 flex min-h-[44px] items-baseline justify-between cursor-pointer sm:cursor-default"
        onClick={() => setCollapsed((c) => !c)}
        role="button"
        tabIndex={0}
        aria-expanded={!collapsed}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setCollapsed((c) => !c);
          }
        }}
      >
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mobile collapse chevron */}
          <span className="text-xs text-[var(--muted)] sm:hidden" aria-hidden="true">
            {collapsed ? "\u25B8" : "\u25BE"}
          </span>
          <span className="text-xl font-extrabold text-[var(--fg)]">
            Day {day.dayNumber}
          </span>
          <span className="text-sm text-[var(--muted)]">
            {day.dayOfWeek} {formatDate(day.date)}
          </span>
          <span className="chip-gold">
            {day.label}
          </span>
          {weather && tempStr && (
            <span className="text-sm text-[var(--muted)]" title={`WMO code: ${weather.weatherCode}`}>
              {weather.icon} <span className="tabular-nums">{tempStr}</span>
            </span>
          )}
        </div>
        <div className="text-sm font-semibold tabular-nums text-[var(--muted)]">
          {fmt(day.dailyCost)}
        </div>
      </div>

      {/* Mobile collapsed summary */}
      {collapsed && (
        <div className="text-xs text-[var(--muted)] mb-2 sm:hidden">
          {collapseSummary}
        </div>
      )}

      {/* Items list: always visible on desktop, collapsible on mobile */}
      <div className={`space-y-0 ${collapsed ? "hidden sm:block" : ""}`}>
        {day.items.map((item, i) => (
          <div key={`${item.activityId || item.title}-${i}`}>
            {i > 0 && <div className="divider-gradient my-0" />}
            <DayItem
              item={item}
              travelers={travelers}
              onRemove={
                item.activityId && onRemoveActivity
                  ? () => onRemoveActivity(item.activityId!)
                  : undefined
              }
              onActivityClick={onActivityClick}
              onMove={
                item.activityId && onMoveActivity
                  ? (toDayNumber) => onMoveActivity(item.activityId!, toDayNumber)
                  : undefined
              }
              totalDays={totalDays}
              currentDay={day.dayNumber}
              isHighlighted={!!highlightId && item.activityId === highlightId}
              bookingUrl={item.activityId ? activityBookingUrls?.[item.activityId] : undefined}
            />
          </div>
        ))}
        {day.items.filter((i) => i.type === "activity").length === 0 && (
          <div className="py-3 text-center text-sm text-[var(--muted)] italic">
            No activities planned -- add some from the explore section below
          </div>
        )}
      </div>
      {/* Map link for days with activities */}
      {activityItems.length > 0 && cityName && !collapsed && (
        <div className="mt-3 pt-2 border-t border-[var(--border-subtle)]">
          <a
            href={dayMapUrl(activityItems, cityName)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors duration-200"
          >
            <span>{"\uD83D\uDDFA\uFE0F"}</span>
            <span>View on map</span>
          </a>
        </div>
      )}
    </div>
  );
}

function formatDate(iso: string): string {
  const [, m, d] = iso.split("-");
  const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[parseInt(m)]} ${parseInt(d)}`;
}
