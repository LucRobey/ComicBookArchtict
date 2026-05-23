---
name: webapp-layout-identity
description: The single source of truth for ARC 3.0's visual identity, layout structure, and implementation rules. Read this skill before building any UI component, phase page, or user-facing element to ensure brand and layout consistency across the entire app.
---

# Webapp Layout Identity

**Brand Name:** ARC 3.0  
**Aesthetic:** Modern Drafting Board (Dark)  
**Stack:** React (TypeScript) + Vite + Tailwind CSS v4

This skill defines **everything** an agent needs to build UI that feels like it belongs in the ARC 3.0 app — from colors and typography to page anatomy and spatial structure. It replaces the former `brand-identity` skill.

## Reference Documentation

Depending on the task you are performing, consult the specific resource files below. Do not guess brand elements or layout patterns; always read the corresponding file.

### For Visual Design & UI Styling
If you need exact colors, fonts, motion tokens, or aesthetic rules, read:
👉 **[`resources/visual-identity.md`](resources/visual-identity.md)**

### For Page Layout & Spatial Structure
If you are building a new phase, tab, sidebar, or page layout, read the layout rules here:
👉 **[`resources/layout-identity.md`](resources/layout-identity.md)**

### For Copywriting & Content Generation
If you are writing UI microcopy, error messages, labels, or documentation, read the persona guidelines here:
👉 **[`resources/voice-tone.md`](resources/voice-tone.md)**

### For Editing & Interaction Patterns
If you are implementing any edit button, form, list editor, color picker, dropdown, or modal for data editing, read the interaction rules here:
👉 **[`resources/editing-patterns.md`](resources/editing-patterns.md)**

## Quick Rules (Read the Full Docs for Details)

1. **Dark theme** — surfaces are dark (`#1f1b1b`), text is light (`#f5f2eb`). Never build light panels.
2. **Tokens live in `index.css`** — use `var(--color-*)` / `var(--duration-*)`. Never hardcode hex values.
3. **Every phase uses `<PhaseHeader>`** — no custom headers.
4. **Three layout archetypes** — Full-Width, Sidebar+Main, Canvas. Pick one and follow its rules.
5. **CSS classes for structure, Tailwind for decoration** — each phase gets `styles/{phase}.css`.
6. **No glows, no sci-fi, no retro** — flat, grounded, professional.
7. **Edit is always explicit** — one Edit button per zone, always paired with Commit + Discard. No auto-save.
