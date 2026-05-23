# 🤖 Phase 3: Scripting (Two-Stage Pipeline)

**App Tab:** ✍️ Script (Sub-tabs: Scene Script | Panel Script)  
**Master Guide:** [← MASTER_GUIDE.md](../MASTER_GUIDE.md)  
**Pipeline Flow:** 
- **Stage 3A (Scene Script)**: Runs *before* pacing and panels. Upstream: Phase 0.2 Scenario, Downstream: Phase 1.5 Pacing.
- **Stage 3B (Panel Script)**: Runs *after* pacing and panels (in parallel with Phase 2). Upstream: Phase 2 Panels & Stage 3A Scene Script, Downstream: Phase 4/5 Images & Phase 6 Assembly.

---

## What This Phase Does

Produces the complete comic script in two sequential stages:

| Stage | Pipeline | Job | Output |
|-------|----------|-----|--------|
| **3A — Scene Script** | `pipelines/10_scene_script.md` | Writes all dialogue, narration, SFX, and pacing beats per scene. Pure writing — no panel layout decisions. | `data/scene_script.json` |
| **3B — Panel Script** | `pipelines/11_panel_script.md` | Assigns scene script beats to panels. Adds lettering, acting direction, balloon types, and reading flow. | `data/script.json` |

**Why two stages:** Separating narrative writing (what characters say) from visual editing (which panel each line goes into) produces better dialogue and better layouts than doing both simultaneously.

---

## Stage 3A — Scene Script

### Inputs

| File | Path |
|------|------|
| Lore rules | `data/final_lore.json` |
| Full synopsis | `data/scenario_synopsis.json` |
| Chapter breakdown | `data/scenario_chapters.json` |
| Scene list | `data/scenario_scenes.json` |
| Character moods | `data/character_moods.json` |
| Character voice | `data/personality_signature.json` |
| Agent instructions | `pipelines/10_scene_script.md` |

### Output

| File | Path |
|------|------|
| Scene-level script | `data/scene_script.json` |

### `data/scene_script.json` Schema

```json
{
  "_schema_version": "1.0",
  "scenes": [
    {
      "scene_id": 1,
      "chapter_id": 1,
      "title": "The Defiant Toaster",
      "page_budget": {
        "pages": [3],
        "estimated_total_panels": 3,
        "density_note": "sparse"
      },
      "emotional_arc": {
        "opening_state": "Quiet, meditative focus",
        "turning_point": null,
        "closing_state": "Quiet, meditative focus",
        "arc_note": "No shift — this is the baseline"
      },
      "beats": [
        {
          "beat_id": "sc1_b01",
          "type": "action | dialogue | narration | internal_monologue | sfx | silence",
          "...": "fields vary by type — see template"
        }
      ],
      "pacing_notes": "Slow, meditative. Let the reader settle in.",
      "scene_thesis": "Adèle imposes order on small things because the big things are beyond her control.",
      "transition_out": "Hard cut — the knock shatters the silence."
    }
  ]
}
```

### Beat Types

| Type | Key Fields |
|------|-----------|
| `action` | `description`, `character_focus`, `emotional_state`, `weight` |
| `dialogue` | `speaker`, `text`, `delivery`, `subtext`, `volume`, `weight` |
| `narration` | `text`, `voice` (omniscient/character_internal), `tone`, `weight` |
| `internal_monologue` | `character_id`, `text`, `tone`, `weight` |
| `sfx` | `text`, `description`, `intensity`, `weight` |
| `silence` | `description`, `duration`, `purpose`, `weight` |

### Beat Weight

| Weight | Meaning |
|--------|---------|
| `anchor` | Dramatically essential — needs its own visual space. 1-3 per scene max. |
| `supporting` | Important but flexible — can share a panel. |
| `ambient` | Atmospheric — can be combined, trimmed, or cut. |

### Beat ID Format
```
sc[scene_id]_b[NN]
```
Example: `sc3_b07` = Scene 3, beat 7

---

## Stage 3B — Panel Script

### Inputs

| File | Path |
|------|------|
| Scene script | `data/scene_script.json` |
| Scene list | `data/scenario_scenes.json` |
| Page layout | `data/pages.json` |
| Character moods | `data/character_moods.json` |
| Lore rules | `data/final_lore.json` |
| Agent instructions | `pipelines/11_panel_script.md` |

### Output

| File | Path |
|------|------|
| Final panel script | `data/script.json` |

### `data/script.json` Schema (v2.0)

```json
{
  "_schema_version": "2.0",
  "pages": [
    {
      "page_number": 3,
      "scene_ids": [1],
      "layout": "three_panel_horizontal",
      "page_turn_context": "",
      "page_rhythm_note": "Slow establishing page — the reader settles in.",
      "panels": [
        {
          "panel_number": 1,
          "panel_id": "p3_pan1",
          "scene_id": 1,
          "beats_assigned": ["sc1_b01", "sc1_b02"],
          "lettering": {
            "captions": [
              {
                "beat_ref": "sc1_b03",
                "text": "The screw didn't move.",
                "position": "top_left",
                "style": "narration_box"
              }
            ],
            "speech_balloons": [
              {
                "beat_ref": "sc1_b04",
                "character_id": "CHARACTER_A",
                "text": "Probably... a Phillips head.",
                "balloon_type": "normal",
                "tail_direction": "lower_left",
                "emphasis_words": ["Phillips"],
                "reading_order": 2
              }
            ],
            "sfx": [
              {
                "beat_ref": "sc1_b02",
                "text": "SKREEE",
                "style": "integrated",
                "position": "near_hands",
                "size": "medium"
              }
            ]
          },
          "acting_direction": {
            "CHARACTER_A": {
              "expression": "Brow furrowed, lips pressed",
              "body_language": "Hunched over the table",
              "gaze_direction": "Down at the toaster",
              "micro_action": "Adjusting butter knife grip"
            }
          },
          "panel_rhythm": "establishing",
          "reader_focus": "Adèle's hands and the butter knife",
          "panel_tension": "low",
          "dialogues": [
            {
              "id": "d_3_1_1",
              "speaker": "NARRATOR",
              "text": "The screw didn't move.",
              "type": "caption",
              "beat_ref": "sc1_b03",
              "balloon_type": null,
              "style": "narration_box",
              "position": "top_left",
              "emphasis_words": [],
              "reading_order": 1
            }
          ]
        }
      ]
    }
  ]
}
```

### Dialogue ID — CRITICAL FORMAT
```
d_[page_number]_[panel_number]_[dialogue_index]
```
- `d_3_1_1` → Page 3, Panel 1, first line
- `d_4_2_3` → Page 4, Panel 2, third line

IDs are **permanent**. They are cross-referenced by the Assembly Studio for lettering placement. **Never change or renumber an approved ID.**

### `type` values (backward compatible):

| Value | Icon | Meaning |
|-------|------|---------| 
| `speech` | 💬 | Standard speech bubble |
| `thought` | 💭 | Thought bubble / internal monologue |
| `caption` | 📝 | Narrator box or location caption |
| `sfx` | 🔊 | Sound effect |

### `balloon_type` values (new in v2.0):

| Value | Visual treatment |
|-------|-----------------|
| `normal` | Standard rounded balloon |
| `whisper` | Dashed border |
| `shout` | Jagged border |
| `thought` | Cloud-shaped bubble |
| `off_panel` | Jagged tail pointing off-frame |
| `radio` | Rectangular, lightning bolt tail |
| `phone` | Rectangular, phone iconography |

### Panel rhythm values:

`establishing` · `slow_build` · `conversational` · `rapid_exchange` · `reaction_beat` · `punchline` · `silence_beat` · `climax` · `denouement`

---

## App: ✍️ Script Tab

The Script tab contains two sub-tabs:

### Scene Script sub-tab
Displays `data/scene_script.json`. Per-scene view showing ordered beats with dialogue, emotional arc, and pacing notes. Supports inline editing and QA flagging at the beat level.

### Panel Script sub-tab
Displays `data/script.json`. Per-page/panel view showing lettering assignments, acting direction, and panel rhythm. Supports inline dialogue editing, type switching, and QA flagging at the line and panel level.

---

## QA Reports → `qa/script/`

### Stage 3A flags (narrative)
- `[REWRITE_BEAT]` — Rewrite a specific beat by `beat_id`
- `[REWRITE_SCENE]` — Rewrite all beats for a scene
- `[ADJUST_DENSITY]` — Too many or too few beats
- `[REWRITE_VOICE]` — Character doesn't sound right

### Stage 3B flags (layout)
- `[REWRITE_LINE]` — Rewrite specific dialogue by `id`
- `[CHANGE_SPEAKER]` — Reassign speaker
- `[CHANGE_TYPE]` — Change dialogue type
- `[DELETE_LINE]` — Remove entry (do NOT renumber)
- `[ADD_LINE_AFTER]` — Insert after specific `id`
- `[FULL_PANEL_REWRITE]` — Rewrite all lettering for a panel
- `[REASSIGN_BEATS]` — Move beats between panels

---

## Agent Rules

1. **Never change an approved ID.** IDs are cross-referenced by Assembly.
2. **When deleting:** do not renumber. Leave the ID gap.
3. **When adding:** increment index; use letter suffix for collisions (`3b`, `3c`).
4. **Re-read `data/script.json` before applying QA** — human may have made inline edits.
5. **Stage 3B may not rewrite dialogue substance** — only Pipeline 10 controls the words.
6. After writing, update `PRODUCTION_STATUS.md`: Phase 3A/3B → `[REVIEW]`
