'use client';

import { useCallback, useState } from 'react';
import CarrierCheckboxGroup from './RatesFilters/CarrierCheckboxGroup';
import ServiceSpeedFilter, { type ServiceSpeed } from './RatesFilters/ServiceSpeedFilter';

type SortOption = 'cost' | 'date' | 'value';

interface RatesFiltersProps {
  selectedCarriers: string[];
  onCarrierToggle: (carrier: string) => void;
  sortBy: SortOption;
  onSortChange: (option: SortOption) => void;
}

const AVAILABLE_CARRIERS = ['FedEx'] as const;

export default function RatesFilters({
  selectedCarriers,
  onCarrierToggle,
  sortBy,
  onSortChange,
}: RatesFiltersProps) {
  const [selectedSpeeds, setSelectedSpeeds] = useState<ServiceSpeed[]>([]);

  // Memoize the speed toggle callback to prevent child re-renders
  const handleSpeedToggle = useCallback((speed: ServiceSpeed) => {
    setSelectedSpeeds((prev) =>
      prev.includes(speed) ? prev.filter((s) => s !== speed) : [...prev, speed]
    );
  }, []);

  // Memoize the sort change callback wrapper
  const handleSortChange = useCallback(
    (value: string) => {
      onSortChange(value as SortOption);
    },
    [onSortChange]
  );

  return (
    <div className="rounded-lg bg-slate-50 p-6 border border-slate-200">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Carrier Filters */}
        <div>
          <CarrierCheckboxGroup
            selectedCarriers={selectedCarriers}
            onCarrierToggle={onCarrierToggle}
            availableCarriers={AVAILABLE_CARRIERS as unknown as string[]}
          />
        </div>

        {/* Sort By Dropdown */}
        <div>
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Sort By</h3>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
          >
            <option value="cost">Lowest Price</option>
            <option value="date">Earliest Delivery</option>
            <option value="value">Best Value</option>
          </select>
        </div>

        {/* Delivery Speed Filter */}
        <div>
          <ServiceSpeedFilter selectedSpeeds={selectedSpeeds} onSpeedToggle={handleSpeedToggle} />
        </div>
      </div>

      {/* Active Filters Summary */}
      {selectedSpeeds.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-200">
          <div className="flex flex-wrap gap-2">
            {selectedSpeeds.map((speed) => (
              <span
                key={speed}
                className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700"
              >
                {speed}
                <button
                  onClick={() => handleSpeedToggle(speed)}
                  className="ml-1 hover:text-blue-900"
                  aria-label={`Remove ${speed} filter`}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
