import React from 'react';
import './styles/app.css';
import PhaseTabBar, { type PhaseId } from '@/components/layout/PhaseTabBar';
import Sidebar from '@/components/layout/Sidebar';
import Canvas from '@/components/editor/Canvas';
import QAReviewBoard from '@/components/editor/QAReviewBoard';
import PropertiesPanel from '@/components/editor/PropertiesPanel';
import ScriptPhase from '@/components/phases/script/ScriptPhase';
import PanelsPhase from '@/components/phases/panels/PanelsPhase';
import PacingPhase from '@/components/phases/pacing/PacingPhase';
import CharactersPhase from '@/components/phases/characters/CharactersPhase';
import LorePhase from '@/components/phases/lore/LorePhase';
import { useJsonFile } from '@/hooks/useJsonFile';
import type { PageData } from '@/types/assembly';
import { useEditorStore } from '@/store/useEditorStore';

function App() {
  const [activePhase, setActivePhase] = React.useState<PhaseId>('assembly');
  const [assemblyTab, setAssemblyTab] = React.useState<'assembly' | 'qa'>('assembly');
  // Load the page list from data/pages.json (the canonical source of truth)
  const { data: pagesJson } = useJsonFile<{ pages: Array<{ page_number: number }> }>('data/pages.json');
  const pages: PageData[] = (pagesJson?.pages ?? []).map(p => ({
    id: `page_${p.page_number}`,
    name: `Page ${p.page_number}`,
    panels: [],
  }));
  const [currentPageId, setCurrentPageId] = React.useState<string | null>(null);
  const elements = useEditorStore(state => state.elements);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (pages.length > 0 && !currentPageId) {
      setCurrentPageId(pages[0].id);
    }
  }, [pages, currentPageId]);

  const activePage = pages.find(p => p.id === currentPageId) || null;

  const handleExport = async () => {
    if (!currentPageId) return;
    setIsSaving(true);
    try {
      const pageElements = elements.filter(el => el.pageId === currentPageId);
      const response = await fetch('/api/save-layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId: currentPageId, elements: pageElements }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save layout');
      alert('Layout saved successfully! ✓');
    } catch (err: any) {
      alert(`Error saving layout: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const renderPhaseContent = () => {
    switch (activePhase) {
      case 'lore':       return <LorePhase />;
      case 'pacing':     return <PacingPhase />;
      case 'characters': return <CharactersPhase />;
      case 'panels':     return <PanelsPhase />;
      case 'script':     return <ScriptPhase />;
      case 'assembly':   return renderAssembly();
    }
  };

  const renderAssembly = () => (
    <>
      {/* Assembly sub-tab bar */}
      <div className="h-14 bg-background-panel/95 backdrop-blur-sm border-b border-border flex items-center justify-between px-6 shadow-sm z-20">
        <div className="flex items-center gap-4">
          <button
            className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-colors ${assemblyTab === 'assembly' ? 'bg-secondary text-border-blueprint border-b-2 border-border-blueprint' : 'text-foreground-muted hover:bg-secondary'}`}
            onClick={() => setAssemblyTab('assembly')}
          >
            Page Assembly
          </button>
          <button
            className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-colors ${assemblyTab === 'qa' ? 'bg-secondary text-border-blueprint border-b-2 border-border-blueprint' : 'text-foreground-muted hover:bg-secondary'}`}
            onClick={() => setAssemblyTab('qa')}
          >
            QA Review Board
          </button>
        </div>
        <button
          className="bg-primary text-primary-foreground px-4 py-1.5 text-sm font-medium rounded-sm shadow-sm hover:bg-primary-hover disabled:opacity-50"
          onClick={handleExport}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Export Page'}
        </button>
      </div>

      {/* Assembly main content */}
      <div className="flex-1 flex overflow-hidden">
        {assemblyTab === 'assembly' ? (
          <>
            <Sidebar
              pages={pages}
              currentPageId={currentPageId}
              onPageChange={setCurrentPageId}
              activePage={activePage}
            />
            <Canvas activePage={activePage} />
            <PropertiesPanel />
          </>
        ) : (
          <QAReviewBoard pages={pages} />
        )}
      </div>
    </>
  );

  return (
    <div className="bg-background h-screen flex flex-col font-sans overflow-hidden text-foreground">
      <PhaseTabBar activePhase={activePhase} onPhaseChange={setActivePhase} />

      <div className="flex-1 flex overflow-hidden">
        {renderPhaseContent()}
      </div>
    </div>
  );
}

export default App;
