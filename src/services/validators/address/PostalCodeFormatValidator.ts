import { Address } from '@/src/types/domain';
import { BaseValidator } from '../BaseValidator';
import { ValidationResult } from '../validation-chain';

export class PostalCodeFormatValidator extends BaseValidator<Address> {
  protected doValidation(data: Address): ValidationResult {
    const { postalCode, country } = data;

    if (!postalCode) {
      return this.createSuccessResult();
    }

    const upperCountry = country.toUpperCase();

    switch (upperCountry) {
      case 'US':
        if (!/^\d{5}(-\d{4})?$/.test(postalCode)) {
          return this.createErrorResult(
            'postalCode',
            'US ZIP code must be 5 digits or 9 digits with dash (12345 or 12345-6789)',
            'INVALID_US_ZIP'
          );
        }
        break;

      case 'GB':
        if (!/^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i.test(postalCode)) {
          return this.createErrorResult(
            'postalCode',
            'UK postcode must be in valid format (e.g., SW1A 1AA, M1 1AA, B33 8TH)',
            'INVALID_UK_POSTCODE'
          );
        }
        break;

      default:
        if (postalCode.trim().length === 0) {
          return this.createErrorResult('postalCode', 'Postal code is required', 'INVALID_POSTAL');
        }
    }

    return this.createSuccessResult();
  }
}
