"use client";

import { useState } from "react";
import type { TripPlan } from "@/lib/types";

export function LocalTips({ plan }: { plan: TripPlan }) {
  const [open, setOpen] = useState(false);
  const tips = plan.destination.tips;

  if (!tips || tips.length === 0) return null;

  const cityName = plan.destination.name.split(",")[0];

  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      className="card-editorial rounded-2xl p-6"
    >
      <summary className="cursor-pointer text-sm font-semibold text-[var(--muted)] hover:text-[var(--fg)] transition-colors duration-200">
        Local tips for {cityName} ({tips.length})
      </summary>
      {open && (
        <ul className="mt-4 space-y-2 animate-fade-in">
          {tips.map((tip, i) => (
            <li
              key={i}
              className="flex items-start gap-3 rounded-xl px-3 py-2 text-sm"
            >
              <span className="mt-0.5 flex-shrink-0 text-[var(--accent)]">
                {"\u2728"}
              </span>
              <span className="text-[var(--fg)]">{tip}</span>
            </li>
          ))}
        </ul>
      )}
    </details>
  );
}
