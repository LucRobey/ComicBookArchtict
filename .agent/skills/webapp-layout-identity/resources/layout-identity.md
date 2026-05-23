# ARC 3.0: Layout Identity

> Every phase page must feel like it belongs to the same app. This document defines the spatial structure, page anatomy, and layout rules that make that happen.

This document is the companion to [`visual-identity.md`](visual-identity.md) (which defines *what things look like*). This document defines *how things are arranged*.

---

## 1. The App Shell

Every page lives inside the same shell. No phase should render its own app chrome.

```
┌─────────────────────────────────────────────────────┐
│  PhaseTabBar  (h-14 = 56px, sticky, z-30)           │
│  [ARC 3.0 | Phase Badge]        [Tab] [Tab] [Tab]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Phase Content Area  (flex-1, overflow-hidden)       │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │  <PhaseHeader>  (shared component)           │    │
│  │  Title, description, action buttons          │    │
│  ├─────────────────────────────────────────────┤    │
│  │                                             │    │
│  │  Phase-specific content                     │    │
│  │  (follows one of three archetypes below)    │    │
│  │                                             │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Shell Rules
- **`<PhaseTabBar>`** is rendered by `App.tsx` — phases never touch it
- **`<PhaseHeader>`** is a shared component from `components/shared/PhaseHeader` — **every phase must use it**
- The phase content area fills `flex-1` and has `overflow-hidden` — scrolling happens inside the phase, not on the shell

---

## 2. Three Layout Archetypes

Every phase must follow one of these three archetypes. Do not invent new ones.

### Archetype A: Full-Width + Tabs

**Use when:** the phase has multiple sub-categories of content with no page-index navigation.

**Current phases:** Lore, Scenario

```
┌─────────────────────────────────────────────────────┐
│  <PhaseHeader>                                       │
├─────────────────────────────────────────────────────┤
│  SubTabBar  (h-12 = 48px)                            │
│  [Tab A]  [Tab B]  [Tab C]                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Full-width scrollable content  (p-6, overflow-y)    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Rules:**
- Sub-tab bar: `h-12`, `bg-surface`, `border-b border-border`, `shadow-sm`, centered tabs
- Content area: `p-6`, `overflow-y-auto`, full width
- No sidebar

---

### Archetype B: Sidebar + Main

**Use when:** the phase is indexed by page/chapter/entity and needs a navigable list alongside content.

**Current phases:** Character Hub, Panels, Script

```
┌─────────────────────────────────────────────────────┐
│  <PhaseHeader>                                       │
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│ Sidebar  │  Main Panel                              │
│ w-64     │  flex-1                                  │
│          │                                          │
│ Entity   │  ┌──────────────────────────────────┐    │
│ list     │  │  Main Header (toolbar)           │    │
│          │  ├──────────────────────────────────┤    │
│ bg-      │  │                                  │    │
│ secondary│  │  Scrollable content (p-6)        │    │
│          │  │                                  │    │
│ border-r │  └──────────────────────────────────┘    │
│          │                                          │
└──────────┴──────────────────────────────────────────┘
```

**Rules:**
- Sidebar: `w-64` (256px), `bg-secondary`, `border-r border-border`, `shadow-sm`
- Sidebar content: `overflow-y-auto`, `p-4` internal padding
- Main panel: `flex-1`, `flex flex-col`
- Main header (if present): `h-12`, `border-b border-border`, `px-6`, flex items-center
- Main content: `flex-1`, `overflow-y-auto`, `p-6`

---

### Archetype C: Canvas

**Use when:** the phase is primarily a visual/interactive workspace (drag-and-drop, diagram, canvas).

**Current phases:** Assembly, Pipeline Map

```
┌─────────────────────────────────────────────────────┐
│  Minimal Header  (h-14)                              │
├──────────────────────────────────────────────┬──────┤
│                                              │      │
│  Full-bleed interactive area                 │ Opt. │
│  (canvas, diagram, drag-and-drop)            │ Side │
│  flex-1                                      │ bar  │
│                                              │      │
└──────────────────────────────────────────────┴──────┘
```

**Rules:**
- Header may be minimal (no `<PhaseHeader>` requirement — the canvas needs maximum space)
- Canvas area: `flex-1`, no padding, `overflow-hidden`
- Optional inspector sidebar: `w-[340px]`, `border-l border-border`, `overflow-y-auto`
- Canvas phases may use their own scroll/zoom behavior

> **Note:** This is the only archetype where `<PhaseHeader>` is optional. Assembly and PipelineMap have unique interactive requirements that justify custom headers.

---

## 3. Structural Rules

### Root Wrapper
Every phase must have a root wrapper with:
```html
<div className="{phase}-phase bg-background-panel flex flex-col h-full w-full">
```
- Always include `bg-background-panel` (or `bg-canvas` for Canvas archetype)
- Always include `h-full w-full` to fill the shell
- Always use the `{phase}-phase` class name for CSS scoping

### QA Drawer
Most phases have a QA review drawer. It must follow this pattern:
- **Position:** Absolute overlay from the right edge, inside `{phase}-body`
- **Width:** `w-80` (320px)
- **Background:** `bg-surface`, `border-l border-border`, `shadow-lg`
- **Z-index:** `z-30` (above content, below modals)
- **Implementation:** Extract into `{Phase}QADrawer.tsx` component (not inline JSX)
- **Backdrop:** Semi-transparent overlay (`bg-black/30`) behind the drawer

### Modals / Dialogs
- Centered in viewport
- `max-w-lg` default, `max-w-2xl` for large dialogs
- `bg-surface`, `border border-border`, `rounded-lg`, `shadow-xl`
- Backdrop: `bg-black/50`, click-to-dismiss

---

## 4. Zone Naming Convention

Use consistent CSS class prefixes scoped by phase:

```
{phase}-phase          → root wrapper
{phase}-body           → area below <PhaseHeader>, contains layout
{phase}-subtab-bar     → sub-tab navigation (Archetype A only)
{phase}-sidebar        → left navigation panel (Archetype B only)
{phase}-main           → primary content area
{phase}-main-header    → toolbar/action bar inside main area
{phase}-content        → scrollable content container
{phase}-qa-drawer      → QA review overlay panel
```

**Examples:**
- `lore-phase`, `lore-body`, `lore-subtab-bar`, `lore-content`
- `script-phase`, `script-body`, `script-sidebar`, `script-main`, `script-main-header`
- `panels-phase`, `panels-body`, `panels-sidebar`, `panels-main`, `panels-grid`

### Naming Rules
- Use lowercase kebab-case: `character-hub-phase` not `chub-phase`
- Phase prefix must match the directory name under `components/phases/`
- Every zone class must be unique across the app

---

## 5. Spacing Rhythm

All spatial dimensions follow a consistent rhythm:

| Element | Size | Tailwind |
|---|---|---|
| PhaseTabBar height | 56px | `h-14` |
| PhaseHeader height | variable (collapsible) | — |
| Sub-tab bar height | 48px | `h-12` |
| Main header height | 48px | `h-12` |
| Sidebar width | 256px | `w-64` |
| Inspector sidebar width | 340px | `w-[340px]` |
| QA drawer width | 320px | `w-80` |
| Content padding | 24px | `p-6` |
| Sidebar internal padding | 16px | `p-4` |
| Card gap | 16px | `gap-4` |
| Section gap | 24px | `gap-6` |
| Component internal padding | 16px | `p-4` |

### The 4px Grid
All spacing is a multiple of 4px:
- `4px` (gap-1) — tight inline spacing
- `8px` (gap-2) — default element spacing
- `12px` (gap-3) — comfortable button padding
- `16px` (gap-4) — card gaps, component padding
- `24px` (gap-6) — section gaps, content padding
- `32px` (gap-8) — large section separation

---

## 6. Styling Convention

### The Rule: CSS Classes for Structure, Tailwind for Decoration

**Structure** (layout, positioning, sizing) → define in `styles/{phase}.css` as custom classes:
```css
/* styles/script.css */
.script-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}
.script-sidebar {
  width: 256px;
  flex-shrink: 0;
}
```

**Decoration** (colors, borders, backgrounds, shadows) → use Tailwind utilities inline:
```jsx
<div className="script-sidebar bg-secondary border-r border-border shadow-sm">
```

### Why This Split?
- CSS classes make layout **debuggable** — you can see the structure in DevTools
- Tailwind utilities make token-backed decoration **consistent** — no hardcoded colors
- A phase should never be 100% Tailwind (unreadable) or 100% CSS (disconnected from tokens)

### File Rules
- Each phase gets exactly one CSS file: `styles/{phase}.css`
- Import it in the phase root component: `import '../../../styles/{phase}.css'`
- Never define new CSS custom properties in phase CSS files — add them to `index.css`
- Never use `@apply` — it defeats the purpose of the split

---

## 7. Overflow & Scroll Rules

- **Root wrapper:** `overflow-hidden` (no page-level scrolling)
- **Phase body:** `overflow-hidden` (layout container, not scrollable)
- **Content areas:** `overflow-y-auto` (the only scrollable zones)
- **Sidebars:** `overflow-y-auto` (independently scrollable)
- **Horizontal scrollbars:** Never. If content overflows horizontally, the layout is wrong.

---

## 8. Phase Registry

Current phases and their archetypes for reference:

| Phase | Archetype | Sidebar | Sub-tabs | QA Drawer | CSS File |
|---|---|---|---|---|---|
| Pipeline Map | C (Canvas) | ✅ Inspector | ✅ View toggle | ❌ | `pipeline-map.css` |
| Lore | A (Full-Width) | ❌ | ✅ | ✅ | `lore.css` |
| Scenario | A (Full-Width) | ❌ | ✅ | ✅ | — (needs one) |
| Character Hub | B (Sidebar+Main) | ✅ Entity list | ✅ View toggle | ✅ | `character-hub.css` |
| Characters Intro | B (Sidebar+Main) | ✅ | ❌ | ✅ | `characters.css` |
| Pacing | B (Sidebar+Main) | ✅ Page list | ❌ | ✅ | `pacing.css` |
| Panel Structure | B (Sidebar+Main) | ✅ Page list | ❌ | ✅ | `panels.css` |
| Script | B (Sidebar+Main) | ✅ Page list | ❌ | ✅ | `script.css` |
| Assembly | C (Canvas) | ✅ Page list | ✅ Assembly/QA | ❌ | `components.css` |

> **Known debt:** Scenario has no CSS file (100% Tailwind). Character Hub uses `chub-*` prefix instead of `character-hub-*`. These should be addressed in future refactoring.
