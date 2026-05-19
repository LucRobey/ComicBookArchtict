# AGENT HANDOFF — Architecture 3.0
> Last updated: 2026-05-19  
> Read this entire file before touching any code. It replaces the need to re-read the full conversation history.

---

## 1. What This Project Is

**Architecture 3.0** is a **comic book pre-production pipeline** — a React + Vite web application called the **Assembly Studio** that lets a writer/director manage all creative assets before the actual comic pages are drawn.

It is **not** a comic reader. It is a **production dashboard** with:
- A visual world/lore bible
- A character identity system with mood simulation
- A geography/location library (variants per time-of-day, shot library per location)
- A scene-by-scene scenario editor
- A panel-by-panel script composer
- QA flag system to instruct AI agents to regenerate or refine assets

The app lives at: `c:\Users\Users\Desktop\Emy christmass\architecture 3.0\`  
Dev server: `cd app && npm run dev` → http://localhost:5173

---

## 2. Technology Stack

| Layer | Choice |
|---|---|
| Framework | **Vite + React 18 + TypeScript** |
| Styling | **Tailwind CSS v3** (primary) + per-phase vanilla CSS files in `app/src/styles/` |
| Data | **JSON files** in `data/` — no database. The Express dev server in `app/server/` serves them and handles `/api/save` |
| API for writes | `POST /api/save` with `{ path: string, content: any }` body. (Do **not** use `JSON.stringify(content)`—the server automatically stringifies objects, and double-stringifying causes corruption.) |
| API for images | `GET /api/load-image?path=<relative-path>` |
| Hooks | `useJsonFile<T>(relativePath)` → `{ data, loading, error }` |

---

## 3. Design System — "Modern Drafting Board"

The app uses a warm, dark "drafting board" aesthetic. Key CSS variables (defined in `app/src/index.css`):

```css
--bg-color:          /* very dark warm background */
--panel-bg:          /* slightly lighter panel surfaces */
--border-color:      /* subtle panel borders */
--text-main:         /* primary text (near-white) */
--text-muted:        /* secondary, label text */
--accent-primary:    #3B82F6  /* Blueprint Blue */
--accent-amber:      #D97706  /* Amber Warm (flags, tension) */
--dur-fast:          0.15s
--dur-base:          0.22s
```

**Canonical palette (`data/lore.json` → `palette`)** is now fully editable in the UI. 
The UI provides an explicit "Edit Form Card" allowing the user to pick a colour, name it, and describe its role. Changes are saved back to the JSON file.

---

## 4. File Structure (Key Files)

```
architecture 3.0/
│
├── AGENT_GUIDE.md          ← Top-level agent instructions (read this too)
├── FILE_GUIDE.md           ← Canonical list of every file and its role
├── AGENT_HANDOFF.md        ← THIS FILE
│
├── data/
│   ├── geography.json      ← Location registry (schema v1.4) ← IMPORTANT
│   ├── lore.json           ← World/story bible keys
│   ├── scenario.json       ← Scene-by-scene story beats
│   ├── character_moods.json← Mood grid for each character
│   ├── characters/         ← Per-character JSON (identity, palette, fonts)
│   ├── locations/          ← Per-location markdown sheets
│   │   └── _TEMPLATE/location_sheet.md  ← Template for new locations
│   └── images/             ← All generated image assets
│
├── pipelines/
│   ├── 08_location_visuals.md  ← How agents generate location images
│   ├── 09_location_sheets.md   ← How agents write location documentation
│   └── ...
│
├── qa/
│   └── lore/               ← QA flag files written by the UI (see §7)
│
└── app/
    └── src/
        ├── components/
        │   └── phases/
        │       ├── lore/
        │       │   └── LorePhase.tsx   ← MAIN FILE THIS SESSION
        │       ├── character-hub/      ← Phase 0.5 character hub
        │       ├── characters/
        │       ├── pacing/
        │       ├── panels/
        │       └── script/
        └── styles/
            ├── lore.css        ← All geography/lore styles ← IMPORTANT
            ├── character-hub.css
            └── ...
```

---

## 5. Geography System — Schema v1.4 (Most Recent Work)

### Rule #1 — Physical Space vs. Variant
> A **Location** = a physical space (e.g., "The Office").  
> A **Variant** = a time-of-day/condition within that space (e.g., "Morning", "Night").  
> **NEVER create two separate locations for the same physical space at different times.**

### geography.json structure

```jsonc
{
  "_schema_version": "1.4",
  "locations": [
    {
      "id": "loc_office",
      "name": "The Office",
      "type": "interior",
      "description": "GLOBAL physical description — timeless, about the space itself.",
      "appears_in_scenes": [1, 2],
      "location_sheet": "data/locations/loc_office/location_sheet.md",

      // OPTION A — MULTI-VARIANT (time-of-day conditions exist)
      "variants": [
        {
          "id": "morning",
          "label": "Morning",
          "description": "Time-of-day atmosphere — light, mood, who is present.",
          "appears_in_scenes": [1],
          "image": "data/images/locations/loc_office_day.png",
          "lighting_summary": "...",
          "palette": ["#F2EDE4", "#9B9B9B", "..."], // Note: JSON holds strings, UI uses objects
          "shots": [
            {
              "id": "wide_entrance",
              "label": "Wide — from entrance",
              "description": "What the camera sees.",
              "use_for": "Narrative purpose of this shot.",
              "image": "data/images/locations/loc_office_day/wide_entrance.png",
              "prompt_suffix": "literal prompt text for image generation"
            }
          ]
        },
        { "id": "night", "label": "Night", "..." }
      ]
    },
    {
      // OPTION B — FLAT (no time-of-day variants, single mood)
      "id": "loc_cafe",
      "name": "The Café",
      "palette": ["..."],
      "lighting_summary": "...",
      "shots": [ { "..." } ]
      // No "variants" array
    }
  ]
}
```

### How variants are displayed in the UI
- Clicking a location card expands a **detail panel**
- If `variants` exists → **variant tabs** appear (Morning / Night)
- Active variant controls which `palette`, `lighting_summary`, and `shots[]` are displayed

---

## 6. LorePhase.tsx — Current State

File: `app/src/components/phases/lore/LorePhase.tsx` (1400+ lines)

### Important New Features Added

1. **Interactive Swatch Builder**: Replaced static text-based "palette" fields with an interactive, array-based hex colour picker.
2. **Canonical Palette Edit Forms**: The `Visual Style` section now features a fully-fledged editable grid for the project's canonical palette. Clicking any swatch turns it into a form card with `Cancel` and `Save` buttons. The state is instantly saved to `data/lore.json`.
3. **Palette Comments**: When adding a location or flagging a palette for regeneration, the user can pick colours and explicitly type a `comment` (e.g. "walls", "shadows", "accents") next to each chip. These translate into the markdown files as `#hex (comment)` so the generation agent knows exactly what the colour is intended for.

### State variables
```ts
subTab: 'world' | 'visual-style' | 'geography' | 'scenario'
activeLocId: string | null       // selected location
activeVariantId: string | null   // selected variant within that location

// Canonical Palette Editor
canonEditState: { idx: number; hex: string; label: string; role: string } | null
paletteSaveStatus: 'idle' | 'saving' | 'ok' | 'err'

// Flag drawer — GENERIC for all flaggable rows
flagTarget: {
  type: 'shot' | 'palette' | 'lighting';
  locId: string;
  variantId: string | null;
  label: string;
  shot?: Shot;              // only when type === 'shot'
} | null
palettePicks: { hex: string; comment: string }[]  // Colours selected for regeneration
flagNote: string
flaggedKeys: Set<string>
```

---

## 7. Flag System

When a user clicks any 🚩 flag button, the UI:
1. Opens a **flag drawer** (slide-up panel at bottom of detail) with context-aware title
2. User picks colours with comments (if targeting palette) and writes an optional direction note
3. On "Send Flag" → `POST /api/save` writes a markdown file to `qa/lore/`

### QA flag file content format
```md
# QA Flag — Location Palette
Generated: 2026-05-19T...

## [REGENERATE_PALETTE:loc_office:morning]
* **Location:** loc_office
* **Variant:** morning
* **Target:** Palette
* **Palette:** #1c1c1e (shadows), #d97706 (accents)
* **Direction:** Make it warmer, less cold
```

### Flag types and their action tokens

Image flags have **two modes** selectable in the flag drawer:

| Mode | When to use |
|---|---|
| **Re-generate** | Recreate the image from scratch with a modified prompt |
| **Modify** | Pass the existing image to the generator with change instructions (img2img) |

| Button | Mode | Token | Meaning for agent |
|---|---|---|---|
| 🚩 Shot image | Re-generate | `REGENERATE_SHOT:{loc}:{variant}:{shot_id}` | Recreate from scratch — adjust `prompt_suffix` per `Prompt changes:` field |
| 🚩 Shot image | Modify | `MODIFY_SHOT:{loc}:{variant}:{shot_id}` | Pass `Source image:` path to generator — apply `Changes to apply:` field |
| 🚩 Palette | — | `REGENERATE_PALETTE:{loc}:{variant}` | Create new palette for this location/variant |
| 🚩 Lighting | — | `MODIFY_LIGHTING:{loc}:{variant}` | Update lighting description in geography.json |

---

## 8. Pipeline System

Pipelines are documentation files in `pipelines/` that agents read to know how to run automated tasks.

**Order of execution:**
```
Pipeline 09 (location sheets) → MUST run before → Pipeline 08 (location visuals)
```

### Pipeline 08 — Location Visuals
`pipelines/08_location_visuals.md`  
Walks `geography.json → locations[] → variants[] → shots[]` (or flat `shots[]`).  
Generates images for each shot using `prompt_suffix`.  
Respects QA flags in `qa/lore/` for regeneration requests.

### Pipeline 09 — Location Sheets
`pipelines/09_location_sheets.md`  
Generates or updates `data/locations/{loc_id}/location_sheet.md` for each location.  
Enforces the Variant Decision rule: uses the `_TEMPLATE/location_sheet.md` structure.

---

## 9. Character System (Phase 0.5)

Characters live in `data/characters/` and are managed via the **Characters Hub** tab.  
Each character has:
- **Visual identity** — physical description, face anchor (chin-to-crown only, no costume)
- **12-item dominant emotion grid** — standardized emotional vocabulary
- **Personality signature** — voice, mannerisms, contradiction
- **Mood simulation** — scene-by-scene mood arc

The character pipeline enforces **face-only framing** (chin-to-crown) to keep assets costume-neutral and reusable across scenes.

See `pipelines/05_visual_signature.md`, `06_personality_signature.md`, `07_mood_simulation.md`.

---

## 10. Inline Edit Pattern (reusable across the app)

The inline description editing follows this pattern consistently:

```tsx
// Key format determines what gets patched in geography.json
'global:{locId}'           → loc.description
'variant:{locId}:{varId}'  → loc.variants[v].description

// In JSX:
{editingDescKey === myKey ? (
  <div className="lore-desc-edit-block">
    <textarea className="lore-desc-textarea" ... />
    <div className="lore-desc-edit-actions">
      <button className="lore-desc-save-btn" onClick={() => saveDescription(myKey, editingDescValue)}>Save</button>
      <button className="lore-desc-cancel-btn" onClick={() => setEditingDescKey(null)}>Cancel</button>
    </div>
  </div>
) : (
  <div className="lore-loc-global-desc-body">  {/* or lore-loc-variant-desc-body */}
    <p className="lore-loc-global-desc-text">{text}</p>
    <button className="lore-desc-edit-icon-btn" onClick={() => startEditDesc(myKey, text)}>✏️</button>
  </div>
)}
```

---

## 11. CSS Architecture for lore.css

`app/src/styles/lore.css` is structured into sections (search these comments to navigate):
```
/* ── Tab navigation */
/* ── Location grid */
/* ── Location card */
/* ── Location detail panel */
/* ── Detail row label group (label + inline flag btn) */
/* ── Global description row */
/* ── Variant description row */
/* ── Inline edit block */
/* ── Shot action row */
/* ── Flag drawer */
/* ── Reduced motion */
```

Key CSS classes for the flag system:
- `.lore-loc-detail-label-group` — flex wrapper for label + flag btn
- `.lore-row-flag-btn` — inline 🚩 btn (opacity 0.45 at rest, full on hover, amber when flagged)
- `.flagged-row` — amber left border on a flagged palette/lighting row
- `.lore-flag-drawer` — the slide-up QA drawer
- `.lore-shot-flag-img-btn` — the 🚩 button on shot cards
- `.lore-shot-flagged-badge` — "🚩 Flagged" badge overlaid on shot image

Key CSS classes for the Swatch system:
- `.lore-canon-swatch--editing` — Wrapper for the explicit Canonical Palette edit form.
- `.lore-palette-swatches--with-comments` — Wrapper for Add Location / Flag Palette swatches that stack vertically to hold input fields.

---

## 12. What Is NOT Yet Done (Potential Next Steps)

These are natural next steps based on the current trajectory. Do not start any of them without confirming with the user first.

### A. "Clear Flag" Button
Once an agent has processed a QA flag (i.e., regenerated the image), there should be a way to:
- Remove the `🚩 Flagged` badge from the shot card
- Delete the `qa/lore/flag_*.md` file  
This could be a "Mark as resolved" button that calls `DELETE /api/flag` or equivalent.

### B. Location Images Not Yet Generated
The images referenced in `geography.json` (e.g., `data/images/locations/loc_office_day/wide_entrance.png`) do not exist yet. Run **Pipeline 08** to generate them. The `prompt_suffix` field on each shot contains the generation prompt.

### C. More Locations Need Variant Docs
Currently only `loc_office` has variant descriptions written in `geography.json`. `loc_cafe` is flat (no variants) and its description is minimal. Pipeline 09 should be run to produce full `location_sheet.md` for both.

### D. QA Integration with Future Phases
Phase 1.5 and Phase 4 agents should scan `qa/lore/` for REGENERATE_* flags and process them in order during their generation loops.

---

## 13. Critical Rules for This Project

1. **Never create a new location entry for a time-of-day condition** — use `variants[]` instead.
2. **Pipeline 09 before Pipeline 08** — always.
3. **Face-only for character emotion assets** — chin-to-crown framing, no costume visible.
4. **`/api/save` for all writes** — never write to disk directly; always use the server endpoint.
5. **QA files go to `qa/lore/`** — not inline in data files.
6. **The `description` field on a Variant** describes the *atmosphere at that time of day*, not the physical space. The physical description lives on the Location itself.
7. **TypeScript strict mode** — run `npx tsc --noEmit` after any significant change to LorePhase.tsx.

---

## 14. How to Verify the App is Working

1. `cd "c:\Users\Users\Desktop\Emy christmass\architecture 3.0\app" && npm run dev`
2. Open http://localhost:5173
3. Click **Lore & Story** → **Geography**
4. Check the canonical palette edit forms inside the **Visual Style** tab.
5. Click **The Office** card → click the Palette flag 🚩 → verify you can pick colours, write comments, and output `(comment)` mappings.
6. Verify the **Add Location** modal operates similarly with its palette input.

---

*End of handoff. Good luck.*
