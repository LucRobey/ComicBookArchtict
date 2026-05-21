import React, { useState, useEffect, useRef } from 'react';
import { useJsonFile } from '@/hooks/useJsonFile';
import { saveQaFlag } from '@/utils/saveFile';
import { Plus, Trash2, Save, Image, Flag, X, Check, Sparkles } from 'lucide-react';
import '../../../styles/characters.css';
import type { IntroData, CharacterIntro, IntroPanelData } from '@/types/data';

const INTROS_PATH = 'data/intro_pages.json';

const SIZE_WEIGHT_OPTIONS = [
  { value: 'splash_page', label: 'Splash Page' },
  { value: 'wide_established', label: 'Wide Establishing' },
  { value: 'standard_square', label: 'Standard Square' },
  { value: 'narrow_focus', label: 'Narrow Focus' },
];

const ASPECT_RATIO_OPTIONS = [
  { value: '16:9', label: '16:9' },
  { value: '1:1', label: '1:1' },
  { value: '4:3', label: '4:3' },
  { value: '21:9', label: '21:9' },
];

const CAMERA_ANGLE_OPTIONS = [
  { value: 'Eye-Level', label: 'Eye-Level' },
  { value: 'Low Angle looking up', label: 'Low Angle' },
  { value: 'High Angle looking down', label: 'High Angle' },
  { value: 'Dutch Angle', label: 'Dutch Angle' },
];

const DISTANCE_BLOCKING_OPTIONS = [
  { value: 'Foreground prominent', label: 'Foreground prominent' },
  { value: 'Midground center', label: 'Midground center' },
  { value: 'Background silhouette', label: 'Background silhouette' },
  { value: 'Off-screen / Out of frame', label: 'Off-screen / Out of frame' },
];

const CharactersPhase: React.FC = () => {
  const { data, loading, error, save } = useJsonFile<IntroData>(INTROS_PATH);
  const [selected, setSelected] = useState(0);
  const [localIntro, setLocalIntro] = useState<CharacterIntro | null>(null);

  // Split-view and sub-builders state
  const [isImagesOpen, setIsImagesOpen] = useState(false);
  const [newTheme, setNewTheme] = useState('');
  
  // Flagging drawer state
  const [flagTargetPanel, setFlagTargetPanel] = useState<IntroPanelData | null>(null);
  const [flagMode, setFlagMode] = useState<'regenerate' | 'modify'>('regenerate');
  const [flagNote, setFlagNote] = useState('');
  const [flagStatus, setFlagStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  // Track flagged panel numbers for this session
  const [flaggedPanels, setFlaggedPanels] = useState<Set<number>>(new Set());

  // Save changes toast state
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Synchronous local storage of all pages to prevent stale closures and save races
  const localPagesRef = useRef<CharacterIntro[]>([]);

  // Initialize/sync localPagesRef.current with data.intro_pages
  useEffect(() => {
    if (data && data.intro_pages) {
      const backendPagesStr = JSON.stringify(data.intro_pages);
      const localPagesStr = JSON.stringify(localPagesRef.current);
      if (backendPagesStr !== localPagesStr) {
        localPagesRef.current = JSON.parse(backendPagesStr);
        if (localPagesRef.current[selected]) {
          setLocalIntro(JSON.parse(JSON.stringify(localPagesRef.current[selected])));
        }
      }
    }
  }, [data]);

  // Handle character switching
  useEffect(() => {
    if (localPagesRef.current && localPagesRef.current[selected]) {
      setLocalIntro(JSON.parse(JSON.stringify(localPagesRef.current[selected])));
    }
  }, [selected]);

  if (loading) return <div className="chars-state">Loading character intros…</div>;
  if (error) return (
    <div className="chars-state error">
      <div style={{ fontSize: '2rem' }}>⚠️</div>
      <p>Could not load character intros.</p>
      <p className="chars-state-sub">{error}</p>
    </div>
  );
  if (!data || !data.intro_pages || data.intro_pages.length === 0) {
    return <div className="chars-state">No character intros found.</div>;
  }

  if (!localIntro) return null;

  // Inline updater wrapper to mutate master draft lists synchronously
  const updateLocalIntro = (updater: (draft: CharacterIntro) => void) => {
    if (!localPagesRef.current || !localPagesRef.current[selected]) return;
    const currentIntro = localPagesRef.current[selected];
    const next = JSON.parse(JSON.stringify(currentIntro));
    updater(next);
    localPagesRef.current[selected] = next; // Update master list synchronously
    setLocalIntro(next);                    // Schedule state update for rendering
  };

  const isDirty = !!(data?.intro_pages && JSON.stringify(data.intro_pages) !== JSON.stringify(localPagesRef.current));

  const saveAllPages = async () => {
    if (!localPagesRef.current || localPagesRef.current.length === 0) return;
    setSaveStatus('idle');
    const success = await save({ intro_pages: localPagesRef.current });
    if (success) {
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } else {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleSave = () => {
    saveAllPages();
  };

  const handleAddTheme = () => {
    if (!newTheme.trim()) return;
    updateLocalIntro(draft => {
      if (!draft.proposal) {
        draft.proposal = { story: '', tone: '', themes: [] };
      }
      if (!draft.proposal.themes) draft.proposal.themes = [];
      if (!draft.proposal.themes.includes(newTheme.trim())) {
        draft.proposal.themes.push(newTheme.trim());
      }
    });
    setNewTheme('');
  };

  const handleRemoveTheme = (idx: number) => {
    updateLocalIntro(draft => {
      if (draft.proposal?.themes) {
        draft.proposal.themes.splice(idx, 1);
      }
    });
  };

  const handleFlagSubmit = async () => {
    if (!localIntro || !flagTargetPanel) return;
    setFlagStatus('sending');
    const characterName = localIntro.character;
    const panelNum = flagTargetPanel.panel_number;
    const now = new Date().toISOString();
    const modeLabel = flagMode === 'regenerate' ? 'REGENERATE' : 'MODIFY';
    
    const flagType = `${modeLabel}_STYLE_IMAGE:characters:${characterName}:panel_${panelNum}`;

    const lines = [
      `# QA Flag — Character Intro Panel Image`,
      `Generated: ${now}`,
      ``,
      `## [${flagType}]`,
      `* **Character:** ${characterName}`,
      `* **Panel Number:** ${panelNum}`,
      `* **Mode:** ${flagMode === 'regenerate' ? 'Regenerate' : 'Modify'}`,
      `* **Keyframe Action:** ${flagTargetPanel.keyframe_action || '(no action defined)'}`,
      `* **Framing:** ${flagTargetPanel.cinematic_framing?.shot_type || 'Unknown'} - ${flagTargetPanel.cinematic_framing?.camera_angle || 'Unknown'}`,
      `* **Instructions / Feedback:** ${flagNote || '(no changes specified)'}`,
    ];

    const filename = `qa/characters/flag_intro_panel_${characterName.toLowerCase()}_panel_${panelNum}_${now.replace(/[:.]/g, '-')}.md`;

    try {
      await saveQaFlag(filename, lines.join('\n'));
      setFlagStatus('success');
      setFlaggedPanels(prev => {
        const next = new Set(prev);
        next.add(panelNum);
        return next;
      });
      setTimeout(() => {
        setFlagTargetPanel(null);
        setFlagNote('');
        setFlagStatus('idle');
      }, 1200);
    } catch {
      setFlagStatus('error');
      setTimeout(() => setFlagStatus('idle'), 3000);
    }
  };

  return (
    <div className="chars-phase bg-background-panel relative">
      
      {/* Sidebar - Characters List */}
      <div className="chars-sidebar bg-secondary border-r border-border shadow-sm">
        <div className="chars-sidebar-header">
          <h3>INTRO PAGES</h3>
          <span className="chars-count">{data.intro_pages.length}</span>
        </div>
        <div className="chars-list">
          {data.intro_pages.map((item, i) => (
            <button
              key={item.character}
              className={`chars-btn ${i === selected ? 'active' : ''}`}
              onClick={() => { setSelected(i); setFlagTargetPanel(null); }}
            >
              <span className="chars-avatar">{item.character[0]}</span>
              <div className="chars-btn-text">
                <span className="chars-name">{item.character}</span>
                <span className="chars-layout">Page {item.page_number}</span>
              </div>
            </button>
          ))}
        </div>
        {saveStatus !== 'idle' && (
          <div className={`chars-toast ${saveStatus}`}>
            {saveStatus === 'success' ? '✓ Changes saved!' : '✗ Save failed'}
          </div>
        )}
      </div>

      {/* Main Panel Content split with optional Images Sidebar */}
      <div className="chars-main">
        {/* Main Content Header */}
        <div className="chars-main-header bg-background-panel border-b border-border">
          <div>
            <h2>{localIntro.character} Introduction</h2>
            <span className="chars-page-ref flex items-center gap-2">
              <span>Page {localIntro.page_number} · Humorous Character Showcase</span>
              {isDirty ? (
                <span className="text-[11px] text-pink-400 font-sans font-medium border-l border-border pl-2 animate-pulse">
                  ● Unsaved changes
                </span>
              ) : (
                <span className="text-[11px] text-emerald-400 font-sans font-normal border-l border-border pl-2">
                  ✓ Saved
                </span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={!isDirty}
              className={`chars-save-btn ${isDirty ? 'pulse' : ''}`}
            >
              <Save size={14} /> Save Changes
            </button>
            <button
              onClick={() => setIsImagesOpen(!isImagesOpen)}
              className={`chars-toggle-images-btn ${isImagesOpen ? 'active' : ''}`}
            >
              <Image size={14} />
              {isImagesOpen ? 'Hide Images' : 'View Images'}
            </button>
          </div>
        </div>

        {/* Workspace body */}
        <div className="chars-workspace">
          
          {/* Left panel: Proposal & Panels Editor */}
          <div className="chars-editor-area">
            
            {/* Humorous Proposal Editor Card */}
            <div className="chars-card glass-panel">
              <div className="chars-card-header">
                <Sparkles size={16} className="text-pink-500" />
                <h4>Scenario Proposal</h4>
              </div>
              <div className="chars-card-body space-y-4">
                
                {/* Story Editor */}
                <div className="chars-field-group">
                  <label className="chars-field-label">Humorous Scenario Storyline</label>
                  <textarea
                    className="chars-input-textarea"
                    value={localIntro.proposal?.story || ''}
                    onChange={e => updateLocalIntro(draft => {
                      if (!draft.proposal) {
                        draft.proposal = { story: '', tone: '', themes: [] };
                      }
                      draft.proposal.story = e.target.value;
                    })}
                    placeholder="Describe the funny scenario in detail..."
                    rows={3}
                  />
                </div>

                {/* Tone Editor */}
                <div className="chars-field-group">
                  <label className="chars-field-label">Comedic Tone & Style</label>
                  <textarea
                    className="chars-input-textarea"
                    value={localIntro.proposal?.tone || ''}
                    onChange={e => updateLocalIntro(draft => {
                      if (!draft.proposal) {
                        draft.proposal = { story: '', tone: '', themes: [] };
                      }
                      draft.proposal.tone = e.target.value;
                    })}
                    placeholder="Describe the specific comedic tone..."
                    rows={2}
                  />
                </div>

                {/* Themes List Builder */}
                <div className="chars-field-group">
                  <label className="chars-field-label">Humorous Themes</label>
                  <div className="chars-themes-wrap">
                    {localIntro.proposal?.themes?.map((theme, idx) => (
                      <span key={idx} className="chars-theme-badge">
                        {theme}
                        <button className="chars-theme-remove" onClick={() => handleRemoveTheme(idx)}>
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                    {(!localIntro.proposal?.themes || localIntro.proposal.themes.length === 0) && (
                      <span className="text-text-muted text-xs italic">No themes added yet.</span>
                    )}
                  </div>
                  
                  {/* Theme inline adder */}
                  <div className="chars-theme-adder mt-2">
                    <input
                      type="text"
                      className="chars-input-text font-sans text-xs"
                      placeholder="Add another theme..."
                      value={newTheme}
                      onChange={e => setNewTheme(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleAddTheme(); }}
                    />
                    <button className="chars-theme-add-btn" onClick={handleAddTheme}>
                      <Plus size={12} /> Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Panels Decomposition List */}
            <div className="chars-panels-header">
              <h3>PANELS DECOMPOSITION</h3>
              <span className="chars-panels-count">{localIntro.panels?.length || 0} Panels</span>
            </div>

            <div className="chars-panels-grid">
              {localIntro.panels?.map((panel, pIdx) => (
                <div key={panel.panel_number} className="chars-panel-card bg-panel-raised border border-border">
                  
                  {/* Panel Identifier and Layout Intent */}
                  <div className="chars-panel-card-header border-b border-border">
                    <span className="chars-panel-badge">Panel {panel.panel_number}</span>
                    
                    {/* Layout settings */}
                    <div className="chars-panel-settings flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="chars-mini-label">Size:</span>
                        <select
                          className="chars-mini-select"
                          value={panel.layout_intent?.panel_size_weight || ''}
                          onChange={e => updateLocalIntro(draft => {
                            if (!draft.panels[pIdx].layout_intent) {
                              draft.panels[pIdx].layout_intent = { panel_size_weight: '', aspect_ratio_target: '' };
                            }
                            draft.panels[pIdx].layout_intent.panel_size_weight = e.target.value;
                          })}
                        >
                          {SIZE_WEIGHT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="chars-mini-label">Aspect:</span>
                        <select
                          className="chars-mini-select"
                          value={panel.layout_intent?.aspect_ratio_target || ''}
                          onChange={e => updateLocalIntro(draft => {
                            if (!draft.panels[pIdx].layout_intent) {
                              draft.panels[pIdx].layout_intent = { panel_size_weight: '', aspect_ratio_target: '' };
                            }
                            draft.panels[pIdx].layout_intent.aspect_ratio_target = e.target.value;
                          })}
                        >
                          {ASPECT_RATIO_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Panel Details Body */}
                  <div className="chars-panel-card-body space-y-3">
                    
                    {/* Cinematic Framing details */}
                    <div className="chars-framing-row grid grid-cols-3 gap-2">
                      <div className="chars-field-group">
                        <label className="chars-mini-field-label">Shot Type</label>
                        <input
                          type="text"
                          className="chars-input-text font-sans text-xs"
                          value={panel.cinematic_framing?.shot_type || ''}
                          onChange={e => updateLocalIntro(draft => {
                            if (!draft.panels[pIdx].cinematic_framing) {
                              draft.panels[pIdx].cinematic_framing = { shot_type: '', camera_angle: '', camera_lens_feel: '' };
                            }
                            draft.panels[pIdx].cinematic_framing.shot_type = e.target.value;
                          })}
                          placeholder="e.g. Close-up"
                        />
                      </div>
                      <div className="chars-field-group">
                        <label className="chars-mini-field-label">Camera Angle</label>
                        <select
                          className="chars-mini-select font-sans text-xs w-full py-1 h-[26px]"
                          value={panel.cinematic_framing?.camera_angle || ''}
                          onChange={e => updateLocalIntro(draft => {
                            if (!draft.panels[pIdx].cinematic_framing) {
                              draft.panels[pIdx].cinematic_framing = { shot_type: '', camera_angle: '', camera_lens_feel: '' };
                            }
                            draft.panels[pIdx].cinematic_framing.camera_angle = e.target.value;
                          })}
                        >
                          {CAMERA_ANGLE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      </div>
                      <div className="chars-field-group">
                        <label className="chars-mini-field-label">Lens Feel</label>
                        <input
                          type="text"
                          className="chars-input-text font-sans text-xs"
                          value={panel.cinematic_framing?.camera_lens_feel || ''}
                          onChange={e => updateLocalIntro(draft => {
                            if (!draft.panels[pIdx].cinematic_framing) {
                              draft.panels[pIdx].cinematic_framing = { shot_type: '', camera_angle: '', camera_lens_feel: '' };
                            }
                            draft.panels[pIdx].cinematic_framing.camera_lens_feel = e.target.value;
                          })}
                          placeholder="e.g. Wide lens feel"
                        />
                      </div>
                    </div>

                    {/* Keyframe Action */}
                    <div className="chars-field-group">
                      <label className="chars-mini-field-label">Keyframe Action</label>
                      <textarea
                        className="chars-input-textarea font-sans text-xs py-1.5"
                        value={panel.keyframe_action || ''}
                        onChange={e => updateLocalIntro(draft => { draft.panels[pIdx].keyframe_action = e.target.value; })}
                        placeholder="Describe the action in this panel..."
                        rows={2}
                      />
                    </div>

                    {/* Character Choreography list */}
                    <div className="chars-field-group bg-panel-raised border border-border/60 rounded p-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="chars-mini-field-label">Character Choreography</label>
                        <button
                          className="text-[10px] text-pink-500 hover:text-pink-400 font-bold flex items-center gap-0.5"
                          onClick={() => updateLocalIntro(draft => {
                            if (!draft.panels[pIdx].character_choreography) {
                              draft.panels[pIdx].character_choreography = [];
                            }
                            draft.panels[pIdx].character_choreography.push({
                              character_id: localIntro.character,
                              expression_override: '',
                              camera_distance_blocking: 'Foreground prominent'
                            });
                          })}
                        >
                          + Add Character
                        </button>
                      </div>
                      <div className="space-y-1">
                        {panel.character_choreography?.map((ch, chIdx) => (
                          <div key={chIdx} className="flex gap-1.5 items-center">
                            <input
                              type="text"
                              className="chars-input-text text-[10px] w-24 px-1 py-0.5"
                              value={ch.character_id}
                              onChange={e => updateLocalIntro(draft => {
                                if (!draft.panels[pIdx].character_choreography) {
                                  draft.panels[pIdx].character_choreography = [];
                                }
                                if (draft.panels[pIdx].character_choreography[chIdx]) {
                                  draft.panels[pIdx].character_choreography[chIdx].character_id = e.target.value;
                                }
                              })}
                              placeholder="Char ID"
                            />
                            <input
                              type="text"
                              className="chars-input-text text-[10px] flex-1 px-1 py-0.5"
                              value={ch.expression_override}
                              onChange={e => updateLocalIntro(draft => {
                                if (!draft.panels[pIdx].character_choreography) {
                                  draft.panels[pIdx].character_choreography = [];
                                }
                                if (draft.panels[pIdx].character_choreography[chIdx]) {
                                  draft.panels[pIdx].character_choreography[chIdx].expression_override = e.target.value;
                                }
                              })}
                              placeholder="Expression override (e.g. smile)"
                            />
                            <select
                              className="chars-mini-select text-[9px] py-0.5 h-[20px] max-w-[120px]"
                              value={ch.camera_distance_blocking}
                              onChange={e => updateLocalIntro(draft => {
                                if (!draft.panels[pIdx].character_choreography) {
                                  draft.panels[pIdx].character_choreography = [];
                                }
                                if (draft.panels[pIdx].character_choreography[chIdx]) {
                                  draft.panels[pIdx].character_choreography[chIdx].camera_distance_blocking = e.target.value;
                                }
                              })}
                            >
                              {DISTANCE_BLOCKING_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                            <button
                              className="text-text-muted hover:text-red-400 p-0.5"
                              onClick={() => updateLocalIntro(draft => {
                                if (draft.panels[pIdx].character_choreography) {
                                  draft.panels[pIdx].character_choreography.splice(chIdx, 1);
                                }
                              })}
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Dialogue, Captions, Lettering */}
                    <div className="chars-field-group bg-panel-raised border border-border/60 rounded p-2">
                      
                      {/* Captions sub-list */}
                      <div className="mb-2">
                        <div className="flex items-center justify-between mb-1">
                          <label className="chars-mini-field-label">Narrator Captions</label>
                          <button
                            className="text-[10px] text-pink-500 hover:text-pink-400 font-bold"
                            onClick={() => updateLocalIntro(draft => {
                              if (!draft.panels[pIdx].dialogue_and_lettering) {
                                draft.panels[pIdx].dialogue_and_lettering = { captions: [], speech_balloons: [] };
                              }
                              if (!draft.panels[pIdx].dialogue_and_lettering.captions) {
                                draft.panels[pIdx].dialogue_and_lettering.captions = [];
                              }
                              draft.panels[pIdx].dialogue_and_lettering.captions.push('');
                            })}
                          >
                            + Add Caption
                          </button>
                        </div>
                        <div className="space-y-1">
                          {panel.dialogue_and_lettering?.captions?.map((cap, capIdx) => (
                            <div key={capIdx} className="flex gap-1.5 items-center">
                              <input
                                type="text"
                                className="chars-input-text font-serif italic text-[10px] flex-1 px-1.5 py-0.5"
                                value={cap}
                                onChange={e => updateLocalIntro(draft => {
                                  if (!draft.panels[pIdx].dialogue_and_lettering) {
                                    draft.panels[pIdx].dialogue_and_lettering = { captions: [], speech_balloons: [] };
                                  }
                                  if (!draft.panels[pIdx].dialogue_and_lettering.captions) {
                                    draft.panels[pIdx].dialogue_and_lettering.captions = [];
                                  }
                                  draft.panels[pIdx].dialogue_and_lettering.captions[capIdx] = e.target.value;
                                })}
                                placeholder="Narrator caption..."
                              />
                              <button
                                className="text-text-muted hover:text-red-400 p-0.5"
                                onClick={() => updateLocalIntro(draft => {
                                  if (draft.panels[pIdx].dialogue_and_lettering?.captions) {
                                    draft.panels[pIdx].dialogue_and_lettering.captions.splice(capIdx, 1);
                                  }
                                })}
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Speech Balloons sub-list */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="chars-mini-field-label">Speech Balloons</label>
                          <button
                            className="text-[10px] text-pink-500 hover:text-pink-400 font-bold"
                            onClick={() => updateLocalIntro(draft => {
                              if (!draft.panels[pIdx].dialogue_and_lettering) {
                                draft.panels[pIdx].dialogue_and_lettering = { captions: [], speech_balloons: [] };
                              }
                              if (!draft.panels[pIdx].dialogue_and_lettering.speech_balloons) {
                                draft.panels[pIdx].dialogue_and_lettering.speech_balloons = [];
                              }
                              draft.panels[pIdx].dialogue_and_lettering.speech_balloons.push({
                                character_id: localIntro.character,
                                text: ''
                              });
                            })}
                          >
                            + Add Balloon
                          </button>
                        </div>
                        <div className="space-y-1.5">
                          {panel.dialogue_and_lettering?.speech_balloons?.map((sb, sbIdx) => (
                            <div key={sbIdx} className="flex gap-1.5 items-start">
                              <input
                                type="text"
                                className="chars-input-text font-semibold text-[10px] w-24 px-1.5 py-0.5"
                                value={sb.character_id}
                                onChange={e => updateLocalIntro(draft => {
                                  if (!draft.panels[pIdx].dialogue_and_lettering) {
                                    draft.panels[pIdx].dialogue_and_lettering = { captions: [], speech_balloons: [] };
                                  }
                                  if (!draft.panels[pIdx].dialogue_and_lettering.speech_balloons) {
                                    draft.panels[pIdx].dialogue_and_lettering.speech_balloons = [];
                                  }
                                  draft.panels[pIdx].dialogue_and_lettering.speech_balloons[sbIdx].character_id = e.target.value;
                                })}
                                placeholder="Character"
                              />
                              <textarea
                                className="chars-input-textarea text-[10px] flex-1 px-1.5 py-0.5 font-sans leading-snug"
                                value={sb.text}
                                onChange={e => updateLocalIntro(draft => {
                                  if (!draft.panels[pIdx].dialogue_and_lettering) {
                                    draft.panels[pIdx].dialogue_and_lettering = { captions: [], speech_balloons: [] };
                                  }
                                  if (!draft.panels[pIdx].dialogue_and_lettering.speech_balloons) {
                                    draft.panels[pIdx].dialogue_and_lettering.speech_balloons = [];
                                  }
                                  draft.panels[pIdx].dialogue_and_lettering.speech_balloons[sbIdx].text = e.target.value;
                                })}
                                placeholder="Dialogue text..."
                                rows={1}
                              />
                              <button
                                className="text-text-muted hover:text-red-400 p-0.5 mt-0.5"
                                onClick={() => updateLocalIntro(draft => {
                                  if (draft.panels[pIdx].dialogue_and_lettering?.speech_balloons) {
                                    draft.panels[pIdx].dialogue_and_lettering.speech_balloons.splice(sbIdx, 1);
                                  }
                                })}
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Tags editor */}
                    <div className="chars-field-group">
                      <label className="chars-mini-field-label">Panel Tags</label>
                      <div className="flex flex-wrap gap-1 mb-1">
                        {panel.tags?.map((t, tIdx) => (
                          <span key={tIdx} className="chars-mini-tag bg-panel-raised border border-border text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1">
                            {t}
                            <button
                              onClick={() => updateLocalIntro(draft => {
                                draft.panels[pIdx].tags.splice(tIdx, 1);
                              })}
                              className="text-text-muted hover:text-white"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      
                      {/* Tag inline add input */}
                      <input
                        type="text"
                        className="chars-input-text text-[9px] px-1 py-0.5 w-32 border border-dashed border-border"
                        placeholder="+ Add Tag (Press Enter)"
                        onKeyDown={e => {
                          const val = e.currentTarget.value.trim();
                          if (e.key === 'Enter' && val) {
                            updateLocalIntro(draft => {
                              if (!draft.panels[pIdx].tags) draft.panels[pIdx].tags = [];
                              if (!draft.panels[pIdx].tags.includes(val)) {
                                draft.panels[pIdx].tags.push(val);
                              }
                            });
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel: Images Panel */}
          {isImagesOpen && (
            <div className="chars-images-sidebar bg-background-base border-l border-border">
              <div className="chars-images-header border-b border-border">
                <span className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-widest text-text-primary">
                  <Image size={14} className="text-pink-500" /> PANEL IMAGES
                </span>
                <button className="text-text-muted hover:text-text-main" onClick={() => setIsImagesOpen(false)}>
                  <X size={16} />
                </button>
              </div>
              <div className="chars-images-list p-4 space-y-6 overflow-y-auto">
                {localIntro.panels?.map((panel) => (
                  <div key={panel.panel_number} className="chars-img-card bg-panel-raised border border-border rounded-lg overflow-hidden relative group">
                    {/* Header bar on image card */}
                    <div className="flex justify-between items-center bg-background-panel/60 px-3 py-1.5 border-b border-border text-[11px] font-bold">
                      <span className="text-pink-400">Panel {panel.panel_number}</span>
                      {flaggedPanels.has(panel.panel_number) && (
                        <span className="text-emerald-400 flex items-center gap-0.5">
                          <Check size={10} /> Flagged
                        </span>
                      )}
                    </div>
                    
                    {/* Loaded Image or Pending placeholder */}
                    <div className="relative aspect-[4/3] bg-background-base flex items-center justify-center overflow-hidden border-b border-border">
                      {panel.image ? (
                        <img
                          src={`/api/load-image?path=${encodeURIComponent(panel.image)}`}
                          alt={`Panel ${panel.panel_number}`}
                          className="w-full h-full object-cover"
                          onError={e => {
                            // Hide broken image, show fallback icon
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-text-muted p-4 text-center">
                          <span className="text-2xl mb-1 text-slate-500">⌛</span>
                          <span className="text-xs font-semibold">Pending Generation</span>
                          <span className="text-[10px] opacity-60 mt-0.5 max-w-[200px]">Waiting for image generation agent</span>
                        </div>
                      )}
                    </div>

                    {/* Card Actions bar */}
                    <div className="p-2.5 bg-background-panel/40 flex items-center justify-between text-[10px]">
                      <span className="text-text-muted truncate max-w-[180px]" title={panel.keyframe_action}>
                        {panel.keyframe_action || 'No action defined'}
                      </span>
                      <button
                        onClick={() => setFlagTargetPanel(panel)}
                        className="chars-flag-action-btn flex items-center gap-1 text-pink-500 hover:text-pink-400 font-semibold px-2 py-1 rounded bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 transition-all shrink-0"
                      >
                        <Flag size={10} /> Flag Style Image
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Flagging Drawer Overlay & Container */}
      {flagTargetPanel && (
        <>
          <div className="chars-drawer-overlay" onClick={() => setFlagTargetPanel(null)} />
          <div className="chars-drawer bg-background-panel border-l border-border shadow-2xl flex flex-col p-5">
            <div className="chars-drawer-header flex justify-between items-start mb-4 border-b border-border pb-3">
              <div>
                <h3>🚩 Flag Panel Image</h3>
                <p className="text-[11px] text-text-muted mt-0.5">
                  Character: {localIntro.character} · Panel {flagTargetPanel.panel_number}
                </p>
              </div>
              <button className="text-text-muted hover:text-text-main p-1" onClick={() => setFlagTargetPanel(null)}>
                <X size={18} />
              </button>
            </div>

            {/* Mode Selector */}
            <div className="chars-drawer-section mb-4">
              <label className="chars-field-label">Action Mode</label>
              <div className="flex gap-2 mt-1.5">
                <button
                  onClick={() => setFlagMode('regenerate')}
                  className={`flex-1 text-center py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${flagMode === 'regenerate' ? 'bg-pink-500 border-pink-500 text-white shadow' : 'bg-background-base border-border text-text-muted hover:text-text-main'}`}
                >
                  Regenerate
                </button>
                <button
                  onClick={() => setFlagMode('modify')}
                  className={`flex-1 text-center py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${flagMode === 'modify' ? 'bg-pink-500 border-pink-500 text-white shadow' : 'bg-background-base border-border text-text-muted hover:text-text-main'}`}
                >
                  Modify / Retouch
                </button>
              </div>
              <p className="text-[10px] text-text-muted mt-1.5 leading-normal">
                {flagMode === 'regenerate'
                  ? 'Request the agent to rewrite the prompt and generate a completely new visual composition.'
                  : 'Request the agent to adjust specific details in the existing composition (paint modifications).'}
              </p>
            </div>

            {/* Instructions note */}
            <div className="chars-drawer-section flex-1 flex flex-col mb-4">
              <label className="chars-field-label mb-1">Agent Instructions</label>
              <textarea
                value={flagNote}
                onChange={e => setFlagNote(e.target.value)}
                className="chars-input-textarea font-sans text-xs flex-1 min-h-[120px] p-2.5 outline-none resize-none"
                placeholder={flagMode === 'regenerate'
                  ? 'Describe details to change in prompt (e.g. "Add more steam around tea, make thermometer red")...'
                  : 'Describe specific edits (e.g. "Fix lighting on face, clean up grease smudge line detail")...'}
              />
            </div>

            {/* Actions */}
            <div className="chars-drawer-actions pt-3 border-t border-border mt-auto">
              <button
                onClick={handleFlagSubmit}
                disabled={flagStatus === 'sending' || !flagNote.trim()}
                className="chars-drawer-submit-btn"
              >
                {flagStatus === 'sending' ? (
                  <span className="flex items-center justify-center gap-1.5">
                    Sending...
                  </span>
                ) : flagStatus === 'success' ? (
                  <span className="flex items-center justify-center gap-1.5 text-emerald-300">
                    ✓ Flag Created
                  </span>
                ) : (
                  'Submit Flag File'
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CharactersPhase;
