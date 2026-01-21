'use client';

import { ServiceSpeed } from '@/src/types/domain';

interface ServiceSpeedOption {
  value: ServiceSpeed;
  label: string;
  description: string;
  estimatedDays: string;
}

interface ServiceSpeedSelectorProps {
  value: ServiceSpeed;
  onChange: (speed: ServiceSpeed) => void;
  options?: ServiceSpeedOption[];
}

const defaultOptions: ServiceSpeedOption[] = [
  {
    value: 'overnight',
    label: 'Overnight',
    description: 'Next business day delivery',
    estimatedDays: '1-2 days',
  },
  {
    value: 'two-day',
    label: '2-Day',
    description: 'Delivery within 2 business days',
    estimatedDays: '2-3 days',
  },
  {
    value: 'standard',
    label: 'Standard',
    description: 'Regular ground shipping',
    estimatedDays: '3-7 days',
  },
  {
    value: 'economy',
    label: 'Economy',
    description: 'Most economical option',
    estimatedDays: '5-10 days',
  },
];

export function ServiceSpeedSelector({
  value,
  onChange,
  options = defaultOptions,
}: ServiceSpeedSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Service Speed</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`p-4 border-2 rounded-lg text-left transition-all ${
              value === option.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-medium text-gray-900 mb-1">{option.label}</div>
            <div className="text-sm text-gray-600 mb-2">{option.description}</div>
            <div className="text-sm font-medium text-blue-600">{option.estimatedDays}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
