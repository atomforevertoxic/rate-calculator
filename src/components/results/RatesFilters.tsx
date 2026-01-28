'use client';

type SortOption = 'cost' | 'speed' | 'carrier';

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
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Carrier Filters */}
        <div>
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Carriers</h3>
          <div className="space-y-3">
            {AVAILABLE_CARRIERS.map((carrier) => (
              <label key={carrier} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCarriers.includes(carrier)}
                  onChange={() => onCarrierToggle(carrier)}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                />
                <span className="text-sm text-slate-700">{carrier}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div>
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Sort By</h3>
          <div className="space-y-3">
            {[
              { value: 'cost' as const, label: 'Price (Low to High)' },
              { value: 'speed' as const, label: 'Delivery Speed' },
              { value: 'carrier' as const, label: 'Carrier Name' },
            ].map((option) => (
              <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="sort"
                  value={option.value}
                  checked={sortBy === option.value}
                  onChange={() => onSortChange(option.value)}
                  className="h-4 w-4 border-slate-300 text-slate-900 focus:ring-slate-500"
                />
                <span className="text-sm text-slate-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
