import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';

// ─── Editorial Credibility Badge ──────────────────────────────────────────────
// Displays application-calculated credibility ratings for an event.
// ─────────────────────────────────────────────────────────────────────────────

const CREDIBILITY_CONFIG = {
  CONFIRMED: {
    key: 'CONFIRMED',
    className: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    Icon: ShieldCheck,
  },
  LIKELY: {
    key: 'LIKELY',
    className: 'bg-amber-50 border-amber-200 text-amber-800',
    Icon: ShieldAlert,
  },
  UNVERIFIED: {
    key: 'UNVERIFIED',
    className: 'bg-slate-100 border-slate-200 text-slate-700',
    Icon: Shield,
  },
};

export default function CredibilityBadge({ label, score }) {
  const { t } = useTranslation();
  const cred = label ? label.toUpperCase() : 'UNVERIFIED';
  const cfg = CREDIBILITY_CONFIG[cred] || CREDIBILITY_CONFIG.UNVERIFIED;
  const { Icon } = cfg;

  const translatedLabel = t(`badges.credibility.${cfg.key}`, { defaultValue: cfg.key });

  const percentage = typeof score === 'number' && score > 0
    ? `${Math.round(score * 100)}%`
    : null;

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${cfg.className}`}
      title={`${translatedLabel}${percentage ? ` (${percentage} ${t('badges.credibility.confidence', { defaultValue: 'confidence' })})` : ''}`}
    >
      <Icon size={12} className="shrink-0" />
      <span>{translatedLabel}</span>
      {percentage && (
        <span className="opacity-80 font-mono text-[10px] ml-0.5">({percentage})</span>
      )}
    </span>
  );
}
