import React, { useState } from 'react';
import './PhaseHeader.css';

export interface PhaseHeaderProps {
  /** Short title for the phase */
  title: string;
  /** Emoji icon displayed next to the title */
  emoji: string;
  /** Phase badge label, e.g. "Phase 0" or "Step 1" */
  badge: string;
  /** Brief description of what this phase does */
  description: string;
  /** Files this phase reads */
  inputs: string[];
  /** Files this phase writes / produces */
  outputs: string[];
  /** Accent color for the badge pill */
  /** Accent color for the badge pill */
  accentColor?: string;
  /** Workflow guidance: where to go next */
  nextStep?: {
    label: string;
    phaseId?: string;
    onNavigate?: () => void;
  };
  /** Whether the header details are collapsed by default */
  defaultCollapsed?: boolean;
}

export const PhaseHeader: React.FC<PhaseHeaderProps> = ({
  title,
  emoji,
  badge,
  description,
  inputs,
  outputs,
  accentColor = '#3b82f6',
  nextStep,
  defaultCollapsed = true,
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div className="phase-header-wrapper">
      {/* Main bar — always visible */}
      <button
        className="phase-header-bar"
        onClick={() => setCollapsed(!collapsed)}
        aria-expanded={!collapsed}
      >
        <div className="phase-header-left">
          <span className="phase-header-emoji">{emoji}</span>
          <h1 className="phase-header-title">{title}</h1>
          <span className="phase-header-badge" style={{ background: accentColor }}>
            {badge}
          </span>
        </div>
        <span className="phase-header-chevron" data-collapsed={collapsed}>
          ▾
        </span>
      </button>

      {/* Collapsible detail panel */}
      {!collapsed && (
        <div className="phase-header-details">
          <p className="phase-header-description">{description}</p>

          <div className="phase-header-io">
            {inputs.length > 0 && (
              <div className="phase-header-io-group">
                <span className="phase-header-io-label phase-header-io-label--input">⬇ Inputs</span>
                <div className="phase-header-io-chips">
                  {inputs.map((f) => (
                    <span key={f} className="phase-header-chip phase-header-chip--input">
                      📄 {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {outputs.length > 0 && (
              <div className="phase-header-io-group">
                <span className="phase-header-io-label phase-header-io-label--output">⬆ Outputs</span>
                <div className="phase-header-io-chips">
                  {outputs.map((f) => (
                    <span key={f} className="phase-header-chip phase-header-chip--output">
                      💾 {f}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {nextStep && (
            <div className="phase-header-next">
              <span className="phase-header-next-label">Next step →</span>
              {nextStep.onNavigate ? (
                <button className="phase-header-next-btn" onClick={nextStep.onNavigate}>
                  {nextStep.label}
                </button>
              ) : (
                <span className="phase-header-next-text">{nextStep.label}</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
