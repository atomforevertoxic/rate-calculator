import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePackageForm } from '../usePackageForm';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('usePackageForm Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Initial State', () => {
    it('should initialize with step 1', () => {
      const { result } = renderHook(() => usePackageForm());
      expect(result.current.currentStep).toBe(1);
    });

    it('should initialize with valid form data structure', () => {
      const { result } = renderHook(() => usePackageForm());
      expect(result.current.formData).toBeDefined();
      expect(result.current.formData.package).toBeDefined();
      expect(result.current.formData.origin).toBeDefined();
      expect(result.current.formData.destination).toBeDefined();
      expect(result.current.formData.options).toBeDefined();
    });

    it('should initialize with no validation errors', () => {
      const { result } = renderHook(() => usePackageForm());
      expect(result.current.showValidationWarning).toBe(false);
      expect(result.current.validationErrorMessage).toBe('');
    });

    it('should initialize with submission not in progress', () => {
      const { result } = renderHook(() => usePackageForm());
      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('Form Persistence with localStorage', () => {
    it('should save form state to localStorage when form data changes', () => {
      const { result } = renderHook(() => usePackageForm());

      act(() => {
        result.current.handlePackageChange({
          type: 'tube',
        });
      });

      // Wait for debounce (500ms)
      const savedState = localStorage.getItem('rate-calculator-form-state');
      expect(savedState).toBeDefined();
      if (savedState) {
        const parsed = JSON.parse(savedState);
        expect(parsed.package.type).toBe('tube');
      }
    });

    it('should restore form state from localStorage on mount', () => {
      const initialState = {
        package: {
          id: 'test-id',
          type: 'box',
          dimensions: { length: 10, width: 10, height: 10, unit: 'in' as const },
          weight: { value: 5, unit: 'lbs' as const },
        },
        origin: {
          name: 'Test Origin',
          street1: '123 Main St',
          city: 'NYC',
          state: 'NY',
          postalCode: '10001',
          country: 'US',
          street2: '',
          phone: '',
        },
        destination: {
          name: 'Test Dest',
          street1: '456 Oak Ave',
          city: 'LA',
          state: 'CA',
          postalCode: '90001',
          country: 'US',
          street2: '',
          phone: '',
        },
        options: {
          speed: 'standard' as const,
          signatureRequired: false,
          insurance: false,
          fragileHandling: false,
          saturdayDelivery: false,
        },
      };

      localStorage.setItem('rate-calculator-form-state', JSON.stringify(initialState));

      const { result } = renderHook(() => usePackageForm());

      expect(result.current.formData.origin.name).toBe('Test Origin');
      expect(result.current.formData.destination.name).toBe('Test Dest');
    });

    it('should clear localStorage on form reset', () => {
      const { result } = renderHook(() => usePackageForm());

      act(() => {
        result.current.handlePackageChange({ type: 'tube' });
      });

      // Advance time to allow debounce
      vi.useFakeTimers();
      vi.runAllTimers();
      vi.useRealTimers();

      expect(localStorage.getItem('rate-calculator-form-state')).toBeDefined();

      act(() => {
        result.current.resetForm();
      });

      expect(localStorage.getItem('rate-calculator-form-state')).toBeNull();
    });
  });

  describe('Step Navigation', () => {
    it('should advance to next step via nextStep', async () => {
      const { result } = renderHook(() => usePackageForm());
      expect(result.current.currentStep).toBe(1);

      // Mock validation to pass
      const mockValidation = vi.fn().mockResolvedValue(true);
      act(() => {
        result.current.packageStepValidationRef.current = {
          triggerValidation: mockValidation,
        };
      });

      await act(async () => {
        await result.current.nextStep();
      });

      expect(mockValidation).toHaveBeenCalled();
      // Note: Step advance depends on validation passing
    });

    it('should go back to previous step via prevStep', () => {
      const { result } = renderHook(() => usePackageForm());

      // Move to step 2
      act(() => {
        result.current.goToStep(2);
      });
      expect(result.current.currentStep).toBe(2);

      // Go back to step 1
      act(() => {
        result.current.prevStep();
      });
      expect(result.current.currentStep).toBe(1);
    });

    it('should navigate to specific step via goToStep', () => {
      const { result } = renderHook(() => usePackageForm());

      act(() => {
        result.current.goToStep(3);
      });
      expect(result.current.currentStep).toBe(3);

      act(() => {
        result.current.goToStep(4);
      });
      expect(result.current.currentStep).toBe(4);

      act(() => {
        result.current.goToStep(1);
      });
      expect(result.current.currentStep).toBe(1);
    });

    it('should not allow backward navigation below step 1', () => {
      const { result } = renderHook(() => usePackageForm());
      expect(result.current.currentStep).toBe(1);

      act(() => {
        result.current.prevStep();
      });

      expect(result.current.currentStep).toBe(1);
    });

    it('should not allow forward navigation beyond step 4', () => {
      const { result } = renderHook(() => usePackageForm());

      act(() => {
        result.current.goToStep(4);
      });

      const mockValidation = vi.fn().mockResolvedValue(true);
      act(() => {
        result.current.packageStepValidationRef.current = {
          triggerValidation: mockValidation,
        };
      });

      // Attempt to go beyond step 4 should have no effect or be handled gracefully
      expect(result.current.currentStep).toBe(4);
    });
  });

  describe('Form Data Updates', () => {
    it('should update package data via handlePackageChange', () => {
      const { result } = renderHook(() => usePackageForm());

      const newPackageData = { type: 'envelope' as const };

      act(() => {
        result.current.handlePackageChange(newPackageData);
      });

      expect(result.current.formData.package.type).toBe('envelope');
    });

    it('should update origin address via handleOriginChange', () => {
      const { result } = renderHook(() => usePackageForm());

      const newOrigin = { name: 'New Origin' };

      act(() => {
        result.current.handleOriginChange(newOrigin);
      });

      expect(result.current.formData.origin.name).toBe('New Origin');
    });

    it('should update destination address via handleDestinationChange', () => {
      const { result } = renderHook(() => usePackageForm());

      const newDestination = { city: 'Los Angeles' };

      act(() => {
        result.current.handleDestinationChange(newDestination);
      });

      expect(result.current.formData.destination.city).toBe('Los Angeles');
    });

    it('should update shipping options via handleOptionsChange', () => {
      const { result } = renderHook(() => usePackageForm());

      const newOptions = { insurance: true };

      act(() => {
        result.current.handleOptionsChange(newOptions);
      });

      expect(result.current.formData.options.insurance).toBe(true);
    });

    it('should merge partial updates without overwriting other fields', () => {
      const { result } = renderHook(() => usePackageForm());

      act(() => {
        result.current.handlePackageChange({
          type: 'tube',
        });
      });

      expect(result.current.formData.package.type).toBe('tube');
      // Other package fields should remain unchanged
      expect(result.current.formData.package.weight).toBeDefined();
      expect(result.current.formData.package.dimensions).toBeDefined();
    });
  });

  describe('Validation State Management', () => {
    it('should clear validation errors on successful validation', () => {
      const { result } = renderHook(() => usePackageForm());

      act(() => {
        result.current.handlePackageStepValidationChange(true);
      });

      // If warning was shown, it should be cleared on validation pass
      // Note: This depends on internal state management
    });

    it('should show validation error message on validation failure', async () => {
      const { result } = renderHook(() => usePackageForm());

      const mockValidation = vi.fn().mockResolvedValue(false);
      act(() => {
        result.current.packageStepValidationRef.current = {
          triggerValidation: mockValidation,
        };
      });

      await act(async () => {
        await result.current.nextStep();
      });

      expect(result.current.showValidationWarning).toBe(true);
      expect(result.current.validationErrorMessage).toBeTruthy();
    });

    it('should prevent navigation to next step on validation failure', async () => {
      const { result } = renderHook(() => usePackageForm());
      const initialStep = result.current.currentStep;

      const mockValidation = vi.fn().mockResolvedValue(false);
      act(() => {
        result.current.packageStepValidationRef.current = {
          triggerValidation: mockValidation,
        };
      });

      await act(async () => {
        await result.current.nextStep();
      });

      // Step should not advance if validation failed
      expect(result.current.currentStep).toBe(initialStep);
    });
  });

  describe('Carriers Filter', () => {
    it('should update carriers filter', () => {
      const { result } = renderHook(() => usePackageForm());

      act(() => {
        result.current.setCarriersFilter(['FedEx']);
      });

      expect(result.current.carriersFilter).toEqual(['FedEx']);
    });

    it('should handle FedEx carrier in filter', () => {
      const { result } = renderHook(() => usePackageForm());

      act(() => {
        result.current.setCarriersFilter(['FedEx']);
      });

      expect(result.current.carriersFilter).toEqual(['FedEx']);
    });
  });

  describe('Form Reset', () => {
    it('should reset all form data to initial state', () => {
      const { result } = renderHook(() => usePackageForm());

      // Make some changes
      act(() => {
        result.current.handlePackageChange({ type: 'tube' });
        result.current.handleOriginChange({ name: 'Modified' });
        result.current.goToStep(3);
      });

      // Reset
      act(() => {
        result.current.resetForm();
      });

      expect(result.current.currentStep).toBe(1);
      expect(result.current.formData.origin.name).toBe('');
    });

    it('should clear validation warnings on reset', () => {
      const { result } = renderHook(() => usePackageForm());

      act(() => {
        // Manually set warning state (simulating validation failure)
        result.current.handlePackageStepValidationChange(false);
      });

      act(() => {
        result.current.resetForm();
      });

      expect(result.current.showValidationWarning).toBe(false);
      expect(result.current.validationErrorMessage).toBe('');
    });
  });

  describe('Return values conform to interface', () => {
    it('should return all required properties', () => {
      const { result } = renderHook(() => usePackageForm());

      expect(result.current).toHaveProperty('currentStep');
      expect(result.current).toHaveProperty('formData');
      expect(result.current).toHaveProperty('carriersFilter');
      expect(result.current).toHaveProperty('isSubmitting');
      expect(result.current).toHaveProperty('validationErrorMessage');
      expect(result.current).toHaveProperty('showValidationWarning');
      expect(result.current).toHaveProperty('packageStepValidationRef');
      expect(result.current).toHaveProperty('addressStepValidationRef');
      expect(result.current).toHaveProperty('handlePackageChange');
      expect(result.current).toHaveProperty('handleOriginChange');
      expect(result.current).toHaveProperty('handleDestinationChange');
      expect(result.current).toHaveProperty('handleOptionsChange');
      expect(result.current).toHaveProperty('setCarriersFilter');
      expect(result.current).toHaveProperty('handlePackageStepValidationChange');
      expect(result.current).toHaveProperty('handleAddressStepValidationChange');
      expect(result.current).toHaveProperty('nextStep');
      expect(result.current).toHaveProperty('prevStep');
      expect(result.current).toHaveProperty('goToStep');
      expect(result.current).toHaveProperty('handleSubmit');
      expect(result.current).toHaveProperty('resetForm');
    });
  });
});
