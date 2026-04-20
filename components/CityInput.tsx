"use client";

import { useEffect, useRef, useState } from "react";
import { listDestinations } from "@/lib/data/destinations";

type Props = {
  value: string;
  onChange: (city: string) => void;
  autoFocus?: boolean;
};

export function CityInput({ value, onChange, autoFocus }: Props) {
  const [text, setText] = useState(value);
  const [open, setOpen] = useState(false);
  const [showCheck, setShowCheck] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [autoFocus]);

  const suggestions = listDestinations().map((d) => ({
    key: d.key,
    label: d.name,
  }));

  const query = text.toLowerCase().trim();

  // Only show suggestions when user has typed something (filter matches),
  // NOT on empty focus. This makes it feel like a search, not a dropdown.
  const filtered = query
    ? suggestions.filter(
        (s) =>
          s.label.toLowerCase().includes(query) ||
          s.key.includes(query),
      )
    : [];

  // Show the "search for X" option when text doesn't match a curated city
  const isCustomCity =
    text.trim().length > 0 &&
    !suggestions.some(
      (s) => s.label.toLowerCase() === query || s.key === query,
    );

  const hasDropdownContent = filtered.length > 0 || isCustomCity;

  function commit(val: string) {
    setText(val);
    onChange(val);
    setOpen(false);
  }

  function selectSuggestion(key: string, label: string) {
    setText(label);
    onChange(key);
    setOpen(false);
    inputRef.current?.blur();
    setShowCheck(true);
    setTimeout(() => setShowCheck(false), 500);
  }

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        if (text.trim()) onChange(text.trim());
      }
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, text, onChange]);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            onChange(e.target.value.trim());
            setOpen(true);
          }}
          onFocus={() => {
            if (text.trim()) setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit(text.trim());
              inputRef.current?.blur();
            }
            if (e.key === "Escape") {
              setOpen(false);
              inputRef.current?.blur();
            }
          }}
          placeholder="Type any city — Paris, Bali, Lagos, anywhere"
          autoComplete="off"
          spellCheck={false}
          aria-label="Destination city"
          role="combobox"
          aria-expanded={open && hasDropdownContent}
          aria-haspopup="listbox"
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-lg text-[var(--fg)] placeholder:text-[var(--muted)] focus-ring transition-all duration-200"
        />
        {showCheck && (
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 animate-check-flash pointer-events-none"
            aria-hidden="true"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        )}
      </div>

      {/* Helper text — always visible below the input */}
      <p className="mt-2 text-xs text-[var(--muted)]">
        Works for any city in the world. 18 cities have curated data; everywhere
        else is auto-resolved.
      </p>

      {/* Suggestions dropdown — only when user is typing */}
      {open && hasDropdownContent && (
        <ul
          className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-[var(--border-subtle)] glass py-1 animate-fade-in"
          role="listbox"
          aria-label="City suggestions"
          style={{ boxShadow: "var(--shadow-lg)" }}
        >
          {filtered.length > 0 && (
            <li className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
              Curated cities
            </li>
          )}
          {filtered.map((s) => (
            <li key={s.key}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectSuggestion(s.key, s.label);
                }}
                className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-[var(--fg)] hover:bg-[var(--gold-50)] transition-colors duration-150"
              >
                <span>{s.label}</span>
                <span className="chip-gold text-[9px]">curated</span>
              </button>
            </li>
          ))}
          {isCustomCity && (
            <li className={filtered.length > 0 ? "border-t border-[var(--border-subtle)]" : ""}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  commit(text.trim());
                }}
                className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-[var(--fg)] hover:bg-[var(--gold-50)] transition-colors duration-150"
              >
                <span>
                  Plan a trip to <strong>{text.trim()}</strong>
                </span>
                <span className="text-[10px] text-[var(--muted)]">
                  any city
                </span>
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
