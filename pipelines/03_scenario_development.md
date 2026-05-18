# 📖 Phase 0 (Step 3): Scenario Development Instructions

**Agent Role:** Screenwriter & Story Architect
**Objective:** Transform raw user ideas, jokes, and anecdotes into a structured, compelling comic book scenario.

---

## Context & Inputs

*(This step MUST run after Step 2 is complete)*

You MUST read and fully internalize the following files before proceeding:

1. `outputs/presentation.md` (The distilled character profiles from Step 2. You MUST use these psychologically grounded profiles to drive the scenario, rather than a generic mood).
2. `inputs/raw_ideas.txt` (A brain dump of plot points, real-life anecdotes, and jokes).
3. `modifications/modifications.md` (The user's correction logs. Read this first if it exists).

## 2. Execution Mode Decision
Based on your check of `modifications/modifications.md`, choose your execution mode:

### Mode A: Normal Generation (No Modifications)
*If `modifications.md` does not exist or is empty.*

1. Read the `raw_ideas.txt`.
2. Propose a structured narrative arc consisting of distinct scenes. 
3. **Specific Details Rule:** Every single real-life anecdote or specific plot detail mentioned in the raw ideas MUST be assigned to a specific scene. Do not leave any out. They provide the grounding reality of the story.

#### Expected Outputs
You must generate three distinct outputs:

1. **`lore.md`:** The world rules. Are there superpowers? Is it a spy thriller? What is the overarching tone (e.g., "pure farce", "gritty noir")?
2. **`detailed_scenario.md`:** A scene-by-scene breakdown. For each scene, list the characters present, the physical location, and the emotional beat.
3. **`project_details.md`:** A clean list of all the specific jokes/moments/plot points to include (e.g., "Character A finding the hidden key", "The awkward family dinner").

### Mode B: Modification / Smart Regeneration
*If `modifications.md` exists and contains user feedback.*

1. **Identify the Targets:** Look closely at the `modifications.md` file. Identify exactly which scenes have comments underneath them.
2. **Redo the Process:** Do NOT just blindly patch the text. You must smartly *redo the conceptual writing process* for that specific scene. Re-read the raw ideas and the user's critique (e.g., "Scene 3 is too boring. Add an action sequence").
3. **Regenerate:** Rewrite the scenario for that specific scene from scratch, applying the new constraints while ensuring the pacing remains intact. Output the complete, updated scenario.
4. **The Pipeline Cascade Rule (CRITICAL):** Because Phase 0 operates as a strict sequence, modifying `lore.md` (Step 3) means you **MUST** flag that the visual signatures (Step 4) may need to be double-checked against the new world rules. Always inform the user if your modifications have triggered a necessary cascade update to downstream files.
