import React, { useState } from 'react';
import { useJsonFile } from '@/hooks/useJsonFile';
import { exportQaReport } from '@/utils/qaExport';
import PanelStructureCard, { type PanelData } from './PanelStructureCard';
import PanelsQADrawer from './PanelsQADrawer';
import '../../../styles/panels.css';

interface PanelsPage {
  page_number: number;
  panels: PanelData[];
}

interface PanelsData {
  pages: PanelsPage[];
}

const PANELS_PATH = 'data/panels.json';

const PanelsPhase: React.FC = () => {
  const { data, loading, error, save } = useJsonFile<PanelsData>(PANELS_PATH);
  const [selectedPage, setSelectedPage] = useState(0);
  const [qaTarget, setQaTarget] = useState<{
    pageNumber: number; panelNumber: number;
    currentAction: string; currentCharacters: string[]; currentTags: string[];
  } | null>(null);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  if (loading) return <div className="panels-state">Loading panels…</div>;
  if (error) return (
    <div className="w-full h-full flex items-center justify-center bg-background-panel">
      <div className="border border-border shadow-md rounded-lg p-8 max-w-md text-center text-foreground bg-secondary">
        <div className="text-4xl mb-4 text-warning">⚠️</div>
        <p className="font-bold mb-2">Could not load panels.</p>
        <p className="text-sm font-mono text-destructive mb-4">{error}</p>
        <p className="text-sm text-foreground-muted">Run the Phase 2 agent first to generate <code className="bg-background-panel px-1.5 py-0.5 rounded-sm border border-border">data/panels.json</code></p>
      </div>
    </div>
  );
  if (!data) return null;

  const pages = data.pages;
  const currentPage = pages[selectedPage];

  const handleFramingChange = async (panelNumber: number, newFraming: string) => {
    const newData = structuredClone(data);
    const panel = newData.pages[selectedPage].panels.find(p => p.panel_number === panelNumber);
    if (!panel) return;
    panel.framing = newFraming;
    await save(newData);
  };

  const handleExportQa = async (reportContent: string) => {
    const result = await exportQaReport({
      phase: '2',
      phaseFolder: 'structure',
      content: reportContent,
    });
    setExportStatus(result.success ? 'success' : 'error');
    setTimeout(() => setExportStatus('idle'), 3000);
  };

  // Count total panels across all pages
  const totalPanels = pages.reduce((sum, p) => sum + p.panels.length, 0);

  return (
    <div className="panels-phase">
      {/* Page sidebar */}
      <div className="panels-sidebar bg-background-panel border-r border-border shadow-sm">
        <div className="panels-sidebar-header">
          <h3>Pages</h3>
          <span className="panels-total">{totalPanels} panels</span>
        </div>
        <div className="panels-page-list">
          {pages.map((p, i) => (
            <button
              key={p.page_number}
              className={`panels-page-btn ${i === selectedPage ? 'active' : ''}`}
              onClick={() => setSelectedPage(i)}
            >
              <span className="panels-page-num">Page {p.page_number}</span>
              <span className="panels-panel-count">{p.panels.length} panels</span>
            </button>
          ))}
        </div>
        {exportStatus !== 'idle' && (
          <div className={`panels-export-toast ${exportStatus}`}>
            {exportStatus === 'success' ? '✓ QA report exported!' : '✗ Export failed'}
          </div>
        )}
      </div>

      {/* Main panels grid */}
      <div className="panels-main">
        <div className="panels-main-header">
          <h2>Page {currentPage.page_number}</h2>
          <span className="panels-count-label">{currentPage.panels.length} panels</span>
          <span className="panels-inline-hint">📐 Camera angle changes save instantly</span>
        </div>
        <div className="panels-grid">
          {currentPage.panels.map(panel => (
            <PanelStructureCard
              key={panel.panel_number}
              panel={panel}
              pageNumber={currentPage.page_number}
              onFramingChange={handleFramingChange}
              onFlag={(pn, action, chars, tags) => setQaTarget({
                pageNumber: currentPage.page_number,
                panelNumber: pn,
                currentAction: action,
                currentCharacters: chars,
                currentTags: tags,
              })}
            />
          ))}
        </div>
      </div>

      {/* QA Drawer */}
      {qaTarget && (
        <PanelsQADrawer
          target={qaTarget}
          onClose={() => setQaTarget(null)}
          onExport={handleExportQa}
        />
      )}
    </div>
  );
};

export default PanelsPhase;
