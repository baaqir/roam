"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listTrips } from "@/lib/trips-db";
import type { SavedTrip } from "@/lib/types";
import { planDisplayName } from "@/lib/types";
import { encodeTripInput } from "@/lib/url";

export function RecentTrips() {
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTrips(listTrips().slice(0, 5));
  }, []);

  if (!mounted || trips.length === 0) return null;

  return (
    <div className="mt-12">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-lg font-bold text-[var(--fg)]">
          Recent trips
        </h2>
        <Link
          href="/trips"
          className="text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors duration-200"
        >
          View all &rarr;
        </Link>
      </div>
      <ul className="space-y-2 stagger-children">
        {trips.map((t) => {
          const p = t.plan;
          const url = `/trip?${encodeTripInput(p.input).toString()}`;
          return (
            <li key={t.id}>
              <Link
                href={url}
                className="card-editorial card-editorial-hover flex items-baseline justify-between rounded-xl px-4 py-3"
              >
                <div>
                  <div className="font-medium text-[var(--accent)]">
                    {planDisplayName(p)}
                  </div>
                  <div className="text-xs text-[var(--muted)]">
                    {p.input.nights}n &middot; {p.input.travelers} traveler{p.input.travelers > 1 ? "s" : ""} &middot; {p.input.style}
                  </div>
                </div>
                <div className="text-lg font-semibold tabular-nums text-[var(--fg)]">
                  ${p.total.toLocaleString()}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
