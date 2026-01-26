import { Address } from '@/src/types/domain';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAddressValidation } from '../useAddressValidation';

// Mock the server action
vi.mock('@/src/app/api/validate-address/route', () => ({
  validateAddress: vi.fn(),
}));

describe('useAddressValidation Hook', () => {
  let validAddress: Address;

  beforeEach(() => {
    validAddress = {
      name: 'John Doe',
      street1: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'US',
    };
  });

  describe('validateAddress function', () => {
    it('should return empty errors for valid address', async () => {
      const { result } = renderHook(() => useAddressValidation());

      const { validateAddress: serverValidateAddress } =
        await import('@/src/app/api/validate-address/route');
      vi.mocked(serverValidateAddress).mockResolvedValue({ errors: [] });

      let validationResult: any;
      await act(async () => {
        validationResult = await result.current.validateAddress(validAddress);
      });

      expect(validationResult).toEqual([]);
    });

    it('should return errors for invalid address', async () => {
      const { result } = renderHook(() => useAddressValidation());
      const mockErrors = [
        {
          field: 'postalCode',
          message: 'Invalid ZIP code',
          code: 'INVALID_US_ZIP',
        },
      ];

      const { validateAddress: serverValidateAddress } =
        await import('@/src/app/api/validate-address/route');
      vi.mocked(serverValidateAddress).mockResolvedValue({ errors: mockErrors });

      let validationResult: any;
      await act(async () => {
        validationResult = await result.current.validateAddress({
          ...validAddress,
          postalCode: 'invalid',
        });
      });

      expect(validationResult).toEqual(mockErrors);
    });

    it('should convert Address object to FormData', async () => {
      const { result } = renderHook(() => useAddressValidation());

      const { validateAddress: serverValidateAddress } =
        await import('@/src/app/api/validate-address/route');
      vi.mocked(serverValidateAddress).mockResolvedValue({ errors: [] });

      await act(async () => {
        await result.current.validateAddress(validAddress);
      });

      expect(serverValidateAddress).toHaveBeenCalled();
      const callArgs = vi.mocked(serverValidateAddress).mock.calls[0];
      expect(callArgs).toBeDefined();
      const formData = callArgs![1] as FormData;

      expect(formData.get('name')).toBe('John Doe');
      expect(formData.get('street1')).toBe('123 Main St');
      expect(formData.get('city')).toBe('New York');
      expect(formData.get('state')).toBe('NY');
      expect(formData.get('postalCode')).toBe('10001');
      expect(formData.get('country')).toBe('US');
    });

    it('should handle server action errors gracefully', async () => {
      const { result } = renderHook(() => useAddressValidation());

      const { validateAddress: serverValidateAddress } =
        await import('@/src/app/api/validate-address/route');
      vi.mocked(serverValidateAddress).mockRejectedValue(new Error('Server error'));

      let validationResult: any;
      await act(async () => {
        validationResult = await result.current.validateAddress(validAddress);
      });

      expect(validationResult).toHaveLength(1);
      expect(validationResult[0].field).toBe('system');
      expect(validationResult[0].code).toBe('VALIDATION_ERROR');
    });
  });

  describe('validateAddressFormData function', () => {
    it('should validate FormData directly', async () => {
      const { result } = renderHook(() => useAddressValidation());

      const formData = new FormData();
      formData.append('name', 'Jane Doe');
      formData.append('street1', '456 Oak Ave');
      formData.append('city', 'Los Angeles');
      formData.append('state', 'CA');
      formData.append('postalCode', '90001');
      formData.append('country', 'US');

      const { validateAddress: serverValidateAddress } =
        await import('@/src/app/api/validate-address/route');
      vi.mocked(serverValidateAddress).mockResolvedValue({ errors: [] });

      let validationResult: any;
      await act(async () => {
        validationResult = await result.current.validateAddressFormData(formData);
      });

      expect(validationResult).toEqual([]);
      expect(serverValidateAddress).toHaveBeenCalledWith({ errors: [] }, formData);
    });

    it('should return errors from server validation', async () => {
      const { result } = renderHook(() => useAddressValidation());

      const formData = new FormData();
      formData.append('name', '');
      formData.append('street1', '');
      formData.append('city', '');
      formData.append('state', '');
      formData.append('postalCode', '');
      formData.append('country', 'US');

      const mockErrors = [{ field: 'name', message: 'Name is required', code: 'REQUIRED_FIELD' }];

      const { validateAddress: serverValidateAddress } =
        await import('@/src/app/api/validate-address/route');
      vi.mocked(serverValidateAddress).mockResolvedValue({ errors: mockErrors });

      let validationResult: any;
      await act(async () => {
        validationResult = await result.current.validateAddressFormData(formData);
      });

      expect(validationResult).toEqual(mockErrors);
    });

    it('should handle FormData errors gracefully', async () => {
      const { result } = renderHook(() => useAddressValidation());

      const formData = new FormData();
      formData.append('name', 'Test');

      const { validateAddress: serverValidateAddress } =
        await import('@/src/app/api/validate-address/route');
      vi.mocked(serverValidateAddress).mockRejectedValue(new Error('Network error'));

      let validationResult: any;
      await act(async () => {
        validationResult = await result.current.validateAddressFormData(formData);
      });

      expect(validationResult).toHaveLength(1);
      expect(validationResult[0].code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Hook return values', () => {
    it('should return both validation functions', () => {
      const { result } = renderHook(() => useAddressValidation());

      expect(result.current).toHaveProperty('validateAddress');
      expect(result.current).toHaveProperty('validateAddressFormData');
      expect(typeof result.current.validateAddress).toBe('function');
      expect(typeof result.current.validateAddressFormData).toBe('function');
    });

    it('should return consistent functions across re-renders', () => {
      const { result, rerender } = renderHook(() => useAddressValidation());

      const firstValidateAddress = result.current.validateAddress;
      const firstValidateFormData = result.current.validateAddressFormData;

      rerender();

      // Functions should be the same reference (due to useCallback)
      expect(result.current.validateAddress).toBe(firstValidateAddress);
      expect(result.current.validateAddressFormData).toBe(firstValidateFormData);
    });
  });
});
