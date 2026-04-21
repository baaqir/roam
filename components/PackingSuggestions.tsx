"use client";

import { useCallback, useEffect, useState } from "react";
import type { TripPlan } from "@/lib/types";
import {
  generatePackingList,
  groupByCategory,
  CATEGORY_LABELS,
  type PackingCategory,
  type PackingItem,
} from "@/lib/packing";

function packingStorageKey(plan: TripPlan): string {
  return `roam.packing.${plan.input.city}-${plan.input.nights}-${plan.input.travelers}-${plan.input.style}`;
}

export function PackingSuggestions({ plan }: { plan: TripPlan }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const storageKey = packingStorageKey(plan);

  // Load checked state from localStorage
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setCheckedItems(JSON.parse(saved));
      }
    } catch {}
  }, [storageKey]);

  // Persist checked state
  const persist = useCallback(
    (state: Record<string, boolean>) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(state));
      } catch {}
    },
    [storageKey],
  );

  function toggleItem(itemKey: string) {
    setCheckedItems((prev) => {
      const next = { ...prev, [itemKey]: !prev[itemKey] };
      persist(next);
      return next;
    });
  }

  if (!mounted) return null;

  const items = generatePackingList(plan);
  const grouped = groupByCategory(items);
  const totalItems = items.length;
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      className="card-editorial rounded-2xl p-6"
    >
      <summary className="cursor-pointer text-sm font-semibold text-[var(--muted)] hover:text-[var(--fg)] transition-colors duration-200">
        Packing suggestions ({checkedCount}/{totalItems} packed)
      </summary>
      {open && (
        <div className="mt-4 space-y-5 animate-fade-in">
          {(Object.keys(CATEGORY_LABELS) as PackingCategory[]).map((cat) => {
            const catItems = grouped[cat];
            if (catItems.length === 0) return null;
            const { label, emoji } = CATEGORY_LABELS[cat];
            return (
              <div key={cat}>
                <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  <span>{emoji}</span>
                  {label}
                </h4>
                <ul className="space-y-1">
                  {catItems.map((item, i) => (
                    <PackingRow
                      key={`${cat}-${i}`}
                      item={item}
                      itemKey={`${cat}-${i}`}
                      checked={!!checkedItems[`${cat}-${i}`]}
                      onToggle={toggleItem}
                    />
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </details>
  );
}

function PackingRow({
  item,
  itemKey,
  checked,
  onToggle,
}: {
  item: PackingItem;
  itemKey: string;
  checked: boolean;
  onToggle: (key: string) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2 hover:bg-[var(--surface-hover)] transition-colors duration-200">
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onToggle(itemKey)}
        className="mt-1 h-4 w-4 rounded border-[var(--border)] text-[var(--accent)] accent-[var(--accent)]"
      />
      <div className="flex-1">
        <span
          className={`text-sm font-medium transition-all duration-200 ${
            checked ? "text-[var(--muted)] line-through opacity-60" : "text-[var(--fg)]"
          }`}
        >
          {item.item}
        </span>
        <p className="mt-0.5 text-xs text-[var(--muted)]">{item.reason}</p>
      </div>
    </label>
  );
}
