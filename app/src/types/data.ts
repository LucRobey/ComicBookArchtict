/**
 * Canonical data types for all JSON files consumed by the Assembly Studio.
 * ─────────────────────────────────────────────────────────────────────────
 * Single source of truth — every component importing data shapes should
 * reference this file instead of defining inline interfaces.
 *
 * Mirrors the JSON schemas written by pipeline agents in `data/`.
 */

// ── data/lore.json ──────────────────────────────────────────
export interface LoreData {
  world_type?: string;
  tone?: string;
  genre?: string;
  era?: string;
  visual_style?: string;
  rules?: string[];
  visual_rules?: string[];
  mood_board?: { id: string; prompt: string; image?: string }[];
  palette?: { label: string; hex: string; role: string }[];
  [key: string]: any;
}

// ── data/scenario.json ──────────────────────────────────────
export interface Scene {
  scene_id: number;
  title: string;
  location: string;
  characters_present: string[];
  emotional_beat: string;
  summary: string;
  anecdotes: string[];
}
export interface ScenarioData {
  scenes: Scene[];
}

// ── data/geography.json ─────────────────────────────────────
export interface Shot {
  id: string;
  label: string;
  description: string;
  use_for: string;
  image?: string;
  prompt_suffix?: string;
}
export interface Variant {
  id: string;
  label: string;
  description?: string;
  appears_in_scenes?: number[];
  image?: string;
  lighting_summary?: string;
  palette?: string[];
  shots?: Shot[];
}
export interface Location {
  id: string;
  name: string;
  type: string;
  description: string;
  appears_in_scenes: number[];
  image?: string;
  image_prompt?: string;
  location_sheet?: string;
  palette?: string[];
  lighting_summary?: string;
  shots?: Shot[];
  variants?: Variant[];
}
export interface GeographyData {
  locations: Location[];
}

// ── data/character_moods.json ───────────────────────────────
export interface CharacterMood {
  dominant_emotion: string;
  feels: string;
  shows: string;
  tension_with: string | null;
}
export interface SceneMoods {
  [characterName: string]: CharacterMood;
}
export interface SceneEntry {
  scene_id: number;
  title: string;
  moods: SceneMoods;
}
export interface CharacterMoodsData {
  _schema_version?: string;
  _description?: string;
  characters: string[];
  scenes: SceneEntry[];
}

// ── data/intro_pages.json ───────────────────────────────────
export interface IntroPanel {
  panel_number: number;
  framing: string;
  action: string;
}
export interface CharacterIntro {
  page_number: number;
  character: string;
  layout_type: string;
  scene_description: string;
  narrator_caption: string;
  character_dialogue: string;
  panels: IntroPanel[];
}
export interface IntroData {
  intro_pages: CharacterIntro[];
}

// ── data/pages.json ─────────────────────────────────────────
export interface PacingPageData {
  page_number: number;
  scene_id: number | null;
  type: string;
  character?: string;
  focus: string;
  anecdotes_included: string[];
}
export interface PagesData {
  total_pages: number;
  pages: PacingPageData[];
}
