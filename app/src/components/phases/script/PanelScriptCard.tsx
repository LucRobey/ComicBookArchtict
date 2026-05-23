import React, { useState } from 'react';
import DialogueLine, { type Dialogue } from './DialogueLine';
import LetteringBlock, { type Lettering } from './LetteringBlock';
import '../../../styles/script.css';

/* ── Panel interface (v2.0 + legacy compat) ──────────── */

export interface Panel {
  panel_number: number;
  panel_id?: string;
  scene_id?: number;
  framing: string;
  action: string;
  beats_assigned?: string[];
  lettering?: Lettering;
  acting_direction?: Record<string, {
    expression: string;
    body_language: string;
    gaze_direction: string;
    micro_action: string;
  }>;
  panel_rhythm?: string;
  reader_focus?: string;
  panel_tension?: string;
  /** Legacy field — keep for backward compatibility */
  dialogues?: Dialogue[];
}

interface PanelScriptCardProps {
  panel: Panel;
  pageNumber: number;
  onSaveDialogue: (panelNumber: number, updated: Dialogue) => void;
  onFlagDialogue: (dialogue: Dialogue) => void;
  onFlagPanel: (panelNumber: number) => void;
}

/* ── Color maps ──────────────────────────────────────── */

const FRAMING_COLORS: Record<string, string> = {
  'Wide Establishing Shot': '#06b6d4',
  'Wide establishing shot':  '#06b6d4',
  'Medium shot':             '#3b82f6',
  'Medium two-shot':         '#3b82f6',
  'Close-up':                '#f97316',
  'Extreme close-up':        '#ef4444',
  'Over-the-shoulder':       '#8b5cf6',
  'Dynamic low angle':       '#ec4899',
  "Bird's eye view":         '#10b981',
  'POV shot':                '#f59e0b',
};

const RHYTHM_COLORS: Record<string, string> = {
  establishing:    '#06b6d4',
  slow_build:      '#3b82f6',
  conversational:  '#10b981',
  rapid_exchange:  '#f97316',
  reaction_beat:   '#8b5cf6',
  punchline:       '#ec4899',
  silence_beat:    '#64748b',
  climax:          '#ef4444',
  denouement:      '#94a3b8',
};

const TENSION_COLORS: Record<string, string> = {
  low:    '#10b981',
  medium: '#f59e0b',
  high:   '#ef4444',
};

function formatLabel(raw: string): string {
  return raw.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/* ── Component ───────────────────────────────────────── */

const PanelScriptCard: React.FC<PanelScriptCardProps> = ({
  panel, onSaveDialogue, onFlagDialogue, onFlagPanel,
}) => {
  const framingColor = FRAMING_COLORS[panel.framing] ?? '#64748b';
  const [actingOpen, setActingOpen] = useState(false);

  const hasLettering = panel.lettering && (
    (panel.lettering.speech_balloons?.length ?? 0) > 0 ||
    (panel.lettering.captions?.length ?? 0) > 0 ||
    (panel.lettering.sfx?.length ?? 0) > 0
  );

  return (
    <div className="panel-script-card">
      {/* ── Header ── */}
      <div className="panel-script-header">
        <div className="panel-script-meta">
          <span className="panel-num">Panel {panel.panel_number}</span>
          {panel.panel_id && (
            <span className="beat-ref-tag">{panel.panel_id}</span>
          )}
          <span
            className="panel-framing-badge"
            style={{
              background: `${framingColor}22`,
              color: framingColor,
              border: `1px solid ${framingColor}66`,
            }}
          >
            {panel.framing}
          </span>
        </div>
        <button
          className="flag-panel-btn"
          onClick={() => onFlagPanel(panel.panel_number)}
          title="Flag entire panel for agent"
        >
          🚩 Flag Panel
        </button>
      </div>

      {/* ── Action text ── */}
      <p className="panel-action-text">{panel.action}</p>

      {/* ── v2.0 metadata row ── */}
      <div className="panel-v2-meta-row">
        {/* Panel rhythm badge */}
        {panel.panel_rhythm && (() => {
          const rhythmColor = RHYTHM_COLORS[panel.panel_rhythm] ?? '#64748b';
          return (
            <span
              className="panel-rhythm-badge"
              style={{
                background: `${rhythmColor}1a`,
                color: rhythmColor,
                border: `1px solid ${rhythmColor}55`,
              }}
            >
              🎵 {formatLabel(panel.panel_rhythm)}
            </span>
          );
        })()}

        {/* Panel tension badge */}
        {panel.panel_tension && (() => {
          const tensionColor = TENSION_COLORS[panel.panel_tension] ?? '#64748b';
          return (
            <span
              className="panel-tension-badge"
              style={{
                background: `${tensionColor}1a`,
                color: tensionColor,
                border: `1px solid ${tensionColor}55`,
              }}
            >
              ⚡ {formatLabel(panel.panel_tension)} tension
            </span>
          );
        })()}

        {/* Reader focus */}
        {panel.reader_focus && (
          <span className="panel-reader-focus">
            🎯 Focus: {panel.reader_focus}
          </span>
        )}
      </div>

      {/* ── Beats assigned ── */}
      {panel.beats_assigned && panel.beats_assigned.length > 0 && (
        <div className="panel-beats-row">
          <span className="panel-beats-label">Beats:</span>
          {panel.beats_assigned.map(b => (
            <span className="beat-ref-tag" key={b}>{b}</span>
          ))}
        </div>
      )}

      {/* ── Lettering (v2.0) or legacy dialogues ── */}
      {hasLettering ? (
        <LetteringBlock lettering={panel.lettering!} />
      ) : (
        <div className="dialogue-list">
          {!panel.dialogues || panel.dialogues.length === 0 ? (
            <p className="no-dialogue">No dialogue — silent panel.</p>
          ) : (
            panel.dialogues.map(d => (
              <DialogueLine
                key={d.id}
                dialogue={d}
                onSave={updated => onSaveDialogue(panel.panel_number, updated)}
                onFlag={onFlagDialogue}
              />
            ))
          )}
        </div>
      )}

      {/* ── Acting Direction (collapsible) ── */}
      {panel.acting_direction && Object.keys(panel.acting_direction).length > 0 && (
        <div className="acting-direction-section">
          <button
            className="lettering-section-header"
            onClick={() => setActingOpen(prev => !prev)}
            type="button"
          >
            <span>🎭 Acting Direction ({Object.keys(panel.acting_direction).length})</span>
            <span className="lettering-chevron">{actingOpen ? '▾' : '▸'}</span>
          </button>

          {actingOpen && (
            <div className="acting-direction-body">
              {Object.entries(panel.acting_direction).map(([charId, dir]) => (
                <div className="acting-char-card" key={charId}>
                  <span className="acting-char-name">{charId}</span>
                  <div className="acting-details">
                    <span className="acting-detail"><em>Expression:</em> {dir.expression}</span>
                    <span className="acting-detail"><em>Body:</em> {dir.body_language}</span>
                    <span className="acting-detail"><em>Gaze:</em> {dir.gaze_direction}</span>
                    <span className="acting-detail"><em>Micro-action:</em> {dir.micro_action}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PanelScriptCard;
