/**
 * Free weather forecast per day via Open-Meteo. No API key needed.
 * Returns daily high/low temps and a WMO weather code mapped to an emoji.
 */

export type DayWeather = {
  date: string;
  tempHigh: number;   // Celsius
  tempLow: number;    // Celsius
  weatherCode: number; // WMO code
  icon: string;        // emoji
};

const cache = new Map<string, DayWeather[]>();

/**
 * Fetch daily weather forecast for a location.
 * @param lat - latitude
 * @param lng - longitude
 * @param startDate - YYYY-MM-DD
 * @param days - number of days to fetch
 */
export async function fetchWeather(
  lat: number,
  lng: number,
  startDate: string,
  days: number,
): Promise<DayWeather[]> {
  const key = `${lat.toFixed(2)}|${lng.toFixed(2)}|${startDate}|${days}`;
  if (cache.has(key)) return cache.get(key)!;

  const endDate = addDays(startDate, days - 1);

  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,weather_code&start_date=${startDate}&end_date=${endDate}&timezone=auto`,
      {
        headers: {
          "User-Agent": "Roam/0.1 (personal trip planning tool)",
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(5000),
      },
    );
    if (!res.ok) {
      cache.set(key, []);
      return [];
    }
    const data = (await res.json()) as {
      daily?: {
        time?: string[];
        temperature_2m_max?: number[];
        temperature_2m_min?: number[];
        weather_code?: number[];
      };
    };

    const times = data.daily?.time ?? [];
    const highs = data.daily?.temperature_2m_max ?? [];
    const lows = data.daily?.temperature_2m_min ?? [];
    const codes = data.daily?.weather_code ?? [];

    const result: DayWeather[] = times.map((date, i) => ({
      date,
      tempHigh: Math.round(highs[i] ?? 0),
      tempLow: Math.round(lows[i] ?? 0),
      weatherCode: codes[i] ?? 0,
      icon: wmoToEmoji(codes[i] ?? 0),
    }));

    cache.set(key, result);
    return result;
  } catch {
    cache.set(key, []);
    return [];
  }
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Map WMO weather codes to emoji. */
function wmoToEmoji(code: number): string {
  if (code === 0) return "\u2600\uFE0F";           // clear sky
  if (code >= 1 && code <= 3) return "\u26C5";     // partly cloudy
  if (code >= 45 && code <= 48) return "\uD83C\uDF2B\uFE0F"; // fog
  if (code >= 51 && code <= 67) return "\uD83C\uDF27\uFE0F"; // rain/drizzle
  if (code >= 71 && code <= 77) return "\u2744\uFE0F";       // snow
  if (code >= 80 && code <= 82) return "\uD83C\uDF26\uFE0F"; // showers
  if (code >= 95 && code <= 99) return "\u26C8\uFE0F";       // thunderstorm
  return "\u26C5"; // default: partly cloudy
}

/**
 * Convert Celsius to Fahrenheit.
 */
export function cToF(c: number): number {
  return Math.round(c * 9 / 5 + 32);
}
