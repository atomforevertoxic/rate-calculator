// This is a client component
'use client';

import { ValidationError } from '@/src/services/validators/validation-chain';
import { Address } from '@/src/types/domain';

interface AddressFormProps {
  title: string;
  address: Address;
  onChange: (field: keyof Address, value: string) => void;
  errors?: ValidationError[]; // Validation errors from server action
  formId: string; // Unique ID for the form for ARIA attributes
}

export function AddressForm({ title, address, onChange, errors = [], formId }: AddressFormProps) {
  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
  ];

  // Helper to get errors for a specific field
  const getFieldErrors = (fieldName: string) => {
    // It considers both direct field errors and nested errors like 'dimensions.length'
    return errors.filter((err) => err.field === fieldName || err.field.startsWith(`${fieldName}.`));
  };

  // Renders error messages for a given field
  const renderError = (fieldName: keyof Address) => {
    const fieldErrors = getFieldErrors(fieldName);
    if (fieldErrors.length === 0) return null;

    const errorId = `${formId}-${fieldName}-error`;

    return (
      <div id={errorId} role="alert" className="mt-1 text-sm text-red-600">
        {fieldErrors.map((err, index) => (
          <p key={index}>{err.message}</p>
        ))}
      </div>
    );
  };

  // Determines the border class for an input based on validation errors
  const getBorderClass = (fieldName: keyof Address) => {
    return getFieldErrors(fieldName).length > 0 ? 'border-red-500 pr-10' : 'border-gray-300';
  };

  // Generates unique id for input field, crucial for ARIA attributes
  const generateInputId = (fieldName: keyof Address) => `${formId}-${fieldName}`;

  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>

      <div className="space-y-4">
        {/* Name input */}
        <div>
          <label
            htmlFor={generateInputId('name')}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Name <span aria-hidden="true">*</span>
          </label>
          <input
            type="text"
            id={generateInputId('name')}
            name="name" // Name attribute required for FormData
            value={address.name}
            onChange={(e) => onChange('name', e.target.value)}
            className={`w-full px-3 py-2 border ${getBorderClass('name')} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900`}
            placeholder="John Doe"
            required
            aria-required="true"
            aria-invalid={getFieldErrors('name').length > 0}
            aria-describedby={
              getFieldErrors('name').length > 0 ? `${formId}-name-error` : undefined
            }
          />
          {renderError('name')}
        </div>

        {/* Street Address 1 input */}
        <div>
          <label
            htmlFor={generateInputId('street1')}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Street Address 1 <span aria-hidden="true">*</span>
          </label>
          <input
            type="text"
            id={generateInputId('street1')}
            name="street1" // Name attribute required for FormData
            value={address.street1}
            onChange={(e) => onChange('street1', e.target.value)}
            className={`w-full px-3 py-2 border ${getBorderClass('street1')} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900`}
            placeholder="123 Main St"
            required
            aria-required="true"
            aria-invalid={getFieldErrors('street1').length > 0}
            aria-describedby={
              getFieldErrors('street1').length > 0 ? `${formId}-street1-error` : undefined
            }
          />
          {renderError('street1')}
        </div>

        {/* Street Address 2 input */}
        <div>
          <label
            htmlFor={generateInputId('street2')}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Street Address 2 (Optional)
          </label>
          <input
            type="text"
            id={generateInputId('street2')}
            name="street2" // Name attribute required for FormData
            value={address.street2 || ''}
            onChange={(e) => onChange('street2', e.target.value)}
            className={`w-full px-3 py-2 border ${getBorderClass('street2')} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900`}
            placeholder="Apt 4B, Suite 500"
            aria-invalid={getFieldErrors('street2').length > 0}
            aria-describedby={
              getFieldErrors('street2').length > 0 ? `${formId}-street2-error` : undefined
            }
          />
          {renderError('street2')}
        </div>

        {/* City and State/Province inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor={generateInputId('city')}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              City <span aria-hidden="true">*</span>
            </label>
            <input
              type="text"
              id={generateInputId('city')}
              name="city" // Name attribute required for FormData
              value={address.city}
              onChange={(e) => onChange('city', e.target.value)}
              className={`w-full px-3 py-2 border ${getBorderClass('city')} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900`}
              placeholder="New York"
              required
              aria-required="true"
              aria-invalid={getFieldErrors('city').length > 0}
              aria-describedby={
                getFieldErrors('city').length > 0 ? `${formId}-city-error` : undefined
              }
            />
            {renderError('city')}
          </div>

          <div>
            <label
              htmlFor={generateInputId('state')}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              State/Province <span aria-hidden="true">*</span>
            </label>
            <input
              type="text"
              id={generateInputId('state')}
              name="state" // Name attribute required for FormData
              value={address.state}
              onChange={(e) => onChange('state', e.target.value)}
              className={`w-full px-3 py-2 border ${getBorderClass('state')} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900`}
              placeholder="NY"
              required
              aria-required="true"
              aria-invalid={getFieldErrors('state').length > 0}
              aria-describedby={
                getFieldErrors('state').length > 0 ? `${formId}-state-error` : undefined
              }
            />
            {renderError('state')}
          </div>
        </div>

        {/* Postal Code and Country inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor={generateInputId('postalCode')}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Postal Code <span aria-hidden="true">*</span>
            </label>
            <input
              type="text"
              id={generateInputId('postalCode')}
              name="postalCode" // Name attribute required for FormData
              value={address.postalCode}
              onChange={(e) => onChange('postalCode', e.target.value)}
              className={`w-full px-3 py-2 border ${getBorderClass('postalCode')} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900`}
              placeholder="10001"
              required
              aria-required="true"
              aria-invalid={getFieldErrors('postalCode').length > 0}
              aria-describedby={
                getFieldErrors('postalCode').length > 0 ? `${formId}-postalCode-error` : undefined
              }
            />
            {renderError('postalCode')}
          </div>

          <div>
            <label
              htmlFor={generateInputId('country')}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Country <span aria-hidden="true">*</span>
            </label>
            <select
              id={generateInputId('country')}
              name="country" // Name attribute required for FormData
              value={address.country}
              onChange={(e) => onChange('country', e.target.value)}
              className={`w-full px-3 py-2 border ${getBorderClass('country')} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white`}
              aria-required="true"
              aria-invalid={getFieldErrors('country').length > 0}
              aria-describedby={
                getFieldErrors('country').length > 0 ? `${formId}-country-error` : undefined
              }
            >
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
            {renderError('country')}
          </div>
        </div>

        {/* Phone input */}
        <div>
          <label
            htmlFor={generateInputId('phone')}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Phone (Optional)
          </label>
          <input
            type="tel"
            id={generateInputId('phone')}
            name="phone" // Name attribute required for FormData
            value={address.phone || ''}
            onChange={(e) => onChange('phone', e.target.value)}
            className={`w-full px-3 py-2 border ${getBorderClass('phone')} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900`}
            placeholder="+1 (555) 123-4567"
            aria-invalid={getFieldErrors('phone').length > 0}
            aria-describedby={
              getFieldErrors('phone').length > 0 ? `${formId}-phone-error` : undefined
            }
          />
          {renderError('phone')}
        </div>
      </div>
    </div>
  );
}
