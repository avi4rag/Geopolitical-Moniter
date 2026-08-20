import React from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Minus } from 'lucide-react';

// ─── Editorial Direction Badge ────────────────────────────────────────────────
// Clean visual pill for positive, negative, and risk transmission directions.
// ─────────────────────────────────────────────────────────────────────────────

const DIRECTION_CONFIG = {
  NEGATIVE: {
    key: 'NEGATIVE',
    color: '#fca5a5',
    bg: 'rgba(239, 68, 68, 0.12)',
    border: 'rgba(239, 68, 68, 0.35)',
    Icon: TrendingDown,
  },
  RISK_INCREASE: {
    key: 'RISK_INCREASE',
    color: '#fdba74',
    bg: 'rgba(249, 115, 22, 0.12)',
    border: 'rgba(249, 115, 22, 0.35)',
    Icon: AlertTriangle,
  },
  POSITIVE: {
    key: 'POSITIVE',
    color: '#6ee7b7',
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.35)',
    Icon: TrendingUp,
  },
  RISK_DECREASE: {
    key: 'RISK_DECREASE',
    color: '#6ee7b7',
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.35)',
    Icon: CheckCircle,
  },
  NEUTRAL: {
    key: 'NEUTRAL',
    color: '#cbd5e1',
    bg: 'rgba(148, 163, 184, 0.12)',
    border: 'rgba(148, 163, 184, 0.35)',
    Icon: Minus,
  },
};

export default function DirectionBadge({ direction, short = false }) {
  const { t } = useTranslation();
  const dir = direction ? direction.toUpperCase() : 'NEUTRAL';
  const cfg = DIRECTION_CONFIG[dir] || DIRECTION_CONFIG.NEUTRAL;
  const { Icon } = cfg;

  const translationKey = short
    ? `badges.direction.${cfg.key}_SHORT`
    : `badges.direction.${cfg.key}`;

  const label = t(translationKey, { defaultValue: cfg.key });

  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full shrink-0 shadow-sm"
      style={{
        backgroundColor: cfg.bg,
        border: `1px solid ${cfg.border}`,
        color: cfg.color,
      }}
    >
      <Icon size={12} className="shrink-0" />
      <span>{label}</span>
    </span>
  );
}
