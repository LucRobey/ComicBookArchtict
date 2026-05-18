import React, { useState } from 'react';
import { useJsonFile } from '@/hooks/useJsonFile';
import { exportQaReport, buildQaHeader } from '@/utils/qaExport';
import PanelScriptCard, { type Panel } from './PanelScriptCard';
import ScriptQADrawer from './ScriptQADrawer';
import type { Dialogue } from './DialogueLine';
import '../../../styles/script.css';

interface ScriptPage {
  page_number: number;
  panels: Panel[];
}

interface ScriptData {
  pages: ScriptPage[];
}

const SCRIPT_PATH = 'data/script.json';

const ScriptPhase: React.FC = () => {
  const { data, loading, error, save } = useJsonFile<ScriptData>(SCRIPT_PATH);
  const [selectedPage, setSelectedPage] = useState(0);
  const [qaTarget, setQaTarget] = useState<{ type: 'line' | 'panel'; dialogue?: Dialogue; panelRef?: { pageNumber: number; panelNumber: number } } | null>(null);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  if (loading) return <div className="script-state">Loading script…</div>;
  if (error) return (
    <div className="bg-background-panel border border-border shadow-md rounded-lg p-8 max-w-md mx-auto mt-20 text-center text-foreground">
      <div className="text-4xl mb-4 text-warning">⚠️</div>
      <p className="font-bold mb-2">Could not load script.</p>
      <p className="text-sm font-mono text-destructive mb-4">{error}</p>
      <p className="text-sm text-foreground-muted">Run the Phase 3 agent first to generate <code className="bg-secondary px-1.5 py-0.5 rounded-sm">data/script.json</code></p>
    </div>
  );
  if (!data) return null;

  const pages = data.pages;
  const currentPage = pages[selectedPage];

  const handleSaveDialogue = async (panelNumber: number, updated: Dialogue) => {
    const newData = structuredClone(data);
    const panel = newData.pages[selectedPage].panels.find(p => p.panel_number === panelNumber);
    if (!panel) return;
    const idx = panel.dialogues.findIndex(d => d.id === updated.id);
    if (idx === -1) return;
    panel.dialogues[idx] = updated;
    await save(newData);
  };

  const handleExportQa = async (reportContent: string) => {
    const header = buildQaHeader('Phase 3 (Script)');
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
      {/* Page sidebar */}
      <div className="script-page-sidebar bg-background-panel border-r border-border shadow-sm">
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
              <span className="script-panel-count">{p.panels.length} panels</span>
            </button>
          ))}
        </div>

        {exportStatus !== 'idle' && (
          <div className={`script-export-toast ${exportStatus}`}>
            {exportStatus === 'success' ? '✓ QA report exported!' : '✗ Export failed'}
          </div>
        )}
      </div>

      {/* Script main area */}
      <div className="script-main">
        <div className="script-main-header">
          <h2>Page {currentPage.page_number}</h2>
          <span className="script-panels-label">{currentPage.panels.length} panels</span>
        </div>

        <div className="script-panels-list">
          {currentPage.panels.map(panel => (
            <PanelScriptCard
              key={panel.panel_number}
              panel={panel}
              pageNumber={currentPage.page_number}
              onSaveDialogue={(panelNumber, updated) =>
                handleSaveDialogue(panelNumber, updated)
              }
              onFlagDialogue={d => setQaTarget({ type: 'line', dialogue: d })}
              onFlagPanel={pn => setQaTarget({
                type: 'panel',
                panelRef: { pageNumber: currentPage.page_number, panelNumber: pn }
              })}
            />
          ))}
        </div>
      </div>

      {/* QA Drawer */}
      {qaTarget && (
        <ScriptQADrawer
          target={qaTarget}
          onClose={() => setQaTarget(null)}
          onExport={handleExportQa}
        />
      )}
    </div>
  );
};

export default ScriptPhase;
