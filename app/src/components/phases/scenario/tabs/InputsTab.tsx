import React, { useState, useEffect, useMemo } from 'react';
import type { ScenarioInputsData, AnecdoteItem } from '@/types/data';
import { Plus, Trash2, Sparkles } from 'lucide-react';

interface InputsTabProps {
  inputs: ScenarioInputsData | null;
  onSaveInputs: (data: ScenarioInputsData) => void;
  openQa: (type: string, context: string) => void;
}

export const InputsTab: React.FC<InputsTabProps> = ({ inputs, onSaveInputs, openQa }) => {
  const [localInputs, setLocalInputs] = useState<ScenarioInputsData>({ logline: '', themes: [], points: [] });

  // Sync prop inputs to localInputs state
  useEffect(() => {
    if (inputs) {
      setLocalInputs({
        logline: inputs.logline || '',
        themes: inputs.themes || [],
        points: (inputs.points || []).map(p => {
          if (typeof p === 'string') {
            return { text: p, importance: 5 };
          }
          return p;
        })
      });
    }
  }, [inputs]);

  // Compute normalized inputs for dirty checking
  const normalizedInputs = useMemo<ScenarioInputsData>(() => {
    if (!inputs) return { logline: '', themes: [], points: [] };
    return {
      logline: inputs.logline || '',
      themes: inputs.themes || [],
      points: (inputs.points || []).map(p => {
        if (typeof p === 'string') return { text: p, importance: 5 };
        return p;
      })
    };
  }, [inputs]);

  const isDirty = useMemo(() => {
    return JSON.stringify(localInputs) !== JSON.stringify(normalizedInputs);
  }, [localInputs, normalizedInputs]);

  // Normalize themes and points (anecdotes) for rendering from local state
  const themes = localInputs.themes || [];
  const anecdotes = (localInputs.points || []) as AnecdoteItem[];

  // Local state for new entries
  const [newTheme, setNewTheme] = useState('');
  const [newAnecdoteText, setNewAnecdoteText] = useState('');
  const [newAnecdoteImportance, setNewAnecdoteImportance] = useState(5);

  const handleStringChange = (key: keyof ScenarioInputsData, val: string) => {
    setLocalInputs(prev => ({ ...prev, [key]: val }));
  };

  // Theme Handlers
  const handleAddTheme = () => {
    if (!newTheme.trim()) return;
    setLocalInputs(prev => ({
      ...prev,
      themes: [...themes, newTheme.trim()]
    }));
    setNewTheme('');
  };

  const handleUpdateTheme = (index: number, val: string) => {
    setLocalInputs(prev => {
      const updatedThemes = [...themes];
      updatedThemes[index] = val;
      return { ...prev, themes: updatedThemes };
    });
  };

  const handleRemoveTheme = (index: number) => {
    setLocalInputs(prev => ({
      ...prev,
      themes: themes.filter((_, i) => i !== index)
    }));
  };

  // Anecdote Handlers
  const handleAddAnecdote = () => {
    if (!newAnecdoteText.trim()) return;
    setLocalInputs(prev => ({
      ...prev,
      points: [
        ...anecdotes,
        { text: newAnecdoteText.trim(), importance: newAnecdoteImportance }
      ]
    }));
    setNewAnecdoteText('');
    setNewAnecdoteImportance(5);
  };

  const handleUpdateAnecdoteText = (index: number, val: string) => {
    setLocalInputs(prev => {
      const updatedAnecdotes = [...anecdotes];
      updatedAnecdotes[index] = { ...updatedAnecdotes[index], text: val };
      return { ...prev, points: updatedAnecdotes };
    });
  };

  const handleUpdateAnecdoteImportance = (index: number, val: number) => {
    setLocalInputs(prev => {
      const updatedAnecdotes = [...anecdotes];
      updatedAnecdotes[index] = { ...updatedAnecdotes[index], importance: val };
      return { ...prev, points: updatedAnecdotes };
    });
  };

  const handleRemoveAnecdote = (index: number) => {
    setLocalInputs(prev => ({
      ...prev,
      points: anecdotes.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    onSaveInputs(localInputs);
  };

  return (
    <div className="flex flex-col items-center p-6 h-full overflow-y-auto w-full">
      <div className="w-full max-w-4xl flex flex-col gap-6 mt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold font-heading text-foreground">Raw Inputs</h2>
            <p className="text-sm text-foreground-muted mt-1">The brain dump: Logline, themes, and graded anecdotes.</p>
          </div>
          <div className="flex items-center gap-3">
            {isDirty && (
              <button 
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md shadow-sm hover:bg-primary-hover text-sm font-medium transition-all"
                onClick={handleSave}
              >
                💾 Save Inputs
              </button>
            )}
            <button 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md shadow-sm hover:bg-primary-hover text-sm font-medium transition-colors"
              onClick={() => openQa('GENERATE_SIGNATURES', 'Based on inputs, generate personality signatures')}
            >
              Generate Signatures ➔
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* Logline Box */}
          <div className="flex flex-col gap-2 bg-background-panel border border-border p-5 rounded-lg shadow-sm">
            <label className="text-sm font-bold text-foreground">Logline</label>
            <textarea 
              className="w-full bg-background border border-border rounded-md p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-y min-h-[80px]"
              value={localInputs.logline} 
              onChange={e => handleStringChange('logline', e.target.value)} 
              placeholder="A brief summary of the story..."
            />
          </div>

          {/* Themes List Builder */}
          <div className="flex flex-col gap-3 bg-background-panel border border-border p-5 rounded-lg shadow-sm">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <label className="text-sm font-bold text-foreground">Themes</label>
              <span className="text-xs text-foreground-muted">{themes.length} {themes.length === 1 ? 'theme' : 'themes'}</span>
            </div>
            
            {themes.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                {themes.map((theme, index) => (
                  <div key={index} className="flex items-center gap-3 bg-canvas/30 border border-border/40 hover:border-border/80 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 p-2.5 rounded-xl transition-all w-full">
                    <span className="flex-shrink-0 text-xs font-mono font-bold text-muted px-2.5 py-1 bg-surface/50 border border-border/40 rounded-lg select-none">
                      # {index + 1}
                    </span>
                    <input
                      type="text"
                      value={theme}
                      onChange={e => handleUpdateTheme(index, e.target.value)}
                      placeholder="Type a theme..."
                      className="bg-transparent border-none outline-none text-sm text-text-base flex-grow py-1 focus:ring-0"
                    />
                    <button
                      onClick={() => handleRemoveTheme(index)}
                      className="text-muted hover:text-danger hover:bg-danger-dim p-1.5 rounded-lg transition-colors flex-shrink-0"
                      title="Delete theme"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-foreground-muted italic py-2">No themes defined yet. Add one below!</p>
            )}

            {/* Add theme row */}
            <div className="flex gap-2.5 mt-2 w-full">
              <div className="flex-grow flex items-center gap-2 bg-canvas/40 border border-dashed border-border/80 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 rounded-xl px-3 py-2 transition-all">
                <Plus size={16} className="text-muted" />
                <input
                  type="text"
                  value={newTheme}
                  onChange={e => setNewTheme(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      handleAddTheme();
                    }
                  }}
                  placeholder="Add new theme..."
                  className="bg-transparent border-none outline-none text-sm text-text-base w-full focus:ring-0"
                />
              </div>
              <button
                onClick={handleAddTheme}
                disabled={!newTheme.trim()}
                className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 flex items-center gap-1.5"
              >
                <Plus size={14} /> Add
              </button>
            </div>
          </div>

          {/* Anecdotes List Builder */}
          <div className="flex flex-col gap-3 bg-background-panel border border-border p-5 rounded-lg shadow-sm">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <label className="text-sm font-bold text-foreground">Anecdotes / Plot Points</label>
              <span className="text-xs text-foreground-muted">{anecdotes.length} {anecdotes.length === 1 ? 'anecdote' : 'anecdotes'}</span>
            </div>

            {anecdotes.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                {anecdotes.map((anecdote, index) => {
                  const getImportanceColor = (val: number) => {
                    if (val <= 3) return 'bg-success-dim text-success border-success/30';
                    if (val <= 7) return 'bg-warning/15 text-warning border-warning/30';
                    return 'bg-danger-dim text-danger border-danger/30';
                  };

                  return (
                    <div key={index} className="flex items-center gap-3 bg-canvas/30 border border-border/40 hover:border-border/80 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 p-2.5 rounded-xl transition-all w-full">
                      <span className="flex-shrink-0 text-xs font-mono font-bold text-muted px-2.5 py-1 bg-surface/50 border border-border/40 rounded-lg select-none">
                        # {index + 1}
                      </span>
                      
                      {/* Importance Star Selector */}
                      <select
                        value={anecdote.importance}
                        onChange={e => handleUpdateAnecdoteImportance(index, Number(e.target.value))}
                        className={`text-xs font-mono font-bold px-2 py-1 rounded-lg border outline-none cursor-pointer transition-colors ${getImportanceColor(anecdote.importance)}`}
                      >
                        {[...Array(10)].map((_, i) => (
                          <option key={i+1} value={i+1} className="bg-surface text-foreground font-semibold">
                            ★ {i+1}
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        value={anecdote.text}
                        onChange={e => handleUpdateAnecdoteText(index, e.target.value)}
                        placeholder="Type an anecdote/plot point..."
                        className="bg-transparent border-none outline-none text-sm text-text-base flex-grow py-1 focus:ring-0"
                      />
                      
                      <button
                        onClick={() => handleRemoveAnecdote(index)}
                        className="text-muted hover:text-danger hover:bg-danger-dim p-1.5 rounded-lg transition-colors flex-shrink-0"
                        title="Delete anecdote"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-foreground-muted italic py-2">No anecdotes or plot points defined yet. Add one below!</p>
            )}

            {/* Add anecdote row */}
            <div className="flex flex-col sm:flex-row gap-2.5 mt-2 w-full">
              <div className="flex-grow flex items-center gap-2 bg-canvas/40 border border-dashed border-border/80 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 rounded-xl px-3 py-2 transition-all">
                <Sparkles size={16} className="text-muted" />
                <input
                  type="text"
                  value={newAnecdoteText}
                  onChange={e => setNewAnecdoteText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      handleAddAnecdote();
                    }
                  }}
                  placeholder="Add new anecdote / plot point..."
                  className="bg-transparent border-none outline-none text-sm text-text-base w-full focus:ring-0"
                />
              </div>
              
              <div className="flex gap-2 justify-between sm:justify-start items-center">
                {/* Importance Selector for New Anecdote */}
                <div className="flex items-center gap-1.5 bg-canvas/40 border border-border/80 rounded-xl px-3 py-2">
                  <span className="text-xs text-foreground-muted select-none">Imp:</span>
                  <select
                    value={newAnecdoteImportance}
                    onChange={e => setNewAnecdoteImportance(Number(e.target.value))}
                    className="text-xs font-mono font-bold bg-transparent outline-none cursor-pointer text-text-base focus:ring-0"
                  >
                    {[...Array(10)].map((_, i) => (
                      <option key={i+1} value={i+1} className="bg-surface text-foreground font-semibold">
                        ★ {i+1}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleAddAnecdote}
                  disabled={!newAnecdoteText.trim()}
                  className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


