import React from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Minus } from 'lucide-react';

// ─── Direction Badge ──────────────────────────────────────────────────────────
// Shows whether an impact direction is negative, positive, or risk increase.
// ─────────────────────────────────────────────────────────────────────────────

const DIRECTION_CONFIG = {
  NEGATIVE: {
    key: 'NEGATIVE',
    color: '#f87171',
    bg: 'rgba(239, 68, 68, 0.12)',
    border: 'rgba(239, 68, 68, 0.3)',
    Icon: TrendingDown,
  },
  RISK_INCREASE: {
    key: 'RISK_INCREASE',
    color: '#fb923c',
    bg: 'rgba(249, 115, 22, 0.12)',
    border: 'rgba(249, 115, 22, 0.3)',
    Icon: AlertTriangle,
  },
  POSITIVE: {
    key: 'POSITIVE',
    color: '#4ade80',
    bg: 'rgba(34, 197, 94, 0.12)',
    border: 'rgba(34, 197, 94, 0.3)',
    Icon: TrendingUp,
  },
  RISK_DECREASE: {
    key: 'RISK_DECREASE',
    color: '#4ade80',
    bg: 'rgba(34, 197, 94, 0.12)',
    border: 'rgba(34, 197, 94, 0.3)',
    Icon: CheckCircle,
  },
  NEUTRAL: {
    key: 'NEUTRAL',
    color: '#94a3b8',
    bg: 'rgba(148, 163, 184, 0.12)',
    border: 'rgba(148, 163, 184, 0.3)',
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
      className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-md shrink-0"
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
