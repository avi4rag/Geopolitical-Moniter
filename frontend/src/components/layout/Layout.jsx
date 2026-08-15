import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';

// ─── Root Layout ──────────────────────────────────────────────────────────────
// Wraps all pages with the persistent navigation bar.
// Content scrolls independently while the navbar stays fixed.
// ─────────────────────────────────────────────────────────────────────────────

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-surface-0)' }}>
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
