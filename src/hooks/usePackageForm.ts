import {
  createAddressValidationChain,
  createPackageValidationChain,
  validateWithChain,
} from '@/src/services/validators';
import { Address, Package, RateRequest, ShippingOptions } from '@/src/types/domain';
import { useCallback, useState } from 'react';

interface FormErrors {
  package: Record<string, string[]>;
  origin: Record<string, string[]>;
  destination: Record<string, string[]>;
  options: Record<string, string[]>;
}

interface UsePackageFormProps {
  initialStep?: number;
  initialData?: Partial<RateRequest>;
}

export function usePackageForm({ initialStep = 1, initialData }: UsePackageFormProps = {}) {
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [packageData, setPackageData] = useState<Package>(
    initialData?.package || {
      id: `temp-${Date.now()}`,
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
    }
  );

  const [origin, setOrigin] = useState<Address>(
    initialData?.origin || {
      name: '',
      street1: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US',
    }
  );

  const [destination, setDestination] = useState<Address>(
    initialData?.destination || {
      name: '',
      street1: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US',
    }
  );

  const [options, setOptions] = useState<ShippingOptions>(
    initialData?.options || {
      speed: 'standard',
      signatureRequired: false,
      insurance: false,
      fragileHandling: false,
      saturdayDelivery: false,
    }
  );

  const [carriersFilter, setCarriersFilter] = useState<string[] | undefined>(
    initialData?.carriersFilter
  );
  const [errors, setErrors] = useState<FormErrors>({
    package: {},
    origin: {},
    destination: {},
    options: {},
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updatePackage = useCallback((data: Partial<Package>) => {
    setPackageData((prev) => ({ ...prev, ...data }));

    setErrors((prev) => ({ ...prev, package: {} }));
  }, []);

  const updateOrigin = useCallback((data: Partial<Address>) => {
    setOrigin((prev) => ({ ...prev, ...data }));
    setErrors((prev) => ({ ...prev, origin: {} }));
  }, []);

  const updateDestination = useCallback((data: Partial<Address>) => {
    setDestination((prev) => ({ ...prev, ...data }));
    setErrors((prev) => ({ ...prev, destination: {} }));
  }, []);

  const updateOptions = useCallback((data: Partial<ShippingOptions>) => {
    setOptions((prev) => ({ ...prev, ...data }));
    setErrors((prev) => ({ ...prev, options: {} }));
  }, []);

  const updateCarriersFilter = useCallback((filter: string[] | undefined) => {
    setCarriersFilter(filter);
  }, []);

  const validateStep = useCallback(
    async (step: number): Promise<boolean> => {
      let isValid = true;
      const newErrors: FormErrors = { package: {}, origin: {}, destination: {}, options: {} };

      switch (step) {
        case 1:
          const packageValidator = createPackageValidationChain();
          const packageResult = await validateWithChain(packageData, packageValidator);

          if (!packageResult.isValid) {
            isValid = false;
            packageResult.errors.forEach((error) => {
              newErrors.package[error.field] = [
                ...(newErrors.package[error.field] || []),
                error.message,
              ];
            });
          }
          break;

        case 2:
          const addressValidator = createAddressValidationChain();

          const originResult = await validateWithChain(origin, addressValidator);
          if (!originResult.isValid) {
            isValid = false;
            originResult.errors.forEach((error) => {
              newErrors.origin[error.field] = [
                ...(newErrors.origin[error.field] || []),
                error.message,
              ];
            });
          }

          const destinationResult = await validateWithChain(destination, addressValidator);
          if (!destinationResult.isValid) {
            isValid = false;
            destinationResult.errors.forEach((error) => {
              newErrors.destination[error.field] = [
                ...(newErrors.destination[error.field] || []),
                error.message,
              ];
            });
          }
          break;

        case 3:
          if (options.insurance && (!options.insuredValue || options.insuredValue < 0)) {
            isValid = false;
            newErrors.options.insuredValue = [
              'Insurance value must be positive when insurance is selected',
            ];
          }
          break;

        default:
          break;
      }

      setErrors(newErrors);
      return isValid;
    },
    [packageData, origin, destination, options]
  );

  const nextStep = useCallback(async (): Promise<boolean> => {
    if (currentStep >= 4) return false;

    const isValid = await validateStep(currentStep);
    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    }
    return isValid;
  }, [currentStep, validateStep]);

  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= 4) {
      setCurrentStep(step);
    }
  }, []);

  const submitForm = useCallback(async (): Promise<RateRequest | null> => {
    setIsSubmitting(true);
    try {
      const isPackageValid = await validateStep(1);
      const isAddressValid = await validateStep(2);
      const isOptionsValid = await validateStep(3);

      if (!isPackageValid || !isAddressValid || !isOptionsValid) {
        console.error('Form validation failed');
        return null;
      }

      const rateRequest: RateRequest = {
        package: packageData,
        origin,
        destination,
        options,
        carriersFilter,
      };

      console.log('Submitting rate request:', rateRequest);

      return rateRequest;
    } catch (error) {
      console.error('Error submitting form:', error);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [packageData, origin, destination, options, carriersFilter, validateStep]);

  const reset = useCallback(() => {
    setCurrentStep(1);
    setPackageData({
      id: `temp-${Date.now()}`,
      type: 'box',
      dimensions: { length: 0, width: 0, height: 0, unit: 'in' },
      weight: { value: 0, unit: 'lbs' },
    });
    setOrigin({
      name: '',
      street1: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US',
    });
    setDestination({
      name: '',
      street1: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US',
    });
    setOptions({
      speed: 'standard',
      signatureRequired: false,
      insurance: false,
      fragileHandling: false,
      saturdayDelivery: false,
    });
    setCarriersFilter(undefined);
    setErrors({ package: {}, origin: {}, destination: {}, options: {} });
  }, []);

  return {
    currentStep,
    packageData,
    origin,
    destination,
    options,
    carriersFilter,
    errors,
    isSubmitting,

    updatePackage,
    updateOrigin,
    updateDestination,
    updateOptions,
    updateCarriersFilter,
    nextStep,
    previousStep,
    goToStep,
    submitForm,
    reset,

    validateStep,
  };
}
