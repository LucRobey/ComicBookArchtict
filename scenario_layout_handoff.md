# Handoff: Relationship Tree for Signatures Tab

> **Mission**: Replace the static card grid in the Signatures tab with an interactive relationship tree graph where character cards are nodes and `network` links are edges.

---

## 1. Project Architecture

This is a **Vite + React 19 + TypeScript + Tailwind CSS v4** app called "Assembly Studio".

| Item | Path |
|------|------|
| **Project root** | `c:\Users\Users\Desktop\Emy christmass\architecture 3.0\` |
| **App root** | `app/` |
| **Package manager** | npm |
| **Dev server** | `npm run dev` (runs on `localhost:5173`) |
| **Design tokens** | CSS custom properties (`--foreground`, `--background`, `--border`, `--surface`, `--accent-primary` = `#3b82f6`, `--foreground-muted`, `--primary`, `--brand`) |
| **Styling approach** | Mix of Tailwind utility classes and custom CSS in `app/src/styles/` |

---

## 2. Key Files You Will Touch

### Primary target (rewrite the card grid into a graph):
- **`app/src/components/phases/scenario/tabs/SignaturesTab.tsx`** (360 lines)
  - Currently renders a card grid + a details panel.
  - Your job: replace the card grid with a React Flow canvas.
  - Keep the details panel (lines 132–354) as-is — it opens when a node is clicked.

### Type definitions (read-only reference):
- **`app/src/types/data.ts`** — Contains `CharacterLink`, `CharacterSignature`, `PersonalitySignatureData`

### Data source (read-only reference):
- **`data/personality_signature.json`** — The actual JSON the app reads at runtime.

### Parent component (read-only reference):
- **`app/src/components/phases/scenario/ScenarioPhase.tsx`** — Mounts `<SignaturesTab>` and passes `signatures`, `onSaveSignatures`, `openQa`.

---

## 3. Data Schema

The data flows in as `PersonalitySignatureData`:

```typescript
interface CharacterLink {
  target_character: string;
  relationship_type: 'friend' | 'family' | 'lover';
  relationship_subtype: string;  // e.g. "brother", "best", "daughter"
  dynamic: string;               // free-text description
}

interface CharacterSignature {
  age: string;
  gender: string;
  role: string;
  relationships?: Record<string, string>;  // LEGACY — may still exist
  network?: CharacterLink[];               // NEW — structured links
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

### Live test data (`data/personality_signature.json`):

```json
{
  "signatures": {
    "CHARACTER_A": {
      "age": "28",
      "gender": "Female",
      "role": "The Reluctant Hero / Analyst",
      "network": [
        {
          "target_character": "CHARACTER_B",
          "relationship_type": "family",
          "relationship_subtype": "brother",
          "dynamic": "Rivalry born of mutual respect. She thinks he's reckless but secretly envies his freedom."
        }
      ],
      "general_personality": "Pragmatic, deeply analytical...",
      "loves": ["Color-coded spreadsheets", "Predictability", "Earl Grey tea"],
      "hates": ["Spontaneous plans", "Being the center of attention", "Loud noises"],
      "verbal_habits": "Often trails off at the end of sentences...",
      "writing_notes": "Never have her act impulsively unless the situation is dire..."
    },
    "CHARACTER_B": {
      "age": "31",
      "gender": "Male",
      "role": "The Maverick / Field Operative",
      "network": [
        {
          "target_character": "CHARACTER_A",
          "relationship_type": "family",
          "relationship_subtype": "sister",
          "dynamic": "Finds her overly rigid but deeply respects her intellect..."
        }
      ],
      "general_personality": "Charming, impulsive, and highly intuitive...",
      "loves": ["Adrenaline", "Breaking the rules", "Vintage cars"],
      "hates": ["Waiting", "Authoritative figures", "Strict schedules"],
      "verbal_habits": "Speaks quickly, uses a lot of slang...",
      "writing_notes": "His dialogue should feel energetic and slightly scattered..."
    }
  }
}
```

---

## 4. Current Component Props

```tsx
interface SignaturesTabProps {
  signatures: PersonalitySignatureData | null;
  onSaveSignatures: (data: PersonalitySignatureData) => void;
  openQa: (type: string, context: string) => void;
}
```

`onSaveSignatures` triggers a full JSON write to `data/personality_signature.json` via the backend API.

---

## 5. Current UI Layout (What Exists Now)

```
┌──────────────────────────────────────────────────┐
│  Title: "Personality Signatures"   [Generate ➔]  │
├──────────────────────────────────────────────────┤
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐            │
│  │CHAR │  │CHAR │  │CHAR │  │CHAR │   ← CARDS   │
│  │  A  │  │  B  │  │  C  │  │  D  │     GRID    │
│  └─────┘  └─────┘  └─────┘  └─────┘            │
├──────────────────────────────────────────────────┤
│  ✦ CHARACTER_A Details                     [✕]   │
│  Age: ___  Gender: ___  Role: ___               │
│  Personality: [textarea]                         │
│  ❤️ Loves  |  💔 Hates                           │
│  Verbal Habits: [textarea]                       │
│  Notes for Agent: [textarea]                     │
│  🔗 Network & Links                              │
│    [connection cards with edit/delete]            │
│    [+ Add Connection]                            │
└──────────────────────────────────────────────────┘
```

### What to REPLACE:
The "CARDS GRID" section (lines 96–130 of `SignaturesTab.tsx`) becomes a React Flow canvas.

### What to KEEP:
- The title bar with "Generate Synopsis ➔" button (lines 83–94).
- The details panel (lines 132–354) — it should still open when a node is clicked.
- All the Network & Links editing UI inside the details panel.

---

## 6. Existing Card Markup (To Reuse As Custom Node)

Each card currently looks like this — reuse this as your custom React Flow node content:

```tsx
<div
  style={{ padding: '1.5rem 2.5rem' }}
  className={`cursor-pointer rounded-xl transition-all duration-200 shadow-sm hover:-translate-y-0.5 group flex flex-col justify-between box-border ${
    activeChar === char
      ? 'border-2 border-primary bg-surface shadow-md ring-4 ring-primary/10'
      : 'border border-border bg-surface hover:border-primary/50 hover:shadow-md'
  }`}
>
  <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-4">
    <h3 className="text-lg font-bold text-foreground">{char}</h3>
    <span className="text-2xl">🎭</span>
  </div>
  <div className="text-sm text-foreground-muted flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <span className="opacity-70 text-xs uppercase tracking-wider font-bold">Age</span>
      <span className="font-medium text-foreground">{sig.age || '?'}</span>
    </div>
    <div className="flex items-center justify-between">
      <span className="opacity-70 text-xs uppercase tracking-wider font-bold">Gender</span>
      <span className="font-medium text-foreground">{sig.gender || '?'}</span>
    </div>
    <div className="mt-2 pt-3 border-t border-border-subtle flex justify-end">
      <span className="px-3 py-1.5 bg-brand/10 text-accent-primary rounded-md text-xs font-bold uppercase tracking-wider">
        {sig.role || 'Unassigned'}
      </span>
    </div>
  </div>
</div>
```

---

## 7. Design System Tokens (For Edge Colors)

Use these CSS custom properties for consistency. The app is dark-themed:

| Token | Fallback | Usage |
|-------|----------|-------|
| `--foreground` | `#e5e7eb` | Main text color |
| `--foreground-muted` | `#9ca3af` | Secondary text |
| `--background` | `#0f0f0f` | Page background |
| `--surface` | `#1a1a1a` | Card backgrounds |
| `--border` | `#2a2a2a` | Borders |
| `--accent-primary` | `#3b82f6` | Blue accent |
| `--primary` | brand blue | Primary actions |
| `--brand` | brand color | Brand highlights |

---

## 8. Implementation Plan

### Step 1: Install Dependencies

```bash
cd app
npm install @xyflow/react dagre
npm install -D @types/dagre
```

### Step 2: Create a Custom Node Component

Create `app/src/components/phases/scenario/tabs/CharacterNode.tsx`:

- Accept `data` prop containing `{ char: string, sig: CharacterSignature, isActive: boolean }`
- Render the exact same card markup shown in Section 6 above
- The node should have a **fixed width** of ~260px
- Add `<Handle>` components from React Flow on all 4 sides for edge connections

### Step 3: Refactor SignaturesTab.tsx

Replace the card grid (lines 96–130) with a React Flow `<ReactFlow>` canvas:

1. **Convert signatures to nodes**: Map each `[charName, sig]` entry to a React Flow node object with `type: 'character'`.
2. **Convert network links to edges**: Iterate over ALL signatures. For each character's `network` array, create an edge from that character to the `target_character`. **Deduplicate** bidirectional edges (A→B and B→A should be ONE edge, not two).
3. **Auto-layout with Dagre**: Use the `dagre` library to compute node positions automatically. Use `rankdir: 'TB'` (top-to-bottom) for a tree feel. Node width = 260, node height = 180.
4. **Wrap in a container** with a fixed height (e.g., `min-h-[500px]` or `h-[60vh]`) and `border border-border rounded-xl`.
5. **Register** the custom node type: `const nodeTypes = useMemo(() => ({ character: CharacterNode }), [])`.

### Step 4: Edge Styling Rules

Color-code and size edges by relationship type:

| Type | Color | Width | Label |
|------|-------|-------|-------|
| **Family** | `#3b82f6` (blue) | 3px | Shows `relationship_subtype` (e.g., "brother / sister") |
| **Lover** | `#ef4444` (red) | 3px | Shows "lover" |
| **Friend** | `#22c55e` (green) | **Variable** based on closeness subtype | Shows subtype |

#### Friend Line Width Map:
| Subtype | Width |
|---------|-------|
| `best` | 5px |
| `very close` | 4px |
| `normal` (or empty) | 2.5px |
| `far` | 1.5px (dashed) |

Use React Flow's `style` prop on edges:
```tsx
{
  id: 'edge-a-b',
  source: 'CHARACTER_A',
  target: 'CHARACTER_B',
  type: 'default', // or 'smoothstep' for curved lines
  label: 'brother / sister',
  style: { stroke: '#3b82f6', strokeWidth: 3 },
  labelStyle: { fill: '#9ca3af', fontSize: 11, fontWeight: 600 },
  labelBgStyle: { fill: '#1a1a1a', fillOpacity: 0.9 },
  animated: false, // set true for lover type for a pulse effect
}
```

### Step 5: Interaction Wiring

- **Click a node** → set `activeChar` state → opens the existing details panel below the canvas.
- **Canvas controls**: Add `<Controls />` and `<Background />` from React Flow for zoom buttons and a dot-grid background.
- Add a "Re-layout" button in the title bar to re-run the Dagre algorithm if users drag nodes around and want to reset.

### Step 6: React Flow Required CSS

Import React Flow's base stylesheet in `SignaturesTab.tsx`:
```tsx
import '@xyflow/react/dist/style.css';
```

### Step 7: Edge Deduplication Logic

Since CHARACTER_A links to CHARACTER_B AND CHARACTER_B links back to CHARACTER_A, you must deduplicate:

```typescript
const seenPairs = new Set<string>();
const edges: Edge[] = [];

Object.entries(signatures.signatures).forEach(([char, sig]) => {
  (sig.network || []).forEach(link => {
    const pairKey = [char, link.target_character].sort().join('::');
    if (seenPairs.has(pairKey)) return;
    seenPairs.add(pairKey);

    // Find the reverse link for combined label
    const reverseSig = signatures.signatures[link.target_character];
    const reverseLink = reverseSig?.network?.find(l => l.target_character === char);

    const label = reverseLink
      ? `${link.relationship_subtype} / ${reverseLink.relationship_subtype}`
      : link.relationship_subtype;

    edges.push({
      id: pairKey,
      source: char,
      target: link.target_character,
      label,
      style: getEdgeStyle(link),
      labelStyle: { fill: '#9ca3af', fontSize: 11, fontWeight: 600 },
      labelBgStyle: { fill: '#1a1a1a', fillOpacity: 0.9 },
      animated: link.relationship_type === 'lover',
    });
  });
});
```

### Step 8: Verification

After implementation:
1. Run `npm run dev` and navigate to the Signatures sub-tab.
2. Confirm CHARACTER_A and CHARACTER_B appear as draggable nodes connected by a blue "brother / sister" edge.
3. Click a node → details panel opens below with all fields and the Network & Links editor.
4. Zoom in/out with scroll wheel, pan by dragging the background.
5. Check that the "Generate Synopsis ➔" button still works.
6. Test the "Add Connection" flow in the details panel — confirm new edges appear in real time after saving.

---

## 9. Important Caveats

- **Do NOT modify** `app/src/types/data.ts` — the types are already correct.
- **Do NOT modify** `data/personality_signature.json` — it already has the correct test data.
- **Do NOT modify** `ScenarioPhase.tsx` — the parent component props are already wired correctly.
- The app uses **Tailwind CSS v4** — utility classes like `bg-surface`, `text-foreground`, `border-border` are mapped to CSS custom properties via `@theme` in the Tailwind config.
- Use **hardcoded inline padding** (`style={{ padding: '1.5rem 2.5rem' }}`) on the card nodes rather than Tailwind padding classes, as we've had issues with Tailwind padding utilities not rendering consistently in this project.
