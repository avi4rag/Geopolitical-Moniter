import React from 'react';
import { useTranslation } from 'react-i18next';

// ─── Editorial Severity Badge ─────────────────────────────────────────────────
// Visual pill indicator for event & impact severity levels.
// ─────────────────────────────────────────────────────────────────────────────

const SEVERITY_CONFIG = {
  CRITICAL: {
    key: 'CRITICAL',
    bg: 'rgba(239, 68, 68, 0.15)',
    border: 'rgba(239, 68, 68, 0.45)',
    color: '#fca5a5',
    dot: '#ef4444',
  },
  HIGH: {
    key: 'HIGH',
    bg: 'rgba(249, 115, 22, 0.15)',
    border: 'rgba(249, 115, 22, 0.45)',
    color: '#fdba74',
    dot: '#f97316',
  },
  MEDIUM: {
    key: 'MEDIUM',
    bg: 'rgba(245, 158, 11, 0.15)',
    border: 'rgba(245, 158, 11, 0.45)',
    color: '#fde047',
    dot: '#f59e0b',
  },
  LOW: {
    key: 'LOW',
    bg: 'rgba(16, 185, 129, 0.15)',
    border: 'rgba(16, 185, 129, 0.45)',
    color: '#6ee7b7',
    dot: '#10b981',
  },
  MINIMAL: {
    key: 'MINIMAL',
    bg: 'rgba(148, 163, 184, 0.15)',
    border: 'rgba(148, 163, 184, 0.45)',
    color: '#cbd5e1',
    dot: '#94a3b8',
  },
};

export default function SeverityBadge({ severity, size = 'md' }) {
  const { t } = useTranslation();
  const level = severity ? severity.toUpperCase() : 'MEDIUM';
  const cfg = SEVERITY_CONFIG[level] || SEVERITY_CONFIG.MEDIUM;

  const isSmall = size === 'sm';
  const label = t(`badges.severity.${cfg.key}`, { defaultValue: cfg.key });

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold font-mono uppercase tracking-wider rounded-full shadow-sm ${
        isSmall ? 'text-[10px] px-2 py-0.5' : 'text-[11px] px-2.5 py-1'
      }`}
      style={{
        backgroundColor: cfg.bg,
        border: `1px solid ${cfg.border}`,
        color: cfg.color,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse"
        style={{ backgroundColor: cfg.dot }}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
