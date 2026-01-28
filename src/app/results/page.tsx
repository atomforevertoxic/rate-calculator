'use client';

import { getCarrierAdapter } from '@/src/adapters/carrier-adapters';
import RatesDisplay from '@/src/components/results/RatesDisplay';
import ResultsSkeletonLoader from '@/src/components/results/ResultsSkeletonLoader';
import { loadFormState } from '@/src/lib/form-storage';
import type { RateResponse } from '@/src/types/domain';
import { Suspense } from 'react';

export default function ResultsPage() {
  // Create the rates promise at the page level
  // This promise is passed to RatesDisplay inside the Suspense boundary
  // The promise starts fetching immediately when the page renders
  const ratesPromise = createRatesPromise();

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
 * Helper function to create a rates promise by fetching from real carrier APIs
 * Loads form data from localStorage and requests rates from available carriers
 */
function createRatesPromise(): Promise<RateResponse> {
  return (async () => {
    console.log('📡 [Results Page] Starting real rate fetch...');

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

    const rateResponse: RateResponse = {
      requestId: `result-${Date.now()}`,
      rates: [],
      errors: [],
      timestamp: new Date(),
    };

    // Fetch rates from FedEx
    try {
      console.log('🔑 [FedEx] Getting adapter instance...');
      const fedexAdapter = getCarrierAdapter('FedEx');

      console.log('📨 [FedEx] Requesting rates with the following data:');
      console.log('   Package:', formState.package);
      console.log('   Origin:', formState.origin);
      console.log('   Destination:', formState.destination);
      console.log('   Options:', formState.options);

      const fedexRates = await fedexAdapter.fetchRates({
        package: formState.package,
        origin: formState.origin,
        destination: formState.destination,
        options: formState.options,
      });

      console.log(`✅ [FedEx] Successfully fetched ${fedexRates.length} rates`);
      console.log(
        '💰 [FedEx] Rates details:',
        fedexRates.map((r) => ({
          id: r.id,
          carrier: r.carrier,
          serviceName: r.serviceName,
          speed: r.speed,
          totalCost: r.totalCost,
          estimatedDeliveryDate: r.estimatedDeliveryDate,
        }))
      );

      rateResponse.rates = fedexRates;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ [FedEx] Error fetching rates:', errorMessage);
      rateResponse.errors.push({
        carrier: 'FedEx',
        message: errorMessage,
        recoverable: true,
      });
    }

    console.log('📊 [Results Page] Final response:', {
      rateCount: rateResponse.rates.length,
      errorCount: rateResponse.errors.length,
      timestamp: rateResponse.timestamp,
    });

    return rateResponse;
  })();
}
