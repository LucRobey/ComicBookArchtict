import React, { useState, useCallback } from 'react';
import { useJsonFile } from '@/hooks/useJsonFile';
import { exportQaReport } from '@/utils/qaExport';
import '../../../styles/character-hub.css';
import type { LoreData, CharacterMoodsData, CharacterMood } from '@/types/data';

type SubTab = 'visuals' | 'personality' | 'mood-arc';

// ── Constants ────────────────────────────────────────────

const MOODS_PATH = 'data/character_moods.json';
const LORE_PATH  = 'data/lore.json';

const EMOTIONS = [
  'joyful', 'content', 'anxious', 'sad', 'angry',
  'ashamed', 'performing', 'numb', 'tender', 'determined',
  'overwhelmed', 'resigned',
] as const;

const EMOTION_EMOJI: Record<string, string> = {
  joyful: '😄', content: '😌', anxious: '😰', sad: '😢',
  angry: '😠', ashamed: '😔', performing: '🎭', numb: '😶',
  tender: '🥹', determined: '💪', overwhelmed: '😵', resigned: '😑',
};

const TURNAROUND_VIEWS = ['front', '3q', 'profile', 'back', 'expressions'] as const;

// ── CharacterImage — loads real image, falls back to placeholder ─

interface CharacterImageProps {
  src: string;
  alt: string;
  fallbackEmoji?: string;
}

const CharacterImage: React.FC<CharacterImageProps> = ({ src, alt, fallbackEmoji = '🖼' }) => {
  const [failed, setFailed] = useState(false);
  // Reset when src changes (different character selected)
  React.useEffect(() => { setFailed(false); }, [src]);

  if (failed) {
    return (
      <div className="chub-image-placeholder">
        <span>{fallbackEmoji}</span>
        <span>No image</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className="chub-real-image"
      onError={() => setFailed(true)}
    />
  );
};

// ── Helpers ──────────────────────────────────────────────

/** Build the URL for a project-relative image file. */
function buildImageSrc(relativePath: string): string {
  return `/api/load-image?path=${encodeURIComponent(relativePath)}`;
}

// ── CharacterHubPhase ────────────────────────────────────

const CharacterHubPhase: React.FC = () => {
  const { data: lore }  = useJsonFile<LoreData>(LORE_PATH);
  const { data: moodsData, save: saveMoods } = useJsonFile<CharacterMoodsData>(MOODS_PATH);

  // Derive character list from moods file, falling back to lore cast if moods not yet generated
  const characters: string[] = React.useMemo(() => {
    if (moodsData?.characters && moodsData.characters.length > 0) return moodsData.characters;
    // Attempt to extract cast from lore
    if (lore?.cast && Array.isArray(lore.cast)) return lore.cast as string[];
    if (lore?.characters && Array.isArray(lore.characters)) return lore.characters as string[];
    return [];
  }, [moodsData, lore]);

  const [selectedChar, setSelectedChar] = useState(0);
  const [subTab, setSubTab]             = useState<SubTab>('visuals');

  // QA drawer state
  const [qaOpen, setQaOpen]       = useState(false);
  const [qaContext, setQaContext]  = useState('');
  const [qaFlagType, setQaFlagType] = useState('');
  const [qaNote, setQaNote]       = useState('');
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Mood arc expand state
  const [expandedScene, setExpandedScene] = useState<number | null>(null);
  const [draftMood, setDraftMood]         = useState<Partial<CharacterMood>>({});
  const [savingScene, setSavingScene]     = useState<number | null>(null);
  const [savedScene, setSavedScene]       = useState<number | null>(null);

  const charName = characters[selectedChar] ?? '';

  // ── QA handling ─────────────────────────────────────────

  const openQa = useCallback((context: string, flagType: string) => {
    setQaContext(context);
    setQaFlagType(flagType);
    setQaNote('');
    setQaOpen(true);
  }, []);

  const handleExport = async () => {
    const now = new Date().toISOString();
    const content = `# QA Report — Phase 0.5 (Characters Hub)\nGenerated: ${now}\n\n## ${charName} — [${qaFlagType}]\n* **Context:** ${qaContext}\n* **Request:** ${qaNote}\n`;
    const result = await exportQaReport({ phase: '05', phaseFolder: 'character-hub', content });
    setExportStatus(result.success ? 'success' : 'error');
    setTimeout(() => { setExportStatus('idle'); setQaOpen(false); setQaNote(''); }, 1500);
  };

  // ── Mood save handling ───────────────────────────────────

  const handleExpandScene = (sceneId: number, currentMood: CharacterMood | undefined) => {
    if (expandedScene === sceneId) {
      setExpandedScene(null);
      setDraftMood({});
      return;
    }
    setExpandedScene(sceneId);
    setDraftMood(currentMood ? { ...currentMood } : {
      dominant_emotion: 'anxious',
      feels: '',
      shows: '',
      tension_with: null,
    });
  };

  const handleSaveMood = async (sceneId: number) => {
    if (!moodsData) return;
    setSavingScene(sceneId);
    const updated: CharacterMoodsData = {
      ...moodsData,
      scenes: moodsData.scenes.map(s =>
        s.scene_id === sceneId
          ? { ...s, moods: { ...s.moods, [charName]: { ...(s.moods[charName] ?? {}), ...draftMood } as CharacterMood } }
          : s
      ),
    };
    const ok = await saveMoods(updated);
    setSavingScene(null);
    if (ok) {
      setSavedScene(sceneId);
      setTimeout(() => setSavedScene(null), 1800);
    }
  };

  // ── Empty state (no characters yet) ─────────────────────

  if (characters.length === 0) {
    return (
      <div className="chub-phase bg-background-panel">
        <div className="chub-state" style={{ flex: 1 }}>
          <div className="chub-state-icon">👤</div>
          <div className="chub-state-title">No characters found</div>
          <p className="chub-state-hint">
            Run the Phase 0.5 agent to generate <code>data/character_moods.json</code>, or ensure
            <code>data/lore.json</code> contains a <code>cast</code> or <code>characters</code> array.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="chub-phase bg-background-panel">

      {/* ── Left sidebar: character list ── */}
      <div className="chub-sidebar bg-secondary border-r border-border shadow-sm">
        <div className="chub-sidebar-header">
          <h3>Cast</h3>
          <span className="chub-count">{characters.length}</span>
        </div>
        <div className="chub-list">
          {characters.map((name, i) => (
            <button
              key={name}
              className={`chub-btn ${i === selectedChar ? 'active' : ''}`}
              onClick={() => {
                setSelectedChar(i);
                setQaOpen(false);
                setExpandedScene(null);
                setDraftMood({});
              }}
            >
              <span className="chub-avatar">{name[0]}</span>
              <div className="chub-btn-text">
                <span className="chub-char-name">{name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Main panel ── */}
      <div className="chub-main">
        {/* Header: character name + sub-tab switcher */}
        <div className="chub-main-header border-b border-border bg-background-panel">
          <span className="chub-char-title">{charName}</span>
          <div className="chub-subtab-bar">
            <button
              id="chub-subtab-visuals"
              className={`chub-subtab-btn ${subTab === 'visuals' ? 'active' : ''}`}
              onClick={() => { setSubTab('visuals'); setQaOpen(false); }}
            >
              🖼 Visuals
            </button>
            <button
              id="chub-subtab-personality"
              className={`chub-subtab-btn ${subTab === 'personality' ? 'active' : ''}`}
              onClick={() => { setSubTab('personality'); setQaOpen(false); }}
            >
              🧠 Personality
            </button>
            <button
              id="chub-subtab-mood-arc"
              className={`chub-subtab-btn ${subTab === 'mood-arc' ? 'active' : ''}`}
              onClick={() => { setSubTab('mood-arc'); setQaOpen(false); }}
            >
              📈 Mood Arc
            </button>
          </div>
        </div>

        {/* Sub-tab content */}
        <div className="chub-content">

          {/* ── Visuals sub-tab ── */}
          {subTab === 'visuals' && (
            <>
              {/* Canonical visual description */}
              <div className="chub-section">
                <div className="chub-section-label">Canonical Visual Profile</div>
                <div className="chub-md-panel" id={`chub-canonical-${charName}`}>
                  <button
                    className="chub-md-flag-btn"
                    onClick={() => openQa(`canonical_visual.md for ${charName}`, 'REWRITE_VISUAL')}
                    title="Flag for agent — request rewrite"
                  >
                    🚩 Flag
                  </button>
                  <em style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    No canonical_visual.md found for {charName}.<br />
                    Run <code>05_visual_signature.md</code> pipeline to generate it.
                    <br /><br />
                    Expected path: <code>global_characters/{charName}/canonical_visual.md</code>
                  </em>
                </div>
              </div>

              {/* Turnaround strip */}
              <div className="chub-section">
                <div className="chub-section-label">Character Turnarounds</div>
                <div className="chub-image-strip" id={`chub-turnarounds-${charName}`}>
                  {TURNAROUND_VIEWS.map(view => (
                    <div key={view} className="chub-image-thumb">
                      <CharacterImage
                        src={buildImageSrc(`global_characters/${charName}/turnarounds/${view}.png`)}
                        alt={`${charName} — ${view} view`}
                        fallbackEmoji="🖼"
                      />
                      <div className="chub-image-label">{view.toUpperCase()}</div>
                    </div>
                  ))}
                </div>
                <button
                  className="chub-md-flag-btn"
                  style={{ position: 'static', alignSelf: 'flex-start', marginTop: 4 }}
                  onClick={() => openQa(`Turnaround images for ${charName}`, 'REGENERATE_TURNAROUNDS')}
                >
                  🚩 Regenerate turnarounds
                </button>
              </div>

              {/* Emotional state grid — one image per dominant emotion */}
              <div className="chub-section">
                <div className="chub-section-label">Dominant Emotion States</div>
                <div className="chub-emotion-grid" id={`chub-emotions-${charName}`}>
                  {EMOTIONS.map(emotion => (
                    <div key={emotion} className="chub-emotion-cell">
                      <CharacterImage
                        src={buildImageSrc(`data/characters/${charName}/examples/emotional_states/${emotion}.png`)}
                        alt={`${charName} — ${emotion}`}
                        fallbackEmoji={EMOTION_EMOJI[emotion] ?? '🖼'}
                      />
                      <button
                        className="chub-emotion-flag"
                        onClick={() => openQa(`Emotion: ${emotion} for ${charName}`, `REGENERATE_EMOTION:${emotion}`)}
                        title={`Regenerate ${emotion} image`}
                      >
                        🚩
                      </button>
                      <div className="chub-emotion-label">{emotion}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── Personality sub-tab ── */}
          {subTab === 'personality' && (
            <>
              <div className="chub-section">
                <div className="chub-section-label">Personality Signature</div>
                <div className="chub-md-panel" id={`chub-personality-${charName}`}>
                  <button
                    className="chub-md-flag-btn"
                    onClick={() => openQa(`personality_signature.md for ${charName}`, 'REWRITE_PERSONALITY')}
                    title="Flag for agent — request rewrite"
                  >
                    🚩 Flag
                  </button>
                  <em style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    No personality_signature.md found for {charName}.<br />
                    Run <code>06_personality_signature.md</code> pipeline to generate it.
                    <br /><br />
                    Expected path: <code>data/characters/{charName}/personality_signature.md</code>
                  </em>
                </div>
              </div>

              <div className="chub-section">
                <div className="chub-section-label">Dominant Emotion States</div>
                <div className="chub-emotion-grid" id={`chub-personality-emotions-${charName}`}>
                  {EMOTIONS.map(emotion => (
                    <div key={emotion} className="chub-emotion-cell">
                      <CharacterImage
                        src={buildImageSrc(`data/characters/${charName}/examples/emotional_states/${emotion}.png`)}
                        alt={`${charName} — ${emotion}`}
                        fallbackEmoji={EMOTION_EMOJI[emotion] ?? '🖼'}
                      />
                      <button
                        className="chub-emotion-flag"
                        onClick={() => openQa(`Personality emotion: ${emotion} for ${charName}`, `REGENERATE_EMOTION:${emotion}`)}
                        title={`Regenerate ${emotion} image`}
                      >
                        🚩
                      </button>
                      <div className="chub-emotion-label">{emotion}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── Mood Arc sub-tab ── */}
          {subTab === 'mood-arc' && (
            <>
              {(!moodsData || moodsData.scenes.length === 0) ? (
                <div className="chub-state" style={{ flex: 1, minHeight: 300 }}>
                  <div className="chub-state-icon">📈</div>
                  <div className="chub-state-title">No mood arc yet</div>
                  <p className="chub-state-hint">
                    Run the <code>07_mood_simulation.md</code> pipeline to simulate {charName}'s emotional
                    arc across all scenes. The agent reads <code>data/scenario.json</code> and each
                    character's <code>personality_signature.md</code> to produce this data.
                  </p>
                </div>
              ) : (
                <div className="chub-mood-timeline" id={`chub-mood-arc-${charName}`}>
                  {moodsData.scenes.map(scene => {
                    const mood = scene.moods?.[charName];
                    const isExpanded = expandedScene === scene.scene_id;
                    const emoji = mood ? (EMOTION_EMOJI[mood.dominant_emotion] ?? '❓') : '';

                    return (
                      <div
                        key={scene.scene_id}
                        className={`chub-mood-card ${isExpanded ? 'expanded' : ''}`}
                        id={`chub-mood-scene-${scene.scene_id}`}
                      >
                        <div
                          className="chub-mood-card-header"
                          onClick={() => mood && handleExpandScene(scene.scene_id, mood)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={e => e.key === 'Enter' && mood && handleExpandScene(scene.scene_id, mood)}
                        >
                          <div className="chub-mood-card-left">
                            <span className="chub-scene-num">Scene {scene.scene_id}</span>
                            {mood ? (
                              <>
                                <span className="chub-mood-emoji">{emoji}</span>
                                <div className="chub-mood-card-info">
                                  <span className="chub-scene-title">{scene.title}</span>
                                  <span className="chub-mood-label">{mood.dominant_emotion}</span>
                                </div>
                              </>
                            ) : (
                              <div className="chub-mood-card-info">
                                <span className="chub-scene-title">{scene.title}</span>
                              </div>
                            )}
                          </div>
                          {mood && (
                            <span className="chub-mood-expand-icon">▾</span>
                          )}
                        </div>

                        {/* Character not in this scene */}
                        {!mood && (
                          <p className="chub-mood-absent">{charName} is not in this scene.</p>
                        )}

                        {/* Expanded inline edit form */}
                        {mood && isExpanded && (
                          <div className="chub-mood-edit-form">
                            <div className="chub-mood-edit-form-row">
                              <div className="chub-field">
                                <label className="chub-field-label">Dominant emotion</label>
                                <select
                                  className="chub-emotion-select"
                                  value={draftMood.dominant_emotion ?? mood.dominant_emotion}
                                  onChange={e => setDraftMood(d => ({ ...d, dominant_emotion: e.target.value }))}
                                  id={`chub-emotion-select-${scene.scene_id}`}
                                >
                                  {EMOTIONS.map(em => (
                                    <option key={em} value={em}>
                                      {EMOTION_EMOJI[em]} {em}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="chub-field">
                                <label className="chub-field-label">Tension with</label>
                                <select
                                  className="chub-tension-select"
                                  value={draftMood.tension_with ?? mood.tension_with ?? ''}
                                  onChange={e => setDraftMood(d => ({ ...d, tension_with: e.target.value || null }))}
                                  id={`chub-tension-select-${scene.scene_id}`}
                                >
                                  <option value="">— none —</option>
                                  {characters.filter(c => c !== charName).map(c => (
                                    <option key={c} value={c}>{c}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="chub-field">
                              <label className="chub-field-label">Feels (internal — private truth)</label>
                              <textarea
                                className="chub-mood-textarea"
                                value={draftMood.feels ?? mood.feels}
                                onChange={e => setDraftMood(d => ({ ...d, feels: e.target.value }))}
                                rows={2}
                                placeholder="What is this character privately experiencing?"
                                id={`chub-feels-${scene.scene_id}`}
                              />
                            </div>

                            <div className="chub-field">
                              <label className="chub-field-label">Shows (external — the mask)</label>
                              <textarea
                                className="chub-mood-textarea"
                                value={draftMood.shows ?? mood.shows}
                                onChange={e => setDraftMood(d => ({ ...d, shows: e.target.value }))}
                                rows={2}
                                placeholder="How does their behaviour/speech express this outward?"
                                id={`chub-shows-${scene.scene_id}`}
                              />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <button
                                className={`chub-mood-save-btn ${savedScene === scene.scene_id ? 'saved' : ''}`}
                                onClick={() => handleSaveMood(scene.scene_id)}
                                disabled={savingScene === scene.scene_id}
                                id={`chub-save-mood-${scene.scene_id}`}
                              >
                                {savingScene === scene.scene_id ? 'Saving…' : savedScene === scene.scene_id ? '✓ Saved' : 'Save changes'}
                              </button>
                              {savedScene === scene.scene_id && (
                                <span className="chub-save-toast">✓ Saved to character_moods.json</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── QA Drawer ── */}
      {qaOpen && (
        <div className="chub-qa-drawer bg-background-panel border-l border-border shadow-lg">
          <div className="chub-qa-header">
            <div>
              <h3>🚩 Flag for Agent</h3>
              <p className="chub-qa-sub">{charName} · {qaFlagType}</p>
            </div>
            <button className="chub-qa-close" onClick={() => setQaOpen(false)}>✕</button>
          </div>

          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {qaContext}
          </p>

          <textarea
            className="chub-qa-textarea"
            placeholder="Describe what should change…"
            value={qaNote}
            onChange={e => setQaNote(e.target.value)}
            rows={5}
            id="chub-qa-note"
          />

          {exportStatus !== 'idle' && (
            <div style={{
              fontSize: '0.78rem', fontWeight: 600, padding: '6px 10px', borderRadius: 6,
              background: exportStatus === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
              color: exportStatus === 'success' ? '#10b981' : '#ef4444',
              border: `1px solid ${exportStatus === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
            }}>
              {exportStatus === 'success' ? '✓ QA report exported!' : '✗ Export failed'}
            </div>
          )}

          <button
            className="chub-qa-export-btn"
            disabled={!qaNote.trim()}
            onClick={handleExport}
            id="chub-qa-export-btn"
          >
            📤 Export QA Report
          </button>
        </div>
      )}
    </div>
  );
};

export default CharacterHubPhase;
