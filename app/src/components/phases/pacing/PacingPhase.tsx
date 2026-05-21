import React, { useState } from 'react';
import { PhaseHeader } from '../../shared/PhaseHeader';
import { useJsonFile } from '@/hooks/useJsonFile';
import { exportQaReport } from '@/utils/qaExport';
import PacingQADrawer from './PacingQADrawer';
import '../../../styles/pacing.css';
import type { PagesData, ScenarioScenesData, ScenarioChaptersData, PacingPageData } from '@/types/data';

const PAGES_PATH = 'data/pages.json';
const SCENES_PATH = 'data/scenario_scenes.json';
const CHAPTERS_PATH = 'data/scenario_chapters.json';

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  cover:          { label: 'COVER',          color: '#f59e0b', icon: '⭐' },
  character_intro:{ label: 'CHAR INTRO',     color: '#8b5cf6', icon: '🎭' },
  story:          { label: 'STORY',          color: '#06b6d4', icon: '📄' },
  chapter_break:  { label: 'CHAPTER BREAK',  color: '#ec4899', icon: '💥' },
  splash:         { label: 'SPLASH',         color: '#f97316', icon: '🌊' },
};

function getTypeConfig(type: string) {
  return TYPE_CONFIG[type] ?? { label: type.toUpperCase(), color: '#64748b', icon: '📄' };
}

const PacingPhase: React.FC = () => {
  const { data: pagesData, loading: pagesLoading, error: pagesError, save: savePages } = useJsonFile<PagesData>(PAGES_PATH);
  const { data: scenesData, loading: scenesLoading, error: scenesError } = useJsonFile<ScenarioScenesData>(SCENES_PATH);
  const { data: chaptersData, loading: chaptersLoading, error: chaptersError } = useJsonFile<ScenarioChaptersData>(CHAPTERS_PATH);

  const [activeChapterId, setActiveChapterId] = useState<number | null>(null);
  const [activePageNum, setActivePageNum] = useState<number | null>(null);
  const [qaTarget, setQaTarget] = useState<{ pageNumber: number; currentFocus: string; currentType: string } | null>(null);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Interactive editing states
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<PacingPageData | null>(null);

  const handleStartEdit = (page: PacingPageData) => {
    setEditForm({
      ...page,
      general_mood: {
        emotional_tone: page.general_mood?.emotional_tone || '',
        visual_color_palette: page.general_mood?.visual_color_palette || '',
        tempo_and_pacing: page.general_mood?.tempo_and_pacing || '',
      },
      panel_organization: {
        panel_count_target: page.panel_organization?.panel_count_target ?? 3,
        layout_proposal: page.panel_organization?.layout_proposal || '',
        composition_notes: page.panel_organization?.composition_notes || '',
        read_flow_intent: page.panel_organization?.read_flow_intent || '',
      },
      setting_and_location: {
        location_name: page.setting_and_location?.location_name || '',
        time_of_day: page.setting_and_location?.time_of_day || '',
        environmental_lighting: page.setting_and_location?.environmental_lighting || '',
        locations: page.setting_and_location?.locations?.map(loc => ({
          location_name: loc.location_name || '',
          time_of_day: loc.time_of_day || '',
          environmental_lighting: loc.environmental_lighting || '',
        })) || [],
      },
      anecdotes_included: [...(page.anecdotes_included || [])],
      visual_page_turn_hook: page.visual_page_turn_hook || '',
      characters_present: [...(page.characters_present || [])],
    });
    setIsEditing(true);
  };

  const handleSavePage = async () => {
    if (!editForm || !pagesData || !savePages) return;

    const updatedPages = pagesData.pages.map(p => {
      if (p.page_number === editForm.page_number) {
        return editForm;
      }
      return p;
    });

    const updatedPagesData = {
      ...pagesData,
      pages: updatedPages
    };

    const success = await savePages(updatedPagesData);
    if (success) {
      setIsEditing(false);
      setEditForm(null);
    }
  };

  const loading = pagesLoading || scenesLoading || chaptersLoading;
  const error = pagesError || scenesError || chaptersError;

  if (loading) return <div className="pacing-state">Loading pages and chapter details…</div>;
  if (error) return (
    <div className="pacing-state error">
      <div style={{ fontSize: '2rem' }}>⚠️</div>
      <p>Could not load pacing details.</p>
      <p className="pacing-state-sub">{error}</p>
    </div>
  );
  if (!pagesData || !scenesData || !chaptersData) return null;

  const handleExportQa = async (reportContent: string) => {
    const result = await exportQaReport({
      phase: '1',
      phaseFolder: 'pacing',
      content: reportContent,
    });
    setExportStatus(result.success ? 'success' : 'error');
    setTimeout(() => setExportStatus('idle'), 3000);
  };

  // Build a map of scene_id -> chapter_id
  const sceneToChapterMap = new Map<number, number>();
  scenesData.scenes.forEach(scene => {
    if (scene.scene_id !== undefined && scene.chapter_id !== undefined) {
      sceneToChapterMap.set(scene.scene_id, scene.chapter_id);
    }
  });

  // Helper to fetch details of a scene by its ID
  const getSceneDetail = (sceneId: number) => {
    return scenesData.scenes.find(s => s.scene_id === sceneId);
  };

  // Group pages by chapter_id
  const pagesByChapter: Record<number, PacingPageData[]> = {};
  pagesData.pages.forEach(page => {
    let chapterId = 0; // Default: unassigned/intro/cover
    
    if (page.scenes_associated && page.scenes_associated.length > 0) {
      const firstSceneId = page.scenes_associated[0].scene_id;
      const mappedChapterId = sceneToChapterMap.get(firstSceneId);
      if (mappedChapterId !== undefined) {
        chapterId = mappedChapterId;
      }
    } else if (page.scene_id !== null && page.scene_id !== undefined) {
      const mappedChapterId = sceneToChapterMap.get(page.scene_id);
      if (mappedChapterId !== undefined) {
        chapterId = mappedChapterId;
      }
    }
    
    if (!pagesByChapter[chapterId]) {
      pagesByChapter[chapterId] = [];
    }
    pagesByChapter[chapterId].push(page);
  });

  // Build the list of chapters to render
  const allChaptersToRender = [];
  if (pagesByChapter[0] && pagesByChapter[0].length > 0) {
    allChaptersToRender.push({
      chapter_id: 0,
      title: 'Intro, Cover & Splash Pages',
      summary: 'Establishing cover pages, splash screens, or general character intros before the narrative starts.',
      characters: []
    });
  }
  allChaptersToRender.push(...chaptersData.chapters);

  const currentChapterId = activeChapterId !== null ? activeChapterId : (allChaptersToRender[0]?.chapter_id ?? 0);
  const activeChapterPages = pagesByChapter[currentChapterId] || [];
  const currentActivePage = activePageNum !== null && activeChapterPages.some(p => p.page_number === activePageNum)
    ? activePageNum
    : (activeChapterPages.length > 0 ? activeChapterPages[0].page_number : null);

  return (
    <div className="pacing-phase bg-background-panel">
      <PhaseHeader
        title="Pacing & Pagination"
        emoji="📋"
        badge="Phase 1.5"
        description="Maps the sequential scenes list onto physical comic pages, specifying focus points and narrative flow for pagination."
        inputs={['data/scenario_scenes.json']}
        outputs={['data/pages.json']}
        accentColor="#06b6d4"
        nextStep={{ label: 'Panel Structuring' }}
        defaultCollapsed={true}
      />

      {/* Page list + QA drawer */}
      <div className="pacing-body">
        <div className="pacing-content-layout">
          {/* Horizontal Chapters Row */}
          <div className="pacing-chapters-row">
            <div className="pacing-chapters-stats">
              <div className="pacing-chapters-stat">
                <span className="pacing-chapters-stat-num">{pagesData.total_pages}</span>
                <span className="pacing-chapters-stat-label">Total</span>
              </div>
              <div className="pacing-chapters-stat-divider" />
              <div className="pacing-chapters-stat">
                <span className="pacing-chapters-stat-num">{pagesData.pages.filter(p => p.type === 'character_intro').length}</span>
                <span className="pacing-chapters-stat-label">Intro</span>
              </div>
            </div>

            {allChaptersToRender.map(chapter => {
              const chPages = pagesByChapter[chapter.chapter_id] || [];
              const isSelected = chapter.chapter_id === currentChapterId;
              
              return (
                <div
                  key={chapter.chapter_id}
                  className={`pacing-chapter-card-horizontal ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    setActiveChapterId(chapter.chapter_id);
                    // Auto-select first page of the newly selected chapter
                    const nextPages = pagesByChapter[chapter.chapter_id] || [];
                    if (nextPages.length > 0) {
                      setActivePageNum(nextPages[0].page_number);
                    } else {
                      setActivePageNum(null);
                    }
                    setIsEditing(false);
                    setEditForm(null);
                  }}
                >
                  <div className="pacing-chapter-card-badge">
                    {chapter.chapter_id === 0 ? 'INTRO' : `CH ${chapter.chapter_id}`}
                  </div>
                  <h3 className="pacing-chapter-card-title">{chapter.title}</h3>
                  <div className="pacing-chapter-card-subtitle">
                    {chPages.length} {chPages.length === 1 ? 'page' : 'pages'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chapter Details Panel below */}
          {(() => {
            const activeChapterObj = allChaptersToRender.find(c => c.chapter_id === currentChapterId);
            if (!activeChapterObj) return null;
            
            return (
              <div className="pacing-chapter-details-panel">
                <div className="pacing-chapter-meta-section">
                  <div className="pacing-chapter-meta-info">
                    <span className="pacing-chapter-meta-badge">
                      {activeChapterObj.chapter_id === 0 ? 'INTRO' : `CHAPTER ${activeChapterObj.chapter_id}`}
                    </span>
                    <h2 className="pacing-chapter-meta-title">{activeChapterObj.title}</h2>
                  </div>
                  <p className="pacing-chapter-meta-summary" title={activeChapterObj.summary}>{activeChapterObj.summary}</p>
                </div>

                {activeChapterPages.length === 0 ? (
                  <div className="pacing-no-pages">No pages in this chapter</div>
                ) : (
                  <div className="pacing-workspace-split">
                    {/* Left Sidebar: Pages List */}
                    <div className="pacing-chapter-pages-sidebar">
                      <div className="pacing-sidebar-header">Pages in Chapter</div>
                      <div className="pacing-sidebar-list">
                        {activeChapterPages.map(page => {
                          const tc = getTypeConfig(page.type);
                          const isPageSelected = currentActivePage === page.page_number;
                          return (
                            <div
                              key={page.page_number}
                              className={`pacing-sidebar-item ${isPageSelected ? 'selected' : ''}`}
                              style={{ borderLeftColor: tc.color }}
                              onClick={() => {
                                setActivePageNum(page.page_number);
                                setIsEditing(false);
                                setEditForm(null);
                              }}
                            >
                              <div className="pacing-sidebar-item-header">
                                <span className="pacing-sidebar-page-num">Page {page.page_number}</span>
                                <span className="pacing-sidebar-type-badge" style={{ color: tc.color, background: `${tc.color}15` }}>
                                  {tc.label}
                                </span>
                              </div>
                              <div className="pacing-sidebar-item-focus">{page.focus}</div>
                              <div className="pacing-sidebar-item-scenes">
                                {page.scenes_associated && page.scenes_associated.length > 0 ? (
                                  page.scenes_associated.map(s => (
                                    <span key={s.scene_id} className="pacing-sidebar-scene-badge">S{s.scene_id}</span>
                                  ))
                                ) : page.scene_id !== null && page.scene_id !== undefined ? (
                                  <span className="pacing-sidebar-scene-badge">S{page.scene_id}</span>
                                ) : null}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right Workspace: Selected Page Details */}
                    {(() => {
                      const activePageObj = activeChapterPages.find(p => p.page_number === currentActivePage);
                      if (!activePageObj) {
                        return (
                          <div className="pacing-workspace-empty">
                            Select a page from the sidebar to view detailed specifications.
                          </div>
                        );
                      }
                      
                      const displayPageObj = isEditing && editForm ? editForm : activePageObj;
                      const tc = getTypeConfig(displayPageObj.type);
                      return (
                        <div className="pacing-page-workspace" style={{ borderLeftColor: tc.color }}>
                          <div className="pacing-workspace-header">
                            <div className="pacing-workspace-header-left">
                              <span className="pacing-page-num-large">Page {displayPageObj.page_number} Specifications</span>
                              <span className="pacing-type-badge" style={{ background: `${tc.color}22`, color: tc.color, borderColor: `${tc.color}55` }}>
                                {tc.icon} {tc.label}
                              </span>
                              {displayPageObj.character && (
                                <span className="pacing-char-badge">{displayPageObj.character}</span>
                              )}
                            </div>
                            <div className="pacing-workspace-header-right">
                              {isEditing && editForm ? (
                                <div className="pacing-edit-controls">
                                  <button
                                    className="pacing-edit-btn-save"
                                    onClick={handleSavePage}
                                  >
                                    💾 Save Changes
                                  </button>
                                  <button
                                    className="pacing-edit-btn-cancel"
                                    onClick={() => {
                                      setIsEditing(false);
                                      setEditForm(null);
                                    }}
                                  >
                                    ✕ Cancel
                                  </button>
                                </div>
                              ) : (
                                <div className="pacing-edit-controls">
                                  <button
                                    className="pacing-edit-btn-edit"
                                    onClick={() => handleStartEdit(activePageObj)}
                                  >
                                    ✏️ Edit Details
                                  </button>
                                  <button
                                    className="pacing-flag-btn"
                                    onClick={() => setQaTarget({
                                      pageNumber: activePageObj.page_number,
                                      currentFocus: activePageObj.focus,
                                      currentType: activePageObj.type
                                    })}
                                  >
                                    🚩 Flag QA
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="pacing-workspace-scrollable">
                            {isEditing && editForm ? (
                              <div className="pacing-edit-form">
                                {/* Page category & Hook */}
                                <div className="pacing-workspace-meta-section">
                                  <div className="pacing-edit-field-group">
                                    <label className="pacing-edit-field-label">Page Category</label>
                                    <select
                                      className="pacing-edit-select"
                                      value={editForm.type}
                                      onChange={e => setEditForm({ ...editForm, type: e.target.value })}
                                    >
                                      <option value="cover">⭐ COVER</option>
                                      <option value="character_intro">🎭 CHAR INTRO</option>
                                      <option value="story">📄 STORY</option>
                                      <option value="chapter_break">💥 CHAPTER BREAK</option>
                                      <option value="splash">🌊 SPLASH</option>
                                    </select>
                                  </div>

                                  <div className="pacing-edit-field-group">
                                    <label className="pacing-edit-field-label">Page Turn Hook</label>
                                    <input
                                      type="text"
                                      className="pacing-edit-input"
                                      value={editForm.visual_page_turn_hook || ''}
                                      onChange={e => setEditForm({ ...editForm, visual_page_turn_hook: e.target.value })}
                                      placeholder="e.g. Next page reveals..."
                                    />
                                  </div>
                                </div>

                                <div className="pacing-focus-section">
                                  <label className="pacing-edit-field-label" style={{ display: 'block', marginBottom: '6px' }}>Narrative Focus & Actions</label>
                                  <textarea
                                    className="pacing-edit-textarea"
                                    value={editForm.focus}
                                    onChange={e => setEditForm({
                                      ...editForm,
                                      focus: e.target.value,
                                      page_narrative_focus: e.target.value
                                    })}
                                    placeholder="Describe the narrative focus and key actions of the page..."
                                  />
                                </div>

                                {/* Included Anecdotes */}
                                <div className="pacing-workspace-meta-section" style={{ marginTop: '16px' }}>
                                  <div className="pacing-edit-field-group">
                                    <label className="pacing-edit-field-label">📌 Included Anecdotes</label>
                                    <div className="pacing-edit-list-container">
                                      {editForm.anecdotes_included.map((anecdote, idx) => (
                                        <div key={idx} className="pacing-edit-list-row">
                                          <input
                                            type="text"
                                            className="pacing-edit-input"
                                            value={anecdote}
                                            onChange={e => {
                                              const updated = [...editForm.anecdotes_included];
                                              updated[idx] = e.target.value;
                                              setEditForm({ ...editForm, anecdotes_included: updated });
                                            }}
                                            placeholder={`Anecdote ${idx + 1}`}
                                          />
                                          <button
                                            type="button"
                                            className="pacing-edit-delete-btn"
                                            onClick={() => {
                                              const updated = editForm.anecdotes_included.filter((_, i) => i !== idx);
                                              setEditForm({ ...editForm, anecdotes_included: updated });
                                            }}
                                            title="Delete Anecdote"
                                          >
                                            🗑️
                                          </button>
                                        </div>
                                      ))}
                                      <button
                                        type="button"
                                        className="pacing-edit-add-btn"
                                        onClick={() => {
                                          setEditForm({
                                            ...editForm,
                                            anecdotes_included: [...editForm.anecdotes_included, '']
                                          });
                                        }}
                                      >
                                        ➕ Add Anecdote
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                <div className="pacing-details-grid">
                                  {/* Setting & Location */}
                                  <div className="pacing-detail-section">
                                    <div className="pacing-detail-title">📍 Setting & Location</div>
                                    <div className="pacing-edit-field-group">
                                      <label className="pacing-edit-field-label">Master Location Name</label>
                                      <input
                                        type="text"
                                        className="pacing-edit-input"
                                        value={editForm.setting_and_location?.location_name || ''}
                                        onChange={e => setEditForm({
                                          ...editForm,
                                          setting_and_location: {
                                            ...editForm.setting_and_location!,
                                            location_name: e.target.value
                                          }
                                        })}
                                        placeholder="Location Name"
                                      />
                                    </div>
                                    <div className="pacing-edit-field-row-grid">
                                      <div className="pacing-edit-field-group">
                                        <label className="pacing-edit-field-label">Time of Day</label>
                                        <input
                                          type="text"
                                          className="pacing-edit-input"
                                          value={editForm.setting_and_location?.time_of_day || ''}
                                          onChange={e => setEditForm({
                                            ...editForm,
                                            setting_and_location: {
                                              ...editForm.setting_and_location!,
                                              time_of_day: e.target.value
                                            }
                                          })}
                                          placeholder="e.g. Daytime"
                                        />
                                      </div>
                                      <div className="pacing-edit-field-group">
                                        <label className="pacing-edit-field-label">Lighting</label>
                                        <input
                                          type="text"
                                          className="pacing-edit-input"
                                          value={editForm.setting_and_location?.environmental_lighting || ''}
                                          onChange={e => setEditForm({
                                            ...editForm,
                                            setting_and_location: {
                                              ...editForm.setting_and_location!,
                                              environmental_lighting: e.target.value
                                            }
                                          })}
                                          placeholder="e.g. Dim light"
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Panel Organization */}
                                  <div className="pacing-detail-section">
                                    <div className="pacing-detail-title">📐 Panel Organization</div>
                                    <div className="pacing-edit-field-row-grid">
                                      <div className="pacing-edit-field-group">
                                        <label className="pacing-edit-field-label">Panel Count Target</label>
                                        <input
                                          type="number"
                                          className="pacing-edit-input"
                                          value={editForm.panel_organization?.panel_count_target ?? 3}
                                          onChange={e => setEditForm({
                                            ...editForm,
                                            panel_organization: {
                                              ...editForm.panel_organization!,
                                              panel_count_target: parseInt(e.target.value, 10) || 0
                                            }
                                          })}
                                        />
                                      </div>
                                      <div className="pacing-edit-field-group">
                                        <label className="pacing-edit-field-label">Layout Proposal</label>
                                        <input
                                          type="text"
                                          className="pacing-edit-input"
                                          value={editForm.panel_organization?.layout_proposal || ''}
                                          onChange={e => setEditForm({
                                            ...editForm,
                                            panel_organization: {
                                              ...editForm.panel_organization!,
                                              layout_proposal: e.target.value
                                            }
                                          })}
                                          placeholder="e.g. standard_grid"
                                        />
                                      </div>
                                    </div>
                                    <div className="pacing-edit-field-group">
                                      <label className="pacing-edit-field-label">Composition Notes</label>
                                      <textarea
                                        className="pacing-edit-textarea"
                                        value={editForm.panel_organization?.composition_notes || ''}
                                        onChange={e => setEditForm({
                                          ...editForm,
                                          panel_organization: {
                                            ...editForm.panel_organization!,
                                            composition_notes: e.target.value
                                          }
                                        })}
                                        placeholder="Composition Notes..."
                                      />
                                    </div>
                                    <div className="pacing-edit-field-group">
                                      <label className="pacing-edit-field-label">Read Flow Intent</label>
                                      <input
                                        type="text"
                                        className="pacing-edit-input"
                                        value={editForm.panel_organization?.read_flow_intent || ''}
                                        onChange={e => setEditForm({
                                          ...editForm,
                                          panel_organization: {
                                            ...editForm.panel_organization!,
                                            read_flow_intent: e.target.value
                                          }
                                        })}
                                        placeholder="e.g. Z-pattern layout"
                                      />
                                    </div>
                                  </div>

                                  {/* Mood & Style */}
                                  <div className="pacing-detail-section">
                                    <div className="pacing-detail-title">🎭 Mood & Style</div>
                                    <div className="pacing-edit-field-group">
                                      <label className="pacing-edit-field-label">Emotional Tone</label>
                                      <input
                                        type="text"
                                        className="pacing-edit-input"
                                        value={editForm.general_mood?.emotional_tone || ''}
                                        onChange={e => setEditForm({
                                          ...editForm,
                                          general_mood: {
                                            ...editForm.general_mood!,
                                            emotional_tone: e.target.value
                                          }
                                        })}
                                        placeholder="Emotional Tone"
                                      />
                                    </div>
                                    <div className="pacing-edit-field-group">
                                      <label className="pacing-edit-field-label">Visual Color Palette</label>
                                      <input
                                        type="text"
                                        className="pacing-edit-input"
                                        value={editForm.general_mood?.visual_color_palette || ''}
                                        onChange={e => setEditForm({
                                          ...editForm,
                                          general_mood: {
                                            ...editForm.general_mood!,
                                            visual_color_palette: e.target.value
                                          }
                                        })}
                                        placeholder="Visual Color Palette"
                                      />
                                    </div>
                                    <div className="pacing-edit-field-group">
                                      <label className="pacing-edit-field-label">Tempo and Pacing</label>
                                      <input
                                        type="text"
                                        className="pacing-edit-input"
                                        value={editForm.general_mood?.tempo_and_pacing || ''}
                                        onChange={e => setEditForm({
                                          ...editForm,
                                          general_mood: {
                                            ...editForm.general_mood!,
                                            tempo_and_pacing: e.target.value
                                          }
                                        })}
                                        placeholder="e.g. fast, comedic"
                                      />
                                    </div>
                                  </div>

                                  {/* Sub-locations Breakdown */}
                                  <div className="pacing-detail-section" style={{ gridColumn: 'span 3' }}>
                                    <div className="pacing-detail-title">📍 Sub-Locations Breakdown</div>
                                    <div className="pacing-edit-list-container">
                                      {editForm.setting_and_location?.locations?.map((loc, idx) => (
                                        <div key={idx} className="pacing-edit-subloc-card">
                                          <div className="pacing-edit-subloc-card-header">
                                            <span className="pacing-edit-subloc-card-title">Sub-Location {idx + 1}</span>
                                            <button
                                              type="button"
                                              className="pacing-edit-delete-btn"
                                              style={{ width: '28px', height: '28px', padding: '0' }}
                                              onClick={() => {
                                                const updatedLocs = editForm.setting_and_location?.locations?.filter((_, i) => i !== idx) || [];
                                                setEditForm({
                                                  ...editForm,
                                                  setting_and_location: {
                                                    ...editForm.setting_and_location!,
                                                    locations: updatedLocs
                                                  }
                                                });
                                              }}
                                              title="Remove Sub-Location"
                                            >
                                              🗑️
                                            </button>
                                          </div>
                                          <div className="pacing-edit-subloc-grid">
                                            <div className="pacing-edit-field-group">
                                              <label className="pacing-edit-field-label">Sub-Location Name</label>
                                              <input
                                                type="text"
                                                className="pacing-edit-input"
                                                value={loc.location_name || ''}
                                                onChange={e => {
                                                  const updatedLocs = [...(editForm.setting_and_location?.locations || [])];
                                                  updatedLocs[idx] = { ...updatedLocs[idx], location_name: e.target.value };
                                                  setEditForm({
                                                    ...editForm,
                                                    setting_and_location: {
                                                      ...editForm.setting_and_location!,
                                                      locations: updatedLocs
                                                    }
                                                  });
                                                }}
                                                placeholder="Name"
                                              />
                                            </div>
                                            <div className="pacing-edit-field-group">
                                              <label className="pacing-edit-field-label">Time of Day</label>
                                              <input
                                                type="text"
                                                className="pacing-edit-input"
                                                value={loc.time_of_day || ''}
                                                onChange={e => {
                                                  const updatedLocs = [...(editForm.setting_and_location?.locations || [])];
                                                  updatedLocs[idx] = { ...updatedLocs[idx], time_of_day: e.target.value };
                                                  setEditForm({
                                                    ...editForm,
                                                    setting_and_location: {
                                                      ...editForm.setting_and_location!,
                                                      locations: updatedLocs
                                                    }
                                                  });
                                                }}
                                                placeholder="Time"
                                              />
                                            </div>
                                            <div className="pacing-edit-field-group">
                                              <label className="pacing-edit-field-label">Lighting</label>
                                              <input
                                                type="text"
                                                className="pacing-edit-input"
                                                value={loc.environmental_lighting || ''}
                                                onChange={e => {
                                                  const updatedLocs = [...(editForm.setting_and_location?.locations || [])];
                                                  updatedLocs[idx] = { ...updatedLocs[idx], environmental_lighting: e.target.value };
                                                  setEditForm({
                                                    ...editForm,
                                                    setting_and_location: {
                                                      ...editForm.setting_and_location!,
                                                      locations: updatedLocs
                                                    }
                                                  });
                                                }}
                                                placeholder="Lighting"
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                      <button
                                        type="button"
                                        className="pacing-edit-add-btn"
                                        onClick={() => {
                                          const currentLocs = editForm.setting_and_location?.locations || [];
                                          setEditForm({
                                            ...editForm,
                                            setting_and_location: {
                                              ...editForm.setting_and_location!,
                                              locations: [...currentLocs, { location_name: '', time_of_day: '', environmental_lighting: '' }]
                                            }
                                          });
                                        }}
                                      >
                                        ➕ Add Sub-Location
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="pacing-focus-section">
                                  <h4 className="pacing-detail-label-large">Narrative Focus & Actions</h4>
                                  <p className="pacing-focus-text-large">{activePageObj.focus}</p>
                                </div>

                                {/* Anecdotes & Turn Hooks */}
                                {(activePageObj.anecdotes_included.length > 0 || activePageObj.visual_page_turn_hook) && (
                                  <div className="pacing-workspace-meta-section">
                                    {activePageObj.anecdotes_included.length > 0 && (
                                      <div className="pacing-detail-anecdotes-section">
                                        <div className="pacing-detail-title">📌 Included Anecdotes</div>
                                        <div className="pacing-anecdotes-row">
                                          {activePageObj.anecdotes_included.map(a => (
                                            <span key={a} className="pacing-anecdote-tag">📌 {a}</span>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {activePageObj.visual_page_turn_hook && (
                                      <div className="pacing-page-hook">
                                        <strong>Page Turn Hook:</strong> {activePageObj.visual_page_turn_hook}
                                      </div>
                                    )}
                                  </div>
                                )}

                                <div className="pacing-details-grid">
                                  {/* Setting & Location */}
                                  <div className="pacing-detail-section pacing-setting-section">
                                    <div className="pacing-detail-title">📍 Setting & Location</div>
                                    <div className="pacing-detail-loc-chars">
                                      <div className="pacing-loc-details">
                                        <span className="pacing-loc-name">
                                          {activePageObj.setting_and_location?.location_name || 'Not specified'}
                                        </span>
                                        <div className="pacing-loc-sub">
                                          {activePageObj.setting_and_location?.time_of_day && (
                                            <span>🌅 {activePageObj.setting_and_location.time_of_day}</span>
                                          )}
                                          {activePageObj.setting_and_location?.environmental_lighting && (
                                            <span>💡 {activePageObj.setting_and_location.environmental_lighting}</span>
                                          )}
                                        </div>
                                      </div>

                                      {/* Explicit or Resolved Multiple Locations Breakdown */}
                                      {(() => {
                                        // 1. Explicit locations from pages.json
                                        if (activePageObj.setting_and_location?.locations && activePageObj.setting_and_location.locations.length > 0) {
                                          return (
                                            <div className="pacing-scene-locations-breakdown">
                                              <div className="pacing-scene-loc-header">📍 Page Locations Breakdown</div>
                                              <div className="pacing-scene-locations-list">
                                                {activePageObj.setting_and_location.locations.map((loc, idx) => (
                                                  <div key={idx} className="pacing-scene-location-item">
                                                    <span className="pacing-scene-loc-badge">L{idx + 1}</span>
                                                    <div className="pacing-scene-loc-info">
                                                      <div className="pacing-scene-loc-name-row">
                                                        <span className="pacing-scene-loc-val">{loc.location_name}</span>
                                                      </div>
                                                      {(loc.time_of_day || loc.environmental_lighting) && (
                                                        <div className="pacing-scene-loc-sub">
                                                          {loc.time_of_day && <span>🌅 {loc.time_of_day}</span>}
                                                          {loc.environmental_lighting && <span>💡 {loc.environmental_lighting}</span>}
                                                        </div>
                                                      )}
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          );
                                        }

                                        // 2. Dynamic locations from associated scenes if > 1 scene
                                        if (activePageObj.scenes_associated && activePageObj.scenes_associated.length > 1) {
                                          return (
                                            <div className="pacing-scene-locations-breakdown">
                                              <div className="pacing-scene-loc-header">📍 Scene Locations Breakdown</div>
                                              <div className="pacing-scene-locations-list">
                                                {activePageObj.scenes_associated.map(sceneRef => {
                                                  const sceneInfo = getSceneDetail(sceneRef.scene_id);
                                                  const locName = sceneInfo?.location_master?.name || sceneInfo?.location || 'Not specified';
                                                  const tod = sceneInfo?.scene_world_state?.time_of_day;
                                                  const lighting = sceneInfo?.scene_world_state?.environmental_lighting;
                                                  return (
                                                    <div key={sceneRef.scene_id} className="pacing-scene-location-item">
                                                      <span className="pacing-scene-loc-badge">S{sceneRef.scene_id}</span>
                                                      <div className="pacing-scene-loc-info">
                                                        <div className="pacing-scene-loc-name-row">
                                                          <span className="pacing-scene-loc-title">{sceneRef.scene_title || `Scene ${sceneRef.scene_id}`}:</span>
                                                          <span className="pacing-scene-loc-val">{locName}</span>
                                                        </div>
                                                        {(tod || lighting) && (
                                                          <div className="pacing-scene-loc-sub">
                                                            {tod && <span>🌅 {tod}</span>}
                                                            {lighting && <span>💡 {lighting}</span>}
                                                          </div>
                                                        )}
                                                      </div>
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          );
                                        }

                                        return null;
                                      })()}
                                      {activePageObj.characters_present && activePageObj.characters_present.length > 0 && (
                                        <div>
                                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Characters Present</div>
                                          <div className="pacing-detail-chars">
                                            {activePageObj.characters_present.map(c => (
                                              <span key={c} className="pacing-char-present-badge">{c}</span>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Associated Scenes */}
                                  <div className="pacing-detail-section pacing-scenes-section">
                                    <div className="pacing-detail-title">🎬 Associated Scenes</div>
                                    <div className="pacing-detail-scenes">
                                      {activePageObj.scenes_associated && activePageObj.scenes_associated.length > 0 ? (
                                        activePageObj.scenes_associated.map(sceneRef => {
                                          const sceneInfo = getSceneDetail(sceneRef.scene_id);
                                          return (
                                            <div key={sceneRef.scene_id} className="pacing-detail-scene-card-rich">
                                              <div className="pacing-scene-card-header">
                                                <span className="pacing-scene-id">S{sceneRef.scene_id}</span>
                                                <span className="pacing-scene-title-large">{sceneInfo?.title || sceneRef.scene_title || `Scene ${sceneRef.scene_id}`}</span>
                                                {sceneRef.portion && (
                                                  <span className="pacing-scene-portion-badge">{sceneRef.portion}</span>
                                                )}
                                              </div>
                                              {sceneInfo && (
                                                <div className="pacing-scene-card-body">
                                                  <p className="pacing-scene-card-summary"><strong>Summary:</strong> {sceneInfo.summary}</p>
                                                  {sceneInfo.core_action && (
                                                    <p className="pacing-scene-card-action"><strong>Core Action:</strong> {sceneInfo.core_action}</p>
                                                  )}
                                                  {sceneInfo.location_master?.name && (
                                                    <div className="pacing-scene-card-meta">
                                                      <span>📍 {sceneInfo.location_master.name}</span>
                                                      {sceneInfo.emotional_beat && <span>🎭 Beat: {sceneInfo.emotional_beat}</span>}
                                                    </div>
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })
                                      ) : activePageObj.scene_id !== null && activePageObj.scene_id !== undefined ? (
                                        (() => {
                                          const sceneInfo = getSceneDetail(activePageObj.scene_id);
                                          return (
                                            <div className="pacing-detail-scene-card-rich">
                                              <div className="pacing-scene-card-header">
                                                <span className="pacing-scene-id">S{activePageObj.scene_id}</span>
                                                <span className="pacing-scene-title-large">{sceneInfo?.title || `Scene ${activePageObj.scene_id}`}</span>
                                              </div>
                                              {sceneInfo && (
                                                <div className="pacing-scene-card-body">
                                                  <p className="pacing-scene-card-summary"><strong>Summary:</strong> {sceneInfo.summary}</p>
                                                  {sceneInfo.core_action && (
                                                    <p className="pacing-scene-card-action"><strong>Core Action:</strong> {sceneInfo.core_action}</p>
                                                  )}
                                                  {sceneInfo.location_master?.name && (
                                                    <div className="pacing-scene-card-meta">
                                                      <span>📍 {sceneInfo.location_master.name}</span>
                                                      {sceneInfo.emotional_beat && <span>🎭 Beat: {sceneInfo.emotional_beat}</span>}
                                                    </div>
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })()
                                      ) : (
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                          No specific scene links (Intro/Cover page)
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Panel Organization */}
                                  <div className="pacing-detail-section pacing-panels-section">
                                    <div className="pacing-detail-title">📐 Panel Organization</div>
                                    <div className="pacing-detail-panels">
                                      <div className="pacing-panel-meta">
                                        <span className="pacing-panel-count">
                                          🔢 {activePageObj.panel_organization?.panel_count_target || 0} Panels Target
                                        </span>
                                        <span className="pacing-panel-layout">
                                          📐 {activePageObj.panel_organization?.layout_proposal || 'Default Layout'}
                                        </span>
                                      </div>
                                      {activePageObj.panel_organization?.composition_notes && (
                                        <p className="pacing-panel-notes">
                                          {activePageObj.panel_organization.composition_notes}
                                        </p>
                                      )}
                                      {activePageObj.panel_organization?.read_flow_intent && (
                                        <span className="pacing-panel-flow">
                                          ➡️ Flow: {activePageObj.panel_organization.read_flow_intent}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* General Mood */}
                                  <div className="pacing-detail-section pacing-mood-section">
                                    <div className="pacing-detail-title">🎭 Mood & Style</div>
                                    <div className="pacing-detail-mood-grid">
                                      {activePageObj.general_mood?.emotional_tone && (
                                        <div className="pacing-mood-field">
                                          <span className="pacing-detail-label">Tone:</span>
                                          <span className="pacing-detail-val">{activePageObj.general_mood.emotional_tone}</span>
                                        </div>
                                      )}
                                      {activePageObj.general_mood?.visual_color_palette && (
                                        <div className="pacing-mood-field">
                                          <span className="pacing-detail-label">Palette:</span>
                                          <span className="pacing-detail-val">{activePageObj.general_mood.visual_color_palette}</span>
                                        </div>
                                      )}
                                      {activePageObj.general_mood?.tempo_and_pacing && (
                                        <div className="pacing-mood-field">
                                          <span className="pacing-detail-label">Pacing:</span>
                                          <span className="pacing-detail-val">{activePageObj.general_mood.tempo_and_pacing}</span>
                                        </div>
                                      )}
                                      {!activePageObj.general_mood && (
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                          No specific mood markers defined.
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {qaTarget && (
          <PacingQADrawer
            target={qaTarget}
            onClose={() => setQaTarget(null)}
            onExport={handleExportQa}
          />
        )}
      </div>

      {exportStatus !== 'idle' && (
        <div className={`pacing-toast-floating pacing-toast ${exportStatus}`}>
          {exportStatus === 'success' ? '✓ QA report exported!' : '✗ Export failed'}
        </div>
      )}
    </div>
  );
};

export default PacingPhase;
