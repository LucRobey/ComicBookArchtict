import React, { useState, useRef, useEffect } from 'react';
import '../../../styles/script.css';

export type DialogueType = 'speech' | 'thought' | 'caption' | 'sfx';

export interface Dialogue {
  id: string;
  speaker: string;
  text: string;
  type: DialogueType;
  delivery?: string;
  subtext?: string;
  volume?: string;
}

interface DialogueLineProps {
  dialogue: Dialogue;
  onSave: (updated: Dialogue) => void;
  onFlag: (dialogue: Dialogue) => void;
}

const TYPE_LABELS: Record<DialogueType, { label: string; icon: string; color: string }> = {
  speech:  { label: 'Speech',  icon: '💬', color: '#3b82f6' },
  thought: { label: 'Thought', icon: '💭', color: '#8b5cf6' },
  caption: { label: 'Caption', icon: '📝', color: '#94a3b8' },
  sfx:     { label: 'SFX',     icon: '💥', color: '#f97316' },
};

const DialogueLine: React.FC<DialogueLineProps> = ({ dialogue, onSave, onFlag }) => {
  const [editing, setEditing] = useState(false);
  const [draftText, setDraftText] = useState(dialogue.text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const info = TYPE_LABELS[dialogue.type] || TYPE_LABELS.speech;

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [editing]);

  const handleSave = () => {
    if (draftText.trim() !== dialogue.text) {
      onSave({ ...dialogue, text: draftText.trim() });
    }
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setDraftText(dialogue.text); setEditing(false); }
    if (e.key === 'Enter' && e.ctrlKey) handleSave();
  };

  return (
    <div className={`dialogue-line ${editing ? 'editing' : ''}`}>
      <div className="dialogue-line-header">
        <span className="dialogue-type-icon" title={info.label}>{info.icon}</span>
        <span className="dialogue-speaker" style={{ color: info.color }}>
          {dialogue.speaker}
        </span>
        <span className="dialogue-id">{dialogue.id}</span>
        <div className="dialogue-actions">
          {!editing && (
            <>
              <button
                className="dl-btn edit-btn"
                onClick={() => { setDraftText(dialogue.text); setEditing(true); }}
                title="Edit inline"
              >✏️</button>
              <button
                className="dl-btn flag-btn"
                onClick={() => onFlag(dialogue)}
                title="Flag for agent"
              >🚩</button>
            </>
          )}
        </div>
      </div>

      {editing ? (
        <div className="dialogue-edit-area">
          <textarea
            ref={textareaRef}
            value={draftText}
            onChange={e => setDraftText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="dialogue-textarea"
            rows={2}
          />
          <div className="dialogue-edit-controls">
            <span className="edit-hint">Ctrl+Enter to save · Esc to cancel</span>
            <button className="dl-btn cancel-btn" onClick={() => { setDraftText(dialogue.text); setEditing(false); }}>Cancel</button>
            <button className="dl-btn save-confirm-btn" onClick={handleSave}>Save</button>
          </div>
        </div>
      ) : (
        <p className="dialogue-text" onDoubleClick={() => { setDraftText(dialogue.text); setEditing(true); }}>
          "{dialogue.text}"
        </p>
      )}
    </div>
  );
};

export default DialogueLine;
