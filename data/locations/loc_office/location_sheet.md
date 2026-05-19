# Location Sheet — The Office

**Location ID:** `loc_office`
**Type:** Interior — recurring
**Appears in:** Scene 1 (Morning) + Scene 2 (Night)
**Variants:** Morning · Night

---

## Overview

An open-plan office floor. Approximately 20 desks in clusters of 4, arranged so that every cluster becomes an accidental face-to-face configuration. No private offices. One glassed-in meeting room on the north side. Printer alcove in the back-left (south-west) corner.

This is the same physical space in every scene. Only the lighting changes — and that changes everything.

---

## Layout (shared across variants)

- **Entrance:** Single door, north-east corner. Full floor visible from it.
- **Desk clusters:** 5 rows of 4 desks each. Clusters oriented face-to-face.
- **East wall:** Full-length windows. Morning source of natural light.
- **North side:** Glassed meeting room. Visible from most desks.
- **Back-left corner:** Printer alcove. Narrow table, laser printer, paper stock below.
- **East wall alcove:** Coffee machine + small kitchen counter.

---

## Key Props (shared)

| Prop | Location | Significance |
|------|----------|--------------|
| CHARACTER_A's desk | Second cluster, facing the window | Her space. Papers slightly organized. |
| CHARACTER_B's desk | Fourth cluster, center | Post-its, organized chaos. |
| Coffee machine | Kitchen alcove, east wall | A reason to stand near someone. |
| Printer tray | Back-left alcove | **The narrative object of Scene 2.** Empty in Scene 1, contains the letter in Scene 2. |
| Two chairs pulled apart | Any cluster | Recent presence. Conversation ended or failed to start. |

---

## Variant A — Morning

**Scene:** 1 (The Forgotten Meeting)
**Time:** 7:30–10:00 AM

### Lighting — Morning
| Source | Quality | Colour |
|--------|---------|--------|
| Fluorescent overhead tubes | Cold, flat, harsh | White #FFFFFF |
| East windows | Warm morning backlight | Amber rim #D97706 |
| Monitor screens | Soft glow | Blue #3B82F6 (accent only) |

### Palette — Morning
```
Off-white:     #F2EDE4  (walls, paper, open space)
Warm grey:     #9B9B9B  (desk surfaces, mid-tones)
Charcoal:      #1C1C1E  (linework, shadows)
Monitor blue:  #3B82F6  (accent — sparingly)
Window amber:  #D97706  (rim light behind objects near east wall)
```

### Shot Library — Morning
| Shot ID | Label | Camera | Use for |
|---------|-------|--------|---------|
| `wide_entrance` | Wide — from entrance | Doorway, eye-level | Establishing Scene 1 |
| `medium_desk` | Medium — desk cluster | Waist-level, two desks | Dialogue at desks |
| `detail_printer` | Detail — printer alcove | Close, above tray | Foreshadowing Scene 2 |

---

## Variant B — Night

**Scene:** 2 (Night Office)
**Time:** 11 PM

### Lighting — Night
| Source | Quality | Colour |
|--------|---------|--------|
| Security spotlights | Hard amber pools | Amber #D97706 |
| Computer screen (one left on) | Faint soft wash | Blue #3B82F6 (minimal) |
| Printer LED (standby) | Pinpoint | Green #10B981 |
| All other areas | Deep shadow | Near-black |

**Rule:** The printer alcove is always the brightest point at night. It is the camera's destination.

### Palette — Night
```
Near-black:    #0A0A0A  (dominant shadow)
Charcoal:      #1C1C1E  (secondary shadow)
Amber spots:   #D97706  (security lights — dominant warm)
Computer blue: #3B82F6  (single screen, minimal)
Printer green: #10B981  (LED pinpoint only)
```

### Shot Library — Night
| Shot ID | Label | Camera | Use for |
|---------|-------|--------|---------|
| `wide_entrance` | Wide — from entrance (night) | Same doorway | Opening Scene 2 |
| `medium_printer` | Medium — printer alcove | Facing printer | Discovery of the letter |
| `detail_letter` | Detail — the letter | Extreme close, side-on | The narrative pivot moment |

---

## Image Generation Mandate

⚠ **No human figures.** Characters are placed by the generation pipeline.
⚠ **No text** visible in any image.
⚠ Style: expressive ink linework, flat fills, no gradients.
⚠ All shots within a variant must be visually consistent — same space, same time-of-day light.
⚠ Morning shots and Night shots must feel categorically different — same geometry, completely different atmosphere.
⚠ The printer tray is **empty** in all morning shots. It contains the **letter** in all night shots.

---

## Prompt Base (append to all shots)

```
[shot.prompt_suffix], [lore.visual_style], no human figures, no text, no speech bubbles
```
