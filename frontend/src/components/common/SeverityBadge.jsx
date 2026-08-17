import React from 'react';
import { useTranslation } from 'react-i18next';

// ─── Severity Badge ───────────────────────────────────────────────────────────
// Visual pill indicator for event & impact severity levels.
// ─────────────────────────────────────────────────────────────────────────────

const SEVERITY_CONFIG = {
  CRITICAL: {
    key: 'CRITICAL',
    bg: 'rgba(239, 68, 68, 0.15)',
    border: 'rgba(239, 68, 68, 0.4)',
    color: '#f87171',
    dot: '#ef4444',
  },
  HIGH: {
    key: 'HIGH',
    bg: 'rgba(249, 115, 22, 0.15)',
    border: 'rgba(249, 115, 22, 0.4)',
    color: '#fb923c',
    dot: '#f97316',
  },
  MEDIUM: {
    key: 'MEDIUM',
    bg: 'rgba(245, 158, 11, 0.15)',
    border: 'rgba(245, 158, 11, 0.4)',
    color: '#fbbf24',
    dot: '#f59e0b',
  },
  LOW: {
    key: 'LOW',
    bg: 'rgba(34, 197, 94, 0.15)',
    border: 'rgba(34, 197, 94, 0.4)',
    color: '#4ade80',
    dot: '#22c55e',
  },
  MINIMAL: {
    key: 'MINIMAL',
    bg: 'rgba(148, 163, 184, 0.15)',
    border: 'rgba(148, 163, 184, 0.4)',
    color: '#94a3b8',
    dot: '#64748b',
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
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ${
        isSmall ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
      }`}
      style={{
        backgroundColor: cfg.bg,
        border: `1px solid ${cfg.border}`,
        color: cfg.color,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: cfg.dot }}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
