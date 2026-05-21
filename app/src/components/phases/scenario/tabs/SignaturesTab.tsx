import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import type { PersonalitySignatureData, CharacterLink, CharacterSignature } from '@/types/data';
import { CharacterNode } from './CharacterNode';
import { SignatureDetailsPanel } from './SignatureDetailsPanel';

// ── Constants ──────────────────────────────────────────────

const NODE_WIDTH = 260;
const NODE_HEIGHT = 180;

// ── Edge styling helpers ───────────────────────────────────

const EDGE_COLORS: Record<string, string> = {
  family: '#3b82f6',
  lover: '#ef4444',
  friend: '#22c55e',
};

const FRIEND_WIDTH: Record<string, number> = {
  best: 3,
  'very close': 2,
  normal: 1,
  '': 1,
};
const FRIEND_FAR_WIDTH = 0.2;

function getEdgeStyle(link: CharacterLink): React.CSSProperties {
  const color = EDGE_COLORS[link.relationship_type] || '#9ca3af';

  if (link.relationship_type === 'friend') {
    const sub = (link.relationship_subtype || '').toLowerCase().trim();
    if (sub === 'far') {
      return { stroke: color, strokeWidth: FRIEND_FAR_WIDTH, strokeDasharray: '6 4' };
    }
    const width = FRIEND_WIDTH[sub] ?? FRIEND_WIDTH['normal'];
    return { stroke: color, strokeWidth: width };
  }

  return { stroke: color, strokeWidth: 3 };
}

// ── Dagre layout ───────────────────────────────────────────

function layoutNodes(nodes: Node[], edges: Edge[]): Node[] {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', ranksep: 80, nodesep: 60 });

  nodes.forEach((node) => {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });
  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  return nodes.map((node) => {
    const pos = g.node(node.id);
    return {
      ...node,
      position: {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - NODE_HEIGHT / 2,
      },
    };
  });
}

// ── Props ──────────────────────────────────────────────────

interface SignaturesTabProps {
  signatures: PersonalitySignatureData | null;
  onSaveSignatures: (data: PersonalitySignatureData) => void;
  openQa: (type: string, context: string) => void;
}

// ── Component ──────────────────────────────────────────────

const nodeTypes = { character: CharacterNode };

export const SignaturesTab: React.FC<SignaturesTabProps> = ({ signatures, onSaveSignatures, openQa }) => {
  const [activeChar, setActiveChar] = useState<string | null>(null);
  const [layoutVersion, setLayoutVersion] = useState(0);

  useEffect(() => {
    if (!activeChar && signatures?.signatures && Object.keys(signatures.signatures).length > 0) {
      setActiveChar(Object.keys(signatures.signatures)[0]);
    }
  }, [signatures, activeChar]);

  // ── Build graph data ─────────────────────────────────────

  const rawEdges = useMemo<Edge[]>(() => {
    if (!signatures?.signatures) return [];

    const seenPairs = new Set<string>();
    const result: Edge[] = [];

    Object.entries(signatures.signatures).forEach(([char, sig]) => {
      (sig.network || []).forEach((link) => {
        const pairKey = [char, link.target_character].sort().join('::');
        if (seenPairs.has(pairKey)) return;
        seenPairs.add(pairKey);

        // Find reverse link for combined label
        const reverseSig = signatures.signatures[link.target_character];
        const reverseLink = reverseSig?.network?.find((l) => l.target_character === char);

        const label = reverseLink
          ? `${link.relationship_subtype} / ${reverseLink.relationship_subtype}`
          : link.relationship_subtype;

        result.push({
          id: pairKey,
          source: char,
          target: link.target_character,
          type: 'smoothstep',
          label,
          style: getEdgeStyle(link),
          labelStyle: { fill: 'var(--text-muted)', fontSize: 11, fontWeight: 600 },
          labelBgStyle: { fill: 'var(--canvas-bg)', fillOpacity: 0.9 },
          animated: link.relationship_type === 'lover',
        });
      });
    });

    return result;
  }, [signatures]);

  const rawNodes = useMemo<Node[]>(() => {
    if (!signatures?.signatures) return [];
    return Object.entries(signatures.signatures).map(([char, sig]) => ({
      id: char,
      type: 'character',
      position: { x: 0, y: 0 },
      data: { char, sig, isActive: activeChar === char },
    }));
  }, [signatures, activeChar]);

  const laidOutNodes = useMemo(() => {
    if (rawNodes.length === 0) return [];
    return layoutNodes(rawNodes, rawEdges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawNodes, rawEdges, layoutVersion]);

  const [nodes, setNodes, onNodesChange] = useNodesState(laidOutNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rawEdges);

  // Sync when laidOutNodes or rawEdges change
  useEffect(() => {
    setNodes(laidOutNodes);
  }, [laidOutNodes, setNodes]);

  useEffect(() => {
    // Keep edges in sync when data changes
    setEdges(rawEdges);
  }, [rawEdges, setEdges]);

  // ── Handlers ─────────────────────────────────────────────

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setActiveChar((prev) => (prev === node.id ? null : node.id));
  }, []);

  const handleRelayout = useCallback(() => {
    setLayoutVersion((v) => v + 1);
  }, []);

  const handleSaveSignature = (char: string, updatedSig: CharacterSignature) => {
    if (!signatures) return;
    onSaveSignatures({
      ...signatures,
      signatures: {
        ...signatures.signatures,
        [char]: updatedSig,
      },
    });
  };

  // ── Empty state ──────────────────────────────────────────

  if (!signatures?.signatures || Object.keys(signatures.signatures).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 h-full w-full">
        <div className="flex flex-col items-center justify-center p-8 text-center gap-4 bg-surface rounded-lg border border-border shadow-sm w-full max-w-4xl">
        <div className="text-5xl opacity-80">🎭</div>
        <h3 className="text-xl font-bold text-foreground">No Signatures Generated</h3>
        <p className="text-sm text-foreground-muted max-w-md">
          Personality signatures define the psychological traits, habits, and relationships of your characters for this scenario.
        </p>
        <button
          className="px-5 py-2.5 mt-4 bg-primary text-primary-foreground rounded-md shadow hover:bg-primary-hover text-sm font-bold transition-all hover:-translate-y-0.5"
          onClick={() => openQa('GENERATE_SIGNATURES', 'Based on inputs, generate personality signatures')}
        >
          Generate Signatures ➔
        </button>
        </div>
      </div>
    );
  }

  const activeSig = activeChar ? signatures.signatures[activeChar] : null;

  // ── Render ───────────────────────────────────────────────

  return (
    <div className="flex flex-col items-center p-6 h-full overflow-y-auto bg-surface-raised w-full">
      <div className="w-full max-w-5xl flex flex-col gap-8 mt-4">
        {/* Title Bar */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-heading text-foreground">Personality Signatures</h2>
            <p className="text-sm text-foreground-muted mt-1">Specific psychological truths and relationship dynamics for characters in this scenario.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="px-4 py-2 border border-border text-foreground-muted rounded-md text-sm font-bold hover:bg-surface hover:text-foreground transition-all"
              onClick={handleRelayout}
              title="Reset node positions"
            >
              ⟲ Re-layout
            </button>
            <button
              className="px-5 py-2.5 bg-primary text-primary-foreground rounded-md shadow hover:bg-primary-hover text-sm font-bold transition-all hover:-translate-y-0.5 whitespace-nowrap ml-1"
              onClick={() => openQa('GENERATE_SYNOPSIS', 'Based on signatures and inputs, generate synopsis')}
            >
              Generate Synopsis ➔
            </button>
          </div>
        </div>

        {/* React Flow Canvas */}
        <div
          className="border border-border rounded-xl overflow-hidden"
          style={{ minHeight: 500, height: '60vh' }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            proOptions={{ hideAttribution: true }}
          >
            <Controls
              showInteractive={false}
              style={{ background: 'var(--panel-bg)', border: '1px solid var(--border-color)', borderRadius: 8 }}
            />
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--border-color)" />
          </ReactFlow>
        </div>

        {/* Details View */}
        {activeChar && activeSig && (
          <SignatureDetailsPanel
            activeChar={activeChar}
            activeSig={activeSig}
            onClose={() => setActiveChar(null)}
            onSave={handleSaveSignature}
          />
        )}
      </div>
    </div>
  );
};
