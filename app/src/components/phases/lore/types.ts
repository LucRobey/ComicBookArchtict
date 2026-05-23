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

export type SubTab = 'raw-lore' | 'style-research' | 'blended-lore' | 'geography';

export interface UserLoreData {
  _schema_version?: string;
  _description?: string;
  world_type: string;
  tone: string;
  genre: string;
  era: string;
  rules: string[];
  core_conflict: string;
}

export interface BlendedWorldRule {
  rule: string;
  derived_from: string;
  application_in_story: string;
}

export interface IntegratedTrope {
  trope_name: string;
  source_trope_description: string;
  manifestation_in_scenario: string;
}

export interface FinalLoreData {
  _schema_version?: string;
  _description?: string;
  inspiration_reference: {
    comic_title: string;
    style_family: string;
    era: string;
    key_inspirations_applied: string[];
  };
  narrative_blend: {
    world_type: string;
    genre_blend: string;
    tone_blend: string;
    era_setting: string;
    core_conflict_translation: {
      original_user_conflict: string;
      adapted_conflict_concept: string;
      primary_style_plot_drivers: string[];
    };
  };
  blended_world_rules: BlendedWorldRule[];
  integrated_tropes: IntegratedTrope[];
  humor_and_pacing_rules: {
    humor_mechanisms_applied: string[];
    pacing_tempo_rules: string[];
  };
}

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

