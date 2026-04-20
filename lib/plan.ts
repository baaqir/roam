/**
 * Auto-generates a day-by-day itinerary from a destination's activity
 * catalog + the user's style + trip duration.
 *
 * This is the heart of v2 — instead of making the user assemble their
 * own itinerary, we build a smart, balanced plan automatically:
 *
 *   Day 1 (Arrival): light — settle in, one easy activity, dinner
 *   Middle days: 2-3 activities, balanced by type, with meals
 *   Last day (Departure): morning activity, checkout, head to airport
 *
 * Activities are selected by: recommended first, then tag variety,
 * capped at ~8h/day. Meals are auto-inserted at appropriate times.
 *
 * v2.1 enhancements:
 *   - Neighborhood-aware meal recommendations
 *   - Time-of-day activity optimization (outdoor → morning, culture → afternoon, nightlife → evening)
 *   - Airport transfer details on Day 1 and last day
 */
import type {
  Activity,
  DayItem,
  DayPlan,
  Destination,
  Neighborhood,
  Style,
  STYLE_CONFIG as StyleConfigType,
} from "./types";
import { STYLE_CONFIG } from "./types";
import type { TravelerProfile } from "./profile";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DEFAULT_MAX_ACTIVITY_HOURS = 8;

/** Pace-adjusted maximum activity hours per day. */
function maxActivityHoursForProfile(profile?: TravelerProfile): number {
  if (!profile) return DEFAULT_MAX_ACTIVITY_HOURS;
  switch (profile.pace) {
    case "relaxed": return 5;
    case "packed": return 11;
    default: return DEFAULT_MAX_ACTIVITY_HOURS;
  }
}

// ─── Activity-to-neighborhood mapping ───────────────────────────────────
// Maps known activity keywords/descriptions to neighborhood names for the
// curated and bundled cities that have neighborhood data.

const ACTIVITY_NEIGHBORHOOD_HINTS: Record<string, string[]> = {
  // Barcelona
  "sagrada-familia": ["Eixample"],
  "park-guell": ["Gràcia"],
  "casa-batllo": ["Eixample"],
  "gothic-quarter": ["Gothic Quarter", "El Born"],
  "boqueria": ["Gothic Quarter", "Raval"],
  "barceloneta": ["Barceloneta"],
  "flamenco": ["Gothic Quarter", "El Born"],
  "montserrat": [],
  // Paris
  "eiffel-tower": ["Champs-Élysées"],
  "louvre": ["Le Marais", "Latin Quarter"],
  "musee-orsay": ["Saint-Germain"],
  "seine-walk": ["Latin Quarter"],
  "montmartre": ["Montmartre"],
  "marais-food": ["Le Marais"],
  "versailles": [],
  "wine-bar-evening": ["Saint-Germain"],
  // Tokyo
  "shibuya-crossing": ["Shibuya"],
  "senso-ji": ["Asakusa"],
  "tsukiji": ["Ginza"],
  "teamlab": ["Shibuya"],
  "shinjuku-night": ["Shinjuku"],
  "meiji-shrine": ["Harajuku"],
  "tokyo-tower": ["Ginza"],
  "day-nikko": [],
  // Rome
  "colosseum": ["Centro Storico", "Monti"],
  "vatican": ["Prati"],
  "pantheon": ["Centro Storico"],
  "trastevere-dinner": ["Trastevere"],
  "trevi-spanish": ["Centro Storico"],
  "borghese-gallery": ["Centro Storico"],
  "appia-antica": [],
  "food-tour": ["Testaccio"],
  // London
  "british-museum": ["Soho", "Covent Garden"],
  "tower-of-london": ["South Bank"],
  "borough-market": ["South Bank"],
  "westminster-walk": ["South Bank"],
  "tate-modern": ["South Bank"],
  "west-end-show": ["Soho", "Covent Garden"],
  "pub-evening": ["Shoreditch", "Soho"],
  "hampstead-heath": [],
  // San Diego
  "balboa-park": ["North Park"],
  "san-diego-zoo": ["North Park"],
  "uss-midway": ["Gaslamp Quarter"],
  "la-jolla-cove-kayak": ["La Jolla"],
  "sunset-cliffs": ["Pacific Beach"],
  "coronado-ferry-bike": ["Coronado"],
  "little-italy-food-tour": ["Little Italy"],
  "padres-game": ["Gaslamp Quarter"],
  "gaslamp-nightlife": ["Gaslamp Quarter"],
  "torrey-pines-hike": ["La Jolla"],
  "old-town-tequila": ["Old Town"],
  // LA
  "griffith-observatory": ["Hollywood"],
  "universal-studios": ["Hollywood"],
  "venice-walk": ["Venice Beach"],
  "lacma": ["Downtown (DTLA)"],
  "santa-monica-pier": ["Santa Monica"],
  "getty-center": ["West Hollywood"],
  "kogi-truck-tour": ["Koreatown"],
  "broad-walt-disney": ["Downtown (DTLA)"],
  "runyon-canyon": ["Hollywood"],
  // Las Vegas
  "strip-walk": ["The Strip"],
  "cirque-show": ["The Strip"],
  "hoover-dam": [],
  "red-rock": ["Spring Mountains"],
  "fremont-east": ["Downtown / Fremont"],
  "high-roller": ["The Strip"],
  "buffet": ["The Strip"],
  "valley-of-fire": [],
  "sphere-show": ["The Strip"],
};

/**
 * Given day activities and destination neighborhoods, find the best
 * neighborhood names relevant to the day's location.
 */
function inferNeighborhoods(
  activities: Activity[],
  destination: Destination,
): string[] {
  if (!destination.neighborhoods || destination.neighborhoods.length === 0) {
    return [];
  }

  const hintNames = new Set<string>();
  for (const a of activities) {
    const hints = ACTIVITY_NEIGHBORHOOD_HINTS[a.id];
    if (hints) {
      for (const h of hints) hintNames.add(h);
    }
  }

  // Filter to only neighborhoods this destination actually has
  const validNames = destination.neighborhoods.map((n) => n.name);
  const matched = [...hintNames].filter((h) => validNames.includes(h));

  return matched.length > 0 ? matched : [];
}

/**
 * Pick a neighborhood object for a meal, preferring ones relevant to the
 * day's activities. Varies selection by time of day to avoid repeating.
 */
function pickMealNeighborhood(
  dayNeighborhoods: string[],
  destination: Destination,
  offset: number,
): Neighborhood | null {
  if (!destination.neighborhoods || destination.neighborhoods.length === 0) {
    return null;
  }

  // If we have day-specific neighborhoods, cycle through them
  if (dayNeighborhoods.length > 0) {
    const name = dayNeighborhoods[offset % dayNeighborhoods.length];
    return destination.neighborhoods.find((n) => n.name === name) ?? null;
  }

  // Otherwise pick from all neighborhoods with a meal tip
  const withTips = destination.neighborhoods.filter((n) => n.mealTip);
  if (withTips.length > 0) {
    return withTips[offset % withTips.length];
  }

  return null;
}

// ─── Time-of-day optimization ───────────────────────────────────────────

function timeScore(a: Activity): number {
  if (a.tags.includes("outdoor") || a.tags.includes("adventure")) return 0; // morning
  if (a.tags.includes("culture")) return 1; // midday
  if (a.tags.includes("nightlife") || a.tags.includes("foodie")) return 2; // evening
  return 1; // default to midday
}

function sortByTimePreference(activities: Activity[]): Activity[] {
  return [...activities].sort((a, b) => timeScore(a) - timeScore(b));
}

// ─── Airport transfer helpers ───────────────────────────────────────────

function getAirportTransferCost(
  destination: Destination,
  style: Style,
): { cost: number; description: string } {
  const transfer = destination.airportTransfer;
  const isTransit = STYLE_CONFIG[style].transportMode === "publicTransit";
  const cityName = destination.name.split(",")[0];

  if (transfer) {
    if (isTransit) {
      const avg = Math.round((transfer.transit[0] + transfer.transit[1]) / 2);
      return {
        cost: avg,
        description: `Airport → ${cityName} · ~$${transfer.transit[0]}-${transfer.transit[1]} by public transit`,
      };
    }
    const avg = Math.round((transfer.taxi[0] + transfer.taxi[1]) / 2);
    return {
      cost: avg,
      description: `Airport → ${cityName} · ~$${transfer.taxi[0]}-${transfer.taxi[1]} by taxi/rideshare`,
    };
  }

  // Fallback: generic estimates for destinations without specific data
  if (isTransit) {
    return {
      cost: 10,
      description: `Airport → ${cityName} · ~$5-15 by public transit`,
    };
  }
  return {
    cost: 40,
    description: `Airport → ${cityName} · ~$30-50 by taxi/rideshare`,
  };
}

// ─── Main entry point ────────────────────────────────────────────────────

export function buildItinerary(
  destination: Destination,
  startDate: string,
  nights: number,
  travelers: number,
  style: Style,
  profile?: TravelerProfile,
): DayPlan[] {
  const config = STYLE_CONFIG[style];
  const totalDays = nights + 1; // includes arrival + departure
  const activities = selectActivities(destination.activities, nights, style, profile);

  const maxHours = maxActivityHoursForProfile(profile);

  // Distribute activities across days.
  const dayActivities = distributeActivities(activities, totalDays, maxHours);

  // Build each day.
  return Array.from({ length: totalDays }, (_, i) => {
    const date = addDays(startDate, i);
    const isArrival = i === 0;
    const isDeparture = i === totalDays - 1;
    const label: DayPlan["label"] = isArrival
      ? "Arrival"
      : isDeparture
        ? "Departure"
        : "Full Day";
    const items = buildDayItems(
      dayActivities[i],
      destination,
      config,
      isArrival,
      isDeparture,
      style,
      profile,
    );
    const dailyCost = items.reduce(
      (s, item) => s + item.costPerPerson * travelers,
      0,
    );
    return {
      dayNumber: i + 1,
      date,
      dayOfWeek: dayOfWeek(date),
      label,
      items,
      dailyCost: Math.round(dailyCost),
    };
  });
}

// ─── Profile-based activity scoring ─────────────────────────────────────

function activityProfileScore(a: Activity, profile?: TravelerProfile): number {
  if (!profile) return 0;
  let score = 0;

  for (let i = 0; i < profile.interests.length; i++) {
    const interest = profile.interests[i];
    const weight = profile.interests.length - i; // first interest = highest weight

    if (interest === "foodie" && a.tags.includes("foodie")) score += weight * 3;
    if (interest === "adventure" && (a.tags.includes("adventure") || a.tags.includes("outdoor"))) score += weight * 3;
    if (interest === "culture" && a.tags.includes("culture")) score += weight * 3;
    if (interest === "nightlife" && a.tags.includes("nightlife")) score += weight * 3;
    if (interest === "relaxation" && (a.tags.includes("free") || a.tags.includes("outdoor"))) score += weight * 2;
    if (interest === "photography" && (a.tags.includes("iconic") || a.tags.includes("outdoor"))) score += weight * 2;
    if (interest === "family" && a.tags.includes("family")) score += weight * 3;
    if (interest === "nature" && a.tags.includes("outdoor")) score += weight * 3;
    if (interest === "shopping" && a.tags.includes("foodie")) score += weight * 1; // markets overlap
  }

  // Negative score for mismatches
  if (profile.withKids && a.tags.includes("nightlife")) score -= 5;
  if (profile.pace === "relaxed" && a.durationHours > 4) score -= 2;
  if (profile.budgetSensitivity === "strict" && a.cost > 50) score -= 3;

  return score;
}

/**
 * Select the best activities for the trip. Profile scores first,
 * then recommended, then tag variety. Cap total based on trip length + pace.
 */
function selectActivities(
  all: Activity[],
  nights: number,
  style: Style,
  profile?: TravelerProfile,
): Activity[] {
  // How many activities we can fit, adjusted by pace.
  const fullDays = Math.max(1, nights - 1);
  let activitiesPerDay = 2.5; // default moderate
  if (profile) {
    switch (profile.pace) {
      case "relaxed": activitiesPerDay = 1.5; break;
      case "packed": activitiesPerDay = 3.5; break;
    }
  }
  const targetCount = Math.min(
    all.length,
    Math.round(fullDays * activitiesPerDay) + 2, // +2 for light arrival/departure activities
  );

  // Score each activity based on profile match, then sort.
  const scored = all.map((a) => ({
    activity: a,
    profileScore: activityProfileScore(a, profile),
  }));

  scored.sort((a, b) => {
    // Profile score first (descending)
    if (a.profileScore !== b.profileScore) return b.profileScore - a.profileScore;
    // Then recommended
    if (a.activity.recommended && !b.activity.recommended) return -1;
    if (!a.activity.recommended && b.activity.recommended) return 1;
    // Budget: prefer cheaper; luxury: prefer pricier (more premium experiences).
    if (style === "budget") return a.activity.cost - b.activity.cost;
    if (style === "luxury") return b.activity.cost - a.activity.cost;
    return 0;
  });

  // Pick ensuring tag variety -- don't stack 5 museums.
  const picked: Activity[] = [];
  const tagCounts: Record<string, number> = {};
  const TAG_CAP = 3; // max activities per tag before deprioritizing

  for (const { activity: a } of scored) {
    if (picked.length >= targetCount) break;
    const dominant = a.tags[0];
    if (dominant && (tagCounts[dominant] ?? 0) >= TAG_CAP) continue;
    picked.push(a);
    for (const t of a.tags) tagCounts[t] = (tagCounts[t] ?? 0) + 1;
  }

  // If we didn't fill the target (due to tag limits), add remaining.
  if (picked.length < targetCount) {
    for (const { activity: a } of scored) {
      if (picked.length >= targetCount) break;
      if (!picked.includes(a)) picked.push(a);
    }
  }

  return picked;
}

/**
 * Distribute selected activities across days.
 * - Day 0 (arrival): 1 light/free activity
 * - Last day (departure): 1 short morning activity
 * - Middle days: 2-3 activities, respecting hour cap
 */
function distributeActivities(
  activities: Activity[],
  totalDays: number,
  maxHoursPerDay: number = DEFAULT_MAX_ACTIVITY_HOURS,
): Activity[][] {
  const buckets: Activity[][] = Array.from({ length: totalDays }, () => []);
  const remaining = [...activities];

  // Sort by duration descending so we fit big items first.
  remaining.sort((a, b) => b.durationHours - a.durationHours);

  // Arrival day: 1 short/free activity.
  const arrivalPick = remaining.find(
    (a) => a.durationHours <= 2 || a.cost === 0,
  );
  if (arrivalPick) {
    buckets[0].push(arrivalPick);
    remaining.splice(remaining.indexOf(arrivalPick), 1);
  }

  // Departure day: 1 short morning activity.
  if (totalDays > 1) {
    const depPick = remaining.find((a) => a.durationHours <= 2);
    if (depPick) {
      buckets[totalDays - 1].push(depPick);
      remaining.splice(remaining.indexOf(depPick), 1);
    }
  }

  // Fill middle days round-robin, respecting the hour cap.
  const middleStart = 1;
  const middleEnd = Math.max(middleStart, totalDays - 1);
  let dayIdx = middleStart;
  const dayHours = new Array(totalDays).fill(0);

  // Count hours already assigned.
  for (let d = 0; d < totalDays; d++) {
    dayHours[d] = buckets[d].reduce((s, a) => s + a.durationHours, 0);
  }

  for (const a of remaining) {
    // Find the middle day with the most room.
    let bestDay = dayIdx;
    let bestRoom = -1;
    for (let d = middleStart; d < middleEnd; d++) {
      const room = maxHoursPerDay - dayHours[d];
      if (room > bestRoom && room >= a.durationHours) {
        bestRoom = room;
        bestDay = d;
      }
    }
    if (bestRoom >= a.durationHours) {
      buckets[bestDay].push(a);
      dayHours[bestDay] += a.durationHours;
    } else {
      // Overflow: put it on the day with most room even if it exceeds cap.
      let maxRoom = -1;
      let maxDay = middleStart;
      for (let d = middleStart; d < middleEnd; d++) {
        const room = maxHoursPerDay - dayHours[d];
        if (room > maxRoom) {
          maxRoom = room;
          maxDay = d;
        }
      }
      buckets[maxDay].push(a);
      dayHours[maxDay] += a.durationHours;
    }
    dayIdx = ((dayIdx - middleStart + 1) % (middleEnd - middleStart)) + middleStart;
  }

  // Sort activities within each day by time preference.
  for (let d = 0; d < totalDays; d++) {
    buckets[d] = sortByTimePreference(buckets[d]);
  }

  return buckets;
}

/**
 * Build the full item list for one day: activities + meals + transport.
 * Now with neighborhood-aware meal recommendations, airport transfers,
 * and profile-personalized meal descriptions.
 */
function buildDayItems(
  activities: Activity[],
  destination: Destination,
  config: (typeof STYLE_CONFIG)[Style],
  isArrival: boolean,
  isDeparture: boolean,
  style: Style,
  profile?: TravelerProfile,
): DayItem[] {
  const items: DayItem[] = [];
  const foodPerDay = destination.foodPerDay[style];
  const breakfastCost = Math.round(foodPerDay * 0.2);
  const lunchCost = Math.round(foodPerDay * 0.3);
  const dinnerCost = Math.round(foodPerDay * 0.5);
  const cityName = destination.name.split(",")[0];

  // Infer neighborhoods for this day's activities
  const dayNeighborhoods = inferNeighborhoods(activities, destination);
  let mealIdx = 0; // offset for cycling through neighborhoods

  // Helper: build a neighborhood-aware meal title + description
  function mealInfo(
    baseName: string,
    offset: number,
  ): { title: string; description?: string } {
    const hood = pickMealNeighborhood(dayNeighborhoods, destination, offset);
    if (hood) {
      return {
        title: `${baseName} in ${hood.name}`,
        description: hood.mealTip ?? `${hood.vibe} neighborhood`,
      };
    }
    // Fallback: use city name for auto-resolved destinations
    return { title: `${baseName} in ${cityName}` };
  }

  // Helper: personalize a meal name based on profile
  function personalizedMealName(
    mealType: "breakfast" | "lunch" | "dinner",
  ): string {
    if (!profile) {
      const defaults: Record<string, string> = {
        breakfast: "Breakfast",
        lunch: "Lunch",
        dinner: "Dinner",
      };
      return defaults[mealType];
    }
    const topInterest = profile.interests[0];
    const isVeg = profile.dietary?.includes("vegetarian") || profile.dietary?.includes("vegan");
    const isHalal = profile.dietary?.includes("halal");
    const isKosher = profile.dietary?.includes("kosher");
    const strictBudget = profile.budgetSensitivity === "strict";

    // Dietary takes priority for naming
    if (isVeg) {
      const vegPrefix = profile.dietary?.includes("vegan") ? "Vegan" : "Vegetarian";
      if (mealType === "breakfast") return `${vegPrefix} breakfast`;
      if (mealType === "lunch") return `${vegPrefix} restaurant lunch`;
      return `${vegPrefix} restaurant dinner`;
    }
    if (isHalal) {
      if (mealType === "breakfast") return "Halal breakfast";
      if (mealType === "lunch") return "Halal restaurant lunch";
      return "Halal restaurant dinner";
    }
    if (isKosher) {
      if (mealType === "breakfast") return "Kosher breakfast";
      if (mealType === "lunch") return "Kosher restaurant lunch";
      return "Kosher restaurant dinner";
    }

    // Budget strict
    if (strictBudget) {
      if (mealType === "breakfast") return "Affordable breakfast";
      if (mealType === "lunch") return "Affordable local lunch";
      return "Affordable local dinner";
    }

    // Interest-based naming
    if (topInterest === "foodie") {
      if (mealType === "breakfast") return "Local specialty breakfast";
      if (mealType === "lunch") return "Chef's tasting lunch";
      return "Local street food dinner";
    }
    if (topInterest === "relaxation") {
      if (mealType === "breakfast") return "Leisurely brunch";
      if (mealType === "lunch") return "Slow lunch";
      return "Sunset dinner";
    }
    if (profile.withKids) {
      if (mealType === "breakfast") return "Family breakfast";
      if (mealType === "lunch") return "Family-friendly lunch spot";
      return "Family-friendly dinner";
    }

    const defaults: Record<string, string> = {
      breakfast: "Breakfast",
      lunch: "Lunch",
      dinner: "Dinner",
    };
    return defaults[mealType];
  }

  // ─── Airport transfer on arrival ──────────────────────────────────────
  if (isArrival) {
    const transfer = getAirportTransferCost(destination, style);
    items.push({
      time: "morning",
      type: "flight",
      emoji: "✈️",
      title: `Arrive in ${cityName}`,
      costPerPerson: 0, // flight cost is in the breakdown, not per-day
      description: "Settle in, drop bags at accommodation",
    });
    items.push({
      time: "morning",
      type: "transport",
      emoji: "\uD83D\uDE95",
      title: transfer.description,
      costPerPerson: transfer.cost,
    });
    items.push({
      time: "afternoon",
      type: "lodging",
      emoji: "🏨",
      title: `Check into ${config.lodgingType === "hotel" ? "hotel" : "accommodation"}`,
      costPerPerson: 0, // lodging is in the breakdown
      description:
        destination.lodging[config.lodgingType][style].examples[0] ?? "Your accommodation",
    });
  }

  if (isDeparture) {
    items.push({
      time: "morning",
      type: "meal",
      emoji: "☕",
      title: `${personalizedMealName("breakfast")} in ${cityName}`,
      costPerPerson: 0,
      description: `~$${breakfastCost}/person (included in food budget)`,
    });
  }

  // ─── Sort activities into time slots based on tags ────────────────────
  // Morning: outdoor/adventure. Afternoon: culture/iconic. Evening: nightlife/foodie.
  const morningPool: Activity[] = [];
  const afternoonPool: Activity[] = [];
  const eveningPool: Activity[] = [];

  if (isDeparture) {
    // Departure: just the first activity in the morning
    if (activities.length > 0) morningPool.push(activities[0]);
  } else if (!isArrival) {
    for (const a of activities) {
      const score = timeScore(a);
      if (score === 0) morningPool.push(a);
      else if (score === 2) eveningPool.push(a);
      else afternoonPool.push(a);
    }
    // Ensure at least one morning activity if we have any
    if (morningPool.length === 0 && afternoonPool.length > 1) {
      morningPool.push(afternoonPool.shift()!);
    }
    if (morningPool.length === 0 && eveningPool.length > 1) {
      morningPool.push(eveningPool.shift()!);
    }
  }

  // ─── Breakfast (full days) ────────────────────────────────────────────
  if (!isArrival && !isDeparture) {
    const breakfastInfo = mealInfo(personalizedMealName("breakfast"), mealIdx++);
    const breakfastDesc = breakfastInfo.description
      ? `${breakfastInfo.description} · ~$${breakfastCost}/person (included in food budget)`
      : `~$${breakfastCost}/person (included in food budget)`;
    items.push({
      time: "morning",
      type: "meal",
      emoji: "☕",
      title: breakfastInfo.title,
      costPerPerson: 0,
      description: breakfastDesc,
    });
  }

  // ─── Morning activities ───────────────────────────────────────────────
  for (const a of morningPool) {
    items.push({
      time: "morning",
      type: "activity",
      emoji: activityEmoji(a),
      title: a.name,
      description: a.description,
      costPerPerson: a.cost,
      durationHours: a.durationHours,
      activityId: a.id,
    });
  }

  // ─── Lunch ────────────────────────────────────────────────────────────
  if (!isDeparture && activities.length > 0) {
    const lunchInfo = mealInfo(personalizedMealName("lunch"), mealIdx++);
    const lunchDesc = lunchInfo.description
      ? `${lunchInfo.description} · ~$${lunchCost}/person (included in food budget)`
      : `~$${lunchCost}/person (included in food budget)`;
    items.push({
      time: "afternoon",
      type: "meal",
      emoji: "🍽️",
      title: lunchInfo.title,
      costPerPerson: 0,
      description: lunchDesc,
    });
  }

  // ─── Free time block for relaxed pace ─────────────────────────────────
  if (profile?.pace === "relaxed" && !isArrival && !isDeparture) {
    items.push({
      time: "afternoon",
      type: "free",
      emoji: "\u2615",
      title: "Free time",
      costPerPerson: 0,
      description: "Relax, explore at your own pace",
    });
  }

  // ─── Afternoon activities ─────────────────────────────────────────────
  for (const a of afternoonPool) {
    items.push({
      time: "afternoon",
      type: "activity",
      emoji: activityEmoji(a),
      title: a.name,
      description: a.description,
      costPerPerson: a.cost,
      durationHours: a.durationHours,
      activityId: a.id,
    });
  }

  // ─── Arrival day activities (afternoon) ───────────────────────────────
  if (isArrival && activities.length > 0) {
    for (const a of activities) {
      items.push({
        time: "afternoon",
        type: "activity",
        emoji: activityEmoji(a),
        title: a.name,
        description: a.description,
        costPerPerson: a.cost,
        durationHours: a.durationHours,
        activityId: a.id,
      });
    }
  }

  // ─── Evening activities (nightlife/foodie-tagged) ─────────────────────
  if (!isDeparture) {
    for (const a of eveningPool) {
      items.push({
        time: "evening",
        type: "activity",
        emoji: activityEmoji(a),
        title: a.name,
        description: a.description,
        costPerPerson: a.cost,
        durationHours: a.durationHours,
        activityId: a.id,
      });
    }
  }

  // ─── Evening stroll + dinner ──────────────────────────────────────────
  if (!isDeparture) {
    if (activities.some((a) => a.tags.includes("free") || a.tags.includes("outdoor"))) {
      items.push({
        time: "evening",
        type: "free",
        emoji: "🌅",
        title: `Evening stroll in ${cityName}`,
        costPerPerson: 0,
      });
    }
    const dinnerInfo = mealInfo(personalizedMealName("dinner"), mealIdx++);
    const styleDesc =
      style === "budget"
        ? "Street food or casual spot"
        : style === "luxury"
          ? "Fine dining"
          : "Nice local restaurant";
    const dinnerDesc = dinnerInfo.description
      ? `${dinnerInfo.description} · ${styleDesc.toLowerCase()} · ~$${dinnerCost}/person (included in food budget)`
      : `${styleDesc} · ~$${dinnerCost}/person (included in food budget)`;
    items.push({
      time: "evening",
      type: "meal",
      emoji: "🍽️",
      title: dinnerInfo.title,
      costPerPerson: 0,
      description: dinnerDesc,
    });
  }

  // ─── Departure day: airport transfer ───────────────────────────────────
  // (morning activities for departure day are already added above via morningPool)
  if (isDeparture) {
    const transfer = getAirportTransferCost(destination, style);
    items.push({
      time: "afternoon",
      type: "transport",
      emoji: "\uD83D\uDE95",
      title: `${cityName} → airport · ~$${transfer.cost}`,
      costPerPerson: transfer.cost,
      description: STYLE_CONFIG[style].transportMode === "publicTransit"
        ? "By public transit"
        : "By taxi/rideshare",
    });
    items.push({
      time: "afternoon",
      type: "flight",
      emoji: "✈️",
      title: "Head to airport & depart",
      costPerPerson: 0,
    });
  }

  return items;
}

function activityEmoji(a: Activity): string {
  if (a.tags.includes("outdoor") || a.tags.includes("adventure")) return "🏞️";
  if (a.tags.includes("foodie")) return "🍴";
  if (a.tags.includes("culture")) return "🏛️";
  if (a.tags.includes("nightlife")) return "🎶";
  if (a.tags.includes("family")) return "🎠";
  if (a.tags.includes("iconic")) return "🎟️";
  if (a.cost === 0) return "🚶";
  return "🎟️";
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function dayOfWeek(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return DAY_NAMES[d.getUTCDay()];
}
