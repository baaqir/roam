/**
 * Regional cost-of-living index relative to the US average (1.0).
 *
 * This adjusts global food/lodging/transport defaults so "$85/day food"
 * becomes "$40/day in Bangkok" or "$120/day in Zurich." Applied only to
 * auto-resolved and rough destinations that use global tier averages;
 * hand-curated cities already have accurate city-specific numbers.
 *
 * Source: rough composite from Numbeo Cost of Living Index, Big Mac Index,
 * and Budget Your Trip per-country averages, as of 2026-Q1. Values are
 * *tourist-facing* costs (restaurants, hotels, taxis), not local salaries.
 *
 * Keyed by ISO 3166-1 alpha-2 country code, values are multipliers
 * relative to US = 1.0.
 */

export const COST_INDEX: Record<string, number> = {
  // ─── Very Expensive (1.2+) ──────────────────────────────────────────────
  CH: 1.8,  // Switzerland
  NO: 1.7,  // Norway
  IS: 1.6,  // Iceland
  DK: 1.5,  // Denmark
  SE: 1.4,  // Sweden
  FI: 1.3,  // Finland
  LU: 1.4,  // Luxembourg
  AU: 1.3,  // Australia
  NZ: 1.2,  // New Zealand
  JP: 1.3,  // Japan
  SG: 1.3,  // Singapore
  HK: 1.3,  // Hong Kong
  IL: 1.2,  // Israel
  IE: 1.2,  // Ireland
  BM: 1.8,  // Bermuda
  BS: 1.3,  // Bahamas
  BB: 1.2,  // Barbados
  MV: 1.3,  // Maldives

  // ─── Expensive (1.0-1.19) ──────────────────────────────────────────────
  GB: 1.15, // United Kingdom
  FR: 1.1,  // France
  DE: 1.0,  // Germany
  NL: 1.1,  // Netherlands
  BE: 1.05, // Belgium
  AT: 1.05, // Austria
  IT: 1.0,  // Italy
  KR: 0.95, // South Korea
  AE: 1.1,  // UAE
  QA: 1.1,  // Qatar
  BH: 1.0,  // Bahrain
  KW: 1.0,  // Kuwait
  TW: 0.85, // Taiwan

  // ─── US Baseline (1.0) ─────────────────────────────────────────────────
  US: 1.0,  // United States
  CA: 1.0,  // Canada

  // ─── Moderate (0.5-0.99) ───────────────────────────────────────────────
  ES: 0.9,  // Spain
  PT: 0.85, // Portugal
  GR: 0.75, // Greece
  CZ: 0.7,  // Czech Republic
  PL: 0.6,  // Poland
  HR: 0.65, // Croatia
  HU: 0.6,  // Hungary
  SK: 0.6,  // Slovakia
  SI: 0.7,  // Slovenia
  RO: 0.5,  // Romania
  BG: 0.45, // Bulgaria
  RS: 0.5,  // Serbia
  ME: 0.6,  // Montenegro
  BA: 0.45, // Bosnia & Herzegovina
  AL: 0.4,  // Albania
  MK: 0.4,  // North Macedonia
  MT: 0.85, // Malta
  CY: 0.85, // Cyprus
  EE: 0.7,  // Estonia
  LV: 0.65, // Latvia
  LT: 0.6,  // Lithuania
  GE: 0.4,  // Georgia
  AM: 0.4,  // Armenia

  MX: 0.55, // Mexico
  CR: 0.7,  // Costa Rica
  PA: 0.65, // Panama
  AR: 0.5,  // Argentina
  CL: 0.65, // Chile
  UY: 0.7,  // Uruguay
  BR: 0.55, // Brazil
  CO: 0.45, // Colombia
  PE: 0.45, // Peru
  EC: 0.45, // Ecuador
  BO: 0.35, // Bolivia

  TR: 0.45, // Turkey
  MA: 0.45, // Morocco
  TN: 0.4,  // Tunisia
  EG: 0.35, // Egypt
  JO: 0.55, // Jordan
  OM: 0.7,  // Oman
  SA: 0.8,  // Saudi Arabia

  ZA: 0.55, // South Africa
  KE: 0.4,  // Kenya
  NA: 0.5,  // Namibia
  RW: 0.4,  // Rwanda
  MU: 0.65, // Mauritius

  CN: 0.55, // China
  MY: 0.45, // Malaysia

  // ─── Cheap (< 0.5) ────────────────────────────────────────────────────
  TH: 0.35, // Thailand
  VN: 0.3,  // Vietnam
  ID: 0.35, // Indonesia
  PH: 0.35, // Philippines
  KH: 0.3,  // Cambodia
  LA: 0.25, // Laos
  MM: 0.25, // Myanmar
  IN: 0.25, // India
  LK: 0.3,  // Sri Lanka
  NP: 0.2,  // Nepal
  BD: 0.2,  // Bangladesh
  PK: 0.2,  // Pakistan
  UZ: 0.3,  // Uzbekistan

  NG: 0.3,  // Nigeria
  GH: 0.3,  // Ghana
  ET: 0.25, // Ethiopia
  TZ: 0.35, // Tanzania
  UG: 0.3,  // Uganda
  SN: 0.35, // Senegal
  MG: 0.25, // Madagascar
  MZ: 0.3,  // Mozambique

  GT: 0.4,  // Guatemala
  HN: 0.35, // Honduras
  NI: 0.35, // Nicaragua
  DO: 0.5,  // Dominican Republic
  CU: 0.45, // Cuba
  JM: 0.6,  // Jamaica
  TT: 0.6,  // Trinidad & Tobago
};

/**
 * Look up the cost-of-living multiplier for a country.
 * Returns a default of 0.8 (slightly below US average) for unknown countries.
 */
export function getCostMultiplier(countryCode: string): number {
  return COST_INDEX[countryCode.toUpperCase()] ?? 0.8;
}

/**
 * Human-readable label for the multiplier, used in assumption strings.
 * Examples: "0.35x US average", "1.3x US average"
 */
export function costMultiplierLabel(multiplier: number): string {
  if (multiplier === 1.0) return "US average";
  const dir = multiplier > 1.0 ? "above" : "below";
  return `${multiplier.toFixed(2)}x US average (${dir})`;
}
