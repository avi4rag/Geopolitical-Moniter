import React from 'react';

function SkeletonBar({ className = '', style = {} }) {
  return (
    <div
      className={`rounded animate-pulse ${className}`}
      style={{ backgroundColor: 'var(--color-surface-4)', ...style }}
    />
  );
}

// ─── Dark Feed Skeleton ────────────────────────────────────────────────────────
// Loading placeholders styled for the dark Situation Room theme.
// ─────────────────────────────────────────────────────────────────────────────

export default function FeedSkeleton({ count = 6 }) {
  return (
    <div className="space-y-10">
      {/* Featured hero skeleton */}
      <div
        className="w-full rounded-lg overflow-hidden border"
        style={{ backgroundColor: 'var(--color-surface-1)', borderColor: 'var(--color-border)', minHeight: '380px' }}
      >
        <div className="h-full min-h-[380px] animate-pulse" style={{ backgroundColor: 'var(--color-surface-2)' }}>
          <div className="p-8 flex flex-col justify-end h-full min-h-[380px] space-y-3">
            <SkeletonBar style={{ height: '10px', width: '80px' }} />
            <SkeletonBar style={{ height: '32px', width: '70%' }} />
            <SkeletonBar style={{ height: '32px', width: '50%' }} />
            <SkeletonBar style={{ height: '16px', width: '120px' }} />
          </div>
        </div>
      </div>

      {/* Sub-rail skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-lg p-4 space-y-3 border"
            style={{ backgroundColor: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}
          >
            <SkeletonBar style={{ height: '9px', width: '60px' }} />
            <SkeletonBar style={{ height: '14px', width: '90%' }} />
            <SkeletonBar style={{ height: '14px', width: '65%' }} />
          </div>
        ))}
      </div>

      {/* Feed section header */}
      <div className="space-y-2 pt-4">
        <SkeletonBar style={{ height: '28px', width: '240px' }} />
        <SkeletonBar style={{ height: '10px', width: '180px' }} />
      </div>

      {/* Cards grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg p-5 space-y-4 border"
            style={{ backgroundColor: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center justify-between">
              <SkeletonBar style={{ height: '10px', width: '60px' }} />
              <SkeletonBar style={{ height: '10px', width: '50px' }} />
            </div>
            <SkeletonBar style={{ height: '16px', width: '95%' }} />
            <SkeletonBar style={{ height: '16px', width: '75%' }} />
            <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <SkeletonBar style={{ height: '10px', width: '60px' }} />
              <SkeletonBar style={{ height: '10px', width: '80px' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
