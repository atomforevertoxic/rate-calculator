'use client';

import { createPackageValidationChain, validateWithChain } from '@/src/services/validators';
import { Package, PackageType } from '@/src/types/domain';
import { useState } from 'react';
import { DeclaredValueInput } from './forms/DeclaredValueInput';
import { DimensionsInput } from './forms/DimensionsInput';
import { WeightInput } from './forms/WeightInput';

interface PackageDetailsStepProps {
  data: Package;
  onChange: (data: Partial<Package>) => void;
}

export function PackageDetailsStep({ data, onChange }: PackageDetailsStepProps) {
  const [localData, setLocalData] = useState<Package>(data);

  const handleTypeChange = (type: PackageType) => {
    const updated = { ...localData, type };
    setLocalData(updated);
    onChange({ type });
  };

  const handleDimensionsChange = (dimensions: Package['dimensions']) => {
    const updated = { ...localData, dimensions };
    setLocalData(updated);
    onChange({ dimensions });

    const validator = createPackageValidationChain();
    validateWithChain(updated, validator).then((result) => {
      if (!result.isValid) {
        console.log('Package validation errors:', result.errors);
      }
    });
  };

  const handleWeightChange = (weight: Package['weight']) => {
    const updated = { ...localData, weight };
    setLocalData(updated);
    onChange({ weight });

    const validator = createPackageValidationChain();
    validateWithChain(updated, validator).then((result) => {
      if (!result.isValid) {
        console.log('Package validation errors:', result.errors);
      }
    });
  };

  const handleDeclaredValueChange = (declaredValue?: number) => {
    const updated = { ...localData, declaredValue };
    setLocalData(updated);
    onChange({ declaredValue });

    if (declaredValue !== undefined && declaredValue < 0) {
      console.log('Declared value cannot be negative');
    }
  };

  const packageTypes: { value: PackageType; label: string; icon: string }[] = [
    { value: 'envelope', label: 'Envelope', icon: '✉️' },
    { value: 'box', label: 'Box', icon: '📦' },
    { value: 'tube', label: 'Tube', icon: '🧪' },
    { value: 'custom', label: 'Custom', icon: '📐' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Package Type</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {packageTypes.map((pkg) => (
            <button
              key={pkg.value}
              type="button"
              onClick={() => handleTypeChange(pkg.value)}
              className={`p-4 border-2 rounded-lg flex flex-col items-center justify-center transition-all ${
                localData.type === pkg.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl mb-2">{pkg.icon}</span>
              <span className="font-medium text-gray-900">{pkg.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Dimensions</h3>
          <DimensionsInput dimensions={localData.dimensions} onChange={handleDimensionsChange} />
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Weight</h3>
          <WeightInput weight={localData.weight} onChange={handleWeightChange} />
          <DeclaredValueInput
            value={localData.declaredValue}
            onChange={handleDeclaredValueChange}
          />
        </div>
      </div>
    </div>
  );
}
