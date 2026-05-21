import React, { useState, useEffect } from 'react';
import { PhaseHeader } from '../../shared/PhaseHeader';
import { useJsonFile } from '@/hooks/useJsonFile';
import { exportQaReport } from '@/utils/qaExport';
import type { 
  ScenarioInputsData, 
  PersonalitySignatureData, 
  ScenarioSynopsisData, 
  ScenarioChaptersData, 
  ScenarioScenesData 
} from '@/types/data';

import { InputsTab } from './tabs/InputsTab';
import { SignaturesTab } from './tabs/SignaturesTab';
import { SynopsisTab } from './tabs/SynopsisTab';
import { ChaptersTab } from './tabs/ChaptersTab';
import { ScenesTab } from './tabs/ScenesTab';

const INPUTS_PATH = 'data/scenario_inputs.json';
const SYNOPSIS_PATH = 'data/scenario_synopsis.json';
const CHAPTERS_PATH = 'data/scenario_chapters.json';
const SCENES_PATH = 'data/scenario_scenes.json';

type SubTab = 'inputs' | 'signatures' | 'synopsis' | 'chapters' | 'scenes';

const ScenarioPhase: React.FC = () => {
  const { data: inputs, save: saveInputs } = useJsonFile<ScenarioInputsData>(INPUTS_PATH);
  const { data: synopsis, save: saveSynopsis } = useJsonFile<ScenarioSynopsisData>(SYNOPSIS_PATH);
  const { data: chapters, save: saveChapters } = useJsonFile<ScenarioChaptersData>(CHAPTERS_PATH);
  const { data: scenes, save: saveScenes } = useJsonFile<ScenarioScenesData>(SCENES_PATH);

  const [signatures, setSignatures] = useState<PersonalitySignatureData | null>(null);

  const loadAllSignatures = async () => {
    try {
      const dirRes = await fetch(`/api/list-dir?path=${encodeURIComponent('data/characters')}`);
      if (!dirRes.ok) throw new Error('Failed to list data/characters');
      const dirData = await dirRes.json();
      const chars = (dirData.entries || [])
        .filter((e: any) => e.isDir && e.name !== '_TEMPLATE')
        .map((e: any) => e.name);

      const combinedSignatures: Record<string, any> = {};
      for (const char of chars) {
        const fileRes = await fetch(`/api/load?path=${encodeURIComponent(`data/characters/${char}/personality_signature.json`)}`);
        if (fileRes.ok) {
          const fileData = await fileRes.json();
          if (fileData.data?.signatures) {
            Object.assign(combinedSignatures, fileData.data.signatures);
          }
        }
      }
      setSignatures({ signatures: combinedSignatures });
    } catch (err) {
      console.error('Error loading signatures:', err);
    }
  };

  useEffect(() => {
    loadAllSignatures();
  }, []);

  const saveSignatures = async (newSigData: PersonalitySignatureData) => {
    if (!newSigData?.signatures) return false;
    try {
      for (const [charName, sig] of Object.entries(newSigData.signatures)) {
        const path = `data/characters/${charName}/personality_signature.json`;
        const payload = {
          signatures: {
            [charName]: sig
          }
        };
        await fetch('/api/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path, content: payload })
        });
      }
      setSignatures(newSigData);
      return true;
    } catch (err) {
      console.error('Error saving signatures:', err);
      return false;
    }
  };

  const [subTab, setSubTab] = useState<SubTab>('inputs');
  
  // QA Report Drawer State
  const [qaOpen, setQaOpen] = useState(false);
  const [qaFlagType, setQaFlagType] = useState('');
  const [qaContext, setQaContext] = useState('');
  const [qaNote, setQaNote] = useState('');
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const openQa = (flagType: string, context: string) => {
    setQaFlagType(flagType);
    setQaContext(context);
    setQaNote('');
    setQaOpen(true);
  };

  const closeQa = () => {
    setQaOpen(false);
    setQaNote('');
    setQaFlagType('');
    setQaContext('');
    setExportStatus('idle');
  };

  const handleExportQa = async () => {
    const content = `# QA Report — Phase 1 (Scenario)\n\n## [${qaFlagType}]\n* **Context:** ${qaContext}\n* **Request:** ${qaNote}\n`;
    const result = await exportQaReport({ phase: '1', phaseFolder: 'scenario', content });
    setExportStatus(result.success ? 'success' : 'error');
    setTimeout(() => closeQa(), 1500);
  };

  return (
    <div className="flex flex-col h-full w-full bg-background-panel relative">
      <PhaseHeader
        title="Scenario Planner"
        emoji="📝"
        badge="Steps 1 & 3"
        description="Two-pass workflow. Pass 1: Build personality signatures, synopsis, and chapter breakdown. Pass 2 (after Character Hub chapter moods): Divide chapters into granular scenes."
        inputs={['data/lore.json', 'data/scenario_inputs.json', 'data/character_moods.json']}
        outputs={['data/characters/[Name]/personality_signature.json', 'data/scenario_chapters.json', 'data/scenario_scenes.json']}
        accentColor="#ec4899"
        nextStep={{ label: 'After chapters → Character Hub for chapter moods. After scenes → Character Hub for scene moods.' }}
      />
      {/* Sub-tab navigation */}
      <div className="flex items-center justify-center gap-3 px-6 h-12 bg-background-panel border-b border-border shadow-sm flex-shrink-0 z-10">
        {([
          { id: 'inputs',     label: '📥 Inputs' },
          { id: 'signatures', label: '🎭 Signatures' },
          { id: 'synopsis',   label: '📖 Synopsis' },
          { id: 'chapters',   label: '📑 Chapters' },
          { id: 'scenes',     label: '🎬 Scenes' },
        ] as { id: SubTab; label: string }[]).map(tab => (
          <button
            key={tab.id}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              subTab === tab.id
                ? 'bg-secondary text-primary shadow-sm border border-border'
                : 'text-foreground-muted hover:text-primary hover:bg-secondary border border-transparent'
            }`}
            onClick={() => setSubTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {subTab === 'inputs' && <InputsTab inputs={inputs} onSaveInputs={saveInputs} openQa={openQa} />}
        {subTab === 'signatures' && <SignaturesTab signatures={signatures} onSaveSignatures={saveSignatures} openQa={openQa} />}
        {subTab === 'synopsis' && <SynopsisTab synopsis={synopsis} onSaveSynopsis={saveSynopsis} openQa={openQa} />}
        {subTab === 'chapters' && <ChaptersTab chapters={chapters} onSave={saveChapters} openQa={openQa} />}
        {subTab === 'scenes' && <ScenesTab scenes={scenes} onSave={saveScenes} chapters={chapters} openQa={openQa} />}
      </div>

      {/* QA Drawer */}
      {qaOpen && (
        <>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/50 z-40" onClick={closeQa} />
          {/* Drawer Panel */}
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-background-panel border-l border-border shadow-2xl z-50 flex flex-col transform transition-transform">
            <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/50">
              <h3 className="font-bold text-foreground font-heading">🚩 Flag for Agent</h3>
              <button 
                onClick={closeQa}
                className="text-foreground-muted hover:text-foreground transition-colors p-1"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 flex flex-col gap-4 flex-1 overflow-y-auto">
              <div>
                <p className="text-xs font-bold text-primary mb-1">{qaFlagType}</p>
                <p className="text-sm text-foreground-muted">{qaContext}</p>
              </div>

              <div className="flex flex-col gap-2 flex-1">
                <label className="text-sm font-bold text-foreground">Instructions</label>
                <textarea
                  className="w-full flex-1 bg-background border border-border rounded-md p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                  placeholder="Add specific instructions for the agent..."
                  value={qaNote}
                  onChange={(e) => setQaNote(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-border">
                <button 
                  onClick={handleExportQa} 
                  disabled={!qaNote.trim() || exportStatus === 'success'} 
                  className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-md shadow-sm hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold transition-colors"
                >
                  {exportStatus === 'success' ? '✓ Exported Successfully' : '📤 Export Request'}
                </button>
                {exportStatus === 'error' && (
                  <p className="text-xs text-red-500 text-center">Failed to export QA report.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ScenarioPhase;
