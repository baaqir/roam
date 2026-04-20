/**
 * Free city geocoding via OpenStreetMap Nominatim. No API key needed.
 *
 * Returns the city's display name, country code, and lat/lng. Used by
 * `discover.ts` to assign an airport + flight region to any typed city
 * — the foundation of the keyless "type any city, get a budget" flow.
 *
 * Nominatim usage policy: max 1 req/sec, must set a meaningful User-Agent.
 * We cache aggressively so a city is geocoded at most once per process.
 */

export type GeocodeResult = {
  /** Display name from Nominatim, e.g. "Lagos, Lagos State, Nigeria". */
  displayName: string;
  /** ISO-3166-1 alpha-2 country code, uppercase. */
  countryCode: string;
  countryName: string;
  lat: number;
  lng: number;
};

const cache = new Map<string, GeocodeResult | null>();

export async function geocodeCity(query: string): Promise<GeocodeResult | null> {
  const key = query.trim().toLowerCase();
  if (cache.has(key)) return cache.get(key)!;

  const url =
    `https://nominatim.openstreetmap.org/search?` +
    new URLSearchParams({
      q: query,
      format: "json",
      limit: "1",
      addressdetails: "1",
      "accept-language": "en",
    }).toString();

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Roam/0.1 (personal trip planning tool)",
        "Accept": "application/json",
      },
    });
    if (!res.ok) {
      cache.set(key, null);
      return null;
    }
    const data = (await res.json()) as Array<{
      display_name?: string;
      lat?: string;
      lon?: string;
      address?: { country?: string; country_code?: string };
    }>;
    const top = data?.[0];
    if (!top || !top.lat || !top.lon || !top.address?.country_code) {
      cache.set(key, null);
      return null;
    }
    const result: GeocodeResult = {
      displayName: top.display_name ?? query,
      countryCode: top.address.country_code.toUpperCase(),
      countryName: top.address.country ?? top.address.country_code.toUpperCase(),
      lat: parseFloat(top.lat),
      lng: parseFloat(top.lon),
    };
    cache.set(key, result);
    return result;
  } catch {
    cache.set(key, null);
    return null;
  }
}

/**
 * Classify a destination's lat/lng into a flight region for fare pricing.
 * Reference frame is a US east-coast traveler (NYC ~40°N, -74°W).
 *
 * This is rough but consistently directional — within a category you'll
 * get the right ballpark fare. Used as a fallback when there's no
 * curated origin → destination price.
 */
import type { FlightRegion } from "./types";

export function regionFromLatLng(lat: number, lng: number): FlightRegion {
  // Rough US/Canada/Mexico continental box.
  const inNorthAmerica =
    lat >= 14 && lat <= 72 && lng >= -170 && lng <= -50;
  if (inNorthAmerica) {
    // Within the US/Canada continental block (excludes Mexico/Central Am)
    if (lat >= 24 && lat <= 72 && lng >= -130 && lng <= -65) return "domestic-us";
    return "north-america";
  }

  // Europe / Africa / Middle East — anything west of ~75°E and east of -30°W
  // that's not in the Americas.
  if (lng >= -30 && lng <= 75) {
    return "transatlantic";
  }

  // Asia / Pacific / Oceania — east of 75°E, or anything in the wraparound.
  if (lng > 75 || lng < -130) {
    return "transpacific";
  }

  return "long-haul";
}
