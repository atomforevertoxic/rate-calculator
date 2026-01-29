'use client';

import type { RateResponse, ShippingRate } from '@/src/types/domain';
import { use, useCallback, useMemo, useState } from 'react';
import NoRatesFound from './NoRatesFound';
import RateCard from './RateCard';
import RatesComparisonTable from './RatesComparisonTable';
import RatesErrorDisplay from './RatesErrorDisplay';
import RatesFilters from './RatesFilters';

type SortOption = 'cost' | 'date' | 'value';

/**
 * Helper function to safely format delivery dates
 */
function formatDeliveryDate(date: Date | string): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString();
  } catch {
    return typeof date === 'string' ? date : 'Unknown';
  }
}

interface RatesDisplayProps {
  ratesPromise: Promise<RateResponse>;
}

export default function RatesDisplay({ ratesPromise }: RatesDisplayProps) {
  // Use React 19's use() hook to unwrap the promise
  // This suspends the component if the promise is pending
  const rateResponse = use(ratesPromise);

  const [sortBy, setSortBy] = useState<SortOption>('cost');
  const [selectedCarriers, setSelectedCarriers] = useState<string[]>(['FedEx']);
  const [showMobileView, setShowMobileView] = useState(false);

  // Extract rates and errors from the resolved response
  const rates: ShippingRate[] = rateResponse.rates || [];
  const errors = rateResponse.errors || [];

  const filteredRates = useMemo(() => {
    let filtered = rates.filter((rate) => selectedCarriers.includes(rate.carrier));

    // Sort rates
    switch (sortBy) {
      case 'cost':
        filtered = [...filtered].sort((a, b) => a.totalCost - b.totalCost);
        break;
      case 'date':
        filtered = [...filtered].sort(
          (a, b) => a.estimatedDeliveryDate.getTime() - b.estimatedDeliveryDate.getTime()
        );
        break;
      case 'value':
        // Sort by best value: balance of speed and cost
        // Lower index = faster, multiply by base rate for value score
        filtered = [...filtered].sort((a, b) => {
          const speedOrder = { overnight: 4, 'two-day': 3, standard: 2, economy: 1 };
          const aSpeed = speedOrder[a.speed as keyof typeof speedOrder] ?? 0;
          const bSpeed = speedOrder[b.speed as keyof typeof speedOrder] ?? 0;
          const aValue = (aSpeed / a.baseRate) * 100; // Higher value is better
          const bValue = (bSpeed / b.baseRate) * 100;
          return bValue - aValue; // Sort descending
        });
        break;
    }

    return filtered;
  }, [rates, selectedCarriers, sortBy]);

  const handleCarrierToggle = useCallback((carrier: string) => {
    setSelectedCarriers((prev) =>
      prev.includes(carrier) ? prev.filter((c) => c !== carrier) : [...prev, carrier]
    );
  }, []);

  const handleSortChange = useCallback((option: SortOption) => {
    setSortBy(option);
  }, []);

  // Memoize mobile view toggle handlers
  const handleShowListView = useCallback(() => {
    setShowMobileView(false);
  }, []);

  const handleShowCardsView = useCallback(() => {
    setShowMobileView(true);
  }, []);

  // Show error display if there are carrier errors
  if (errors.length > 0 && filteredRates.length === 0) {
    return <RatesErrorDisplay errors={errors} />;
  }

  // Show empty state if no rates found
  if (filteredRates.length === 0) {
    return <NoRatesFound />;
  }

  return (
    <div className="space-y-6">
      {/* Errors Banner */}
      {errors.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">
            ⚠️ {errors.length} carrier{errors.length > 1 ? 's' : ''} could not be reached. Showing
            available rates below.
          </p>
        </div>
      )}

      {/* Filters */}
      <RatesFilters
        selectedCarriers={selectedCarriers}
        onCarrierToggle={handleCarrierToggle}
        sortBy={sortBy}
        onSortChange={handleSortChange}
      />

      {/* View Toggle - Mobile Only */}
      <div className="flex justify-end gap-2 md:hidden">
        <button
          onClick={handleShowListView}
          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            !showMobileView
              ? 'bg-blue-600 text-white'
              : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
          }`}
        >
          List
        </button>
        <button
          onClick={handleShowCardsView}
          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            showMobileView
              ? 'bg-blue-600 text-white'
              : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
          }`}
        >
          Cards
        </button>
      </div>

      {/* Desktop View - Always Show Table */}
      <div className="hidden md:block">
        <RatesComparisonTable rates={filteredRates} />
      </div>

      {/* Mobile View - List or Cards Based on Toggle */}
      <div className="block md:hidden">
        {!showMobileView ? (
          // List View - Compact rows for mobile
          <div className="space-y-2 border border-slate-200 rounded-lg overflow-hidden bg-white">
            {filteredRates.map((rate) => (
              <div
                key={rate.id}
                className="border-b last:border-b-0 border-slate-200 p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex justify-between items-start gap-3 mb-2">
                  <div className="flex-grow min-w-0">
                    <h3 className="font-semibold text-slate-900">{rate.carrier}</h3>
                    <p className="text-xs text-slate-600 line-clamp-1">{rate.serviceName}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-lg font-bold text-green-600">
                      ${rate.totalCost.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-600">
                  <span>📅 {formatDeliveryDate(rate.estimatedDeliveryDate)}</span>
                  <span className="capitalize">{rate.speed}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Card View - Detailed cards
          <div className="grid gap-4">
            {filteredRates.map((rate) => (
              <RateCard key={rate.id} rate={rate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
