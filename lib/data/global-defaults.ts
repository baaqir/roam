import type {
  Style,
  TransportMode,
  LodgingType,
  LodgingTier,
} from "@/lib/types";

/**
 * Global per-tier defaults used when a discovered destination doesn't have
 * curated data. These are rough world-averages — accurate to within ±30%
 * for most major cities. Lodging is the noisiest, which is why we always
 * prefer live search for that category when keys are set.
 *
 * Source: rough averages from Numbeo / Budget Your Trip composite data
 * across 50+ tourist cities, as of 2026-Q1.
 */

export const GLOBAL_FOOD_PER_DAY: Record<Style, number> = {
  budget: 40,   // street food, grocery breakfasts, casual lunches
  comfort: 85,      // sit-down meals, one nicer dinner, a few drinks
  luxury: 200,  // hotel breakfast, fine dining, cocktails
};

export const GLOBAL_TRANSPORT_PER_DAY: Record<TransportMode, number> = {
  rideshare: 50,     // 2-3 trips/day in a major city
  rental: 75,        // car + parking + gas
  publicTransit: 12, // day pass equivalent
};

export const GLOBAL_LODGING: Record<
  LodgingType,
  Record<Style, LodgingTier>
> = {
  hotel: {
    budget: {
      nightlyRate: 100,
      examples: ["budget chain hotels", "hostels", "guesthouses"],
    },
    comfort: {
      nightlyRate: 200,
      examples: ["3-4 star city hotels", "boutique hotels"],
    },
    luxury: {
      nightlyRate: 500,
      examples: ["5 star hotels", "luxury resorts"],
    },
  },
  airbnb: {
    budget: {
      nightlyRate: 90,
      examples: ["private rooms", "studios in less central neighborhoods"],
    },
    comfort: {
      nightlyRate: 175,
      examples: ["whole 1BR apartments in good neighborhoods"],
    },
    luxury: {
      nightlyRate: 450,
      examples: ["whole homes with a view or premium location"],
    },
  },
};

/**
 * Approx round-trip flight base prices keyed by *region* of destination
 * (relative to common US/international origins). Used only as a last-resort
 * fallback when a discovered destination's true fare can't be looked up live.
 */
export const GLOBAL_FLIGHT_FALLBACK_RT: Record<
  "domestic-us" | "north-america" | "transatlantic" | "transpacific" | "long-haul",
  Record<Style, number>
> = {
  "domestic-us":   { budget: 280, comfort: 450, luxury: 1200 },
  "north-america": { budget: 350, comfort: 550, luxury: 1500 },
  "transatlantic": { budget: 650, comfort: 1100, luxury: 4500 },
  "transpacific":  { budget: 950, comfort: 1600, luxury: 6500 },
  "long-haul":     { budget: 1100, comfort: 1900, luxury: 7500 },
};
