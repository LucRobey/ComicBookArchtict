import React, { useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import type { CanvasBubble, CanvasPanel } from '@/store/useEditorStore';

const PropertiesPanel: React.FC = () => {
  const { 
    elements, 
    selectedElementId, 
    updateElementPosition, 
    updateElementSize, 
    updateElementZIndex,
    updateElementData,
    removeElement 
  } = useEditorStore();

  const selectedElement = elements.find(el => el.id === selectedElementId);

  // Keyboard shortcut for deleting the selected element
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Prevent deleting if the user is typing in an input field
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
          return;
        }
        if (selectedElementId) {
          removeElement(selectedElementId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, removeElement]);

  const { 
    showGrid, 
    snapToGrid, 
    setShowGrid, 
    setSnapToGrid 
  } = useEditorStore();

  if (!selectedElement) {
    return (
      <aside className="w-72 flex-shrink-0 flex flex-col bg-background-panel border-l border-border shadow-md overflow-y-auto">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-bold font-heading tracking-widest text-foreground uppercase">Canvas Settings</h3>
        </div>
        <div className="p-4 space-y-4">
          <p className="text-foreground-muted text-sm">
            No element selected. Adjust global canvas properties below.
          </p>
          
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-foreground">
              <input 
                type="checkbox" 
                checked={showGrid} 
                onChange={(e) => setShowGrid(e.target.checked)} 
                className="rounded border-border text-border-blueprint focus:ring-border-blueprint"
              />
              Show 20px Grid
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-foreground">
              <input 
                type="checkbox" 
                checked={snapToGrid} 
                onChange={(e) => setSnapToGrid(e.target.checked)} 
                className="rounded border-border text-border-blueprint focus:ring-border-blueprint"
              />
              Snap Elements to Grid
            </label>
          </div>
        </div>
      </aside>
    );
  }

  const isBubble = selectedElement.type === 'bubble';
  const isPanel = selectedElement.type === 'panel';

  return (
    <aside className="w-72 flex-shrink-0 flex flex-col bg-background-panel border-l border-border shadow-md overflow-y-auto pb-4">
      <div className="p-4 border-b border-border shrink-0">
        <h3 className="text-sm font-bold font-heading tracking-widest text-foreground uppercase">Properties</h3>
      </div>

      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">Type</span>
          <span className="text-sm font-bold text-foreground">{selectedElement.type.toUpperCase()}</span>
        </div>
      </div>

      <div className="p-4 border-b border-border">
        <h4 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-3">Geometry</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground-muted">X</label>
            <input 
              type="number" 
              value={Math.round(selectedElement.x)} 
              onChange={(e) => updateElementPosition(selectedElement.id, Number(e.target.value), selectedElement.y)} 
              className="w-full px-2 py-1.5 bg-secondary border border-border rounded-sm text-sm text-foreground focus:outline-none focus:border-border-blueprint"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground-muted">Y</label>
            <input 
              type="number" 
              value={Math.round(selectedElement.y)} 
              onChange={(e) => updateElementPosition(selectedElement.id, selectedElement.x, Number(e.target.value))} 
              className="w-full px-2 py-1.5 bg-secondary border border-border rounded-sm text-sm text-foreground focus:outline-none focus:border-border-blueprint"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground-muted">Width</label>
            <input 
              type="text" 
              value={selectedElement.width} 
              onChange={(e) => updateElementSize(selectedElement.id, e.target.value, selectedElement.height)} 
              className="w-full px-2 py-1.5 bg-secondary border border-border rounded-sm text-sm text-foreground focus:outline-none focus:border-border-blueprint"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground-muted">Height</label>
            <input 
              type="text" 
              value={selectedElement.height} 
              onChange={(e) => updateElementSize(selectedElement.id, selectedElement.width, e.target.value)} 
              className="w-full px-2 py-1.5 bg-secondary border border-border rounded-sm text-sm text-foreground focus:outline-none focus:border-border-blueprint"
            />
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">Z-Index</label>
          <div className="flex items-center gap-2">
            <button className="px-2 py-0.5 bg-secondary border border-border rounded-sm text-foreground hover:bg-border transition-colors" onClick={() => updateElementZIndex(selectedElement.id, selectedElement.zIndex - 1)}>-</button>
            <span className="text-sm font-medium w-6 text-center">{selectedElement.zIndex}</span>
            <button className="px-2 py-0.5 bg-secondary border border-border rounded-sm text-foreground hover:bg-border transition-colors" onClick={() => updateElementZIndex(selectedElement.id, selectedElement.zIndex + 1)}>+</button>
          </div>
        </div>
      </div>

      {isBubble && (
        <>
          <div className="p-4 border-b border-border">
            <h4 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-3">Bubble Styling</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground-muted">Font Size (px)</label>
                <input 
                  type="number" 
                  value={(selectedElement as CanvasBubble).fontSize} 
                  onChange={(e) => updateElementData(selectedElement.id, { fontSize: Number(e.target.value) })} 
                  className="w-full px-2 py-1.5 bg-secondary border border-border rounded-sm text-sm text-foreground focus:outline-none focus:border-border-blueprint"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground-muted">Tail Direction</label>
                <select 
                  value={(selectedElement as CanvasBubble).tailDirection}
                  onChange={(e) => updateElementData(selectedElement.id, { tailDirection: e.target.value as any })}
                  className="w-full px-2 py-1.5 bg-secondary border border-border rounded-sm text-sm text-foreground focus:outline-none focus:border-border-blueprint"
                >
                  <option value="none">None</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground-muted">Background</label>
                <input 
                  type="color" 
                  value={(selectedElement as CanvasBubble).backgroundColor} 
                  onChange={(e) => updateElementData(selectedElement.id, { backgroundColor: e.target.value })}
                  className="w-full h-8 p-0 cursor-pointer rounded-sm border border-border bg-secondary"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground-muted">Text Color</label>
                <input 
                  type="color" 
                  value={(selectedElement as CanvasBubble).textColor} 
                  onChange={(e) => updateElementData(selectedElement.id, { textColor: e.target.value })}
                  className="w-full h-8 p-0 cursor-pointer rounded-sm border border-border bg-secondary"
                />
              </div>
            </div>
          </div>
          <div className="p-4 border-b border-border">
            <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2 block">Dialogue Text</label>
            <textarea 
              value={(selectedElement as CanvasBubble).text} 
              onChange={(e) => updateElementData(selectedElement.id, { text: e.target.value })}
              rows={4} 
              className="w-full px-2 py-2 bg-secondary border border-border rounded-sm text-sm text-foreground focus:outline-none focus:border-border-blueprint resize-y"
            />
          </div>
        </>
      )}

      {isPanel && (
        <div className="p-4 border-b border-border">
          <h4 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-3">Image Cropping</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground-muted">Scale (Zoom)</label>
              <input 
                type="number" 
                step="0.1"
                min="0.1"
                value={(selectedElement as CanvasPanel).imageScale} 
                onChange={(e) => updateElementData(selectedElement.id, { imageScale: Number(e.target.value) })} 
                className="w-full px-2 py-1.5 bg-secondary border border-border rounded-sm text-sm text-foreground focus:outline-none focus:border-border-blueprint"
              />
            </div>
            <div className="flex flex-col gap-1.5"></div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground-muted">Pan X (px)</label>
              <input 
                type="number" 
                value={(selectedElement as CanvasPanel).imageOffsetX} 
                onChange={(e) => updateElementData(selectedElement.id, { imageOffsetX: Number(e.target.value) })} 
                className="w-full px-2 py-1.5 bg-secondary border border-border rounded-sm text-sm text-foreground focus:outline-none focus:border-border-blueprint"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground-muted">Pan Y (px)</label>
              <input 
                type="number" 
                value={(selectedElement as CanvasPanel).imageOffsetY} 
                onChange={(e) => updateElementData(selectedElement.id, { imageOffsetY: Number(e.target.value) })} 
                className="w-full px-2 py-1.5 bg-secondary border border-border rounded-sm text-sm text-foreground focus:outline-none focus:border-border-blueprint"
              />
            </div>
          </div>
        </div>
      )}

      <div className="p-4 mt-auto">
        <button 
          onClick={() => removeElement(selectedElement.id)} 
          className="w-full px-4 py-2 bg-destructive/10 text-destructive border border-destructive/30 rounded-sm font-medium hover:bg-destructive hover:text-white transition-colors text-sm"
        >
          Delete Element
        </button>
      </div>
    </aside>
  );
};

export default PropertiesPanel;
