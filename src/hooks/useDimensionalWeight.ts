import { PackageDimensions, PackageWeight } from '@/src/types/domain';
import { useMemo } from 'react';

interface DimensionalWeightResult {
  dimensionalWeight: number;
  actualWeight: number;
  billableWeight: number;
  isDimensionalWeightApplied: boolean;
  dimensionalFactor: number;
  units: string;
}

export function useDimensionalWeight(
  dimensions: PackageDimensions,
  weight: PackageWeight
): DimensionalWeightResult {
  return useMemo(() => {
    const dimsInInches =
      dimensions.unit === 'in'
        ? { length: dimensions.length, width: dimensions.width, height: dimensions.height }
        : {
            length: dimensions.length / 2.54,
            width: dimensions.width / 2.54,
            height: dimensions.height / 2.54,
          };

    const weightInLbs = weight.unit === 'lbs' ? weight.value : weight.value * 2.20462;

    const dimensionalWeight =
      dimensions.unit === 'in'
        ? (dimsInInches.length * dimsInInches.width * dimsInInches.height) / 139
        : (dimensions.length * dimensions.width * dimensions.height) / 5000;

    const roundedDimensionalWeight = Math.round(dimensionalWeight * 100) / 100;
    const roundedActualWeight = Math.round(weightInLbs * 100) / 100;

    const billableWeight = Math.max(roundedDimensionalWeight, roundedActualWeight);
    const isDimensionalWeightApplied = roundedDimensionalWeight > roundedActualWeight;

    const dimensionalFactor = dimensions.unit === 'in' ? 139 : 5000;

    return {
      dimensionalWeight: roundedDimensionalWeight,
      actualWeight: roundedActualWeight,
      billableWeight: Math.ceil(billableWeight),
      isDimensionalWeightApplied,
      dimensionalFactor,
      units: 'lbs',
    };
  }, [dimensions, weight]);
}

export function useWeightDisplay(weight: number, fromUnits: string, toUnits: string): number {
  return useMemo(() => {
    if (fromUnits === toUnits) return weight;

    if (fromUnits === 'lbs' && toUnits === 'kg') {
      return weight * 0.453592;
    }

    if (fromUnits === 'kg' && toUnits === 'lbs') {
      return weight * 2.20462;
    }

    return weight;
  }, [weight, fromUnits, toUnits]);
}
