"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useKeyboardShortcuts } from "./KeyboardShortcuts";
import { saveTrip } from "@/lib/trips-db";
import type { TripPlan } from "@/lib/types";

/**
 * Client component that wires keyboard shortcuts into the trip page.
 * Rendered invisibly alongside the server-rendered content.
 */
export function TripPageShortcuts({ plan }: { plan: TripPlan }) {
  const router = useRouter();

  const shortcuts = useMemo(
    () => [
      {
        key: "Escape",
        handler: () => router.push("/"),
      },
      {
        key: "s",
        cmdOrCtrl: true,
        handler: () => {
          saveTrip(plan);
          // Dispatch a custom event so TripActions can show feedback if mounted
          window.dispatchEvent(new CustomEvent("trip-saved"));
        },
      },
      {
        key: "p",
        cmdOrCtrl: true,
        handler: () => window.print(),
      },
    ],
    [router, plan],
  );

  useKeyboardShortcuts(shortcuts);

  return null;
}
