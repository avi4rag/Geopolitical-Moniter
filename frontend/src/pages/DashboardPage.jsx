import { Activity } from 'lucide-react';

// ─── Dashboard Page ───────────────────────────────────────────────────────────
// Main page — will be fully implemented in Phase 13.
// Shows a placeholder for now so the frontend loads correctly.
// ─────────────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">

      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1
            className="text-2xl font-semibold tracking-tight"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Geopolitical Intelligence Dashboard
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Monitoring global events and assessing cross-domain impacts in real time.
          </p>
        </div>
      </div>

      {/* Placeholder — replaced in Phase 13 */}
      <div
        className="flex flex-col items-center justify-center py-24 rounded-xl border"
        style={{
          background: 'var(--color-surface-1)',
          borderColor: 'var(--color-border)',
        }}
      >
        <Activity size={40} style={{ color: 'var(--color-text-muted)' }} />
        <p className="mt-4 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          Phase 1 Foundation — Backend & Frontend Initialized
        </p>
        <p className="mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Event data and impact assessments will appear here after Phase 13.
        </p>
      </div>

    </div>
  );
}
