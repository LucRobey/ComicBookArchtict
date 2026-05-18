import React, { useState } from 'react';
import type { Dialogue, DialogueType } from './DialogueLine';
import '../../../styles/script.css';

export type QaType = 'REWRITE_LINE' | 'CHANGE_TYPE' | 'CHANGE_SPEAKER' | 'DELETE_LINE' | 'ADD_LINE_AFTER' | 'FULL_PANEL_REWRITE';

interface QaTarget {
  type: 'line' | 'panel';
  dialogue?: Dialogue;
  panelRef?: { pageNumber: number; panelNumber: number };
}

interface ScriptQADrawerProps {
  target: QaTarget | null;
  onClose: () => void;
  onExport: (report: string) => void;
}

const QA_TYPES_LINE: { id: QaType; label: string; desc: string }[] = [
  { id: 'REWRITE_LINE',     label: 'Rewrite Line',       desc: 'Change the text of this line' },
  { id: 'CHANGE_TYPE',      label: 'Change Type',         desc: 'Switch speech/thought/caption' },
  { id: 'CHANGE_SPEAKER',   label: 'Change Speaker',      desc: 'Assign to a different character' },
  { id: 'DELETE_LINE',      label: 'Delete Line',         desc: 'Remove this line from the script' },
  { id: 'ADD_LINE_AFTER',   label: 'Add Line After',      desc: 'Insert a new dialogue after this one' },
];

const QA_TYPES_PANEL: { id: QaType; label: string; desc: string }[] = [
  { id: 'FULL_PANEL_REWRITE', label: 'Full Panel Rewrite', desc: 'Rewrite all dialogue for this panel' },
];

const DIALOGUE_TYPES: DialogueType[] = ['speech', 'thought', 'caption'];

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

  const availableTypes = target.type === 'line' ? QA_TYPES_LINE : QA_TYPES_PANEL;
  const d = target.dialogue;

  const buildReport = (): string => {
    if (!qaType) return '';
    const now = new Date().toISOString();
    let report = `# QA Report — Phase 3 (Script)\nGenerated: ${now}\n\n`;

    if (d && qaType === 'REWRITE_LINE') {
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
    if (qaType === 'REWRITE_LINE' && !note.trim()) return false;
    if (qaType === 'CHANGE_SPEAKER' && !newSpeaker.trim()) return false;
    if (qaType === 'DELETE_LINE' && !deleteConfirmed) return false;
    if (qaType === 'ADD_LINE_AFTER' && (!addSpeaker.trim() || !addText.trim())) return false;
    if (qaType === 'FULL_PANEL_REWRITE' && !note.trim()) return false;
    return true;
  };

  return (
    <div className="qa-drawer bg-background-panel border-l border-border shadow-lg">
      <div className="qa-drawer-header">
        <div>
          <h3>🚩 Flag for Agent</h3>
          {d && <p className="qa-drawer-sub">{d.id} · {d.speaker}</p>}
        </div>
        <button className="qa-close-btn" onClick={onClose}>✕</button>
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
          {(qaType === 'REWRITE_LINE' || qaType === 'FULL_PANEL_REWRITE') && (
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
