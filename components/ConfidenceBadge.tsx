"use client";

type ConfidenceLevel = "high" | "medium" | "low";

type Props = {
  level: ConfidenceLevel;
  tooltip?: string;
  /** When true, shows only the dot + label inline (compact mode). */
  compact?: boolean;
};

const CONFIG: Record<
  ConfidenceLevel,
  { dot: string; label: string; bg: string; text: string; border: string }
> = {
  high: {
    dot: "bg-emerald-500",
    label: "Verified",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800/50",
  },
  medium: {
    dot: "bg-amber-500",
    label: "Estimated",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800/50",
  },
  low: {
    dot: "bg-red-500",
    label: "Rough",
    bg: "bg-red-50 dark:bg-red-950/40",
    text: "text-red-700 dark:text-red-300",
    border: "border-red-200 dark:border-red-800/50",
  },
};

export function getConfidenceLevel(assumptions: string[]): ConfidenceLevel {
  const text = assumptions.join(" ").toLowerCase();
  if (text.includes("auto-resolved") || text.includes("rough")) return "low";
  if (text.includes("global averages") || text.includes("global tier"))
    return "medium";
  return "high";
}

/** Returns the +/- percentage for price range based on confidence. */
export function getConfidenceMargin(level: ConfidenceLevel): number {
  switch (level) {
    case "high":
      return 0.1;
    case "medium":
      return 0.2;
    case "low":
      return 0.35;
  }
}

export function ConfidenceBadge({ level, tooltip, compact }: Props) {
  const cfg = CONFIG[level];

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold ${cfg.text}`}
        title={tooltip}
      >
        <span
          className={`inline-block h-1.5 w-1.5 rounded-full ${cfg.dot}`}
          aria-hidden="true"
        />
        {cfg.label}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-semibold ${cfg.bg} ${cfg.text} ${cfg.border}`}
      title={tooltip}
    >
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${cfg.dot}`}
        aria-hidden="true"
      />
      {cfg.label}
    </span>
  );
}
