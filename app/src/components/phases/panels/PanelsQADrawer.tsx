import React, { useState } from 'react';
import '../../../styles/panels.css';

export type QaPanelType =
  | 'REWRITE_ACTION'
  | 'SPLIT_PANEL'
  | 'MERGE_WITH_NEXT'
  | 'ADD_PANEL_AFTER'
  | 'CHANGE_CHARACTERS'
  | 'ADD_REMOVE_TAG';

interface PanelQATarget {
  pageNumber: number;
  panelNumber: number;
  currentAction: string;
  currentCharacters: string[];
  currentTags: string[];
}

interface PanelsQADrawerProps {
  target: PanelQATarget | null;
  onClose: () => void;
  onExport: (report: string) => void;
}

const QA_TYPES: { id: QaPanelType; label: string; desc: string }[] = [
  { id: 'REWRITE_ACTION',    label: 'Rewrite Action',      desc: 'Change what happens in this panel' },
  { id: 'SPLIT_PANEL',       label: 'Split Into Two',       desc: 'Divide into two separate panels' },
  { id: 'MERGE_WITH_NEXT',   label: 'Merge With Next',      desc: 'Combine with the following panel' },
  { id: 'ADD_PANEL_AFTER',   label: 'Add Panel After',      desc: 'Insert a new panel after this one' },
  { id: 'CHANGE_CHARACTERS', label: 'Change Characters',    desc: 'Add or remove characters present' },
  { id: 'ADD_REMOVE_TAG',    label: 'Add / Remove Tag',     desc: 'Modify structural tags' },
];

const ALL_TAGS = ['[ESTABLISHING]', '[SECRET]', '[SPLASH]', '[MULTI-DIALOGUE]', '[PROJECT_DETAIL]'];

const PanelsQADrawer: React.FC<PanelsQADrawerProps> = ({ target, onClose, onExport }) => {
  const [qaType, setQaType] = useState<QaPanelType | null>(null);
  const [note, setNote] = useState('');
  const [panel1Brief, setPanel1Brief] = useState('');
  const [panel2Brief, setPanel2Brief] = useState('');
  const [newChars, setNewChars] = useState('');
  const [tag, setTag] = useState(ALL_TAGS[0]);
  const [tagAction, setTagAction] = useState<'add' | 'remove'>('add');
  const [mergeConfirmed, setMergeConfirmed] = useState(false);
  const [exported, setExported] = useState(false);

  if (!target) return null;

  const buildReport = (): string => {
    if (!qaType) return '';
    const now = new Date().toISOString();
    let r = `# QA Report — Phase 2 (Panel Structure)\nGenerated: ${now}\n\n`;

    const ref = `Page ${target.pageNumber}, Panel ${target.panelNumber}`;

    if (qaType === 'REWRITE_ACTION') {
      r += `## ${ref} — [REWRITE_ACTION]\n* **Current action:** ${target.currentAction}\n* **Request:** ${note}\n`;
    } else if (qaType === 'SPLIT_PANEL') {
      r += `## ${ref} — [SPLIT]\n* **Panel A brief:** ${panel1Brief}\n* **Panel B brief:** ${panel2Brief}\n`;
    } else if (qaType === 'MERGE_WITH_NEXT') {
      r += `## ${ref} — [MERGE_WITH_NEXT]\n* **Confirmed:** yes\n`;
    } else if (qaType === 'ADD_PANEL_AFTER') {
      r += `## ${ref} — [ADD_PANEL_AFTER]\n* **New panel brief:** ${note}\n`;
    } else if (qaType === 'CHANGE_CHARACTERS') {
      r += `## ${ref} — [CHANGE_CHARACTERS]\n* **Current:** ${target.currentCharacters.join(', ') || 'none'}\n* **New characters list:** ${newChars}\n`;
    } else if (qaType === 'ADD_REMOVE_TAG') {
      r += `## ${ref} — [${tagAction.toUpperCase()}_TAG]\n* **Tag:** ${tag}\n`;
    }
    return r;
  };

  const isValid = () => {
    if (!qaType) return false;
    if (qaType === 'REWRITE_ACTION' && !note.trim()) return false;
    if (qaType === 'SPLIT_PANEL' && (!panel1Brief.trim() || !panel2Brief.trim())) return false;
    if (qaType === 'MERGE_WITH_NEXT' && !mergeConfirmed) return false;
    if (qaType === 'ADD_PANEL_AFTER' && !note.trim()) return false;
    if (qaType === 'CHANGE_CHARACTERS' && !newChars.trim()) return false;
    return true;
  };

  const handleExport = () => {
    onExport(buildReport());
    setExported(true);
    setTimeout(() => { setExported(false); onClose(); }, 1200);
  };

  return (
    <div className="pqa-drawer bg-background-panel border-l border-border shadow-lg">
      <div className="pqa-header">
        <div>
          <h3>🚩 Flag for Agent</h3>
          <p className="pqa-sub">Page {target.pageNumber} · Panel {target.panelNumber}</p>
        </div>
        <button className="pqa-close" onClick={onClose}>✕</button>
      </div>

      <div className="pqa-type-list">
        {QA_TYPES.map(t => (
          <button key={t.id} className={`pqa-type-btn ${qaType === t.id ? 'active' : ''}`} onClick={() => setQaType(t.id)}>
            <span className="pqa-type-label">{t.label}</span>
            <span className="pqa-type-desc">{t.desc}</span>
          </button>
        ))}
      </div>

      {qaType && (
        <div className="pqa-fields">
          {(qaType === 'REWRITE_ACTION' || qaType === 'ADD_PANEL_AFTER') && (
            <textarea className="pqa-textarea" placeholder={qaType === 'ADD_PANEL_AFTER' ? 'Describe the new panel...' : 'What should this panel show instead?'} value={note} onChange={e => setNote(e.target.value)} rows={4} />
          )}
          {qaType === 'SPLIT_PANEL' && (
            <>
              <textarea className="pqa-textarea" placeholder="Panel A: first half of the beat..." value={panel1Brief} onChange={e => setPanel1Brief(e.target.value)} rows={3} />
              <textarea className="pqa-textarea" placeholder="Panel B: second half of the beat..." value={panel2Brief} onChange={e => setPanel2Brief(e.target.value)} rows={3} />
            </>
          )}
          {qaType === 'MERGE_WITH_NEXT' && (
            <label className="pqa-check">
              <input type="checkbox" checked={mergeConfirmed} onChange={e => setMergeConfirmed(e.target.checked)} />
              &nbsp;Confirm merge with Panel {target.panelNumber + 1}
            </label>
          )}
          {qaType === 'CHANGE_CHARACTERS' && (
            <input className="pqa-input" placeholder="e.g. CHARACTER_A, CHARACTER_C" value={newChars} onChange={e => setNewChars(e.target.value)} />
          )}
          {qaType === 'ADD_REMOVE_TAG' && (
            <div className="pqa-tag-row">
              <select className="pqa-select" value={tagAction} onChange={e => setTagAction(e.target.value as 'add' | 'remove')}>
                <option value="add">Add tag</option>
                <option value="remove">Remove tag</option>
              </select>
              <select className="pqa-select" value={tag} onChange={e => setTag(e.target.value)}>
                {ALL_TAGS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          )}
        </div>
      )}

      <button className={`pqa-export-btn ${exported ? 'exported' : ''}`} disabled={!isValid() || exported} onClick={handleExport}>
        {exported ? '✓ Exported!' : '📤 Export QA Report'}
      </button>
    </div>
  );
};

export default PanelsQADrawer;
