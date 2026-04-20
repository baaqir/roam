import type { Origin, Style } from "@/lib/types";

type FareTable = Record<Style, number>;

/**
 * Origin metadata + flight base prices.
 *
 * `flightBasePrices[destinationKey][tier]` is the average round-trip per-person
 * fare in USD. Numbers are sourced from Kayak/Google Flights/Expedia spot-checks
 * for spring 2026 fares (April-May travel window).
 *
 * These are the *fallback* values when the live web-search layer is disabled
 * or fails. The live layer overwrites them when active.
 */
export const origins: Record<string, Origin> = {
  nyc: {
    key: "nyc",
    name: "New York City area (JFK / LGA / EWR)",
    airportCodes: ["JFK", "LGA", "EWR"],
    flightBasePrices: {
      "san-diego": tier(240, 320, 1200),
      "los-angeles": tier(230, 310, 1150),
      "las-vegas": tier(220, 300, 1050),
    },
  },
  sfo: {
    key: "sfo",
    name: "SF Bay Area (SFO / OAK / SJC)",
    airportCodes: ["SFO", "OAK", "SJC"],
    flightBasePrices: {
      "san-diego": tier(130, 200, 700),
      "los-angeles": tier(110, 180, 650),
      "las-vegas": tier(120, 190, 700),
    },
  },
  lax: {
    key: "lax",
    name: "Los Angeles area (LAX / BUR / SNA)",
    airportCodes: ["LAX", "BUR", "SNA"],
    flightBasePrices: {
      "san-diego": tier(90, 160, 550),
      "los-angeles": tier(0, 0, 0), // same city — won't be selected
      "las-vegas": tier(95, 170, 600),
    },
  },
  ord: {
    key: "ord",
    name: "Chicago area (ORD / MDW)",
    airportCodes: ["ORD", "MDW"],
    flightBasePrices: {
      "san-diego": tier(220, 320, 1100),
      "los-angeles": tier(200, 290, 1050),
      "las-vegas": tier(180, 270, 1000),
    },
  },
  sea: {
    key: "sea",
    name: "Seattle (SEA)",
    airportCodes: ["SEA"],
    flightBasePrices: {
      "san-diego": tier(180, 260, 850),
      "los-angeles": tier(150, 230, 800),
      "las-vegas": tier(160, 240, 800),
    },
  },
};

function tier(budget: number, comfort: number, luxury: number): FareTable {
  return { budget, comfort, luxury };
}

export function getOrigin(key: string): Origin | undefined {
  return origins[key];
}

export function listOrigins(): Origin[] {
  return Object.values(origins);
}

/**
 * Rough one-way fare between two destinations (used for multi-city legs
 * that aren't the outbound or return). Keyed by airport-code pair (sorted).
 *
 * Source: typical short-haul US one-way fares for nearby cities.
 * Falls through to MULTI_CITY_DEFAULT for unknown pairs.
 */
const INTER_CITY_ONEWAY: Record<string, Record<Style, number>> = {
  "LAS-SAN": tier(80, 130, 400),
  "LAX-LAS": tier(70, 120, 380),
  "LAX-SAN": tier(60, 110, 350),
};

const MULTI_CITY_DEFAULT: FareTable = tier(180, 260, 700);

export function interCityOneWay(
  fromKey: string,
  toKey: string,
  styleTier: Style,
): number {
  const from = getOrigin(fromKey)?.airportCodes[0];
  const to = getOrigin(toKey)?.airportCodes[0];
  // Try the destinations index for non-origin keys.
  const fromCode = from ?? destinationAirport(fromKey);
  const toCode = to ?? destinationAirport(toKey);
  if (!fromCode || !toCode) return MULTI_CITY_DEFAULT[styleTier];
  const pair = [fromCode, toCode].sort().join("-");
  return INTER_CITY_ONEWAY[pair]?.[styleTier] ?? MULTI_CITY_DEFAULT[styleTier];
}

// Avoid a circular import by inlining the destination airport lookup.
function destinationAirport(key: string): string | undefined {
  // Hard-coded list — keep in sync with destinations/index.ts.
  const map: Record<string, string> = {
    "san-diego": "SAN",
    "los-angeles": "LAX",
    "las-vegas": "LAS",
  };
  return map[key];
}
