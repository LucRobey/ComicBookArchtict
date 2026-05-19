import React, { useState } from 'react';

interface RequestViewModalProps {
  onClose: () => void;
  onSubmit: (label: string, description: string, useFor: string) => void;
}

export const RequestViewModal: React.FC<RequestViewModalProps> = ({ onClose, onSubmit }) => {
  const [form, setForm] = useState({
    label: '',
    description: '',
    useFor: ''
  });

  const handleSubmit = () => {
    if (!form.label.trim()) return;
    onSubmit(form.label.trim(), form.description.trim(), form.useFor.trim());
  };

  return (
    <div className="lore-addloc-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="lore-addloc-modal" style={{ maxWidth: '500px' }}>
        <div className="lore-addloc-header">
          <span className="lore-addloc-title">📷 Request New View</span>
          <button className="lore-flag-drawer-close" onClick={onClose}>✕</button>
        </div>
        <p className="lore-addloc-subtitle">Describe the view you need the agent to generate. A placeholder will be created pending generation.</p>

        <div className="lore-addloc-body">
          <div className="lore-addloc-field">
            <label className="lore-addloc-label">Label (Prompt) <span className="lore-addloc-req">*</span></label>
            <input
              className="lore-addloc-input"
              type="text"
              placeholder="e.g. Wide angle from the entrance"
              value={form.label}
              onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
            />
          </div>

          <div className="lore-addloc-field">
            <label className="lore-addloc-label">Description (Optional)</label>
            <textarea
              className="lore-addloc-textarea"
              placeholder="Any specific details, framing constraints, or elements to include..."
              rows={3}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div className="lore-addloc-field">
            <label className="lore-addloc-label">Use Case (Optional)</label>
            <input
              className="lore-addloc-input"
              type="text"
              placeholder="e.g. Establishing shot, reference for Scene 3..."
              value={form.useFor}
              onChange={e => setForm(f => ({ ...f, useFor: e.target.value }))}
            />
          </div>
        </div>

        <div className="lore-addloc-footer">
          <div className="lore-addloc-req-note"><span className="lore-addloc-req">*</span> Required fields</div>
          <div className="lore-addloc-actions">
            <button className="lore-flag-drawer-cancel" onClick={onClose}>Cancel</button>
            <button
              className="lore-addloc-submit"
              disabled={!form.label.trim()}
              onClick={handleSubmit}
            >
              + Add View Placeholder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
