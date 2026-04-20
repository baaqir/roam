"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  listTrips,
  annualTotal,
  getAnnualBudget,
  setAnnualBudget,
  tripCountForYear,
} from "@/lib/trips-db";
import type { SavedTrip } from "@/lib/types";
import { AnnualBudgetBar } from "@/components/AnnualBudgetBar";
import { TripCard } from "@/components/TripCard";
import { EmptyState } from "@/components/EmptyState";

export default function TripsPage() {
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [budget, setBudget] = useState<number | undefined>();
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState("");
  const [mounted, setMounted] = useState(false);

  const year = new Date().getFullYear();

  useEffect(() => {
    setMounted(true);
    setTrips(listTrips());
    setBudget(getAnnualBudget());
  }, []);

  function handleDelete(id: string) {
    setTrips((prev) => prev.filter((t) => t.id !== id));
  }

  function saveBudget() {
    const n = parseInt(budgetInput, 10);
    if (!Number.isNaN(n) && n > 0) {
      setAnnualBudget(n);
      setBudget(n);
    } else {
      setAnnualBudget(undefined);
      setBudget(undefined);
    }
    setEditingBudget(false);
  }

  if (!mounted) return null;

  const spent = annualTotal(year);
  const count = tripCountForYear(year);

  return (
    <main className="mx-auto max-w-2xl px-6 py-12 animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gradient-gold">
          My Trips
        </h1>
        <p className="mt-1 text-[var(--muted)]">
          Your travel year at a glance.
        </p>
      </div>

      <AnnualBudgetBar spent={spent} budget={budget} tripCount={count} />

      <div className="mt-4 flex items-center gap-3">
        {!editingBudget ? (
          <button
            onClick={() => {
              setBudgetInput(budget ? String(budget) : "");
              setEditingBudget(true);
            }}
            className="text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors duration-200"
          >
            {budget ? `Annual budget: $${budget.toLocaleString()}` : "Set annual budget"}
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--muted)]">$</span>
            <label htmlFor="annual-budget" className="sr-only">Annual budget amount</label>
            <input
              id="annual-budget"
              type="number"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveBudget()}
              placeholder="e.g. 20000"
              autoFocus
              className="w-32 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--fg)] tabular-nums focus-ring transition-all duration-200"
            />
            <button
              onClick={saveBudget}
              className="btn-gold rounded-lg px-3 py-1.5 text-sm"
            >
              Save
            </button>
            <button
              onClick={() => setEditingBudget(false)}
              className="text-sm text-[var(--muted)] hover:text-[var(--fg)] transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 space-y-3 stagger-children">
        {trips.length === 0 ? (
          <div className="card-premium rounded-2xl border border-dashed border-[var(--border)] p-6">
            <EmptyState
              icon="suitcase"
              title="No trips saved yet"
              description="Plan a trip and save it to see it here."
              action={{ label: "Plan your first trip", href: "/" }}
            />
          </div>
        ) : (
          trips.map((t) => (
            <TripCard key={t.id} trip={t} onDelete={handleDelete} />
          ))
        )}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/"
          className="btn-gold inline-flex items-center gap-2 rounded-xl px-6 py-3 text-base"
        >
          + Plan a new trip
        </Link>
      </div>
    </main>
  );
}
