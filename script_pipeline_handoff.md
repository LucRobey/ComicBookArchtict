# Reference: Two-Stage Script Pipeline (Phase 3A + 3B)

This document details the architectural design, file flow, and agent coordination protocols for the **two-stage scripting pipeline**. This pipeline separates narrative writing (what characters say) from visual layout editing (which panel each line goes into), producing higher-quality dialogue and better panel pacing than the previous single-stage approach.

---

## 1. Architectural Overview

Instead of generating panel-by-panel dialogue directly from the panel breakdown, the scripting process is split into two sequential stages. Each stage has its own agent, its own output file, and its own QA surface in the app. Both stages are informed by **style guides** produced by a preliminary research phase (Phase 0.5).

```
  Phase 0.5: Style Research ──► User Review ──► Stage 3A: Scene Script ──► User Review ──► Stage 3B: Panel Script ──► User Review
        (Style Researcher)                          (Writer)                                    (Editor)
```

| Phase | Agent Role | Core Task | Output |
|-------|-----------|-----------|--------|
| **0.5** | Style Researcher | Research a reference comic and extract visual layout + narrative writing conventions | `data/panel_style.json` + `data/script_style.json` |

| Stage | Agent Role | Core Task | Output |
|-------|-----------|-----------|--------|
| **3A** | Comic Book Writer | Write all dialogue, narration, SFX, and pacing as ordered beat sequences per scene | `data/scene_script.json` |
| **3B** | Comic Book Editor | Assign beats to panels, add lettering specs, acting direction, and reading flow | `data/script.json` (v2.0) |

**Why two stages:** Writing dialogue is a narrative craft problem — character voice, subtext, emotional arcs. Placing dialogue in panels is a visual storytelling problem — density, reading order, page rhythm. These are fundamentally different cognitive tasks. Combining them forces the agent to do both poorly. Separating them lets each agent focus on what it does best.

---

## 2. Stage 3A — Scene Script (The Writer)

### Goal
Write the complete narrative content for every scene: who says what, in what order, with what subtext, at what volume. Also define narration, internal monologue, sound effects, and deliberate silences. No panel decisions are made here.

### Inputs (8 files — 7 mandatory + 1 optional style guide)

| File | Why |
|------|-----|
| [lore.json](file:///c:/Users/Users/Desktop/Emy%20christmass/architecture%203.0/data/lore.json) | World rules, tone, genre. Contains *"Characters never say what they mean"* — governs every line. |
| [script_style.json](file:///c:/Users/Users/Desktop/Emy%20christmass/architecture%203.0/data/script_style.json) | *(Optional)* Writing style constraints from the reference comic — dialogue density, caption usage, humor style, pacing, anti-patterns. If missing, proceed without. |
| [scenario_synopsis.json](file:///c:/Users/Users/Desktop/Emy%20christmass/architecture%203.0/data/scenario_synopsis.json) | Global narrative arc. Prevents scene-by-scene tunnel vision. |
| [scenario_chapters.json](file:///c:/Users/Users/Desktop/Emy%20christmass/architecture%203.0/data/scenario_chapters.json) | Chapter-level summaries and story progression. |
| [scenario_scenes.json](file:///c:/Users/Users/Desktop/Emy%20christmass/architecture%203.0/data/scenario_scenes.json) | Per-scene actions, locations, camera, emotional beats, anecdotes. The structural backbone. |
| [pages.json](file:///c:/Users/Users/Desktop/Emy%20christmass/architecture%203.0/data/pages.json) | Page-to-scene mapping. Provides the **page budget** — how many panels a scene gets, which constrains dialogue density. |
| [character_moods.json](file:///c:/Users/Users/Desktop/Emy%20christmass/architecture%203.0/data/character_moods.json) | Per-chapter emotional arcs. The `feels`/`shows` gap is the engine of every scene. |
| [personality_signature.json](file:///c:/Users/Users/Desktop/Emy%20christmass/architecture%203.0/data/personality_signature.json) | Verbal habits, writing notes, loves, hates, relationship dynamics. Non-negotiable for distinct character voice. |

### Output

[data/scene_script.json](file:///c:/Users/Users/Desktop/Emy%20christmass/architecture%203.0/data/scene_script.json) — follows the [scene_script_template.json](file:///c:/Users/Users/Desktop/Emy%20christmass/architecture%203.0/data/templates/scene_script_template.json) schema.

### Core Concept: The Beat

The atomic unit of the scene script is a **beat** — the smallest narrative moment. Six types:

| Type | What it is | Example |
|------|-----------|---------|
| `action` | Something physically happens | *Adèle turns the butter knife against the screw* |
| `dialogue` | A character speaks aloud | *"Probably... a Phillips head."* |
| `narration` | Omniscient or editorial voice | *The screw didn't move.* |
| `internal_monologue` | Character's unspoken thought | *She wasn't thinking about the toaster.* |
| `sfx` | A sound | *SKREEE* |
| `silence` | A deliberate dramatic pause | *The apartment hums.* |

Every beat has a **weight**:
- **`anchor`** — Dramatically essential. Needs its own visual space. 1–3 per scene max.
- **`supporting`** — Important but can share a panel with other beats.
- **`ambient`** — Atmospheric. Can be combined, trimmed, or cut if panels are tight.

Every dialogue beat carries: `speaker`, `text`, `delivery` (how they say it), `subtext` (what they actually mean), `volume` (whisper → shout).

### Agent Instructions
Full step-by-step workflow: [pipelines/10_scene_script.md](file:///c:/Users/Users/Desktop/Emy%20christmass/architecture%203.0/pipelines/10_scene_script.md)

---

## 3. Stage 3B — Panel Script (The Editor)

### Goal
Take the narrative beats from the scene script and assign them to specific panels within specific pages. Add lettering specifications (balloon types, caption styles, SFX treatment), character acting direction (expression, body language, gaze), panel rhythm, and reading order. Produce the final `script.json` used by image generation and assembly.

### Inputs

| File | Why |
|------|-----|
| [scene_script.json](file:///c:/Users/Users/Desktop/Emy%20christmass/architecture%203.0/data/scene_script.json) | The narrative beats to distribute. **Primary input.** |
| [script_style.json](file:///c:/Users/Users/Desktop/Emy%20christmass/architecture%203.0/data/script_style.json) | *(Optional)* Lettering conventions — balloon types, emphasis method, whisper/shout rendering. |
| [panel_style.json](file:///c:/Users/Users/Desktop/Emy%20christmass/architecture%203.0/data/panel_style.json) | *(Optional)* Layout style constraints — grid structure, signature patterns, reading flow, gutter style. Provides CSS Grid values for each page. |
| [scenario_scenes.json](file:///c:/Users/Users/Desktop/Emy%20christmass/architecture%203.0/data/scenario_scenes.json) | Camera direction and character manifest per scene. |
| [pages.json](file:///c:/Users/Users/Desktop/Emy%20christmass/architecture%203.0/data/pages.json) | Page layout proposals and panel counts. |
| [character_moods.json](file:///c:/Users/Users/Desktop/Emy%20christmass/architecture%203.0/data/character_moods.json) | Emotional state — drives acting direction. |
| [lore.json](file:///c:/Users/Users/Desktop/Emy%20christmass/architecture%203.0/data/lore.json) | Visual style and tone. |

### Output

[data/script.json](file:///c:/Users/Users/Desktop/Emy%20christmass/architecture%203.0/data/script.json) (schema v2.0) — enriched with lettering, acting direction, panel rhythm, and beat references.

### What Stage 3B adds on top of 3A

| Concern | Fields |
|---------|--------|
| **Lettering** | `captions` (4 styles: narration_box, character_voice, editorial, poetic), `speech_balloons` (7 balloon types: normal, whisper, shout, thought, off_panel, radio, phone), `sfx` (3 styles: integrated, overlaid, background) |
| **Acting direction** | Per-character per-panel: `expression`, `body_language`, `gaze_direction`, `micro_action` |
| **Panel rhythm** | `establishing`, `slow_build`, `conversational`, `rapid_exchange`, `reaction_beat`, `punchline`, `silence_beat`, `climax`, `denouement` |
| **Reading flow** | `reading_order` (numbered), `tail_direction`, `emphasis_words`, `position` |
| **Page flow** | `page_rhythm_note`, `page_turn_context` |
| **CSS Grid layout** | Per-page: `grid.columns`, `grid.rows`, `grid.gap`, `grid.pattern_used`. Per-panel: `gridArea`. |
| **Traceability** | Every lettering element has a `beat_ref` linking back to the scene script |

### Dialogue ID Format (Critical — Assembly depends on this)

```
d_[page_number]_[panel_number]_[dialogue_index]
```

IDs are **permanent**. The Assembly Studio cross-references them for lettering placement. Never change or renumber an approved ID.

### Key constraint
**Stage 3B does NOT rewrite dialogue.** The words come from `scene_script.json`. If the dialogue is bad, that's a Stage 3A problem. 3B may split a long line across two balloons for panel fit, but the substance must not change.

### Agent Instructions
Full step-by-step workflow: [pipelines/11_panel_script.md](file:///c:/Users/Users/Desktop/Emy%20christmass/architecture%203.0/pipelines/11_panel_script.md)

---

## 4. Shared Rules (Both Stages)

Both stages inherit these rules from the parent document [scripting_instructions.md](file:///c:/Users/Users/Desktop/Emy%20christmass/architecture%203.0/pipelines/scripting_instructions.md):

### The Anti-Cheese Rule
- ❌ No purple prose. No characters narrating their emotions aloud. No perfect family moments.
- ✅ Dialogue should feel unfinished, interrupted. Internal monologue can be raw and honest.
- **Test:** Read every line out loud. If it sounds like a movie trailer, rewrite it with subtext.

### The Feels/Shows Gap
The `character_moods.json` provides a `feels` (private truth) and `shows` (external mask) for each character per chapter. Dialogue and action reflect the `shows` state. Captions and internal monologue access the `feels` state. The gap between them is the engine of every scene. Never collapse it.

### Canon & Continuity
Cross-reference all dialogue against `personality_signature.json` and `lore.json`. Verbal habits must be consistent. No character breaks profile without explicit story justification.

---

## 5. Pipeline Data Flow Diagram

```mermaid
flowchart TD
    %% Style Research Phase
    REF["User: Reference Comic"] --> SR((Phase 0.5: Style Research))
    SR --> PS["data/panel_style.json"]
    SR --> SS_STYLE["data/script_style.json"]

    %% Style guide approval gate
    PS --> STYLE_GATE{"✅ Style Approved?"}
    SS_STYLE --> STYLE_GATE
    STYLE_GATE -- "Yes" --> S3A
    STYLE_GATE -- "Yes" --> S3B

    %% Upstream data sources
    LORE["data/lore.json"] -.-> S3A
    LORE -.-> S3B
    SYN["data/scenario_synopsis.json"] -.-> S3A
    CHAP["data/scenario_chapters.json"] -.-> S3A
    SCENES["data/scenario_scenes.json"] -.-> S3A
    SCENES -.-> S3B
    PAGES["data/pages.json"] -.-> S3A
    PAGES -.-> S3B
    MOODS["data/character_moods.json"] -.-> S3A
    MOODS -.-> S3B
    PERS["data/personality_signature.json"] -.-> S3A

    %% Stage 3A
    subgraph "Stage 3A — Scene Script (Writer)"
        S3A((Agent 3A)) --> SS["data/scene_script.json"]
        UI_3A("App: Scene Script sub-tab") --> SS
        SS --> UI_3A
    end

    %% User review gate
    SS -- "User approves scene script" --> GATE{"✅ Approved?"}
    GATE -- "Yes" --> S3B

    %% Stage 3B
    subgraph "Stage 3B — Panel Script (Editor)"
        S3B((Agent 3B)) --> SCRIPT["data/script.json (v2.0)"]
        UI_3B("App: Panel Script sub-tab") --> SCRIPT
        SCRIPT --> UI_3B
    end

    %% Downstream
    SCRIPT --> IMAGES["Phase 4/5: Image Generation"]
    SCRIPT --> ASSEMBLY["Phase 6: Assembly Studio"]

    %% Styling
    classDef file fill:#f9f,stroke:#333,stroke-width:2px;
    classDef agent fill:#ff9,stroke:#333,stroke-width:2px;
    classDef baseData fill:#bbf,stroke:#333,stroke-width:1px,stroke-dasharray: 5 5;
    classDef gate fill:#dfd,stroke:#333,stroke-width:2px;
    classDef downstream fill:#fdd,stroke:#333,stroke-width:1px;
    classDef style fill:#ffd,stroke:#333,stroke-width:2px;

    class SS,SCRIPT file;
    class S3A,S3B,SR agent;
    class LORE,SYN,CHAP,SCENES,PAGES,MOODS,PERS baseData;
    class GATE,STYLE_GATE gate;
    class IMAGES,ASSEMBLY downstream;
    class PS,SS_STYLE style;
```

---

## 6. QA Flagging Protocol

QA flags for both stages export to `qa/script/`. The flag type determines which stage handles it:

### Stage 3A flags (narrative content → modifies `scene_script.json`)
| Flag | Action |
|------|--------|
| `[REWRITE_BEAT]` | Rewrite a specific beat by `beat_id` |
| `[REWRITE_SCENE]` | Rewrite all beats for a scene |
| `[ADJUST_DENSITY]` | Too many or too few beats — adjust volume |
| `[REWRITE_VOICE]` | Character doesn't sound right — rewrite all their dialogue in flagged scene(s) |

### Stage 3B flags (layout → modifies `script.json`)
| Flag | Action |
|------|--------|
| `[REWRITE_LINE]` | Rewrite specific dialogue by `id` |
| `[CHANGE_SPEAKER]` | Reassign speaker |
| `[CHANGE_TYPE]` | Change dialogue type (speech/thought/caption) |
| `[DELETE_LINE]` | Remove entry — do NOT renumber IDs |
| `[ADD_LINE_AFTER]` | Insert after specific `id` |
| `[FULL_PANEL_REWRITE]` | Rewrite all lettering for a panel |
| `[REASSIGN_BEATS]` | Move beats between panels on same page |

---

## 7. Key File Reference

| File | Role |
|------|------|
| [pipelines/09b_style_research.md](file:///c:/Users/Users/Desktop/Emy%20christmass/architecture%203.0/pipelines/09b_style_research.md) | Phase 0.5 — Style Research agent instructions |
| [pipelines/scripting_instructions.md](file:///c:/Users/Users/Desktop/Emy%20christmass/architecture%203.0/pipelines/scripting_instructions.md) | Parent doc — shared rules both stages inherit |
| [pipelines/10_scene_script.md](file:///c:/Users/Users/Desktop/Emy%20christmass/architecture%203.0/pipelines/10_scene_script.md) | Stage 3A full agent instructions |
| [pipelines/11_panel_script.md](file:///c:/Users/Users/Desktop/Emy%20christmass/architecture%203.0/pipelines/11_panel_script.md) | Stage 3B full agent instructions |
| [data/templates/scene_script_template.json](file:///c:/Users/Users/Desktop/Emy%20christmass/architecture%203.0/data/templates/scene_script_template.json) | Schema template for scene_script.json |
| [data/templates/panel_script_template.json](file:///c:/Users/Users/Desktop/Emy%20christmass/architecture%203.0/data/templates/panel_script_template.json) | Schema template for enriched script.json |
| [data/templates/panel_style_template.json](file:///c:/Users/Users/Desktop/Emy%20christmass/architecture%203.0/data/templates/panel_style_template.json) | Schema template for panel layout style guide |
| [data/templates/script_style_template.json](file:///c:/Users/Users/Desktop/Emy%20christmass/architecture%203.0/data/templates/script_style_template.json) | Schema template for script writing style guide |
| [docs/phase_3_script.md](file:///c:/Users/Users/Desktop/Emy%20christmass/architecture%203.0/docs/phase_3_script.md) | Full phase documentation with both schemas |
