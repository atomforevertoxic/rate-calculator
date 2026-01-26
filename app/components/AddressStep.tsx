'use client';

import { createAddressValidationChain, validateWithChain } from '@/src/services/validators';
import { Address } from '@/src/types/domain';
import { useState } from 'react';
import { AddressForm } from './forms/AddressForm';

interface AddressStepProps {
  origin: Address;
  destination: Address;
  onOriginChange: (data: Partial<Address>) => void;
  onDestinationChange: (data: Partial<Address>) => void;
}

export function AddressStep({
  origin,
  destination,
  onOriginChange,
  onDestinationChange,
}: AddressStepProps) {
  const [localOrigin, setLocalOrigin] = useState<Address>(origin);
  const [localDestination, setLocalDestination] = useState<Address>(destination);

  const handleOriginChange = async (field: keyof Address, value: string) => {
    const updated = { ...localOrigin, [field]: value };
    setLocalOrigin(updated);
    onOriginChange({ [field]: value });

    const validator = createAddressValidationChain();
    const result = await validateWithChain(updated, validator);

    if (!result.isValid) {
      console.log('Address validation errors:', result.errors);
    }
  };

  const handleDestinationChange = async (field: keyof Address, value: string) => {
    const updated = { ...localDestination, [field]: value };
    setLocalDestination(updated);
    onDestinationChange({ [field]: value });

    const validator = createAddressValidationChain();
    const result = await validateWithChain(updated, validator);

    if (!result.isValid) {
      console.log('Destination validation errors:', result.errors);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-gray-900">Step 2: Origin & Destination</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <AddressForm title="Origin Address" address={localOrigin} onChange={handleOriginChange} />

        <AddressForm
          title="Destination Address"
          address={localDestination}
          onChange={handleDestinationChange}
        />
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
