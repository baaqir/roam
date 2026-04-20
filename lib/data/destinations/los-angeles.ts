import type { Destination } from "@/lib/types";

/**
 * Los Angeles baseline data. Numbers are spot-checked against typical
 * 2026 spring rates; refine with DirectBooker / live search as needed.
 */
export const losAngeles: Destination = {
  key: "los-angeles",
  name: "Los Angeles, CA",
  airportCode: "LAX",
  lodging: {
    hotel: {
      budget: {
        nightlyRate: 130,
        examples: [
          "Travelodge by Wyndham LAX South",
          "Hotel Pepper Tree Anaheim",
          "Best Western Plus Suites Hotel - LAX",
        ],
      },
      comfort: {
        nightlyRate: 240,
        examples: [
          "The LINE Hotel Koreatown",
          "Kimpton Everly Hollywood",
          "Hotel Erwin Venice Beach",
          "Mama Shelter Los Angeles",
        ],
      },
      luxury: {
        nightlyRate: 620,
        examples: [
          "Hotel Bel-Air",
          "The Beverly Hills Hotel",
          "Shutters on the Beach",
          "Sunset Tower Hotel",
        ],
      },
    },
    airbnb: {
      budget: {
        nightlyRate: 110,
        examples: [
          "Private room in Echo Park",
          "Studio in Koreatown",
          "Bungalow loft in Highland Park",
        ],
      },
      comfort: {
        nightlyRate: 230,
        examples: [
          "Whole 1BR in Silver Lake",
          "Beach apartment in Venice",
          "Modern condo in West Hollywood",
          "Spanish bungalow in Los Feliz",
        ],
      },
      luxury: {
        nightlyRate: 600,
        examples: [
          "Hollywood Hills home with view",
          "Malibu beachfront house",
          "Beverly Hills villa with pool",
        ],
      },
    },
  },
  foodPerDay: {
    budget: 50,
    comfort: 95,
    luxury: 200,
  },
  transportPerDay: {
    rideshare: 65, // LA sprawl = more & longer rides
    rental: 80,
    publicTransit: 10,
  },
  activities: [
    {
      id: "griffith-observatory",
      name: "Griffith Observatory + Hollywood Sign hike",
      cost: 0,
      durationHours: 3,
      tags: ["iconic", "outdoor", "free"],
      description:
        "Free admission observatory with telescopes and LA's best Hollywood Sign view. Go at sunset for golden light on the sign and city lights after dark. Pro tip: parking fills by 11am on weekends — rideshare or take the DASH shuttle.",
      recommended: true,
    },
    {
      id: "universal-studios",
      name: "Universal Studios Hollywood",
      cost: 109,
      durationHours: 8,
      tags: ["iconic", "family"],
      description:
        "Theme park + working studio backlot tour. Plan a full day; arrive at park open and hit the big rides first. Pro tip: buy the Express Pass if visiting on a weekend — standby waits top 90 minutes by noon.",
    },
    {
      id: "venice-walk",
      name: "Venice Boardwalk + canals walk",
      cost: 0,
      durationHours: 2,
      tags: ["iconic", "outdoor", "free"],
      description:
        "Boardwalk performers, Muscle Beach, then the quiet canals south of Venice Blvd. Best mid-morning through afternoon; the boardwalk thins out by sunset. Pro tip: walk the canals first while they're still peaceful, then loop back to the boardwalk.",
      recommended: true,
    },
    {
      id: "lacma",
      name: "LACMA + Academy Museum",
      cost: 35,
      durationHours: 3,
      tags: ["culture"],
      description:
        "Two of LA's biggest museums on the same Miracle Mile block. Combined-day approach saves time.",
    },
    {
      id: "santa-monica-pier",
      name: "Santa Monica Pier sunset",
      cost: 0,
      durationHours: 2,
      tags: ["iconic", "outdoor", "family", "free"],
      description:
        "Walk the pier, ride the Ferris wheel ($), watch sunset over the Pacific.",
      recommended: true,
    },
    {
      id: "getty-center",
      name: "The Getty Center",
      cost: 0,
      durationHours: 4,
      tags: ["culture", "iconic", "free"],
      description:
        "Free museum on a hilltop with a tram ride up — plan 3-4 hours for the galleries and gardens. Arrive after 3pm for golden light on the architecture and fewer crowds. Pro tip: reserve the free timed entry online; parking is $25 and fills early.",
    },
    {
      id: "kogi-truck-tour",
      name: "Korean BBQ + taco truck crawl in K-Town",
      cost: 65,
      durationHours: 3,
      tags: ["foodie", "nightlife"],
      description:
        "Self-guided KBBQ feast then late-night taco trucks. Budget covers food + drinks.",
    },
    {
      id: "broad-walt-disney",
      name: "The Broad + Walt Disney Concert Hall",
      cost: 0,
      durationHours: 2.5,
      tags: ["culture", "iconic", "free"],
      description:
        "Free contemporary art museum (timed tickets) + Frank Gehry's iconic concert hall exterior.",
    },
    {
      id: "runyon-canyon",
      name: "Runyon Canyon morning hike",
      cost: 0,
      durationHours: 1.5,
      tags: ["outdoor", "free"],
      description:
        "Quick urban hike with a celebrity-spotting reputation and skyline views.",
    },
  ],
  neighborhoods: [
    { name: "Hollywood", vibe: "tourist landmarks and nightlife", mealTip: "Late-night Thai on Hollywood Blvd or ramen at Jinya" },
    { name: "Venice Beach", vibe: "bohemian surf culture", mealTip: "Gjelina for farm-to-table or Gjusta for bakery breakfast" },
    { name: "Santa Monica", vibe: "beachside upscale casual", mealTip: "Fresh seafood at Santa Monica Seafood or brunch at Huckleberry" },
    { name: "Koreatown", vibe: "24-hour Korean BBQ and nightlife", mealTip: "All-you-can-eat KBBQ at Quarters or late-night bingsoo" },
    { name: "Silver Lake", vibe: "trendy cafes and indie shops", mealTip: "Coffee at Intelligentsia, dinner at Pine & Crane" },
    { name: "Downtown (DTLA)", vibe: "arts district and Grand Central Market", mealTip: "Grand Central Market for tacos, egg sandwiches, and Thai tea" },
    { name: "West Hollywood", vibe: "upscale dining and nightlife", mealTip: "Craig's for celeb-spotting or Catch LA on the rooftop" },
  ],
  tips: [
    "Tap water is safe to drink everywhere",
    "Traffic is brutal 7-10am and 4-7pm — plan around rush hours",
    "Tipping 18-20% is standard at restaurants",
    "The Metro is expanding and useful for Hollywood ↔ DTLA ↔ K-Town",
    "Parking at the beach is $10-20; arrive before 10am on weekends or you won't find a spot",
    "In-N-Out Burger is a must-try if you've never been — 'animal style' is the move",
  ],
  airportTransfer: {
    taxi: [35, 65],
    transit: [2, 10],
  },
  notes: [
    "LA is car-dependent — rideshare baseline is higher here than coastal cities. Consider rental for trips outside Hollywood/DTLA.",
  ],
};
