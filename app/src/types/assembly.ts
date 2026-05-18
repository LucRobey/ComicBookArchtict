/**
 * Shared types for the Assembly phase (Canvas, QAReviewBoard, Sidebar, App).
 * Replaces the dead useComicData.ts hook.
 */

export interface PageData {
  id: string;   // e.g. "page_0", "page_1" …
  name: string; // Human-readable, e.g. "Page 0"
  panels: string[]; // Image URLs for placed panels
}
