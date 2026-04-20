"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { DayPlan, MultiCityTripPlan, TripPlan } from "@/lib/types";
import type { DayWeather } from "@/lib/weather";
import { generateBookingLinks } from "@/lib/booking-links";
import { TripHero } from "./TripHero";
import { BudgetBreakdown } from "./BudgetBreakdown";
import { EditableItinerary } from "./EditableItinerary";
import { TripActions } from "./TripActions";

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
};

/**
 * Client wrapper that manages the customized days state so that
 * TripActions can save/share the user's actual edits (Bug 2 + Bug 5).
 *
 * For multi-city trips, computes leg boundaries so the itinerary editor
 * can render city dividers and scope the Explore section per-leg.
 */
export function TripPageClient({ plan, multiPlan, heroImage, weatherByDate, useFahrenheit }: Props) {
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

  return (
    <>
      <div style={{ animationDelay: "0ms" }} className="animate-fade-in-up">
        <TripHero plan={plan} multiPlan={multiPlan} heroImage={heroImage} bookingLinks={bookingLinks} />
      </div>

      <div className="mt-10" style={{ animationDelay: "100ms" }}>
        <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <BudgetBreakdown
            rows={plan.breakdown}
            multiPlan={multiPlan}
            bookingLinks={bookingLinks}
            assumptions={plan.assumptions}
          />
        </div>
      </div>

      <div className="mt-8" style={{ animationDelay: "200ms" }}>
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
      </div>

      <div className="mt-10" style={{ animationDelay: "300ms" }}>
        <div className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          <TripActions
            plan={plan}
            customDays={customDays}
            hasEdits={hasEdits}
          />
        </div>
      </div>
    </>
  );
}
