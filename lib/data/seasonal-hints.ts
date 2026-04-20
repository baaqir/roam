/**
 * Seasonal pricing rules. Used to display a contextual banner
 * on the trip page when travel dates fall into a known peak/special season.
 */
import type { FlightRegion } from "../types";

export type SeasonalRule = {
  months: number[];               // 1-12
  regions: FlightRegion[];        // which flight regions it applies to
  cities?: string[];              // optional: only for specific cities (lowercase keys)
  label: string;                  // human-readable label
  multiplierHint: number;         // e.g. 1.3 = prices ~30% higher than average
};

export const SEASONAL_RULES: SeasonalRule[] = [
  {
    months: [6, 7, 8],
    regions: ["transatlantic"],
    label: "Peak summer season",
    multiplierHint: 1.3,
  },
  {
    months: [12, 1],
    regions: ["transatlantic", "domestic-us", "north-america"],
    label: "Holiday season",
    multiplierHint: 1.4,
  },
  {
    months: [3, 4],
    regions: ["transpacific"],
    cities: ["tokyo", "kyoto", "osaka"],
    label: "Cherry blossom season (Japan)",
    multiplierHint: 1.2,
  },
  {
    months: [11, 12],
    regions: ["transatlantic"],
    cities: ["paris", "london", "vienna", "prague", "berlin", "munich"],
    label: "Christmas market season",
    multiplierHint: 1.15,
  },
  {
    months: [2, 3],
    regions: ["domestic-us", "north-america"],
    label: "Spring break season",
    multiplierHint: 1.2,
  },
  {
    months: [7, 8],
    regions: ["transpacific"],
    label: "Peak travel season",
    multiplierHint: 1.25,
  },
  {
    months: [9, 10],
    regions: ["transatlantic"],
    label: "Shoulder season -- great value",
    multiplierHint: 0.9,
  },
  {
    months: [1, 2, 3],
    regions: ["transatlantic"],
    label: "Off-season -- lower prices",
    multiplierHint: 0.85,
  },
];

/**
 * Find the first matching seasonal rule for a given start date, region, and city.
 */
export function findSeasonalHint(
  startDate: string,
  region: FlightRegion | undefined,
  cityKey: string,
): SeasonalRule | null {
  if (!startDate || !region) return null;
  const month = new Date(startDate + "T00:00:00Z").getUTCMonth() + 1; // 1-12
  const lowerCity = cityKey.toLowerCase();

  for (const rule of SEASONAL_RULES) {
    if (!rule.months.includes(month)) continue;
    if (!rule.regions.includes(region)) continue;
    // If rule is city-specific, check city match
    if (rule.cities && !rule.cities.some((c) => lowerCity.includes(c))) continue;
    return rule;
  }
  return null;
}
