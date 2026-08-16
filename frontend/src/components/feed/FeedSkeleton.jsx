import React from 'react';

// ─── Feed Skeleton ────────────────────────────────────────────────────────────
// Skeleton loading cards for continuous news feed scrolling.
// ─────────────────────────────────────────────────────────────────────────────

export default function FeedSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="p-5 rounded-2xl border space-y-4 animate-pulse"
          style={{
            backgroundColor: 'var(--color-surface-1)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="w-20 h-5 bg-slate-800 rounded-full" />
            <div className="w-24 h-4 bg-slate-800 rounded" />
          </div>

          <div className="space-y-2">
            <div className="w-full h-4 bg-slate-800 rounded" />
            <div className="w-5/6 h-4 bg-slate-800 rounded" />
            <div className="w-2/3 h-4 bg-slate-800 rounded" />
          </div>

          <div className="flex gap-2 pt-2">
            <div className="w-16 h-4 bg-slate-800 rounded-md" />
            <div className="w-16 h-4 bg-slate-800 rounded-md" />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-between">
            <div className="w-24 h-3 bg-slate-800 rounded" />
            <div className="w-16 h-3 bg-slate-800 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
