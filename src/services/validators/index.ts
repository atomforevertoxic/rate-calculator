import { Address, Package } from '@/src/types/domain';
import { Validator } from './validation-chain';

import { PostalCodeFormatValidator } from './address/PostalCodeFormatValidator';
import { RequiredFieldsValidator } from './address/RequiredFieldsValidator';
import { StateCodeValidator } from './address/StateCodeValidator';
import { DimensionsValidator } from './package/DimensionsValidator';
import { WeightValidator } from './package/WeightValidator';

export function createAddressValidationChain(): Validator<Address> {
  const requiredFields = new RequiredFieldsValidator();
  const postalCodeFormat = new PostalCodeFormatValidator();
  const stateCode = new StateCodeValidator();

  requiredFields.setNext(postalCodeFormat).setNext(stateCode);

  return requiredFields;
}

export function createPackageValidationChain(): Validator<Package> {
  const dimensions = new DimensionsValidator();
  const weight = new WeightValidator();

  dimensions.setNext(weight);

  return dimensions;
}

export async function validateWithChain<T>(
  data: T,
  validator: Validator<T>
): Promise<{ isValid: boolean; errors: Array<{ field: string; message: string; code: string }> }> {
  try {
    const result = validator.validate(data);
    return {
      isValid: result.isValid,
      errors: result.errors,
    };
  } catch (error) {
    console.error('Validation error:', error);
    return {
      isValid: false,
      errors: [
        {
          field: 'system',
          message: 'Validation system error',
          code: 'VALIDATION_ERROR',
        },
      ],
    };
  }
}
