import React from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { CharacterSignature } from '@/types/data';

export interface CharacterNodeData {
  char: string;
  sig: CharacterSignature;
  isActive: boolean;
  [key: string]: unknown;
}

const handleStyle: React.CSSProperties = {
  opacity: 0,
  width: 8,
  height: 8,
  background: 'var(--accent-primary, #3b82f6)',
};

export const CharacterNode: React.FC<NodeProps> = ({ data }) => {
  const { char, sig, isActive } = data as unknown as CharacterNodeData;

  return (
    <>
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <Handle type="target" position={Position.Left} style={handleStyle} />

      <div
        style={{ padding: '1.5rem 2.5rem', width: 260 }}
        className={`cursor-pointer rounded-xl transition-all duration-200 shadow-sm group flex flex-col justify-between box-border ${
          isActive
            ? 'border-2 border-primary bg-surface shadow-md ring-4 ring-primary/10'
            : 'border border-border bg-surface hover:border-primary/50 hover:shadow-md'
        }`}
      >
        <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-4">
          <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
            {char}
          </h3>
          <span
            className={`text-2xl transition-transform ${isActive ? 'scale-110' : 'opacity-60'}`}
          >
            🎭
          </span>
        </div>
        <div className="text-sm text-foreground-muted flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="opacity-70 text-xs uppercase tracking-wider font-bold">Age</span>
            <span className="font-medium text-foreground">{sig.age || '?'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="opacity-70 text-xs uppercase tracking-wider font-bold">Gender</span>
            <span className="font-medium text-foreground">{sig.gender || '?'}</span>
          </div>
          <div className="mt-2 pt-3 border-t border-border-subtle flex justify-end">
            <span className="px-3 py-1.5 bg-brand/10 text-accent-primary rounded-md text-xs font-bold uppercase tracking-wider">
              {sig.role || 'Unassigned'}
            </span>
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} style={handleStyle} />
      <Handle type="source" position={Position.Right} style={handleStyle} />
    </>
  );
};
