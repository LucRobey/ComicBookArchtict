import React from 'react';
import type { FinalLoreData } from '../types';

interface BlendedLoreTabProps {
  finalLore: FinalLoreData | null;
  onMixWorldAndStyle: () => Promise<void>;
  openLoreFlag: (key: string) => void;
  merging?: boolean;
}

export const BlendedLoreTab: React.FC<BlendedLoreTabProps> = ({
  finalLore,
  onMixWorldAndStyle,
  openLoreFlag,
  merging = false,
}) => {
  if (!finalLore) {
    return (
      <div className="lore-state error flex flex-col items-center justify-center p-8 border border-dashed border-border rounded-xl">
        <p className="text-lg font-bold mb-2">⚠️ No blended lore found.</p>
        <p className="text-sm text-text-muted mb-4">Click below to generate the blended series bible from your raw story inputs and style research.</p>
        <button
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onMixWorldAndStyle}
          disabled={merging}
        >
          {merging ? '🤖 Blending via Agent...' : '⚡ Mix World & Style'}
        </button>
      </div>
    );
  }

  const { inspiration_reference, narrative_blend, blended_world_rules, integrated_tropes, humor_and_pacing_rules } = finalLore;

  return (
    <div className="lore-blended-layout space-y-8">
      {/* Top Banner and Trigger Action */}
      <div className="bg-gradient-to-r from-violet-600/10 to-indigo-600/10 border border-violet-500/20 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-violet-400">
            <span>✨</span> Blended Series Bible
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Active adaptation of <strong>{inspiration_reference?.comic_title || 'Reference Comic'}</strong> ({inspiration_reference?.style_family || 'Ligne Claire'}) applied to your custom scenario.
          </p>
        </div>
        <button
          className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-lg font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 border border-violet-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onMixWorldAndStyle}
          disabled={merging}
        >
          {merging ? '🤖 Blending via Agent...' : '⚡ Mix World & Style'}
        </button>
      </div>

      {/* Narrative Synthesis */}
      <div className="lore-section">
        <div className="lore-section-header">
          <span className="lore-section-icon">📖</span>
          <span className="lore-section-title">Narrative Synthesis</span>
          <button className="lore-action-flag" onClick={() => openLoreFlag('narrative_blend')} title="Flag for agent">🚩</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
          <div className="lore-card border border-border bg-background-card rounded-lg p-4">
            <span className="text-[10px] text-accent font-mono uppercase tracking-wider block mb-1">Genre Synthesis</span>
            <p className="font-semibold text-sm leading-relaxed">{narrative_blend?.genre_blend}</p>
          </div>
          <div className="lore-card border border-border bg-background-card rounded-lg p-4">
            <span className="text-[10px] text-accent font-mono uppercase tracking-wider block mb-1">Tone & Pacing Blend</span>
            <p className="font-semibold text-sm leading-relaxed">{narrative_blend?.tone_blend}</p>
          </div>
          <div className="lore-card border border-border bg-background-card rounded-lg p-4">
            <span className="text-[10px] text-accent font-mono uppercase tracking-wider block mb-1">Setting & Era Adaptation</span>
            <p className="font-semibold text-sm leading-relaxed">{narrative_blend?.era_setting}</p>
          </div>
        </div>

        {/* Adapted Conflict Concept */}
        <div className="lore-card border border-border bg-background-card rounded-lg p-5 mt-4">
          <span className="text-[10px] text-violet-400 font-mono uppercase tracking-wider block mb-1">Adapted Core Conflict Concept</span>
          <p className="text-sm leading-relaxed font-medium">{narrative_blend?.core_conflict_translation?.adapted_conflict_concept}</p>
          {narrative_blend?.core_conflict_translation?.primary_style_plot_drivers && (
            <div className="mt-3 flex flex-wrap gap-2 items-center">
              <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider">Style Plot Drivers:</span>
              {narrative_blend.core_conflict_translation.primary_style_plot_drivers.map((driver, idx) => (
                <span key={idx} className="text-xs px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20 font-medium">
                  {driver}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>


      {/* Blended World Rules & Tropes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Blended World Rules */}
        <div className="lore-section">
          <div className="lore-section-header">
            <span className="lore-section-icon">📏</span>
            <span className="lore-section-title">Blended World Rules</span>
            <button className="lore-action-flag" onClick={() => openLoreFlag('blended_world_rules')} title="Flag for agent">🚩</button>
          </div>
          <div className="lore-rules-list mt-3 space-y-3">
            {blended_world_rules?.map((rule, idx) => (
              <div key={idx} className="bg-background-card border border-border rounded-lg p-3.5 space-y-1 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-violet-400">{rule.rule}</span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded font-mono font-medium">
                    {rule.derived_from}
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed mt-1">
                  {rule.application_in_story}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Integrated Tropes */}
        <div className="lore-section">
          <div className="lore-section-header">
            <span className="lore-section-icon">🎭</span>
            <span className="lore-section-title">Integrated Tropes</span>
            <button className="lore-action-flag" onClick={() => openLoreFlag('integrated_tropes')} title="Flag for agent">🚩</button>
          </div>
          <div className="lore-rules-list mt-3 space-y-3">
            {integrated_tropes?.map((trope, idx) => (
              <div key={idx} className="bg-background-card border border-border rounded-lg p-3.5 space-y-1 shadow-sm">
                <h4 className="text-xs font-bold text-violet-400">{trope.trope_name}</h4>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  {trope.source_trope_description}
                </p>
                <div className="text-xs text-text-secondary leading-relaxed mt-2 bg-background-panel/40 p-2.5 rounded border border-border/50">
                  <strong>Manifestation in Plot:</strong> {trope.manifestation_in_scenario}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Humor & Pacing Rules */}
      {humor_and_pacing_rules && (
        <div className="lore-section bg-background-card border border-border rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <span className="text-lg">⚡</span>
            <h3 className="font-bold text-base text-violet-400">Comic Timing & Pacing</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-accent uppercase font-mono tracking-wider">🎭 Comedy Mechanisms Applied</h4>
              <ul className="list-disc list-inside text-xs text-text-secondary space-y-1">
                {humor_and_pacing_rules.humor_mechanisms_applied?.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-accent uppercase font-mono tracking-wider">⏱️ Pacing & Tempo Rules</h4>
              <ul className="list-disc list-inside text-xs text-text-secondary space-y-1">
                {humor_and_pacing_rules.pacing_tempo_rules?.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
