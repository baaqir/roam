"use client";
import { useEffect, useRef, useState } from "react";

type Props = {
  value: number;
  prefix?: string;  // "$"
  suffix?: string;  // "/person"
  duration?: number; // ms, default 800
  className?: string;
};

export function AnimatedNumber({ value, prefix = "", suffix = "", duration = 800, className = "" }: Props) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number>(0);

  useEffect(() => {
    const start = ref.current;
    const diff = value - start;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + diff * eased);
      setDisplay(current);
      if (progress < 1) requestAnimationFrame(tick);
      else ref.current = value;
    }
    requestAnimationFrame(tick);
  }, [value, duration]);

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}{display.toLocaleString()}{suffix}
    </span>
  );
}
