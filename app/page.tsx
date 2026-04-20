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

// ─── Component ────────────────────────────────────────────────────────

export default function Home() {
  return (
    <Suspense>
      <HomeInner />
    </Suspense>
  );
}

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
  // Avoid hydration mismatch: defaultStartDate() uses new Date() which differs
  // between server and client. Initialize empty, then set after mount.
  const [startDate, setStartDate] = useState("");
  const [origin, setOrigin] = useState("nyc");
  const [mounted, setMounted] = useState(false);
  // Today's date string for the date input min attribute (also deferred to avoid mismatch)
  const [todayStr, setTodayStr] = useState("");

  // Multi-city legs state.
  const [legs, setLegs] = useState<LegInput[]>([]);
  // Profile modal state.
  const [showProfile, setShowProfile] = useState(false);
  const [profileExists, setProfileExists] = useState(true); // assume true to avoid flash

  // Auto-detect origin from timezone + set date-dependent values on mount
  useEffect(() => {
    setMounted(true);
    setOrigin(detectOriginFromTimezone());
    setStartDate(defaultStartDate());
    setTodayStr(new Date().toISOString().slice(0, 10));
    setProfileExists(checkHasProfile());
  }, []);

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

      // Trigger exit animation, then navigate
      mainRef.current?.classList.add("animate-fade-out-down");
      setTimeout(() => {
        router.push(url);
      }, 200);
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
    <main ref={mainRef} className="mx-auto max-w-xl px-6 py-8 pb-16">
      <div className="text-center mb-8 animate-fade-in-up" style={{ animationDelay: "0ms" }}>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gradient-gold">
          Where to next?
        </h1>
        <p className="mt-4 text-[var(--muted)] text-base leading-relaxed">
          Type a city, set your style, and get a complete trip plan with
          budget and day-by-day itinerary.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-6">
        {/* ─── Single-city mode: top-level city + nights ─── */}
        {!isMultiCity && (
          <>
            <div className="card-premium rounded-2xl p-5 animate-fade-in-up" style={{ animationDelay: "50ms" }}>
              <label className="mb-2 block text-sm font-medium text-[var(--muted)]">
                Where are you going?
              </label>
              <CityInput value={city} onChange={setCity} autoFocus />
            </div>

            <div className="card-premium rounded-2xl p-5 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              <label htmlFor="start-date" className="mb-2 block text-sm font-medium text-[var(--muted)]">
                When?
              </label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={todayStr || undefined}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-base text-[var(--fg)] placeholder:text-[var(--muted)] focus-ring transition-all duration-200 hover:border-[var(--gold-300)]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
              <div className="card-premium rounded-2xl p-5">
                <label className="mb-2 block text-sm font-medium text-[var(--muted)]">
                  Nights
                </label>
                <NightsStepper value={nights} onChange={setNights} />
              </div>
              <div className="card-premium rounded-2xl p-5">
                <label className="mb-2 block text-sm font-medium text-[var(--muted)]">
                  Travelers
                </label>
                <TravelersStepper value={travelers} onChange={setTravelers} />
              </div>
            </div>
          </>
        )}

        {/* ─── Multi-city mode: leg cards ─── */}
        {isMultiCity && (
          <>
            <div className="card-premium rounded-2xl p-5">
              <label htmlFor="start-date-mc" className="mb-2 block text-sm font-medium text-[var(--muted)]">
                When does your trip start?
              </label>
              <input
                id="start-date-mc"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={todayStr || undefined}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-base text-[var(--fg)] placeholder:text-[var(--muted)] focus-ring transition-all duration-200 hover:border-[var(--gold-300)]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="card-premium rounded-2xl p-5">
                <label className="mb-2 block text-sm font-medium text-[var(--muted)]">
                  Travelers
                </label>
                <TravelersStepper value={travelers} onChange={setTravelers} />
              </div>
              <div className="card-premium rounded-2xl p-5">
                <label className="mb-2 block text-sm font-medium text-[var(--muted)]">
                  Total nights
                </label>
                <div className="flex items-center justify-center">
                  <div className="text-2xl font-bold tabular-nums text-[var(--fg)]" aria-live="polite">
                    {legs.reduce((s, l) => s + l.nights, 0)}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {legs.map((leg, i) => (
                <LegCard
                  key={i}
                  leg={leg}
                  index={i}
                  totalLegs={legs.length}
                  tripStyle={style}
                  startDate={startDate}
                  allLegs={legs}
                  onUpdate={(patch) => updateLeg(i, patch)}
                  onRemove={() => handleRemoveLeg(i)}
                />
              ))}
            </div>
          </>
        )}

        {/* ─── Add another city button ─── */}
        <button
          type="button"
          onClick={handleAddCity}
          className="w-full border border-dashed border-[var(--border)] rounded-2xl p-4 text-center text-sm font-medium text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--gold-300)] transition-all duration-200"
        >
          + Add another city
        </button>

        <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <label className="mb-2 block text-sm font-medium text-[var(--muted)]">
            Trip style
          </label>
          <StylePicker value={style} onChange={setStyle} />
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: "250ms" }}>
          <button
            type="submit"
            disabled={!canSubmit}
            className={`btn-gold w-full rounded-xl px-6 py-4 text-lg ${canSubmit ? "btn-gold-ready" : ""}`}
          >
            {isMultiCity ? "Plan my multi-city trip" : "Plan my trip"} &rarr;
          </button>

          <p className="mt-4 text-center text-xs text-[var(--muted)]">
            <kbd className="rounded border border-[var(--border)] bg-[var(--surface)] px-1.5 py-0.5 text-[10px] font-mono">
              {mounted && typeof navigator !== "undefined" && /Mac/.test(navigator.userAgent) ? "\u2318" : "Ctrl"}+Enter
            </kbd>{" "}
            to submit
          </p>
        </div>
      </form>

      {/* Profile banner: shown when no profile exists yet */}
      {mounted && !profileExists && (
        <div className="mt-8 animate-fade-in">
          <button
            type="button"
            onClick={() => setShowProfile(true)}
            className="w-full rounded-2xl border-l-[3px] border-l-[var(--gold-400)] bg-[var(--surface)] p-5 text-left shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--gold-400)] to-[var(--gold-500)] text-lg text-white">
                ✨
              </div>
              <div>
                <div className="font-semibold text-[var(--fg)]">
                  Personalize your trips
                </div>
                <div className="text-sm text-[var(--muted)]">
                  Tell Roam your travel style and every itinerary will be tailored to you.
                </div>
              </div>
            </div>
          </button>
        </div>
      )}

      <RecentTrips />

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
        className="flex h-11 w-11 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-lg font-bold text-[var(--fg)] hover:bg-[var(--surface-hover)] hover:border-[var(--gold-300)] focus-ring transition-all duration-200"
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
        className="flex h-11 w-11 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-lg font-bold text-[var(--fg)] hover:bg-[var(--surface-hover)] hover:border-[var(--gold-300)] focus-ring transition-all duration-200"
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
        className="flex h-11 w-11 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-lg font-bold text-[var(--fg)] hover:bg-[var(--surface-hover)] hover:border-[var(--gold-300)] focus-ring transition-all duration-200"
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
        className="flex h-11 w-11 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-lg font-bold text-[var(--fg)] hover:bg-[var(--surface-hover)] hover:border-[var(--gold-300)] focus-ring transition-all duration-200"
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
    <div className="card-premium rounded-2xl p-5 relative animate-fade-in">
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
        <span className="inline-flex h-6 items-center rounded-lg bg-gradient-to-br from-[var(--gold-400)] to-[var(--gold-500)] px-2.5 text-[11px] font-semibold uppercase tracking-wider text-white">
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
