'use client';

interface CarrierLogoProps {
  carrier: string;
}

/**
 * Displays carrier logo or initials
 * In a real app, this would fetch actual logo images
 */
export default function CarrierLogo({ carrier }: CarrierLogoProps) {
  // Map carriers to their initials or emoji
  const carrierEmojis: Record<string, string> = {
    FedEx: '📦',
    UPS: '🟀',
    USPS: '🏤',
    DHL: '✈️',
  };

  const emoji = carrierEmojis[carrier] || '📮';

  return (
    <div className="flex items-center gap-2">
      <span className="text-2xl">{emoji}</span>
      <span className="font-medium text-slate-900">{carrier}</span>
    </div>
  );
}
