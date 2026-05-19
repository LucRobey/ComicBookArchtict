import React from 'react';
import type { ScenarioData } from '../types';

interface ScenarioTabProps {
  scenario: ScenarioData | null;
  openSceneFlag: (id: number, type: string) => void;
}

export const ScenarioTab: React.FC<ScenarioTabProps> = ({ scenario, openSceneFlag }) => {
  if (!scenario) return (
    <div className="lore-state error">
      <p>⚠️ No scenario.json found.</p>
      <p className="lore-state-hint">Run Phase 0 agent to generate <code>data/scenario.json</code></p>
    </div>
  );
  return (
    <div className="scenario-list">
      {scenario.scenes.map(scene => (
        <div key={scene.scene_id} className="scene-card">
          <div className="scene-card-header">
            <div className="scene-meta">
              <span className="scene-id">Scene {scene.scene_id}</span>
              <span className="scene-title">{scene.title}</span>
            </div>
            <div className="scene-actions">
              <button className="scene-flag-btn" onClick={() => openSceneFlag(scene.scene_id, 'REWRITE_SCENE')}>🚩 Rewrite</button>
              <button className="scene-flag-btn add" onClick={() => openSceneFlag(scene.scene_id, 'ADD_SCENE_AFTER')}>+ Add After</button>
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
  );
};
