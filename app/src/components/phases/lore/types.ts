/**
 * Lore phase types.
 *
 * Data-shape types (LoreData, ScenarioData, GeographyData, etc.) are
 * re-exported from the canonical @/types/data module so all components
 * share a single source of truth.
 *
 * UI-only types used exclusively inside the Lore phase are defined here.
 */

// Re-export canonical data types
export type {
  LoreData,
  ScenarioData,
  GeographyData,
  Scene,
  Shot,
  Variant,
  Location,
} from '@/types/data';

// ── UI-only types (Lore phase) ──────────────────────────────

export type SubTab = 'world' | 'visual-style' | 'geography';

export interface FlagTarget {
  type: 'shot' | 'palette' | 'lighting' | 'style_image';
  locId: string;
  variantId: string | null;
  label: string;
  shot?: Shot | any;
}

export interface PalettePick {
  hex: string;
  comment: string;
}

export interface CanonEditState {
  idx: number;
  hex: string;
  label: string;
  role: string;
}

// Import Shot type for FlagTarget reference
import type { Shot } from '@/types/data';
