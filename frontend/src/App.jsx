import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import EventDetailPage from './pages/EventDetailPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

// ─── App Router ───────────────────────────────────────────────────────────────
// All pages are wrapped in the shared Layout.
// New pages (sources, stats) will be added here in later phases.
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
