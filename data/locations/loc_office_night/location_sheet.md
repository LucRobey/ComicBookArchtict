# Location Sheet — The Office (Night)

**Location ID:** `loc_office_night`
**Type:** Interior — recurring
**Appears in:** Scene 2 (Night Office)
**Time of day:** 11 PM

---

## Layout

Identical floor plan to `loc_office_day` — same space, same arrangement. But at 11 PM, the geometry changes. The fluorescent overhead tubes are off. Three security spotlights (ceiling-mounted, amber) illuminate only specific desk clusters. The rest is shadow.

The printer alcove in the back-left corner falls under its own security spotlight. This is not an accident. The printer tray is visible from the entrance if you know to look.

---

## Key Props (with narrative weight)

| Prop | Location | Significance |
|------|----------|--------------|
| The letter in the printer tray | Printer alcove, back-left | The narrative object of Scene 2. It was there before CHARACTER_A stayed late. |
| One chair pushed out | Second cluster | Implies recent presence. Someone left in a hurry. |
| Single computer left on | Fourth cluster | Faint blue screen. The only non-amber light source on the floor. |
| Printer green LED | Printer | Standby light. The only thing the printer is communicating. |
| CHARACTER_A's desk | Second cluster | She sits here in Scene 2. Her lamp is off. |

---

## Lighting Rules

| Source | Type | Position | Colour |
|--------|------|----------|--------|
| Security spotlight 1 | Hard amber pool | Desk clusters 2–3 | Amber #D97706 |
| Security spotlight 2 | Hard amber pool | Printer alcove | Amber #D97706 (slightly brighter — it's the scene's focal point) |
| Computer screen | Soft blue wash | Fourth cluster | Blue #3B82F6 (very faint, barely visible) |
| Printer LED | Pinpoint | Printer alcove | Green #10B981 (tiny, precise) |
| **All other areas** | **Deep shadow** | — | **Charcoal to black** |

**Rule:** The printer alcove is the brightest point in the space at night. This is the camera's destination.

---

## Palette

```
Shadow areas:      near-black #0A0A0A — charcoal #1C1C1E
Lit desk surfaces: warm amber-grey (lit by security spots)
Accent warm:       amber #D97706 (security lights — dominant)
Accent cool:       blue #3B82F6 (single computer — minimal)
Accent green:      #10B981 (printer LED only — pinpoint)
```

---

## Shot Library

### shot_wide_entrance
**Label:** Wide — from entrance (night)
**Camera:** Same doorway as the day shot. Eye-level.
**Frame:** Full floor visible. Most of it in shadow. Three amber pools of light pick out desk clusters. Printer alcove visible as the brightest point in the far left. One blue screen glow in the middle distance.
**Use for:** Opening Scene 2. Establishing the emptiness and the focal hierarchy.
**Image:** `data/images/locations/loc_office_night/wide_entrance.png`
**Prompt suffix:** `wide shot from entrance, office 11PM, security spotlight amber pools, deep shadow, one blue computer screen glow, printer alcove as brightest point, empty`

---

### shot_medium_printer
**Label:** Medium — printer alcove (night)
**Camera:** Medium, slightly above, facing the printer
**Frame:** The printer under its security spotlight. Hard amber circle of light. The output tray visible — a folded letter/document resting in it. Green LED pinpoint. Deep shadow beyond.
**Use for:** The discovery moment. CHARACTER_A approaching the printer. The letter as subject.
**Image:** `data/images/locations/loc_office_night/medium_printer.png`
**Prompt suffix:** `medium shot printer alcove night, hard amber security spotlight, printer with green LED, folded letter in output tray, deep shadow surround`

---

### shot_detail_letter
**Label:** Detail — the letter (night)
**Camera:** Extreme close-up, side-on, tray at eye level
**Frame:** The folded document in the tray. Amber light catches the top edge. Tray metal surface has a faint amber reflection. Everything beyond the tray is shadow.
**Use for:** The beat where CHARACTER_A sees it. Full focus on the object. Maximum narrative weight.
**Image:** `data/images/locations/loc_office_night/detail_letter.png`
**Prompt suffix:** `extreme close-up printer output tray side-on, folded document letter, amber light catching top edge, tray metal reflection, deep shadow, no other context`

---

## Image Generation Mandate

⚠ **No human figures.** Characters are added by the generation pipeline.
⚠ Night shots must feel categorically different from day shots — darker, quieter, more focused.
⚠ The printer alcove should always be the focal point in night shots unless the shot is specifically about another object.
⚠ The letter appears in `shot_medium_printer` and `shot_detail_letter` — but NOT in `shot_wide_entrance` (it's too far to read from the entrance).
