"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "Resolving destination",
  "Calculating flights & lodging",
  "Discovering activities",
  "Building your itinerary",
];

export default function TripLoading() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((s) => Math.min(s + 1, STEPS.length - 1));
    }, 800);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="mx-auto max-w-2xl px-6 py-24">
      <div className="text-center animate-fade-in-up">
        {/* Clean serif R logo */}
        <div className="relative mx-auto mb-8 h-16 w-16">
          <div
            className="absolute inset-0 rounded-full bg-[var(--accent)] animate-logo-shimmer blur-lg opacity-30"
            aria-hidden="true"
          />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-[var(--accent)]">
            <span className="text-2xl text-[var(--accent)] font-bold" style={{ fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)" }}>R</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--fg)]">
          Planning your trip...
        </h1>
        <p className="mt-2 italic text-[var(--muted)]">
          Crafting the perfect itinerary
        </p>
        <div className="mt-10 flex flex-col items-center">
          {STEPS.map((label, i) => {
            const isCompleted = i < activeStep;
            const isActive = i === activeStep;
            const isPending = i > activeStep;

            return (
              <div key={label} className="flex flex-col items-center">
                {/* Connecting line above (not for first step) */}
                {i > 0 && (
                  <div
                    className="w-0.5 h-4 transition-colors duration-300"
                    style={{
                      backgroundColor: isCompleted || isActive
                        ? "var(--accent)"
                        : "var(--brown-200)",
                    }}
                  />
                )}
                <div
                  className={`flex items-center gap-3 text-sm transition-all duration-300 py-1 ${
                    isPending
                      ? "text-[var(--muted)] opacity-40"
                      : isActive
                        ? "text-[var(--fg)]"
                        : "text-[var(--muted)]"
                  }`}
                >
                  {isCompleted && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-[var(--accent)]"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {isActive && (
                    <div className="h-2.5 w-2.5 rounded-full bg-[var(--accent)] animate-gold-pulse" />
                  )}
                  {isPending && (
                    <div className="h-2 w-2 rounded-full bg-[var(--brown-200)]" />
                  )}
                  <span className={isActive ? "font-medium" : ""}>{label}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-10">
          <div className="mx-auto h-1.5 w-48 overflow-hidden rounded-full bg-[var(--border-subtle)]">
            <div className="h-full rounded-full animate-shimmer" />
          </div>
        </div>
        <p className="mt-6 text-[10px] text-[var(--muted)]">
          Usually takes 2&ndash;5 seconds
        </p>
      </div>
    </main>
  );
}
