"use client";

import { useEffect, useRef, useState } from "react";
import type { DayPlan } from "@/lib/types";

type Props = {
  days: DayPlan[];
};

/**
 * Sticky horizontal day-navigation bar. Shows for 3+ day trips.
 * Highlights the currently visible day via Intersection Observer.
 * Clicking a pill smooth-scrolls to that day's card.
 */
export function DayNav({ days }: Props) {
  const [activeDay, setActiveDay] = useState(1);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const options: IntersectionObserverInit = {
      rootMargin: "-120px 0px -50% 0px",
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const dayNum = parseInt(
            entry.target.id.replace("day-", ""),
            10,
          );
          if (!isNaN(dayNum)) setActiveDay(dayNum);
        }
      }
    }, options);

    for (const day of days) {
      const el = document.getElementById(`day-${day.dayNumber}`);
      if (el) observerRef.current.observe(el);
    }

    return () => observerRef.current?.disconnect();
  }, [days]);

  // Auto-scroll the nav to keep active pill visible.
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const pill = container.querySelector(`[data-day="${activeDay}"]`);
    if (pill) {
      pill.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeDay]);

  function scrollToDay(dayNumber: number) {
    const el = document.getElementById(`day-${dayNumber}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="sticky top-[49px] z-40 py-2 bg-[var(--surface)]/90 backdrop-blur-lg border-b border-[var(--border-subtle)]">
      <div
        ref={scrollRef}
        className="flex gap-1 overflow-x-auto scrollbar-hide"
      >
        {days.map((day) => {
          const isActive = day.dayNumber === activeDay;
          return (
            <button
              key={day.dayNumber}
              data-day={day.dayNumber}
              type="button"
              onClick={() => scrollToDay(day.dayNumber)}
              className={`flex-shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                isActive
                  ? "bg-[var(--accent-light)] text-[var(--accent)]"
                  : "text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-hover)]"
              }`}
              aria-label={`Scroll to Day ${day.dayNumber}`}
            >
              <span className="font-semibold">Day {day.dayNumber}</span>
              <span className={`text-[10px] ${isActive ? "text-[var(--accent)]" : "text-[var(--muted)]"}`}>
                {day.dayOfWeek}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
