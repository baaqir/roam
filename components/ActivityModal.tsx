"use client";

import { useEffect, useRef, useState } from "react";
import type { Activity } from "@/lib/types";

type Props = {
  activity: Activity;
  travelers: number;
  totalDays: number;
  isInItinerary: boolean;
  onAdd?: (dayNumber: number) => void;
  onRemove?: () => void;
  onClose: () => void;
  /** Booking URL for this activity (GetYourGuide search). */
  bookingUrl?: string;
};

const TAG_COLORS: Record<string, string> = {
  iconic:
    "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50",
  outdoor:
    "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50",
  foodie:
    "bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800/50",
  culture:
    "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50",
  nightlife:
    "bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800/50",
  adventure:
    "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/50",
  family:
    "bg-yellow-50 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800/50",
  free: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50",
};

export function ActivityModal({
  activity,
  travelers,
  totalDays,
  isInItinerary,
  onAdd,
  onRemove,
  onClose,
  bookingUrl,
}: Props) {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const totalCost = activity.cost * travelers;
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      // Focus trap: keep Tab within the modal
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
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Prevent body scroll while modal is open + auto-focus close button
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Focus the dialog so screen readers announce it
    const firstButton = dialogRef.current?.querySelector<HTMLElement>("button");
    firstButton?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Close on overlay click
  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed z-50 bg-black/40 backdrop-blur-sm animate-fade-in sm:inset-0 sm:flex sm:items-center sm:justify-center sm:p-4 inset-x-0 bottom-0 top-0"
      onClick={handleOverlayClick}
    >
      <div
        ref={dialogRef}
        className="card-premium p-6 w-full relative max-h-[85vh] overflow-y-auto sm:max-w-md sm:rounded-2xl sm:animate-scale-in sm:mx-auto rounded-t-2xl rounded-b-none animate-slide-up mt-auto sm:mt-0"
        role="dialog"
        aria-modal="true"
        aria-label={activity.name}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--muted)] hover:text-[var(--fg)] transition-colors duration-200 p-1 rounded-lg hover:bg-[var(--surface-hover)]"
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

        {/* Heading */}
        <h2 className="text-xl font-bold text-[var(--fg)] pr-8">
          {activity.name}
        </h2>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {activity.tags.map((t) => (
            <span
              key={t}
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                TAG_COLORS[t] ??
                "bg-gray-50 dark:bg-gray-800/40 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700/50"
              }`}
            >
              {t}
            </span>
          ))}
        </div>

        {/* Description */}
        {activity.description && (
          <p className="mt-4 text-sm text-[var(--muted)] leading-relaxed">
            {activity.description}
          </p>
        )}

        {/* Divider */}
        <hr className="divider-gradient my-4" />

        {/* Cost + Duration */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-2xl font-bold tabular-nums text-[var(--accent)]">
              {activity.cost === 0 ? "Free" : `$${activity.cost}`}
            </div>
            <div className="text-xs text-[var(--muted)]">per person</div>
            {activity.cost > 0 && travelers > 1 && (
              <div className="mt-0.5 text-sm font-semibold tabular-nums text-[var(--fg)]">
                ${totalCost} total for {travelers} travelers
              </div>
            )}
          </div>
          {activity.durationHours > 0 && (
            <div className="text-sm text-[var(--muted)] flex items-center gap-1.5">
              <span>&#128339;</span>
              <span>{activity.durationHours}h</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <hr className="divider-gradient my-4" />

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {isInItinerary ? (
            <>
              <div className="text-xs text-[var(--muted)] text-center mb-1">
                This activity is in your itinerary
              </div>
              {onRemove && (
                <button
                  onClick={() => {
                    onRemove();
                    onClose();
                  }}
                  className="w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--muted)] hover:border-red-300 hover:text-red-600 dark:hover:border-red-800 dark:hover:text-red-400 transition-all duration-200"
                >
                  Remove from itinerary
                </button>
              )}
            </>
          ) : (
            <>
              {onAdd && totalDays > 0 && (
                <div className="flex items-center gap-2">
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(parseInt(e.target.value, 10))}
                    aria-label="Select day to add activity"
                    className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--fg)] focus-ring transition-all duration-200"
                  >
                    {Array.from({ length: totalDays }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        Day {i + 1}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      onAdd(selectedDay);
                      onClose();
                    }}
                    className="btn-gold rounded-xl px-5 py-2.5 text-sm"
                  >
                    Add to Day {selectedDay}
                  </button>
                </div>
              )}
            </>
          )}
          {bookingUrl && (
            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="card-premium card-premium-hover w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--accent)] hover:border-[var(--gold-300)] transition-all duration-200 text-center inline-block"
            >
              Book this activity &rarr;
            </a>
          )}
          <button
            onClick={onClose}
            className="w-full rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--fg)] hover:border-[var(--gold-300)] transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
