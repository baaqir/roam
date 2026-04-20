/**
 * Roam — Simplified types.
 *
 * The user provides 4 inputs: city, nights, travelers, style.
 * The engine returns a complete TripPlan with budget + day-by-day itinerary.
 *
 * Multi-city trips wrap multiple single-city legs into one continuous journey.
 */

// ─── Input ──────────────────────────────────────────────────────────────

export type Style = "budget" | "comfort" | "luxury";

export type TripLeg = {
  city: string;
  nights: number;
  style?: Style; // optional per-leg override; defaults to the trip-level style
};

export type TripInput = {
  city: string;       // primary city (for single-city backward compat)
  nights: number;     // primary nights
  travelers: number;  // 1-8
  style: Style;
  startDate?: string; // YYYY-MM-DD, optional for backward compat
  origin?: string;    // origin city key (e.g. "nyc", "ord") — auto-detected from timezone if omitted
  /** Multi-city legs. When present, `city` and `nights` are ignored in favor of this array. */
  legs?: TripLeg[];
  /** Traveler profile for personalization. Decoded from URL param. */
  profile?: import("./profile").TravelerProfile;
};

// ─── Output ─────────────────────────────────────────────────────────────

export type CategoryKey =
  | "flights"
  | "lodging"
  | "food"
  | "transport"
  | "activities"
  | "misc";

export type BreakdownRow = {
  key: CategoryKey;
  label: string;
  amount: number;
  pct: number;      // 0-100
  detail: string;   // human-readable explanation
};

export type DayItem = {
  time: "morning" | "afternoon" | "evening";
  type: "flight" | "lodging" | "activity" | "meal" | "transport" | "free";
  emoji: string;
  title: string;
  description?: string;
  costPerPerson: number;
  durationHours?: number;
  activityId?: string;
};

export type DayPlan = {
  dayNumber: number;
  date: string;         // YYYY-MM-DD
  dayOfWeek: string;    // "Mon", "Tue", etc.
  label: "Arrival" | "Full Day" | "Departure" | "Travel Day";
  items: DayItem[];
  dailyCost: number;    // total cost for this day (all travelers)
};

export type TripPlan = {
  id: string;           // unique ID for localStorage
  input: TripInput;
  destination: Destination;
  originName: string;
  originAirport: string;
  total: number;
  perPerson: number;
  breakdown: BreakdownRow[];
  days: DayPlan[];
  context: {
    country?: CountryInfo;
    sun?: SunTimes;
    usdToLocal?: number;
  };
  checklist: ChecklistItem[];
  assumptions: string[];
  createdAt: string;    // ISO timestamp
};

// ─── Multi-city trip plan ──────────────────────────────────────────────

export type LegPlan = {
  legIndex: number;
  destination: Destination;
  days: DayPlan[];
  breakdown: BreakdownRow[];
  legTotal: number;
  context: TripPlan["context"];
  checklist: ChecklistItem[];
};

export type MultiCityTripPlan = {
  id: string;
  input: TripInput;
  legs: LegPlan[];
  /** Aggregated costs across all legs. */
  total: number;
  perPerson: number;
  /** Flight costs (multi-segment: origin→city1, city1→city2, ..., cityN→origin). */
  flightCost: number;
  flightSegments: { from: string; to: string; cost: number }[];
  breakdown: BreakdownRow[]; // aggregated
  days: DayPlan[]; // flattened across all legs, sequential day numbers
  assumptions: string[];
  createdAt: string;
  originName: string;
  originAirport: string;
};

/** Type guard to distinguish multi-city plans from single-city plans. */
export function isMultiCity(plan: TripPlan | MultiCityTripPlan): plan is MultiCityTripPlan {
  return "legs" in plan && Array.isArray((plan as MultiCityTripPlan).legs);
}

/** Extract a display name from either plan type. */
export function planDisplayName(plan: TripPlan | MultiCityTripPlan): string {
  if (isMultiCity(plan)) {
    return plan.legs.map((l) => l.destination.name.split(",")[0].trim()).join(" + ");
  }
  return plan.destination.name;
}

// ─── Destination (kept from v1 — the data layer is reused) ─────────────

export type FlightRegion =
  | "domestic-us"
  | "north-america"
  | "transatlantic"
  | "transpacific"
  | "long-haul";

export type ActivityTag =
  | "iconic"
  | "outdoor"
  | "foodie"
  | "family"
  | "nightlife"
  | "culture"
  | "adventure"
  | "free";

export type Activity = {
  id: string;
  name: string;
  cost: number;
  durationHours: number;
  tags: ActivityTag[];
  description: string;
  recommended?: boolean;
};

export type LodgingTier = {
  nightlyRate: number;
  examples: string[];
};

export type LodgingType = "hotel" | "airbnb";

export type TransportMode = "rideshare" | "rental" | "publicTransit";

export type Neighborhood = {
  name: string;
  vibe: string;
  mealTip?: string;
};

export type Destination = {
  key: string;
  name: string;
  airportCode: string;
  region?: FlightRegion;
  lodging: Record<LodgingType, Record<Style, LodgingTier>>;
  foodPerDay: Record<Style, number>;
  transportPerDay: Record<TransportMode, number>;
  activities: Activity[];
  neighborhoods?: Neighborhood[];
  tips?: string[];
  airportTransfer?: {
    taxi: [number, number];   // [low, high] in USD
    transit: [number, number];
  };
  notes?: string[];
};

export type Origin = {
  key: string;
  name: string;
  airportCodes: string[];
  flightBasePrices: Record<string, Record<Style, number>>;
};

// ─── Context types (from free APIs) ─────────────────────────────────────

export type CountryInfo = {
  countryCode: string;
  countryName: string;
  currencyCode: string;
  currencySymbol: string;
  currencyName: string;
  languages: string[];
  callingCode: string;
  plugTypes: string[];
  drivingSide: "left" | "right" | "unknown";
};

export type SunTimes = {
  date: string;
  sunrise: string;
  sunset: string;
  daylightHours: number;
};

export type ChecklistItem = {
  section: "Documents" | "Health" | "Money" | "Tech" | "Logistics";
  title: string;
  detail?: string;
  priority: "must" | "should" | "fyi";
};

// ─── Style mappings (what each style means for cost categories) ─────────

export const STYLE_CONFIG: Record<
  Style,
  {
    label: string;
    lodgingType: LodgingType;
    transportMode: TransportMode;
    mealMultiplier: number;  // 1.0 = base food cost
    description: string;
  }
> = {
  budget: {
    label: "Budget",
    lodgingType: "airbnb",
    transportMode: "publicTransit",
    mealMultiplier: 0.85,
    description: "Hostels, street food, public transit",
  },
  comfort: {
    label: "Comfort",
    lodgingType: "hotel",
    transportMode: "rideshare",
    mealMultiplier: 1.0,
    description: "Hotels, nice restaurants, rideshare",
  },
  luxury: {
    label: "Luxury",
    lodgingType: "hotel",
    transportMode: "rideshare",
    mealMultiplier: 1.4,
    description: "Luxury hotels, fine dining, private transport",
  },
};

// ─── Saved trips ────────────────────────────────────────────────────────

export type SavedTrip = {
  id: string;
  plan: TripPlan | MultiCityTripPlan;
  savedAt: string;        // ISO timestamp
  status: "upcoming" | "past" | "draft";
};

export type TripsStore = {
  trips: SavedTrip[];
  annualBudget?: number;  // optional USD target for the year
};
