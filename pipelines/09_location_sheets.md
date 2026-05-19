# Pipeline 09 — Location Sheet Generation

**Phase:** 0 (Pre-Production — Geography)
**Output target:** `data/locations/[loc_id]/location_sheet.md` (one per location)
**Triggered by:** After `data/geography.json` is created or when a new location is added.
**Runs before:** Pipeline 08 (location image generation depends on the shot library in the sheet)

---

## What This Pipeline Does

Reads the project's world data (geography, scenario, lore) and writes a precise `location_sheet.md` for each location. This document is the single source of truth for:
- How the space is physically arranged
- Which props have narrative weight and why
- Lighting rules per time-of-day condition
- The canonical colour palette
- A shot library (3–5 shots per location or per variant) with camera positions, framing descriptions, use cases, and prompt suffixes

The shot library in the location sheet is what Pipeline 08 uses to generate images. **You cannot run Pipeline 08 without location sheets.**

> **Schema version:** `geography.json` v1.3. The key addition is `variants[]` — a location that appears under different conditions (morning vs. night, clear vs. rain) uses a variants array instead of duplicate location entries.

---

## Input Requirements

```
data/geography.json     ← location IDs, names, scene references
data/scenario.json      ← scene summaries, emotional beats, character actions
data/lore.json          ← visual_style, tone, world rules
```

---

## Step 1 — Read All Inputs

1. Read `data/lore.json`: extract `visual_style`, `tone`, `genre`, `world_rules`
2. Read `data/scenario.json`: for each scene, extract `scene_id`, `location`, `summary`, `emotional_beat`, `characters`, `anecdotes`
3. Read `data/geography.json`: for each location, extract `id`, `name`, `type`, `description`, `appears_in_scenes`

Cross-reference: for each location, find all scenes that reference it. Those scenes define the props, actions, and emotional beats that must be reflected in the location sheet.

---

## Step 2 — Check Which Sheets Are Missing

For each location, check if `data/locations/[loc_id]/location_sheet.md` exists.

- Exists → skip unless user requests a rewrite (flag: `REWRITE_LOCATION_SHEET:[loc_id]`)
- Missing → add to generation queue

---

## Step 3 — Write Each Location Sheet

Use the template at `data/locations/_TEMPLATE/location_sheet.md`.

**For each section:**

### Variant Decision — Flat vs. Multi-Variant

Before writing the shot library, decide the structure of this location:

| Condition | Structure |
|-----------|----------|
| Same space, same time-of-day in all scenes | **Flat** — `shots[]` + `palette` + `lighting_summary` at location level |
| Same space, different time-of-day across scenes | **Multi-variant** — `variants[]`, each with its own `shots[]`, `palette`, `lighting_summary` |

**Rule:** Never create two separate location entries for the same physical space. Time-of-day is a variant, not a location.

**Examples:**
- The Office appears in Scene 1 (morning) and Scene 2 (night) → `loc_office` with variants `[morning, night]`
- The Café appears only in Scene 3 (morning) → `loc_cafe` flat, no variants

---

### Layout
Synthesise from:
- The location `description` field (starting point only — expand it)
- Any spatial references in scene summaries (e.g. "walks to the printer", "sits at her desk")
- Genre conventions for this type of space (the `genre` field from lore.json informs the register)

Write 1–2 paragraphs. Be precise about: size, shape, orientation, entrance, windows, dominant axis. Answer the question: *what can you see from the entrance?*

### Key Props
Extract from scene summaries and anecdotes. For each prop:
- Name it precisely
- Place it within the layout
- State its narrative significance (which scene it appears in, what action it enables or blocks)
- **Mark props that are variant-specific** (e.g., "the letter is only in the printer tray in the Night variant")

### Lighting Rules

**For flat locations:** One table covering the single condition.

**For multi-variant locations:** One table per variant. Each variant must have categorically different lighting from the others — same geometry, different atmosphere.

Derive from:
- Scene emotional beats (e.g., "quiet dread" → most of the space in shadow)
- Genre/tone (e.g., "dark comedy" → flat fluorescent is funnier than dramatic shadow)

### Palette
5 entries minimum. Hex codes. Use the `visual_style` from lore.json for the base palette. Layer location-specific accents on top.

**For multi-variant locations:** Each variant has its own palette section. Palettes may share some values (walls, floor) but must differ in accent and shadow colours.

### Shot Library
Write 3 shots minimum per location or per variant (wide / medium / detail). For each shot:
- `id`: `[wide|medium|detail|pov]_[brief_descriptor]` (snake_case)
- `label`: human-readable (e.g., "Wide — from entrance")
- `camera`: position, height, angle
- `frame`: what is visible, what is foregrounded, what is background
- `use_for`: which scene types or emotional moments this shot serves
- `image`: `data/images/locations/[loc_id]/[shot_id].png` ← leave this path even if image does not exist yet
  - For variant shots: `data/images/locations/[loc_id]_[variant_id]/[shot_id].png`
- `prompt_suffix`: the shot-specific part of the image generation prompt (camera angle, foreground subject, background — NOT the style rules, those come from lore.json)

**Shot selection logic:**
- Wide shot: always from the entrance or dominant viewpoint. Full space visible.
- Medium shot: the recurring dialogue configuration or the key action zone.
- Detail shot: the prop with the highest narrative weight.
- Optional 4th shot: POV (a character's eye-line), exterior (if relevant), or a second key prop.

---

## Step 4 — Update geography.json

After writing each location sheet, update the corresponding location entry in `geography.json` to match.

**For flat locations:**
```json
{
  "location_sheet": "data/locations/[loc_id]/location_sheet.md",
  "palette": ["#hex", "#hex", "#hex", "#hex", "#hex"],
  "lighting_summary": "One-line summary of dominant lighting",
  "shots": [
    {
      "id": "wide_entrance",
      "label": "Wide — from entrance",
      "description": "...",
      "use_for": "...",
      "image": "data/images/locations/[loc_id]/wide_entrance.png",
      "prompt_suffix": "..."
    }
  ]
}
```

**For multi-variant locations:**
```json
{
  "location_sheet": "data/locations/[loc_id]/location_sheet.md",
  "variants": [
    {
      "id": "morning",
      "label": "Morning",
      "appears_in_scenes": [1],
      "image": "data/images/locations/[loc_id]_morning.png",
      "palette": ["#hex", ...],
      "lighting_summary": "...",
      "shots": [
        {
          "id": "wide_entrance",
          "label": "Wide — from entrance",
          "description": "...",
          "use_for": "...",
          "image": "data/images/locations/[loc_id]_morning/wide_entrance.png",
          "prompt_suffix": "..."
        }
      ]
    },
    {
      "id": "night",
      "label": "Night",
      "appears_in_scenes": [2],
      "image": "data/images/locations/[loc_id]_night.png",
      "palette": ["#hex", ...],
      "lighting_summary": "...",
      "shots": [...]
    }
  ]
}
```

Use `POST /api/save` with `path: "data/geography.json"` and the updated content.

---

## Step 5 — Output Summary

For each location processed, report:
- [ ] `data/locations/[loc_id]/location_sheet.md` — written
- [ ] `geography.json` — updated with shots[], palette, lighting_summary, location_sheet path
- [ ] Ready for Pipeline 08 (image generation from shot library)

---

## Flag Handling

User flags a location sheet from the Geography tab QA drawer (`REWRITE_LOCATION_SHEET:[loc_id]`):

1. Read the QA report note for specific direction (e.g., "the café needs a counter stool detail shot").
2. Read the existing location sheet for that location.
3. Apply only the changes described in the note. Do not rewrite sections that were not flagged.
4. Update `geography.json` shots[] if shots were added or renamed.
5. Mark the flag `[APPLIED]` in the QA report.
6. Do NOT trigger Pipeline 08 automatically — user may want to review the sheet first.

---

## Adding New Locations

When a scene is added to `scenario.json` with a location not in `geography.json`:

1. **Determine if it's a new space or a new time-of-day for an existing space.**
   - New physical space → add a new location entry.
   - Existing physical space, new time-of-day → add a new variant to the existing location entry.

2. **Adding a new location (new physical space):**
   - Add the location to `geography.json` with: `id`, `name`, `type`, `description`, `appears_in_scenes`, `location_sheet: ""`, `shots: []`
   - If multi-variant, use `variants: []` instead of `shots: []`.
   - Run Pipeline 09 for the new location.
   - Run Pipeline 08 for the new location.

3. **Adding a new variant to an existing location:**
   - Add the new variant object to `location.variants[]` in `geography.json`.
   - Add the variant's section to the existing `location_sheet.md`.
   - Run Pipeline 08 for the new variant only (flag: `GENERATE_VARIANT:[loc_id]:[variant_id]`).

Do not reprocess existing locations or existing variants unless explicitly modified.

---

## Style Inheritance

The location sheet does **not** repeat the universal style rules (linework type, fill style, etc.). Those are always read from `lore.json visual_style` and appended by Pipeline 08 at generation time.

The `prompt_suffix` in each shot only contains the shot-specific camera and framing details. This keeps the shot library readable and the prompts composable.

---

## ⚠ Phase Isolation

- Location sheets describe **empty spaces only**. Characters are never placed in location sheets.
- Props can be named (the letter, the coffee cups) but they must be object-only, not character-held.
- Costume, character posture, and interaction are decided in Phase 3 (Script) and Phase 4 (Generation).
