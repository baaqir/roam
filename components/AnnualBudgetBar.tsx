"use client";

import { AnimatedNumber } from "./AnimatedNumber";

export function AnnualBudgetBar({
  spent,
  budget,
  tripCount,
}: {
  spent: number;
  budget: number | undefined;
  tripCount: number;
}) {
  const hasBudget = budget != null && budget > 0;
  const pct = hasBudget ? Math.min(100, Math.round((spent / budget!) * 100)) : 0;
  const over = hasBudget && spent > budget!;

  return (
    <div className="card-editorial rounded-2xl p-8">
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="text-lg font-bold text-[var(--fg)]">
            {new Date().getFullYear()} Travel Budget
          </h2>
          <div className="mt-1 text-3xl font-bold tracking-tight text-[var(--fg)]">
            <AnimatedNumber value={spent} prefix="$" />
          </div>
          <div className="text-sm text-[var(--muted)]">
            across {tripCount} trip{tripCount !== 1 ? "s" : ""}
          </div>
        </div>
        {hasBudget && (
          <div className="text-right">
            <div className="text-sm font-medium tabular-nums text-[var(--fg)]">
              / ${budget!.toLocaleString()}
            </div>
            <div className={`text-sm font-semibold tabular-nums ${over ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
              {over
                ? `$${(spent - budget!).toLocaleString()} over`
                : `$${(budget! - spent).toLocaleString()} remaining`}
            </div>
          </div>
        )}
      </div>
      {hasBudget && (
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-[var(--border-subtle)]">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              over ? "bg-red-500" : pct > 80 ? "bg-amber-500" : ""
            }`}
            style={{
              width: `${pct}%`,
              ...(!over && pct <= 80
                ? { background: "var(--terracotta)" }
                : {}),
            }}
          />
        </div>
      )}
    </div>
  );
}
