import React, { useState } from 'react';
import type { PageData } from '@/types/assembly';
import { useEditorStore } from '@/store/useEditorStore';
import type { CanvasPanel } from '@/store/useEditorStore';

interface QAReviewBoardProps {
  pages: PageData[];
}

type ModType = 'none' | 'edit' | 'enhance' | 'restart';

interface Modification {
  id: string;
  pageId: string;
  elementId: string;
  type: ModType;
  description: string;
  characterName: string;
  imageUrl: string;
}

const QAReviewBoard: React.FC<QAReviewBoardProps> = ({ pages }) => {
  const [activePageId, setActivePageId] = useState<string>(pages[0]?.id || '');
  const [modifications, setModifications] = useState<Modification[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const elements = useEditorStore(state => state.elements);

  React.useEffect(() => {
    if (pages.length > 0 && !activePageId) {
      setActivePageId(pages[0].id);
    }
  }, [pages, activePageId]);

  const activePage = pages.find(p => p.id === activePageId);
  const pagePanels = elements.filter(
    el => el.pageId === activePageId && el.type === 'panel'
  ) as CanvasPanel[];
  const pageModifications = modifications.filter(m => m.pageId === activePageId);

  const addModification = (panel: CanvasPanel) => {
    if (modifications.some(m => m.elementId === panel.id)) return;
    const newMod: Modification = {
      id: `mod_${Date.now()}`,
      pageId: activePageId,
      elementId: panel.id,
      type: 'edit',
      description: '',
      characterName: '',
      imageUrl: panel.imageUrl,
    };
    setModifications([...modifications, newMod]);
  };

  const updateModification = (id: string, field: keyof Modification, value: string) => {
    setModifications(mods => mods.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const removeModification = (id: string) => {
    setModifications(mods => mods.filter(m => m.id !== id));
  };

  const handleExport = async () => {
    if (modifications.length === 0) {
      alert('No modifications to export.');
      return;
    }
    setIsExporting(true);
    try {
      let markdown = `# QA Modifications Report\n\n`;
      modifications.forEach(mod => {
        const imageName = mod.imageUrl.split('/').pop()?.split('?')[0] || `${mod.elementId}.png`;
        markdown += `## ${mod.elementId}\n`;
        markdown += `![${mod.elementId}](./${imageName})\n`;
        markdown += `* **Original Prompt:** [Unknown - See Phase 4 output]\n`;
        markdown += `* **Generation Passes Used:** [Unknown - See Phase 4 output]\n`;
        let requestText = '';
        if (mod.type === 'restart') {
          requestText = `Restart - ${mod.description}`;
        } else if (mod.type === 'enhance') {
          requestText = `Enhance ${mod.characterName} - ${mod.description}`;
        } else {
          requestText = mod.description;
        }
        markdown += `* **Modification Request:** ${requestText}\n\n`;
      });

      const response = await fetch('/api/save-modifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdownContent: markdown, pageId: activePageId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to export');
      alert('QA Report exported successfully!');
      setModifications([]);
    } catch (err: any) {
      alert(`Error exporting: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  if (!activePage) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background-panel">
        <p className="text-foreground-muted italic">No pages available</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background h-full overflow-hidden">
      {/* ── Header ── */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-border bg-background-panel shrink-0">
        <h2 className="text-lg font-heading font-bold text-foreground">QA Review Board</h2>
        <div className="flex items-center gap-4">
          <select
            id="qa-page-select"
            value={activePageId}
            onChange={(e) => setActivePageId(e.target.value)}
            className="px-3 py-1.5 bg-secondary border border-border rounded-sm text-sm text-foreground focus:outline-none focus:border-border-blueprint"
            aria-label="Select page"
          >
            {pages.map(p => (
              <option key={p.id} value={p.id}>{p.id}</option>
            ))}
          </select>
          <button
            id="qa-export-btn"
            onClick={handleExport}
            disabled={isExporting || modifications.length === 0}
            className="px-4 py-1.5 bg-primary text-primary-foreground font-medium rounded-sm text-sm hover:bg-primary-hover disabled:opacity-50 transition-colors"
          >
            {isExporting ? 'Exporting…' : 'Export QA Report (.md)'}
          </button>
        </div>
      </div>

      {/* ── Columns ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left: Page Panels */}
        <div className="w-1/2 flex flex-col border-r border-border bg-background-panel overflow-y-auto p-6">
          <h3 className="text-sm font-bold font-heading tracking-widest text-foreground mb-4">PAGE PANELS</h3>
          {pagePanels.length === 0 ? (
            <p className="text-sm text-foreground-muted italic text-center p-8 border border-dashed border-border rounded-md">
              No panels placed on this page.<br />Build the layout first.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {pagePanels.map(el => (
                <div key={el.id} className="flex gap-4 p-3 border border-border rounded-md bg-secondary/50">
                  <div className="w-24 h-24 shrink-0 bg-background rounded overflow-hidden border border-border flex items-center justify-center">
                    <img src={el.imageUrl} alt={`Panel ${el.id}`} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <span className="font-mono text-sm text-foreground-muted">{el.id}</span>
                    <button
                      id={`flag-${el.id}`}
                      onClick={() => addModification(el)}
                      disabled={modifications.some(m => m.elementId === el.id)}
                      className="self-start text-xs font-medium px-3 py-1.5 border border-border rounded-sm bg-background hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors disabled:opacity-50 disabled:bg-secondary"
                    >
                      {modifications.some(m => m.elementId === el.id) ? 'Flagged' : 'Flag Issue'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Modifications */}
        <div className="w-1/2 flex flex-col bg-background-panel overflow-y-auto p-6">
          <h3 className="text-sm font-bold font-heading tracking-widest text-foreground mb-4">FLAGGED MODIFICATIONS</h3>
          {pageModifications.length === 0 ? (
            <p className="text-sm text-foreground-muted italic text-center p-8 border border-dashed border-border rounded-md">
              No issues flagged for this page.
            </p>
          ) : (
            <div className="flex flex-col gap-6">
              {pageModifications.map(mod => (
                <div key={mod.id} className="flex flex-col gap-4 p-4 border border-border rounded-md bg-background shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 shrink-0 bg-secondary rounded overflow-hidden border border-border">
                        <img src={mod.imageUrl} alt={`Thumbnail for ${mod.elementId}`} className="w-full h-full object-cover" />
                      </div>
                      <span className="font-mono text-sm font-medium text-foreground">{mod.elementId}</span>
                    </div>
                    <button
                      onClick={() => removeModification(mod.id)}
                      className="text-xs text-foreground-muted hover:text-destructive transition-colors"
                      aria-label={`Remove modification for ${mod.elementId}`}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor={`type-${mod.id}`} className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">Modification Type</label>
                    <select
                      id={`type-${mod.id}`}
                      value={mod.type}
                      onChange={(e) => updateModification(mod.id, 'type', e.target.value)}
                      className="px-3 py-2 bg-secondary border border-border rounded-sm text-sm text-foreground focus:outline-none focus:border-border-blueprint"
                    >
                      <option value="edit">Edit Prompt (Minor changes)</option>
                      <option value="enhance">Enhance (Fix character face/blending)</option>
                      <option value="restart">Restart (Full regeneration)</option>
                    </select>
                  </div>

                  {mod.type === 'enhance' && (
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor={`char-${mod.id}`} className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">Character Name(s)</label>
                      <input
                        id={`char-${mod.id}`}
                        type="text"
                        value={mod.characterName}
                        onChange={(e) => updateModification(mod.id, 'characterName', e.target.value)}
                        placeholder="e.g. Character A"
                        className="px-3 py-2 bg-secondary border border-border rounded-sm text-sm text-foreground focus:outline-none focus:border-border-blueprint"
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor={`desc-${mod.id}`} className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">Additional Instructions</label>
                    <textarea
                      id={`desc-${mod.id}`}
                      value={mod.description}
                      onChange={(e) => updateModification(mod.id, 'description', e.target.value)}
                      placeholder={
                        mod.type === 'restart'
                          ? 'What should change in the new prompt?'
                          : 'Any specific notes?'
                      }
                      rows={3}
                      className="px-3 py-2 bg-secondary border border-border rounded-sm text-sm text-foreground focus:outline-none focus:border-border-blueprint resize-y"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QAReviewBoard;
