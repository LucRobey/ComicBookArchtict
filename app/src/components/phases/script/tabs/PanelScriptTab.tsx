import React, { useState } from 'react';
import { useJsonFile } from '@/hooks/useJsonFile';
import PanelScriptCard, { type Panel } from '../PanelScriptCard';
import type { Dialogue } from '../DialogueLine';
import '../../../../styles/script.css';

/* ── Data interfaces (v2.0 schema) ───────────────────── */

interface PanelScriptPage {
  page_number: number;
  scene_ids?: number[];
  layout?: string;
  page_turn_context?: string;
  panels: Panel[];
  page_rhythm_note?: string;
}

interface PanelScriptData {
  pages: PanelScriptPage[];
}

/* ── Props ───────────────────────────────────────────── */

interface PanelScriptTabProps {
  onFlagDialogue: (dialogue: Dialogue) => void;
  onFlagPanel: (ref: { pageNumber: number; panelNumber: number }) => void;
}

/* ── Constants ───────────────────────────────────────── */

const SCRIPT_PATH = 'data/script.json';

/* ── Component ───────────────────────────────────────── */

export const PanelScriptTab: React.FC<PanelScriptTabProps> = ({
  onFlagDialogue,
  onFlagPanel,
}) => {
  const { data, loading, error, save } = useJsonFile<PanelScriptData>(SCRIPT_PATH);
  const [selectedPage, setSelectedPage] = useState(0);

  /* ── Loading state ── */
  if (loading) {
    return <div className="script-state">Loading panel script…</div>;
  }

  /* ── Error state ── */
  if (error) {
    return (
      <div className="script-state error">
        <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>⚠️</div>
        <p style={{ fontWeight: 700 }}>Could not load panel script.</p>
        <p className="script-state-sub">{error}</p>
        <p className="script-state-hint">
          Run the Phase 3B agent first to generate{' '}
          <code>data/script.json</code>
        </p>
      </div>
    );
  }

  if (!data) return null;

  const pages = data.pages || [];
  const currentPage = pages[selectedPage];

  /* ── Empty state ── */
  if (!currentPage) {
    return (
      <div className="script-state">
        <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>ℹ️</div>
        <p style={{ fontWeight: 700 }}>No script pages found.</p>
        <p className="script-state-hint">
          Run the Pacing &amp; Pagination pipeline first to populate script pages.
        </p>
      </div>
    );
  }

  /* ── Inline save handler ── */
  const handleSaveDialogue = async (panelNumber: number, updated: Dialogue) => {
    if (!data) return;
    const newData = structuredClone(data);
    const panel = newData.pages[selectedPage].panels.find(
      p => p.panel_number === panelNumber,
    );
    if (!panel || !panel.dialogues) return;
    const idx = panel.dialogues.findIndex(d => d.id === updated.id);
    if (idx === -1) return;
    panel.dialogues[idx] = updated;
    await save(newData);
  };

  return (
    <div className="script-body">
      {/* ── Page sidebar ── */}
      <div className="script-page-sidebar">
        <div className="script-sidebar-header">
          <h3>Pages</h3>
          <span className="script-total">{pages.length} total</span>
        </div>
        <div className="script-page-list">
          {pages.map((p, i) => (
            <button
              key={p.page_number}
              className={`script-page-btn ${i === selectedPage ? 'active' : ''}`}
              onClick={() => setSelectedPage(i)}
            >
              <span className="script-page-num">Page {p.page_number}</span>
              <span className="script-panel-count">
                {p.panels.length} panel{p.panels.length !== 1 ? 's' : ''}
              </span>
              {p.scene_ids && p.scene_ids.length > 0 && (
                <span className="script-scene-ids">
                  Sc {p.scene_ids.join(', ')}
                </span>
              )}
              {p.layout && (
                <span className="script-layout-tag">{p.layout}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main panel area ── */}
      <div className="script-main">
        {/* Page header */}
        <div className="script-main-header">
          <h2>Page {currentPage.page_number}</h2>
          <span className="script-panels-label">
            {currentPage.panels.length} panel{currentPage.panels.length !== 1 ? 's' : ''}
          </span>
          {currentPage.layout && (
            <span className="script-layout-badge">{currentPage.layout}</span>
          )}
          {currentPage.page_turn_context && (
            <span className="script-context-badge" title="Page-turn context">
              📖 {currentPage.page_turn_context}
            </span>
          )}
        </div>

        {/* Page rhythm note */}
        {currentPage.page_rhythm_note && (
          <div className="script-rhythm-note">
            🎵 <em>{currentPage.page_rhythm_note}</em>
          </div>
        )}

        {/* Panel list */}
        <div className="script-panels-list">
          {currentPage.panels.map(panel => (
            <PanelScriptCard
              key={panel.panel_number}
              panel={panel}
              pageNumber={currentPage.page_number}
              onSaveDialogue={handleSaveDialogue}
              onFlagDialogue={onFlagDialogue}
              onFlagPanel={pn =>
                onFlagPanel({
                  pageNumber: currentPage.page_number,
                  panelNumber: pn,
                })
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PanelScriptTab;
