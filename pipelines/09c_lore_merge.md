# Pipeline 09c — Lore Merging

**Phase:** Downstream Lore Merging (Phase 0.6)  
**Output targets:** `data/final_lore.json` (active project-specific bible)  
**Triggered by:** Approval of Style Research outputs (`data/lore_style.json`, `data/visual_style.json`, `data/panel_style.json`, `data/script_style.json`).

---

## What This Pipeline Does

This pipeline represents the core integration step: mixing the user's raw narrative canvas (`data/user_lore.json`) with the style guide tropes (`data/lore_style.json`) to create a unified active series bible (`data/final_lore.json`). 

It ensures that the downstream script and layout agents are guided by a world where the user's story is fully integrated with the visual and storytelling rules of the reference style (e.g. Hergé's Tintin, Blacksad, etc.).

The pipeline writes the full detailed structure to `data/final_lore.json`.

---

## Input Requirements

| Priority | Input File | Source | Description |
|---|---|---|---|
| 1 | `data/user_lore.json` | User Raw Input | Contains the user's raw world_type, tone, genre, era, rules, characters, and conflict. |
| 2 | `data/lore_style.json` | Style Research | The analyzed thematic tropes, archetypes, and narrative rules of the reference comic. |
| 3 | `data/templates/inspired_lore_template.json` | Template Schema | The target schema for the output `data/final_lore.json`. |

---

## Step-by-Step Merging Protocol

The Merging Agent must follow these five steps to mix the lores:

### Step 1: Establish the Narrative Blend
Analyze `user_lore.json` and `lore_style.json` to synthesize:
*   **Genre Blend**: How the user's genre and the reference comic's genre overlay (e.g. "Sci-Fi Bakery" + "Travel Adventure/Mystery" = "Retro-Futuristic Space-Port Intrigue & Baking Adventure").
*   **Tone Blend**: Blending the emotional weight of the user's tone with the signature comedy/pacing register of the style (e.g. "Dry dark comedy" + "Whimsical slapstick" = "Deadpan cosmic irony punctuated by rapid physical comedy").
*   **Era Setting**: How the historical/future setting of the user's story integrates the aesthetic eras of the reference comic.

### Step 2: Translate the Core Conflict
Translate the user's raw conflict into a narrative engine fueled by the style's signature plot drivers:
*   Identify the central conflict of the user.
*   Overlay style-specific plot drivers (e.g., mistaken identity, a mysterious clue found in an everyday object, a pursuit across multiple locales, a comic conspiracy).
*   Formulate the `adapted_conflict_concept`.
*   Note: Do not extract or adapt characters/cast in this step. Character design is handled in downstream character-hub phases.

### Step 3: Blend World Rules
Combine the rules lists:
*   Keep the user's non-negotiable world rules (e.g. "No magic, realistic physics").
*   Inject the narrative style rules (e.g. "Violence is slapstick and bloodless", "No internal monologue except through the pet/robot companion").
*   Resolve any contradictions: if a style rule contradicts a user rule, prioritize the user's rule but adapt its presentation to match the style's aesthetics.

### Step 4: Integrate Thematic Tropes
Weave specific thematic tropes from `data/lore_style.json` into the narrative bones of the user's setting, detailing exactly how they will manifest in the scenarios.

---

## Quality Checks & Verification

Verify:
- [ ] The core conflict still resolves the user's original goals but uses style mechanisms.
- [ ] No characters or cast members are created or mapped in this phase.
- [ ] The generated output parses as valid JSON conforming to the pure lore templates.

---

## Writing Output Files

Upon successful merge, the agent writes the output:

1.  **Detailed Merge Bible**: Save to `data/final_lore.json` conforming to `data/templates/inspired_lore_template.json`.
