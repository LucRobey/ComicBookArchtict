# Pipeline 11 — Panel Script (Stage 3B)

**Phase:** 3B  
**Output target:** `data/script.json`  
**Triggered by:** User approval of `data/scene_script.json` (Pipeline 10 output) and runs in parallel with Phase 2 Panel Structuring.

---

## What This Pipeline Does

Takes the narrative beats from `data/scene_script.json` and assigns them to specific panels within specific pages. This is an **editing and layout task**, not a writing task. The dialogue is already written — your job is to decide where each line lands, what type of balloon it gets, how the reading flow works within each panel, and what the characters are physically doing in the frame while they speak.

The output is `data/script.json` — the final scripting artifact used by the image generation agent (Phase 4/5) and the Assembly Studio (Phase 6).

---

## Input Requirements

| Priority | File | What it provides |
|----------|------|-----------------|
| 1 | `data/scene_script.json` | The narrative beats to distribute. This is your PRIMARY input. |
| 2 | `data/scenario_scenes.json` | Scene-level camera direction, core action, and character manifest. |
| 3 | `data/pages.json` | Page-to-scene mapping, layout proposals, and panel count targets. |
| 4 | `data/character_moods.json` | Per-chapter emotional state — drives the `acting_direction` fields. |
| 5 | `data/final_lore.json` | Tone rules and visual style references. |
| 1.5 | `data/script_style.json` | Writing style constraints — governs lettering conventions (balloon types, emphasis method, whisper/shout rendering). If missing, proceed without. |
| 1.6 | `data/panel_style.json` | Layout style constraints — governs grid structure, signature patterns, reading flow, and gutter style. If missing, proceed without. |

> ⚠️ `data/scene_script.json` MUST exist. If it does not, Pipeline 10 has not been run. Do not proceed.

---

## Step 1 — Map Scenes to Pages

For each page in `data/pages.json`:

1. Identify which scene(s) the page covers (`scene_id` or `scenes_associated`).
2. Pull the corresponding beat sequences from `scene_script.json`.
3. Note the page's `layout_proposal` and target panel count.
4. Note any `scenes_associated` entries that specify `portion: "start"` or `portion: "end"` — these scenes split across pages and their beats must be divided accordingly.

---

## Step 1.5 — Apply Layout Style

If `data/panel_style.json` exists, use it to generate the CSS Grid layout for each page:

### Read the style constraints:
- `grid_rules` — min/max rows and columns per page, height/width variance level
- `signature_patterns` — pre-defined grid templates with CSS Grid values
- `gutter` — gap size and border style
- `panel_shapes` — border radius, border style, bleed rules
- `reading_flow` — primary direction and row reading pattern

### Select a signature pattern for each page:
Match each page to the best-fitting signature_pattern using this decision cascade:
1. **Panel count** — pattern must accommodate the number of panels on this page
2. **Beat weights** — if the page has an anchor beat, choose a pattern with one dominant/oversized panel
3. **Camera shots** — wide establishing shots → patterns with a full-width top row; close-ups → patterns with narrow/tall panels
4. **Panel rhythm** — `establishing` → wide top panel pattern; `rapid_exchange` → tight equal grid; `silence_beat` → wide short panel
5. **Dialogue density** — panels with 3+ balloons need wider cells
6. **Adjacent page contrast** — never use the same pattern for consecutive pages

### Add grid data to each page:
For every page, add a `grid` object:
```json
{
  "grid": {
    "columns": "1fr 1fr 1fr",
    "rows": "2fr 1fr 1fr",
    "gap": "6px",
    "pattern_used": "wide_top_with_lower_grid"
  }
}
```
And for every panel, add a `gridArea` field:
```json
{
  "panel_number": 1,
  "gridArea": "1 / 1 / 2 / 4"
}
```

---

## Step 2 — Assign Beats to Panels

For each page, distribute beats across panels following these rules:

### Beat weight rules

| Weight | Rule |
|--------|------|
| `anchor` | Gets its own panel. Do NOT combine an anchor beat with another anchor beat. It may share a panel with 1-2 `ambient` beats (e.g. a background SFX or narration overlay). |
| `supporting` | Can share a panel with other supporting or ambient beats. Group supporting beats that happen simultaneously or in rapid succession. |
| `ambient` | Freely combinable. Can be layered onto any panel as background texture. Can be cut if the panel is already dense. |

### Panel density rules

- **Maximum 3-4 dialogue/narration entries per panel.** Up to 6 only if the scene demands rapid-fire exchange (argument, comedy volley).
- **Silent panels are valid.** A panel with zero lettering (only action and art) is powerful when used deliberately. Mark it with `"panel_rhythm": "silence_beat"`.
- **Never orphan a beat.** Every beat from the scene script must land in a panel unless it is `ambient` weight and the page is already at capacity. If you drop an ambient beat, note it in `page_rhythm_note`.

### Reading flow

Within each panel, assign `reading_order` to every lettering element. Reading order follows the Z-pattern:
1. Top-left caption/balloon first
2. Then top-right
3. Then bottom-left
4. Then bottom-right

For dialogue exchanges: the initiator's balloon is always read before the responder's. The `tail_direction` should guide the reader's eye naturally.

---

## Step 3 — Build Lettering

For each beat assigned to a panel, translate it into the lettering format:

### Dialogue beats → `speech_balloons`

```json
{
  "beat_ref": "sc2_b04",
  "character_id": "CHARACTER_B",
  "text": "Don't tell Mrs. Gable. She thinks it's a very large parrot.",
  "balloon_type": "normal",
  "tail_direction": "lower_left",
  "emphasis_words": ["very", "large", "parrot"],
  "reading_order": 2
}
```

**`balloon_type` values:**

| Value | When to use |
|-------|------------|
| `normal` | Standard speech |
| `whisper` | Volume is `quiet` or `whisper` in the scene script. Dashed balloon border. |
| `shout` | Volume is `loud` or `shout`. Jagged balloon border. |
| `thought` | Internal monologue beats that the writer chose to surface as visible thought bubbles rather than caption boxes. |
| `off_panel` | Speaker is not visible in this panel. Balloon has a jagged tail pointing off-frame. |
| `radio` | Voice coming through a device (phone, intercom, TV). Rectangular balloon with lightning bolt tail. |
| `phone` | Phone conversation. Similar to radio but with phone iconography. |

### Narration / internal_monologue beats → `captions`

```json
{
  "beat_ref": "sc1_b03",
  "text": "The butter knife turned another quarter-inch. The screw didn't move.",
  "position": "top_left",
  "style": "narration_box"
}
```

**`style` values:**

| Value | When to use |
|-------|------------|
| `narration_box` | Omniscient narrator voice. Rectangular box, neutral tone. |
| `character_voice` | Character's internal monologue delivered as a caption (not thought bubble). First-person, italicized. |
| `editorial` | Scene-setting information — time, location. Small, unobtrusive. |
| `poetic` | Lyrical or thematic narration that carries emotional weight. Used sparingly. |

**`position` values:** `top_left`, `top_right`, `bottom_left`, `bottom_right`, `center_top`, `center_bottom`, `floating`

### SFX beats → `sfx`

```json
{
  "beat_ref": "sc1_b02",
  "text": "SKREEE",
  "style": "integrated",
  "position": "near_hands",
  "size": "medium"
}
```

**`style` values:**
- `integrated` — SFX is part of the art (drawn into the scene)
- `overlaid` — SFX is lettered on top of the art
- `background` — Subtle, small, ambient sound

### Lettering Style Constraints

If `data/script_style.json` exists, apply its `lettering_style` section:

| Style field | How it constrains lettering |
|-------------|---------------------------|
| `dominant_balloon_type` | Use this as the default balloon_type unless the beat specifies otherwise |
| `tail_style` | Constrains `tail_direction` visual rendering (pointed vs curved) |
| `emphasis_method` | Constrains how `emphasis_words` are rendered (bold, italic, size, color) |
| `emphasis_frequency` | If `rare`, limit emphasis_words to 0-1 per balloon. If `frequent`, 2-3 per balloon. |
| `whisper_convention` | Overrides the default whisper balloon rendering |
| `shout_convention` | Overrides the default shout balloon rendering |
| `thought_convention` | Determines whether internal monologue uses cloud balloons, caption boxes, or italic text |

If `data/panel_style.json` exists, apply its `gutter` and `panel_shapes` sections to inform panel border rendering downstream.

---

## Step 4 — Acting Direction

For each panel that has characters, add `acting_direction` per character:

```json
"acting_direction": {
  "CHARACTER_A": {
    "expression": "Brow slightly furrowed, lips pressed in concentration",
    "body_language": "Hunched over the table, shoulders tense",
    "gaze_direction": "Down at the toaster",
    "micro_action": "Fingers adjusting the butter knife grip"
  }
}
```

This supplements (does NOT replace) the camera direction in `scenario_scenes.json`. The scene file tells the image agent the shot composition; the acting direction tells it the performance within that shot.

Source the emotional state from `character_moods.json`:
- `expression` reflects the `shows` state (the mask)
- `body_language` can hint at the `feels` state (the private truth) through subtle physical tells
- `gaze_direction` carries subtext — where a character looks (or avoids looking) is storytelling

---

## Step 5 — Panel Rhythm and Page Flow

Assign `panel_rhythm` to every panel:

| Value | Effect |
|-------|--------|
| `establishing` | Wide shot, sets the scene. Lettering is minimal. |
| `slow_build` | Gradual tension increase. Moderate lettering. |
| `conversational` | Standard dialogue exchange. Medium pace. |
| `rapid_exchange` | Fast back-and-forth. Many small balloons. Panels may be narrower. |
| `reaction_beat` | Character reacts. Usually one big expression, minimal or no dialogue. |
| `punchline` | Comedy beat or dramatic reveal. The panel IS the payoff. |
| `silence_beat` | No lettering. The art carries everything. |
| `climax` | Peak dramatic moment. |
| `denouement` | Resolution. Quiet, reflective. |

Set `panel_tension` (`low`, `medium`, `high`) based on the scene's emotional arc position.

Write a `page_rhythm_note` for each page — one sentence describing the overall pacing intent:
- *"Slow establishing page — the reader settles into Adèle's world before the disruption."*
- *"Rapid comedic build to the punchline on the last panel."*

---

## Step 6 — Generate Dialogue IDs

Every dialogue entry in the final `script.json` receives a permanent ID:

```
d_[page_number]_[panel_number]_[dialogue_index]
```

- `d_3_1_1` → Page 3, Panel 1, first line
- `d_4_2_3` → Page 4, Panel 2, third line

These IDs are **permanent and globally referenced** by the Assembly Studio for lettering placement. Never change an approved ID.

---

## Step 7 — Output

Write the result to `data/script.json`.

### Output schema

```json
{
  "_schema_version": "2.0",
  "pages": [
    {
      "page_number": 3,
      "scene_ids": [1],
      "layout": "three_panel_horizontal",
      "grid": {
        "columns": "1fr 1fr 1fr",
        "rows": "1fr 1fr 1fr",
        "gap": "6px",
        "pattern_used": "standard_3x3"
      },
      "page_turn_context": "",
      "page_rhythm_note": "",
      "panels": [
        {
          "panel_number": 1,
          "panel_id": "p3_pan1",
          "gridArea": "1 / 1 / 2 / 4",
          "scene_id": 1,
          "beats_assigned": ["sc1_b01", "sc1_b02", "sc1_b03"],
          "lettering": {
            "captions": [],
            "speech_balloons": [],
            "sfx": []
          },
          "acting_direction": {},
          "panel_rhythm": "establishing",
          "reader_focus": "",
          "panel_tension": "low",
          "dialogues": [
            {
              "id": "d_3_1_1",
              "speaker": "NARRATOR",
              "text": "Tuesday. 9:47 PM.",
              "type": "caption",
              "beat_ref": "sc1_b03",
              "balloon_type": null,
              "style": "editorial",
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

> [!NOTE]
> The `dialogues` array preserves backward compatibility with the existing Assembly Studio. Every lettering element (caption, speech balloon, SFX) ALSO appears as an entry in `dialogues` with an `id` in `d_X_X_X` format. The `lettering` object is the structured source of truth; `dialogues` is the flattened view for downstream consumers.

### Output checklist:
- [ ] Every page from `data/pages.json` has a corresponding entry (skip cover and intro pages — those are handled by Phase 1)
- [ ] Every beat from `scene_script.json` is assigned to a panel (except dropped `ambient` beats, which are noted)
- [ ] Every lettering element has a `beat_ref` linking back to the scene script
- [ ] Every dialogue entry has a unique `id` in `d_[page]_[panel]_[index]` format
- [ ] `reading_order` values within each panel form a contiguous sequence starting at 1
- [ ] `acting_direction` is present for every character visible in each panel
- [ ] `panel_rhythm` is set for every panel
- [ ] `page_rhythm_note` is set for every page
- [ ] If `panel_style.json` exists, every page has a `grid` object with `columns`, `rows`, `gap`, and `pattern_used`
- [ ] If `panel_style.json` exists, every panel has a `gridArea` value
- [ ] No two consecutive pages use the same `pattern_used`

---

## Flag Handling

### `[REWRITE_LINE]`
```markdown
## Dialogue d_3_1_2 — [REWRITE_LINE]
* **Speaker:** CHARACTER_A
* **Current:** "Probably... a Phillips head."
* **Request:** Less analytical, more tired.
```
**Action:** Update only the targeted dialogue entry. Find by `id`, never change the `id`. If the rewrite requires updating the corresponding beat in `scene_script.json`, note it but do NOT modify that file — flag it for Pipeline 10 re-run.

### `[CHANGE_SPEAKER]`
Update `speaker` field. Keep the `id` unchanged.

### `[CHANGE_TYPE]`
Update `type` and `balloon_type` fields (e.g. `speech` → `thought`, `normal` → `thought`).

### `[DELETE_LINE]`
Remove the entry. **Do NOT renumber remaining IDs** — leave the gap.

### `[ADD_LINE_AFTER]`
Insert after the specified `id`. Assign next sequential index. Use letter suffix for collisions (`d_3_1_3b`).

### `[FULL_PANEL_REWRITE]`
Rewrite all lettering and acting direction for the panel. Preserve existing `id` values where possible.

### `[REASSIGN_BEATS]`
Move beats between panels on the same page. Update `beats_assigned`, `lettering`, and `reading_order` accordingly.

---

## What This Pipeline Must NOT Do

⚠️ **No rewriting dialogue.** The words come from `scene_script.json`. If the dialogue is bad, that's a Pipeline 10 problem. You may make minimal phrasing adjustments for panel fit (splitting a long line across two balloons), but the substance must not change.  
⚠️ **No adding new dialogue.** If a panel needs more content, flag it for Pipeline 10 to add beats.  
⚠️ **No camera decisions.** Shot composition is in `scenario_scenes.json`. Acting direction supplements it, it does not override it.  
⚠️ **No page restructuring.** Panel count and layout are set by `pages.json`. If a scene doesn't fit, flag it for Phase 1.5 (Pacing) revision.
