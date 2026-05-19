# 🤖 AGENT GUIDE — Architecture 3.0 + Comic Studio 3.0

> **For AI agents operating on this codebase.**  
> This document tells you what every component does, how to navigate between phases, and exactly what your responsibilities are as an agent in this pipeline.

---

## What Is This System?

This is a **sequential comic production pipeline**. Each phase takes the previous phase's JSON output as its primary input and produces a new JSON output. A React dashboard (Comic Studio 3.0) allows a human user to review each output and export QA reports flagging issues for you to resolve.

**Your core loop as an agent:**
1. Receive a task ("Execute Phase N" or "Apply modifications")
2. Read the correct input JSON(s) from `data/`
3. Read the pipeline instruction file from `pipelines/`
4. Generate the output JSON
5. Save it to the correct path in `data/`
6. If QA reports exist in `qa/`, read and apply them before generating

---

## Project Root Structure

```
architecture 3.0/              ← PROJECT ROOT
│
├── AGENT_GUIDE.md             ← YOU ARE HERE
├── AGENT_HANDOFF.md           ← Current session state: data status, pending tasks
├── HOW_TO_MAKE_A_COMIC.md     ← Human-facing workflow guide
├── MASTER_GUIDE.md            ← High-level pipeline overview
├── PRODUCTION_STATUS.md       ← Kanban board (update as you complete phases)
├── init_project_protocol.md   ← Pre-phase: pipeline customization protocol
│
├── app/                       ← Comic Studio 3.0 React app
│   └── src/                   ← (run: cd app && npm run dev → localhost:5173)
│
├── data/                      ← ALL JSON outputs, flat
│   ├── lore.json              ← Phase 0 output
│   ├── scenario.json          ← Phase 0 output
│   ├── geography.json         ← Phase 0 output: location registry (schema v1.4)
│   │                             Each location: id, name, type, description, appears_in_scenes
│   │                             Flat locations: shots[], palette, lighting_summary, location_sheet
│   │                             Multi-variant locations: variants[] — same space, different time-of-day
│   │                             ⚠ Never two entries for the same physical space: use variants instead
│   ├── locations/             ← Phase 0 output: location_sheet.md per location (written by Pipeline 09)
│   │   ├── _TEMPLATE/         ← location_sheet.md template for agents
│   │   ├── loc_office/        ← location_sheet.md covering both Morning and Night variants
│   │   └── loc_cafe/          ← location_sheet.md (flat — single condition)
│   ├── images/style_reference/   ← Phase 0 output: mood board reference images for Visual Style tab
│   │   ├── style_ref_1.png   ← Office morning — generated from lore.json values
│   │   └── style_ref_2.png   ← Café night — generated from lore.json values
│   ├── images/locations/      ← Phase 0 output: location shot images (written by Pipeline 08)
│   │   ├── loc_office_day/    ← morning variant shots (wide_entrance, medium_desk, detail_printer)
│   │   ├── loc_office_night/  ← night variant shots (wide_entrance, medium_printer, detail_letter)
│   │   └── loc_cafe/          ← café shots (wide_entrance, medium_table, detail_window)
│   ├── character_moods.json   ← Phase 0.5 output (pipeline 07 + app-editable)
│   ├── characters/            ← Phase 0.5 output: per-character project-specific files
│   │   └── [Name]/
│   │       ├── personality_signature.md
│   │       └── examples/emotional_states/  ← 12 dominant emotion images, face-only, costume-neutral
│   │           (joyful/content/anxious/sad/angry/ashamed/performing/numb/tender/determined/overwhelmed/resigned)
│   ├── intro_pages.json       ← Phase 1 output
│   ├── pages.json             ← Phase 1.5 output
│   ├── panels.json            ← Phase 2 output
│   ├── script.json            ← Phase 3 output
│   └── images/                ← Phase 4/5 output: panel_N.png per page
│
├── qa/                        ← All QA reports, organized by phase name
│   ├── lore/                  ← Phase 0 reports
│   ├── characters/            ← Phase 1 reports
│   ├── pacing/                ← Phase 1.5 reports
│   ├── structure/             ← Phase 2 reports
│   ├── script/                ← Phase 3 reports
│   └── images/                ← Phase 4/5 reports
│
├── pipelines/                 ← Agent instruction files per phase
│   ├── 01_style_building.md          ← Phase 0: world/tone/visual style
│   ├── 02_character_distillation.md  ← Phase 0: character sheets
│   ├── 03_scenario_development.md    ← Phase 0: scene list
│   ├── 04_visual_signatures.md       ← Phase 0: visual identity per character
│   ├── 05_visual_signature.md        ← Phase 0.5-A: canonical_visual.md + turnarounds
│   ├── 06_personality_signature.md   ← Phase 0.5-B: personality_signature.md + emotional states
│   ├── 07_mood_simulation.md         ← Phase 0.5-D: character_moods.json
│   ├── 09_location_sheets.md         ← Phase 0 (run first): writes location_sheet.md per location
│   │                                    Decides flat vs. variants structure. ⚠ Must run before 08.
│   ├── 08_location_visuals.md        ← Phase 0 (run second): generates shot images from location sheets
│   │                                    Reads variants[].shots[] or shots[] from geography.json.
│   ├── intro_instructions.md         ← Phase 1
│   ├── pacing_instructions.md        ← Phase 1.5
│   ├── structuring_instructions.md   ← Phase 2
│   ├── scripting_instructions.md     ← Phase 3 (reads character_moods.json as upstream)
│   └── generation_instructions.md    ← Phase 4/5
│
└── docs/                      ← Per-phase agent reference docs
    ├── phase_0_lore.md        → See: docs/phase_0_lore.md
    ├── phase_1_characters.md → See: docs/phase_1_characters.md
    ├── phase_1.5_pacing.md      → See: docs/phase_1.5_pacing.md
    ├── phase_2_structure.md   → See: docs/phase_2_structure.md
    ├── phase_3_script.md      → See: docs/phase_3_script.md
    ├── phase_4_images.md      → See: docs/phase_4_images.md
    └── phase_6_assembly.md    → See: docs/phase_6_assembly.md
```

---

## The Data Flow Chain

```
data/lore.json ─────────────────────────────────────────────────────────────────────────────┐
data/scenario.json ──────────────┬──────────────────────────────────────────────────────────┤
                                 ↓                                                           │
                   data/character_moods.json (Phase 0.5-D)                                  │
                   global_characters/[Name]/canonical_visual.md (Phase 0.5-A)               │
                   data/characters/[Name]/personality_signature.md (Phase 0.5-B)            │
                                 ↓                                                           │
                       data/intro_pages.json (parallel)                                     │
                                 │                                                           │
               data/pages.json ──────────────────────────────────────────────────────────────┤
                                 ↓                                                           │
                       data/panels.json ─────────────────────────────────────────────────────┤
                                 ↓                                                           │
                       data/script.json ─────────────────────────────────────────────────────┤
                                 ↓                                                           │
                     data/images/page_N/ ────────────────────────────────────────────────────┘
                                 ↓
                     data/assembly/pages/
```

**Phase 0.5 upstream rule:** `data/character_moods.json` is an upstream dependency for Phase 1 (character intros) and Phase 3 (dialogue). The scripting agent MUST read it before writing any scene — see `scripting_instructions.md` item 7.

**Rules:**
- Never generate a downstream file if its upstream dependency doesn't exist and is not approved.
- If QA reports exist for a phase you're regenerating, always apply them before writing the new output.
- Never delete or overwrite `qa/` files. They are the audit trail.

---

## Phase Reference Table

| Phase | App Tab | Input | Output | Doc |
|-------|---------|-------|--------|-----|
| Pre | — | user brief | customized `pipelines/` files | `init_project_protocol.md` |
| 0 | 🌍 Lore & Story | conversation | `data/lore.json`, `data/scenario.json` | [→](docs/phase_0_lore.md) |
| **0.5** | **👤 Characters Hub** | `data/lore.json`, `data/scenario.json`, `global_characters/` | `data/character_moods.json`, `global_characters/[Name]/canonical_visual.md`, `data/characters/[Name]/personality_signature.md` | pipelines 05–07 |
| 1 | 🎭 Characters | Phase 0 notes + `data/character_moods.json` | `data/intro_pages.json` | [→](docs/phase_1_characters.md) |
| 1.5 | 📋 Pacing | `data/scenario.json` | `data/pages.json` | [→](docs/phase_1.5_pacing.md) |
| 2 | 📐 Panel Structure | `data/pages.json` | `data/panels.json` | [→](docs/phase_2_structure.md) |
| 3 | ✍️ Script | `data/panels.json` + `data/character_moods.json` | `data/script.json` | [→](docs/phase_3_script.md) |
| 4/5 | *(AI chat only)* | `data/script.json` + `data/panels.json` | `data/images/` | [→](docs/phase_4_images.md) |
| 6 | 🧩 Assembly | `data/images/` + `data/script.json` | Human places panels & bubbles in the app canvas | [→](docs/phase_6_assembly.md) |

---

## The QA System — How It Works

The Comic Studio app exports QA reports whenever the human clicks 🚩 on any element. These reports are **your primary instruction source** when asked to "apply modifications."

### Report Location Pattern
```
qa/[phase_name]/qa_report_phase[N]_[TIMESTAMP].md
```

Examples:
- `qa/lore/qa_report_phase0_2026-05-17T14-56-09-534Z.md`
- `qa/script/qa_report_phase3_2026-05-17T13-26-33-810Z.md`
- `qa/structure/qa_report_phase2_2026-05-17T13-41-46-044Z.md`

### How to Process QA Reports

1. **Check for reports before generating.** Always scan the relevant `qa/[phase]/` folder for any `.md` files before writing output for that phase.
2. **Sort by timestamp ascending.** Apply reports in the order they were created (oldest first).
3. **Read the operation tag.** Every report item has a `[TAG]` like `[REWRITE_LINE]`, `[SPLIT_PANEL]`, etc.
4. **Apply surgically.** Only modify the specific element referenced by the report. Never rewrite unrelated content.
5. **Do not delete reports after applying.** Leave them in place as audit history.
6. **Append `[APPLIED]`** at the bottom of each report after you process it.

### QA Phase Folder Map

| Phase | `qa/` subfolder |
|-------|----------------|
| Phase 0 | `qa/lore/` |
| Phase 0.5 | `qa/character-hub/` |
| Phase 1 | `qa/characters/` |
| Phase 1.5 | `qa/pacing/` |
| Phase 2 | `qa/structure/` |
| Phase 3 | `qa/script/` |
| Phase 4/5 | `qa/images/` |

### QA Operation Tag Reference

| Tag | Phase | Meaning |
|-----|-------|---------|
| `[REWRITE_VISUAL]` | 0.5 | Rewrite `canonical_visual.md` for a character |
| `[REGENERATE_TURNAROUNDS]` | 0.5 | Regenerate all 5 turnaround images |
| `[REGENERATE_EMOTION:name]` | 0.5 | Regenerate a specific emotional state image (e.g. `REGENERATE_EMOTION:angry`) — surgical, one image only |
| `[REWRITE_PERSONALITY]` | 0.5 | Rewrite `personality_signature.md` for a character |
| `[REGENERATE_SHOT:{loc}:{variant}:{shot_id}]` | 0 | **Re-generate** shot from scratch — adjust `prompt_suffix` per `Prompt changes:` field, then generate a new image |
| `[MODIFY_SHOT:{loc}:{variant}:{shot_id}]` | 0 | **Modify** existing shot — pass `Source image:` path back to the generator with `Changes to apply:` as the edit instruction |
| `[REGENERATE_PALETTE:{loc}:{variant}]` | 0 | Produce a new colour palette for this location/variant and update `geography.json` |
| `[MODIFY_LIGHTING:{loc}:{variant}]` | 0 | Update the `lighting_summary` text field in `geography.json` per the direction note |
| `[REGENERATE_STYLE_REFERENCE]` | 0 | Produce a new style reference image from the mood board |
| `[ADD_LOCATION:{loc_id}]` | 0 | Create a new location entry in `geography.json` from the flag data, then run Pipeline 09, then Pipeline 08 |
| `[CHANGE_TYPE]` | 1, 1.5 | Change the type badge of a page |
| `[REWRITE_SCENE]` | 1, 0 | Rewrite a scene or character scene description |
| `[CHANGE_LAYOUT]` | 1 | Change character intro layout type |
| `[REWRITE_CAPTION]` | 1 | Change narrator caption |
| `[REWRITE_DIALOGUE]` | 1, 3 | Rewrite a dialogue line |
| `[REWRITE_FOCUS]` | 1.5 | Rewrite a page's focus description |
| `[EXTEND]` | 1.5 | Add a page to give a scene more space |
| `[MERGE_WITH_NEXT]` | 1.5, 2 | Combine with following page/panel |
| `[ADD_PAGE_AFTER]` | 1.5 | Insert a new page after the referenced one |
| `[REWRITE_ACTION]` | 2 | Rewrite a panel's action description |
| `[SPLIT]` | 2 | Split one panel into two |
| `[ADD_PANEL_AFTER]` | 2 | Insert a panel after the referenced one |
| `[CHANGE_CHARACTERS]` | 2 | Update the character list for a panel |
| `[ADD_TAG]` / `[REMOVE_TAG]` | 2 | Add or remove a structural tag |
| `[REWRITE_LINE]` | 3 | Rewrite specific dialogue (by ID) |
| `[CHANGE_TYPE]` | 3 | Change dialogue type (speech/thought/caption) |
| `[CHANGE_SPEAKER]` | 3 | Reassign a line to a different character |
| `[DELETE_LINE]` | 3 | Remove a dialogue line |
| `[ADD_LINE_AFTER]` | 3 | Insert a new line after the referenced one |
| `[FULL_PANEL_REWRITE]` | 3 | Rewrite all dialogue for an entire panel |
| `[CHANGE]` | 0 | Change a lore field or scenario scene |
| `[ADD_SCENE_AFTER]` | 0 | Insert a new scene |

---

## The App — Technical Facts

The Comic Studio 3.0 is a Vite/React app located in `app/`.

**To start it:**
```powershell
cd "architecture 3.0/app"
npm run dev
# → http://localhost:5173/
```

### Design System (Modern Drafting Board)

The app uses a **Modern Drafting Board** design system — a clean, analog-inspired light theme. The persisted master is at:
```
app/design-system/architecture-3.0-assembly-studio/MASTER.md
```

**Fonts:** `Space Grotesk` (headings) + `Inter` (body text) + `IBM Plex Mono` (monospace/code)  
**Theme:** Light — panels `#FAFAF9`, background `#F3F4F6`, primary blue `#1E3A8A`

**CSS file map:**
| File | Purpose |
|------|---------|
| `app/src/index.css` | Base reset, typography, font imports, scrollbar, focus-visible outlines, motion accessibility |
| `app/src/styles/app.css` | Shell layout: `.app-container`, `.phase-tab-bar`, `.phase-tab`, `.nav-btn`, `.export-btn`, `.assembly-subbar` |
| `app/src/styles/components.css` | Component library: sidebar, canvas, properties panel, QA board, buttons, form fields |
| `app/src/styles/*.css` | Per-phase styles (script, panels, pacing, characters, character-hub, lore) |

**Key design tokens (from `tailwind.config.js` + `index.css` `:root`):**
```
primary: #1E3A8A (hover: #1D4ED8)       /* blue action colour */
background-panel: #FAFAF9                 /* card/panel surface */
secondary: #F3F4F6                        /* page background */
foreground: #1F2937                       /* primary text */
foreground-muted: #6B7280                 /* secondary text */
border: #E5E7EB                           /* standard border */
border-blueprint: #3B82F6                 /* accent borders */
destructive: #EF4444 | success: #10B981 | warning: #F59E0B
```

**CSS class conventions:**
- Tailwind utility classes are used throughout (e.g. `bg-background-panel`, `text-foreground-muted`, `border-border`)
- Per-phase CSS files use BEM-style naming (e.g. `.lore-section-header`, `.chub-mood-card`)
- All interactive elements have `cursor: pointer` (globally set in `index.css`)
- Use `transition-colors` or `transition-all` for state changes

**Accessibility rules enforced:**
- `@media (prefers-reduced-motion: reduce)` — all transitions collapse to 0.01ms
- `focus-visible` outlines on all interactive elements (2px solid `#1E3A8A`)
- `htmlFor` + `id` pairing required on all form labels

**API endpoints (served by the Vite dev plugin):**
- `GET /api/load-image?path=[relative_path]` — Serves binary image files (PNG/JPG/WebP) from the project root. **Must be routed before `/api/load`** in `vite.config.ts` to avoid the `startsWith('/api/load')` handler swallowing it.
- `GET /api/load?path=[relative_path]` — Reads any JSON file relative to the project root. Returns `{ data: {...} }` or `{ error: "..." }`.
- `POST /api/save` — Body: `{ path: "...", content: {...} }`. Writes JSON to any path relative to project root. (Do NOT double-stringify `content` before sending — the server stringifies it automatically.)
- `POST /api/save-qa` — Body: `{ path: "...", content: "..." }`. Writes a markdown QA report (text content).

**Path resolution:** All paths in the API are relative to the `architecture 3.0/` project root (one level above `app/`).

Examples:
- Read lore: `GET /api/load?path=data%2Flore.json`
- Read script: `GET /api/load?path=data%2Fscript.json`
- Save panels: `POST /api/save` with `{ "path": "data/panels.json", "content": {...} }`

**The app does not run agents.** It is purely a review and QA tool. You (the agent) run in a separate AI chat session and read/write JSON files directly.

---

## PRODUCTION_STATUS.md — Keeping It Updated

Every time you complete a phase, update `PRODUCTION_STATUS.md`.

| Tag | Meaning |
|-----|---------|
| `[TODO]` | Not started |
| `[IN PROGRESS]` | Currently generating |
| `[REVIEW]` | Output written, awaiting human approval in the app |
| `[APPROVED]` | Locked. No further changes without explicit human instruction. |

**Rule:** If a phase is `[APPROVED]`, never modify its output unless the human explicitly says to reopen it.

---

## Agent Behavior Rules

1. **Read before writing.** Always check if an output file already exists in `data/`. If it does and the phase is `[APPROVED]`, do not overwrite it without explicit instruction.
2. **Apply QA first.** Before regenerating any output, scan `qa/[phase]/` and apply all pending QA reports.
3. **Reference the pipeline instructions.** The customized `pipelines/` files contain project-specific rules. Never ignore them.
4. **Be surgical.** If a QA report flags one line, change only that line. Don't re-generate the entire file.
5. **Preserve IDs.** Dialogue IDs (`d_[page]_[panel]_[index]`), scene IDs, panel numbers — these are reference keys used across phases. Never renumber them unless explicitly instructed.
6. **Log your changes.** After applying modifications, append `[APPLIED]` to the bottom of each QA report file.
