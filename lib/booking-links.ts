import type { TripPlan, MultiCityTripPlan } from "./types";
import { isMultiCity } from "./types";

export type BookingLinks = {
  flights: string;
  lodging: string;
  activities: Record<string, string>;
};

export type MultiCityBookingLinks = {
  /** Per-leg booking links. */
  legs: {
    cityName: string;
    flights: string;
    lodging: string;
    activities: Record<string, string>;
  }[];
  /** Overall multi-city flights search. */
  flights: string;
};

export function generateBookingLinks(plan: TripPlan): BookingLinks {
  const dest = plan.destination;
  const startDate = plan.days[0]?.date ?? "";
  const endDate = plan.days[plan.days.length - 1]?.date ?? "";

  return {
    flights: buildGoogleFlightsUrl(
      plan.originAirport,
      dest.airportCode,
      startDate,
      endDate,
      plan.input.travelers,
    ),
    lodging: buildBookingUrl(
      dest.name.split(",")[0].trim(),
      startDate,
      endDate,
      plan.input.travelers,
    ),
    activities: Object.fromEntries(
      dest.activities.map((a) => [
        a.id,
        buildActivityBookingUrl(a.name, dest.name.split(",")[0].trim()),
      ]),
    ),
  };
}

export function generateMultiCityBookingLinks(
  multiPlan: MultiCityTripPlan,
): MultiCityBookingLinks {
  let dayOffset = 0;
  const legs = multiPlan.legs.map((lp) => {
    const cityName = lp.destination.name.split(",")[0].trim();
    const legDays = lp.days;
    const startDate = legDays[0]?.date ?? "";
    const endDate = legDays[legDays.length - 1]?.date ?? "";

    const legLinks = {
      cityName,
      flights: buildGoogleFlightsUrl(
        multiPlan.originAirport,
        lp.destination.airportCode,
        startDate,
        endDate,
        multiPlan.input.travelers,
      ),
      lodging: buildBookingUrl(
        cityName,
        startDate,
        endDate,
        multiPlan.input.travelers,
      ),
      activities: Object.fromEntries(
        lp.destination.activities.map((a) => [
          a.id,
          buildActivityBookingUrl(a.name, cityName),
        ]),
      ),
    };

    dayOffset += legDays.length;
    return legLinks;
  });

  // Multi-city flights: build a route query
  const cityNames = multiPlan.legs.map((l) =>
    l.destination.name.split(",")[0].trim(),
  );
  const routeQuery = `Flights from ${multiPlan.originAirport} to ${cityNames.join(" to ")} ${multiPlan.input.travelers} passengers`;

  return {
    legs,
    flights: `https://www.google.com/travel/flights?q=${encodeURIComponent(routeQuery)}`,
  };
}

/** Generate all booking links for either plan type. */
export function generateAllBookingLinks(
  plan: TripPlan | MultiCityTripPlan,
  singlePlanCompat: TripPlan,
): { single: BookingLinks; multi?: MultiCityBookingLinks } {
  const single = generateBookingLinks(singlePlanCompat);
  const multi = isMultiCity(plan)
    ? generateMultiCityBookingLinks(plan as MultiCityTripPlan)
    : undefined;
  return { single, multi };
}

function buildGoogleFlightsUrl(
  from: string,
  to: string,
  depart: string,
  ret: string,
  travelers: number,
): string {
  return `https://www.google.com/travel/flights?q=${encodeURIComponent(
    `Flights from ${from} to ${to} on ${depart} returning ${ret} ${travelers} passengers`,
  )}`;
}

function buildBookingUrl(
  city: string,
  checkin: string,
  checkout: string,
  guests: number,
): string {
  return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(
    city,
  )}&checkin=${checkin}&checkout=${checkout}&group_adults=${guests}`;
}

function buildActivityBookingUrl(
  activityName: string,
  city: string,
): string {
  return `https://www.getyourguide.com/s/?q=${encodeURIComponent(
    activityName + " " + city,
  )}`;
}
