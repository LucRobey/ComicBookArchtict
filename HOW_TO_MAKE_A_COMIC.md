# 🎨 How to Make a New Comic — Architecture 3.0 + Comic Studio 3.0

> Full end-to-end guide for creating a comic with this framework.
> Every step is sequential. **Do not skip ahead.** Changes in an early phase cascade through everything downstream.

---

## Overview: The Pipeline at a Glance

```
[Pre-Phase]  Project Initialization   → pipelines/ customized for your project
      ↓
[Phase 0]    Raw World Building       → data/user_lore.json
      ↓
[Phase 0.5]  Style Research           → data/*_style.json (researched layout/writing rules)
      ↓
[Phase 0.6]  Lore Merging             → data/final_lore.json
      ↓
[Phase 0.2]  Scenario                 → data/scenario_*.json (synopsis, chapters, scenes)
      ↓
[Phase 0.7]  Characters Hub           → data/character_moods.json, personality, visual signatures
      ↓
[Phase 3A]   Script (Scene)           → data/scene_script.json
      ↓
[Phase 1]    Character Intros         → data/intro_pages.json
      ↓
[Phase 1.5]  Pacing                   → data/pages.json
      ↓
[Phase 2 & 3B] Panels & Panel Script  → data/panels.json & data/script.json (in parallel)
      ↓
[Phase 4/5]  Image Generation         → data/images/page_N/panel_N.png
      ↓
[Phase 6]    Assembly                 → You, manually, in the app
```

All generated content lives in the `data/` folder as plain JSON files. The **Comic Studio 3.0 app** is your dashboard for reviewing, editing, and flagging issues at each phase.

---

## 🛑 Before You Start: Copy the Template

1. Duplicate the entire `architecture 3.0` folder.
2. Rename it to your project name (e.g., `my_comic_project`).
3. Do **not** modify the original template.
4. Start the Comic Studio app:
   ```
   cd app
   npm run dev
   ```
   The app runs at `http://localhost:5173/`.

---

## 🔄 The Universal Fix Loop

At every phase (except Phase 6), the same loop applies when you want changes:

```
1. AI generates output → saved to data/[file].json
2. You review it in Comic Studio (relevant tab)
3. Happy with it → approve and move to the next phase
4. Want changes → click 🚩 on any element in the app
5. Fill the QA drawer → click Export QA Report
6. Report is saved to qa/[phase]/qa_report_..._[TIMESTAMP].md
7. Tell the AI: "Apply my modifications"
8. AI reads the report and updates only the flagged elements
9. Back to step 2
```

QA reports are **never overwritten** — each one gets a unique timestamp.

---

## 🚀 Pre-Phase: Project Initialization

**What it does:** Customizes the blank pipeline files in `pipelines/` to fit your specific project — scene types, tone rules, structural tags. This only runs once, at the very start.

### What you say

Open a new AI chat. Give a brief summary of your project, then say:

> *"This comic is about [your story]. Execute Project Initialization Protocol."*

**Example:**
> *"This is a slice-of-life dramedy about two mismatched office workers. Dry humor, emotional honesty, no genre conventions. Execute Project Initialization Protocol."*

### What the agent does

Reads `init_project_protocol.md` and edits the `pipelines/` files:
- `pacing_instructions.md` → fills in your scene type weights
- `structuring_instructions.md` → sets your structural tags
- `scripting_instructions.md` → sets your tone and dialogue rules
- Creates `PRODUCTION_STATUS.md` — your Kanban board

### Done when

Every `[ACTION REQUIRED]` placeholder in every `pipelines/` file has been replaced with your project's specifics.

---

## 📖 Phase 0: Raw World Building

**App Tab:** 🌍 Lore & Story (Sub-tab: `🌍 Raw World`)  
**Pipeline files:** `pipelines/01_style_building.md`, `02_character_distillation.md`  
**Outputs:** `data/user_lore.json`

> ⚠️ **THIS PHASE IS A CONVERSATION.** You talk freely with the agent in chat until your core story world concept is shaped.

### What you say
Talk to the agent about your custom story idea, factions, setting, and rules:
> *"The story is about a space-port detective who runs a bakery. The tone is cozy but mystery-driven. Key rules: No magic, baking solves problems..."*

When finished, instruct the agent:
> *"Save this as `data/user_lore.json`."*

---

## 🔍 Phase 0.5: Style Research

**App Tab:** 🌍 Lore & Story (Sub-tab: `🔍 Style Research`)  
**Pipeline files:** `pipelines/09b_style_research.md`  
**Outputs:** `data/panel_style.json`, `data/script_style.json`, `data/lore_style.json`, `data/visual_style.json`

### What you say
Provide the name of the reference comic you want to adapt the layout and narrative style from:
> *"We want to adopt the style of Hergé's Tintin (1950s era). Execute Phase 0.5 Style Research."*

### What the agent does
The agent performs **targeted web searches** to analyze the visual layouts, scripting pacing, and narrative devices of the reference comic. It extracts:
1.  **Panel layouts** (`panel_style.json`): Grid template structures, gutters, reading flow, and CSS grid patterns.
2.  **Script conventions** (`script_style.json`): Dialogue density, caption voice, silent panel rates, sound effects rules, lettering, and style anti-patterns.
3.  **Thematic tropes** (`lore_style.json`): Archetypes, story mechanisms, and world rules.
4.  **Visual DNA** (`visual_style.json`): Outlines, shading, color palette tokens, and image generation prompts (positive and negative style constraints).

### In the app
You can review the researched style guidelines in the **Style Research** sub-tab. When `Edit Style Guide` is toggled, you can edit tropes, rules, color palettes (via color picker), prompts, and layout templates inline.

---

## 🌪️ Phase 0.6: Lore Merging

**App Tab:** 🌍 Lore & Story (Sub-tab: `✨ Blended World`)  
**Pipeline files:** `pipelines/09c_lore_merge.md`, `09c_lore_merge.py`  
**Inputs:** `data/user_lore.json`, `data/lore_style.json`  
**Outputs:** `data/final_lore.json`

### What you do
Open the **Blended World** sub-tab and click the **Mix World & Style** button.

### What the agent does
Runs the Python script `09c_lore_merge.py` to trigger Gemini, blending the user's raw story ideas with the style tropes to create a single active project bible:
*   Combines the user's genre/setting and the style's pacing to create a **Narrative Blend**.
*   Adapts the user's core conflict through the style's signature plot drivers.
*   Merges and resolves contradictions in the world rules.
*   Populates the active project bible `data/final_lore.json`.

### Done when
`data/final_lore.json` exists and is approved. We are now ready to build the characters and scene scenarios.

---

## 📝 Phase 0.2: Scenario Development

**App Tab:** 📝 Scenario  
**Pipeline files:** `pipelines/03_scenario_development.md`  
**Outputs:** `data/scenario_inputs.json`, `data/scenario_synopsis.json`, `data/scenario_chapters.json`, `data/scenario_scenes.json`

> ⚠️ **THIS PHASE IS A STEP-BY-STEP PROCESS.** You proceed through the tabs in the app (Inputs → Synopsis → Chapters → Scenes), triggering the agent generation at each step.

### What you say

Start with the Inputs tab in the app, write your logline, themes, and anecdotes. Then ask the agent:

> *"Generate the scenario synopsis and chapters based on my inputs."*

Continue this process for each tab, guiding the agent until the final scene-by-scene breakdown is generated.

### What the agent does

Builds a decoupled set of JSON files that structurally defines your entire narrative arc and scene list.

### In the app

Open the **Scenario** tab and review each sub-tab. Use 🚩 to flag anything that feels wrong. QA reports go to `qa/scenario/`.

Then say: **"Apply my modifications."**

### Done when

All four scenario files exist, are approved, and all scenes feel right.

---

## 👤 Phase 0.7: Character Foundation & Hub

**App Tab:** 👤 Characters Hub  
**Pipeline files:** `pipelines/05_visual_signature.md`, `06_personality_signature.md`, `07_mood_simulation.md`  
**Inputs:** `data/final_lore.json` (active blended bible), `data/scenario_scenes.json`  
**Outputs:** `data/character_moods.json`, `data/characters/[Name]/personality_signature.json`, character turnaround images, emotion portraits

### What you say

> *"Execute Phase 0.7 Character Foundation. Read data/final_lore.json and pipelines/05_visual_signature.md / 06_personality_signature.md / 07_mood_simulation.md to generate the personality signatures, turnaround sheets, and character moods."*

### What the agent does

*   **Visual translation** (`05_visual_signature.md`): Translates character reference photos into the target visual style, generating a canonical visual description and turnaround images.
*   **Personality profiling** (`06_personality_signature.md`): Creates project-specific personality signatures and generates 12 dominant emotion portraits (face only) for image-to-image styling.
*   **Mood simulation** (`07_mood_simulation.md`): Simulates emotional trajectories (dominant emotion, feels, shows, tension) for each character in each scene.

### In the app

Open the **Characters Hub** tab. You can:
*   View character bios, visual turnarounds, and personality networks.
*   Review the scene-by-scene mood matrix and edit fields inline (changes save instantly).
*   Flag issues on personality or visuals. QA reports go to `qa/character-hub/`.

### Done when

Turnarounds, personality signatures, and `data/character_moods.json` are created and approved.

> ⚠️ **After approval:** Check that `pipelines/pacing_instructions.md` scene-type weights match your actual scenes.

---

## 🎭 Phase 1: Character Introductions

**App Tab:** 🎭 Characters  
**Pipeline file:** `pipelines/intro_instructions.md`  
**Input:** `data/final_lore.json`  
**Output:** `data/intro_pages.json`

### What you say

> *"Execute Phase 1. Read `data/final_lore.json` and `pipelines/intro_instructions.md`. Generate `data/intro_pages.json`."*

### What the agent does

Builds a dedicated introductory page for each main character — structure and script in one pass.

```json
{
  "intro_pages": [
    {
      "page_number": 1,
      "character": "CHARACTER_A",
      "layout_type": "full_page_splash",
      "scene_description": "...",
      "narrator_caption": "...",
      "character_dialogue": "...",
      "panels": [{ "panel_number": 1, "framing": "Wide Shot", "action": "..." }]
    }
  ]
}
```

### In the app

Open the **Characters** tab. Click 🚩 Flag for Agent.

Fix types: `Rewrite Scene`, `Change Layout`, `Rewrite Caption`, `Rewrite Dialogue`

QA reports go to: `qa/characters/`. Then say: **"Apply my modifications."**

> ⚠️ **After approval:** Update `pipelines/generation_instructions.md` with your project's visual style baseline.

---

## 📋 Phase 1.5: Pacing & Pagination

**App Tab:** 📋 Pacing  
**Pipeline file:** `pipelines/pacing_instructions.md`  
**Input:** `data/scenario_scenes.json`  
**Output:** `data/pages.json`

### What you say

> *"Execute Phase 1.5. Read `data/scenario_scenes.json` and `pipelines/pacing_instructions.md`. Generate `data/pages.json`."*

### What the agent does

Distributes your scenes across physical pages based on dramatic weight. Each page gets a type, a scene reference, and a focus description.

```json
{
  "total_pages": 8,
  "pages": [
    {
      "page_number": 3,
      "scene_id": 1,
      "type": "interior",
      "focus": "What this page shows...",
      "anecdotes_included": ["anecdote_key"]
    }
  ]
}
```
Page types: `cover`, `character_intro`, `interior`, `chapter_break`, `splash`

### In the app

Open the **Pacing** tab. Click 🚩 on any page to flag it.

Fix types: `Rewrite Focus`, `Extend (Add Page)`, `Merge With Next`, `Change Type`, `Add Page After`

QA reports go to: `qa/pacing/`. Then say: **"Apply my modifications."**

---

## 📐 Phase 2: Panel Structuring

**App Tab:** 📐 Panel Structure  
**Pipeline file:** `pipelines/structuring_instructions.md`  
**Input:** `data/pages.json`, `data/intro_pages.json`  
**Output:** `data/panels.json`

### What you say

> *"Execute Phase 2. Read `data/pages.json`, `data/intro_pages.json`, and `pipelines/structuring_instructions.md`. Generate `data/panels.json`."*

### What the agent does

Breaks each page into 3–5 panels with camera angles, action descriptions, character lists, and structural tags.

```json
{
  "pages": [
    {
      "page_number": 1,
      "panels": [
        {
          "panel_number": 1,
          "framing": "Wide Establishing Shot",
          "action": "What is visually happening...",
          "characters_present": ["CHARACTER_A"],
          "tags": ["[ESTABLISHING]"]
        }
      ]
    }
  ]
}
```

### In the app

Open the **Panel Structure** tab. You have **two ways to make changes:**

**No agent needed — Inline:**
- Change a panel's **framing** directly from the dropdown → saves instantly to `data/panels.json`.

**Agent needed — 🚩 Flag:**
Use this for structural changes: `Rewrite Action`, `Split Into Two`, `Merge With Next`, `Add Panel After`, `Change Characters`, `Add/Remove Tag`

QA reports go to: `qa/structure/`. Then say: **"Apply my modifications."**

---

## ✍️ Phase 3A: Script (Scene)

**App Tab:** ✍️ Script (Sub-tab: `🎬 Scene Script`)  
**Pipeline file:** `pipelines/10_scene_script.md`  
**Input:** `data/scenario_scenes.json`, `data/final_lore.json`, `data/script_style.json`  
**Output:** `data/scene_script.json`

### What you say

> *"Execute Phase 3A Scene Script. Read data/scenario_scenes.json, data/final_lore.json, data/script_style.json, and pipelines/10_scene_script.md to generate data/scene_script.json."*

### What the agent does
Writes the sequential scene-by-scene script beats (dialogue, narration, SFX, and silences) based on the world lore.

---

## ✍️ Phase 3B: Script (Panel)

**App Tab:** ✍️ Script (Sub-tab: `📐 Panel Script`)  
**Pipeline file:** `pipelines/11_panel_script.md`  
**Input:** `data/scene_script.json`, `data/panels.json`, `data/script_style.json`, `data/final_lore.json`  
**Output:** `data/script.json`

### What you say

> *"Execute Phase 3B Panel Script. Read data/scene_script.json, data/panels.json, data/script_style.json, data/final_lore.json, and pipelines/11_panel_script.md to generate data/script.json."*

### What the agent does
Distributes scene beats to panels, configures dialogue bubbles, sets reading orders, and defines character acting instructions.

```json
{
  "pages": [
    {
      "page_number": 1,
      "panels": [
        {
          "panel_number": 1,
          "dialogues": [
            {
              "id": "d_1_1_1",
              "speaker": "NARRATOR",
              "text": "Sunday. 9:04 AM.",
              "type": "caption"
            }
          ]
        }
      ]
    }
  ]
}
```
Dialogue types: `speech` 💬, `thought` 💭, `caption` 📝

> ⚠️ Dialogue IDs (`d_[page]_[panel]_[line]`) are permanent. Never renumber them — the Assembly tab uses them for bubble placement.

### In the app

Open the **Script** tab. You have **two ways to make changes:**

**No agent needed — Inline:**
- Double-click any dialogue line to edit the text directly → saves instantly.

**Agent needed — 🚩 Flag:**
Use this for anything beyond a text tweak: `Rewrite Line`, `Change Type`, `Change Speaker`, `Delete Line`, `Add Line After`, `Full Panel Rewrite`

QA reports go to: `qa/script/`. Then say: **"Apply my modifications."**

---

## 🖼️ Phase 4/5: Image Generation & Review

**App Tab:** *(None — this runs entirely in AI chat)*  
**Pipeline file:** `pipelines/generation_instructions.md`  
**Input:** `data/panels.json`, `data/script.json`  
**Output:** `data/images/page_N/panel_N.png`

### What you say

Work **one page at a time.** Start with:

> *"Execute Phase 4. Read `data/panels.json`, `data/script.json`, and `pipelines/generation_instructions.md`. Generate images for Page 1."*

When you see the results, respond in chat with what needs fixing:

> *"Panel 2 — the character's face looks wrong. Do an img2img fix focused on the face."*

> *"Panel 4 — composition is completely off. Full regeneration."*

Approve each page before moving to the next.

### What the agent does

**Phase 4:** Converts each panel action + framing into an optimized image prompt, generates the artwork.  
**Phase 5:** Targeted fix loop — img2img for small errors, full regeneration for fundamental problems.

Fix types:
- `[IMG2IMG_FIX]` — targeted fix for one wrong element (face, object, expression)
- `[REGENERATE]` — full regeneration when composition or framing is fundamentally wrong

QA notes (optional, manual): `qa/images/`

---

## 🧩 Phase 6: Assembly

**App Tab:** 🧩 Assembly  
**Input:** `data/images/`, `data/script.json`  
**Output:** Your finished pages

> ⚠️ **THIS PHASE IS ENTIRELY MANUAL. You do not talk to the agent here.**

### What you do

1. Open the **Assembly** tab in Comic Studio (`cd app && npm run dev` → `http://localhost:5173/`).
2. The **left sidebar** lists all your pages (from `data/pages.json`). Click a page to load its canvas.
3. **Drag panel images** onto the canvas and position them.
4. **Drag dialogue lines** from the script panel to place speech bubbles.
5. Resize and reposition elements freely — positions are auto-saved.
6. The **Properties panel** on the right lets you adjust bubble styling, font size, tail direction, and z-index.
7. Click **Export Page** when a page is done.

If a speech bubble text needs a real rewrite, go back to the **Script** tab → inline edit → done.

---

## ⚡ Quick Reference

| You want to… | Do it in… |
|---|---|
| Define world rules & tone | Phase 0 chat → `data/user_lore.json` |
| Extract reference comic style rules | Phase 0.5 agent run → `data/lore_style.json`, `data/visual_style.json`, etc. |
| Blend world story & style rules | Phase 0.6 dashboard mix → `data/final_lore.json` |
| Define the story arc | Phase 0.2 chat/tabs → `data/scenario_*.json` |
| Build character signatures & moods | Phase 0.7 chat/hub → `data/character_moods.json` & personality profiles |
| Add/remove a scene | Phase 0.2 chat → `data/scenario_scenes.json` |
| Add or merge a page | 📋 Pacing tab → 🚩 Flag |
| Fix a character's intro | 🎭 Characters tab → 🚩 Flag |
| Change a panel's camera angle | 📐 Panel Structure tab → framing dropdown |
| Split a panel into two | 📐 Panel Structure tab → 🚩 Flag |
| Fix a single dialogue line | ✍️ Script tab → double-click to edit inline |
| Rewrite a full panel's dialogue | ✍️ Script tab → 🚩 Flag |
| Fix an image | Phase 4/5 AI chat |
| Place a speech bubble | 🧩 Assembly tab |

---

## 🚦 Production Status Tags

Update `PRODUCTION_STATUS.md` as you move through the pipeline:

| Tag | Meaning |
|---|---|
| `[TODO]` | Not started |
| `[IN PROGRESS]` | Currently generating or reviewing |
| `[REVIEW]` | Output generated, needs your review in the app |
| `[APPROVED]` | Phase locked. Do not touch. |

---

## 📁 File Structure Reference

```
architecture 3.0/
│
├── app/                       ← Comic Studio 3.0 React app
│   └── (run: cd app && npm run dev → localhost:5173)
│
├── data/                      ← ALL generated JSON files
│   ├── user_lore.json         ← User's raw story ideas
│   ├── lore_style.json        ← Researched narrative tropes of reference style
│   ├── visual_style.json      ← Researched Visual DNA details & prompts
│   ├── panel_style.json       ← Researched panel layout templates (CSS Grids)
│   ├── script_style.json      ← Researched script conventions & anti-patterns
│   ├── final_lore.json        ← Blended lore (user + style)
│   ├── scenario_inputs.json
│   ├── scenario_synopsis.json
│   ├── scenario_chapters.json
│   ├── scenario_scenes.json
│   ├── scene_script.json      ← Scene-level beats script
│   ├── pages.json
│   ├── intro_pages.json
│   ├── panels.json
│   ├── script.json
│   ├── characters/            ← Character personality & visual state folders
│   │   └── [Name]/
│   │       └── personality_signature.json
│   └── images/
│       └── page_N/
│           └── panel_N.png
│
├── qa/                        ← All QA reports by phase
│   ├── lore/
│   ├── character-hub/
│   ├── characters/
│   ├── pacing/
│   ├── structure/
│   ├── script/
│   └── images/
│
├── pipelines/                 ← Agent instruction files (customized at init)
├── docs/                      ← Per-phase technical reference
│
├── FILE_GUIDE.md              ← What every file and folder does
├── HOW_TO_MAKE_A_COMIC.md     ← This document
├── MASTER_GUIDE.md            ← 60-second overview
├── PRODUCTION_STATUS.md       ← Kanban board
├── init_project_protocol.md   ← One-time project setup instructions
├── new_research_handoff.md    ← Style research & lore handoff
├── scenario_pipeline_handoff.md ← Scenario pipeline architecture & handoff
├── scenario_layout_handoff.md  ← Relationship tree layout handoff
└── script_pipeline_handoff.md  ← Scripting pipeline architecture & handoff
```
