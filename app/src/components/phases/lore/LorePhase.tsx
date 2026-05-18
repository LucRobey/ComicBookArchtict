import React, { useState } from 'react';
import { useJsonFile } from '@/hooks/useJsonFile';
import { exportQaReport } from '@/utils/qaExport';
import '../../../styles/lore.css';

interface LoreData { [key: string]: any }
interface Scene {
  scene_id: number;
  title: string;
  location: string;
  characters_present: string[];
  emotional_beat: string;
  summary: string;
  anecdotes: string[];
}
interface ScenarioData { scenes: Scene[] }

type SubTab = 'lore' | 'scenario';

const LORE_PATH     = 'data/lore.json';
const SCENARIO_PATH = 'data/scenario.json';

const LorePhase: React.FC = () => {
  const { data: lore, loading: loreLoading } = useJsonFile<LoreData>(LORE_PATH);
  const { data: scenario, loading: scLoading } = useJsonFile<ScenarioData>(SCENARIO_PATH);
  const [subTab, setSubTab] = useState<SubTab>('lore');
  const [qaSceneId, setQaSceneId] = useState<number | null>(null);
  const [qaLoreKey, setQaLoreKey] = useState<string | null>(null);
  const [qaType, setQaType] = useState<string | null>(null);
  const [qaNote, setQaNote] = useState('');
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const loading = loreLoading || scLoading;
  if (loading) return <div className="lore-state">Loading…</div>;

  const buildReport = (): string => {
    const now = new Date().toISOString();
    let r = `# QA Report — Phase 0 (Pre-Production)\nGenerated: ${now}\n\n`;
    if (qaSceneId !== null) {
      const scene = scenario?.scenes.find(s => s.scene_id === qaSceneId);
      r += `## Scene ${qaSceneId} — [${qaType}]\n`;
      if (qaType === 'REWRITE_SCENE' && scene) r += `* **Current summary:** ${scene.summary}\n* **Request:** ${qaNote}\n`;
      if (qaType === 'ADD_SCENE_AFTER') r += `* **New scene brief:** ${qaNote}\n`;
      if (qaType === 'DELETE_SCENE') r += `* **Confirmed:** yes\n`;
    }
    if (qaLoreKey) {
      r += `## Lore: ${qaLoreKey} — [CHANGE]\n* **Current:** ${lore?.[qaLoreKey]}\n* **Request:** ${qaNote}\n`;
    }
    return r;
  };

  const handleExport = async () => {
    const result = await exportQaReport({ phase: '0', phaseFolder: 'lore', content: buildReport() });
    setExportStatus(result.success ? 'success' : 'error');
    setTimeout(() => { setExportStatus('idle'); setQaSceneId(null); setQaLoreKey(null); setQaType(null); setQaNote(''); }, 1500);
  };

  const showDrawer = (qaSceneId !== null || qaLoreKey !== null);

  return (
    <div className="lore-phase">
      {/* Sub-tab bar */}
      <div className="lore-subtab-bar bg-background-panel border-b border-border shadow-sm">
        <button className={`lore-subtab ${subTab === 'lore' ? 'active' : ''}`} onClick={() => setSubTab('lore')}>🌍 Lore</button>
        <button className={`lore-subtab ${subTab === 'scenario' ? 'active' : ''}`} onClick={() => setSubTab('scenario')}>🎬 Scenario</button>
        {exportStatus !== 'idle' && (
          <div className={`lore-toast ${exportStatus}`}>
            {exportStatus === 'success' ? '✓ QA exported!' : '✗ Failed'}
          </div>
        )}
      </div>

      <div className="lore-body">
        <div className="lore-content-area">
          {/* LORE TAB */}
          {subTab === 'lore' && lore && (
            <div className="lore-grid">
              {Object.entries(lore).map(([key, value]) => (
                <div key={key} className="lore-card">
                  <div className="lore-card-header">
                    <span className="lore-key">{key.replace(/_/g, ' ')}</span>
                    <button className="lore-flag-btn" onClick={() => { setQaLoreKey(key); setQaSceneId(null); setQaType('CHANGE'); }}>🚩</button>
                  </div>
                  {Array.isArray(value) ? (
                    <ul className="lore-list">
                      {(value as string[]).map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  ) : (
                    <p className="lore-value">{String(value)}</p>
                  )}
                </div>
              ))}
            </div>
          )}
          {subTab === 'lore' && !lore && (
            <div className="lore-state error">
              <p>⚠️ No lore.json found.</p>
              <p className="lore-state-hint">Run Phase 0 agent to generate <code>data/lore.json</code></p>
            </div>
          )}

          {/* SCENARIO TAB */}
          {subTab === 'scenario' && scenario && (
            <div className="scenario-list">
              {scenario.scenes.map(scene => (
                <div key={scene.scene_id} className="scene-card">
                  <div className="scene-card-header">
                    <div className="scene-meta">
                      <span className="scene-id">Scene {scene.scene_id}</span>
                      <span className="scene-title">{scene.title}</span>
                    </div>
                    <div className="scene-actions">
                      <button className="scene-flag-btn" onClick={() => { setQaSceneId(scene.scene_id); setQaLoreKey(null); setQaType('REWRITE_SCENE'); }}>🚩 Rewrite</button>
                      <button className="scene-flag-btn add" onClick={() => { setQaSceneId(scene.scene_id); setQaLoreKey(null); setQaType('ADD_SCENE_AFTER'); }}>+ Add After</button>
                    </div>
                  </div>
                  <div className="scene-info-row">
                    <span className="scene-info-item">📍 {scene.location}</span>
                    <span className="scene-info-item">👥 {scene.characters_present.join(', ')}</span>
                  </div>
                  <p className="scene-beat">🎭 {scene.emotional_beat}</p>
                  <p className="scene-summary">{scene.summary}</p>
                  {scene.anecdotes.length > 0 && (
                    <div className="scene-anecdotes">
                      {scene.anecdotes.map(a => <span key={a} className="scene-anecdote">📌 {a}</span>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {subTab === 'scenario' && !scenario && (
            <div className="lore-state error">
              <p>⚠️ No scenario.json found.</p>
              <p className="lore-state-hint">Run Phase 0 agent to generate <code>data/scenario.json</code></p>
            </div>
          )}
        </div>

        {/* QA Drawer */}
        {showDrawer && (
          <div className="lore-qa-drawer bg-background-panel border-l border-border shadow-lg">
            <div className="lore-qa-header">
              <div>
                <h3>🚩 Flag for Agent</h3>
                <p className="lore-qa-sub">
                  {qaSceneId !== null ? `Scene ${qaSceneId} · ${qaType}` : `Lore: ${qaLoreKey}`}
                </p>
              </div>
              <button className="lore-qa-close" onClick={() => { setQaSceneId(null); setQaLoreKey(null); setQaType(null); setQaNote(''); }}>✕</button>
            </div>
            <textarea
              className="lore-qa-textarea"
              placeholder="Describe what should change…"
              value={qaNote}
              onChange={e => setQaNote(e.target.value)}
              rows={5}
            />
            <button className="lore-qa-export-btn" disabled={!qaNote.trim()} onClick={handleExport}>
              📤 Export QA Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LorePhase;
