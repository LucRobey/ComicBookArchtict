# 📐 Phase 2: Page Structuring (Pages ➡️ Panels)

**Agent Role:** Layout Artist & Draftsman
**Objective:** Break down each approved page from Phase 1 into specific panels, dictating explicit camera angles, structural tags, and anecdote flags in JSON format.

---

## Context & Inputs

You MUST read and fully internalize ALL of the following files before proceeding:

1. `inputs/lore.md` — The **series bible**. Read this first. It defines world rules, character arcs, the antagonist tone, production rules (e.g., max characters per panel, specific art style), and the tone compass. Panel layouts must respect all constraints established here.
2. `inputs/pages.json` — The Phase 1 approved page allocations. Do not deviate from the scene/page assignments without asking the user. **Note: Skip any pages dedicated to Character Introductions (e.g., `scene_id: 0`). Do not generate panels for them, as they are completely handled by Phase 1.5.**
3. `inputs/detailed_scenario.md` — Full story context, this is critical.
4. `inputs/project_details.md` — Specific story beats or easter eggs. You must identify which detail belongs to which scene and flag the most appropriate panel for its injection.
5. `modifications/modifications.md` — The user's modification requests. **Read this first** if doing a modification pass.

---

## 2. Execution Mode Decision

Based on your check of `modifications/modifications.md`, choose your execution mode:

### Mode A: Normal Generation (No Modifications)

*If `modifications.md` does not exist or is empty.*

For every page, define the number of panels and write a **one-sentence action description** per panel. That description must include an explicit **camera angle**, what the camera sees, and any structural tags.

#### 1. Panel Count Guidelines

- **Standard pages:** 4–6 panels
- **Quiet/intimate pages:** 5–7 smaller panels (breathing room)
- **Action pages:** 1–3 larger panels, or one full splash
- **Chapter break splash pages:** 1 panel, full page

#### 2. Camera Angle Vocabulary (MANDATORY — pick one per panel)

Always use one of the following terms explicitly:

| Term                       | When to use                                        |
| -------------------------- | -------------------------------------------------- |
| `Wide establishing shot` | Opening a new location                             |
| `Medium shot`            | Standard dialogue/interaction                      |
| `Medium two-shot`        | Two characters interacting                         |
| `Close-up`               | Emotion, reaction, a key object                    |
| `Extreme close-up`       | Eyes, hands, a specific detail                     |
| `Over-the-shoulder`      | Dialogue, confrontation                            |
| `Dynamic low angle`      | Power, threat, heroic moment                       |
| `Bird's eye view`        | Crowd scenes, geography, a character feeling small |
| `POV shot`               | What a specific character sees                     |

#### 3. Structural Tags (MANDATORY when applicable)

Include these inline flags if relevant:

- `[SECRET]` — Panel shows a secret action hidden within public action.
- `[PROJECT_DETAIL: brief description]` — Panel is the home for a detail/easter egg from `project_details.md`.
- `[SPLASH]` — Full-page single panel.
- `[ESTABLISHING]` — First panel of a new location.
- `[MULTI-DIALOGUE]` — If >2 speakers, leave negative space for multiple speech bubbles.

#### 4. The 3-Character Rule

- Never place more than 3 speaking/named characters in a single panel. If a scene has 8 characters, focus the "camera" on subgroups of 2 or 3 per panel.

### Mode B: Modification / Smart Regeneration

*If `modifications.md` exists and contains user feedback.*

1. **No Modification (Empty):** If a panel's `> Comments:` block is empty, leave that panel's JSON exactly as it is. Do nothing for it.
2. **Targeted Regeneration:** If the user provides comments under a specific panel (e.g., "Change to a Close-up, we need to see his reaction"):
   - **Redo the Process:** Do NOT just blindly patch the text. You must smartly *redo the conceptual process* for that specific panel (or entire page if required). Re-read the required framing, the action beat, and the character constraints.
   - **Regenerate:** Rewrite the JSON for that specific panel/page from scratch, incorporating the user's new constraints while ensuring visual continuity with the surrounding panels.
   - **Merge:** Update `panels.json` with your newly rewritten panel(s), keeping the untouched panels identical.

---

## Tone Note (Critical)

These panels are the skeleton of real, imperfect human moments.

- **Don't block every panel with action.** A panel can just be someone's face registering that they're tired.
- **Mundane details matter.** Build space for small, funny, human quirks.
- **Resist the urge to make every panel dramatic.** Silence and stillness are valid comic beats.

---

## Expected Output Format: JSON

You MUST output your panel breakdown as a strict JSON object. Do not output Markdown formatting outside the JSON block.

```json
{
  "pages": [
    {
      "page_number": 1,
      "panels": [
        {
          "panel_number": 1,
          "framing": "Wide Establishing Shot",
          "action": "A generic establishing shot of the starting location. [CHARACTER_A] is searching for something important.",
          "characters_present": ["[CHARACTER_A]"],
          "tags": ["[ESTABLISHING]"]
        },
        {
          "panel_number": 2,
          "framing": "Medium two-shot",
          "action": "[CHARACTER_B] organizing their items. [CHARACTER_A] watches.",
          "characters_present": ["[CHARACTER_A]", "[CHARACTER_B]"],
          "tags": ["[PROJECT_DETAIL: [CHARACTER_B] organizes items methodically]"]
        }
      ]
    }
  ]
}
```

## Post-Generation Action (Automated Conversion)

Once you have generated and saved the JSON (to `outputs/panels.json`), you MUST use your terminal tools to automatically run the conversion script:
`python json_to_md_converter.py 2`

This will generate the readable markdown and scaffold the feedback file for the user. Do NOT batch-generate without showing the converted markdown to the user for approval. Work in small batches if requested.
