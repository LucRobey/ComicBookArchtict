import React, { useState, useCallback } from 'react';
import { useJsonFile } from '@/hooks/useJsonFile';
import { exportQaReport } from '@/utils/qaExport';
import { saveJsonFile } from '@/utils/saveFile';
import '../../../styles/lore.css';
import type { LoreData, ScenarioData, GeographyData, SubTab, FlagTarget, Location, Variant } from './types';
import { WorldTab } from './tabs/WorldTab';
import { VisualStyleTab } from './tabs/VisualStyleTab';
import { GeographyTab } from './tabs/GeographyTab';
import { ScenarioTab } from './tabs/ScenarioTab';
import { LoreFlagDrawer } from './components/LoreFlagDrawer';

const LORE_PATH      = 'data/lore.json';
const SCENARIO_PATH  = 'data/scenario.json';
const GEOGRAPHY_PATH = 'data/geography.json';

const LorePhase: React.FC = () => {
  const { data: lore,      loading: loreLoading, reload: reloadLore } = useJsonFile<LoreData>(LORE_PATH);
  const { data: scenario,  loading: scLoading } = useJsonFile<ScenarioData>(SCENARIO_PATH);
  const { data: geography, loading: geoLoading,  reload: reloadGeography } = useJsonFile<GeographyData>(GEOGRAPHY_PATH);

  const [subTab, setSubTab] = useState<SubTab>('world');
  
  // QA Report Drawer
  const [qaSceneId,       setQaSceneId]       = useState<number | null>(null);
  const [qaLoreKey,       setQaLoreKey]       = useState<string | null>(null);
  const [qaLocId,         setQaLocId]         = useState<string | null>(null);
  const [qaStyleRef,      setQaStyleRef]      = useState<string | null>(null);
  const [qaType,          setQaType]          = useState<string | null>(null);
  const [qaNote,          setQaNote]          = useState('');
  const [exportStatus,    setExportStatus]    = useState<'idle' | 'success' | 'error'>('idle');

  // Specific Flag Drawer (Palette/Lighting/Shot)
  const [flagTarget, setFlagTarget] = useState<FlagTarget | null>(null);
  const [flaggedKeys, setFlaggedKeys] = useState<Set<string>>(new Set());

  const loading = loreLoading || scLoading || geoLoading;

  // ── Shared save helpers ──────────────────────────────────
  // All lore saves go through saveJsonFile to avoid duplicated fetch logic.

  const saveLoreField = useCallback(async (field: string, value: any) => {
    if (!lore) return;
    await saveJsonFile(LORE_PATH, { ...lore, [field]: value }, reloadLore);
  }, [lore, reloadLore]);

  const saveGeography = useCallback(async (updated: GeographyData) => {
    await saveJsonFile(GEOGRAPHY_PATH, updated, reloadGeography);
  }, [reloadGeography]);

  const saveDescription = useCallback(async (key: string, value: string) => {
    if (!geography) return;
    const updated: GeographyData = JSON.parse(JSON.stringify(geography));
    const [type, locId, variantId] = key.split(':');
    const loc = updated.locations.find((l: Location) => l.id === locId);
    if (!loc) throw new Error('location not found');
    if (type === 'global') {
      loc.description = value;
    } else if (type === 'variant' && variantId) {
      const v = loc.variants?.find((v: Variant) => v.id === variantId);
      if (v) v.description = value;
    }
    await saveJsonFile(GEOGRAPHY_PATH, updated, reloadGeography);
  }, [geography, reloadGeography]);

  const saveCanonicalPalette = useCallback(async (next: { label: string; hex: string; role: string }[]) => {
    if (!lore) return;
    await saveJsonFile(LORE_PATH, { ...lore, palette: next }, reloadLore);
  }, [lore, reloadLore]);

  const saveVisualRules  = useCallback(async (visual_rules: string[]) => saveLoreField('visual_rules', visual_rules), [saveLoreField]);
  const saveVisualStyle  = useCallback(async (visual_style: string) => saveLoreField('visual_style', visual_style), [saveLoreField]);
  const saveMoodBoard    = useCallback(async (mood_board: { id: string; prompt: string; image?: string }[]) => saveLoreField('mood_board', mood_board), [saveLoreField]);
  const saveLoreValue    = useCallback(async (key: string, value: string) => saveLoreField(key, value), [saveLoreField]);
  const saveWorldRules   = useCallback(async (rules: string[]) => saveLoreField('rules', rules), [saveLoreField]);

  // ── Loading guard (must come AFTER all hooks) ───────────
  if (loading) return <div className="lore-state">Loading…</div>;

  const openFlag = (type: 'shot' | 'palette' | 'lighting' | 'style_image', locId: string, variantId: string | null, label: string, shot?: any) => {
    setFlagTarget({ type, locId, variantId, label, shot });
  };

  const buildReport = (): string => {
    const now = new Date().toISOString();
    let r = `# QA Report — Phase 0 (Pre-Production)\nGenerated: ${now}\n\n`;
    if (qaSceneId !== null) {
      const scene = scenario?.scenes.find(s => s.scene_id === qaSceneId);
      r += `## Scene ${qaSceneId} — [${qaType}]\n`;
      if (qaType === 'REWRITE_SCENE' && scene) r += `* **Current summary:** ${scene.summary}\n* **Request:** ${qaNote}\n`;
      if (qaType === 'ADD_SCENE_AFTER') r += `* **New scene brief:** ${qaNote}\n`;
    }
    if (qaLoreKey) {
      const currentVal = qaLoreKey.startsWith('rule:') ? qaLoreKey.replace('rule:', '') : lore?.[qaLoreKey];
      r += `## Lore: ${qaLoreKey} — [CHANGE]\n* **Current:** ${currentVal}\n* **Request:** ${qaNote}\n`;
    }
    if (qaLocId) {
      const loc = geography?.locations.find(l => l.id === qaLocId);
      r += `## Location: ${loc?.name ?? qaLocId} — [REGENERATE_LOCATION_IMAGE:${qaLocId}]\n`;
      r += `* **Current prompt:** ${loc?.image_prompt ?? '(none)'}\n`;
      r += `* **Request:** ${qaNote}\n`;
    }
    if (qaStyleRef) {
      r += `## Style Reference: ${qaStyleRef} — [REGENERATE_STYLE_REFERENCE]\n`;
      r += `* **Request:** ${qaNote}\n`;
    }
    return r;
  };

  const handleExport = async () => {
    const result = await exportQaReport({ phase: '0', phaseFolder: 'lore', content: buildReport() });
    setExportStatus(result.success ? 'success' : 'error');
    setTimeout(() => {
      setExportStatus('idle'); setQaSceneId(null); setQaLoreKey(null); setQaType(null); setQaNote(''); setQaStyleRef(null);
    }, 1500);
  };

  const openLoreFlag  = (key: string) => { setQaLoreKey(key); setQaSceneId(null); setQaLocId(null); setQaStyleRef(null); setQaType('CHANGE'); };
  const openSceneFlag = (id: number, type: string) => { setQaSceneId(id); setQaLoreKey(null); setQaLocId(null); setQaStyleRef(null); setQaType(type); };
  const openLocFlag   = (id: string) => { setQaLocId(id); setQaSceneId(null); setQaLoreKey(null); setQaStyleRef(null); setQaType('REGENERATE_LOCATION_IMAGE'); };
  const closeQaDrawer   = () => { setQaSceneId(null); setQaLoreKey(null); setQaLocId(null); setQaStyleRef(null); setQaType(null); setQaNote(''); };
  const showQaDrawer = qaSceneId !== null || qaLoreKey !== null || qaLocId !== null || qaStyleRef !== null;

  return (
    <div className="lore-phase bg-background-panel">
      {/* Sub-tab bar */}
      <div className="lore-subtab-bar bg-background-panel border-b border-border shadow-sm">
        {([
          { id: 'world',        label: '🌍 World' },
          { id: 'visual-style', label: '🎨 Visual Style' },
          { id: 'geography',    label: '🗺️ Geography' },
          { id: 'scenario',     label: '🎬 Scenario' },
        ] as { id: SubTab; label: string }[]).map(tab => (
          <button
            key={tab.id}
            className={`lore-subtab ${subTab === tab.id ? 'active' : ''}`}
            onClick={() => setSubTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
        {exportStatus !== 'idle' && (
          <div className={`lore-toast ${exportStatus}`}>
            {exportStatus === 'success' ? '✓ QA exported!' : '✗ Failed'}
          </div>
        )}
      </div>

      <div className="lore-body">
        <div className="lore-content-area">
          {subTab === 'world'        && <WorldTab lore={lore} openLoreFlag={openLoreFlag} onSaveLoreValue={saveLoreValue} onSaveRules={saveWorldRules} />}
          {subTab === 'visual-style' && <VisualStyleTab lore={lore} openLoreFlag={openLoreFlag} onSavePalette={saveCanonicalPalette} onSaveRules={saveVisualRules} onSaveVisualStyle={saveVisualStyle} onSaveMoodBoard={saveMoodBoard} openFlag={openFlag} />}
          {subTab === 'geography'    && <GeographyTab geography={geography} scenario={scenario} flaggedKeys={flaggedKeys} openFlag={openFlag} openLocFlag={openLocFlag} onSaveDescription={saveDescription} onSaveGeography={saveGeography} />}
          {subTab === 'scenario'     && <ScenarioTab scenario={scenario} openSceneFlag={openSceneFlag} />}
        </div>

        {/* Generic Flag Drawer (Palette/Shot/Lighting) */}
        {flagTarget && (
          <div className="lore-flag-drawer-overlay" onClick={() => setFlagTarget(null)}>
             <div onClick={(e) => e.stopPropagation()}>
               <LoreFlagDrawer 
                  flagTarget={flagTarget} 
                  onClose={() => setFlagTarget(null)} 
                  onFlagSent={(key) => setFlaggedKeys(prev => new Set(prev).add(key))} 
               />
             </div>
          </div>
        )}

        {/* QA Report Drawer */}
        {showQaDrawer && (
          <div className="lore-qa-drawer bg-background-panel border-l border-border shadow-lg">
            <div className="lore-qa-header">
              <div>
                <h3>🚩 Flag for Agent</h3>
                <p className="lore-qa-sub">
                  {qaSceneId !== null
                    ? `Scene ${qaSceneId} · ${qaType}`
                    : qaLocId !== null
                    ? `Location: ${geography?.locations.find(l => l.id === qaLocId)?.name ?? qaLocId}`
                    : qaStyleRef !== null
                    ? `Style Reference: ${qaStyleRef}`
                    : `Lore: ${qaLoreKey}`}
                </p>
              </div>
              <button className="lore-qa-close" onClick={closeQaDrawer}>✕</button>
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
