# Pipeline 06 — Personality Signature

**Phase:** 0.5-B  
**Output target:** `data/characters/[Name]/personality_signature.md` + `data/characters/[Name]/examples/emotional_states/`  
**Triggered by:** User request to define a character's personality in the context of this project's specific lore and scenario

---

## Important Distinction

`personality_signature.md` is **project-specific**. The same person behaves differently depending on:
- Who they're with (the current cast)
- What they're going through (the current story's lore and scenario)
- What they want vs. what they're able to show

The canonical biography (`global_characters/[Name]/presentation.md`) is the source of *who they are*. This pipeline generates *who they are in this specific story*.

---

## Input Requirements

Before running, confirm all of the following exist:

- `global_characters/[Name]/presentation.md` — biography
- `global_characters/[Name]/general_mood.md` — current life context
- `global_characters/[Name]/canonical_visual.md` — visual baseline (for emotional state image prompts)
- `data/lore.json` — the story's lore (cast, location, period, themes)
- `data/scenario.json` — the scene list (to understand what situations this character faces)

---

## Step 1 — Character Analysis

Read all inputs. Then answer these questions internally:

1. **Core wound:** What does this character most fear? What does that fear drive them to do?
2. **Mask:** What face do they show the world? How does it differ from their inner state?
3. **Desire:** What do they consciously want in this story?
4. **Need:** What do they actually need (often the opposite of what they want)?
5. **Cast dynamics:** How does this character relate to each other person in the cast?
6. **Story-specific context:** Given these specific scenes, what is this character's arc?

---

## Step 2 — Write `personality_signature.md`

```markdown
# [Name] — Personality Signature
*Project: [project name from lore.json]*

## Core Identity
[2-3 sentences capturing who this person is at the centre — not surface traits, but the deep driver]

## Mask vs. Core
| Public face | Private reality |
|-------------|-----------------|
| [what they show] | [what they actually feel] |

## Key Relationships in This Story
### With [Character B]
[How they feel about them, what they want from them, what they're afraid of]

### With [Character C]
...

## Verbal Signature
[How they speak: sentence length, vocabulary range, patterns when stressed vs. relaxed, any verbal tics]
- Under pressure they: ...
- When comfortable they: ...
- They never say: ... (and why)

## Physical Signature
[Body language patterns — posture tells, habitual gestures, what they do with their hands]

## Scene-Level Notes
[Any scene-specific notes about how their personality manifests in the specific scenario — e.g. "In the airport scene, their need to control will clash with the chaos of travel"]

## Writing Guide for Agent
[Direct instructions to the scripting agent: what to watch for, what mistakes to avoid, what this character would NEVER do]
```

---

## Step 3 — Generate Emotional State Image Prompts

Produce a generation-ready prompt for each of the **12 dominant emotions** (these map 1-to-1 with the values used in the Mood Arc and the UI image grid):

| State | File name | Notes |
|-------|-----------|-------|
| Joyful | `joyful.png` | Authentic, unguarded happiness — not a polite smile |
| Content | `content.png` | Quiet ease and security — their resting "good" state |
| Anxious | `anxious.png` | Their specific anxiety tell — does it show in the face, hands, posture? |
| Sad | `sad.png` | Their particular form of sadness — inward collapse or visible weeping? |
| Angry | `angry.png` | How *this person* shows anger — cold fury, explosive, or tight-lipped? |
| Ashamed | `ashamed.png` | Shame vs. guilt — averted gaze, flushed, withdrawn? |
| Performing | `performing.png` | The social mask fully on — the face they show when nothing is real |
| Numb | `numb.png` | Emotional shutdown — dissociated, still, behind glass |
| Tender | `tender.png` | Rare vulnerability — the moment they drop their guard |
| Determined | `determined.png` | Resolve before action — jaw set, gaze steady |
| Overwhelmed | `overwhelmed.png` | Breaking point — too much at once |
| Resigned | `resigned.png` | Acceptance of defeat — heavy but quiet |

### ⚠ Mandatory Framing Rule — Face Only

> **These images must show the face and only the face.**
> Frame: close-up portrait, **chin to crown of head**, slight neck at the bottom.
> No shoulders, no chest, no clothing visible in the frame.
>
> **Reason:** Clothing and costume are decided in a later phase. Showing any garment here
> risks locking in visual references that downstream agents (and human reviewers) may
> treat as canonical. These images must remain costume-neutral.
>
> **Prompt modifier to include in every generation:**
> `"extreme close-up face portrait, chin to top of head, no shoulders, no clothing visible, neutral seamless background"`

Each prompt must reference `canonical_visual.md` for facial features, hair, and skin tone — but **not** for clothing or accessories. Art style from `01_style_building.md`.

Save generated images to: `data/characters/[Name]/examples/emotional_states/`


---

## Step 4 — Output Summary

```
✓ personality_signature.md written for [Name]
✓ Emotional state prompts generated: joyful, content, anxious, sad, angry, ashamed, performing, numb, tender, determined, overwhelmed, resigned
✓ Images saved to data/characters/[Name]/examples/emotional_states/
```

---

## Flag Handling

If `personality_signature.md` is flagged with `[REWRITE_PERSONALITY]`:
1. Read the flag note for the specific concern
2. Update the relevant section only
3. If the rewrite changes verbal or physical signature, regenerate all 12 emotional state images

If a specific image is flagged with `[REGENERATE_EMOTION:{emotion}]`:
1. Read the flag note
2. Re-prompt with refined description for that single emotion only
3. Replace the file — do not regenerate the others
