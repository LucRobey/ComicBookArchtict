import React, { useState } from 'react';

interface AddPaletteColorModalProps {
  onClose: () => void;
  onSubmit: (hex: string) => void;
}

export const AddPaletteColorModal: React.FC<AddPaletteColorModalProps> = ({ onClose, onSubmit }) => {
  const [color, setColor] = useState('#3B82F6');

  return (
    <div className="lore-addloc-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="lore-addloc-modal" style={{ maxWidth: '400px' }}>
        <div className="lore-addloc-header">
          <span className="lore-addloc-title">🎨 Add Palette Color</span>
          <button className="lore-flag-drawer-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="lore-addloc-body flex flex-col gap-4 items-center pt-6 pb-4">
          <div 
            className="w-24 h-24 rounded-full shadow-inner border border-border" 
            style={{ backgroundColor: color }} 
          />
          <div className="w-full px-4">
            <input 
              type="color" 
              value={color}
              onChange={e => setColor(e.target.value)}
              className="w-full h-12 cursor-pointer rounded bg-transparent border-none p-0"
            />
          </div>
          <div className="text-xl font-mono text-text-muted uppercase tracking-wider">{color}</div>
        </div>

        <div className="lore-addloc-footer mt-4">
          <div className="lore-addloc-actions w-full flex justify-end">
            <button className="lore-flag-drawer-cancel" onClick={onClose}>Cancel</button>
            <button
              className="lore-addloc-submit"
              onClick={() => onSubmit(color)}
            >
              + Add Color
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
