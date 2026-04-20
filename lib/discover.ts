/**
 * Free-form destination discovery.
 *
 * Curated destinations (san-diego, los-angeles, las-vegas) load instantly
 * from the static registry. Anything else — Barcelona, Tokyo, Reykjavik —
 * is resolved at request time via Tavily web search + a single Haiku call
 * that extracts: airport code, country, region (for flight fallback),
 * and a curated activity catalog of 8-12 popular things to do.
 *
 * Results are cached in-memory by normalized key for the process lifetime.
 * Without API keys, free-form destinations cannot be resolved.
 */
import type {
  Activity,
  ActivityTag,
  Destination,
  FlightRegion,
} from "./types";
import { getDestination as getStatic, isHandCurated } from "./data/destinations";
import { tavilySearch, hasLiveSearchKeys } from "./search/tavily";
import {
  GLOBAL_FOOD_PER_DAY,
  GLOBAL_LODGING,
  GLOBAL_TRANSPORT_PER_DAY,
} from "./data/global-defaults";
import { GENERIC_ACTIVITIES } from "./data/generic-activities";
import {
  PRIMARY_AIRPORT_BY_COUNTRY,
  CITY_AIRPORT_OVERRIDES,
} from "./data/airports-by-country";
import { geocodeCity, regionFromLatLng } from "./geocode";
import { fetchWikipediaAttractions } from "./wikipedia";
import Anthropic from "@anthropic-ai/sdk";

export type ResolvedDestination = {
  destination: Destination;
  /**
   * Where the destination data came from:
   *   "static"       — hand-curated city (San Diego, LA, Las Vegas) with full data
   *   "bundled"      — bundled popular destination (Paris, Tokyo, etc.) with real activities
   *   "auto"         — auto-resolved via free geocoding (Nominatim) — real airport + region,
   *                    generic activity catalog, global tier averages for lodging/food/transport
   *   "discovered"   — live web search via Tavily + Haiku (most accurate, requires API keys)
   *   "rough"        — fallback when geocoding fails too — generic everything
   */
  source: "static" | "bundled" | "auto" | "discovered" | "rough";
  region?: FlightRegion;
  /** ISO country code (uppercase) when available from geocoding. */
  countryCode?: string;
};

const cache = new Map<string, ResolvedDestination>();

let _client: Anthropic | null = null;
function client(): Anthropic {
  if (_client) return _client;
  _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

export function normalizeKey(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Resolve any destination key (curated or free-form) to a Destination object.
 *
 * Resolution order (best → fallback):
 *   1. Hand-curated city (San Diego/LA/Las Vegas) — instant
 *   2. Bundled popular city (Paris/Tokyo/...) — instant
 *   3. In-memory cache from a previous resolution
 *   4. Live web-search discovery (Tavily + Haiku, needs API keys)
 *   5. Free auto-resolution via Nominatim — real airport + region for any city
 *   6. Rough fallback if even geocoding fails
 *
 * Always returns a result — never null.
 */
export async function resolveDestination(
  rawKey: string,
  displayHint?: string,
): Promise<ResolvedDestination> {
  const key = normalizeKey(rawKey);

  const staticDest = getStatic(key);
  if (staticDest) {
    // Distinguish hand-curated cities (city-specific pricing) from bundled
    // cities (real activities but global tier averages for lodging/food/transport).
    const source = isHandCurated(key) ? "static" : "bundled";
    return { destination: staticDest, source, region: staticDest.region };
  }

  const cached = cache.get(key);
  if (cached) return cached;

  if (hasLiveSearchKeys()) {
    const discovered = await discoverFromWeb(key, displayHint || rawKey);
    if (discovered) {
      cache.set(key, discovered);
      return discovered;
    }
  }

  // Free path: Nominatim geocoding + country/city airport map + region from lat/lng.
  const auto = await autoResolveFromGeocoding(key, displayHint || rawKey);
  if (auto) {
    cache.set(key, auto);
    return auto;
  }

  return roughResolve(key, displayHint || rawKey);
}

/**
 * Free auto-resolution: Nominatim → country code → airport → region.
 * Activities are still generic; lodging/food/transport are tier averages.
 * The big win is accurate flight pricing for any city without API keys.
 */
async function autoResolveFromGeocoding(
  key: string,
  displayName: string,
): Promise<ResolvedDestination | null> {
  const geo = await geocodeCity(displayName);
  if (!geo) return null;

  const airportCode =
    CITY_AIRPORT_OVERRIDES[key] ??
    PRIMARY_AIRPORT_BY_COUNTRY[geo.countryCode] ??
    "—";
  const region = regionFromLatLng(geo.lat, geo.lng);

  const cityShort = displayName.trim().split(",")[0];
  const cleanName = `${capitalize(cityShort)}, ${geo.countryName}`;

  // In parallel: pull real attractions from Wikipedia (also free, no key).
  // Pass the cost multiplier so Wikipedia activity costs are region-adjusted.
  const wikiActivities = await fetchWikipediaAttractions(
    cityShort,
    geo.lat,
    geo.lng,
    geo.countryName,
    geo.countryCode,
  ).catch(() => []);

  // Use Wikipedia attractions when we have at least a few; fall back to generic.
  // Even 4-5 real attractions are more useful than 12 generic placeholders.
  const usingWikipedia = wikiActivities.length >= 4;
  const activities = usingWikipedia
    ? [
        ...wikiActivities,
        // Top up with a couple of generic options so the user has variety.
        ...GENERIC_ACTIVITIES.filter((g) =>
          ["free-walking-tour", "local-food-tour", "neighborhood-wander"].includes(g.id),
        ),
      ]
    : GENERIC_ACTIVITIES;

  return {
    destination: {
      key,
      name: cleanName,
      airportCode,
      region,
      lodging: GLOBAL_LODGING,
      foodPerDay: GLOBAL_FOOD_PER_DAY,
      transportPerDay: GLOBAL_TRANSPORT_PER_DAY,
      activities,
      notes: [
        `${cleanName} was auto-resolved from OpenStreetMap. Airport ${airportCode}, classified as ${region} for flight pricing.`,
        usingWikipedia
          ? `Activities pulled from Wikipedia (${wikiActivities.length} real attractions). Costs are heuristic — click any to edit.`
          : "Activities are a generic catalog — add your own to make it specific.",
        "Lodging, food, and transport use global tier averages (~±25%).",
      ],
    },
    source: "auto",
    region,
    countryCode: geo.countryCode,
  };
}

function capitalize(s: string): string {
  return s
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Build a generic destination from the user's typed city name. Used when:
 *  - No API keys are configured (most common case)
 *  - Discovery succeeded with the keys available but returned bad data
 *
 * The estimate will be in the right ballpark (±50%) but not city-specific.
 * The UI surfaces a "Rough" badge so the user knows.
 */
export function roughResolve(
  rawKey: string,
  displayName: string,
): ResolvedDestination {
  const key = normalizeKey(rawKey);
  const name = humanizeCityName(displayName);
  return {
    destination: {
      key,
      name,
      airportCode: "—",
      lodging: GLOBAL_LODGING,
      foodPerDay: GLOBAL_FOOD_PER_DAY,
      transportPerDay: GLOBAL_TRANSPORT_PER_DAY,
      activities: GENERIC_ACTIVITIES,
      notes: [
        `Rough estimate — no live data for ${name}. Numbers use global tier averages (±50%).`,
        "Set TAVILY_API_KEY + ANTHROPIC_API_KEY to discover real activities, airport, and prices.",
      ],
    },
    // Conservative default: long-haul (most expensive flight bracket).
    // Better to over-budget than under-budget when we don't know.
    source: "rough",
    region: "long-haul",
  };
}

function humanizeCityName(input: string): string {
  return input
    .trim()
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Resolved origin (similar to ResolvedDestination but for the trip starting
 * point). Combines curated origins with any free-text city the user types.
 */
export type ResolvedOrigin = {
  key: string;
  name: string;
  airportCodes: string[];
  /**
   * Region for flight pricing fallbacks. Used when origin → destination
   * isn't in any curated baseline table.
   */
  region: FlightRegion;
  /** Curated flight base prices, if this origin is in the static registry. */
  flightBasePrices?: Record<string, Record<import("./types").Style, number>>;
  source: "static" | "auto";
};

import { getOrigin as getStaticOrigin } from "./data/origins";

const originCache = new Map<string, ResolvedOrigin>();

export async function resolveOrigin(rawKey: string): Promise<ResolvedOrigin> {
  const key = normalizeKey(rawKey);

  // 1. Curated origin (NYC, SFO, LAX, ORD, SEA).
  const curated = getStaticOrigin(key);
  if (curated) {
    // Pick a sensible region for the origin itself (most are US).
    return {
      key,
      name: curated.name,
      airportCodes: curated.airportCodes,
      region: "domestic-us",
      flightBasePrices: curated.flightBasePrices,
      source: "static",
    };
  }

  // 2. In-memory cache.
  const cached = originCache.get(key);
  if (cached) return cached;

  // 3. Geocode + airport map.
  const geo = await geocodeCity(rawKey);
  if (!geo) {
    // Unrecognizable origin → minimal fallback so the trip page still renders.
    const fallback: ResolvedOrigin = {
      key,
      name: humanizeCityName(rawKey),
      airportCodes: ["—"],
      region: "long-haul",
      source: "auto",
    };
    originCache.set(key, fallback);
    return fallback;
  }
  const airportCode =
    CITY_AIRPORT_OVERRIDES[key] ??
    PRIMARY_AIRPORT_BY_COUNTRY[geo.countryCode] ??
    "—";
  const region = regionFromLatLng(geo.lat, geo.lng);
  const cityShort = rawKey.trim().split(",")[0];
  const resolved: ResolvedOrigin = {
    key,
    name: `${humanizeCityName(cityShort)}, ${geo.countryName}`,
    airportCodes: [airportCode],
    region,
    source: "auto",
  };
  originCache.set(key, resolved);
  return resolved;
}

async function discoverFromWeb(
  key: string,
  displayName: string,
): Promise<ResolvedDestination | null> {
  // One broad search returns a mix of "city overview" + "things to do" pages.
  // The Haiku extractor turns the snippets into a structured destination.
  let search;
  try {
    search = await tavilySearch(
      `${displayName} travel guide top things to do main airport country`,
      { maxResults: 8 },
    );
  } catch {
    return null;
  }

  const snippets = search.results
    .slice(0, 8)
    .map(
      (r, i) =>
        `[${i}] ${r.title}\n${r.url}\n${r.content.slice(0, 700)}`,
    )
    .join("\n\n");

  const system = `You build a structured travel destination profile from web search snippets.

Return JSON ONLY (no prose, no fences) with this shape:
{
  "name": "City, Country" (full place name with country),
  "airportCode": "BCN" (3-letter IATA primary international airport),
  "region": one of "domestic-us" | "north-america" | "transatlantic" | "transpacific" | "long-haul" (relative to a US east coast traveler — Mexico/Canada = north-america, Europe/Africa/Middle East = transatlantic, Asia/Pacific/Oceania = transpacific, anywhere truly remote = long-haul, US cities = domestic-us),
  "activities": [
    {
      "id": short slug like "sagrada-familia",
      "name": "Sagrada Família",
      "cost": per-person USD integer (0 if free),
      "durationHours": number,
      "tags": array from {iconic, outdoor, foodie, family, nightlife, culture, adventure, free},
      "description": one sentence,
      "recommended": boolean (true for the top 5 must-dos)
    }
  ]
}

Aim for 8-12 activities — a mix of iconic landmarks, outdoors, food/markets, neighborhoods, and one nightlife/cultural pick. Use real costs from the snippets when given; estimate sensibly otherwise. Always include at least 2 free activities (parks, viewpoints, beaches, walks).`;

  const user = `Place the user typed: ${displayName}\n\nSearch snippets:\n\n${snippets}\n\nReturn the JSON now.`;

  let text: string;
  try {
    const resp = await client().messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2500,
      system,
      messages: [{ role: "user", content: user }],
    });
    text = resp.content
      .filter((c): c is Anthropic.TextBlock => c.type === "text")
      .map((c) => c.text)
      .join("");
  } catch {
    return null;
  }

  const profile = parseProfile(text);
  if (!profile) return null;

  const destination: Destination = {
    key,
    name: profile.name,
    airportCode: profile.airportCode,
    lodging: GLOBAL_LODGING,
    foodPerDay: GLOBAL_FOOD_PER_DAY,
    transportPerDay: GLOBAL_TRANSPORT_PER_DAY,
    activities: profile.activities,
    notes: [
      `${profile.name} was discovered from web search — lodging will use live prices when keys are set; food and transport use global tier averages (accurate to ~±30%).`,
    ],
  };

  // Try to get countryCode for cost-of-living adjustment.
  const discoveredGeo = await geocodeCity(displayName).catch(() => null);

  return {
    destination,
    source: "discovered",
    region: profile.region,
    countryCode: discoveredGeo?.countryCode,
  };
}

type ParsedProfile = {
  name: string;
  airportCode: string;
  region: FlightRegion;
  activities: Activity[];
};

function parseProfile(text: string): ParsedProfile | null {
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    const obj = JSON.parse(cleaned.slice(start, end + 1));
    if (
      typeof obj.name !== "string" ||
      typeof obj.airportCode !== "string" ||
      !Array.isArray(obj.activities)
    ) {
      return null;
    }
    const activities = (obj.activities as unknown[])
      .map((raw): Activity | null => {
        const a = raw as Partial<Activity>;
        if (!a || typeof a.name !== "string") return null;
        const tagsValid = Array.isArray(a.tags)
          ? (a.tags.filter((t) =>
              [
                "iconic",
                "outdoor",
                "foodie",
                "family",
                "nightlife",
                "culture",
                "adventure",
                "free",
              ].includes(t as string),
            ) as ActivityTag[])
          : [];
        return {
          id:
            (typeof a.id === "string" && a.id) ||
            a.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          name: a.name,
          cost: typeof a.cost === "number" ? Math.max(0, Math.round(a.cost)) : 0,
          durationHours:
            typeof a.durationHours === "number" ? a.durationHours : 2,
          tags: tagsValid.length ? tagsValid : ["culture"],
          description: typeof a.description === "string" ? a.description : "",
          recommended: a.recommended === true,
        };
      })
      .filter((a): a is Activity => !!a)
      .slice(0, 14);
    return {
      name: obj.name,
      airportCode: obj.airportCode.toUpperCase().slice(0, 3),
      region: validRegion(obj.region),
      activities,
    };
  } catch {
    return null;
  }
}

function validRegion(v: unknown): FlightRegion {
  const valid: FlightRegion[] = [
    "domestic-us",
    "north-america",
    "transatlantic",
    "transpacific",
    "long-haul",
  ];
  return valid.includes(v as FlightRegion) ? (v as FlightRegion) : "long-haul";
}
