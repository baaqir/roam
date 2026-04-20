import type { Activity } from "@/lib/types";

/**
 * Generic activity placeholders used when a custom destination is resolved
 * in "rough" mode (no API keys → no real catalog from web search).
 *
 * These are intentionally city-agnostic — every destination has a free
 * walking tour, a major museum, a food scene, a viewpoint, a day trip.
 * Costs are typical worldwide averages so the day-by-day planner stays
 * meaningful even without specific data.
 */
export const GENERIC_ACTIVITIES: Activity[] = [
  {
    id: "free-walking-tour",
    name: "Free walking tour of the historic center",
    cost: 0,
    durationHours: 3,
    tags: ["outdoor", "culture", "free"],
    description:
      "Tip-based guided walk through the city's main historic district. Available in nearly every major city worldwide.",
    recommended: true,
  },
  {
    id: "top-museum",
    name: "Top museum or gallery visit",
    cost: 25,
    durationHours: 3,
    tags: ["culture", "iconic"],
    description:
      "The destination's flagship art or history museum. Reserve tickets online when possible to skip the line.",
    recommended: true,
  },
  {
    id: "iconic-landmark",
    name: "Iconic landmark visit (entry ticket)",
    cost: 35,
    durationHours: 2.5,
    tags: ["iconic", "culture"],
    description:
      "Whatever the city is famous for — castle, tower, cathedral, ruins. Often the must-do tourist photo.",
    recommended: true,
  },
  {
    id: "local-food-tour",
    name: "Local food tour or market crawl",
    cost: 75,
    durationHours: 3,
    tags: ["foodie", "culture"],
    description:
      "Guided tasting tour through the city's markets and food district. Books up — reserve a few days ahead.",
    recommended: true,
  },
  {
    id: "viewpoint",
    name: "Sunset viewpoint or scenic overlook",
    cost: 0,
    durationHours: 2,
    tags: ["outdoor", "iconic", "free"],
    description:
      "Free elevated lookout — every city has one (hill, tower, rooftop, beach). Time it for golden hour.",
    recommended: true,
  },
  {
    id: "day-excursion",
    name: "Full-day excursion outside the city",
    cost: 95,
    durationHours: 8,
    tags: ["adventure", "outdoor"],
    description:
      "Day trip to a major nearby attraction — coast, ruins, mountain, vineyard. Group tour or rental car.",
  },
  {
    id: "evening-district",
    name: "Evening in the popular nightlife district",
    cost: 65,
    durationHours: 4,
    tags: ["nightlife", "foodie"],
    description:
      "Dinner + drinks in the trendy bar/restaurant district. Budget covers a meal, drinks, and one cover charge.",
  },
  {
    id: "neighborhood-wander",
    name: "Neighborhood walk in a residential quarter",
    cost: 0,
    durationHours: 2,
    tags: ["outdoor", "culture", "free"],
    description:
      "Self-guided wander through a quieter local area — coffee, photography, people-watching.",
    recommended: true,
  },
  {
    id: "park-or-nature",
    name: "City park or nearby nature spot",
    cost: 0,
    durationHours: 2,
    tags: ["outdoor", "free", "family"],
    description:
      "Big urban park or accessible nature reserve. Pack a snack and a book.",
  },
  {
    id: "live-show",
    name: "Live music, theater, or cultural performance",
    cost: 75,
    durationHours: 2.5,
    tags: ["culture", "nightlife"],
    description:
      "Evening show — concert, opera, traditional dance, comedy. Look at local listings the day you arrive.",
  },
  {
    id: "guided-experience",
    name: "Guided cultural experience (cooking class, workshop)",
    cost: 95,
    durationHours: 3,
    tags: ["culture", "foodie"],
    description:
      "Hands-on local class — cooking, ceramics, calligraphy, whatever the city is known for.",
  },
  {
    id: "spa-or-rest",
    name: "Spa, hammam, or rest afternoon",
    cost: 60,
    durationHours: 2.5,
    tags: ["culture"],
    description:
      "Half-day off — spa, massage, hot springs, or a long lunch. Keep one of these in your itinerary.",
  },
];
