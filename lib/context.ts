/**
 * Free contextual data for a destination — currency, language, plug type,
 * sunrise/sunset, USD→local conversion. All keyless public APIs:
 *
 *   - REST Countries v3.1 (restcountries.com) — currency/language/plug
 *   - sunrise-sunset.org — daily sun times
 *   - Frankfurter.app — daily ECB exchange rates
 *
 * Each lookup is cached in-memory per process.
 */

const cache = {
  country: new Map<string, CountryInfo | null>(),
  sun: new Map<string, SunTimes | null>(),
  rates: new Map<string, number | null>(), // USD→{currency} rate
};

export type CountryInfo = {
  countryCode: string;
  countryName: string;
  currencyCode: string;
  currencySymbol: string;
  currencyName: string;
  languages: string[];
  callingCode: string;
  /** Plug types in use (e.g. ["A", "B"] for US, ["C", "E"] for FR). */
  plugTypes: string[];
  drivingSide: "left" | "right" | "unknown";
};

export type SunTimes = {
  /** ISO date in YYYY-MM-DD. */
  date: string;
  /** Local sunrise time, e.g. "06:42". */
  sunrise: string;
  /** Local sunset time, e.g. "20:14". */
  sunset: string;
  /** Hours of daylight, rounded to one decimal. */
  daylightHours: number;
};

const FETCH_OPTS = {
  headers: { Accept: "application/json" },
  // Network failures shouldn't break the trip page.
  signal: AbortSignal.timeout(5000),
};

export async function fetchCountryInfo(
  countryCode: string,
): Promise<CountryInfo | null> {
  const key = countryCode.toUpperCase();
  if (cache.country.has(key)) return cache.country.get(key)!;
  try {
    const res = await fetch(
      `https://restcountries.com/v3.1/alpha/${key}?fields=name,cca2,currencies,languages,idd,car`,
      FETCH_OPTS,
    );
    if (!res.ok) {
      cache.country.set(key, null);
      return null;
    }
    const data = (await res.json()) as RestCountryRow;
    const info = parseCountry(data, key);
    cache.country.set(key, info);
    return info;
  } catch {
    cache.country.set(key, null);
    return null;
  }
}

type RestCountryRow = {
  name?: { common?: string };
  cca2?: string;
  currencies?: Record<string, { name?: string; symbol?: string }>;
  languages?: Record<string, string>;
  idd?: { root?: string; suffixes?: string[] };
  car?: { side?: "left" | "right" };
};

function parseCountry(data: RestCountryRow, code: string): CountryInfo | null {
  const currencyCode = Object.keys(data.currencies ?? {})[0] ?? "USD";
  const currency = data.currencies?.[currencyCode];
  const callingCode = (() => {
    const root = data.idd?.root ?? "";
    const suffixes = data.idd?.suffixes ?? [];
    if (!root) return "";
    if (suffixes.length === 1) return root + suffixes[0];
    return root;
  })();
  return {
    countryCode: code,
    countryName: data.name?.common ?? code,
    currencyCode,
    currencySymbol: currency?.symbol ?? currencyCode,
    currencyName: currency?.name ?? currencyCode,
    languages: Object.values(data.languages ?? {}).slice(0, 3),
    callingCode,
    plugTypes: PLUG_TYPES_BY_COUNTRY[code] ?? ["unknown"],
    drivingSide: data.car?.side ?? "unknown",
  };
}

/**
 * IEC plug types in use, by ISO-3166 alpha-2 country code.
 * Source: IEC World Plugs — only the most-common types listed for brevity.
 */
const PLUG_TYPES_BY_COUNTRY: Record<string, string[]> = {
  US: ["A", "B"], CA: ["A", "B"], MX: ["A", "B"], BR: ["N", "C"],
  AR: ["I", "C"], CL: ["L", "C"], PE: ["A", "B", "C"], CO: ["A", "B"],
  GB: ["G"], IE: ["G"], MT: ["G"], CY: ["G"],
  FR: ["C", "E"], BE: ["C", "E"], NL: ["C", "F"], DE: ["C", "F"],
  AT: ["C", "F"], CH: ["J"], LU: ["C", "F"],
  IT: ["L", "F"], ES: ["C", "F"], PT: ["C", "F"], GR: ["C", "F"],
  IS: ["C", "F"], NO: ["C", "F"], SE: ["C", "F"], DK: ["C", "K"], FI: ["C", "F"],
  PL: ["C", "E"], CZ: ["C", "E"], SK: ["C", "E"], HU: ["C", "F"],
  RO: ["C", "F"], BG: ["C", "F"], HR: ["C", "F"], SI: ["C", "F"],
  RS: ["C", "F"], TR: ["C", "F"], RU: ["C", "F"], UA: ["C", "F"],
  IL: ["H", "C"], JO: ["B", "C", "D", "F", "G", "J"], LB: ["C", "D", "G"],
  AE: ["G"], SA: ["G"], QA: ["G"], KW: ["G"], BH: ["G"], OM: ["G"],
  EG: ["C", "F"], MA: ["C", "E"], TN: ["C", "E"], DZ: ["C", "F"],
  ZA: ["M", "N", "C"], NG: ["D", "G"], KE: ["G"], ET: ["C", "F"],
  TZ: ["D", "G"], GH: ["D", "G"], SN: ["C", "D", "E", "K"],
  IN: ["C", "D", "M"], PK: ["C", "D", "M"], BD: ["C", "D", "G", "K"],
  LK: ["D", "G", "M"], NP: ["C", "D", "M"],
  TH: ["A", "B", "C", "F"], VN: ["A", "C", "F"], KH: ["A", "C", "G"],
  LA: ["A", "B", "C", "E", "F"], MM: ["C", "D", "F", "G"],
  MY: ["G"], SG: ["G"], ID: ["C", "F"], PH: ["A", "B", "C"],
  CN: ["A", "C", "I"], HK: ["G"], MO: ["G"], TW: ["A", "B"],
  JP: ["A", "B"], KR: ["C", "F"], MN: ["C", "E"],
  AU: ["I"], NZ: ["I"], FJ: ["I"],
};

export async function fetchSunTimes(
  lat: number,
  lng: number,
  date: string,
): Promise<SunTimes | null> {
  const key = `${lat.toFixed(2)}|${lng.toFixed(2)}|${date}`;
  if (cache.sun.has(key)) return cache.sun.get(key)!;
  try {
    const res = await fetch(
      `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&date=${date}&formatted=0`,
      FETCH_OPTS,
    );
    if (!res.ok) {
      cache.sun.set(key, null);
      return null;
    }
    const json = (await res.json()) as {
      status: string;
      results?: {
        sunrise?: string;
        sunset?: string;
        day_length?: number;
      };
    };
    if (json.status !== "OK" || !json.results?.sunrise || !json.results.sunset) {
      cache.sun.set(key, null);
      return null;
    }
    // API returns ISO UTC; convert to local time at the given lng (rough TZ
    // offset = lng/15 hours) — accurate to ~30 min, fine for "what time is
    // sunset" purposes.
    const tzHours = lng / 15;
    const sunriseLocal = isoToLocal(json.results.sunrise, tzHours);
    const sunsetLocal = isoToLocal(json.results.sunset, tzHours);
    const daylight = (json.results.day_length ?? 0) / 3600;
    const result: SunTimes = {
      date,
      sunrise: sunriseLocal,
      sunset: sunsetLocal,
      daylightHours: Math.round(daylight * 10) / 10,
    };
    cache.sun.set(key, result);
    return result;
  } catch {
    cache.sun.set(key, null);
    return null;
  }
}

function isoToLocal(iso: string, tzOffsetHours: number): string {
  const d = new Date(iso);
  const local = new Date(d.getTime() + tzOffsetHours * 3600 * 1000);
  return `${pad2(local.getUTCHours())}:${pad2(local.getUTCMinutes())}`;
}
function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export async function fetchUsdRate(currencyCode: string): Promise<number | null> {
  const key = currencyCode.toUpperCase();
  if (key === "USD") return 1;
  if (cache.rates.has(key)) return cache.rates.get(key)!;
  try {
    const res = await fetch(
      `https://api.frankfurter.app/latest?from=USD&to=${key}`,
      FETCH_OPTS,
    );
    if (!res.ok) {
      cache.rates.set(key, null);
      return null;
    }
    const json = (await res.json()) as { rates?: Record<string, number> };
    const rate = json.rates?.[key];
    if (typeof rate !== "number") {
      cache.rates.set(key, null);
      return null;
    }
    cache.rates.set(key, rate);
    return rate;
  } catch {
    cache.rates.set(key, null);
    return null;
  }
}
