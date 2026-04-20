/**
 * Generates a pre-departure checklist from REST Countries data + visa rules.
 * Pure function — no API calls, no side effects.
 */
import type { CountryInfo } from "./context";
import {
  US_VISA_REQUIREMENTS,
  VISA_LABELS,
  HEALTH_NOTES,
  type VisaCategory,
} from "./data/visa-rules";

export type ChecklistItem = {
  /** Section heading: "Documents", "Health", "Money", "Tech", "Logistics" */
  section: ChecklistSection;
  /** Short item title (e.g. "Apply for eVisa"). */
  title: string;
  /** One-line explanation (e.g. "Required by Indian government"). */
  detail?: string;
  /** Severity affects rendering: "must" = red dot, "should" = amber, "fyi" = gray. */
  priority: "must" | "should" | "fyi";
};

export type ChecklistSection =
  | "Documents"
  | "Health"
  | "Money"
  | "Tech"
  | "Logistics";

export type DestinationChecklist = {
  destinationName: string;
  visaCategory: VisaCategory;
  items: ChecklistItem[];
};

export function buildChecklist(
  destinationName: string,
  countryCode: string | undefined,
  countryInfo: CountryInfo | null,
): DestinationChecklist {
  const items: ChecklistItem[] = [];
  const visa: VisaCategory = countryCode
    ? (US_VISA_REQUIREMENTS[countryCode] ?? "unknown")
    : "unknown";

  // ── Documents ──────────────────────────────────────────────────────────
  items.push({
    section: "Documents",
    title: "Passport valid 6+ months past return date",
    detail: "Most countries require this — renew now if close to expiry.",
    priority: "must",
  });
  if (visa === "visa-required" || visa === "evisa") {
    items.push({
      section: "Documents",
      title:
        visa === "visa-required" ? "Apply for tourist visa" : "Apply for eVisa",
      detail: VISA_LABELS[visa],
      priority: "must",
    });
  } else if (visa === "eta") {
    items.push({
      section: "Documents",
      title: "Apply for eTA / ESTA-style authorization",
      detail: VISA_LABELS[visa],
      priority: "must",
    });
  } else if (visa === "visa-on-arrival") {
    items.push({
      section: "Documents",
      title: "Bring visa-on-arrival fee in cash (USD)",
      detail: "Buy at the airport. Have exact amount in clean USD bills.",
      priority: "should",
    });
  } else if (visa === "unknown") {
    items.push({
      section: "Documents",
      title: "Check visa requirements at travel.state.gov",
      detail: `Not in our database for ${destinationName}.`,
      priority: "must",
    });
  }
  items.push({
    section: "Documents",
    title: "Travel insurance",
    detail: "Recommended for all international trips. ~5% of trip cost.",
    priority: "should",
  });

  // ── Health ─────────────────────────────────────────────────────────────
  const health = countryCode ? HEALTH_NOTES[countryCode] : undefined;
  if (health && health.length) {
    health.forEach((note) =>
      items.push({
        section: "Health",
        title: note,
        priority: note.includes("REQUIRED") ? "must" : "should",
      }),
    );
  }
  items.push({
    section: "Health",
    title: "Pack basic medical kit",
    detail: "Pain relievers, anti-diarrheal, bandages, any prescriptions in carry-on.",
    priority: "fyi",
  });

  // ── Money ──────────────────────────────────────────────────────────────
  if (countryInfo && countryInfo.currencyCode !== "USD") {
    items.push({
      section: "Money",
      title: `Get some local currency (${countryInfo.currencyCode})`,
      detail: "ATM in destination usually beats airport exchange. Notify your bank of travel.",
      priority: "should",
    });
    items.push({
      section: "Money",
      title: "Confirm card has no foreign transaction fees",
      detail: "Or bring a no-FTF card. Saves 1-3% on every purchase.",
      priority: "should",
    });
  } else {
    items.push({
      section: "Money",
      title: "Notify your bank of travel",
      detail: "Avoid card declines on unfamiliar locations.",
      priority: "fyi",
    });
  }

  // ── Tech ───────────────────────────────────────────────────────────────
  if (countryInfo && countryInfo.plugTypes[0] !== "unknown") {
    const usPlugs = ["A", "B"];
    const needsAdapter = !countryInfo.plugTypes.some((p) => usPlugs.includes(p));
    if (needsAdapter) {
      items.push({
        section: "Tech",
        title: `Travel adapter: Type ${countryInfo.plugTypes.join("/")}`,
        detail: "A universal adapter covers most countries.",
        priority: "must",
      });
    }
  }
  if (countryInfo && countryInfo.callingCode && countryInfo.countryCode !== "US") {
    items.push({
      section: "Tech",
      title: "International phone plan or eSIM",
      detail: `Country dial code: ${countryInfo.callingCode}. Airalo / Holafly are common eSIM options.`,
      priority: "should",
    });
  }
  items.push({
    section: "Tech",
    title: `Download offline maps for ${destinationName.split(",")[0]}`,
    detail: "Google Maps → search city → menu → Download offline map.",
    priority: "fyi",
  });
  if (
    countryInfo &&
    !countryInfo.languages.some((l) => l.toLowerCase().includes("english"))
  ) {
    items.push({
      section: "Tech",
      title: `Install translation app (${countryInfo.languages[0] ?? "local language"})`,
      detail: "Google Translate offline pack + camera mode is most useful.",
      priority: "fyi",
    });
  }

  // ── Logistics ──────────────────────────────────────────────────────────
  if (countryInfo && countryInfo.drivingSide === "left") {
    items.push({
      section: "Logistics",
      title: "Drives on the LEFT side",
      detail: "Take extra care crossing streets and (especially) if renting a car.",
      priority: "should",
    });
  }
  items.push({
    section: "Logistics",
    title: "Share itinerary with someone at home",
    detail: "Email a copy of your trip plan + emergency contacts.",
    priority: "fyi",
  });

  return { destinationName, visaCategory: visa, items };
}
