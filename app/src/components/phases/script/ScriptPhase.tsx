import React, { useState } from 'react';
import { PhaseHeader } from '../../shared/PhaseHeader';
import { useJsonFile } from '@/hooks/useJsonFile';
import { exportQaReport, buildQaHeader } from '@/utils/qaExport';
import { SceneScriptTab } from './tabs/SceneScriptTab';
import { PanelScriptTab } from './tabs/PanelScriptTab';
import ScriptQADrawer, { type QaTarget } from './ScriptQADrawer';
import type { Dialogue } from './DialogueLine';
import type { Beat } from './BeatLine';
import '../../../styles/script.css';

type ScriptSubTab = 'scene-script' | 'panel-script';

const ScriptPhase: React.FC = () => {
  const [subTab, setSubTab] = useState<ScriptSubTab>('scene-script');
  const [qaTarget, setQaTarget] = useState<QaTarget | null>(null);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Check file existence for status indicators
  const { data: sceneData } = useJsonFile<any>('data/scene_script.json');
  const { data: panelData } = useJsonFile<any>('data/script.json');

  const sceneExists = !!sceneData;
  const panelExists = !!panelData;

  /* ── 3A QA handlers ─────────────────────────────── */
  const handleFlagBeat = (beat: Beat) => {
    setQaTarget({ stage: '3a', beat });
  };

  const handleFlagScene = (sceneId: number, flagType: string) => {
    setQaTarget({ stage: '3a', sceneRef: { sceneId, flagType } });
  };

  /* ── 3B QA handlers ─────────────────────────────── */
  const handleFlagDialogue = (dialogue: Dialogue) => {
    setQaTarget({ stage: '3b', type: 'line', dialogue });
  };

  const handleFlagPanel = (ref: { pageNumber: number; panelNumber: number }) => {
    setQaTarget({ stage: '3b', type: 'panel', panelRef: ref });
  };

  /* ── QA export ──────────────────────────────────── */
  const handleExportQa = async (reportContent: string) => {
    const stageLabel = qaTarget?.stage === '3a' ? 'Phase 3A (Scene Script)' : 'Phase 3B (Panel Script)';
    const header = buildQaHeader(stageLabel);
    const fullReport = header + reportContent.replace(/^# QA Report.*\nGenerated:.*\n\n/, '');
    const result = await exportQaReport({
      phase: '3',
      phaseFolder: 'script',
      content: fullReport,
    });
    setExportStatus(result.success ? 'success' : 'error');
    setTimeout(() => setExportStatus('idle'), 3000);
  };

  return (
    <div className="script-phase">
      <PhaseHeader
        title="Script & Dialogue"
        emoji="✍️"
        badge="Phase 3"
        description="Two-stage scripting pipeline. Stage 3A (Writer): Scene-level beats — dialogue, narration, SFX, and pacing. Stage 3B (Editor): Assign beats to panels with lettering, acting direction, and reading flow."
        inputs={['data/scenario_scenes.json', 'data/lore.json', 'data/character_moods.json', 'data/personality_signature.json', 'data/pages.json']}
        outputs={['data/scene_script.json', 'data/script.json']}
        accentColor="#f97316"
        nextStep={{ label: 'Stage 3A → Approve → Stage 3B → Assembly Studio' }}
      />

      {/* Sub-tab navigation */}
      <div className="script-sub-tabs">
        <button
          className={`script-sub-tab-btn ${subTab === 'scene-script' ? 'active' : ''}`}
          onClick={() => setSubTab('scene-script')}
        >
          <span className="script-sub-tab-icon">📖</span>
          <span>Scene Script</span>
          <span className={`script-sub-tab-status ${sceneExists ? 'exists' : 'missing'}`}>
            {sceneExists ? '✓' : '⚠'}
          </span>
        </button>
        <span className="script-sub-tab-arrow">→</span>
        <button
          className={`script-sub-tab-btn ${subTab === 'panel-script' ? 'active' : ''}`}
          onClick={() => setSubTab('panel-script')}
        >
          <span className="script-sub-tab-icon">📐</span>
          <span>Panel Script</span>
          <span className={`script-sub-tab-status ${panelExists ? 'exists' : 'missing'}`}>
            {panelExists ? '✓' : '⚠'}
          </span>
        </button>
      </div>

      {/* Main content area */}
      <div className="script-body">
        {subTab === 'scene-script' && (
          <SceneScriptTab
            onFlagBeat={handleFlagBeat}
            onFlagScene={handleFlagScene}
          />
        )}
        {subTab === 'panel-script' && (
          <PanelScriptTab
            onFlagDialogue={handleFlagDialogue}
            onFlagPanel={handleFlagPanel}
          />
        )}

        {/* QA Drawer */}
        {qaTarget && (
          <ScriptQADrawer
            target={qaTarget}
            onClose={() => setQaTarget(null)}
            onExport={handleExportQa}
          />
        )}

        {exportStatus !== 'idle' && (
          <div className={`script-export-toast ${exportStatus}`}>
            {exportStatus === 'success' ? '✓ QA report exported!' : '✗ Export failed'}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScriptPhase;
