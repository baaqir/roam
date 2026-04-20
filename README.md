# Roam

AI-powered travel planner that builds detailed, day-by-day itineraries with honest cost estimates. Enter a destination, pick your style, and get a complete trip plan in seconds -- no account required.

**Live demo:** [roam-dusky.vercel.app](https://roam-dusky.vercel.app)

---

## Features

- **Instant itineraries** -- day-by-day plans with activities, meals, and transport auto-scheduled by time of day
- **Honest cost estimates** -- every number shows its assumptions; tap any budget row to see the breakdown
- **18 curated cities** with hand-picked activities, neighborhood dining tips, and real lodging data
- **Any city worldwide** -- type any destination and it auto-resolves via OpenStreetMap with region-correct pricing
- **Multi-city trips** -- plan multi-leg itineraries with per-city budgets and connecting flights
- **3 travel styles** -- budget, comfort, and luxury with style-specific lodging, food, and activity tiers
- **Group cost splitting** -- 1-10 travelers with per-person breakdowns
- **Editable plans** -- drag activities between days, add/remove items, customize your itinerary
- **Save and share** -- trips persist in localStorage; share via URL
- **Traveler profiles** -- pace, dietary needs, interests, and kid-friendly preferences shape the plan
- **Live prices** (optional) -- real-time flight and hotel prices via Tavily + Claude Haiku when API keys are set
- **Currency conversion** -- view costs in local currency with live exchange rates
- **Dark mode** -- warm gold-on-dark theme, auto-detected or manual toggle
- **Booking links** -- one-click search on Google Flights, Booking.com, and GetYourGuide

## Quick Start

```bash
npm install
npm run dev
# open http://localhost:3000
```

The app works fully offline with static data. No API keys needed for the core experience.

## Live Prices (Optional)

For real-time hotel and flight pricing, create `.env.local` from `.env.example` and add:

- `TAVILY_API_KEY` -- free tier at [tavily.com](https://tavily.com)
- `ANTHROPIC_API_KEY` -- at [console.anthropic.com](https://console.anthropic.com)

The app auto-detects keys and shows a confidence badge accordingly. If a live call fails, it falls back to static estimates -- the UI never breaks.

## How It Works

1. **You pick** a destination, dates, travel style, and number of travelers
2. **Roam resolves** the city (curated data or auto-geocoded), calculates flights, lodging, food, transport, and activities
3. **The planner** distributes activities across days by time-of-day preference (outdoor mornings, culture afternoons, nightlife evenings) and inserts neighborhood-aware meals
4. **You customize** -- swap activities, move items between days, adjust your style
5. **The budget** updates instantly with transparent per-category breakdowns and confidence ranges

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with a custom warm-gold design system
- **Data**: 18 curated cities, 150+ country airports, visa rules, seasonal pricing
- **Free APIs**: OpenStreetMap Nominatim, Wikipedia, REST Countries, sunrise-sunset.org, Frankfurter
- **Optional APIs**: Tavily (web search) + Claude Haiku (extraction) for live pricing

## Adding a New Destination

1. Create `lib/data/destinations/<key>.ts` exporting a `Destination` (use `san-diego.ts` as a template)
2. Register it in `lib/data/destinations/index.ts`
3. Add flight pricing rows in `lib/data/origins.ts` for each origin airport

The form, results page, and estimator pick up the new destination automatically.

## Project Structure

```
app/                    Next.js routes
  page.tsx              Trip input form
  trip/page.tsx         Server-rendered results
  api/estimate/         JSON estimator endpoint

components/             Client React components
  TripForm, TripHero, BudgetBreakdown, EditableItinerary, DayItem

lib/                    Pure logic
  estimate.ts           Cost orchestrator (live + fallback)
  plan.ts               Day-by-day itinerary builder
  data/                 Static destination, origin, and pricing data
  search/               Tavily + Haiku live-pricing layer
```

## Screenshots

_Coming soon._

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes and run `npx tsc --noEmit` to check types
4. Submit a pull request

## License

MIT
