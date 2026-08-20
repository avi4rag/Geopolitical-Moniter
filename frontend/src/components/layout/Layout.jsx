import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';

// ─── Root Layout ──────────────────────────────────────────────────────────────
// Replicates the sleek, modern dashboard card shell from the reference design.
// Outer canvas has subtle lavender-blue ambient gradients; inner canvas is a
// pristine, rounded modern editorial card.
// ─────────────────────────────────────────────────────────────────────────────

export default function Layout() {
  return (
    <div className="min-h-screen reference-canvas-bg p-2 sm:p-4 md:p-6 lg:p-8 flex flex-col justify-start">
      {/* Sleek Rounded Main Shell Card */}
      <div className="w-full max-w-[1440px] mx-auto bg-white rounded-[24px] sm:rounded-[32px] border border-slate-200/80 shadow-[0_20px_50px_rgba(15,23,42,0.06)] overflow-hidden flex flex-col min-h-[92vh]">
        {/* Navigation Bar */}
        <Navbar />

        {/* Dynamic Page Content */}
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
