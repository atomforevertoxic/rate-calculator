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
    </div>
  );
}
