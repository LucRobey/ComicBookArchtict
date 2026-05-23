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

export interface AnecdoteItem {
  text: string;
  importance: number;
}

// ── data/scenario_inputs.json ───────────────────────────────
export interface ScenarioInputsData {
  logline: string;
  themes: string[];
  points: (string | AnecdoteItem)[];
}

export interface CharacterLink {
  target_character: string;
  relationship_type: 'friend' | 'family' | 'lover';
  relationship_subtype: string;
  dynamic: string;
}

export interface CharacterSignature {
  age: string;
  gender: string;
  role: string;
  relationships?: Record<string, string>; // Legacy
  network?: CharacterLink[];
  general_personality: string;
  loves: string[];
  hates: string[];
  verbal_habits: string;
  writing_notes: string;
}

export interface PersonalitySignature {
  [characterName: string]: CharacterSignature;
}
export interface PersonalitySignatureData {
  signatures: PersonalitySignature;
}

// ── data/scenario_synopsis.json ─────────────────────────────
export interface ScenarioSynopsisData {
  synopsis: string;
}

// ── data/scenario_chapters.json ─────────────────────────────
export interface Chapter {
  chapter_id: number;
  title: string;
  summary: string;
  characters: string[];
  story_progression?: string;
}
export interface ScenarioChaptersData {
  chapters: Chapter[];
}

// ── data/scenario_scenes.json ───────────────────────────────
export interface SceneCharacterManifest {
  character_id: string;
  costume_and_appearance_variant: string;
}

export interface Scene {
  scene_id: number;
  chapter_id?: number;
  chapter_title?: string;
  title: string;
  location_id?: string;
  variant_id?: string;
  location?: string; // Legacy/backward compatibility
  location_master?: {
    name: string;
    visual_style_modifiers: string;
  };
  scene_world_state?: {
    time_of_day: string;
    environmental_lighting: string;
    atmospheric_effects: string;
  };
  character_manifest?: SceneCharacterManifest[];
  characters_present?: string[]; // Legacy
  emotional_beat: string;
  camera_shot: string;
  core_action: string;
  summary: string;
  anecdotes: string[];
}
export interface ScenarioScenesData {
  scenes: Scene[];
}
export type ScenarioData = ScenarioScenesData;


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
  agenda?: string;
  subtext?: string;
  secret?: string;
  status_dynamic?: string;
  tactics?: string;
  scene_stakes?: string;
}
export interface SceneMoods {
  [characterName: string]: CharacterMood;
}
export interface ChapterMoodEntry {
  chapter_id: number;
  title: string;
  moods: SceneMoods;
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
  general_mood?: Record<string, string>;
  chapter_moods?: ChapterMoodEntry[];
  chapters?: ChapterMoodEntry[];
  scenes?: SceneEntry[];
}

// ── data/intro_pages.json ───────────────────────────────────
export interface IntroProposal {
  story: string;
  tone: string;
  themes: string[];
}

export interface IntroPanelLayoutIntent {
  panel_size_weight: string;
  aspect_ratio_target: string;
}

export interface IntroPanelCinematicFraming {
  shot_type: string;
  camera_angle: string;
  camera_lens_feel: string;
}

export interface IntroPanelChoreography {
  character_id: string;
  expression_override: string;
  camera_distance_blocking: string;
}

export interface IntroSpeechBalloon {
  character_id: string;
  text: string;
}

export interface IntroPanelDialogueAndLettering {
  captions: string[];
  speech_balloons: IntroSpeechBalloon[];
}

export interface IntroPanelData {
  panel_number: number;
  layout_intent: IntroPanelLayoutIntent;
  cinematic_framing: IntroPanelCinematicFraming;
  keyframe_action: string;
  character_choreography: IntroPanelChoreography[];
  tags: string[];
  dialogue_and_lettering: IntroPanelDialogueAndLettering;
  image?: string;
}

export interface CharacterIntro {
  page_number: number;
  character: string;
  proposal: IntroProposal;
  panels: IntroPanelData[];
}

export interface IntroData {
  intro_pages: CharacterIntro[];
}

// ── data/pages.json ─────────────────────────────────────────
export interface AssociatedScene {
  scene_id: number;
  scene_title: string;
  portion?: 'full' | 'start' | 'middle' | 'end';
  transition_type?: string;
}

export interface PageGeneralMood {
  emotional_tone: string;
  visual_color_palette?: string;
  tempo_and_pacing?: string;
}

export interface PagePanelOrganization {
  panel_count_target: number;
  layout_proposal?: string;
  composition_notes?: string;
  read_flow_intent?: string;
}

export interface PageLocation {
  location_name: string;
  time_of_day?: string;
  environmental_lighting?: string;
}

export interface PageSettingAndLocation {
  location_name: string;
  time_of_day?: string;
  environmental_lighting?: string;
  locations?: PageLocation[];
}

export interface PacingPageData {
  page_number: number;
  type: string;
  scenes_associated?: AssociatedScene[];
  general_mood?: PageGeneralMood;
  panel_organization?: PagePanelOrganization;
  page_narrative_focus?: string;
  characters_present?: string[];
  setting_and_location?: PageSettingAndLocation;
  anecdotes_included: string[];
  visual_page_turn_hook?: string;

  // Backward compatibility fields
  scene_id: number | null;
  character?: string;
  focus: string;
}

export interface PagesData {
  total_pages: number;
  pages: PacingPageData[];
}

// ── data/panels.json ────────────────────────────────────────
export interface PanelLayoutIntent {
  panel_size_weight: string;
  aspect_ratio_target: string;
}

export interface PanelCinematicFraming {
  shot_type: string;
  camera_angle: string;
  camera_lens_feel: string;
}

export interface PanelCharacterChoreography {
  character_id: string;
  expression_override: string;
  camera_distance_blocking: string;
}

export interface SpeechBalloon {
  character_id: string;
  text: string;
}

export interface PanelDialogueAndLettering {
  captions: string[];
  speech_balloons: SpeechBalloon[];
}

export interface PanelData {
  panel_number: number;
  scene_id: number;
  shot_id?: string;
  layout_intent?: PanelLayoutIntent;
  cinematic_framing?: PanelCinematicFraming;
  keyframe_action?: string;
  character_choreography?: PanelCharacterChoreography[];
  tags: string[];
  dialogue_and_lettering?: PanelDialogueAndLettering;
  
  // Legacy / UI compatibility fields:
  framing?: string;
  action?: string;
  characters_present?: string[];
  
  // Enriched panel-level visual and acting states:
  focal_element?: string;
  characters_acting?: {
    character_id: string;
    expression: string;
    pose_and_gesture?: string;
    internal_state?: string;
  }[];
  environment_details?: string;
  composition_notes?: string;
}

export interface PanelsPage {
  page_number: number;
  panels: PanelData[];
}

export interface PanelsData {
  pages: PanelsPage[];
}

