# 🤖 Phase 2: Page Structuring

**App Tab:** 📐 Panel Structure
**Master Guide:** [← MASTER_GUIDE.md](../MASTER_GUIDE.md)
**Upstream:** [Phase 1.5 →](phase_1.5_pacing.md) | [Phase 1 →](phase_1_characters.md)
**Downstream:** [Phase 3B →](phase_3_script.md) (Panel Script - runs in parallel) | [Phase 6 →](phase_6_assembly.md)

---

## What This Phase Does

Breaks every approved page into individual panels. For each panel: a camera angle (framing), an action description, the characters visible, and any structural tags. Output is the blueprint Phase 3B uses for panel scripting, and Phase 4/5 uses for image generation.

---

## Inputs

| File | Path |
|------|------|
| Page list | `data/pages.json` |
| Character intro pages | `data/intro_pages.json` |
| Scene script | `data/scene_script.json` |
| Instructions | `pipelines/structuring_instructions.md` |
| Lore rules | `data/final_lore.json` |

---

## Output

| File | Path |
|------|------|
| Visual schema template | `data/templates/panels_template.json` |
| Panel breakdown | `data/panels.json` |

---

## `data/panels.json` Schema (Page & Grid Architecture)

```json
{
  "pages": [
    {
      "page_number": 1,
      "layout_template": "tintin_standard_4x3",
      "panels": [
        {
          "panel_number": 1,
          "framing": "Wide Establishing Shot",
          "action": "string — what is visually happening (no dialogue)",
          "characters_present": ["CHARACTER_A"],
          "tags": ["[ESTABLISHING]"],
          "focal_element": "string — specific focal point of the camera",
          "characters_acting": [
            {
              "character_id": "CHARACTER_A",
              "expression": "string — facial expression",
              "pose_and_gesture": "string — body pose and posture details",
              "internal_state": "string — internal thoughts or emotions"
            }
          ],
          "environment_details": "string — atmospheric or background elements",
          "composition_notes": "string — camera lens, depth of field, or composition notes"
        }
      ]
    }
  ]
}
```

### `framing` — exact allowed strings:
```
Wide Establishing Shot    Medium shot             Medium two-shot
Close-up                  Extreme close-up        Over-the-shoulder
Dynamic low angle         Bird's eye view         POV shot
```
The app uses these exact strings for color-coded badge display. Respect case.

### `action` — writing rules:
- Present tense, visual description only. **No dialogue.**
- Written for two agents: Phase 3B (panel script dialogue context) AND Phase 4 (image prompt).
- Be specific about body language, spatial relationships, expressions.

### `tags` — defined in `pipelines/structuring_instructions.md`:
- `[ESTABLISHING]` — first panel of a new scene
- `[SPLASH]` — full-page or oversized panel
- `[MULTI-DIALOGUE]` — panel will have 4+ dialogue boxes
- `[SECRET]` — something hidden referenced visually
- Project-specific tags set during initialization

### Panel count rules:
- Standard interior page: **3–5 panels**
- Splash / chapter break: **1–2 panels**
- Character intro page: **match `layout_type`** from `data/intro_pages.json`
- **Never give two consecutive panels the same framing.**

---

## App: 📐 Panel Structure Tab

**Left sidebar:** Page navigation. **Main area:** 2-column panel grid. Each card shows: panel number, **framing dropdown** (live-editable, saves instantly to `data/panels.json`), action text (italic), character chips (blue), tag chips (color-coded), 🚩 flag button.

> ⚠️ **Inline framing changes do NOT create QA reports.** Re-read `data/panels.json` before applying any QA to get the current state.

---

## QA Reports → `qa/structure/`

### `[REWRITE_ACTION]`
```markdown
## Page 2, Panel 3 — [REWRITE_ACTION]
* **Request:** Show both characters. We need the distance between them.
```
**Action:** Update `panels.json → pages[2] → panels[3].action` (and `characters_present` if needed).

### `[SPLIT]`
```markdown
## Page 1, Panel 1 — [SPLIT]
* **Panel A:** Wide shot: the kitchen.
* **Panel B:** Medium: CHARACTER_A noticing the dog.
```
**Action:** Replace panel 1 with two panels. Renumber following panels on that page.

### `[MERGE_WITH_NEXT]`
```markdown
## Page 1, Panel 2 — [MERGE_WITH_NEXT]
* **Confirmed:** yes
```
**Action:** Merge panels 2 and 3. Combine actions. Renumber following.

### `[ADD_PANEL_AFTER]`
```markdown
## Page 3, Panel 2 — [ADD_PANEL_AFTER]
* **Brief:** Extreme close-up on CHARACTER_B's phone screen.
```
**Action:** Insert new panel after 2. Renumber following.

### `[CHANGE_CHARACTERS]`
```markdown
## Page 2, Panel 4 — [CHANGE_CHARACTERS]
* **New list:** CHARACTER_A, CHARACTER_B, CHARACTER_C
```

### `[ADD_TAG]` / `[REMOVE_TAG]`
```markdown
## Page 3, Panel 1 — [ADD_TAG]
* **Tag:** [ESTABLISHING]
```

---

## Agent Rules

1. **Never give two consecutive panels the same framing.**
2. The `action` field is read by both the script agent and the image agent — write for both.
3. Never include dialogue in `action`.
4. For character intro pages, use `intro_pages.json → panels` directly.
5. Re-read `data/panels.json` before applying QA (human may have changed framings inline).
6. After writing, update `PRODUCTION_STATUS.md`: Phase 2 → `[REVIEW]`
