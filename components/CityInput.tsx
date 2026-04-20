"use client";

import { useEffect, useRef, useState } from "react";
import { listDestinations } from "@/lib/data/destinations";

type Props = {
  value: string;
  onChange: (city: string) => void;
};

/**
 * Simple city text input with a lightweight suggestion list.
 * No complex combobox -- just a text field that shows curated cities
 * when the user focuses or types, and lets them type anything.
 */
export function CityInput({ value, onChange }: Props) {
  const [text, setText] = useState(value);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Curated suggestions (loaded once).
  const suggestions = listDestinations().map((d) => ({
    key: d.key,
    label: d.name,
  }));

  const query = text.toLowerCase().trim();
  const filtered = query
    ? suggestions.filter(
        (s) =>
          s.label.toLowerCase().includes(query) ||
          s.key.includes(query),
      )
    : suggestions.slice(0, 8); // show top 8 when empty

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
  }

  // Close on outside click.
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        // Commit whatever is typed.
        if (text.trim()) onChange(text.trim());
      }
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, text, onChange]);

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          onChange(e.target.value.trim()); // eager commit
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
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
        placeholder="Barcelona, Tokyo, Lagos..."
        autoComplete="off"
        spellCheck={false}
        aria-label="Destination city"
        role="combobox"
        aria-expanded={open && filtered.length > 0}
        aria-haspopup="listbox"
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-lg text-[var(--fg)] placeholder:text-[var(--muted)] focus-ring transition-all duration-200"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-30 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-[var(--border-subtle)] glass py-1 animate-fade-in"
            role="listbox"
            aria-label="City suggestions"
            style={{ boxShadow: "var(--shadow-lg)" }}>
          {filtered.map((s) => (
            <li key={s.key}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectSuggestion(s.key, s.label);
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[var(--fg)] hover:bg-[var(--gold-50)] transition-colors duration-150"
              >
                {s.label}
              </button>
            </li>
          ))}
          {text.trim() && !suggestions.some((s) => s.label.toLowerCase() === query || s.key === query) && (
            <li className="border-t border-[var(--border-subtle)]">
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  commit(text.trim());
                }}
                className="block w-full px-4 py-2.5 text-left text-sm italic text-[var(--muted)] hover:bg-[var(--gold-50)] transition-colors duration-150"
              >
                Search for &ldquo;{text.trim()}&rdquo;
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
