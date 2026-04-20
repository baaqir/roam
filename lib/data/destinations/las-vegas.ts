import type { Destination } from "@/lib/types";

/**
 * Las Vegas baseline data. Highly volatile pricing — weekday vs weekend
 * spreads are large, conventions/fights/EDC spike everything. These are
 * Mon-Thu averages; expect 1.5-2× on Fri-Sun.
 */
export const lasVegas: Destination = {
  key: "las-vegas",
  name: "Las Vegas, NV",
  airportCode: "LAS",
  lodging: {
    hotel: {
      budget: {
        nightlyRate: 80, // includes resort fee — pleasant surprise on Strip outliers
        examples: [
          "Circus Circus",
          "Excalibur",
          "OYO Hotel & Casino",
          "Sahara Las Vegas",
        ],
      },
      comfort: {
        nightlyRate: 200,
        examples: [
          "The LINQ",
          "Park MGM",
          "Treasure Island",
          "Resorts World Las Vegas",
        ],
      },
      luxury: {
        nightlyRate: 500,
        examples: [
          "Wynn Las Vegas",
          "Bellagio",
          "The Venetian Resort",
          "Aria Resort & Casino",
          "Fontainebleau Las Vegas",
        ],
      },
    },
    airbnb: {
      budget: {
        nightlyRate: 95,
        examples: [
          "Studio off the Strip",
          "Private room in Henderson",
          "1BR in Summerlin",
        ],
      },
      comfort: {
        nightlyRate: 220,
        examples: [
          "2BR condo near the Strip",
          "MGM Signature suite",
          "Whole apartment in Summerlin",
        ],
      },
      luxury: {
        nightlyRate: 575,
        examples: [
          "Penthouse with Strip view",
          "Henderson luxury home with pool",
          "MacDonald Highlands estate",
        ],
      },
    },
  },
  foodPerDay: {
    budget: 40, // food court / off-Strip / buffet
    comfort: 100,   // mid Strip restaurants + 1 nice dinner
    luxury: 300, // Joël Robuchon territory + cocktails
  },
  transportPerDay: {
    rideshare: 40,    // Strip mostly walkable; use rideshare for downtown / off-Strip
    rental: 65,       // includes $25/night casino self-parking
    publicTransit: 12, // Deuce bus + monorail
  },
  activities: [
    {
      id: "strip-walk",
      name: "Strip walk: Bellagio fountains, Venetian, Caesars",
      cost: 0,
      durationHours: 4,
      tags: ["iconic", "outdoor", "free"],
      description:
        "Self-guided evening walk hitting the famous resort lobbies and free attractions. The Bellagio fountains run every 15-30 min after 8pm.",
      recommended: true,
    },
    {
      id: "cirque-show",
      name: "Cirque du Soleil show (O / KÀ / Mystère)",
      cost: 145,
      durationHours: 2,
      tags: ["iconic", "nightlife", "culture"],
      description:
        "One signature Cirque show — pricing is mid-tier seat. Book 2-3 weeks ahead.",
      recommended: true,
    },
    {
      id: "hoover-dam",
      name: "Hoover Dam tour (half-day)",
      cost: 30,
      durationHours: 4,
      tags: ["iconic", "outdoor", "culture"],
      description:
        "Drive 45 min east. Powerplant tour ticket + walking the dam. Combine with Lake Mead overlook.",
    },
    {
      id: "red-rock",
      name: "Red Rock Canyon scenic drive + hike",
      cost: 20,
      durationHours: 4,
      tags: ["outdoor", "adventure"],
      description:
        "13-mile scenic loop 30 min from the Strip. $20 per car. Calico Tanks is a quick rewarding hike.",
      recommended: true,
    },
    {
      id: "fremont-east",
      name: "Fremont Street + East Fremont bar crawl",
      cost: 75,
      durationHours: 4,
      tags: ["nightlife", "iconic"],
      description:
        "Old Vegas downtown — light show overhead, then head east of the canopy for the indie bar district.",
    },
    {
      id: "high-roller",
      name: "High Roller observation wheel",
      cost: 25,
      durationHours: 1,
      tags: ["iconic", "family"],
      description:
        "World's tallest observation wheel. Daytime tickets cheaper; sunset is the sweet spot.",
    },
    {
      id: "buffet",
      name: "Bacchanal Buffet at Caesars",
      cost: 80,
      durationHours: 2,
      tags: ["foodie", "iconic", "family"],
      description:
        "Top-rated Vegas buffet — book a time slot online to skip the wait.",
    },
    {
      id: "valley-of-fire",
      name: "Valley of Fire State Park (full day)",
      cost: 25,
      durationHours: 6,
      tags: ["outdoor", "adventure", "iconic"],
      description:
        "1 hour northeast — red sandstone, petroglyphs, and arches. Bring water; summer is brutal.",
    },
    {
      id: "sphere-show",
      name: "The Sphere — Postcard from Earth or U2",
      cost: 175,
      durationHours: 2,
      tags: ["iconic", "culture"],
      description:
        "The new Sphere venue. Pricing for a mid-tier seat at a non-concert experience.",
    },
  ],
  neighborhoods: [
    { name: "The Strip", vibe: "iconic casino resorts", mealTip: "Bacchanal Buffet at Caesars or Gordon Ramsay Hell's Kitchen" },
    { name: "Downtown / Fremont", vibe: "old-school Vegas and craft cocktails", mealTip: "Carson Kitchen or Le Thai on Fremont East" },
    { name: "Chinatown", vibe: "authentic Asian food corridor", mealTip: "Dim sum at Chang's or pho at District One — locals' picks" },
    { name: "Arts District", vibe: "hip galleries and coffee shops", mealTip: "Esther's Kitchen for Italian or Makers & Finders for brunch" },
    { name: "Spring Mountains", vibe: "nature escape from the Strip", mealTip: "Pack a picnic — no restaurants on the trails" },
  ],
  tips: [
    "Tap water is safe but tastes rough — bottled water is cheap at CVS (not hotel mini-bars)",
    "The Strip is 4 miles long — distances are deceptive, budget for rideshare or the monorail",
    "Tipping is expected everywhere: $1-2/drink at bars, $5/day for housekeeping",
    "Free parking is rare on the Strip — most resorts charge $18-25/day for self-park",
    "The best restaurant deals are off-Strip in Chinatown and the Arts District",
    "Happy hours (4-6pm) on the Strip save 30-50% on drinks",
  ],
  airportTransfer: {
    taxi: [20, 30],
    transit: [2, 6],
  },
  notes: [
    "Most Strip hotels charge a $40-50/night resort fee on top of the room rate — included in the averages above.",
    "Weekend rates (Fri-Sun) routinely run 1.5-2× the weekday baseline. Conventions can spike further.",
  ],
};
