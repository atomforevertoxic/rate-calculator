'use client';

interface BestValueBadgeProps {
  // rate: ShippingRate; - not used for badge logic
  isCheapest: boolean;
  isFastest: boolean;
}

export default function BestValueBadge({ isCheapest, isFastest }: BestValueBadgeProps) {
  if (isCheapest && isFastest) {
    return (
      <div className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-800">
        ⭐ Best Value
      </div>
    );
  }

  if (isCheapest) {
    return (
      <div className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
        💰 Cheapest
      </div>
    );
  }

  if (isFastest) {
    return (
      <div className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
        ⚡ Fastest
      </div>
    );
  }

  return null;
}
