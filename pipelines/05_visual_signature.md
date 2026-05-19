# Pipeline 05 — Visual Signature

**Phase:** 0.5-A  
**Output target:** `global_characters/[Name]/canonical_visual.md` + `global_characters/[Name]/examples/turnarounds/`  
**Triggered by:** User request to establish or refresh a character's canonical visual identity

---

## What This Pipeline Does

This pipeline does **not** ask the user to describe the character.  
It **reads the character's reference photos** and **reads the project's visual world**, then produces a translation: *how would this specific person look, rendered in the art style and world rules of this project?*

The output is not a description of the original photos. It is a specification for a visual identity that is:
1. **Recognisably this person** — same identity anchors (see Step 2)
2. **Native to this project's world** — consistent with lore, period, species, art style

> **Example:** If the reference photos show a 40-year-old Mediterranean woman,
> and the lore is set in the Smurfs universe, the canonical visual does not say
> "olive skin, dark hair, tailored blazer." It says:
> "blue-skinned Smurf — identity preserved through dark wavy hair (rare among Smurfs),
> sharp downturned eyes, characteristic frown line. Three apples tall. No blazer —
> Smurfs wear white. Her distinguishing visual: the only Smurf with wavy hair and
> a permanently intense expression."
>
> The goal is always: **a stranger looking at this character in-world should eventually
> recognise the real person behind them, even without being told.**

---

## Input Requirements

Before running, confirm all of the following exist:

- `global_characters/[Name]/originals/` — at least one reference photo or sketch of the real person/source character
- `global_characters/[Name]/presentation.md` — biography (personality, history, age)
- `global_characters/[Name]/general_mood.md` — current emotional headspace
- `data/lore.json` — the project's world (setting, period, species, themes)
- `pipelines/01_style_building.md` — the project's target art style

If any input is missing, stop and ask the user to provide it before proceeding.

---

## Step 1 — Read the World Rules

Read `data/lore.json` and `pipelines/01_style_building.md`.

Extract the constraints this world places on all characters:
- **Species/form:** Are characters human? Anthropomorphic animals? Smurfs? Robots?
- **Period/setting:** What clothing era? What level of technology visible on bodies?
- **Art style:** Realist? Flat? Line-art? Manga? Caricature?
- **Colour rules:** Is there a palette? Are skin tones constrained?
- **Size/proportion rules:** Chibi? Elongated? Realistic proportions?

Write these down internally as **World Rules** — every decision in Step 3 must comply.

---

## Step 2 — Extract Identity Anchors from Reference Photos

Look at every image in `global_characters/[Name]/originals/`.

Extract the **identity anchors** — the features that make this person recognisable across different contexts and art styles. Focus on:

- **Face shape:** jaw, cheekbones, forehead proportion
- **Eyes:** shape, heaviness, expressiveness, characteristic gaze direction
- **Nose:** bridge width, tip shape
- **Mouth:** lip proportion, resting expression (downturned? neutral? slight smile?)
- **Hair:** texture, natural volume, the silhouette it creates
- **Characteristic expressions:** the lines this person's face makes habitually (frown line, laugh lines, eye crinkle)
- **Silhouette signature:** how they carry their head and neck

**Do not extract clothing.** Costume is decided in a later phase.  
**Do not extract accessories** unless they are body-level (e.g. a permanent tattoo, a surgical scar).

Rank each anchor: **Strong** (unmistakable), **Medium** (notable), **Weak** (subtle).  
Strong anchors must survive any world translation. Weak anchors may be dropped if the world does not support them.

---

## Step 3 — Translate into the Project's World

Map each identity anchor through the World Rules.

Ask for each anchor: *"How does this feature exist in this world?"*

| Anchor (real world) | World Rule | Translation |
|---------------------|------------|-------------|
| Olive skin | Smurfs are blue | → Blue skin. Warmth preserved by making it a slightly warmer blue shade than default Smurfs |
| Dark wavy hair | Most Smurfs are bald/hatted | → Dark wavy hair becomes the primary visual differentiator — kept, emphasised |
| Sharp downturned mouth | Smurf style uses simple shapes | → Preserved as a distinctive downward line, contrasting with most Smurfs' upward curves |
| Tailored blazer | Smurfs wear white pants + hat only | → Dropped. Not applicable to this world. |

If an anchor **cannot** be translated (e.g. a subtle skin texture that doesn't exist in flat-colour cartoon style), document it as **lost in translation** and note what compensates for it.

---

## Step 4 — Write `canonical_visual.md`

```markdown
# [Name] — Canonical Visual Profile
*Project: [project name from lore.json]*
*World: [brief world description — e.g. "Smurfs universe, flat cartoon style"]*

## Identity Anchors (source → translation)
List each strong/medium anchor and how it was translated.
Weak anchors that were dropped: [list them and why]

## In-World Appearance

### Face
[Describe the translated face — what an artist should draw]

### Hair
[Translated hair — colour, texture, volume, how it sits in this world's style]

### Body & Silhouette
[How this person's proportions translate into the world's body language rules]
[Do NOT include clothing here — see Phase 1 for costume design]

### Skin / Surface
[Tone/colour within the world's palette rules]

### Distinctive Features
[The details that make them instantly recognisable at small scale or from a distance]

## Drawing Notes
[Practical artist instructions: what to always include, what mistakes to avoid,
what makes this person recognisable even in a crowd of similar characters]

## Consistency Flags
[Features that MUST remain identical in every panel/scene:
e.g. "frown line always present even in happy moments",
"hair always slightly unkempt — never perfectly smooth"]
```

> **⚠ No costume section in this document.**  
> Clothing and accessories are decided in Phase 1 (Character Intros).  
> This profile covers the body and face only.

---

## Step 5 — Generate Turnaround Prompts

For each of the 5 turnaround views, produce a generation-ready image prompt using the translated visual profile:

| View | File name | Description |
|------|-----------|-------------|
| Front | `front.png` | Full body or bust, neutral stance, facing camera |
| Three-quarter | `3q.png` | ~45° rotation, slight head turn |
| Profile | `profile.png` | True 90° side view |
| Back | `back.png` | Facing away, slight head turn |
| Expressions | `expressions.png` | Face only, 6-expression sheet: neutral / happy / sad / angry / surprised / resigned |

Each prompt must include:
1. The translated visual description (identity anchors in world terms) — do NOT rely on name alone
2. The specific view angle
3. The target art style from `01_style_building.md`
4. **No costume / neutral or world-default clothing** — the focus is the body and face
5. "Character design sheet" framing with white or neutral background

---

## Step 6 — Output Summary

```
✓ canonical_visual.md written for [Name]
✓ World: [world type]
✓ Identity anchors preserved: [list]
✓ Identity anchors lost in translation: [list, or "none"]
✓ Turnaround prompts generated: front, 3q, profile, back, expressions
✓ Images saved to global_characters/[Name]/examples/turnarounds/
```

---

## Flag Handling

If `canonical_visual.md` is flagged with `[REWRITE_VISUAL]`:
1. Read the flag note for specific requested changes
2. Update only the relevant sections
3. If the change affects face or silhouette, regenerate all 5 turnarounds
4. If the change affects a single feature, regenerate `expressions.png` only

If flagged with `[REGENERATE_TURNAROUNDS]`:
1. Regenerate all 5 views from the current `canonical_visual.md`
2. Do not modify the document itself
