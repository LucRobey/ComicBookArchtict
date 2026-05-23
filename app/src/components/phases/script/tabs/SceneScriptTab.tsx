import React, { useState, useMemo } from 'react';
import { useJsonFile } from '@/hooks/useJsonFile';
import SceneBeatCard, { type SceneData } from '../SceneBeatCard';
import type { Beat } from '../BeatLine';
import '../../../../styles/script.css';

/* ── Data shape ──────────────────────────────────────── */

interface SceneScriptData {
  scenes: SceneData[];
}

const SCENE_SCRIPT_PATH = 'data/scene_script.json';

/* ── Props ───────────────────────────────────────────── */

interface Props {
  onFlagBeat: (beat: Beat) => void;
  onFlagScene: (sceneId: number, flagType: string) => void;
}

/* ── Component ───────────────────────────────────────── */

export const SceneScriptTab: React.FC<Props> = ({ onFlagBeat, onFlagScene }) => {
  const { data, loading, error, save } = useJsonFile<SceneScriptData>(SCENE_SCRIPT_PATH);
  const [selectedSceneIndex, setSelectedSceneIndex] = useState(0);

  /* ── Group scenes by chapter ───────────────────────── */
  const chapterGroups = useMemo(() => {
    if (!data?.scenes) return [];
    const map = new Map<number, SceneData[]>();
    for (const s of data.scenes) {
      const list = map.get(s.chapter_id) ?? [];
      list.push(s);
      map.set(s.chapter_id, list);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a - b)
      .map(([chapterId, scenes]) => ({ chapterId, scenes }));
  }, [data]);

  /* ── Save handler ──────────────────────────────────── */
  const handleSaveBeat = async (sceneId: number, updatedBeat: Beat) => {
    if (!data) return;
    const newData = structuredClone(data);
    const scene = newData.scenes.find(s => s.scene_id === sceneId);
    if (!scene) return;
    const idx = scene.beats.findIndex(b => b.beat_id === updatedBeat.beat_id);
    if (idx === -1) return;
    scene.beats[idx] = updatedBeat;
    await save(newData);
  };

  /* ── Loading state ─────────────────────────────────── */
  if (loading) {
    return (
      <div className="script-state">
        Loading scene script…
      </div>
    );
  }

  /* ── Error state ───────────────────────────────────── */
  if (error) {
    return (
      <div className="script-state error">
        <div style={{ fontSize: '2rem' }}>⚠️</div>
        <p style={{ fontWeight: 600 }}>Could not load scene script.</p>
        <p className="script-state-sub">{error}</p>
        <p className="script-state-hint">
          Run the Stage 3A agent first to generate <code>data/scene_script.json</code>
        </p>
      </div>
    );
  }

  /* ── No data state ─────────────────────────────────── */
  if (!data?.scenes?.length) {
    return (
      <div className="script-state">
        <div style={{ fontSize: '2rem' }}>ℹ️</div>
        <p style={{ fontWeight: 600 }}>No scenes found.</p>
        <p className="script-state-hint">
          Run the Scene Script pipeline to populate <code>data/scene_script.json</code>
        </p>
      </div>
    );
  }

  /* ── Compute flat index → scene mapping for sidebar ── */
  const allScenes = data.scenes;
  const currentScene = allScenes[selectedSceneIndex] ?? allScenes[0];

  return (
    <div className="script-body">
      {/* ── Left sidebar: scenes grouped by chapter ── */}
      <div className="scene-sidebar">
        <div className="script-sidebar-header">
          <h3>Scenes</h3>
          <span className="script-total">{allScenes.length} total</span>
        </div>

        <div className="script-page-list">
          {chapterGroups.map(({ chapterId, scenes }) => (
            <React.Fragment key={chapterId}>
              <div className="scene-chapter-divider">Chapter {chapterId}</div>
              {scenes.map(s => {
                const idx = allScenes.findIndex(x => x.scene_id === s.scene_id);
                return (
                  <button
                    key={s.scene_id}
                    className={`script-page-btn ${idx === selectedSceneIndex ? 'active' : ''}`}
                    onClick={() => setSelectedSceneIndex(idx)}
                  >
                    <span className="script-page-num">{s.title || `Scene ${s.scene_id}`}</span>
                    <span className="script-panel-count">{s.beats.length} beat{s.beats.length !== 1 ? 's' : ''}</span>
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Main area ────────────────────────────────── */}
      <div className="scene-main">
        <div className="script-main-header">
          <h2>Scene {currentScene.scene_id}: {currentScene.title}</h2>
          <span className="scene-chapter-badge">Ch.&nbsp;{currentScene.chapter_id}</span>
          <span className="script-panels-label">{currentScene.beats.length} beats</span>
        </div>

        <div className="script-panels-list">
          <SceneBeatCard
            scene={currentScene}
            onSaveBeat={handleSaveBeat}
            onFlagBeat={onFlagBeat}
            onFlagScene={onFlagScene}
          />
        </div>
      </div>
    </div>
  );
};

export default SceneScriptTab;
