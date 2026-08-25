import React from 'react';

// Severity colors (dark-surface optimized)
const CONFIG = {
  CRITICAL: {
    bg: 'rgba(225,29,72,0.15)',
    border: 'rgba(225,29,72,0.30)',
    color: '#e11d48',
    label: 'CRITICAL',
  },
  HIGH: {
    bg: 'rgba(245,158,11,0.15)',
    border: 'rgba(245,158,11,0.30)',
    color: '#f59e0b',
    label: 'HIGH',
  },
  MEDIUM: {
    bg: 'rgba(56,189,248,0.15)',
    border: 'rgba(56,189,248,0.30)',
    color: '#38bdf8',
    label: 'MEDIUM',
  },
  LOW: {
    bg: 'rgba(16,185,129,0.10)',
    border: 'rgba(16,185,129,0.25)',
    color: '#10b981',
    label: 'LOW',
  },
};

const SIZE = {
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
};

export default function SeverityBadge({ severity, size = 'sm' }) {
  const c = CONFIG[severity] || {
    bg: 'var(--color-surface-4)',
    border: 'var(--color-border)',
    color: 'var(--color-text-muted)',
    label: severity || 'UNKNOWN',
  };

  return (
    <span
      className={`${SIZE[size] || SIZE.sm} rounded font-mono-code font-bold uppercase tracking-wider inline-block`}
      style={{ backgroundColor: c.bg, border: `1px solid ${c.border}`, color: c.color }}
    >
      {c.label}
    </span>
  );
}
