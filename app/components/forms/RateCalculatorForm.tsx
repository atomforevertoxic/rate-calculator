'use client';

import { Address, CarrierName, Package, ShippingOptions } from '@/src/types/domain';
import { useState } from 'react';
import { AddressStep } from '../AddressStep';
import { PackageDetailsStep } from '../PackageDetailsStep';
import { ReviewStep } from '../ReviewStep';
import { ShippingOptionsStep } from '../ShippingOptionsStep';

type FormStep = 1 | 2 | 3 | 4;

interface FormData {
  package: Package;
  origin: Address;
  destination: Address;
  options: ShippingOptions;
}

export default function RateCalculatorForm() {
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

      <div className="flex justify-between mb-8">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`flex flex-col items-center ${
              step === currentStep ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                step === currentStep ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
              }`}
            >
              {step}
            </div>
            <span className="text-sm mt-2">
              {step === 1 && 'Package'}
              {step === 2 && 'Address'}
              {step === 3 && 'Options'}
              {step === 4 && 'Review'}
            </span>
          </div>
        ))}
      </div>

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
            onSubmit={() => {
              // Здесь будет вызов API для расчета стоимости
              console.log('Submitting form for rate calculation:', formData);
              alert(
                'Rate calculation would be triggered here. In Phase 3, this will call real carrier APIs.'
              );
            }}
          />
        )}
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className={`px-6 py-2 rounded-lg ${
            currentStep === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Previous
        </button>

        <button
          onClick={nextStep}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {currentStep === 4 ? 'Calculate Rates' : 'Next'}
        </button>
      </div>
    </div>
  );
}
