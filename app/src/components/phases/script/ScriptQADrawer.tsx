import React, { useState } from 'react';
import type { Dialogue, DialogueType } from './DialogueLine';
import type { Beat } from './BeatLine';
import '../../../styles/script.css';

/* ── 3B (Panel Script) QA types ─────────────────────── */
export type QaType3B =
  | 'REWRITE_LINE'
  | 'CHANGE_TYPE'
  | 'CHANGE_SPEAKER'
  | 'DELETE_LINE'
  | 'ADD_LINE_AFTER'
  | 'FULL_PANEL_REWRITE'
  | 'REASSIGN_BEATS';

/* ── 3A (Scene Script) QA types ─────────────────────── */
export type QaType3A =
  | 'REWRITE_BEAT'
  | 'REWRITE_SCENE'
  | 'ADJUST_DENSITY'
  | 'REWRITE_VOICE';

export type QaType = QaType3A | QaType3B;

/* ── Target types ───────────────────────────────────── */
export interface QaTarget {
  stage: '3a' | '3b';
  // 3B targets
  type?: 'line' | 'panel';
  dialogue?: Dialogue;
  panelRef?: { pageNumber: number; panelNumber: number };
  // 3A targets
  beat?: Beat;
  sceneRef?: { sceneId: number; flagType?: string };
}

interface ScriptQADrawerProps {
  target: QaTarget | null;
  onClose: () => void;
  onExport: (report: string) => void;
}

/* ── 3B flag definitions ────────────────────────────── */
const QA_TYPES_3B_LINE: { id: QaType3B; label: string; desc: string }[] = [
  { id: 'REWRITE_LINE',     label: 'Rewrite Line',       desc: 'Change the text of this line' },
  { id: 'CHANGE_TYPE',      label: 'Change Type',         desc: 'Switch speech/thought/caption/sfx' },
  { id: 'CHANGE_SPEAKER',   label: 'Change Speaker',      desc: 'Assign to a different character' },
  { id: 'DELETE_LINE',      label: 'Delete Line',         desc: 'Remove this line from the script' },
  { id: 'ADD_LINE_AFTER',   label: 'Add Line After',      desc: 'Insert a new dialogue after this one' },
];

const QA_TYPES_3B_PANEL: { id: QaType3B; label: string; desc: string }[] = [
  { id: 'FULL_PANEL_REWRITE', label: 'Full Panel Rewrite', desc: 'Rewrite all lettering for this panel' },
  { id: 'REASSIGN_BEATS',     label: 'Reassign Beats',     desc: 'Move beats between panels on same page' },
];

/* ── 3A flag definitions ────────────────────────────── */
const QA_TYPES_3A_BEAT: { id: QaType3A; label: string; desc: string }[] = [
  { id: 'REWRITE_BEAT', label: 'Rewrite Beat', desc: 'Rewrite this specific beat' },
];

const QA_TYPES_3A_SCENE: { id: QaType3A; label: string; desc: string }[] = [
  { id: 'REWRITE_SCENE',  label: 'Rewrite Scene',    desc: 'Rewrite all beats for this scene' },
  { id: 'ADJUST_DENSITY',  label: 'Adjust Density',   desc: 'Too many or too few beats' },
  { id: 'REWRITE_VOICE',   label: 'Rewrite Voice',    desc: 'Character doesn\'t sound right' },
];

const DIALOGUE_TYPES: DialogueType[] = ['speech', 'thought', 'caption', 'sfx'];

const ScriptQADrawer: React.FC<ScriptQADrawerProps> = ({ target, onClose, onExport }) => {
  const [qaType, setQaType] = useState<QaType | null>(null);
  const [note, setNote] = useState('');
  const [newType, setNewType] = useState<DialogueType>('speech');
  const [newSpeaker, setNewSpeaker] = useState('');
  const [addSpeaker, setAddSpeaker] = useState('');
  const [addText, setAddText] = useState('');
  const [addType, setAddType] = useState<DialogueType>('speech');
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [exported, setExported] = useState(false);

  if (!target) return null;

  /* ── Determine available QA types based on target ─── */
  const getAvailableTypes = () => {
    if (target.stage === '3a') {
      if (target.beat) return QA_TYPES_3A_BEAT;
      if (target.sceneRef) {
        // If a specific flagType was provided, pre-filter
        if (target.sceneRef.flagType) {
          const specific = QA_TYPES_3A_SCENE.find(t => t.id === target.sceneRef!.flagType);
          return specific ? [specific] : QA_TYPES_3A_SCENE;
        }
        return QA_TYPES_3A_SCENE;
      }
      return QA_TYPES_3A_SCENE;
    }
    // Stage 3B
    if (target.type === 'line') return QA_TYPES_3B_LINE;
    if (target.type === 'panel') return QA_TYPES_3B_PANEL;
    return QA_TYPES_3B_LINE;
  };

  const availableTypes = getAvailableTypes();
  const d = target.dialogue;
  const b = target.beat;

  /* ── Build QA report ──────────────────────────────── */
  const buildReport = (): string => {
    if (!qaType) return '';
    const now = new Date().toISOString();
    const stageLabel = target.stage === '3a' ? 'Phase 3A (Scene Script)' : 'Phase 3B (Panel Script)';
    let report = `# QA Report — ${stageLabel}\nGenerated: ${now}\n\n`;

    // ── 3A reports ──
    if (b && qaType === 'REWRITE_BEAT') {
      report += `## Beat ${b.beat_id} — [REWRITE_BEAT]\n`;
      report += `* **Type:** ${b.type}\n`;
      report += `* **Current text:** "${b.text || b.description || ''}"\n`;
      report += `* **Request:** ${note}\n`;
    } else if (target.sceneRef && qaType === 'REWRITE_SCENE') {
      report += `## Scene ${target.sceneRef.sceneId} — [REWRITE_SCENE]\n`;
      report += `* **Request:** ${note}\n`;
    } else if (target.sceneRef && qaType === 'ADJUST_DENSITY') {
      report += `## Scene ${target.sceneRef.sceneId} — [ADJUST_DENSITY]\n`;
      report += `* **Request:** ${note}\n`;
    } else if (target.sceneRef && qaType === 'REWRITE_VOICE') {
      report += `## Scene ${target.sceneRef.sceneId} — [REWRITE_VOICE]\n`;
      report += `* **Request:** ${note}\n`;

    // ── 3B reports ──
    } else if (d && qaType === 'REWRITE_LINE') {
      report += `## Dialogue ${d.id} — [REWRITE_LINE]\n`;
      report += `* **Speaker:** ${d.speaker}\n`;
      report += `* **Current text:** "${d.text}"\n`;
      report += `* **Request:** ${note}\n`;
    } else if (d && qaType === 'CHANGE_TYPE') {
      report += `## Dialogue ${d.id} — [CHANGE_TYPE]\n`;
      report += `* **Current type:** ${d.type}\n`;
      report += `* **New type:** ${newType}\n`;
    } else if (d && qaType === 'CHANGE_SPEAKER') {
      report += `## Dialogue ${d.id} — [CHANGE_SPEAKER]\n`;
      report += `* **Current speaker:** ${d.speaker}\n`;
      report += `* **New speaker:** ${newSpeaker}\n`;
    } else if (d && qaType === 'DELETE_LINE') {
      report += `## Dialogue ${d.id} — [DELETE_LINE]\n`;
      report += `* **Speaker:** ${d.speaker}\n`;
      report += `* **Text:** "${d.text}"\n`;
      report += `* **Confirmed:** yes\n`;
    } else if (d && qaType === 'ADD_LINE_AFTER') {
      report += `## Dialogue ${d.id} — [ADD_LINE_AFTER]\n`;
      report += `* **Insert after:** ${d.id}\n`;
      report += `* **New speaker:** ${addSpeaker}\n`;
      report += `* **New text:** "${addText}"\n`;
      report += `* **New type:** ${addType}\n`;
    } else if (target.panelRef && qaType === 'FULL_PANEL_REWRITE') {
      const { pageNumber, panelNumber } = target.panelRef;
      report += `## Page ${pageNumber}, Panel ${panelNumber} — [FULL_PANEL_REWRITE]\n`;
      report += `* **Request:** ${note}\n`;
    } else if (target.panelRef && qaType === 'REASSIGN_BEATS') {
      const { pageNumber, panelNumber } = target.panelRef;
      report += `## Page ${pageNumber}, Panel ${panelNumber} — [REASSIGN_BEATS]\n`;
      report += `* **Request:** ${note}\n`;
    }

    return report;
  };

  const handleExport = () => {
    const report = buildReport();
    if (!report) return;
    onExport(report);
    setExported(true);
    setTimeout(() => { setExported(false); onClose(); }, 1200);
  };

  const isValid = () => {
    if (!qaType) return false;
    // 3A validations
    if (qaType === 'REWRITE_BEAT' && !note.trim()) return false;
    if (qaType === 'REWRITE_SCENE' && !note.trim()) return false;
    if (qaType === 'ADJUST_DENSITY' && !note.trim()) return false;
    if (qaType === 'REWRITE_VOICE' && !note.trim()) return false;
    // 3B validations
    if (qaType === 'REWRITE_LINE' && !note.trim()) return false;
    if (qaType === 'CHANGE_SPEAKER' && !newSpeaker.trim()) return false;
    if (qaType === 'DELETE_LINE' && !deleteConfirmed) return false;
    if (qaType === 'ADD_LINE_AFTER' && (!addSpeaker.trim() || !addText.trim())) return false;
    if (qaType === 'FULL_PANEL_REWRITE' && !note.trim()) return false;
    if (qaType === 'REASSIGN_BEATS' && !note.trim()) return false;
    return true;
  };

  /* ── Drawer header subtitle ─────────────────────── */
  const getSubtitle = () => {
    if (target.stage === '3a') {
      if (b) return `${b.beat_id} · ${b.type}`;
      if (target.sceneRef) return `Scene ${target.sceneRef.sceneId}`;
    }
    if (d) return `${d.id} · ${d.speaker}`;
    if (target.panelRef) return `Page ${target.panelRef.pageNumber}, Panel ${target.panelRef.panelNumber}`;
    return '';
  };

  const stageLabel = target.stage === '3a' ? 'Scene Script' : 'Panel Script';

  return (
    <div className="qa-drawer bg-background-panel border-l border-border shadow-lg">
      <div className="qa-drawer-header">
        <div>
          <h3>🚩 Flag for Agent</h3>
          <p className="qa-drawer-sub">{stageLabel} · {getSubtitle()}</p>
        </div>
        <button className="qa-close-btn" onClick={onClose}>✕</button>
      </div>

      {/* Stage badge */}
      <div className={`qa-stage-badge ${target.stage === '3a' ? 'qa-stage--3a' : 'qa-stage--3b'}`}>
        {target.stage === '3a' ? '📖 Stage 3A — Scene Script' : '📐 Stage 3B — Panel Script'}
      </div>

      {/* QA Type selector */}
      <div className="qa-type-list">
        {availableTypes.map(t => (
          <button
            key={t.id}
            className={`qa-type-btn ${qaType === t.id ? 'active' : ''}`}
            onClick={() => setQaType(t.id)}
          >
            <span className="qa-type-label">{t.label}</span>
            <span className="qa-type-desc">{t.desc}</span>
          </button>
        ))}
      </div>

      {/* Contextual fields */}
      {qaType && (
        <div className="qa-fields">
          {/* Note field for most flag types */}
          {(qaType === 'REWRITE_LINE' || qaType === 'FULL_PANEL_REWRITE' || qaType === 'REASSIGN_BEATS' ||
            qaType === 'REWRITE_BEAT' || qaType === 'REWRITE_SCENE' || qaType === 'ADJUST_DENSITY' || qaType === 'REWRITE_VOICE') && (
            <textarea
              className="qa-textarea"
              placeholder="Describe what should change..."
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={4}
            />
          )}
          {qaType === 'CHANGE_TYPE' && (
            <select className="qa-select" value={newType} onChange={e => setNewType(e.target.value as DialogueType)}>
              {DIALOGUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          )}
          {qaType === 'CHANGE_SPEAKER' && (
            <input className="qa-input" placeholder="New speaker name" value={newSpeaker} onChange={e => setNewSpeaker(e.target.value)} />
          )}
          {qaType === 'DELETE_LINE' && (
            <label className="qa-checkbox-label">
              <input type="checkbox" checked={deleteConfirmed} onChange={e => setDeleteConfirmed(e.target.checked)} />
              &nbsp;Confirm deletion of this line
            </label>
          )}
          {qaType === 'ADD_LINE_AFTER' && (
            <div className="qa-add-fields">
              <input className="qa-input" placeholder="Speaker name" value={addSpeaker} onChange={e => setAddSpeaker(e.target.value)} />
              <textarea className="qa-textarea" placeholder="New dialogue text" value={addText} onChange={e => setAddText(e.target.value)} rows={3} />
              <select className="qa-select" value={addType} onChange={e => setAddType(e.target.value as DialogueType)}>
                {DIALOGUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          )}
        </div>
      )}

      <button
        className={`qa-export-btn ${exported ? 'exported' : ''}`}
        disabled={!isValid() || exported}
        onClick={handleExport}
      >
        {exported ? '✓ Exported!' : '📤 Export QA Report'}
      </button>
    </div>
  );
};

export default ScriptQADrawer;
