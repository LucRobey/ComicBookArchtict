# 📖 Phase 0.2: Scenario Development Pipeline Instructions

**Agent Role:** Screenwriter & Story Architect
**Objective:** Transform raw user ideas into a structured, compelling comic book scenario via a 5-step controllable pipeline.

---

## The 5-Step Pipeline Architecture

You will receive specific QA flags instructing you to execute one of these 5 steps. You must output the designated JSON files.

### Step 1: Raw Inputs (The Brain Dump)
- **Input:** User manual entry in UI.
- **Data File:** `data/scenario_inputs.json`
- **Agent Action:** None, unless asked to suggest inputs.

### Step 2: Personality Signatures
- **Trigger Flag:** `GENERATE_SIGNATURES`
- **Input Required:** `data/scenario_inputs.json` + `data/presentation.json` (Base Character Profiles).
- **Process:** Generate specific personality signatures tailored to this scenario's events for each character.
- **Output File:** `data/personality_signature.json` (format: `{"signatures": {"char_name": {"age": "...", "gender": "...", "role": "...", "relationships": {"other_char": "..."}, "general_personality": "...", "loves": ["..."], "hates": ["..."], "verbal_habits": "...", "writing_notes": "..."}}}`)

### Step 3: The Story Treatment (Synopsis)
- **Trigger Flag:** `GENERATE_SYNOPSIS` or `REWRITE_SYNOPSIS`
- **Input Required:** `data/scenario_inputs.json` + `data/personality_signature.json` + `data/final_lore.json`.
- **Process:** Write a rich-text synopsis covering the entire scenario arc.
- **Output File:** `data/scenario_synopsis.json` (format: `{"synopsis": "..."}`)

### Step 4: Chapters (The Outline)
- **Trigger Flag:** `GENERATE_CHAPTERS` or `REWRITE_CHAPTER`
- **Input Required:** `data/scenario_synopsis.json`.
- **Process:** Break the synopsis down into chronological chapters.
- **Output Files:**
  - `data/scenario_chapters.json` (format: `{"chapters": [{"chapter_id": 1, "title": "...", "summary": "..."}]}`)
  - `data/character_mood.json` (Create overarching mood definitions for characters per chapter if required).

### Step 5: Scenes (The Script Breakdown)
- **Trigger Flag:** `GENERATE_SCENES` or `REWRITE_SCENE`
- **Input Required:** `data/scenario_chapters.json` + `data/personality_signature.json` + `data/character_mood.json` (or `character_moods.json`) + `data/geography.json`.
- **Process:** Break down chapters into individual scenes.
- **Crucial Rule:** You MUST explicitly cross-reference the scene actions against each Character's `personality_signature` and `character_mood.json` to ensure deep psychological consistency. If a character acts out of character, you must adjust the scene to fit their internal truth.
- **Output File:** `data/scenario_scenes.json` (format: `{"scenes": [{"scene_id": 1, "title": "...", "location": "...", "characters_present": [], "emotional_beat": "...", "summary": "...", "anecdotes": []}]}`)

## Handling Modifications
If the flag contains `REWRITE_...` or `VERIFY_PERSONALITY`:
1. Read the user's instructions in the QA flag.
2. Regenerate only the specific step or item requested (e.g., rewrite just Scene 3, or rewrite the Synopsis).
3. Ensure downstream consistency (e.g., if chapters change, scenes might need an update later).
