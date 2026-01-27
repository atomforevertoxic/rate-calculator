'use client';

import { Address, Package, ShippingOptions } from '@/src/types/domain';
import { format } from 'date-fns';
import { SubmitButton } from './forms/controls/SubmitButton';

interface ReviewStepProps {
  formData: {
    package: Package;
    origin: Address;
    destination: Address;
    options: ShippingOptions;
  };
  onEditStep: (step: 1 | 2 | 3) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export function ReviewStep({
  formData,
  onEditStep,
  onSubmit,
  isSubmitting = false,
}: ReviewStepProps) {
  const formatCurrency = (amount?: number) => {
    if (!amount) {
      return 'Not specified';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDimensions = (dimensions: Package['dimensions']) => {
    return `${dimensions.length} × ${dimensions.width} × ${dimensions.height} ${dimensions.unit}`;
  };

  const formatWeight = (weight: Package['weight']) => {
    return `${weight.value} ${weight.unit}`;
  };

  const getServiceSpeedLabel = (speed: ShippingOptions['speed']) => {
    const labels: Record<ShippingOptions['speed'], string> = {
      overnight: 'Overnight (1-2 days)',
      'two-day': '2-Day (2-3 days)',
      standard: 'Standard (3-7 days)',
      economy: 'Economy (5-10 days)',
      all: 'All services',
    };
    return labels[speed];
  };

  const getEnabledServices = (options: ShippingOptions) => {
    const services = [];
    if (options.signatureRequired) {
      services.push('Signature Required');
    }
    if (options.insurance) {
      services.push(`Insurance: ${formatCurrency(options.insuredValue)}`);
    }
    if (options.fragileHandling) {
      services.push('Fragile Handling');
    }
    if (options.saturdayDelivery) {
      services.push('Saturday Delivery');
    }
    return services.length > 0 ? services : ['None'];
  };

  const calculateEstimatedDelivery = () => {
    const today = new Date();
    const daysToAdd: Record<ShippingOptions['speed'], number> = {
      overnight: 2,
      'two-day': 3,
      standard: 7,
      economy: 10,
      all: 7,
    };

    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + daysToAdd[formData.options.speed]);

    return format(deliveryDate, 'MMMM d, yyyy');
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Step 4: Review & Submit</h2>
        <p className="text-gray-600">
          Please review all information below. Click{' '}
          <button
            type="button"
            onClick={() => onEditStep(1)}
            className="text-blue-600 hover:text-blue-800 underline font-medium"
          >
            Edit
          </button>{' '}
          on any section to make changes.
        </p>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-medium text-gray-900">Package Details</h3>
          <button
            type="button"
            onClick={() => onEditStep(1)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Edit
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Package Type</h4>
              <p className="text-gray-900">
                {formData.package.type.charAt(0).toUpperCase() + formData.package.type.slice(1)}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Dimensions</h4>
              <p className="text-gray-900">{formatDimensions(formData.package.dimensions)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Weight</h4>
              <p className="text-gray-900">{formatWeight(formData.package.weight)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Declared Value</h4>
              <p className="text-gray-900">{formatCurrency(formData.package.declaredValue)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-medium text-gray-900">Addresses</h3>
          <button
            type="button"
            onClick={() => onEditStep(2)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Edit
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">Origin</h4>
              <div className="space-y-1">
                <p className="text-gray-900 font-medium">{formData.origin.name}</p>
                <p className="text-gray-900">{formData.origin.street1}</p>
                {formData.origin.street2 && (
                  <p className="text-gray-900">{formData.origin.street2}</p>
                )}
                <p className="text-gray-900">
                  {formData.origin.city}, {formData.origin.state} {formData.origin.postalCode}
                </p>
                <p className="text-gray-900">{formData.origin.country}</p>
                {formData.origin.phone && <p className="text-gray-900">{formData.origin.phone}</p>}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">Destination</h4>
              <div className="space-y-1">
                <p className="text-gray-900 font-medium">{formData.destination.name}</p>
                <p className="text-gray-900">{formData.destination.street1}</p>
                {formData.destination.street2 && (
                  <p className="text-gray-900">{formData.destination.street2}</p>
                )}
                <p className="text-gray-900">
                  {formData.destination.city}, {formData.destination.state}{' '}
                  {formData.destination.postalCode}
                </p>
                <p className="text-gray-900">{formData.destination.country}</p>
                {formData.destination.phone && (
                  <p className="text-gray-900">{formData.destination.phone}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-medium text-gray-900">Shipping Options</h3>
          <button
            type="button"
            onClick={() => onEditStep(3)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Edit
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Service Speed</h4>
              <p className="text-gray-900">{getServiceSpeedLabel(formData.options.speed)}</p>
              <p className="text-sm text-gray-500 mt-1">
                Estimated delivery: {calculateEstimatedDelivery()}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Additional Services</h4>
              <ul className="space-y-1">
                {getEnabledServices(formData.options).map((service, index) => (
                  <li key={index} className="text-gray-900">
                    • {service}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="font-medium text-blue-900 mb-1">Ready to Calculate Rates</h3>
            <p className="text-sm text-blue-700">
              Click &quot;Calculate Rates&quot; to compare prices from multiple carriers.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <SubmitButton
              onClick={onSubmit}
              variant="primary"
              loadingText="Calculating rates..."
              disabled={isSubmitting}
              pending={isSubmitting}
            >
              Calculate Rates
            </SubmitButton>
            <button
              type="button"
              onClick={() => onEditStep(1)}
              className="px-8 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Start Over
            </button>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-blue-200">
          <h4 className="text-sm font-medium text-blue-900 mb-3">What happens next?</h4>
          <ul className="text-sm text-blue-700 space-y-2">
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>We&apos;ll calculate rates from FedEx, UPS, and other carriers</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>
                You&apos;ll see a comparison of prices, delivery times, and service options
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>No payment required until you select a carrier and create shipment</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
