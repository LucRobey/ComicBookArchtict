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
      <aside className="properties-panel bg-background-panel border-l border-border shadow-md">
        <h3>Canvas Settings</h3>
        <div className="prop-section">
          <p className="text-foreground-muted text-sm mb-5">
            No element selected. Adjust global canvas properties below.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={showGrid} 
                onChange={(e) => setShowGrid(e.target.checked)} 
              />
              Show 20px Grid
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={snapToGrid} 
                onChange={(e) => setSnapToGrid(e.target.checked)} 
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
    <aside className="properties-panel bg-background-panel border-l border-border shadow-md">
      <h3>Properties</h3>
      <div className="prop-section">
        <label>Type: <strong>{selectedElement.type.toUpperCase()}</strong></label>
      </div>

      <div className="prop-grid">
        <div className="prop-field">
          <label>X</label>
          <input 
            type="number" 
            value={Math.round(selectedElement.x)} 
            onChange={(e) => updateElementPosition(selectedElement.id, Number(e.target.value), selectedElement.y)} 
          />
        </div>
        <div className="prop-field">
          <label>Y</label>
          <input 
            type="number" 
            value={Math.round(selectedElement.y)} 
            onChange={(e) => updateElementPosition(selectedElement.id, selectedElement.x, Number(e.target.value))} 
          />
        </div>
        <div className="prop-field">
          <label>Width</label>
          <input 
            type="text" 
            value={selectedElement.width} 
            onChange={(e) => updateElementSize(selectedElement.id, e.target.value, selectedElement.height)} 
          />
        </div>
        <div className="prop-field">
          <label>Height</label>
          <input 
            type="text" 
            value={selectedElement.height} 
            onChange={(e) => updateElementSize(selectedElement.id, selectedElement.width, e.target.value)} 
          />
        </div>
      </div>

      <div className="prop-section">
        <label>Z-Index</label>
        <div className="z-controls">
          <button onClick={() => updateElementZIndex(selectedElement.id, selectedElement.zIndex - 1)}>-</button>
          <span>{selectedElement.zIndex}</span>
          <button onClick={() => updateElementZIndex(selectedElement.id, selectedElement.zIndex + 1)}>+</button>
        </div>
      </div>

      {isBubble && (
        <>
          <div className="prop-section">
            <label>Bubble Styling</label>
            <div className="prop-grid">
              <div className="prop-field">
                <label>Font Size (px)</label>
                <input 
                  type="number" 
                  value={(selectedElement as CanvasBubble).fontSize} 
                  onChange={(e) => updateElementData(selectedElement.id, { fontSize: Number(e.target.value) })} 
                />
              </div>
              <div className="prop-field">
                <label>Tail Direction</label>
                <select 
                  value={(selectedElement as CanvasBubble).tailDirection}
                  onChange={(e) => updateElementData(selectedElement.id, { tailDirection: e.target.value as any })}
                  className="w-full p-1.5 rounded bg-background text-foreground border border-border"
                >
                  <option value="none">None</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>
              <div className="prop-field">
                <label>Background</label>
                <input 
                  type="color" 
                  value={(selectedElement as CanvasBubble).backgroundColor} 
                  onChange={(e) => updateElementData(selectedElement.id, { backgroundColor: e.target.value })}
                  style={{ width: '100%', height: '30px', padding: '0', cursor: 'pointer' }}
                />
              </div>
              <div className="prop-field">
                <label>Text Color</label>
                <input 
                  type="color" 
                  value={(selectedElement as CanvasBubble).textColor} 
                  onChange={(e) => updateElementData(selectedElement.id, { textColor: e.target.value })}
                  style={{ width: '100%', height: '30px', padding: '0', cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>
          <div className="prop-section">
            <label>Dialogue Text</label>
            <textarea 
              value={(selectedElement as CanvasBubble).text} 
              onChange={(e) => updateElementData(selectedElement.id, { text: e.target.value })}
              rows={3} 
              className="w-full resize-y p-2 rounded bg-background text-foreground border border-border"
            />
          </div>
        </>
      )}

      {isPanel && (
        <div className="prop-section">
          <label>Image Cropping & Panning</label>
          <div className="prop-grid">
            <div className="prop-field">
              <label>Scale (Zoom)</label>
              <input 
                type="number" 
                step="0.1"
                min="0.1"
                value={(selectedElement as CanvasPanel).imageScale} 
                onChange={(e) => updateElementData(selectedElement.id, { imageScale: Number(e.target.value) })} 
              />
            </div>
            <div className="prop-field"></div>
            <div className="prop-field">
              <label>Pan X (px)</label>
              <input 
                type="number" 
                value={(selectedElement as CanvasPanel).imageOffsetX} 
                onChange={(e) => updateElementData(selectedElement.id, { imageOffsetX: Number(e.target.value) })} 
              />
            </div>
            <div className="prop-field">
              <label>Pan Y (px)</label>
              <input 
                type="number" 
                value={(selectedElement as CanvasPanel).imageOffsetY} 
                onChange={(e) => updateElementData(selectedElement.id, { imageOffsetY: Number(e.target.value) })} 
              />
            </div>
          </div>
        </div>
      )}

      <button className="btn-danger" onClick={() => removeElement(selectedElement.id)} style={{ marginTop: '20px', width: '100%' }}>
        Delete Element
      </button>
    </aside>
  );
};

export default PropertiesPanel;
