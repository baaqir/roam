"use client";

import { forwardRef, useRef } from "react";
import { useRouter } from "next/navigation";
import type { DayPlan, TripPlan } from "@/lib/types";
import { saveTrip } from "@/lib/trips-db";
import { downloadIcs } from "@/lib/ics-v2";
import { useToast } from "./Toast";

type TripActionsProps = {
  plan: TripPlan;
  /** The current customized days (if the user has edited the itinerary). */
  customDays?: DayPlan[] | null;
  /** Whether the itinerary has been modified from the auto-generated plan. */
  hasEdits?: boolean;
};

export function TripActions({ plan, customDays, hasEdits }: TripActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const saveRef = useRef<HTMLButtonElement>(null);

  function handleSave() {
    // Merge customized days into the plan before saving so edits persist.
    const planToSave: TripPlan = customDays
      ? { ...plan, days: customDays }
      : plan;
    saveTrip(planToSave);
    toast("Trip saved to My Trips", "success");
    // Trigger gold pulse ring animation
    const btn = saveRef.current;
    if (btn) {
      btn.classList.remove("animate-pulse-ring");
      void btn.offsetWidth;
      btn.classList.add("animate-pulse-ring");
    }
  }
  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast("Link copied to clipboard", "info");
    } catch {}
  }
  function handlePrint() {
    window.print();
  }
  function handleCalendar() {
    const planForCal: TripPlan = customDays
      ? { ...plan, days: customDays }
      : plan;
    downloadIcs(planForCal);
    toast("Calendar file downloaded", "info");
  }

  return (
    <div className="no-print flex flex-col items-center gap-3">
      <div className="grid grid-cols-2 gap-3 w-full max-w-sm sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:max-w-none">
        <ActionButton onClick={handleSave} primary ref={saveRef}>
          Save to my trips
        </ActionButton>
        <ActionButton onClick={handleShare}>Share link</ActionButton>
        <ActionButton onClick={handlePrint}>Print / PDF</ActionButton>
        <ActionButton onClick={handleCalendar}>Add to calendar</ActionButton>
      </div>
      <button
        onClick={() => router.push("/trips")}
        className="text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] hover:underline transition-colors duration-200"
      >
        View in My Trips &rarr;
      </button>
      {/* Bug 5: Warn that shared links don't preserve edits */}
      {hasEdits && (
        <p className="text-xs text-[var(--muted)] text-center max-w-md">
          Note: shared links regenerate a fresh plan &mdash; your activity customizations won&apos;t transfer.
        </p>
      )}
    </div>
  );
}

const ActionButton = forwardRef<
  HTMLButtonElement,
  {
    onClick: () => void;
    primary?: boolean;
    children: React.ReactNode;
  }
>(function ActionButton({ onClick, primary, children }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-200 focus-ring ${
        primary
          ? "btn-gold"
          : "card-premium card-premium-hover border border-[var(--border)] text-[var(--fg)] hover:border-[var(--gold-300)]"
      }`}
    >
      {children}
    </button>
  );
});
