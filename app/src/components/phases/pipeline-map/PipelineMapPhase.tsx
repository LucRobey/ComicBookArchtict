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

  // Phase 0: Raw World Building
  {
    id: 'lore_phase',
    type: 'pipelineNode',
    position: { x: 0, y: 0 },
    data: {
      id: 'lore_phase',
      label: 'Raw World Building',
      type: 'phase',
      emoji: '🌍',
      description: 'Establishes the raw universe lore, key factions, global settings, and initial story concept rules.',
      badge: 'Phase 0',
      accentColor: '#8b5cf6',
      activePhaseId: 'lore',
      inputs: [],
      outputs: ['data/user_lore.json', 'data/geography.json'],
    },
  },

  // Phase 0.5: Style Research
  {
    id: 'style_research',
    type: 'pipelineNode',
    position: { x: 0, y: 0 },
    data: {
      id: 'style_research',
      label: 'Style Research',
      type: 'phase',
      emoji: '🔍',
      description: 'Researches and extracts reference comic layout grids, narrative styles, visual DNA, and scripting conventions.',
      badge: 'Phase 0.5',
      accentColor: '#3b82f6',
      activePhaseId: 'lore',
      inputs: [],
      outputs: ['data/panel_style.json', 'data/script_style.json', 'data/lore_style.json', 'data/visual_style.json'],
    },
  },

  // Phase 0.6: Lore Merging
  {
    id: 'lore_merge',
    type: 'pipelineNode',
    position: { x: 0, y: 0 },
    data: {
      id: 'lore_merge',
      label: 'Lore Merging',
      type: 'phase',
      emoji: '🌪️',
      description: 'Blends user story ideas with style tropes to output a unified active series bible.',
      badge: 'Phase 0.6',
      accentColor: '#10b981',
      activePhaseId: 'lore',
      inputs: ['data/user_lore.json', 'data/lore_style.json', 'data/visual_style.json'],
      outputs: ['data/final_lore.json'],
    },
  },

  // Phase 0.2: Scenario Development
  {
    id: 'scenario_phase',
    type: 'pipelineNode',
    position: { x: 0, y: 0 },
    data: {
      id: 'scenario_phase',
      label: 'Scenario Development',
      type: 'phase',
      emoji: '📝',
      description: 'Builds the narrative framework: scenario synopsis, chapter breakdown, and scene outline list.',
      badge: 'Phase 0.2',
      accentColor: '#ec4899',
      activePhaseId: 'scenario',
      inputs: ['data/final_lore.json', 'data/scenario_inputs.json'],
      outputs: ['data/scenario_synopsis.json', 'data/scenario_chapters.json', 'data/scenario_scenes.json'],
    },
  },

  // Phase 0.7: Characters Hub & Moods
  {
    id: 'charhub_phase',
    type: 'pipelineNode',
    position: { x: 0, y: 0 },
    data: {
      id: 'charhub_phase',
      label: 'Characters Hub',
      type: 'phase',
      emoji: '👤',
      description: 'Generates character personality signatures, turnaround sheets, emotional state portraits, and simulates mood matrices.',
      badge: 'Phase 0.7',
      accentColor: '#6366f1',
      activePhaseId: 'char-hub',
      inputs: ['data/final_lore.json', 'data/scenario_scenes.json'],
      outputs: ['data/character_moods.json', 'data/characters/[Name]/personality_signature.json'],
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
      inputs: ['data/final_lore.json', 'data/characters/[Name]/personality_signature.json'],
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
      inputs: ['data/scene_script.json'],
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
      description: 'Divides page-level action into detailed panel templates, framing, and compositions, guided by layout grids.',
      badge: 'Phase 2',
      accentColor: '#10b981',
      activePhaseId: 'panels',
      inputs: ['data/pages.json', 'data/intro_pages.json', 'data/final_lore.json', 'data/panel_style.json', 'data/scene_script.json'],
      outputs: ['data/panels.json'],
    },
  },

  // Phase 3A: Script (Scene)
  {
    id: 'script_scene_phase',
    type: 'pipelineNode',
    position: { x: 0, y: 0 },
    data: {
      id: 'script_scene_phase',
      label: 'Script (Scene)',
      type: 'phase',
      emoji: '✍️🎬',
      description: 'Writes the narrative scene-level script beats: dialogues, narrations, SFX, and silences.',
      badge: 'Phase 3A',
      accentColor: '#f97316',
      activePhaseId: 'script',
      inputs: ['data/scenario_scenes.json', 'data/final_lore.json', 'data/script_style.json'],
      outputs: ['data/scene_script.json'],
    },
  },

  // Phase 3B: Script (Panel)
  {
    id: 'script_panel_phase',
    type: 'pipelineNode',
    position: { x: 0, y: 0 },
    data: {
      id: 'script_panel_phase',
      label: 'Script (Panel)',
      type: 'phase',
      emoji: '✍️📐',
      description: 'Maps scene beats to panels, determines reading flow, acting directions, and bubble placement details.',
      badge: 'Phase 3B',
      accentColor: '#ea580c',
      activePhaseId: 'script',
      inputs: ['data/scene_script.json', 'data/panels.json', 'data/script_style.json', 'data/final_lore.json'],
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
    id: 'file_user_lore',
    type: 'pipelineNode',
    position: { x: 0, y: 0 },
    data: {
      id: 'file_user_lore',
      label: 'data/user_lore.json',
      type: 'file',
      description: 'User raw world building rules, core conflict, and genre ideas.',
    },
  },
  {
    id: 'file_lore_style',
    type: 'pipelineNode',
    position: { x: 0, y: 0 },
    data: {
      id: 'file_lore_style',
      label: 'data/lore_style.json',
      type: 'file',
      description: 'Extracted thematic tropes, rules, and archetypes from reference comic.',
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
      description: 'Art direction reference, universal style seeds, color tokens, and visual rules configuration.',
    },
  },
  {
    id: 'file_panel_style',
    type: 'pipelineNode',
    position: { x: 0, y: 0 },
    data: {
      id: 'file_panel_style',
      label: 'data/panel_style.json',
      type: 'file',
      description: 'Layout grids, aspect ratios, gutters, reading flow, and CSS grid templates.',
    },
  },
  {
    id: 'file_script_style',
    type: 'pipelineNode',
    position: { x: 0, y: 0 },
    data: {
      id: 'file_script_style',
      label: 'data/script_style.json',
      type: 'file',
      description: 'Dialogue density, average word counts, narration rules, and styling anti-patterns.',
    },
  },
  {
    id: 'file_final_lore',
    type: 'pipelineNode',
    position: { x: 0, y: 0 },
    data: {
      id: 'file_final_lore',
      label: 'data/final_lore.json',
      type: 'file',
      description: 'Blended world scenario bible combining user world and style tropes.',
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
      label: 'data/characters/[Name]/personality_signature.json',
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
      description: 'Character emotional trajectories simulated at scene level.',
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
    id: 'file_scene_script',
    type: 'pipelineNode',
    position: { x: 0, y: 0 },
    data: {
      id: 'file_scene_script',
      label: 'data/scene_script.json',
      type: 'file',
      description: 'Narrative scene-level script containing story beats, dialogue text, and sound effects.',
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
    id: 'agent_research',
    type: 'pipelineNode',
    position: { x: 0, y: 0 },
    data: {
      id: 'agent_research',
      label: 'Style Researcher Agent',
      type: 'agent',
      description: 'Performs targeted web searches to compile layouts, writing, and lore conventions.',
    },
  },
  {
    id: 'agent_merge',
    type: 'pipelineNode',
    position: { x: 0, y: 0 },
    data: {
      id: 'agent_merge',
      label: 'Lore Merging Agent',
      type: 'agent',
      description: 'Blends world concepts and style rules into final_lore.json bible.',
    },
  },
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
    id: 'agent_scene_scripting',
    type: 'pipelineNode',
    position: { x: 0, y: 0 },
    data: {
      id: 'agent_scene_scripting',
      label: 'Scene Scripting Agent',
      type: 'agent',
      description: 'Writes the narrative scene-level beats (dialogues, narration, SFX) based on story bible.',
    },
  },
  {
    id: 'agent_panel_scripting',
    type: 'pipelineNode',
    position: { x: 0, y: 0 },
    data: {
      id: 'agent_panel_scripting',
      label: 'Panel Scripting Agent',
      type: 'agent',
      description: 'Assigns beats to panels, configures bubbles reading order, and defines acting instructions.',
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
  // ─── MAIN PROCESS FLOW ───────────────────────────────────

  // Lore → Style Research
  { id: 'e_lore_sr', source: 'lore_phase', target: 'style_research', type: 'smoothstep', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2.5 } },
  // Style Research → Lore Merge
  { id: 'e_sr_lm', source: 'style_research', target: 'lore_merge', type: 'smoothstep', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2.5 } },
  // Lore Merge → Scenario
  { id: 'e_lm_sc', source: 'lore_merge', target: 'scenario_phase', type: 'smoothstep', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2.5 } },
  // Scenario → CharHub
  { id: 'e_sc_ch', source: 'scenario_phase', target: 'charhub_phase', type: 'smoothstep', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2.5 } },
  // Scenario → Intro (Parallel character intros)
  { id: 'e_ch_intro', source: 'charhub_phase', target: 'intro_phase', type: 'smoothstep', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2.5 } },

  // New sequence: CharHub -> Script Scene -> Pacing -> Panels & Panel Script (parallel)
  { id: 'e_ch_scrip_scene', source: 'charhub_phase', target: 'script_scene_phase', type: 'smoothstep', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2.5 } },
  { id: 'e_scrip_scene_pace', source: 'script_scene_phase', target: 'pacing_phase', type: 'smoothstep', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2.5 } },
  
  // Parallel fork after Pacing:
  { id: 'e_pace_pan', source: 'pacing_phase', target: 'panels_phase', type: 'smoothstep', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2.5 } },
  { id: 'e_pace_scrip_panel', source: 'pacing_phase', target: 'script_panel_phase', type: 'smoothstep', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2.5 } },

  // Intro page maps into panels
  { id: 'e_intro_pan', source: 'intro_phase', target: 'panels_phase', type: 'smoothstep', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2.5 } },

  // Convergence at assembly
  { id: 'e_pan_assemb', source: 'panels_phase', target: 'assembly_phase', type: 'smoothstep', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2.5 } },
  { id: 'e_scrip_panel_assemb', source: 'script_panel_phase', target: 'assembly_phase', type: 'smoothstep', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2.5 } },

  // ─── FILE DATA FLOWS ────────────────────────────────────

  // Lore outputs
  { id: 'e_lore_fuser', source: 'lore_phase', target: 'file_user_lore', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },

  // Style Research outputs
  { id: 'e_sr_fls', source: 'style_research', target: 'file_lore_style', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },
  { id: 'e_sr_fvs', source: 'style_research', target: 'file_visual_style', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },
  { id: 'e_sr_fps', source: 'style_research', target: 'file_panel_style', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },
  { id: 'e_sr_fss', source: 'style_research', target: 'file_script_style', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },

  // Lore Merge inputs
  { id: 'e_fuser_lm', source: 'file_user_lore', target: 'lore_merge', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },
  { id: 'e_fls_lm', source: 'file_lore_style', target: 'lore_merge', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },
  { id: 'e_fvs_lm', source: 'file_visual_style', target: 'lore_merge', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },

  // Lore Merge outputs
  { id: 'e_lm_fflore', source: 'lore_merge', target: 'file_final_lore', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },

  // Scenario inputs
  { id: 'e_fflore_sc', source: 'file_final_lore', target: 'scenario_phase', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },
  { id: 'e_fsinp_sc', source: 'file_scenario_inputs', target: 'scenario_phase', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },

  // Scenario outputs
  { id: 'e_sc_fsig', source: 'scenario_phase', target: 'file_signatures', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },
  { id: 'e_sc_fchap', source: 'scenario_phase', target: 'file_chapters', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },
  { id: 'e_sc_fscenes', source: 'scenario_phase', target: 'file_scenes', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },

  // CharHub inputs
  { id: 'e_fflore_ch', source: 'file_final_lore', target: 'charhub_phase', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },
  { id: 'e_fscenes_ch', source: 'file_scenes', target: 'charhub_phase', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },
  { id: 'e_fsig_ch', source: 'file_signatures', target: 'charhub_phase', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },
  { id: 'e_fvs_ch', source: 'file_visual_style', target: 'charhub_phase', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },

  // CharHub outputs
  { id: 'e_ch_fmoods', source: 'charhub_phase', target: 'file_moods', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },

  // Downstream file flows
  { id: 'e_fflore_intro', source: 'file_final_lore', target: 'intro_phase', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },
  { id: 'e_fsig_intro', source: 'file_signatures', target: 'intro_phase', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },
  { id: 'e_intro_fintro', source: 'intro_phase', target: 'file_intro', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },

  // Scene Script (3A) file flows
  { id: 'e_fscenes_scrip_scene', source: 'file_scenes', target: 'script_scene_phase', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },
  { id: 'e_fflore_scrip_scene', source: 'file_final_lore', target: 'script_scene_phase', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },
  { id: 'e_fss_scrip_scene', source: 'file_script_style', target: 'script_scene_phase', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },
  { id: 'e_scrip_scene_fsscene', source: 'script_scene_phase', target: 'file_scene_script', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },

  // Pacing inputs
  { id: 'e_fsscene_pace', source: 'file_scene_script', target: 'pacing_phase', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },
  { id: 'e_pace_fpages', source: 'pacing_phase', target: 'file_pages', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },

  // Panel layout (2) inputs
  { id: 'e_fpages_pan', source: 'file_pages', target: 'panels_phase', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },
  { id: 'e_fintro_pan', source: 'file_intro', target: 'panels_phase', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },
  { id: 'e_fflore_pan', source: 'file_final_lore', target: 'panels_phase', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },
  { id: 'e_fps_pan', source: 'file_panel_style', target: 'panels_phase', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },
  { id: 'e_fsscene_pan', source: 'file_scene_script', target: 'panels_phase', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },
  { id: 'e_pan_fpanels', source: 'panels_phase', target: 'file_panels', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },

  // Panel Script (3B) file flows
  { id: 'e_fsscene_scrip_panel', source: 'file_scene_script', target: 'script_panel_phase', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },
  { id: 'e_fpanels_scrip_panel', source: 'file_panels', target: 'script_panel_phase', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },
  { id: 'e_fss_scrip_panel', source: 'file_script_style', target: 'script_panel_phase', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },
  { id: 'e_fflore_scrip_panel', source: 'file_final_lore', target: 'script_panel_phase', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },
  { id: 'e_scrip_panel_fscript', source: 'script_panel_phase', target: 'file_script', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },

  // Assembly inputs
  { id: 'e_fscript_assemb', source: 'file_script', target: 'assembly_phase', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },
  { id: 'e_fpanels_assemb', source: 'file_panels', target: 'assembly_phase', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },
  { id: 'e_assemb_ffinal', source: 'assembly_phase', target: 'file_final', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.2, opacity: 0.6 } },

  // ─── AGENT CONNECTIONS ───────────────────────────────────

  { id: 'e_sr_ares', source: 'style_research', target: 'agent_research', type: 'smoothstep', style: { stroke: '#f59e0b', strokeWidth: 1.2, strokeDasharray: '4 4', opacity: 0.6 } },
  { id: 'e_lm_amrg', source: 'lore_merge', target: 'agent_merge', type: 'smoothstep', style: { stroke: '#f59e0b', strokeWidth: 1.2, strokeDasharray: '4 4', opacity: 0.6 } },
  { id: 'e_sc_aperson', source: 'scenario_phase', target: 'agent_personality', type: 'smoothstep', style: { stroke: '#f59e0b', strokeWidth: 1.2, strokeDasharray: '4 4', opacity: 0.6 } },
  { id: 'e_ch_amood', source: 'charhub_phase', target: 'agent_mood', type: 'smoothstep', style: { stroke: '#f59e0b', strokeWidth: 1.2, strokeDasharray: '4 4', opacity: 0.6 } },
  { id: 'e_ch_avisual', source: 'charhub_phase', target: 'agent_visual', type: 'smoothstep', style: { stroke: '#f59e0b', strokeWidth: 1.2, strokeDasharray: '4 4', opacity: 0.6 } },
  { id: 'e_intro_aintro', source: 'intro_phase', target: 'agent_intro', type: 'smoothstep', style: { stroke: '#f59e0b', strokeWidth: 1.2, strokeDasharray: '4 4', opacity: 0.6 } },
  { id: 'e_pace_apace', source: 'pacing_phase', target: 'agent_pacing', type: 'smoothstep', style: { stroke: '#f59e0b', strokeWidth: 1.2, strokeDasharray: '4 4', opacity: 0.6 } },
  { id: 'e_pan_astruct', source: 'panels_phase', target: 'agent_structuring', type: 'smoothstep', style: { stroke: '#f59e0b', strokeWidth: 1.2, strokeDasharray: '4 4', opacity: 0.6 } },
  { id: 'e_scrip_scene_ase_scene', source: 'script_scene_phase', target: 'agent_scene_scripting', type: 'smoothstep', style: { stroke: '#f59e0b', strokeWidth: 1.2, strokeDasharray: '4 4', opacity: 0.6 } },
  { id: 'e_scrip_panel_ase_panel', source: 'script_panel_phase', target: 'agent_panel_scripting', type: 'smoothstep', style: { stroke: '#f59e0b', strokeWidth: 1.2, strokeDasharray: '4 4', opacity: 0.6 } },
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
    id: 'raw_world',
    phaseId: 'lore',
    badge: 'Phase 0',
    title: 'Raw World Building',
    emoji: '🌍',
    description: 'Establishes the raw universe lore, key factions, global settings, and initial story concept rules.',
    accentColor: '#8b5cf6',
    inputs: [],
    outputs: ['data/user_lore.json', 'data/geography.json'],
    instruction: 'Define your raw story ideas, non-negotiable rules, setting, and geography elements.'
  },
  {
    id: 'style_research',
    phaseId: 'lore',
    badge: 'Phase 0.5',
    title: 'Style Research',
    emoji: '🔍',
    description: 'Researches and extracts reference comic layout grids, narrative styles, visual DNA, and scripting conventions.',
    accentColor: '#3b82f6',
    inputs: [],
    outputs: ['data/panel_style.json', 'data/script_style.json', 'data/lore_style.json', 'data/visual_style.json'],
    agentName: 'Style Researcher Agent',
    agentDesc: 'Performs targeted web searches to analyze visual layouts, writing styles, and aesthetic details.',
    instruction: 'Confirm the reference comic and review the extracted layout rules, writing conventions, and visual prompts.'
  },
  {
    id: 'lore_merge',
    phaseId: 'lore',
    badge: 'Phase 0.6',
    title: 'Lore Merging',
    emoji: '🌪️',
    description: 'Blends the user story ideas with style tropes to output a unified active series bible.',
    accentColor: '#10b981',
    inputs: ['data/user_lore.json', 'data/lore_style.json', 'data/visual_style.json'],
    outputs: ['data/final_lore.json'],
    agentName: 'Lore Merging Agent',
    agentDesc: 'Mixes world genres, setting eras, and conflict dynamics to produce a blended story bible.',
    instruction: 'Click Mix World & Style in the blended tab to programmatically merge story rules.'
  },
  {
    id: 'scenario',
    phaseId: 'scenario',
    badge: 'Phase 0.2',
    title: 'Scenario Development',
    emoji: '📝',
    description: 'Builds the narrative framework: scenario synopsis, chapter breakdown, and scene outline list.',
    accentColor: '#ec4899',
    inputs: ['data/final_lore.json', 'data/scenario_inputs.json'],
    outputs: ['data/scenario_synopsis.json', 'data/scenario_chapters.json', 'data/scenario_scenes.json'],
    agentName: 'Scenario Architect Agent',
    agentDesc: 'Transforms themes and outlines into story arcs, chapter breakdowns, and scene cards.',
    instruction: 'Build the synopsis and outline chapter lists, then expand chapters into granular scene lists.'
  },
  {
    id: 'char_hub',
    phaseId: 'char-hub',
    badge: 'Phase 0.7',
    title: 'Characters Hub',
    emoji: '👤',
    description: 'Generates personality signatures, turnaround sheets, emotional state portraits, and scene mood matrices.',
    accentColor: '#6366f1',
    inputs: ['data/final_lore.json', 'data/scenario_scenes.json'],
    outputs: ['data/character_moods.json', 'data/characters/[Name]/personality_signature.json'],
    agentName: 'Character Foundation Agent',
    agentDesc: 'Simulates character emotional trajectories scene-by-scene and creates target styling portraits.',
    instruction: 'Review character signatures and visual sheets, and refine scene emotional trajectories.'
  },
  {
    id: 'script_scene',
    phaseId: 'script',
    badge: 'Phase 3A',
    title: 'Script (Scene)',
    emoji: '✍️🎬',
    description: 'Writes the narrative scene-level script beats: dialogue, narration overlays, SFX, and silences.',
    accentColor: '#f97316',
    inputs: ['data/scenario_scenes.json', 'data/final_lore.json', 'data/script_style.json'],
    outputs: ['data/scene_script.json'],
    agentName: 'Scene Scripting Agent',
    agentDesc: 'Translates scene actions and character personalities into chronological story beats and text.',
    instruction: 'Review and refine dialogue lines, narration tone, and story beats at the scene level.'
  },
  {
    id: 'intro',
    phaseId: 'intro',
    badge: 'Phase 1',
    title: "Characters' Intro",
    emoji: '🎭',
    description: 'Orchestrates dynamic introduction splash layouts for primary scenario characters based on their personality signatures and lore.',
    accentColor: '#f59e0b',
    inputs: ['data/final_lore.json', 'data/characters/[Name]/personality_signature.json'],
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
    inputs: ['data/scene_script.json'],
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
    description: 'Divides page-level action into detailed panel templates with framing, compositions, and camera directions (designed in parallel with scripting).',
    accentColor: '#10b981',
    inputs: ['data/pages.json', 'data/intro_pages.json', 'data/final_lore.json', 'data/panel_style.json', 'data/scene_script.json'],
    outputs: ['data/panels.json'],
    agentName: 'Panel Composition Agent',
    agentDesc: 'Generates comic grid configurations, panel compositions, and framing descriptions.',
    instruction: 'Adjust camera angles, panels configurations, and confirm visual panel layout templates.'
  },
  {
    id: 'script_panel',
    phaseId: 'script',
    badge: 'Phase 3B',
    title: 'Script (Panel)',
    emoji: '✍️📐',
    description: 'Distributes narrative beats to specific panels, defining reading flow, balloon shapes, and acting directions (designed in parallel with panel structure).',
    accentColor: '#ea580c',
    inputs: ['data/scene_script.json', 'data/panels.json', 'data/script_style.json', 'data/final_lore.json'],
    outputs: ['data/script.json'],
    agentName: 'Panel Scripting Agent',
    agentDesc: 'Aligns dialogue beats with panels structure, sets speech balloon types, and assigns gaze directions.',
    instruction: 'Adjust balloon placements, acting performance notes, and verify balloon-to-panel proportions.'
  },
  {
    id: 'assembly',
    phaseId: 'assembly',
    badge: 'Phase 6',
    title: 'Assembly Studio',
    emoji: '🧩',
    description: 'Brings script bubbles, graphics overlay grids, and generated panel artwork onto the final page layouts.',
    accentColor: '#3b82f6',
    inputs: ['data/script.json', 'data/panels.json'],
    outputs: ['pages/page_N/final.png'],
    agentName: 'Page Renderer Agent',
    agentDesc: 'Handles lettering layers compositing and wraps artwork into standard SVG/PNG canvas layouts.',
    instruction: 'Finalize lettering sizing, check panel boundaries, and run the production page export pipeline.'
  }
];

export const PipelineMapPhase: React.FC<PipelineMapPhaseProps> = ({ onPhaseChange }) => {
  const [viewMode, setViewMode] = useState<'tracker' | 'diagram'>('tracker');
  const [selectedNodeData, setSelectedNodeData] = useState<PipelineNodeData | null>(null);
  const [selectedStepId, setSelectedStepId] = useState<string>('raw_world');

  // File existence check state
  const [fileStatus, setFileStatus] = useState<Record<string, boolean>>({});
  const [loadingFiles, setLoadingFiles] = useState(true);

  React.useEffect(() => {
    const checkFileStatus = async () => {
      const allFiles = [
        'data/user_lore.json',
        'data/lore_style.json',
        'data/visual_style.json',
        'data/panel_style.json',
        'data/script_style.json',
        'data/final_lore.json',
        'data/geography.json',
        'data/scenario_inputs.json',
        'data/characters/[Name]/personality_signature.json',
        'data/scenario_synopsis.json',
        'data/scenario_chapters.json',
        'data/character_moods.json',
        'data/scenario_scenes.json',
        'data/intro_pages.json',
        'data/pages.json',
        'data/panels.json',
        'data/scene_script.json',
        'data/script.json',
      ];
      
      const status: Record<string, boolean> = {};
      
      await Promise.all(
        allFiles.map(async (file) => {
          try {
            // Resolve [Name] variable to CHARACTER_A for proxy checking
            const pathToCheck = file.replace('[Name]', 'CHARACTER_A');
            const res = await fetch(`/api/load?path=${encodeURIComponent(pathToCheck)}`);
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
    <div className="flex flex-col h-full w-full min-h-0 overflow-hidden bg-canvas select-none">
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
