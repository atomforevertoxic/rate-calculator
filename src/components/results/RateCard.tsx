'use client';

import type { ShippingRate } from '@/src/types/domain';
import BestValueBadge from './BestValueBadge';

interface RateCardProps {
  rate: ShippingRate;
}

export default function RateCard({ rate }: RateCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Header with Carrier and Cost */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{rate.carrier}</h3>
          <p className="text-sm text-slate-600">{rate.serviceName}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-slate-900">${rate.totalCost.toFixed(2)}</div>
          <BestValueBadge isCheapest={false} isFastest={false} />
        </div>
      </div>

      {/* Delivery Information */}
      <div className="mb-4 grid grid-cols-2 gap-4 py-4 border-y border-slate-200">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase">Delivery Date</p>
          <p className="text-sm font-semibold text-slate-900">
            {rate.estimatedDeliveryDate.toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase">Speed</p>
          <p className="text-sm font-semibold text-slate-900 capitalize">{rate.speed}</p>
        </div>
      </div>

      {/* Features */}
      <div className="mb-4">
        <p className="mb-2 text-xs font-medium text-slate-500 uppercase">Included Features</p>
        <div className="flex flex-wrap gap-2">
          {rate.guaranteedDelivery && (
            <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
              ✓ Guaranteed Delivery
            </span>
          )}
          {rate.features.slice(0, 2).map((feature, idx) => (
            <span
              key={idx}
              className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800"
            >
              ✓ {feature}
            </span>
          ))}
          {rate.features.length > 2 && (
            <span className="text-xs text-slate-600">+{rate.features.length - 2} more</span>
          )}
        </div>
      </div>

      {/* Additional Fees */}
      {rate.additionalFees.length > 0 && (
        <div className="mb-4 rounded-lg bg-slate-50 p-3">
          <p className="mb-2 text-xs font-medium text-slate-600">Additional Fees</p>
          <div className="space-y-1">
            {rate.additionalFees.map((fee, idx) => (
              <div key={idx} className="flex justify-between text-xs text-slate-700">
                <span>{fee.description}</span>
                <span className="font-medium">+${fee.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Select Button */}
      <button className="w-full rounded-lg bg-slate-900 py-2 px-4 text-center text-sm font-medium text-white transition-colors hover:bg-slate-800">
        Select This Rate
      </button>
    </div>
  );
}
