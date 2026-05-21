# Preferred Tech Stack & Implementation Rules

When generating code or UI components for ARC 3.0, strictly adhere to the "Modern Drafting Board" aesthetic. It should feel like a contemporary, clean engineering tool—grounded and professional, without being "sci-fi" or "retro Windows".

## Core Stack
* **Framework:** React (TypeScript) + Vite
* **Styling Engine:** Tailwind CSS v4 (`@tailwindcss/postcss`)
* **Token System:** CSS-first via `@theme {}` in `app/src/index.css` — generates utility classes automatically
* **Icons:** Lucide React
* **No autoprefixer** — Tailwind v4 uses Lightning CSS internally

## Visual Implementation Guidelines (The "Modern Drafting Board" Aesthetic)

### 1. Tailwind & Theming
* All design tokens are defined in the `@theme {}` block inside `app/src/index.css`. Do not use a separate `design-tokens.json` file.
* **Canonical token names** (use these in new CSS/JSX):
  - Surfaces: `--color-surface` (`#FAFAF9`), `--color-surface-raised` (`#F3F4F6`), `--color-canvas` (`#0D1117`)
  - Text: `--color-text-base` (`#1F2937`), `--color-text-sub` (`#374151`), `--color-muted` (`#6B7280`)
  - Accent: `--color-accent-primary` (`#3B82F6`), `--color-accent-hover` (`#60A5FA`)
  - Brand: `--color-brand` (`#1E3A8A`), `--color-brand-hover` (`#1D4ED8`)
  - Semantic: `--color-danger`, `--color-success`, `--color-warning`
  - Motion: `--duration-fast` (`150ms`), `--duration-base` (`250ms`)
* **Legacy aliases** (`--panel-bg`, `--bg-color`, `--accent-primary`, `--dur-fast`, etc.) remain valid in existing CSS files via the `:root {}` alias map in `index.css` — but new code should prefer the `--color-*` / `--duration-*` names.
* **Backgrounds:** Use `var(--color-surface-raised)` for the main workspace background. The blueprint table effect uses `var(--color-brand)`.
* **UI Panels:** Sidebar, headers, and floating dialogs use `var(--color-surface)`. Sharp contrast against the brand-blue background.
* **Text:** Use `var(--color-text-base)` on light panels. `var(--color-muted)` for secondary text.
* **No Glows:** Do NOT use drop shadows, glowing text, or neon cyan highlights. Keep it flat and grounded. A subtle `box-shadow` on panels is acceptable.

### 2. Component Patterns
* **Buttons:** Modern, flat buttons. Primary actions use `.export-btn` (gradient blue). Destructive uses `.btn-danger`. Confirmations use `.btn-success`.
* **Typography:** `Space Grotesk` for headings (`var(--font-heading)`), `Inter` for body (`var(--font-sans)`), `IBM Plex Mono` for code/labels (`var(--font-mono)`).
* **Inputs:** Clean borders (`var(--color-border)`), light backgrounds, `border-radius: 5–8px`. Focus state: `border-color: var(--color-accent-primary)`.
* **Transitions:** Always use `var(--dur-fast)` or `var(--dur-base)` with `var(--ease-out)` or `var(--ease-spring)`. Never hardcode durations.

### 3. Forbidden Patterns
* Do NOT use 1990s retro bevels (no `border-outset`, no thick gray Windows 95 panels).
* Do NOT use futuristic, cyber, or sci-fi elements (no neon glows).
* Do NOT use heavy, dark mode for the UI panels (except Phase 3). The panels are light (paper), the background is dark (blueprint).
* Do NOT define new CSS custom properties inside individual `styles/*.css` files — add them to `index.css` instead.
* Do NOT hardcode hex values that already have a token — always use `var(--color-*)`.
