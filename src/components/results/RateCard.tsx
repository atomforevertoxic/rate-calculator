'use client';

import type { ShippingRate } from '@/src/types/domain';
import { useState } from 'react';
import BestValueBadge from './BestValueBadge';
import CarrierLogo from './helpers/CarrierLogo';
import FeaturesList from './helpers/FeaturesList';

/**
 * Helper function to safely format delivery dates
 * Handles both Date objects and ISO string dates
 */
function formatDeliveryDate(date: Date | string): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString();
  } catch {
    return typeof date === 'string' ? date : 'Unknown';
  }
}

/**
 * Calculate business days until delivery
 */
function calculateBusinessDays(deliveryDate: Date | string): number {
  const delivery = typeof deliveryDate === 'string' ? new Date(deliveryDate) : deliveryDate;
  const today = new Date();
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const daysDifference = Math.ceil((delivery.getTime() - today.getTime()) / millisecondsPerDay);
  return Math.max(1, daysDifference);
}

interface RateCardProps {
  rate: ShippingRate;
  isBestValue?: boolean;
}

/**
 * Mobile-friendly card component for displaying a single shipping rate
 * Features expandable fee breakdown, carrier logo, and one-tap selection
 */
export default function RateCard({ rate, isBestValue = false }: RateCardProps) {
  const [isFeesExpanded, setIsFeesExpanded] = useState(false);
  const businessDays = calculateBusinessDays(rate.estimatedDeliveryDate);
  const totalFees = rate.additionalFees.reduce((sum, fee) => sum + fee.amount, 0);

  return (
    <div
      className={`rounded-lg border bg-white shadow-sm transition-all duration-200 hover:shadow-md ${
        isBestValue
          ? 'border-blue-300 ring-2 ring-blue-100'
          : 'border-slate-200 hover:border-blue-200'
      }`}
    >
      {/* Header Section with Carrier Logo and Info */}
      <div className="border-b border-slate-200 p-4">
        <div className="flex items-start gap-4">
          {/* Carrier Logo - Large for mobile */}
          <div className="flex-shrink-0">
            <CarrierLogo carrier={rate.carrier as any} />
          </div>

          {/* Carrier Info */}
          <div className="flex-grow min-w-0">
            <div className="flex items-start gap-2">
              <div className="flex-grow">
                <h3 className="text-lg font-bold text-slate-900">{rate.carrier}</h3>
                <p className="text-sm text-slate-600 line-clamp-2">{rate.serviceName}</p>
              </div>
              {isBestValue && <BestValueBadge isCheapest={true} isFastest={false} />}
            </div>
          </div>
        </div>
      </div>

      {/* Cost and Delivery - Two Column Grid */}
      <div className="grid grid-cols-2 gap-4 border-b border-slate-200 p-4">
        {/* Total Cost */}
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase mb-1">Total Cost</p>
          <div className="text-2xl font-bold text-green-600">${rate.totalCost.toFixed(2)}</div>
          {totalFees > 0 && (
            <p className="text-xs text-slate-500 mt-1">
              Base: ${(rate.totalCost - totalFees).toFixed(2)}
            </p>
          )}
        </div>

        {/* Delivery Date */}
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase mb-1">Delivery</p>
          <div className="text-lg font-bold text-slate-900">
            {formatDeliveryDate(rate.estimatedDeliveryDate)}
          </div>
          <p className="text-xs text-slate-600 mt-1">{businessDays} business days</p>
        </div>
      </div>

      {/* Expandable Fee Breakdown */}
      {rate.additionalFees.length > 0 && (
        <div className="border-b border-slate-200 p-4">
          <button
            onClick={() => setIsFeesExpanded(!isFeesExpanded)}
            className="flex w-full items-center justify-between hover:text-blue-600 transition-colors"
          >
            <span className="text-sm font-medium text-slate-700">Fee Breakdown</span>
            <span className="text-lg text-slate-400">{isFeesExpanded ? '▼' : '▶'}</span>
          </button>

          {isFeesExpanded && (
            <div className="mt-3 space-y-2 pt-3 border-t border-slate-200">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Base Rate</span>
                <span className="font-medium">${(rate.totalCost - totalFees).toFixed(2)}</span>
              </div>
              {rate.additionalFees.map((fee, index) => (
                <div key={index} className="flex justify-between text-xs text-slate-600">
                  <span className="truncate pr-2">{fee.description}</span>
                  <span className="flex-shrink-0 font-medium">+${fee.amount.toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-bold text-slate-900">
                <span>Total</span>
                <span>${rate.totalCost.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Features List */}
      <div className="border-b border-slate-200 p-4">
        <p className="text-xs font-medium text-slate-500 uppercase mb-3">Included Features</p>
        <FeaturesList
          features={rate.features}
          guaranteedDelivery={rate.guaranteedDelivery}
          maxDisplay={3}
        />
      </div>

      {/* Select Button - Full Width Touch Target */}
      <div className="p-4">
        <button className="w-full rounded-lg bg-blue-600 py-3 px-4 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700 active:bg-blue-800">
          Select This Rate
        </button>
      </div>
    </div>
  );
}
