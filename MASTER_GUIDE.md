# 🗺️ Comic Studio 3.0 — Master Guide & Architecture Reference

Welcome to the **Comic Studio / Assembly Studio (Architecture 3.0)** project. This document serves as the unified source of truth for both humans and AI agents. It maps out the sequential production pipeline, data flows, folder organization, QA procedures, and technical API specifications.

---

## 🚀 The Pipeline in 30 Seconds

Production is strictly sequential. Approve one phase before starting the next; changes cascade downstream.

| Phase | Tab Name in App | Inputs | Key Outputs | Reference Docs |
|---|---|---|---|---|
| **Pre** | — | Story Brief | Customized `pipelines/` files | `init_project_protocol.md` |
| **0** | 🌍 Lore & Story (Raw) | Story concept, genre ideas | `data/user_lore.json` | `docs/phase_0_lore.md` |
| **0.5**| 🌍 Lore & Story (Style)| Reference Comic Name | `data/*_style.json` (panel, script, lore, visual) | `pipelines/09b_style_research.md` |
| **0.6**| 🌍 Lore & Story (Blend)| `user_lore.json`, `lore_style.json` | `data/final_lore.json` | `pipelines/09c_lore_merge.md` |
| **0.2**| 🌍 Lore & Story (Scenario)| `data/final_lore.json`, scenario inputs | `data/scenario_synopsis.json`, `data/scenario_chapters.json`, `data/scenario_scenes.json` | `pipelines/03_scenario_development.md` |
| **0.7**| 👤 Characters Hub | `data/final_lore.json`, scenes | `data/character_moods.json`, personality/visual signatures | `pipelines/05_visual_signature.md` |
| **3A** | ✍️ Script (Scene) | synopsis, scenes, chapters, moods, personality, final_lore.json, script_style.json | `data/scene_script.json` | `pipelines/10_scene_script.md` |
| **1** | 🎭 Characters | final_lore.json, character personality | `data/intro_pages.json` | `docs/phase_1_characters.md` |
| **1.5**| 📋 Pacing | `data/scene_script.json` | `data/pages.json` | `docs/phase_1.5_pacing.md` |
| **2** | 📐 Panel Structure | `data/pages.json`, `data/scene_script.json`, `data/final_lore.json`, `data/panel_style.json` | `data/panels.json` | `docs/phase_2_structure.md` |
| **3B** | ✍️ Script (Panel) | `data/scene_script.json`, `data/panels.json`, `data/script_style.json`, `data/final_lore.json` | `data/script.json` | `pipelines/11_panel_script.md` |
| **4/5**| *(AI Chat only)* | `data/script.json` | `data/images/page_N/panel_N.png` | `docs/phase_4_images.md` |
| **6** | 🧩 Assembly | images, script.json, panels.json | Final Composited Page Layouts | `docs/phase_6_assembly.md` |

---

## 📁 Folder Structure

```
architecture 3.0/
├── app/                      ← Comic Studio dashboard (cd app && npm run dev)
│   ├── src/                  ← Vite + React components, stores, styles
│   └── vite.config.ts        ← Vite dev server configuration & API middleware
├── data/                     ← Flat JSON files + subfolders for character sheets/assets
│   ├── user_lore.json        ← User's raw world, tone, genre, and rules input
│   ├── lore_style.json       ← Extracted narrative tropes/rules of reference style
│   ├── visual_style.json       ← Visual DNA, color tokens, and diffusion prompts
│   ├── panel_style.json      ← Panel layout constraints, CSS grids, and spacing
│   ├── script_style.json     ← Narrative conventions, word counts, and anti-patterns
│   ├── final_lore.json       ← Blended world lore (user_lore + lore_style)
│   ├── scenario_inputs.json  ← Scenario inputs
│   ├── scenario_synopsis.json← Scenario synopsis
│   ├── scenario_chapters.json← Scenario chapters breakdown
│   ├── scenario_scenes.json  ← Scenario scene list
│   ├── geography.json        ← Location library registry (v1.4)
│   ├── character_moods.json  ← Character mood matrix
│   ├── characters/           ← Character data folders (personality_signature.json)
│   ├── templates/            ← Reusable visual and layout schema templates
│   │   └── panels_template.json ← Phase 2 visual schema template (enriched with focal & acting detail)
│   ├── intro_pages.json      ← Phase 1 outputs
│   ├── pages.json            ← Phase 1.5 outputs
│   ├── panels.json           ← Phase 2 outputs
│   └── script.json           ← Phase 3 outputs
├── qa/                       ← QA feedback reports organized by phase
│   ├── lore/
│   ├── scenario/
│   ├── character-hub/
│   ├── characters/
│   ├── pacing/
│   ├── structure/
│   ├── script/
│   └── images/
├── pipelines/                ← Task instruction files for AI agents
├── docs/                     ← Design guidelines and reference documentation per phase
├── MASTER_GUIDE.md           ← THIS FILE (Unified Architecture & Agent Guide)
├── FILE_GUIDE.md             ← Details on every single codebase file
├── HOW_TO_MAKE_A_COMIC.md    ← Step-by-step human guide
└── PRODUCTION_STATUS.md      ← Project Kanban board status
```

---

## 🔄 The Data Flow Chain

Each stage reads from the upstream inputs and saves to a downstream output.

```
data/user_lore.json ────┐
                        ├──► data/final_lore.json (Phase 0.6 Merge) ────┐
data/lore_style.json ───┘                                               │
                                                                        │
data/scenario_*.json ─────────────────────────┐                         │
                                              ├──► data/scenario_scenes.json ◄──┤
                                              │                                 │
                   data/character_moods.json ◄┘                                 │
                                                                                │
data/scenario_scenes.json ────┬─────────────────────────────────────────────────┤
                              ↓                                                 │
                  data/scene_script.json (Phase 3A Scene Script) ───────────────┤
                              ↓                                                 │
                  data/pages.json (Phase 1.5 Pacing) ───────────────────────────┤
                              ↓                                                 │
                  data/panels.json (Phase 2 Grid) ◄───[in parallel]───► data/script.json (Phase 3B Panel Script)
                              │                                           │
                              └─────────────────────┬─────────────────────┘
                                                    ▼
                                           data/assembly/pages/
```

### Upstream Rules
* **No Skipping:** Do not write or generate files for a downstream phase unless all upstream dependencies exist and have been approved.
* **Mood Dependency:** `data/character_moods.json` is a direct upstream dependency for Phase 1 (intro pages) and Phase 3 (scripting/dialogue). The scripting agent must reference it for character emotions in each scene.

---

## 🚩 The Universal Modifications Loop (QA System)

When a human reviewer identifies issues in the application:
1. **Flag:** The user clicks the 🚩 icon on any UI element and enters feedback inside the QA slide-up drawer.
2. **Export:** Clicking "Export QA Report" posts the report to the corresponding phase subdirectory in `qa/`.
3. **Resolve:** Tell the AI: **"Apply my modifications."** The agent parses the markdown file(s) in `qa/[phase]/`, applies targeted edits, and appends `[APPLIED]` at the bottom of the processed QA file.

### QA Phase Folder Map
* Phase 0: `qa/lore/`
* Phase 0.2: `qa/scenario/`
* Phase 0.5: `qa/character-hub/`
* Phase 1: `qa/characters/`
* Phase 1.5: `qa/pacing/`
* Phase 2: `qa/structure/`
* Phase 3: `qa/script/`
* Phase 4/5: `qa/images/`

### QA Operation Tag Reference
* `[REWRITE_VISUAL]` (Phase 0.5): Rewrite character's `canonical_visual.md`.
* `[REWRITE_PERSONALITY]` (Phase 0.5): Rewrite character's `personality_signature.json`.
* `[REGENERATE_SHOT:{loc}:{variant}:{shot}]` (Phase 0): Re-generate a background shot image.
* `[MODIFY_SHOT:{loc}:{variant}:{shot}]` (Phase 0): Modify existing shot (image-to-image).
* `[REGENERATE_PALETTE:{loc}:{variant}]` (Phase 0): Update variant colors.
* `[CHANGE_LAYOUT]` (Phase 1): Switch character page layout template.
* `[REWRITE_ACTION]` (Phase 2): Change action/camera panel direction.
* `[SPLIT]` (Phase 2): Divide a panel in two.
* `[REWRITE_LINE]` (Phase 3): Rewrite dialogue line by ID.
* `[CHANGE_SPEAKER]` (Phase 3): Reassign dialogue speaker.

---

## 💻 Tech Stack & API Reference

### Running the Dashboard
```powershell
cd app
npm run dev
# Dashboard launches at http://localhost:5173
```

### Dev Server Endpoints (Vite Middleware)
The dashboard uses a custom Vite plugin to load, save, and list files. All paths are relative to the project root directory.

* `GET /api/load?path=[relative_path]`  
  Loads a JSON file. Returns `{ data: {...} }`.
* `POST /api/save`  
  Saves a JSON file. Body format: `{ path: string, content: any }`.  
  *Note: Do not double-stringify content before sending.*
* `POST /api/save-qa`  
  Exports a markdown report to the workspace. Body format: `{ path: string, content: string }`.
* `GET /api/load-image?path=[relative_path]`  
  Loads binary image data with appropriate MIME type headers.
* `GET /api/list-dir?path=[relative_path]`  
  Lists all files and subdirectories inside the specified relative folder.

---

## 🎨 UI/UX & Design Tokens

The workspace follows a custom **Modern Drafting Board** aesthetic, defined in `app/src/index.css` via Tailwind `@theme` properties:

* **Surface:** `#FAFAF9` (Main panels and sheets)
* **Surface Raised:** `#F3F4F6` (Page background wrapper)
* **Canvas:** `#0D1117` (The dark editing canvas)
* **Brand Action:** `#1E3A8A` (Action buttons and indicators)
* **Accent Primary:** `#3B82F6` (Blueprint Blue)
* **Accent Amber:** `#D97706` (Flags and highlights)

### CSS Architecture
* `app/src/index.css`: Tailwind configuration and core token map.
* `app/src/styles/app.css`: Shell layouts and global bars.
* `app/src/styles/components.css`: Sidebars, panels, drawers, and buttons.
* `app/src/styles/[phase].css`: Phase-specific layout stylesheets.

---

## 🤖 Rules for AI Agents

1. **Be Surgical:** When fixing a QA flag or applying user edits, only change the target elements. Do not regenerate the entire file or overwrite unrelated fields.
2. **Preserve IDs:** Dialogue IDs (`d_[page]_[panel]_[index]`), scene IDs, and layout anchors are referenced globally. Never renumber or regenerate them unless explicitly instructed.
3. **Verify Types:** Run `npx tsc --noEmit` from `app/` after making major typescript file edits to ensure type safety.
4. **Sandboxing:** Do not load or save files outside the workspace root directory. Always sanitize path variables using safety helpers.
5. **No Placeholders:** Ensure all files generated are fully functional, with no mock content or placeholders.
6. **Single Local Server Rule:** Before running `npm run dev` or starting any local dev server, verify if a server is already running on port 5173 or in the background. If one is active, DO NOT start another. If launching a server is required, confirm with the user or check if there is an active process first to prevent launching redundant server instances that consume system resources.
