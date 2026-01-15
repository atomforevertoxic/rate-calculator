'use client';

import { useState } from 'react';

type FormStep = 1 | 2 | 3 | 4;

export default function RateCalculatorForm() {
  const [currentStep, setCurrentStep] = useState<FormStep>(1);

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
          <div>
            <h2 className="text-xl font-semibold mb-4">Step 1: Package Details</h2>
            <p className="text-gray-600">Package details form will be here</p>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Step 2: Origin & Destination</h2>
            <p className="text-gray-600">Address forms will be here</p>
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Step 3: Shipping Options</h2>
            <p className="text-gray-600">Shipping options will be here</p>
          </div>
        )}

        {currentStep === 4 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Step 4: Review & Submit</h2>
            <p className="text-gray-600">Review and submit will be here</p>
          </div>
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
