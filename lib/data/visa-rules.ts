/**
 * Visa requirements for US passport holders, by destination country code.
 * Source: US State Department + IATA Travel Information (compiled 2026-Q1).
 *
 * Categories:
 *   visa-free      — no visa needed for short tourist stays (≤90 days typically)
 *   eta            — pre-arrival electronic authorization required (ETA / ESTA-style)
 *   visa-on-arrival — buy at the airport on landing
 *   evisa          — must apply online before travel; arrives by email
 *   visa-required  — must apply at consulate/embassy beforehand
 *   unknown        — not in our table; user should look it up
 *
 * This list focuses on the most-traveled tourist destinations. For everywhere
 * else the checklist will say "check visa requirements at travel.state.gov".
 */
export type VisaCategory =
  | "visa-free"
  | "eta"
  | "visa-on-arrival"
  | "evisa"
  | "visa-required"
  | "unknown";

export const US_VISA_REQUIREMENTS: Record<string, VisaCategory> = {
  // North America
  CA: "visa-free", MX: "visa-free",
  // Caribbean & Central America (mostly visa-free for US)
  BS: "visa-free", DO: "visa-free", JM: "visa-free", BB: "visa-free",
  TT: "visa-free", AW: "visa-free", KY: "visa-free", PR: "visa-free",
  CR: "visa-free", PA: "visa-free", BZ: "visa-free", GT: "visa-free",
  HN: "visa-free", NI: "visa-free", SV: "visa-free", CU: "visa-required",
  // South America (most visa-free; Brazil reinstated eVisa April 2025)
  BR: "evisa", AR: "visa-free", CL: "visa-free", PE: "visa-free",
  CO: "visa-free", EC: "visa-free", UY: "visa-free", PY: "visa-free",
  VE: "visa-required", BO: "visa-on-arrival", GY: "visa-free", SR: "visa-free",
  // Europe (Schengen + EU + UK + Ireland — note EU ETIAS launching late 2026)
  GB: "visa-free", IE: "visa-free", FR: "eta", DE: "eta", IT: "eta",
  ES: "eta", PT: "eta", NL: "eta", BE: "eta", AT: "eta", CH: "eta",
  GR: "eta", SE: "eta", NO: "eta", FI: "eta", DK: "eta", IS: "eta",
  PL: "eta", CZ: "eta", SK: "eta", HU: "eta", RO: "eta", BG: "eta",
  HR: "eta", SI: "eta", EE: "eta", LV: "eta", LT: "eta", LU: "eta",
  MT: "eta", CY: "eta", AL: "visa-free", RS: "visa-free", BA: "visa-free",
  ME: "visa-free", MK: "visa-free", MD: "visa-free", UA: "visa-free",
  BY: "visa-required", RU: "visa-required", TR: "evisa",
  // Middle East
  IL: "eta", AE: "visa-on-arrival", QA: "visa-on-arrival", SA: "evisa",
  JO: "visa-on-arrival", LB: "visa-on-arrival", OM: "evisa",
  KW: "visa-on-arrival", BH: "evisa", IR: "visa-required", IQ: "evisa",
  // Africa
  EG: "visa-on-arrival", MA: "visa-free", TN: "visa-free", DZ: "visa-required",
  ZA: "visa-free", KE: "evisa", TZ: "visa-on-arrival", UG: "visa-on-arrival",
  ET: "evisa", RW: "visa-on-arrival", GH: "evisa", NG: "visa-required",
  SN: "visa-free", CI: "evisa", ZW: "visa-on-arrival", BW: "visa-free",
  NA: "visa-free", MU: "visa-free", SC: "visa-free", MZ: "visa-on-arrival",
  // South Asia
  IN: "evisa", LK: "evisa", NP: "visa-on-arrival", BD: "visa-on-arrival",
  PK: "visa-required", BT: "evisa", MV: "visa-free",
  // SE Asia
  TH: "visa-free", VN: "evisa", KH: "visa-on-arrival", LA: "visa-on-arrival",
  MM: "evisa", MY: "visa-free", SG: "visa-free", ID: "visa-on-arrival",
  PH: "visa-free", BN: "visa-free",
  // East Asia
  JP: "visa-free", KR: "eta", CN: "visa-required", HK: "visa-free",
  MO: "visa-free", TW: "visa-free", MN: "visa-free",
  // Central Asia / Caucasus
  KZ: "visa-free", UZ: "visa-free", KG: "visa-free", GE: "visa-free",
  AM: "visa-free", AZ: "evisa",
  // Oceania
  AU: "eta", NZ: "eta", FJ: "visa-free", PG: "visa-on-arrival",
};

export const VISA_LABELS: Record<VisaCategory, string> = {
  "visa-free": "No visa needed (short tourist stays)",
  "eta": "Electronic Travel Authorization (eTA / ESTA-style) required — apply online before travel",
  "visa-on-arrival": "Visa on arrival — purchase at the airport when you land",
  "evisa": "eVisa required — apply online before travel",
  "visa-required": "Visa required — apply at consulate/embassy weeks ahead",
  "unknown": "Check visa requirements at travel.state.gov",
};

/**
 * Countries with health/vaccination considerations beyond standard travel
 * recommendations. Triggers a vaccination row in the checklist.
 */
export const HEALTH_NOTES: Record<string, string[]> = {
  // Yellow-fever endemic areas (CDC list, abridged)
  KE: ["Yellow fever vaccine recommended (CDC)"],
  TZ: ["Yellow fever vaccine recommended (CDC)"],
  UG: ["Yellow fever vaccine recommended (CDC)"],
  ET: ["Yellow fever vaccine recommended (CDC)"],
  RW: ["Yellow fever vaccine recommended (CDC)"],
  GH: ["Yellow fever vaccine REQUIRED for entry"],
  NG: ["Yellow fever vaccine REQUIRED for entry"],
  CI: ["Yellow fever vaccine REQUIRED for entry"],
  SN: ["Yellow fever vaccine REQUIRED for entry"],
  CD: ["Yellow fever vaccine REQUIRED for entry"],
  AO: ["Yellow fever vaccine REQUIRED for entry"],
  BR: ["Yellow fever vaccine recommended for Amazon/Pantanal regions"],
  PE: ["Yellow fever vaccine recommended for Amazon region"],
  EC: ["Yellow fever vaccine recommended for Amazon region"],
  CO: ["Yellow fever vaccine recommended for some regions"],
  BO: ["Yellow fever vaccine recommended for low-altitude regions"],
  // Malaria-zone notes
  IN: ["Consider malaria prophylaxis for rural areas"],
  TH: ["Consider malaria prophylaxis for rural areas near borders"],
  KH: ["Consider malaria prophylaxis for rural areas"],
  MM: ["Consider malaria prophylaxis for rural areas"],
  ID: ["Consider malaria prophylaxis for Papua region"],
  PG: ["Malaria prophylaxis recommended"],
};
