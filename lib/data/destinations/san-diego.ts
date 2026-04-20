import type { Destination } from "@/lib/types";

/**
 * San Diego baseline data.
 *
 * Lodging tiers were seeded from real DirectBooker availability for
 * 3 nights starting 2026-04-20 (single occupancy). Nightly rates are
 * averages of representative properties at each tier (rooms-only, taxes
 * included). When the runtime live-search layer is enabled, these values
 * are used as a fallback if the search/extraction call fails.
 */
export const sanDiego: Destination = {
  key: "san-diego",
  name: "San Diego, CA",
  airportCode: "SAN",
  lodging: {
    hotel: {
      budget: {
        // Avg of: Best Western Seven Seas ($87), HoJo Hotel Circle ($77),
        // Motel 6 Hotel Circle ($88), Super 8 Hotel Circle ($85),
        // Heritage Inn ($93), HI Downtown Hostel ($90)
        nightlyRate: 90,
        examples: [
          "Best Western Seven Seas",
          "Howard Johnson by Wyndham Hotel Circle",
          "HI San Diego Downtown Hostel",
          "Motel 6 Hotel Circle - Mission Valley",
        ],
      },
      comfort: {
        // Avg of: Mission View Inn ($134), Wyndham Garden SeaWorld ($152),
        // Handlery Hotel ($137), Coronado Island Inn ($164),
        // Holiday Inn Express Otay Mesa ($149), The Shoal La Jolla ($200),
        // Ocean Beach Hotel ($198), Beach Cottages ($216)
        nightlyRate: 185,
        examples: [
          "Handlery Hotel San Diego",
          "The Shoal La Jolla Beach",
          "Ocean Beach Hotel",
          "Coronado Island Inn",
          "Wyndham Garden San Diego near SeaWorld",
        ],
      },
      luxury: {
        // Avg of: Pendry San Diego ($546), Hotel del Coronado ($696),
        // Coronado Island Marriott ($622), Hilton Bayfront ($587),
        // Marriott Marquis ($602), Pier South Resort ($401),
        // Glorietta Bay Inn ($399), Gaylord Pacific Resort ($545)
        nightlyRate: 525,
        examples: [
          "Pendry San Diego",
          "Hotel del Coronado",
          "Hilton San Diego Bayfront",
          "Marriott Marquis San Diego Marina",
          "Coronado Island Marriott Resort & Spa",
        ],
      },
    },
    airbnb: {
      // San Diego Airbnb tiers from AirROI 2026 market data:
      //   Bottom 25% ~$154/night, Median ~$255/night, Top 10% ~$718/night.
      // Adjusted slightly down for solo-traveler studios and including
      // typical cleaning/service fees amortized over 3 nights.
      budget: {
        nightlyRate: 120,
        examples: [
          "Private room near Hillcrest",
          "Studio in North Park",
          "Shared garden cottage in Normal Heights",
        ],
      },
      comfort: {
        // Pacific Beach ADR ~$274, Hillcrest ADR ~$232.
        nightlyRate: 220,
        examples: [
          "Whole 1BR in Pacific Beach",
          "Modern condo in East Village",
          "Beach cottage in Ocean Beach",
          "1BR loft in Little Italy",
        ],
      },
      luxury: {
        // Coastal premium ADR $593-645, top 10% citywide $718+.
        nightlyRate: 550,
        examples: [
          "3BR La Jolla Shores house with ocean view",
          "Coronado bayfront whole home",
          "Mission Bay waterfront villa",
          "Mt. Soledad luxury home with pool",
        ],
      },
    },
  },
  /**
   * Per-person daily food spend, USD. Rough industry/blog averages tuned
   * for San Diego (taco shops, Little Italy, fine dining options).
   */
  foodPerDay: {
    budget: 45,   // tacos, food trucks, casual lunch + grocery breakfast
    comfort: 85,      // sit-down breakfast, casual lunch, mid-range dinner + 1 drink
    luxury: 175,  // hotel breakfast, nicer lunch, fine dining + cocktails
  },
  /**
   * Daily local transport spend in San Diego. Rideshare reflects 2-3 trips/day
   * across Gaslamp/Balboa/Coronado. Rental includes car + parking + gas/day.
   * Public transit (MTS day pass = $6) is realistic for compact itineraries.
   */
  transportPerDay: {
    rideshare: 50,
    rental: 95,
    publicTransit: 12,
  },
  activities: [
    {
      id: "balboa-park",
      name: "Balboa Park (gardens, museums, Spanish Village)",
      cost: 0,
      durationHours: 4,
      tags: ["iconic", "outdoor", "culture", "free"],
      description:
        "1,200-acre cultural park with 17 museums, gardens, and Spanish Colonial architecture. Free to walk; plan 3-4 hours for the gardens alone, longer if you add museums. Best in the morning before it heats up.",
      recommended: true,
    },
    {
      id: "san-diego-zoo",
      name: "San Diego Zoo",
      cost: 74,
      durationHours: 5,
      tags: ["iconic", "family", "outdoor"],
      description:
        "World-renowned zoo inside Balboa Park — plan 4-5 hours, or a full day if you add the safari park. Arrive at opening for active animals and shorter lines. Pro tip: buy online to skip the ticket window.",
      recommended: true,
    },
    {
      id: "uss-midway",
      name: "USS Midway Museum",
      cost: 36,
      durationHours: 3,
      tags: ["iconic", "culture", "family"],
      description:
        "Decommissioned aircraft carrier turned museum on the downtown waterfront with ~30 restored aircraft. Plan 2-3 hours, or 4+ if you do the audio tour on the flight deck. Pro tip: go early morning to avoid school groups.",
      recommended: true,
    },
    {
      id: "la-jolla-cove-kayak",
      name: "La Jolla Cove sea cave kayak tour",
      cost: 65,
      durationHours: 2,
      tags: ["outdoor", "adventure"],
      description:
        "Guided 90-minute kayak tour through the La Jolla Ecological Reserve — sea lions, leopard sharks (harmless), seven sea caves. Best on calm mornings; afternoon wind picks up. Pro tip: book 2 weeks ahead, walk-ups often sell out by 10am.",
      recommended: true,
    },
    {
      id: "sunset-cliffs",
      name: "Sunset Cliffs Natural Park at golden hour",
      cost: 0,
      durationHours: 1.5,
      tags: ["outdoor", "iconic", "free"],
      description:
        "Dramatic Pacific bluffs in Point Loma. Park, walk the trail, and stay for sunset.",
      recommended: true,
    },
    {
      id: "coronado-ferry-bike",
      name: "Coronado ferry + island bike loop",
      cost: 35,
      durationHours: 4,
      tags: ["outdoor", "iconic", "family"],
      description:
        "Round-trip ferry from downtown plus a 1-day bike rental to loop Coronado Island and the Silver Strand.",
    },
    {
      id: "little-italy-food-tour",
      name: "Little Italy walking food tour",
      cost: 95,
      durationHours: 3,
      tags: ["foodie", "culture"],
      description:
        "Guided 6-stop tasting tour through one of the country's largest Little Italy neighborhoods.",
    },
    {
      id: "padres-game",
      name: "Padres game at Petco Park",
      cost: 45,
      durationHours: 4,
      tags: ["iconic", "family", "nightlife"],
      description:
        "Mid-tier seat for a regular-season home game. Schedule-dependent; downtown ballpark, walkable from Gaslamp.",
    },
    {
      id: "gaslamp-nightlife",
      name: "Gaslamp Quarter bar crawl",
      cost: 60,
      durationHours: 4,
      tags: ["nightlife", "foodie"],
      description:
        "Self-guided crawl through historic 16-block Gaslamp district. Budget covers cover charges + 4-5 drinks.",
    },
    {
      id: "torrey-pines-hike",
      name: "Torrey Pines State Reserve coastal hike",
      cost: 15,
      durationHours: 3,
      tags: ["outdoor", "adventure"],
      description:
        "Parking fee for the rare-pine reserve north of La Jolla. Beach-to-bluff trails with Pacific overlooks.",
    },
    {
      id: "seaworld",
      name: "SeaWorld San Diego",
      cost: 95,
      durationHours: 6,
      tags: ["family", "iconic"],
      description:
        "Marine theme park on Mission Bay. Single-day ticket; bring sunscreen.",
    },
    {
      id: "old-town-tequila",
      name: "Old Town tequila & taco evening",
      cost: 55,
      durationHours: 2.5,
      tags: ["foodie", "culture"],
      description:
        "Wander Old Town State Historic Park, then dinner at one of the 19th-century-style cantinas.",
    },
  ],
  neighborhoods: [
    { name: "Gaslamp Quarter", vibe: "nightlife and dining", mealTip: "Craft cocktails and rooftop dinners on Fifth Ave" },
    { name: "Little Italy", vibe: "Italian cafes and trendy brunch", mealTip: "Grab brunch at Morning Glory or pasta at Bencotto" },
    { name: "Old Town", vibe: "historic Mexican heritage", mealTip: "Authentic Mexican food at Café Coyote or Casa Guadalajara" },
    { name: "La Jolla", vibe: "coastal upscale village", mealTip: "Fresh seafood at The Fish Market or George's at the Cove" },
    { name: "North Park", vibe: "hipster craft beer scene", mealTip: "Tacos and local craft beer on 30th Street" },
    { name: "Pacific Beach", vibe: "surfer beach town", mealTip: "Casual fish tacos and sunset beers on the boardwalk" },
    { name: "Coronado", vibe: "beachy resort island", mealTip: "Brunch at the Hotel del Coronado or fish and chips on Orange Ave" },
  ],
  tips: [
    "Tap water is safe to drink everywhere",
    "San Diego's trolley connects downtown, Old Town, and the border — $2.50/ride or $6 day pass",
    "Tipping 18-20% is standard at restaurants",
    "Parking downtown is expensive ($20-40/day) — use the trolley or rideshare",
    "Marine layer ('June Gloom') is real May-July: mornings are foggy, afternoons clear up",
    "Many museums in Balboa Park have free Tuesday rotating admission for San Diego residents",
  ],
  airportTransfer: {
    taxi: [20, 35],
    transit: [3, 5],
  },
  notes: [
    "Hotel lodging assumes one room for ≤2 travelers. For 3+ travelers, expect ~70% surcharge for a second room or larger suite.",
    "Airbnb pricing assumes a whole place for the group at mid/luxury tiers (no surcharge for added travelers up to 4); budget tier may be a private room.",
    "San Diego has a 10.5% transient occupancy tax + tourism assessment, plus an Airbnb cleaning fee typically $75-200 — these are baked into the nightly averages above.",
  ],
};
