"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SavedTrip } from "@/lib/types";
import { planDisplayName } from "@/lib/types";
import { encodeTripInput } from "@/lib/url";
import { deleteTrip } from "@/lib/trips-db";

type Props = {
  trip: SavedTrip;
  onDelete: (id: string) => void;
};

export function TripCard({ trip, onDelete }: Props) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Revert confirm state after 3 seconds
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleDeleteClick = useCallback(() => {
    if (confirmDelete) {
      // Second click: actually delete
      if (timerRef.current) clearTimeout(timerRef.current);
      deleteTrip(trip.id);
      onDelete(trip.id);
    } else {
      // First click: enter confirm state
      setConfirmDelete(true);
      timerRef.current = setTimeout(() => {
        setConfirmDelete(false);
      }, 3000);
    }
  }, [confirmDelete, trip.id, onDelete]);

  const p = trip.plan;
  const displayName = planDisplayName(p);
  const url = `/trip?${encodeTripInput(p.input).toString()}`;
  const planSimilarUrl = `/?city=${encodeURIComponent(p.input.city)}&nights=${p.input.nights}&travelers=${p.input.travelers}`;
  const start = p.days[0]?.date;
  const end = p.days[p.days.length - 1]?.date;

  function handleEdit() {
    sessionStorage.setItem("roam.edit-plan", JSON.stringify(p.days));
    router.push(url);
  }

  return (
    <div className="card-editorial card-editorial-hover flex items-center gap-4 rounded-2xl p-6">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link href={url} className="text-lg font-bold text-[var(--fg)] hover:text-[var(--accent)] transition-colors duration-200 truncate" style={{ fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)" }}>
            {displayName}
          </Link>
          <span className={
            trip.status === "upcoming"
              ? "chip-accent"
              : "chip-muted"
          }>
            {trip.status}
          </span>
        </div>
        <div className="mt-1 text-sm text-[var(--muted)]">
          {start && end ? `${formatRange(start, end)} \u00B7 ` : ""}
          {p.input.nights}n \u00B7 {p.input.travelers} traveler{p.input.travelers > 1 ? "s" : ""} \u00B7 {p.input.style}
        </div>
        <div className="mt-1 flex items-center gap-3">
          <button
            onClick={handleEdit}
            className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Edit
          </button>
          <Link
            href={planSimilarUrl}
            className="text-xs font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors duration-200"
          >
            Plan similar trip
          </Link>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-xl font-bold tabular-nums text-[var(--fg)]">
          ${p.total.toLocaleString()}
        </div>
        <div className="text-xs tabular-nums text-[var(--muted)]">
          ${p.perPerson.toLocaleString()}/p
        </div>
      </div>
      <button
        onClick={handleDeleteClick}
        className={`flex-shrink-0 rounded-lg p-1.5 transition-all duration-200 ${
          confirmDelete
            ? "text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/50"
            : "text-[var(--muted)] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
        }`}
        aria-label={confirmDelete ? `Confirm delete ${displayName} trip` : `Delete ${displayName} trip`}
      >
        {confirmDelete ? (
          <span className="text-xs font-semibold px-1">Confirm?</span>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        )}
      </button>
    </div>
  );
}

function formatRange(start: string, end: string): string {
  const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const [, sm, sd] = start.split("-");
  const [, em, ed] = end.split("-");
  if (sm === em) return `${months[parseInt(sm)]} ${parseInt(sd)}\u2013${parseInt(ed)}`;
  return `${months[parseInt(sm)]} ${parseInt(sd)} \u2013 ${months[parseInt(em)]} ${parseInt(ed)}`;
}
