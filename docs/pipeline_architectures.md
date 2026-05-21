# Comic Studio 3.0: Pipeline Flow Architectures

This guide describes the data flow, agent interactions, and user interface controls for each page of the app (excluding the Scenario page).

---

## 1. Phase 0.5: Character Hub & Location Sheets

The Character Hub builds the baseline assets and behavioral models for character personality, visual appearance, scene moods, and scene geography. It translates raw concepts into deterministic profiles.

### Data Schema Overview
- **Visual Turnarounds:** Output is a markdown profile `global_characters/[Name]/canonical_visual.md` and reference turnarounds in `global_characters/[Name]/examples/turnarounds/`.
- **Personality Signatures:** Output is `global_characters/[Name]/personality_signature.md` with 12 distinct emotional state visuals in `characters/[Name]/examples/emotional_states/`.
- **Mood Simulation:** Simulates character emotional paths across the scenario scenes, exporting to `data/character_moods.json`.
- **Geographic location sheets:** Maps scene settings and coordinates, exporting to `data/geography.json`.

### Pipeline Flow Diagram

```mermaid
flowchart TD
    %% Base Data Sources
    LORE["data/lore.json"] -.-> S1
    LORE -.-> S2
    LORE -.-> S3
    LORE -.-> S4
    
    BASE_CHAR["global_characters/Name/presentation.json"] -.-> S1
    BASE_CHAR -.-> S2

    %% Step 1: Visual Signatures
    subgraph "Step 1: Visual Signatures"
        UI1("Characters Hub UI: Visuals Tab") --> S1["global_characters/Name/canonical_visual.md"]
        S1 --> UI1
        S1 -- "Gen Turnaround (QA Flag)" --> Agent1(("Visual Signature Agent"))
        Agent1 --> T_IMG["global_characters/Name/examples/turnarounds/*.png"]
    end

    %% Step 2: Personality Signatures
    subgraph "Step 2: Personality Signatures"
        UI2("Characters Hub UI: Personality Tab") --> S2["global_characters/Name/personality_signature.md"]
        S2 --> UI2
        S2 -- "Gen Emotional States (QA Flag)" --> Agent2(("Personality Agent"))
        Agent2 --> E_IMG["global_characters/Name/examples/emotional_states/*.png"]
    end

    %% Step 3: Mood Simulation
    subgraph "Step 3: Mood Simulation"
        UI3("Characters Hub UI: Mood Arc Editor") --> S3["data/character_moods.json"]
        S3 --> UI3
        S3 -- "Run Mood Simulation" --> Agent3(("Mood Simulation Agent"))
        Agent3 --> S3
    end

    %% Step 4: Geographic Location Sheets
    subgraph "Step 4: Geography & Location Sheets"
        UI4("Characters Hub UI: Geography Tab") --> S4["data/geography.json"]
        S4 --> UI4
        S4 -- "Gen Location Reference" --> Agent4(("Location Sheet Agent"))
        Agent4 --> L_IMG["global_characters/locations/*.png"]
    end

    %% Styling
    classDef file fill:#f9f,stroke:#333,stroke-width:2px;
    classDef agent fill:#ff9,stroke:#333,stroke-width:2px;
    classDef baseData fill:#bbf,stroke:#333,stroke-width:1px,stroke-dasharray: 5 5;
    classDef ui fill:#dfd,stroke:#333,stroke-width:2px;
    
    class S1,S2,S3,S4,T_IMG,E_IMG,L_IMG file;
    class Agent1,Agent2,Agent3,Agent4 agent;
    class LORE,BASE_CHAR baseData;
    class UI1,UI2,UI3,UI4 ui;
```

---

## 2. Phase 1 & 1.5: Pacing & Character Intro (Parallel)

Once the core script breakdown (`data/scenario_scenes.json`) is approved, pagination runs in parallel with dedicated character intro generation. Both outputs must be finalized before structural panel division occurs.

### Data Schema Overview
- **Intro Pages:** Maps splash layout types to exact panel numbers for main characters (`data/intro_pages.json`).
- **Pacing List:** Maps scenes onto physical pages with anecdote indicators, totals, and focusing descriptions (`data/pages.json`).

### Pipeline Flow Diagram

```mermaid
flowchart TD
    %% Inputs
    LORE["data/lore.json"] -.-> S_INTRO
    SCENES["data/scenario_scenes.json"] -.-> AgentP
    CHAR_SIG["global_characters/Name/personality_signature.md"] -.-> S_INTRO

    %% Phase 1: Character Intros
    subgraph "Phase 1: Character Introductions"
        S_INTRO["data/intro_pages.json"] -- "Gen Intro Pages (QA Flag)" --> AgentI(("Intro Page Agent"))
        AgentI --> S_INTRO
        UI_INTRO("Characters Intro UI: Layout & Captions") --> S_INTRO
        S_INTRO --> UI_INTRO
    end

    %% Phase 1.5: Pacing & Pagination
    subgraph "Phase 1.5: Pacing & Pagination"
        S_PAGES["data/pages.json"] -- "Gen Pages & Pagination (QA Flag)" --> AgentP(("Pacing Agent"))
        AgentP --> S_PAGES
        UI_PACE("Pacing UI: Focus & Anecdote Checks") --> S_PAGES
        S_PAGES --> UI_PACE
    end

    %% Downstream
    S_INTRO --> S_PANELS["data/panels.json (Phase 2)"]
    S_PAGES --> S_PANELS

    %% Styling
    classDef file fill:#f9f,stroke:#333,stroke-width:2px;
    classDef agent fill:#ff9,stroke:#333,stroke-width:2px;
    classDef baseData fill:#bbf,stroke:#333,stroke-width:1px,stroke-dasharray: 5 5;
    classDef ui fill:#dfd,stroke:#333,stroke-width:2px;
    
    class S_INTRO,S_PAGES,S_PANELS file;
    class AgentI,AgentP agent;
    class LORE,SCENES,CHAR_SIG baseData;
    class UI_INTRO,UI_PACE ui;
```

---

## 3. Phase 2: Panel Structuring

This phase divides page focal descriptions into individual panel layout structures. It lists framing, characters present, visual actions, and structural metadata tags.

### Camera Framing & Custom Overrides
- **Camera Angles:** Restricts values to standard options (`Close-up`, `Wide Establishing Shot`, `POV shot`, etc.).
- **Live Overrides:** Users can change panel framing directly in the dropdown. This is saved instantly to the database and does not trigger QA reports.

### Pipeline Flow Diagram

```mermaid
flowchart TD
    %% Inputs
    LORE["data/lore.json"] -.-> AgentS
    PAGES["data/pages.json"] -.-> AgentS
    INTROS["data/intro_pages.json"] -.-> AgentS

    %% Structuring Pipeline
    subgraph "Phase 2: Page Structuring"
        PANELS["data/panels.json"] -- "Gen Structuring (QA Flag)" --> AgentS(("Structuring Agent"))
        AgentS --> PANELS
        
        %% UI Interaction & Local Override
        UI_STRUCT("Panel Structure UI: Framing & Action Grid") --> PANELS
        PANELS --> UI_STRUCT
        UI_OVERRIDE("Framing Dropdowns: Live Edit") -- "Instantly Override (No QA)" --> PANELS
    end

    %% Downstream
    PANELS --> SCRIPT["data/script.json (Phase 3)"]

    %% Styling
    classDef file fill:#f9f,stroke:#333,stroke-width:2px;
    classDef agent fill:#ff9,stroke:#333,stroke-width:2px;
    classDef baseData fill:#bbf,stroke:#333,stroke-width:1px,stroke-dasharray: 5 5;
    classDef ui fill:#dfd,stroke:#333,stroke-width:2px;
    
    class PANELS,SCRIPT file;
    class AgentS agent;
    class LORE,PAGES,INTROS baseData;
    class UI_STRUCT,UI_OVERRIDE ui;
```

---

## 4. Phase 3: Scripting

Generates and validates dialogue overlays, thought bubbles, and narrator captions. The output is referenced permanently for downstream layout and lettering.

### Critical Rules
- **Unique Dialogue ID:** Structured as `d_[page]_[panel]_[index]` (e.g., `d_2_3_1`). These IDs are permanent.
- **Modifications Constraints:** Renumbering on deletions or edits is prohibited to avoid breaking layout coordinates.

### Pipeline Flow Diagram

```mermaid
flowchart TD
    %% Inputs
    LORE["data/lore.json"] -.-> AgentSc
    PANELS["data/panels.json"] -.-> AgentSc
    SCENES["data/scenario_scenes.json"] -.-> AgentSc

    %% Scripting Pipeline
    subgraph "Phase 3: Scripting & Lettering Script"
        SCRIPT["data/script.json"] -- "Gen Dialogues (QA Flag)" --> AgentSc(("Scripting Agent"))
        AgentSc --> SCRIPT
        
        %% UI Interactions
        UI_SCRIPT("Script UI: Dialogue Cards") --> SCRIPT
        SCRIPT --> UI_SCRIPT
        UI_OVERRIDE("Inline Edits: Ctrl+Enter") -- "Direct Text Override" --> SCRIPT
    end

    %% Downstream
    SCRIPT --> IMAGE_GEN["Image Prompt Context (Phase 4/5)"]
    SCRIPT --> ASSEMBLY["Lettering Overlay (Phase 6)"]

    %% Styling
    classDef file fill:#f9f,stroke:#333,stroke-width:2px;
    classDef agent fill:#ff9,stroke:#333,stroke-width:2px;
    classDef baseData fill:#bbf,stroke:#333,stroke-width:1px,stroke-dasharray: 5 5;
    classDef ui fill:#dfd,stroke:#333,stroke-width:2px;
    
    class SCRIPT file;
    class AgentSc agent;
    class LORE,PANELS,SCENES baseData;
    class UI_SCRIPT,UI_OVERRIDE ui;
```

---

## 5. Phase 4 & 5: Image Generation & Surgical Review

Generates high-fidelity artwork matching the panel breakdown. Features a manual chat-driven review loop for modifying and fixing individual panels before compositing.

### Image prompt construction
- Prompts are built by concatenating style baselines, framing translations, panel actions, character descriptions, and tag descriptors.
- Modifications trigger either targeted `[IMG2IMG_FIX]` (denoising 0.4–0.6) or complete `[REGENERATE]` instructions.

### Pipeline Flow Diagram

```mermaid
flowchart TD
    %% Inputs
    LORE["data/lore.json"] -.-> Prompter
    PANELS["data/panels.json"] -.-> Prompter
    SCRIPT["data/script.json"] -.-> Prompter
    BASELINE["pipelines/generation_instructions.md"] -.-> Prompter

    %% Generation and review loop
    subgraph "Phase 4 & 5: Prompting & Surgical Fixes"
        Prompter["Prompt Construction: Style + Framing + Action + Char Refs"] --> AgentGen(("Image Generation Agent"))
        AgentGen --> IMGS["data/images/page_N/panel_N.png"]
        AgentGen --> LOGS["data/images/page_N/prompts.json"]
        
        %% Visual review QA loop
        IMGS --> UI_REVIEW("Human Chat Review: Inspect Visuals")
        UI_REVIEW -- "Composition/Framing Error" --> QA_REGEN["qa/images/ - [REGENERATE]"] --> Prompter
        UI_REVIEW -- "Detail/Face Error" --> QA_I2I["qa/images/ - [IMG2IMG_FIX] Strength 0.4-0.6"] --> Prompter
    end

    %% Styling
    classDef file fill:#f9f,stroke:#333,stroke-width:2px;
    classDef agent fill:#ff9,stroke:#333,stroke-width:2px;
    classDef baseData fill:#bbf,stroke:#333,stroke-width:1px,stroke-dasharray: 5 5;
    classDef ui fill:#dfd,stroke:#333,stroke-width:2px;
    
    class IMGS,LOGS file;
    class AgentGen agent;
    class LORE,PANELS,SCRIPT,BASELINE baseData;
    class UI_REVIEW,QA_REGEN,QA_I2I,Prompter ui;
```

---

## 6. Phase 6: Page Assembly

The final layout phase where panel frames and lettering dialogue bubbles are composited onto pages. It provides a visual layout editor and a dedicated QA Review Board.

### Studio Editor Capabilities
- **Page Assembly:** Drag-and-drop components, placement sizing, ordering overlays, editing lettering text styling and vector tails.
- **QA Review Board:** Sub-view for flagging panels, assigning modification types, and exporting QA markdown logs.

### Pipeline Flow Diagram

```mermaid
flowchart TD
    %% Inputs
    IMGS["data/images/page_N/*.png"] -.-> CANVAS
    SCRIPT["data/script.json"] -.-> BUBBLES
    PANELS["data/panels.json"] -.-> CANVAS

    %% Assembly Workspace
    subgraph "Phase 6: Assembly Studio Workspace"
        subgraph "Page Assembly View"
            CANVAS["Interactive Page Canvas: 800x1131px"] --> LAYOUT["data/assembly/pages/page_N/layout.json"]
            LAYOUT --> CANVAS
            BUBBLES["Dialogue/Caption Overlay"] --> LAYOUT
            LAYOUT --> BUBBLES
            
            DRAG["react-rnd: Drag, Resize, Z-Index"] --> CANVAS
            PROPS["Properties Panel: Styles & Bubble Tails"] --> BUBBLES
            EXPORT[Export Layout Button] --> LAYOUT
        end

        subgraph "QA Review Board View"
            QA_LIST["Page Panels List"] --> FLAG_BTN["Flag Issue Button"]
            FLAG_BTN --> MOD_CARD["Flagged Modifications Form"]
            MOD_CARD --> QA_EXPORT["Export QA Report Button"]
            QA_EXPORT --> QA_REP["qa/assembly/qa_report_*.md"]
        end
    end

    %% Final Outputs
    LAYOUT --> RENDER["Page Renderer"]
    IMGS -.-> RENDER
    RENDER --> FINAL["data/assembly/pages/page_N/final.png"]

    %% Styling
    classDef file fill:#f9f,stroke:#333,stroke-width:2px;
    classDef agent fill:#ff9,stroke:#333,stroke-width:2px;
    classDef baseData fill:#bbf,stroke:#333,stroke-width:1px,stroke-dasharray: 5 5;
    classDef ui fill:#dfd,stroke:#333,stroke-width:2px;
    
    class LAYOUT,FINAL,QA_REP file;
    class RENDER agent;
    class IMGS,SCRIPT,PANELS baseData;
    class CANVAS,BUBBLES,DRAG,PROPS,EXPORT,QA_LIST,FLAG_BTN,MOD_CARD,QA_EXPORT ui;
```
