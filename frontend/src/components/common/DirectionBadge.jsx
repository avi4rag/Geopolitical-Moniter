import React from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Minus } from 'lucide-react';

// ─── Editorial Direction Badge ────────────────────────────────────────────────
// Clean visual pill for positive, negative, and risk transmission directions.
// ─────────────────────────────────────────────────────────────────────────────

const DIRECTION_CONFIG = {
  NEGATIVE: {
    key: 'NEGATIVE',
    className: 'text-rose-700 bg-rose-50 border-rose-200',
    Icon: TrendingDown,
  },
  RISK_INCREASE: {
    key: 'RISK_INCREASE',
    className: 'text-amber-800 bg-amber-50 border-amber-200',
    Icon: AlertTriangle,
  },
  POSITIVE: {
    key: 'POSITIVE',
    className: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    Icon: TrendingUp,
  },
  RISK_DECREASE: {
    key: 'RISK_DECREASE',
    className: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    Icon: CheckCircle,
  },
  NEUTRAL: {
    key: 'NEUTRAL',
    className: 'text-slate-700 bg-slate-100 border-slate-200',
    Icon: Minus,
  },
};

export default function DirectionBadge({ direction, short = false, size = 'md' }) {
  const { t } = useTranslation();
  const dir = direction ? direction.toUpperCase() : 'NEUTRAL';
  const cfg = DIRECTION_CONFIG[dir] || DIRECTION_CONFIG.NEUTRAL;
  const { Icon } = cfg;

  const translationKey = short
    ? `badges.direction.${cfg.key}_SHORT`
    : `badges.direction.${cfg.key}`;

  const label = t(translationKey, { defaultValue: cfg.key.replace(/_/g, ' ') });

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono font-bold rounded-full border shrink-0 ${
        size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-0.5'
      } ${cfg.className}`}
    >
      <Icon size={size === 'sm' ? 10 : 12} className="shrink-0" />
      <span>{label}</span>
    </span>
  );
}
