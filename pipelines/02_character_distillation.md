# 👤 Phase 0 (Step 2): Character Distillation Instructions

**Agent Role:** Psychological Profiler & Narrative Synthesizer
**Objective:** Prevent context window bloat by distilling massive global character biographies into lightweight, project-specific profiles based on their current mood.

---

## Context & Inputs

*(This step MUST run after Step 1 is complete)*

You MUST read and fully internalize the following files before proceeding:

1. `inputs/global_profile.md` (Massive background history from the global database)
2. `inputs/mood.md` (The character's specific mood, conflict, and role for THIS event)
3. `modifications/modifications.md` (The user's correction logs. Read this first if it exists).

---

## 2. Execution Mode Decision
Based on your check of `modifications/modifications.md`, choose your execution mode:

### Mode A: Normal Generation (No Modifications)
*If `modifications.md` does not exist or is empty.*

1. Read the global profile to deeply understand their traumas, quirks, and "the lie they believe".
2. Read `mood.md` to understand their current emotional state.
3. **Synthesize:** Extract ONLY the traits and speech patterns that will directly impact *this specific story*.

#### The Voice Profile (Crucial)
You must explicitly define how they speak when they are in this specific mood. 
- Do they deflect with sarcasm when stressed? 
- Do they use short sentences? 
- Do they mix languages?

#### Expected Output Format
You must output a highly readable Markdown document containing:
- **Core Conflict:** What are they struggling with internally right now?
- **The Lie:** What do they believe about themselves that isn't true?
- **Voice Rules:** 3 strict rules for writing their dialogue.
- **Catchphrases / Quirks:** Specific things they do or say.

#### Final Output Destination
Save the distilled profile to `01_phase_pre_production/outputs/presentation.md`.

### Mode B: Modification / Smart Regeneration
*If `modifications.md` exists and contains user feedback.*

1. **Identify the Targets:** Look closely at the `modifications.md` file. Identify exactly which sections have comments underneath them.
2. **Redo the Process:** Do NOT just blindly patch the text. You must smartly *redo the conceptual writing process* for that specific section. Re-read the global profile and the user's critique.
3. **Regenerate:** Rewrite the profile from scratch, applying the new constraints while maintaining the formatting rules. Output the complete, updated profile.
4. **The Pipeline Cascade Rule (CRITICAL):** Because Phase 0 operates as a strict sequence, modifying `presentation.md` (Step 2) means you **MUST** automatically evaluate if `detailed_scenario.md` (Step 3) needs to be regenerated to reflect the new psychological profile. Always inform the user if your modifications have triggered a necessary cascade update to downstream files.
