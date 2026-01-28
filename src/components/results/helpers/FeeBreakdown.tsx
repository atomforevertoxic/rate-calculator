'use client';

import type { Fee } from '@/src/types/domain';
import { useState } from 'react';

interface FeeBreakdownProps {
  baseRate: number;
  additionalFees: Fee[];
}

/**
 * Expandable fee breakdown showing base rate and all additional fees
 */
export default function FeeBreakdown({ baseRate, additionalFees }: FeeBreakdownProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const totalFees = additionalFees.reduce((sum, fee) => sum + fee.amount, 0);
  const totalCost = baseRate + totalFees;

  if (additionalFees.length === 0) {
    return (
      <div className="text-sm">
        <div className="font-medium text-slate-900">${baseRate.toFixed(2)}</div>
        <div className="text-xs text-slate-500">No additional fees</div>
      </div>
    );
  }

  return (
    <div className="text-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="font-medium text-slate-900 hover:text-slate-700 flex items-center gap-1"
      >
        ${totalCost.toFixed(2)}
        <span className="text-xs text-slate-500">{isExpanded ? '▼' : '▶'}</span>
      </button>

      {isExpanded && (
        <div className="mt-2 space-y-1 border-t border-slate-200 pt-2">
          <div className="flex justify-between text-xs text-slate-600">
            <span>Base rate:</span>
            <span>${baseRate.toFixed(2)}</span>
          </div>
          {additionalFees.map((fee, index) => (
            <div key={index} className="flex justify-between text-xs text-slate-600 gap-2">
              <span className="truncate">{fee.description}:</span>
              <span className="flex-shrink-0">+${fee.amount.toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-slate-200 pt-1 flex justify-between font-medium text-slate-900">
            <span>Total:</span>
            <span>${totalCost.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
