'use client';

interface FormNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  isNextDisabled?: boolean;
  nextButtonText?: string;
  previousButtonText?: string;
  showStepLabels?: boolean;
}

export function FormNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  isNextDisabled = false,
  nextButtonText = 'Continue',
  previousButtonText = 'Back',
  showStepLabels = true,
}: FormNavigationProps) {
  const stepLabels = ['Package Details', 'Addresses', 'Shipping Options', 'Review & Submit'];

  const getStepProgress = () => {
    return (currentStep / totalSteps) * 100;
  };

  return (
    <div className="mt-10 pt-8 border-t border-gray-200">
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm text-gray-500">{Math.round(getStepProgress())}% complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getStepProgress()}%` }}
          />
        </div>

        {showStepLabels && (
          <div className="flex justify-between mt-3">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`text-xs font-medium ${
                  index + 1 <= currentStep ? 'text-blue-600' : 'text-gray-400'
                }`}
                style={{ width: `${100 / totalSteps}%` }}
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                      index + 1 < currentStep
                        ? 'bg-blue-600 text-white'
                        : index + 1 === currentStep
                          ? 'bg-blue-100 text-blue-600 border-2 border-blue-600'
                          : 'bg-gray-100 text-gray-400 border-2 border-gray-300'
                    }`}
                  >
                    {index + 1 < currentStep ? '✓' : index + 1}
                  </div>
                  <span className="text-center">{stepLabels[index] || `Step ${index + 1}`}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <div>
          {currentStep > 1 && (
            <button
              type="button"
              onClick={onPrevious}
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
              {previousButtonText}
            </button>
          )}
        </div>

        <div>
          <button
            type="button"
            onClick={onNext}
            disabled={isNextDisabled}
            className={`px-8 py-3 font-medium rounded-lg transition-colors flex items-center gap-2 ${
              isNextDisabled
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {nextButtonText}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={currentStep === totalSteps ? 'M5 13l4 4L19 7' : 'M9 5l7 7-7 7'}
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
