"use client";

import { useEffect, useRef, useState } from "react";
import { listDestinations } from "@/lib/data/destinations";

type Props = {
  value: string;
  onChange: (city: string) => void;
  autoFocus?: boolean;
};

type Suggestion = { key: string; label: string; normalized: string };

/**
 * Strip accents/diacritics for matching: "Cancún" → "cancun", "São Paulo" → "sao paulo"
 */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Simple fuzzy score: how well does query match the target?
 * Returns 0 (no match) to 100 (exact match). Handles:
 * - Exact substring match (highest)
 * - Prefix match ("bar" → "barcelona")
 * - Typo tolerance via Levenshtein-like character skip
 * - Accent-stripped matching
 */
function fuzzyScore(query: string, target: string): number {
  if (!query) return 0;
  const q = normalize(query);
  const t = normalize(target);

  // Exact match
  if (t === q) return 100;
  // Starts with query
  if (t.startsWith(q)) return 90;
  // Contains query as substring
  if (t.includes(q)) return 80;

  // Check if the main city name (before comma) matches
  const cityPart = t.split(",")[0].trim();
  if (cityPart.startsWith(q)) return 85;
  if (cityPart.includes(q)) return 75;

  // Fuzzy: check if all query chars appear in order (with gaps allowed)
  // "brcln" should match "barcelona"
  let qi = 0;
  let matched = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      matched++;
      qi++;
    }
  }
  if (qi === q.length) {
    // All query chars found in order — score based on density
    const density = matched / t.length;
    return Math.round(40 + density * 30); // 40-70 range
  }

  // Last resort: Levenshtein-ish check on the city part
  // Allow 1-2 character differences for short queries
  if (q.length >= 3 && cityPart.length >= 3) {
    const dist = levenshteinPrefix(q, cityPart);
    if (dist <= 1 && q.length >= 4) return 60;
    if (dist <= 2 && q.length >= 6) return 50;
  }

  return 0;
}

/**
 * Levenshtein distance between query and the first N chars of target
 * (prefix distance — we don't penalize target being longer than query).
 */
function levenshteinPrefix(a: string, b: string): number {
  const target = b.slice(0, a.length + 2); // only compare relevant prefix
  const m = a.length;
  const n = target.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0),
  );
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === target[j - 1] ? 0 : 1),
      );
    }
  }
  // Min distance across all prefix endpoints
  let min = dp[m][n];
  for (let j = 0; j <= n; j++) {
    if (dp[m][j] < min) min = dp[m][j];
  }
  return min;
}

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

  // Build suggestions with pre-normalized names (computed once)
  const suggestions: Suggestion[] = listDestinations().map((d) => ({
    key: d.key,
    label: d.name,
    normalized: normalize(d.name),
  }));

  const query = text.trim();

  // Fuzzy-match suggestions, sorted by relevance score
  const filtered = query
    ? suggestions
        .map((s) => ({ ...s, score: fuzzyScore(query, s.label) }))
        .filter((s) => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 8)
    : [];

  const isCustomCity =
    query.length > 0 &&
    !suggestions.some(
      (s) =>
        normalize(s.label) === normalize(query) ||
        s.key === normalize(query),
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
              // If there's a top suggestion, select it
              if (filtered.length > 0 && filtered[0].score >= 60) {
                selectSuggestion(filtered[0].key, filtered[0].label);
              } else {
                commit(text.trim());
              }
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

      <p className="mt-2 text-xs text-[var(--muted)]">
        Works for any city in the world. 18 cities have curated data; everywhere
        else is auto-resolved.
      </p>

      {open && hasDropdownContent && (
        <ul
          className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-[var(--border-subtle)] glass py-1 animate-fade-in"
          role="listbox"
          aria-label="City suggestions"
          style={{ boxShadow: "var(--shadow-lg)" }}
        >
          {filtered.length > 0 && (
            <li className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
              Suggested matches
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
                className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-[var(--fg)] hover:bg-[var(--accent-light)] transition-colors duration-150"
              >
                <span>
                  <HighlightMatch text={s.label} query={query} />
                </span>
                <span className="chip-accent text-[9px]">curated</span>
              </button>
            </li>
          ))}
          {isCustomCity && (
            <li
              className={
                filtered.length > 0
                  ? "border-t border-[var(--border-subtle)]"
                  : ""
              }
            >
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  commit(text.trim());
                }}
                className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-[var(--fg)] hover:bg-[var(--accent-light)] transition-colors duration-150"
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

/** Highlight the matching portion of the suggestion text. */
function HighlightMatch({ text, query }: { text: string; query: string }) {
  const nq = normalize(query);
  const nt = normalize(text);
  const idx = nt.indexOf(nq);
  if (idx < 0 || !nq) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <strong className="text-[var(--accent)]">
        {text.slice(idx, idx + nq.length)}
      </strong>
      {text.slice(idx + nq.length)}
    </>
  );
}
