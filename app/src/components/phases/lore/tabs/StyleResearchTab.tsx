import React, { useState } from 'react';
import { AddPaletteColorModal } from '../components/AddPaletteColorModal';

interface StyleResearchTabProps {
  loreStyle: any;
  visualStyle: any;
  panelStyle: any;
  scriptStyle: any;
  openLoreFlag: (key: string) => void;
  onSaveLoreStyle: (updated: any) => Promise<void>;
  onSaveVisualStyle: (updated: any) => Promise<void>;
  onSavePanelStyle: (updated: any) => Promise<void>;
  onSaveScriptStyle: (updated: any) => Promise<void>;
}

export const StyleResearchTab: React.FC<StyleResearchTabProps> = ({
  loreStyle: propLoreStyle,
  visualStyle: propVisualStyle,
  panelStyle: propPanelStyle,
  scriptStyle: propScriptStyle,
  openLoreFlag,
  onSaveLoreStyle,
  onSaveVisualStyle,
  onSavePanelStyle,
  onSaveScriptStyle,
}) => {
  const [activeSection, setActiveSection] = useState<'narrative' | 'visual' | 'panels' | 'script'>('narrative');
  const [selectedPatternId, setSelectedPatternId] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showGridAreaLabels, setShowGridAreaLabels] = useState<boolean>(false);

  // Edit-mode states
  const [isEditing, setIsEditing] = useState(false);
  const [liveData, setLiveData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [showAddColor, setShowAddColor] = useState(false);

  // Dynamic selectors that map local vars to liveData (if editing) or the props
  const loreStyle = (isEditing && activeSection === 'narrative' && liveData) ? liveData : propLoreStyle;
  const visualStyle = (isEditing && activeSection === 'visual' && liveData) ? liveData : propVisualStyle;
  const panelStyle = (isEditing && activeSection === 'panels' && liveData) ? liveData : propPanelStyle;
  const scriptStyle = (isEditing && activeSection === 'script' && liveData) ? liveData : propScriptStyle;

  const startEditing = (section: typeof activeSection) => {
    let data = null;
    if (section === 'narrative') data = propLoreStyle;
    else if (section === 'visual') data = propVisualStyle;
    else if (section === 'panels') data = propPanelStyle;
    else if (section === 'script') data = propScriptStyle;

    if (data) {
      setLiveData(JSON.parse(JSON.stringify(data)));
    } else {
      setLiveData(null);
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!liveData) return;
    setSaving(true);
    try {
      if (activeSection === 'narrative') {
        await onSaveLoreStyle(liveData);
      } else if (activeSection === 'visual') {
        await onSaveVisualStyle(liveData);
      } else if (activeSection === 'panels') {
        await onSavePanelStyle(liveData);
      } else if (activeSection === 'script') {
        await onSaveScriptStyle(liveData);
      }
      setIsEditing(false);
    } catch (err: any) {
      alert('Failed to save changes: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSectionChange = (section: typeof activeSection) => {
    setActiveSection(section);
    if (isEditing) {
      startEditing(section);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // State update helpers for editing
  const updateField = (path: string[], value: any) => {
    setLiveData((prev: any) => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev));
      let current = next;
      for (let i = 0; i < path.length - 1; i++) {
        if (current[path[i]] === undefined || current[path[i]] === null) {
          current[path[i]] = {};
        }
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return next;
    });
  };

  const updateArrayItemField = (path: string[], index: number, field: string | null, value: any) => {
    setLiveData((prev: any) => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev));
      let current = next;
      for (let i = 0; i < path.length; i++) {
        if (current[path[i]] === undefined || current[path[i]] === null) {
          current[path[i]] = [];
        }
        current = current[path[i]];
      }
      if (Array.isArray(current) && current[index] !== undefined) {
        if (field === null) {
          current[index] = value;
        } else {
          if (current[index] === null || typeof current[index] !== 'object') {
            current[index] = {};
          }
          current[index][field] = value;
        }
      }
      return next;
    });
  };

  const addArrayItem = (path: string[], newItem: any) => {
    setLiveData((prev: any) => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev));
      let current = next;
      for (let i = 0; i < path.length; i++) {
        if (current[path[i]] === undefined || current[path[i]] === null) {
          current[path[i]] = [];
        }
        current = current[path[i]];
      }
      if (Array.isArray(current)) {
        current.push(newItem);
      }
      return next;
    });
  };

  const removeArrayItem = (path: string[], index: number) => {
    setLiveData((prev: any) => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev));
      let current = next;
      for (let i = 0; i < path.length; i++) {
        if (current[path[i]] === undefined) return prev;
        current = current[path[i]];
      }
      if (Array.isArray(current)) {
        current.splice(index, 1);
      }
      return next;
    });
  };

  // Set initial selected pattern if available
  const patterns = panelStyle?.signature_patterns ?? [];
  const activePattern = patterns.find((p: any) => p.pattern_id === selectedPatternId) || patterns[0];
  if (patterns.length > 0 && !selectedPatternId) {
    setSelectedPatternId(patterns[0].pattern_id);
  }

  const renderActiveSectionContent = () => {
    return (
      <>
        {/* ── SECTION: NARRATIVE STYLE ─────────────────────── */}
        {activeSection === 'narrative' && (
          <div className="lore-research-section">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-text-primary">
                  Narrative Style Guide:{' '}
                  {isEditing ? (
                    <input
                      type="text"
                      className="bg-transparent border-b border-border/60 focus:border-accent text-text-primary font-bold text-lg outline-none w-64 inline-block"
                      value={loreStyle?.reference_comic || ''}
                      onChange={(e) => updateField(['reference_comic'], e.target.value)}
                      placeholder="Reference Comic"
                    />
                  ) : (
                    loreStyle?.reference_comic || 'Reference Comic'
                  )}
                </h3>
                <p className="text-sm text-text-secondary">
                  Thematic tropes, narrative constraints, and structural guidelines extracted from the reference style.
                </p>
              </div>
              {!isEditing && (
                <button
                  className="lore-action-flag"
                  onClick={() => openLoreFlag('style_research:narrative')}
                  title="Flag entire Narrative section"
                >
                  🚩
                </button>
              )}
            </div>

            {!loreStyle ? (
              <div className="text-text-muted italic mt-4">No narrative style data found.</div>
            ) : (
              <>
                {/* Thematic Tropes */}
                <div className="mt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
                    Thematic Tropes & Plot Drivers
                  </h4>
                  <div className="lore-research-grid-2col">
                    {loreStyle.thematic_tropes?.map((trope: any, idx: number) => (
                      <div key={idx} className="lore-research-card group relative">
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem(['thematic_tropes'], idx)}
                            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-danger text-white hover:bg-danger-hover flex items-center justify-center text-xs shadow-md z-10 transition-colors cursor-pointer border border-danger/20"
                            title="Delete trope"
                          >
                            ✕
                          </button>
                        )}
                        <div className="lore-research-card-title flex items-center justify-between gap-2">
                          {isEditing ? (
                            <input
                              type="text"
                              className="bg-transparent border-b border-border/40 focus:border-accent text-text-primary font-bold text-sm w-full outline-none py-0.5"
                              value={trope.name || ''}
                              onChange={(e) => updateArrayItemField(['thematic_tropes'], idx, 'name', e.target.value)}
                              placeholder="Trope Name"
                            />
                          ) : (
                            <span>{trope.name}</span>
                          )}
                          {!isEditing && (
                            <button
                              className="lore-action-flag"
                              onClick={() => openLoreFlag(`style_research:narrative:trope:${trope.name}`)}
                              title={`Flag trope: ${trope.name}`}
                            >
                              🚩
                            </button>
                          )}
                        </div>
                        {isEditing ? (
                          <textarea
                            className="bg-transparent border border-border/20 focus:border-accent text-text-secondary text-xs w-full outline-none py-1 px-1.5 rounded mt-2 h-16 resize-y bg-background-base/20"
                            value={trope.description || ''}
                            onChange={(e) => updateArrayItemField(['thematic_tropes'], idx, 'description', e.target.value)}
                            placeholder="Trope description..."
                          />
                        ) : (
                          <p className="lore-research-card-body">{trope.description}</p>
                        )}
                        
                        {(trope.example_usage || isEditing) && (
                          <div className="lore-research-card-detail mt-2">
                            <span className="font-semibold block text-[10px] uppercase tracking-wider text-text-muted mb-1">
                              Reference Example:
                            </span>
                            {isEditing ? (
                              <textarea
                                className="bg-transparent border border-border/20 focus:border-accent text-text-secondary text-xs w-full outline-none py-1 px-1.5 rounded h-12 resize-y bg-background-base/20"
                                value={trope.example_usage || ''}
                                onChange={(e) => updateArrayItemField(['thematic_tropes'], idx, 'example_usage', e.target.value)}
                                placeholder="Reference Example..."
                              />
                            ) : (
                              trope.example_usage
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => addArrayItem(['thematic_tropes'], { name: 'New Trope', description: '', example_usage: '' })}
                        className="border-2 border-dashed border-border/60 hover:border-accent/60 bg-panel-raised/30 hover:bg-accent/5 rounded-xl p-6 flex flex-col items-center justify-center text-text-muted hover:text-accent transition-all min-h-[140px] cursor-pointer"
                      >
                        <span className="text-2xl mb-1">+</span>
                        <span className="text-xs font-bold uppercase tracking-wider">Add Thematic Trope</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Character Role Guidelines */}
                {((loreStyle.character_role_guidelines && loreStyle.character_role_guidelines.length > 0) || isEditing) && (
                  <div className="mt-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
                      Character Role Guidelines (Cast Archetypes)
                    </h4>
                    <div className="lore-research-grid-2col">
                      {loreStyle.character_role_guidelines?.map((guideline: any, idx: number) => (
                        <div key={idx} className="lore-research-card group relative">
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => removeArrayItem(['character_role_guidelines'], idx)}
                              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-danger text-white hover:bg-danger-hover flex items-center justify-center text-xs shadow-md z-10 transition-colors cursor-pointer border border-danger/20"
                              title="Delete archetype"
                            >
                              ✕
                            </button>
                          )}
                          <div className="lore-research-card-title flex items-center justify-between gap-2">
                            {isEditing ? (
                              <input
                                type="text"
                                className="bg-transparent border-b border-border/40 focus:border-accent text-text-primary font-bold text-sm w-full outline-none py-0.5"
                                value={guideline.archetype || ''}
                                onChange={(e) => updateArrayItemField(['character_role_guidelines'], idx, 'archetype', e.target.value)}
                                placeholder="Archetype"
                              />
                            ) : (
                              <span>👤 {guideline.archetype}</span>
                            )}
                            {!isEditing && (
                              <button
                                className="lore-action-flag"
                                onClick={() => openLoreFlag(`style_research:narrative:archetype:${guideline.archetype}`)}
                                title={`Flag archetype: ${guideline.archetype}`}
                              >
                                🚩
                              </button>
                            )}
                          </div>
                          {isEditing ? (
                            <textarea
                              className="bg-transparent border border-border/20 focus:border-accent text-text-secondary text-xs w-full outline-none py-1 px-1.5 rounded mt-2 h-16 resize-y bg-background-base/20"
                              value={guideline.description || ''}
                              onChange={(e) => updateArrayItemField(['character_role_guidelines'], idx, 'description', e.target.value)}
                              placeholder="Description..."
                            />
                          ) : (
                            <p className="lore-research-card-body">{guideline.description}</p>
                          )}
                        </div>
                      ))}
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => addArrayItem(['character_role_guidelines'], { archetype: 'New Archetype', description: '' })}
                          className="border-2 border-dashed border-border/60 hover:border-accent/60 bg-panel-raised/30 hover:bg-accent/5 rounded-xl p-6 flex flex-col items-center justify-center text-text-muted hover:text-accent transition-all min-h-[100px] cursor-pointer"
                        >
                          <span className="text-2xl mb-1">+</span>
                          <span className="text-xs font-bold uppercase tracking-wider">Add Archetype</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Narrative Rules */}
                <div className="mt-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
                    Narrative Rules & World Constraints
                  </h4>
                  <div className="lore-rules-list space-y-3">
                    {loreStyle.narrative_rules?.map((ruleObj: any, idx: number) => (
                      <div key={idx} className="lore-rule-callout group flex items-start gap-4 p-3 bg-panel-raised/30 border border-border/60 rounded-xl relative">
                        <span className="lore-rule-index font-mono mt-0.5">RULE {idx + 1}</span>
                        <div className="flex-1">
                          {isEditing ? (
                            <input
                              type="text"
                              className="bg-transparent border-b border-border/40 focus:border-accent text-text-primary font-semibold text-sm w-full outline-none py-0.5 mb-1"
                              value={ruleObj.rule || ''}
                              onChange={(e) => updateArrayItemField(['narrative_rules'], idx, 'rule', e.target.value)}
                              placeholder="Rule text"
                            />
                          ) : (
                            <span className="lore-rule-text font-semibold block text-text-primary mb-1">
                              {ruleObj.rule}
                            </span>
                          )}
                          {(ruleObj.reason || isEditing) && (
                            <div className="text-xs text-text-muted flex items-center gap-1.5 mt-1">
                              <strong>Style Rationale:</strong>
                              {isEditing ? (
                                <input
                                  type="text"
                                  className="bg-transparent border-b border-border/20 focus:border-accent text-xs text-text-secondary w-full outline-none py-0.5"
                                  value={ruleObj.reason || ''}
                                  onChange={(e) => updateArrayItemField(['narrative_rules'], idx, 'reason', e.target.value)}
                                  placeholder="Rationale description"
                                />
                              ) : (
                                <span>{ruleObj.reason}</span>
                              )}
                            </div>
                          )}
                        </div>
                        {isEditing ? (
                          <button
                            type="button"
                            onClick={() => removeArrayItem(['narrative_rules'], idx)}
                            className="text-text-muted hover:text-danger p-1 transition-colors self-center text-sm font-bold cursor-pointer"
                            title="Delete Rule"
                          >
                            ✕
                          </button>
                        ) : (
                          <button
                            className="lore-action-flag"
                            onClick={() => openLoreFlag(`style_research:narrative:rule:${ruleObj.rule}`)}
                            title={`Flag rule: ${ruleObj.rule}`}
                          >
                            🚩
                          </button>
                        )}
                      </div>
                    ))}
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => addArrayItem(['narrative_rules'], { rule: 'New Rule', reason: '' })}
                        className="px-3 py-1.5 bg-accent/10 border border-accent/20 text-accent hover:bg-accent hover:text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                      >
                        + Add Narrative Rule
                      </button>
                    )}
                  </div>
                </div>

                {/* Humor and Pacing Tropes */}
                {((loreStyle.humor_and_pacing_tropes && loreStyle.humor_and_pacing_tropes.length > 0) || isEditing) && (
                  <div className="mt-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
                      Humor Mechanisms & Pacing Tropes
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {loreStyle.humor_and_pacing_tropes?.map((item: string, idx: number) => (
                        <span
                          key={idx}
                          className="group inline-flex items-center gap-2 bg-panel-raised border border-border px-3 py-1.5 rounded-full text-xs font-medium text-text-secondary"
                        >
                          ⚡{' '}
                          {isEditing ? (
                            <input
                              type="text"
                              className="bg-transparent border-none text-text-secondary text-xs outline-none w-24 p-0 focus:ring-0 focus:border-none"
                              value={item}
                              onChange={(e) => updateArrayItemField(['humor_and_pacing_tropes'], idx, null, e.target.value)}
                            />
                          ) : (
                            <span>{item}</span>
                          )}
                          {isEditing ? (
                            <button
                              type="button"
                              onClick={() => removeArrayItem(['humor_and_pacing_tropes'], idx)}
                              className="text-text-muted hover:text-danger font-bold ml-0.5 text-xs cursor-pointer"
                            >
                              ✕
                            </button>
                          ) : (
                            <button
                              className="lore-flag-btn opacity-0 group-hover:opacity-100 transition-opacity ml-1 cursor-pointer"
                              onClick={() => openLoreFlag(`style_research:narrative:humor:${item}`)}
                              title={`Flag: ${item}`}
                            >
                              🚩
                            </button>
                          )}
                        </span>
                      ))}
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => addArrayItem(['humor_and_pacing_tropes'], 'New Trope')}
                          className="inline-flex items-center gap-1 bg-accent/10 hover:bg-accent/20 border border-dashed border-accent/30 hover:border-accent px-3 py-1.5 rounded-full text-xs font-bold text-accent transition-all cursor-pointer"
                        >
                          + Add Trope
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── SECTION: VISUAL DNA ──────────────────────────── */}
        {activeSection === 'visual' && (
          <div className="lore-research-section">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-text-primary">
                  Visual DNA Guide:{' '}
                  {isEditing ? (
                    <input
                      type="text"
                      className="bg-transparent border-b border-border/60 focus:border-accent text-text-primary font-bold text-lg outline-none w-64 inline-block"
                      value={visualStyle?.style_metadata?.name || ''}
                      onChange={(e) => updateField(['style_metadata', 'name'], e.target.value)}
                      placeholder="Aesthetic DNA Name"
                    />
                  ) : (
                    visualStyle?.style_metadata?.name || 'Aesthetic DNA'
                  )}
                </h3>
                {isEditing ? (
                  <input
                    type="text"
                    className="w-full bg-transparent border-b border-border/30 text-xs text-text-secondary mt-1 py-0.5 outline-none focus:border-accent"
                    value={visualStyle?.style_metadata?.description || ''}
                    onChange={(e) => updateField(['style_metadata', 'description'], e.target.value)}
                    placeholder="DNA Description..."
                  />
                ) : (
                  <p className="text-sm text-text-secondary mt-1">
                    {visualStyle?.style_metadata?.description || 'Drawing style, palette design, and baseline diffusion prompt tokens.'}
                  </p>
                )}
              </div>
              {!isEditing && (
                <button
                  className="lore-action-flag"
                  onClick={() => openLoreFlag('style_research:visual')}
                  title="Flag entire Visual DNA"
                >
                  🚩
                </button>
              )}
            </div>

            {!visualStyle ? (
              <div className="text-text-muted italic mt-4">No visual style data found.</div>
            ) : (
              <>
                {/* DNA Description */}
                {(visualStyle.dna?.description || isEditing) && (
                  <div className="mt-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Drawing DNA</h4>
                    {isEditing ? (
                      <textarea
                        className="w-full bg-transparent border border-border/40 focus:border-accent text-sm text-text-primary h-24 resize-y p-2 rounded leading-relaxed bg-background-base/20"
                        value={visualStyle.dna?.description || ''}
                        onChange={(e) => updateField(['dna', 'description'], e.target.value)}
                        placeholder="Describe the drawing style DNA..."
                      />
                    ) : (
                      <p className="lore-tone-text lore-visual-dna-text">{visualStyle.dna.description}</p>
                    )}
                  </div>
                )}

                {/* Color Swatches */}
                {((visualStyle.palette && visualStyle.palette.length > 0) || isEditing) && (
                  <div className="mt-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
                      Curated Color Palette Swatches
                    </h4>
                    <div className="lore-palette-row flex flex-wrap gap-4 items-start pt-1">
                      {visualStyle.palette?.map((color: any, idx: number) => {
                        if (isEditing) {
                          return (
                            <div key={idx} className="flex flex-col items-center gap-1 w-20 text-center relative group">
                              <div className="relative w-10 h-10 shrink-0">
                                <div 
                                  className="w-full h-full rounded-full border border-border shadow-sm overflow-hidden cursor-pointer" 
                                  style={{ backgroundColor: color.hex }}
                                  title={`Click to pick a color for ${color.label || 'New Color'}`}
                                >
                                  <input
                                    type="color"
                                    className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
                                    value={color.hex}
                                    onChange={(e) => updateArrayItemField(['palette'], idx, 'hex', e.target.value)}
                                  />
                                </div>
                                <button
                                  type="button"
                                  className="lore-action-delete !w-4 !h-4 !rounded-full !text-[10px] absolute -top-2 -right-2 shadow-sm"
                                  onClick={() => removeArrayItem(['palette'], idx)}
                                  title="Remove color"
                                >
                                  ✕
                                </button>
                              </div>
                              <input
                                type="text"
                                className="bg-transparent border-b border-border/20 text-[10px] font-semibold text-text-primary text-center outline-none focus:border-accent w-full py-0.5"
                                value={color.label || ''}
                                onChange={(e) => updateArrayItemField(['palette'], idx, 'label', e.target.value)}
                                placeholder="Label"
                              />
                              <input
                                type="text"
                                className="bg-transparent border-b border-border/20 text-[9px] font-mono text-text-secondary text-center outline-none focus:border-accent w-full py-0.5"
                                value={color.hex || ''}
                                onChange={(e) => updateArrayItemField(['palette'], idx, 'hex', e.target.value)}
                                placeholder="#hex"
                              />
                              <input
                                type="text"
                                className="bg-transparent border-b border-border/20 text-[8px] text-text-muted text-center outline-none focus:border-accent w-full py-0.5 italic"
                                value={color.role || ''}
                                onChange={(e) => updateArrayItemField(['palette'], idx, 'role', e.target.value)}
                                placeholder="Role"
                              />
                            </div>
                          );
                        } else {
                          return (
                            <div key={idx} className="flex flex-col items-center gap-1 w-20 text-center relative group">
                              <div
                                className="w-10 h-10 rounded-full border border-border shadow-sm shrink-0 cursor-pointer"
                                style={{ backgroundColor: color.hex }}
                                title={`${color.label} (${color.hex}): ${color.role}`}
                              />
                              <span className="text-[10px] font-bold text-text-primary truncate w-full" title={color.label}>{color.label}</span>
                              <span className="text-[9px] font-mono text-text-secondary truncate w-full" title={color.hex}>{color.hex}</span>
                              {color.role && (
                                <span className="text-[8px] text-text-muted italic truncate w-full animate-fade-in" title={color.role}>
                                  {color.role}
                                </span>
                              )}
                              <button
                                className="lore-action-flag absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                onClick={() => openLoreFlag(`style_research:visual:palette:${color.label}`)}
                                title={`Flag palette color: ${color.label}`}
                              >
                                🚩
                              </button>
                            </div>
                          );
                        }
                      })}
                      {isEditing && (
                        <button
                          type="button"
                          className="w-10 h-10 rounded-full border-2 border-dashed border-border flex items-center justify-center text-text-muted hover:text-accent hover:border-accent transition-colors shrink-0 font-bold self-start mt-2 cursor-pointer"
                          onClick={() => setShowAddColor(true)}
                          title="Add color"
                        >
                          +
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Drawing and Ink Rules */}
                {((visualStyle.rules && visualStyle.rules.length > 0) || isEditing) && (
                  <div className="mt-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
                      Drawing and Ink Rules
                    </h4>
                    <div className="lore-rules-list space-y-2">
                      {visualStyle.rules?.map((rule: string, idx: number) => (
                        <div key={idx} className="lore-rule-callout group flex items-center justify-between gap-4 p-2 bg-background-panel rounded border border-border relative">
                          <div className="flex items-center gap-3 flex-1">
                            <span className="lore-rule-index font-mono">{String(idx + 1).padStart(2, '0')}</span>
                            {isEditing ? (
                              <input
                                type="text"
                                className="bg-transparent border-b border-border/40 focus:border-accent text-text-primary text-sm w-full outline-none py-0.5"
                                value={rule}
                                onChange={(e) => updateArrayItemField(['rules'], idx, null, e.target.value)}
                              />
                            ) : (
                              <span className="lore-rule-text">{rule}</span>
                            )}
                          </div>
                          {isEditing ? (
                            <button
                              type="button"
                              onClick={() => removeArrayItem(['rules'], idx)}
                              className="text-text-muted hover:text-danger p-1 transition-colors text-xs font-bold cursor-pointer"
                              title="Delete rule"
                            >
                              ✕
                            </button>
                          ) : (
                            <button
                              className="lore-action-flag"
                              onClick={() => openLoreFlag(`style_research:visual:rule:${rule}`)}
                              title={`Flag visual rule: ${rule}`}
                            >
                              🚩
                            </button>
                          )}
                        </div>
                      ))}
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => addArrayItem(['rules'], 'New Rule')}
                          className="mt-2 px-3 py-1.5 bg-accent/10 border border-accent/20 text-accent hover:bg-accent hover:text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                        >
                          + Add Drawing/Ink Rule
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Image Generation Baselines */}
                {visualStyle.image_generation && (
                  <div className="mt-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
                      Diffusion Prompt Baselines
                    </h4>
                    <div className="space-y-4">
                      {/* Positive Prompt */}
                      <div className="bg-background-base border border-border rounded-lg p-4 relative group">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                            Positive Style Prompt (Baseline)
                          </span>
                          {!isEditing && (
                            <div className="flex items-center gap-2">
                              <button
                                className="text-xs px-2.5 py-1 bg-panel-raised hover:bg-border border border-border rounded font-medium text-text-secondary transition-colors cursor-pointer"
                                onClick={() => handleCopy(visualStyle.image_generation.positive_baseline, 'positive')}
                              >
                                {copiedId === 'positive' ? '✓ Copied' : '📋 Copy'}
                              </button>
                              <button
                                className="lore-action-flag"
                                onClick={() => openLoreFlag('style_research:visual:prompt:positive')}
                                title="Flag positive baseline prompt"
                              >
                                🚩
                              </button>
                            </div>
                          )}
                        </div>
                        {isEditing ? (
                          <textarea
                            className="w-full bg-transparent border border-border/40 focus:border-accent font-mono text-sm text-text-primary h-24 resize-y leading-relaxed p-2 rounded bg-background-base/20"
                            value={visualStyle.image_generation.positive_baseline || ''}
                            onChange={(e) => updateField(['image_generation', 'positive_baseline'], e.target.value)}
                            placeholder="Positive baseline prompt tokens..."
                          />
                        ) : (
                          <p className="text-sm font-mono text-text-primary whitespace-pre-wrap leading-relaxed select-all">
                            {visualStyle.image_generation.positive_baseline}
                          </p>
                        )}
                      </div>

                      {/* Negative Prompt */}
                      <div className="bg-background-base border border-border rounded-lg p-4 relative group">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                            Negative Style Prompt
                          </span>
                          {!isEditing && (
                            <div className="flex items-center gap-2">
                              <button
                                className="text-xs px-2.5 py-1 bg-panel-raised hover:bg-border border border-border rounded font-medium text-text-secondary transition-colors cursor-pointer"
                                onClick={() => handleCopy(visualStyle.image_generation.negative_prompt, 'negative')}
                              >
                                {copiedId === 'negative' ? '✓ Copied' : '📋 Copy'}
                              </button>
                              <button
                                className="lore-action-flag"
                                onClick={() => openLoreFlag('style_research:visual:prompt:negative')}
                                title="Flag negative prompt"
                              >
                                🚩
                              </button>
                            </div>
                          )}
                        </div>
                        {isEditing ? (
                          <textarea
                            className="w-full bg-transparent border border-border/40 focus:border-accent font-mono text-sm text-text-secondary h-20 resize-y leading-relaxed p-2 rounded bg-background-base/20"
                            value={visualStyle.image_generation.negative_prompt || ''}
                            onChange={(e) => updateField(['image_generation', 'negative_prompt'], e.target.value)}
                            placeholder="Negative style prompt tokens..."
                          />
                        ) : (
                          <p className="text-sm font-mono text-text-secondary whitespace-pre-wrap leading-relaxed select-all">
                            {visualStyle.image_generation.negative_prompt}
                          </p>
                        )}
                      </div>

                      {/* Framing Guidelines */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(visualStyle.image_generation.interior_page_framing || isEditing) && (
                          <div className="bg-background-base border border-border rounded-lg p-4 relative group">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                                Interior Page Framing
                              </span>
                              {!isEditing && (
                                <button
                                  className="lore-action-flag"
                                  onClick={() => openLoreFlag('style_research:visual:framing:interior')}
                                  title="Flag interior framing rules"
                                >
                                  🚩
                                </button>
                              )}
                            </div>
                            {isEditing ? (
                              <textarea
                                className="w-full bg-transparent border border-border/40 focus:border-accent text-sm text-text-primary h-20 resize-y leading-relaxed p-2 rounded bg-background-base/20"
                                value={visualStyle.image_generation.interior_page_framing || ''}
                                onChange={(e) => updateField(['image_generation', 'interior_page_framing'], e.target.value)}
                                placeholder="Interior page framing instructions..."
                              />
                            ) : (
                              <p className="text-sm text-text-primary">
                                {visualStyle.image_generation.interior_page_framing}
                              </p>
                            )}
                          </div>
                        )}

                        {(visualStyle.image_generation.cover_page_framing || isEditing) && (
                          <div className="bg-background-base border border-border rounded-lg p-4 relative group">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                                Cover Page Framing
                              </span>
                              {!isEditing && (
                                <button
                                  className="lore-action-flag"
                                  onClick={() => openLoreFlag('style_research:visual:framing:cover')}
                                  title="Flag cover framing rules"
                                >
                                  🚩
                                </button>
                              )}
                            </div>
                            {isEditing ? (
                              <textarea
                                className="w-full bg-transparent border border-border/40 focus:border-accent text-sm text-text-primary h-20 resize-y leading-relaxed p-2 rounded bg-background-base/20"
                                value={visualStyle.image_generation.cover_page_framing || ''}
                                onChange={(e) => updateField(['image_generation', 'cover_page_framing'], e.target.value)}
                                placeholder="Cover page framing instructions..."
                              />
                            ) : (
                              <p className="text-sm text-text-primary">
                                {visualStyle.image_generation.cover_page_framing}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Mood Board references */}
                {((visualStyle.mood_board && visualStyle.mood_board.length > 0) || isEditing) && (
                  <div className="mt-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
                      Style Reference Mood Board
                    </h4>
                    <div className="lore-moodboard-grid">
                      {visualStyle.mood_board?.map((item: any, idx: number) => (
                        <div key={item.id || idx} className="lore-moodboard-card group relative p-2 border border-border rounded-xl bg-background-base/20">
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => removeArrayItem(['mood_board'], idx)}
                              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-danger text-white hover:bg-danger-hover flex items-center justify-center text-xs shadow-md z-10 transition-colors cursor-pointer border border-danger/20"
                              title="Delete item"
                            >
                              ✕
                            </button>
                          )}
                          <div className="lore-moodboard-img-wrap relative">
                            {item.image ? (
                              <img
                                src={`/api/load-image?path=${encodeURIComponent(item.image)}`}
                                alt={`Style reference mood board ${idx + 1}`}
                                className="lore-moodboard-img"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-full h-24 bg-panel-raised flex items-center justify-center text-text-muted text-xs">
                                No Image
                              </div>
                            )}
                            {!isEditing && (
                              <div className="absolute top-2 right-2 flex gap-1">
                                <button
                                  className="lore-action-flag"
                                  onClick={() => openLoreFlag(`style_research:visual:mood_board:${item.id}`)}
                                  title={`Flag mood board item: ${item.id}`}
                                >
                                  🚩
                                </button>
                              </div>
                            )}
                          </div>
                          {isEditing ? (
                            <div className="space-y-1.5 mt-2 text-xs">
                              <input
                                type="text"
                                className="w-full bg-transparent border-b border-border/20 text-[10px] text-text-secondary outline-none focus:border-accent py-0.5"
                                value={item.image || ''}
                                onChange={(e) => updateArrayItemField(['mood_board'], idx, 'image', e.target.value)}
                                placeholder="Image Path"
                              />
                              <textarea
                                className="w-full bg-transparent border border-border/20 text-[10px] text-text-secondary outline-none focus:border-accent py-0.5 h-12 resize-y rounded px-1"
                                value={item.prompt || ''}
                                onChange={(e) => updateArrayItemField(['mood_board'], idx, 'prompt', e.target.value)}
                                placeholder="Prompt Description..."
                              />
                            </div>
                          ) : (
                            <p className="lore-moodboard-caption mt-2">{item.prompt}</p>
                          )}
                        </div>
                      ))}
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => addArrayItem(['mood_board'], { id: `mood_${Date.now()}`, image: '', prompt: '' })}
                          className="border-2 border-dashed border-border/60 hover:border-accent/60 bg-panel-raised/30 hover:bg-accent/5 rounded-xl p-4 flex flex-col items-center justify-center text-text-muted hover:text-accent transition-all min-h-[140px] cursor-pointer"
                        >
                          <span className="text-2xl mb-1">+</span>
                          <span className="text-xs font-bold uppercase tracking-wider">Add Item</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── SECTION: PANEL LAYOUTS ───────────────────────── */}
        {activeSection === 'panels' && (
          <div className="lore-research-section">
            <div className="flex items-center justify-between text-text-primary">
              <div>
                <h3 className="text-lg font-bold">
                  Panel Layout & Grid Guide:{' '}
                  {isEditing ? (
                    <input
                      type="text"
                      className="bg-transparent border-b border-border/60 focus:border-accent text-text-primary font-bold text-lg outline-none w-64 inline-block"
                      value={panelStyle?.reference?.comic_title || ''}
                      onChange={(e) => updateField(['reference', 'comic_title'], e.target.value)}
                      placeholder="Reference Comic Title"
                    />
                  ) : (
                    panelStyle?.reference?.comic_title || 'Comic Grid'
                  )}
                </h3>
                <p className="text-sm text-text-secondary">
                  Grid dimensions, borders, gutters, page rhythm, and structural patterns.
                </p>
              </div>
              {!isEditing && (
                <button
                  className="lore-action-flag"
                  onClick={() => openLoreFlag('style_research:panels')}
                  title="Flag entire Panel layouts guide"
                >
                  🚩
                </button>
              )}
            </div>

            {!panelStyle ? (
              <div className="text-text-muted italic mt-4">No panel style data found.</div>
            ) : (
              <>
                {/* Grid Statistics Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  {/* Rows per page */}
                  <div className="bg-background-base p-3 rounded-lg border border-border">
                    <span className="text-xs uppercase tracking-wider text-text-muted block">Rows per Page</span>
                    {isEditing ? (
                      <div className="flex items-center gap-1 mt-1 text-xs text-text-primary">
                        <input
                          type="number"
                          className="w-10 bg-transparent border-b border-border text-center font-bold"
                          value={panelStyle.grid_rules?.rows_per_page?.min ?? 1}
                          onChange={(e) => updateField(['grid_rules', 'rows_per_page', 'min'], parseInt(e.target.value) || 1)}
                        />
                        <span>-</span>
                        <input
                          type="number"
                          className="w-10 bg-transparent border-b border-border text-center font-bold"
                          value={panelStyle.grid_rules?.rows_per_page?.max ?? 1}
                          onChange={(e) => updateField(['grid_rules', 'rows_per_page', 'max'], parseInt(e.target.value) || 1)}
                        />
                        <span className="text-[10px] text-text-muted ml-1">Def:</span>
                        <input
                          type="number"
                          className="w-10 bg-transparent border-b border-border text-center font-bold"
                          value={panelStyle.grid_rules?.rows_per_page?.default ?? 1}
                          onChange={(e) => updateField(['grid_rules', 'rows_per_page', 'default'], parseInt(e.target.value) || 1)}
                        />
                      </div>
                    ) : (
                      <span className="text-base font-bold text-text-primary block mt-1">
                        {panelStyle.grid_rules?.rows_per_page?.min}-{panelStyle.grid_rules?.rows_per_page?.max}{' '}
                        <span className="text-xs text-text-muted font-normal">(Default: {panelStyle.grid_rules?.rows_per_page?.default})</span>
                      </span>
                    )}
                  </div>
                  
                  {/* Columns per page */}
                  <div className="bg-background-base p-3 rounded-lg border border-border">
                    <span className="text-xs uppercase tracking-wider text-text-muted block">Columns per Page</span>
                    {isEditing ? (
                      <div className="flex items-center gap-1 mt-1 text-xs text-text-primary">
                        <input
                          type="number"
                          className="w-10 bg-transparent border-b border-border text-center font-bold"
                          value={panelStyle.grid_rules?.columns_per_page?.min ?? 1}
                          onChange={(e) => updateField(['grid_rules', 'columns_per_page', 'min'], parseInt(e.target.value) || 1)}
                        />
                        <span>-</span>
                        <input
                          type="number"
                          className="w-10 bg-transparent border-b border-border text-center font-bold"
                          value={panelStyle.grid_rules?.columns_per_page?.max ?? 1}
                          onChange={(e) => updateField(['grid_rules', 'columns_per_page', 'max'], parseInt(e.target.value) || 1)}
                        />
                        <span className="text-[10px] text-text-muted ml-1">Def:</span>
                        <input
                          type="number"
                          className="w-10 bg-transparent border-b border-border text-center font-bold"
                          value={panelStyle.grid_rules?.columns_per_page?.default ?? 1}
                          onChange={(e) => updateField(['grid_rules', 'columns_per_page', 'default'], parseInt(e.target.value) || 1)}
                        />
                      </div>
                    ) : (
                      <span className="text-base font-bold text-text-primary block mt-1">
                        {panelStyle.grid_rules?.columns_per_page?.min}-{panelStyle.grid_rules?.columns_per_page?.max}{' '}
                        <span className="text-xs text-text-muted font-normal">(Default: {panelStyle.grid_rules?.columns_per_page?.default})</span>
                      </span>
                    )}
                  </div>

                  {/* Panels per page */}
                  <div className="bg-background-base p-3 rounded-lg border border-border">
                    <span className="text-xs uppercase tracking-wider text-text-muted block">Panels per Page</span>
                    {isEditing ? (
                      <div className="flex items-center gap-1 mt-1 text-xs text-text-primary">
                        <input
                          type="number"
                          className="w-10 bg-transparent border-b border-border text-center font-bold"
                          value={panelStyle.grid_rules?.panels_per_page?.min ?? 1}
                          onChange={(e) => updateField(['grid_rules', 'panels_per_page', 'min'], parseInt(e.target.value) || 1)}
                        />
                        <span>-</span>
                        <input
                          type="number"
                          className="w-10 bg-transparent border-b border-border text-center font-bold"
                          value={panelStyle.grid_rules?.panels_per_page?.max ?? 1}
                          onChange={(e) => updateField(['grid_rules', 'panels_per_page', 'max'], parseInt(e.target.value) || 1)}
                        />
                        <span className="text-[10px] text-text-muted ml-1">Typ:</span>
                        <input
                          type="number"
                          className="w-10 bg-transparent border-b border-border text-center font-bold"
                          value={panelStyle.grid_rules?.panels_per_page?.typical ?? 1}
                          onChange={(e) => updateField(['grid_rules', 'panels_per_page', 'typical'], parseInt(e.target.value) || 1)}
                        />
                      </div>
                    ) : (
                      <span className="text-base font-bold text-text-primary block mt-1">
                        {panelStyle.grid_rules?.panels_per_page?.min}-{panelStyle.grid_rules?.panels_per_page?.max}{' '}
                        <span className="text-xs text-text-muted font-normal">(Typical: {panelStyle.grid_rules?.panels_per_page?.typical})</span>
                      </span>
                    )}
                  </div>

                  {/* Gutter spacing */}
                  <div className="bg-background-base p-3 rounded-lg border border-border">
                    <span className="text-xs uppercase tracking-wider text-text-muted block">Gutter Spacing</span>
                    {isEditing ? (
                      <div className="flex flex-col gap-1 mt-1 text-[10px] text-text-primary">
                        <div className="flex items-center gap-1">
                          <span>Size:</span>
                          <input
                            type="text"
                            className="w-16 bg-transparent border-b border-border font-bold text-xs"
                            value={panelStyle.gutter?.size || ''}
                            onChange={(e) => updateField(['gutter', 'size'], e.target.value)}
                            placeholder="6px"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span>Style:</span>
                          <input
                            type="text"
                            className="w-16 bg-transparent border-b border-border text-[9px]"
                            value={panelStyle.gutter?.style || ''}
                            onChange={(e) => updateField(['gutter', 'style'], e.target.value)}
                            placeholder="space"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span>Outer:</span>
                          <input
                            type="text"
                            className="w-16 bg-transparent border-b border-border text-[9px]"
                            value={panelStyle.gutter?.outer_margin || ''}
                            onChange={(e) => updateField(['gutter', 'outer_margin'], e.target.value)}
                            placeholder="12px"
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-base font-bold text-text-primary block mt-1">
                        {panelStyle.gutter?.size || 'N/A'}{' '}
                        <span className="text-xs text-text-muted font-normal">({panelStyle.gutter?.style || 'space'})</span>
                      </span>
                    )}
                  </div>
                </div>

                {(panelStyle.grid_rules?.variance_notes || isEditing) && (
                  <div className="mt-2 text-xs text-text-secondary">
                    {isEditing ? (
                      <div className="bg-background-base/50 p-2.5 rounded border border-border/40">
                        <strong className="text-[10px] text-text-muted uppercase tracking-wider block mb-1">Grid Rhythm Variance Notes:</strong>
                        <textarea
                          className="w-full bg-transparent border border-border/40 focus:border-accent text-xs text-text-secondary p-1.5 rounded leading-relaxed resize-y h-16 bg-background-base/20"
                          value={panelStyle.grid_rules?.variance_notes || ''}
                          onChange={(e) => updateField(['grid_rules', 'variance_notes'], e.target.value)}
                          placeholder="Grid rhythm variance notes..."
                        />
                      </div>
                    ) : (
                      <p className="bg-background-base/50 p-2.5 rounded border border-border/40 leading-relaxed">
                        <strong>Grid Rhythm Variance:</strong> {panelStyle.grid_rules.variance_notes}
                      </p>
                    )}
                  </div>
                )}

                {/* Interactive CSS Grid Mockup Viewer */}
                <div className="mt-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3 flex items-center justify-between">
                    <span>📐 Signature Grid Templates Viewer</span>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-text-secondary flex items-center gap-1 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={showGridAreaLabels}
                          onChange={(e) => setShowGridAreaLabels(e.target.checked)}
                          className="rounded border-border text-accent focus:ring-accent"
                        />
                        Show grid-areas
                      </label>
                    </div>
                  </h4>

                  {patterns.length === 0 && !isEditing ? (
                    <div className="text-text-muted italic">No signature layouts found.</div>
                  ) : (
                    <div className="lore-layout-grid-viewer border border-border rounded-xl p-4 bg-background-base/40">
                      {/* Left Column - Template list */}
                      <div className="lore-layout-pattern-list flex flex-col gap-2">
                        {patterns.map((pattern: any, pIdx: number) => (
                          <div key={pattern.pattern_id || pIdx} className="relative group">
                            <button
                              className={`w-full text-left lore-layout-pattern-item flex flex-col justify-between ${
                                selectedPatternId === pattern.pattern_id ? 'active' : ''
                              }`}
                              onClick={() => setSelectedPatternId(pattern.pattern_id)}
                            >
                              <div>
                                <span className="lore-layout-pattern-item-name">{pattern.name}</span>
                                <p className="text-xs text-text-muted line-clamp-1 mt-0.5">{pattern.description}</p>
                              </div>
                              <div className="lore-layout-pattern-item-freq">
                                {pattern.frequency} · {pattern.panel_areas?.length || 0} panels
                              </div>
                            </button>
                            {isEditing && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeArrayItem(['signature_patterns'], pIdx);
                                  if (selectedPatternId === pattern.pattern_id) {
                                    setSelectedPatternId('');
                                  }
                                }}
                                className="absolute top-2 right-2 w-5 h-5 rounded-full bg-danger text-white hover:bg-danger-hover flex items-center justify-center text-xs shadow z-10 transition-colors border border-danger/20 cursor-pointer"
                                title="Delete template"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => addArrayItem(['signature_patterns'], {
                              pattern_id: `layout_${Date.now()}`,
                              name: 'New Layout',
                              description: '',
                              frequency: 'occasional',
                              grid_template: { columns: '1fr 1fr', rows: '1fr 1fr' },
                              panel_areas: [{ slot: 1, gridArea: '1/1/2/2' }, { slot: 2, gridArea: '1/2/3/3' }, { slot: 3, gridArea: '2/1/3/2' }],
                              use_when: [],
                              example_note: ''
                            })}
                            className="w-full py-2 bg-accent/10 border-2 border-dashed border-accent/30 hover:border-accent text-accent font-bold rounded-lg text-xs transition-all mt-2 cursor-pointer"
                          >
                            + Add Template
                          </button>
                        )}
                      </div>

                      {/* Right Column - Mockup grid preview */}
                      {activePattern ? (
                        <div className="lore-layout-preview-pane">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-2">
                              {isEditing ? (
                                <div className="space-y-2">
                                  <div className="flex gap-2">
                                    <div className="flex-1">
                                      <label className="text-[10px] uppercase font-bold text-text-muted block">Layout Name</label>
                                      <input
                                        type="text"
                                        className="w-full bg-transparent border-b border-border/40 focus:border-accent text-text-primary font-bold text-base outline-none py-0.5"
                                        value={activePattern.name || ''}
                                        onChange={(e) => updateArrayItemField(['signature_patterns'], patterns.indexOf(activePattern), 'name', e.target.value)}
                                        placeholder="Pattern Name"
                                      />
                                    </div>
                                    <div className="w-32">
                                      <label className="text-[10px] uppercase font-bold text-text-muted block">Frequency</label>
                                      <input
                                        type="text"
                                        className="w-full bg-transparent border-b border-border/40 focus:border-accent text-xs font-semibold text-accent outline-none py-0.5"
                                        value={activePattern.frequency || ''}
                                        onChange={(e) => updateArrayItemField(['signature_patterns'], patterns.indexOf(activePattern), 'frequency', e.target.value)}
                                        placeholder="Frequency"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-[10px] uppercase font-bold text-text-muted block">Description</label>
                                    <textarea
                                      className="w-full bg-transparent border border-border/20 focus:border-accent text-sm text-text-secondary p-1.5 rounded resize-y h-16 bg-background-base/20"
                                      value={activePattern.description || ''}
                                      onChange={(e) => updateArrayItemField(['signature_patterns'], patterns.indexOf(activePattern), 'description', e.target.value)}
                                      placeholder="Description..."
                                    />
                                  </div>
                                  
                                  {/* Grid columns and rows CSS editing */}
                                  <div className="grid grid-cols-2 gap-3 mt-1 bg-background-base/20 p-2 rounded border border-border/25">
                                    <div>
                                      <label className="text-[9px] uppercase text-text-muted font-bold block">Grid Columns CSS</label>
                                      <input
                                        type="text"
                                        className="w-full bg-transparent border-b border-border text-xs text-text-primary font-mono outline-none focus:border-accent py-0.5"
                                        value={activePattern.grid_template?.columns || ''}
                                        onChange={(e) => {
                                          const idx = patterns.indexOf(activePattern);
                                          const newTemplate = { ...(activePattern.grid_template || {}), columns: e.target.value };
                                          updateArrayItemField(['signature_patterns'], idx, 'grid_template', newTemplate);
                                        }}
                                        placeholder="e.g. 1fr 1fr 1fr"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[9px] uppercase text-text-muted font-bold block">Grid Rows CSS</label>
                                      <input
                                        type="text"
                                        className="w-full bg-transparent border-b border-border text-xs text-text-primary font-mono outline-none focus:border-accent py-0.5"
                                        value={activePattern.grid_template?.rows || ''}
                                        onChange={(e) => {
                                          const idx = patterns.indexOf(activePattern);
                                          const newTemplate = { ...(activePattern.grid_template || {}), rows: e.target.value };
                                          updateArrayItemField(['signature_patterns'], idx, 'grid_template', newTemplate);
                                        }}
                                        placeholder="e.g. 1fr 1.2fr 1fr"
                                      />
                                    </div>
                                  </div>

                                  {/* Panel slots editing */}
                                  <div className="mt-2 bg-background-base/20 p-2 rounded border border-border/25">
                                    <strong className="text-[9px] text-text-muted uppercase tracking-wider block mb-1">
                                      Panel Slots (grid-areas):
                                    </strong>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                      {activePattern.panel_areas?.map((area: any, aIdx: number) => (
                                        <div key={area.slot} className="bg-panel-raised/50 border border-border p-1 rounded flex flex-col gap-0.5 text-[10px]">
                                          <span className="font-bold text-text-secondary">Slot {area.slot}</span>
                                          <input
                                            type="text"
                                            className="bg-transparent border-b border-border/40 text-[10px] font-mono text-text-primary outline-none w-full p-0"
                                            value={area.gridArea || ''}
                                            onChange={(e) => {
                                              const pIdx = patterns.indexOf(activePattern);
                                              const nextAreas = [...(activePattern.panel_areas || [])];
                                              nextAreas[aIdx] = { ...area, gridArea: e.target.value };
                                              updateArrayItemField(['signature_patterns'], pIdx, 'panel_areas', nextAreas);
                                            }}
                                          />
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const pIdx = patterns.indexOf(activePattern);
                                              const nextAreas = (activePattern.panel_areas || []).filter((_: any, i: number) => i !== aIdx);
                                              updateArrayItemField(['signature_patterns'], pIdx, 'panel_areas', nextAreas);
                                            }}
                                            className="text-[9px] text-danger hover:underline self-end mt-0.5 cursor-pointer"
                                          >
                                            remove
                                          </button>
                                        </div>
                                      ))}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const pIdx = patterns.indexOf(activePattern);
                                          const nextAreas = [...(activePattern.panel_areas || [])];
                                          const nextSlot = nextAreas.reduce((max, a) => Math.max(max, a.slot), 0) + 1;
                                          nextAreas.push({ slot: nextSlot, gridArea: '1 / 1 / 2 / 2' });
                                          updateArrayItemField(['signature_patterns'], pIdx, 'panel_areas', nextAreas);
                                        }}
                                        className="border border-dashed border-border text-text-muted hover:text-accent hover:border-accent text-[10px] py-1 rounded flex items-center justify-center font-bold cursor-pointer"
                                      >
                                        + Add Slot
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <h5 className="font-bold text-text-primary text-base flex items-center gap-2">
                                    {activePattern.name}
                                    <span className="text-xs uppercase tracking-wider bg-accent/15 text-accent border border-accent/20 px-2 py-0.5 rounded-full">
                                      {activePattern.frequency}
                                    </span>
                                  </h5>
                                  <p className="text-sm text-text-secondary mt-1">{activePattern.description}</p>
                                </>
                              )}
                            </div>
                            {!isEditing && (
                              <button
                                className="lore-action-flag"
                                onClick={() => openLoreFlag(`style_research:panels:pattern:${activePattern.pattern_id}`)}
                                title={`Flag pattern: ${activePattern.name}`}
                              >
                                🚩
                              </button>
                            )}
                          </div>

                          {/* Visual grid mockup render */}
                          <div className="lore-layout-mockup-wrapper mt-3">
                            <div
                              className="lore-layout-mockup-grid bg-white border border-black shadow mx-auto"
                              style={{
                                display: 'grid',
                                gridTemplateColumns: activePattern.grid_template?.columns || '1fr',
                                gridTemplateRows: activePattern.grid_template?.rows || '1fr',
                                gap: panelStyle.gutter?.size || '6px',
                                padding: panelStyle.gutter?.outer_margin || '12px',
                                aspectRatio: '3 / 4',
                                maxWidth: '320px',
                              }}
                            >
                              {activePattern.panel_areas?.map((area: any) => (
                                <div
                                  key={area.slot}
                                  className="lore-layout-mockup-panel bg-cream border border-black text-black cursor-pointer hover:bg-accent/10 hover:border-accent hover:text-accent select-none p-1 flex flex-col justify-center items-center text-center overflow-hidden"
                                  style={{
                                    gridArea: area.gridArea,
                                    borderColor: panelStyle.panel_shapes?.border_color || '#000000',
                                    borderWidth: panelStyle.panel_shapes?.border_weight || '1.5px',
                                    borderStyle: panelStyle.panel_shapes?.border_style || 'solid',
                                    borderRadius: panelStyle.panel_shapes?.border_radius || '0px',
                                  }}
                                >
                                  <span className="font-bold text-xs block">Slot {area.slot}</span>
                                  {showGridAreaLabels && (
                                    <span
                                      className="font-mono text-[9px] text-text-muted mt-0.5 block truncate max-w-full"
                                      title={area.gridArea}
                                    >
                                      {area.gridArea}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Metadata details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 text-xs text-text-secondary">
                            <div>
                              <strong className="text-text-muted uppercase tracking-wider block mb-1">
                                Best suited for:
                              </strong>
                              <div className="flex flex-wrap gap-1">
                                {isEditing ? (
                                  <>
                                    {activePattern.use_when?.map((use: string, i: number) => (
                                      <span
                                        key={i}
                                        className="bg-panel-raised border border-border px-2 py-0.5 rounded text-text-secondary text-xs flex items-center gap-1"
                                      >
                                        <input
                                          type="text"
                                          className="bg-transparent border-none p-0 outline-none text-xs text-text-secondary w-20"
                                          value={use}
                                          onChange={(e) => {
                                            const pIdx = patterns.indexOf(activePattern);
                                            const nextUse = [...(activePattern.use_when || [])];
                                            nextUse[i] = e.target.value;
                                            updateArrayItemField(['signature_patterns'], pIdx, 'use_when', nextUse);
                                          }}
                                        />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const pIdx = patterns.indexOf(activePattern);
                                            const nextUse = (activePattern.use_when || []).filter((_: any, idx: number) => idx !== i);
                                            updateArrayItemField(['signature_patterns'], pIdx, 'use_when', nextUse);
                                          }}
                                          className="text-text-muted hover:text-danger font-bold text-xs cursor-pointer"
                                        >
                                          ✕
                                        </button>
                                      </span>
                                    ))}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const pIdx = patterns.indexOf(activePattern);
                                        const nextUse = [...(activePattern.use_when || []), 'New usage'];
                                        updateArrayItemField(['signature_patterns'], pIdx, 'use_when', nextUse);
                                      }}
                                      className="border border-dashed border-accent text-accent px-2 py-0.5 rounded text-xs font-bold cursor-pointer"
                                    >
                                      + Add
                                    </button>
                                  </>
                                ) : (
                                  activePattern.use_when?.map((use: string, i: number) => (
                                    <span
                                      key={i}
                                      className="bg-panel-raised border border-border px-2 py-0.5 rounded text-text-secondary"
                                    >
                                      {use}
                                    </span>
                                  ))
                                )}
                              </div>
                            </div>
                            {(activePattern.example_note || isEditing) && (
                              <div>
                                <strong className="text-text-muted uppercase tracking-wider block mb-1">
                                  Layout Rule / Rationale:
                                </strong>
                                {isEditing ? (
                                  <textarea
                                    className="w-full bg-transparent border border-border/20 focus:border-accent text-xs text-text-secondary p-1 rounded resize-y h-12 bg-background-base/20"
                                    value={activePattern.example_note || ''}
                                    onChange={(e) => updateArrayItemField(['signature_patterns'], patterns.indexOf(activePattern), 'example_note', e.target.value)}
                                    placeholder="Rule / Example notes..."
                                  />
                                ) : (
                                  <p className="italic leading-relaxed">{activePattern.example_note}</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-text-muted italic flex items-center justify-center p-8">No pattern selected.</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Page Rhythm & Atmosphere */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* Rhythm card */}
                  <div className="bg-background-base p-4 rounded-lg border border-border group relative">
                    <div className="flex items-center justify-between mb-3 border-b border-border/60 pb-2">
                      <h5 className="font-bold text-text-primary text-sm">📅 Page Rhythm & Flow</h5>
                      {!isEditing && (
                        <button
                          className="lore-action-flag"
                          onClick={() => openLoreFlag('style_research:panels:rhythm')}
                          title="Flag rhythm conventions"
                        >
                          🚩
                        </button>
                      )}
                    </div>
                    {isEditing ? (
                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-text-muted block">Opening Pages</label>
                          <input
                            type="text"
                            className="w-full bg-transparent border-b border-border/40 focus:border-accent text-text-primary text-xs outline-none py-0.5"
                            value={panelStyle.page_rhythm?.opening_page_tendency || ''}
                            onChange={(e) => updateField(['page_rhythm', 'opening_page_tendency'], e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-text-muted block">Closing Pages</label>
                          <input
                            type="text"
                            className="w-full bg-transparent border-b border-border/40 focus:border-accent text-text-primary text-xs outline-none py-0.5"
                            value={panelStyle.page_rhythm?.closing_page_tendency || ''}
                            onChange={(e) => updateField(['page_rhythm', 'closing_page_tendency'], e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-text-muted block">Action Pages</label>
                          <input
                            type="text"
                            className="w-full bg-transparent border-b border-border/40 focus:border-accent text-text-primary text-xs outline-none py-0.5"
                            value={panelStyle.page_rhythm?.action_page_tendency || ''}
                            onChange={(e) => updateField(['page_rhythm', 'action_page_tendency'], e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-text-muted block">Dialogue Pages</label>
                          <input
                            type="text"
                            className="w-full bg-transparent border-b border-border/40 focus:border-accent text-text-primary text-xs outline-none py-0.5"
                            value={panelStyle.page_rhythm?.dialogue_page_tendency || ''}
                            onChange={(e) => updateField(['page_rhythm', 'dialogue_page_tendency'], e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-text-muted block">General Rhythm Notes</label>
                          <textarea
                            className="w-full bg-transparent border border-border/20 focus:border-accent text-text-secondary text-xs p-1.5 rounded resize-y h-16 bg-background-base/20"
                            value={panelStyle.page_rhythm?.rhythm_notes || ''}
                            onChange={(e) => updateField(['page_rhythm', 'rhythm_notes'], e.target.value)}
                          />
                        </div>
                      </div>
                    ) : (
                      <ul className="space-y-2 text-xs text-text-secondary leading-relaxed">
                        {panelStyle.page_rhythm?.opening_page_tendency && (
                          <li>
                            <strong>Opening Pages:</strong> {panelStyle.page_rhythm.opening_page_tendency}
                          </li>
                        )}
                        {panelStyle.page_rhythm?.closing_page_tendency && (
                          <li>
                            <strong>Closing Pages:</strong> {panelStyle.page_rhythm.closing_page_tendency}
                          </li>
                        )}
                        {panelStyle.page_rhythm?.action_page_tendency && (
                          <li>
                            <strong>Action Pages:</strong> {panelStyle.page_rhythm.action_page_tendency}
                          </li>
                        )}
                        {panelStyle.page_rhythm?.dialogue_page_tendency && (
                          <li>
                            <strong>Dialogue Pages:</strong> {panelStyle.page_rhythm.dialogue_page_tendency}
                          </li>
                        )}
                        {panelStyle.page_rhythm?.rhythm_notes && (
                          <li className="mt-2 border-t border-border/40 pt-2 text-text-muted italic">
                            {panelStyle.page_rhythm.rhythm_notes}
                          </li>
                        )}
                      </ul>
                    )}
                  </div>

                  {/* Atmosphere & Shapes card */}
                  <div className="bg-background-base p-4 rounded-lg border border-border group relative">
                    <div className="flex items-center justify-between mb-3 border-b border-border/60 pb-2">
                      <h5 className="font-bold text-text-primary text-sm">🖼️ Panel Geometry & Atmosphere</h5>
                      {!isEditing && (
                        <button
                          className="lore-action-flag"
                          onClick={() => openLoreFlag('style_research:panels:atmosphere')}
                          title="Flag panel shape/color rules"
                        >
                          🚩
                        </button>
                      )}
                    </div>
                    {isEditing ? (
                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-text-muted block">Geometry shape notes</label>
                          <textarea
                            className="w-full bg-transparent border border-border/20 focus:border-accent text-text-secondary text-xs p-1.5 rounded resize-y h-12 bg-background-base/20"
                            value={panelStyle.panel_shapes?.shape_notes || ''}
                            onChange={(e) => updateField(['panel_shapes', 'shape_notes'], e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-text-muted block">Proportions notes</label>
                          <textarea
                            className="w-full bg-transparent border border-border/20 focus:border-accent text-text-secondary text-xs p-1.5 rounded resize-y h-12 bg-background-base/20"
                            value={panelStyle.proportions?.proportion_notes || ''}
                            onChange={(e) => updateField(['proportions', 'proportion_notes'], e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-text-muted block">Gutter notes</label>
                          <textarea
                            className="w-full bg-transparent border border-border/20 focus:border-accent text-text-secondary text-xs p-1.5 rounded resize-y h-12 bg-background-base/20"
                            value={panelStyle.gutter?.gutter_notes || ''}
                            onChange={(e) => updateField(['gutter', 'gutter_notes'], e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-text-muted block">Color & Atmosphere notes</label>
                          <textarea
                            className="w-full bg-transparent border border-border/20 focus:border-accent text-text-secondary text-xs p-1.5 rounded resize-y h-16 bg-background-base/20"
                            value={panelStyle.color_and_atmosphere?.atmosphere_notes || ''}
                            onChange={(e) => updateField(['color_and_atmosphere', 'atmosphere_notes'], e.target.value)}
                          />
                        </div>
                      </div>
                    ) : (
                      <ul className="space-y-2 text-xs text-text-secondary leading-relaxed">
                        {panelStyle.panel_shapes?.shape_notes && (
                          <li>
                            <strong>Geometry:</strong> {panelStyle.panel_shapes.shape_notes}
                          </li>
                        )}
                        {panelStyle.proportions?.proportion_notes && (
                          <li>
                            <strong>Proportions:</strong> {panelStyle.proportions.proportion_notes}
                          </li>
                        )}
                        {panelStyle.gutter?.gutter_notes && (
                          <li>
                            <strong>Gutters:</strong> {panelStyle.gutter.gutter_notes}
                          </li>
                        )}
                        {panelStyle.color_and_atmosphere?.atmosphere_notes && (
                          <li className="mt-2 border-t border-border/40 pt-2 text-text-muted italic">
                            {panelStyle.color_and_atmosphere.atmosphere_notes}
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── SECTION: SCRIPT CONVENTIONS ──────────────────── */}
        {activeSection === 'script' && (
          <div className="lore-research-section">
            <div className="flex items-center justify-between text-text-primary">
              <div>
                <h3 className="text-lg font-bold">
                  Script Writing Conventions:{' '}
                  {isEditing ? (
                    <input
                      type="text"
                      className="bg-transparent border-b border-border/60 focus:border-accent text-text-primary font-bold text-lg outline-none w-64 inline-block"
                      value={scriptStyle?.reference?.comic_title || ''}
                      onChange={(e) => updateField(['reference', 'comic_title'], e.target.value)}
                      placeholder="Reference Comic Title"
                    />
                  ) : (
                    scriptStyle?.reference?.comic_title || 'Reference Comic'
                  )}
                </h3>
                <p className="text-sm text-text-secondary">
                  Dialogue density, caption rules, SFX constraints, and strict layout anti-patterns.
                </p>
              </div>
              {!isEditing && (
                <button
                  className="lore-action-flag"
                  onClick={() => openLoreFlag('style_research:script')}
                  title="Flag entire Script conventions guide"
                >
                  🚩
                </button>
              )}
            </div>

            {!scriptStyle ? (
              <div className="text-text-muted italic mt-4">No script style data found.</div>
            ) : (
              <>
                {/* Dialogue Conventions Card Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  {/* Dialogue Conventions */}
                  <div className="bg-background-base p-4 rounded-lg border border-border group relative">
                    <div className="flex items-center justify-between mb-3 border-b border-border/60 pb-1">
                      <h5 className="font-bold text-text-primary text-xs uppercase tracking-wider text-text-muted">
                        💬 Dialogue & Balloons
                      </h5>
                      {!isEditing && (
                        <button
                          className="lore-action-flag"
                          onClick={() => openLoreFlag('style_research:script:dialogue')}
                          title="Flag dialogue rules"
                        >
                          🚩
                        </button>
                      )}
                    </div>
                    {isEditing ? (
                      <div className="space-y-3 text-xs text-text-secondary">
                        <div>
                          <label className="text-[10px] font-bold text-text-muted block uppercase">Density</label>
                          <input
                            type="text"
                            className="w-full bg-transparent border-b border-border/40 text-text-primary font-medium text-xs outline-none py-0.5"
                            value={scriptStyle.dialogue_conventions?.density || ''}
                            onChange={(e) => updateField(['dialogue_conventions', 'density'], e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-text-muted block uppercase">Words per balloon (Min - Max, Typical)</label>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <input
                              type="number"
                              className="w-10 bg-transparent border-b border-border text-center font-bold text-text-primary"
                              value={scriptStyle.dialogue_conventions?.average_words_per_balloon?.min ?? 1}
                              onChange={(e) => updateField(['dialogue_conventions', 'average_words_per_balloon', 'min'], parseInt(e.target.value) || 1)}
                            />
                            <span>-</span>
                            <input
                              type="number"
                              className="w-10 bg-transparent border-b border-border text-center font-bold text-text-primary"
                              value={scriptStyle.dialogue_conventions?.average_words_per_balloon?.max ?? 1}
                              onChange={(e) => updateField(['dialogue_conventions', 'average_words_per_balloon', 'max'], parseInt(e.target.value) || 1)}
                            />
                            <span className="text-[10px] text-text-muted ml-1">Typ:</span>
                            <input
                              type="number"
                              className="w-10 bg-transparent border-b border-border text-center font-bold text-text-primary"
                              value={scriptStyle.dialogue_conventions?.average_words_per_balloon?.typical ?? 1}
                              onChange={(e) => updateField(['dialogue_conventions', 'average_words_per_balloon', 'typical'], parseInt(e.target.value) || 1)}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 pt-1 select-none cursor-pointer">
                          <input
                            type="checkbox"
                            id="overlapping_dialogue"
                            checked={!!scriptStyle.dialogue_conventions?.overlapping_dialogue}
                            onChange={(e) => updateField(['dialogue_conventions', 'overlapping_dialogue'], e.target.checked)}
                            className="rounded border-border text-accent focus:ring-accent w-3.5 h-3.5"
                          />
                          <label htmlFor="overlapping_dialogue" className="text-xs font-bold text-text-secondary cursor-pointer">Allow overlapping dialogue</label>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-text-muted block uppercase">Placement rules</label>
                          <textarea
                            className="w-full bg-transparent border border-border/20 focus:border-accent text-xs p-1.5 rounded resize-y h-16 bg-background-base/20"
                            value={scriptStyle.dialogue_conventions?.placement_rules || ''}
                            onChange={(e) => updateField(['dialogue_conventions', 'placement_rules'], e.target.value)}
                          />
                        </div>
                      </div>
                    ) : (
                      <ul className="space-y-1.5 text-xs text-text-secondary leading-relaxed">
                        <li>
                          <strong>Density:</strong> {scriptStyle.dialogue_conventions?.density}
                        </li>
                        <li>
                          <strong>Words per balloon:</strong> Typical{' '}
                          {scriptStyle.dialogue_conventions?.average_words_per_balloon?.typical} (min{' '}
                          {scriptStyle.dialogue_conventions?.average_words_per_balloon?.min}, max{' '}
                          {scriptStyle.dialogue_conventions?.average_words_per_balloon?.max})
                        </li>
                        <li>
                          <strong>Overlapping:</strong> {scriptStyle.dialogue_conventions?.overlapping_dialogue ? 'Allowed' : 'Prohibited'}
                        </li>
                        {scriptStyle.dialogue_conventions?.placement_rules && (
                          <li className="mt-1 border-t border-border/40 pt-1.5 text-text-muted italic">
                            {scriptStyle.dialogue_conventions.placement_rules}
                          </li>
                        )}
                      </ul>
                    )}
                  </div>

                  {/* Narration and SFX */}
                  <div className="bg-background-base p-4 rounded-lg border border-border group relative">
                    <div className="flex items-center justify-between mb-3 border-b border-border/60 pb-1">
                      <h5 className="font-bold text-text-primary text-xs uppercase tracking-wider text-text-muted">
                        📣 Narration & SFX
                      </h5>
                      {!isEditing && (
                        <button
                          className="lore-action-flag"
                          onClick={() => openLoreFlag('style_research:script:narration')}
                          title="Flag narration/SFX rules"
                        >
                          🚩
                        </button>
                      )}
                    </div>
                    {isEditing ? (
                      <div className="space-y-3 text-xs text-text-secondary">
                        <div>
                          <label className="text-[10px] font-bold text-text-muted block uppercase">Narration & Captions</label>
                          <textarea
                            className="w-full bg-transparent border border-border/20 focus:border-accent text-xs p-1.5 rounded resize-y h-16 bg-background-base/20"
                            value={scriptStyle.narration_and_captions?.narration_usage || ''}
                            onChange={(e) => updateField(['narration_and_captions', 'narration_usage'], e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-text-muted block uppercase">Sound Effects (SFX) rules</label>
                          <textarea
                            className="w-full bg-transparent border border-border/20 focus:border-accent text-xs p-1.5 rounded resize-y h-16 bg-background-base/20"
                            value={scriptStyle.sound_effects?.sfx_rules || ''}
                            onChange={(e) => updateField(['sound_effects', 'sfx_rules'], e.target.value)}
                          />
                        </div>
                      </div>
                    ) : (
                      <ul className="space-y-2 text-xs text-text-secondary leading-relaxed">
                        {scriptStyle.narration_and_captions?.narration_usage && (
                          <li>
                            <strong>Narration:</strong> {scriptStyle.narration_and_captions.narration_usage}
                          </li>
                        )}
                        {scriptStyle.sound_effects?.sfx_rules && (
                          <li>
                            <strong>SFX Rules:</strong> {scriptStyle.sound_effects.sfx_rules}
                          </li>
                        )}
                      </ul>
                    )}
                  </div>

                  {/* Lettering and Silence */}
                  <div className="bg-background-base p-4 rounded-lg border border-border group relative">
                    <div className="flex items-center justify-between mb-3 border-b border-border/60 pb-1">
                      <h5 className="font-bold text-text-primary text-xs uppercase tracking-wider text-text-muted">
                        🖋️ Lettering & Silence
                      </h5>
                      {!isEditing && (
                        <button
                          className="lore-action-flag"
                          onClick={() => openLoreFlag('style_research:script:lettering')}
                          title="Flag lettering/silence rules"
                        >
                          🚩
                        </button>
                      )}
                    </div>
                    {isEditing ? (
                      <div className="space-y-3 text-xs text-text-secondary">
                        <div>
                          <label className="text-[10px] font-bold text-text-muted block uppercase">Silence & Pacing</label>
                          <textarea
                            className="w-full bg-transparent border border-border/20 focus:border-accent text-xs p-1.5 rounded resize-y h-16 bg-background-base/20"
                            value={scriptStyle.silence_and_pacing?.silence_rules || ''}
                            onChange={(e) => updateField(['silence_and_pacing', 'silence_rules'], e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-text-muted block uppercase">Lettering rules</label>
                          <textarea
                            className="w-full bg-transparent border border-border/20 focus:border-accent text-xs p-1.5 rounded resize-y h-16 bg-background-base/20"
                            value={scriptStyle.lettering?.lettering_rules || ''}
                            onChange={(e) => updateField(['lettering', 'lettering_rules'], e.target.value)}
                          />
                        </div>
                      </div>
                    ) : (
                      <ul className="space-y-2 text-xs text-text-secondary leading-relaxed">
                        {scriptStyle.silence_and_pacing?.silence_rules && (
                          <li>
                            <strong>Silence:</strong> {scriptStyle.silence_and_pacing.silence_rules}
                          </li>
                        )}
                        {scriptStyle.lettering?.lettering_rules && (
                          <li>
                            <strong>Lettering:</strong> {scriptStyle.lettering.lettering_rules}
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Anti-Patterns and Mistakes to Avoid */}
                {((scriptStyle.anti_patterns && scriptStyle.anti_patterns.length > 0) || isEditing) && (
                  <div className="mt-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
                      Script Anti-Patterns (Forbidden Layouts & Styles)
                    </h4>
                    <div className="lore-antipatterns-grid">
                      {scriptStyle.anti_patterns?.map((item: any, idx: number) => (
                        <div key={idx} className="lore-antipattern-card group relative p-3 bg-panel-raised/30 border border-border/60 rounded-xl">
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => removeArrayItem(['anti_patterns'], idx)}
                              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-danger text-white hover:bg-danger-hover flex items-center justify-center text-xs shadow-md z-10 transition-colors border border-danger/20 cursor-pointer"
                              title="Delete constraint"
                            >
                              ✕
                            </button>
                          )}
                          <div className="lore-antipattern-header flex items-center justify-between gap-2 border-b border-border/40 pb-1.5 mb-2">
                            <div className="flex items-center gap-1.5 text-danger font-semibold text-xs">
                              <span>🚫</span>
                              {isEditing ? (
                                <input
                                  type="text"
                                  className="bg-transparent border-b border-border/40 focus:border-accent text-text-primary text-xs font-bold w-full outline-none py-0.5"
                                  value={item.rule || ''}
                                  onChange={(e) => updateArrayItemField(['anti_patterns'], idx, 'rule', e.target.value)}
                                  placeholder="Constraint rule"
                                />
                              ) : (
                                <span className="lore-antipattern-rule">{item.rule}</span>
                              )}
                            </div>
                            {!isEditing && (
                              <button
                                className="lore-action-flag"
                                onClick={() => openLoreFlag(`style_research:script:antipattern:${item.rule}`)}
                                title={`Flag anti-pattern constraint: ${item.rule}`}
                              >
                                🚩
                              </button>
                            )}
                          </div>
                          {isEditing ? (
                            <textarea
                              className="bg-transparent border border-border/20 focus:border-accent text-text-secondary text-xs w-full outline-none py-1 px-1.5 h-16 resize-y rounded bg-background-base/20"
                              value={item.reason || ''}
                              onChange={(e) => updateArrayItemField(['anti_patterns'], idx, 'reason', e.target.value)}
                              placeholder="Reasoning / Explanation..."
                            />
                          ) : (
                            <p className="lore-antipattern-reason text-xs text-text-secondary leading-relaxed">{item.reason}</p>
                          )}
                        </div>
                      ))}
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => addArrayItem(['anti_patterns'], { rule: 'New Anti-Pattern Constraint', reason: '' })}
                          className="border-2 border-dashed border-border/60 hover:border-accent/60 bg-panel-raised/30 hover:bg-accent/5 rounded-xl p-4 flex flex-col items-center justify-center text-text-muted hover:text-accent transition-all min-h-[100px] cursor-pointer"
                        >
                          <span className="text-2xl mb-1">+</span>
                          <span className="text-xs font-bold uppercase tracking-wider">Add Anti-Pattern</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="space-y-6">
      {/* Tab selection header */}
      <div className="flex items-center justify-between border-b border-border pb-2">
        <div className="flex gap-2">
          {(['narrative', 'visual', 'panels', 'script'] as const).map((sec) => (
            <button
              key={sec}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer capitalize ${
                activeSection === sec
                  ? 'bg-accent text-white border-accent'
                  : 'bg-panel-raised text-text-secondary border-border hover:bg-border'
              }`}
              onClick={() => handleSectionChange(sec)}
            >
              {sec === 'narrative' ? '📖 Narrative' : sec === 'visual' ? '🎨 Visual DNA' : sec === 'panels' ? '📐 Panels' : '🖋️ Script'}
            </button>
          ))}
        </div>
        <button
          className="px-3.5 py-1.5 bg-accent-dim hover:bg-accent-primary hover:text-white border border-border-accent text-accent-hover text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
          onClick={() => {
            if (isEditing) {
              setIsEditing(false);
            } else {
              startEditing(activeSection);
            }
          }}
        >
          {isEditing ? '👁️ View Visual Preview' : '✏️ Edit Style Guide'}
        </button>
      </div>

      {isEditing ? (
        <div className="flex flex-col border border-border rounded-xl bg-background-panel overflow-hidden shadow-lg p-6 space-y-6">
          {/* Top Actions Bar */}
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-primary animate-pulse" />
              <span className="font-bold text-sm text-text-primary capitalize">Editing {activeSection} style guide</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="px-3.5 py-1.5 bg-panel-raised text-text-secondary border border-border hover:bg-border text-xs font-bold rounded-lg transition-all cursor-pointer"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-1.5 bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold rounded-lg transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={saving}
                onClick={handleSave}
              >
                {saving ? 'Saving...' : '💾 Save Changes'}
              </button>
            </div>
          </div>

          {/* Form Content area */}
          <div className="flex-1 overflow-y-auto max-h-[calc(100vh-320px)] pr-2">
            {renderActiveSectionContent()}
          </div>

          {/* Bottom Actions Bar */}
          <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
            <button
              type="button"
              className="px-3.5 py-1.5 bg-panel-raised text-text-secondary border border-border hover:bg-border text-xs font-bold rounded-lg transition-all cursor-pointer"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-1.5 bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold rounded-lg transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={saving}
              onClick={handleSave}
            >
              {saving ? 'Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </div>
      ) : (
        renderActiveSectionContent()
      )}

      {showAddColor && (
        <AddPaletteColorModal
          onClose={() => setShowAddColor(false)}
          onSubmit={(hex) => {
            addArrayItem(['palette'], {
              hex,
              label: 'New Color',
              role: 'Accent tone'
            });
            setShowAddColor(false);
          }}
        />
      )}
    </div>
  );
};
