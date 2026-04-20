"use client";

import { useMemo, useState } from "react";
import type { BreakdownRow, MultiCityTripPlan } from "@/lib/types";
import type { BookingLinks } from "@/lib/booking-links";
import { useCurrency } from "./CurrencyContext";
import {
  ConfidenceBadge,
  getConfidenceLevel,
  getConfidenceMargin,
} from "./ConfidenceBadge";

const EMOJIS: Record<string, string> = {
  flights: "\u2708\uFE0F",
  lodging: "\uD83C\uDFE8",
  food: "\uD83C\uDF7D\uFE0F",
  transport: "\uD83D\uDE97",
  activities: "\uD83C\uDF9F\uFE0F",
  misc: "\uD83E\uDDFE",
};

/** Booking link labels per category. */
const BOOKING_LABELS: Record<string, { text: string | null; key: keyof BookingLinks | null }> = {
  flights: { text: "Search flights on Google Flights", key: "flights" },
  lodging: { text: "Browse hotels on Booking.com", key: "lodging" },
  activities: { text: "Browse activities on GetYourGuide", key: null },
  food: { text: null, key: null },
  transport: { text: null, key: null },
  misc: { text: null, key: null },
};

type Props = {
  rows: BreakdownRow[];
  /** When provided, shows per-city split in the detail expansion. */
  multiPlan?: MultiCityTripPlan;
  /** Booking links for the trip. */
  bookingLinks?: BookingLinks;
  /** Assumptions array from the plan (for confidence badge). */
  assumptions?: string[];
};

export function BudgetBreakdown({ rows, multiPlan, bookingLinks, assumptions }: Props) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const maxPct = Math.max(...rows.map((r) => r.pct), 1);
  const { fmt } = useCurrency();

  const confidenceLevel = assumptions
    ? getConfidenceLevel(assumptions)
    : "high";
  const margin = getConfidenceMargin(confidenceLevel);

  // For multi-city: build per-category per-city breakdown
  const perCityDetail = useMemo(() => {
    if (!multiPlan) return undefined;
    const map = new Map<string, { cityName: string; amount: number }[]>();
    for (const lp of multiPlan.legs) {
      const cityName = lp.destination.name.split(",")[0].trim();
      for (const row of lp.breakdown) {
        if (!map.has(row.key)) map.set(row.key, []);
        map.get(row.key)!.push({ cityName, amount: row.amount });
      }
    }
    return map;
  }, [multiPlan]);

  return (
    <div className="card-premium rounded-2xl p-6">
      <div className="mb-5 flex items-center gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          Budget Breakdown
        </h2>
        {assumptions && (
          <ConfidenceBadge level={confidenceLevel} />
        )}
      </div>
      <div className="space-y-4" role="list" aria-label="Budget categories">
        {rows.map((row) => {
          const expanded = expandedKey === row.key;
          const cityBreakdown = perCityDetail?.get(row.key);
          const low = Math.round(row.amount * (1 - margin));
          const high = Math.round(row.amount * (1 + margin));
          const bookingInfo = BOOKING_LABELS[row.key];
          const bookingUrl =
            bookingInfo?.key && bookingLinks
              ? (bookingLinks[bookingInfo.key] as string)
              : row.key === "activities" && bookingLinks
                ? "https://www.getyourguide.com/"
                : null;
          return (
            <div key={row.key} role="listitem">
              <button
                type="button"
                onClick={() => setExpandedKey(expanded ? null : row.key)}
                aria-expanded={expanded}
                aria-label={`${row.label}: ${fmt(row.amount)} (${row.pct}%)`}
                className="flex w-full items-center gap-3 text-left transition-opacity duration-200 hover:opacity-80"
              >
                <span className="w-5 text-center text-base" aria-hidden="true">{EMOJIS[row.key]}</span>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-medium text-[var(--fg)]">
                      {row.label}
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-semibold tabular-nums text-[var(--fg)]">
                        {fmt(row.amount)}
                      </span>
                      <span className="text-[10px] tabular-nums text-[var(--muted)]">
                        ({fmt(low)}&ndash;{fmt(high)})
                      </span>
                    </div>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--border-subtle)]" role="progressbar" aria-valuenow={row.pct} aria-valuemin={0} aria-valuemax={100}>
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${(row.pct / maxPct) * 100}%`,
                        background: "linear-gradient(90deg, var(--gold-400), var(--gold-500))",
                      }}
                    />
                  </div>
                </div>
                <span className="w-10 text-right text-xs tabular-nums text-[var(--muted)]">
                  {row.pct}%
                </span>
              </button>
              {expanded && (
                <div className="mt-2 pl-8 text-xs text-[var(--muted)] animate-fade-in leading-relaxed space-y-1.5">
                  {cityBreakdown && cityBreakdown.length > 1 ? (
                    <p>
                      {cityBreakdown
                        .map((c) => `${c.cityName}: ${fmt(c.amount)}`)
                        .join(" + ")}{" "}
                      = {fmt(row.amount)}
                    </p>
                  ) : (
                    <p>{row.detail}</p>
                  )}
                  {bookingUrl && bookingInfo?.text && (
                    <a
                      href={bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors duration-200"
                    >
                      {bookingInfo.text} &rarr;
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
