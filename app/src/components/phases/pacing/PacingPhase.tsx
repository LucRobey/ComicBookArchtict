import React, { useState } from 'react';
import { useJsonFile } from '@/hooks/useJsonFile';
import { exportQaReport } from '@/utils/qaExport';
import PacingQADrawer from './PacingQADrawer';
import '../../../styles/pacing.css';
import type { PagesData } from '@/types/data';

const PAGES_PATH = 'data/pages.json';

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  cover:          { label: 'COVER',          color: '#f59e0b', icon: '⭐' },
  character_intro:{ label: 'CHAR INTRO',     color: '#8b5cf6', icon: '🎭' },
  interior:       { label: 'INTERIOR',       color: '#06b6d4', icon: '📄' },
  chapter_break:  { label: 'CHAPTER BREAK',  color: '#ec4899', icon: '💥' },
  splash:         { label: 'SPLASH',         color: '#f97316', icon: '🌊' },
};

function getTypeConfig(type: string) {
  return TYPE_CONFIG[type] ?? { label: type.toUpperCase(), color: '#64748b', icon: '📄' };
}

const PacingPhase: React.FC = () => {
  const { data, loading, error } = useJsonFile<PagesData>(PAGES_PATH);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [qaTarget, setQaTarget] = useState<{ pageNumber: number; currentFocus: string; currentType: string } | null>(null);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  if (loading) return <div className="pacing-state">Loading pages…</div>;
  if (error) return (
    <div className="pacing-state error">
      <div style={{ fontSize: '2rem' }}>⚠️</div>
      <p>Could not load pages.</p>
      <p className="pacing-state-sub">{error}</p>
      <p className="pacing-state-hint">Run the Phase 1.5 agent first to generate <code>data/pages.json</code></p>
    </div>
  );
  if (!data) return null;

  const handleExportQa = async (reportContent: string) => {
    const result = await exportQaReport({
      phase: '1',
      phaseFolder: 'pacing',
      content: reportContent,
    });
    setExportStatus(result.success ? 'success' : 'error');
    setTimeout(() => setExportStatus('idle'), 3000);
  };

  return (
    <div className="pacing-phase bg-background-panel">
      {/* Header bar */}
      <div className="pacing-top-bar bg-background-panel border-b border-border shadow-sm">
        <div className="pacing-top-stats">
          <span className="pacing-stat">
            <span className="pacing-stat-num">{data.total_pages}</span>
            <span className="pacing-stat-label">Total Pages</span>
          </span>
          <span className="pacing-divider" />
          <span className="pacing-stat">
            <span className="pacing-stat-num">{data.pages.filter(p => p.type === 'interior').length}</span>
            <span className="pacing-stat-label">Interior</span>
          </span>
          <span className="pacing-divider" />
          <span className="pacing-stat">
            <span className="pacing-stat-num">{data.pages.filter(p => p.type === 'character_intro').length}</span>
            <span className="pacing-stat-label">Char Intros</span>
          </span>
          <span className="pacing-divider" />
          <span className="pacing-stat">
            <span className="pacing-stat-num">{data.pages.filter(p => p.anecdotes_included.length > 0).length}</span>
            <span className="pacing-stat-label">With Anecdotes</span>
          </span>
        </div>
        {exportStatus !== 'idle' && (
          <div className={`pacing-toast ${exportStatus}`}>
            {exportStatus === 'success' ? '✓ QA report exported!' : '✗ Export failed'}
          </div>
        )}
      </div>

      {/* Page list + QA drawer */}
      <div className="pacing-body">
        <div className="pacing-list">
          {data.pages.map(page => {
            const tc = getTypeConfig(page.type);
            const isExpanded = expanded === page.page_number;
            return (
              <div
                key={page.page_number}
                className={`pacing-card ${isExpanded ? 'expanded' : ''}`}
                style={{ borderLeftColor: tc.color }}
              >
                <div className="pacing-card-header" onClick={() => setExpanded(isExpanded ? null : page.page_number)}>
                  <div className="pacing-card-left">
                    <span className="pacing-page-num">Page {page.page_number}</span>
                    <span className="pacing-type-badge" style={{ background: `${tc.color}22`, color: tc.color, borderColor: `${tc.color}55` }}>
                      {tc.icon} {tc.label}
                    </span>
                    {page.character && (
                      <span className="pacing-char-badge">{page.character}</span>
                    )}
                    {page.scene_id !== null && (
                      <span className="pacing-scene-ref">Scene {page.scene_id}</span>
                    )}
                  </div>
                  <div className="pacing-card-right">
                    {page.anecdotes_included.length > 0 && (
                      <span className="pacing-anecdote-count" title={page.anecdotes_included.join(', ')}>
                        📌 {page.anecdotes_included.length}
                      </span>
                    )}
                    <button
                      className="pacing-flag-btn"
                      onClick={e => {
                        e.stopPropagation();
                        setQaTarget({ pageNumber: page.page_number, currentFocus: page.focus, currentType: page.type });
                      }}
                    >
                      🚩
                    </button>
                    <span className="pacing-expand-icon">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>

                <p className={`pacing-focus ${isExpanded ? 'visible' : ''}`}>{page.focus}</p>

                {isExpanded && page.anecdotes_included.length > 0 && (
                  <div className="pacing-anecdotes">
                    {page.anecdotes_included.map(a => (
                      <span key={a} className="pacing-anecdote-tag">📌 {a}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {qaTarget && (
          <PacingQADrawer
            target={qaTarget}
            onClose={() => setQaTarget(null)}
            onExport={handleExportQa}
          />
        )}
      </div>
    </div>
  );
};

export default PacingPhase;
