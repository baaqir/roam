"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { ChecklistItem, DayPlan, MultiCityTripPlan, TripInput, TripPlan } from "@/lib/types";
import type { DayWeather } from "@/lib/weather";
import { generateBookingLinks } from "@/lib/booking-links";
import { TripHero } from "./TripHero";
import { StickyTripSummary } from "./StickyTripSummary";
import { BudgetBreakdown } from "./BudgetBreakdown";
import { EditableItinerary } from "./EditableItinerary";
import { TripActions } from "./TripActions";
import { PreDepartureChecklist } from "./PreDepartureChecklist";
import { PackingSuggestions } from "./PackingSuggestions";
import { LocalTips } from "./LocalTips";
import { TripNotes } from "./TripNotes";

/** Boundary describing which days belong to which leg. */
export type LegBoundary = {
  legIndex: number;
  cityName: string;
  startDay: number;
  endDay: number;
  nights: number;
  style?: string;
};

type Props = {
  plan: TripPlan;
  /** When present, the trip is multi-city. */
  multiPlan?: MultiCityTripPlan;
  heroImage?: string | null;
  weatherByDate: Record<string, DayWeather>;
  useFahrenheit: boolean;
  /** Local tips for the destination. */
  tips: string[];
  /** Pre-departure checklist items. */
  checklist: ChecklistItem[];
  /** Assumptions from the plan. */
  assumptions: string[];
  /** Trip input for notes. */
  tripInput: TripInput;
};

/**
 * Client wrapper that manages the customized days state so that
 * TripActions can save/share the user's actual edits (Bug 2 + Bug 5).
 *
 * For multi-city trips, computes leg boundaries so the itinerary editor
 * can render city dividers and scope the Explore section per-leg.
 */
export function TripPageClient({ plan, multiPlan, heroImage, weatherByDate, useFahrenheit, tips, checklist, assumptions, tripInput }: Props) {
  const [customDays, setCustomDays] = useState<DayPlan[] | null>(null);
  const originalDaysJson = useRef(JSON.stringify(plan.days));

  const handleDaysChange = useCallback((days: DayPlan[]) => {
    setCustomDays(days);
  }, []);

  // Determine if the user has made edits by comparing to the original plan.
  const hasEdits = useMemo(() => {
    if (!customDays) return false;
    return JSON.stringify(customDays) !== originalDaysJson.current;
  }, [customDays]);

  // Generate booking links from the plan.
  const bookingLinks = useMemo(() => generateBookingLinks(plan), [plan]);

  // Compute leg boundaries for multi-city trips.
  const legBoundaries: LegBoundary[] | undefined = useMemo(() => {
    if (!multiPlan) return undefined;
    const boundaries: LegBoundary[] = [];
    let dayOffset = 1;
    for (const lp of multiPlan.legs) {
      const cityName = lp.destination.name.split(",")[0].trim();
      const legDayCount = lp.days.length;
      boundaries.push({
        legIndex: lp.legIndex,
        cityName,
        startDay: dayOffset,
        endDay: dayOffset + legDayCount - 1,
        nights: multiPlan.input.legs?.[lp.legIndex]?.nights ?? legDayCount,
        style: multiPlan.input.legs?.[lp.legIndex]?.style ?? multiPlan.input.style,
      });
      dayOffset += legDayCount;
    }
    return boundaries;
  }, [multiPlan]);

  // City name for the sticky summary bar
  const isMulti = !!multiPlan;
  const cityNames = isMulti
    ? multiPlan.legs.map((l) => l.destination.name.split(",")[0].trim())
    : [plan.destination.name.split(",")[0].trim()];
  const summaryCity = isMulti ? cityNames.join(" / ") : cityNames[0];
  const displayTotal = isMulti ? multiPlan.total : plan.total;
  const displayPerPerson = isMulti ? multiPlan.perPerson : plan.perPerson;

  return (
    <div>
      {/* Hero spans full width */}
      <div className="mx-auto max-w-6xl px-6">
        <div style={{ animationDelay: "100ms" }} className="animate-fade-in-up">
          <TripHero plan={plan} multiPlan={multiPlan} heroImage={heroImage} bookingLinks={bookingLinks} />
        </div>
      </div>

      {/* Sticky budget summary — appears when hero scrolls out of view */}
      <StickyTripSummary
        cityName={summaryCity}
        total={displayTotal}
        perPerson={displayPerPerson}
      />

      {/* Two-column layout on desktop */}
      <div className="mx-auto max-w-6xl px-6 mt-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Itinerary + Explore */}
          <div className="flex-1 lg:w-[60%] min-w-0">
            <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              <EditableItinerary
                plan={plan}
                multiPlan={multiPlan}
                legBoundaries={legBoundaries}
                weatherByDate={weatherByDate}
                useFahrenheit={useFahrenheit}
                onDaysChange={handleDaysChange}
                activityBookingUrls={bookingLinks.activities}
              />
            </div>

            {/* Local tips */}
            {tips.length > 0 && (
              <div className="mt-12" style={{ animationDelay: "250ms" }}>
                <hr className="divider-gradient mb-12" />
                <div className="animate-fade-in-up" style={{ animationDelay: "250ms" }}>
                  <LocalTips plan={plan} />
                </div>
              </div>
            )}
          </div>

          {/* Right: Sticky sidebar */}
          <div className="lg:w-[40%] lg:flex-shrink-0">
            <div className="lg:sticky lg:top-[70px] lg:max-h-[calc(100vh-80px)] lg:overflow-y-auto space-y-6">
              <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
                <BudgetBreakdown
                  rows={plan.breakdown}
                  multiPlan={multiPlan}
                  bookingLinks={bookingLinks}
                  assumptions={plan.assumptions}
                />
              </div>

              <div className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
                <TripActions
                  plan={plan}
                  customDays={customDays}
                  hasEdits={hasEdits}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-width sections below */}
      <div className="mx-auto max-w-6xl px-6 mt-12 pb-12">
        {checklist.length > 0 && (
          <div className="mt-12" style={{ animationDelay: "400ms" }}>
            <div className="animate-fade-in-up" style={{ animationDelay: "400ms" }}>
              <PreDepartureChecklist plan={plan} />
            </div>
          </div>
        )}

        <div className="mt-12" style={{ animationDelay: "450ms" }}>
          <div className="animate-fade-in-up" style={{ animationDelay: "450ms" }}>
            <PackingSuggestions plan={plan} />
          </div>
        </div>

        <div className="mt-12" style={{ animationDelay: "500ms" }}>
          <div className="animate-fade-in-up" style={{ animationDelay: "500ms" }}>
            <TripNotes input={tripInput} />
          </div>
        </div>

        {assumptions.length > 0 && (
          <details className="mt-12 card-editorial rounded-2xl p-6 print-assumptions">
            <summary className="cursor-pointer text-sm font-semibold text-[var(--muted)] hover:text-[var(--fg)] transition-colors duration-200">
              Assumptions & notes
            </summary>
            <div className="mt-3 animate-fade-in space-y-4">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-secondary)] mb-2">
                  Data Sources
                </h3>
                <ul className="list-inside list-disc space-y-1 text-sm text-[var(--muted)]">
                  <li>Flight prices: Regional averages (Kayak/Google Flights baseline)</li>
                  <li>Lodging: Global tier averages adjusted for destination cost of living</li>
                  <li>Activities: Wikipedia tourist attractions catalog</li>
                  <li>Weather: Open-Meteo forecast</li>
                  <li>Currency: Frankfurter ECB rates</li>
                  <li>Country info: REST Countries API</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-secondary)] mb-2">
                  Assumptions
                </h3>
                <ul className="list-inside list-disc space-y-1 text-sm text-[var(--muted)]">
                  {assumptions.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
