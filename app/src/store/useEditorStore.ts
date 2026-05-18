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
  }
}));
