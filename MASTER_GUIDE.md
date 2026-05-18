# 🗺️ Architecture 3.0 — Master Overview

> **Read this first. Then go to the right doc for what you need.**
>
> - **Human starting a comic?** → [`HOW_TO_MAKE_A_COMIC.md`](HOW_TO_MAKE_A_COMIC.md)
> - **AI agent picking up a task?** → [`AGENT_GUIDE.md`](AGENT_GUIDE.md) + [`AGENT_HANDOFF.md`](AGENT_HANDOFF.md)
> - **Starting a brand-new project?** → [`init_project_protocol.md`](init_project_protocol.md)

**Core principle:** Sequential. Approve one phase before starting the next. Changes cascade downstream.

---

## The Pipeline in 30 Seconds

| Phase | What happens | Key output |
|-------|-------------|------------|
| **Pre** | Customize pipeline files to your project | `pipelines/` edited |
| **0** | Free-form world-building conversation | `data/lore.json`, `data/scenario.json` |
| **1** | AI distributes scenes across pages | `data/pages.json` |
| **1.5** | AI builds character intro pages | `data/intro_pages.json` |
| **2** | AI breaks pages into panels + angles | `data/panels.json` |
| **3** | AI writes all dialogue + captions | `data/script.json` |
| **4/5** | AI generates panel artwork (in AI chat) | `data/images/page_N/panel_N.png` |
| **6** | Human composites pages in the Assembly tab | Final pages |

---

## 📁 Project Structure

```
architecture 3.0/
├── app/              ← Comic Studio dashboard (cd app && npm run dev → localhost:5173)
├── data/             ← All JSON outputs, flat
├── qa/               ← All QA reports by phase name
├── pipelines/        ← Agent instruction files per phase
├── docs/             ← Per-phase agent reference docs
├── AGENT_GUIDE.md    ← Full technical reference for AI agents
├── AGENT_HANDOFF.md  ← Current session state (data status, pending tasks)
└── HOW_TO_MAKE_A_COMIC.md  ← Step-by-step human guide
```

---

## 📊 Production Status Tags

The `PRODUCTION_STATUS.md` file at the root acts as your Kanban board.

| Tag | Meaning |
|-----|---------|
| `[TODO]` | Not started |
| `[IN PROGRESS]` | Currently generating |
| `[REVIEW]` | Needs your review in the app |
| `[APPROVED]` | Locked. Do not modify. |

---

## 🔄 The Universal QA Loop (applies to every phase)

1. **Generate** — AI writes output to `data/`
2. **Review** — Open Comic Studio, check the relevant tab
3. **Approve** → move to next phase
4. **Flag** → click 🚩, fill the drawer, export QA report → `qa/[phase]/`
5. **Fix** → tell AI: "Apply my modifications" → AI updates only flagged items
6. Repeat from step 2

---

## 📁 Project Structure

```
architecture 3.0/
├── app/              ← Comic Studio dashboard (cd app && npm run dev → localhost:5173)
├── data/             ← All JSON outputs, flat
├── qa/               ← All QA reports by phase name
├── pipelines/        ← Agent instruction files per phase
├── docs/             ← Per-phase agent reference docs
├── AGENT_GUIDE.md    ← Full technical reference for AI agents
└── HOW_TO_MAKE_A_COMIC.md  ← Step-by-step human guide
```

---

## 📊 Production Status Tracking

The `PRODUCTION_STATUS.md` file at the root acts as your Kanban board.

| Tag | Meaning |
|-----|---------|
| `[TODO]` | Not started |
| `[IN PROGRESS]` | Currently generating |
| `[REVIEW]` | Needs your review in the app |
| `[APPROVED]` | Locked. Do not modify. |

Update it as you move through phases, or ask the AI to do it.

---

## 🔄 The Universal Modifications Loop

At every phase, the same loop applies:

1. **Generation:** The AI generates the phase output (a JSON file in `data/`).
2. **Review:** Open the Comic Studio app (`cd app && npm run dev`) and review the relevant tab.
3. **Approve:** If everything is correct, move to the next phase.
4. **Flag:** If you want changes, click 🚩 on any element in the app. Fill in the QA drawer and click **Export QA Report** → saved to `qa/[phase]/`.
5. **Regeneration:** Tell the AI: **"Apply my modifications."** The AI reads the QA report and rewrites only the flagged elements.
6. Repeat until the phase is approved.

---

## 🛤️ The Production Order

### 🚀 Pre-Phase: Project Initialization

*Shape the blank template to your story.*

- **Action:** Open a chat, provide a story brief (genre, tone, protagonist), and say **"Execute Project Initialization Protocol."**
- **Result:** The AI edits all `[ACTION REQUIRED]` placeholders in `pipelines/` so the rules fit your project.
- Creates `PRODUCTION_STATUS.md`.

---

### 📖 Phase 0: Pre-Production

*The bedrock of the story.*

> ⚠️ **THIS PHASE IS MANUAL.** Free-form conversation with the AI. No automated script.

- **Output:** `data/lore.json`, `data/scenario.json`
- **Review in app:** 🌍 Lore & Story tab
- **QA reports:** `qa/lore/`
- **Agent doc:** `docs/phase_0_lore.md`

> 📝 **After approval:** Open `pipelines/pacing_instructions.md` and confirm scene-type weights match your story's actual scenes.

---

### 📋 Phase 1: Pacing & Pagination

*Scenes → Pages*

- **Action:** AI distributes scenes across pages based on dramatic weight.
- **Output:** `data/pages.json`
- **Review in app:** 📋 Pacing tab
- **QA reports:** `qa/pacing/`
- **Agent doc:** `docs/phase_1_pacing.md`

---

### 🎭 Phase 1.5: Character Introductions

*Standalone introductory pages.*

- **Action:** AI builds dedicated intro pages for each main character (structure + script in one pass).
- **Output:** `data/intro_pages.json`
- **Review in app:** 🎭 Characters tab
- **QA reports:** `qa/characters/`
- **Agent doc:** `docs/phase_1b_characters.md`

> ⚠️ **After approval:** Update `pipelines/generation_instructions.md` with your project's visual style baseline and character references.

---

### 📐 Phase 2: Page Structuring

*Pages → Panels*

- **Action:** AI breaks each page into 3–5 panels with camera angles, actions, and structural tags.
- **Output:** `data/panels.json`
- **Review in app:** 📐 Panel Structure tab (framing dropdown edits save instantly)
- **QA reports:** `qa/structure/`
- **Agent doc:** `docs/phase_2_structure.md`

---

### ✍️ Phase 3: Scripting

*Dialogue & Captions*

- **Action:** AI reads panel actions and writes all dialogue, thoughts, and captions. Follows tone rules from `data/lore.json`.
- **Output:** `data/script.json`
- **Review in app:** ✍️ Script tab (inline text edits save instantly)
- **QA reports:** `qa/script/`
- **Agent doc:** `docs/phase_3_script.md`

---

### 🖼️ Phase 4 & 5: Image Generation & Surgical Review

*Generating the Art*

- **Phase 4:** AI converts panel actions + framing into optimized image prompts and generates artwork panel by panel.
- **Phase 5:** Visual review loop. Flag visual errors (`[IMG2IMG_FIX]` or `[REGENERATE]`). Repeat until every panel is locked.
- **Output:** `data/images/page_N/panel_N.png`
- **Review:** In AI chat directly (no app tab)
- **QA reports:** `qa/images/`
- **Agent doc:** `docs/phase_4_images.md`

---

### 🧩 Phase 6: Assembly

*Final composite pages.*

- **Action:** Panel images composited into pages. Speech bubbles and captions added using `data/script.json`.
- **Output:** `data/assembly/pages/`
- **Review in app:** 🧩 Assembly tab
- **Agent doc:** `docs/phase_6_assembly.md`
