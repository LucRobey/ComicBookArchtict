# Location Sheet — _TEMPLATE

**Location ID:** `[loc_id]`
**Type:** interior | exterior
**Appears in:** Scene N (Title) [, Scene M (Title) if recurring]

> **Variants:** Use variants when the same physical space appears in different time-of-day or weather conditions across scenes. Do NOT create separate location entries for the same space.
> - If this location always appears under the same conditions → use flat structure (no variants)
> - If this location appears morning AND night (or similar) → use variant structure

---

## Layout

[One or two paragraphs. Describe the physical space: size, shape, how elements are arranged. What does the entrance look like? What can you see from it? Where are the windows? What is the dominant axis? What makes this space unique — or pointedly generic?]

---

## Key Props (with narrative weight)

| Prop | Location in space | Significance | Present in |
|------|-------------------|--------------|------------|
| [prop name] | [where it is] | [why it matters for the story] | All variants / Morning only / Night only |

---

---

# OPTION A: Flat Location (single time-of-day)

_Use this when the space always appears under the same conditions._

## Lighting Rules

| Condition | Quality | Sources | Colour |
|-----------|---------|---------|--------|
| [time of day] | [hard/soft/flat] | [sources] | [hex accents] |

## Palette

```
[Surface]:  [description] [hex]
Accent warm: [hex]
Accent cool: [hex]
```

## Shot Library

_(3 shots minimum. Standard set: wide / medium / detail.)_

### shot_[shot_id]
**Label:** [Wide / Medium / Detail / POV] — [brief description]
**Camera:** [position, height, angle]
**Frame:** [foreground / background description]
**Use for:** [scene types, emotional purpose]
**Image:** `data/images/locations/[loc_id]/[shot_id].png`
**Prompt suffix:** `[shot-specific camera + framing details only — style rules come from lore.json]`

---

---

# OPTION B: Multi-Variant Location (same space, different conditions)

_Use this when the space appears in 2+ different time-of-day or weather states._
_Delete OPTION A above and keep only OPTION B when using variants._

## Shared Props (all variants)

_Props already listed in Key Props above. Note here if any prop is variant-specific._

---

## Variant A — [Label, e.g. Morning]

**Scene(s):** [N]
**Time:** [time range]

### Lighting — [Label]
| Source | Quality | Colour |
|--------|---------|--------|
| [source] | [quality] | [hex] |

### Palette — [Label]
```
[Surface]: [hex]
Accent: [hex]
```

### Shot Library — [Label]
| Shot ID | Label | Camera | Use for |
|---------|-------|--------|---------|
| `[id]` | [Wide/Medium/Detail] — [...] | [position] | [...] |

_(Full shot entries below — same format as OPTION A)_

### shot_[shot_id]
**Label:** ...
**Camera:** ...
**Frame:** ...
**Use for:** ...
**Image:** `data/images/locations/[loc_id]_[variant_id]/[shot_id].png`
**Prompt suffix:** `...`

---

## Variant B — [Label, e.g. Night]

_(Same structure as Variant A)_

---

---

## Image Generation Mandate

⚠ No human figures in any location shot. Characters are placed by the generation pipeline.
⚠ No text — no readable labels, signs, or screen content.
⚠ Style: expressive ink linework, flat fills, no gradients. (Inherited from lore.json visual_style.)
⚠ All shots within a variant must be visually consistent — same space, same light, same materials.
⚠ Different variants of the same location must be visually distinguishable — same geometry, different atmosphere.
⚠ [Any location-specific rules here]

---

## Prompt Base

```
[shot.prompt_suffix], [lore.visual_style], no human figures, no text, no speech bubbles
```
