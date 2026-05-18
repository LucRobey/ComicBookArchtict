import React from 'react';

export type PhaseId = 'lore' | 'pacing' | 'characters' | 'panels' | 'script' | 'assembly';

interface Phase {
  id: PhaseId;
  label: string;
  emoji: string;
  accentColor: string;
  badge: string;
}

const PHASES: Phase[] = [
  { id: 'lore',       label: 'Lore & Story',    emoji: '🌍', accentColor: '#8b5cf6', badge: 'Phase 0' },
  { id: 'pacing',     label: 'Pacing',           emoji: '📋', accentColor: '#06b6d4', badge: 'Phase 1' },
  { id: 'characters', label: 'Characters',       emoji: '🎭', accentColor: '#f59e0b', badge: 'Phase 1.5' },
  { id: 'panels',     label: 'Panel Structure',  emoji: '📐', accentColor: '#10b981', badge: 'Phase 2' },
  { id: 'script',     label: 'Script',           emoji: '✍️',  accentColor: '#f97316', badge: 'Phase 3' },
  { id: 'assembly',   label: 'Assembly',         emoji: '🧩', accentColor: '#3b82f6', badge: 'Phase 6' },
];

interface PhaseTabBarProps {
  activePhase: PhaseId;
  onPhaseChange: (phase: PhaseId) => void;
}

const PhaseTabBar: React.FC<PhaseTabBarProps> = ({ activePhase, onPhaseChange }) => {
  const active = PHASES.find(p => p.id === activePhase);

  return (
    <header className="h-14 bg-background-panel border-b border-border flex items-center justify-between px-6 shadow-sm z-30">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold tracking-tight text-foreground">ARC 3.0</h1>
        <span className="text-border">|</span>
        <h2 className="text-sm font-bold font-heading text-foreground-muted uppercase">
          {active?.badge}: {active?.label}
        </h2>
      </div>
      <div className="flex items-center gap-2">
        {PHASES.map(phase => (
          <button
            key={phase.id}
            className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-colors flex items-center gap-2 ${
              activePhase === phase.id 
                ? 'bg-secondary text-border-blueprint border-b-2 border-border-blueprint' 
                : 'text-foreground-muted hover:text-foreground hover:bg-secondary'
            }`}
            onClick={() => onPhaseChange(phase.id)}
          >
            <span>{phase.emoji}</span>
            <span>{phase.label}</span>
          </button>
        ))}
      </div>
    </header>
  );
};

export default PhaseTabBar;
