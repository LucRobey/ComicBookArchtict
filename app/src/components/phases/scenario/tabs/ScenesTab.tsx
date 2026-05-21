import React, { useState } from 'react';
import type { ScenarioScenesData, ScenarioChaptersData, Scene, SceneCharacterManifest } from '@/types/data';
import { 
  ArrowLeft, Edit, Plus, Trash2, Save, X, Film, MapPin, Users, Sun, Sparkles, MessageSquare, Activity, ArrowRight, Flag
} from 'lucide-react';

interface ScenesTabProps {
  scenes: ScenarioScenesData | null;
  chapters: ScenarioChaptersData | null;
  onSave?: (newData: ScenarioScenesData) => Promise<boolean>;
  openQa: (type: string, context: string) => void;
}

export const ScenesTab: React.FC<ScenesTabProps> = ({ scenes, chapters, onSave, openQa }) => {
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);
  const [editingScene, setEditingScene] = useState<Scene | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [editTitle, setEditTitle] = useState('');
  const [editLocationId, setEditLocationId] = useState('');
  const [editVariantId, setEditVariantId] = useState('');
  const [editLocationName, setEditLocationName] = useState('');
  const [editLocationStyle, setEditLocationStyle] = useState('');
  const [editTimeOfDay, setEditTimeOfDay] = useState('');
  const [editLighting, setEditLighting] = useState('');
  const [editAtmosphere, setEditAtmosphere] = useState('');
  const [editEmotionalBeat, setEditEmotionalBeat] = useState('');
  const [editCameraShot, setEditCameraShot] = useState('');
  const [editCoreAction, setEditCoreAction] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editAnecdotes, setEditAnecdotes] = useState<string[]>([]);
  const [editManifest, setEditManifest] = useState<SceneCharacterManifest[]>([]);

  // New character field temp state
  const [newCharId, setNewCharId] = useState('');
  const [newCharCostume, setNewCharCostume] = useState('');

  // New anecdote field temp state
  const [newAnecdote, setNewAnecdote] = useState('');

  const startEdit = (scene: Scene) => {
    setEditingScene(scene);
    setEditTitle(scene.title || '');
    setEditLocationId(scene.location_id || '');
    setEditVariantId(scene.variant_id || '');
    setEditLocationName(scene.location_master?.name || scene.location || '');
    setEditLocationStyle(scene.location_master?.visual_style_modifiers || '');
    setEditTimeOfDay(scene.scene_world_state?.time_of_day || '');
    setEditLighting(scene.scene_world_state?.environmental_lighting || '');
    setEditAtmosphere(scene.scene_world_state?.atmospheric_effects || '');
    setEditEmotionalBeat(scene.emotional_beat || '');
    setEditCameraShot(scene.camera_shot || '');
    setEditCoreAction(scene.core_action || '');
    setEditSummary(scene.summary || '');
    setEditAnecdotes(scene.anecdotes || []);
    setEditManifest(scene.character_manifest || []);
    setNewCharId('');
    setNewCharCostume('');
    setNewAnecdote('');
  };

  const handleSaveScene = async () => {
    if (!scenes || !editingScene || !onSave) return;
    setIsSaving(true);
    try {
      // Sync character manifest names back to legacy characters_present array
      const charactersPresent = editManifest
        .map(m => m.character_id.trim())
        .filter(c => c.length > 0);

      const updatedScenes = scenes.scenes.map(s => {
        if (s.scene_id === editingScene.scene_id) {
          return {
            ...s,
            title: editTitle.trim(),
            location_id: editLocationId.trim(),
            variant_id: editVariantId.trim(),
            // Sync new format
            location_master: {
              name: editLocationName.trim(),
              visual_style_modifiers: editLocationStyle.trim(),
            },
            scene_world_state: {
              time_of_day: editTimeOfDay.trim(),
              environmental_lighting: editLighting.trim(),
              atmospheric_effects: editAtmosphere.trim(),
            },
            character_manifest: editManifest,
            // Sync legacy format for backward compatibility
            location: editLocationName.trim(),
            characters_present: charactersPresent,
            // Narrative fields
            emotional_beat: editEmotionalBeat.trim(),
            camera_shot: editCameraShot.trim(),
            core_action: editCoreAction.trim(),
            summary: editSummary.trim(),
            anecdotes: editAnecdotes.filter(a => a.trim().length > 0),
          };
        }
        return s;
      });

      const success = await onSave({ scenes: updatedScenes });
      if (success) {
        setEditingScene(null);
      } else {
        alert('Failed to save scene.');
      }
    } catch (err: any) {
      alert(`Error saving scene: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Anecdote helpers
  const addAnecdote = () => {
    if (newAnecdote.trim()) {
      setEditAnecdotes([...editAnecdotes, newAnecdote.trim()]);
      setNewAnecdote('');
    }
  };

  const removeAnecdote = (index: number) => {
    setEditAnecdotes(editAnecdotes.filter((_, i) => i !== index));
  };

  const updateAnecdoteVal = (index: number, val: string) => {
    const updated = [...editAnecdotes];
    updated[index] = val;
    setEditAnecdotes(updated);
  };

  // Manifest helpers
  const addManifestChar = () => {
    if (newCharId.trim()) {
      setEditManifest([
        ...editManifest,
        {
          character_id: newCharId.trim(),
          costume_and_appearance_variant: newCharCostume.trim()
        }
      ]);
      setNewCharId('');
      setNewCharCostume('');
    }
  };

  const removeManifestChar = (index: number) => {
    setEditManifest(editManifest.filter((_, i) => i !== index));
  };

  const updateManifestVal = (index: number, field: keyof SceneCharacterManifest, val: string) => {
    const updated = [...editManifest];
    updated[index] = {
      ...updated[index],
      [field]: val
    };
    setEditManifest(updated);
  };

  // Filter scenes based on chapter selection
  const getScenesForChapter = (chapterId: number) => {
    if (!scenes?.scenes) return [];
    return scenes.scenes.filter(s => s.chapter_id === chapterId);
  };

  if (!scenes?.scenes || scenes.scenes.length === 0) {
    return (
      <div className="relative flex flex-col items-center justify-center h-full p-12 text-center gap-6 bg-canvas overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative p-6 rounded-full bg-primary/10 border border-primary/20 shadow-xl animate-bounce">
          <Film className="w-12 h-12 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-extrabold text-foreground font-heading tracking-tight">No Scenes Generated</h3>
          <p className="text-sm text-foreground-muted max-w-md mx-auto leading-relaxed">
            No scenes found. You must generate them based on the Chapters to build your screenplay breakdown.
          </p>
        </div>
        <button 
          className="relative px-6 py-3 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-hover hover:to-indigo-750 text-white font-semibold rounded-xl shadow-lg hover:shadow-primary/35 hover:scale-[1.03] transition-all duration-300 text-sm flex items-center gap-2"
          onClick={() => openQa('GENERATE_SCENES', 'Based on chapters, generate scenes')}
        >
          <span>Generate Scenes</span>
          <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  // Soft gradient presets for chapters to give a premium feel
  const gradientPresets = [
    'from-indigo-500 to-purple-600',
    'from-violet-500 to-fuchsia-600',
    'from-blue-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-rose-500 to-pink-600',
  ];

  // Group views: Grid of Chapters or Detailed Scene view
  if (selectedChapterId === null) {
    const defaultChapters = chapters?.chapters || [];

    return (
      <div className="relative flex flex-col h-full overflow-y-auto bg-canvas p-8">
        {/* Decorative top background glow */}
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-4xl mx-auto w-full flex flex-col gap-8 relative">
          {/* Centered Header Panel */}
          <div className="relative flex flex-col items-center text-center border-b border-border/60 pb-6 gap-4 w-full">
            <h2 className="text-3xl font-extrabold font-heading text-foreground tracking-tight flex items-center gap-3 justify-center">
              <span className="p-2 bg-primary/10 rounded-xl text-primary ring-1 ring-primary/20">
                <Film size={24} />
              </span>
              <span>Scenes <span className="text-foreground-muted font-normal text-xl font-sans">Breakdown</span></span>
            </h2>
            <p className="text-sm text-foreground-muted max-w-xl">
              Select a chapter below to view and edit its granular scene structures, lighting masters, and locations.
            </p>
          </div>

          {/* Grid of Chapter cards (Centered contents, p-10 md:p-12) */}
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 w-full">
            {defaultChapters.length > 0 ? (
              defaultChapters.map(c => {
                const chScenes = getScenesForChapter(c.chapter_id);
                const cardGradient = gradientPresets[c.chapter_id % gradientPresets.length];
                return (
                  <div 
                    key={c.chapter_id}
                    onClick={() => setSelectedChapterId(c.chapter_id)}
                    className="bg-surface/40 backdrop-blur-md border border-border/60 hover:border-primary/30 rounded-2xl p-10 md:p-12 shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col items-center justify-between text-center group relative overflow-hidden"
                  >
                    <div className={`absolute top-0 left-0 bottom-0 w-[4px] bg-gradient-to-b ${cardGradient} opacity-60 group-hover:opacity-100 transition-opacity duration-300`} />
                    
                    <div className="flex flex-col items-center gap-4 w-full">
                      <div className="flex items-center justify-center gap-3">
                        <span className={`inline-flex items-center justify-center font-mono font-bold text-[10px] bg-gradient-to-r ${cardGradient} text-white px-2.5 py-0.5 rounded-md shadow-sm`}>
                          CHAPTER {c.chapter_id}
                        </span>
                        <span className="text-[10px] font-bold text-foreground-muted bg-canvas border border-border/80 px-2.5 py-0.5 rounded-lg font-mono shadow-sm">
                          {chScenes.length} {chScenes.length === 1 ? 'scene' : 'scenes'}
                        </span>
                      </div>

                      <h3 className="text-xl font-extrabold text-foreground font-heading group-hover:text-primary transition-colors duration-200">
                        {c.title}
                      </h3>
                      <p className="text-sm text-foreground-muted line-clamp-3 leading-relaxed max-w-sm">
                        {c.summary}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-primary font-bold mt-6 justify-center group-hover:scale-105 transition-all duration-300">
                      <span>Explore Scenes</span>
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5 animate-pulse" />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 text-center p-12 bg-surface/40 backdrop-blur-md border border-border/65 rounded-2xl flex flex-col items-center">
                <p className="text-foreground-muted text-sm leading-relaxed">No chapters list found. Grouping scenes by IDs instead.</p>
                <div className="flex flex-wrap justify-center gap-3 mt-5">
                  {Array.from(new Set(scenes.scenes.map(s => s.chapter_id).filter(Boolean))).map(chId => (
                    <button
                      key={chId}
                      onClick={() => setSelectedChapterId(Number(chId))}
                      className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-semibold shadow-md shadow-primary/20 hover:scale-[1.02] transition-all duration-200"
                    >
                      View Chapter {chId} Scenes
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Display scene list for selected chapter
  const currentChapter = chapters?.chapters.find(c => c.chapter_id === selectedChapterId);
  const activeScenes = getScenesForChapter(selectedChapterId);

  return (
    <div className="flex flex-col h-full bg-canvas relative overflow-hidden">
      {/* Decorative top background glow */}
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

      {/* Chapter header panel (Centered) */}
      <div className="relative border-b border-border/60 bg-surface-raised/40 backdrop-blur-md flex-shrink-0 py-8 px-6">
        <div className="max-w-3xl mx-auto w-full flex flex-col gap-4">
          <button
            onClick={() => setSelectedChapterId(null)}
            className="flex items-center gap-2 px-3.5 py-2 bg-surface/50 hover:bg-surface hover:text-primary text-xs font-semibold text-foreground-muted rounded-xl border border-border/80 shadow-sm transition-all hover:scale-[1.02] mb-1 self-center font-mono"
          >
            <ArrowLeft size={13} />
            <span>BACK TO CHAPTERS</span>
          </button>

          <div className="flex flex-col items-center text-center gap-4">
            <h2 className="text-3xl font-extrabold font-heading text-foreground tracking-tight flex items-center gap-3 justify-center">
              <span className={`inline-flex items-center justify-center font-mono font-bold text-xs bg-gradient-to-r ${gradientPresets[selectedChapterId % gradientPresets.length]} text-white px-3 py-1 rounded-lg shadow-sm`}>
                CH {selectedChapterId}
              </span>
              <span>{currentChapter?.title || 'Scenes'}</span>
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed max-w-2xl">
              {currentChapter?.summary}
            </p>

            <button 
              className="px-4 py-2 bg-surface hover:bg-border text-foreground hover:text-rose-500 border border-border/80 rounded-xl shadow-sm text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 hover:scale-[1.02] whitespace-nowrap"
              onClick={() => openQa('REWRITE_SCENES_IN_CHAPTER', `Rewrite scenes for Chapter ${selectedChapterId}`)}
            >
              <Flag size={13} className="text-rose-500" />
              <span>Flag Chapter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable scene cards (Spacious & Centered) */}
      <div className="flex-grow overflow-y-auto p-8">
        <div className="max-w-3xl mx-auto w-full flex flex-col gap-8">
          {activeScenes.length > 0 ? (
            activeScenes.map(scene => {
              const cardGradient = gradientPresets[scene.scene_id % gradientPresets.length];
              return (
                <div 
                  key={scene.scene_id} 
                  className="relative bg-surface/40 backdrop-blur-md border border-border/60 rounded-2xl p-10 md:p-12 shadow-sm flex flex-col items-center text-center gap-6 group overflow-hidden transition-all duration-300 hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-primary/5 w-full"
                >
                  {/* Premium Left Accent Border */}
                  <div className={`absolute top-0 left-0 bottom-0 w-[4px] bg-gradient-to-b ${cardGradient} opacity-60 group-hover:opacity-100 transition-opacity duration-300`} />

                  {/* Scene Number and Title Header */}
                  <div className="flex flex-col items-center gap-3 border-b border-border/50 pb-4 w-full">
                    <span className={`bg-gradient-to-r ${cardGradient} text-white font-mono px-3 py-1 rounded-lg text-xs font-bold shadow-sm shadow-black/10`}>
                      Scene {scene.scene_id}
                    </span>
                    <span className="text-2xl font-extrabold text-foreground font-heading">{scene.title}</span>
                  </div>

                  {/* Core Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                    {/* Visual Settings and Location */}
                    <div className="flex flex-col items-center text-center gap-3.5 bg-canvas/50 border border-border/40 backdrop-blur-sm rounded-xl p-6 shadow-inner">
                      <span className="text-[10px] font-bold text-primary font-heading uppercase tracking-wider flex items-center gap-2">
                        <span className="p-1 bg-primary/10 rounded-md text-primary"><MapPin size={12} /></span>
                        Location Sheets & Styling
                      </span>
                      
                      <div className="flex flex-col items-center gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-foreground-muted font-bold text-[10px] uppercase">Location:</span>
                          <span className="text-foreground font-bold">{scene.location_master?.name || scene.location || 'Not Specified'}</span>
                        </div>
                        {scene.location_id && (
                          <div className="flex items-center gap-2">
                            <span className="text-foreground-muted font-bold text-[10px] uppercase">Loc ID:</span>
                            <span className="font-mono text-xs bg-canvas border border-border/80 px-2 py-0.5 rounded-md text-foreground-muted shadow-sm">
                              {scene.location_id} {scene.variant_id ? `[${scene.variant_id}]` : ''}
                            </span>
                          </div>
                        )}
                        {scene.location_master?.visual_style_modifiers && (
                          <div className="mt-1 flex flex-col items-center">
                            <span className="text-foreground-muted font-bold text-[10px] uppercase block mb-1">Modifiers:</span>
                            <p className="text-xs text-foreground-muted leading-relaxed italic bg-canvas/70 border border-border/40 p-2.5 rounded-lg max-w-xs">
                              {scene.location_master.visual_style_modifiers}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Lighting and World State */}
                    <div className="flex flex-col items-center text-center gap-3.5 bg-canvas/50 border border-border/40 backdrop-blur-sm rounded-xl p-6 shadow-inner">
                      <span className="text-[10px] font-bold text-amber-500 font-heading uppercase tracking-wider flex items-center gap-2">
                        <span className="p-1 bg-amber-500/10 rounded-md text-amber-500"><Sun size={12} /></span>
                        Lighting & World State
                      </span>
                      
                      <div className="flex flex-col items-center gap-2 text-sm">
                        {scene.scene_world_state?.time_of_day && (
                          <div className="flex items-center gap-2">
                            <span className="text-foreground-muted font-bold text-[10px] uppercase">Time:</span>
                            <span className="text-foreground font-semibold">{scene.scene_world_state.time_of_day}</span>
                          </div>
                        )}
                        {scene.scene_world_state?.environmental_lighting && (
                          <div className="flex flex-col items-center">
                            <span className="text-foreground-muted font-bold text-[10px] uppercase block mb-0.5">Lighting:</span>
                            <span className="text-foreground text-xs leading-relaxed max-w-xs">{scene.scene_world_state.environmental_lighting}</span>
                          </div>
                        )}
                        {scene.scene_world_state?.atmospheric_effects && (
                          <div className="flex flex-col items-center">
                            <span className="text-foreground-muted font-bold text-[10px] uppercase block mb-0.5">Atmosphere:</span>
                            <span className="text-foreground text-xs leading-relaxed max-w-xs">{scene.scene_world_state.atmospheric_effects}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Characters Present and Manifest */}
                  <div className="flex flex-col items-center text-center gap-3 bg-canvas/30 border border-border/40 backdrop-blur-sm p-6 rounded-xl w-full">
                    <span className="text-[10px] font-bold text-foreground font-heading uppercase tracking-wider flex items-center gap-2">
                      <span className="p-1 bg-secondary/85 rounded-md text-foreground-muted"><Users size={12} /></span>
                      Character Costume Manifest
                    </span>
                    
                    {scene.character_manifest && scene.character_manifest.length > 0 ? (
                      <div className="flex flex-col gap-2.5 w-full max-w-md">
                        {scene.character_manifest.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-center gap-2.5 bg-canvas/60 border border-border/30 p-2.5 rounded-xl hover:border-primary/20 transition-colors">
                            <span className="font-mono text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-md shadow-sm">
                              {item.character_id}
                            </span>
                            <span className="text-xs text-foreground/85 leading-normal font-sans">
                              {item.costume_and_appearance_variant || 'Default Costume'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-foreground-muted italic bg-canvas/40 border border-border/30 p-2.5 rounded-xl flex items-center justify-center gap-1.5 w-full max-w-md">
                        <Users size={12} className="text-primary/70" />
                        <span>Characters present: {scene.characters_present?.join(', ') || 'None'}</span>
                      </div>
                    )}
                  </div>

                  {/* Cinematic Framing and Action Block */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border border-border/40 bg-secondary/10 p-6 rounded-xl text-sm w-full">
                    <div className="flex flex-col items-center text-center gap-1.5">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 font-heading">
                        <Activity size={12} /> Core Action
                      </span>
                      <span className="text-foreground font-semibold leading-relaxed max-w-xs">{scene.core_action}</span>
                    </div>
                    <div className="flex flex-col items-center text-center gap-1.5">
                      <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-1.5 font-heading">
                        <Film size={12} /> Camera Shot
                      </span>
                      <span className="text-foreground-muted italic leading-relaxed max-w-xs">{scene.camera_shot}</span>
                    </div>
                  </div>

                  {/* Emotional Beat and Narrative Summary */}
                  <div className="flex flex-col items-center text-center gap-2.5 w-full">
                    <div className="flex items-center gap-2 text-sm font-bold text-foreground font-heading justify-center">
                      <Sparkles size={14} className="text-amber-500 animate-pulse" />
                      <span>Beat: {scene.emotional_beat}</span>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap mt-1 font-sans max-w-2xl">
                      {scene.summary}
                    </p>
                  </div>

                  {/* Childhood Anecdotes */}
                  {scene.anecdotes && scene.anecdotes.length > 0 && (
                    <div className="flex flex-col items-center text-center gap-3 mt-1 bg-amber-500/5 border border-amber-500/10 p-6 rounded-xl shadow-inner w-full">
                      <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-2 font-heading">
                        <span className="p-1 bg-amber-500/10 rounded-md text-amber-500"><MessageSquare size={12} /></span>
                        Childhood Anecdotes Included
                      </span>
                      <ul className="list-none flex flex-col gap-2 text-xs text-foreground-muted leading-relaxed max-w-md">
                        {scene.anecdotes.map((anecdote, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="text-primary">•</span>
                            <span>{anecdote}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Center-aligned Edit & Flag buttons */}
                  <div className="flex items-center justify-center gap-3 mt-2 w-full">
                    <button 
                      className="px-4 py-2 bg-surface hover:bg-border text-foreground border border-border/80 rounded-xl shadow-sm text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 hover:scale-[1.02]"
                      onClick={() => startEdit(scene)}
                    >
                      <Edit size={13} className="text-foreground-muted" />
                      <span>Edit Details</span>
                    </button>
                    <button 
                      className="px-4 py-2 bg-surface hover:bg-border text-foreground border border-border/80 rounded-xl shadow-sm text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 hover:scale-[1.02]"
                      onClick={() => openQa('REWRITE_SCENE', `Rewrite Scene ${scene.scene_id}`)}
                    >
                      <Flag size={13} className="text-rose-500" />
                      <span>Rewrite</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center p-12 border border-border border-dashed rounded-xl w-full">
              <p className="text-foreground-muted text-sm">No scenes found for this chapter.</p>
            </div>
          )}
        </div>
      </div>

      {/* Editor Drawer Modal Overlay */}
      {editingScene && (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-[580px] h-full bg-surface-raised/95 backdrop-blur-lg border-l border-border/80 flex flex-col shadow-2xl relative animate-in slide-in-from-right duration-250">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border/60 bg-secondary/50">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-wider">EDITING DETAILS</span>
                <h3 className="font-bold text-foreground font-heading text-lg">
                  Scene {editingScene.scene_id}: {editingScene.title || 'Untitled'}
                </h3>
              </div>
              <button 
                onClick={() => setEditingScene(null)}
                disabled={isSaving}
                className="text-foreground-muted hover:text-foreground hover:bg-secondary p-1.5 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Fields (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {/* General Narrative section */}
              <div className="flex flex-col gap-4">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-primary border-b border-border/60 pb-2 font-heading">
                  1. General Narrative & Beat
                </h4>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    className="w-full bg-canvas/80 border border-border/80 rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Emotional Beat</label>
                  <input
                    type="text"
                    value={editEmotionalBeat}
                    onChange={e => setEditEmotionalBeat(e.target.value)}
                    className="w-full bg-canvas/80 border border-border/80 rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Core Action</label>
                  <input
                    type="text"
                    value={editCoreAction}
                    onChange={e => setEditCoreAction(e.target.value)}
                    className="w-full bg-canvas/80 border border-border/80 rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Camera Shot / Angle</label>
                  <input
                    type="text"
                    value={editCameraShot}
                    onChange={e => setEditCameraShot(e.target.value)}
                    className="w-full bg-canvas/80 border border-border/80 rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Scene Summary</label>
                  <textarea
                    value={editSummary}
                    onChange={e => setEditSummary(e.target.value)}
                    rows={3}
                    className="w-full bg-canvas/80 border border-border/80 rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-y"
                  />
                </div>
              </div>

              {/* Location & World state section */}
              <div className="flex flex-col gap-4">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-primary border-b border-border/60 pb-2 font-heading">
                  2. Location Sheets & Lighting Master
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Location Name</label>
                    <input
                      type="text"
                      value={editLocationName}
                      onChange={e => setEditLocationName(e.target.value)}
                      className="w-full bg-canvas/80 border border-border/80 rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Location ID (ref)</label>
                    <input
                      type="text"
                      value={editLocationId}
                      onChange={e => setEditLocationId(e.target.value)}
                      placeholder="e.g. loc_adele_kitchen"
                      className="w-full bg-canvas/80 border border-border/80 rounded-xl px-3.5 py-2.5 text-sm font-mono text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Variant ID (ref)</label>
                    <input
                      type="text"
                      value={editVariantId}
                      onChange={e => setEditVariantId(e.target.value)}
                      placeholder="e.g. var_adele_kitchen_night"
                      className="w-full bg-canvas/80 border border-border/80 rounded-xl px-3.5 py-2.5 text-sm font-mono text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Time of Day</label>
                    <input
                      type="text"
                      value={editTimeOfDay}
                      onChange={e => setEditTimeOfDay(e.target.value)}
                      className="w-full bg-canvas/80 border border-border/80 rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Visual Style Modifiers</label>
                  <textarea
                    value={editLocationStyle}
                    onChange={e => setEditLocationStyle(e.target.value)}
                    rows={2}
                    className="w-full bg-canvas/80 border border-border/80 rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-y"
                    placeholder="Style sheets details..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Environmental Lighting</label>
                    <input
                      type="text"
                      value={editLighting}
                      onChange={e => setEditLighting(e.target.value)}
                      className="w-full bg-canvas/80 border border-border/80 rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Atmospheric Effects</label>
                    <input
                      type="text"
                      value={editAtmosphere}
                      onChange={e => setEditAtmosphere(e.target.value)}
                      className="w-full bg-canvas/80 border border-border/80 rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Character Costume Manifest section */}
              <div className="flex flex-col gap-4">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-primary border-b border-border/60 pb-2 font-heading">
                  3. Characters & Costume Variants
                </h4>

                <div className="flex flex-col gap-2.5">
                  {editManifest.map((item, index) => (
                    <div key={index} className="flex gap-2.5 items-center bg-canvas/40 border border-border/80 p-3 rounded-xl">
                      <input
                        type="text"
                        value={item.character_id}
                        onChange={e => updateManifestVal(index, 'character_id', e.target.value)}
                        placeholder="Character ID"
                        className="bg-canvas border border-border/80 rounded-lg px-2 py-1.5 text-xs font-mono text-foreground focus:ring-2 focus:ring-primary outline-none w-28"
                      />
                      <input
                        type="text"
                        value={item.costume_and_appearance_variant}
                        onChange={e => updateManifestVal(index, 'costume_and_appearance_variant', e.target.value)}
                        placeholder="Costume & appearance details"
                        className="bg-canvas border border-border/80 rounded-lg px-2 py-1.5 text-xs text-foreground focus:ring-2 focus:ring-primary outline-none flex-grow"
                      />
                      <button
                        onClick={() => removeManifestChar(index)}
                        className="text-danger hover:bg-danger-dim p-2 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add character block */}
                <div className="flex gap-2.5 items-center mt-1.5 border border-dashed border-border/80 p-3 rounded-xl bg-canvas/40 hover:bg-canvas/60 transition-colors">
                  <input
                    type="text"
                    value={newCharId}
                    onChange={e => setNewCharId(e.target.value)}
                    placeholder="New Char ID"
                    className="bg-canvas border border-border/80 rounded-lg px-2 py-1.5 text-xs font-mono text-foreground focus:ring-2 focus:ring-primary outline-none w-28"
                  />
                  <input
                    type="text"
                    value={newCharCostume}
                    onChange={e => setNewCharCostume(e.target.value)}
                    placeholder="Costume styling"
                    className="bg-canvas border border-border/80 rounded-lg px-2 py-1.5 text-xs text-foreground focus:ring-2 focus:ring-primary outline-none flex-grow"
                  />
                  <button
                    onClick={addManifestChar}
                    disabled={!newCharId.trim()}
                    className="px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center gap-1 hover:scale-[1.02]"
                  >
                    <Plus size={12} /> Add
                  </button>
                </div>
              </div>

              {/* Childhood Anecdotes section */}
              <div className="flex flex-col gap-4">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-primary border-b border-border/60 pb-2 font-heading">
                  4. Childhood Anecdotes
                </h4>

                <div className="flex flex-col gap-2.5">
                  {editAnecdotes.map((item, index) => (
                    <div key={index} className="flex gap-2.5 items-center">
                      <input
                        type="text"
                        value={item}
                        onChange={e => updateAnecdoteVal(index, e.target.value)}
                        className="bg-canvas border border-border/80 rounded-lg px-2 py-1.5 text-xs text-foreground focus:ring-2 focus:ring-primary outline-none flex-grow"
                      />
                      <button
                        onClick={() => removeAnecdote(index)}
                        className="text-danger hover:bg-danger-dim p-2 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2.5 mt-1">
                  <input
                    type="text"
                    value={newAnecdote}
                    onChange={e => setNewAnecdote(e.target.value)}
                    placeholder="Add novel childhood anecdote..."
                    className="bg-canvas border border-border/80 rounded-lg px-2 py-1.5 text-xs text-foreground focus:ring-2 focus:ring-primary outline-none flex-grow"
                  />
                  <button
                    onClick={addAnecdote}
                    disabled={!newAnecdote.trim()}
                    className="px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center gap-1 hover:scale-[1.02]"
                  >
                    <Plus size={12} /> Add
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-border/60 bg-secondary/50 flex gap-3 justify-end flex-shrink-0">
              <button
                onClick={() => setEditingScene(null)}
                disabled={isSaving}
                className="px-4.5 py-2.5 bg-surface hover:bg-border text-foreground rounded-xl text-xs font-semibold border border-border/80 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveScene}
                disabled={isSaving || !editTitle.trim()}
                className="px-4.5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold shadow-md shadow-primary/20 flex items-center gap-1.5 transition-all hover:scale-[1.02] disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={13} />
                    <span>Save Scene</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
