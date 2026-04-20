/**
 * Month-based multiplier for flight prices relative to a baseline.
 * Baseline is spring/fall shoulder season = 1.0.
 *
 * These are rough US-centric averages from Google Flights and Hopper
 * historical data. Actual seasonality varies by route (e.g., ski
 * destinations peak in Jan, beach destinations peak in Jul), but
 * across all international routes this is a solid first approximation.
 *
 * Keyed by 1-indexed month number (January = 1).
 */
export const FLIGHT_SEASON: Record<number, number> = {
  1: 0.85,   // Jan - post-holiday dip
  2: 0.8,    // Feb - cheapest month
  3: 0.9,    // Mar - spring break bump
  4: 1.0,    // Apr - shoulder
  5: 1.0,    // May - shoulder
  6: 1.2,    // Jun - summer starts
  7: 1.35,   // Jul - peak summer
  8: 1.3,    // Aug - peak summer
  9: 0.95,   // Sep - shoulder
  10: 1.0,   // Oct - shoulder
  11: 0.9,   // Nov - pre-holiday dip (except Thanksgiving week)
  12: 1.4,   // Dec - holiday peak
};

/** Human-readable label for the seasonal multiplier. */
const SEASON_LABELS: Record<number, string> = {
  1: "post-holiday dip",
  2: "cheapest month",
  3: "spring break bump",
  4: "shoulder season",
  5: "shoulder season",
  6: "early summer pricing",
  7: "peak summer",
  8: "peak summer",
  9: "shoulder season",
  10: "shoulder season",
  11: "pre-holiday dip",
  12: "holiday peak",
};

/**
 * Get the flight price seasonality multiplier for a given date string.
 * Returns 1.0 if the date is invalid or missing.
 */
export function getFlightSeasonMultiplier(dateStr?: string): number {
  if (!dateStr) return 1.0;
  const month = new Date(dateStr + "T00:00:00Z").getMonth() + 1; // 1-indexed
  if (month < 1 || month > 12) return 1.0;
  return FLIGHT_SEASON[month] ?? 1.0;
}

/**
 * Get a human-readable label for the flight seasonality at a given date.
 * Returns null if the multiplier is 1.0 (no adjustment worth mentioning).
 */
export function getFlightSeasonLabel(dateStr?: string): string | null {
  if (!dateStr) return null;
  const month = new Date(dateStr + "T00:00:00Z").getMonth() + 1;
  const multiplier = FLIGHT_SEASON[month] ?? 1.0;
  if (multiplier === 1.0) return null;
  const label = SEASON_LABELS[month] ?? "seasonal pricing";
  const pctStr = multiplier > 1.0
    ? `+${Math.round((multiplier - 1) * 100)}%`
    : `${Math.round((multiplier - 1) * 100)}%`;
  const monthName = new Date(dateStr + "T00:00:00Z").toLocaleString("en-US", {
    month: "long",
    timeZone: "UTC",
  });
  return `${monthName} flights: ${label} (${pctStr})`;
}
