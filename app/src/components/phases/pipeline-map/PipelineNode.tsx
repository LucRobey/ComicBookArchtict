import React from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';

export interface PipelineNodeData {
  id: string;
  label: string;
  type: 'phase' | 'file' | 'agent';
  emoji?: string;
  description: string;
  badge?: string;
  accentColor?: string;
  activePhaseId?: string;
  inputs?: string[];
  outputs?: string[];
  [key: string]: unknown;
}

const handleStyle: React.CSSProperties = {
  width: 8,
  height: 8,
  background: 'var(--panel-bg)',
  border: '2px solid var(--accent-primary)',
};

export const PipelineNode: React.FC<NodeProps> = ({ data }) => {
  const { label, type, emoji, description, badge, accentColor } = data as unknown as PipelineNodeData;

  // Determine styles based on type
  let borderClass = 'border-border bg-surface';
  let titleClass = 'text-foreground';
  let typeLabel = '';

  if (type === 'phase') {
    borderClass = 'border-l-4 bg-surface';
    titleClass = 'text-foreground font-bold';
    typeLabel = 'App Phase';
  } else if (type === 'file') {
    borderClass = 'border border-dashed border-danger/60 bg-danger-dim/5';
    titleClass = 'text-danger font-mono text-xs';
    typeLabel = 'Data File';
  } else if (type === 'agent') {
    borderClass = 'border border-warning/60 bg-warning/5 rounded-full';
    titleClass = 'text-warning font-semibold';
    typeLabel = 'AI Agent';
  }

  return (
    <div className="relative group">
      {/* Target handle (left side) */}
      <Handle type="target" position={Position.Left} style={handleStyle} />

      <div
        style={{
          width: 220,
          borderLeftColor: type === 'phase' ? (accentColor || 'var(--accent-primary)') : undefined,
        }}
        className={`p-4 rounded-xl transition-all duration-200 shadow-sm flex flex-col justify-between box-border border ${borderClass} hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5`}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[10px] uppercase tracking-wider font-mono text-muted">
              {typeLabel}
            </span>
            <h3 className={`text-sm truncate leading-snug ${titleClass}`} title={label}>
              {label}
            </h3>
          </div>
          {emoji && (
            <span className="text-xl shrink-0 select-none">
              {emoji}
            </span>
          )}
        </div>

        <p className="text-[11px] text-foreground-muted line-clamp-2 leading-relaxed">
          {description}
        </p>

        {badge && (
          <div className="mt-3 pt-2 border-t border-border-subtle flex justify-between items-center">
            <span className="text-[9px] text-muted font-mono">{badge}</span>
            {type === 'phase' && (
              <span className="text-[9px] font-bold text-accent-primary flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                Inspect ➔
              </span>
            )}
          </div>
        )}
      </div>

      {/* Source handle (right side) */}
      <Handle type="source" position={Position.Right} style={handleStyle} />
    </div>
  );
};
