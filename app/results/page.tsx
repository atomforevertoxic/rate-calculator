'use client';

import RatesDisplay from '@/src/components/results/RatesDisplay';
import ResultsSkeletonLoader from '@/src/components/results/ResultsSkeletonLoader';
import { loadFormState } from '@/src/lib/form-storage';
import { loadResults, saveResults } from '@/src/lib/results-storage';
import type { RateResponse } from '@/src/types/domain';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';

export default function ResultsPage() {
  const router = useRouter();

  // Create the rates promise at the page level
  // This promise is passed to RatesDisplay inside the Suspense boundary
  // The promise starts fetching immediately when the page renders
  const ratesPromise = createRatesPromise();

  const handleBackToCalculator = () => {
    router.push('/');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with Back Button */}
        <header className="mb-10">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handleBackToCalculator}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-white rounded-lg transition-colors duration-200 border border-gray-200 hover:border-gray-300"
              aria-label="Back to calculator"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Calculator
            </button>
          </div>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Shipping Rate Comparison</h1>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Compare shipping rates across multiple carriers. Get the best price for your package
              delivery needs.
            </p>
          </div>
        </header>

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
 * Helper function to create a rates promise by calling our server-side API
 * Implements results caching with 30-minute TTL to improve UX and reduce API calls
 * Load cached results first, only fetch from API if cache is invalid or expired
 */
function createRatesPromise(): Promise<RateResponse> {
  return (async () => {
    console.log('📡 [Results Page] Starting rate fetch with caching...');

    // Check if we're in the browser (client-side)
    if (typeof window === 'undefined') {
      console.log('⚠️ [Results Page] Running on server-side, cannot access localStorage yet');
      throw new Error('Loading...');
    }

    // Load form state from localStorage
    const formState = loadFormState();

    if (!formState) {
      console.error('❌ [Results Page] No form data found in localStorage');
      throw new Error('No shipping information found. Please go back and complete the form.');
    }

    console.log('📋 [Results Page] Form data loaded from localStorage:', {
      package: formState.package,
      origin: formState.origin,
      destination: formState.destination,
      options: formState.options,
    });

    // Try to load cached results first
    const cachedData = loadResults();
    if (cachedData) {
      console.log('⚡ [Results Page] Using cached rate results');
      return cachedData.response;
    }

    // Cache miss or expired - fetch from API
    // This avoids CORS issues that occur when calling external APIs from the browser
    try {
      console.log('🌐 [Results Page] Cache miss - calling /api/rates endpoint...');

      const response = await fetch('/api/rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          package: formState.package,
          origin: formState.origin,
          destination: formState.destination,
          options: formState.options,
        }),
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      const rateResponse = (await response.json()) as RateResponse;

      // Convert ISO date strings back to Date objects
      if (rateResponse.rates) {
        rateResponse.rates = rateResponse.rates.map((rate: any) => ({
          ...rate,
          estimatedDeliveryDate:
            typeof rate.estimatedDeliveryDate === 'string'
              ? new Date(rate.estimatedDeliveryDate)
              : rate.estimatedDeliveryDate,
        }));
      }

      if (typeof rateResponse.timestamp === 'string') {
        rateResponse.timestamp = new Date(rateResponse.timestamp);
      }

      console.log('✅ [Results Page] Received response from /api/rates');
      console.log('📊 [Results Page] Final response:', {
        rateCount: rateResponse.rates.length,
        errorCount: rateResponse.errors.length,
        timestamp: rateResponse.timestamp,
      });

      // Save successful results to cache
      const rateRequest = {
        package: formState.package,
        origin: formState.origin,
        destination: formState.destination,
        options: formState.options,
      };
      saveResults(rateRequest, rateResponse);

      return rateResponse;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : '';

      console.error('❌ [Results Page] Error calling /api/rates:', errorMessage);
      console.error('❌ [Results Page] Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: errorMessage,
        stack: errorStack,
      });

      return {
        requestId: `result-error-${Date.now()}`,
        rates: [],
        errors: [
          {
            carrier: 'FedEx',
            message: errorMessage,
            recoverable: true,
          },
        ],
        timestamp: new Date(),
      };
    }
  })();
}
