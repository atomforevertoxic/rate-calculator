// This is a client component
'use client';

import { Address, CarrierName, Package, RateRequest, ShippingOptions } from '@/src/types/domain';
import { useCallback, useRef, useState } from 'react';
import { AddressStep } from '../AddressStep';
import { PackageDetailsStep } from '../PackageDetailsStep';
import { ReviewStep } from '../ReviewStep';
import { ShippingOptionsStep } from '../ShippingOptionsStep';
import { FormNavigation } from './controls/FormNavigation';

type FormStep = 1 | 2 | 3 | 4;

interface FormState {
  package: Package;
  origin: Address;
  destination: Address;
  options: ShippingOptions;
}

export default function RateCalculatorForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [carriersFilter, setCarriersFilter] = useState<CarrierName[] | undefined>();
  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  // These states are used for real-time validation feedback for each step.
  // They visually indicate if a step is currently valid, but actual navigation
  // is blocked by `nextStep` calling `triggerValidation` methods.

  const [isOriginAddressValid, setIsOriginAddressValid] = useState(false);
  const [isDestinationAddressValid, setIsDestinationAddressValid] = useState(false);

  const [showValidationWarning, setShowValidationWarning] = useState(false);
  const [validationErrorMessage, setValidationErrorMessage] = useState<string>('');

  // Refs to trigger validation from child components' on next button click
  const packageStepValidationRef = useRef<{ triggerValidation: () => Promise<boolean> } | null>(
    null
  );
  const addressStepValidationRef = useRef<{
    triggerValidation: (
      originFormData: FormData,
      destinationFormData: FormData
    ) => Promise<{ origin: boolean; destination: boolean }>;
  } | null>(null); // Type updated for AddressStep with server action logic

  const [formData, setFormData] = useState<FormState>({
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
  });

  const handleSubmit = async () => {
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
      // Here will be the API call

      await new Promise((resolve) => setTimeout(resolve, 1500));

      alert('Rates calculated successfully! (This is a demo. In Phase 3, real rates will appear.)');
    } catch (error) {
      console.error('Error calculating rates:', error);
      alert('Error calculating rates. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePackageChange = (updatedPackage: Partial<Package>) => {
    setFormData((prev) => ({
      ...prev,
      package: {
        ...prev.package,
        ...updatedPackage,
      },
    }));
  };

  const handleOriginChange = (updatedOrigin: Partial<Address>) => {
    setFormData((prev) => ({
      ...prev,
      origin: { ...prev.origin, ...updatedOrigin },
    }));
  };

  const handleDestinationChange = (updatedDestination: Partial<Address>) => {
    setFormData((prev) => ({
      ...prev,
      destination: { ...prev.destination, ...updatedDestination },
    }));
  };

  const handleOptionsChange = (updatedOptions: Partial<ShippingOptions>) => {
    setFormData((prev) => ({
      ...prev,
      options: {
        ...prev.options,
        ...updatedOptions,
      },
    }));
  };

  // Convert package dimensions and weight between metric and imperial
  // Unit conversion handled inside child inputs on toggle; no global convert button needed

  // Callback for PackageDetailsStep -> updates validation state for Step 1
  const handlePackageStepValidationChange = useCallback((isValid: boolean) => {
    // If the step becomes valid, hide the general warning
    if (isValid) {
      setShowValidationWarning(false);
      setValidationErrorMessage('');
    }
  }, []);

  // Callback for AddressStep -> updates validation states for origin and destination addresses
  const handleAddressStepValidationChange = useCallback(
    (step: 'origin' | 'destination', isValid: boolean) => {
      if (step === 'origin') {
        setIsOriginAddressValid(isValid);
      } else {
        setIsDestinationAddressValid(isValid);
      }

      // If both addresses are valid, hide the general warning
      // This check is specific to the current state of both address valid flags
      if (isOriginAddressValid && isDestinationAddressValid) {
        // Use the current state, not potentially stale closure values
        setShowValidationWarning(false);
        setValidationErrorMessage('');
      }
    },
    [isOriginAddressValid, isDestinationAddressValid]
  ); // Add dependencies to ensure correct behavior

  const nextStep = async () => {
    // Clear previous warnings before attempting to proceed
    setShowValidationWarning(false);
    setValidationErrorMessage('');

    if (currentStep === 1) {
      // Trigger validation for PackageDetailsStep
      if (packageStepValidationRef.current) {
        const isValid = await packageStepValidationRef.current.triggerValidation();
        if (!isValid) {
          setShowValidationWarning(true);
          setValidationErrorMessage('Please correct the package details before continuing.');
          return; // Block navigation
        }
      }
    } else if (currentStep === 2) {
      // Trigger validation for AddressStep via Server Action
      if (addressStepValidationRef.current) {
        // Construct FormData for both origin and destination from current formData state
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
          return; // Block navigation
        }
      }
    }

    // If the current step is valid, proceed to the next
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as FormStep);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as FormStep);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Shipping Rate Calculator</h1>
      <p className="text-gray-600 mb-8">
        Calculate shipping rates across multiple carriers in 4 simple steps
      </p>

      <div className="min-h-[400px] p-6 border rounded-lg border-gray-200">
        {/* Unit conversion handled in child inputs on unit toggle */}
        {/* Validation Warning */}
        {showValidationWarning && validationErrorMessage && (
          <div
            role="alert"
            className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 animate-fadeIn"
          >
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-amber-800">{validationErrorMessage}</p>
                <p className="text-sm text-amber-700 mt-1">
                  Please fill in all required fields and correct any errors.
                </p>
              </div>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <PackageDetailsStep
            data={formData.package}
            onChange={handlePackageChange}
            onValidationChange={handlePackageStepValidationChange} // Pass callback to update step validity
            onTriggerValidation={(validateFn) => {
              packageStepValidationRef.current = { triggerValidation: validateFn };
            }}
          />
        )}

        {currentStep === 2 && (
          <AddressStep
            origin={formData.origin}
            destination={formData.destination}
            onOriginChange={handleOriginChange}
            onDestinationChange={handleDestinationChange}
            onValidationChange={handleAddressStepValidationChange} // Pass callback to update address validity
            // The onTriggerValidation prop for AddressStep now expects two FormData objects
            onTriggerValidation={(
              validateOriginAndDestination: (
                originFormData: FormData,
                destinationFormData: FormData
              ) => Promise<{ origin: boolean; destination: boolean }>
            ) => {
              addressStepValidationRef.current = {
                triggerValidation: validateOriginAndDestination,
              };
            }}
          />
        )}

        {currentStep === 3 && (
          <ShippingOptionsStep
            data={formData.options}
            carriersFilter={carriersFilter}
            onChange={handleOptionsChange}
            onCarriersFilterChange={setCarriersFilter}
          />
        )}

        {currentStep === 4 && (
          <ReviewStep
            formData={formData}
            onEditStep={setCurrentStep}
            onSubmit={() => void handleSubmit()}
            isSubmitting={isSubmitting}
          />
        )}
      </div>

      {currentStep === 4 ? (
        <div className="mt-10 pt-8 border-t border-gray-200">
          <div className="flex justify-between">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Back
                </button>
              )}
            </div>

            <div />
          </div>
        </div>
      ) : (
        <FormNavigation
          currentStep={currentStep}
          totalSteps={4}
          onPrevious={prevStep}
          onNext={nextStep}
          nextButtonText={'Next'}
          previousButtonText="Back"
          showStepLabels={true}
        />
      )}
    </div>
  );
}
