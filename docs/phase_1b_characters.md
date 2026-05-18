# 🤖 Phase 1.5: Character Introductions

**App Tab:** 🎭 Characters
**Master Guide:** [← AGENT_GUIDE.md](../AGENT_GUIDE.md)
**Upstream:** [Phase 0 →](phase_0_lore.md) | [Phase 1 →](phase_1_pacing.md)
**Downstream:** [Phase 2 →](phase_2_structure.md)

---

## What This Phase Does

Creates dedicated introductory pages for each main character. Each character gets a page (or short sequence) with narrator caption, first spoken line, and a panel breakdown. Runs **in parallel with Phase 1** — both must be approved before Phase 2.

---

## Inputs

| File | Path |
|------|------|
| Lore & character notes | `data/lore.json` |
| Instructions | `pipelines/intro_instructions.md` |

---

## Output

| File | Path |
|------|------|
| Character intro pages | `data/intro_pages.json` |

---

## `data/intro_pages.json` Schema

```json
{
  "intro_pages": [
    {
      "page_number": 1,
      "character": "CHARACTER_A",
      "layout_type": "full_page_splash",
      "scene_description": "string — visual description for image agent",
      "narrator_caption": "string — introduces the character",
      "character_dialogue": "string — their very first line",
      "panels": [
        {
          "panel_number": 1,
          "framing": "Wide Shot",
          "action": "string"
        }
      ]
    }
  ]
}
```

### `layout_type` → panel count (HARD CONSTRAINT):

| `layout_type` | Panels |
|---------------|--------|
| `full_page_splash` | exactly 1 |
| `two_panel_spread` | exactly 2 |
| `three_panel_sequence` | exactly 3 |
| `five_panel_sequence` | exactly 5 |

The panel count in `panels[]` **must exactly match** the `layout_type`. This is enforced by the image generation agent.

---

## App: 🎭 Characters Tab

**Left sidebar:** One button per character (pink accent on active). **Main area:** scene description, narrator caption (📝 italic), first line (💬 blue), panel breakdown table. 🚩 Flag for Agent button top right.

---

## QA Reports → `qa/characters/`

### `[REWRITE_SCENE]`
```markdown
## Character: CHARACTER_B — [REWRITE_SCENE]
* **Request:** She should arrive on a bike, not burst through the door.
```
**Action:** Update `scene_description` and regenerate `panels` to match.

### `[CHANGE_LAYOUT]`
```markdown
## Character: CHARACTER_A — [CHANGE_LAYOUT]
* **Current:** full_page_splash
* **New:** three_panel_sequence
```
**Action:** Update `layout_type` and regenerate `panels` with exactly 3 entries.

### `[REWRITE_CAPTION]`
```markdown
## Character: CHARACTER_A — [REWRITE_CAPTION]
* **Request:** One sentence max.
```
**Action:** Update `narrator_caption` only.

### `[REWRITE_DIALOGUE]`
```markdown
## Character: CHARACTER_B — [REWRITE_DIALOGUE]
* **Request:** Funnier. She's pretending to be calm but clearly isn't.
```
**Action:** Update `character_dialogue` only.

---

## Agent Rules

1. One intro page per **main character only**. No intros for minor characters.
2. The `narrator_caption` must reveal character, not just label them.
3. Panel count must **exactly match** `layout_type`.
4. Do not assign final page numbers — Phase 2 sets final positions.
5. After writing, update `PRODUCTION_STATUS.md`: Phase 1.5 → `[REVIEW]`

**⚠️ After approval:** Prompt the user to update `pipelines/generation_instructions.md` with the project's visual style baseline.
