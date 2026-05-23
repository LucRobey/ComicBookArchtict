# Pipeline 09b — Style Research (Phase 0.5)

**Phase:** 0.5  
**Output targets:** `data/panel_style.json` + `data/script_style.json` + `data/lore_style.json` + `data/visual_style.json`  
**Triggered by:** User provides the name of a reference comic at project start — before any scripting, pacing, or layout work begins.

---

## What This Pipeline Does

Researches a real-world reference comic's visual layout conventions, narrative/scripting conventions, and thematic tropes/aesthetic visual DNA. It then produces four style guide files that govern downstream pipelines in the project. This is an **analysis and research task** — the agent reads, searches, and synthesises. It does not create story content or combine the user's custom story with the researched style.

The four outputs:

| Output | Template | Consumed by |
|--------|----------|-------------|
| `data/panel_style.json` | `data/templates/panel_style_template.json` | Layout Agent (Phase 2B), Panel Script Agent (Phase 3B) |
| `data/script_style.json` | `data/templates/script_style_template.json` | Scene Script Agent (Phase 3A), Panel Script Agent (Phase 3B) |
| `data/lore_style.json` | `data/templates/lore_style_template.json` | Downstream Lore Merge Step (combining user story with style lore) |
| `data/visual_style.json` | `data/templates/visual_style_template.json` | Downstream Character Hub and Location Visuals Generation steps |

> [!IMPORTANT]
> **This pipeline is strictly focused on style research and extraction.** It does NOT perform the merging of the user's raw story ideas (`data/user_lore.json`) and the comic's researched style (`data/lore_style.json`). That merge step (producing `data/final_lore.json`) is a separate downstream workflow (e.g. Phase 0.2 Lore Merging) and must not be done in Phase 0.5. Phase 0.5 must leave `data/user_lore.json` and `data/final_lore.json` untouched.

> ⚠️ **This pipeline runs FIRST.** No other pipeline should execute until all four style guide files are approved by the user. These files are the stylistic constitution of the entire project.

---

## Input Requirements

| Priority | Input | Source |
|----------|-------|--------|
| 1 | Reference comic name | User provides (e.g. "Tintin", "Blacksad", "One Piece") |
| 2 | `data/templates/panel_style_template.json` | Template schema — the structure to fill |
| 3 | `data/templates/script_style_template.json` | Template schema — the structure to fill |
| 4 | `data/templates/lore_style_template.json` | Template schema — the structure to fill |
| 5 | `data/templates/visual_style_template.json` | Template schema — the structure to fill |

> ⚠️ If any template file is missing, STOP and report it. Do not invent a schema.

Optional but helpful:
- Physical copies or scanned pages the user provides in `data/references/`
- A secondary reference comic for contrast (e.g. "Like Tintin but with the pacing of Blacksad")

---

## Step 1 — Identify the Reference Comic

Confirm with the user:
1. The **exact title** of the reference comic (series, not single issue — unless the style shifted across eras).
2. The **specific era** if the comic's style evolved (e.g. early Tintin vs. late Tintin, pre-timeskip vs. post-timeskip One Piece).
3. Whether the user wants a **faithful reproduction** of the style or an **inspired-by** adaptation.

Record the following in the `reference` block of both output files:
- `comic_title`
- `author_artist` / `author_writer` (may be the same person)
- `publisher`
- `era` (e.g. "1950s–1976, Ligne Claire period")
- `style_family` — choose ONE:

| Family | Examples |
|--------|----------|
| `european_bd` | Tintin, Astérix, Blacksad, Lucky Luke, Blueberry |
| `american_classic` | Golden/Silver Age Marvel/DC, Peanuts, Calvin & Hobbes |
| `american_modern` | Saga, Hawkeye (Aja), Monstress, Paper Girls |
| `manga` | One Piece, Naruto, Berserk, Slam Dunk, Akira |
| `indie_art` | Blankets, Maus, Persepolis, Building Stories |
| `webcomic` | xkcd, Lore Olympus, Tower of God, Heartstopper |

---

## Step 2 — Web Research

Perform targeted web searches to gather analysis of the reference comic's visual style, narrative/scripting rules, thematic tropes, and character archetypes. The agent MUST search — do not rely on pre-existing knowledge alone.

### 2a. Visual/layout research queries

Run at least 3 searches covering:
- `"[comic name]" panel layout analysis` or `"[comic name]" page composition`
- `"[comic name]" grid structure comic art`
- `"[comic name]" visual style breakdown` or `"[artist name]" art technique`

Extract from results:
- Typical grid structure (rows × columns)
- Panel count per page (min / max / typical)
- Gutter and border treatment
- Panel shape conventions (rectangular, borderless, irregular)
- Splash page and emphasis panel frequency
- Reading flow conventions
- Colour and atmosphere approach

### 2b. Narrative/scripting research queries

Run at least 3 searches covering:
- `"[comic name]" dialogue writing style` or `"[writer name]" comic script analysis`
- `"[comic name]" pacing narrative structure`
- `"[comic name]" storytelling technique lettering`

Extract from results:
- Dialogue density and verbosity
- Caption and narration usage
- Pacing — silent panels, wordless pages
- Humor style and emotional register
- SFX conventions
- Lettering and balloon conventions

### 2c. Lore, Theme, and Tropes research queries

Run at least 3 searches covering:
- `"[comic name]" themes motifs analysis`
- `"[comic name]" character archetypes roles`
- `"[comic name]" storytelling tropes narrative devices`

Extract from results:
- Recurring thematic tropes, narrative motifs, and plot conventions.
- Common character archetypes and their narrative roles or functions.
- Specific narrative rules or logic of the comic's world (e.g., how real-world history is integrated, or how magic/science works).
- Humor, parody, or pacing tropes specific to the author's writing style.

### 2d. Aesthetic Visual DNA research queries

Run at least 3 searches covering:
- `"[comic name]" color palette color scheme`
- `"[comic name]" line work drawing style`
- `"[comic name]" character design visual rules`

Extract from results:
- Curated color palettes (hex colors, labels, and roles).
- The fundamental "Visual DNA" description (outlines, shading, textures, background detail level).
- Negative prompting requirements (styles, techniques, or visual elements to avoid in image generation).
- Framing and composition rules for interior panels and cover pages.

> ⚠️ **Do NOT skip web research.** Even for well-known comics, search to ground the analysis in published criticism and art analysis. Cite specific sources in the `reference_notes` and/or `reference_comic` field.

---

## Step 3 — Fill `panel_style.json`

Read `data/templates/panel_style_template.json` and fill every field. Work section by section:

### 3a. `grid_rules`

| Field | How to determine |
|-------|-----------------|
| `rows_per_page` (min/max/default) | Count rows across 10+ representative pages. Default = the most common value. |
| `columns_per_page` (min/max/default) | Count columns. Note whether columns are consistent or variable. |
| `panels_per_page` (min/max/typical) | Total panel count per page. Typical = the mode. |
| `row_height_variance` | `none` = all rows identical height. `low` = occasional variation. `high` = every page different. |
| `column_width_variance` | Same logic. |

### 3b. `gutter`

Determine the gutter style from the reference comic:
- `solid_line` — Tintin, Lucky Luke (clean black borders)
- `white_space` — Blacksad, modern American (panels separated by white gaps)
- `none` — manga action pages (panels bleed into each other)

Set `size`, `color`, `border_width`, and `outer_margin` in CSS-ready pixel values.

### 3c. `panel_shapes`

- `always_rectangular` — true for Tintin/Astérix, false for most manga and modern American
- `border_radius` — `0px` for sharp corners, `4px-8px` for softened, `50%` for circular
- `allow_borderless` — does the comic use borderless/bleed panels?
- `allow_bleed_to_edge` — do panels extend to the page edge?

### 3d. `proportions`

Express as width:height ratios (e.g. `"3:2"`, `"1:1"`, `"16:9"`).

### 3e. `reading_flow`

- `left_to_right` for Western comics
- `right_to_left` for manga
- `row_reading`: `strict_z_pattern` (Tintin), `guided` (modern), `freeform` (experimental)

### 3f. `splash_and_emphasis`

How often does the comic use full-page splashes, double-page spreads, or oversized panels?

### 3g. `signature_patterns` — **CRITICAL SECTION**

Identify **5–8 signature layout patterns** — the recurring page templates this comic uses most often. Each pattern MUST include actual CSS Grid values.

```json
{
  "pattern_id": "tintin_standard_4x3",
  "name": "Standard 4-Row Grid",
  "description": "Four rows of 3 equal panels — Hergé's workhorse layout",
  "grid_template": {
    "columns": "1fr 1fr 1fr",
    "rows": "1fr 1fr 1fr 1fr"
  },
  "panel_areas": [
    { "slot": 1, "gridArea": "1 / 1 / 2 / 2" },
    { "slot": 2, "gridArea": "1 / 2 / 2 / 3" },
    { "slot": 3, "gridArea": "1 / 3 / 2 / 4" },
    { "slot": 4, "gridArea": "2 / 1 / 3 / 2" },
    { "slot": 5, "gridArea": "2 / 2 / 3 / 3" },
    { "slot": 6, "gridArea": "2 / 3 / 3 / 4" },
    { "slot": 7, "gridArea": "3 / 1 / 4 / 2" },
    { "slot": 8, "gridArea": "3 / 2 / 4 / 3" },
    { "slot": 9, "gridArea": "3 / 3 / 4 / 4" },
    { "slot": 10, "gridArea": "4 / 1 / 5 / 2" },
    { "slot": 11, "gridArea": "4 / 2 / 5 / 3" },
    { "slot": 12, "gridArea": "4 / 3 / 5 / 4" }
  ],
  "frequency": "dominant",
  "use_when": ["dialogue_exchange", "sequential_action"],
  "example_note": "The default Tintin page. Used in ~60% of pages across all albums."
}
```

**Pattern naming convention:** `[comic_shortname]_[descriptive_slug]` — e.g. `blacksad_widescreen_3row`, `onepiece_action_burst`, `tintin_half_splash`.

**Frequency values:**

| Value | Meaning |
|-------|---------|
| `dominant` | Used on 40%+ of pages — the comic's default grid |
| `common` | 15–40% of pages |
| `occasional` | 5–15% of pages |
| `rare` | Under 5% — reserved for specific dramatic moments |
| `signature_only` | Used once or twice, but so iconic it defines the comic's identity |

### 3h. `page_rhythm` and `color_and_atmosphere`

Fill the remaining sections with observations about how page types (opening, closing, action, dialogue, emotional) tend to be composed, and the comic's default background/atmosphere treatment.

---

## Step 4 — Fill `script_style.json`

Read `data/templates/script_style_template.json` and fill every field. Work section by section:

### 4a. `dialogue_conventions`

| Field | How to determine |
|-------|-----------------|
| `density` | Count words and balloons across 5+ pages. `sparse` = <3 balloons/page, `heavy` = 8+ |
| `average_words_per_balloon` | Sample 20+ balloons. Record min/max/typical. |
| `average_balloons_per_panel` | Sample 20+ panels that contain dialogue. |
| `line_length_tendency` | `very_short` = 1–5 words. `long` = 25+ words per balloon. |
| `interruptions_and_trails` | How often do characters use "—" (interruption) or "..." (trailing off)? |

### 4b. `caption_conventions`

Does this comic use narration captions at all? What voice — omniscient, character internal, editorial? How long are they? Where are they placed?

### 4c. `silence_and_pacing`

- Count silent panels (panels with zero lettering) per page across a sample.
- Does the comic ever use entire wordless pages? How often?
- What is the typical beat density — sparse (few beats, art-driven) or dense (lots of beats, text-heavy)?

### 4d. `sfx_conventions`

- Frequency: manga tends toward `frequent`–`constant`; European BD toward `rare`–`occasional`.
- Style: `integrated` (drawn into art), `overlaid` (lettered on top), or `background` (subtle).
- Language: Does the SFX use the original language, or localized?

### 4e. `internal_monologue_conventions`

Does the comic use thought balloons? Caption boxes for internal voice? How often?

### 4f. `humor_style` and `emotional_register`

- Primary humor type (visual gag, wordplay, deadpan, slapstick, absurdist, etc.)
- Subtext level: does dialogue carry hidden meaning, or is it mostly direct?
- Sentimentality: does the comic earn its emotional beats, or deploy them freely?
- Exposition style: show-don't-tell, or narration-heavy?

### 4g. `character_voice_rules`

How strongly differentiated are character voices? Do characters have verbal tics? Accents?

### 4h. `lettering_style`

- What balloon types are used (normal, rounded, rectangular, organic)?
- How is emphasis rendered (bold, italic, size change)?
- Whisper, shout, and thought conventions

### 4i. `page_narrative_structure` and `beat_weight_distribution`

How many scenes per page? How are scene transitions handled? What is the ratio of anchor to supporting beats?

### 4j. `anti_patterns`

Identify **5–10 things this comic NEVER does** — explicit negative rules that downstream agents must respect.

```json
{
  "rule": "Never use narration boxes to state what the art already shows",
  "reason": "Hergé's ligne claire philosophy: art carries the visual information, text carries only what speech and sound contribute",
  "severity": "hard_rule"
}
```

Severity levels:
- `hard_rule` — Violating this betrays the source style. Never break.
- `strong_preference` — Very rare exceptions allowed if dramatically justified.
- `soft_suggestion` — Guideline, not law.

---

## Step 4b — Fill `lore_style.json`

Read `data/templates/lore_style_template.json` and fill every field based on the style and narrative tropes researched. Work section by section:

### 4b-1. `reference_comic`
Document the name, author, era, and source references for the comic style being researched.

### 4b-2. `thematic_tropes`
List 3–5 recurring thematic tropes and narrative devices characteristic of the reference comic. Each trope must have:
- `name`: Short name of the trope.
- `description`: Detailed explanation of how the trope works in the reference comic.
- `example_usage`: A concrete example of how this trope is deployed (e.g. "Tintin gets caught up in a local revolution due to mistaken identity").

### 4b-3. `narrative_rules`
Specify 3–5 worldbuilding/storytelling rules that keep the story anchored in the reference comic's style. Each rule must have:
- `rule`: The rule statement.
- `reason`: Why this rule is essential to maintaining the style.

### 4b-4. `character_role_guidelines`
Define 3–5 character archetypes/roles characteristic of the reference comic's cast (e.g., "The Earnest Protagonist", "The Grumpy but Loyal Sidekick", "The Eccentric Scientist"). Each archetype must have:
- `archetype`: Name of the archetype.
- `description`: Guidelines on how this archetype behaves, speaks, and fits into the story.

### 4b-5. `humor_and_pacing_tropes`
An array of strings describing specific humor mechanisms, slapstick patterns, or pacing tropes characteristic of the reference comic.

---

## Step 4c — Fill `visual_style.json`

Read `data/templates/visual_style_template.json` and fill every field based on the aesthetic and visual research. Work section by section:

### 4c-1. `style_metadata`
Include a name and brief description of the visual style (e.g., "Ligne Claire Classic").

### 4c-2. `dna`
Provide a detailed description of the fundamental drawing style (e.g., line weights, lack of shading, background detail versus character detail).

### 4c-3. `palette`
A list of 4–8 curated color tokens defining the reference comic's color palette. Each token must have:
- `hex`: The hexadecimal color code.
- `label`: Name of the color (e.g., "Tintin Blue", "Haddock Red").
- `role`: Its typical usage (e.g., "accent", "background", "outlines", "shadows").

### 4c-4. `rules`
A list of strings detailing explicit visual rules (e.g., "Do not use gradients", "All outlines must be uniform width black lines").

### 4c-5. `mood_board`
A list of 3–5 placeholder image definitions mapping out typical scenes. Each entry must have:
- `id`: Unique identifier (e.g., "mood_establishing_port").
- `prompt`: The specific image diffusion prompt to generate this mood board element.
- `image`: Relative path to where the generated image will be saved (e.g. `data/images/mood_board/port.png`).

### 4c-6. `image_generation`
Specify the base prompts and framing configurations for image diffusion tools:
- `positive_baseline`: Baseline positive style tokens (e.g., "ligne claire style, flat color, clean outlines, high detail background").
- `negative_prompt`: Common negative prompt tokens (e.g., "gradients, shadows, realistic rendering, 3d render, hatching, cross-hatching, sketch").
- `interior_page_framing`: Framing guidelines for panels (e.g., "eye-level, medium shot, clear spacing, no overlap").
- `cover_page_framing`: Framing guidelines for the cover page layout.

---

## Step 5 — Pattern Selection Framework

Document the decision framework that the Layout Agent (downstream, Phase 2B) will use to choose a `signature_pattern` for each page. Write this as a `pattern_selection_guide` section inside `data/panel_style.json`.

The Layout Agent picks a pattern based on these inputs, evaluated in priority order:

| Priority | Input source | Decision rule |
|----------|-------------|---------------|
| 1 | `pages.json` → panel count | The chosen pattern MUST have the correct number of panel slots (or within ±1, with a slot merged or split). |
| 2 | `scene_script.json` → beat weights | If a scene has an `anchor` beat, the pattern must include at least one oversized or full-width panel slot for it. |
| 3 | `scenario_scenes.json` → camera shots | `wide_establishing` → full-width top row. `close_up` → narrow/tall panel. `overhead` → square or wide panel. |
| 4 | `script.json` → panel_rhythm | `establishing` → wide top panel. `rapid_exchange` → tight equal grid. `silence_beat` → wide short strip. `climax` → splash or oversized. |
| 5 | `script_style.json` → dialogue density | Heavy dialogue pages → wider panels (more room for balloons). Sparse dialogue → vertical/tall panels acceptable. |
| 6 | Adjacent page contrast | NEVER repeat the same `pattern_id` on consecutive pages. If the previous page used `standard_4x3`, this page must use a different pattern. |

> ⚠️ **Rule 6 is non-negotiable.** Visual monotony is the most common layout failure. The Layout Agent must track the previous page's pattern and explicitly avoid it.

Example decision flow:

```
Page 7: 5 panels, scene has 1 anchor beat (dramatic reveal), camera = close_up + wide_establishing
  → Needs 5 slots
  → Needs 1 oversized slot (for anchor)
  → Needs 1 wide top slot (for establishing shot)
  → Previous page used "standard_3x2"
  → Selected: "widescreen_5panel" (wide top row + 2×2 grid below)
```

---

## Step 6 — Quality Checks

Before presenting output to the user, verify:

### Completeness
- [ ] Every field in all four templates (`panel_style`, `script_style`, `lore_style`, `visual_style`) is filled — no empty strings, no placeholder values
- [ ] `signature_patterns` in `panel_style.json` contains 5–8 entries with valid CSS Grid values
- [ ] Every `gridArea` value in every pattern is syntactically correct (`row-start / col-start / row-end / col-end`)
- [ ] `anti_patterns` in `script_style.json` contains at least 5 entries
- [ ] `reference_notes` or `reference_comic` in the files cites at least one external source

### Consistency
- [ ] `style_family` and `reference_comic` match across the output files
- [ ] `comic_title` (or style name), `publisher`, and `era` are consistent
- [ ] Grid rules in `panel_style.json` are compatible with the signature patterns (e.g. if max columns = 3, no pattern uses 4-column grids)
- [ ] Dialogue density in `script_style.json` is compatible with panel proportions in `panel_style.json` (heavy dialogue → panels must be wide enough)
- [ ] The tropes in `lore_style.json` and visual DNA in `visual_style.json` represent the same unified reference style

### CSS Grid Validity
- [ ] Every `grid_template.columns` value is valid CSS (e.g. `"1fr 1fr 1fr"`, `"2fr 1fr"`, `"1fr 2fr 1fr"`)
- [ ] Every `grid_template.rows` value is valid CSS
- [ ] `panel_areas` in each pattern cover all grid cells — no cell is left unassigned and no two panels overlap
- [ ] Slot count in `panel_areas` matches the pattern's intended panel count

### Research Grounding
- [ ] Claims about the reference comic are factually accurate (correct artist/writer, correct publisher, correct era)
- [ ] Style analysis matches published criticism — no invented conventions
- [ ] If the agent is uncertain about a convention, it notes the uncertainty in the `_notes` field rather than guessing

---

## Step 7 — Output and Approval

1. Write `data/panel_style.json` using the filled template.
2. Write `data/script_style.json` using the filled template.
3. Write `data/lore_style.json` using the filled template.
4. Write `data/visual_style.json` using the filled template.
5. Present a summary to the user:

```
✓ Style research complete for [Comic Title]
✓ Style family: [family]
✓ Signature patterns identified: [count] ([list pattern names])
✓ Anti-patterns documented: [count]
✓ Thematic tropes & archetypes extracted: [count]
✓ Visual DNA & color palette tokens defined
✓ Panel style → data/panel_style.json
✓ Script style → data/script_style.json
✓ Lore style → data/lore_style.json
✓ Visual style → data/visual_style.json

Awaiting user approval before downstream pipelines proceed.
```

6. The user reviews all four files and may request changes (see Flag Handling below).
7. **No downstream pipeline may run until the user explicitly approves all four files.**

---

## Flag Handling

### `[REVISE_PATTERNS]`
The user wants signature patterns changed — added, removed, or modified. Re-read the grid rules, adjust the patterns, and re-validate all CSS Grid values. Do not change `script_style.json`.

### `[REVISE_SCRIPT_STYLE]`
The user wants script conventions changed. Re-read the relevant section, update, and re-validate consistency with panel style. Do not change `panel_style.json`.

### `[ADD_REFERENCE]`
The user provides a second reference comic. Run Steps 2–4 for the new reference, then **merge** conventions — document which conventions come from which source in the `_notes` fields.

### `[CHANGE_FAMILY]`
The user overrides the `style_family`. Re-evaluate all conventions through the lens of the new family. This may change defaults significantly (e.g. switching from `european_bd` to `manga` reverses reading direction).

### `[REGENERATE_ALL]`
Full re-run. Delete both output files and restart from Step 1.

---

## What This Pipeline Must NOT Do

⚠️ **Do NOT write dialogue or beats.** This pipeline defines the *rules* for writing — it does not write the story. That is Pipeline 10.  
⚠️ **Do NOT generate page layouts.** This pipeline defines the *patterns* the layout agent can choose from — it does not assign patterns to pages. That is Phase 2B.  
⚠️ **Do NOT perform lore merging or write `final_lore.json`.** This phase must NOT merge `user_lore.json` and `lore_style.json` to produce `final_lore.json`. That is a downstream step. Do not modify `user_lore.json` or `final_lore.json`.
⚠️ **Do NOT modify any existing active data files other than the target outputs.** This pipeline creates `panel_style.json`, `script_style.json`, `lore_style.json`, and `visual_style.json`. It reads templates but never writes to the `templates/` directory.  
⚠️ **Do NOT skip web research.** Even for the most well-known comics, the style guide must be grounded in verifiable analysis. "I already know how Tintin looks" is not sufficient — search, cite, and document.  
⚠️ **Do NOT invent conventions.** If the research is inconclusive about a specific field, set the value to the most conservative option for the style family and note the uncertainty. Never fabricate a convention that the reference comic doesn't actually use.
