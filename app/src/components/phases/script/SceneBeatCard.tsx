import React from 'react';
import BeatLine, { type Beat } from './BeatLine';
import '../../../styles/script.css';

/* ── Scene data interface ────────────────────────────── */

export interface SceneData {
  scene_id: number;
  chapter_id: number;
  title: string;
  page_budget: {
    pages: number[];
    estimated_total_panels: number;
    density_note: string;
  };
  emotional_arc: {
    opening_state: string;
    turning_point: string;
    closing_state: string;
    arc_note: string;
  };
  beats: Beat[];
  pacing_notes: string;
  scene_thesis: string;
  transition_out: string;
}

/* ── Props ───────────────────────────────────────────── */

interface SceneBeatCardProps {
  scene: SceneData;
  onSaveBeat: (sceneId: number, updated: Beat) => void;
  onFlagBeat: (beat: Beat) => void;
  onFlagScene: (sceneId: number, flagType: string) => void;
}

/* ── Component ───────────────────────────────────────── */

const SceneBeatCard: React.FC<SceneBeatCardProps> = ({
  scene,
  onSaveBeat,
  onFlagBeat,
  onFlagScene,
}) => {
  const { page_budget, emotional_arc } = scene;

  return (
    <div className="scene-beat-card">
      {/* ── Header ──────────────────────────────────── */}
      <div className="scene-beat-header">
        <div className="scene-beat-title-row">
          <h3>Scene {scene.scene_id}: {scene.title}</h3>
          <span className="scene-chapter-badge">Ch.&nbsp;{scene.chapter_id}</span>
          <span className="scene-budget-info">
            {page_budget.pages.length} page{page_budget.pages.length !== 1 ? 's' : ''} · {page_budget.estimated_total_panels} panels · {page_budget.density_note}
          </span>
        </div>

        <div className="scene-flag-actions">
          <button className="flag-panel-btn" onClick={() => onFlagScene(scene.scene_id, 'general')} title="Flag this scene">
            🚩 Flag Scene
          </button>
          <button className="flag-panel-btn" onClick={() => onFlagScene(scene.scene_id, 'density')} title="Adjust density">
            ⚖️ Adjust Density
          </button>
          <button className="flag-panel-btn" onClick={() => onFlagScene(scene.scene_id, 'voice')} title="Fix voice">
            🗣️ Fix Voice
          </button>
        </div>
      </div>

      {/* ── Emotional Arc Strip ─────────────────────── */}
      <div className="emotional-arc-strip">
        <span className="arc-state">{emotional_arc.opening_state}</span>
        <span className="arc-arrow">→</span>
        <span className="arc-state arc-turning-point">{emotional_arc.turning_point}</span>
        <span className="arc-arrow">→</span>
        <span className="arc-state">{emotional_arc.closing_state}</span>
        {emotional_arc.arc_note && (
          <span className="arc-note">{emotional_arc.arc_note}</span>
        )}
      </div>

      {/* ── Beats list ──────────────────────────────── */}
      <div className="scene-beats-list">
        {scene.beats.length === 0 ? (
          <p className="no-dialogue">No beats defined for this scene.</p>
        ) : (
          scene.beats.map(beat => (
            <BeatLine
              key={beat.beat_id}
              beat={beat}
              onEdit={updated => onSaveBeat(scene.scene_id, updated)}
              onFlag={onFlagBeat}
            />
          ))
        )}
      </div>

      {/* ── Footer ──────────────────────────────────── */}
      <div className="scene-footer">
        {scene.pacing_notes && (
          <p className="scene-footer-meta">
            <strong>Pacing:</strong> {scene.pacing_notes}
          </p>
        )}

        {scene.scene_thesis && (
          <div className="scene-thesis-box">
            <span className="scene-thesis-label">Scene Thesis</span>
            <p>{scene.scene_thesis}</p>
          </div>
        )}

        {scene.transition_out && (
          <p className="scene-footer-meta">
            <strong>Transition →</strong> {scene.transition_out}
          </p>
        )}
      </div>
    </div>
  );
};

export default SceneBeatCard;
