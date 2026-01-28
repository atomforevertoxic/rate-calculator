'use client';

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
  const allFeatures = guaranteedDelivery ? ['Guaranteed Delivery', ...features] : features;
  const displayedFeatures = allFeatures.slice(0, maxDisplay);
  const hiddenCount = Math.max(0, allFeatures.length - maxDisplay);

  return (
    <div className="flex flex-wrap gap-2">
      {displayedFeatures.map((feature) => (
        <span
          key={feature}
          className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800"
        >
          {feature === 'Guaranteed Delivery' ? '✓' : ''} {feature}
        </span>
      ))}
      {hiddenCount > 0 && (
        <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
          +{hiddenCount} more
        </span>
      )}
      {allFeatures.length === 0 && (
        <span className="text-xs text-slate-500 italic">No special features</span>
      )}
    </div>
  );
}
