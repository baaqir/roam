"use client";

import { useRef } from "react";
import type { Style } from "@/lib/types";
import { STYLE_CONFIG } from "@/lib/types";

type Props = {
  value: Style;
  onChange: (style: Style) => void;
};

const STYLES: Style[] = ["budget", "comfort", "luxury"];

export function StylePicker({ value, onChange }: Props) {
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  function handleSelect(s: Style) {
    onChange(s);
    // Trigger bounce animation on the selected card
    const btn = buttonRefs.current[s];
    if (btn) {
      btn.classList.remove("animate-style-bounce");
      // Force reflow to restart animation
      void btn.offsetWidth;
      btn.classList.add("animate-style-bounce");
    }
  }

  return (
    <div className="flex gap-3" role="radiogroup" aria-label="Trip style">
      {STYLES.map((s) => {
        const active = s === value;
        const config = STYLE_CONFIG[s];
        return (
          <button
            key={s}
            ref={(el) => { buttonRefs.current[s] = el; }}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => handleSelect(s)}
            className={`flex-1 rounded-xl border-2 px-4 py-4 text-center transition-all duration-200 ${
              active
                ? "border-[var(--accent)] bg-[var(--accent-light)] text-[var(--fg)] shadow-sm"
                : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--accent)] hover:shadow-sm"
            }`}
          >
            <div className="text-base font-semibold" style={{ fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)" }}>{config.label}</div>
            <div className={`mt-0.5 text-xs italic ${active ? "text-[var(--accent)]" : "opacity-60"}`}>
              {config.description}
            </div>
          </button>
        );
      })}
    </div>
  );
}
