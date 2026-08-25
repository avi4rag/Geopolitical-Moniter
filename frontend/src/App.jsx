import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Layout from './components/layout/Layout.jsx';
import Home from './pages/Home.jsx';
import SearchPage from './pages/SearchPage.jsx';
import EventDetailPage from './pages/EventDetailPage.jsx';
import ImpactsPage from './pages/ImpactsPage.jsx';
import SourcesPage from './pages/SourcesPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

// ─── App Router ───────────────────────────────────────────────────────────────
// Main news platform routes wrapped in AuthProvider and shared Layout.
// Event detail: /event/:id and /events/:id both render the full-screen dossier.
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/event/:id" element={<EventDetailPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/impacts" element={<ImpactsPage />} />
          <Route path="/sources" element={<SourcesPage />} />
          <Route path="/stats" element={<DashboardPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
