/**
 * v2 estimator. Takes a simple TripInput (city, nights, travelers, style)
 * and returns a complete TripPlan with budget breakdown + auto-generated
 * day-by-day itinerary.
 *
 * Pipeline:
 *   1. Resolve destination (curated → bundled → Nominatim → rough)
 *   2. Resolve origin (auto-detect from timezone or default NYC)
 *   3. Compute cost per category
 *   4. Build day-by-day itinerary via lib/plan.ts
 *   5. Fetch context (country info, sun times, currency)
 *   6. Build pre-departure checklist
 *   7. Package into TripPlan
 */
import type {
  BreakdownRow,
  CategoryKey,
  MultiCityTripPlan,
  TripInput,
  TripPlan,
} from "./types";
import { STYLE_CONFIG } from "./types";
import { resolveDestination, resolveOrigin } from "./discover";
import { buildItinerary } from "./plan";
import { buildChecklist } from "./checklist";
import {
  fetchCountryInfo,
  fetchSunTimes,
  fetchUsdRate,
} from "./context";
import { geocodeCity } from "./geocode";
import { GLOBAL_FLIGHT_FALLBACK_RT } from "./data/global-defaults";
import { defaultStartDate } from "./url";
import { getCostMultiplier } from "./data/cost-index";
import { getFlightSeasonMultiplier, getFlightSeasonLabel } from "./data/flight-seasonality";
import { getLodgingSeasonMultiplier, getLodgingSeasonLabel } from "./data/lodging-seasonality";

/**
 * Main entry point. Returns a complete TripPlan or throws on failure.
 */
export async function planTrip(input: TripInput): Promise<TripPlan> {
  const config = STYLE_CONFIG[input.style];

  // 1. Resolve destination.
  const resolved = await resolveDestination(input.city);
  const dest = resolved.destination;

  // 2. Resolve origin (use input.origin if provided, otherwise default NYC).
  const origin = await resolveOrigin(input.origin ?? "nyc");

  // 3. Cost-of-living multiplier.
  // For hand-curated cities (source === "static"), don't adjust — they have
  // accurate city-specific numbers. For bundled/auto/discovered/rough, apply
  // the regional cost-of-living index to food/lodging/transport.
  let costMultiplier = 1.0;
  let countryCode = resolved.countryCode;

  if (resolved.source !== "static") {
    // If we already have a countryCode from resolution, use it.
    // Otherwise, geocode to get one.
    if (!countryCode) {
      const earlyGeo = await geocodeCity(dest.name).catch(() => null);
      if (earlyGeo) countryCode = earlyGeo.countryCode;
    }
    if (countryCode) {
      costMultiplier = getCostMultiplier(countryCode);
    }
  }

  // 4. Flight seasonality multiplier.
  const startDate = input.startDate || defaultStartDate();
  const flightSeasonMultiplier = getFlightSeasonMultiplier(startDate);

  // 4b. Lodging seasonality multiplier.
  const lodgingSeasonMultiplier = getLodgingSeasonMultiplier(startDate);

  // 5. Compute costs.
  const flights = computeFlights(origin, dest, resolved.region, input, flightSeasonMultiplier);
  const lodging = computeLodging(dest, config.lodgingType, input, costMultiplier, lodgingSeasonMultiplier);
  const food = computeFood(dest, input, costMultiplier);
  const transport = computeTransport(dest, config.transportMode, input, costMultiplier);
  const activities = computeActivities(dest, input);
  const subtotal = flights + lodging + food + transport + activities;
  const misc = Math.round(subtotal * 0.1);
  const total = subtotal + misc;

  // 6. Build breakdown.
  const breakdown = buildBreakdown(
    { flights, lodging, food, transport, activities, misc },
    total,
    dest,
    config,
    input,
    costMultiplier,
  );

  // 7. Build itinerary.
  const daysWithDates = buildItinerary(dest, startDate, input.nights, input.travelers, input.style, input.profile);

  // 8. Fetch context (parallel, non-blocking).
  const geo = await geocodeCity(dest.name).catch(() => null);
  const [country, sun, usdToLocal] = await Promise.all([
    geo
      ? fetchCountryInfo(geo.countryCode).catch(() => null)
      : Promise.resolve(null),
    geo
      ? fetchSunTimes(geo.lat, geo.lng, startDate).catch(() => null)
      : Promise.resolve(null),
    Promise.resolve(null).then(async () => {
      if (!geo) return null;
      const info = await fetchCountryInfo(geo.countryCode).catch(() => null);
      if (!info || info.currencyCode === "USD") return null;
      return fetchUsdRate(info.currencyCode).catch(() => null);
    }),
  ]);

  // 9. Checklist.
  const checklist = buildChecklist(
    dest.name,
    geo?.countryCode,
    country,
  ).items;

  // 10. Assumptions.
  const assumptions = buildAssumptions(
    dest, origin, resolved.source, input,
    costMultiplier, countryCode, startDate,
  );

  return {
    id: `trip-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    input,
    destination: dest,
    originName: origin.name,
    originAirport: origin.airportCodes[0],
    total,
    perPerson: Math.round(total / input.travelers),
    breakdown,
    days: daysWithDates,
    context: { country: country ?? undefined, sun: sun ?? undefined, usdToLocal: usdToLocal ?? undefined },
    checklist,
    assumptions,
    createdAt: new Date().toISOString(),
  };
}

// ─── Multi-city router ──────────────────────────────────────────────────

/**
 * Plan any trip: dispatches to single-city planTrip or multi-city
 * planMultiCityTrip based on whether input.legs has 2+ entries.
 */
export async function planAnyTrip(
  input: TripInput,
): Promise<TripPlan | MultiCityTripPlan> {
  if (input.legs && input.legs.length > 1) {
    const { planMultiCityTrip } = await import("./multi-city-estimate");
    return planMultiCityTrip(input);
  }
  return planTrip(normalizeToSingleCity(input));
}

/**
 * When the user passes a single-element legs array, normalize it back
 * to the standard city/nights/style fields for backward compat.
 */
function normalizeToSingleCity(input: TripInput): TripInput {
  if (input.legs && input.legs.length === 1) {
    return {
      ...input,
      city: input.legs[0].city,
      nights: input.legs[0].nights,
      style: input.legs[0].style ?? input.style,
    };
  }
  return input;
}

// ─── Cost computation (pure, single-city) ────────────────────────────────

function computeFlights(
  origin: { flightBasePrices?: Record<string, Record<string, number>> },
  dest: { key: string; region?: string },
  resolvedRegion: string | undefined,
  input: TripInput,
  seasonMultiplier: number = 1.0,
): number {
  const curated = origin.flightBasePrices?.[dest.key]?.[input.style];
  if (curated && curated > 0) return Math.round(curated * seasonMultiplier * input.travelers);
  const region = (dest.region ?? resolvedRegion ?? "long-haul") as keyof typeof GLOBAL_FLIGHT_FALLBACK_RT;
  const fallback = GLOBAL_FLIGHT_FALLBACK_RT[region]?.[input.style] ?? 1100;
  return Math.round(fallback * seasonMultiplier * input.travelers);
}

/** Calculate number of rooms needed based on traveler count. */
function roomCount(travelers: number): number {
  if (travelers <= 2) return 1;
  return Math.ceil(travelers / 2); // 3-4 = 2 rooms, 5-6 = 3 rooms, etc.
}

function computeLodging(
  dest: TripPlan["destination"],
  lodgingType: "hotel" | "airbnb",
  input: TripInput,
  costMultiplier: number = 1.0,
  seasonMultiplier: number = 1.0,
): number {
  const rate = dest.lodging[lodgingType][input.style].nightlyRate;
  const rooms = lodgingType === "hotel" ? roomCount(input.travelers) : 1;
  return Math.round(rate * costMultiplier * seasonMultiplier * input.nights * rooms);
}

function computeFood(dest: TripPlan["destination"], input: TripInput, costMultiplier: number = 1.0): number {
  const days = input.nights + 1;
  const perDay = dest.foodPerDay[input.style];
  const styleMult = STYLE_CONFIG[input.style].mealMultiplier;
  return Math.round(perDay * styleMult * costMultiplier * days * input.travelers);
}

function computeTransport(
  dest: TripPlan["destination"],
  mode: "rideshare" | "rental" | "publicTransit",
  input: TripInput,
  costMultiplier: number = 1.0,
): number {
  const days = input.nights + 1;
  return Math.round(dest.transportPerDay[mode] * costMultiplier * days);
}

function computeActivities(
  dest: TripPlan["destination"],
  input: TripInput,
): number {
  // Pick the same activities the itinerary builder would pick,
  // then sum their costs.
  const recommended = dest.activities.filter((a) => a.recommended);
  const selected = recommended.length >= 4 ? recommended : dest.activities.slice(0, 8);
  return selected.reduce((s, a) => s + a.cost * input.travelers, 0);
}

// ─── Breakdown ───────────────────────────────────────────────────────────

const LABELS: Record<CategoryKey, string> = {
  flights: "Flights",
  lodging: "Lodging",
  food: "Food & Dining",
  transport: "Local Transport",
  activities: "Activities",
  misc: "Misc & Tips",
};

function buildBreakdown(
  costs: Record<CategoryKey, number>,
  total: number,
  dest: TripPlan["destination"],
  config: (typeof STYLE_CONFIG)[TripInput["style"]],
  input: TripInput,
  costMultiplier: number = 1.0,
): BreakdownRow[] {
  const keys: CategoryKey[] = ["flights", "lodging", "food", "transport", "activities", "misc"];
  return keys.map((key) => ({
    key,
    label: LABELS[key],
    amount: costs[key],
    pct: total > 0 ? Math.round((costs[key] / total) * 100) : 0,
    detail: detailFor(key, costs[key], dest, config, input, costMultiplier),
  }));
}

function detailFor(
  key: CategoryKey,
  amount: number,
  dest: TripPlan["destination"],
  config: (typeof STYLE_CONFIG)[TripInput["style"]],
  input: TripInput,
  costMultiplier: number = 1.0,
): string {
  switch (key) {
    case "flights":
      return `Round-trip to ${dest.airportCode} × ${input.travelers} traveler(s)`;
    case "lodging": {
      const baseRate = dest.lodging[config.lodgingType][input.style].nightlyRate;
      const adjustedRate = Math.round(baseRate * costMultiplier);
      const example = dest.lodging[config.lodgingType][input.style].examples[0];
      const adj = costMultiplier !== 1.0 ? " (adjusted)" : "";
      const rooms = config.lodgingType === "hotel" ? roomCount(input.travelers) : 1;
      const roomStr = rooms > 1 ? ` × ${rooms} rooms` : "";
      return `${input.nights} nights × $${adjustedRate}/night${adj}${roomStr} (${config.lodgingType}${example ? `, like ${example}` : ""})`;
    }
    case "food": {
      const baseFood = dest.foodPerDay[input.style];
      const adjustedFood = Math.round(baseFood * costMultiplier);
      const adj = costMultiplier !== 1.0 ? " (adjusted)" : "";
      return `${input.nights + 1} days × ~$${adjustedFood}/person/day${adj}`;
    }
    case "transport":
      return `${input.nights + 1} days via ${config.transportMode}`;
    case "activities":
      return `${dest.activities.filter((a) => a.recommended).length || "several"} activities × ${input.travelers} traveler(s)`;
    case "misc":
      return "Tips, bags, parking, souvenirs (~10% buffer)";
  }
}

function buildAssumptions(
  dest: TripPlan["destination"],
  origin: { name: string; source: string },
  destSource: string,
  input: TripInput,
  costMultiplier: number = 1.0,
  countryCode?: string,
  startDate?: string,
): string[] {
  const a: string[] = [];
  a.push(`Flying from ${origin.name} (${origin.source === "auto" ? "auto-detected" : "default"}).`);
  if (destSource === "auto") {
    a.push(`${dest.name} auto-resolved via OpenStreetMap — food/transport use global averages.`);
  } else if (destSource === "bundled") {
    a.push(`${dest.name} lodging/food/transport use global tier averages.`);
  } else if (destSource === "rough") {
    a.push(`${dest.name} uses rough global estimates.`);
  }

  // Cost-of-living adjustment.
  if (costMultiplier !== 1.0 && destSource !== "static") {
    const cityShort = dest.name.split(",")[0].trim();
    a.push(
      `Food/lodging/transport adjusted for ${cityShort} cost of living (${costMultiplier.toFixed(2)}\u00d7 US average).`
    );
  }

  // Flight seasonality.
  const flightLabel = getFlightSeasonLabel(startDate);
  if (flightLabel) {
    a.push(`${flightLabel}.`);
  }

  // Lodging seasonality.
  const lodgingLabel = getLodgingSeasonLabel(startDate);
  if (lodgingLabel) {
    a.push(`${lodgingLabel}.`);
  }

  // Room count.
  const rooms = roomCount(input.travelers);
  if (rooms > 1) {
    a.push(`Lodging based on ${rooms} rooms (2 travelers per room).`);
  }

  a.push(`Style: ${STYLE_CONFIG[input.style].description}.`);
  if (dest.notes) a.push(...dest.notes);
  return a;
}

