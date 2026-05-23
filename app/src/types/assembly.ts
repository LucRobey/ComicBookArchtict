/**
 * Shared types for the Assembly phase (Canvas, QAReviewBoard, Sidebar, App).
 * Replaces the dead useComicData.ts hook.
 */

export interface PageData {
  id: string;   // e.g. "page_0", "page_1" …
  name: string; // Human-readable, e.g. "Page 0"
  panels: Array<{ panel_number: number }>; // List of panel objects
  layout_template?: string; // Visual layout template from panel_style
}
