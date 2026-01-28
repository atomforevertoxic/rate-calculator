'use client';

import type { CarrierName, ShippingRate } from '@/src/types/domain';
import { useCallback, useMemo, useState } from 'react';
import BestValueBadge from './BestValueBadge';
import { CarrierLogo, FeeBreakdown, FeaturesList, SortIcon } from './helpers';

type SortField = 'carrier' | 'service' | 'price' | 'speed' | 'delivery';
type SortDirection = 'asc' | 'desc';

interface RatesComparisonTableProps {
  rates: ShippingRate[];
  selectedCarriers?: CarrierName[];
}

export default function RatesComparisonTable({
  rates,
  selectedCarriers = ['FedEx'],
}: RatesComparisonTableProps) {
  const [sortField, setSortField] = useState<SortField>('price');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  /**
   * Handle sort column click
   * Toggles direction if same field, otherwise sets new field with 'asc'
   */
  const handleSort = useCallback((field: SortField) => {
    setSortField((prevField) => {
      if (prevField === field) {
        // Toggle direction if clicking same column
        setSortDirection((prevDir) => (prevDir === 'asc' ? 'desc' : 'asc'));
        return field;
      } else {
        // Set new field with ascending order
        setSortDirection('asc');
        return field;
      }
    });
  }, []);

  /**
   * Calculate best values for highlighting
   */
  const bestValues = useMemo(() => {
    if (rates.length === 0) {
      return { cheapestCost: 0, fastestRate: null };
    }

    const cheapestCost = Math.min(...rates.map((r) => r.totalCost));
    const fastestRate = rates.reduce((fastest, current) => {
      const speedOrder = { overnight: 0, 'two-day': 1, standard: 2, economy: 3 };
      const fastestSpeed = speedOrder[fastest.speed as keyof typeof speedOrder] ?? 4;
      const currentSpeed = speedOrder[current.speed as keyof typeof speedOrder] ?? 4;
      return currentSpeed < fastestSpeed ? current : fastest;
    });

    return { cheapestCost, fastestRate };
  }, [rates]);

  /**
   * Filter and sort rates based on current state
   */
  const displayedRates = useMemo(() => {
    // Filter by selected carriers if any are selected
    let filtered = rates.filter((rate) =>
      selectedCarriers.length > 0 ? selectedCarriers.includes(rate.carrier) : true
    );

    // Create a copy before sorting to avoid mutating props
    const sorted = [...filtered];

    sorted.sort((a, b) => {
      let compareValue = 0;

      switch (sortField) {
        case 'carrier':
          compareValue = a.carrier.localeCompare(b.carrier);
          break;
        case 'service':
          compareValue = a.serviceName.localeCompare(b.serviceName);
          break;
        case 'price':
          compareValue = a.totalCost - b.totalCost;
          break;
        case 'speed': {
          const speedOrder = { overnight: 0, 'two-day': 1, standard: 2, economy: 3 };
          const aSpeed = speedOrder[a.speed as keyof typeof speedOrder] ?? 4;
          const bSpeed = speedOrder[b.speed as keyof typeof speedOrder] ?? 4;
          compareValue = aSpeed - bSpeed;
          break;
        }
        case 'delivery':
          compareValue = a.estimatedDeliveryDate.getTime() - b.estimatedDeliveryDate.getTime();
          break;
      }

      return sortDirection === 'asc' ? compareValue : -compareValue;
    });

    return sorted;
  }, [rates, selectedCarriers, sortField, sortDirection]);

  const getSortDirection = (field: SortField): 'asc' | 'desc' | 'none' => {
    if (sortField !== field) return 'none';
    return sortDirection;
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {/* Carrier Column */}
            <th className="px-6 py-3 text-left">
              <button
                onClick={() => handleSort('carrier')}
                className="flex items-center gap-2 font-semibold text-slate-900 hover:text-slate-700 transition-colors"
              >
                Carrier
                <SortIcon direction={getSortDirection('carrier')} />
              </button>
            </th>

            {/* Service Column */}
            <th className="px-6 py-3 text-left">
              <button
                onClick={() => handleSort('service')}
                className="flex items-center gap-2 font-semibold text-slate-900 hover:text-slate-700 transition-colors"
              >
                Service
                <SortIcon direction={getSortDirection('service')} />
              </button>
            </th>

            {/* Speed Column */}
            <th className="px-6 py-3 text-left">
              <button
                onClick={() => handleSort('speed')}
                className="flex items-center gap-2 font-semibold text-slate-900 hover:text-slate-700 transition-colors"
              >
                Speed
                <SortIcon direction={getSortDirection('speed')} />
              </button>
            </th>

            {/* Delivery Date Column */}
            <th className="px-6 py-3 text-left">
              <button
                onClick={() => handleSort('delivery')}
                className="flex items-center gap-2 font-semibold text-slate-900 hover:text-slate-700 transition-colors"
              >
                Delivery
                <SortIcon direction={getSortDirection('delivery')} />
              </button>
            </th>

            {/* Price Column */}
            <th className="px-6 py-3 text-right">
              <button
                onClick={() => handleSort('price')}
                className="ml-auto flex items-center gap-2 font-semibold text-slate-900 hover:text-slate-700 transition-colors"
              >
                Price
                <SortIcon direction={getSortDirection('price')} />
              </button>
            </th>

            {/* Features Column */}
            <th className="px-6 py-3 text-left font-semibold text-slate-900">Features</th>

            {/* Value Column */}
            <th className="px-6 py-3 text-center font-semibold text-slate-900">Value</th>
          </tr>
        </thead>

        <tbody>
          {displayedRates.map((rate, index) => (
            <tr
              key={rate.id}
              className={`border-b border-slate-200 transition-colors hover:bg-blue-50 ${
                index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
              }`}
            >
              {/* Carrier */}
              <td className="px-6 py-4">
                <CarrierLogo carrier={rate.carrier} />
              </td>

              {/* Service Name */}
              <td className="px-6 py-4 text-sm">
                <div className="font-medium text-slate-900">{rate.serviceName}</div>
                <div className="text-xs text-slate-500">{rate.serviceCode}</div>
              </td>

              {/* Speed */}
              <td className="px-6 py-4 text-sm">
                <div className="capitalize font-medium text-slate-900">{rate.speed}</div>
              </td>

              {/* Delivery Date */}
              <td className="px-6 py-4 text-sm">
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-blue-700 font-medium">
                  📅 {rate.estimatedDeliveryDate.toLocaleDateString()}
                </span>
              </td>

              {/* Cost with Fee Breakdown */}
              <td className="px-6 py-4 text-right">
                <FeeBreakdown baseRate={rate.baseRate} additionalFees={rate.additionalFees} />
              </td>

              {/* Features */}
              <td className="px-6 py-4">
                <FeaturesList
                  features={rate.features}
                  guaranteedDelivery={rate.guaranteedDelivery}
                  maxDisplay={2}
                />
              </td>

              {/* Value Badge */}
              <td className="px-6 py-4 text-center">
                <BestValueBadge
                  isCheapest={rate.totalCost === bestValues.cheapestCost}
                  isFastest={bestValues.fastestRate?.id === rate.id}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {displayedRates.length === 0 && (
        <div className="px-6 py-12 text-center text-slate-500">
          <p className="text-lg">No rates available for the selected filters</p>
          <p className="text-sm text-slate-400">Try adjusting your carrier selection</p>
        </div>
      )}
    </div>
  );
}
