"use client";

import { useEffect, useRef, useState } from "react";
import { useCurrency } from "./CurrencyContext";

type Props = {
  cityName: string;
  total: number;
  perPerson: number;
  /** Ref (or CSS selector) of the hero element to observe. */
  heroSelector?: string;
};

/**
 * Slim sticky bar that shows city name + cost when the TripHero scrolls
 * out of view. Uses Intersection Observer for zero-JS-scroll-listener perf.
 */
export function StickyTripSummary({ cityName, total, perPerson, heroSelector = ".trip-hero" }: Props) {
  const [visible, setVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const { fmt, showLocal } = useCurrency();

  useEffect(() => {
    const heroEl = document.querySelector(heroSelector);
    if (!heroEl) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        // Show bar when hero is NOT intersecting (scrolled past)
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "-57px 0px 0px 0px" },
    );

    observerRef.current.observe(heroEl);
    return () => observerRef.current?.disconnect();
  }, [heroSelector]);

  const displayTotal = showLocal ? fmt(total) : `$${total.toLocaleString()}`;
  const displayPP = showLocal ? fmt(perPerson) : `$${perPerson.toLocaleString()}`;

  return (
    <div
      className={`sticky top-[57px] z-45 -mx-6 px-6 glass border-b border-[var(--border-subtle)] transition-all duration-200 ${
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 -translate-y-2 pointer-events-none"
      }`}
      aria-hidden={!visible}
    >
      <div className="mx-auto flex h-10 max-w-2xl items-center justify-between">
        <span className="truncate text-sm font-semibold text-[var(--fg)] max-w-[40%]">
          {cityName}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold tabular-nums text-[var(--accent)]">
            {displayTotal}
          </span>
          <span className="text-xs tabular-nums text-[var(--muted)]">
            {displayPP}/person
          </span>
        </div>
      </div>
    </div>
  );
}
