import { Address } from '@/src/types/domain';
import { BaseValidator } from '../BaseValidator';
import { ValidationResult } from '../validation-chain';

export class RequiredFieldsValidator extends BaseValidator<Address> {
  protected doValidation(data: Address): ValidationResult {
    const requiredFields: Array<keyof Address> = [
      'name',
      'street1',
      'city',
      'state',
      'postalCode',
      'country',
    ];

    for (const field of requiredFields) {
      const value = data[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        return this.createErrorResult(
          field,
          `${this.formatFieldName(field)} is required`,
          'REQUIRED_FIELD'
        );
      }
    }

    return this.createSuccessResult();
  }

  private formatFieldName(field: string): string {
    const names: Record<string, string> = {
      name: 'Name',
      street1: 'Street address',
      city: 'City',
      state: 'State',
      postalCode: 'Postal code',
      country: 'Country',
    };
    return names[field] || field;
  }
}
