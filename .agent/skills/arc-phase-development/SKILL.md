---
name: arc-phase-development
description: Design, implement, and document a new phase for the Architecture 3.0 comic studio app. Use when adding a new pipeline phase, a new UI tab, or extending the agent workflow for this project.
risk: low
source: local
---

# ARC 3.0 — Phase Development Skill

Use this skill whenever you are adding a new phase to the Architecture 3.0 framework:
a new pipeline, a new UI tab in the app, new agent instructions, or any combination.

It encodes the methodology proven in Phase 0.5 (Characters Hub) — the design decisions,
the sequencing, the guardrails, and the patterns to follow.

---

## Before you touch any code

Read these files first. They define the project's current state:

```
MASTER_GUIDE.md         — phase map, data flow, QA tag system
FILE_GUIDE.md           — what every file does and where it lives
pipelines/scripting_instructions.md — active mandates for all scripting agents
app/src/App.tsx         — phase routing (switch statement)
app/src/components/layout/PhaseTabBar.tsx — tab bar with PhaseId union type
app/src/components/phases/ — existing phase components (follow their patterns)
app/src/hooks/useJsonFile.ts — the standard data persistence hook
```

Do not invent structure. Extend what already exists.

---

## Step 1 — Define the phase before writing anything

Answer these questions before touching a file:

1. **What is the user's job in this phase?**
   Define it in one sentence. If you can't, the phase isn't ready to implement.

2. **What does this phase produce?**
   Name the exact output files (JSON, markdown, images). What path do they live at?

3. **What does this phase consume?**
   What must exist before this phase can run? Define the dependency chain.

4. **Where does this phase sit in the pipeline?**
   Which phases come before it? Which phases depend on its output?

5. **What is the agent's role vs. the user's role?**
   Agent generates → user reviews, flags, edits inline. Never reverse this.

6. **What must this phase NOT do?**
   Identify downstream concerns this phase could pollute if not constrained.
   Example: Phase 0.5 must not generate clothing references — costume is Phase 1.

Write a short implementation plan and confirm it before proceeding.

---

## Step 2 — Pipeline files first

Create the pipeline markdown(s) in `pipelines/` before the UI.

Pipeline files are instructions for agents, not for the app.
The app reflects what the pipeline produces — it does not drive the pipeline.

### Pipeline file structure

```markdown
# Pipeline [NN] — [Name]

**Phase:** [phase id]
**Output target:** [exact file paths the agent writes]
**Triggered by:** [what the user says/does to activate this]

---

## What This Pipeline Does
[One paragraph — the job, not the steps]

## Input Requirements
[Exact file paths that must exist. If missing → stop and ask.]

## Step 1 — [First action]
...

## Step N — Output Summary
[Checklist of exactly what was produced]

## Flag Handling
[What to do when the user flags output in the UI for revision]
```

### Pipeline design rules

- **The agent reads, not the user.** Never require the user to provide information
  the agent can read from the project files.
- **Translation, not description.** When a pipeline produces a visual from a source,
  it translates the source into the project's world — it does not describe the source.
  Example: Pipeline 05 reads reference photos → extracts identity anchors → maps them
  through the lore's world rules. The user types nothing.
- **Isolate concerns between phases.** If something is decided in Phase N,
  Phase N-1 must not generate material that locks it in.
  Use explicit warnings in the pipeline doc: `⚠ No costume section in this document.`
- **Flag handling is always surgical.** The user flags one item → the agent fixes
  that one item only. Never regenerate the whole phase because one piece was wrong.

---

## Step 3 — Data model

Define the JSON schema before building the UI.

Data files live in `data/` (project-specific) or `global_characters/` (character-agnostic).

```json
{
  "_schema_version": "1.0",
  "_description": "What this file contains and who writes it",
  "key": "value"
}
```

The existing `/api/save` and `/api/load` endpoints in `vite.config.ts` handle all JSON
read/write via the `useJsonFile` hook. Use them — do not add new backend logic unless
you need a fundamentally different data type (e.g. binary images need `/api/load-image`).

If you do add a new API endpoint to `vite.config.ts`:
- Place it **before** any existing `startsWith` handler that would swallow its URL
- Follow the existing middleware pattern (read body → parse → write → respond)
- Restart the dev server after config changes (HMR does not reload config)

---

## Step 4 — UI component

Create the phase component at:
`app/src/components/phases/[phase-folder]/[PhaseName]Phase.tsx`

And its CSS at:
`app/src/styles/[phase-name].css`

### Follow the existing component pattern

```tsx
import { useJsonFile } from '@/hooks/useJsonFile';
import { exportQaReport } from '@/utils/qaExport';
import '../../../styles/[phase-name].css';

const [Phase]Phase: React.FC = () => {
  const { data, save } = useJsonFile<YourType>('data/your-file.json');
  // ...
};
```

### Standard sub-tab layout (3 concerns = 3 sub-tabs)

If the phase has multiple concerns, use sub-tabs inside the main panel.
See `CharacterHubPhase.tsx` for the reference pattern:
- Left sidebar: list of items (characters, scenes, pages...)
- Right panel: sub-tab bar + content area
- Right edge: QA drawer (slides open on flag)

### QA flag pattern

Every editable or generated element must have a flag button.
Flags are **surgical** — they identify the exact item for revision:

```tsx
<button onClick={() => openQa(`[context description]`, '[FLAG_TYPE]:[target]')}>
  🚩
</button>
```

Flag types follow the convention: `VERB_NOUN` (e.g. `REWRITE_VISUAL`, `REGENERATE_EMOTION:angry`).

### Inline editing

Users edit generated data directly in the UI — no separate edit mode.
Save on explicit button press, not on blur. Show save confirmation briefly.
Use `useJsonFile.save()` for atomic writes.

---

## Step 5 — Wire into the app

**`PhaseTabBar.tsx`:**
```tsx
// 1. Add to the PhaseId union type
type PhaseId = 'lore' | 'char-hub' | 'your-phase' | ...;

// 2. Add to the PHASES array in position order
{ id: 'your-phase', label: 'Your Phase Label', icon: '🎯' }
```

**`App.tsx`:**
```tsx
import YourPhase from './components/phases/your-folder/YourPhase';

// In renderPhaseContent switch:
case 'your-phase': return <YourPhase />;
```

---

## Step 6 — Update documentation

After the phase is implemented and tested, update:

| File | What to add |
|------|-------------|
| `MASTER_GUIDE.md` | New phase in phase map, data flow chain, QA tag reference |
| `FILE_GUIDE.md` | New data files, new pipeline files, new app tab |
| `pipelines/scripting_instructions.md` | Any new mandate for scripting agents |

If the phase produces data that scripting agents must read before writing dialogue,
add a mandatory reading rule to `scripting_instructions.md`:

```markdown
## Mandatory: Read [file] before [action]

Before [specific action], the agent MUST read `data/[file].json`.
Failure to do so is an error in the pipeline, not an acceptable shortcut.
```

---

## Step 7 — Test in the browser

Before declaring the phase complete, verify in the running app (`http://localhost:5173`):

- [ ] New tab appears in the correct position in the tab bar
- [ ] Empty state renders correctly when no data exists
- [ ] Data populates correctly when the expected JSON files exist
- [ ] Inline edits write to disk (check the file, not just the UI)
- [ ] Sub-tab switching works without state leaking between tabs
- [ ] Character/item switching clears the correct local state
- [ ] QA flag drawer opens and closes correctly
- [ ] No console errors

---

## Key design decisions from Phase 0.5 — carry these forward

### The agent reads, the user judges

The user never describes what the agent should produce.
The agent reads the project files, produces output, and the user reviews it.
The UI is a review surface, not a creation surface.

### Identity anchors survive world translation

When translating a real-world source (photos, references) into a project's visual style,
extract identity anchors first (what makes this source recognisable).
Then map each anchor through the world rules.
The output must be: *recognisably the same source, but native to this world.*

### Phase isolation prevents downstream contamination

Each phase produces only what it owns. If Phase A could accidentally define
something that Phase B is supposed to decide, Phase A's pipeline must explicitly
prohibit it — in writing, with a reason:

```
⚠ No costume section in this document.
Clothing is decided in Phase 1 (Character Intros).
This profile covers the body and face only.
```

### Surgical regeneration, not full reruns

When the user flags something as wrong, only that thing is regenerated.
Design pipelines and flag handlers so the scope of revision is always the minimum
necessary. Naming the flag target explicitly (`REGENERATE_EMOTION:angry`, not
`REGENERATE_ALL_EMOTIONS`) enforces this.

### The gap is where drama lives

When defining character psychology (personality signatures, mood arcs),
always represent the gap between what the character feels and what they show.
The `feels` / `shows` distinction in `character_moods.json` is the implementation
of this principle. Every psychology-adjacent pipeline should honour it.

---

## File locations quick reference

```
pipelines/          → agent instruction files (NN_name.md)
data/               → project-specific data (JSON, markdown)
global_characters/  → project-agnostic character files
  [Name]/
    originals/      → reference photos (never modified by agents)
    canonical_visual.md  → written by Pipeline 05
    presentation.md      → written by the user (use _TEMPLATE)
    general_mood.md      → written by the user
  _TEMPLATE/
    presentation.md → template for new characters
app/src/
  components/phases/    → one folder per phase
  styles/               → one CSS file per phase
  hooks/useJsonFile.ts  → data persistence (use this)
  utils/qaExport.ts     → QA report export (use this)
```
