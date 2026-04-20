/**
 * localStorage-backed trip database for the My Trips dashboard.
 * Stores full TripPlan objects + an optional annual budget target.
 *
 * Client-only — all calls must be guarded with typeof window !== "undefined".
 */
import type { SavedTrip, MultiCityTripPlan, TripPlan, TripsStore } from "./types";

const STORAGE_KEY = "roam.trips.v2";

function load(): TripsStore {
  if (typeof window === "undefined") return { trips: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { trips: [] };
    return JSON.parse(raw) as TripsStore;
  } catch {
    return { trips: [] };
  }
}

function save(store: TripsStore): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* quota exceeded or private browsing */
  }
}

/** Save a trip plan (single-city or multi-city). Dedupes by plan.id — re-saving the same plan updates it. */
export function saveTrip(plan: TripPlan | MultiCityTripPlan): SavedTrip {
  const store = load();
  const existing = store.trips.findIndex((t) => t.id === plan.id);
  const status = tripStatus(plan);
  const saved: SavedTrip = {
    id: plan.id,
    plan,
    savedAt: new Date().toISOString(),
    status,
  };
  if (existing >= 0) {
    store.trips[existing] = saved;
  } else {
    store.trips.unshift(saved);
  }
  // Cap at 50 trips.
  store.trips = store.trips.slice(0, 50);
  save(store);
  return saved;
}

export function deleteTrip(id: string): void {
  const store = load();
  store.trips = store.trips.filter((t) => t.id !== id);
  save(store);
}

export function listTrips(): SavedTrip[] {
  const store = load();
  // Refresh statuses.
  for (const t of store.trips) {
    t.status = tripStatus(t.plan);
  }
  // Sort: upcoming first (by date), then past (newest first).
  return store.trips.sort((a, b) => {
    if (a.status === "upcoming" && b.status !== "upcoming") return -1;
    if (b.status === "upcoming" && a.status !== "upcoming") return 1;
    return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
  });
}

/** Total cost across all saved trips for a given year. */
export function annualTotal(year: number): number {
  const store = load();
  return store.trips
    .filter((t) => {
      const y = new Date(t.plan.createdAt).getFullYear();
      return y === year;
    })
    .reduce((s, t) => s + t.plan.total, 0);
}

export function getAnnualBudget(): number | undefined {
  return load().annualBudget;
}

export function setAnnualBudget(amount: number | undefined): void {
  const store = load();
  store.annualBudget = amount;
  save(store);
}

/** Count trips for a given year. */
export function tripCountForYear(year: number): number {
  return load().trips.filter(
    (t) => new Date(t.plan.createdAt).getFullYear() === year,
  ).length;
}

function tripStatus(plan: TripPlan | MultiCityTripPlan): SavedTrip["status"] {
  // Use the first day's date to determine if it's upcoming or past.
  if (plan.days.length === 0) return "draft";
  const startDate = plan.days[0].date;
  const today = new Date().toISOString().slice(0, 10);
  if (startDate > today) return "upcoming";
  return "past";
}
