import React, { useState } from 'react';
import { useJsonFile } from '@/hooks/useJsonFile';
import { exportQaReport } from '@/utils/qaExport';
import '../../../styles/characters.css';

interface IntroPanel {
  panel_number: number;
  framing: string;
  action: string;
}

interface CharacterIntro {
  page_number: number;
  character: string;
  layout_type: string;
  scene_description: string;
  narrator_caption: string;
  character_dialogue: string;
  panels: IntroPanel[];
}

interface IntroData {
  intro_pages: CharacterIntro[];
}

const LAYOUT_TYPES = ['full_page_splash', 'three_panel_sequence', 'five_panel_sequence', 'two_panel_spread'];

const LAYOUT_LABELS: Record<string, string> = {
  full_page_splash:     '1 Full Page Splash',
  three_panel_sequence: '3-Panel Sequence',
  five_panel_sequence:  '5-Panel Sequence',
  two_panel_spread:     '2-Panel Spread',
};

const QA_TYPES = [
  { id: 'REWRITE_SCENE',   label: 'Rewrite Scene',   desc: 'Change the scene description' },
  { id: 'CHANGE_LAYOUT',   label: 'Change Layout',    desc: 'Switch the page layout type' },
  { id: 'REWRITE_CAPTION', label: 'Rewrite Caption',  desc: 'Change the narrator caption' },
  { id: 'REWRITE_DIALOGUE',label: 'Rewrite Dialogue', desc: "Change the character's first line" },
];

const INTROS_PATH = 'data/intro_pages.json';

const CharactersPhase: React.FC = () => {
  const { data, loading, error } = useJsonFile<IntroData>(INTROS_PATH);
  const [selected, setSelected] = useState(0);
  const [qaType, setQaType] = useState<string | null>(null);
  const [qaNote, setQaNote] = useState('');
  const [qaNewLayout, setQaNewLayout] = useState(LAYOUT_TYPES[0]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  if (loading) return <div className="chars-state">Loading character intros…</div>;
  if (error) return (
    <div className="chars-state error">
      <div style={{ fontSize: '2rem' }}>⚠️</div>
      <p>Could not load character intros.</p>
      <p className="chars-state-sub">{error}</p>
      <p className="chars-state-hint">Run the Phase 1.5 agent to generate <code>data/intro_pages.json</code></p>
    </div>
  );
  if (!data || data.intro_pages.length === 0) return <div className="chars-state">No character intros found.</div>;

  const intro = data.intro_pages[selected];

  const buildReport = (): string => {
    if (!qaType) return '';
    const now = new Date().toISOString();
    let r = `# QA Report — Phase 1.5 (Character Intros)\nGenerated: ${now}\n\n`;
    const ref = `Character: ${intro.character}`;
    if (qaType === 'REWRITE_SCENE')    r += `## ${ref} — [REWRITE_SCENE]\n* **Current scene:** ${intro.scene_description}\n* **Request:** ${qaNote}\n`;
    if (qaType === 'CHANGE_LAYOUT')    r += `## ${ref} — [CHANGE_LAYOUT]\n* **Current:** ${intro.layout_type}\n* **New layout:** ${qaNewLayout}\n`;
    if (qaType === 'REWRITE_CAPTION')  r += `## ${ref} — [REWRITE_CAPTION]\n* **Current:** "${intro.narrator_caption}"\n* **Request:** ${qaNote}\n`;
    if (qaType === 'REWRITE_DIALOGUE') r += `## ${ref} — [REWRITE_DIALOGUE]\n* **Current:** "${intro.character_dialogue}"\n* **Request:** ${qaNote}\n`;
    return r;
  };

  const isValid = () => {
    if (!qaType) return false;
    if (qaType !== 'CHANGE_LAYOUT' && !qaNote.trim()) return false;
    return true;
  };

  const handleExport = async () => {
    const result = await exportQaReport({ phase: '15', phaseFolder: 'characters', content: buildReport() });
    setExportStatus(result.success ? 'success' : 'error');
    setTimeout(() => { setExportStatus('idle'); setDrawerOpen(false); setQaType(null); setQaNote(''); }, 1500);
  };

  return (
    <div className="chars-phase">
      {/* Character selector sidebar */}
      <div className="chars-sidebar bg-background-panel border-r border-border shadow-sm">
        <div className="chars-sidebar-header">
          <h3>Characters</h3>
          <span className="chars-count">{data.intro_pages.length}</span>
        </div>
        <div className="chars-list">
          {data.intro_pages.map((intro, i) => (
            <button key={intro.character} className={`chars-btn ${i === selected ? 'active' : ''}`} onClick={() => { setSelected(i); setDrawerOpen(false); setQaType(null); }}>
              <span className="chars-avatar">{intro.character[0]}</span>
              <div className="chars-btn-text">
                <span className="chars-name">{intro.character}</span>
                <span className="chars-layout">{LAYOUT_LABELS[intro.layout_type] ?? intro.layout_type}</span>
              </div>
            </button>
          ))}
        </div>
        {exportStatus !== 'idle' && (
          <div className={`chars-toast ${exportStatus}`}>
            {exportStatus === 'success' ? '✓ QA report exported!' : '✗ Export failed'}
          </div>
        )}
      </div>

      {/* Main view */}
      <div className="chars-main">
        <div className="chars-main-header">
          <div>
            <h2>{intro.character}</h2>
            <span className="chars-page-ref">Page {intro.page_number} · {LAYOUT_LABELS[intro.layout_type] ?? intro.layout_type}</span>
          </div>
          <button className="chars-qa-open-btn" onClick={() => setDrawerOpen(true)}>🚩 Flag for Agent</button>
        </div>

        <div className="chars-content">
          {/* Scene description */}
          <div className="chars-section">
            <label className="chars-section-label">Scene Description</label>
            <div className="chars-section-value">{intro.scene_description}</div>
          </div>

          {/* Narrator caption */}
          <div className="chars-section">
            <label className="chars-section-label">📝 Narrator Caption</label>
            <div className="chars-section-value caption-style">"{intro.narrator_caption}"</div>
          </div>

          {/* Character dialogue */}
          <div className="chars-section">
            <label className="chars-section-label">💬 First Line</label>
            <div className="chars-section-value dialogue-style">"{intro.character_dialogue}"</div>
          </div>

          {/* Panel breakdown */}
          <div className="chars-section">
            <label className="chars-section-label">Panel Breakdown ({intro.panels.length} panels)</label>
            <div className="chars-panels-list">
              {intro.panels.map(p => (
                <div key={p.panel_number} className="chars-panel-item">
                  <span className="chars-panel-num">Panel {p.panel_number}</span>
                  <span className="chars-panel-framing">{p.framing}</span>
                  <span className="chars-panel-action">{p.action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* QA Drawer */}
      {drawerOpen && (
        <div className="chars-qa-drawer bg-background-panel border-l border-border shadow-lg">
          <div className="chars-qa-header">
            <div>
              <h3>🚩 Flag for Agent</h3>
              <p className="chars-qa-sub">{intro.character}</p>
            </div>
            <button className="chars-qa-close" onClick={() => setDrawerOpen(false)}>✕</button>
          </div>

          <div className="chars-qa-types">
            {QA_TYPES.map(t => (
              <button key={t.id} className={`chars-qa-btn ${qaType === t.id ? 'active' : ''}`} onClick={() => setQaType(t.id)}>
                <span className="chars-qa-label">{t.label}</span>
                <span className="chars-qa-desc">{t.desc}</span>
              </button>
            ))}
          </div>

          {qaType && (
            <div className="chars-qa-fields">
              {qaType === 'CHANGE_LAYOUT' ? (
                <select className="chars-qa-select" value={qaNewLayout} onChange={e => setQaNewLayout(e.target.value)}>
                  {LAYOUT_TYPES.map(l => <option key={l} value={l}>{LAYOUT_LABELS[l] ?? l}</option>)}
                </select>
              ) : (
                <textarea
                  className="chars-qa-textarea"
                  placeholder="Describe what should change…"
                  value={qaNote}
                  onChange={e => setQaNote(e.target.value)}
                  rows={4}
                />
              )}
            </div>
          )}

          <button className="chars-qa-export-btn" disabled={!isValid()} onClick={handleExport}>
            📤 Export QA Report
          </button>
        </div>
      )}
    </div>
  );
};

export default CharactersPhase;
