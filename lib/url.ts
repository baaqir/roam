/**
 * v2 URL encoding. Supports single-city and multi-city formats.
 *
 * Single-city (backward compat):
 *   /trip?city=barcelona&nights=5&travelers=2&style=comfort&start=2026-05-10
 *
 * Multi-city:
 *   /trip?legs=barcelona~5~comfort,paris~3~comfort&travelers=2&style=comfort&start=2026-07-15
 *
 * Leg format: city~nights~style (style is optional per leg, falls back to trip-level).
 */
import type { Style, TripInput, TripLeg } from "./types";
import type { TravelerProfile } from "./profile";
import { encodeProfileForURL, decodeProfileFromURL } from "./profile";

/** Default start date: 2 weeks from now (YYYY-MM-DD). */
export function defaultStartDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().slice(0, 10);
}

export function encodeTripInput(input: TripInput): URLSearchParams {
  const params: Record<string, string> = {
    travelers: String(input.travelers),
    style: input.style,
  };
  if (input.startDate) {
    params.start = input.startDate;
  }
  if (input.origin) {
    params.origin = input.origin;
  }
  if (input.profile) {
    params.profile = encodeProfileForURL(input.profile);
  }

  // Multi-city: encode legs when 2+ entries
  if (input.legs && input.legs.length >= 2) {
    params.legs = input.legs
      .map((leg) => {
        const parts = [leg.city, String(leg.nights)];
        // Include per-leg style only when it differs from the trip-level style
        if (leg.style && leg.style !== input.style) {
          parts.push(leg.style);
        }
        return parts.join("~");
      })
      .join(",");
  } else {
    // Single-city (backward compat)
    params.city = input.city;
    params.nights = String(input.nights);
  }

  return new URLSearchParams(params);
}

export function decodeTripInput(
  params: Record<string, string | string[] | undefined>,
): TripInput {
  const get = (k: string) =>
    Array.isArray(params[k]) ? params[k]?.[0] : params[k];

  const style = validStyle(get("style"));
  const travelers = clamp(parseInt(get("travelers") ?? "1", 10), 1, 8, 1);
  const startDate = validDate(get("start")) ?? defaultStartDate();
  const origin = get("origin") || undefined;
  const profile = decodeProfileFromURL(get("profile") ?? undefined);

  // Multi-city: parse legs param
  const legsRaw = get("legs");
  if (legsRaw) {
    const legs = parseLegs(legsRaw, style);
    if (legs.length >= 2) {
      return {
        city: legs[0].city,
        nights: legs[0].nights,
        travelers,
        style,
        startDate,
        origin,
        legs,
        profile,
      };
    }
  }

  // Single-city (backward compat)
  return {
    city: get("city") ?? "san-diego",
    nights: clamp(parseInt(get("nights") ?? "3", 10), 1, 30, 3),
    travelers,
    style,
    startDate,
    origin,
    profile,
  };
}

/**
 * Parse the `legs` query param: "barcelona~5~comfort,paris~3" into TripLeg[].
 * Style per leg is optional; falls back to the trip-level style.
 */
function parseLegs(raw: string, tripStyle: Style): TripLeg[] {
  const parsed: TripLeg[] = [];
  for (const segment of raw.split(",")) {
    const parts = segment.trim().split("~");
    if (parts.length < 2) continue;
    const city = parts[0].trim();
    if (!city) continue;
    const nights = clamp(parseInt(parts[1], 10), 1, 30, 3);
    const legStyle = parts[2] ? validStyle(parts[2].trim()) : undefined;
    const leg: TripLeg = { city, nights };
    if (legStyle && legStyle !== tripStyle) leg.style = legStyle;
    parsed.push(leg);
  }
  return parsed;
}

function clamp(v: number, min: number, max: number, fallback: number): number {
  if (Number.isNaN(v)) return fallback;
  return Math.max(min, Math.min(max, v));
}

function validStyle(v: string | undefined): Style {
  if (v === "budget" || v === "comfort" || v === "luxury") return v;
  return "comfort";
}

function validDate(v: string | undefined): string | undefined {
  if (!v) return undefined;
  // Must match YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return undefined;
  const d = new Date(v + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return undefined;
  return v;
}
