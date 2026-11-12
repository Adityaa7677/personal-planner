# Design System & Aesthetics Guide

## 1. Atmosphere & Visual Philosophy
- **Feel**: Calm, editorial, personal. Evoking the tactile, focused experience of a high-grade paper journal or clothbound notebook (such as Leuchtturm1917, Midori MD, or Smythson), deliberately avoiding the look and feel of a bloated B2B SaaS dashboard.
- **Rhythm**: Generous whitespace, disciplined alignment, an exact 8px spacing grid, and deliberate typographic pacing.
- **Craft**: Subtle 1px hairline rules, crisp dividers, quiet hover interactions, and purposeful hierarchy.

---

## 2. Color System
All colors are defined as CSS variables in `src/styles/tokens.css`.

### Light Mode (The Paper Desk)
- **Paper Background (`--color-paper`)**: `#F6F3EE` (Warm off-white, tactile linen/cotton feel)
- **Paper Surface / Card (`--color-paper-surface`)**: `#FFFFFF` (Crisp page leaf)
- **Paper Subdued (`--color-paper-muted`)**: `#EFECE6` (Subtle tint for wells, inactive zones)
- **Border / Hairline (`--color-hairline`)**: `#E2DDD5` (1px delicate rule)
- **Hairline Strong (`--color-hairline-strong`)**: `#C8C2B7`
- **Ink Primary (`--color-ink`)**: `#1B1A17` (Deep near-black archival ink)
- **Ink Secondary (`--color-ink-secondary`)**: `#5C5850` (Pencil graphite tone)
- **Ink Muted (`--color-ink-muted`)**: `#8E897F` (Warm stone annotation text)

### Dark Mode (The Nocturne Desk)
- **Paper Background (`--color-paper`)**: `#141311` (Deep warm charcoal paper)
- **Paper Surface (`--color-paper-surface`)**: `#1C1B18` (Slightly elevated book cloth)
- **Paper Subdued (`--color-paper-muted`)**: `#24221E`
- **Border / Hairline (`--color-hairline`)**: `#2E2C27` (1px subtle dark boundary)
- **Hairline Strong (`--color-hairline-strong`)**: `#3E3A33`
- **Ink Primary (`--color-ink`)**: `#EDE8E1` (Warm bone white)
- **Ink Secondary (`--color-ink-secondary`)**: `#ADA79B`
- **Ink Muted (`--color-ink-muted`)**: `#787369`

### The Single Accent Color
- **Accent (`--color-accent`)**: `#B45309` (Warm amber / terracotta bookcloth marker ribbon)
- **Accent Muted (`--color-accent-subtle`)**: Light: `#FBF3E8` | Dark: `#2E2113`
- *Strict Rule*: Only ONE accent color is allowed across the entire core chrome.

### Muted Goal Palette (Desaturated, Earthy)
Goal badges and category markers must remain quiet and desaturated to preserve the editorial quietude:
- **Sage / Herb**: `#6B7F6D`
- **Terracotta / Clay**: `#A86D5B`
- **Slate / Indigo Wash**: `#5B7085`
- **Dusty Sand / Ochre**: `#9C8559`
- **Heather / Plum**: `#7E6A7D`
- **Graphite**: `#6E6B65`

---

## 3. Typography
- **Headings & Big Numbers**: Characterful Serif (`Fraunces, Georgia, serif`)
  - Optical sizing, high contrast, warm literary cadence.
- **Body & UI Elements**: Clean Sans (`Inter, -apple-system, BlinkMacSystemFont, sans-serif`)
  - Legible, quiet, unopinionated structure for interactive items and inputs.
- **Times, Durations & Numerals**: Tabular Numbers (`font-variant-numeric: tabular-nums`)
  - Strict alignment across time blocks and schedule windows.

---

## 4. Spacing, Borders & Iconography
- **Grid**: Strict 8px modular scale (`--space-1: 8px`, `--space-2: 16px`, `--space-3: 24px`, `--space-4: 32px`, `--space-6: 48px`, `--space-8: 64px`).
- **Hairline Borders**: Pure 1px borders (`border: 1px solid var(--color-hairline)`).
- **Corner Radii**: Restrained and subtle (`--radius-sm: 2px`, `--radius-md: 4px`, `--radius-lg: 6px`).
- **Iconography**: Thin-stroke Lucide icons (`stroke-width="1.5"` or `1.25"`), tinted in ink-secondary.

---

## 5. Strict Forbidden List
- ❌ **NO purple/blue gradients or generic rainbow mesh backgrounds.**
- ❌ **NO glassmorphism, backdrop-blur milkiness, or iridescent borders.**
- ❌ **NO emoji as icons.** Always use thin-stroke Lucide SVG icons.
- ❌ **NO default shadcn/Tailwind corporate look** (e.g. Slate-900 starkness, heavy glowing shadows).
- ❌ **NO heavy drop shadows.** Paper relies on hairlines and tonal contrast, not diffused blur shadows.
- ❌ **NO rounded-2xl or rounded-3xl pills on everything.** Corners are book-trimmed and crisp (2px–6px max).

---

## 6. Motion & Interaction
- **Duration**: `150ms` to `220ms` only.
- **Timing Function**: Pure `ease-out` (`cubic-bezier(0, 0, 0.2, 1)`).
- **Strict Rule**: **No bounce, no overshoot, no spring physics, no playful wobble.** Micro-interactions should feel like high-grade stationery sliding into place.
- **Accessibility**: Honor `prefers-reduced-motion` at all times.
