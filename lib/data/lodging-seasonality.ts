/**
 * Month-based multiplier for lodging prices relative to a baseline.
 * Baseline is shoulder season = 1.0.
 *
 * Lodging seasonality follows a similar but distinct pattern to flights:
 * hotels/airbnbs tend to have smoother curves since supply is fixed and
 * demand shifts more gradually. Holiday periods (Dec, Jul/Aug) see
 * the biggest premium.
 *
 * Keyed by 1-indexed month number (January = 1).
 */
export const LODGING_SEASON: Record<number, number> = {
  1: 0.85,   // Jan - post-holiday
  2: 0.8,    // Feb - cheapest
  3: 0.9,    // Mar
  4: 1.0,    // Apr - shoulder
  5: 1.05,   // May
  6: 1.2,    // Jun - summer
  7: 1.3,    // Jul - peak
  8: 1.25,   // Aug - peak
  9: 0.95,   // Sep - shoulder
  10: 1.0,   // Oct
  11: 0.85,  // Nov
  12: 1.25,  // Dec - holiday
};

/**
 * Get the lodging price seasonality multiplier for a given date string.
 * Returns 1.0 if the date is invalid or missing.
 */
export function getLodgingSeasonMultiplier(dateStr?: string): number {
  if (!dateStr) return 1.0;
  const month = new Date(dateStr + "T00:00:00Z").getMonth() + 1; // 1-indexed
  if (month < 1 || month > 12) return 1.0;
  return LODGING_SEASON[month] ?? 1.0;
}

/**
 * Get a human-readable label for the lodging seasonality at a given date.
 * Returns null if the multiplier is 1.0 (no adjustment worth mentioning).
 */
export function getLodgingSeasonLabel(dateStr?: string): string | null {
  if (!dateStr) return null;
  const month = new Date(dateStr + "T00:00:00Z").getMonth() + 1;
  const multiplier = LODGING_SEASON[month] ?? 1.0;
  if (multiplier === 1.0) return null;
  const pctStr = multiplier > 1.0
    ? `+${Math.round((multiplier - 1) * 100)}%`
    : `${Math.round((multiplier - 1) * 100)}%`;
  const monthName = new Date(dateStr + "T00:00:00Z").toLocaleString("en-US", {
    month: "long",
    timeZone: "UTC",
  });
  return `${monthName} lodging: seasonal adjustment (${pctStr})`;
}
