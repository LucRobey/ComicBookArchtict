import React, { useState, useEffect } from 'react';
import type { ScenarioSynopsisData } from '@/types/data';

interface SynopsisTabProps {
  synopsis: ScenarioSynopsisData | null;
  onSaveSynopsis: (data: ScenarioSynopsisData) => void;
  openQa: (type: string, context: string) => void;
}

export const SynopsisTab: React.FC<SynopsisTabProps> = ({ synopsis, onSaveSynopsis, openQa }) => {
  const [localSynopsis, setLocalSynopsis] = useState('');

  useEffect(() => {
    if (synopsis) {
      setLocalSynopsis(synopsis.synopsis);
    }
  }, [synopsis]);

  if (!synopsis) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center gap-4">
        <div className="text-4xl">📝</div>
        <h3 className="text-lg font-bold text-foreground">No Synopsis Generated</h3>
        <p className="text-sm text-foreground-muted max-w-md">
          No synopsis found. You must generate it based on the Signatures and Inputs.
        </p>
        <button 
          className="px-4 py-2 mt-4 bg-primary text-primary-foreground rounded-md shadow-sm hover:bg-primary-hover text-sm font-medium transition-colors"
          onClick={() => openQa('GENERATE_SYNOPSIS', 'Based on signatures and inputs, generate synopsis')}
        >
          Generate Synopsis ➔
        </button>
      </div>
    );
  }

  const isDirty = localSynopsis !== synopsis.synopsis;

  const handleSave = () => {
    onSaveSynopsis({ ...synopsis, synopsis: localSynopsis });
  };

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-heading text-foreground">The Story Treatment (Synopsis)</h2>
          <p className="text-sm text-foreground-muted mt-1">A rich-text summary covering the entire scenario arc.</p>
        </div>
        <div className="flex items-center gap-3">
          {isDirty && (
            <button 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md shadow-sm hover:bg-primary-hover text-sm font-medium transition-all"
              onClick={handleSave}
            >
              💾 Save Synopsis
            </button>
          )}
          <button 
            className="px-4 py-2 bg-secondary text-foreground hover:bg-background border border-border rounded-md shadow-sm text-sm font-medium transition-colors lore-action-flag group flex items-center gap-2"
            onClick={() => openQa('REWRITE_SYNOPSIS', 'Rewrite the synopsis')}
          >
            <span>🚩</span>
            <span>Flag Synopsis</span>
          </button>
          <button 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md shadow-sm hover:bg-primary-hover text-sm font-medium transition-colors"
            onClick={() => openQa('GENERATE_CHAPTERS', 'Based on synopsis, generate chapters')}
          >
            Generate Chapters ➔
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 bg-background-panel border border-border p-5 rounded-lg shadow-sm flex-1">
        <textarea 
          className="w-full h-full bg-background border border-border rounded-md p-4 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none leading-relaxed"
          value={localSynopsis} 
          onChange={e => setLocalSynopsis(e.target.value)} 
          placeholder="Enter the full story synopsis here..."
        />
      </div>
    </div>
  );
};

