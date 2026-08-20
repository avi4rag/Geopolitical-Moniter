import React from 'react';
import { useTranslation } from 'react-i18next';

// ─── Editorial Severity Badge ─────────────────────────────────────────────────
// Visual pill indicator for event & impact severity levels.
// ─────────────────────────────────────────────────────────────────────────────

const SEVERITY_CONFIG = {
  CRITICAL: {
    key: 'CRITICAL',
    className: 'bg-rose-50 border-rose-200 text-rose-700',
    dot: 'bg-rose-600',
  },
  HIGH: {
    key: 'HIGH',
    className: 'bg-orange-50 border-orange-200 text-orange-800',
    dot: 'bg-orange-600',
  },
  MEDIUM: {
    key: 'MEDIUM',
    className: 'bg-amber-50 border-amber-200 text-amber-800',
    dot: 'bg-amber-600',
  },
  LOW: {
    key: 'LOW',
    className: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    dot: 'bg-emerald-600',
  },
  MINIMAL: {
    key: 'MINIMAL',
    className: 'bg-slate-100 border-slate-200 text-slate-700',
    dot: 'bg-slate-500',
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
      className={`inline-flex items-center gap-1.5 font-bold font-mono uppercase tracking-wider rounded-full border ${
        isSmall ? 'text-[10px] px-2 py-0.5' : 'text-[11px] px-2.5 py-0.5'
      } ${cfg.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      <span>{label}</span>
    </span>
  );
}
