'use client';

import { createPackageValidationChain, validateWithChain } from '@/src/services/validators';
import { Package, PackageType } from '@/src/types/domain';
import { useCallback, useEffect, useRef, useState } from 'react';
import { DeclaredValueInput } from './forms/DeclaredValueInput';
import { DimensionsInput } from './forms/DimensionsInput';
import { WeightInput } from './forms/WeightInput';

interface PackageDetailsStepProps {
  data: Package;
  onChange: (data: Partial<Package>) => void;
  onValidationChange?: (isValid: boolean) => void;
  onTriggerValidation?: (validateFn: () => Promise<boolean>) => void;
}

export function PackageDetailsStep({
  data,
  onChange,
  onValidationChange,
  onTriggerValidation,
}: PackageDetailsStepProps) {
  const [localData, setLocalData] = useState<Package>(data);
  const [dimensionsErrors, setDimensionsErrors] = useState<
    Array<{ field: string; message: string }>
  >([]);
  const [weightErrors, setWeightErrors] = useState<Array<{ field: string; message: string }>>([]);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Validate package and update error states
  const validatePackage = useCallback(
    async (pkg: Package): Promise<boolean> => {
      try {
        const validator = createPackageValidationChain();
        const result = await validateWithChain(pkg, validator);

        // Separate errors by field
        const dimsErrors: Array<{ field: string; message: string }> = [];
        const wgtErrors: Array<{ field: string; message: string }> = [];

        result.errors.forEach((error) => {
          if (error.field.startsWith('dimensions')) {
            dimsErrors.push({ field: error.field, message: error.message });
          } else if (error.field === 'weight') {
            wgtErrors.push({ field: error.field, message: error.message });
          }
        });

        setDimensionsErrors(dimsErrors);
        setWeightErrors(wgtErrors);

        // Notify parent about validation state
        if (onValidationChange) {
          onValidationChange(result.isValid);
        }

        return result.isValid;
      } catch (error) {
        console.error('Validation error:', error);
        return false;
      }
    },
    [onValidationChange]
  );

  // Exposed method for parent-triggered validation
  useEffect(() => {
    if (onTriggerValidation) {
      onTriggerValidation(() => validatePackage(localData));
    }
  }, [localData, onTriggerValidation, validatePackage]);

  // Validate on initial load
  useEffect(() => {
    void validatePackage(data);
  }, [data, validatePackage]);

  const handleTypeChange = (type: PackageType) => {
    const updated = { ...localData, type };
    setLocalData(updated);
    onChange({ type });
  };

  const handleDimensionsChange = (dimensions: Package['dimensions']) => {
    const updated = { ...localData, dimensions };
    setLocalData(updated);
    onChange({ dimensions });

    // Debounced validation
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      void validatePackage(updated);
    }, 300);
  };

  const handleWeightChange = (weight: Package['weight']) => {
    const updated = { ...localData, weight };
    setLocalData(updated);
    onChange({ weight });

    // Debounced validation
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      void validatePackage(updated);
    }, 300);
  };

  const handleDeclaredValueChange = (declaredValue?: number) => {
    const updated = { ...localData, declaredValue };
    setLocalData(updated);
    onChange({ declaredValue });

    if (declaredValue !== undefined && declaredValue < 0) {
      console.warn('Declared value cannot be negative');
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
          <div className={dimensionsErrors.length > 0 ? 'mb-4' : ''}>
            <DimensionsInput dimensions={localData.dimensions} onChange={handleDimensionsChange} />
          </div>
          {/* Validation Errors */}
          {dimensionsErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 animate-fadeIn">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  {dimensionsErrors.map((error, index) => (
                    <p key={index} className="text-sm text-red-700">
                      {error.message}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Weight</h3>
          <div className={weightErrors.length > 0 ? 'mb-4' : ''}>
            <WeightInput weight={localData.weight} onChange={handleWeightChange} />
          </div>
          {/* Validation Errors */}
          {weightErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 animate-fadeIn">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  {weightErrors.map((error, index) => (
                    <p key={index} className="text-sm text-red-700">
                      {error.message}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DeclaredValueInput
            value={localData.declaredValue}
            onChange={handleDeclaredValueChange}
          />
        </div>
      </div>
    </div>
  );
}
