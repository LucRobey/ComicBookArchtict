# Location Sheet — The Café

**Location ID:** `loc_cafe`
**Type:** Interior — single scene
**Appears in:** Scene 3 (The Confrontation)
**Time of day:** Morning (the day after Scene 2)

---

## Layout

A small-to-medium café, approximately 8 tables. Chosen by neither character — it's a neutral ground, which is exactly why it was chosen. Nothing about it is memorable. The design is the point.

Counter at the back, slightly off-center. Coffee machine visible behind it. Laminated menus propped against salt shakers on each table. One amber pendant lamp hanging over the middle table — the only warm, deliberate light source. Everything else is even, ambient, uninspiring.

Rain-streaked window on the right side (east-facing). Street outside: completely unreadable from inside.

---

## Key Props (with narrative weight)

| Prop | Location | Significance |
|------|----------|--------------|
| The two coffee cups | Middle table (under pendant) | One has a spoon in the saucer. The other does not. This asymmetry is intentional. |
| Amber pendant lamp | Over middle table | The only warm light in the space. It defines the scene's emotional center. |
| Rain-streaked window | Right wall | The outside world is inaccessible. The conversation has no exit. |
| Laminated menus | All tables | Proxy conversation objects. They can be held, looked at, put down. |
| The counter | Back wall | A reason to look away. The barista is never shown. |

---

## Lighting Rules

| Source | Type | Colour |
|--------|------|--------|
| Amber pendant lamp | Warm, focused | Amber #D97706 |
| Ambient ceiling | Flat, even, cool | Warm grey / off-white |
| Window (rain day) | Diffuse, flat | Cold grey, no direct sun |
| Counter (background) | Faint warm from coffee machine | Barely noticeable |

**Rule:** The pendant is the only designed light. Everything else just exists. The table under it is the only place that feels chosen.

---

## Palette

```
Walls/surfaces:     off-white #F2EDE4
Floor/counter:      warm grey #9B9B9B
Table surfaces:     slightly warmer off-white
Shadows:            charcoal #1C1C1E (subtle — ambient light is flat)
Accent warm:        amber #D97706 (pendant + its reflection in cups)
Window light:       cold grey #6B7280 (rain diffusion)
```

---

## Shot Library

### shot_wide_entrance
**Label:** Wide — from entrance
**Camera:** Doorway or just inside, eye-level, looking in
**Frame:** Full café visible. Counter at back. 6-8 tables. Rain window right. Pendant lamp over the middle table, the brightest and warmest point. Two coffee cups on that table — the only sign that anyone is expected.
**Use for:** Establishing Scene 3. The space says "nothing special here" while the pending drama says otherwise.
**Image:** `data/images/locations/loc_cafe/wide_entrance.png`
**Prompt suffix:** `wide establishing shot café from entrance, counter at back, 8 tables generic chairs, rain window right, amber pendant over one table, two coffee cups, off-white and warm grey palette`

---

### shot_medium_table
**Label:** Medium — the table
**Camera:** Sitting height, slightly above the table surface, looking across
**Frame:** The middle table. Two coffee cups opposite each other. One with a spoon. Amber pendant above creates a warm halo. The window is visible in the soft background. The table surface shows years of casual use.
**Use for:** All dialogue frames in Scene 3. Characters sit here. This is the primary dialogue setup shot.
**Image:** `data/images/locations/loc_cafe/medium_table.png`
**Prompt suffix:** `medium shot café table at sitting height, two coffee cups opposite each other, one spoon in saucer, amber pendant above, rain window soft background, no figures`

---

### shot_detail_window
**Label:** Detail — the rain window
**Camera:** Close, facing the window from inside, slightly upward
**Frame:** Rain streaks on glass. The street outside is a blur of grey shapes. The amber pendant reflected in the lower glass as a warm smear. A sliver of the café interior visible in reflection.
**Use for:** Scene 3 pause beats. The window is an emotional escape that doesn't open. A character looking at it is looking at everything they're not saying.
**Image:** `data/images/locations/loc_cafe/detail_window.png`
**Prompt suffix:** `close shot rain-streaked café window from inside, street blurred grey, amber pendant reflection in glass, charcoal and grey palette, diagonal rain lines`

---

## Image Generation Mandate

⚠ **No human figures.**
⚠ The table with two cups is always the middle table under the pendant. Do not move it.
⚠ The asymmetry of the cups (one with spoon, one without) must be visible in any medium or close shot of the table.
⚠ The street through the window must always be unreadable — blurred, no readable text or faces.
⚠ Style: expressive ink linework, flat fills, no gradients.
