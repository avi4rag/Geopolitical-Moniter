import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// ─── Event Detail Page ────────────────────────────────────────────────────────
// Full implementation in Phase 13.
// ─────────────────────────────────────────────────────────────────────────────

export default function EventDetailPage() {
  const { id } = useParams();

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/"
        className="flex items-center gap-2 text-sm w-fit transition-colors duration-150 hover:opacity-80"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        <ArrowLeft size={14} />
        Back to Dashboard
      </Link>

      <div
        className="flex flex-col items-center justify-center py-24 rounded-xl border"
        style={{
          background: 'var(--color-surface-1)',
          borderColor: 'var(--color-border)',
        }}
      >
        <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          Event Detail — Coming in Phase 13
        </p>
        <p className="mt-1 text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>
          ID: {id}
        </p>
      </div>
    </div>
  );
}
