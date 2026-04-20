"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TripInput } from "@/lib/types";

function tripNotesKey(input: TripInput): string {
  return `roam.notes.${input.city}-${input.nights}-${input.travelers}-${input.style}`;
}

export function TripNotes({ input }: { input: TripInput }) {
  const key = tripNotesKey(input);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [mounted, setMounted] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        setText(saved);
        setOpen(true);
      }
    } catch {}
  }, [key]);

  const persist = useCallback(
    (value: string) => {
      try {
        if (value.trim()) {
          localStorage.setItem(key, value);
        } else {
          localStorage.removeItem(key);
        }
      } catch {}
    },
    [key],
  );

  function handleChange(value: string) {
    setText(value);
    // Debounce auto-save to 1s
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => persist(value), 1000);
  }

  function handleBlur() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    persist(text);
  }

  if (!mounted) return null;

  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      className="card-premium rounded-2xl p-6"
    >
      <summary className="cursor-pointer text-sm font-semibold text-[var(--muted)] hover:text-[var(--fg)] transition-colors duration-200">
        Trip Notes
        {text.trim() && (
          <span className="ml-2 text-xs font-normal text-[var(--muted)]">
            ({text.length} chars)
          </span>
        )}
      </summary>
      {open && (
        <div className="mt-4 animate-fade-in">
          <textarea
            value={text}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            placeholder="Add notes about your trip... restaurant recs, booking reminders, packing list"
            rows={5}
            aria-label="Trip notes"
            className="w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--fg)] placeholder:text-[var(--muted)] focus-ring transition-all duration-200 leading-relaxed"
          />
          <div className="mt-1 flex items-center justify-between text-xs text-[var(--muted)]">
            <span>Auto-saved to this browser</span>
            <span className="tabular-nums">{text.length} characters</span>
          </div>
        </div>
      )}
    </details>
  );
}
