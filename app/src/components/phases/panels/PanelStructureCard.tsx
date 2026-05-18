import React from 'react';
import '../../../styles/panels.css';

const FRAMING_OPTIONS = [
  'Wide Establishing Shot',
  'Medium shot',
  'Medium two-shot',
  'Close-up',
  'Extreme close-up',
  'Over-the-shoulder',
  'Dynamic low angle',
  "Bird's eye view",
  'POV shot',
];

const FRAMING_COLORS: Record<string, string> = {
  'Wide Establishing Shot': '#06b6d4',
  'Wide establishing shot': '#06b6d4',
  'Medium shot':            '#3b82f6',
  'Medium two-shot':        '#3b82f6',
  'Close-up':               '#f97316',
  'Extreme close-up':       '#ef4444',
  'Over-the-shoulder':      '#8b5cf6',
  'Dynamic low angle':      '#ec4899',
  "Bird's eye view":        '#10b981',
  'POV shot':               '#f59e0b',
};

const TAG_COLORS: Record<string, string> = {
  '[ESTABLISHING]':  '#06b6d4',
  '[SECRET]':        '#ef4444',
  '[SPLASH]':        '#f59e0b',
  '[MULTI-DIALOGUE]':'#8b5cf6',
  '[PROJECT_DETAIL]':'#10b981',
};

function getTagColor(tag: string): string {
  const base = tag.split(':')[0].trim() + ']';
  return TAG_COLORS[base] ?? '#64748b';
}

export interface PanelData {
  panel_number: number;
  framing: string;
  action: string;
  characters_present: string[];
  tags: string[];
}

interface PanelStructureCardProps {
  panel: PanelData;
  pageNumber: number;
  onFramingChange: (panelNumber: number, newFraming: string) => void;
  onFlag: (panelNumber: number, action: string, chars: string[], tags: string[]) => void;
}

const PanelStructureCard: React.FC<PanelStructureCardProps> = ({
  panel, onFramingChange, onFlag,
}) => {
  const color = FRAMING_COLORS[panel.framing] ?? '#64748b';

  return (
    <div className="psc-card">
      <div className="psc-header">
        <div className="psc-meta">
          <span className="psc-num">Panel {panel.panel_number}</span>
          <select
            className="psc-framing-select"
            style={{ color, borderColor: `${color}66`, background: `${color}18` }}
            value={panel.framing}
            onChange={e => onFramingChange(panel.panel_number, e.target.value)}
          >
            {FRAMING_OPTIONS.map(f => (
              <option key={f} value={f} style={{ background: '#1e293b', color: '#f8fafc' }}>{f}</option>
            ))}
          </select>
        </div>
        <button
          className="psc-flag-btn"
          onClick={() => onFlag(panel.panel_number, panel.action, panel.characters_present, panel.tags)}
          title="Flag for agent"
        >
          🚩 Flag
        </button>
      </div>

      <p className="psc-action">{panel.action}</p>

      <div className="psc-footer">
        <div className="psc-chars">
          {panel.characters_present.length === 0
            ? <span className="psc-empty-chars">No characters</span>
            : panel.characters_present.map(c => (
              <span key={c} className="psc-char-chip">{c}</span>
            ))
          }
        </div>
        <div className="psc-tags">
          {panel.tags.map(t => {
            const tagColor = getTagColor(t);
            return (
              <span key={t} className="psc-tag" style={{ background: `${tagColor}18`, color: tagColor, borderColor: `${tagColor}44` }}>
                {t.length > 28 ? t.slice(0, 28) + '…]' : t}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PanelStructureCard;
