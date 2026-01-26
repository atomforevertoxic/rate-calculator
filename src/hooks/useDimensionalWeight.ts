// Custom hook for calculating dimensional weight and billable weight.
'use client';

import { useMemo } from 'react';
import { Package } from '@/src/types/domain'; // Assuming your Package type is here

interface DimensionalWeightResult {
  dimensionalWeight: number;
  billableWeight: number;
  isDimensionalWeightApplied: boolean;
}

/**
 * Custom hook to calculate the dimensional weight and billable weight of a package.
 * It follows common industry standards (e.g., FedEx/UPS divisor).
 *
 * @param pkg The package object containing dimensions and weight.
 * @returns An object with dimensionalWeight, billableWeight, and a flag indicating if dimensional weight was applied.
 */
export function useDimensionalWeight(pkg: Package): DimensionalWeightResult {
  const result = useMemo(() => {
    const { dimensions, weight } = pkg;

    let length = dimensions.length;
    let width = dimensions.width;
    let height = dimensions.height;
    let actualWeight = weight.value;

    // Convert to inches and pounds for consistent calculation before applying divisor
    if (dimensions.unit === 'cm') {
      length = length / 2.54;
      width = width / 2.54;
      height = height / 2.54;
    }
    if (weight.unit === 'kg') {
      actualWeight = actualWeight * 2.20462; // Convert kg to lbs (1 kg = 2.20462 lbs)
    }

    const dimensionalDivisor = 139; // Common divisor for L x W x H in cubic inches (e.g., for FedEx/UPS)

    // Calculate dimensional weight
    const calculatedDimensionalWeight = (length * width * height) / dimensionalDivisor;

    // Billable weight is the greater of actual weight and dimensional weight
    const billableWeight = Math.max(actualWeight, calculatedDimensionalWeight);
    const isDimensionalWeightApplied = billableWeight > actualWeight;

    return {
      dimensionalWeight: parseFloat(calculatedDimensionalWeight.toFixed(2)), // Round to 2 decimal places
      billableWeight: parseFloat(billableWeight.toFixed(2)),       // Round to 2 decimal places
      isDimensionalWeightApplied,
    };
  }, [pkg.dimensions, pkg.weight]); // Recalculate if dimensions or weight change

  return result;
}
