# Reference: Character Relationship Tree Graph Architecture

This document serves as the technical reference for the interactive character relationship tree graph in the **Scenario Phase (Signatures Tab)**. It describes the design, key libraries, file structure, data schemas, and edge styling rules.

---

## 1. Overview & Purpose

The **Signatures Tab** visualizes the relationships and dynamic interactions among scenario characters. Instead of a static grid, characters are modeled as **graph nodes** and their connections (`network` fields) as **graph edges**. This allows human writers and AI agents to quickly inspect, analyze, and edit character networks at a glance.

---

## 2. Technology Stack & Key Libraries

The visualization is implemented in the frontend application using:
- **React Flow (`@xyflow/react`)**: Renders the node-edge canvas with pan, zoom, and selection features.
- **Dagre (`dagre`)**: Computes automatic layouts hierarchically using a directed graph algorithm.
- **Tailwind CSS v4 + HSL Tokens**: Styles nodes, handles, and canvas controls inline or via class tokens matching the project’s dark-mode design system.

---

## 3. File Structure

- **[SignaturesTab.tsx](file:///c:/Users/Users/Desktop/Emy%20christmass/architecture%203.0/app/src/components/phases/scenario/tabs/SignaturesTab.tsx)**
  - Manages graph states, converts signatures database into React Flow nodes and edges, deduplicates bidirectional links, executes layout computation via Dagre, and mounts the details sidebar.
- **[CharacterNode.tsx](file:///c:/Users/Users/Desktop/Emy%20christmass/architecture%203.0/app/src/components/phases/scenario/tabs/CharacterNode.tsx)**
  - A custom React Flow node component representing the character card. It exposes hidden connection handles (`source` and `target`) on all four boundaries.
- **[SignatureDetailsPanel.tsx](file:///c:/Users/Users/Desktop/Emy%20christmass/architecture%203.0/app/src/components/phases/scenario/tabs/SignatureDetailsPanel.tsx)**
  - Renders the details sidebar when a character node is selected, enabling users to edit age, gender, role, personality traits, and add/edit relationship networks.

---

## 4. Data Flow & Schema

### Data Sources
Character signatures are stored in decentralized JSON files: `data/characters/[Name]/personality_signature.json`.
At runtime, the app reads these files, aggregates them in-memory, and provides them to the layout canvas as `PersonalitySignatureData`.

### Type Definitions
```typescript
interface CharacterLink {
  target_character: string;
  relationship_type: 'friend' | 'family' | 'lover';
  relationship_subtype: string;  // e.g. "brother", "best", "colleague"
  dynamic: string;               // Text explanation of their dynamic
}

interface CharacterSignature {
  age: string;
  gender: string;
  role: string;
  network?: CharacterLink[];
  general_personality: string;
  loves: string[];
  hates: string[];
  verbal_habits: string;
  writing_notes: string;
}

interface PersonalitySignatureData {
  signatures: { [characterName: string]: CharacterSignature };
}
```

---

## 5. Layout & Position Algorithm (Dagre)

Automatic layout is performed in [SignaturesTab.tsx](file:///c:/Users/Users/Desktop/Emy%20christmass/architecture%203.0/app/src/components/phases/scenario/tabs/SignaturesTab.tsx) using the `layoutNodes` function:
1. A new `dagre.graphlib.Graph` is initialized.
2. Nodes are added with a fixed size of `260` width and `180` height.
3. Directed edges are defined using source and target character names.
4. The graph is laid out hierarchically:
   - `rankdir: 'TB'` (Top-to-Bottom flow orientation)
   - `ranksep: 80` (Vertical separation distance)
   - `nodesep: 60` (Horizontal sibling separation distance)
5. Layout results are translated back into React Flow coordinates.
6. A **Re-layout** button allows users to reset the node positions back to the canonical Dagre arrangement if they drag nodes around.

---

## 6. Edge Styling & Bidirectional Deduplication

### Deduplication Logic
Since relationship links are defined on both characters (e.g., A lists B as a friend, and B lists A as a friend), the graph deduplicates edges to keep the screen clean.
- Bidirectional links are merged into a single visual edge.
- If both directions define subtypes, the label is combined: e.g., `"brother / sister"` or `"best friend / mentor"`.
- If only one direction is defined, it uses the single label.

### Color-Coding Rules
Visual styles for edges are mapped based on relationship categories:

| Relationship Type | Visual Color | Line Width | Special Styling |
|-------------------|--------------|------------|-----------------|
| **Family** | `#3b82f6` (Blue) | `3px` | Solid line |
| **Lover** | `#ef4444` (Red) | `3px` | Animated dash flow |
| **Friend** | `#22c55e` (Green) | Variable (see below) | Solid or Dashed |

### Friend Closeness Map
The line weight for friend connections dynamically reflects their proximity:
- **`best`**: `3px` solid
- **`very close`**: `2px` solid
- **`normal` or empty**: `1px` solid
- **`far`**: `0.2px` thin dashed line (`strokeDasharray: '6 4'`)

---

## 7. Saving Modifications

When users or agents edit fields inside [SignatureDetailsPanel.tsx](file:///c:/Users/Users/Desktop/Emy%20christmass/architecture%203.0/app/src/components/phases/scenario/tabs/SignatureDetailsPanel.tsx):
1. State changes are sent upwards to `onSaveSignatures`.
2. The React wrapper triggers a write request to the backend server.
3. The server updates the decentralized files under `data/characters/[Name]/personality_signature.json`.
4. Nodes and edges are recomputed dynamically in-memory without reloading the page.
