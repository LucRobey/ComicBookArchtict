# 🤖 Phase 0: Pre-Production

**App Tab:** 🌍 Lore & Story
**Master Guide:** [← AGENT_GUIDE.md](../AGENT_GUIDE.md)
**Downstream:** [Phase 1 →](phase_1_pacing.md) | [Phase 1.5 →](phase_1b_characters.md)

---

## What This Phase Does

Phase 0 establishes the creative bedrock of the project. It is the only **manual, conversational phase** — the agent acts as a creative collaborator and produces structured JSON from the conversation. There is no automated pipeline script.

---

## Inputs

| Source | Where |
|--------|-------|
| User conversation | (chat context) |
| Pipeline instructions | `pipelines/01_style_building.md`, `pipelines/03_scenario_development.md` |

---

## Outputs

| File | Path |
|------|------|
| World rules | `data/lore.json` |
| Scene list | `data/scenario.json` |

---

## `data/lore.json` Schema

```json
{
  "world_type": "string — universe descriptor",
  "tone": "string — how the story feels",
  "genre": "string — formal genre",
  "rules": ["hard constraint 1", "hard constraint 2"],
  "era": "string — when the story is set",
  "visual_style": "string — art direction bible for image generation"
}
```

`rules` are imperative behavioral constraints that **every downstream agent must respect**. Write them as commands. Example: `"Characters never say exactly what they mean."`

---

## `data/scenario.json` Schema

```json
{
  "scenes": [
    {
      "scene_id": 1,
      "title": "string",
      "location": "string",
      "characters_present": ["CHARACTER_A"],
      "emotional_beat": "string",
      "summary": "string",
      "anecdotes": ["anecdote_key"]
    }
  ]
}
```

`anecdotes` are **snake_case reference keys** (not descriptions). They are tracked through pacing (`data/pages.json`) to ensure they appear on the correct page.

---

## App: 🌍 Lore & Story Tab

**Lore sub-tab:** Every `lore.json` key rendered as a card. Arrays as bulleted lists. Each card has 🚩.

**Scenario sub-tab:** Each scene as a card with scene ID, title, location, characters, emotional beat (italic), summary (left-border), anecdotes (pin badges). Two buttons per scene: 🚩 Rewrite + Add After.

---

## QA Reports → `qa/lore/`

### `[CHANGE]` — Change a lore field
```markdown
## Lore: tone — [CHANGE]
* **Current:** Dry, deadpan.
* **Request:** Warmer. Still dry, but with genuine affection.
```
**Action:** Update only `lore.json → tone`. Do not touch other fields.

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

---

## Agent Rules

1. Write `data/lore.json` first — tone rules influence how you write the scenario.
2. Scene IDs must be sequential integers starting at 1.
3. `anecdotes` are snake_case keys, not descriptions.
4. Target 15–25 scenes.
5. After writing, update `PRODUCTION_STATUS.md`: Phase 0 → `[REVIEW]`
