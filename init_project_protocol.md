# 🚀 Project Initialization Protocol (The "Zero Phase")

**Agent Role:** Project Architect & Pipeline Tailor
**Objective:** Before starting any new project, customize the blank "Architecture 3.0" pipeline files in `pipelines/` to fit the specific needs, lore, and tone of the new comic project.

---

## When to Run This Protocol

Run this protocol **immediately after** creating a new project folder from the `Architecture 3.0` template and **before** starting Phase 0 (Pre-Production).

## How to Launch

The user will provide a brief summary of the new project (e.g., "This is a gritty sci-fi detective story" or "This is a romantic comedy set in a bakery").
The user will say: **"Execute Project Initialization Protocol."**

---

## The Pipeline Customization Steps

When triggered, perform the following actions across the `pipelines/` folder:

### 1. Define Scene Types & Tone Rules

Read the user's project summary and determine 3–4 primary scene types that will dominate the narrative (e.g., *Interrogation Scenes*, *Chase Sequences*, *Quiet Deduction Scenes*).

- **Action:** Edit `pipelines/scripting_instructions.md`. Find the `[SCENE_TYPE_1]`, `[SCENE_TYPE_2]` placeholders under "Tone by Scene Type" and replace them with project-specific scene types, including custom pacing and dialogue rules for each.

### 2. Define Custom Structural Tags & Protocols

Determine what special narrative devices this project needs. Does it have flashbacks? Telepathic communication? A narrator?

- **Action:** Edit `pipelines/structuring_instructions.md` and `pipelines/scripting_instructions.md`. Replace the `[PROJECT_SPECIFIC_PROTOCOL]` and `[PROJECT_DETAIL]` placeholders with exact tag definitions (e.g., `[FLASHBACK]`, `[TELEPATHY]`) and rules on how they should be handled in panels and dialogue.

### 3. Update Pacing Rhythms

Determine how page allocation should be distributed for this specific genre.

- **Action:** Edit `pipelines/pacing_instructions.md`. Replace the generic scene type examples under "Assign Pages to Scenes" with project-specific examples based on the user's summary.

### 3b. Fill Pacing `[ACTION REQUIRED]` Blocks

The pacing instructions file contains four `⚙️ [ACTION REQUIRED — Project Initialization]` placeholder blocks that **must** be filled:

- **High page allocation block** — List 2–3 scene types that deserve the most pages (e.g., *"The climactic argument"*, *"The airport crisis"*).
- **Medium page allocation block** — List 2–3 moderately weighted scene types (e.g., *"Character interaction moments"*).
- **Low page allocation block** — List 2–3 transitional/lighter scene types (e.g., *"Short comedic beats"*, *"Location transition cuts"*).
- **Tone Note block** — Replace the generic note with a one-sentence description of the emotional register (e.g., *"This is a family comedy — never let the pacing feel heavy."*).

> ⚠️ Do not leave any `[ACTION REQUIRED]` block unfilled. Generic placeholders produce generic pacing.

### 4. Initialize Production Status Board

- **Action:** Create `PRODUCTION_STATUS.md` in the root directory. Initialize it with a Kanban-style checklist for all phases (Phase 0 through Phase 6) using `[TODO]`, `[IN PROGRESS]`, `[REVIEW]`, and `[APPROVED]` tags.

---

## Completion

Once the `pipelines/` files have been customized, output a brief report to the user summarizing the new Scene Types and Protocols added, and confirm the project is ready for **Phase 0: Pre-Production**.

---

> 📖 For the full data file reference, phase schemas, and QA system, see [`MASTER_GUIDE.md`](MASTER_GUIDE.md).
