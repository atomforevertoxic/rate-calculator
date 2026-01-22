'use client';

import { Address, CarrierName, Package, RateRequest, ShippingOptions } from '@/src/types/domain';
import { useState } from 'react';
import { AddressStep } from '../AddressStep';
import { PackageDetailsStep } from '../PackageDetailsStep';
import { ReviewStep } from '../ReviewStep';
import { ShippingOptionsStep } from '../ShippingOptionsStep';
import { FormNavigation } from './controls/FormNavigation';

type FormStep = 1 | 2 | 3 | 4;

interface FormData {
  package: Package;
  origin: Address;
  destination: Address;
  options: ShippingOptions;
}

export default function RateCalculatorForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [carriersFilter, setCarriersFilter] = useState<CarrierName[] | undefined>();
  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [formData, setFormData] = useState<FormData>({
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

      console.log('Submitting RateRequest:', rateRequest);
      // Здесь будет вызов API

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

  const nextStep = () => {
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
        {currentStep === 1 && (
          <PackageDetailsStep data={formData.package} onChange={handlePackageChange} />
        )}

        {currentStep === 2 && (
          <AddressStep
            origin={formData.origin}
            destination={formData.destination}
            onOriginChange={handleOriginChange}
            onDestinationChange={handleDestinationChange}
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
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </div>

      <FormNavigation
        currentStep={currentStep}
        totalSteps={4}
        onPrevious={prevStep}
        onNext={nextStep}
        nextButtonText={currentStep === 4 ? 'Calculate Rates' : 'Next'}
        previousButtonText="Back"
        showStepLabels={true}
      />
    </div>
  );
}
