// This is a client component
'use client';

import { validateAddress as serverValidateAddress } from '@/src/app/api/validate-address/route';
import { ValidationError } from '@/src/services/validators/validation-chain';
import { Address } from '@/src/types/domain';
import { useActionState, useEffect, useRef, useTransition } from 'react';
import { AddressForm } from './forms/AddressForm';

interface AddressFormState {
  errors: ValidationError[];
}

// Initial state for the form, no errors initially
const initialState: AddressFormState = { errors: [] };

interface AddressStepProps {
  origin: Address;
  destination: Address;
  onOriginChange: (data: Partial<Address>) => void;
  onDestinationChange: (data: Partial<Address>) => void;
  onValidationChange?: (step: 'origin' | 'destination', isValid: boolean) => void;
  // `onTriggerValidation` now expects a function that takes a FormData object and triggers server validation
  onTriggerValidation?: (
    validateFn: (
      originFormData: FormData,
      destinationFormData: FormData
    ) => Promise<{ origin: boolean; destination: boolean }>
  ) => void;
}

export function AddressStep({
  origin,
  destination,
  onOriginChange,
  onDestinationChange,
  onValidationChange,
  onTriggerValidation,
}: AddressStepProps) {
  const [originFormState, originAction] = useActionState(serverValidateAddress, initialState);
  const [destinationFormState, destinationAction] = useActionState(
    serverValidateAddress,
    initialState
  );

  // useTransition for manual form submission (debounced real-time validation)
  const [, startOriginTransition] = useTransition();
  const [, startDestinationTransition] = useTransition();

  // Refs to hold the current form data for server action submission
  const originFormRef = useRef<HTMLFormElement>(null);
  const destinationFormRef = useRef<HTMLFormElement>(null);
  const originChangeDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const destinationChangeDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Effect to notify parent about origin address validation state changes
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange('origin', originFormState.errors.length === 0);
    }
  }, [originFormState.errors, onValidationChange]);

  // Effect to notify parent about destination address validation state changes
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange('destination', destinationFormState.errors.length === 0);
    }
  }, [destinationFormState.errors, onValidationChange]);

  // Effect to expose a method for parent-triggered validation via server action
  useEffect(() => {
    if (onTriggerValidation) {
      onTriggerValidation(async (originFormData, destinationFormData) => {
        // Track when both validations complete
        let originComplete = false;
        let destinationComplete = false;

        // Submit origin form to trigger server validation within a transition
        startOriginTransition(() => {
          originAction(originFormData);
          originComplete = true;
        });

        // Submit destination form to trigger server validation within a transition
        startDestinationTransition(() => {
          destinationAction(destinationFormData);
          destinationComplete = true;
        });

        // Wait for both to complete
        await new Promise((resolve) => {
          const checkCompletion = () => {
            if (originComplete && destinationComplete) {
              resolve(true);
            } else {
              setTimeout(checkCompletion, 50);
            }
          };
          checkCompletion();
        });

        return {
          origin: originFormState.errors.length === 0,
          destination: destinationFormState.errors.length === 0,
        };
      });
    }
  }, [
    onTriggerValidation,
    originAction,
    destinationAction,
    originFormState.errors,
    destinationFormState.errors,
    startOriginTransition,
    startDestinationTransition,
  ]);

  // Handler for origin address changes, with debounced server validation
  const handleOriginChange = (field: keyof Address, value: string) => {
    onOriginChange({ [field]: value });

    if (originChangeDebounceRef.current) {
      clearTimeout(originChangeDebounceRef.current);
    }
    originChangeDebounceRef.current = setTimeout(() => {
      if (originFormRef.current) {
        // Trigger a server action for real-time validation
        // Using startTransition to avoid blocking rendering
        startOriginTransition(() => {
          originAction(new FormData(originFormRef.current ?? undefined));
        });
      }
    }, 500); // Debounce for 500ms
  };

  // Handler for destination address changes, with debounced server validation
  const handleDestinationChange = (field: keyof Address, value: string) => {
    onDestinationChange({ [field]: value });

    if (destinationChangeDebounceRef.current) {
      clearTimeout(destinationChangeDebounceRef.current);
    }
    destinationChangeDebounceRef.current = setTimeout(() => {
      if (destinationFormRef.current) {
        // Trigger a server action for real-time validation
        startDestinationTransition(() => {
          destinationAction(new FormData(destinationFormRef.current ?? undefined));
        });
      }
    }, 500); // Debounce for 500ms
  };

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-gray-900">Step 2: Origin & Destination</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          {/* Form for Origin Address */}
          <form ref={originFormRef} action={originAction} aria-live="polite">
            <AddressForm
              title="Origin Address"
              address={origin}
              onChange={handleOriginChange}
              errors={originFormState.errors}
              formId="origin-address-form"
            />
          </form>
        </div>

        <div>
          {/* Form for Destination Address */}
          <form ref={destinationFormRef} action={destinationAction} aria-live="polite">
            <AddressForm
              title="Destination Address"
              address={destination}
              onChange={handleDestinationChange}
              errors={destinationFormState.errors}
              formId="destination-address-form"
            />
          </form>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <h4 className="font-medium text-gray-700 mb-2">Quick Tips:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Make sure zip/postal codes are correct for accurate rates</li>
          <li>• International addresses may require additional documentation</li>
          <li>• PO Box addresses may have different shipping options</li>
        </ul>
      </div>
    </div>
  );
}
