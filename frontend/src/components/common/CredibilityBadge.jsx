import React from 'react';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';

// ─── Credibility Badge ────────────────────────────────────────────────────────
// Displays application-calculated credibility ratings for an event.
// ─────────────────────────────────────────────────────────────────────────────

const CREDIBILITY_CONFIG = {
  CONFIRMED: {
    label: 'Confirmed',
    color: '#4ade80',
    bg: 'rgba(34, 197, 94, 0.12)',
    border: 'rgba(34, 197, 94, 0.3)',
    Icon: ShieldCheck,
  },
  LIKELY: {
    label: 'Likely',
    color: '#fbbf24',
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.3)',
    Icon: ShieldAlert,
  },
  UNVERIFIED: {
    label: 'Unverified',
    color: '#94a3b8',
    bg: 'rgba(148, 163, 184, 0.12)',
    border: 'rgba(148, 163, 184, 0.3)',
    Icon: Shield,
  },
};

export default function CredibilityBadge({ label, score }) {
  const cred = label ? label.toUpperCase() : 'UNVERIFIED';
  const cfg = CREDIBILITY_CONFIG[cred] || CREDIBILITY_CONFIG.UNVERIFIED;
  const { Icon } = cfg;

  const percentage = score !== undefined && score !== null
    ? `${Math.round(score * 100)}%`
    : null;

  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md"
      style={{
        backgroundColor: cfg.bg,
        border: `1px solid ${cfg.border}`,
        color: cfg.color,
      }}
      title={`Credibility: ${cfg.label}${percentage ? ` (${percentage} confidence)` : ''}`}
    >
      <Icon size={12} className="shrink-0" />
      <span>{cfg.label}</span>
      {percentage && (
        <span className="opacity-75 text-[11px] font-mono ml-0.5">({percentage})</span>
      )}
    </span>
  );
}
