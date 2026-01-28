'use client';

import RatesDisplay from '@/src/components/results/RatesDisplay';
import ResultsSkeletonLoader from '@/src/components/results/ResultsSkeletonLoader';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

export default function ResultsPage() {
  const searchParams = useSearchParams();

  // Create the rates promise at the page level
  // This promise is passed to RatesDisplay inside the Suspense boundary
  // The promise starts fetching immediately when the page renders
  const ratesPromise = createRatesPromise(searchParams);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Shipping Rate Comparison
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            Compare shipping rates from available carriers
          </p>
        </div>

        {/* Suspense Boundary for Async Rate Fetching */}
        {/* Suspense shows the fallback while the promise is pending */}
        {/* When the promise resolves, RatesDisplay renders with the data */}
        {/* If the promise rejects, the nearest Error Boundary catches it */}
        <Suspense fallback={<ResultsSkeletonLoader />}>
          <RatesDisplay ratesPromise={ratesPromise} />
        </Suspense>
      </div>
    </main>
  );
}

/**
 * Helper function to create a rates promise based on search parameters
 * In a real app, this would parse the searchParams and construct a RateRequest
 * For now, it returns a mock promise
 */
function createRatesPromise(_searchParams: URLSearchParams) {
  // TODO: Parse _searchParams to extract package, addresses, and shipping options
  // Then construct a proper RateRequest and call fetchRates()

  // For now, return a promise that resolves with mock data
  return Promise.resolve({
    requestId: 'mock-request-' + Date.now(),
    rates: [],
    errors: [],
    timestamp: new Date(),
  });
}
