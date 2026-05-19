import React, { useState, useEffect } from 'react';

interface InlineEditableTextProps {
  initialValue: string;
  onSave: (value: string) => Promise<void>;
  emptyText?: string;
  isVariant?: boolean;
  bodyClassOverride?: string;
  textClassOverride?: string;
}

export const InlineEditableText: React.FC<InlineEditableTextProps> = ({ 
  initialValue, 
  onSave, 
  emptyText = 'No description yet — click ✏️ to add one.',
  isVariant = false,
  bodyClassOverride,
  textClassOverride
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [status, setStatus] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  // Sync value if initialValue changes while not editing
  useEffect(() => {
    if (!isEditing) {
      setValue(initialValue);
    }
  }, [initialValue, isEditing]);

  const handleSave = async () => {
    setStatus('saving');
    try {
      await onSave(value);
      setStatus('ok');
      setTimeout(() => {
        setIsEditing(false);
        setStatus('idle');
      }, 800);
    } catch {
      setStatus('err');
    }
  };

  const handleCancel = () => {
    setValue(initialValue);
    setIsEditing(false);
    setStatus('idle');
  };

  if (isEditing) {
    return (
      <div className="lore-desc-edit-block">
        <textarea
          className="lore-desc-textarea"
          value={value}
          onChange={e => setValue(e.target.value)}
          rows={3}
          autoFocus
        />
        <div className="lore-desc-edit-actions">
          <button
            className="lore-desc-save-btn"
            disabled={status === 'saving'}
            onClick={handleSave}
          >
            {status === 'saving' ? 'Saving…' : status === 'ok' ? '✓ Saved' : 'Save'}
          </button>
          <button className="lore-desc-cancel-btn" onClick={handleCancel}>Cancel</button>
          {status === 'err' && <span className="lore-desc-err">⚠ Save failed</span>}
        </div>
      </div>
    );
  }

  const bodyClass = bodyClassOverride || (isVariant ? 'lore-loc-variant-desc-body' : 'lore-loc-global-desc-body');
  const textClass = textClassOverride || (isVariant ? 'lore-loc-variant-desc-text' : 'lore-loc-global-desc-text');

  return (
    <div className={`group ${bodyClass}`}>
      <p className={textClass}>
        {initialValue || <em className="lore-desc-empty">{emptyText}</em>}
      </p>
      <button
        className="lore-desc-edit-icon-btn"
        title="Edit description"
        onClick={() => setIsEditing(true)}
      >✏️</button>
    </div>
  );
};
