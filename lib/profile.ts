/**
 * Traveler profile — persisted to localStorage.
 *
 * The profile drives personalization across the trip planner:
 *   - Activity selection weights (interests)
 *   - Pace and daily hour caps
 *   - Meal descriptions (dietary, foodie, budget)
 *   - Kid-friendly filtering
 *
 * Compact URL encoding format for passing through query params:
 *   interests:pace:flags
 *   e.g. "foodie,adventure:moderate:kids,halal,strict"
 */

export type TravelerProfile = {
  /** Display name (optional). */
  name?: string;
  /** Travel style preferences -- ranked by importance (first = strongest). */
  interests: TravelInterest[];
  /** Pace preference. */
  pace: "relaxed" | "moderate" | "packed";
  /** Dietary preferences (affects meal recommendations). */
  dietary?: ("vegetarian" | "vegan" | "halal" | "kosher" | "gluten-free")[];
  /** Traveling with kids? */
  withKids?: boolean;
  /** Budget consciousness -- affects which activities are prioritized. */
  budgetSensitivity: "flexible" | "moderate" | "strict";
};

export type TravelInterest =
  | "foodie"       // prioritize food tours, markets, cooking classes, restaurant recs
  | "adventure"    // hiking, kayaking, diving, extreme sports
  | "culture"      // museums, galleries, historic sites, architecture
  | "nightlife"    // bars, clubs, live music, evening scenes
  | "relaxation"   // beaches, spas, parks, slow mornings
  | "photography"  // viewpoints, golden hour, iconic shots
  | "family"       // kid-friendly activities, parks, zoos, aquariums
  | "shopping"     // markets, boutiques, outlets
  | "nature"       // national parks, gardens, wildlife
  ;

const STORAGE_KEY = "roam.profile";

export function getProfile(): TravelerProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as TravelerProfile;
  } catch {
    return null;
  }
}

export function saveProfile(profile: TravelerProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function hasProfile(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) !== null;
}

// ─── Compact URL encoding ──────────────────────────────────────────────
// Format: interests:pace:flags
// interests = comma-separated TravelInterest values
// pace = relaxed | moderate | packed
// flags = comma-separated: kids, dietary values, budget sensitivity
// e.g. "foodie,adventure:moderate:kids,halal,strict"

const VALID_INTERESTS = new Set<TravelInterest>([
  "foodie", "adventure", "culture", "nightlife", "relaxation",
  "photography", "family", "shopping", "nature",
]);

const VALID_PACE = new Set(["relaxed", "moderate", "packed"]);

const DIETARY_VALUES = new Set([
  "vegetarian", "vegan", "halal", "kosher", "gluten-free",
]);

const BUDGET_VALUES = new Set(["flexible", "moderate", "strict"]);

export function encodeProfileForURL(profile: TravelerProfile): string {
  const parts: string[] = [];
  // interests
  parts.push(profile.interests.join(","));
  // pace
  parts.push(profile.pace);
  // flags
  const flags: string[] = [];
  if (profile.withKids) flags.push("kids");
  if (profile.dietary) {
    for (const d of profile.dietary) flags.push(d);
  }
  if (profile.budgetSensitivity !== "moderate") {
    flags.push(profile.budgetSensitivity);
  }
  parts.push(flags.join(","));
  return parts.join(":");
}

export function decodeProfileFromURL(raw: string | undefined): TravelerProfile | undefined {
  if (!raw) return undefined;
  try {
    const [interestsRaw, paceRaw, flagsRaw] = raw.split(":");
    if (!interestsRaw || !paceRaw) return undefined;

    const interests = interestsRaw
      .split(",")
      .filter((i) => VALID_INTERESTS.has(i as TravelInterest)) as TravelInterest[];
    if (interests.length === 0) return undefined;

    const pace = VALID_PACE.has(paceRaw)
      ? (paceRaw as TravelerProfile["pace"])
      : "moderate";

    let withKids = false;
    const dietary: TravelerProfile["dietary"] = [];
    let budgetSensitivity: TravelerProfile["budgetSensitivity"] = "moderate";

    if (flagsRaw) {
      for (const flag of flagsRaw.split(",")) {
        if (flag === "kids") withKids = true;
        else if (DIETARY_VALUES.has(flag)) dietary.push(flag as NonNullable<TravelerProfile["dietary"]>[number]);
        else if (BUDGET_VALUES.has(flag)) budgetSensitivity = flag as TravelerProfile["budgetSensitivity"];
      }
    }

    return {
      interests,
      pace,
      withKids: withKids || undefined,
      dietary: dietary.length > 0 ? dietary : undefined,
      budgetSensitivity,
    };
  } catch {
    return undefined;
  }
}

// ─── Interest metadata (used by ProfileSetup) ─────────────────────────

export const INTEREST_META: Record<
  TravelInterest,
  { emoji: string; label: string; description: string }
> = {
  foodie: {
    emoji: "\uD83C\uDF74",
    label: "Foodie",
    description: "Food tours, markets, cooking classes",
  },
  adventure: {
    emoji: "\u26F0\uFE0F",
    label: "Adventure",
    description: "Hiking, kayaking, extreme sports",
  },
  culture: {
    emoji: "\uD83C\uDFDB\uFE0F",
    label: "Culture",
    description: "Museums, galleries, historic sites",
  },
  nightlife: {
    emoji: "\uD83C\uDF1F",
    label: "Nightlife",
    description: "Bars, clubs, live music, evening scenes",
  },
  relaxation: {
    emoji: "\uD83C\uDFD6\uFE0F",
    label: "Relaxation",
    description: "Beaches, spas, parks, slow mornings",
  },
  photography: {
    emoji: "\uD83D\uDCF7",
    label: "Photography",
    description: "Viewpoints, golden hour, iconic shots",
  },
  family: {
    emoji: "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC66",
    label: "Family",
    description: "Kid-friendly activities, parks, zoos",
  },
  shopping: {
    emoji: "\uD83D\uDECD\uFE0F",
    label: "Shopping",
    description: "Markets, boutiques, outlets",
  },
  nature: {
    emoji: "\uD83C\uDF3F",
    label: "Nature",
    description: "National parks, gardens, wildlife",
  },
};

/** Top-interest emoji for the nav badge. */
export function topInterestEmoji(profile: TravelerProfile): string {
  if (profile.interests.length === 0) return "\u2728";
  return INTEREST_META[profile.interests[0]]?.emoji ?? "\u2728";
}

/** Human-readable summary like "Foodie + Adventure". */
export function profileSummary(profile: TravelerProfile): string {
  return profile.interests
    .slice(0, 3)
    .map((i) => INTEREST_META[i]?.label ?? i)
    .join(" + ");
}
