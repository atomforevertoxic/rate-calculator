'use client';

import type { ShippingRate } from '@/src/types/domain';
import BestValueBadge from './BestValueBadge';

interface RatesComparisonTableProps {
  rates: ShippingRate[];
}

export default function RatesComparisonTable({ rates }: RatesComparisonTableProps) {
  const getCheapestRate = (rates: ShippingRate[]) =>
    rates.length > 0 ? Math.min(...rates.map((r) => r.totalCost)) : 0;

  const getFastestRate = (rates: ShippingRate[]) => {
    if (rates.length === 0) return null;
    const speedOrder = { overnight: 0, 'two-day': 1, standard: 2, economy: 3 };
    return rates.reduce((fastest, current) => {
      const fastestSpeed = speedOrder[fastest.speed as keyof typeof speedOrder] ?? 4;
      const currentSpeed = speedOrder[current.speed as keyof typeof speedOrder] ?? 4;
      return currentSpeed < fastestSpeed ? current : fastest;
    });
  };

  const cheapestCost = getCheapestRate(rates);
  const fastestRate = getFastestRate(rates);

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Carrier</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Service</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
              Delivery Time
            </th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">Cost</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Features</th>
            <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900">Value</th>
          </tr>
        </thead>
        <tbody>
          {rates.map((rate, index) => (
            <tr
              key={rate.id}
              className={`border-b border-slate-200 transition-colors hover:bg-slate-50 ${
                index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
              }`}
            >
              {/* Carrier */}
              <td className="px-6 py-4 text-sm font-medium text-slate-900">{rate.carrier}</td>

              {/* Service Name */}
              <td className="px-6 py-4 text-sm text-slate-700">{rate.serviceName}</td>

              {/* Delivery Time */}
              <td className="px-6 py-4 text-sm text-slate-700">
                <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                  📅 {rate.estimatedDeliveryDate.toLocaleDateString()}
                </span>
              </td>

              {/* Cost */}
              <td className="px-6 py-4 text-right">
                <div className="text-lg font-bold text-slate-900">${rate.totalCost.toFixed(2)}</div>
                {rate.additionalFees.length > 0 && (
                  <div className="text-xs text-slate-500">
                    + {rate.additionalFees.length} fee{rate.additionalFees.length > 1 ? 's' : ''}
                  </div>
                )}
              </td>

              {/* Features */}
              <td className="px-6 py-4 text-sm text-slate-700">
                <div className="flex flex-wrap gap-1">
                  {rate.guaranteedDelivery && (
                    <span className="inline-block rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                      Guaranteed
                    </span>
                  )}
                  {rate.features.length > 0 && (
                    <span className="inline-block text-xs text-slate-600">
                      +{rate.features.length} features
                    </span>
                  )}
                </div>
              </td>

              {/* Value Badge */}
              <td className="px-6 py-4 text-center">
                <BestValueBadge
                  isCheapest={rate.totalCost === cheapestCost}
                  isFastest={fastestRate?.id === rate.id}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
