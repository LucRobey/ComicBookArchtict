# 🎭 Phase 1.5: Character Introductions (Standalone Step)

**Agent Role:** You are the Character Introduction Specialist.
**Objective:** Create the complete structural layout (panels) and script (dialogue/captions) for the dedicated Character Introduction pages. These pages occur immediately after the cover and before the main plot begins.

---

## Context & Inputs

You MUST read and fully internalize ALL of the following files before proceeding:

1. `02_phase_pacing/outputs/pages.json` — Read this to identify exactly which pages are reserved for Character Introductions (usually `scene_id: 0` or tagged as character intros at the beginning). You need their page numbers.
2. `inputs/[character_name]_intro.md` — The user will provide a specific `.md` file for *every* main character, detailing exactly how they want that character to be introduced. **This is your primary creative constraint.**
3. `00_global_database/characters/global_profile_template.md` (or the specific character's global profile) — To ensure their voice and core flaws are respected.
4. `modifications/modifications.md` — The user's modification requests for intro pages. Read this first if doing a modification pass.

---

## 2. Execution Mode Decision
Based on your check of `modifications/modifications.md`, choose your execution mode:

### Mode A: Normal Generation (No Modifications)
*If `modifications.md` does not exist or is empty.*

For each character introduction page defined in the pacing JSON, read their specific `intro.md` file and generate a complete breakdown.

#### 1. Panel Layout Guidelines
- If the user's `intro.md` asks for a splash, make it a 1-panel full page.
- If it asks for a rapid sequence, use 2-4 panels.
- Frame the shots to instantly communicate the character's personality and the funny situation they are in.
- Use explicit camera angles (e.g., `Wide establishing shot`, `Extreme close-up`).

#### 2. Scripting Guidelines
- Output full dialogue and internal captions.
- The tone must match the instructions from the user's `.md` file.
- **Loudly establish the flaw:** Use the dialogue/action to show the reader exactly who this person is and what their main quirk or flaw is before the plot even starts.

### Mode B: Modification / Smart Regeneration
*If `modifications.md` exists and contains user feedback.*

1. **Identify the Targets:** Check which character's intro page has comments under it.
2. **Redo the Process:** Do NOT blindly patch text. You must smartly *redo the conceptual writing process* for that specific intro page based on the new feedback.
3. **Regenerate:** Rewrite the JSON for that specific character from scratch.
4. **Merge:** Update the output JSON with the new intro page, keeping the others identical.

---

## Expected Output Format: JSON

You MUST output the combined structure and script for the intro pages as a strict JSON object. This skips the typical Phase 2/3 split because intros are handled in one go.

Save this to `outputs/intro_pages.json`.

```json
{
  "pages": [
    {
      "page_number": 1,
      "character": "[CHARACTER_A]",
      "panels": [
        {
          "panel_number": 1,
          "framing": "Wide Establishing Shot",
          "action": "[CHARACTER_A] is engaged in an activity that perfectly encapsulates their core flaw.",
          "dialogues": [
            {
              "speaker": "NARRATOR",
              "text": "[Narrator caption establishing their personality.]",
              "type": "caption"
            },
            {
              "speaker": "[CHARACTER_A]",
              "text": "[Dialogue that demonstrates their quirk in action.]",
              "type": "speech"
            }
          ]
        }
      ]
    }
  ]
}
```

## Post-Generation Action (Automated Conversion)
Once you have generated and saved the JSON (to `outputs/intro_pages.json`), you MUST use your terminal tools to automatically run the conversion script (or equivalent) to show the readable markdown to the user for approval. If a specific converter for intros doesn't exist, provide a clean Markdown preview directly in the chat.
