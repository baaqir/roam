"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CityInput } from "@/components/CityInput";
import { StylePicker } from "@/components/StylePicker";
import { RecentTrips } from "@/components/RecentTrips";
import { ProfileSetup } from "@/components/ProfileSetup";
import { useKeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { encodeTripInput, defaultStartDate } from "@/lib/url";
import { getProfile, hasProfile as checkHasProfile } from "@/lib/profile";
import type { Style, TripLeg } from "@/lib/types";

// ─── Timezone → Origin mapping ────────────────────────────────────────

const TIMEZONE_ORIGIN_MAP: Record<string, string> = {
  "America/New_York": "nyc",
  "America/Boston": "nyc",
  "America/Detroit": "nyc",
  "America/Indiana/Indianapolis": "nyc",
  "America/Toronto": "nyc",
  "America/Chicago": "ord",
  "America/Winnipeg": "ord",
  "America/Indiana/Knox": "ord",
  "America/Los_Angeles": "lax",
  "America/San_Francisco": "lax",
  "America/Tijuana": "lax",
  "America/Vancouver": "sea",
  "America/Denver": "ord",
  "America/Phoenix": "ord",
  "America/Boise": "ord",
  "America/Anchorage": "sea",
  "America/Juneau": "sea",
  "Pacific/Honolulu": "sea",
};

function detectOriginFromTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!tz) return "nyc";

    // Direct match
    if (TIMEZONE_ORIGIN_MAP[tz]) return TIMEZONE_ORIGIN_MAP[tz];

    // Region-based fallback
    if (tz.startsWith("America/")) return "nyc";
    if (tz.startsWith("Pacific/")) return "sea";
    if (tz.startsWith("Europe/")) {
      // Auto-resolve to the user's city for European origins
      const city = tz.split("/")[1]?.replace(/_/g, " ");
      return city || "nyc";
    }
    if (tz.startsWith("Asia/")) {
      const city = tz.split("/")[1]?.replace(/_/g, " ");
      return city || "nyc";
    }
    if (tz.startsWith("Africa/")) {
      const city = tz.split("/")[1]?.replace(/_/g, " ");
      return city || "nyc";
    }
    if (tz.startsWith("Australia/")) {
      const city = tz.split("/")[1]?.replace(/_/g, " ");
      return city || "nyc";
    }

    return "nyc";
  } catch {
    return "nyc";
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────

/** Compute the date for a given leg based on startDate + cumulative nights. */
function legDateRange(
  startDate: string,
  legs: LegInput[],
  legIndex: number,
): string {
  if (!startDate) return "";
  const start = new Date(startDate + "T00:00:00Z");
  let offset = 0;
  for (let i = 0; i < legIndex; i++) {
    offset += legs[i].nights;
  }
  const legStart = new Date(start);
  legStart.setUTCDate(legStart.getUTCDate() + offset);
  const legEnd = new Date(legStart);
  legEnd.setUTCDate(legEnd.getUTCDate() + legs[legIndex].nights);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[legStart.getUTCMonth()]} ${legStart.getUTCDate()} \u2013 ${months[legEnd.getUTCMonth()]} ${legEnd.getUTCDate()}`;
}

type LegInput = { city: string; nights: number; style?: Style };

function addDaysISO(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// ─── Component ────────────────────────────────────────────────────────

export default function Home() {
  return (
    <Suspense>
      <HomeInner />
    </Suspense>
  );
}

// ─── Hero image cities ─────────────────────────────────────────────
const HERO_CITIES = ["Barcelona", "Tokyo", "Paris", "Bali", "New York City", "Rome", "Santorini"];
const TRENDING = ["Barcelona", "Tokyo", "Nashville", "Bali", "Paris", "New Orleans", "Rome", "Lisbon"];

function HomeInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pre-fill from URL params (Feature 7: "Plan similar trip")
  const [city, setCity] = useState(() => searchParams.get("city") || "");
  const [nights, setNights] = useState(() => {
    const n = parseInt(searchParams.get("nights") || "", 10);
    return Number.isNaN(n) ? 5 : Math.max(1, Math.min(30, n));
  });
  const [travelers, setTravelers] = useState(() => {
    const t = parseInt(searchParams.get("travelers") || "", 10);
    return Number.isNaN(t) ? 2 : Math.max(1, Math.min(8, t));
  });
  const [style, setStyle] = useState<Style>("comfort");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [origin, setOrigin] = useState("nyc");
  const [mounted, setMounted] = useState(false);
  const [todayStr, setTodayStr] = useState("");

  // Hero image state for left panel
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [heroCity, setHeroCity] = useState("");

  // Multi-city legs state.
  const [legs, setLegs] = useState<LegInput[]>([]);
  // Profile modal state.
  const [showProfile, setShowProfile] = useState(false);
  const [profileExists, setProfileExists] = useState(true); // assume true to avoid flash

  // Auto-detect origin + set default dates on mount
  useEffect(() => {
    setMounted(true);
    setOrigin(detectOriginFromTimezone());
    const start = defaultStartDate();
    setStartDate(start);
    setEndDate(addDaysISO(start, 5)); // default 5 nights
    setTodayStr(new Date().toISOString().slice(0, 10));
    setProfileExists(checkHasProfile());
  }, []);

  // Fetch hero image for the left panel (once on mount)
  useEffect(() => {
    const selectedCity = HERO_CITIES[Math.floor(Math.random() * HERO_CITIES.length)];
    setHeroCity(selectedCity);
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(selectedCity)}`, {
      headers: { "User-Agent": "Roam/0.1" },
    })
      .then((r) => r.json())
      .then((d) => setHeroImage(d.originalimage?.source ?? d.thumbnail?.source ?? null))
      .catch(() => null);
  }, []);

  // Compute nights from the two dates
  const computedNights = (() => {
    if (!startDate || !endDate) return nights;
    const s = new Date(startDate + "T00:00:00Z");
    const e = new Date(endDate + "T00:00:00Z");
    const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  })();

  // Keep nights in sync with computed value
  useEffect(() => {
    if (computedNights !== nights) setNights(computedNights);
  }, [computedNights]);

  // When start date changes, push end date forward to maintain nights
  function handleStartDateChange(newStart: string) {
    setStartDate(newStart);
    if (newStart) {
      setEndDate(addDaysISO(newStart, nights));
    }
  }

  // When end date changes, just let computedNights recalculate
  function handleEndDateChange(newEnd: string) {
    setEndDate(newEnd);
  }

  const mainRef = useRef<HTMLElement>(null);

  const isMultiCity = legs.length >= 2;

  // Determine if we can submit
  const canSubmit = isMultiCity
    ? legs.every((l) => l.city.trim())
    : !!city.trim();

  const submit = useCallback(
    (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      const profile = getProfile() ?? undefined;

      let url: string;
      if (isMultiCity) {
        if (!legs.every((l) => l.city.trim())) return;
        const tripLegs: TripLeg[] = legs.map((l) => ({
          city: l.city.trim(),
          nights: l.nights,
          style: l.style && l.style !== style ? l.style : undefined,
        }));
        const params = encodeTripInput({
          city: tripLegs[0].city,
          nights: tripLegs[0].nights,
          travelers,
          style,
          startDate,
          origin,
          legs: tripLegs,
          profile,
        });
        url = `/trip?${params.toString()}`;
      } else {
        if (!city.trim()) return;
        const params = encodeTripInput({
          city: city.trim(),
          nights,
          travelers,
          style,
          startDate,
          origin,
          profile,
        });
        url = `/trip?${params.toString()}`;
      }

      router.push(url);
    },
    [city, nights, travelers, style, startDate, origin, router, legs, isMultiCity],
  );

  /** Add another city: transition from single to multi-city on first add. */
  function handleAddCity() {
    if (legs.length === 0) {
      // Move current top-level city/nights into legs[0], add empty legs[1]
      setLegs([
        { city: city, nights: nights },
        { city: "", nights: 3 },
      ]);
    } else {
      // Already multi-city, add another leg
      setLegs((prev) => [...prev, { city: "", nights: 3 }]);
    }
  }

  /** Remove a leg. If only 1 remains, collapse back to single-city. */
  function handleRemoveLeg(index: number) {
    const next = legs.filter((_, i) => i !== index);
    if (next.length <= 1) {
      // Collapse back to single-city mode
      if (next.length === 1) {
        setCity(next[0].city);
        setNights(next[0].nights);
      }
      setLegs([]);
    } else {
      setLegs(next);
    }
  }

  function updateLeg(index: number, patch: Partial<LegInput>) {
    setLegs((prev) =>
      prev.map((l, i) => (i === index ? { ...l, ...patch } : l)),
    );
  }

  // Keyboard shortcut: Cmd+Enter → submit
  const shortcuts = useMemo(
    () => [
      {
        key: "Enter",
        cmdOrCtrl: true,
        handler: () => submit(),
      },
    ],
    [submit],
  );
  useKeyboardShortcuts(shortcuts);

  return (
    <main ref={mainRef}>
      {/* ─── Split-screen hero ─── */}
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left: Image + trending destinations */}
        <div className="relative lg:w-1/2 h-64 lg:h-auto overflow-hidden bg-[var(--brown-200)]">
          {heroImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={heroImage}
              alt={heroCity}
              className="absolute inset-0 w-full h-full object-cover animate-slow-zoom"
            />
          )}
          {!heroImage && (
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--terracotta)] via-[var(--brown-600)] to-[var(--brown-800)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          {/* Current hero city label */}
          {heroCity && (
            <div className="absolute top-6 left-6 lg:top-8 lg:left-8">
              <p className="text-white/50 text-[10px] uppercase tracking-widest">Featured</p>
              <p
                className="text-white text-2xl lg:text-3xl font-bold italic mt-0.5"
                style={{ fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)" }}
              >
                {heroCity}
              </p>
            </div>
          )}
          {/* Trending destinations */}
          <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
            <div className="flex flex-wrap gap-1.5">
              {TRENDING.map((trendCity) => (
                <button
                  key={trendCity}
                  type="button"
                  onClick={() => setCity(trendCity)}
                  className="rounded-full bg-white/10 backdrop-blur-sm border border-white/15 px-3 py-1 text-xs text-white/80 hover:bg-white/20 hover:text-white transition-all duration-200"
                >
                  {trendCity}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="lg:w-1/2 flex items-center justify-center px-6 py-8 lg:px-12 lg:py-0">
          <div className="w-full max-w-md">
            <div className="mb-5">
              <h1
                className="text-3xl lg:text-4xl font-bold tracking-tight italic text-[var(--fg)]"
                style={{ fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)" }}
              >
                Where to next?
              </h1>
              <p className="mt-2 text-[var(--muted)] text-sm">
                Any city. Personalized itinerary. Cost estimate.
              </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
              {/* ─── Single-city mode ─── */}
              {!isMultiCity && (
                <>
                  <div>
                    <CityInput value={city} onChange={setCity} autoFocus />
                  </div>

                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <label htmlFor="start-date" className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                        From
                      </label>
                      <input
                        id="start-date"
                        type="date"
                        value={startDate}
                        onChange={(e) => handleStartDateChange(e.target.value)}
                        min={todayStr || undefined}
                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg)] focus-ring transition-all duration-200"
                      />
                    </div>
                    <span className="pb-2 text-[var(--muted)] text-xs">→</span>
                    <div className="flex-1">
                      <label htmlFor="end-date" className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                        To
                      </label>
                      <input
                        id="end-date"
                        type="date"
                        value={endDate}
                        onChange={(e) => handleEndDateChange(e.target.value)}
                        min={startDate || todayStr || undefined}
                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg)] focus-ring transition-all duration-200"
                      />
                    </div>
                    {startDate && endDate && computedNights > 0 && (
                      <div className="pb-2 text-sm font-medium text-[var(--accent)] whitespace-nowrap tabular-nums">
                        {computedNights}n
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                      Travelers
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setTravelers((n: number) => Math.max(1, n - 1))}
                        aria-label="Decrease travelers"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm font-bold text-[var(--fg)] hover:border-[var(--accent)] transition-all duration-200"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-lg font-bold tabular-nums text-[var(--fg)]">
                        {travelers}
                      </span>
                      <button
                        type="button"
                        onClick={() => setTravelers((n: number) => Math.min(8, n + 1))}
                        aria-label="Increase travelers"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm font-bold text-[var(--fg)] hover:border-[var(--accent)] transition-all duration-200"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* ─── Multi-city mode: compact rows ─── */}
              {isMultiCity && (
                <>
                  <div className="space-y-2">
                    {legs.map((leg, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-[var(--accent)] w-4 flex-shrink-0">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <CityInput value={leg.city} onChange={(v) => updateLeg(i, { city: v })} />
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button type="button" onClick={() => updateLeg(i, { nights: Math.max(1, leg.nights - 1) })} className="h-7 w-7 rounded border border-[var(--border)] bg-[var(--surface)] text-xs font-bold text-[var(--fg)] hover:border-[var(--accent)] transition-all">−</button>
                          <span className="w-5 text-center text-sm font-bold tabular-nums text-[var(--fg)]">{leg.nights}</span>
                          <button type="button" onClick={() => updateLeg(i, { nights: Math.min(30, leg.nights + 1) })} className="h-7 w-7 rounded border border-[var(--border)] bg-[var(--surface)] text-xs font-bold text-[var(--fg)] hover:border-[var(--accent)] transition-all">+</button>
                          <span className="text-[10px] text-[var(--muted)]">n</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveLeg(i)}
                          className="flex-shrink-0 text-[var(--muted)] hover:text-red-500 transition-colors text-xs"
                          aria-label={`Remove stop ${i + 1}`}
                        >×</button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setLegs((prev) => [...prev, { city: "", nights: 3 }])}
                      className="w-full text-center text-xs text-[var(--muted)] hover:text-[var(--accent)] py-1 transition-colors"
                    >
                      + Add another stop
                    </button>
                  </div>

                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <label htmlFor="start-date-mc" className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">From</label>
                      <input id="start-date-mc" type="date" value={startDate} onChange={(e) => handleStartDateChange(e.target.value)} min={todayStr || undefined} className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg)] focus-ring transition-all duration-200" />
                    </div>
                    <span className="pb-2 text-[var(--muted)] text-xs">→</span>
                    <div className="flex-1">
                      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">Return</label>
                      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-hover)] px-3 py-2 text-sm text-[var(--muted)] tabular-nums">
                        {startDate ? addDaysISO(startDate, legs.reduce((s, l) => s + l.nights, 0)) : "—"}
                      </div>
                    </div>
                    <div className="pb-2 text-sm font-medium text-[var(--accent)] whitespace-nowrap tabular-nums">
                      {legs.reduce((s, l) => s + l.nights, 0)}n
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">Travelers</label>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setTravelers((n: number) => Math.max(1, n - 1))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm font-bold text-[var(--fg)] hover:border-[var(--accent)] transition-all duration-200">−</button>
                      <span className="w-6 text-center text-lg font-bold tabular-nums text-[var(--fg)]">{travelers}</span>
                      <button type="button" onClick={() => setTravelers((n: number) => Math.min(8, n + 1))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm font-bold text-[var(--fg)] hover:border-[var(--accent)] transition-all duration-200">+</button>
                    </div>
                  </div>
                </>
              )}

              <StylePicker value={style} onChange={setStyle} />

              <button
                type="submit"
                disabled={!canSubmit}
                className="btn-primary w-full rounded-xl px-6 py-3 text-base"
              >
                {isMultiCity ? "Plan multi-city trip" : "Plan my trip"} →
              </button>

              <div className="flex items-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={handleAddCity}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] py-2 text-xs font-medium text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all duration-200"
                >
                  <span>🌍</span>
                  <span>Add more cities</span>
                </button>
                {mounted && !profileExists && (
                  <button
                    type="button"
                    onClick={() => setShowProfile(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] py-2 text-xs font-medium text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all duration-200"
                  >
                    <span>✦</span>
                    <span>Set travel style</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Profile modal — only shows when explicitly opened */}
      {showProfile && (
        <ProfileSetup
          asSettings
          onClose={() => {
            setShowProfile(false);
            setProfileExists(checkHasProfile());
          }}
        />
      )}
    </main>
  );
}

// ─── Reusable stepper components ─────────────────────────────────────

function NightsStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [bouncing, setBouncing] = useState(false);

  function handleChange(newVal: number) {
    onChange(newVal);
    setBouncing(true);
    setTimeout(() => setBouncing(false), 200);
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => handleChange(Math.max(1, value - 1))}
        aria-label="Decrease nights"
        className="flex h-11 w-11 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-lg font-bold text-[var(--fg)] hover:bg-[var(--surface-hover)] hover:border-[var(--accent)] focus-ring transition-all duration-200"
      >
        -
      </button>
      <div
        className={`flex-1 text-center text-2xl font-bold tabular-nums text-[var(--fg)] ${bouncing ? "animate-stepper-bounce" : ""}`}
        aria-live="polite"
      >
        {value}
      </div>
      <button
        type="button"
        onClick={() => handleChange(Math.min(30, value + 1))}
        aria-label="Increase nights"
        className="flex h-11 w-11 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-lg font-bold text-[var(--fg)] hover:bg-[var(--surface-hover)] hover:border-[var(--accent)] focus-ring transition-all duration-200"
      >
        +
      </button>
    </div>
  );
}

function TravelersStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (fn: (prev: number) => number) => void;
}) {
  const [bouncing, setBouncing] = useState(false);

  function handleChange(fn: (prev: number) => number) {
    onChange(fn);
    setBouncing(true);
    setTimeout(() => setBouncing(false), 200);
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => handleChange((n) => Math.max(1, n - 1))}
        aria-label="Decrease travelers"
        className="flex h-11 w-11 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-lg font-bold text-[var(--fg)] hover:bg-[var(--surface-hover)] hover:border-[var(--accent)] focus-ring transition-all duration-200"
      >
        -
      </button>
      <div
        className={`flex-1 text-center text-2xl font-bold tabular-nums text-[var(--fg)] ${bouncing ? "animate-stepper-bounce" : ""}`}
        aria-live="polite"
      >
        {value}
      </div>
      <button
        type="button"
        onClick={() => handleChange((n) => Math.min(8, n + 1))}
        aria-label="Increase travelers"
        className="flex h-11 w-11 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-lg font-bold text-[var(--fg)] hover:bg-[var(--surface-hover)] hover:border-[var(--accent)] focus-ring transition-all duration-200"
      >
        +
      </button>
    </div>
  );
}

// ─── Leg card component ──────────────────────────────────────────────

function LegCard({
  leg,
  index,
  totalLegs,
  tripStyle,
  startDate,
  allLegs,
  onUpdate,
  onRemove,
}: {
  leg: LegInput;
  index: number;
  totalLegs: number;
  tripStyle: Style;
  startDate: string;
  allLegs: LegInput[];
  onUpdate: (patch: Partial<LegInput>) => void;
  onRemove: () => void;
}) {
  const [showStyleOverride, setShowStyleOverride] = useState(!!leg.style);
  const dateRange = startDate ? legDateRange(startDate, allLegs, index) : "";

  return (
    <div className="card-editorial rounded-2xl p-6 relative animate-fade-in">
      {/* Remove button */}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove stop ${index + 1}`}
        className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-lg text-[var(--muted)] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all duration-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Gold numbered badge + date range */}
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex h-6 items-center rounded-lg bg-[var(--accent)] px-2.5 text-[11px] font-semibold uppercase tracking-wider text-white">
          Stop {index + 1}
        </span>
        {dateRange && (
          <span className="text-xs text-[var(--muted)]">{dateRange}</span>
        )}
      </div>

      {/* City input */}
      <div className="mb-3">
        <label className="mb-1.5 block text-sm font-medium text-[var(--muted)]">
          City
        </label>
        <CityInput value={leg.city} onChange={(v) => onUpdate({ city: v })} />
      </div>

      {/* Nights stepper */}
      <div className="mb-2">
        <label className="mb-1.5 block text-sm font-medium text-[var(--muted)]">
          Nights
        </label>
        <NightsStepper
          value={leg.nights}
          onChange={(v) => onUpdate({ nights: v })}
        />
      </div>

      {/* Optional style override */}
      {!showStyleOverride ? (
        <button
          type="button"
          onClick={() => setShowStyleOverride(true)}
          className="mt-2 text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors duration-200"
        >
          Customize style for this stop
        </button>
      ) : (
        <div className="mt-3 animate-fade-in">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-[var(--muted)]">
              Style override
            </label>
            <button
              type="button"
              onClick={() => {
                onUpdate({ style: undefined });
                setShowStyleOverride(false);
              }}
              className="text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors duration-200"
            >
              Reset to trip default
            </button>
          </div>
          <StylePicker
            value={leg.style ?? tripStyle}
            onChange={(s) => onUpdate({ style: s === tripStyle ? undefined : s })}
          />
        </div>
      )}
    </div>
  );
}
