"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  type TravelerProfile,
  type TravelInterest,
  INTEREST_META,
  getProfile,
  saveProfile,
  hasProfile,
} from "@/lib/profile";

type Props = {
  /** When true, always show as a settings modal (not first-visit). */
  asSettings?: boolean;
  onClose?: () => void;
};

const ALL_INTERESTS: TravelInterest[] = [
  "foodie",
  "adventure",
  "culture",
  "nightlife",
  "relaxation",
  "photography",
  "family",
  "shopping",
  "nature",
];

const DIETARY_OPTIONS: { value: NonNullable<TravelerProfile["dietary"]>[number]; label: string }[] = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "halal", label: "Halal" },
  { value: "kosher", label: "Kosher" },
  { value: "gluten-free", label: "Gluten-free" },
];

export function ProfileSetup({ asSettings, onClose }: Props) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(1);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Form state
  const [interests, setInterests] = useState<TravelInterest[]>([]);
  const [pace, setPace] = useState<TravelerProfile["pace"]>("moderate");
  const [withKids, setWithKids] = useState(false);
  const [dietary, setDietary] = useState<NonNullable<TravelerProfile["dietary"]>>([]);
  const [budgetSensitivity, setBudgetSensitivity] =
    useState<TravelerProfile["budgetSensitivity"]>("moderate");

  // On mount: only auto-show when opened as settings (from nav).
  // For first-visit, we show a non-blocking banner instead (see ProfileBanner below).
  useEffect(() => {
    if (asSettings) {
      const existing = getProfile();
      if (existing) {
        setInterests(existing.interests);
        setPace(existing.pace);
        setWithKids(existing.withKids ?? false);
        setDietary(existing.dietary ?? []);
        setBudgetSensitivity(existing.budgetSensitivity);
      }
      setVisible(true);
    }
  }, [asSettings]);

  // Keyboard: Escape to close
  useEffect(() => {
    if (!visible) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
      // Focus trap
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // No body scroll lock — the overlay handles isolation.
  // Locking body scroll caused mobile users to get stuck (couldn't scroll the modal).

  const handleClose = useCallback(() => {
    setVisible(false);
    onClose?.();
  }, [onClose]);

  const toggleInterest = useCallback((interest: TravelInterest) => {
    setInterests((prev) => {
      if (prev.includes(interest)) {
        return prev.filter((i) => i !== interest);
      }
      if (prev.length >= 3) return prev; // max 3
      return [...prev, interest];
    });
  }, []);

  const toggleDietary = useCallback(
    (val: NonNullable<TravelerProfile["dietary"]>[number]) => {
      setDietary((prev) =>
        prev.includes(val)
          ? prev.filter((d) => d !== val)
          : [...prev, val],
      );
    },
    [],
  );

  const handleSave = useCallback(() => {
    const profile: TravelerProfile = {
      interests,
      pace,
      withKids: withKids || undefined,
      dietary: dietary.length > 0 ? dietary : undefined,
      budgetSensitivity,
    };
    saveProfile(profile);
    handleClose();
  }, [interests, pace, withKids, dietary, budgetSensitivity, handleClose]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-fade-in overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="flex min-h-full items-start justify-center p-4 py-8 sm:py-12">
        <div
          ref={dialogRef}
          className="card-premium rounded-2xl p-6 w-full max-w-lg animate-scale-in"
          role="dialog"
          aria-modal="true"
          aria-label="Travel preferences"
        >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--fg)]">
              {asSettings ? "Your Preferences" : "Welcome to Roam"}
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {asSettings
                ? "Update your travel style."
                : "Tell us how you travel so we can tailor every trip."}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-[var(--muted)] hover:text-[var(--fg)] transition-colors duration-200 p-1 rounded-lg hover:bg-[var(--surface-hover)]"
            aria-label="Close"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M2 2l14 14M16 2L2 16" />
            </svg>
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-all duration-200 ${
                s <= step
                  ? "bg-[var(--accent)]"
                  : "bg-[var(--border)]"
              }`}
            />
          ))}
        </div>

        {/* ─── Step 1: Interests ─── */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-4">
              What kind of traveler are you?
            </h3>
            <p className="text-sm text-[var(--muted)] mb-4">
              Pick 2-3 interests. First pick = strongest preference.
            </p>
            <div className="grid grid-cols-3 gap-3 stagger-children">
              {ALL_INTERESTS.map((interest) => {
                const meta = INTEREST_META[interest];
                const selected = interests.includes(interest);
                const rank = interests.indexOf(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`relative flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all duration-200 ${
                      selected
                        ? "border-[var(--gold-400)] bg-[var(--gold-50)] shadow-sm"
                        : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--gold-300)] hover:bg-[var(--surface-hover)]"
                    }`}
                  >
                    {selected && (
                      <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)] text-[9px] font-bold text-white">
                        {rank + 1}
                      </span>
                    )}
                    <span className="text-xl">{meta.emoji}</span>
                    <span
                      className={`text-xs font-semibold ${
                        selected ? "text-[var(--accent)]" : "text-[var(--fg)]"
                      }`}
                    >
                      {meta.label}
                    </span>
                    <span className="text-[10px] leading-tight text-[var(--muted)]">
                      {meta.description}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={interests.length < 1}
                className="btn-gold rounded-xl px-6 py-2.5 text-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* ─── Step 2: Pace ─── */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-4">
              How do you like to travel?
            </h3>
            <div className="space-y-3 stagger-children">
              {(
                [
                  {
                    value: "relaxed" as const,
                    label: "Relaxed",
                    emoji: "\u2615",
                    desc: "Slow mornings, 1-2 activities, long lunches.",
                  },
                  {
                    value: "moderate" as const,
                    label: "Moderate",
                    emoji: "\uD83D\uDDFA\uFE0F",
                    desc: "Full days, 2-3 activities, some free time.",
                  },
                  {
                    value: "packed" as const,
                    label: "Packed",
                    emoji: "\u26A1",
                    desc: "See everything, maximize every hour.",
                  },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPace(opt.value)}
                  className={`w-full flex items-center gap-4 rounded-xl border p-4 text-left transition-all duration-200 ${
                    pace === opt.value
                      ? "border-[var(--gold-400)] bg-[var(--gold-50)] shadow-sm"
                      : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--gold-300)] hover:bg-[var(--surface-hover)]"
                  }`}
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  <div>
                    <div
                      className={`text-sm font-semibold ${
                        pace === opt.value
                          ? "text-[var(--accent)]"
                          : "text-[var(--fg)]"
                      }`}
                    >
                      {opt.label}
                    </div>
                    <div className="text-xs text-[var(--muted)]">{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--muted)] hover:text-[var(--fg)] hover:border-[var(--gold-300)] transition-all duration-200"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="btn-gold rounded-xl px-6 py-2.5 text-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* ─── Step 3: Extras ─── */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-4">
              Anything else?
            </h3>

            {/* Kids toggle */}
            <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 mb-4">
              <div>
                <div className="text-sm font-semibold text-[var(--fg)]">
                  Traveling with kids?
                </div>
                <div className="text-xs text-[var(--muted)]">
                  Prioritizes family-friendly activities
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={withKids}
                onClick={() => setWithKids(!withKids)}
                className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200 ${
                  withKids ? "bg-[var(--accent)]" : "bg-[var(--silver-300)]"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    withKids ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </div>

            {/* Dietary preferences */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-[var(--fg)]">
                Dietary preferences
              </label>
              <div className="flex flex-wrap gap-2">
                {DIETARY_OPTIONS.map((opt) => {
                  const selected = dietary.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleDietary(opt.value)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                        selected
                          ? "border-[var(--gold-400)] bg-[var(--gold-50)] text-[var(--accent)]"
                          : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--gold-300)]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Budget sensitivity */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-[var(--fg)]">
                Budget sensitivity
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(
                  [
                    { value: "flexible" as const, label: "Flexible", desc: "Spend freely" },
                    { value: "moderate" as const, label: "Moderate", desc: "Balance cost & fun" },
                    { value: "strict" as const, label: "Strict", desc: "Keep costs low" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setBudgetSensitivity(opt.value)}
                    className={`rounded-xl border p-3 text-center transition-all duration-200 ${
                      budgetSensitivity === opt.value
                        ? "border-[var(--gold-400)] bg-[var(--gold-50)] shadow-sm"
                        : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--gold-300)] hover:bg-[var(--surface-hover)]"
                    }`}
                  >
                    <div
                      className={`text-xs font-semibold ${
                        budgetSensitivity === opt.value
                          ? "text-[var(--accent)]"
                          : "text-[var(--fg)]"
                      }`}
                    >
                      {opt.label}
                    </div>
                    <div className="text-[10px] text-[var(--muted)] mt-0.5">
                      {opt.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--muted)] hover:text-[var(--fg)] hover:border-[var(--gold-300)] transition-all duration-200"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={interests.length < 1}
                className="btn-gold rounded-xl px-6 py-2.5 text-sm"
              >
                Save preferences
              </button>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
