import { Address } from '@/src/types/domain';
import { BaseValidator } from '../BaseValidator';
import { ValidationResult } from '../validation-chain';

export class StateCodeValidator extends BaseValidator<Address> {
  private readonly usStates = new Set([
    'AL',
    'AK',
    'AZ',
    'AR',
    'CA',
    'CO',
    'CT',
    'DE',
    'FL',
    'GA',
    'HI',
    'ID',
    'IL',
    'IN',
    'IA',
    'KS',
    'KY',
    'LA',
    'ME',
    'MD',
    'MA',
    'MI',
    'MN',
    'MS',
    'MO',
    'MT',
    'NE',
    'NV',
    'NH',
    'NJ',
    'NM',
    'NY',
    'NC',
    'ND',
    'OH',
    'OK',
    'OR',
    'PA',
    'RI',
    'SC',
    'SD',
    'TN',
    'TX',
    'UT',
    'VT',
    'VA',
    'WA',
    'WV',
    'WI',
    'WY',
  ]);

  protected doValidation(data: Address): ValidationResult {
    const { state, country } = data;

    if (!state) {
      return this.createSuccessResult();
    }

    const upperState = state.toUpperCase();
    const upperCountry = country.toUpperCase();

    if (upperCountry === 'US') {
      if (!this.usStates.has(upperState)) {
        return this.createErrorResult(
          'state',
          'Invalid US state code. Use 2-letter abbreviation (e.g., CA, NY, TX)',
          'INVALID_US_STATE'
        );
      }
    }

    if (upperCountry === 'GB') {
      const validUkCodes = new Set(['ENG', 'SCT', 'WLS', 'NIR', 'LND']);

      if (!validUkCodes.has(upperState)) {
        return this.createErrorResult(
          'state',
          'Invalid UK region code. Use: ENG (England), SCT (Scotland), WLS (Wales), NIR (Northern Ireland), LND (London)',
          'INVALID_UK_REGION'
        );
      }
    }

    if (!['US', 'GB'].includes(upperCountry) && state.trim().length === 0) {
      return this.createErrorResult('state', 'State/Region is required', 'REQUIRED_STATE');
    }

    return this.createSuccessResult();
  }
}
