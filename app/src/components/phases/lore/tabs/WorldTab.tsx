import React from 'react';
import type { UserLoreData } from '../types';
import { InlineEditableText } from '../components/InlineEditableText';

interface WorldTabProps {
  userLore: UserLoreData | null;
  openLoreFlag: (key: string) => void;
  onSaveLoreValue?: (key: string, value: string) => Promise<void>;
  onSaveRules?: (rules: string[]) => Promise<void>;
}

export const WorldTab: React.FC<WorldTabProps> = ({
  userLore,
  openLoreFlag,
  onSaveLoreValue,
  onSaveRules,
}) => {
  if (!userLore) return (
    <div className="lore-state error">
      <p>⚠️ No user_lore.json found.</p>
      <p className="lore-state-hint">Run Phase 0 agent to generate <code>data/user_lore.json</code></p>
    </div>
  );

  const topFields: (keyof UserLoreData)[] = ['world_type', 'genre', 'era'];
  const currentRules = userLore.rules || [];

  const handleSaveRule = async (idx: number, newVal: string) => {
    const next = [...currentRules];
    next[idx] = newVal;
    await onSaveRules?.(next);
  };

  const handleAddRule = async () => {
    const next = [...currentRules, 'New rule - click to edit'];
    await onSaveRules?.(next);
  };

  const handleRemoveRule = async (idx: number) => {
    const next = currentRules.filter((_, i) => i !== idx);
    await onSaveRules?.(next);
  };


  return (
    <div className="lore-world-layout">
      {/* Identity Banner */}
      <div className="lore-identity-banner">
        {topFields.map((k) => (
          <div key={k} className="lore-identity-pill group !flex-col !items-start gap-1 p-3">
            <span className="lore-identity-label">{String(k).replace(/_/g, ' ')}</span>
            <div className="flex w-full items-center justify-between">
              <InlineEditableText
                initialValue={String(userLore[k] || '')}
                onSave={async (v) => onSaveLoreValue?.(String(k), v)}
                bodyClassOverride="flex-1 flex items-center justify-between m-0 p-0 bg-transparent border-0"
                textClassOverride="lore-identity-value flex-1 m-0 text-sm"
              />
              <button className="lore-action-flag ml-2" onClick={() => openLoreFlag(String(k))} title="Flag for agent">🚩</button>
            </div>
          </div>
        ))}
      </div>

      {/* Tone & Voice */}
      <div className="lore-section">
        <div className="lore-section-header">
          <span className="lore-section-icon">🎙️</span>
          <span className="lore-section-title">Raw Narrative Tone</span>
          <button className="lore-action-flag" onClick={() => openLoreFlag('tone')} title="Flag for agent">🚩</button>
        </div>
        <InlineEditableText
          initialValue={userLore.tone || ''}
          onSave={async (v) => onSaveLoreValue?.('tone', v)}
          bodyClassOverride="m-0"
          textClassOverride="lore-tone-text m-0 text-sm italic"
        />
      </div>

      {/* Core Conflict */}
      <div className="lore-section">
        <div className="lore-section-header">
          <span className="lore-section-icon">⚡</span>
          <span className="lore-section-title">Core Conflict Concept</span>
          <button className="lore-action-flag" onClick={() => openLoreFlag('core_conflict')} title="Flag for agent">🚩</button>
        </div>
        <InlineEditableText
          initialValue={userLore.core_conflict || ''}
          onSave={async (v) => onSaveLoreValue?.('core_conflict', v)}
          bodyClassOverride="m-0 w-full"
          textClassOverride="lore-tone-text m-0 text-sm"
        />
      </div>


      {/* World Rules */}
      <div className="lore-section">
        <div className="lore-section-header">
          <span className="lore-section-icon">📐</span>
          <span className="lore-section-title">Raw World Rules</span>
          <button
            className="text-xs px-2 py-1 bg-accent/10 text-accent rounded hover:bg-accent hover:text-white border border-accent/20 transition-colors ml-auto mr-2"
            onClick={handleAddRule}
            title="Add Rule"
          >
            + Add Rule
          </button>
          <button className="lore-action-flag" onClick={() => openLoreFlag('rules')} title="Flag for agent">🚩</button>
        </div>
        <div className="lore-rules-list">
          {currentRules.map((rule, i) => (
            <div key={i} className="lore-rule-callout group relative">
              <span className="lore-rule-index">{String(i + 1).padStart(2, '0')}</span>
              <div className="flex-1">
                <InlineEditableText
                  initialValue={rule}
                  onSave={async (v) => handleSaveRule(i, v)}
                  bodyClassOverride="m-0 flex items-start gap-2"
                  textClassOverride="lore-rule-text flex-1 m-0 text-sm"
                />
              </div>
              <button
                className="lore-action-delete mt-0.5 ml-2"
                onClick={() => handleRemoveRule(i)}
                title="Remove rule"
              >
                ✕
              </button>
            </div>
          ))}
          {currentRules.length === 0 && (
            <p className="text-sm text-text-muted italic">No world rules defined yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
