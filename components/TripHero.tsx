"use client";

import type { MultiCityTripPlan, TripPlan } from "@/lib/types";
import type { BookingLinks } from "@/lib/booking-links";
import { AnimatedNumber } from "./AnimatedNumber";
import { useCurrency } from "./CurrencyContext";
import { findSeasonalHint } from "@/lib/data/seasonal-hints";
import { ConfidenceBadge, getConfidenceLevel } from "./ConfidenceBadge";
import { getComparisonText } from "@/lib/comparison";
import type { FlightRegion } from "@/lib/types";
import { profileSummary } from "@/lib/profile";

function formatDateRange(startDate: string, nights: number): string {
  const start = new Date(startDate + "T00:00:00Z");
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + nights);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const startStr = `${months[start.getUTCMonth()]} ${start.getUTCDate()}`;
  const endStr = `${months[end.getUTCMonth()]} ${end.getUTCDate()}, ${end.getUTCFullYear()}`;
  return `${startStr} \u2013 ${endStr}`;
}

type Props = {
  plan: TripPlan;
  multiPlan?: MultiCityTripPlan;
  heroImage?: string | null;
  bookingLinks?: BookingLinks;
};

export function TripHero({ plan, multiPlan, heroImage, bookingLinks }: Props) {
  const ctx = plan.context;
  const { fmt, showLocal, toggle } = useCurrency();
  const isMulti = !!multiPlan;

  // Compute total nights across legs (multi-city) or from single input
  const totalNights = isMulti
    ? multiPlan.legs.reduce((s, l) => s + l.days.length, 0)
    : plan.input.nights;
  // For multi-city, use the broader input nights total
  const inputNights = isMulti
    ? (multiPlan.input.legs?.reduce((s, l) => s + l.nights, 0) ?? totalNights)
    : plan.input.nights;

  const dateRange = plan.days.length > 0
    ? formatDateRange(plan.days[0].date, inputNights)
    : null;

  // Multi-city: build title with all city names joined by arrow
  const cityNames = isMulti
    ? multiPlan.legs.map((l) => l.destination.name.split(",")[0].trim())
    : [plan.destination.name.split(",")[0].trim()];

  const heroTitle = isMulti
    ? `Your ${cityNames.join(" \u2192 ")} Trip`
    : `Your ${cityNames[0]} Trip`;

  // Seasonal pricing hint (use first leg for multi-city)
  const startDate = plan.days[0]?.date ?? plan.input.startDate ?? "";
  const region = plan.destination.region as FlightRegion | undefined;
  const seasonalHint = findSeasonalHint(startDate, region, plan.destination.key);

  // Confidence level and comparison text
  const confidenceLevel = getConfidenceLevel(plan.assumptions);
  const comparisonText = getComparisonText(multiPlan ?? plan);

  // Quality indicator: rough estimates for auto-resolved destinations
  const cityShort = plan.destination.name.split(",")[0].trim();
  const isRoughEstimate = plan.assumptions.some(
    (a) =>
      a.includes("auto-resolved") ||
      a.includes("rough") ||
      a.includes("global averages"),
  );

  // Multi-city: build flight route summary
  const flightRoute = isMulti
    ? buildFlightRoute(multiPlan)
    : null;

  // Use the correct total/perPerson from multi-city plan if available
  const displayTotal = isMulti ? multiPlan.total : plan.total;
  const displayPerPerson = isMulti ? multiPlan.perPerson : plan.perPerson;

  return (
    <div className="trip-hero text-center animate-fade-in-up">
      {/* Destination hero image */}
      {heroImage && (
        <div className="relative -mx-6 -mt-6 mb-8 h-56 overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage}
            alt={cityNames[0]}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h1 className="text-3xl font-bold tracking-tight text-[var(--fg)] drop-shadow-sm">
              {heroTitle}
            </h1>
            <div className="mt-1 text-sm text-[var(--fg-secondary)]">
              Flying from {plan.originName.split("(")[0].trim()}
            </div>
          </div>
        </div>
      )}

      {/* Fallback: gradient placeholder when no hero image */}
      {!heroImage && (
        <div className="relative -mx-6 -mt-12 mb-8 h-48 overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--gold-100)] via-[var(--gold-50)] to-[var(--surface)]">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl font-bold text-[var(--gold-300)] opacity-30 select-none">
              {isMulti ? cityNames.join(" + ") : cityNames[0]}
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h1 className="text-3xl font-bold tracking-tight text-[var(--fg)] drop-shadow-sm">
              {heroTitle}
            </h1>
            <div className="mt-1 text-sm text-[var(--fg-secondary)]">
              Flying from {plan.originName.split("(")[0].trim()}
            </div>
          </div>
        </div>
      )}

      <div className={`${heroImage ? "mt-2" : "mt-5"} flex items-baseline justify-center gap-3`}>
        <span className="text-5xl font-bold text-[var(--fg)] hero-cost-hover transition-all duration-200">
          {showLocal ? (
            <span className="tabular-nums">{fmt(displayTotal)}</span>
          ) : (
            <AnimatedNumber value={displayTotal} prefix="$" />
          )}
        </span>
        <span className="text-lg text-[var(--muted)]">
          total
        </span>
        <ConfidenceBadge level={confidenceLevel} compact />
      </div>
      <div className="mt-1 text-lg text-[var(--muted)]">
        {showLocal ? (
          <span className="tabular-nums">{fmt(displayPerPerson)}/person</span>
        ) : (
          <AnimatedNumber value={displayPerPerson} prefix="$" suffix="/person" />
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <span className="chip-silver">{inputNights} nights</span>
        <span className="chip-silver">{plan.input.travelers} traveler{plan.input.travelers > 1 ? "s" : ""}</span>
        <span className="chip-gold capitalize">{plan.input.style}</span>
      </div>
      {plan.input.profile && (
        <div className="mt-2 text-sm text-[var(--accent)]">
          Personalized for: {profileSummary(plan.input.profile)}
        </div>
      )}
      {dateRange && (
        <div className="mt-2 text-sm text-[var(--muted)]">
          {dateRange}
        </div>
      )}

      {/* Comparison context */}
      {comparisonText && (
        <div className="mt-2 text-sm text-[var(--muted)]">
          {comparisonText}
        </div>
      )}

      {/* Multi-city flight route summary */}
      {flightRoute && (
        <div className="mt-3 text-sm text-[var(--muted)]">
          {flightRoute}
        </div>
      )}

      {/* Search flights link */}
      {bookingLinks && (
        <div className="mt-2">
          <a
            href={bookingLinks.flights}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors duration-200"
          >
            Search flights &rarr;
          </a>
        </div>
      )}

      {/* Currency toggle + country info */}
      {ctx.country && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-[var(--muted)]">
          <span className="chip-silver">{ctx.country.currencySymbol} {ctx.country.currencyCode}</span>
          {ctx.country.languages[0] && <span className="chip-silver">{ctx.country.languages[0]}</span>}
          {ctx.country.plugTypes[0] !== "unknown" && (
            <span className="chip-silver">Plug {ctx.country.plugTypes.join("/")}</span>
          )}
          {ctx.sun && <span className="chip-silver">{ctx.sun.sunrise}--{ctx.sun.sunset}</span>}
          {ctx.usdToLocal != null && (
            <button
              onClick={toggle}
              className="chip-silver cursor-pointer hover:border-[var(--gold-400)] transition-all duration-200"
              aria-label={`Show prices in ${showLocal ? "USD" : ctx.country.currencyCode}`}
            >
              {showLocal
                ? `Show in USD`
                : `Show in ${ctx.country.currencyCode}`}
            </button>
          )}
        </div>
      )}

      {/* Seasonal pricing hint banner */}
      {seasonalHint && (
        <div className="mt-4 mx-auto max-w-md rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 px-4 py-2.5 text-sm text-amber-800 dark:text-amber-200 animate-fade-in">
          <span className="font-medium">{seasonalHint.label}</span>
          {seasonalHint.multiplierHint > 1 && (
            <span className="text-amber-600 dark:text-amber-300">
              {" "}&mdash; prices may be {Math.round((seasonalHint.multiplierHint - 1) * 100)}% higher than average
            </span>
          )}
          {seasonalHint.multiplierHint < 1 && (
            <span className="text-emerald-600 dark:text-emerald-300">
              {" "}&mdash; prices may be {Math.round((1 - seasonalHint.multiplierHint) * 100)}% lower than average
            </span>
          )}
        </div>
      )}

      {/* Rough-estimate quality indicator for auto-resolved destinations */}
      {isRoughEstimate && (
        <div className="mt-4 mx-auto max-w-md rounded-xl border border-[var(--gold-200)] dark:border-[var(--gold-400)] bg-[var(--gold-50)] dark:bg-[var(--gold-100)] px-4 py-2.5 text-sm text-[var(--gold-700)] dark:text-[var(--gold-600)] animate-fade-in">
          <span className="inline-flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>
              Estimates for {cityShort} use regional averages — actual costs may vary &plusmn;25%
            </span>
          </span>
        </div>
      )}
    </div>
  );
}

/** Build a flight route string like "NYC -> BCN -> CDG -> NYC" */
function buildFlightRoute(multiPlan: MultiCityTripPlan): string {
  const originCode = multiPlan.originAirport;
  const legCodes = multiPlan.legs.map((l) => l.destination.airportCode);
  const route = [originCode, ...legCodes, originCode].join(" \u2192 ");
  return route;
}
