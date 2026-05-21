import React, { useState, useMemo, useCallback } from 'react';
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
import { PipelineNode, type PipelineNodeData } from './PipelineNode';
import '../../../styles/pipeline-map.css';

// ── Dagre layout ───────────────────────────────────────────
const NODE_WIDTH = 220;
const NODE_HEIGHT = 110;

function layoutNodes(nodes: Node[], edges: Edge[]): Node[] {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'LR', ranksep: 100, nodesep: 50 });

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

// ── Graph Data Definition ──────────────────────────────────
const initialRawNodes: Node[] = [
  // ─── PHASES ──────────────────────────────────────────────

  // Phase 0: Lore
  {
    id: 'lore_phase',
    type: 'pipelineNode',
    position: { x: 0, y: 0 },
    data: {
      id: 'lore_phase',
      label: 'Lore Editor',
      type: 'phase',
      emoji: '🌍',
      description: 'Establishes the universe lore, key factions, global settings, visual style, and initial parameters.',
      badge: 'Phase 0',
      accentColor: '#8b5cf6',
      activePhaseId: 'lore',
      inputs: [],
      outputs: ['data/lore.json', 'data/geography.json', 'data/visual_style.json'],
    },
  },

  // Step 1: Scenario — Foundations
  {
    id: 'scenario_p1',
    type: 'pipelineNode',
    position: { x: 0, y: 0 },
    data: {
      id: 'scenario_p1',
      label: 'Scenario: Foundations',
      type: 'phase',
      emoji: '📝',
      description: 'Takes scenario inputs and builds character personality signatures, the synopsis, and the chapter breakdown.',
      badge: 'Step 1',
      accentColor: '#ec4899',
      activePhaseId: 'scenario',
      inputs: ['data/lore.json', 'data/scenario_inputs.json'],
      outputs: ['data/personality_signature.json', 'data/scenario_synopsis.json', 'data/scenario_chapters.json'],
    },
  },

  // Step 2: Characters — Chapter Moods
  {
    id: 'charhub_p1',
    type: 'pipelineNode',
    position: { x: 0, y: 0 },
    data: {
      id: 'charhub_p1',
      label: 'Characters: Chapter Moods',
      type: 'phase',
      emoji: '👤',
      description: 'Simulates character emotional arcs at chapter granularity using personality signatures and chapter structure.',
      badge: 'Step 2',
      accentColor: '#6366f1',
      activePhaseId: 'char-hub',
      inputs: ['data/lore.json', 'data/visual_style.json', 'data/personality_signature.json', 'data/scenario_chapters.json'],
      outputs: ['data/character_moods.json'],
    },
  },

  // Step 3: Scenario — Scene Division
  {
    id: 'scenario_p2',
    type: 'pipelineNode',
    position: { x: 0, y: 0 },
    data: {
      id: 'scenario_p2',
      label: 'Scenario: Scene Division',
      type: 'phase',
      emoji: '📝',
      description: 'Divides approved chapters into granular scenes using character mood context from the previous pass.',
      badge: 'Step 3',
      accentColor: '#ec4899',
      activePhaseId: 'scenario',
      inputs: ['data/scenario_chapters.json', 'data/character_moods.json'],
      outputs: ['data/scenario_scenes.json'],
    },
  },

  // Step 4: Characters — Scene Moods & Profiles
  {
    id: 'charhub_p2',
    type: 'pipelineNode',
    position: { x: 0, y: 0 },
    data: {
      id: 'charhub_p2',
      label: 'Characters: Scene Moods',
      type: 'phase',
      emoji: '👤',
      description: 'Refines mood arcs to scene-level precision. Generates turnarounds, visual profiles, and emotional state references.',
      badge: 'Step 4',
      accentColor: '#6366f1',
      activePhaseId: 'char-hub',
      inputs: ['data/scenario_scenes.json', 'data/personality_signature.json', 'data/visual_style.json', 'data/character_moods.json'],
      outputs: ['data/character_moods.json', 'global_characters/Name/personality_signature.md'],
    },
  },

  // Phase 1: Intro
  {
    id: 'intro_phase',
    type: 'pipelineNode',
    position: { x: 0, y: 0 },
    data: {
      id: 'intro_phase',
      label: "Characters' Intro",
      type: 'phase',
      emoji: '🎭',
      description: 'Orchestrates dynamic introduction splash layouts for primary scenario characters.',
      badge: 'Phase 1',
      accentColor: '#f59e0b',
      activePhaseId: 'intro',
      inputs: ['data/lore.json', 'global_characters/Name/personality_signature.md'],
      outputs: ['data/intro_pages.json'],
    },
  },

  // Phase 1.5: Pacing
  {
    id: 'pacing_phase',
    type: 'pipelineNode',
    position: { x: 0, y: 0 },
    data: {
      id: 'pacing_phase',
      label: 'Pacing & Pagination',
      type: 'phase',
      emoji: '📋',
      description: 'Maps the sequential scenes list onto physical comic pages, specifying focus points.',
      badge: 'Phase 1.5',
      accentColor: '#06b6d4',
      activePhaseId: 'pacing',
      inputs: ['data/scenario_scenes.json'],
      outputs: ['data/pages.json'],
    },
  },

  // Phase 2: Panels
  {
    id: 'panels_phase',
    type: 'pipelineNode',
    position: { x: 0, y: 0 },
    data: {
      id: 'panels_phase',
      label: 'Panel Structuring',
      type: 'phase',
      emoji: '📐',
      description: 'Divides page-level action into detailed panel templates, framing, and compositions.',
      badge: 'Phase 2',
      accentColor: '#10b981',
      activePhaseId: 'panels',
      inputs: ['data/pages.json', 'data/intro_pages.json', 'data/lore.json'],
      outputs: ['data/panels.json'],
    },
  },

  // Phase 3: Script
  {
    id: 'script_phase',
    type: 'pipelineNode',
    position: { x: 0, y: 0 },
    data: {
      id: 'script_phase',
      label: 'Script & Dialogue',
      type: 'phase',
      emoji: '✍️',
      description: 'Writes and maps speech bubbles, narrative overlays, and captions for each panel.',
      badge: 'Phase 3',
      accentColor: '#f97316',
      activePhaseId: 'script',
      inputs: ['data/panels.json', 'data/scenario_scenes.json', 'data/lore.json'],
      outputs: ['data/script.json'],
    },
  },

  // Phase 6: Assembly
  {
    id: 'assembly_phase',
    type: 'pipelineNode',
    position: { x: 0, y: 0 },
    data: {
      id: 'assembly_phase',
      label: 'Assembly Studio',
      type: 'phase',
      emoji: '🧩',
      description: 'Interactive canvas layout workspace for lettering, styling, and page exports.',
      badge: 'Phase 6',
      accentColor: '#3b82f6',
      activePhaseId: 'assembly',
      inputs: ['data/script.json', 'data/panels.json', 'data/images/page_N/*.png'],
      outputs: ['pages/page_N/layout.json', 'pages/page_N/final.png'],
    },
  },

  // ─── DATA FILES ──────────────────────────────────────────

  {
    id: 'file_lore',
    type: 'pipelineNode',
    position: { x: 0, y: 0 },
    data: {
      id: 'file_lore',
      label: 'data/lore.json',
      type: 'file',
      description: 'Core metadata parameters for world systems, histories, and geography.',
    },
  },
  {
    id: 'file_visual_style',
    type: 'pipelineNode',
    position: { x: 0, y: 0 },
    data: {
      id: 'file_visual_style',
      label: 'data/visual_style.json',
      type: 'file',
      description: 'Art direction reference, universal style seeds, and visual rules configuration.',
    },
  },
  {
    id: 'file_scenario_inputs',
    type: 'pipelineNode',
    position: { x: 0, y: 0 },
    data: {
      id: 'file_scenario_inputs',
      label: 'data/scenario_inputs.json',
      type: 'file',
      description: 'Initial scenario constraints including themes, key plot points, and logline.',
    },
  },
  {
    id: 'file_signatures',
    type: 'pipelineNode',
    position: { x: 0, y: 0 },
    data: {
      id: 'file_signatures',
      label: 'data/personality_signature.json',
      type: 'file',
      description: 'Psychological profiles, traits, and relationship networks.',
    },
  },
  {
    id: 'file_chapters',
    type: 'pipelineNode',
    position: { x: 0, y: 0 },
    data: {
      id: 'file_chapters',
      label: 'data/scenario_chapters.json',
      type: 'file',
      description: 'Structured chapter breakdown with arcs, beats, and character assignments.',
    },
  },
  {
    id: 'file_moods',
    type: 'pipelineNode',
    position: { x: 0, y: 0 },
    data: {
      id: 'file_moods',
      label: 'data/character_moods.json',
      type: 'file',
      description: 'Character emotional trajectories — first at chapter level, then refined to scene level.',
    },
  },
  {
    id: 'file_scenes',
    type: 'pipelineNode',
    position: { x: 0, y: 0 },
    data: {
      id: 'file_scenes',
      label: 'data/scenario_scenes.json',
      type: 'file',
      description: 'Comprehensive scene pacing lists and emotional beats.',
    },
  },
  {
    id: 'file_intro',
    type: 'pipelineNode',
    position: { x: 0, y: 0 },
    data: {
      id: 'file_intro',
      label: 'data/intro_pages.json',
      type: 'file',
      description: 'Splash sequences, captions, and introductions config.',
    },
  },
  {
    id: 'file_pages',
    type: 'pipelineNode',
    position: { x: 0, y: 0 },
    data: {
      id: 'file_pages',
      label: 'data/pages.json',
      type: 'file',
      description: 'Page index containing thematic pacing, narrative notes, and layout styles.',
    },
  },
  {
    id: 'file_panels',
    type: 'pipelineNode',
    position: { x: 0, y: 0 },
    data: {
      id: 'file_panels',
      label: 'data/panels.json',
      type: 'file',
      description: 'Layout grids, aspect ratios, compositions, and camera directions.',
    },
  },
  {
    id: 'file_script',
    type: 'pipelineNode',
    position: { x: 0, y: 0 },
    data: {
      id: 'file_script',
      label: 'data/script.json',
      type: 'file',
      description: 'Dialogue scripts, voice directions, and text block positioning IDs.',
    },
  },
  {
    id: 'file_final',
    type: 'pipelineNode',
    position: { x: 0, y: 0 },
    data: {
      id: 'file_final',
      label: 'pages/page_N/final.png',
      type: 'file',
      description: 'Composited high-fidelity final print comic book page.',
    },
  },

  // ─── AI AGENTS ───────────────────────────────────────────

  {
    id: 'agent_personality',
    type: 'pipelineNode',
    position: { x: 0, y: 0 },
    data: {
      id: 'agent_personality',
      label: 'Personality Agent',
      type: 'agent',
      description: 'Constructs behavior styles, speech tones, habits, and relationship guides.',
    },
  },
  {
    id: 'agent_mood',
    type: 'pipelineNode',
    position: { x: 0, y: 0 },
    data: {
      id: 'agent_mood',
      label: 'Mood Simulation Agent',
      type: 'agent',
      description: 'Simulates emotional trajectories — first coarse (chapter), then fine-grained (scene).',
    },
  },
  {
    id: 'agent_visual',
    type: 'pipelineNode',
    position: { x: 0, y: 0 },
    data: {
      id: 'agent_visual',
      label: 'Visual Signature Agent',
      type: 'agent',
      description: 'Generates consistent character turnarounds, dress profiles, and model prompts.',
    },
  },
  {
    id: 'agent_intro',
    type: 'pipelineNode',
    position: { x: 0, y: 0 },
    data: {
      id: 'agent_intro',
      label: 'Intro Page Agent',
      type: 'agent',
      description: 'Formulates introductory splash page composition and narrator captions.',
    },
  },
  {
    id: 'agent_pacing',
    type: 'pipelineNode',
    position: { x: 0, y: 0 },
    data: {
      id: 'agent_pacing',
      label: 'Pacing Agent',
      type: 'agent',
      description: 'Tracks page budget, scenario pacing arcs, and structural breaks.',
    },
  },
  {
    id: 'agent_structuring',
    type: 'pipelineNode',
    position: { x: 0, y: 0 },
    data: {
      id: 'agent_structuring',
      label: 'Structuring Agent',
      type: 'agent',
      description: 'Designs grid templates, coordinates aspect ratios, and defines camera views.',
    },
  },
  {
    id: 'agent_scripting',
    type: 'pipelineNode',
    position: { x: 0, y: 0 },
    data: {
      id: 'agent_scripting',
      label: 'Scripting Agent',
      type: 'agent',
      description: 'Refines dialogues, generates dialogue bubble texts, and verifies re-reading flow.',
    },
  },
  {
    id: 'agent_renderer',
    type: 'pipelineNode',
    position: { x: 0, y: 0 },
    data: {
      id: 'agent_renderer',
      label: 'Page Renderer',
      type: 'agent',
      description: 'Composites speech bubbles and graphics overlay coordinates into final PNG.',
    },
  },
];

const initialEdges: Edge[] = [
  // ─── MAIN PROCESS FLOW (the zigzag) ─────────────────────

  // Lore → Scenario Pass 1
  { id: 'e_lore_sp1', source: 'lore_phase', target: 'scenario_p1', type: 'smoothstep', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2.5 } },
  // Scenario Pass 1 → Character Hub Pass 1
  { id: 'e_sp1_cp1', source: 'scenario_p1', target: 'charhub_p1', type: 'smoothstep', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2.5 } },
  // Character Hub Pass 1 → Scenario Pass 2
  { id: 'e_cp1_sp2', source: 'charhub_p1', target: 'scenario_p2', type: 'smoothstep', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2.5 } },
  // Scenario Pass 2 → Character Hub Pass 2
  { id: 'e_sp2_cp2', source: 'scenario_p2', target: 'charhub_p2', type: 'smoothstep', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2.5 } },

  // Character Hub Pass 2 → downstream (parallel fork)
  { id: 'e_cp2_intro', source: 'charhub_p2', target: 'intro_phase', type: 'smoothstep', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2.5 } },
  { id: 'e_cp2_pace', source: 'charhub_p2', target: 'pacing_phase', type: 'smoothstep', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2.5 } },

  // Parallel → converge at panels
  { id: 'e_intro_pan', source: 'intro_phase', target: 'panels_phase', type: 'smoothstep', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2.5 } },
  { id: 'e_pace_pan', source: 'pacing_phase', target: 'panels_phase', type: 'smoothstep', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2.5 } },

  // Linear downstream
  { id: 'e_pan_scrip', source: 'panels_phase', target: 'script_phase', type: 'smoothstep', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2.5 } },
  { id: 'e_scrip_assemb', source: 'script_phase', target: 'assembly_phase', type: 'smoothstep', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2.5 } },

  // ─── FILE DATA FLOWS ────────────────────────────────────

  // Lore outputs
  { id: 'e_lore_flore', source: 'lore_phase', target: 'file_lore', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },
  { id: 'e_lore_fvs', source: 'lore_phase', target: 'file_visual_style', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },

  // Scenario P1 inputs
  { id: 'e_flore_sp1', source: 'file_lore', target: 'scenario_p1', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },
  { id: 'e_fsinp_sp1', source: 'file_scenario_inputs', target: 'scenario_p1', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },

  // Scenario P1 outputs
  { id: 'e_sp1_fsig', source: 'scenario_p1', target: 'file_signatures', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },
  { id: 'e_sp1_fchap', source: 'scenario_p1', target: 'file_chapters', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },

  // CharHub P1 inputs
  { id: 'e_flore_cp1', source: 'file_lore', target: 'charhub_p1', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },
  { id: 'e_fvs_cp1', source: 'file_visual_style', target: 'charhub_p1', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },
  { id: 'e_fsig_cp1', source: 'file_signatures', target: 'charhub_p1', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },
  { id: 'e_fchap_cp1', source: 'file_chapters', target: 'charhub_p1', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },

  // CharHub P1 output
  { id: 'e_cp1_fmoods', source: 'charhub_p1', target: 'file_moods', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },

  // Scenario P2 inputs
  { id: 'e_fchap_sp2', source: 'file_chapters', target: 'scenario_p2', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },
  { id: 'e_fmoods_sp2', source: 'file_moods', target: 'scenario_p2', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },

  // Scenario P2 output
  { id: 'e_sp2_fscenes', source: 'scenario_p2', target: 'file_scenes', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },

  // CharHub P2 inputs
  { id: 'e_fscenes_cp2', source: 'file_scenes', target: 'charhub_p2', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },
  { id: 'e_fsig_cp2', source: 'file_signatures', target: 'charhub_p2', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },
  { id: 'e_fvs_cp2', source: 'file_visual_style', target: 'charhub_p2', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },
  { id: 'e_fmoods_cp2', source: 'file_moods', target: 'charhub_p2', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },

  // Downstream file flows
  { id: 'e_flore_intro', source: 'file_lore', target: 'intro_phase', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },
  { id: 'e_fscenes_pace', source: 'file_scenes', target: 'pacing_phase', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },

  { id: 'e_intro_fintro', source: 'intro_phase', target: 'file_intro', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },
  { id: 'e_pace_fpages', source: 'pacing_phase', target: 'file_pages', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },

  { id: 'e_fintro_pan', source: 'file_intro', target: 'panels_phase', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },
  { id: 'e_fpages_pan', source: 'file_pages', target: 'panels_phase', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },
  { id: 'e_flore_pan', source: 'file_lore', target: 'panels_phase', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },

  { id: 'e_pan_fpanels', source: 'panels_phase', target: 'file_panels', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },
  { id: 'e_fpanels_scrip', source: 'file_panels', target: 'script_phase', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },
  { id: 'e_fscenes_scrip', source: 'file_scenes', target: 'script_phase', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },
  { id: 'e_flore_scrip', source: 'file_lore', target: 'script_phase', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },

  { id: 'e_scrip_fscript', source: 'script_phase', target: 'file_script', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },
  { id: 'e_fscript_assemb', source: 'file_script', target: 'assembly_phase', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },
  { id: 'e_fpanels_assemb', source: 'file_panels', target: 'assembly_phase', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },
  { id: 'e_assemb_ffinal', source: 'assembly_phase', target: 'file_final', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },

  // ─── AGENT CONNECTIONS ──────────────────────────────────

  { id: 'e_sp1_aperson', source: 'scenario_p1', target: 'agent_personality', type: 'smoothstep', style: { stroke: '#f59e0b', strokeWidth: 1.2, strokeDasharray: '4 4', opacity: 0.6 } },
  { id: 'e_cp1_amood', source: 'charhub_p1', target: 'agent_mood', type: 'smoothstep', style: { stroke: '#f59e0b', strokeWidth: 1.2, strokeDasharray: '4 4', opacity: 0.6 } },
  { id: 'e_cp2_amood', source: 'charhub_p2', target: 'agent_mood', type: 'smoothstep', style: { stroke: '#f59e0b', strokeWidth: 1.2, strokeDasharray: '4 4', opacity: 0.6 } },
  { id: 'e_cp2_avisual', source: 'charhub_p2', target: 'agent_visual', type: 'smoothstep', style: { stroke: '#f59e0b', strokeWidth: 1.2, strokeDasharray: '4 4', opacity: 0.6 } },
  { id: 'e_intro_aintro', source: 'intro_phase', target: 'agent_intro', type: 'smoothstep', style: { stroke: '#f59e0b', strokeWidth: 1.2, strokeDasharray: '4 4', opacity: 0.6 } },
  { id: 'e_pace_apace', source: 'pacing_phase', target: 'agent_pacing', type: 'smoothstep', style: { stroke: '#f59e0b', strokeWidth: 1.2, strokeDasharray: '4 4', opacity: 0.6 } },
  { id: 'e_pan_astruct', source: 'panels_phase', target: 'agent_structuring', type: 'smoothstep', style: { stroke: '#f59e0b', strokeWidth: 1.2, strokeDasharray: '4 4', opacity: 0.6 } },
  { id: 'e_scrip_ascrip', source: 'script_phase', target: 'agent_scripting', type: 'smoothstep', style: { stroke: '#f59e0b', strokeWidth: 1.2, strokeDasharray: '4 4', opacity: 0.6 } },
  { id: 'e_assemb_arender', source: 'assembly_phase', target: 'agent_renderer', type: 'smoothstep', style: { stroke: '#f59e0b', strokeWidth: 1.2, strokeDasharray: '4 4', opacity: 0.6 } },
];

// ── Node Types ─────────────────────────────────────────────
const nodeTypes = {
  pipelineNode: PipelineNode,
};

interface PipelineMapPhaseProps {
  onPhaseChange: (phase: any) => void;
}

interface PipelineStep {
  id: string;
  phaseId: string;
  badge: string;
  title: string;
  emoji: string;
  description: string;
  accentColor: string;
  inputs: string[];
  outputs: string[];
  agentName?: string;
  agentDesc?: string;
  instruction?: string;
  isLoopStep?: boolean;
}

const pipelineSteps: PipelineStep[] = [
  {
    id: 'lore',
    phaseId: 'lore',
    badge: 'Phase 0',
    title: 'Lore Editor',
    emoji: '🌍',
    description: 'Establishes the universe lore, key factions, global settings, visual style, and initial parameters. This is the foundation that all downstream phases build upon.',
    accentColor: '#8b5cf6',
    inputs: [],
    outputs: ['data/lore.json', 'data/geography.json', 'data/visual_style.json'],
    agentName: 'Lore Compiler Agent',
    agentDesc: 'Resolves narrative consistencies, expands geographic settings, and organizes faction histories.',
    instruction: 'Define your setting details, character relationships, and art directions in the editor fields.'
  },
  {
    id: 'scenario_p1',
    phaseId: 'scenario',
    badge: 'Step 1 of 4 (Loop)',
    title: 'Scenario: Foundations',
    emoji: '📝',
    description: 'Takes scenario inputs and builds character personality signatures, the synopsis, and the chapter breakdown.',
    accentColor: '#ec4899',
    inputs: ['data/lore.json', 'data/scenario_inputs.json'],
    outputs: ['data/personality_signature.json', 'data/scenario_synopsis.json', 'data/scenario_chapters.json'],
    agentName: 'Scenario Architect Agent',
    agentDesc: 'Transforms themes and outlines into character signatures and structural chapter grids.',
    instruction: 'Create your initial synopsis and edit chapter outlines. Make sure characters are registered with signatures.',
    isLoopStep: true
  },
  {
    id: 'charhub_p1',
    phaseId: 'char-hub',
    badge: 'Step 2 of 4 (Loop)',
    title: 'Characters: Chapter Moods',
    emoji: '👤',
    description: 'Simulates character emotional arcs at chapter granularity using personality signatures and chapter structure.',
    accentColor: '#6366f1',
    inputs: ['data/lore.json', 'data/visual_style.json', 'data/personality_signature.json', 'data/scenario_chapters.json'],
    outputs: ['data/character_moods.json'],
    agentName: 'Mood Simulation Agent',
    agentDesc: 'Projects emotional trajectories (e.g. anger, fear, valence) across chapters.',
    instruction: 'Inspect character emotional trends chapter by chapter. Refine moods where necessary.',
    isLoopStep: true
  },
  {
    id: 'scenario_p2',
    phaseId: 'scenario',
    badge: 'Step 3 of 4 (Loop)',
    title: 'Scenario: Scene Division',
    emoji: '📝',
    description: 'Divides approved chapters into granular scenes using character mood context from the previous pass.',
    accentColor: '#ec4899',
    inputs: ['data/scenario_chapters.json', 'data/character_moods.json'],
    outputs: ['data/scenario_scenes.json'],
    agentName: 'Scene Outliner Agent',
    agentDesc: 'Carves chapter beats into individual page-ready scenes and setups.',
    instruction: 'Expand chapters into scene cards. Specify the focus characters and settings for each scene.',
    isLoopStep: true
  },
  {
    id: 'charhub_p2',
    phaseId: 'char-hub',
    badge: 'Step 4 of 4 (Loop)',
    title: 'Characters: Scene Moods',
    emoji: '👤',
    description: 'Refines mood arcs to scene-level precision, mapping fine-grained emotional beats and generating visual profiles.',
    accentColor: '#6366f1',
    inputs: ['data/scenario_scenes.json', 'data/personality_signature.json', 'data/visual_style.json', 'data/character_moods.json'],
    outputs: ['data/character_moods.json'],
    agentName: 'Visual Signature Agent',
    agentDesc: 'Compiles visual look-books and prompt templates for image generation.',
    instruction: 'Map fine-grained emotional beats scene-by-scene, and generate model turnaround sheets.',
    isLoopStep: true
  },
  {
    id: 'intro',
    phaseId: 'intro',
    badge: 'Phase 1',
    title: "Characters' Intro",
    emoji: '🎭',
    description: 'Orchestrates dynamic introduction splash layouts for primary scenario characters based on their personality signatures and lore.',
    accentColor: '#f59e0b',
    inputs: ['data/lore.json', 'data/personality_signature.json'],
    outputs: ['data/intro_pages.json'],
    agentName: 'Intro Page Agent',
    agentDesc: 'Formulates introductory splash page composition and narrator captions.',
    instruction: 'Set up funny scenario proposals, edit story details/themes, and configure visual panel layouts.'
  },
  {
    id: 'pacing',
    phaseId: 'pacing',
    badge: 'Phase 1.5',
    title: 'Pacing & Pagination',
    emoji: '📋',
    description: 'Maps the sequential scenes list onto physical comic pages, specifying focus points and pagination.',
    accentColor: '#06b6d4',
    inputs: ['data/scenario_scenes.json'],
    outputs: ['data/pages.json'],
    agentName: 'Layout Pagination Agent',
    agentDesc: 'Determines the page layout structure based on scene pacing and focus character densities.',
    instruction: 'Verify page budgets, pagination splits, and set layout pacing flags.'
  },
  {
    id: 'panels',
    phaseId: 'panels',
    badge: 'Phase 2',
    title: 'Panel Structuring',
    emoji: '📐',
    description: 'Divides page-level action into detailed panel templates with framing, compositions, and camera directions.',
    accentColor: '#10b981',
    inputs: ['data/pages.json', 'data/intro_pages.json', 'data/lore.json'],
    outputs: ['data/panels.json'],
    agentName: 'Panel Composition Agent',
    agentDesc: 'Generates comic grid configurations, panel compositions, and framing descriptions.',
    instruction: 'Adjust camera angles, panels configurations, and confirm visual panel layout templates.'
  },
  {
    id: 'script',
    phaseId: 'script',
    badge: 'Phase 3',
    title: 'Script & Dialogue',
    emoji: '✍️',
    description: 'Writes and maps speech bubbles, narrative overlays, and captions for each panel based on scene context.',
    accentColor: '#f97316',
    inputs: ['data/panels.json', 'data/scenario_scenes.json', 'data/lore.json'],
    outputs: ['data/script.json'],
    agentName: 'Scripting & Dialog Agent',
    agentDesc: 'Polishes dialogue tone, checks word-balloon volumes, and sequences bubbles.',
    instruction: 'Polish speech bubble placements, character lines, and run dialogue QA tests.'
  }
];

export const PipelineMapPhase: React.FC<PipelineMapPhaseProps> = ({ onPhaseChange }) => {
  const [viewMode, setViewMode] = useState<'tracker' | 'diagram'>('tracker');
  const [selectedNodeData, setSelectedNodeData] = useState<PipelineNodeData | null>(null);
  const [selectedStepId, setSelectedStepId] = useState<string>('lore');

  // File existence check state
  const [fileStatus, setFileStatus] = useState<Record<string, boolean>>({});
  const [loadingFiles, setLoadingFiles] = useState(true);

  React.useEffect(() => {
    const checkFileStatus = async () => {
      const allFiles = [
        'data/lore.json',
        'data/geography.json',
        'data/visual_style.json',
        'data/scenario_inputs.json',
        'data/personality_signature.json',
        'data/scenario_synopsis.json',
        'data/scenario_chapters.json',
        'data/character_moods.json',
        'data/scenario_scenes.json',
        'data/intro_pages.json',
        'data/pages.json',
        'data/panels.json',
        'data/script.json',
      ];
      
      const status: Record<string, boolean> = {};
      
      await Promise.all(
        allFiles.map(async (file) => {
          try {
            const res = await fetch(`/api/load?path=${encodeURIComponent(file)}`);
            status[file] = res.ok;
          } catch {
            status[file] = false;
          }
        })
      );
      
      setFileStatus(status);
      setLoadingFiles(false);
    };

    checkFileStatus();
  }, []);

  // Set default laid out nodes
  const laidOutNodes = useMemo(() => {
    return layoutNodes(initialRawNodes, initialEdges);
  }, []);

  const [nodes, , onNodesChange] = useNodesState(laidOutNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeData((node.data as unknown as PipelineNodeData) || null);
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedNodeData(null);
  }, []);

  // Determine status of a step
  const getStepStatus = (step: PipelineStep): 'completed' | 'ready' | 'locked' => {
    if (loadingFiles) return 'locked';
    
    // If step has outputs, check if they exist
    const hasOutputs = step.outputs.length > 0;
    const outputsExist = hasOutputs && step.outputs.every(f => fileStatus[f] === true);
    
    if (hasOutputs && outputsExist) {
      return 'completed';
    }

    // Check if inputs exist
    const inputsExist = step.inputs.every(f => fileStatus[f] === true);
    if (inputsExist) {
      return 'ready';
    }

    return 'locked';
  };

  const activeStep = pipelineSteps.find(s => s.id === selectedStepId) || pipelineSteps[0];

  return (
    <div className="flex flex-col h-full w-full bg-canvas select-none">
      {/* Top Header Control Area */}
      <div className="h-14 bg-background-panel border-b border-border flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-3">
          <span className="text-xl">🗺️</span>
          <div className="flex flex-col">
            <h2 className="text-sm font-bold text-foreground leading-tight">Compilation Pipeline Map</h2>
            <p className="text-[10px] text-foreground-muted">Track database states, AI agent assignments, and execution order.</p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="pipeline-view-toggle">
          <button 
            className={`pipeline-toggle-btn ${viewMode === 'tracker' ? 'active' : ''}`}
            onClick={() => setViewMode('tracker')}
          >
            📋 Timeline Tracker
          </button>
          <button 
            className={`pipeline-toggle-btn ${viewMode === 'diagram' ? 'active' : ''}`}
            onClick={() => setViewMode('diagram')}
          >
            🔌 Blueprint Diagram
          </button>
        </div>
      </div>

      {viewMode === 'tracker' ? (
        /* Timeline Step Tracker View */
        <div className="pipeline-tracker-container flex-1">
          <div className="pipeline-tracker-main">
            {/* Iterative Warning/Info Card */}
            <div className="tracker-welcome-card">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                🔄 Iterative Zigzag Pipeline
              </h3>
              <p className="text-xs text-foreground-muted mt-1.5 leading-relaxed">
                Comic production is not purely linear. The process loops back and forth between the <strong>Scenario Planner</strong> and the <strong>Characters Hub</strong> to gradually refine character personalities, chapter pacing, and scene-level emotional dynamics.
              </p>
            </div>

            {/* Steps Timeline List */}
            <div className="tracker-steps-list">
              {pipelineSteps.map((step) => {
                const status = getStepStatus(step);
                const isActive = step.id === selectedStepId;
                
                return (
                  <div key={step.id} className="tracker-step-item">
                    {/* Circle timeline marker */}
                    <div className={`tracker-step-marker status-${status}`} />
                    
                    {/* Card content */}
                    <div 
                      className={`tracker-step-card ${isActive ? 'active' : ''}`}
                      onClick={() => setSelectedStepId(step.id)}
                      style={{
                        borderLeft: isActive ? `4px solid ${step.accentColor}` : undefined
                      }}
                    >
                      <div className="tracker-step-card-header">
                        <div className="tracker-step-title-group">
                          <span className="text-lg">{step.emoji}</span>
                          <h4 className="tracker-step-title">{step.title}</h4>
                          <span 
                            className="tracker-step-badge"
                            style={{ backgroundColor: step.accentColor }}
                          >
                            {step.badge}
                          </span>
                          {step.isLoopStep && (
                            <span className="tracker-step-loop-label">
                              Loop Beat
                            </span>
                          )}
                        </div>

                        <span className={`tracker-step-status-pill ${status}`}>
                          {status === 'completed' && '✓ Complete'}
                          {status === 'ready' && '➜ Ready'}
                          {status === 'locked' && '🔒 Locked'}
                        </span>
                      </div>

                      <p className="tracker-step-desc">{step.description}</p>
                      
                      {/* Short File Preview */}
                      <div className="tracker-step-files">
                        {step.inputs.map(file => (
                          <div key={file} className="tracker-step-file-item">
                            <span className="tracker-step-file-name">📥 {file}</span>
                            <span className={`tracker-step-file-status ${fileStatus[file] ? 'exists' : 'missing'}`}>
                              {fileStatus[file] ? 'EXISTS' : 'MISSING'}
                            </span>
                          </div>
                        ))}
                        {step.outputs.map(file => (
                          <div key={file} className="tracker-step-file-item">
                            <span className="tracker-step-file-name">📤 {file}</span>
                            <span className={`tracker-step-file-status ${fileStatus[file] ? 'exists' : 'missing'}`}>
                              {fileStatus[file] ? 'GENERATED' : 'NOT YET'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar Step Details */}
          <div className="tracker-sidebar-details border-l border-border bg-surface-raised flex flex-col h-full shrink-0">
            <div className="flex items-start justify-between pb-4 border-b border-border-subtle">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-mono tracking-widest text-muted">
                  Step Detail Inspection
                </span>
                <h2 className="text-base font-bold text-foreground">
                  {activeStep.title}
                </h2>
              </div>
              <span className="text-2xl">{activeStep.emoji}</span>
            </div>

            {/* Agent info */}
            {activeStep.agentName && (
              <div className="tracker-agent-card">
                <h4 className="tracker-agent-title">
                  🤖 {activeStep.agentName}
                </h4>
                <p className="tracker-agent-desc">
                  {activeStep.agentDesc}
                </p>
              </div>
            )}

            {/* Execution instructions */}
            {activeStep.instruction && (
              <div className="flex flex-col gap-2 p-4 bg-secondary rounded-xl border border-border">
                <span className="text-[10px] uppercase font-mono tracking-wider text-muted">
                  User Workspace Goal
                </span>
                <p className="text-xs text-foreground leading-relaxed">
                  {activeStep.instruction}
                </p>
              </div>
            )}

            {/* Outputs checklist */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-muted">
                File Dependencies
              </span>
              <div className="flex flex-col gap-1.5">
                {activeStep.inputs.map(file => (
                  <div key={file} className="flex justify-between items-center py-1.5 px-3 bg-secondary/40 border border-border rounded-lg text-xs">
                    <span className="font-mono text-[11px] text-foreground-muted truncate max-w-[200px]">
                      📥 {file}
                    </span>
                    <span className={`font-bold font-mono text-[10px] ${fileStatus[file] ? 'text-success' : 'text-danger'}`}>
                      {fileStatus[file] ? '✓ READABLE' : '✗ REQUIRED'}
                    </span>
                  </div>
                ))}
                {activeStep.outputs.map(file => (
                  <div key={file} className="flex justify-between items-center py-1.5 px-3 bg-secondary/40 border border-border rounded-lg text-xs">
                    <span className="font-mono text-[11px] text-foreground-muted truncate max-w-[200px]">
                      📤 {file}
                    </span>
                    <span className={`font-bold font-mono text-[10px] ${fileStatus[file] ? 'text-success' : 'text-foreground-muted'}`}>
                      {fileStatus[file] ? '✓ CREATED' : '✗ PENDING'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Jump Button */}
            <div className="mt-auto pt-4 border-t border-border-subtle">
              <button
                onClick={() => onPhaseChange(activeStep.phaseId)}
                className="tracker-action-btn"
                style={{
                  background: activeStep.accentColor
                }}
              >
                Go to Workspace ➜
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Original React Flow Blueprint Diagram View */
        <div className="flex flex-1 overflow-hidden relative">
          <div className="flex-1 h-full relative">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={handleNodeClick}
              onPaneClick={handlePaneClick}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              proOptions={{ hideAttribution: true }}
            >
              <Controls
                showInteractive={false}
                style={{ background: 'var(--panel-bg)', border: '1px solid var(--border-color)', borderRadius: 8 }}
              />
              <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgba(255, 255, 255, 0.08)" />
            </ReactFlow>

            <div className="absolute top-4 left-4 z-10 pointer-events-none">
              <div className="bg-surface/90 backdrop-blur-md border border-border p-4 rounded-xl shadow-lg max-w-sm">
                <h2 className="text-base font-bold text-foreground">Pipeline Blueprint</h2>
                <p className="text-xs text-foreground-muted mt-1 leading-relaxed">
                  Interactive structural map of the Comic Studio 3.0 compilation engine. Select elements to inspect data streams and navigate the workflow.
                </p>
                <div className="flex gap-4 mt-3 pt-3 border-t border-border-subtle text-[10px] text-foreground-muted font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-blue-500 inline-block"></span>
                    <span>Phases</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded border border-dashed border-danger inline-block bg-danger-dim/10"></span>
                    <span>Data Files</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full border border-warning inline-block bg-warning/10"></span>
                    <span>AI Agents</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Inspector Panel */}
          <div className="w-[340px] border-l border-border bg-surface-raised flex flex-col shadow-2xl h-full select-none z-10 shrink-0">
            {selectedNodeData ? (
              <div className="flex-1 flex flex-col p-6 overflow-y-auto">
                {/* Header */}
                <div className="flex items-start justify-between pb-4 border-b border-border-subtle mb-5">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-muted">
                      {selectedNodeData.type === 'phase' && `Phase Node`}
                      {selectedNodeData.type === 'file' && `Database File`}
                      {selectedNodeData.type === 'agent' && `AI Core Agent`}
                    </span>
                    <h2 className="text-lg font-bold font-heading text-foreground">
                      {selectedNodeData.label}
                    </h2>
                  </div>
                  {selectedNodeData.emoji && (
                    <span className="text-3xl select-none">{selectedNodeData.emoji}</span>
                  )}
                </div>

                {/* Content info */}
                <div className="flex-1 flex flex-col gap-5">
                  <div>
                    <span className="text-[11px] font-bold text-foreground-muted uppercase tracking-wider block mb-2">
                      Overview Description
                    </span>
                    <p className="text-sm text-foreground-muted leading-relaxed">
                      {selectedNodeData.description}
                    </p>
                  </div>

                  {/* Conditionally show badge detail */}
                  {selectedNodeData.badge && (
                    <div className="flex justify-between items-center py-2 px-3 bg-secondary rounded-lg border border-border">
                      <span className="text-xs text-muted">Process Sequence</span>
                      <span className="text-xs font-mono font-bold text-accent-primary uppercase tracking-wider">
                        {selectedNodeData.badge}
                      </span>
                    </div>
                  )}

                  {/* Inputs/Outputs if it is a phase */}
                  {selectedNodeData.type === 'phase' && (
                    <>
                      {selectedNodeData.inputs && selectedNodeData.inputs.length > 0 && (
                        <div>
                          <span className="text-[11px] font-bold text-foreground-muted uppercase tracking-wider block mb-2">
                            Dependencies (Reads)
                          </span>
                          <div className="flex flex-col gap-1.5">
                            {selectedNodeData.inputs.map((inp) => (
                              <div
                                key={inp}
                                className="font-mono text-xs text-danger py-1 px-2 rounded bg-danger-dim/5 border border-danger/10 truncate"
                              >
                                📄 {inp}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedNodeData.outputs && selectedNodeData.outputs.length > 0 && (
                        <div>
                          <span className="text-[11px] font-bold text-foreground-muted uppercase tracking-wider block mb-2">
                            Outputs Generated (Writes)
                          </span>
                          <div className="flex flex-col gap-1.5">
                            {selectedNodeData.outputs.map((out) => (
                              <div
                                key={out}
                                className="font-mono text-xs text-success py-1 px-2 rounded bg-success-dim/5 border border-success/10 truncate"
                              >
                                💾 {out}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Navigation trigger button */}
                      {selectedNodeData.activePhaseId && (
                        <button
                          onClick={() => onPhaseChange(selectedNodeData.activePhaseId)}
                          className="mt-4 w-full py-3 px-4 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:bg-primary-hover transition-all hover:-translate-y-0.5"
                        >
                          Open Phase Space ➔
                        </button>
                      )}
                    </>
                  )}

                  {/* Details if file */}
                  {selectedNodeData.type === 'file' && (
                    <div className="text-xs text-foreground-muted flex flex-col gap-3">
                      <div className="p-3 bg-secondary rounded-lg border border-border">
                        <span className="font-mono text-foreground font-medium break-all block mb-1">
                          {selectedNodeData.label}
                        </span>
                        <span className="text-[10px] text-muted font-mono block">
                          Type: JSON Structured Data
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Details if agent */}
                  {selectedNodeData.type === 'agent' && (
                    <div className="text-xs text-foreground-muted flex flex-col gap-3">
                      <div className="p-3 bg-secondary rounded-lg border border-border flex items-center justify-between">
                        <span className="text-foreground font-medium">Agent Status</span>
                        <span className="px-2 py-0.5 rounded bg-success-dim text-success font-bold font-mono text-[10px]">
                          READY
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none">
                <div className="text-4xl opacity-50 mb-3">🗺️</div>
                <h3 className="text-base font-bold text-foreground">Inspection Desk</h3>
                <p className="text-xs text-foreground-muted max-w-[240px] mt-1.5 leading-relaxed">
                  Click on any node in the React Flow diagram to inspect details, explore data dependencies, and navigate across the workspaces.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
