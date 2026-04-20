/**
 * Generates context-aware packing suggestions based on trip plan details:
 *   - Season/weather from travel dates
 *   - Activity types (outdoor, beach, nightlife, etc.)
 *   - Destination characteristics (tropical, European, etc.)
 *
 * Pure function — no side effects, no API calls.
 */
import type { TripPlan, ActivityTag } from "./types";

export type PackingCategory = "clothing" | "gear" | "toiletries" | "documents";

export type PackingItem = {
  item: string;
  reason: string;
  category: PackingCategory;
};

/**
 * Determine the approximate season based on travel date and destination hemisphere.
 * Uses a simple latitude heuristic: southern hemisphere flips seasons.
 */
function getSeason(startDate: string, region?: string): "summer" | "winter" | "shoulder" {
  const month = new Date(startDate + "T00:00:00Z").getUTCMonth() + 1; // 1-12

  // Southern hemisphere destinations (rough heuristic by region)
  const isSouthern = region === "transpacific"; // very rough — Bali, Sydney, etc.

  let effectiveMonth = month;
  if (isSouthern) {
    effectiveMonth = ((month + 5) % 12) + 1; // flip ~6 months
  }

  if (effectiveMonth >= 6 && effectiveMonth <= 8) return "summer";
  if (effectiveMonth >= 12 || effectiveMonth <= 2) return "winter";
  return "shoulder";
}

/**
 * Collect all unique activity tags from the trip plan.
 */
function collectTags(plan: TripPlan): Set<ActivityTag> {
  const tags = new Set<ActivityTag>();
  for (const day of plan.days) {
    for (const item of day.items) {
      if (item.type === "activity" && item.activityId) {
        const activity = plan.destination.activities.find((a) => a.id === item.activityId);
        if (activity) {
          for (const t of activity.tags) tags.add(t);
        }
      }
    }
  }
  return tags;
}

/**
 * Check if destination is likely tropical based on region and name keywords.
 */
function isTropical(plan: TripPlan): boolean {
  const name = plan.destination.name.toLowerCase();
  const tropicalKeywords = [
    "bali", "thailand", "bangkok", "cancun", "cancún", "miami",
    "hawaii", "caribbean", "dominican", "jamaica", "phuket",
    "costa rica", "vietnam", "indonesia", "philippines",
  ];
  return tropicalKeywords.some((kw) => name.includes(kw));
}

/**
 * Check if destination has beach activities.
 */
function hasBeach(plan: TripPlan): boolean {
  const name = plan.destination.name.toLowerCase();
  const beachKeywords = ["beach", "coast", "island", "shore", "surf"];
  const activities = plan.destination.activities.map((a) => a.name.toLowerCase() + " " + a.description.toLowerCase());
  return (
    beachKeywords.some((kw) => name.includes(kw)) ||
    activities.some((a) => beachKeywords.some((kw) => a.includes(kw)))
  );
}

/**
 * Generate a packing list for the trip.
 */
export function generatePackingList(plan: TripPlan): PackingItem[] {
  const items: PackingItem[] = [];
  const season = getSeason(
    plan.input.startDate || plan.days[0]?.date || new Date().toISOString().slice(0, 10),
    plan.destination.region,
  );
  const tags = collectTags(plan);
  const tropical = isTropical(plan);
  const beach = hasBeach(plan);
  const nights = plan.input.nights;

  // ─── Documents (always) ───────────────────────────────────────────────
  items.push({
    item: "Passport (+ copy stored separately)",
    reason: "Required for international travel",
    category: "documents",
  });
  items.push({
    item: "Travel insurance printout or app",
    reason: "Emergency coverage and claim reference",
    category: "documents",
  });
  items.push({
    item: "Flight confirmation / boarding passes",
    reason: "Required for check-in",
    category: "documents",
  });
  items.push({
    item: "Hotel/accommodation confirmation",
    reason: "Check-in reference",
    category: "documents",
  });
  items.push({
    item: "Credit/debit cards + some local cash",
    reason: "Many places prefer cash; cards for backup",
    category: "documents",
  });

  // ─── Clothing: base set ───────────────────────────────────────────────
  if (season === "summer" || tropical) {
    items.push({
      item: "Light breathable clothing",
      reason: "Warm weather expected",
      category: "clothing",
    });
    items.push({
      item: "Shorts and t-shirts",
      reason: `${nights} nights in warm weather`,
      category: "clothing",
    });
    items.push({
      item: "Light rain jacket or packable umbrella",
      reason: "Afternoon showers are common in summer",
      category: "clothing",
    });
    items.push({
      item: "Wide-brim hat or cap",
      reason: "Sun protection for outdoor activities",
      category: "clothing",
    });
  } else if (season === "winter") {
    items.push({
      item: "Warm layers (fleece, sweater)",
      reason: "Cold weather expected",
      category: "clothing",
    });
    items.push({
      item: "Insulated jacket or winter coat",
      reason: "Necessary for outdoor sightseeing in winter",
      category: "clothing",
    });
    items.push({
      item: "Scarf, gloves, and warm hat",
      reason: "Cold extremities make sightseeing miserable",
      category: "clothing",
    });
    items.push({
      item: "Rain jacket or umbrella",
      reason: "Winter rain/sleet is common",
      category: "clothing",
    });
  } else {
    // Shoulder season
    items.push({
      item: "Layers (t-shirts + light jacket)",
      reason: "Variable shoulder-season weather",
      category: "clothing",
    });
    items.push({
      item: "Light sweater or cardigan",
      reason: "Cool mornings and evenings",
      category: "clothing",
    });
    items.push({
      item: "Compact umbrella",
      reason: "Spring/fall rain is common",
      category: "clothing",
    });
  }

  // ─── Clothing: activity-specific ──────────────────────────────────────
  if (tags.has("outdoor") || tags.has("adventure")) {
    items.push({
      item: "Comfortable walking shoes (broken in!)",
      reason: "Outdoor activities and hiking in the itinerary",
      category: "clothing",
    });
  } else {
    items.push({
      item: "Comfortable walking shoes",
      reason: "Expect 10,000+ steps/day sightseeing",
      category: "clothing",
    });
  }

  if (beach) {
    items.push({
      item: "Swimsuit",
      reason: "Beach/water activities in the itinerary",
      category: "clothing",
    });
    items.push({
      item: "Flip-flops or sandals",
      reason: "Beach and casual walking",
      category: "clothing",
    });
    items.push({
      item: "Beach towel (or quick-dry travel towel)",
      reason: "Some beaches don't provide towels",
      category: "clothing",
    });
  }

  if (tags.has("nightlife")) {
    items.push({
      item: "One nice outfit for going out",
      reason: "Nightlife activities in the itinerary",
      category: "clothing",
    });
  }

  if (tags.has("culture")) {
    items.push({
      item: "Modest clothing (covered shoulders/knees)",
      reason: "Required for visiting temples, churches, or mosques",
      category: "clothing",
    });
  }

  // ─── Gear ─────────────────────────────────────────────────────────────
  items.push({
    item: "Phone charger + portable battery pack",
    reason: "Maps, photos, and translation drain battery fast",
    category: "gear",
  });
  items.push({
    item: "Universal power adapter",
    reason: "Different outlet types abroad",
    category: "gear",
  });

  if (tags.has("outdoor") || tags.has("adventure")) {
    items.push({
      item: "Reusable water bottle",
      reason: "Stay hydrated on outdoor activities",
      category: "gear",
    });
    items.push({
      item: "Small daypack/backpack",
      reason: "Carry water, snacks, and layers on day trips",
      category: "gear",
    });
  }

  if (tags.has("iconic") || tags.has("outdoor")) {
    items.push({
      item: "Camera or phone with good camera",
      reason: "Iconic photo opportunities in the itinerary",
      category: "gear",
    });
  }

  // ─── Toiletries ───────────────────────────────────────────────────────
  items.push({
    item: "Sunscreen (SPF 30+)",
    reason: season === "winter" ? "UV exposure even in winter" : "Sun protection for outdoor time",
    category: "toiletries",
  });
  items.push({
    item: "Sunglasses",
    reason: "Eye protection and comfort",
    category: "toiletries",
  });
  items.push({
    item: "Personal medications + basic first aid",
    reason: "Foreign pharmacies may not carry your prescriptions",
    category: "toiletries",
  });
  items.push({
    item: "Hand sanitizer and wet wipes",
    reason: "Street food and public transit hygiene",
    category: "toiletries",
  });

  if (tropical) {
    items.push({
      item: "Insect repellent (DEET or picaridin)",
      reason: "Mosquitoes in tropical destinations",
      category: "toiletries",
    });
    items.push({
      item: "After-sun or aloe vera gel",
      reason: "Tropical sun is intense — be prepared",
      category: "toiletries",
    });
  }

  return items;
}

/**
 * Group packing items by category for display.
 */
export function groupByCategory(items: PackingItem[]): Record<PackingCategory, PackingItem[]> {
  const grouped: Record<PackingCategory, PackingItem[]> = {
    documents: [],
    clothing: [],
    gear: [],
    toiletries: [],
  };
  for (const item of items) {
    grouped[item.category].push(item);
  }
  return grouped;
}

export const CATEGORY_LABELS: Record<PackingCategory, { label: string; emoji: string }> = {
  documents: { label: "Documents", emoji: "\uD83D\uDCC4" },
  clothing: { label: "Clothing", emoji: "\uD83D\uDC55" },
  gear: { label: "Gear", emoji: "\uD83C\uDF92" },
  toiletries: { label: "Toiletries", emoji: "\uD83E\uDDF4" },
};
