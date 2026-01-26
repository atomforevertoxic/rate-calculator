/**
 * Custom hook for managing address validation using React 19 Server Actions.
 * Encapsulates the validation logic for address forms.
 */
'use client';

import { validateAddress as serverValidateAddress } from '@/src/app/api/validate-address/route';
import { ValidationError } from '@/src/services/validators/validation-chain';
import { Address } from '@/src/types/domain';
import { useCallback } from 'react';

interface UseAddressValidationResult {
  validateAddress: (address: Address) => Promise<ValidationError[]>;
  validateAddressFormData: (formData: FormData) => Promise<ValidationError[]>;
}

/**
 * Custom hook to validate address data using the server-side validation chain.
 *
 * @returns An object containing validation functions:
 *   - validateAddress: Validates an Address object directly
 *   - validateAddressFormData: Validates FormData from a form
 */
export function useAddressValidation(): UseAddressValidationResult {
  /**
   * Validates an Address object by converting it to FormData and calling the server action.
   *
   * @param address The address object to validate
   * @returns Promise resolving to array of validation errors (empty if valid)
   */
  const validateAddress = useCallback(async (address: Address): Promise<ValidationError[]> => {
    const formData = new FormData();

    // Convert address fields to FormData
    Object.entries(address).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, value.toString());
      }
    });

    // Call server action for validation
    try {
      const result = await serverValidateAddress({ errors: [] }, formData);
      return result.errors;
    } catch (error) {
      console.error('Address validation error:', error);
      return [
        {
          field: 'system',
          message: 'Address validation failed. Please try again.',
          code: 'VALIDATION_ERROR',
        },
      ];
    }
  }, []);

  /**
   * Validates FormData directly by calling the server action.
   * Useful when you have FormData from a form element.
   *
   * @param formData The FormData object to validate
   * @returns Promise resolving to array of validation errors (empty if valid)
   */
  const validateAddressFormData = useCallback(
    async (formData: FormData): Promise<ValidationError[]> => {
      try {
        const result = await serverValidateAddress({ errors: [] }, formData);
        return result.errors;
      } catch (error) {
        console.error('Address validation error:', error);
        return [
          {
            field: 'system',
            message: 'Address validation failed. Please try again.',
            code: 'VALIDATION_ERROR',
          },
        ];
      }
    },
    []
  );

  return {
    validateAddress,
    validateAddressFormData,
  };
}
