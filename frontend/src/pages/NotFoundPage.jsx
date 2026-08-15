import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <AlertTriangle size={36} style={{ color: 'var(--color-text-muted)' }} />
      <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        404 — Page Not Found
      </h1>
      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        The page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        className="mt-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150"
        style={{
          background: 'var(--color-surface-3)',
          color: 'var(--color-text-primary)',
          border: '1px solid var(--color-border)',
        }}
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
