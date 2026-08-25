import React from 'react';

const CONFIG = {
  CONFIRMED: { bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.25)', color: '#10b981' },
  HIGH:      { bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.25)', color: '#10b981' },
  MEDIUM:    { bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.25)', color: '#f59e0b' },
  LOW:       { bg: 'rgba(225,29,72,0.10)',  border: 'rgba(225,29,72,0.25)',  color: '#e11d48' },
  UNVERIFIED:{ bg: 'rgba(144,144,151,0.10)', border: 'rgba(144,144,151,0.20)', color: '#909097' },
};

export default function CredibilityBadge({ label, score }) {
  const key = label || 'UNVERIFIED';
  const c = CONFIG[key] || CONFIG.UNVERIFIED;

  return (
    <span
      className="text-[10px] px-2 py-0.5 rounded font-mono-code font-bold uppercase border inline-block"
      style={{ backgroundColor: c.bg, border: `1px solid ${c.border}`, color: c.color }}
    >
      {key === 'UNVERIFIED'
        ? 'UNVERIFIED'
        : `${key}${typeof score === 'number' ? ` · ${Math.round(score * 100)}%` : ''}`}
    </span>
  );
}
