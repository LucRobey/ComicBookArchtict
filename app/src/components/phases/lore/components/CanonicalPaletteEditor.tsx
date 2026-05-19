import React, { useState } from 'react';
import type { CanonEditState } from '../types';

interface CanonicalPaletteEditorProps {
  initialPalette: { label: string; hex: string; role: string }[];
  onSavePalette: (next: { label: string; hex: string; role: string }[]) => Promise<void>;
}

export const CanonicalPaletteEditor: React.FC<CanonicalPaletteEditorProps> = ({ initialPalette, onSavePalette }) => {
  const [paletteSaveStatus, setPaletteSaveStatus] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');
  const [canonEditState, setCanonEditState] = useState<CanonEditState | null>(null);

  const saveCanonicalPalette = async (next: { label: string; hex: string; role: string }[]) => {
    setPaletteSaveStatus('saving');
    try {
      await onSavePalette(next);
      setPaletteSaveStatus('ok');
      setTimeout(() => setPaletteSaveStatus('idle'), 1000);
    } catch {
      setPaletteSaveStatus('err');
    }
  };

  const canonPaletteSaveEdit = () => {
    if (!canonEditState) return;
    const { idx, hex, label, role } = canonEditState;
    let next;
    if (idx === -1) {
      next = [...initialPalette, { hex, label: label || 'New colour', role }];
    } else {
      next = initialPalette.map((s, i) => i === idx ? { hex, label: label || 'New colour', role } : s);
    }
    saveCanonicalPalette(next);
    setCanonEditState(null);
  };

  const canonPaletteRemove = (idx: number) => {
    const next = initialPalette.filter((_, i) => i !== idx);
    saveCanonicalPalette(next);
  };

  return (
    <div className="lore-section">
      <div className="lore-section-header">
        <span className="lore-section-icon">🎨</span>
        <span className="lore-section-title">Canonical Palette</span>
        <span className="lore-canon-palette-status">
          {paletteSaveStatus === 'saving' ? 'Saving…'
            : paletteSaveStatus === 'ok'   ? '✓ Saved'
            : paletteSaveStatus === 'err'  ? '⚠ Error'
            : null}
        </span>
      </div>

      <div className="lore-canon-palette">
        {initialPalette.map((swatch, i) => {
          if (canonEditState?.idx === i) {
            return (
              <div key={`edit-${i}`} className="lore-canon-swatch lore-canon-swatch--editing">
                <div className="lore-canon-edit-row">
                  <input type="color" className="lore-canon-edit-color" value={canonEditState.hex} onChange={e => setCanonEditState(s => s ? {...s, hex: e.target.value} : s)} />
                  <input type="text" className="lore-canon-swatch-edit-input" placeholder="Label" autoFocus value={canonEditState.label} onChange={e => setCanonEditState(s => s ? {...s, label: e.target.value} : s)} />
                </div>
                <input type="text" className="lore-canon-swatch-edit-input lore-canon-swatch-edit-input--role" placeholder="Role/Comment" value={canonEditState.role} onChange={e => setCanonEditState(s => s ? {...s, role: e.target.value} : s)} onKeyDown={e => { if (e.key === 'Enter') canonPaletteSaveEdit(); }} />
                <div className="lore-canon-edit-actions">
                  <button className="lore-canon-btn lore-canon-btn--cancel" onClick={() => setCanonEditState(null)}>✕</button>
                  <button className="lore-canon-btn lore-canon-btn--save" onClick={canonPaletteSaveEdit}>✓ Save</button>
                </div>
              </div>
            );
          }
          return (
            <div key={i} className="lore-canon-swatch" onClick={() => setCanonEditState({ idx: i, hex: swatch.hex, label: swatch.label, role: swatch.role })}>
              <div
                className="lore-canon-swatch-color"
                style={{ backgroundColor: swatch.hex }}
                title={`Edit this colour (${swatch.hex})`}
              >
                <span className="lore-canon-swatch-edit-icon">✏</span>
              </div>

              <div className="lore-canon-swatch-info">
                <span className="lore-canon-swatch-label" title="Edit label">{swatch.label}</span>
                <span className="lore-canon-swatch-hex">{swatch.hex}</span>
                <span className="lore-canon-swatch-role" title="Edit role">
                  {swatch.role || <em style={{opacity:.4}}>add comment…</em>}
                </span>
              </div>

              <button
                className="lore-action-delete lore-canon-swatch-remove"
                title="Remove this colour"
                onClick={e => { e.stopPropagation(); canonPaletteRemove(i); }}
              >✕</button>
            </div>
          );
        })}

        {/* Add swatch */}
        {initialPalette.length < 12 && (
          canonEditState?.idx === -1 ? (
            <div className="lore-canon-swatch lore-canon-swatch--editing">
              <div className="lore-canon-edit-row">
                <input type="color" className="lore-canon-edit-color" value={canonEditState.hex} onChange={e => setCanonEditState(s => s ? {...s, hex: e.target.value} : s)} />
                <input type="text" className="lore-canon-swatch-edit-input" placeholder="Label (e.g. Amber)" autoFocus value={canonEditState.label} onChange={e => setCanonEditState(s => s ? {...s, label: e.target.value} : s)} />
              </div>
              <input type="text" className="lore-canon-swatch-edit-input lore-canon-swatch-edit-input--role" placeholder="Role (e.g. shadow)" value={canonEditState.role} onChange={e => setCanonEditState(s => s ? {...s, role: e.target.value} : s)} onKeyDown={e => { if (e.key === 'Enter') canonPaletteSaveEdit(); }} />
              <div className="lore-canon-edit-actions">
                <button className="lore-canon-btn lore-canon-btn--cancel" onClick={() => setCanonEditState(null)}>✕</button>
                <button className="lore-canon-btn lore-canon-btn--save" onClick={canonPaletteSaveEdit}>✓ Save</button>
              </div>
            </div>
          ) : (
            <button
              className="lore-canon-add-btn"
              title="Add a new colour"
              onClick={() => setCanonEditState({ idx: -1, hex: '#888888', label: '', role: '' })}
            >
              <span className="lore-canon-add-plus">+</span>
              <span className="lore-canon-add-label">Add colour</span>
            </button>
          )
        )}
      </div>
    </div>
  );
};
