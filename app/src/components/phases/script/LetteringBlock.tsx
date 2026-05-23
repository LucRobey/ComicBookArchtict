import React, { useState } from 'react';
import '../../../styles/script.css';

/* ── Lettering interfaces (v2.0 schema) ──────────────── */

export interface Caption {
  beat_ref: string;
  text: string;
  position: string;
  style: 'narration_box' | 'character_voice' | 'editorial' | 'poetic';
}

export interface SpeechBalloon {
  beat_ref: string;
  character_id: string;
  text: string;
  balloon_type: 'normal' | 'whisper' | 'shout' | 'thought' | 'off_panel' | 'radio' | 'phone';
  tail_direction: string;
  emphasis_words: string[];
  reading_order: number;
}

export interface SfxEntry {
  beat_ref: string;
  text: string;
  style: 'integrated' | 'overlaid' | 'background';
  position: string;
  size: 'small' | 'medium' | 'large';
}

export interface Lettering {
  captions: Caption[];
  speech_balloons: SpeechBalloon[];
  sfx: SfxEntry[];
}

/* ── Color maps ──────────────────────────────────────── */

const BALLOON_TYPE_COLORS: Record<string, string> = {
  normal:    '#3b82f6',
  whisper:   '#94a3b8',
  shout:     '#ef4444',
  thought:   '#8b5cf6',
  off_panel: '#6b7280',
  radio:     '#10b981',
  phone:     '#f59e0b',
};

const CAPTION_STYLE_COLORS: Record<string, string> = {
  narration_box:   '#94a3b8',
  character_voice: '#8b5cf6',
  editorial:       '#64748b',
  poetic:          '#ec4899',
};

/* ── Helpers ─────────────────────────────────────────── */

/** Renders text with emphasis_words bolded */
function renderEmphasisText(text: string, emphasisWords: string[]): React.ReactNode {
  if (!emphasisWords || emphasisWords.length === 0) return text;

  // Build a regex that matches any of the emphasis words (case-insensitive)
  const escaped = emphasisWords.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = text.split(pattern);

  return parts.map((part, i) => {
    const isEmphasis = emphasisWords.some(w => w.toLowerCase() === part.toLowerCase());
    return isEmphasis
      ? <strong key={i} style={{ fontWeight: 800 }}>{part}</strong>
      : <span key={i}>{part}</span>;
  });
}

function formatLabel(raw: string): string {
  return raw.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/* ── Component ───────────────────────────────────────── */

interface LetteringBlockProps {
  lettering: Lettering;
}

const LetteringBlock: React.FC<LetteringBlockProps> = ({ lettering }) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    balloons: true,
    captions: true,
    sfx: true,
  });

  const toggle = (key: string) =>
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

  const sortedBalloons = [...(lettering.speech_balloons || [])].sort(
    (a, b) => a.reading_order - b.reading_order,
  );
  const captions = lettering.captions || [];
  const sfx = lettering.sfx || [];

  const hasBalloons = sortedBalloons.length > 0;
  const hasCaptions = captions.length > 0;
  const hasSfx = sfx.length > 0;

  if (!hasBalloons && !hasCaptions && !hasSfx) {
    return (
      <div className="lettering-block">
        <p className="no-dialogue">No lettering — silent panel.</p>
      </div>
    );
  }

  return (
    <div className="lettering-block">
      {/* ── Speech Balloons ── */}
      {hasBalloons && (
        <div className="lettering-section">
          <button
            className="lettering-section-header"
            onClick={() => toggle('balloons')}
            type="button"
          >
            <span>💬 Speech Balloons ({sortedBalloons.length})</span>
            <span className="lettering-chevron">{openSections.balloons ? '▾' : '▸'}</span>
          </button>

          {openSections.balloons && (
            <div className="lettering-section-body">
              {sortedBalloons.map((b, i) => {
                const typeColor = BALLOON_TYPE_COLORS[b.balloon_type] ?? '#64748b';
                return (
                  <div className="lettering-item" key={`balloon-${i}`}>
                    <span className="balloon-order-circle" style={{ borderColor: typeColor, color: typeColor }}>
                      {b.reading_order}
                    </span>
                    <div className="lettering-item-body">
                      <div className="lettering-item-row">
                        <span className="lettering-character" style={{ color: typeColor }}>
                          {b.character_id}
                        </span>
                        <span
                          className="balloon-type-badge"
                          style={{
                            background: `${typeColor}1a`,
                            color: typeColor,
                            border: `1px solid ${typeColor}55`,
                          }}
                        >
                          {formatLabel(b.balloon_type)}
                        </span>
                        {b.tail_direction && (
                          <span className="lettering-meta-tag">↗ {b.tail_direction}</span>
                        )}
                        <span className="beat-ref-tag">{b.beat_ref}</span>
                      </div>
                      <p className="lettering-text">
                        "{renderEmphasisText(b.text, b.emphasis_words)}"
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Captions ── */}
      {hasCaptions && (
        <div className="lettering-section">
          <button
            className="lettering-section-header"
            onClick={() => toggle('captions')}
            type="button"
          >
            <span>📝 Captions ({captions.length})</span>
            <span className="lettering-chevron">{openSections.captions ? '▾' : '▸'}</span>
          </button>

          {openSections.captions && (
            <div className="lettering-section-body">
              {captions.map((c, i) => {
                const styleColor = CAPTION_STYLE_COLORS[c.style] ?? '#64748b';
                return (
                  <div className="lettering-item" key={`caption-${i}`}>
                    <div className="lettering-item-body">
                      <div className="lettering-item-row">
                        <span
                          className="caption-style-badge"
                          style={{
                            background: `${styleColor}1a`,
                            color: styleColor,
                            border: `1px solid ${styleColor}55`,
                          }}
                        >
                          {formatLabel(c.style)}
                        </span>
                        <span className="lettering-meta-tag">📍 {c.position}</span>
                        <span className="beat-ref-tag">{c.beat_ref}</span>
                      </div>
                      <p className="lettering-text">"{c.text}"</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── SFX ── */}
      {hasSfx && (
        <div className="lettering-section">
          <button
            className="lettering-section-header"
            onClick={() => toggle('sfx')}
            type="button"
          >
            <span>💥 SFX ({sfx.length})</span>
            <span className="lettering-chevron">{openSections.sfx ? '▾' : '▸'}</span>
          </button>

          {openSections.sfx && (
            <div className="lettering-section-body">
              {sfx.map((s, i) => (
                <div className="lettering-item" key={`sfx-${i}`}>
                  <div className="lettering-item-body">
                    <span className="sfx-text">{s.text}</span>
                    <div className="lettering-item-row">
                      <span
                        className="balloon-type-badge"
                        style={{
                          background: 'rgba(239,68,68,0.12)',
                          color: '#ef4444',
                          border: '1px solid rgba(239,68,68,0.35)',
                        }}
                      >
                        {formatLabel(s.style)}
                      </span>
                      <span className="lettering-meta-tag">📍 {s.position}</span>
                      <span className="lettering-meta-tag">
                        {s.size === 'large' ? '🔠' : s.size === 'medium' ? '🔡' : '🔤'} {s.size}
                      </span>
                      <span className="beat-ref-tag">{s.beat_ref}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LetteringBlock;
