"use client";

import { useState } from "react";
import type { ChecklistItem, TripPlan } from "@/lib/types";

export function PreDepartureChecklist({ plan }: { plan: TripPlan }) {
  const [open, setOpen] = useState(false);
  if (plan.checklist.length === 0) return null;

  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      className="card-premium rounded-2xl p-6"
    >
      <summary className="cursor-pointer text-sm font-semibold text-[var(--muted)] hover:text-[var(--fg)] transition-colors duration-200">
        Pre-departure checklist ({plan.checklist.length} items)
      </summary>
      {open && (
        <ul className="mt-4 space-y-2 animate-fade-in">
          {plan.checklist.map((item, i) => (
            <ChecklistRow key={i} item={item} />
          ))}
        </ul>
      )}
    </details>
  );
}

function ChecklistRow({ item }: { item: ChecklistItem }) {
  const [checked, setChecked] = useState(false);
  const dot =
    item.priority === "must"
      ? "bg-red-500"
      : item.priority === "should"
        ? "bg-[var(--gold-400)]"
        : "bg-[var(--silver-300)]";
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2 hover:bg-[var(--surface-hover)] transition-colors duration-200">
      <input
        type="checkbox"
        checked={checked}
        onChange={() => setChecked(!checked)}
        className="mt-1 h-4 w-4 rounded border-[var(--border)] text-[var(--gold-400)] accent-[var(--gold-400)]"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
          <span
            className={`text-sm font-medium transition-all duration-200 ${
              checked ? "text-[var(--muted)] line-through opacity-60" : "text-[var(--fg)]"
            }`}
          >
            {item.title}
          </span>
        </div>
        {item.detail && (
          <p className="mt-0.5 pl-4 text-xs text-[var(--muted)]">{item.detail}</p>
        )}
      </div>
    </label>
  );
}
