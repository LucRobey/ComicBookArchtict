# 🤖 Phase 4/5: Image Generation & Surgical Review

**App Tab:** *(None — AI chat only)*
**Master Guide:** [← AGENT_GUIDE.md](../AGENT_GUIDE.md)
**Upstream:** [Phase 3 →](phase_3_script.md)
**Downstream:** [Phase 6 →](phase_6_assembly.md)

---

## What This Phase Does

**Phase 4:** Reads every panel from `data/panels.json` and `data/script.json` and generates one image per panel.

**Phase 5:** Visual review loop — the human flags errors, the agent fixes them (targeted img2img or full regeneration).

No Comic Studio tab. All review happens in the AI chat session.

---

## Inputs

| File | Path |
|------|------|
| Panel breakdown | `data/panels.json` |
| Script | `data/script.json` |
| Lore | `data/lore.json` |
| Instructions | `pipelines/generation_instructions.md` |

---

## Output

| What | Path |
|------|------|
| Panel images | `data/images/page_N/panel_N.png` |
| Prompt log | `data/images/page_N/prompts.json` *(recommended)* |

---

## Output File Naming

```
data/images/
  page_1/
    panel_1.png
    panel_2.png
    panel_3.png
    prompts.json
  page_2/
    panel_1.png
    ...
```

---

## Prompt Construction

For each panel, combine in order:

1. **Visual style baseline** — from `pipelines/generation_instructions.md` (goes at start of every prompt, unmodified)
2. **Framing translation** (see table below)
3. **Action** — the `action` field from `data/panels.json`
4. **Characters** — lookalike references and outfit descriptions from `pipelines/generation_instructions.md`
5. **Tags** — `[ESTABLISHING]` → `establishing shot, wide angle`; `[SPLASH]` → `full page, dramatic composition`
6. **Negative prompt** — negatives from `pipelines/generation_instructions.md`

### Framing Translation Table

| `framing` value | Prompt addition |
|-----------------|-----------------|
| Wide Establishing Shot | `wide establishing shot, full environment visible` |
| Medium shot | `medium shot, character waist-up` |
| Medium two-shot | `medium two-shot, two characters facing each other` |
| Close-up | `close-up shot, face and shoulders` |
| Extreme close-up | `extreme close-up, eyes and expression only` |
| Over-the-shoulder | `over-the-shoulder shot, foreground character's back` |
| Dynamic low angle | `dynamic low angle, dramatic perspective, looking up` |
| Bird's eye view | `bird's eye view, top-down perspective` |
| POV shot | `first-person POV, subjective camera` |

---

## Phase 5: Fix Types

### `[IMG2IMG_FIX]` — Targeted fix
Use when: composition is right, one element is wrong.
- Apply img2img with corrective prompt focused on the wrong element
- Denoising strength: **0.4–0.6** (preserve composition)
- Common: wrong face, wrong object, wrong expression

### `[REGENERATE]` — Full regeneration
Use when: composition/framing is wrong at a fundamental level.
- Discard existing image
- Rebuild prompt from scratch, re-read `data/panels.json`

---

## QA Reports → `qa/images/`

Write manually. Suggested format:
```markdown
# QA Report — Phase 4/5
Generated: [TIMESTAMP]

## Page 2, Panel 3 — [IMG2IMG_FIX]
* **Issue:** CHARACTER_A's face is wrong. Too old.
* **Fix:** Apply img2img with reference. Strength: 0.5.
* **Status:** [PENDING]

## Page 1, Panel 1 — [REGENERATE]
* **Issue:** Background is a café, should be a kitchen.
* **Status:** [PENDING]
```

Change `[PENDING]` to `[APPLIED]` after fixing.

---

## Agent Rules

1. **Work page by page.** Get approval for page N before generating page N+1.
2. **Visual style baseline goes in every single prompt** — never omit it.
3. **Use character reference images** for every panel a character appears in.
4. **Log prompts.** Write `prompts.json` per page. Add `"locked": true` once a panel is approved.
5. After all pages approved, update `PRODUCTION_STATUS.md`: Phase 4/5 → `[APPROVED]`
