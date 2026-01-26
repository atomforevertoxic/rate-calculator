// Custom hook to manage the entire multi-step form state and logic.
'use client';

import { FormDataState } from '@/src/lib/form-storage';
import { Address, CarrierName, Package, RateRequest, ShippingOptions } from '@/src/types/domain';
import { useCallback, useRef, useState } from 'react';
import { useFormPersistence } from './useFormPersistence';

// Local FormStep type (1-4) to avoid external dependency and keep types narrow
type FormStep = 1 | 2 | 3 | 4;

// Define the initial state for the entire form
const initialFormData: FormDataState = {
  package: {
    id: 'temp-' + Date.now(),
    type: 'box',
    dimensions: {
      length: 0,
      width: 0,
      height: 0,
      unit: 'in',
    },
    weight: {
      value: 0,
      unit: 'lbs',
    },
  },
  origin: {
    name: '',
    street1: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
  },
  destination: {
    name: '',
    street1: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
  },
  options: {
    speed: 'standard',
    signatureRequired: false,
    insurance: false,
    fragileHandling: false,
    saturdayDelivery: false,
  },
};

interface UsePackageFormResult {
  currentStep: FormStep;
  formData: typeof initialFormData;
  carriersFilter: CarrierName[] | undefined;
  isSubmitting: boolean;
  validationErrorMessage: string;
  showValidationWarning: boolean;
  packageStepValidationRef: React.MutableRefObject<{
    triggerValidation: () => Promise<boolean>;
  } | null>;
  addressStepValidationRef: React.MutableRefObject<{
    triggerValidation: (
      originFormData: FormData,
      destinationFormData: FormData
    ) => Promise<{ origin: boolean; destination: boolean }>;
  } | null>;
  handlePackageChange: (updatedPackage: Partial<Package>) => void;
  handleOriginChange: (updatedOrigin: Partial<Address>) => void;
  handleDestinationChange: (updatedDestination: Partial<Address>) => void;
  handleOptionsChange: (updatedOptions: Partial<ShippingOptions>) => void;
  setCarriersFilter: React.Dispatch<React.SetStateAction<CarrierName[] | undefined>>;
  handlePackageStepValidationChange: (isValid: boolean) => void;
  handleAddressStepValidationChange: (step: 'origin' | 'destination', isValid: boolean) => void;
  nextStep: () => Promise<void>;
  prevStep: () => void;
  goToStep: (step: FormStep) => void;
  handleSubmit: () => Promise<void>;
  resetForm: () => void;
}

export function usePackageForm(): UsePackageFormResult {
  const {
    formData,
    updateFormData,
    resetForm: resetPersistence,
  } = useFormPersistence(initialFormData);

  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [carriersFilter, setCarriersFilter] = useState<CarrierName[] | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrorMessage, setValidationErrorMessage] = useState<string>('');
  const [showValidationWarning, setShowValidationWarning] = useState(false);

  // Internal states for real-time validity feedback (used by validation callbacks)
  const [isOriginValid, setIsOriginValid] = useState(false);
  const [isDestinationValid, setIsDestinationValid] = useState(false);

  // Refs to child validation triggers
  const packageStepValidationRef = useRef<{ triggerValidation: () => Promise<boolean> } | null>(
    null
  );
  const addressStepValidationRef = useRef<{
    triggerValidation: (
      originFormData: FormData,
      destinationFormData: FormData
    ) => Promise<{ origin: boolean; destination: boolean }>;
  } | null>(null);

  const handlePackageChange = useCallback(
    (updatedPackage: Partial<Package>) => {
      updateFormData({
        ...formData,
        package: {
          ...formData.package,
          ...updatedPackage,
        },
      });
    },
    [formData, updateFormData]
  );

  const handleOriginChange = useCallback(
    (updatedOrigin: Partial<Address>) => {
      updateFormData({
        ...formData,
        origin: { ...formData.origin, ...updatedOrigin },
      });
    },
    [formData, updateFormData]
  );

  const handleDestinationChange = useCallback(
    (updatedDestination: Partial<Address>) => {
      updateFormData({
        ...formData,
        destination: { ...formData.destination, ...updatedDestination },
      });
    },
    [formData, updateFormData]
  );

  const handleOptionsChange = useCallback(
    (updatedOptions: Partial<ShippingOptions>) => {
      updateFormData({
        ...formData,
        options: {
          ...formData.options,
          ...updatedOptions,
        },
      });
    },
    [formData, updateFormData]
  );

  const handlePackageStepValidationChange = useCallback(
    (isValid: boolean) => {
      if (isValid && showValidationWarning && currentStep === 1) {
        setShowValidationWarning(false);
        setValidationErrorMessage('');
      }
    },
    [showValidationWarning, currentStep]
  );

  const handleAddressStepValidationChange = useCallback(
    (step: 'origin' | 'destination', isValid: boolean) => {
      if (step === 'origin') {
        setIsOriginValid(isValid);
      } else {
        setIsDestinationValid(isValid);
      }
      if (showValidationWarning && currentStep === 2) {
        // Only clear warning if both are valid
        if (
          (step === 'origin' && isValid && isDestinationValid) ||
          (step === 'destination' && isValid && isOriginValid)
        ) {
          setShowValidationWarning(false);
          setValidationErrorMessage('');
        }
      }
    },
    [showValidationWarning, currentStep, isOriginValid, isDestinationValid]
  );

  const nextStep = useCallback(async () => {
    setShowValidationWarning(false);
    setValidationErrorMessage('');

    if (currentStep === 1) {
      if (packageStepValidationRef.current) {
        const isValid = await packageStepValidationRef.current.triggerValidation();
        if (!isValid) {
          setShowValidationWarning(true);
          setValidationErrorMessage('Please correct the package details before continuing.');
          return;
        }
      }
    } else if (currentStep === 2) {
      if (addressStepValidationRef.current) {
        const originFormData = new FormData();
        Object.entries(formData.origin).forEach(([key, value]) => {
          if (value !== undefined) originFormData.append(key, value.toString());
        });

        const destinationFormData = new FormData();
        Object.entries(formData.destination).forEach(([key, value]) => {
          if (value !== undefined) destinationFormData.append(key, value.toString());
        });

        const result = await addressStepValidationRef.current.triggerValidation(
          originFormData,
          destinationFormData
        );

        if (!result.origin || !result.destination) {
          setShowValidationWarning(true);
          setValidationErrorMessage('Please correct the address details before continuing.');
          return;
        }
      }
    }

    if (currentStep < 4) {
      setCurrentStep((prev: FormStep) => (prev + 1) as FormStep);
    }
  }, [currentStep, formData.origin, formData.destination, isDestinationValid, isOriginValid]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev: FormStep) => (prev - 1) as FormStep);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: FormStep) => {
    setCurrentStep(step);
  }, []);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const rateRequest: RateRequest = {
        package: formData.package,
        origin: formData.origin,
        destination: formData.destination,
        options: formData.options,
        carriersFilter: carriersFilter,
      };

      console.warn('Submitting RateRequest:', rateRequest);
      // Here will be the actual API call

      await new Promise((resolve) => setTimeout(resolve, 1500));

      alert('Rates calculated successfully! (This is a demo. In Phase 3, real rates will appear.)');
      resetPersistence(); // Clear persisted data on successful submission
    } catch (error) {
      console.error('Error calculating rates:', error);
      alert('Error calculating rates. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, carriersFilter, resetPersistence]);

  const handleResetForm = useCallback(() => {
    resetPersistence();
    setCurrentStep(1);
    setCarriersFilter(undefined);
    setIsSubmitting(false);
    setValidationErrorMessage('');
    setShowValidationWarning(false);

    setIsOriginValid(false);
    setIsDestinationValid(false);
    updateFormData(initialFormData); // Reset form data to initial values
  }, [resetPersistence, updateFormData]);

  return {
    currentStep,
    formData,
    carriersFilter,
    isSubmitting,
    validationErrorMessage,
    showValidationWarning,
    packageStepValidationRef,
    addressStepValidationRef,
    handlePackageChange,
    handleOriginChange,
    handleDestinationChange,
    handleOptionsChange,
    setCarriersFilter,
    handlePackageStepValidationChange,
    handleAddressStepValidationChange,
    nextStep,
    prevStep,
    goToStep,
    handleSubmit,
    resetForm: handleResetForm, // Expose the reset function
  };
}
