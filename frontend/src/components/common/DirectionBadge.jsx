import React from 'react';

const CONFIG = {
  POSITIVE: { bg: 'rgba(16,185,129,0.10)', color: '#10b981', label: '↑ POSITIVE' },
  NEGATIVE: { bg: 'rgba(225,29,72,0.15)', color: '#e11d48', label: '↓ NEGATIVE' },
  NEUTRAL:  { bg: 'rgba(195,192,255,0.10)', color: '#c3c0ff', label: '→ NEUTRAL' },
};

export default function DirectionBadge({ direction }) {
  const c = CONFIG[direction] || {
    bg: 'var(--color-surface-4)',
    color: 'var(--color-text-dim)',
    label: direction || 'UNKNOWN',
  };

  return (
    <span
      className="text-[10px] px-2 py-0.5 rounded font-mono-code font-bold uppercase inline-block"
      style={{ backgroundColor: c.bg, color: c.color }}
    >
      {c.label}
    </span>
  );
}
