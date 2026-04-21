# Roam -- Brand & Design System

A reference for maintaining visual consistency as the app evolves. Every value below is taken from the live design tokens in `app/globals.css`.

---

## 1. Brand Identity

### Name & logo
- **Product name**: Roam
- **Logo**: The wordmark "Roam" in Playfair Display italic, displayed in the navbar. No tile or icon -- the serif itself is the brand mark.

### Voice & tone
- **Editorial, restrained, confident.** Think Conde Nast Traveler or Kinfolk. Numbers and itineraries come first; decoration second.
- **Plain-English**: No jargon. Every cost has a detail explanation behind a tap.
- **Honest**: Always show assumptions. Never bluff a number -- if it's an estimate, say so.
- **Terse**: One-sentence descriptions, never paragraphs. Italic for secondary text.

---

## 2. Color System

All colors are CSS custom properties in `:root` and `html.dark` blocks in `globals.css`.

### Terracotta -- the primary accent

A warm sienna terracotta. Used for primary actions, active states, accent highlights, and interactive elements. Replaces the previous gold palette.

| Token | Light | Dark |
|---|---|---|
| `--terracotta` | `#b5694d` | `#d49478` |
| `--terracotta-light` | `#d49478` | `#b5694d` |
| `--terracotta-dark` | `#8e4f38` | `#e8b49e` |
| `--terracotta-muted` | `#f5ebe5` | `#2a2220` |

### Brown scale -- warm neutrals

| Token | Light | Dark |
|---|---|---|
| `--brown-900` | `#1c1410` | `#f5ede4` |
| `--brown-800` | `#2c2018` | `#e8ddd2` |
| `--brown-700` | `#3d2e22` | `#d4c8bb` |
| `--brown-600` | `#5c4535` | `#b5a99e` |
| `--brown-500` | `#7a6252` | `#8a7e74` |
| `--brown-400` | `#8a7e74` | `#7a6e64` |
| `--brown-300` | `#b5a99e` | `#5c5048` |
| `--brown-200` | `#d4ccc4` | `#3d3530` |
| `--brown-100` | `#e8e2da` | `#302c28` |

### Sage green -- nature/success accent

| Token | Light | Dark |
|---|---|---|
| `--sage` | `#7c8c6e` | `#9aab8c` |
| `--sage-light` | `#e8ede4` | `#222820` |

### Semantic surface tokens

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--bg` | `#faf7f2` (warm cream) | `#141210` | App background base |
| `--fg` | `#1c1410` | `#f5ede4` | Primary text |
| `--fg-secondary` | `#5c4535` | `#d4c8bb` | Secondary text |
| `--surface` | `#ffffff` | `#1e1a16` | Card backgrounds |
| `--surface-hover` | `#faf7f2` | `#282420` | Hover surfaces |
| `--muted` | `#8a7e74` | `#8a7e74` | Tertiary text, labels |
| `--border` | `#e8e2da` | `#302c28` | Default borders |
| `--border-subtle` | `#f3ede4` | `#282420` | Subtle/inner borders |
| `--accent` | `#b5694d` | `#d49478` | Primary accent |
| `--accent-hover` | `#8e4f38` | `#e8b49e` | Hover accent |
| `--accent-light` | `#f5ebe5` | `#2a2220` | Accent tinted background |

### Body background

Flat solid warm cream `#faf7f2`. No gradients, no noise textures. Editorial pages use flat color -- let the typography and whitespace carry the design.

**Dark mode**: warm dark `#141210`, never pure black.

### Semantic colors

| Purpose | Color |
|---|---|
| Success | `#059669` (emerald) |
| Warning | `#d97706` (amber) |
| Danger | `#dc2626` (red) |

### Selection

```css
::selection { background-color: var(--terracotta-muted); color: var(--brown-900); }
```

---

## 3. Typography

### Fonts

**Serif headings**: Playfair Display (loaded via `next/font/google`, CSS variable `--font-playfair`). Used for all h1/h2/h3 elements. Creates the editorial feel immediately.

**Sans-serif body**: Inter (loaded via `next/font/google`, CSS variable `--font-inter`). OpenType features `cv11` (alternate 1) and `ss01` (geometric numerals).

```css
body {
  font-family: var(--font-inter, 'Inter', ui-sans-serif, system-ui, sans-serif);
}

h1, h2, h3 {
  font-family: var(--font-playfair, 'Playfair Display', Georgia, serif);
  letter-spacing: -0.02em;
}
```

### Type scale

| Use case | Style |
|---|---|
| Page H1 | `text-5xl sm:text-6xl font-bold` Playfair Display, often italic |
| Section heading | `text-lg font-bold` Playfair Display |
| Card heading | `text-lg font-bold` Playfair Display |
| Big metric | `text-5xl font-bold tabular-nums` Playfair Display |
| Body | `text-sm text-[var(--fg)] leading-relaxed` Inter |
| Caption / subtitle | `text-sm italic text-[var(--muted)]` Inter italic |
| Chip / micro-label | `text-[10px] uppercase tracking-wider font-semibold` |

### Tabular numerals

Every dollar amount, percentage, and numeric metric uses `tabular-nums` (via Tailwind class or `<AnimatedNumber>` component).

---

## 4. Shadows

All shadows are tinted with warm brown `rgba(28, 20, 16, ...)`, never black.

| Token | Value |
|---|---|
| `--shadow-xs` | `0 1px 2px rgba(28, 20, 16, 0.04)` |
| `--shadow-sm` | `0 1px 3px rgba(28, 20, 16, 0.06), 0 1px 2px rgba(28, 20, 16, 0.04)` |
| `--shadow-md` | `0 4px 6px -1px rgba(28, 20, 16, 0.06), 0 2px 4px -2px rgba(28, 20, 16, 0.04)` |
| `--shadow-lg` | `0 10px 15px -3px rgba(28, 20, 16, 0.07), 0 4px 6px -4px rgba(28, 20, 16, 0.04)` |
| `--shadow-xl` | `0 20px 25px -5px rgba(28, 20, 16, 0.08), 0 8px 10px -6px rgba(28, 20, 16, 0.04)` |

**Dark mode**: shadows use `rgba(0, 0, 0, ...)` at higher opacity.

---

## 5. Editorial Utility Classes

### `.card-editorial`
The default card surface. Pure white background with barely-there border and subtle warm shadow.
```css
background: var(--surface);
border: 1px solid var(--border-subtle);
border-radius: 1rem;
box-shadow: 0 1px 3px rgba(28, 20, 16, 0.04);
```

### `.card-editorial-hover`
Add to `.card-editorial` for hover lift: `translateY(-1px)` + enhanced shadow.

### `.btn-primary`
Flat terracotta CTA button. No gradient -- editorial design is about restraint.
```css
background: var(--terracotta);
color: white;
box-shadow: var(--shadow-sm);
```

### `.glass`
Frosted glass for nav and dropdowns with warm cream tint.

### `.focus-ring`
Terracotta glow focus ring replacing browser defaults.

### `.chip-accent` / `.chip-muted`
- **Accent** (active/primary): terracotta-tinted background + terracotta text
- **Muted** (info/secondary): warm cream background + brown-400 text

### `.divider-gradient`
Thin 1px horizontal rule in `var(--border)`. No gradient fade-in/out -- just a clean editorial rule.

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
- **`fade-in-up`** -- 12px translateY + opacity, 400ms. Page-load sections.
- **`fade-in`** -- opacity only, 200ms. Expanding content.
- **`scale-in`** -- 0.95 to 1.0 + opacity, 200ms. Modals.
- **`shimmer`** -- moving warm gradient, 1.5s loop. Loading bars.
- **`warm-pulse`** -- opacity 1 to 0.5, 1.5s loop. Loading dots.

### Rules
- Page sections animate with `animate-fade-in-up` on load.
- Hover transitions: 200ms `ease-out-soft`. Never longer.
- No pulsing buttons -- editorial design is confident, not attention-seeking.
- Number counters: 800ms ease-out-cubic via `<AnimatedNumber>`.

---

## 7. Component Patterns

### Card
```
card-editorial card-editorial-hover rounded-2xl p-6
```
All content containers use this base. Generous padding (p-6 to p-8).

### Chips
- **Accent** (active/primary): `chip-accent`
- **Muted** (info/secondary): `chip-muted`

### Form inputs
```
rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-lg
focus-ring transition-all duration-200
```

### Buttons
- Primary: `btn-primary rounded-xl px-6 py-4 text-lg`
- Secondary: `border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]`

### Hero (trip results)
- **With image**: Full-width, h-72 to h-80, dark gradient overlay from bottom, white serif title overlaid
- **Without image**: Large Playfair Display title in dark brown, generous vertical spacing

---

## 8. Spacing & Radius

| Radius | Value | Usage |
|---|---|---|
| `rounded-lg` | 8px | Small buttons, chips |
| `rounded-xl` | 12px | Inputs, inner cards, buttons |
| `rounded-2xl` | 16px | Main cards, panels, modals |

| Spacing | Usage |
|---|---|
| Page padding | `px-6 py-12` (form pages), `py-12` (results) |
| Card padding | `p-6` default, `p-8` for premium sections |
| Section spacing | `mt-12` between major sections, `space-y-8` inside forms |
| Grid gaps | `gap-3` for compact, `gap-4` for content |

Whitespace is a feature -- editorial design breathes.

---

## 9. Dark Mode

Dark mode uses **warm dark tones**, never pure black:
- Background: `#141210` (warm near-black)
- Surface: `#1e1a16` (warm dark brown)
- Hover: `#282420` (slightly lighter)
- Borders: `#302c28` (dark brown-tinted)

The terracotta accent shifts lighter in dark mode (`#d49478`) for readability.

Activated via `html.dark` class, bootstrapped before hydration to prevent flash.

---

## 10. Don'ts

- Don't use bright/saturated blues or teals. The palette is warm and desaturated.
- Don't use black shadows. Shadows are warm brown-tinted.
- Don't use gradient text. Editorial headings are plain serif in dark color.
- Don't add gradient backgrounds to cards. Pure white surface, let typography do the work.
- Don't use pulsing/glowing buttons. Editorial design is confident, not needy.
- Don't add noise textures or body gradients. Flat warm cream is the editorial base.
- Don't use sharp corners. Minimum radius is `rounded-lg` (8px).
- Don't animate longer than 300ms (except number counters at 800ms).
- Don't use pure black (`#000`) in dark mode. Use the warm dark tokens.
- Don't show a number without `tabular-nums`.
- Don't use sans-serif for headings. Playfair Display creates the editorial feel.
- Don't skip italic for secondary text. Descriptions, subtitles, and meta info should be italic.

---

## 11. Data sources

The app pulls from these free, no-key APIs:
- **OpenStreetMap Nominatim** -- city geocoding
- **Wikipedia** -- tourist attraction catalogs
- **REST Countries** -- currency, language, plug type
- **sunrise-sunset.org** -- sun times
- **Frankfurter** -- exchange rates

Plus shipped static data: 18 curated cities, 150 country airports, visa rules, tier price averages.

Optional (with API keys): Tavily + Claude Haiku for live flight/hotel/activity discovery.
