# Location Sheet — The Office (Morning)

**Location ID:** `loc_office_day`
**Type:** Interior — recurring
**Appears in:** Scene 1 (The Forgotten Meeting)
**Time of day:** Morning (7:30–10:00 AM)

---

## Layout

Open-plan floor. Approximately 20 desks arranged in clusters of 4, oriented so each cluster forms an accidental face-to-face configuration. No private offices on this floor. One glassed-in meeting room on the north side, visible from most of the space. Printer alcove in the back-left corner (south-west). East-facing windows run the full length of the far wall — the main source of natural light.

The entrance is a single door in the north-east corner. From it, you can see the entire floor. Nothing is hidden.

---

## Key Props (with narrative weight)

| Prop | Location | Significance |
|------|----------|--------------|
| CHARACTER_A's desk | Second cluster from the entrance, facing the window | Her space. Papers always slightly organized. |
| CHARACTER_B's desk | Fourth cluster, center of the room | His space. Organized chaos. Post-its everywhere. |
| Coffee machine | Kitchen alcove, east wall | Everyone passes it. A reason to stand near someone. |
| Printer tray | Back-left alcove | In Scene 2 (night), this is where the letter is found. |
| Two chairs pulled apart | Any desk cluster | Signals that a conversation just ended or just failed to start. |

---

## Lighting Rules

| Condition | Quality | Sources | Palette impact |
|-----------|---------|---------|----------------|
| Morning (early) | Cold white + warm backlight | Fluorescent overhead + east windows | Fluorescent whites the space; window adds a warm amber rim from behind |
| Morning (mid) | Harsh cold overhead | Fluorescent only — sun moved | Blue-white, flat shadows |
| Overcast | Flat, even, uninspiring | Fluorescent only | Grey-white, zero shadow drama |

**The accent color in this location:** Blue — monitor glow only. Never used for anything decorative.

---

## Palette

```
Background/walls:  off-white #F2EDE4
Desk surfaces:     warm grey #9B9B9B
Floor/shadows:     charcoal #1C1C1E
Accent:            monitor blue #3B82F6 (sparingly)
Rim light (window):amber-warm #D97706 (morning scenes only, behind figures)
```

---

## Shot Library

### shot_wide_entrance
**Label:** Wide — from entrance
**Camera:** Doorway, eye-level, looking into the floor
**Frame:** Full open plan visible. Desks recede into depth. East windows create backlight silhouettes against morning light. Fluorescent tubes overhead.
**Use for:** Establishing the scene, showing the scale of the space, emphasizing that nothing is private.
**Image:** `data/images/locations/loc_office_day/wide_entrance.png`
**Prompt suffix:** `wide establishing shot from entrance doorway, desk clusters receding into depth, east windows with morning backlight, fluorescent overhead lights, empty space`

---

### shot_medium_desk
**Label:** Medium — desk cluster
**Camera:** Waist-level, facing two desks across from each other
**Frame:** Two desks face-to-face. Papers, monitors, the remains of coffee. Fluorescent light from directly above.
**Use for:** Dialogue scenes between two characters at their desks. The face-to-face configuration makes it a negotiation table nobody agreed to.
**Image:** `data/images/locations/loc_office_day/medium_desk.png`
**Prompt suffix:** `medium shot at desk cluster, two desks face-to-face, papers monitors coffee cups, waist-level camera, fluorescent overhead, morning`

---

### shot_detail_printer
**Label:** Detail — printer alcove
**Camera:** Close, slightly above the tray, looking down
**Frame:** Printer on narrow table. Output tray foregrounded and empty. Power cable. Dim corner — the fluorescent is further away here.
**Use for:** Foreshadowing the letter (Scene 1 setup). Close-up object emphasis.
**Image:** `data/images/locations/loc_office_day/detail_printer.png`
**Prompt suffix:** `close detail shot of office printer alcove, laser printer, empty output tray, dim corner light, power cable, charcoal palette`

---

## Image Generation Mandate

⚠ **No human figures** in any location shot. Characters are added by the scripting/generation pipeline.
⚠ **No text** — no readable labels, signs, or screen content.
⚠ Style: expressive ink linework, flat fills, no gradients, no hatching.
⚠ All shots must be visually consistent with each other — same space, same materials, same palette.
