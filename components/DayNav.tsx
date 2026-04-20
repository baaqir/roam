"use client";

import { useEffect, useRef, useState } from "react";
import type { DayPlan } from "@/lib/types";

type Props = {
  days: DayPlan[];
};

/**
 * Sticky horizontal day-navigation bar for trips with 5+ days.
 * Uses Intersection Observer to highlight the currently visible day.
 * Clicking a pill scrolls to that day's card.
 */
export function DayNav({ days }: Props) {
  const [activeDay, setActiveDay] = useState(1);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Set up intersection observer to detect which day card is in view
    const options: IntersectionObserverInit = {
      rootMargin: "-120px 0px -50% 0px",
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const dayNum = parseInt(entry.target.id.replace("day-", ""), 10);
          if (!isNaN(dayNum)) {
            setActiveDay(dayNum);
          }
        }
      }
    }, options);

    // Observe all day cards
    for (const day of days) {
      const el = document.getElementById(`day-${day.dayNumber}`);
      if (el) observerRef.current.observe(el);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [days]);

  function scrollToDay(dayNumber: number) {
    const el = document.getElementById(`day-${dayNumber}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <div className="sticky top-[57px] z-40 -mx-6 px-6 py-2 glass border-b border-[var(--border-subtle)] animate-fade-in">
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
        {days.map((day) => {
          const isActive = day.dayNumber === activeDay;
          return (
            <button
              key={day.dayNumber}
              type="button"
              onClick={() => scrollToDay(day.dayNumber)}
              className={`flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? "chip-gold"
                  : "text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-hover)]"
              }`}
              aria-label={`Scroll to Day ${day.dayNumber}`}
            >
              Day {day.dayNumber}
            </button>
          );
        })}
      </div>
    </div>
  );
}
