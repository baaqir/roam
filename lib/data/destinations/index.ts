import type { Destination } from "@/lib/types";
import { sanDiego } from "./san-diego";
import { losAngeles } from "./los-angeles";
import { lasVegas } from "./las-vegas";
import { BUNDLED_CITIES } from "./bundled";

/**
 * All baked-in destinations.
 *
 * Two tiers of curation:
 *   1. **Hand-curated** (sanDiego, losAngeles, lasVegas) — full data including
 *      city-specific lodging tiers with real example hotels seeded from
 *      DirectBooker, plus regionalized food/transport defaults.
 *   2. **Bundled popular cities** (Paris, Tokyo, Barcelona, ...) — real airport
 *      codes, region-correct flight pricing, and hand-picked activity catalogs.
 *      Lodging/food/transport use global tier averages; live search overrides
 *      these when API keys are set.
 *
 * Add a new hand-curated city: write `{key}.ts`, import here.
 * Add a new bundled city: append to BUNDLED_CITIES in `bundled.ts`.
 */

const handCurated: Destination[] = [sanDiego, losAngeles, lasVegas];

/** Set of keys for hand-curated cities with city-specific pricing. */
const handCuratedKeys = new Set(handCurated.map((d) => d.key));

export const destinations: Record<string, Destination> = Object.fromEntries(
  [...handCurated, ...BUNDLED_CITIES].map((d) => [d.key, d]),
);

export function getDestination(key: string): Destination | undefined {
  return destinations[key];
}

/**
 * Returns true if the destination key is a hand-curated city with
 * city-specific lodging/food/transport pricing (not global defaults).
 */
export function isHandCurated(key: string): boolean {
  return handCuratedKeys.has(key);
}

export function listDestinations(): Destination[] {
  return Object.values(destinations);
}
