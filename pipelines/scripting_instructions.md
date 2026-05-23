# ✍️ Phase 3: Scripting — Two-Stage Pipeline

**Agent Role:** You are a Comic Book Writer (Stage 3A) and a Comic Book Editor (Stage 3B).  
**Objective:** Produce the complete script for the comic in two passes — first write the narrative, then lay it into panels.

---

## Pipeline Architecture

Phase 3 is split into two sequential stages:

| Stage | Pipeline | Agent Role | Input | Output |
|-------|----------|-----------|-------|--------|
| **3A** | `pipelines/10_scene_script.md` | Writer | Synopsis, scenes, chapters, moods, personality, `data/final_lore.json`, `data/script_style.json` | `data/scene_script.json` |
| **3B** | `pipelines/11_panel_script.md` | Editor | Scene script, scenes, pages, moods, `data/final_lore.json`, `data/script_style.json`, `data/panel_style.json` | `data/script.json` |

**Why two stages:** Writing dialogue and assigning it to panels are fundamentally different cognitive tasks. Stage 3A is a pure narrative writing problem — character voice, subtext, pacing. Stage 3B is a visual storytelling problem — panel economy, reading flow, lettering placement. Separating them produces better results at both levels.

**Execution order:** Always run 3A first. User approves `scene_script.json`. Then Phase 1.5 Pacing runs to distribute these beats to pages (producing `pages.json`). Finally, Phase 2 Panel Structuring and Stage 3B Panel Scripting run in parallel to produce `panels.json` and the final `script.json`.

---

## Style Guide Integration

Both stages now consume **style guide files** produced by **Pipeline 09b (Style Research)**. These files encode narrative and layout conventions extracted from the comic's reference style.

| File | Consumed by | What it constrains |
|------|-------------|--------------------|
| `data/script_style.json` | Stage 3A + 3B | **How dialogue is written** — dialogue density, humor style, subtext level, caption usage, pacing |
| `data/panel_style.json` | Stage 3B only | **How beats are placed into panels** — grid patterns, lettering conventions, balloon types |

**Key principles:**

- Style guides are **constraints, not overrides**. They work *alongside* `final_lore.json` and character rules — they do not replace them.
- If a style guide directive conflicts with a character's `personality_signature`, **the personality wins**. Character voice is sacred; reference style is advisory.
- If `script_style.json` or `panel_style.json` **do not exist**, proceed without style constraints. The pipeline is fully backward-compatible.

---

## Shared Rules (Both Stages Must Follow)

### The Anti-Cheese Rule (Non-Negotiable)

**This story is not about perfect moments. It is about real ones.**

- ❌ No purple prose.
- ❌ No characters saying out loud what they obviously feel. Real people don't narrate their emotions — they deflect, they joke, they go quiet.
- ❌ No perfect inspirational family moments. If a scene is sweet, earn it with something slightly awkward right before it.
- ✅ Internal monologue (captions) can be honest and raw.
- ✅ Dialogue should feel slightly unfinished, interrupted, overlapping.
- ✅ Small complaints, dry observations, and bad timing are as important as big emotional beats.

**The test:** Read the line out loud. If it sounds like a movie trailer ("I'm so sad"), rewrite it using subtext.

---

### The Feels/Shows Gap (The Engine of Every Scene)

Before writing dialogue for **any scene**, look up every character present in `data/character_moods.json`. For each character:

| Field | Layer | How it manifests |
|-------|-------|-----------------|
| `dominant_emotion` | Starting state | Colours everything this character does at the scene's opening |
| `feels` | Private truth | What the character carries inside. Captions access this. Other characters don't see it. |
| `shows` | External mask | What the character displays. Dialogue and action reflect this — never `feels`, unless the mask is breaking. |
| `tension_with` | Subtext charge | Unresolved tension with another character. Lives in word choice, unfinished sentences, averted gaze. |
| `agenda` | Goal | What they want from this interaction. Their dialogue advances or defends this. |
| `subtext` | Meaning | What they actually mean. They should almost never say it directly. |
| `secret` | Firewall | What they're actively hiding. Lines should guard or deflect when the topic gets close. |
| `status_dynamic` | Power position | How they present relative to others. Affects speech register, body language. |
| `tactics` | Method | How they pursue their agenda — deflection, humor, guilt, silence. Shapes rhythm and wording. |
| `scene_stakes` | Urgency | What's at risk if they fail. Governs intensity of their performance. |

**The gap between `feels`/`secret`/`subtext` and `shows`/`status_dynamic`/`tactics` is the engine of every scene. Never collapse it.**

A character who feels `overwhelmed` but shows `determined` must speak determined words while their body language hints at the fracture beneath.

---

### Canon & Continuity Check (Mandatory)

Before writing, cross-reference against:
- `data/personality_signature.json` — character profiles
- `data/final_lore.json` — world rules

Ensure:
- No character takes an action that violates their psychological profile
- Relationships and past history are respected
- Verbal habits are consistent (Adèle qualifies; Thomas interrupts)
- If an action seems to break continuity, adapt the dialogue to acknowledge or resist it

---

### Style Constraint Hierarchy

When style guides, lore, and character profiles all apply to the same decision, resolve conflicts using this priority order (highest wins):

| Priority | Source | Scope |
|----------|--------|-------|
| 1 (highest) | `data/final_lore.json` | World rules are absolute — no style guide can override canon physics, history, or setting constraints |
| 2 | `data/personality_signature.json` | Character voice is sacred — verbal habits, emotional patterns, and speech register always win |
| 3 | `data/script_style.json` | Narrative conventions from the reference style — dialogue density, humor tone, caption philosophy |
| 4 | `data/panel_style.json` | Layout conventions from the reference style — grid patterns, balloon types, lettering rules |
| 5 (lowest) | Agent creative judgment | Fills gaps not covered by any of the above — the agent's own storytelling instinct |

> ⚠️ **Never let a style guide flatten a character's voice.** If `script_style.json` says "use dry humor" but a character's personality is warm and earnest, the character stays warm and earnest.

---

### Mandatory Reads Before Scripting

**Stage 3A agent MUST read** (in order):
1. `data/final_lore.json`
1.5. `data/script_style.json`
2. `data/scenario_synopsis.json`
3. `data/scenario_chapters.json`
4. `data/scenario_scenes.json`
5. `data/character_moods.json`
6. `data/personality_signature.json`

**Stage 3B agent MUST read** (in order):
1. `data/scene_script.json`
1.5. `data/script_style.json`
1.6. `data/panel_style.json`
2. `data/scenario_scenes.json`
3. `data/pages.json`
4. `data/character_moods.json`
5. `data/final_lore.json`

> 📝 **Note:** If `data/script_style.json` or `data/panel_style.json` do not exist, proceed without style constraints. Their absence is not a pipeline error.

Failure to read any of the other files listed above is a pipeline error, not an acceptable shortcut.

---

## Stage-Specific Instructions

For detailed step-by-step instructions, read:
- **Stage 3A:** `pipelines/10_scene_script.md`
- **Stage 3B:** `pipelines/11_panel_script.md`

---

## QA Reports → `qa/script/`

QA flags for both stages are exported to the same folder. The flag type indicates which stage handles it:

### Stage 3A flags (narrative content)
- `[REWRITE_BEAT]` — Rewrite a specific beat in `scene_script.json`
- `[REWRITE_SCENE]` — Rewrite all beats for a scene
- `[ADJUST_DENSITY]` — Scene has too many or too few beats
- `[REWRITE_VOICE]` — Character doesn't sound right

### Stage 3B flags (panel layout)
- `[REWRITE_LINE]` — Rewrite specific dialogue by ID
- `[CHANGE_SPEAKER]` — Reassign dialogue speaker
- `[CHANGE_TYPE]` — Change dialogue type (speech/thought/caption)
- `[DELETE_LINE]` — Remove a dialogue entry (do NOT renumber)
- `[ADD_LINE_AFTER]` — Insert new dialogue after a specific ID
- `[FULL_PANEL_REWRITE]` — Rewrite all lettering for a panel
- `[REASSIGN_BEATS]` — Move beats between panels
