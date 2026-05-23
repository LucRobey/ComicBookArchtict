# 🤖 Phase 1.5: Pacing & Pagination

**App Tab:** 📋 Pacing
**Master Guide:** [← MASTER_GUIDE.md](../MASTER_GUIDE.md)
**Upstream:** [Phase 3A →](phase_3_script.md) (Script Scene)
**Downstream:** [Phase 2 →](phase_2_structure.md) | [Phase 3B →](phase_3_script.md) (Panel Script)

---

## What This Phase Does

Takes the approved `data/scene_script.json` and distributes scenes across physical comic book pages, deciding how many pages each scene gets based on dramatic weight and the rules in `pipelines/pacing_instructions.md`.

---

## Inputs

| File | Path |
|------|------|
| Scene script | `data/scene_script.json` |
| Instructions | `pipelines/pacing_instructions.md` |

---

## Output

| File | Path |
|------|------|
| Page list | `data/pages.json` |

---

## `data/pages.json` Schema

```json
{
  "total_pages": 12,
  "pages": [
    {
      "page_number": 0,
      "type": "cover",
      "scenes_associated": [],
      "general_mood": {
        "emotional_tone": "Warm, cozy, mysterious",
        "visual_color_palette": "amber, deep shadows, neon-green highlight",
        "tempo_and_pacing": "static / title page"
      },
      "panel_organization": {
        "panel_count_target": 1,
        "layout_proposal": "splash_page",
        "composition_notes": "A full-page splash. A warm, dim kitchen scene with a metallic butter knife catching the amber light next to a neon-green feather. Title: 'The Butter Knife and the Flamingo'.",
        "read_flow_intent": "Single focal point center"
      },
      "page_narrative_focus": "Establishing the title elements: the kitchen butter knife and the neon-green flamingo feather.",
      "characters_present": [],
      "setting_and_location": {
        "location_name": "Adèle's Kitchen",
        "time_of_day": "Tuesday Evening / Night",
        "environmental_lighting": "Dim amber tones, soft overhead lamp casting high-contrast shadows"
      },
      "anecdotes_included": [],
      "visual_page_turn_hook": "A sudden shadow cast across the doorway floor.",
      
      "// Backward Compatibility Fields": "The fields below are maintained so current views and scripts do not break.",
      "scene_id": null,
      "character": null,
      "focus": "Cover page. A warm, dim kitchen scene with a metallic butter knife catching the amber light next to a neon-green feather."
    },
    {
      "page_number": 2,
      "type": "interior",
      "scenes_associated": [
        {
          "scene_id": 1,
          "scene_title": "The Defiant Toaster",
          "portion": "full"
        }
      ],
      "general_mood": {
        "emotional_tone": "Quiet focus, slow patience",
        "visual_color_palette": "dim amber, soft overhead table glow, drafty window pane",
        "tempo_and_pacing": "slow, detailed"
      },
      "panel_organization": {
        "panel_count_target": 3,
        "layout_proposal": "three_panel_horizontal",
        "composition_notes": "Panel 1 establishing the kitchen. Panel 2 close-up of Adèle's hands unscrewing the toaster. Panel 3 Adèle looks determined.",
        "read_flow_intent": "Z-pattern layout"
      },
      "page_narrative_focus": "Adèle trying to fix her toaster in her kitchen, showing her meticulous nature and the quiet drafty night.",
      "characters_present": ["CHARACTER_A"],
      "setting_and_location": {
        "location_name": "Adèle's Kitchen",
        "time_of_day": "Tuesday Evening / Night",
        "environmental_lighting": "Dim amber tones, soft overhead lamp casting high-contrast shadows"
      },
      "anecdotes_included": ["Has had a history of fixing things around the house with whatever cutlery is at hand."],
      "visual_page_turn_hook": "Adèle suddenly pauses, ear turned toward the front door.",
      
      "scene_id": 1,
      "character": null,
      "focus": "Adèle trying to fix her toaster in her kitchen, showing her meticulous nature and the quiet drafty night."
    }
  ]
}
```

**`type`** must be one of: `cover` | `character_intro` | `interior` | `chapter_break` | `splash`

**`scenes_associated`**: List of scenes represented on this page, including the portion of the scene (`full`, `start`, `middle`, `end`) and optionally the `transition_type`.

**`general_mood`**: Defines the `emotional_tone`, target `visual_color_palette` for this page, and the `tempo_and_pacing` (e.g. slow, fast-paced, montage).

**`panel_organization`**: Layout guide containing target panel count, a layout type suggestion (e.g. `three_panel_horizontal`, `splash_page`), composition design instructions, and read flow guidance.

**`page_narrative_focus`**: A clear 1-2 sentence description of the narrative objective of this page.

**`characters_present`**: Array of character IDs present in the panels.

**`setting_and_location`**: Captures background and environment setup, including location name, time of day, and environmental lighting conditions.

**`visual_page_turn_hook`**: An optional cliffhanger description or transition beat to place in the final panel.

**`anecdotes_included`**: Lore/background details from scenario scenes visually or textually represented on this page.

**Counting rules:**
- `page_number` starts at 0 (cover = page 0)
- `total_pages` = length of the pages array
- Do NOT pre-allocate `character_intro` pages — Phase 1 injects them automatically based on the personality profiles.

---

## App: 📋 Pacing Tab

**Stats bar:** Total pages, interiors, character intros, pages-with-anecdotes counts.

**Page cards:** Collapsible. Left border color by type. 📌 badge = anecdote count. Expand to read `focus`. 🚩 to flag.

---

## QA Reports → `qa/pacing/`

### `[REWRITE_FOCUS]`
```markdown
## Page 4 — [REWRITE_FOCUS]
* **Request:** End on a comedic beat, not a tense one.
```
**Action:** Update `pages[page_number=4].focus` only.

### `[EXTEND]`
```markdown
## Page 3 — [EXTEND]
* **Request:** Give it one more page.
```
**Action:** Insert new page after 3, split focus, renumber following pages, update `total_pages`.

### `[MERGE_WITH_NEXT]`
```markdown
## Page 5 — [MERGE_WITH_NEXT]
* **Confirmed:** yes
```
**Action:** Merge 5 and 6, combine focus, renumber, update `total_pages`.

### `[ADD_PAGE_AFTER]`
```markdown
## Page 6 — [ADD_PAGE_AFTER]
* **Brief:** Short silent beat — CHARACTER_A alone in the elevator.
```
**Action:** Insert new page after 6, renumber, update `total_pages`.

### `[CHANGE_TYPE]`
```markdown
## Page 5 — [CHANGE_TYPE]
* **New type:** chapter_break
```
**Action:** Update `type` field only.

---

## Agent Rules

1. Read `pipelines/pacing_instructions.md` fully before generating.
2. Every `scene_id` from `data/scene_script.json` must appear in at least one page.
3. Every `anecdote` key must appear in at least one `anecdotes_included` array.
4. Do NOT generate `character_intro` type pages — Phase 1 handles those.
5. After writing, update `PRODUCTION_STATUS.md`: Phase 1.5 → `[REVIEW]`
