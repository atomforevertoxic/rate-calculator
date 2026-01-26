// This is a client component
'use client';

import { useEffect, useRef, useTransition } from 'react';
import { Address } from '@/src/types/domain';
import { AddressForm } from './forms/AddressForm';
import { useFormState } from 'react-dom';
import { validateAddress as serverValidateAddress } from '@/src/app/api/validate-address/route';
import { ValidationError } from '@/src/services/validators/validation-chain';

// Define the state structure for useFormState
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
      destinationFormData: FormData,
    ) => Promise<{ origin: boolean; destination: boolean }>,
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
  // useFormState hook to manage the state after server action submission for origin address
  const [originFormState, originAction] = useFormState(serverValidateAddress, initialState);
  // useFormState hook to manage the state after server action submission for destination address
  const [destinationFormState, destinationAction] = useFormState(serverValidateAddress, initialState);

  // useTransition for manual form submission (debounced real-time validation)
  const [isOriginPending, startOriginTransition] = useTransition();
  const [isDestinationPending, startDestinationTransition] = useTransition();

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
        // Submit origin form to trigger server validation
        void originAction(originFormData);
        // Submit destination form to trigger server validation
        void destinationAction(destinationFormData);

        // The `useFormState` hook updates asynchronously. 
        // We need a mechanism to wait for its state to reflect the latest submission. 
        // A simple setTimeout is used here for demonstration, but a more robust solution 
        // would involve custom hooks that combine `useFormStatus` and `useFormState` 
        // to return completion promises from the action.
        await new Promise((resolve) => setTimeout(resolve, 300)); 

        return {
          origin: originFormState.errors.length === 0,
          destination: destinationFormState.errors.length === 0,
        };
      });
    }
  }, [onTriggerValidation, originAction, destinationAction, originFormState.errors, destinationFormState.errors]);

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
          originAction(new FormData(originFormRef.current));
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
          destinationAction(new FormData(destinationFormRef.current));
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
              isPending={isOriginPending} // Use useTransition pending state
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
              isPending={isDestinationPending} // Use useTransition pending state
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
