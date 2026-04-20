import type { Metadata } from "next";
import Link from "next/link";
import { planAnyTrip } from "@/lib/estimate";
import { decodeTripInput, defaultStartDate } from "@/lib/url";
import { isMultiCity } from "@/lib/types";
import type { TripPlan, MultiCityTripPlan } from "@/lib/types";
import { TripPageClient } from "@/components/TripPageClient";
import { PreDepartureChecklist } from "@/components/PreDepartureChecklist";
import { PackingSuggestions } from "@/components/PackingSuggestions";
import { LocalTips } from "@/components/LocalTips";
import { TripPageShortcuts } from "@/components/TripPageShortcuts";
import { TripNotes } from "@/components/TripNotes";
import { CurrencyProvider } from "@/components/CurrencyContext";
import { fetchCityImage } from "@/lib/wikipedia-image";
import { fetchWeather, type DayWeather } from "@/lib/weather";
import { geocodeCity } from "@/lib/geocode";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

// ─── Dynamic OG metadata (Feature 3) ─────────────────────────────────

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const params = await searchParams;
  const input = decodeTripInput(params);

  if (input.legs && input.legs.length >= 2) {
    const cities = input.legs.map((l) => l.city.charAt(0).toUpperCase() + l.city.slice(1));
    const totalNights = input.legs.reduce((s, l) => s + l.nights, 0);
    return {
      title: `${cities.join(" \u2192 ")} Trip Plan - Roam`,
      description: `${totalNights} nights, ${input.travelers} travelers, ${input.style} style`,
      openGraph: {
        title: `${cities.join(" \u2192 ")} Trip - Roam`,
        description: `${totalNights} nights \u00B7 ${input.travelers} travelers \u00B7 ${input.style} style`,
        type: "website",
      },
      twitter: {
        card: "summary",
        title: `${cities.join(" \u2192 ")} Trip - Roam`,
        description: `${totalNights} nights \u00B7 ${input.travelers} travelers \u00B7 ${input.style} style`,
      },
    };
  }

  const cityName = input.city.charAt(0).toUpperCase() + input.city.slice(1);
  return {
    title: `${cityName} Trip Plan - Roam`,
    description: `${input.nights} nights, ${input.travelers} travelers, ${input.style} style`,
    openGraph: {
      title: `${cityName} Trip - Roam`,
      description: `${input.nights} nights \u00B7 ${input.travelers} travelers \u00B7 ${input.style} style`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${cityName} Trip - Roam`,
      description: `${input.nights} nights \u00B7 ${input.travelers} travelers \u00B7 ${input.style} style`,
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────

export default async function TripPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const input = decodeTripInput(params);

  let plan: TripPlan | MultiCityTripPlan;
  try {
    plan = await planAnyTrip(input);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to plan trip.";
    const isNetworkError =
      msg.toLowerCase().includes("fetch") ||
      msg.toLowerCase().includes("network") ||
      msg.toLowerCase().includes("timeout") ||
      msg.toLowerCase().includes("econnrefused");
    const cityDisplay = input.city
      ? input.city.charAt(0).toUpperCase() + input.city.slice(1)
      : "your destination";

    // Build retry URL preserving existing params
    const retryParams = new URLSearchParams();
    if (input.city) retryParams.set("city", input.city);
    if (input.nights) retryParams.set("nights", String(input.nights));
    if (input.travelers) retryParams.set("travelers", String(input.travelers));
    if (input.style) retryParams.set("style", input.style);
    const retryUrl = `/?${retryParams.toString()}`;

    return (
      <main className="mx-auto max-w-2xl px-6 py-16 text-center animate-fade-in-up">
        <div className="card-premium rounded-2xl p-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 dark:text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>

          {isNetworkError ? (
            <>
              <h2 className="text-lg font-bold text-[var(--fg)] mb-2">Connection issue</h2>
              <p className="text-sm text-[var(--muted)] leading-relaxed mb-6">
                We couldn&apos;t reach our data sources. Check your connection and try again.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-lg font-bold text-[var(--fg)] mb-2">
                Couldn&apos;t plan a trip to {cityDisplay}
              </h2>
              <p className="text-sm text-[var(--muted)] leading-relaxed mb-2">{msg}</p>
              <p className="text-sm text-[var(--muted)] leading-relaxed mb-6">
                Try one of our curated cities: Barcelona, Tokyo, Paris, Bali, or Cape Town.
              </p>
            </>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={retryUrl}
              className="btn-gold rounded-xl px-6 py-3 text-sm"
            >
              Try again
            </Link>
            <Link
              href="/"
              className="text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors duration-200"
            >
              Plan a different trip
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // For multi-city, use the first leg's destination for hero image + weather
  // For single-city, use the plan's destination
  const multi = isMultiCity(plan);
  const multiPlan = multi ? (plan as MultiCityTripPlan) : undefined;
  const singlePlan = !multi ? (plan as TripPlan) : undefined;
  const primaryDest = multiPlan ? multiPlan.legs[0].destination : (singlePlan!).destination;
  const cityShort = primaryDest.name.split(",")[0].trim();
  const startDate = plan.days[0]?.date ?? input.startDate ?? defaultStartDate();
  const geo = await geocodeCity(primaryDest.name).catch(() => null);

  const [heroImage, weather] = await Promise.all([
    fetchCityImage(cityShort).catch(() => null),
    geo
      ? fetchWeather(geo.lat, geo.lng, startDate, plan.days.length).catch(() => [])
      : Promise.resolve([] as DayWeather[]),
  ]);

  // Build a map of date -> weather for passing to day cards
  const weatherByDate: Record<string, DayWeather> = {};
  for (const w of weather) {
    weatherByDate[w.date] = w;
  }

  // Determine if destination is in the US (for Fahrenheit display)
  const isUS = geo?.countryCode === "US";

  // For currency context, use the first leg's context (multi-city) or plan context (single)
  const ctx = multiPlan
    ? (multiPlan.legs[0]?.context ?? {} as TripPlan["context"])
    : (singlePlan!).context;

  // Gather checklist items (for multi-city, merge across legs)
  const checklist = multiPlan
    ? multiPlan.legs.flatMap((lp) => lp.checklist)
    : (singlePlan!).checklist;

  // Gather tips (for multi-city, merge across legs)
  const tips = multiPlan
    ? multiPlan.legs.flatMap((lp) => lp.destination.tips ?? [])
    : (singlePlan!).destination.tips ?? [];

  // Build a TripPlan-compatible object for components that expect it
  // (for single-city this is the plan itself, for multi-city we adapt)
  const singlePlanCompat: TripPlan = multiPlan
    ? {
        id: multiPlan.id,
        input: multiPlan.input,
        destination: { ...multiPlan.legs[0].destination, tips },
        originName: multiPlan.originName,
        originAirport: multiPlan.originAirport,
        total: multiPlan.total,
        perPerson: multiPlan.perPerson,
        breakdown: multiPlan.breakdown,
        days: multiPlan.days,
        context: ctx,
        checklist,
        assumptions: multiPlan.assumptions,
        createdAt: multiPlan.createdAt,
      }
    : singlePlan!;

  return (
    <CurrencyProvider
      localRate={ctx.usdToLocal ?? null}
      localSymbol={ctx.country?.currencySymbol}
      localCode={ctx.country?.currencyCode}
    >
      <main className="mx-auto max-w-2xl px-6 py-12">
        {/* Invisible client component for keyboard shortcuts */}
        <TripPageShortcuts plan={singlePlanCompat} />

        <div className="mb-8 animate-fade-in">
          <Link
            href="/"
            className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors duration-200"
          >
            &larr; Plan another trip
          </Link>
        </div>

        {/* Client wrapper manages customized days state for save/share (Bug 2 + 5) */}
        <TripPageClient
          plan={singlePlanCompat}
          multiPlan={multiPlan}
          heroImage={heroImage}
          weatherByDate={weatherByDate}
          useFahrenheit={isUS}
        />

        {/* Local tips (for curated destinations with tips) */}
        {tips.length > 0 && (
          <div className="mt-12" style={{ animationDelay: "250ms" }}>
            <hr className="divider-gradient mb-12" />
            <div className="animate-fade-in-up" style={{ animationDelay: "250ms" }}>
              <LocalTips plan={singlePlanCompat} />
            </div>
          </div>
        )}

        {checklist.length > 0 && (
          <div className="mt-12" style={{ animationDelay: "400ms" }}>
            <div className="animate-fade-in-up" style={{ animationDelay: "400ms" }}>
              <PreDepartureChecklist plan={singlePlanCompat} />
            </div>
          </div>
        )}

        {/* Packing suggestions */}
        <div className="mt-12" style={{ animationDelay: "450ms" }}>
          <div className="animate-fade-in-up" style={{ animationDelay: "450ms" }}>
            <PackingSuggestions plan={singlePlanCompat} />
          </div>
        </div>

        {/* Trip Notes (Feature 8) */}
        <div className="mt-12" style={{ animationDelay: "500ms" }}>
          <div className="animate-fade-in-up" style={{ animationDelay: "500ms" }}>
            <TripNotes input={plan.input} />
          </div>
        </div>

        {plan.assumptions.length > 0 && (
          <details className="mt-12 card-premium rounded-2xl p-6 print-assumptions">
            <summary className="cursor-pointer text-sm font-semibold text-[var(--muted)] hover:text-[var(--fg)] transition-colors duration-200">
              Assumptions & notes
            </summary>
            <div className="mt-3 animate-fade-in space-y-4">
              {/* Data sources section */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-secondary)] mb-2">
                  Data Sources
                </h3>
                <ul className="list-inside list-disc space-y-1 text-sm text-[var(--muted)]">
                  <li>Flight prices: Regional averages (Kayak/Google Flights baseline)</li>
                  <li>Lodging: Global tier averages adjusted for destination cost of living</li>
                  <li>Activities: Wikipedia tourist attractions catalog</li>
                  <li>Weather: Open-Meteo forecast</li>
                  <li>Currency: Frankfurter ECB rates</li>
                  <li>Country info: REST Countries API</li>
                </ul>
              </div>
              {/* Assumptions */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-secondary)] mb-2">
                  Assumptions
                </h3>
                <ul className="list-inside list-disc space-y-1 text-sm text-[var(--muted)]">
                  {plan.assumptions.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            </div>
          </details>
        )}
      </main>
    </CurrencyProvider>
  );
}
