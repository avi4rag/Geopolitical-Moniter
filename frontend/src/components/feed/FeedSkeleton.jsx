import React from 'react';

// ─── Feed Skeleton ────────────────────────────────────────────────────────────
// Skeleton loading cards for continuous news feed scrolling.
// ─────────────────────────────────────────────────────────────────────────────

export default function FeedSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3 animate-pulse"
        >
          <div className="h-44 w-full bg-slate-100 rounded-xl" />

          <div className="w-24 h-4 bg-slate-100 rounded" />

          <div className="space-y-2">
            <div className="w-full h-4 bg-slate-100 rounded" />
            <div className="w-3/4 h-4 bg-slate-100 rounded" />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-between">
            <div className="w-20 h-3 bg-slate-100 rounded" />
            <div className="w-16 h-3 bg-slate-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
