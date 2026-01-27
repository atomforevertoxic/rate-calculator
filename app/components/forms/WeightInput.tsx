'use client';

import { PackageWeight } from '@/src/types/domain';

interface WeightInputProps {
  weight: PackageWeight;
  onChange: (weight: PackageWeight) => void;
}

export function WeightInput({ weight, onChange }: WeightInputProps) {
  const handleValueChange = (value: number) => {
    onChange({
      ...weight,
      value,
    });
  };

  const handleUnitChange = (unit: 'lbs' | 'kg') => {
    // convert weight value when switching units
    const convert = (v: number, from: typeof weight.unit, to: typeof unit) => {
      if (from === to) return v;
      return from === 'lbs'
        ? Math.round((v / 2.20462) * 100) / 100
        : Math.round(v * 2.20462 * 100) / 100;
    };

    onChange({
      ...weight,
      value: convert(weight.value || 0, weight.unit, unit),
      unit,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <label className="text-sm font-medium text-gray-700">Unit:</label>
        <div className="flex border rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => handleUnitChange('lbs')}
            className={`px-4 py-2 ${
              weight.unit === 'lbs' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Pounds (lbs)
          </button>
          <button
            type="button"
            onClick={() => handleUnitChange('kg')}
            className={`px-4 py-2 ${
              weight.unit === 'kg' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Kilograms (kg)
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">Weight:</label>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            min="0"
            step="0.1"
            value={weight.value || ''}
            onChange={(e) => handleValueChange(parseFloat(e.target.value) || 0)}
            className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="0.0"
          />
          <span className="text-gray-500">{weight.unit === 'lbs' ? 'lbs' : 'kg'}</span>
        </div>
      </div>
    </div>
  );
}
