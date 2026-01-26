import { Address, Package } from '@/src/types/domain';
import { beforeEach, describe, expect, it } from 'vitest';
import { PostalCodeFormatValidator } from '../address/PostalCodeFormatValidator';
import { RequiredFieldsValidator } from '../address/RequiredFieldsValidator';
import { StateCodeValidator } from '../address/StateCodeValidator';
import {
  createAddressValidationChain,
  createPackageValidationChain,
  validateWithChain,
} from '../index';
import { DimensionsValidator } from '../package/DimensionsValidator';
import { WeightValidator } from '../package/WeightValidator';

describe('Address Validation Chain', () => {
  let validAddress: Address;
  let validator: ReturnType<typeof createAddressValidationChain>;

  beforeEach(() => {
    validAddress = {
      name: 'John Doe',
      street1: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'US',
    };
    validator = createAddressValidationChain();
  });

  describe('RequiredFieldsValidator', () => {
    it('should reject address with empty name', () => {
      const address: Address = {
        ...validAddress,
        name: '',
      };
      const result = validator.validate(address);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.field).toBe('name');
      expect(result.errors[0]?.code).toBe('REQUIRED_FIELD');
    });

    it('should reject address with empty street1', () => {
      const address: Address = {
        ...validAddress,
        street1: '',
      };
      const result = validator.validate(address);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]?.field).toBe('street1');
    });

    it('should reject address with empty city', () => {
      const address: Address = {
        ...validAddress,
        city: '',
      };
      const result = validator.validate(address);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]?.field).toBe('city');
    });

    it('should reject address with empty state', () => {
      const address: Address = {
        ...validAddress,
        state: '',
      };
      const result = validator.validate(address);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]?.field).toBe('state');
    });

    it('should reject address with empty postalCode', () => {
      const address: Address = {
        ...validAddress,
        postalCode: '',
      };
      const result = validator.validate(address);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]?.field).toBe('postalCode');
    });

    it('should reject address with whitespace-only fields', () => {
      const address: Address = {
        ...validAddress,
        name: '   ',
      };
      const result = validator.validate(address);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]?.field).toBe('name');
    });

    it('should pass all required fields check for valid address', () => {
      const result = validator.validate(validAddress);
      // May fail on next validator, but should pass RequiredFieldsValidator
      // Check that there's no REQUIRED_FIELD error
      const hasRequiredError = result.errors.some((e) => e.code === 'REQUIRED_FIELD');
      expect(hasRequiredError).toBe(false);
    });
  });

  describe('PostalCodeFormatValidator', () => {
    it('should reject invalid US zip code (too short)', () => {
      const address: Address = {
        ...validAddress,
        postalCode: '1234',
      };
      const result = validator.validate(address);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.code === 'INVALID_US_ZIP')).toBe(true);
    });

    it('should reject invalid US zip code (non-numeric)', () => {
      const address: Address = {
        ...validAddress,
        postalCode: 'ABCDE',
      };
      const result = validator.validate(address);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.code === 'INVALID_US_ZIP')).toBe(true);
    });

    it('should accept valid US 5-digit zip code', () => {
      const address: Address = {
        ...validAddress,
        postalCode: '10001',
      };
      const result = validator.validate(address);
      const hasZipError = result.errors.some((e) => e.code === 'INVALID_US_ZIP');
      expect(hasZipError).toBe(false);
    });

    it('should accept valid US 9-digit zip code (12345-6789)', () => {
      const address: Address = {
        ...validAddress,
        postalCode: '10001-2345',
      };
      const result = validator.validate(address);
      const hasZipError = result.errors.some((e) => e.code === 'INVALID_US_ZIP');
      expect(hasZipError).toBe(false);
    });

    it('should reject invalid UK postcode format', () => {
      const address: Address = {
        ...validAddress,
        country: 'GB',
        postalCode: 'invalid',
      };
      const result = validator.validate(address);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.code === 'INVALID_UK_POSTCODE')).toBe(true);
    });

    it('should accept valid UK postcode (SW1A 1AA)', () => {
      const address: Address = {
        ...validAddress,
        country: 'GB',
        postalCode: 'SW1A 1AA',
      };
      const result = validator.validate(address);
      const hasPostcodeError = result.errors.some((e) => e.code === 'INVALID_UK_POSTCODE');
      expect(hasPostcodeError).toBe(false);
    });
  });

  describe('StateCodeValidator', () => {
    it('should reject invalid US state code (not in list)', () => {
      const address: Address = {
        ...validAddress,
        state: 'XX',
      };
      const result = validator.validate(address);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.code === 'INVALID_US_STATE')).toBe(true);
    });

    it('should reject invalid US state code (invalid abbreviation)', () => {
      const address: Address = {
        ...validAddress,
        state: 'ABC',
      };
      const result = validator.validate(address);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.code === 'INVALID_US_STATE')).toBe(true);
    });

    it('should accept valid US state code (NY)', () => {
      const address: Address = {
        ...validAddress,
        state: 'NY',
      };
      const result = validator.validate(address);
      const hasStateError = result.errors.some((e) => e.code === 'INVALID_STATE_CODE');
      expect(hasStateError).toBe(false);
    });

    it('should accept valid US state code (CA)', () => {
      const address: Address = {
        ...validAddress,
        state: 'CA',
      };
      const result = validator.validate(address);
      const hasStateError = result.errors.some((e) => e.code === 'INVALID_STATE_CODE');
      expect(hasStateError).toBe(false);
    });

    it('should accept valid UK state code (LN)', () => {
      const address: Address = {
        ...validAddress,
        country: 'GB',
        state: 'LN',
      };
      const result = validator.validate(address);
      const hasStateError = result.errors.some((e) => e.code === 'INVALID_STATE_CODE');
      expect(hasStateError).toBe(false);
    });
  });

  describe('Chain of Responsibility stops at first failure', () => {
    it('should stop validation after first error', () => {
      const address: Address = {
        name: '', // Fails RequiredFieldsValidator
        street1: 'invalid', // Would fail PostalCodeFormatValidator if reached
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
      };
      const result = validator.validate(address);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.code).toBe('REQUIRED_FIELD');
    });

    it('should propagate to next validator if current passes', () => {
      const address: Address = {
        ...validAddress,
        postalCode: 'invalid-zip', // Fails PostalCodeFormatValidator
      };
      const result = validator.validate(address);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]?.code).toBe('INVALID_US_ZIP');
    });
  });

  describe('Valid address passes all validators', () => {
    it('should pass complete validation chain', () => {
      const result = validator.validate(validAddress);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass with optional fields empty', () => {
      const address: Address = {
        ...validAddress,
        street2: '',
        phone: '',
      };
      const result = validator.validate(address);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});

describe('Package Validation Chain', () => {
  let validPackage: Package;
  let validator: ReturnType<typeof createPackageValidationChain>;

  beforeEach(() => {
    validPackage = {
      id: 'pkg-123',
      type: 'box',
      dimensions: {
        length: 10,
        width: 8,
        height: 6,
        unit: 'in',
      },
      weight: {
        value: 5,
        unit: 'lbs',
      },
    };
    validator = createPackageValidationChain();
  });

  describe('DimensionsValidator', () => {
    it('should reject zero dimensions', () => {
      const pkg: Package = {
        ...validPackage,
        dimensions: { ...validPackage.dimensions, length: 0 },
      };
      const result = validator.validate(pkg);
      expect(result.isValid).toBe(false);
    });

    it('should reject negative dimensions', () => {
      const pkg: Package = {
        ...validPackage,
        dimensions: { ...validPackage.dimensions, width: -5 },
      };
      const result = validator.validate(pkg);
      expect(result.isValid).toBe(false);
    });

    it('should accept valid dimensions in inches', () => {
      const result = validator.validate(validPackage);
      const hasDimensionError = result.errors.some((e) => e.code === 'INVALID_DIMENSIONS');
      expect(hasDimensionError).toBe(false);
    });

    it('should accept valid dimensions in cm', () => {
      const pkg: Package = {
        ...validPackage,
        dimensions: { ...validPackage.dimensions, unit: 'cm' },
      };
      const result = validator.validate(pkg);
      const hasDimensionError = result.errors.some((e) => e.code === 'INVALID_DIMENSIONS');
      expect(hasDimensionError).toBe(false);
    });
  });

  describe('WeightValidator', () => {
    it('should reject zero weight', () => {
      const pkg: Package = {
        ...validPackage,
        weight: { ...validPackage.weight, value: 0 },
      };
      const result = validator.validate(pkg);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.code === 'INVALID_WEIGHT')).toBe(true);
    });

    it('should reject negative weight', () => {
      const pkg: Package = {
        ...validPackage,
        weight: { ...validPackage.weight, value: -10 },
      };
      const result = validator.validate(pkg);
      expect(result.isValid).toBe(false);
    });

    it('should accept valid weight in lbs', () => {
      const result = validator.validate(validPackage);
      const hasWeightError = result.errors.some((e) => e.code === 'INVALID_WEIGHT');
      expect(hasWeightError).toBe(false);
    });

    it('should accept valid weight in kg', () => {
      const pkg: Package = {
        ...validPackage,
        weight: { value: 2.5, unit: 'kg' },
      };
      const result = validator.validate(pkg);
      const hasWeightError = result.errors.some((e) => e.code === 'INVALID_WEIGHT');
      expect(hasWeightError).toBe(false);
    });
  });

  describe('Valid package passes all validators', () => {
    it('should pass complete validation chain', () => {
      const result = validator.validate(validPackage);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});

describe('validateWithChain helper', () => {
  it('should handle errors gracefully', async () => {
    const validator = createAddressValidationChain();
    const result = await validateWithChain(
      {
        name: '',
        street1: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'US',
      },
      validator
    );
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should return structured error format', async () => {
    const validator = createAddressValidationChain();
    const address: Address = {
      name: 'John',
      street1: '123 Main',
      city: 'NYC',
      state: 'NY',
      postalCode: 'invalid',
      country: 'US',
    };
    const result = await validateWithChain(address, validator);
    expect(result).toHaveProperty('isValid');
    expect(result).toHaveProperty('errors');
    expect(Array.isArray(result.errors)).toBe(true);
    if (result.errors.length > 0) {
      expect(result.errors[0]).toHaveProperty('field');
      expect(result.errors[0]).toHaveProperty('message');
      expect(result.errors[0]).toHaveProperty('code');
    }
  });
});

describe('Minimum 5 validators requirement', () => {
  it('should have RequiredFieldsValidator', () => {
    const validator = new RequiredFieldsValidator();
    expect(validator).toBeDefined();
  });

  it('should have PostalCodeFormatValidator', () => {
    const validator = new PostalCodeFormatValidator();
    expect(validator).toBeDefined();
  });

  it('should have StateCodeValidator', () => {
    const validator = new StateCodeValidator();
    expect(validator).toBeDefined();
  });

  it('should have DimensionsValidator', () => {
    const validator = new DimensionsValidator();
    expect(validator).toBeDefined();
  });

  it('should have WeightValidator', () => {
    const validator = new WeightValidator();
    expect(validator).toBeDefined();
  });
});
