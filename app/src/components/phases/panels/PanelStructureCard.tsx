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

export interface CharacterActing {
  character_id: string;
  expression: string;
  pose_and_gesture: string;
  internal_state: string;
}

export interface PanelData {
  panel_number: number;
  framing: string;
  action: string;
  characters_present: string[];
  tags: string[];
  focal_element?: string;
  characters_acting?: CharacterActing[];
  environment_details?: string;
  composition_notes?: string;
}

interface PanelStructureCardProps {
  panel: PanelData;
  pageNumber: number;
  onFramingChange: (panelNumber: number, newFraming: string) => void;
  onFlag: (panelNumber: number, action: string, chars: string[], tags: string[]) => void;
  style?: React.CSSProperties;
}

const PanelStructureCard: React.FC<PanelStructureCardProps> = ({
  panel, onFramingChange, onFlag, style,
}) => {
  const color = FRAMING_COLORS[panel.framing] ?? '#64748b';

  return (
    <div className="psc-card" style={style}>
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

      <p className="psc-action" style={{ marginBottom: '8px' }}>{panel.action}</p>

      {/* Enriched composition & focal elements */}
      {(panel.focal_element || panel.environment_details || panel.composition_notes) && (
        <div className="psc-enriched-details" style={{ fontSize: '0.72rem', opacity: 0.85, background: 'rgba(0,0,0,0.15)', padding: '8px', borderRadius: '6px', margin: '6px 0', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {panel.focal_element && <div><strong>🔍 Focus:</strong> {panel.focal_element}</div>}
          {panel.environment_details && <div><strong>🍃 Ambient:</strong> {panel.environment_details}</div>}
          {panel.composition_notes && <div><strong>🎥 Camera:</strong> {panel.composition_notes}</div>}
        </div>
      )}

      {/* Characters acting detailed states */}
      {panel.characters_acting && panel.characters_acting.length > 0 && (
        <div className="psc-acting-states" style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '6px 0' }}>
          {panel.characters_acting.map(ca => (
            <div key={ca.character_id} style={{ fontSize: '0.72rem', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: '6px', padding: '6px' }}>
              <div style={{ fontWeight: 'bold', color: '#60a5fa', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>🎭</span> <span>{ca.character_id}</span>
              </div>
              <div style={{ opacity: 0.9, marginBottom: '2px' }}><strong>Face:</strong> {ca.expression}</div>
              {ca.pose_and_gesture && <div style={{ opacity: 0.9, marginBottom: '2px' }}><strong>Pose:</strong> {ca.pose_and_gesture}</div>}
              {ca.internal_state && (
                <div style={{ opacity: 0.8, color: '#f59e0b', fontSize: '0.68rem', marginTop: '4px', borderTop: '1px dashed rgba(245,158,11,0.2)', paddingTop: '4px' }}>
                  <strong>💭 Internal:</strong> {ca.internal_state}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="psc-footer" style={{ marginTop: 'auto' }}>
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
