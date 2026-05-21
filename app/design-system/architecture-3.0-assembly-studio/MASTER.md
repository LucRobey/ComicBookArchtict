# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Architecture 3.0 Assembly Studio
**Generated:** 2026-05-18 10:19:14
**Category:** Creative Agency

---

## Global Rules

### Color Palette

| Role | Hex | CSS Variable (Tailwind v4 `@theme`) |
|------|-----|------------------------------------|
| Brand / Primary Action | `#1E3A8A` | `--color-brand` |
| Brand Hover | `#1D4ED8` | `--color-brand-hover` |
| Accent / Blueprint | `#3B82F6` | `--color-accent-primary` |
| Accent Hover | `#60A5FA` | `--color-accent-hover` |
| Surface (Panel / Card) | `#FAFAF9` | `--color-surface` |
| Surface Raised (Page bg) | `#F3F4F6` | `--color-surface-raised` |
| Canvas / Terminal | `#0D1117` | `--color-canvas` |
| Text Base | `#1F2937` | `--color-text-base` |
| Text Sub | `#374151` | `--color-text-sub` |
| Text Muted | `#6B7280` | `--color-muted` |
| Border | `#E5E7EB` | `--color-border` |
| Border Accent | `#3B82F6` | `--color-border-accent` |
| Danger | `#EF4444` | `--color-danger` |
| Success | `#10B981` | `--color-success` |
| Warning | `#F59E0B` | `--color-warning` |

**Color Notes:** Light panels (`#FAFAF9`) on dark blueprint background (`#1E3A8A`). Accent blue (`#3B82F6`) for interactive elements. No glows, no neon.

### Typography

- **Heading Font:** Space Grotesk (architectural, slightly technical feel)
- **Body Font:** Inter (clean, readable)
- **Mono Font:** IBM Plex Mono (code, labels, data)
- **Mood:** drafting board, engineering tool, precise, grounded
- **Google Fonts:**

```css
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');
```

### Spacing Variables

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` | Tight gaps, icon padding |
| `--space-sm` | `8px` | Inline spacing, small gaps |
| `--space-md` | `16px` | Standard padding |
| `--space-lg` | `24px` | Section padding |
| `--space-xl` | `32px` | Large gaps |
| `--space-2xl` | `48px` | Section margins |

### Motion Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-fast` (alias `--dur-fast`) | `150ms` | Hover, small state changes |
| `--duration-base` (alias `--dur-base`) | `250ms` | Panel transitions, reveals |
| `--ease-out` | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | Standard easing |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Bouncy / spring effects |

### Shadow Depths

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Cards, buttons |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, dropdowns |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.15)` | Hero images, featured cards |

---

## Component Specs

### Buttons

```css
/* Primary Action Button */
.export-btn {
  background: linear-gradient(135deg, var(--color-accent-primary), #2563eb);
  color: #fff;
  padding: 7px 20px;
  border-radius: 8px;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  font-weight: 600;
  transition: transform var(--dur-fast) var(--ease-spring),
              box-shadow var(--dur-base) var(--ease-out);
}

.export-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.45);
}

/* Danger / Destructive */
.btn-danger {
  background: var(--danger-dim);
  color: var(--danger);
  border: 1px solid var(--danger);
  padding: 8px 12px;
  border-radius: 6px;
  font-weight: 600;
  transition: background var(--dur-base), color var(--dur-base);
}

/* Success / Confirm */
.btn-success {
  background: var(--success-dim);
  color: var(--success);
  border: 1px solid var(--success);
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  transition: background var(--dur-base), color var(--dur-base), box-shadow var(--dur-base);
}
```

### Cards

```css
.card {
  background: #020617;
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-md);
  transition: all 200ms ease;
  cursor: pointer;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

### Inputs

```css
.input {
  padding: 12px 16px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 200ms ease;
}

.input:focus {
  border-color: #0F172A;
  outline: none;
  box-shadow: 0 0 0 3px #0F172A20;
}
```

### Modals

```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
}
```

---

## Style Guidelines

**Style:** Motion-Driven

**Keywords:** Animation-heavy, microinteractions, smooth transitions, scroll effects, parallax, entrance anim, page transitions

**Best For:** Portfolio sites, storytelling platforms, interactive experiences, entertainment apps, creative, SaaS

**Key Effects:** Scroll anim (Intersection Observer), hover (300-400ms), entrance, parallax (3-5 layers), page transitions

### Page Pattern

**Pattern Name:** Horizontal Scroll Journey

- **Conversion Strategy:** Immersive product discovery. High engagement. Keep navigation visible.
28,Bento Grid Showcase,bento,  grid,  features,  modular,  apple-style,  showcase", 1. Hero, 2. Bento Grid (Key Features), 3. Detail Cards, 4. Tech Specs, 5. CTA, Floating Action Button or Bottom of Grid, Card backgrounds: #F5F5F7 or Glass. Icons: Vibrant brand colors. Text: Dark., Hover card scale (1.02), video inside cards, tilt effect, staggered reveal, Scannable value props. High information density without clutter. Mobile stack.
29,Interactive 3D Configurator,3d,  configurator,  customizer,  interactive,  product", 1. Hero (Configurator), 2. Feature Highlight (synced), 3. Price/Specs, 4. Purchase, Inside Configurator UI + Sticky Bottom Bar, Neutral studio background. Product: Realistic materials. UI: Minimal overlay., Real-time rendering, material swap animation, camera rotate/zoom, light reflection, Increases ownership feeling. 360 view reduces return rates. Direct add-to-cart.
30,AI-Driven Dynamic Landing,ai,  dynamic,  personalized,  adaptive,  generative", 1. Prompt/Input Hero, 2. Generated Result Preview, 3. How it Works, 4. Value Prop, Input Field (Hero) + 'Try it' Buttons, Adaptive to user input. Dark mode for compute feel. Neon accents., Typing text effects, shimmering generation loaders, morphing layouts, Immediate value demonstration. 'Show, don't tell'. Low friction start.
- **CTA Placement:** Floating Sticky CTA or End of Horizontal Track
- **Section Order:** 1. Intro (Vertical), 2. The Journey (Horizontal Track), 3. Detail Reveal, 4. Vertical Footer

---

## Anti-Patterns (Do NOT Use)

- ❌ Corporate minimalism
- ❌ Hidden portfolio

### Additional Forbidden Patterns

- ❌ **Emojis as icons** — Use SVG icons (Heroicons, Lucide, Simple Icons)
- ❌ **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- ❌ **Layout-shifting hovers** — Avoid scale transforms that shift layout
- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always use transitions (150-300ms)
- ❌ **Invisible focus states** — Focus states must be visible for a11y

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from consistent icon set (Heroicons/Lucide)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile
