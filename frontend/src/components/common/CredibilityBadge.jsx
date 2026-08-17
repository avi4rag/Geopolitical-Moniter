import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';

// ─── Credibility Badge ────────────────────────────────────────────────────────
// Displays application-calculated credibility ratings for an event.
// ─────────────────────────────────────────────────────────────────────────────

const CREDIBILITY_CONFIG = {
  CONFIRMED: {
    key: 'CONFIRMED',
    color: '#4ade80',
    bg: 'rgba(34, 197, 94, 0.12)',
    border: 'rgba(34, 197, 94, 0.3)',
    Icon: ShieldCheck,
  },
  LIKELY: {
    key: 'LIKELY',
    color: '#fbbf24',
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.3)',
    Icon: ShieldAlert,
  },
  UNVERIFIED: {
    key: 'UNVERIFIED',
    color: '#94a3b8',
    bg: 'rgba(148, 163, 184, 0.12)',
    border: 'rgba(148, 163, 184, 0.3)',
    Icon: Shield,
  },
};

export default function CredibilityBadge({ label, score }) {
  const { t } = useTranslation();
  const cred = label ? label.toUpperCase() : 'UNVERIFIED';
  const cfg = CREDIBILITY_CONFIG[cred] || CREDIBILITY_CONFIG.UNVERIFIED;
  const { Icon } = cfg;

  const translatedLabel = t(`badges.credibility.${cfg.key}`, { defaultValue: cfg.key });

  // Only display percentage confidence if score > 0
  const percentage = typeof score === 'number' && score > 0
    ? `${Math.round(score * 100)}%`
    : null;

  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-medium px-2 py-0.5 rounded-md shrink-0"
      style={{
        backgroundColor: cfg.bg,
        border: `1px solid ${cfg.border}`,
        color: cfg.color,
      }}
      title={`${translatedLabel}${percentage ? ` (${percentage} ${t('badges.credibility.confidence')})` : ''}`}
    >
      <Icon size={12} className="shrink-0" />
      <span>{translatedLabel}</span>
      {percentage && (
        <span className="opacity-75 text-[10px] font-mono ml-0.5">({percentage})</span>
      )}
    </span>
  );
}
