import React from 'react';
import DialogueLine, { type Dialogue } from './DialogueLine';
import '../../../styles/script.css';

export interface Panel {
  panel_number: number;
  framing: string;
  action: string;
  dialogues: Dialogue[];
}

interface PanelScriptCardProps {
  panel: Panel;
  pageNumber: number;
  onSaveDialogue: (panelNumber: number, updated: Dialogue) => void;
  onFlagDialogue: (dialogue: Dialogue) => void;
  onFlagPanel: (panelNumber: number) => void;
}

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

const PanelScriptCard: React.FC<PanelScriptCardProps> = ({
  panel, onSaveDialogue, onFlagDialogue, onFlagPanel
}) => {
  const framingColor = FRAMING_COLORS[panel.framing] ?? '#64748b';

  return (
    <div className="panel-script-card">
      <div className="panel-script-header">
        <div className="panel-script-meta">
          <span className="panel-num">Panel {panel.panel_number}</span>
          <span className="panel-framing-badge" style={{ background: `${framingColor}22`, color: framingColor, border: `1px solid ${framingColor}66` }}>
            {panel.framing}
          </span>
        </div>
        <button className="flag-panel-btn" onClick={() => onFlagPanel(panel.panel_number)} title="Flag entire panel for agent">
          🚩 Flag Panel
        </button>
      </div>

      <p className="panel-action-text">{panel.action}</p>

      <div className="dialogue-list">
        {panel.dialogues.length === 0 ? (
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
    </div>
  );
};

export default PanelScriptCard;
