# Roam — Brand & Design System

A reference for maintaining visual consistency as the app evolves. Every value below is taken from the live design tokens in `app/globals.css`.

---

## 1. Brand Identity

### Name & logo
- **Product name**: Roam
- **Logo**: A rounded-lg gold-gradient tile containing the letter **"R"** in white, paired with the wordmark in `text-[var(--fg)]`.
- **Logo tile**: `rounded-lg bg-gradient-to-br from-[var(--gold-400)] to-[var(--gold-600)]`, 32x32 (h-8 w-8), white bold "R" centered.

### Voice & tone
- **Premium, restrained, confident.** Numbers and itineraries come first; decoration second.
- **Plain-English**: No jargon. Every cost has a detail explanation behind a tap.
- **Honest**: Always show assumptions. Never bluff a number — if it's an estimate, say so.
- **Terse**: One-sentence descriptions, never paragraphs.

---

## 2. Color System

All colors are CSS custom properties in `:root` and `html.dark` blocks in `globals.css`.

### Gold — the primary brand color

A warm, rich gold. Used for primary actions, the logo tile, active states, gradient headings, and accent highlights.

| Token | Light | Dark |
|---|---|---|
| `--gold-50` | `#faf8f3` | `#1a1612` |
| `--gold-100` | `#f5edd8` | `#231e17` |
| `--gold-200` | `#e8d5a8` | `#362512` |
| `--gold-300` | `#d4b76e` | `#51391a` |
| `--gold-400` | `#c5964a` | `#c5964a` (unchanged) |
| `--gold-500` | `#a67c3a` | `#d4b76e` |
| `--gold-600` | `#8a642e` | `#e8d5a8` |
| `--gold-700` | `#6d4e24` | `#f5edd8` |
| `--gold-800` | `#51391a` | `#faf8f3` |
| `--gold-900` | `#362512` | `#ffffff` |

### Silver / Platinum — secondary palette

| Token | Light | Dark |
|---|---|---|
| `--silver-100` | `#f5f5f4` | `#1a1612` |
| `--silver-200` | `#e7e5e4` | `#231e17` |
| `--silver-300` | `#d6d3d1` | `#362512` |
| `--silver-400` | `#a8a29e` | `#78716c` |
| `--silver-500` | `#78716c` | `#a8a29e` |

### Semantic surface tokens

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--bg` | `#faf8f3` | `#110e0b` | App background base |
| `--fg` | `#362512` | `#f5edd8` | Primary text |
| `--fg-secondary` | `#51391a` | `#e8d5a8` | Secondary text |
| `--surface` | `#ffffff` | `#1a1612` | Card backgrounds |
| `--surface-hover` | `#faf8f3` | `#231e17` | Hover surfaces |
| `--surface-alt` | `#f5edd8` | `#231e17` | Alternate inset areas |
| `--muted` | `#78716c` | `#a8a29e` | Tertiary text, labels |
| `--border` | `#e8d5a8` | `#362512` | Default borders |
| `--border-subtle` | `#f5edd8` | `#231e17` | Subtle/inner borders |
| `--accent` | `#c5964a` | `#d4b76e` | Primary accent |
| `--accent-hover` | `#a67c3a` | `#e8d5a8` | Hover accent |
| `--accent-light` | `#faf8f3` | `#231e17` | Accent tinted background |
| `--accent-muted` | `#f5edd8` | `#362512` | Muted accent background |

### Body background (the signature look)

```css
body::before {
  background: linear-gradient(180deg, #ffffff 0%, #faf8f3 30%, #f5edd8 100%);
  position: fixed;
}
```

A subtle white-to-warm-beige vertical gradient, fixed. Layered on top: an SVG fractal-noise texture at `opacity: 0.03` via `body::after`. Gives every screen a faint "premium paper" feel.

**Dark mode**: gradient shifts to `#110e0b → #1a1612 → #110e0b`, texture at `opacity: 0.02`.

### Semantic colors

| Purpose | Color | Background variant |
|---|---|---|
| Success | `#059669` (emerald) | `emerald-50` bg |
| Warning | `#d97706` (amber) | `amber-50` bg |
| Danger | `#dc2626` (red) | `red-50` bg |

### Selection

```css
::selection { background-color: var(--gold-200); color: var(--gold-900); }
```

---

## 3. Typography

### Font

```css
font-family: var(--font-inter, 'Inter', ui-sans-serif, system-ui, sans-serif);
font-feature-settings: "cv11", "ss01";
```

**Inter only** — loaded via `next/font/google` with CSS variable `--font-inter`. OpenType features `cv11` (alternate 1) and `ss01` (geometric numerals).

### Tracking

```css
h1, h2, h3, h4, h5, h6 { letter-spacing: -0.025em; }
```

### Tabular numerals — mandatory for financial data

Every dollar amount, percentage, and numeric metric uses `tabular-nums` (via Tailwind class or the `<AnimatedNumber>` component which applies it automatically).

### Type scale

| Use case | Classes |
|---|---|
| Page H1 | `text-4xl font-bold tracking-tight` + `text-gradient-gold` |
| Section heading | `text-xs font-semibold uppercase tracking-wider text-[var(--muted)]` |
| Card heading | `text-lg font-bold text-[var(--fg)]` |
| Big metric | `text-5xl font-bold tabular-nums` (via AnimatedNumber) |
| Body | `text-sm text-[var(--fg)] leading-relaxed` |
| Caption | `text-xs text-[var(--muted)]` |
| Chip / micro-label | `text-[10px] uppercase tracking-wider font-semibold` |

---

## 4. Shadows

All shadows are tinted with warm brown `rgba(36, 37, 18, ...)`, never black.

| Token | Value |
|---|---|
| `--shadow-xs` | `0 1px 2px rgba(36, 37, 18, 0.04)` |
| `--shadow-sm` | `0 1px 3px rgba(..., 0.06), 0 1px 2px rgba(..., 0.04)` |
| `--shadow-md` | `0 4px 6px -1px rgba(..., 0.06), 0 2px 4px -2px rgba(..., 0.04)` |
| `--shadow-lg` | `0 10px 15px -3px rgba(..., 0.07), 0 4px 6px -4px rgba(..., 0.04)` |
| `--shadow-xl` | `0 20px 25px -5px rgba(..., 0.08), 0 8px 10px -6px rgba(..., 0.04)` |

**Dark mode**: shadows use `rgba(0, 0, 0, ...)` at higher opacity.

---

## 5. Premium Utility Classes

### `.card-premium`
The default card surface. Subtle gradient + warm border + soft shadow.
```css
background: linear-gradient(135deg, var(--surface) 0%, var(--gold-50) 100%);
border: 1px solid var(--border-subtle);
box-shadow: var(--shadow-sm);
```

### `.card-premium-hover`
Add to `.card-premium` for hover lift: `translateY(-1px)` + `shadow-md`.

### `.btn-gold`
Gold gradient CTA button with inset top highlight + pressed state.
```css
background: linear-gradient(135deg, var(--gold-400) 0%, var(--gold-500) 100%);
box-shadow: var(--shadow-sm), inset 0 1px 0 rgba(255, 255, 255, 0.15);
```

### `.text-gradient-gold`
Gradient text for headings: `gold-400 → gold-600 → gold-400` at 135deg.

### `.glass`
Frosted glass for nav and dropdowns:
```css
background: rgba(255, 255, 255, 0.8);
backdrop-filter: blur(12px) saturate(180%);
border: 1px solid rgba(255, 255, 255, 0.6);
```

### `.focus-ring`
Gold glow focus ring replacing browser defaults:
```css
outline: none;
box-shadow: 0 0 0 3px rgba(197, 150, 74, 0.3);
border-color: var(--gold-400);
```

### `.chip-gold` / `.chip-silver`
Pill-shaped badges for status, tags, context.

### `.divider-gradient`
Soft fade-in/fade-out 1px horizontal divider.

---

## 6. Motion & Animation

### Tokens
```css
--ease-out-soft: cubic-bezier(0.22, 0.61, 0.36, 1);
--transition-fast: 150ms;
--transition-base: 200ms;
--transition-slow: 300ms;
```

### Keyframes
- **`fade-in-up`** — 12px translateY + opacity, 400ms. Page-load sections.
- **`fade-in`** — opacity only, 200ms. Expanding content.
- **`scale-in`** — 0.95 → 1.0 + opacity, 200ms. Modals.
- **`slide-in-right`** — 20px translateX + opacity, 300ms. Toast notifications.
- **`shimmer`** — moving gold gradient, 1.5s loop. Loading bars.
- **`gold-pulse`** — opacity 1 → 0.4, 1.5s loop. Loading dots.

### `.stagger-children`
Sequentially animates direct children with 60ms delay between each (up to 10).

### Rules
- Page sections animate with `animate-fade-in-up` on load.
- Hover transitions: 200ms `ease-out-soft`. Never longer.
- Active/pressed states: instant (no transition).
- Number counters: 800ms ease-out-cubic via `<AnimatedNumber>`.

---

## 7. Component Patterns

### Card
```
card-premium card-premium-hover rounded-2xl p-5
```
All content containers use this base.

### Chips
- **Gold** (active/primary): `chip-gold` — gold-50 bg + gold-400 text + gold-200 border
- **Silver** (info/muted): `chip-silver` — silver-100 bg + silver-500 text + silver-200 border

### Form inputs
```
rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-lg
focus-ring transition-all duration-200
```

### Buttons
- Primary: `btn-gold rounded-xl px-6 py-4 text-lg`
- Secondary: `card-premium card-premium-hover border border-[var(--border)]`

### Stepper (nights/travelers)
```
h-10 w-10 rounded-xl border border-[var(--border)] bg-[var(--surface)]
hover:border-[var(--gold-300)] focus-ring
```

### Modal
- Overlay: `fixed inset-0 bg-black/40 backdrop-blur-sm animate-fade-in`
- Body: `card-premium rounded-2xl p-6 animate-scale-in max-w-md`

### Toast
- Container: `fixed bottom-6 right-6 z-50`
- Item: `card-premium rounded-xl shadow-lg animate-slide-in-right`
- Auto-dismiss: 3s with shrinking progress bar

---

## 8. Spacing & Radius

| Radius | Value | Usage |
|---|---|---|
| `rounded-lg` | 8px | Logo tile, small buttons, chips |
| `rounded-xl` | 12px | Inputs, inner cards, buttons |
| `rounded-2xl` | 16px | Main cards, panels, modals |

| Spacing | Usage |
|---|---|
| Page padding | `px-6 py-12` (form pages), `py-10` (results) |
| Card padding | `p-5` default, `p-6` for premium sections |
| Section spacing | `mt-8` between major sections, `space-y-6` inside |
| Grid gaps | `gap-3` for compact, `gap-4` for content |

---

## 9. Dark Mode

Dark mode uses **warm dark tones**, never pure black:
- Background: `#110e0b` (warm near-black)
- Surface: `#1a1612` (warm dark brown)
- Hover: `#231e17` (slightly lighter)
- Borders: `#362512` (dark gold-tinted)

The gold palette inverts: lighter golds become darker, darker golds become lighter. The accent gold (`--gold-400: #c5964a`) stays the same in both themes.

Activated via `html.dark` class, bootstrapped before hydration to prevent flash:
```js
// In layout.tsx <head>
var s = localStorage.getItem('roam.theme');
var p = window.matchMedia('(prefers-color-scheme: dark)').matches;
if (s === 'dark' || (!s && p)) document.documentElement.classList.add('dark');
```

---

## 10. Don'ts

- Don't use bright/saturated blues or teals. The gold is warm and desaturated.
- Don't use black shadows. Shadows are warm brown-tinted.
- Don't use the gold accent everywhere. Use it for primary actions and highlights; silver for everything else.
- Don't introduce a second font. Inter does everything.
- Don't use sharp corners. Minimum radius is `rounded-lg` (8px).
- Don't animate longer than 300ms (except number counters at 800ms).
- Don't stack solid backgrounds. Always layer the warm gradient body underneath cards.
- Don't show a number without `tabular-nums`.
- Don't use pure black (`#000`) in dark mode. Use the warm dark tokens.

---

## 11. Data sources

The app pulls from these free, no-key APIs:
- **OpenStreetMap Nominatim** — city geocoding
- **Wikipedia** — tourist attraction catalogs
- **REST Countries** — currency, language, plug type
- **sunrise-sunset.org** — sun times
- **Frankfurter** — exchange rates

Plus shipped static data: 18 curated cities, 150 country airports, visa rules, tier price averages.

Optional (with API keys): Tavily + Claude Haiku for live flight/hotel/activity discovery.
