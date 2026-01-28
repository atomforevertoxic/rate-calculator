'use client';

export default function NoRatesFound() {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center">
      <div className="mx-auto mb-4 text-5xl">📦</div>
      <h2 className="text-2xl font-bold text-slate-900">No Rates Found</h2>
      <p className="mt-2 text-slate-600">
        We couldn't find any shipping rates matching your criteria. Please try adjusting your
        filters or contact support for assistance.
      </p>
      <button className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors">
        ← Back to Calculator
      </button>
    </div>
  );
}
