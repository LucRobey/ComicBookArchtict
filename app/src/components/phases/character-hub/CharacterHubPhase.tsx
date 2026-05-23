import React, { useState, useCallback, useEffect } from 'react';
import { PhaseHeader } from '../../shared/PhaseHeader';
import { useJsonFile } from '@/hooks/useJsonFile';
import { exportQaReport } from '@/utils/qaExport';
import OriginalView from './OriginalView';
import { SignatureDetailsPanel } from '../scenario/tabs/SignatureDetailsPanel';
import '../../../styles/character-hub.css';
import type { LoreData, CharacterMoodsData, CharacterMood, PersonalitySignatureData, ScenarioChaptersData, ScenarioScenesData, CharacterSignature } from '@/types/data';

type ViewMode = 'original' | 'virtual';
type SubTab = 'visuals' | 'personality' | 'mood-arc';

// ── Constants ────────────────────────────────────────────

const MOODS_PATH = 'data/character_moods.json';
const LORE_PATH  = 'data/lore.json';
const HIGHLIGHTS_PATH = 'data/character_highlights.json';

const EMOTIONS = [
  'joyful', 'content', 'anxious', 'sad', 'angry',
  'ashamed', 'performing', 'numb', 'tender', 'determined',
  'overwhelmed', 'resigned',
] as const;

const EMOTION_EMOJI: Record<string, string> = {
  joyful: '😄', content: '😌', anxious: '😰', sad: '😢',
  angry: '😠', ashamed: '😔', performing: '🎭', numb: '😶',
  tender: '🥹', determined: '💪', overwhelmed: '😵', resigned: '😑',
  happy: '😄', crying: '😭', laughing: '😆', surprised: '😮',
};

const TURNAROUND_VIEWS = ['front', '3q', 'profile', 'back'] as const;

// ── CharacterImage ───────────────────────────────────────

interface CharacterImageProps {
  src: string;
  alt: string;
  fallbackEmoji?: string;
}

const CharacterImage: React.FC<CharacterImageProps> = ({ src, alt, fallbackEmoji = '🖼' }) => {
  const [failed, setFailed] = useState(false);
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

function buildImageSrc(relativePath: string): string {
  return `/api/load-image?path=${encodeURIComponent(relativePath)}`;
}

// ── Highlights type ──────────────────────────────────────

interface HighlightsEntry {
  highlighted_fields: string[];
  notes: string;
}
type HighlightsData = Record<string, HighlightsEntry>;

// ── AvatarThumb — tiny sidebar avatar from originals/ ────

const AvatarThumb: React.FC<{ charName: string }> = ({ charName }) => {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    const url = `/api/list-dir?path=${encodeURIComponent(`global_characters/${charName}/originals`)}`;
    fetch(url).then(r => r.ok ? r.json() : null).then(data => {
      if (!data?.entries) return;
      const first = data.entries.find((e: { name: string; isDir: boolean }) => !e.isDir);
      if (first) setSrc(buildImageSrc(`global_characters/${charName}/originals/${first.name}`));
    }).catch(() => {});
  }, [charName]);

  if (!src) return <span className="chub-avatar">{charName[0]}</span>;
  return <img src={src} alt={charName} className="chub-avatar-img" />;
};

// ── CharacterHubPhase ────────────────────────────────────

const CharacterHubPhase: React.FC = () => {
  const { data: lore }  = useJsonFile<LoreData>(LORE_PATH);
  const { data: moodsData, save: saveMoods } = useJsonFile<CharacterMoodsData>(MOODS_PATH);
  const { data: hlData, save: saveHighlights } = useJsonFile<HighlightsData>(HIGHLIGHTS_PATH);
  const { data: chaptersData } = useJsonFile<ScenarioChaptersData>('data/scenario_chapters.json');
  const { data: scenarioData } = useJsonFile<ScenarioScenesData>('data/scenario_scenes.json');
  const [moodLevel, setMoodLevel] = useState<'chapter' | 'scene'>('chapter');

  // Discover character folders from filesystem
  const [fsChars, setFsChars] = useState<string[]>([]);
  useEffect(() => {
    fetch(`/api/list-dir?path=${encodeURIComponent('global_characters')}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.entries) return;
        const dirs = data.entries
          .filter((e: { name: string; isDir: boolean }) => e.isDir && e.name !== '_TEMPLATE')
          .map((e: { name: string }) => e.name);
        setFsChars(dirs);
      })
      .catch(() => {});
  }, []);

  // Merge: filesystem chars + moods/lore chars (deduplicated)
  const characters: string[] = React.useMemo(() => {
    const fromData: string[] = [];
    if (moodsData?.characters?.length) fromData.push(...moodsData.characters);
    else if (lore?.cast && Array.isArray(lore.cast)) fromData.push(...(lore.cast as string[]));
    else if (lore?.characters && Array.isArray(lore.characters)) fromData.push(...(lore.characters as string[]));
    const combined = new Set([...fsChars, ...fromData]);
    return Array.from(combined).sort();
  }, [fsChars, moodsData, lore]);

  const [selectedChar, setSelectedChar] = useState(0);
  const [viewMode, setViewMode]         = useState<ViewMode>('original');
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

  // Highlight save state
  const [hlSaving, setHlSaving] = useState(false);
  const [hlSaved, setHlSaved]   = useState(false);

  const charName = characters[selectedChar] ?? '';

  const { data: personalityData, save: savePersonality } = useJsonFile<PersonalitySignatureData>(
    charName ? `data/characters/${charName}/personality_signature.json` : null
  );

  const charHighlights: HighlightsEntry = hlData?.[charName] ?? { highlighted_fields: [], notes: '' };

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

  // ── Highlights save ─────────────────────────────────────

  const handleHighlightsChange = useCallback(async (entry: HighlightsEntry) => {
    if (!charName) return;
    const currentHl = hlData ?? {};
    const updated = { ...currentHl, [charName]: entry };
    setHlSaving(true);
    const ok = await saveHighlights(updated);
    setHlSaving(false);
    if (ok) { setHlSaved(true); setTimeout(() => setHlSaved(false), 1500); }
  }, [hlData, charName, saveHighlights]);

  // ── Personality save ────────────────────────────────────

  const handleSavePersonalitySignature = (char: string, updatedSig: CharacterSignature) => {
    if (!personalityData) return;
    savePersonality({
      ...personalityData,
      signatures: {
        ...personalityData.signatures,
        [char]: updatedSig,
      },
    });
  };

  const handleSaveGeneralMood = async (newMood: string): Promise<boolean> => {
    if (!moodsData) return false;
    const updatedGeneralMood = {
      ...(moodsData.general_mood || {}),
      [charName]: newMood
    };
    const updated: CharacterMoodsData = {
      ...moodsData,
      general_mood: updatedGeneralMood
    };
    const ok = await saveMoods(updated);
    return !!ok;
  };

  // ── Mood save handling ───────────────────────────────────

  const handleExpandScene = (sceneId: number, currentMood: CharacterMood | undefined) => {
    if (expandedScene === sceneId) {
      setExpandedScene(null);
      setDraftMood({});
      return;
    }
    setExpandedScene(sceneId);
    setDraftMood(currentMood ? {
      dominant_emotion: currentMood.dominant_emotion || 'anxious',
      feels: currentMood.feels || '',
      shows: currentMood.shows || '',
      tension_with: currentMood.tension_with || null,
      agenda: currentMood.agenda || '',
      subtext: currentMood.subtext || '',
      secret: currentMood.secret || '',
      status_dynamic: currentMood.status_dynamic || '',
      tactics: currentMood.tactics || '',
      scene_stakes: currentMood.scene_stakes || '',
    } : {
      dominant_emotion: 'anxious',
      feels: '',
      shows: '',
      tension_with: null,
      agenda: '',
      subtext: '',
      secret: '',
      status_dynamic: '',
      tactics: '',
      scene_stakes: '',
    });
  };

  const handleSaveChapterMood = async (chapterId: number) => {
    if (!moodsData) return;
    setSavingScene(chapterId);
    
    const chapters = moodsData.chapter_moods || moodsData.chapters || [];
    const hasChapter = chapters.some(c => c.chapter_id === chapterId);
    
    let updatedChapters = [...chapters];
    if (hasChapter) {
      updatedChapters = chapters.map(c =>
        c.chapter_id === chapterId
          ? { ...c, moods: { ...c.moods, [charName]: { ...(c.moods[charName] ?? {}), ...draftMood } as CharacterMood } }
          : c
      );
    } else {
      const chapterDetail = chaptersData?.chapters?.find(ch => ch.chapter_id === chapterId);
      const title = chapterDetail?.title ?? `Chapter ${chapterId}`;
      updatedChapters.push({
        chapter_id: chapterId,
        title,
        moods: {
          [charName]: {
            dominant_emotion: 'anxious',
            feels: '',
            shows: '',
            tension_with: null,
            ...draftMood
          } as CharacterMood
        }
      });
    }

    const updated: CharacterMoodsData = {
      ...moodsData,
      chapters: updatedChapters,
      chapter_moods: updatedChapters
    };
    
    const ok = await saveMoods(updated);
    setSavingScene(null);
    if (ok) {
      setSavedScene(chapterId);
      setTimeout(() => setSavedScene(null), 1800);
    }
  };

  const handleSaveSceneMood = async (sceneId: number) => {
    if (!moodsData) return;
    setSavingScene(sceneId);
    
    const scenes = moodsData.scenes || [];
    const hasScene = scenes.some(s => s.scene_id === sceneId);
    
    let updatedScenes = [...scenes];
    if (hasScene) {
      updatedScenes = scenes.map(s =>
        s.scene_id === sceneId
          ? { ...s, moods: { ...s.moods, [charName]: { ...(s.moods[charName] ?? {}), ...draftMood } as CharacterMood } }
          : s
      );
    } else {
      const sceneDetail = scenarioData?.scenes?.find(sc => sc.scene_id === sceneId);
      const title = sceneDetail?.title ?? `Scene ${sceneId}`;
      updatedScenes.push({
        scene_id: sceneId,
        title,
        moods: {
          [charName]: {
            dominant_emotion: 'anxious',
            feels: '',
            shows: '',
            tension_with: null,
            ...draftMood
          } as CharacterMood
        }
      });
    }

    const updated: CharacterMoodsData = {
      ...moodsData,
      scenes: updatedScenes
    };
    
    const ok = await saveMoods(updated);
    setSavingScene(null);
    if (ok) {
      setSavedScene(sceneId);
      setTimeout(() => setSavedScene(null), 1800);
    }
  };

  const handleSaveMood = async (id: number) => {
    if (moodLevel === 'chapter') {
      await handleSaveChapterMood(id);
    } else {
      await handleSaveSceneMood(id);
    }
  };



  // ── Empty state ─────────────────────────────────────────

  if (characters.length === 0) {
    return (
      <div className="chub-phase bg-background-panel">
        <div className="chub-state" style={{ flex: 1 }}>
          <div className="chub-state-icon">👤</div>
          <div className="chub-state-title">No characters found</div>
          <p className="chub-state-hint">
            Add character folders to <code>global_characters/</code>, or ensure
            <code>data/lore.json</code> contains a <code>cast</code> array.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="chub-phase bg-background-panel">
      <PhaseHeader
        title="Characters Hub"
        emoji="👤"
        badge="Steps 2 & 4"
        description="Two-pass workflow. Pass 1: Simulate character emotional arcs at chapter granularity. Pass 2 (after Scenario scene division): Refine mood arcs to scene-level and generate visual profiles."
        inputs={['data/lore.json', 'data/visual_style.json', 'data/characters/[Name]/personality_signature.json', 'data/scenario_chapters.json', 'data/scenario_scenes.json']}
        outputs={['data/character_moods.json', 'data/characters/[Name]/personality_signature.json']}
        accentColor="#6366f1"
        nextStep={{ label: 'After chapter moods → Scenario for scene division. After scene moods → Intro + Pacing.' }}
      />

      <div className="chub-body">
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
              <AvatarThumb charName={name} />
              <div className="chub-btn-text">
                <span className="chub-char-name">{name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Main panel ── */}
      <div className="chub-main">
        {/* Header: character name + view toggle + sub-tabs */}
        <div className="chub-main-header border-b border-border bg-background-panel">
          <span className="chub-char-title">{charName}</span>

          <div className="chub-header-controls">
            {/* Primary view toggle */}
            <div className="chub-view-toggle">
              <button
                className={`chub-view-btn ${viewMode === 'original' ? 'active' : ''}`}
                onClick={() => setViewMode('original')}
              >
                📷 Original
              </button>
              <button
                className={`chub-view-btn ${viewMode === 'virtual' ? 'active' : ''}`}
                onClick={() => setViewMode('virtual')}
              >
                ✨ Virtual
              </button>
            </div>

            {/* Sub-tabs (virtual mode only) */}
            {viewMode === 'virtual' && (
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
            )}

            {/* Highlight save indicator */}
            {viewMode === 'original' && (hlSaving || hlSaved) && (
              <span className="chub-save-toast">
                {hlSaving ? '💾 Saving…' : '✓ Highlights saved'}
              </span>
            )}
          </div>
        </div>

        {/* Content area */}
        <div className="chub-content">

          {/* ── ORIGINAL VIEW ── */}
          {viewMode === 'original' && (
            <OriginalView
              charName={charName}
              highlights={charHighlights}
              onHighlightsChange={handleHighlightsChange}
              generalMood={moodsData?.general_mood?.[charName] ?? ''}
              onGeneralMoodChange={handleSaveGeneralMood}
            />
          )}

          {/* ── VIRTUAL VIEW: Visuals ── */}
          {viewMode === 'virtual' && subTab === 'visuals' && (
            <>
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

              <div className="chub-section">
                <div className="chub-section-label">Character Turnarounds</div>
                <div className="chub-image-strip" id={`chub-turnarounds-${charName}`}>
                  {TURNAROUND_VIEWS.map(view => (
                    <div key={view} className="chub-image-thumb">
                      <CharacterImage
                        src={buildImageSrc(`global_characters/${charName}/examples/turnarounds/${view}.png`)}
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

          {/* ── VIRTUAL VIEW: Personality ── */}
          {viewMode === 'virtual' && subTab === 'personality' && (
            <>
              <div className="chub-section">
                <div className="chub-section-label">Personality Signature</div>
                {personalityData?.signatures?.[charName] ? (
                  <SignatureDetailsPanel
                    activeChar={charName}
                    activeSig={personalityData.signatures[charName]}
                    onSave={handleSavePersonalitySignature}
                  />
                ) : (
                  <div className="chub-md-panel" id={`chub-personality-${charName}`}>
                    <button
                      className="chub-md-flag-btn"
                      onClick={() => openQa(`personality_signature.json for ${charName}`, 'REWRITE_PERSONALITY')}
                      title="Flag for agent — request rewrite"
                    >
                      🚩 Flag
                    </button>
                    <em style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      No personality_signature.json found for {charName}.<br />
                      Run <code>06_personality_signature.md</code> pipeline to generate it.
                      <br /><br />
                      Expected path: <code>data/characters/{charName}/personality_signature.json</code>
                    </em>
                  </div>
                )}
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

          {/* ── VIRTUAL VIEW: Mood Arc ── */}
          {viewMode === 'virtual' && subTab === 'mood-arc' && (
            <>
              {/* Level selector tabs */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <button
                  className={`chub-subtab-btn ${moodLevel === 'chapter' ? 'active' : ''}`}
                  onClick={() => {
                    setMoodLevel('chapter');
                    setExpandedScene(null);
                    setDraftMood({});
                  }}
                >
                  📖 Phase 2: Chapter Moods
                </button>
                <button
                  className={`chub-subtab-btn ${moodLevel === 'scene' ? 'active' : ''}`}
                  onClick={() => {
                    setMoodLevel('scene');
                    setExpandedScene(null);
                    setDraftMood({});
                  }}
                >
                  🎬 Phase 3: Scene Moods
                </button>
              </div>

              {moodLevel === 'chapter' ? (
                // --- CHAPTER TIMELINE ---
                (!chaptersData || !chaptersData.chapters || chaptersData.chapters.length === 0) ? (
                  <div className="chub-state" style={{ flex: 1, minHeight: 250 }}>
                    <div className="chub-state-icon">📖</div>
                    <div className="chub-state-title">No chapters found</div>
                    <p className="chub-state-hint">
                      Chapters must be defined in <code>data/scenario_chapters.json</code> first.
                    </p>
                  </div>
                ) : (
                  (() => {
                    const filteredChapters = chaptersData.chapters.filter(c =>
                      c.characters && c.characters.includes(charName)
                    );
                    
                    if (filteredChapters.length === 0) {
                      return (
                        <div className="chub-state" style={{ flex: 1, minHeight: 200 }}>
                          <p className="chub-state-hint">
                            {charName} is not present in any chapter cast lists in <code>scenario_chapters.json</code>.
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="chub-mood-timeline" id={`chub-mood-arc-chapters-${charName}`}>
                        {filteredChapters.map(chapter => {
                          const allChapters = moodsData?.chapter_moods || moodsData?.chapters || [];
                          const moodEntry = allChapters.find(ch => ch.chapter_id === chapter.chapter_id);
                          const mood = moodEntry?.moods?.[charName];
                          const isExpanded = expandedScene === chapter.chapter_id;
                          const emoji = mood ? (EMOTION_EMOJI[mood.dominant_emotion] ?? '❓') : '❔';
                          const isMoodSet = !!(mood && mood.dominant_emotion && mood.feels && mood.shows);

                          return (
                            <div
                              key={chapter.chapter_id}
                              className={`chub-mood-card ${isExpanded ? 'expanded' : ''} ${mood?.dominant_emotion ? `mood-${mood.dominant_emotion}` : 'mood-none'}`}
                              id={`chub-mood-chapter-${chapter.chapter_id}`}
                            >
                              <div
                                className="chub-mood-card-header"
                                onClick={() => handleExpandScene(chapter.chapter_id, mood)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={e => e.key === 'Enter' && handleExpandScene(chapter.chapter_id, mood)}
                              >
                                <div className="chub-mood-card-left">
                                  <span className="chub-scene-num">Chapter {chapter.chapter_id}</span>
                                  <span className="chub-mood-emoji">{emoji}</span>
                                  <div className="chub-mood-card-info">
                                    <span className="chub-scene-title">{chapter.title}</span>
                                    <div className="chub-mood-meta-row">
                                      <span className="chub-mood-label">
                                        {mood ? mood.dominant_emotion : <em style={{ opacity: 0.6 }}>Not set</em>}
                                      </span>
                                      {chapter.characters && (
                                        <span className="chub-meta-pill">👥 Cast: {chapter.characters.join(', ')}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                  {isMoodSet ? (
                                    <span className="chub-status-badge complete">✓ Mood Set</span>
                                  ) : (
                                    <span className="chub-status-badge empty">⚠ Empty</span>
                                  )}
                                  <span className="chub-mood-expand-icon">▾</span>
                                </div>
                              </div>

                              {isExpanded && (
                                <div className="chub-mood-edit-form">
                                  <div className="chub-mood-form-grid">
                                    {/* Left Column: Chapter Context Card & Emotion Selection */}
                                    <div className="chub-mood-form-left">
                                      {/* Read-only Context Panel */}
                                      <div className="chub-scene-context-card">
                                        <div className="chub-context-header">📖 Chapter Context Details</div>
                                        <div className="chub-context-body">
                                          {chapter.summary && (
                                            <div className="chub-context-section">
                                              <span className="chub-context-label">Chapter Summary</span>
                                              <p className="chub-context-text">{chapter.summary}</p>
                                            </div>
                                          )}
                                          {chapter.story_progression && (
                                            <div className="chub-context-section">
                                              <span className="chub-context-label">Story Progression</span>
                                              <p className="chub-context-text">{chapter.story_progression}</p>
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {/* Clickable Dominant Emotion Selector */}
                                      <div className="chub-field">
                                        <label className="chub-field-label">Dominant Emotion</label>
                                        <div className="chub-emotion-grid-selector">
                                          {EMOTIONS.map(emotion => {
                                            const isSelected = draftMood.dominant_emotion === emotion;
                                            return (
                                              <button
                                                key={emotion}
                                                type="button"
                                                className={`chub-emotion-selector-btn ${isSelected ? 'active' : ''}`}
                                                onClick={() => setDraftMood(d => ({ ...d, dominant_emotion: emotion }))}
                                                title={`Select ${emotion}`}
                                              >
                                                <span className="chub-selector-emoji">{EMOTION_EMOJI[emotion] ?? '🎭'}</span>
                                                <span className="chub-selector-text">{emotion}</span>
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>

                                      {/* Tension with */}
                                      <div className="chub-field">
                                        <label className="chub-field-label">Tension with</label>
                                        <select
                                          className="chub-tension-select"
                                          value={draftMood.tension_with ?? ''}
                                          onChange={e => setDraftMood(d => ({ ...d, tension_with: e.target.value || null }))}
                                          id={`chub-tension-select-ch-${chapter.chapter_id}`}
                                        >
                                          <option value="">— none —</option>
                                          {characters.filter(c => c !== charName).map(c => (
                                            <option key={c} value={c}>{c}</option>
                                          ))}
                                        </select>
                                      </div>
                                    </div>

                                    {/* Right Column: Character Psychological Fields */}
                                    <div className="chub-mood-form-right">
                                      <div className="chub-form-section-title">🧠 Internal vs. External Psychology</div>

                                      <div className="chub-field">
                                        <label className="chub-field-label">Feels (internal — private truth)</label>
                                        <textarea
                                          className="chub-mood-textarea"
                                          value={draftMood.feels ?? ''}
                                          onChange={e => setDraftMood(d => ({ ...d, feels: e.target.value }))}
                                          rows={2}
                                          placeholder="What is this character privately experiencing?"
                                          id={`chub-feels-ch-${chapter.chapter_id}`}
                                        />
                                      </div>

                                      <div className="chub-field">
                                        <label className="chub-field-label">Shows (external — the mask)</label>
                                        <textarea
                                          className="chub-mood-textarea"
                                          value={draftMood.shows ?? ''}
                                          onChange={e => setDraftMood(d => ({ ...d, shows: e.target.value }))}
                                          rows={2}
                                          placeholder="How does their behaviour/speech express this outward?"
                                          id={`chub-shows-ch-${chapter.chapter_id}`}
                                        />
                                      </div>

                                      <div className="chub-field">
                                        <label className="chub-field-label">Secret (what they are actively hiding)</label>
                                        <textarea
                                          className="chub-mood-textarea"
                                          value={draftMood.secret ?? ''}
                                          onChange={e => setDraftMood(d => ({ ...d, secret: e.target.value }))}
                                          rows={2}
                                          placeholder="Is there any secret they are holding or keeping back?"
                                          id={`chub-secret-ch-${chapter.chapter_id}`}
                                        />
                                      </div>

                                      <div className="chub-form-section-title" style={{ marginTop: 16 }}>🎭 Scene Dynamics & Stakes</div>

                                      <div className="chub-field">
                                        <label className="chub-field-label">Agenda (what they want & expect in this chapter)</label>
                                        <textarea
                                          className="chub-mood-textarea"
                                          value={draftMood.agenda ?? ''}
                                          onChange={e => setDraftMood(d => ({ ...d, agenda: e.target.value }))}
                                          rows={2}
                                          placeholder="What does this character want to achieve in this chapter?"
                                          id={`chub-agenda-ch-${chapter.chapter_id}`}
                                        />
                                      </div>

                                      <div className="chub-field">
                                        <label className="chub-field-label">Subtext (what is implied/hidden under their actions)</label>
                                        <textarea
                                          className="chub-mood-textarea"
                                          value={draftMood.subtext ?? ''}
                                          onChange={e => setDraftMood(d => ({ ...d, subtext: e.target.value }))}
                                          rows={2}
                                          placeholder="What are the unspoken undercurrents for them?"
                                          id={`chub-subtext-ch-${chapter.chapter_id}`}
                                        />
                                      </div>

                                      <div className="chub-mood-edit-form-row">
                                        <div className="chub-field">
                                          <label className="chub-field-label">Status Dynamic (power dynamics)</label>
                                          <input
                                            type="text"
                                            className="chub-emotion-select"
                                            value={draftMood.status_dynamic ?? ''}
                                            onChange={e => setDraftMood(d => ({ ...d, status_dynamic: e.target.value }))}
                                            placeholder="e.g. low status, seeking control, shifting high"
                                            id={`chub-status-ch-${chapter.chapter_id}`}
                                          />
                                        </div>

                                        <div className="chub-field">
                                          <label className="chub-field-label">Tactics (verbal/behavioral tactics)</label>
                                          <input
                                            type="text"
                                            className="chub-emotion-select"
                                            value={draftMood.tactics ?? ''}
                                            onChange={e => setDraftMood(d => ({ ...d, tactics: e.target.value }))}
                                            placeholder="e.g. deflection, flattery, guilt-tripping"
                                            id={`chub-tactics-ch-${chapter.chapter_id}`}
                                          />
                                        </div>
                                      </div>

                                      <div className="chub-field">
                                        <label className="chub-field-label">Stakes (what happens if they fail)</label>
                                        <textarea
                                          className="chub-mood-textarea"
                                          value={draftMood.scene_stakes ?? ''}
                                          onChange={e => setDraftMood(d => ({ ...d, scene_stakes: e.target.value }))}
                                          rows={2}
                                          placeholder="What are the stakes for this character?"
                                          id={`chub-stakes-ch-${chapter.chapter_id}`}
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
                                    <button
                                      className={`chub-mood-save-btn ${savedScene === chapter.chapter_id ? 'saved' : ''}`}
                                      onClick={() => handleSaveMood(chapter.chapter_id)}
                                      disabled={savingScene === chapter.chapter_id}
                                      id={`chub-save-mood-ch-${chapter.chapter_id}`}
                                    >
                                      {savingScene === chapter.chapter_id ? 'Saving…' : savedScene === chapter.chapter_id ? '✓ Saved' : 'Save changes'}
                                    </button>
                                    {savedScene === chapter.chapter_id && (
                                      <span className="chub-save-toast">✓ Saved to character_moods.json</span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()
                )
              ) : (
                // --- SCENE TIMELINE ---
                (!scenarioData || !scenarioData.scenes || scenarioData.scenes.length === 0) ? (
                  <div className="chub-state" style={{ flex: 1, minHeight: 250 }}>
                    <div className="chub-state-icon">🎬</div>
                    <div className="chub-state-title">No scenes found</div>
                    <p className="chub-state-hint">
                      Scenes must be defined in <code>data/scenario_scenes.json</code> first.
                    </p>
                  </div>
                ) : (
                  (() => {
                    const filteredScenes = scenarioData.scenes.filter(s =>
                      (s.characters_present && s.characters_present.includes(charName)) ||
                      (s.character_manifest && s.character_manifest.some(m => m.character_id === charName))
                    );
                    
                    if (filteredScenes.length === 0) {
                      return (
                        <div className="chub-state" style={{ flex: 1, minHeight: 200 }}>
                          <p className="chub-state-hint">
                            {charName} is not present in any scene casts in <code>scenario_scenes.json</code>.
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="chub-mood-timeline" id={`chub-mood-arc-scenes-${charName}`}>
                        {filteredScenes.map(scene => {
                          const moodEntry = moodsData?.scenes?.find(s => s.scene_id === scene.scene_id);
                          const mood = moodEntry?.moods?.[charName];
                          const isExpanded = expandedScene === scene.scene_id;
                          const emoji = mood ? (EMOTION_EMOJI[mood.dominant_emotion] ?? '❓') : '❔';
                          const isMoodSet = !!(mood && mood.dominant_emotion && mood.feels && mood.shows);

                          return (
                            <div
                              key={scene.scene_id}
                              className={`chub-mood-card ${isExpanded ? 'expanded' : ''} ${mood?.dominant_emotion ? `mood-${mood.dominant_emotion}` : 'mood-none'}`}
                              id={`chub-mood-scene-${scene.scene_id}`}
                            >
                              <div
                                className="chub-mood-card-header"
                                onClick={() => handleExpandScene(scene.scene_id, mood)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={e => e.key === 'Enter' && handleExpandScene(scene.scene_id, mood)}
                              >
                                <div className="chub-mood-card-left">
                                  <span className="chub-scene-num">Scene {scene.scene_id}</span>
                                  <span className="chub-mood-emoji">{emoji}</span>
                                  <div className="chub-mood-card-info">
                                    <span className="chub-scene-title">{scene.title}</span>
                                    <div className="chub-mood-meta-row">
                                      <span className="chub-mood-label">
                                        {mood ? mood.dominant_emotion : <em style={{ opacity: 0.6 }}>Not set</em>}
                                      </span>
                                      {scene.location_master?.name && (
                                        <span className="chub-meta-pill">📍 {scene.location_master.name}</span>
                                      )}
                                      {scene.scene_world_state?.time_of_day && (
                                        <span className="chub-meta-pill">🕒 {scene.scene_world_state.time_of_day}</span>
                                      )}
                                      {scene.emotional_beat && (
                                        <span className="chub-meta-pill beat">⚡ {scene.emotional_beat}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                  {isMoodSet ? (
                                    <span className="chub-status-badge complete">✓ Mood Set</span>
                                  ) : (
                                    <span className="chub-status-badge empty">⚠ Empty</span>
                                  )}
                                  <span className="chub-mood-expand-icon">▾</span>
                                </div>
                              </div>

                              {isExpanded && (
                                <div className="chub-mood-edit-form">
                                  <div className="chub-mood-form-grid">
                                    {/* Left Column: Context Card & Emotion Selection */}
                                    <div className="chub-mood-form-left">
                                      {/* Read-only Context Panel */}
                                      <div className="chub-scene-context-card">
                                        <div className="chub-context-header">🎬 Scene Context Details</div>
                                        <div className="chub-context-body">
                                          {scene.summary && (
                                            <div className="chub-context-section">
                                              <span className="chub-context-label">Summary / Narrative</span>
                                              <p className="chub-context-text">{scene.summary}</p>
                                            </div>
                                          )}
                                          {scene.core_action && (
                                            <div className="chub-context-section">
                                              <span className="chub-context-label">Key Action Beat</span>
                                              <p className="chub-context-text">{scene.core_action}</p>
                                            </div>
                                          )}
                                          {scene.camera_shot && (
                                            <div className="chub-context-section">
                                              <span className="chub-context-label">Cinematic Framing</span>
                                              <p className="chub-context-text">{scene.camera_shot}</p>
                                            </div>
                                          )}
                                          {scene.scene_world_state?.environmental_lighting && (
                                            <div className="chub-context-section">
                                              <span className="chub-context-label">Lighting & Mood Modifiers</span>
                                              <p className="chub-context-text">{scene.scene_world_state.environmental_lighting}</p>
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {/* Clickable Dominant Emotion Selector */}
                                      <div className="chub-field">
                                        <label className="chub-field-label">Dominant Emotion</label>
                                        <div className="chub-emotion-grid-selector">
                                          {EMOTIONS.map(emotion => {
                                            const isSelected = draftMood.dominant_emotion === emotion;
                                            return (
                                              <button
                                                key={emotion}
                                                type="button"
                                                className={`chub-emotion-selector-btn ${isSelected ? 'active' : ''}`}
                                                onClick={() => setDraftMood(d => ({ ...d, dominant_emotion: emotion }))}
                                                title={`Select ${emotion}`}
                                              >
                                                <span className="chub-selector-emoji">{EMOTION_EMOJI[emotion] ?? '🎭'}</span>
                                                <span className="chub-selector-text">{emotion}</span>
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>

                                      {/* Tension with */}
                                      <div className="chub-field">
                                        <label className="chub-field-label">Tension with</label>
                                        <select
                                          className="chub-tension-select"
                                          value={draftMood.tension_with ?? ''}
                                          onChange={e => setDraftMood(d => ({ ...d, tension_with: e.target.value || null }))}
                                          id={`chub-tension-select-sc-${scene.scene_id}`}
                                        >
                                          <option value="">— none —</option>
                                          {characters.filter(c => c !== charName).map(c => (
                                            <option key={c} value={c}>{c}</option>
                                          ))}
                                        </select>
                                      </div>
                                    </div>

                                    {/* Right Column: Character Psychological Fields */}
                                    <div className="chub-mood-form-right">
                                      <div className="chub-form-section-title">🧠 Internal vs. External Psychology</div>

                                      <div className="chub-field">
                                        <label className="chub-field-label">Feels (internal — private truth)</label>
                                        <textarea
                                          className="chub-mood-textarea"
                                          value={draftMood.feels ?? ''}
                                          onChange={e => setDraftMood(d => ({ ...d, feels: e.target.value }))}
                                          rows={2}
                                          placeholder="What is this character privately experiencing?"
                                          id={`chub-feels-sc-${scene.scene_id}`}
                                        />
                                      </div>

                                      <div className="chub-field">
                                        <label className="chub-field-label">Shows (external — the mask)</label>
                                        <textarea
                                          className="chub-mood-textarea"
                                          value={draftMood.shows ?? ''}
                                          onChange={e => setDraftMood(d => ({ ...d, shows: e.target.value }))}
                                          rows={2}
                                          placeholder="How does their behavior/speech express this outward?"
                                          id={`chub-shows-sc-${scene.scene_id}`}
                                        />
                                      </div>

                                      <div className="chub-field">
                                        <label className="chub-field-label">Secret (what they are actively hiding)</label>
                                        <textarea
                                          className="chub-mood-textarea"
                                          value={draftMood.secret ?? ''}
                                          onChange={e => setDraftMood(d => ({ ...d, secret: e.target.value }))}
                                          rows={2}
                                          placeholder="Is there any secret they are holding or keeping back?"
                                          id={`chub-secret-sc-${scene.scene_id}`}
                                        />
                                      </div>

                                      <div className="chub-form-section-title" style={{ marginTop: 16 }}>🎭 Scene Dynamics & Stakes</div>

                                      <div className="chub-field">
                                        <label className="chub-field-label">Agenda (what they want & expect in this scene)</label>
                                        <textarea
                                          className="chub-mood-textarea"
                                          value={draftMood.agenda ?? ''}
                                          onChange={e => setDraftMood(d => ({ ...d, agenda: e.target.value }))}
                                          rows={2}
                                          placeholder="What does this character want to achieve in this scene?"
                                          id={`chub-agenda-sc-${scene.scene_id}`}
                                        />
                                      </div>

                                      <div className="chub-field">
                                        <label className="chub-field-label">Subtext (what is implied/hidden under their actions)</label>
                                        <textarea
                                          className="chub-mood-textarea"
                                          value={draftMood.subtext ?? ''}
                                          onChange={e => setDraftMood(d => ({ ...d, subtext: e.target.value }))}
                                          rows={2}
                                          placeholder="What are the unspoken undercurrents for them?"
                                          id={`chub-subtext-sc-${scene.scene_id}`}
                                        />
                                      </div>

                                      <div className="chub-mood-edit-form-row">
                                        <div className="chub-field">
                                          <label className="chub-field-label">Status Dynamic (power dynamics)</label>
                                          <input
                                            type="text"
                                            className="chub-emotion-select"
                                            value={draftMood.status_dynamic ?? ''}
                                            onChange={e => setDraftMood(d => ({ ...d, status_dynamic: e.target.value }))}
                                            placeholder="e.g. low status, seeking control, shifting high"
                                            id={`chub-status-sc-${scene.scene_id}`}
                                          />
                                        </div>

                                        <div className="chub-field">
                                          <label className="chub-field-label">Tactics (verbal/behavioral tactics)</label>
                                          <input
                                            type="text"
                                            className="chub-emotion-select"
                                            value={draftMood.tactics ?? ''}
                                            onChange={e => setDraftMood(d => ({ ...d, tactics: e.target.value }))}
                                            placeholder="e.g. deflection, flattery, guilt-tripping"
                                            id={`chub-tactics-sc-${scene.scene_id}`}
                                          />
                                        </div>
                                      </div>

                                      <div className="chub-field">
                                        <label className="chub-field-label">Stakes (what happens if they fail)</label>
                                        <textarea
                                          className="chub-mood-textarea"
                                          value={draftMood.scene_stakes ?? ''}
                                          onChange={e => setDraftMood(d => ({ ...d, scene_stakes: e.target.value }))}
                                          rows={2}
                                          placeholder="What are the stakes for this character?"
                                          id={`chub-stakes-sc-${scene.scene_id}`}
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
                                    <button
                                      className={`chub-mood-save-btn ${savedScene === scene.scene_id ? 'saved' : ''}`}
                                      onClick={() => handleSaveMood(scene.scene_id)}
                                      disabled={savingScene === scene.scene_id}
                                      id={`chub-save-mood-sc-${scene.scene_id}`}
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
                    );
                  })()
                )
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
    </div>
  );
};

export default CharacterHubPhase;
