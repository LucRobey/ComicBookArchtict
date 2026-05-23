import { create } from 'zustand';

export interface CanvasElement {
  id: string;
  type: 'bubble' | 'panel';
  x: number;
  y: number;
  width: number | string;
  height: number | string;
  zIndex: number;
  pageId: string;
}

export interface CanvasBubble extends CanvasElement {
  type: 'bubble';
  dialogueId: string;
  text: string;
  char: string;
  styleType: string;
  fontSize: number;
  backgroundColor: string;
  textColor: string;
  tailDirection: 'left' | 'right' | 'none';
}

export interface CanvasPanel extends CanvasElement {
  type: 'panel';
  imageUrl: string;
  imageScale: number;
  imageOffsetX: number;
  imageOffsetY: number;
}

interface EditorState {
  elements: (CanvasBubble | CanvasPanel)[];
  selectedElementId: string | null;
  
  showGrid: boolean;
  snapToGrid: boolean;
  
  // Actions
  setShowGrid: (show: boolean) => void;
  setSnapToGrid: (snap: boolean) => void;
  setSelectedElementId: (id: string | null) => void;
  addElement: (element: CanvasBubble | CanvasPanel) => void;
  updateElementPosition: (id: string, x: number, y: number) => void;
  updateElementSize: (id: string, width: number | string, height: number | string) => void;
  updateElementZIndex: (id: string, zIndex: number) => void;
  updateElementData: (id: string, data: Record<string, any>) => void;
  removeElement: (id: string) => void;
  clearElementsForPage: (pageId: string) => void;
  replaceElementsForPage: (pageId: string, elements: (CanvasBubble | CanvasPanel)[]) => void;
  initializePanelsIfEmpty: (pageId: string, panels: string[]) => void;
  initializeLayout: (
    pageId: string,
    panels: { panel_number: number }[],
    layoutTemplate: string,
    panelStyle: any
  ) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  elements: [],
  selectedElementId: null,
  showGrid: false,
  snapToGrid: false,

  setShowGrid: (show) => set({ showGrid: show }),
  setSnapToGrid: (snap) => set({ snapToGrid: snap }),

  setSelectedElementId: (id) => set({ selectedElementId: id }),
  
  addElement: (element) => set((state) => ({ 
    elements: [...state.elements, element] 
  })),
  
  updateElementPosition: (id, x, y) => set((state) => ({
    elements: state.elements.map(el => el.id === id ? { ...el, x, y } : el)
  })),
  
  updateElementSize: (id, width, height) => set((state) => ({
    elements: state.elements.map(el => el.id === id ? { ...el, width, height } : el)
  })),

  updateElementZIndex: (id, zIndex) => set((state) => ({
    elements: state.elements.map(el => el.id === id ? { ...el, zIndex } : el)
  })),

  updateElementData: (id, data) => set((state) => ({
    elements: state.elements.map(el => el.id === id ? { ...el, ...data } : el) as (CanvasBubble | CanvasPanel)[]
  })),
  
  removeElement: (id) => set((state) => ({
    elements: state.elements.filter(el => el.id !== id),
    selectedElementId: state.selectedElementId === id ? null : state.selectedElementId
  })),
  
  clearElementsForPage: (pageId) => set((state) => ({
    elements: state.elements.filter(el => el.pageId !== pageId),
    selectedElementId: null
  })),

  replaceElementsForPage: (pageId, newElements) => set((state) => {
    const otherElements = state.elements.filter(el => el.pageId !== pageId);
    return {
      elements: [...otherElements, ...newElements],
      selectedElementId: null
    };
  }),

  initializePanelsIfEmpty: (pageId, panelUrls) => {
    const state = get();
    const hasPanels = state.elements.some(el => el.pageId === pageId && el.type === 'panel');
    if (!hasPanels) {
      const newPanels: CanvasPanel[] = panelUrls.map((url, index) => ({
        id: `panel_${pageId}_${index}`,
        type: 'panel',
        imageUrl: url,
        x: 20 + (index * 40),
        y: 20 + (index * 40),
        width: 300,
        height: 'auto',
        zIndex: index, // panels at bottom
        pageId,
        imageScale: 1,
        imageOffsetX: 0,
        imageOffsetY: 0
      }));
      set({ elements: [...state.elements, ...newPanels] });
    }
  },

  initializeLayout: (pageId, panels, layoutTemplate, panelStyle) => {
    const state = get();
    const hasPanels = state.elements.some(el => el.pageId === pageId && el.type === 'panel');
    if (!hasPanels && panels.length > 0) {
      const pattern = panelStyle.signature_patterns?.find((p: any) => p.pattern_id === layoutTemplate) 
                   || panelStyle.signature_patterns?.[0];

      if (!pattern) {
        // Fallback to basic layout if style is missing or invalid
        const newPanels: CanvasPanel[] = panels.map((panel, index) => ({
          id: `panel_${pageId}_${panel.panel_number}`,
          type: 'panel',
          imageUrl: `/api/load-image?path=data/images/${pageId}/panel_${panel.panel_number}.png`,
          x: 20 + (index * 40),
          y: 20 + (index * 40),
          width: 300,
          height: 200,
          zIndex: index,
          pageId,
          imageScale: 1,
          imageOffsetX: 0,
          imageOffsetY: 0
        }));
        set({ elements: [...state.elements, ...newPanels] });
        return;
      }

      // Parse grid definitions from style guidelines
      const colWeights = pattern.grid_template.columns.split(/\s+/).map((s: string) => parseFloat(s));
      const rowWeights = pattern.grid_template.rows.split(/\s+/).map((s: string) => parseFloat(s));

      const outerMargin = parseInt(panelStyle.gutter?.outer_margin) || 16;
      const gutterSize = parseInt(panelStyle.gutter?.size) || 8;

      const PAGE_WIDTH = 800;
      const PAGE_HEIGHT = 1131;

      // Calculate column widths and row heights
      const activeWidth = PAGE_WIDTH - 2 * outerMargin;
      const totalColWeight = colWeights.reduce((a, b) => a + b, 0);
      const colWidths = colWeights.map(w => 
        (activeWidth - (colWeights.length - 1) * gutterSize) * (w / totalColWeight)
      );

      const activeHeight = PAGE_HEIGHT - 2 * outerMargin;
      const totalRowWeight = rowWeights.reduce((a, b) => a + b, 0);
      const rowHeights = rowWeights.map(w => 
        (activeHeight - (rowWeights.length - 1) * gutterSize) * (w / totalRowWeight)
      );

      const getColX = (colIdx: number) => {
        let x = outerMargin;
        for (let i = 0; i < colIdx; i++) x += colWidths[i] + gutterSize;
        return x;
      };

      const getRowY = (rowIdx: number) => {
        let y = outerMargin;
        for (let i = 0; i < rowIdx; i++) y += rowHeights[i] + gutterSize;
        return y;
      };

      // Map each panel slot to screen coordinates
      const newPanels: CanvasPanel[] = panels.map((panel, idx) => {
        const slot = pattern.panel_areas.find((sa: any) => sa.slot === panel.panel_number) 
                  || pattern.panel_areas[idx] 
                  || pattern.panel_areas[0];

        const [rStart, cStart, rEnd, cEnd] = slot.gridArea.split('/').map((s: string) => parseInt(s.trim()));

        let width = 0;
        for (let i = cStart - 1; i < cEnd - 1; i++) {
          width += colWidths[i] + (i > (cStart - 1) ? gutterSize : 0);
        }

        let height = 0;
        for (let i = rStart - 1; i < rEnd - 1; i++) {
          height += rowHeights[i] + (i > (rStart - 1) ? gutterSize : 0);
        }

        return {
          id: `panel_${pageId}_${panel.panel_number}`,
          type: 'panel',
          imageUrl: `/api/load-image?path=data/images/${pageId}/panel_${panel.panel_number}.png`,
          x: getColX(cStart - 1),
          y: getRowY(rStart - 1),
          width,
          height,
          zIndex: idx,
          pageId,
          imageScale: 1,
          imageOffsetX: 0,
          imageOffsetY: 0
        };
      });

      set({ elements: [...state.elements, ...newPanels] });
    }
  }
}));
