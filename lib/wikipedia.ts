/**
 * Free Wikipedia attraction lookup. No API key needed.
 *
 * Strategy (best signal → noisier fallback):
 *   1. "Category:Tourist_attractions_in_{City}" page list.
 *   2. Wikipedia full-text search for "{city} (museum OR park OR landmark…)".
 *   3. Geosearch within 8km, with aggressive title filters.
 *
 * We score every candidate against an attraction whitelist (museum, park,
 * cathedral, market, etc.) and a noise blacklist (list of, hospital, school,
 * disaster, etc.) and keep the top scorers.
 *
 * Cached in-memory per city for the process lifetime.
 */
import type { Activity, ActivityTag } from "./types";
import { getCostMultiplier } from "./data/cost-index";

type WikipediaPage = {
  title: string;
  extract?: string;
  description?: string;
};

const cache = new Map<string, Activity[]>();

const WP_API = "https://en.wikipedia.org/w/api.php";
const WP_REST = "https://en.wikipedia.org/api/rest_v1";
const USER_AGENT = "Roam/0.1 (personal trip planning tool)";

/** Title patterns we want — having one of these is a +5 score boost. */
const ATTRACTION_KEYWORDS = [
  "museum", "gallery", "exhibition",
  "park", "garden", "reserve", "sanctuary", "forest",
  "beach", "bay", "lighthouse", "harbour", "harbor", "waterfront",
  "cathedral", "basilica", "church", "mosque", "temple", "shrine", "monastery",
  "abbey", "synagogue",
  "castle", "palace", "fortress", "fort", "citadel",
  "tower", "skyscraper", "monument", "statue", "memorial", "obelisk",
  "square", "plaza", "promenade",
  "bridge", "viaduct", "aqueduct",
  "market", "bazaar", "souk",
  "falls", "lake", "river", "canyon", "valley", "mountain", "peak",
  "theatre", "theater", "opera", "concert hall",
  "zoo", "aquarium",
  "ruins", "archaeological",
  "neighborhood", "district", "old town", "historic centre", "historic center",
  "cable car", "funicular", "observatory",
];

/** Title patterns that almost always mean noise. */
const NOISE_PATTERNS = [
  /^list of /i, /^outline of /i, /^index of /i, /^timeline of /i,
  /^history of /i, /^demographics /i, /^politics of /i, /^economy of /i,
  /^geography of /i, /^transport(ation)? in /i, /^education in /i,
  /^architecture of /i, /^culture of /i, /^cuisine of /i, /^religion in /i,
  /^tourism (in|of) /i, /^tourist attractions (in|of) /i,
  /^visitor attractions (in|of) /i,
  /\bhospital\b/i, /\bclinic\b/i, /\bschool\b/i, /\buniversity\b/i,
  /\bcollege\b/i, /\bacademy\b/i,
  /\bairport\b/i, /\btrain station\b/i, /\bmetro station\b/i,
  /\bbombing\b/i, /\bmassacre\b/i, /\bdisaster\b/i, /\bcollapse\b/i,
  /\bcrash\b/i, /\briot\b/i, /\bmurder\b/i, /\bshooting\b/i,
  /\bcensus\b/i, /\belection\b/i, /\battack\b/i,
  /\b(19|20)\d{2}\b/, // years almost always = historical event
  /^category:/i, /^file:/i, /^template:/i, /^talk:/i, /^user:/i,
  /\bministry\b/i, /\bcommissioner\b/i, /\bcouncil\b/i,
  /\bbarracks\b/i, /\bprison\b/i, /\bgovernor\b/i,
  /\bcorrectional\b/i,
];

export async function fetchWikipediaAttractions(
  cityName: string,
  lat: number,
  lng: number,
  countryName?: string,
  countryCode?: string,
): Promise<Activity[]> {
  const cacheKey = `${cityName.toLowerCase()}|${lat.toFixed(2)}|${lng.toFixed(2)}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const cityShort = cityName.split(",")[0].trim();

  // Layer 1: tourist attraction category (try with and without country suffix).
  const fromCategory = await fetchAttractionCategoryMembers(cityShort, countryName);

  // Layer 2: keyword text search disambiguated by country.
  const fromSearch =
    fromCategory.length < 8
      ? await fetchAttractionSearch(cityShort, countryName)
      : [];

  // Layer 3: geosearch (validates the city's actual coordinates so it's
  // self-disambiguating, but the noise rate is high — only used if needed).
  const fromGeo =
    fromCategory.length + fromSearch.length < 8
      ? await fetchGeosearchTitles(lat, lng)
      : [];

  // Combine, dedupe, score, sort.
  const titleSet = new Set<string>();
  const allTitles: string[] = [];
  for (const t of [...fromCategory, ...fromSearch, ...fromGeo]) {
    if (titleSet.has(t)) continue;
    if (isNoise(t)) continue;
    titleSet.add(t);
    allTitles.push(t);
  }

  const scored = allTitles
    .filter((t) => !isCityMainArticle(t, cityShort))
    .map((title) => ({ title, score: scoreTitle(title, cityShort) }))
    .filter((x) => x.score > 0) // require at least one attraction keyword
    .sort((a, b) => b.score - a.score)
    .slice(0, 14);

  if (scored.length === 0) {
    cache.set(cacheKey, []);
    return [];
  }

  // Fetch summaries in parallel.
  const summaries = await Promise.all(
    scored.map((s) => fetchPageSummary(s.title).catch(() => null)),
  );
  const valid = summaries.filter((s): s is WikipediaPage => !!s);

  const costMult = countryCode ? getCostMultiplier(countryCode) : 1.0;

  const activities = valid
    .map((p, i) => pageToActivity(p, i, costMult))
    .filter((a): a is Activity => !!a)
    .slice(0, 12);

  cache.set(cacheKey, activities);
  return activities;
}

async function fetchAttractionCategoryMembers(
  city: string,
  countryName?: string,
): Promise<string[]> {
  const cityWithUnderscores = city.replace(/ /g, "_");
  const cityWithCountry = countryName
    ? `${cityWithUnderscores},_${countryName.replace(/ /g, "_")}`
    : null;
  const candidates = [
    cityWithCountry && `Category:Tourist_attractions_in_${cityWithCountry}`,
    cityWithCountry && `Category:Visitor_attractions_in_${cityWithCountry}`,
    `Category:Tourist_attractions_in_${cityWithUnderscores}`,
    `Category:Visitor_attractions_in_${cityWithUnderscores}`,
    `Category:Landmarks_in_${cityWithUnderscores}`,
  ].filter(Boolean) as string[];
  for (const cat of candidates) {
    const titles = await fetchCategoryMembers(cat);
    if (titles.length >= 4) return titles;
  }
  return [];
}

async function fetchCategoryMembers(category: string): Promise<string[]> {
  const url =
    `${WP_API}?` +
    new URLSearchParams({
      action: "query",
      list: "categorymembers",
      cmtitle: category,
      cmlimit: "20",
      cmtype: "page",
      format: "json",
      origin: "*",
    }).toString();
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as {
      query?: { categorymembers?: { title: string }[] };
    };
    return json.query?.categorymembers?.map((m) => m.title) ?? [];
  } catch {
    return [];
  }
}

async function fetchAttractionSearch(
  city: string,
  countryName?: string,
): Promise<string[]> {
  // Search for pages mentioning the city + any attraction keyword.
  // Quoted city + country ensures we don't match same-named places elsewhere.
  const countryClause = countryName ? ` "${countryName}"` : "";
  const query = `"${city}"${countryClause} (museum OR park OR landmark OR cathedral OR castle OR palace OR market OR beach OR garden OR temple OR tower OR monument OR district)`;
  const url =
    `${WP_API}?` +
    new URLSearchParams({
      action: "query",
      list: "search",
      srsearch: query,
      srlimit: "20",
      srnamespace: "0",
      format: "json",
      origin: "*",
    }).toString();
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as {
      query?: { search?: { title: string }[] };
    };
    return json.query?.search?.map((s) => s.title) ?? [];
  } catch {
    return [];
  }
}

async function fetchGeosearchTitles(lat: number, lng: number): Promise<string[]> {
  const url =
    `${WP_API}?` +
    new URLSearchParams({
      action: "query",
      list: "geosearch",
      gscoord: `${lat}|${lng}`,
      gsradius: "8000",
      gslimit: "30",
      format: "json",
      origin: "*",
    }).toString();
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as {
      query?: { geosearch?: { title: string }[] };
    };
    return json.query?.geosearch?.map((g) => g.title) ?? [];
  } catch {
    return [];
  }
}

async function fetchPageSummary(title: string): Promise<WikipediaPage | null> {
  const url = `${WP_REST}/page/summary/${encodeURIComponent(title.replace(/ /g, "_"))}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as WikipediaPage & {
      type?: string;
    };
    if (json.type === "disambiguation") return null;
    return { title, extract: json.extract, description: json.description };
  } catch {
    return null;
  }
}

function pageToActivity(page: WikipediaPage, index: number, countryMultiplier: number = 1.0): Activity | null {
  const name = page.title.trim();
  if (isNoise(name)) return null;
  const description = (page.extract ?? page.description ?? "").trim();
  const shortDesc =
    description.length > 220 ? description.slice(0, 217) + "…" : description;

  const lowered = `${name} ${description}`.toLowerCase();
  const tags = inferTags(lowered);
  const baseCost = inferBaseCost(lowered, tags);
  const cost = Math.round(baseCost * countryMultiplier);
  const durationHours = inferDuration(lowered, tags);

  return {
    id: slug(name),
    name,
    cost,
    durationHours,
    tags,
    description: shortDesc || `Popular point of interest from Wikipedia.`,
    recommended: index < 5,
  };
}

function scoreTitle(title: string, city: string): number {
  const lowered = title.toLowerCase();
  let score = 0;
  for (const kw of ATTRACTION_KEYWORDS) {
    if (lowered.includes(kw)) {
      score += 5;
      break; // only count one keyword match (avoid stacking)
    }
  }
  // Mild boost when the title doesn't include the city name (it's likely
  // a specific attraction, not a generic city-level page).
  const cityLower = city.toLowerCase();
  if (!lowered.includes(cityLower)) score += 1;
  // Penalty for very long titles (often complex disambiguation).
  if (title.length > 50) score -= 2;
  return score;
}

function isNoise(title: string): boolean {
  return NOISE_PATTERNS.some((p) => p.test(title));
}

/** True if the title is the city's own main article (not an attraction). */
function isCityMainArticle(title: string, city: string): boolean {
  const t = title.toLowerCase().trim();
  const c = city.toLowerCase().trim();
  if (t === c) return true;
  // "Lagos (city)", "Lagos, Nigeria", "Lagos State", "Lagos Island"
  if (
    t === `${c} (city)` ||
    t === `${c} state` ||
    t === `${c} island` ||
    t === `${c} province` ||
    t === `${c} prefecture` ||
    t.startsWith(`${c}, `)
  )
    return true;
  return false;
}

function inferTags(text: string): ActivityTag[] {
  const tags = new Set<ActivityTag>();
  if (/\bmuseum|gallery|exhibit|library|theatre|theater\b/.test(text))
    tags.add("culture");
  if (/\bcathedral|church|mosque|temple|shrine|basilica|monastery|abbey\b/.test(text))
    tags.add("culture");
  if (/\bcastle|palace|fortress|fort\b/.test(text)) {
    tags.add("iconic");
    tags.add("culture");
  }
  if (/\bpark|garden|forest|reserve|nature\b/.test(text)) {
    tags.add("outdoor");
    tags.add("free");
  }
  if (/\bbeach|coast|cliff|harbour|harbor|bay|lake|river\b/.test(text)) {
    tags.add("outdoor");
  }
  if (/\bmountain|peak|hike|trail|valley|canyon|waterfall\b/.test(text)) {
    tags.add("outdoor");
    tags.add("adventure");
  }
  if (/\btower|skyscraper|bridge|monument|statue|landmark|square|plaza\b/.test(text))
    tags.add("iconic");
  if (/\bmarket|food|restaurant|cuisine|street food\b/.test(text))
    tags.add("foodie");
  if (/\bnightlife|bar|club|district\b/.test(text)) tags.add("nightlife");
  if (/\bzoo|aquarium|amusement|theme park|family\b/.test(text)) tags.add("family");
  if (tags.size === 0) tags.add("culture");
  return Array.from(tags);
}

function inferBaseCost(text: string, tags: ActivityTag[]): number {
  if (tags.includes("free")) return 0;
  if (/\bbeach|park|garden|square|plaza|bridge|waterfront|promenade\b/.test(text))
    return 0;
  if (/\bmuseum|gallery|exhibition\b/.test(text)) return 22;
  if (/\bcathedral|church|temple|basilica\b/.test(text)) return 8;
  if (/\bcastle|palace|fortress\b/.test(text)) return 25;
  if (/\btower|observation\b/.test(text)) return 30;
  if (/\bzoo|aquarium\b/.test(text)) return 35;
  if (/\btheme park|amusement\b/.test(text)) return 80;
  if (/\bmarket|food tour\b/.test(text)) return 35;
  return 18;
}

function inferDuration(text: string, tags: ActivityTag[]): number {
  if (/\bmuseum|gallery\b/.test(text)) return 3;
  if (/\bpark|garden|nature reserve\b/.test(text)) return 2;
  if (/\btheme park|amusement\b/.test(text)) return 6;
  if (/\bday trip|excursion\b/.test(text)) return 6;
  if (/\bmarket|food\b/.test(text)) return 2;
  if (tags.includes("outdoor")) return 2.5;
  return 1.5;
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}
