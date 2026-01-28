'use client';

import { useState } from 'react';

interface FeaturesListProps {
  features: string[];
  guaranteedDelivery: boolean;
  maxDisplay?: number;
}

/**
 * Displays rate features as chips with optional "show more" functionality
 */
export default function FeaturesList({
  features,
  guaranteedDelivery,
  maxDisplay = 3,
}: FeaturesListProps) {
  const [showAll, setShowAll] = useState(false);
  const allFeatures = guaranteedDelivery ? ['Guaranteed Delivery', ...features] : features;
  const displayedFeatures = showAll ? allFeatures : allFeatures.slice(0, maxDisplay);
  const hiddenCount = Math.max(0, allFeatures.length - maxDisplay);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {displayedFeatures.map((feature) => (
          <span
            key={feature}
            className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800"
          >
            {feature === 'Guaranteed Delivery' ? '✓' : ''} {feature}
          </span>
        ))}
        {allFeatures.length === 0 && (
          <span className="text-xs text-slate-500 italic">No special features</span>
        )}
      </div>
      {hiddenCount > 0 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          +{hiddenCount} more features
        </button>
      )}
      {showAll && hiddenCount > 0 && (
        <button
          onClick={() => setShowAll(false)}
          className="mt-2 text-xs text-slate-600 hover:text-slate-700 font-medium"
        >
          Show less
        </button>
      )}
    </div>
  );
}
