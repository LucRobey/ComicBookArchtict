import React, { useState, useEffect } from 'react';

// ── Types ────────────────────────────────────────────────
interface CharacterLink {
  target_character: string;
  relationship_type: 'friend' | 'family' | 'lover';
  relationship_subtype: string;
  dynamic: string;
}

interface PresentationData {
  name: string;
  last_updated: string;
  identity: Record<string, string>;
  physical_reality: Record<string, string>;
  backstory: Record<string, string>;
  psychology: Record<string, string>;
  relationships: Record<string, string>;
  voice: Record<string, string>;
  agent_notes: Record<string, string>;
  network?: CharacterLink[];
}

interface HighlightsEntry {
  highlighted_fields: string[];
  notes: string;
}

interface OriginalViewProps {
  charName: string;
  highlights: HighlightsEntry;
  onHighlightsChange: (h: HighlightsEntry) => void;
  generalMood: string;
  onGeneralMoodChange: (newMood: string) => Promise<boolean>;
}

// ── Section metadata ─────────────────────────────────────
const SECTIONS: { key: keyof PresentationData; label: string; icon: string }[] = [
  { key: 'identity', label: 'Identity', icon: '🪪' },
  { key: 'physical_reality', label: 'Physical Reality', icon: '👤' },
  { key: 'backstory', label: 'Backstory', icon: '📖' },
  { key: 'psychology', label: 'Psychology', icon: '🧠' },
  { key: 'relationships', label: 'Relationships', icon: '🤝' },
  { key: 'voice', label: 'Voice', icon: '🗣' },
  { key: 'agent_notes', label: 'Agent Notes', icon: '🤖' },
];

const FIELD_LABELS: Record<string, string> = {
  full_name: 'Full Name', known_as: 'Known As', age: 'Age',
  nationality_origin: 'Nationality / Origin', languages: 'Languages',
  profession_role: 'Profession / Role', current_life_chapter: 'Current Life Chapter',
  face: 'Face', hair: 'Hair', build: 'Build', hands: 'Hands',
  distinctive_features: 'Distinctive Features', how_they_age: 'How They Age',
  what_photos_dont_capture: "What Photos Don't Capture",
  origin: 'Origin', formative_events: 'Formative Events',
  turning_points: 'Turning Points', current_situation: 'Current Situation',
  core_driver: 'Core Driver', core_fear: 'Core Fear', self_image: 'Self-Image',
  the_gap: 'The Gap', default_coping_mechanism: 'Default Coping Mechanism',
  what_theyre_proud_of: "What They're Proud Of",
  what_theyre_ashamed_of: "What They're Ashamed Of",
  how_they_make_friends: 'How They Make Friends', how_they_fight: 'How They Fight',
  how_they_love: 'How They Love', who_they_are_at_best: 'At Their Best',
  who_they_are_at_worst: 'At Their Worst',
  vocabulary_register: 'Vocabulary Register', sentence_length: 'Sentence Length',
  comfortable_topics: 'Comfortable Topics', avoids_saying: 'Avoids Saying',
  verbal_habit: 'Verbal Habit',
  must_know: 'Must-Know', common_mistake: 'Common Mistake',
  what_makes_them_specific: 'What Makes Them Specific',
};

// ── Helper: load image list from originals/ ──────────────
function buildImageSrc(relativePath: string): string {
  return `/api/load-image?path=${encodeURIComponent(relativePath)}`;
}

// ── Component ────────────────────────────────────────────
const OriginalView: React.FC<OriginalViewProps> = ({ charName, highlights, onHighlightsChange, generalMood, onGeneralMoodChange }) => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [presentation, setPresentation] = useState<PresentationData | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    SECTIONS.forEach(s => { init[s.key] = true; });
    return init;
  });
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<{ key: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // Network editing state
  const [editingNetworkIndex, setEditingNetworkIndex] = useState<number | null>(null);
  const [networkDraft, setNetworkDraft] = useState<CharacterLink | null>(null);

  // General Mood (Phase 1) state
  const [isEditingMood, setIsEditingMood] = useState(false);
  const [moodDraft, setMoodDraft] = useState('');
  const [savingMood, setSavingMood] = useState(false);

  // Load originals photo list
  useEffect(() => {
    const url = `/api/list-dir?path=${encodeURIComponent(`global_characters/${charName}/originals`)}`;
    fetch(url).then(r => r.ok ? r.json() : null).then(data => {
      if (!data?.entries) { setPhotos([]); return; }
      const imgs = data.entries
        .filter((e: { name: string; isDir: boolean }) => !e.isDir)
        .map((e: { name: string }) => e.name)
        .sort();
      setPhotos(imgs);
    }).catch(() => setPhotos([]));
  }, [charName]);

  // Load presentation.json
  useEffect(() => {
    const url = `/api/load?path=${encodeURIComponent(`global_characters/${charName}/presentation.json`)}`;
    fetch(url).then(r => r.ok ? r.json() : null).then(data => {
      setPresentation(data?.data ?? null);
    }).catch(() => setPresentation(null));
  }, [charName]);

  // Reset edit state when character changes
  useEffect(() => {
    setIsEditingMood(false);
  }, [charName]);

  const [notesDraft, setNotesDraft] = useState('');

  // Sync notesDraft when highlights.notes or charName changes
  useEffect(() => {
    setNotesDraft(highlights.notes || '');
  }, [highlights.notes, charName]);

  const saveGeneralMood = async () => {
    setSavingMood(true);
    try {
      const ok = await onGeneralMoodChange(moodDraft);
      if (ok) {
        setIsEditingMood(false);
      }
    } catch (e) {
      console.error('Error saving general mood:', e);
    } finally {
      setSavingMood(false);
    }
  };

  const toggleHighlight = (fieldPath: string) => {
    const list = highlights.highlighted_fields;
    const next = list.includes(fieldPath)
      ? list.filter(f => f !== fieldPath)
      : [...list, fieldPath];
    onHighlightsChange({ ...highlights, highlighted_fields: next });
  };

  const toggleSection = (key: string) => {
    setCollapsed(c => ({ ...c, [key]: !c[key] }));
  };

  const saveField = async (key: string, field: string) => {
    if (!presentation) return;
    const updatedSection = { ...(presentation[key as keyof PresentationData] as Record<string, string>) };
    updatedSection[field] = editValue;
    const updatedPres = { ...presentation, [key]: updatedSection };
    
    try {
      await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: `global_characters/${charName}/presentation.json`,
          content: updatedPres
        })
      });
      setPresentation(updatedPres);
      setEditingField(null);
    } catch (e) {
      console.error('Failed to save presentation field', e);
    }
  };

  const saveNetwork = async (newNetwork: CharacterLink[]) => {
    if (!presentation) return;
    const updatedPres = { ...presentation, network: newNetwork };
    try {
      await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: `global_characters/${charName}/presentation.json`,
          content: updatedPres
        })
      });
      setPresentation(updatedPres);
      setEditingNetworkIndex(null);
      setNetworkDraft(null);
    } catch (e) {
      console.error('Failed to save network array', e);
    }
  };

  const addNetworkLink = () => {
    const newLink: CharacterLink = { target_character: '', relationship_type: 'friend', relationship_subtype: 'normal', dynamic: '' };
    setNetworkDraft(newLink);
    setEditingNetworkIndex((presentation?.network?.length || 0));
  };

  return (
    <>
      {/* ── Photo gallery ── */}
      <div className="chub-section">
        <div className="chub-section-label">Reference Photos</div>
        {photos.length === 0 ? (
          <div className="chub-state" style={{ minHeight: 120 }}>
            <div className="chub-state-icon">📷</div>
            <p className="chub-state-hint">
              No photos found in <code>global_characters/{charName}/originals/</code>
            </p>
          </div>
        ) : (
          <div className="chub-originals-grid">
            {photos.map(name => {
              const src = buildImageSrc(`global_characters/${charName}/originals/${name}`);
              return (
                <div
                  key={name}
                  className="chub-original-thumb"
                  onClick={() => setLightboxSrc(src)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && setLightboxSrc(src)}
                >
                  <img src={src} alt={`${charName} — ${name}`} />
                  <div className="chub-original-filename">{name}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Highlight note ── */}
      <div className="chub-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', marginBottom: 4 }}>
          <div className="chub-section-label" style={{ margin: 0, flex: 1 }}>Comic Relevance Note</div>
          {notesDraft !== (highlights.notes || '') && (
            <button
              className="chub-subtab-btn"
              style={{ padding: '2px 8px', fontSize: '0.72rem', height: 'fit-content' }}
              onClick={() => onHighlightsChange({ ...highlights, notes: notesDraft })}
            >
              💾 Save Note
            </button>
          )}
        </div>
        <textarea
          className="chub-highlight-note"
          placeholder="Why are the highlighted traits important for this comic?"
          value={notesDraft}
          onChange={e => setNotesDraft(e.target.value)}
          rows={2}
        />
      </div>

      {/* ── General Mood & Headspace (Phase 1) ── */}
      <div className="chub-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', marginBottom: 4 }}>
          <div className="chub-section-label" style={{ margin: 0, flex: 1 }}>General Mood & Headspace</div>
          {!isEditingMood && (
            <button
              className="chub-subtab-btn"
              style={{ padding: '2px 8px', fontSize: '0.72rem', height: 'fit-content' }}
              onClick={() => {
                setIsEditingMood(true);
                setMoodDraft(generalMood || `# ${charName} — General Mood\n\n`);
              }}
            >
              ✏️ Edit Mood
            </button>
          )}
        </div>
        {isEditingMood ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <textarea
              className="chub-mood-textarea"
              value={moodDraft}
              onChange={e => setMoodDraft(e.target.value)}
              placeholder="Describe the character's general mood / headspace for this story period..."
              rows={6}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                className="chub-subtab-btn"
                style={{ padding: '4px 10px' }}
                onClick={() => setIsEditingMood(false)}
                disabled={savingMood}
              >
                Cancel
              </button>
              <button
                className="chub-mood-save-btn"
                style={{ padding: '4px 12px' }}
                onClick={saveGeneralMood}
                disabled={savingMood}
              >
                {savingMood ? 'Saving...' : 'Save Mood'}
              </button>
            </div>
          </div>
        ) : (
          <div className="chub-md-panel" style={{ fontSize: '0.82rem', padding: '12px 14px' }}>
            {generalMood ? (
              generalMood
            ) : (
              <em style={{ color: 'var(--text-muted)' }}>No general mood described. Click Edit to add one.</em>
            )}
          </div>
        )}
      </div>

      {/* ── Structured presentation ── */}
      {!presentation ? (
        <div className="chub-state" style={{ minHeight: 160 }}>
          <div className="chub-state-icon">📄</div>
          <div className="chub-state-title">No presentation.json</div>
          <p className="chub-state-hint">
            Expected at <code>global_characters/{charName}/presentation.json</code>
          </p>
        </div>
      ) : (
        <>
          {SECTIONS.map(({ key, label, icon }) => {
            const section = presentation[key as keyof PresentationData];
            if (!section || typeof section !== 'object') return null;
            const isCollapsed = collapsed[key] ?? false;
            const entries = Object.entries(section as Record<string, string>).filter(([, v]) => v);

            return (
              <div key={key} className="chub-pres-section">
                <div
                  className="chub-pres-section-header"
                  onClick={() => toggleSection(key)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && toggleSection(key)}
                >
                  <span className="chub-pres-section-icon">{icon}</span>
                  <span className="chub-pres-section-title">{label}</span>
                  <span className={`chub-pres-chevron ${isCollapsed ? '' : 'open'}`}>▸</span>
                </div>
                {!isCollapsed && (
                  <div className="chub-pres-fields">
                    {entries.map(([field, value]) => {
                      const fieldPath = `${key}.${field}`;
                      const isHighlighted = highlights.highlighted_fields.includes(fieldPath);
                      const isEditing = editingField?.key === key && editingField?.field === field;
                      return (
                        <div
                          key={field}
                          className={`chub-pres-field group ${isHighlighted ? 'highlighted' : ''}`}
                        >
                          <div className="chub-pres-field-header">
                            <span className="chub-pres-field-label">
                              {FIELD_LABELS[field] ?? field.replace(/_/g, ' ')}
                            </span>
                            <div className="chub-action-row">
                              {!isEditing && (
                                <button
                                  className="chub-action-edit"
                                  onClick={() => {
                                    setEditingField({ key, field });
                                    setEditValue(value);
                                  }}
                                  title="Edit field"
                                >
                                  ✏️
                                </button>
                              )}
                              <button
                                className={`chub-highlight-btn ${isHighlighted ? 'active' : ''}`}
                                onClick={() => toggleHighlight(fieldPath)}
                                title={isHighlighted ? 'Remove highlight' : 'Mark as relevant to this comic'}
                              >
                                {isHighlighted ? '⭐' : '☆'}
                              </button>
                            </div>
                          </div>
                          {isEditing ? (
                            <div className="chub-pres-edit-form">
                              <textarea
                                className="chub-pres-edit-textarea"
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                rows={Math.max(2, editValue.split('\n').length)}
                                autoFocus
                              />
                              <div className="chub-pres-edit-actions">
                                <button className="chub-pres-btn-cancel" onClick={() => setEditingField(null)}>Cancel</button>
                                <button className="chub-pres-btn-save" onClick={() => saveField(key, field)}>Save</button>
                              </div>
                            </div>
                          ) : (
                            <p className="chub-pres-field-value">{value}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          
          {/* ── Network & Links ── */}
          <div className="chub-pres-section">
            <div
              className="chub-pres-section-header"
              onClick={() => toggleSection('network')}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && toggleSection('network')}
            >
              <span className="chub-pres-section-icon">🔗</span>
              <span className="chub-pres-section-title">Network & Links</span>
              <span className={`chub-pres-chevron ${collapsed['network'] ? '' : 'open'}`}>▸</span>
            </div>
            {!(collapsed['network'] ?? false) && (
              <div className="chub-pres-fields flex flex-col gap-4">
                {(presentation.network || []).map((link, idx) => {
                  const isEditing = editingNetworkIndex === idx;
                  const currentLink = isEditing && networkDraft ? networkDraft : link;
                  return (
                    <div key={idx} className="bg-background border border-border rounded-lg p-4 relative group">
                      {!isEditing ? (
                        <>
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <span className="font-bold text-foreground text-sm">{currentLink.target_character}</span>
                              <span className="mx-2 opacity-40">•</span>
                              <span className="text-xs uppercase font-bold tracking-wider text-accent-primary">
                                {currentLink.relationship_type}
                              </span>
                              <span className="text-xs text-foreground-muted ml-2">
                                ({currentLink.relationship_subtype})
                              </span>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                              <button 
                                onClick={() => { setEditingNetworkIndex(idx); setNetworkDraft(link); }}
                                className="text-xs hover:text-accent-primary text-foreground-muted transition-colors"
                              >
                                ✏️ Edit
                              </button>
                              <button 
                                onClick={() => {
                                  const newNet = [...(presentation.network || [])];
                                  newNet.splice(idx, 1);
                                  saveNetwork(newNet);
                                }}
                                className="text-xs hover:text-red-500 text-foreground-muted transition-colors"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-foreground-muted mt-1 leading-relaxed">
                            {currentLink.dynamic || <em className="opacity-50">No dynamic described.</em>}
                          </p>
                        </>
                      ) : (
                        <div className="flex flex-col gap-3">
                          <div className="flex gap-3">
                            <div className="flex-1">
                              <label className="text-xs font-bold text-foreground-muted block mb-1">Target Character</label>
                              <input 
                                className="w-full bg-surface border border-border rounded p-2 text-sm text-foreground outline-none focus:border-accent-primary"
                                value={currentLink.target_character}
                                onChange={e => setNetworkDraft({...currentLink, target_character: e.target.value})}
                                placeholder="e.g. Character B"
                              />
                            </div>
                            <div className="w-1/4">
                              <label className="text-xs font-bold text-foreground-muted block mb-1">Type</label>
                              <select 
                                className="w-full bg-surface border border-border rounded p-2 text-sm text-foreground outline-none focus:border-accent-primary"
                                value={currentLink.relationship_type}
                                onChange={e => setNetworkDraft({...currentLink, relationship_type: e.target.value as any})}
                              >
                                <option value="friend">Friend</option>
                                <option value="family">Family</option>
                                <option value="lover">Lover</option>
                              </select>
                            </div>
                            <div className="w-1/3">
                              <label className="text-xs font-bold text-foreground-muted block mb-1">Subtype</label>
                              <input 
                                className="w-full bg-surface border border-border rounded p-2 text-sm text-foreground outline-none focus:border-accent-primary"
                                value={currentLink.relationship_subtype}
                                onChange={e => setNetworkDraft({...currentLink, relationship_subtype: e.target.value})}
                                placeholder="e.g. best, daughter"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-foreground-muted block mb-1">Relationship Dynamic</label>
                            <textarea 
                              className="w-full bg-surface border border-border rounded p-2 text-sm text-foreground outline-none focus:border-accent-primary resize-none"
                              value={currentLink.dynamic}
                              onChange={e => setNetworkDraft({...currentLink, dynamic: e.target.value})}
                              rows={3}
                              placeholder="Describe how they interact, their history, etc."
                            />
                          </div>
                          <div className="flex justify-end gap-2 mt-2">
                            <button 
                              className="px-3 py-1.5 text-xs font-bold text-foreground-muted hover:text-foreground"
                              onClick={() => {
                                setEditingNetworkIndex(null);
                                setNetworkDraft(null);
                                // If this was a new item that hadn't been saved, remove it from draft
                                if (!presentation.network?.[idx]) {
                                  // It wasn't in the original array, meaning we just cancelled a new addition
                                }
                              }}
                            >
                              Cancel
                            </button>
                            <button 
                              className="px-4 py-1.5 text-xs font-bold bg-accent-primary text-white rounded hover:opacity-90"
                              onClick={() => {
                                const newNet = [...(presentation.network || [])];
                                newNet[idx] = currentLink;
                                saveNetwork(newNet);
                              }}
                            >
                              Save Connection
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {editingNetworkIndex === (presentation.network || []).length && networkDraft && (
                  <div className="bg-background border border-border rounded-lg p-4 relative group">
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="text-xs font-bold text-foreground-muted block mb-1">Target Character</label>
                          <input 
                            className="w-full bg-surface border border-border rounded p-2 text-sm text-foreground outline-none focus:border-accent-primary"
                            value={networkDraft.target_character}
                            onChange={e => setNetworkDraft({...networkDraft, target_character: e.target.value})}
                            placeholder="e.g. Character B"
                          />
                        </div>
                        <div className="w-1/4">
                          <label className="text-xs font-bold text-foreground-muted block mb-1">Type</label>
                          <select 
                            className="w-full bg-surface border border-border rounded p-2 text-sm text-foreground outline-none focus:border-accent-primary"
                            value={networkDraft.relationship_type}
                            onChange={e => setNetworkDraft({...networkDraft, relationship_type: e.target.value as any})}
                          >
                            <option value="friend">Friend</option>
                            <option value="family">Family</option>
                            <option value="lover">Lover</option>
                          </select>
                        </div>
                        <div className="w-1/3">
                          <label className="text-xs font-bold text-foreground-muted block mb-1">Subtype</label>
                          <input 
                            className="w-full bg-surface border border-border rounded p-2 text-sm text-foreground outline-none focus:border-accent-primary"
                            value={networkDraft.relationship_subtype}
                            onChange={e => setNetworkDraft({...networkDraft, relationship_subtype: e.target.value})}
                            placeholder="e.g. best, daughter"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-foreground-muted block mb-1">Relationship Dynamic</label>
                        <textarea 
                          className="w-full bg-surface border border-border rounded p-2 text-sm text-foreground outline-none focus:border-accent-primary resize-none"
                          value={networkDraft.dynamic}
                          onChange={e => setNetworkDraft({...networkDraft, dynamic: e.target.value})}
                          rows={3}
                          placeholder="Describe how they interact, their history, etc."
                        />
                      </div>
                      <div className="flex justify-end gap-2 mt-2">
                        <button 
                          className="px-3 py-1.5 text-xs font-bold text-foreground-muted hover:text-foreground"
                          onClick={() => {
                            setEditingNetworkIndex(null);
                            setNetworkDraft(null);
                          }}
                        >
                          Cancel
                        </button>
                        <button 
                          className="px-4 py-1.5 text-xs font-bold bg-accent-primary text-white rounded hover:opacity-90"
                          onClick={() => {
                            const newNet = [...(presentation.network || [])];
                            newNet.push(networkDraft);
                            saveNetwork(newNet);
                          }}
                        >
                          Save Connection
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {editingNetworkIndex === null && (
                  <button 
                    className="mt-2 py-3 border border-dashed border-border rounded-lg text-sm text-accent-primary hover:bg-accent-primary/5 hover:border-accent-primary/50 font-bold flex items-center justify-center gap-2 transition-colors"
                    onClick={addNetworkLink}
                  >
                    <span>+</span> Add Connection
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Lightbox ── */}
      {lightboxSrc && (
        <div
          className="chub-lightbox"
          onClick={() => setLightboxSrc(null)}
          role="dialog"
        >
          <img src={lightboxSrc} alt="Full size" />
          <button className="chub-lightbox-close" onClick={() => setLightboxSrc(null)}>✕</button>
        </div>
      )}
    </>
  );
};

export default OriginalView;
