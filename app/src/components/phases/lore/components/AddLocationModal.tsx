import React, { useState, useRef } from 'react';

interface AddLocationModalProps {
  onClose: () => void;
}

export const AddLocationModal: React.FC<AddLocationModalProps> = ({ onClose }) => {
  const [addLocStatus, setAddLocStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');
  const [addLocForm, setAddLocForm] = useState<{
    name: string;
    type: 'interior' | 'exterior' | 'recurring';
    description: string;
    appearsInScenes: string;
    structure: 'flat' | 'multi-variant';
    variants: { label: string; description: string }[];
    shotIdeas: string;
    palette: { hex: string; comment: string }[];
    lightingSummary: string;
    agentNotes: string;
  }>({
    name: '',
    type: 'interior',
    description: '',
    appearsInScenes: '',
    structure: 'flat',
    variants: [{ label: 'Morning', description: '' }, { label: 'Night', description: '' }],
    shotIdeas: '',
    palette: [],
    lightingSummary: '',
    agentNotes: '',
  });
  const addLocColorRef = useRef<HTMLInputElement>(null);

  const addVariantRow = () =>
    setAddLocForm(f => ({ ...f, variants: [...f.variants, { label: '', description: '' }] }));

  const removeVariantRow = (i: number) =>
    setAddLocForm(f => ({ ...f, variants: f.variants.filter((_, idx) => idx !== i) }));

  const updateVariant = (i: number, field: 'label' | 'description', value: string) =>
    setAddLocForm(f => ({
      ...f,
      variants: f.variants.map((v, idx) => idx === i ? { ...v, [field]: value } : v),
    }));

  const submitAddLocation = async () => {
    if (!addLocForm.name.trim() || !addLocForm.description.trim()) return;
    setAddLocStatus('sending');

    const slug = addLocForm.name
      .toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    const now = new Date().toISOString();

    const lines = [
      `# QA Flag — Add Location`,
      `Generated: ${now}`,
      ``,
      `## [ADD_LOCATION:loc_${slug}]`,
      `* **Name:** ${addLocForm.name}`,
      `* **Type:** ${addLocForm.type}`,
      `* **Description:** ${addLocForm.description}`,
      `* **Appears in scenes:** ${addLocForm.appearsInScenes.trim() || '(none specified)'}`,
      `* **Structure:** ${addLocForm.structure}`,
    ];

    if (addLocForm.structure === 'multi-variant') {
      lines.push(`* **Variants:**`);
      addLocForm.variants
        .filter(v => v.label.trim())
        .forEach(v => {
          lines.push(`  - ${v.label}${v.description ? ` | ${v.description}` : ''}`);
        });
    }

    if (addLocForm.lightingSummary.trim())
      lines.push(`* **Lighting summary:** ${addLocForm.lightingSummary}`);
    if (addLocForm.palette.length > 0)
      lines.push(`* **Palette:** ${addLocForm.palette.map(p => p.comment ? `${p.hex} (${p.comment})` : p.hex).join(', ')}`);
    if (addLocForm.shotIdeas.trim())
      lines.push(`* **Shot ideas:** ${addLocForm.shotIdeas}`);
    if (addLocForm.agentNotes.trim())
      lines.push(`* **Agent notes:** ${addLocForm.agentNotes}`);

    lines.push(``);
    lines.push(`> Agent: create entry in \`geography.json\` with id \`loc_${slug}\`, then run Pipeline 09 for this location, then Pipeline 08.`);

    const filename = `qa/lore/flag_add_location_${slug}_${now.replace(/[:.]/g, '-')}.md`;
    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: filename, content: lines.join('\n') }),
      });
      if (!res.ok) throw new Error('save failed');
      setAddLocStatus('ok');
      setTimeout(() => { onClose(); }, 1200);
    } catch {
      setAddLocStatus('err');
    }
  };

  return (
    <div className="lore-addloc-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="lore-addloc-modal">
        <div className="lore-addloc-header">
          <span className="lore-addloc-title">📍 New Location — Flag for Agent</span>
          <button className="lore-flag-drawer-close" onClick={onClose}>✕</button>
        </div>
        <p className="lore-addloc-subtitle">Fill in the details. This will create a flag in <code>qa/lore/</code> for the agent to build the location in <code>geography.json</code>.</p>

        <div className="lore-addloc-body">
          <div className="lore-addloc-row lore-addloc-row--2col">
            <div className="lore-addloc-field">
              <label className="lore-addloc-label">Name <span className="lore-addloc-req">*</span></label>
              <input
                className="lore-addloc-input"
                type="text"
                placeholder="e.g. The Rooftop"
                value={addLocForm.name}
                onChange={e => setAddLocForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="lore-addloc-field">
              <label className="lore-addloc-label">Type</label>
              <select
                className="lore-addloc-select"
                value={addLocForm.type}
                onChange={e => setAddLocForm(f => ({ ...f, type: e.target.value as 'interior' | 'exterior' | 'recurring' }))}
              >
                <option value="interior">🏢 Interior</option>
                <option value="exterior">🌆 Exterior</option>
                <option value="recurring">🔁 Recurring</option>
              </select>
            </div>
          </div>

          <div className="lore-addloc-field">
            <label className="lore-addloc-label">Physical description <span className="lore-addloc-req">*</span></label>
            <textarea
              className="lore-addloc-textarea"
              placeholder="Timeless description of the space itself — light, materials, atmosphere. No time-of-day here."
              rows={3}
              value={addLocForm.description}
              onChange={e => setAddLocForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div className="lore-addloc-field">
            <label className="lore-addloc-label">Appears in scenes</label>
            <input
              className="lore-addloc-input"
              type="text"
              placeholder="e.g. 2, 4, 7"
              value={addLocForm.appearsInScenes}
              onChange={e => setAddLocForm(f => ({ ...f, appearsInScenes: e.target.value }))}
            />
          </div>

          <div className="lore-addloc-field">
            <label className="lore-addloc-label">Structure</label>
            <div className="lore-flag-mode-toggle">
              <button
                className={`lore-flag-mode-btn ${addLocForm.structure === 'flat' ? 'active' : ''}`}
                onClick={() => setAddLocForm(f => ({ ...f, structure: 'flat' }))}
              >Flat — single mood</button>
              <button
                className={`lore-flag-mode-btn ${addLocForm.structure === 'multi-variant' ? 'active' : ''}`}
                onClick={() => setAddLocForm(f => ({ ...f, structure: 'multi-variant' }))}
              >Multi-variant (time-of-day)</button>
              <span className="lore-flag-mode-hint">
                {addLocForm.structure === 'flat' ? 'One mood — no time-of-day split' : 'Separate palettes and shots per variant'}
              </span>
            </div>
          </div>

          {addLocForm.structure === 'multi-variant' && (
            <div className="lore-addloc-field">
              <label className="lore-addloc-label">Variants</label>
              <div className="lore-addloc-variants">
                {addLocForm.variants.map((v, i) => (
                  <div key={i} className="lore-addloc-variant-row">
                    <input
                      className="lore-addloc-input lore-addloc-variant-label"
                      type="text"
                      placeholder="Label (e.g. Morning)"
                      value={v.label}
                      onChange={e => updateVariant(i, 'label', e.target.value)}
                    />
                    <input
                      className="lore-addloc-input lore-addloc-variant-desc"
                      type="text"
                      placeholder="Mood / atmosphere (optional)"
                      value={v.description}
                      onChange={e => updateVariant(i, 'description', e.target.value)}
                    />
                    {addLocForm.variants.length > 1 && (
                      <button className="lore-addloc-remove-variant" onClick={() => removeVariantRow(i)} title="Remove">✕</button>
                    )}
                  </div>
                ))}
                <button className="lore-addloc-add-variant" onClick={addVariantRow}>+ Add variant</button>
              </div>
            </div>
          )}

          <div className="lore-addloc-field">
            <label className="lore-addloc-label">Shot ideas</label>
            <textarea
              className="lore-addloc-textarea"
              placeholder="Describe useful shots — e.g. 'wide from the entrance, close on the desk, detail of the window'. Agent will structure them."
              rows={2}
              value={addLocForm.shotIdeas}
              onChange={e => setAddLocForm(f => ({ ...f, shotIdeas: e.target.value }))}
            />
          </div>

          <div className="lore-addloc-row lore-addloc-row--2col">
            <div className="lore-addloc-field">
              <label className="lore-addloc-label">Lighting summary</label>
              <textarea
                className="lore-addloc-textarea"
                placeholder="e.g. Harsh overhead fluorescents, cold blue daylight"
                rows={2}
                value={addLocForm.lightingSummary}
                onChange={e => setAddLocForm(f => ({ ...f, lightingSummary: e.target.value }))}
              />
            </div>
            <div className="lore-addloc-field">
              <label className="lore-addloc-label">Palette <span style={{fontSize:'0.62rem',fontWeight:400,opacity:.6}}>(up to 8 colours)</span></label>
              <div className="lore-palette-picker lore-palette-picker--inline">
                <div className="lore-palette-swatches lore-palette-swatches--with-comments">
                  {addLocForm.palette.map((item, i) => (
                    <div key={i} className="lore-palette-swatch-wrapper">
                      <div className="lore-palette-swatch" style={{ background: item.hex }}>
                        <span className="lore-palette-swatch-hex">{item.hex}</span>
                        <button
                          className="lore-palette-swatch-remove"
                          onClick={() => setAddLocForm(f => ({ ...f, palette: f.palette.filter((_, idx) => idx !== i) }))}
                        >✕</button>
                      </div>
                      <input
                        className="lore-palette-swatch-comment"
                        placeholder="comment (e.g. accents)"
                        value={item.comment}
                        onChange={e => setAddLocForm(f => ({
                          ...f,
                          palette: f.palette.map((c, idx) => idx === i ? { ...c, comment: e.target.value } : c)
                        }))}
                      />
                    </div>
                  ))}
                  {addLocForm.palette.length < 8 && (
                    <button
                      className="lore-palette-add-btn"
                      onClick={() => addLocColorRef.current?.click()}
                      title="Pick a colour"
                    >+</button>
                  )}
                </div>
                <input
                  ref={addLocColorRef}
                  type="color"
                  style={{ display: 'none' }}
                  onChange={e => {
                    const hex = e.target.value;
                    if (!addLocForm.palette.some(p => p.hex === hex))
                      setAddLocForm(f => ({ ...f, palette: [...f.palette, { hex, comment: '' }] }));
                  }}
                />
                {addLocForm.palette.length === 0 && (
                  <p className="lore-palette-empty-hint">No colours picked yet — optional.</p>
                )}
              </div>
            </div>
          </div>

          <div className="lore-addloc-field">
            <label className="lore-addloc-label">Agent notes</label>
            <textarea
              className="lore-addloc-textarea"
              placeholder="Any additional context for the agent — narrative purpose, visual references, constraints…"
              rows={2}
              value={addLocForm.agentNotes}
              onChange={e => setAddLocForm(f => ({ ...f, agentNotes: e.target.value }))}
            />
          </div>
        </div>

        <div className="lore-addloc-footer">
          <div className="lore-addloc-req-note"><span className="lore-addloc-req">*</span> Required fields</div>
          <div className="lore-addloc-actions">
            <button className="lore-flag-drawer-cancel" onClick={onClose}>Cancel</button>
            <button
              className="lore-addloc-submit"
              disabled={!addLocForm.name.trim() || !addLocForm.description.trim() || addLocStatus === 'sending'}
              onClick={submitAddLocation}
            >
              {addLocStatus === 'sending' ? 'Sending…' : addLocStatus === 'ok' ? '✓ Flag sent!' : '🚩 Send to Agent'}
            </button>
            {addLocStatus === 'err' && <span className="lore-desc-err">⚠ Save failed</span>}
          </div>
        </div>
      </div>
    </div>
  );
};
