# 🤖 Phase 1: Pacing & Pagination

**App Tab:** 📋 Pacing
**Master Guide:** [← AGENT_GUIDE.md](../AGENT_GUIDE.md)
**Upstream:** [Phase 0 →](phase_0_lore.md)
**Downstream:** [Phase 2 →](phase_2_structure.md)

---

## What This Phase Does

Takes the approved `data/scenario.json` and distributes scenes across physical comic book pages, deciding how many pages each scene gets based on dramatic weight and the rules in `pipelines/pacing_instructions.md`.

---

## Inputs

| File | Path |
|------|------|
| Scene list | `data/scenario.json` |
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
  "total_pages": 8,
  "pages": [
    {
      "page_number": 0,
      "scene_id": null,
      "type": "cover",
      "focus": "string — what this page shows",
      "anecdotes_included": []
    },
    {
      "page_number": 3,
      "scene_id": 1,
      "type": "interior",
      "focus": "string — what happens on this page",
      "anecdotes_included": ["anecdote_key"]
    }
  ]
}
```

**`type`** must be one of: `cover` | `character_intro` | `interior` | `chapter_break` | `splash`

**`focus`:** 1–3 sentences describing what the page shows. Written for the Phase 2 agent who will break it into panels. No dialogue.

**`anecdotes_included`:** Every anecdote key from `data/scenario.json` must appear in at least one page.

**Counting rules:**
- `page_number` starts at 0 (cover = page 0)
- `total_pages` = length of the pages array
- Do NOT pre-allocate `character_intro` pages — Phase 1.5 injects them

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
2. Every `scene_id` from `data/scenario.json` must appear in at least one page.
3. Every `anecdote` key must appear in at least one `anecdotes_included` array.
4. Do NOT generate `character_intro` type pages — Phase 1.5 handles those.
5. After writing, update `PRODUCTION_STATUS.md`: Phase 1 → `[REVIEW]`
