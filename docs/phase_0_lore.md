# 🤖 Phase 0: Pre-Production

**App Tab:** 🌍 Lore & Story
**Master Guide:** [← MASTER_GUIDE.md](../MASTER_GUIDE.md)
**Downstream:** [Phase 1.5 →](phase_1.5_pacing.md) | [Phase 1 →](phase_1_characters.md)

---

## What This Phase Does

Phase 0 establishes the creative bedrock of the project. It is the only **manual, conversational phase** — the agent acts as a creative collaborator and produces structured JSON from the conversation. There is no automated pipeline script.

---

## Inputs

| Source | Where |
|--------|-------|
| User conversation | (chat context) |
| Pipeline instructions | `pipelines/01_style_building.md` |

---

## Outputs

| File | Path |
|------|------|
| Raw World rules | `data/user_lore.json` |

---

## `data/user_lore.json` Schema

```json
{
  "world_type": "string — universe descriptor",
  "tone": "string — how the story feels",
  "genre": "string — formal genre",
  "era": "string — when the story is set",
  "rules": ["hard constraint 1", "hard constraint 2"],
  "core_conflict": "string — core conflict of the story"
}
```

`rules` are imperative behavioral/narrative constraints that **every downstream agent must respect**. Write them as commands. Example: `"Characters never say exactly what they mean."`

---

## Scenario Development (Phase 0.2)

Scenario development has been refactored into a structured **5-step controllable pipeline** in **Phase 0.2**, producing decoupled outputs (`data/scenario_inputs.json`, `data/characters/[Name]/personality_signature.json`, `data/scenario_synopsis.json`, `data/scenario_chapters.json`, and `data/scenario_scenes.json`). 

Please refer to `scenario_pipeline_handoff.md` and `docs/pipeline_steps.md` for details on scenario generation, schemas, and agent interactions.

---

## App: 🌍 Lore & Story Tab

**Lore sub-tab:** Every `user_lore.json` and `final_lore.json` key rendered as a card. Arrays as bulleted lists. Each card has 🚩.

**Scenario sub-tab:** Each scene as a card with scene ID, title, location, characters, emotional beat (italic), summary (left-border), anecdotes (pin badges). Two buttons per scene: 🚩 Rewrite + Add After.

---

## QA Reports → `qa/lore/`

### `[CHANGE]` — Change a lore field
```markdown
## Lore: tone — [CHANGE]
* **Current:** Dry, deadpan.
* **Request:** Warmer. Still dry, but with genuine affection.
```
**Action:** Update `user_lore.json`.

### `[REWRITE_SCENE]` — Rewrite a scene
```markdown
## Scene 2 — [REWRITE_SCENE]
* **Request:** The scene should start outside, not inside.
```
**Action:** Update `scenes[scene_id=2]`. Preserve `scene_id`. Do not renumber.

### `[ADD_SCENE_AFTER]` — Insert a new scene
```markdown
## Scene 2 — [ADD_SCENE_AFTER]
* **New scene brief:** A comedic beat where CHARACTER_B discovers the letter by accident.
```
**Action:** Insert a new scene object after `scene_id: 2`. Increment following IDs.

### `[REGENERATE_STYLE_REFERENCE]` — Generate a new mood board image
```markdown
## Style Reference: The café at night — [REGENERATE_STYLE_REFERENCE]
* **Request:** Make the lighting more moody and amber.
```
**Action:** Update the style reference generation prompt and output a new image to `data/images/style_reference/`.

---

## Agent Rules

1. Write `data/user_lore.json` establishing universe parameters, hard rules, and core conflict.
2. Ensure world rules are written as imperative commands (e.g. "Characters never say exactly what they mean").
3. After writing, update `PRODUCTION_STATUS.md`: Phase 0 → `[REVIEW]`
