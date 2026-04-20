/**
 * Multi-city trip orchestrator.
 *
 * Takes a TripInput with legs and returns a MultiCityTripPlan that wraps
 * multiple single-city plans into one continuous journey with multi-segment
 * flights, sequential day numbering, and aggregated costs.
 *
 * Pipeline:
 *   1. Plan each leg independently (reuse planTrip for per-leg costs EXCEPT flights)
 *   2. Compute multi-segment flights separately
 *      (origin → city1, city1 → city2, ..., cityN → origin)
 *   3. Flatten days across all legs with sequential day numbers
 *   4. Aggregate breakdowns (sum lodging, food, transport, activities; replace flights)
 *   5. Build combined assumptions
 */
import type {
  BreakdownRow,
  CategoryKey,
  DayPlan,
  LegPlan,
  MultiCityTripPlan,
  Style,
  TripInput,
  TripLeg,
  TripPlan,
} from "./types";
import { STYLE_CONFIG } from "./types";
import { planTrip } from "./estimate";
import { resolveOrigin } from "./discover";
import { interCityOneWay } from "./data/origins";
import { GLOBAL_FLIGHT_FALLBACK_RT } from "./data/global-defaults";
import { getFlightSeasonMultiplier } from "./data/flight-seasonality";
import { defaultStartDate } from "./url";

// ─── Main entry point ────────────────────────────────────────────────────

export async function planMultiCityTrip(input: TripInput): Promise<MultiCityTripPlan> {
  const legs = input.legs ?? [{ city: input.city, nights: input.nights }];
  const startDate = input.startDate || defaultStartDate();

  // 1. Plan each leg independently (parallel).
  const legPlans = await Promise.all(
    legs.map((leg, i) => planSingleLeg(input, leg, i, startDate, legs)),
  );

  // 2. Compute multi-segment flights.
  const origin = await resolveOrigin(input.origin ?? "nyc");
  const flightResult = await computeMultiCityFlights(input, legPlans, origin);

  // 3. Flatten days across all legs with sequential day numbers.
  const flatDays = flattenDays(legPlans, legs, startDate);

  // 4. Aggregate breakdowns.
  const aggregated = aggregateBreakdowns(legPlans, flightResult);

  // 5. Build combined assumptions.
  const assumptions = buildMultiCityAssumptions(input, legPlans, flightResult, origin);

  const total = aggregated.total;
  const perPerson = Math.round(total / input.travelers);

  return {
    id: `trip-mc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    input,
    legs: legPlans,
    total,
    perPerson,
    flightCost: flightResult.totalFlightCost,
    flightSegments: flightResult.segments,
    breakdown: aggregated.breakdown,
    days: flatDays,
    assumptions,
    createdAt: new Date().toISOString(),
    originName: origin.name,
    originAirport: origin.airportCodes[0],
  };
}

// ─── Single leg planning ────────────────────────────────────────────────

/**
 * Plan one leg by calling the existing planTrip, then strip its flight
 * cost (we compute flights separately for the whole route).
 */
async function planSingleLeg(
  tripInput: TripInput,
  leg: TripLeg,
  index: number,
  startDate: string,
  allLegs: TripLeg[],
): Promise<LegPlan> {
  // Calculate the start date for this leg by summing previous legs' nights.
  const legStartDate = addDays(
    startDate,
    allLegs.slice(0, index).reduce((sum, l) => sum + l.nights, 0),
  );

  // Build a single-city input for this leg.
  const legInput: TripInput = {
    city: leg.city,
    nights: leg.nights,
    travelers: tripInput.travelers,
    style: leg.style ?? tripInput.style,
    startDate: legStartDate,
    origin: tripInput.origin,
  };

  const plan: TripPlan = await planTrip(legInput);

  // Strip the flight cost from this leg's breakdown — flights are computed
  // separately for the whole multi-city route.
  const breakdownNoFlights = plan.breakdown
    .filter((row) => row.key !== "flights")
    .map((row) => {
      // Recalculate percentage without flights.
      const subtotal = plan.total - flightAmount(plan.breakdown);
      return {
        ...row,
        pct: subtotal > 0 ? Math.round((row.amount / subtotal) * 100) : 0,
      };
    });

  const legTotal = breakdownNoFlights.reduce((s, row) => s + row.amount, 0);

  return {
    legIndex: index,
    destination: plan.destination,
    days: plan.days,
    breakdown: breakdownNoFlights,
    legTotal,
    context: plan.context,
    checklist: plan.checklist,
  };
}

function flightAmount(breakdown: BreakdownRow[]): number {
  return breakdown.find((r) => r.key === "flights")?.amount ?? 0;
}

// ─── Multi-segment flights ──────────────────────────────────────────────

type FlightSegment = { from: string; to: string; cost: number };

type FlightResult = {
  segments: FlightSegment[];
  totalFlightCost: number;
};

async function computeMultiCityFlights(
  input: TripInput,
  legPlans: LegPlan[],
  origin: Awaited<ReturnType<typeof resolveOrigin>>,
): Promise<FlightResult> {
  const startDate = input.startDate || defaultStartDate();
  const seasonMultiplier = getFlightSeasonMultiplier(startDate);
  const style = input.style;
  const travelers = input.travelers;

  const segments: FlightSegment[] = [];

  // Build the route: origin → city1 → city2 → ... → cityN → origin
  const stops: { key: string; name: string; airportCode: string }[] = [];
  for (const leg of legPlans) {
    stops.push({
      key: leg.destination.key,
      name: leg.destination.name.split(",")[0].trim(),
      airportCode: leg.destination.airportCode,
    });
  }

  // Segment 0: origin → first city (one-way = RT / 2)
  const firstDest = stops[0];
  const outboundFare = computeOneWayFromOrigin(origin, firstDest, style, seasonMultiplier);
  segments.push({
    from: origin.name.split("(")[0].trim(),
    to: firstDest.name,
    cost: Math.round(outboundFare * travelers),
  });

  // Inter-city segments: city1 → city2, city2 → city3, ...
  for (let i = 0; i < stops.length - 1; i++) {
    const from = stops[i];
    const to = stops[i + 1];
    const fare = computeInterCityFare(from, to, style, seasonMultiplier);
    segments.push({
      from: from.name,
      to: to.name,
      cost: Math.round(fare * travelers),
    });
  }

  // Last segment: last city → origin (one-way = RT / 2)
  const lastDest = stops[stops.length - 1];
  const returnFare = computeOneWayFromOrigin(origin, lastDest, style, seasonMultiplier);
  segments.push({
    from: lastDest.name,
    to: origin.name.split("(")[0].trim(),
    cost: Math.round(returnFare * travelers),
  });

  const totalFlightCost = segments.reduce((s, seg) => s + seg.cost, 0);

  return { segments, totalFlightCost };
}

/**
 * Compute a one-way fare from origin to a destination (or vice versa).
 * Uses curated fares when available, falling back to region-based pricing.
 * One-way = round-trip / 2.
 */
function computeOneWayFromOrigin(
  origin: { flightBasePrices?: Record<string, Record<string, number>> },
  dest: { key: string; airportCode: string },
  style: Style,
  seasonMultiplier: number,
): number {
  // Check for curated round-trip fare and halve it.
  const curated = origin.flightBasePrices?.[dest.key]?.[style];
  if (curated && curated > 0) {
    return Math.round((curated / 2) * seasonMultiplier);
  }

  // Region-based fallback (half of round-trip).
  const regionKey = "long-haul" as keyof typeof GLOBAL_FLIGHT_FALLBACK_RT;
  const fallbackRT = GLOBAL_FLIGHT_FALLBACK_RT[regionKey]?.[style] ?? 1100;
  return Math.round((fallbackRT / 2) * seasonMultiplier);
}

/**
 * Compute a one-way fare between two intermediate cities.
 * Uses the inter-city fare table from origins.ts, or a region-based fallback.
 */
function computeInterCityFare(
  from: { key: string; name: string },
  to: { key: string; name: string },
  style: Style,
  seasonMultiplier: number,
): number {
  const fare = interCityOneWay(from.key, to.key, style);
  return Math.round(fare * seasonMultiplier);
}

// ─── Day flattening ─────────────────────────────────────────────────────

/**
 * Flatten days across all legs with sequential numbering.
 *
 * Day numbering example for Barcelona (5n) + Paris (3n):
 *   Day 1: Arrive Barcelona
 *   Day 2-5: Full days Barcelona
 *   Day 6: Travel Barcelona -> Paris (half Barcelona, half Paris)
 *   Day 7-8: Full days Paris
 *   Day 9: Depart Paris
 */
function flattenDays(
  legPlans: LegPlan[],
  legs: TripLeg[],
  startDate: string,
): DayPlan[] {
  const result: DayPlan[] = [];
  let dayCounter = 1;
  let dateCounter = startDate;

  for (let legIdx = 0; legIdx < legPlans.length; legIdx++) {
    const legPlan = legPlans[legIdx];
    const isFirstLeg = legIdx === 0;
    const isLastLeg = legIdx === legPlans.length - 1;
    const legDays = legPlan.days;

    for (let dayIdx = 0; dayIdx < legDays.length; dayIdx++) {
      const isLegLastDay = dayIdx === legDays.length - 1;
      const day = legDays[dayIdx];

      // Skip the departure day of non-last legs — it will be replaced
      // with a travel day that combines departure from this city and
      // arrival in the next.
      if (isLegLastDay && !isLastLeg) {
        const nextLeg = legPlans[legIdx + 1];
        const fromCity = legPlan.destination.name.split(",")[0].trim();
        const toCity = nextLeg.destination.name.split(",")[0].trim();
        result.push({
          dayNumber: dayCounter,
          date: dateCounter,
          dayOfWeek: dayOfWeek(dateCounter),
          label: "Travel Day",
          items: [
            {
              time: "morning",
              type: "meal",
              emoji: "\u2615",
              title: `Breakfast in ${fromCity}`,
              costPerPerson: 0,
              description: "Last meal before traveling (included in food budget)",
            },
            {
              time: "morning",
              type: "transport",
              emoji: "\uD83D\uDE95",
              title: `${fromCity} \u2192 airport`,
              costPerPerson: 0,
              description: "Transfer to airport (included in transport budget)",
            },
            {
              time: "afternoon",
              type: "flight",
              emoji: "\u2708\uFE0F",
              title: `Fly ${fromCity} \u2192 ${toCity}`,
              costPerPerson: 0,
              description: "Inter-city flight (see flight breakdown)",
            },
            {
              time: "afternoon",
              type: "transport",
              emoji: "\uD83D\uDE95",
              title: `Airport \u2192 ${toCity}`,
              costPerPerson: 0,
              description: "Transfer to accommodation (included in transport budget)",
            },
            {
              time: "evening",
              type: "meal",
              emoji: "\uD83C\uDF7D\uFE0F",
              title: `Dinner in ${toCity}`,
              costPerPerson: 0,
              description: "Settle in and explore the new city",
            },
          ],
          dailyCost: 0,
        });
        dayCounter++;
        dateCounter = addDays(dateCounter, 1);
        continue;
      }

      // Skip the arrival day of non-first legs — the travel day above
      // already covers the transition.
      if (dayIdx === 0 && !isFirstLeg) {
        continue;
      }

      result.push({
        ...day,
        dayNumber: dayCounter,
        date: dateCounter,
        dayOfWeek: dayOfWeek(dateCounter),
      });
      dayCounter++;
      dateCounter = addDays(dateCounter, 1);
    }
  }

  return result;
}

// ─── Breakdown aggregation ──────────────────────────────────────────────

function aggregateBreakdowns(
  legPlans: LegPlan[],
  flightResult: FlightResult,
): { breakdown: BreakdownRow[]; total: number } {
  // Sum each category across all legs (excluding flights which are separate).
  const sums: Record<CategoryKey, number> = {
    flights: flightResult.totalFlightCost,
    lodging: 0,
    food: 0,
    transport: 0,
    activities: 0,
    misc: 0,
  };

  for (const leg of legPlans) {
    for (const row of leg.breakdown) {
      if (row.key !== "flights" && row.key in sums) {
        sums[row.key] += row.amount;
      }
    }
  }

  const total = Object.values(sums).reduce((s, v) => s + v, 0);

  const LABELS: Record<CategoryKey, string> = {
    flights: "Flights",
    lodging: "Lodging",
    food: "Food & Dining",
    transport: "Local Transport",
    activities: "Activities",
    misc: "Misc & Tips",
  };

  const keys: CategoryKey[] = ["flights", "lodging", "food", "transport", "activities", "misc"];

  // Build flight detail string from segments.
  const flightDetail = flightResult.segments
    .map((seg) => `${seg.from} \u2192 ${seg.to} ($${seg.cost})`)
    .join(" \u00B7 ");

  const breakdown: BreakdownRow[] = keys.map((key) => ({
    key,
    label: LABELS[key],
    amount: sums[key],
    pct: total > 0 ? Math.round((sums[key] / total) * 100) : 0,
    detail:
      key === "flights"
        ? `Multi-city: ${flightDetail}`
        : `Aggregated across ${legPlans.length} destinations`,
  }));

  return { breakdown, total };
}

// ─── Assumptions ────────────────────────────────────────────────────────

function buildMultiCityAssumptions(
  input: TripInput,
  legPlans: LegPlan[],
  flightResult: FlightResult,
  origin: { name: string },
): string[] {
  const a: string[] = [];

  // Route summary.
  const route = legPlans.map((l) => l.destination.name.split(",")[0].trim());
  a.push(
    `Multi-city trip: ${origin.name.split("(")[0].trim()} \u2192 ${route.join(" \u2192 ")} \u2192 ${origin.name.split("(")[0].trim()}.`,
  );

  // Flight segments.
  a.push(
    `${flightResult.segments.length} flight segments totaling $${flightResult.totalFlightCost} for ${input.travelers} traveler(s).`,
  );

  // Per-leg notes.
  for (const leg of legPlans) {
    const cityName = leg.destination.name.split(",")[0].trim();
    const nights = input.legs?.[leg.legIndex]?.nights ?? input.nights;
    a.push(`${cityName}: ${nights} nights.`);
  }

  a.push(`Style: ${STYLE_CONFIG[input.style].description}.`);

  return a;
}

// ─── Helpers ────────────────────────────────────────────────────────────

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function dayOfWeek(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return DAY_NAMES[d.getUTCDay()];
}
