import type { TripPlan, MultiCityTripPlan } from "./types";
import { isMultiCity } from "./types";

export function getComparisonText(
  plan: TripPlan | MultiCityTripPlan,
): string | null {
  const total = plan.total;
  const travelers = plan.input.travelers;
  const nights = isMultiCity(plan)
    ? (plan as MultiCityTripPlan).legs.reduce((s, l) => s + l.days.length, 0)
    : plan.input.nights;

  if (nights === 0 || travelers === 0) return null;

  const perNight = total / (nights * travelers);

  if (perNight < 80)
    return "One of the most affordable destinations you can visit";
  if (perNight < 150)
    return "Good value \u2014 below average for this region";
  if (perNight < 250) return "About average for this region";
  if (perNight < 400)
    return "On the pricier side for this destination type";
  return "A premium destination \u2014 expect higher costs across the board";
}
