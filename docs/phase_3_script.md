# 🤖 Phase 3: Scripting

**App Tab:** ✍️ Script
**Master Guide:** [← AGENT_GUIDE.md](../AGENT_GUIDE.md)
**Upstream:** [Phase 2 →](phase_2_structure.md)
**Downstream:** [Phase 4/5 →](phase_4_images.md) | [Phase 6 →](phase_6_assembly.md)

---

## What This Phase Does

Reads `data/panels.json` and writes all dialogue, internal thoughts, and narrator captions for every panel. Output is `data/script.json` — used by both the image agent (bubble context) and the Assembly Studio (lettering).

---

## Inputs

| File | Path |
|------|------|
| Panel breakdown | `data/panels.json` |
| Instructions | `pipelines/scripting_instructions.md` |
| Lore rules | `data/lore.json` |
| Scene context | `data/scenario.json` (optional) |

---

## Output

| File | Path |
|------|------|
| All dialogue | `data/script.json` |

---

## `data/script.json` Schema

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
            },
            {
              "id": "d_1_1_2",
              "speaker": "CHARACTER_A",
              "text": "Has anyone seen the—",
              "type": "speech"
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
- `d_1_1_1` → Page 1, Panel 1, first line
- `d_3_4_2` → Page 3, Panel 4, second line

IDs are **permanent**. They are cross-referenced by the Assembly Studio for lettering placement. **Never change or renumber an approved ID.**

### `type` values:

| Value | Icon | Meaning |
|-------|------|---------|
| `speech` | 💬 | Standard speech bubble |
| `thought` | 💭 | Thought bubble / internal monologue |
| `caption` | 📝 | Narrator box or location caption |

### `speaker` values:
- Character names in ALL_CAPS: `CHARACTER_A`, `CHARACTER_B`
- `NARRATOR` for narrator captions

### Writing rules:
1. Read `data/lore.json → rules` before writing anything.
2. Read `pipelines/scripting_instructions.md` for tone-by-scene-type guidelines.
3. Max **3–4 dialogue boxes per panel** (up to 6 if `[MULTI-DIALOGUE]` tag is present).
4. Silent panels are valid: `"dialogues": []`
5. Captions state facts: `"Sunday. 9:04 AM."` ✅ — `"It was a difficult morning."` ❌

---

## App: ✍️ Script Tab

**Left sidebar:** Page navigation (orange accent). **Main area:** One panel card per panel with: camera badge, action text (italic, read-only from `data/panels.json`), dialogue list.

**Per dialogue line:** Type icon, speaker name, dialogue ID (monospace right), ✏️ edit button → inline textarea (saves on Ctrl+Enter), 🚩 flag button.

**🚩 Flag Panel** button on each card = full panel rewrite request.

> ⚠️ **Inline text edits do NOT create QA reports.** Always re-read `data/script.json` before applying QA.

---

## QA Reports → `qa/script/`

### `[REWRITE_LINE]`
```markdown
## Dialogue d_1_3_2 — [REWRITE_LINE]
* **Speaker:** CHARACTER_B
* **Current:** "Mmhm."
* **Request:** Something that sounds attentive but reveals she heard nothing.
```
**Action:** Update only `dialogues[id="d_1_3_2"].text`. Find by ID, never change the ID.

### `[CHANGE_TYPE]`
```markdown
## Dialogue d_2_3_1 — [CHANGE_TYPE]
* **Current type:** speech
* **New type:** thought
```

### `[CHANGE_SPEAKER]`
```markdown
## Dialogue d_1_2_1 — [CHANGE_SPEAKER]
* **New speaker:** CHARACTER_B
```

### `[DELETE_LINE]`
```markdown
## Dialogue d_3_1_3 — [DELETE_LINE]
* **Confirmed:** yes
```
**Action:** Remove the entry. **Do NOT renumber remaining IDs** — leave the gap. Renumbering breaks assembly references.

### `[ADD_LINE_AFTER]`
```markdown
## Dialogue d_1_1_2 — [ADD_LINE_AFTER]
* **New speaker:** CHARACTER_B
* **New text:** "The dog moved it."
* **New type:** speech
```
**Action:** Insert after `d_1_1_2`. Assign `d_1_1_3`. If `d_1_1_3` already exists, use `d_1_1_3b`.

### `[FULL_PANEL_REWRITE]`
```markdown
## Page 2, Panel 3 — [FULL_PANEL_REWRITE]
* **Request:** Pure subtext — neither character says what they mean.
```
**Action:** Rewrite all `dialogues[]` for that panel. Preserve existing IDs where possible.

---

## Agent Rules

1. **Never change an approved ID.** IDs are cross-referenced by Assembly.
2. **When deleting:** do not renumber. Leave the ID gap.
3. **When adding:** increment index; use letter suffix for collisions (`3b`, `3c`).
4. **Re-read `data/script.json` before applying QA** — human may have made inline edits.
5. Read the panel's `action` from `data/panels.json` before writing dialogue.
6. After writing, update `PRODUCTION_STATUS.md`: Phase 3 → `[REVIEW]`
