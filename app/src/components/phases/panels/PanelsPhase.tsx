import React, { useState } from 'react';
import { PhaseHeader } from '../../shared/PhaseHeader';
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
  const { data: panelStyle } = useJsonFile<any>('data/panel_style.json');
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

  const pages = data.pages || [];
  const currentPage = pages[selectedPage];

  if (!currentPage) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-background-panel" style={{ minHeight: 400 }}>
        <div className="border border-border shadow-md rounded-lg p-8 max-w-md text-center text-foreground bg-secondary">
          <div className="text-4xl mb-4">ℹ️</div>
          <p className="font-bold mb-2">No panel pages found.</p>
          <p className="text-sm text-foreground-muted">Run the Panel Distillation pipeline first to populate pages and panels.</p>
        </div>
      </div>
    );
  }

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
      <PhaseHeader
        title="Panel Structuring"
        emoji="📐"
        badge="Phase 2"
        description="Divides page-level action into detailed panel templates with framing, compositions, and camera directions."
        inputs={['data/pages.json', 'data/intro_pages.json', 'data/lore.json']}
        outputs={['data/panels.json']}
        accentColor="#10b981"
        nextStep={{ label: 'Script & Dialogue' }}
      />
      <div className="panels-body">
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
        {(() => {
          const pattern = panelStyle?.signature_patterns?.find((p: any) => p.pattern_id === currentPage.layout_template)
                       || panelStyle?.signature_patterns?.[0];

          const gridStyle: React.CSSProperties = pattern && panelStyle ? {
            display: 'grid',
            gridTemplateColumns: pattern.grid_template.columns,
            gridTemplateRows: pattern.grid_template.rows,
            gap: panelStyle.gutter?.size || '8px',
            padding: panelStyle.gutter?.outer_margin || '16px',
            background: '#151313', // drafting board background
            border: '2px dashed rgba(16, 185, 129, 0.2)', // signature green accent border
            borderRadius: '12px',
            width: '90%',
            aspectRatio: '800 / 1131',
            maxWidth: '700px',
            margin: '16px auto',
            alignContent: 'stretch',
            boxShadow: '0 15px 35px -5px rgba(0, 0, 0, 0.4), 0 10px 15px -6px rgba(0, 0, 0, 0.4)',
            overflow: 'hidden'
          } : {};

          return (
            <div className="panels-grid" style={gridStyle}>
              {currentPage.panels.map((panel, idx) => {
                const slot = pattern?.panel_areas?.find((sa: any) => sa.slot === panel.panel_number)
                          || pattern?.panel_areas?.[idx]
                          || pattern?.panel_areas?.[0];

                const cardStyle: React.CSSProperties = slot ? {
                  gridArea: slot.gridArea,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  boxSizing: 'border-box',
                  overflow: 'auto',
                  borderRadius: panelStyle?.panel_shapes?.border_radius || '0px',
                  border: `${panelStyle?.panel_shapes?.border_weight || '1.5px'} solid ${panelStyle?.panel_shapes?.border_color || '#000000'}`,
                  backgroundColor: '#1E293B',
                } : {};

                return (
                  <PanelStructureCard
                    key={panel.panel_number}
                    panel={panel}
                    pageNumber={currentPage.page_number}
                    onFramingChange={handleFramingChange}
                    style={cardStyle}
                    onFlag={(pn, action, chars, tags) => setQaTarget({
                      pageNumber: currentPage.page_number,
                      panelNumber: pn,
                      currentAction: action,
                      currentCharacters: chars,
                      currentTags: tags,
                    })}
                  />
                );
              })}
            </div>
          );
        })()}
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
    </div>
  );
};

export default PanelsPhase;
