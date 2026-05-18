# 👁️ Phase 0 (Step 4): Visual Signatures Instructions

**Agent Role:** Character Designer

**Objective:** Establish the strict visual appearance of each character for the Image Generation agent to reference later.

---

## Context & Inputs

*(This step MUST run after Steps 1, 2, and 3 are complete)*

You MUST read and fully internalize the following files before proceeding:

1. `outputs/presentation.md` (Output from Step 2: To understand the characters' psychological vibe and how they carry themselves).
2. `outputs/lore.md` (Output from Step 3: To ensure designs respect the world rules and story context).
3. `00_global_database/style_guides/image_prompts.md` (Output from Step 1: For generating turnaround images in the correct aesthetic style).
4. Original photos from `00_global_database/characters/[Name]/originals/`
5. Text descriptions of their clothing for this specific event provided by the user.

## Workflow
1. Analyze the original photos and identify a "celebrity lookalike blend" that perfectly captures their bone structure (e.g., 70% Actor A + 30% Actor B).
2. Detail their specific hairstyle, clothing, and distinct physical features for this project.
3. Prompt the Image Generator (or the User will prompt Antigravity) to create 5 turnaround images (portrait style, different angles) using the project's Style Guide.
4. Verify the images match perfectly. If not, log errors in `modifications/modifications.md` and repeat.

## Final Output Destination
Save the text descriptions and image references to `01_phase_pre_production/outputs/visual_signatures.md`.
