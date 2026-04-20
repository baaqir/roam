/**
 * Fetch a hero image for a city from Wikipedia's page summary API.
 * Free, no API key needed. Returns the highest-resolution image available.
 */

const cache = new Map<string, string | null>();

export async function fetchCityImage(cityName: string): Promise<string | null> {
  const key = cityName.trim().toLowerCase();
  if (cache.has(key)) return cache.get(key)!;

  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cityName.replace(/ /g, "_"))}`,
      {
        headers: {
          "User-Agent": "Roam/0.1 (personal trip planning tool)",
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(5000),
      },
    );
    if (!res.ok) {
      cache.set(key, null);
      return null;
    }
    const data = (await res.json()) as {
      originalimage?: { source?: string };
      thumbnail?: { source?: string };
    };
    const url = data.originalimage?.source ?? data.thumbnail?.source ?? null;
    cache.set(key, url);
    return url;
  } catch {
    cache.set(key, null);
    return null;
  }
}
