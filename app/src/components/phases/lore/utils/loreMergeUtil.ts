import type { UserLoreData, FinalLoreData, BlendedWorldRule, IntegratedTrope } from '../types';

export function mergeLore(
  userLore: UserLoreData,
  loreStyle: any,
  visualStyle: any
): { finalLore: FinalLoreData; flatLore: any } {
  const styleRef = loreStyle.reference_comic || 'Reference Style';

  // 1. Establish Narrative Blend
  const genreBlend = `${userLore.genre || 'Slice-of-life'} merged with ${styleRef} adventure style`;
  const toneBlend = `A blend of ${userLore.tone || 'standard tone'} with the pacing and rules of ${styleRef}`;
  const eraSetting = `${userLore.era || 'Present day'}, adapted to the visual aesthetic of ${styleRef}`;

  // 2. Adapt the Core Conflict
  const userConflict = userLore.core_conflict || '';
  const activeTropes = (loreStyle.thematic_tropes || []).map((t: any) => t.name).join(', ');
  const adaptedConflictConcept = 
    `The core conflict ('${userConflict}') is re-imagined as a classic ${styleRef} adventure. ` +
    `This thematic tension is catalyzed by the style's core plot drivers (${activeTropes || 'mysterious events'}), ` +
    `propelling the narrative into unexpected situations.`;

  const primaryStylePlotDrivers = (loreStyle.thematic_tropes || [])
    .slice(0, 3)
    .map((t: any) => t.name || 'Plot Driver');

  // 3. Blend World Rules
  const blendedWorldRules: BlendedWorldRule[] = [];
  (userLore.rules || []).forEach((rule) => {
    blendedWorldRules.push({
      rule,
      derived_from: 'User Lore',
      application_in_story: 'Governs the baseline logic of the scenes.'
    });
  });

  (loreStyle.narrative_rules || []).forEach((styleRule: any) => {
    blendedWorldRules.push({
      rule: styleRule.rule || '',
      derived_from: `Lore Style (${styleRef})`,
      application_in_story: `Applied in the style of ${styleRef}: ${styleRule.reason || ''}`
    });
  });

  // 4. Integrate Thematic Tropes
  const integratedTropes: IntegratedTrope[] = [];
  (loreStyle.thematic_tropes || []).forEach((trope: any) => {
    const name = trope.name || '';
    const desc = trope.description || '';
    let manifestation = `The core conflict is adapted to this trope: ${desc}`;

    if (name.toLowerCase().includes('mistaken') || name.toLowerCase().includes('involvement')) {
      manifestation = `The protagonist is drawn into a mystery by picking up a strange item or by mistaken identity, escalating the conflict.`;
    } else if (name.toLowerCase().includes('clue') || name.toLowerCase().includes('macguffin')) {
      manifestation = `A physical clue or object linked to the conflict becomes the central object of search and tracking.`;
    } else if (name.toLowerCase().includes('travel') || name.toLowerCase().includes('locale')) {
      manifestation = `Tracking the conspiracy leads the characters away from their quiet setting into exotic or unexpected locales.`;
    } else if (name.toLowerCase().includes('conspiracy') || name.toLowerCase().includes('syndicate')) {
      manifestation = `A shadowy syndicate operating behind respectable facades becomes the main opposition.`;
    }

    integratedTropes.push({
      trope_name: name,
      source_trope_description: desc,
      manifestation_in_scenario: manifestation
    });
  });

  const humorMechanismsApplied = loreStyle.humor_and_pacing_tropes || [];
  const pacingTempoRules = [
    'Rapid dialogue exchange with alternating panels showing environment.',
    'Comic relief panels inserted after key action peaks.'
  ];

  // Assemble outputs
  const finalLore: FinalLoreData = {
    _schema_version: '1.1',
    _description: 'Active inspired lore of the project. Result of merging user_lore.json and lore_style.json.',
    inspiration_reference: {
      comic_title: styleRef,
      style_family: styleRef.toLowerCase().includes('tintin') ? 'Belgian Ligne Claire' : 'Classic Comic',
      era: styleRef,
      key_inspirations_applied: ['Pacing and comedy rules', 'Classic adventure layout']
    },
    narrative_blend: {
      world_type: userLore.world_type || '',
      genre_blend: genreBlend,
      tone_blend: toneBlend,
      era_setting: eraSetting,
      core_conflict_translation: {
        original_user_conflict: userConflict,
        adapted_conflict_concept: adaptedConflictConcept,
        primary_style_plot_drivers: primaryStylePlotDrivers
      }
    },
    blended_world_rules: blendedWorldRules,
    integrated_tropes: integratedTropes,
    humor_and_pacing_rules: {
      humor_mechanisms_applied: humorMechanismsApplied,
      pacing_tempo_rules: pacingTempoRules
    }
  };

  const flatRules = blendedWorldRules.map((r) => r.rule);

  const flatLore = {
    world_type: genreBlend,
    tone: toneBlend,
    genre: genreBlend,
    era: eraSetting,
    rules: flatRules,
    visual_style: visualStyle.dna?.description || 'Classic comic style',
    palette: visualStyle.palette || [],
    mood_board: visualStyle.mood_board || [],
    conflict_adaptation: {
      original: userConflict,
      adapted: adaptedConflictConcept,
      drivers: primaryStylePlotDrivers
    }
  };

  return { finalLore, flatLore };
}
