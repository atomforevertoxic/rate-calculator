'use client';

export type ServiceSpeed = 'overnight' | 'two-day' | 'standard' | 'economy';

interface ServiceSpeedFilterProps {
  selectedSpeeds: ServiceSpeed[];
  onSpeedToggle: (speed: ServiceSpeed) => void;
}

const SPEED_OPTIONS: Array<{ value: ServiceSpeed; label: string; icon: string }> = [
  { value: 'overnight', label: 'Overnight', icon: '🚀' },
  { value: 'two-day', label: '2-Day', icon: '⚡' },
  { value: 'standard', label: 'Standard', icon: '📦' },
  { value: 'economy', label: 'Economy', icon: '🐢' },
];

export default function ServiceSpeedFilter({
  selectedSpeeds,
  onSpeedToggle,
}: ServiceSpeedFilterProps) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold text-slate-900">Delivery Speed</h3>
      <div className="space-y-3">
        {SPEED_OPTIONS.map((option) => (
          <label key={option.value} className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedSpeeds.includes(option.value)}
              onChange={() => onSpeedToggle(option.value)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-700">
              {option.icon} {option.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
