/**
 * v2 ICS export — generates a .ics file from a TripPlan.
 * One all-day event for the full trip + per-day summary events.
 */
import type { TripPlan } from "./types";

export function downloadIcs(plan: TripPlan): void {
  if (typeof window === "undefined") return;
  const ics = buildIcs(plan);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `trip-${slug(plan.destination.name)}-${plan.days[0]?.date ?? "plan"}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function buildIcs(plan: TripPlan): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Roam//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];
  const now = icsTimestamp(new Date());
  const startDate = plan.days[0]?.date ?? "";
  const endDate = plan.days[plan.days.length - 1]?.date ?? startDate;

  // Main all-day event spanning the whole trip.
  lines.push(
    "BEGIN:VEVENT",
    `UID:${plan.id}@roam`,
    `DTSTAMP:${now}`,
    `DTSTART;VALUE=DATE:${startDate.replace(/-/g, "")}`,
    `DTEND;VALUE=DATE:${addDay(endDate).replace(/-/g, "")}`,
    `SUMMARY:${esc(`${plan.destination.name} Trip`)}`,
    `DESCRIPTION:${esc(`$${plan.total.toLocaleString()} total · ${plan.input.travelers} travelers · ${plan.input.style}`)}`,
    `LOCATION:${esc(plan.destination.name)}`,
    "END:VEVENT",
  );

  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}

function icsTimestamp(d: Date): string {
  const p = (n: number) => n.toString().padStart(2, "0");
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}T${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`;
}

function addDay(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

function esc(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
}
