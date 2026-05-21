import React, { useState } from 'react';
import type { ScenarioChaptersData, Chapter } from '@/types/data';
import { 
  BookOpen, 
  Edit3, 
  Flag, 
  Check, 
  TrendingUp,
  User,
  ArrowRight
} from 'lucide-react';

interface ChaptersTabProps {
  chapters: ScenarioChaptersData | null;
  onSave?: (newData: ScenarioChaptersData) => Promise<boolean>;
  openQa: (type: string, context: string) => void;
}

export const ChaptersTab: React.FC<ChaptersTabProps> = ({ chapters, onSave, openQa }) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editCharacters, setEditCharacters] = useState('');
  const [editProgression, setEditProgression] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const startEdit = (chapter: Chapter) => {
    setEditingId(chapter.chapter_id);
    setEditTitle(chapter.title);
    setEditSummary(chapter.summary);
    setEditCharacters(chapter.characters.join(', '));
    setEditProgression(chapter.story_progression || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleSave = async (chapterId: number) => {
    if (!chapters || !onSave) return;
    setIsSaving(true);
    try {
      const parsedCharacters = editCharacters
        .split(',')
        .map(c => c.trim())
        .filter(c => c.length > 0);

      const updatedChapters = chapters.chapters.map(c => {
        if (c.chapter_id === chapterId) {
          return {
            ...c,
            title: editTitle.trim(),
            summary: editSummary.trim(),
            characters: parsedCharacters,
            story_progression: editProgression.trim(),
          };
        }
        return c;
      });

      const success = await onSave({ chapters: updatedChapters });
      if (success) {
        setEditingId(null);
      } else {
        alert('Failed to save chapter edits.');
      }
    } catch (err: any) {
      alert(`Error saving: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!chapters?.chapters || chapters.chapters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center gap-4 max-w-xl mx-auto w-full">
        <div className="text-5xl animate-bounce">📚</div>
        <h3 className="text-xl font-bold text-foreground font-heading">No Chapters Generated</h3>
        <p className="text-sm text-foreground-muted">
          No chapters found. You must generate them based on the Synopsis.
        </p>
        <button 
          className="relative px-6 py-3 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-hover hover:to-indigo-750 text-white font-semibold rounded-xl shadow-lg hover:shadow-primary/35 hover:scale-[1.03] transition-all duration-300 text-sm flex items-center gap-2"
          onClick={() => openQa('GENERATE_CHAPTERS', 'Based on synopsis, generate chapters')}
        >
          <span>Generate Chapters</span>
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

  return (
    <div className="relative flex flex-col h-full overflow-y-auto bg-canvas p-8">
      {/* Decorative top-most backdrop glow */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-3xl mx-auto w-full flex flex-col gap-8 relative">
        {/* Centered Header Panel */}
        <div className="relative flex flex-col items-center text-center border-b border-border/60 pb-6 gap-4 w-full">
          <h2 className="text-3xl font-extrabold font-heading text-foreground tracking-tight flex items-center gap-3 justify-center">
            <span className="p-2 bg-primary/10 rounded-xl text-primary ring-1 ring-primary/20">
              <BookOpen size={24} />
            </span>
            <span>Chapters <span className="text-foreground-muted font-normal text-xl font-sans">Outline</span></span>
          </h2>
          <p className="text-sm text-foreground-muted max-w-xl">
            High-level chronological breakdown of the narrative. Edit the segments below to adjust pacing.
          </p>
          <button 
            className="relative overflow-hidden px-5 py-2.5 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-hover hover:to-indigo-700 text-white rounded-xl shadow-[0_4px_15px_rgba(99,102,241,0.2)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.35)] font-semibold text-sm transition-all duration-300 hover:scale-[1.02] flex items-center gap-2 group mt-2"
            onClick={() => openQa('GENERATE_SCENES', 'Based on chapters, generate scenes')}
          >
            <span>Generate Scenes</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Centered Cards list */}
        <div className="relative flex flex-col gap-8 mt-2 w-full">
          {chapters.chapters.map(c => {
            const isEditing = editingId === c.chapter_id;
            const cardGradient = gradientPresets[c.chapter_id % gradientPresets.length];

            return (
              <div 
                key={c.chapter_id} 
                className={`relative bg-surface/40 backdrop-blur-md border rounded-2xl p-10 md:p-12 flex flex-col gap-6 group overflow-hidden transition-all duration-300 items-center text-center ${
                  isEditing 
                    ? 'border-primary ring-4 ring-primary/10 shadow-lg bg-surface-raised/80' 
                    : 'border-border/60 hover:border-primary/30 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/5'
                }`}
              >
                {/* Premium Left Accent Border */}
                <div className={`absolute top-0 left-0 bottom-0 w-[4px] bg-gradient-to-b ${cardGradient} opacity-60 group-hover:opacity-100 transition-opacity duration-300`} />

                {isEditing ? (
                  // Editing View
                  <div className="flex flex-col gap-5 w-full text-left">
                    <div className="flex flex-col sm:flex-row items-center justify-between border-b border-border/60 pb-4 gap-3">
                      <span className="text-xs font-bold text-primary font-mono uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping"></span>
                        Editing Chapter {c.chapter_id}
                      </span>
                      <div className="flex gap-2.5">
                        <button
                          onClick={cancelEdit}
                          disabled={isSaving}
                          className="px-4 py-2 bg-surface hover:bg-border text-foreground rounded-xl text-xs font-semibold border border-border/80 transition-all hover:scale-[1.02] disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSave(c.chapter_id)}
                          disabled={isSaving || !editTitle.trim() || !editSummary.trim()}
                          className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {isSaving ? (
                            <>
                              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <Check size={14} />
                              <span>Save Changes</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Title</label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          className="w-full bg-canvas/80 border border-border/80 rounded-xl px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                          placeholder="Chapter Title"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Characters Present</label>
                        <input
                          type="text"
                          value={editCharacters}
                          onChange={e => setEditCharacters(e.target.value)}
                          className="w-full bg-canvas/80 border border-border/80 rounded-xl px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-mono"
                          placeholder="CHARACTER_A, CHARACTER_B (comma separated)"
                        />
                        <span className="text-[10px] text-foreground-muted italic px-1 flex items-center gap-1.5">
                          <User size={10} className="text-primary" />
                          Parsed: {editCharacters.split(',').map(ch => ch.trim()).filter(Boolean).join(', ') || 'None'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Summary</label>
                      <textarea
                        value={editSummary}
                        onChange={e => setEditSummary(e.target.value)}
                        rows={4}
                        className="w-full bg-canvas/80 border border-border/80 rounded-xl px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-y"
                        placeholder="Detailed narrative summary of the chapter..."
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Story Progression (Global Arc Impact)</label>
                      <textarea
                        value={editProgression}
                        onChange={e => setEditProgression(e.target.value)}
                        rows={2}
                        className="w-full bg-canvas/80 border border-border/80 rounded-xl px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-y"
                        placeholder="How does this chapter move the overall story forward?"
                      />
                    </div>
                  </div>
                ) : (
                  // Display View (Perfectly Centered & Spacious)
                  <div className="flex flex-col items-center w-full gap-5">
                    <div className="flex flex-col items-center gap-3">
                      <h4 className="text-2xl font-extrabold text-foreground font-heading flex flex-col sm:flex-row items-center gap-3 justify-center">
                        <span className={`inline-flex items-center justify-center font-mono font-bold text-xs bg-gradient-to-r ${cardGradient} text-white px-3 py-1 rounded-lg shadow-sm shadow-black/10`}>
                          CH {c.chapter_id}
                        </span>
                        <span>{c.title}</span>
                      </h4>
                      
                      {c.characters && c.characters.length > 0 && (
                        <div className="flex flex-wrap gap-2 justify-center mt-1">
                          {c.characters.map(char => (
                            <span 
                              key={char} 
                              className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-mono bg-canvas border border-border/80 text-foreground-muted shadow-sm hover:border-primary/40 hover:text-primary transition-all duration-200"
                            >
                              <User size={11} className="mr-1.5 text-primary/70" />
                              {char}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap font-sans max-w-2xl text-center">
                      {c.summary}
                    </p>

                    {c.story_progression && (
                      <div className="w-full max-w-2xl mt-1 bg-gradient-to-r from-primary/5 to-indigo-500/5 border border-primary/10 rounded-xl p-5 text-xs text-foreground/85 flex flex-col items-center justify-center text-center gap-2 shadow-inner">
                        <span className="p-1.5 bg-primary/10 rounded-lg text-primary flex-shrink-0">
                          <TrendingUp size={14} />
                        </span>
                        <div className="space-y-1">
                          <span className="font-bold text-primary tracking-wider block uppercase text-[10px]">Story Arc Progression</span>
                          <span>{c.story_progression}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-center gap-3 mt-4">
                      <button 
                        className="px-4 py-2 bg-surface hover:bg-border text-foreground border border-border/80 rounded-xl shadow-sm text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 hover:scale-[1.02]"
                        onClick={() => startEdit(c)}
                      >
                        <Edit3 size={13} className="text-foreground-muted" />
                        <span>Edit Details</span>
                      </button>
                      <button 
                        className="px-4 py-2 bg-surface hover:bg-border text-foreground border border-border/80 rounded-xl shadow-sm text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 hover:scale-[1.02]"
                        onClick={() => openQa('REWRITE_CHAPTER', `Rewrite Chapter ${c.chapter_id}`)}
                      >
                        <Flag size={13} className="text-rose-500" />
                        <span>Rewrite</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
