import React, { useState } from 'react';
import type { LoreData } from '../types';
import { CanonicalPaletteEditor } from '../components/CanonicalPaletteEditor';
import { InlineEditableText } from '../components/InlineEditableText';

const VISUAL_PALETTE_DEFAULTS = [
  { label: 'Deep Charcoal',  hex: '#1C1C1E', role: 'Dominant tone — line, shadow' },
  { label: 'Warm Grey',      hex: '#9B9B9B', role: 'Mid-tone — environment' },
  { label: 'Off-White',      hex: '#F2EDE4', role: 'Paper fill — faces, empty space' },
  { label: 'Blueprint Blue', hex: '#3B82F6', role: 'Accent — emotional beats' },
  { label: 'Amber Warm',     hex: '#D97706', role: 'Accent — night / tension' },
];

const DEFAULT_RULES = [
  'Clean ink line — no sketch texture or pencil grain',
  'Minimal hatching — shadow is flat fill, not crosshatch',
  'Expressive line weight — thinner for environment, heavier for figures',
  'No gradients — solid fills only, except for the emotional accent color',
  'Silence panels use negative space as the subject',
];

const DEFAULT_MOOD_BOARD = [
  { id: 'style_ref_1', prompt: 'Open-plan office, morning — the space where nothing is private.', image: 'data/images/style_reference/style_ref_1.png' },
  { id: 'style_ref_2', prompt: 'The café at night — coffee orders as emotional proxies.', image: 'data/images/style_reference/style_ref_2.png' },
];

interface VisualStyleTabProps {
  lore: LoreData | null;
  openLoreFlag: (key: string) => void;
  onSavePalette: (next: { label: string; hex: string; role: string }[]) => Promise<void>;
  openStyleFlag?: (ref: string) => void;
  openFlag?: (type: 'shot' | 'palette' | 'lighting' | 'style_image', locId: string, variantId: string | null, label: string, shot?: any) => void;
  onSaveRules?: (rules: string[]) => Promise<void>;
  onSaveVisualStyle?: (style: string) => Promise<void>;
  onSaveMoodBoard?: (mb: { id: string; prompt: string; image?: string }[]) => Promise<void>;
}

export const VisualStyleTab: React.FC<VisualStyleTabProps> = ({ lore, openLoreFlag, onSavePalette, openFlag, onSaveRules, onSaveVisualStyle, onSaveMoodBoard }) => {
  const getCanonPalette = () => lore?.palette ?? VISUAL_PALETTE_DEFAULTS;
  const currentRules = lore?.visual_rules ?? DEFAULT_RULES;
  const currentMoodBoard = lore?.mood_board ?? DEFAULT_MOOD_BOARD;

  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleSaveRule = (idx: number, newVal: string) => {
    const next = [...currentRules];
    next[idx] = newVal;
    onSaveRules?.(next);
    setEditingIdx(null);
  };

  const handleRemoveRule = (idx: number) => {
    const next = currentRules.filter((_, i) => i !== idx);
    onSaveRules?.(next);
  };

  const handleAddRule = () => {
    const next = [...currentRules, 'New rule...'];
    onSaveRules?.(next);
    setEditingIdx(next.length - 1);
    setEditValue('New rule...');
  };

  const handleSaveMoodBoardPrompt = async (idx: number, newPrompt: string) => {
    const next = [...currentMoodBoard];
    next[idx] = { ...next[idx], prompt: newPrompt };
    await onSaveMoodBoard?.(next);
  };

  const handleRemoveMoodBoardItem = (idx: number) => {
    const next = currentMoodBoard.filter((_, i) => i !== idx);
    onSaveMoodBoard?.(next);
  };

  const handleAddMoodBoardOrder = () => {
    const newId = `style_ref_${Date.now()}`;
    const next = [...currentMoodBoard, { id: newId, prompt: 'Describe the style reference you want generated...' }];
    onSaveMoodBoard?.(next);
  };

  return (
    <div className="lore-visual-layout">
      {/* Style description */}
      <div className="lore-section">
        <div className="lore-section-header">
          <span className="lore-section-icon">✏️</span>
          <span className="lore-section-title">Visual DNA</span>
          <button className="lore-action-flag" onClick={() => openLoreFlag('visual_style')} title="Flag for agent">🚩</button>
        </div>
        {onSaveVisualStyle ? (
          <InlineEditableText 
            initialValue={lore?.visual_style || ''} 
            onSave={onSaveVisualStyle} 
            emptyText="Click to add a visual DNA description." 
          />
        ) : (
          <p className="lore-tone-text lore-visual-dna-text">{lore?.visual_style}</p>
        )}
      </div>

      {/* Mood board gallery */}
      <div className="lore-section">
        <div className="lore-section-header">
          <span className="lore-section-icon">🖼️</span>
          <span className="lore-section-title">Mood Board</span>
          <button 
            className="text-xs px-2 py-1 bg-accent/10 text-accent rounded hover:bg-accent hover:text-white border border-accent/20 transition-colors ml-auto" 
            onClick={handleAddMoodBoardOrder} 
            title="Order new generation"
          >
            + Order Image
          </button>
        </div>
        <div className="lore-moodboard-grid">
          {currentMoodBoard.map((item, i) => (
            <div key={item.id} className="lore-moodboard-card group relative">
              <div className="lore-moodboard-img-wrap relative overflow-hidden rounded">
                {item.image ? (
                  <>
                    <img
                      src={`/api/load-image?path=${encodeURIComponent(item.image)}`}
                      alt={`Style reference ${i + 1}`}
                      className="lore-moodboard-img"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </>
                ) : (
                  <div className="w-full aspect-[16/9] bg-panel-raised border-2 border-dashed border-border-subtle rounded flex flex-col items-center justify-center text-text-muted">
                    <span className="text-2xl mb-2">⌛</span>
                    <span className="text-sm font-medium">Pending Generation</span>
                    <span className="text-xs opacity-60">Waiting for agent to process order</span>
                  </div>
                )}
                
                <div className="lore-action-row absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  {openFlag ? (item.image ? (
                    <button 
                      className="lore-action-flag" 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        openFlag('style_image', 'visual_style', null, item.prompt, { id: item.id, label: item.prompt, image: item.image }); 
                      }}
                      title="Flag style image for regeneration"
                    >
                      🚩
                    </button>
                  ) : null) : null}
                  <button 
                    className="lore-action-delete"
                    onClick={() => handleRemoveMoodBoardItem(i)}
                    title="Remove this order"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="mt-2 text-sm text-text-secondary">
                <InlineEditableText 
                  initialValue={item.prompt} 
                  onSave={async (val) => handleSaveMoodBoardPrompt(i, val)} 
                  emptyText="Click to add a prompt for this order" 
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Palette */}
      <CanonicalPaletteEditor initialPalette={getCanonPalette()} onSavePalette={onSavePalette} />

      {/* Linework notes */}
      <div className="lore-section">
        <div className="lore-section-header">
          <span className="lore-section-icon">🖊️</span>
          <span className="lore-section-title">Linework & Rendering</span>
          <button 
            className="text-xs px-2 py-1 bg-accent/10 text-accent rounded hover:bg-accent hover:text-white border border-accent/20 transition-colors ml-auto" 
            onClick={handleAddRule} 
            title="Add rule"
          >
            + Add Rule
          </button>
        </div>
        <div className="lore-rules-list">
          {currentRules.map((rule, i) => (
            <div key={i} className="lore-rule-callout lore-rule-callout--muted group relative flex items-center gap-3">
              <span className="lore-rule-index shrink-0">{String(i + 1).padStart(2, '0')}</span>
              {editingIdx === i ? (
                <div className="flex-1 flex gap-2">
                  <input
                    className="flex-1 bg-background-base text-text-primary px-2 py-1 rounded border border-border"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    autoFocus
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleSaveRule(i, editValue);
                      if (e.key === 'Escape') setEditingIdx(null);
                    }}
                  />
                  <button className="text-xs px-2 py-1 bg-accent/20 text-accent rounded hover:bg-accent hover:text-white transition-colors" onClick={() => handleSaveRule(i, editValue)}>Save</button>
                  <button className="text-xs px-2 py-1 text-text-secondary hover:text-text-primary transition-colors" onClick={() => setEditingIdx(null)}>Cancel</button>
                </div>
              ) : (
                <>
                  <span className="lore-rule-text flex-1">{rule}</span>
                  <div className="lore-action-row">
                    <button className="lore-action-edit" onClick={() => { setEditingIdx(i); setEditValue(rule); }} title="Edit rule">✏️</button>
                    <button className="lore-action-flag" onClick={() => openLoreFlag(`visual_rule:${rule}`)} title="Flag for agent">🚩</button>
                    <button className="lore-action-delete" onClick={() => handleRemoveRule(i)} title="Remove rule">✕</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
