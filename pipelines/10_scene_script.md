# Pipeline 10 — Scene Script (Stage 3A)

**Phase:** 3A  
**Output target:** `data/scene_script.json`  
**Triggered by:** User instruction after Phase 2 (Panel Structure) is approved.

---

## What This Pipeline Does

Writes the complete narrative script for the comic — all dialogue, narration, internal monologue, sound effects, and dramatic silences — as an ordered sequence of beats per scene. This is a **pure writing task**. The agent decides *what characters say* and *how the story flows*, but does NOT decide which panel each line goes into. That is Stage 3B.

The output is `data/scene_script.json`, which feeds into Pipeline 11 (Panel Script) as the primary input.

---

## Input Requirements

The agent MUST read and fully internalize ALL of the following files before writing a single beat:

| Priority | File | What it provides |
|----------|------|-----------------|
| 1 | `data/final_lore.json` | World rules, tone, genre constraints. Read this FIRST. The rule *"Characters never say exactly what they mean"* governs every line of dialogue. |
| 1.5 | `data/script_style.json` | Writing style constraints from the reference comic. Governs dialogue density, caption frequency, humor style, pacing conventions, and anti-patterns. If this file does not exist, proceed without style constraints. |
| 2 | `data/scenario_synopsis.json` | The complete narrative arc. Provides global story awareness — cause-and-effect, callbacks, thematic threads. Without this, scenes are written in isolation. |
| 3 | `data/scenario_chapters.json` | Chapter-level summaries and story progression notes. |
| 4 | `data/scenario_scenes.json` | Per-scene actions, locations, camera direction, emotional beats, character manifest, and anecdotes. This is the structural backbone. |
| 5 | `data/character_moods.json` | Per-chapter emotional arcs for each character. The `feels`/`shows` gap is the engine of every scene. |
| 6 | `data/personality_signature.json` | Character voice: verbal habits, writing notes, loves, hates, relationship dynamics. Non-negotiable for distinct dialogue. |

> ⚠️ If any of files 1–4 do not exist, STOP and report missing dependencies. Do not proceed.  
> ⚠️ If files 5–6 are missing, proceed with reduced quality but note the missing data in the output.

---

## Step 1 — Global Preparation

Before writing any scene, build a mental model of the story:

1. Read the **synopsis** end to end. Identify the thematic arc, the emotional trajectory, and the key turning points.
2. Read **each character's personality signature**. Internalize their verbal habits — Adèle trails off, uses qualifiers; Thomas speaks fast, interrupts himself, never gives a straight answer. These are non-negotiable voice constraints.
3. Read the **lore rules**. Burn this into your process:
   - Characters never say exactly what they mean.
   - Silence is a valid beat. Use it.
   - Humor comes from character contradictions, not situations.
3.5. If `data/script_style.json` exists, read the style guide. Internalize these constraints:
   - `dialogue_conventions` — controls max words per balloon, balloons per panel, and overall density
   - `silence_and_pacing` — controls how often silent beats appear and the target beat density per scene
   - `humor_style` — controls joke type (visual gag, deadpan, situational, etc.) and frequency
   - `emotional_register` — controls subtext level and sentimentality limits
   - `caption_conventions` — controls narration frequency, voice type, and caption length
   - `character_voice_rules` — controls voice differentiation level and verbal tic frequency
   - `anti_patterns` — hard rules to NEVER break (e.g., "this style never uses thought balloons")
   These constraints shape every beat you write. They do NOT override character personality — if a style says "minimal dialogue" but a character's personality_signature says they talk fast and interrupt, the personality wins.
4. Read the **chapter moods** for each character. Note where the `dominant_emotion` shifts across chapters. Note the `secret` each character is hiding — this is the firewall they protect in every dialogue exchange.

---

## Step 2 — Scene-by-Scene Writing

Process scenes in chronological order (scene_id 1, 2, 3...). For each scene:

### 2a. Gather scene context

- From `scenario_scenes.json`: read `title`, `summary`, `core_action`, `emotional_beat`, `character_manifest`, and `anecdotes`.
- From `character_moods.json`: look up the chapter mood for each character present.

### 2b. Estimate script density

Calculate density:
- **Sparse** (estimated 1-2 panels for this scene): 2-4 beats maximum. Mostly visual — let the art carry the scene. Dialogue is minimal.
- **Moderate** (estimated 3-4 panels): 5-8 beats. Room for a short dialogue exchange, a narration, and a moment of silence.
- **Dense** (estimated 5+ panels): 8-15 beats. Full dialogue exchanges, multiple narration layers, SFX.

Set the `density_note` field accordingly.

### 2c. Write the beat sequence

Write beats in the order they happen in the scene. Each beat has a `type`:

| Type | When to use | Key fields |
|------|------------|------------|
| `action` | Something physically happens that advances the scene | `description`, `character_focus`, `emotional_state` |
| `dialogue` | A character speaks | `speaker`, `text`, `delivery`, `subtext`, `volume` |
| `narration` | The omniscient voice or editorial commentary | `text`, `voice`, `tone` |
| `internal_monologue` | A character's unspoken thought (the reader sees it, other characters don't) | `character_id`, `text`, `tone` |
| `sfx` | A sound | `text` (the lettered sound), `description`, `intensity` |
| `silence` | A deliberate pause or beat | `description`, `duration`, `purpose` |

Assign a `weight` to every beat:
- **`anchor`** — This beat is dramatically essential. It needs its own visual space in the panel breakdown. Do NOT merge it with other beats.
- **`supporting`** — Important but flexible. Can share a panel with other beats.
- **`ambient`** — Atmospheric. Can be freely combined, trimmed, or even cut if panels are tight.

### Style-Constrained Writing

If `script_style.json` exists, apply these constraints while writing beats:

| Style field | How it constrains your writing |
|-------------|-------------------------------|
| `dialogue_conventions.density` | If `sparse`, limit dialogue beats to 1-2 per scene. If `dense`, 4-6 are expected. |
| `dialogue_conventions.average_words_per_balloon.max` | Hard cap on words per dialogue beat's `text` field. Split long lines into separate beats. |
| `silence_and_pacing.silent_panel_frequency` | If `frequent`, ensure at least 1 silence beat per scene. If `rare`, use silence only for anchor moments. |
| `caption_conventions.usage_frequency` | If `never`, do not write narration beats. If `frequent`, most scenes should have 1-2 narration beats. |
| `caption_conventions.primary_voice` | Constrains the `voice` field on narration beats (omniscient vs character_internal). |
| `humor_style.primary_type` | Governs HOW jokes land — deadpan delivery in dialogue vs visual action beats. |
| `humor_style.joke_frequency` | If `rare`, only 1-2 jokes per chapter. If `frequent`, most scenes have at least one. |
| `emotional_register.subtext_level` | If `heavy`, dialogue text should say almost nothing directly — subtext field carries meaning. If `minimal`, characters can be more direct. |
| `emotional_register.sentimentality` | If `never`, kill any line that feels sentimental. If `earned`, one tender moment per chapter max. |
| `internal_monologue_conventions.usage_frequency` | Controls how many internal_monologue beats are allowed. |
| `beat_weight_distribution.anchor_beats_per_scene.max` | Hard cap on anchor beats per scene. |

### 2d. Set the emotional arc

For each scene, define:
- `opening_state`: The emotional temperature at the start.
- `turning_point`: The moment something shifts (if it does). Null if the scene maintains a steady state.
- `closing_state`: Where the scene lands emotionally.
- `arc_note`: One sentence explaining the emotional journey.

### 2e. Write pacing notes and scene thesis

- `pacing_notes`: Direction for the panel breakdown agent — should this scene feel slow? Fast? Where should the visual emphasis be?
- `scene_thesis`: What the reader should take away from this scene. One sentence.
- `transition_out`: How this scene hands off to the next. "Hard cut", "Time dissolve", "Same location, lighting shift", etc.

---

## Step 3 — Quality Checks

After writing all scenes, verify:

### The Anti-Cheese Rule (Non-Negotiable)

- ❌ No purple prose.
- ❌ No characters saying out loud what they obviously feel. Real people deflect, joke, or go quiet.
- ❌ No perfect inspirational family moments. If a scene is sweet, earn it with something awkward first.
- ✅ Internal monologue can be honest and raw.
- ✅ Dialogue should feel slightly unfinished, interrupted, overlapping.
- ✅ Small complaints, dry observations, and bad timing are as important as big emotional beats.

**The test:** Read every dialogue line out loud. If it sounds like a movie trailer, rewrite it using subtext.

### The Feels/Shows Gap

For every character in every scene, verify:
- Their `dialogue` and `action` beats reflect the `shows` state from their mood (the external mask).
- Their `internal_monologue` and `narration` beats access the `feels` state (the private truth).
- The gap between these two is audible in how they speak — word choice, what they don't finish, where they look away.
- The only time the mask breaks is when the scene's purpose IS the mask breaking.

### Canon & Continuity

- No character takes an action that contradicts their personality signature.
- Verbal habits are consistent (Adèle uses qualifiers; Thomas interrupts and deflects).
- Anecdotes from `scenario_scenes.json` are woven into dialogue naturally — never exposition-dumped.
- Callbacks to earlier scenes land (check chronological coherence).

### Beat Budget

- Total beats per scene stay within the density range for the estimated budget.
- No scene has zero dialogue beats (unless explicitly a silent page in the layout).
- Anchor beats are used sparingly — 1-3 per scene maximum.

### Style Compliance

If `script_style.json` exists, verify:
- Dialogue word count per beat does not exceed `dialogue_conventions.average_words_per_balloon.max`
- Total narration beats across all scenes matches `caption_conventions.usage_frequency` expectation
- Silent beats match `silence_and_pacing.silent_panel_frequency` expectation
- No beat violates any entry in `anti_patterns`
- Humor type and frequency match the style guide
- If ANY style constraint was intentionally broken for story reasons, note it in `pacing_notes` for that scene

---

## Step 4 — Output

Write the result to `data/scene_script.json` following the schema in `data/templates/scene_script_template.json`.

### Output checklist:
- [ ] Every scene from `scenario_scenes.json` has a corresponding entry
- [ ] Every beat has a unique `beat_id` in the format `sc[scene_id]_b[NN]`
- [ ] Every dialogue beat has `speaker`, `text`, `delivery`, `subtext`, and `volume`
- [ ] Every scene has `page_budget`, `emotional_arc`, `pacing_notes`, `scene_thesis`, and `transition_out`
- [ ] Beat weights are assigned: no beat is missing a `weight` value
- [ ] Character voice matches personality signatures (read the lines out loud)

---

## Flag Handling

When the user flags scene script content for revision:

### `[REWRITE_BEAT]`
Rewrite a specific beat by `beat_id`. Re-read the character's mood and personality signature before rewriting. Do NOT change beats that weren't flagged.

### `[REWRITE_SCENE]`
Rewrite all beats for a specific scene. Re-read all context (mood, personality, synopsis) before regenerating. Preserve the `page_budget` and `emotional_arc` unless explicitly told to change them.

### `[ADJUST_DENSITY]`
The user thinks a scene has too many or too few beats. Adjust the beat count while preserving the anchor beats. Cut or add `ambient` and `supporting` beats only.

### `[REWRITE_VOICE]`
A character doesn't sound right. Re-read their `personality_signature.json` and `character_moods.json`, then rewrite ALL of that character's dialogue beats across the flagged scene(s).

---

## What This Pipeline Must NOT Do

⚠️ **No panel decisions.** Do not specify which panel a beat goes into. That is Pipeline 11.  
⚠️ **No balloon types.** Do not specify speech vs thought vs caption at the lettering level. That is Pipeline 11.  
⚠️ **No camera angles.** Camera direction already exists in `scenario_scenes.json`. Do not duplicate it.  
⚠️ **No character appearance.** Costumes and visual details are handled by upstream phases. Do not describe what characters look like.
