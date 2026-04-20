# Roam

Personal trip-cost estimator, activity picker, and day-by-day itinerary builder. Built with Next.js 15 (App Router), TypeScript, and Tailwind. Real-time hotel and flight prices via Tavily web search + Claude Haiku extraction; smart fallback estimates when keys aren't set.

## Quick start

```bash
npm install
npm run dev
# open http://localhost:3000
```

Out of the box you get **18 cities** with real airports, hand-picked activity catalogs, and region-correct flight pricing — all working fully offline:

- **3 deeply-curated** (San Diego, Los Angeles, Las Vegas) with city-specific lodging tiers seeded from real DirectBooker availability.
- **15 bundled popular destinations**: Paris, London, Rome, Barcelona, Amsterdam, Lisbon, Athens, Tokyo, Bangkok, Bali, Dubai, NYC, Miami, Mexico City, Cancún. Lodging/food/transport use global tier averages; everything else is real.
- 5 origin airports (NYC, SF Bay, LA, Chicago, Seattle).
- Multi-city itineraries, group cost splitting, vibe filter, day-by-day planner, save/share trips.

Type **any other city** in the destination input (Reykjavik, Lagos, Tbilisi, Hanoi, anywhere) and the app auto-resolves it via free OpenStreetMap geocoding — real airport code, region-correct flight pricing, no API keys needed. Lodging/food/transport use global tier averages; activities are a generic catalog you can swap with your own.

For maximum accuracy, add API keys (see below) — flights and lodging then come from live web search.

## Live prices (optional)

To get real-time hotel and flight prices on every estimate, copy `.env.example` to `.env.local` and add:

- `TAVILY_API_KEY` — free tier at https://tavily.com (search-as-an-LLM-tool)
- `ANTHROPIC_API_KEY` — at https://console.anthropic.com (used for Claude Haiku 4.5 to extract structured prices from snippets)

The app auto-detects whether keys are present and shows a "Live prices ✓" or "Estimated ⚡" badge accordingly. If a live call fails, it falls back to the static numbers — the UI never breaks.

## Verify

1. Open http://localhost:3000
2. Submit the default form (NYC → San Diego, 3 nights, 1 traveler, mid-tier)
3. You should see a breakdown around **$1,500–$1,700** total with categories: Flights, Lodging, Food, Transport, Activities, Misc
4. Toggle activities on/off and watch the totals update instantly
5. Click any category row to see the underlying line items

You can also hit the API directly:

```bash
curl -X POST http://localhost:3000/api/estimate \
  -H "Content-Type: application/json" \
  -d '{
    "originKey": "nyc",
    "destinationKey": "san-diego",
    "startDate": "2026-04-20",
    "nights": 3,
    "travelers": 1,
    "tier": "mid",
    "transportMode": "rideshare",
    "activityIds": ["balboa-park", "san-diego-zoo", "uss-midway", "la-jolla-cove-kayak", "sunset-cliffs"],
    "useLivePrices": false
  }'
```

## Adding a new destination

1. Drop a file at `lib/data/destinations/<key>.ts` exporting a `Destination`. Use `san-diego.ts` as a template — it's annotated with where each number comes from.
2. Register it in `lib/data/destinations/index.ts`.
3. For every origin in `lib/data/origins.ts`, add a row in `flightBasePrices` for the new destination key.

That's the only change needed — the form, results page, estimator, and live search all pick the new destination up automatically.

## Architecture

```
app/                    Next.js routes
  page.tsx              Trip input form
  trip/page.tsx         Server-rendered cost breakdown
  api/estimate/route.ts JSON estimator endpoint

components/             Client React components
  TripForm, CostBreakdown, CategoryRow, ActivityPicker, TripView

lib/                    Pure logic
  estimate.ts           Orchestrator (live → fallback)
  flights, lodging, food, transport, activities, misc.ts
  data/                 Static destination + origin data
  search/               Tavily + Haiku live-pricing layer
    tavily, extract, flights-live, lodging-live, cache.ts
```

## Out of scope

- Direct integrations with Amadeus / Skyscanner / Booking / Airbnb (live search via Tavily + Haiku is "good enough" without those API agreements)
- Booking flow — surfaces source URLs, click through to book on the provider's site
- Persistence — trip inputs live in URL params, no DB
- Multiple destinations beyond San Diego (structure ready, data not yet)
- Currencies other than USD
