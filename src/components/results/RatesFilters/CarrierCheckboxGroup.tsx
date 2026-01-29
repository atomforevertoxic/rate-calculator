'use client';

interface CarrierCheckboxGroupProps {
  selectedCarriers: string[];
  onCarrierToggle: (carrier: string) => void;
  availableCarriers?: string[];
}

const DEFAULT_CARRIERS = ['FedEx'] as const;

export default function CarrierCheckboxGroup({
  selectedCarriers,
  onCarrierToggle,
  availableCarriers = DEFAULT_CARRIERS as unknown as string[],
}: CarrierCheckboxGroupProps) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold text-slate-900">Carriers</h3>
      <div className="space-y-3">
        {availableCarriers.map((carrier) => (
          <label key={carrier} className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedCarriers.includes(carrier)}
              onChange={() => onCarrierToggle(carrier)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-700">{carrier}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
