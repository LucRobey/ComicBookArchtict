import React, { useState, useRef, useEffect } from 'react';
import '../../../styles/script.css';

/* ── Beat type definitions ───────────────────────────── */

export type BeatType = 'action' | 'dialogue' | 'narration' | 'internal_monologue' | 'sfx' | 'silence';
export type BeatWeight = 'anchor' | 'supporting' | 'ambient';

export interface Beat {
  beat_id: string;
  type: BeatType;
  // Common optional fields
  description?: string;
  text?: string;
  weight: BeatWeight;
  // dialogue-specific
  speaker?: string;
  delivery?: string;
  subtext?: string;
  volume?: string;
  // narration-specific
  voice?: string;
  character_id?: string | null;
  tone?: string;
  // sfx-specific
  intensity?: string;
  // silence-specific
  duration?: string;
  purpose?: string;
  // action-specific
  character_focus?: string;
  emotional_state?: string;
}

/* ── Per-type visual config ──────────────────────────── */

const TYPE_CONFIG: Record<BeatType, { icon: string; color: string; label: string }> = {
  action:            { icon: '⚡', color: '#06b6d4', label: 'Action' },
  dialogue:          { icon: '💬', color: '#3b82f6', label: 'Dialogue' },
  narration:         { icon: '📖', color: '#94a3b8', label: 'Narration' },
  internal_monologue:{ icon: '💭', color: '#8b5cf6', label: 'Internal' },
  sfx:               { icon: '💥', color: '#f97316', label: 'SFX' },
  silence:           { icon: '🤫', color: '#64748b', label: 'Silence' },
};

/* ── Helpers ─────────────────────────────────────────── */

/** Returns the primary editable text field for a given beat type. */
function getPrimaryText(beat: Beat): string {
  switch (beat.type) {
    case 'action':   return beat.description ?? '';
    case 'dialogue': return beat.text ?? '';
    case 'narration': return beat.text ?? '';
    case 'internal_monologue': return beat.text ?? '';
    case 'sfx':      return beat.text ?? '';
    case 'silence':  return beat.description ?? '';
    default:         return beat.text ?? beat.description ?? '';
  }
}

/** Returns a new beat with the primary text field updated. */
function withUpdatedText(beat: Beat, newText: string): Beat {
  switch (beat.type) {
    case 'action':
    case 'silence':
      return { ...beat, description: newText };
    default:
      return { ...beat, text: newText };
  }
}

/* ── Component ───────────────────────────────────────── */

interface BeatLineProps {
  beat: Beat;
  onEdit: (beat: Beat) => void;
  onFlag: (beat: Beat) => void;
}

const BeatLine: React.FC<BeatLineProps> = ({ beat, onEdit, onFlag }) => {
  const cfg = TYPE_CONFIG[beat.type] ?? TYPE_CONFIG.action;
  const [editing, setEditing] = useState(false);
  const [draftText, setDraftText] = useState(getPrimaryText(beat));
  const [subtextOpen, setSubtextOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [editing]);

  const handleSave = () => {
    const trimmed = draftText.trim();
    if (trimmed !== getPrimaryText(beat)) {
      onEdit(withUpdatedText(beat, trimmed));
    }
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setDraftText(getPrimaryText(beat)); setEditing(false); }
    if (e.key === 'Enter' && e.ctrlKey) handleSave();
  };

  const startEditing = () => {
    setDraftText(getPrimaryText(beat));
    setEditing(true);
  };

  /* ── Weight badge ─────────────────────────────────── */
  const weightBadge = (
    <span
      className={`beat-weight-badge beat-weight--${beat.weight}`}
      style={{ '--beat-color': cfg.color } as React.CSSProperties}
    >
      {beat.weight}
    </span>
  );

  /* ── Type-specific body ───────────────────────────── */
  const renderBody = () => {
    switch (beat.type) {
      case 'action':
        return (
          <>
            <p className="beat-text">{beat.description}</p>
            <div className="beat-meta">
              {beat.character_focus && <span className="beat-meta-tag" style={{ borderColor: cfg.color, color: cfg.color }}>{beat.character_focus}</span>}
              {beat.emotional_state && <span className="beat-meta-tag">{beat.emotional_state}</span>}
            </div>
          </>
        );

      case 'dialogue':
        return (
          <>
            <p className="beat-text">"{beat.text}"</p>
            {beat.delivery && <p className="beat-meta"><em>{beat.delivery}</em></p>}
            {beat.subtext && (
              <div
                className={`beat-subtext ${subtextOpen ? 'open' : ''}`}
                onClick={() => setSubtextOpen(!subtextOpen)}
                title={subtextOpen ? 'Click to collapse' : 'Click to expand subtext'}
              >
                <span className="beat-subtext-label">Subtext</span>
                {subtextOpen && <span className="beat-subtext-content">{beat.subtext}</span>}
              </div>
            )}
            <div className="beat-meta">
              {beat.volume && <span className="beat-meta-tag">{beat.volume}</span>}
            </div>
          </>
        );

      case 'narration':
        return (
          <>
            <p className="beat-text">{beat.text}</p>
            <div className="beat-meta">
              {beat.voice && <span className="beat-meta-tag" style={{ borderColor: cfg.color, color: cfg.color }}>{beat.voice}</span>}
              {beat.tone && <span className="beat-meta-tag">{beat.tone}</span>}
            </div>
          </>
        );

      case 'internal_monologue':
        return (
          <>
            <p className="beat-text" style={{ fontStyle: 'italic' }}>{beat.text}</p>
            <div className="beat-meta">
              {beat.character_id && <span className="beat-meta-tag" style={{ borderColor: cfg.color, color: cfg.color }}>{beat.character_id}</span>}
              {beat.tone && <span className="beat-meta-tag">{beat.tone}</span>}
            </div>
          </>
        );

      case 'sfx':
        return (
          <>
            <p className="beat-text" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{beat.text}</p>
            {beat.description && <p className="beat-meta">{beat.description}</p>}
            <div className="beat-meta">
              {beat.intensity && <span className="beat-meta-tag">{beat.intensity}</span>}
            </div>
          </>
        );

      case 'silence':
        return (
          <>
            <p className="beat-text" style={{ fontStyle: 'italic' }}>{beat.description}</p>
            <div className="beat-meta">
              {beat.duration && <span className="beat-meta-tag">{beat.duration}</span>}
              {beat.purpose && <span className="beat-meta-tag">{beat.purpose}</span>}
            </div>
          </>
        );

      default:
        return <p className="beat-text">{beat.text ?? beat.description}</p>;
    }
  };

  /* ── Header label: speaker for dialogue, type for others */
  const headerLabel = beat.type === 'dialogue' && beat.speaker
    ? beat.speaker
    : cfg.label;

  return (
    <div className={`beat-line ${editing ? 'editing' : ''}`}>
      {/* ── Header row ──────────────────────────────── */}
      <div className="beat-header">
        <span className="beat-type-icon" title={cfg.label}>{cfg.icon}</span>
        <span className="beat-type-label" style={{ color: cfg.color }}>
          {headerLabel}
        </span>
        {weightBadge}
        <span className="beat-id">{beat.beat_id}</span>
        <div className="beat-actions">
          {!editing && (
            <>
              <button className="dl-btn edit-btn" onClick={startEditing} title="Edit inline">✏️</button>
              <button className="dl-btn flag-btn" onClick={() => onFlag(beat)} title="Flag for review">🚩</button>
            </>
          )}
        </div>
      </div>

      {/* ── Body (view or edit) ─────────────────────── */}
      {editing ? (
        <div className="beat-edit-area">
          <textarea
            ref={textareaRef}
            value={draftText}
            onChange={e => setDraftText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="beat-textarea"
            rows={2}
          />
          <div className="beat-edit-controls">
            <span className="edit-hint">Ctrl+Enter to save · Esc to cancel</span>
            <button className="dl-btn cancel-btn" onClick={() => { setDraftText(getPrimaryText(beat)); setEditing(false); }}>Cancel</button>
            <button className="dl-btn save-confirm-btn" onClick={handleSave}>Save</button>
          </div>
        </div>
      ) : (
        <div onDoubleClick={startEditing}>
          {renderBody()}
        </div>
      )}
    </div>
  );
};

export default BeatLine;
