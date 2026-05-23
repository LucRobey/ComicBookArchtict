# ARC 3.0: Visual Identity

> **Aesthetic:** Modern Drafting Board (Dark)
> **Mood:** Clean, analog-inspired engineering tool — grounded and professional, never sci-fi or retro.

This document is the single source of truth for all visual design decisions. Every value below is derived from the **actual** `@theme` block in [`app/src/index.css`](file:///c:/Users/Users/Desktop/Emy%20christmass/architecture%203.0/app/src/index.css).

---

## 1. Color System

All colors are defined as Tailwind v4 `@theme` tokens in `index.css`. In code, always use `var(--color-*)` — **never hardcode hex values**.

### Surfaces (Dark)

| Token | Hex | Usage |
|---|---|---|
| `--color-canvas` | `#0c0a0a` | Deepest background (body, full-bleed areas) |
| `--color-surface-raised` | `#141212` | Main workspace background |
| `--color-surface` | `#1f1b1b` | Panel backgrounds (sidebars, headers, dialogs) |
| `--color-panel-raised` | `#2a2424` | Elevated cards, raised sections |
| `--color-secondary` | `#2a2424` | Secondary button fills, tab bar background |

### Text (Light-on-Dark)

| Token | Hex | Usage |
|---|---|---|
| `--color-text-base` | `#f5f2eb` | Primary body text |
| `--color-text-sub` | `#dcd8cf` | Secondary text, descriptions |
| `--color-muted` | `#908a80` | Tertiary text, timestamps, placeholders |

### Accent (Blue)

| Token | Hex | Usage |
|---|---|---|
| `--color-accent-primary` | `#3b82f6` | Links, active states, focus rings |
| `--color-accent-hover` | `#60a5fa` | Hover states on accent elements |
| `--color-accent-dim` | `rgba(59, 130, 246, 0.15)` | Active tab backgrounds, subtle highlights |
| `--color-primary` | `#3b82f6` | Alias for accent-primary (Tailwind utility compat) |
| `--color-primary-hover` | `#60a5fa` | Alias for accent-hover |
| `--color-primary-foreground` | `#ffffff` | Text on primary buttons |

### Brand

| Token | Hex | Usage |
|---|---|---|
| `--color-brand` | `#1E3A8A` | Blueprint-blue brand color, focus outlines |
| `--color-brand-hover` | `#1D4ED8` | Brand hover state |

### Semantic

| Token | Hex | Usage |
|---|---|---|
| `--color-danger` | `#ef4444` | Error states, destructive actions |
| `--color-danger-dim` | `rgba(239, 68, 68, 0.12)` | Error backgrounds |
| `--color-success` | `#10b981` | Success states, confirmations |
| `--color-success-dim` | `rgba(16, 185, 129, 0.12)` | Success backgrounds |
| `--color-warning` | `#f59e0b` | Warnings, attention-needed |

### Border

| Token | Hex | Usage |
|---|---|---|
| `--color-border` | `#2e2a2a` | Standard borders between panels |
| `--color-border-subtle` | `rgba(46, 42, 42, 0.6)` | Subtle dividers, tab bar bottom |
| `--color-border-accent` | `#3b82f6` | Accent-colored borders (active inputs) |

### Legacy Aliases

The `:root` block in `index.css` maps older variable names to canonical tokens. **New code must use `--color-*` names.** Legacy aliases (`--panel-bg`, `--bg-color`, `--accent-primary`, `--text-main`, etc.) exist only for backward compatibility with older CSS files.

---

## 2. Typography

| Token | Value | Usage |
|---|---|---|
| `--font-heading` | `'Space Grotesk', sans-serif` | All headings (h1–h6) |
| `--font-sans` | `'Inter', sans-serif` | Body text, UI labels, buttons |
| `--font-mono` | `'IBM Plex Mono', monospace` | Code, badges, export buttons, data labels |

### Type Rules
- **Headings:** `font-weight: 600`, `letter-spacing: -0.02em`, `line-height: 1.25`
- **Body:** `font-size: 14px`, `line-height: 1.6`
- **Antialiasing:** `-webkit-font-smoothing: antialiased` on body

---

## 3. Motion

| Token | Value | Usage |
|---|---|---|
| `--duration-fast` | `150ms` | Micro-interactions (hover, focus) |
| `--duration-base` | `250ms` | Standard transitions (panel open/close, tab switch) |
| `--ease-out` | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | Default easing |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Bouncy/playful (button press, popover entry) |

### Motion Rules
- Always use token durations — **never hardcode `200ms` or `0.3s`**
- Pair `--duration-fast` with `--ease-out` for hover states
- Pair `--duration-base` with `--ease-spring` for entrance animations
- Respect `prefers-reduced-motion` (already handled in `index.css` reset)

---

## 4. UI Elements

### Buttons

| Style | Appearance |
|---|---|
| **Primary (`.export-btn`)** | Gradient blue (`accent-primary → #2563eb`), white text, `border-radius: 8px`, lift on hover |
| **Nav (`.nav-btn`)** | Transparent, muted text, accent-dim background when active |
| **Destructive** | `--color-danger` background |
| **Success** | `--color-success` background |

### Inputs
- Border: `var(--color-border)`, `border-radius: 5–8px`
- Background: light variant of surface
- Focus: `border-color: var(--color-accent-primary)`

### Badges
- `var(--color-accent-dim)` background, `var(--color-accent-hover)` text
- `border-radius: 20px`, `font-family: var(--font-mono)`, `font-size: 0.7rem`

### Scrollbars
- Width: `6px`, thumb: `var(--color-border)`, hover: `var(--color-muted)`
- Track: transparent

---

## 5. Tech Stack

| Layer | Technology |
|---|---|
| Framework | React (TypeScript) + Vite |
| Styling Engine | Tailwind CSS v4 (`@tailwindcss/postcss`) |
| Token System | CSS-first via `@theme {}` in `app/src/index.css` |
| Icons | Lucide React |
| No autoprefixer | Tailwind v4 uses Lightning CSS internally |

---

## 6. Forbidden Patterns

❌ **Never** use light/white panel backgrounds — the app is dark-themed
❌ **Never** use 1990s retro bevels (`border-outset`, thick gray Windows 95 panels)
❌ **Never** use futuristic, cyber, or sci-fi elements (neon glows, matrix rain)
❌ **Never** define new CSS custom properties in individual `styles/*.css` files — add them to `index.css`
❌ **Never** hardcode hex values that already have a token — use `var(--color-*)`
❌ **Never** use `!important` in component styles
❌ **Never** use drop shadows heavier than `box-shadow: 0 1px 3px rgba(0,0,0,0.3)` on panels
