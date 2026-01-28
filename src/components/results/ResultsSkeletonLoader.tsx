'use client';

export default function ResultsSkeletonLoader() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="h-8 w-48 rounded-lg bg-slate-200"></div>

      {/* Filters Skeleton */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <div className="mb-4 h-4 w-20 rounded bg-slate-200"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 w-24 rounded bg-slate-200"></div>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-4 h-4 w-20 rounded bg-slate-200"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 w-32 rounded bg-slate-200"></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-slate-200 bg-white">
        {/* Header */}
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="grid grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-4 rounded bg-slate-300"></div>
            ))}
          </div>
        </div>
        {/* Rows */}
        {[1, 2, 3, 4].map((row) => (
          <div key={row} className="border-b border-slate-200 px-6 py-4">
            <div className="grid grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((col) => (
                <div key={col} className="h-4 rounded bg-slate-200"></div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Card Skeleton */}
      <div className="md:hidden space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="mb-4 h-6 w-32 rounded bg-slate-200"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-4 w-full rounded bg-slate-200"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
