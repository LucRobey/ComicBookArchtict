import React, { useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { useEditorStore } from '@/store/useEditorStore';
import type { CanvasBubble, CanvasPanel } from '@/store/useEditorStore';
import type { PageData } from '@/types/assembly';

interface CanvasProps {
  activePage: PageData | null;
}

const Canvas: React.FC<CanvasProps> = ({ activePage }) => {
  const { 
    elements, 
    initializePanelsIfEmpty, 
    addElement, 
    updateElementPosition, 
    updateElementSize,
    selectedElementId,
    setSelectedElementId,
    showGrid,
    snapToGrid
  } = useEditorStore();

  const canvasRef = useRef<HTMLDivElement>(null);

  const replaceElementsForPage = useEditorStore(state => state.replaceElementsForPage);

  // Initialize panels or load layout when a new page is loaded
  useEffect(() => {
    if (activePage && activePage.id) {
      fetch(`/api/load-layout?pageId=${activePage.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.elements) {
            replaceElementsForPage(activePage.id, data.elements);
          } else {
            initializePanelsIfEmpty(activePage.id, activePage.panels || []);
          }
        })
        .catch(err => {
          console.error("Failed to load layout:", err);
          initializePanelsIfEmpty(activePage.id, activePage.panels || []);
        });
    }
  }, [activePage, initializePanelsIfEmpty, replaceElementsForPage]);

  if (!activePage) return <div className="canvas-container">Select a page to start</div>;

  const pageElements = elements.filter(el => el.pageId === activePage.id);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!canvasRef.current) return;

    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (!dataStr) return;
      const data = JSON.parse(dataStr);

      if (data.type === 'dialogue') {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const newBubble: CanvasBubble = {
          id: `bubble_${Date.now()}`,
          type: 'bubble',
          dialogueId: data.item.id || `dlg_${Date.now()}`,
          text: data.item.text || data.item.dialogue || '',
          char: data.item.char || data.item.character || 'UNKNOWN',
          x,
          y,
          width: 200,
          height: 'auto',
          zIndex: 100, // Top by default
          styleType: 'speech',
          pageId: activePage.id,
          fontSize: 16,
          backgroundColor: '#ffffff',
          textColor: '#000000',
          tailDirection: 'none'
        };

        addElement(newBubble);
        setSelectedElementId(newBubble.id);
      }
    } catch (err) {
      console.error('Error parsing dropped data', err);
    }
  };

  // Helper to handle deselection if clicking empty space
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setSelectedElementId(null);
    }
  };

  return (
    <div className="canvas-container">
      <div 
        className="canvas-page" 
        id="export-target"
        ref={canvasRef}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleCanvasClick}
        style={{ 
          position: 'relative', 
          width: '800px', 
          height: '1131px', 
          backgroundColor: 'white', 
          margin: '0 auto', 
          overflow: 'hidden',
          backgroundImage: showGrid ? 'linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)' : 'none',
          backgroundSize: showGrid ? '20px 20px' : 'auto'
        }}
      >
        {pageElements.map((el) => (
          <Rnd
            key={el.id}
            size={{ width: el.width, height: el.height }}
            position={{ x: el.x, y: el.y }}
            onDragStop={(_e, d) => updateElementPosition(el.id, d.x, d.y)}
            onResizeStop={(_e, _direction, ref, _delta, position) => {
              updateElementSize(el.id, ref.style.width, ref.style.height);
              updateElementPosition(el.id, position.x, position.y);
            }}
            bounds="parent"
            dragGrid={snapToGrid ? [20, 20] : [1, 1]}
            resizeGrid={snapToGrid ? [20, 20] : [1, 1]}
            style={{ zIndex: el.zIndex }}
            onMouseDown={() => setSelectedElementId(el.id)}
            className={`canvas-element ${selectedElementId === el.id ? 'selected' : ''}`}
          >
            {el.type === 'panel' ? (
              <div style={{ 
                width: '100%', 
                height: '100%', 
                border: selectedElementId === el.id ? '2px solid #0066cc' : 'none',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <img 
                  src={(el as CanvasPanel).imageUrl} 
                  alt="Comic Panel" 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    transform: `scale(${(el as CanvasPanel).imageScale}) translate(${(el as CanvasPanel).imageOffsetX}px, ${(el as CanvasPanel).imageOffsetY}px)`,
                    transformOrigin: 'center'
                  }} 
                  draggable={false} 
                />
              </div>
            ) : (
              <div 
                className={`bubble-render ${(el as CanvasBubble).styleType}`}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  background: (el as CanvasBubble).backgroundColor, 
                  border: '2px solid black',
                  borderRadius: '20px',
                  padding: '10px',
                  boxShadow: selectedElementId === el.id ? '0 0 0 2px #0066cc' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  fontFamily: 'sans-serif',
                  fontSize: `${(el as CanvasBubble).fontSize}px`,
                  color: (el as CanvasBubble).textColor,
                  position: 'relative'
                }}
              >
                {(el as CanvasBubble).text}
                
                {/* SVG Tail Rendering */}
                {(el as CanvasBubble).tailDirection === 'left' && (
                  <svg width="30" height="30" viewBox="0 0 30 30" style={{ position: 'absolute', bottom: '-28px', left: '20px', zIndex: -1 }}>
                    <path d="M 0 30 Q 10 10 15 0 L 25 0 Q 15 15 20 30 Z" fill={(el as CanvasBubble).backgroundColor} stroke="black" strokeWidth="2" />
                  </svg>
                )}
                {(el as CanvasBubble).tailDirection === 'right' && (
                  <svg width="30" height="30" viewBox="0 0 30 30" style={{ position: 'absolute', bottom: '-28px', right: '20px', zIndex: -1 }}>
                    <path d="M 30 30 Q 20 10 15 0 L 5 0 Q 15 15 10 30 Z" fill={(el as CanvasBubble).backgroundColor} stroke="black" strokeWidth="2" />
                  </svg>
                )}
              </div>
            )}
          </Rnd>
        ))}
      </div>
    </div>
  );
};

export default Canvas;
