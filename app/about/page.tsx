"use client";

import Link from "next/link";

/* ───── tiny helpers ──────────────────────────────────────────────── */

function GoldBadge({ n }: { n: number }) {
  return (
    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--gold-400)] to-[var(--gold-600)] text-sm font-bold text-white shadow-sm">
      {n}
    </span>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-4">
      {children}
    </h2>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-block rounded-lg border border-[var(--border)] bg-[var(--surface-alt)] px-2 py-0.5 text-xs font-mono text-[var(--fg-secondary)]">
      {children}
    </kbd>
  );
}

/* ───── main page ─────────────────────────────────────────────────── */

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 space-y-12">
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="animate-fade-in-up text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gradient-gold">
          About Roam
        </h1>
        <p className="mt-3 text-sm text-[var(--fg-secondary)] leading-relaxed max-w-lg mx-auto">
          Plan trips to any city in the world with personalized itineraries,
          cost estimates, and day-by-day plans.
        </p>
        <span className="mt-3 inline-block chip-silver text-[10px] uppercase tracking-wider font-semibold">
          v1.0
        </span>
      </section>

      {/* ── How it works ─────────────────────────────── */}
      <section className="animate-fade-in-up">
        <SectionHeading>How it works</SectionHeading>
        <div className="stagger-children space-y-4">
          {/* Step 1 */}
          <div className="card-premium rounded-2xl p-5 flex gap-4 items-start">
            <GoldBadge n={1} />
            <div>
              <h3 className="text-lg font-bold text-[var(--fg)]">
                Choose your destination
              </h3>
              <p className="mt-1 text-sm text-[var(--fg-secondary)] leading-relaxed">
                Type any city. 18 cities have curated data with hand-picked
                activities. Any other city auto-resolves via OpenStreetMap +
                Wikipedia.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="card-premium rounded-2xl p-5 flex gap-4 items-start">
            <GoldBadge n={2} />
            <div>
              <h3 className="text-lg font-bold text-[var(--fg)]">
                Set your preferences
              </h3>
              <p className="mt-1 text-sm text-[var(--fg-secondary)] leading-relaxed">
                Pick your travel style (Budget / Comfort / Luxury), set dates
                and travelers, and optionally personalize with your interests
                &mdash; foodie, adventure, culture, and more.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="card-premium rounded-2xl p-5 flex gap-4 items-start">
            <GoldBadge n={3} />
            <div>
              <h3 className="text-lg font-bold text-[var(--fg)]">
                Get your plan
              </h3>
              <p className="mt-1 text-sm text-[var(--fg-secondary)] leading-relaxed">
                Roam generates a complete trip with cost breakdown, day-by-day
                itinerary, weather forecast, local tips, and a pre-departure
                checklist.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────── */}
      <section className="animate-fade-in-up">
        <SectionHeading>Features</SectionHeading>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 stagger-children">
          <FeatureCard emoji="&#x1F5FA;&#xFE0F;" title="Any city in the world" desc="Auto-resolve via OpenStreetMap" />
          <FeatureCard emoji="&#x1F4B0;" title="Cost breakdown" desc="Flights, lodging, food, transport, activities" />
          <FeatureCard emoji="&#x1F4C5;" title="Day-by-day itinerary" desc="Auto-generated, fully editable" />
          <FeatureCard emoji="&#x2728;" title="AI personalization" desc="Foodie, adventure, culture profiles" />
          <FeatureCard emoji="&#x1F324;&#xFE0F;" title="Weather forecasts" desc="Per-day from Open-Meteo" />
          <FeatureCard emoji="&#x1F517;" title="Booking links" desc="Google Flights, Booking.com, GetYourGuide" />
          <FeatureCard emoji="&#x1F30D;" title="Multi-city trips" desc="Barcelona &rarr; Paris &rarr; Rome" />
          <FeatureCard emoji="&#x1F9F3;" title="Packing suggestions" desc="Pre-departure checklist included" />
          <FeatureCard emoji="&#x1F4B1;" title="Multi-currency" desc="USD &#8596; local currency display" />
          <FeatureCard emoji="&#x1F319;" title="Dark mode + export" desc="Print / PDF + calendar export" />
          <FeatureCard emoji="&#x1F4CA;" title="My Trips dashboard" desc="Annual budget tracking" />
          <FeatureCard emoji="&#x1F512;" title="Privacy-first" desc="All data in your browser, nothing sent to servers" />
        </div>
      </section>

      {/* ── Data sources ─────────────────────────────── */}
      <section className="animate-fade-in-up">
        <SectionHeading>Where does the data come from?</SectionHeading>
        <div className="card-premium rounded-2xl p-5 space-y-3">
          <p className="text-sm text-[var(--fg-secondary)] leading-relaxed mb-4">
            Roam is built on free, open APIs. No hidden data brokers, no
            tracking pixels &mdash; just transparent sources you can verify
            yourself.
          </p>
          <DataRow name="OpenStreetMap Nominatim" desc="City geocoding and location resolution" />
          <DataRow name="Wikipedia" desc="Tourist attractions and destination images" />
          <DataRow name="REST Countries" desc="Currency, language, plug type, driving side" />
          <DataRow name="Open-Meteo" desc="Weather forecasts per travel day" />
          <DataRow name="Frankfurter" desc="Live exchange rates" />
          <DataRow name="sunrise-sunset.org" desc="Sunrise and sunset times" />
          <div className="divider-gradient my-3" />
          <DataRow name="18 curated cities" desc="Hand-picked activities, verified cost data" />
          <DataRow name="150 country airports" desc="Shipped static data for routing" />
          <DataRow name="Tavily + Claude Haiku" desc="Optional live prices when API keys are configured" />
        </div>
      </section>

      {/* ── Accuracy ─────────────────────────────────── */}
      <section className="animate-fade-in-up">
        <SectionHeading>How accurate are the estimates?</SectionHeading>
        <div className="card-premium rounded-2xl p-5 space-y-4">
          <p className="text-sm text-[var(--fg-secondary)] leading-relaxed">
            We believe in transparency. Here&rsquo;s what to expect:
          </p>
          <div className="space-y-2">
            <AccuracyRow
              label="Curated cities"
              examples="San Diego, Barcelona, Tokyo ..."
              range="&plusmn;10&ndash;15%"
            />
            <AccuracyRow
              label="Bundled popular cities"
              examples="Uses regional cost-of-living adjustments"
              range="&plusmn;20&ndash;25%"
            />
            <AccuracyRow
              label="Auto-resolved cities"
              examples="Global averages adjusted by country"
              range="&plusmn;25&ndash;35%"
            />
            <AccuracyRow
              label="Flights"
              examples="Regional baselines + seasonal multipliers, not live fares"
              range="Estimate"
            />
          </div>
          <p className="text-xs text-[var(--muted)] leading-relaxed pt-2">
            For the most accurate results, plan trips to our 18 curated cities
            or add API keys for live pricing.
          </p>
        </div>
      </section>

      {/* ── Keyboard shortcuts ───────────────────────── */}
      <section className="animate-fade-in-up">
        <SectionHeading>Keyboard shortcuts</SectionHeading>
        <div className="card-premium rounded-2xl p-5">
          <div className="space-y-3">
            <ShortcutRow keys={["Cmd", "Enter"]} action="Submit form" />
            <ShortcutRow keys={["Cmd", "S"]} action="Save trip" />
            <ShortcutRow keys={["Cmd", "P"]} action="Print / PDF" />
            <ShortcutRow keys={["Escape"]} action="Go back" />
          </div>
          <p className="mt-3 text-xs text-[var(--muted)]">
            On Windows / Linux, use Ctrl instead of Cmd.
          </p>
        </div>
      </section>

      {/* ── Tips ─────────────────────────────────────── */}
      <section className="animate-fade-in-up">
        <SectionHeading>Tips for best results</SectionHeading>
        <div className="card-premium rounded-2xl p-5 space-y-3">
          <Tip text="Set your travel dates — seasonality affects flight and lodging prices." />
          <Tip text="Set up your profile — personalized itineraries are much better than generic ones." />
          <Tip text="Use Comfort style for realistic mid-range budgets." />
          <Tip text="Multi-city? Add cities in geographic order to minimize inter-city flight costs." />
          <Tip text="Save trips to My Trips to track your annual travel budget." />
        </div>
      </section>

      {/* ── Built with ───────────────────────────────── */}
      <section className="animate-fade-in-up">
        <SectionHeading>Built with</SectionHeading>
        <div className="card-premium rounded-2xl p-5 space-y-2 text-sm text-[var(--fg-secondary)]">
          <p>Next.js 15 + TypeScript + Tailwind CSS</p>
          <p>No database &mdash; your data stays in your browser.</p>
          <p>
            Open source on{" "}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors duration-200"
            >
              GitHub
            </a>
          </p>
        </div>
      </section>

      {/* ── Back to plan ─────────────────────────────── */}
      <div className="animate-fade-in-up text-center pb-4">
        <Link
          href="/"
          className="btn-gold inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
        >
          Start planning a trip
        </Link>
      </div>
    </main>
  );
}

/* ───── sub-components ────────────────────────────────────────────── */

function FeatureCard({
  emoji,
  title,
  desc,
}: {
  emoji: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="card-premium rounded-2xl p-4 flex flex-col gap-1.5">
      <span className="text-xl" dangerouslySetInnerHTML={{ __html: emoji }} />
      <span className="text-sm font-bold text-[var(--fg)]">{title}</span>
      <span className="text-xs text-[var(--muted)] leading-relaxed" dangerouslySetInnerHTML={{ __html: desc }} />
    </div>
  );
}

function DataRow({ name, desc }: { name: string; desc: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
      <p className="text-sm leading-relaxed">
        <span className="font-semibold text-[var(--fg)]">{name}</span>
        <span className="text-[var(--muted)]"> &mdash; {desc}</span>
      </p>
    </div>
  );
}

function AccuracyRow({
  label,
  examples,
  range,
}: {
  label: string;
  examples: string;
  range: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-[var(--surface-alt)] px-4 py-2.5">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[var(--fg)] truncate">
          {label}
        </p>
        <p className="text-xs text-[var(--muted)] truncate">{examples}</p>
      </div>
      <span
        className="shrink-0 chip-gold text-[10px] uppercase tracking-wider font-semibold"
        dangerouslySetInnerHTML={{ __html: range }}
      />
    </div>
  );
}

function ShortcutRow({ keys, action }: { keys: string[]; action: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-[var(--fg)]">{action}</span>
      <span className="flex items-center gap-1">
        {keys.map((k, i) => (
          <span key={k} className="flex items-center gap-1">
            {i > 0 && (
              <span className="text-xs text-[var(--muted)]">+</span>
            )}
            <Kbd>{k}</Kbd>
          </span>
        ))}
      </span>
    </div>
  );
}

function Tip({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 text-[var(--accent)] shrink-0 text-sm">&#x2714;</span>
      <p className="text-sm text-[var(--fg-secondary)] leading-relaxed">
        {text}
      </p>
    </div>
  );
}
