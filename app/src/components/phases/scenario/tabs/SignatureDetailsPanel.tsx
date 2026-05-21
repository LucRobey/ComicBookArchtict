import React, { useState, useEffect } from 'react';
import type { CharacterSignature } from '@/types/data';

interface SignatureDetailsPanelProps {
  activeChar: string;
  activeSig: CharacterSignature;
  onClose?: () => void;
  onSave: (char: string, updatedSig: CharacterSignature) => void;
}

export const SignatureDetailsPanel: React.FC<SignatureDetailsPanelProps> = ({
  activeChar,
  activeSig,
  onClose,
  onSave,
}) => {
  const [localSig, setLocalSig] = useState<CharacterSignature>(activeSig);
  const [editingNetworkIndex, setEditingNetworkIndex] = useState<number | null>(null);
  const [networkDraft, setNetworkDraft] = useState<any | null>(null);

  useEffect(() => {
    setLocalSig(activeSig);
    setEditingNetworkIndex(null);
    setNetworkDraft(null);
  }, [activeSig, activeChar]);

  const isDirty = JSON.stringify(localSig) !== JSON.stringify(activeSig);

  const handleFieldChange = (field: string, val: string | string[]) => {
    setLocalSig(prev => ({ ...prev, [field]: val }));
  };

  const handleRelationshipChange = (otherChar: string, val: string) => {
    setLocalSig(prev => ({
      ...prev,
      relationships: {
        ...(prev.relationships || {}),
        [otherChar]: val,
      },
    }));
  };

  return (
    <div
      className="flex flex-col gap-6 bg-surface border border-border rounded-xl shadow-md animate-in fade-in slide-in-from-bottom-4 duration-300 box-border w-full text-left"
      style={{ padding: '2.5rem 3.5rem' }}
    >
      <div className="flex items-center justify-between border-b border-border pb-4">
        <h3 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <span className="text-accent-primary text-xl">✦</span>
          {activeChar} <span className="opacity-40 font-normal">Details</span>
        </h3>
        <div className="flex items-center gap-3">
          {isDirty && (
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md shadow-sm hover:bg-primary-hover text-sm font-medium transition-all flex items-center gap-1.5"
              onClick={() => onSave(activeChar, localSig)}
            >
              💾 Save Details
            </button>
          )}
          {onClose && (
            <button
              className="text-foreground-muted hover:text-foreground p-1 transition-colors text-lg"
              onClick={onClose}
              title="Close details"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider">Age</label>
          <input className="bg-background text-foreground border border-border rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand outline-none transition-all font-medium" value={localSig.age || ''} onChange={e => handleFieldChange('age', e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider">Gender</label>
          <input className="bg-background text-foreground border border-border rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand outline-none transition-all font-medium" value={localSig.gender || ''} onChange={e => handleFieldChange('gender', e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider">Role</label>
          <input className="bg-background text-foreground border border-border rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand outline-none transition-all font-medium" value={localSig.role || ''} onChange={e => handleFieldChange('role', e.target.value)} />
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-2">
        <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider">General Personality</label>
        <textarea className="w-full bg-background text-foreground border border-border rounded-lg p-4 text-sm focus:ring-2 focus:ring-brand outline-none resize-y min-h-[100px] transition-all leading-relaxed" value={localSig.general_personality || ''} onChange={e => handleFieldChange('general_personality', e.target.value)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-1.5">
            <span className="text-sm">❤️</span> Loves (one per line)
          </label>
          <textarea className="w-full bg-background text-foreground border border-border rounded-lg p-4 text-sm focus:ring-2 focus:ring-brand outline-none resize-y min-h-[120px] transition-all leading-relaxed" value={(localSig.loves || []).join('\n')} onChange={e => handleFieldChange('loves', e.target.value.split('\n'))} />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-1.5">
            <span className="text-sm">💔</span> Hates (one per line)
          </label>
          <textarea className="w-full bg-background text-foreground border border-border rounded-lg p-4 text-sm focus:ring-2 focus:ring-brand outline-none resize-y min-h-[120px] transition-all leading-relaxed" value={(localSig.hates || []).join('\n')} onChange={e => handleFieldChange('hates', e.target.value.split('\n'))} />
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-2">
        <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider">Verbal Habits</label>
        <textarea className="w-full bg-background text-foreground border border-border rounded-lg p-4 text-sm focus:ring-2 focus:ring-brand outline-none resize-y min-h-[100px] transition-all leading-relaxed" value={localSig.verbal_habits || ''} onChange={e => handleFieldChange('verbal_habits', e.target.value)} />
      </div>

      <div className="flex flex-col gap-2 mt-2">
        <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider">Notes for Agent</label>
        <textarea className="w-full bg-background text-foreground border border-border rounded-lg p-4 text-sm focus:ring-2 focus:ring-brand outline-none resize-y min-h-[100px] transition-all leading-relaxed" value={localSig.writing_notes || ''} onChange={e => handleFieldChange('writing_notes', e.target.value)} />
      </div>

      {localSig.relationships && Object.keys(localSig.relationships).length > 0 && (
        <div className="flex flex-col gap-4 mt-4 pt-6 border-t border-border">
          <label className="text-sm font-bold text-foreground flex items-center gap-2">
            <span className="text-accent-primary">🔗</span> Legacy Relationships
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {Object.entries(localSig.relationships).map(([otherChar, relation]) => (
              <div key={otherChar} className="flex flex-col gap-2 bg-background p-4 rounded-lg border border-border shadow-sm">
                <span className="text-xs font-bold text-accent-primary uppercase tracking-wider border-b border-border pb-2">{otherChar}</span>
                <textarea
                  className="bg-transparent text-foreground border-none p-0 text-sm focus:ring-0 outline-none transition-all resize-y min-h-[60px]"
                  value={relation}
                  onChange={e => handleRelationshipChange(otherChar, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Network & Links */}
      <div className="flex flex-col gap-4 mt-4 pt-6 border-t border-border">
        <label className="text-sm font-bold text-foreground flex items-center gap-2">
          <span className="text-accent-primary">🔗</span> Network & Links
        </label>
        <div className="flex flex-col gap-4">
          {(localSig.network || []).map((link, idx) => {
            const isEditing = editingNetworkIndex === idx;
            const currentLink = isEditing && networkDraft ? networkDraft : link;
            return (
              <div key={idx} className="bg-background border border-border rounded-lg p-4 relative group shadow-sm">
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
                            const newNet = [...(localSig.network || [])];
                            newNet.splice(idx, 1);
                            handleFieldChange('network', newNet as any);
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
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className="px-4 py-1.5 text-xs font-bold bg-accent-primary text-white rounded hover:opacity-90"
                        onClick={() => {
                          const newNet = [...(localSig.network || [])];
                          newNet[idx] = currentLink;
                          handleFieldChange('network', newNet as any);
                          setEditingNetworkIndex(null);
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

          {editingNetworkIndex === (localSig.network || []).length && networkDraft && (
            <div className="bg-background border border-border rounded-lg p-4 relative group shadow-sm">
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
                      const newNet = [...(localSig.network || [])];
                      newNet.push(networkDraft);
                      handleFieldChange('network', newNet as any);
                      setEditingNetworkIndex(null);
                      setNetworkDraft(null);
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
              onClick={() => {
                setEditingNetworkIndex((localSig.network || []).length);
                setNetworkDraft({
                  target_character: '',
                  relationship_type: 'friend',
                  relationship_subtype: '',
                  dynamic: '',
                });
              }}
            >
              <span>+</span> Add Connection
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
