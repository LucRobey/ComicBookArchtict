import React, { useState, useRef } from 'react';
import type { FlagTarget, PalettePick } from '../types';
import { saveQaFlag } from '@/utils/saveFile';

interface LoreFlagDrawerProps {
  flagTarget: FlagTarget;
  onClose: () => void;
  onFlagSent: (flagKey: string) => void;
}

export const LoreFlagDrawer: React.FC<LoreFlagDrawerProps> = ({ flagTarget, onClose, onFlagSent }) => {
  const [flagMode, setFlagMode] = useState<'regenerate' | 'modify'>('regenerate');
  const [flagNote, setFlagNote] = useState('');
  const [flagSendStatus, setFlagSendStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');
  const [palettePicks, setPalettePicks] = useState<PalettePick[]>([]);
  const flagColorRef = useRef<HTMLInputElement>(null);

  const submitFlag = async () => {
    setFlagSendStatus('sending');
    const { type, locId, variantId, label, shot } = flagTarget;
    const now = new Date().toISOString();
    const vSlug = variantId ?? 'flat';

    const flagKey = (type === 'shot' || type === 'style_image')
      ? `${type}:${locId}:${vSlug}:${shot!.id}`
      : `${type}:${locId}:${vSlug}`;

    let flagType: string;
    if (type === 'shot' || type === 'style_image') {
      const pfx = type === 'shot' ? 'SHOT' : 'STYLE_IMAGE';
      flagType = flagMode === 'regenerate'
        ? `REGENERATE_${pfx}:${locId}:${vSlug}:${shot!.id}`
        : `MODIFY_${pfx}:${locId}:${vSlug}:${shot!.id}`;
    } else if (type === 'palette') {
      flagType = `REGENERATE_PALETTE:${locId}:${vSlug}`;
    } else {
      flagType = `MODIFY_LIGHTING:${locId}:${vSlug}`;
    }

    const headerLabel = type === 'palette' ? 'Location Palette'
      : type === 'lighting' ? 'Location Lighting'
      : flagMode === 'regenerate' ? (type === 'style_image' ? 'Style Image Re-generate' : 'Shot Re-generate')
      : (type === 'style_image' ? 'Style Image Modify' : 'Shot Modify');

    const lines = [
      `# QA Flag — ${headerLabel}`,
      `Generated: ${now}`,
      ``,
      `## [${flagType}]`,
      `* **Location:** ${locId}`,
      `* **Variant:** ${vSlug}`,
      `* **Target:** ${label}`,
    ];

    if (type === 'shot' || type === 'style_image') {
      if (flagMode === 'regenerate') {
        if (shot?.prompt_suffix) {
          lines.push(`* **Current prompt suffix:** ${shot.prompt_suffix}`);
        }
        lines.push(`* **Prompt changes:** ${flagNote || '(no changes specified — re-run with same prompt)'}`);
      } else {
        if (shot?.image) {
          lines.push(`* **Source image:** ${shot.image}`);
        }
        lines.push(`* **Changes to apply:** ${flagNote || '(no changes specified)'}`);
      }
    } else if (type === 'palette') {
      if (palettePicks.length > 0) {
        lines.push(`* **Palette:** ${palettePicks.map(p => p.comment ? `${p.hex} (${p.comment})` : p.hex).join(', ')}`);
      }
      if (flagNote.trim()) {
        lines.push(`* **Direction:** ${flagNote}`);
      } else if (palettePicks.length === 0) {
        lines.push(`* **Direction:** (no direction specified)`);
      }
    } else {
      lines.push(`* **Direction:** ${flagNote || '(no additional direction)'}`);
    }

    const modeSlug = (type === 'shot' || type === 'style_image') ? `_${flagMode}` : '';
    const filename = `qa/lore/flag_${type}${modeSlug}_${locId}_${vSlug}_${now.replace(/[:.]/g, '-')}.md`;
    
    try {
      await saveQaFlag(filename, lines.join('\n'));
      onFlagSent(flagKey);
      setFlagSendStatus('ok');
      setTimeout(() => { onClose(); }, 1200);
    } catch {
      setFlagSendStatus('err');
    }
  };

  return (
    <div className="lore-flag-drawer">
      <div className="lore-flag-drawer-header">
        <span className="lore-flag-drawer-title">
          {flagTarget.type === 'shot' ? '🚩 Flag Image'
            : flagTarget.type === 'style_image' ? '🚩 Flag Style Image'
            : flagTarget.type === 'palette' ? '🚩 Flag Palette'
            : '🚩 Flag Lighting'}
        </span>
        <button className="lore-flag-drawer-close" onClick={onClose}>✕</button>
      </div>
      <p className="lore-flag-drawer-shot-name">{flagTarget.label}</p>

      {/* Mode toggle — only for image/shot flags */}
      {(flagTarget.type === 'shot' || flagTarget.type === 'style_image') && (
        <div className="lore-flag-mode-toggle">
          <button
            className={`lore-flag-mode-btn ${flagMode === 'regenerate' ? 'active' : ''}`}
            onClick={() => setFlagMode('regenerate')}
            title="Generate a brand-new image with a modified prompt"
          >
            ✦ Re-generate
          </button>
          <button
            className={`lore-flag-mode-btn ${flagMode === 'modify' ? 'active' : ''}`}
            onClick={() => setFlagMode('modify')}
            title="Pass the existing image back to the generator with change instructions"
          >
            ✎ Modify
          </button>
          <span className="lore-flag-mode-hint">
            {flagMode === 'regenerate'
              ? 'New image from scratch — describe prompt changes'
              : 'Edit existing image — describe what to change'}
          </span>
        </div>
      )}

      {/* Colour picker — only for palette flags */}
      {flagTarget.type === 'palette' && (
        <div className="lore-palette-picker">
          <div className="lore-palette-swatches lore-palette-swatches--with-comments">
            {palettePicks.map((item, i) => (
              <div key={i} className="lore-palette-swatch-wrapper">
                <div className="lore-palette-swatch" style={{ background: item.hex }}>
                  <span className="lore-palette-swatch-hex">{item.hex}</span>
                  <button
                    className="lore-palette-swatch-remove"
                    onClick={() => setPalettePicks(p => p.filter((_, idx) => idx !== i))}
                  >✕</button>
                </div>
                <input
                  className="lore-palette-swatch-comment"
                  placeholder="comment (e.g. walls)"
                  value={item.comment}
                  onChange={e => setPalettePicks(p => p.map((c, idx) => idx === i ? { ...c, comment: e.target.value } : c))}
                />
              </div>
            ))}
            {palettePicks.length < 8 && (
              <button
                className="lore-palette-add-btn"
                onClick={() => flagColorRef.current?.click()}
                title="Pick a colour"
              >+</button>
            )}
          </div>
          <input
            ref={flagColorRef}
            type="color"
            style={{ display: 'none' }}
            onChange={e => {
              const hex = e.target.value;
              if (!palettePicks.some(p => p.hex === hex))
                setPalettePicks(p => [...p, { hex, comment: '' }]);
            }}
          />
          {palettePicks.length === 0 && (
            <p className="lore-palette-empty-hint">Click + to pick colours. Optional — the agent will also infer from your direction note.</p>
          )}
        </div>
      )}

      <textarea
        className="lore-flag-drawer-textarea"
        placeholder={
          (flagTarget.type !== 'shot' && flagTarget.type !== 'style_image') ? "Direction for the agent (optional)"
          : flagMode === 'regenerate'
            ? "Describe changes to the prompt — e.g. 'shoot from above, harsher shadows, no people'"
            : "Describe what to change in the image — e.g. 'remove the chair on the left, make the window larger'"
        }
        value={flagNote}
        onChange={e => setFlagNote(e.target.value)}
        rows={3}
      />
      <div className="lore-flag-drawer-actions">
        <button
          className="lore-flag-drawer-submit"
          disabled={flagSendStatus === 'sending'}
          onClick={submitFlag}
        >
          {flagSendStatus === 'sending' ? 'Sending…' : flagSendStatus === 'ok' ? '✓ Flagged!' : 'Send Flag'}
        </button>
        <button className="lore-flag-drawer-cancel" onClick={onClose}>Cancel</button>
        {flagSendStatus === 'err' && <span className="lore-desc-err">⚠ Failed</span>}
      </div>
    </div>
  );
};
