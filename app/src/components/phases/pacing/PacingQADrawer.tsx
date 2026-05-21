import React, { useState } from 'react';
import '../../../styles/pacing.css';

export type PacingQaType =
  | 'REWRITE_FOCUS'
  | 'EXTEND'
  | 'SHORTEN'
  | 'CHANGE_TYPE'
  | 'ADD_PAGE_AFTER';

const PAGE_TYPES = ['cover', 'character_intro', 'story', 'chapter_break', 'splash'];

const QA_TYPES: { id: PacingQaType; label: string; desc: string }[] = [
  { id: 'REWRITE_FOCUS',  label: 'Rewrite Focus',    desc: 'Change the description of this page' },
  { id: 'EXTEND',         label: 'Extend (Add Page)', desc: 'Give this scene more pages' },
  { id: 'SHORTEN',        label: 'Merge With Next',   desc: 'Combine with the following page' },
  { id: 'CHANGE_TYPE',    label: 'Change Type',       desc: 'Switch page type badge' },
  { id: 'ADD_PAGE_AFTER', label: 'Add Page After',    desc: 'Insert a new page after this one' },
];

interface PacingQATarget {
  pageNumber: number;
  currentFocus: string;
  currentType: string;
}

interface PacingQADrawerProps {
  target: PacingQATarget | null;
  onClose: () => void;
  onExport: (report: string) => void;
}

const PacingQADrawer: React.FC<PacingQADrawerProps> = ({ target, onClose, onExport }) => {
  const [qaType, setQaType] = useState<PacingQaType | null>(null);
  const [note, setNote] = useState('');
  const [newType, setNewType] = useState(PAGE_TYPES[2]);
  const [mergeConfirmed, setMergeConfirmed] = useState(false);
  const [exported, setExported] = useState(false);

  if (!target) return null;

  const buildReport = (): string => {
    if (!qaType) return '';
    const now = new Date().toISOString();
    let r = `# QA Report — Phase 1.5 (Pacing)\nGenerated: ${now}\n\n`;
    const ref = `Page ${target.pageNumber}`;

    if (qaType === 'REWRITE_FOCUS') {
      r += `## ${ref} — [REWRITE_FOCUS]\n* **Current focus:** ${target.currentFocus}\n* **Request:** ${note}\n`;
    } else if (qaType === 'EXTEND') {
      r += `## ${ref} — [EXTEND]\n* **Request:** ${note || 'Give this page an additional page.'}\n`;
    } else if (qaType === 'SHORTEN') {
      r += `## ${ref} — [MERGE_WITH_NEXT]\n* **Confirmed:** yes\n`;
    } else if (qaType === 'CHANGE_TYPE') {
      r += `## ${ref} — [CHANGE_TYPE]\n* **Current type:** ${target.currentType}\n* **New type:** ${newType}\n`;
    } else if (qaType === 'ADD_PAGE_AFTER') {
      r += `## ${ref} — [ADD_PAGE_AFTER]\n* **New page brief:** ${note}\n`;
    }
    return r;
  };

  const isValid = () => {
    if (!qaType) return false;
    if (qaType === 'REWRITE_FOCUS' && !note.trim()) return false;
    if (qaType === 'SHORTEN' && !mergeConfirmed) return false;
    if (qaType === 'ADD_PAGE_AFTER' && !note.trim()) return false;
    return true;
  };

  const handleExport = () => {
    onExport(buildReport());
    setExported(true);
    setTimeout(() => { setExported(false); onClose(); }, 1200);
  };

  return (
    <div className="pacing-qa-drawer bg-background-panel border-l border-border shadow-lg">
      <div className="pacing-qa-header">
        <div>
          <h3>🚩 Flag for Agent</h3>
          <p className="pacing-qa-sub">Page {target.pageNumber} · {target.currentType}</p>
        </div>
        <button className="pacing-qa-close" onClick={onClose}>✕</button>
      </div>

      <div className="pacing-qa-types">
        {QA_TYPES.map(t => (
          <button key={t.id} className={`pacing-qa-btn ${qaType === t.id ? 'active' : ''}`} onClick={() => setQaType(t.id)}>
            <span className="pacing-qa-label">{t.label}</span>
            <span className="pacing-qa-desc">{t.desc}</span>
          </button>
        ))}
      </div>

      {qaType && (
        <div className="pacing-qa-fields">
          {(qaType === 'REWRITE_FOCUS' || qaType === 'EXTEND' || qaType === 'ADD_PAGE_AFTER') && (
            <textarea
              className="pacing-qa-textarea"
              placeholder={qaType === 'ADD_PAGE_AFTER' ? 'Brief for the new page...' : qaType === 'EXTEND' ? 'Why does this need more pages?' : 'What should this page show instead?'}
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={4}
            />
          )}
          {qaType === 'SHORTEN' && (
            <label className="pacing-qa-check">
              <input type="checkbox" checked={mergeConfirmed} onChange={e => setMergeConfirmed(e.target.checked)} />
              &nbsp;Confirm merge with Page {target.pageNumber + 1}
            </label>
          )}
          {qaType === 'CHANGE_TYPE' && (
            <select className="pacing-qa-select" value={newType} onChange={e => setNewType(e.target.value)}>
              {PAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          )}
        </div>
      )}

      <button
        className={`pacing-qa-export-btn ${exported ? 'exported' : ''}`}
        disabled={!isValid() || exported}
        onClick={handleExport}
      >
        {exported ? '✓ Exported!' : '📤 Export QA Report'}
      </button>
    </div>
  );
};

export default PacingQADrawer;
