import { CarrierCredentials } from '@/src/config/carrier-config';
import { RateRequest } from '@/src/types/domain';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FedExAdapter } from '../FedExAdapter';

describe('FedExAdapter', () => {
  let adapter: FedExAdapter;
  const mockCredentials: CarrierCredentials = {
    apiKey: 'test-key',
    apiSecret: 'test-secret',
    endpoint: 'https://apis-sandbox.fedex.com',
    timeout: 5000,
    accountNumber: '123456789',
  };

  beforeEach(() => {
    adapter = new FedExAdapter(mockCredentials);
    // Mock fetch to avoid real API calls
    global.fetch = vi.fn();
  });

  describe('Service Type to Speed Mapping', () => {
    it('should map FEDEX_INTERNATIONAL_FIRST to overnight', () => {
      // @ts-expect-error - accessing private method
      const speed = adapter['mapServiceTypeToSpeed']('FEDEX_INTERNATIONAL_FIRST');
      expect(speed).toBe('overnight');
    });

    it('should map PRIORITY_OVERNIGHT to overnight', () => {
      // @ts-expect-error - accessing private method
      const speed = adapter['mapServiceTypeToSpeed']('PRIORITY_OVERNIGHT');
      expect(speed).toBe('overnight');
    });

    it('should map FEDEX_2_DAY to two-day', () => {
      // @ts-expect-error - accessing private method
      const speed = adapter['mapServiceTypeToSpeed']('FEDEX_2_DAY');
      expect(speed).toBe('two-day');
    });

    it('should map FEDEX_GROUND to standard', () => {
      // @ts-expect-error - accessing private method
      const speed = adapter['mapServiceTypeToSpeed']('FEDEX_GROUND');
      expect(speed).toBe('standard');
    });

    it('should map FEDEX_EXPRESS_SAVER to standard', () => {
      // @ts-expect-error - accessing private method
      const speed = adapter['mapServiceTypeToSpeed']('FEDEX_EXPRESS_SAVER');
      expect(speed).toBe('standard');
    });

    it('should map unknown service to economy', () => {
      // @ts-expect-error - accessing private method
      const speed = adapter['mapServiceTypeToSpeed']('UNKNOWN_SERVICE');
      expect(speed).toBe('economy');
    });
  });

  describe('Rate Request Building', () => {
    it('should build valid FedEx rate request with dimensions in inches', () => {
      const request: RateRequest = {
        package: {
          id: 'pkg-1',
          type: 'box',
          dimensions: {
            length: 10,
            width: 8,
            height: 6,
            unit: 'in',
          },
          weight: {
            value: 2,
            unit: 'lbs',
          },
        },
        origin: {
          name: 'John Doe',
          street1: '123 Main St',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'US',
        },
        destination: {
          name: 'Jane Smith',
          street1: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          postalCode: '90001',
          country: 'US',
        },
        options: {
          speed: 'standard',
          signatureRequired: false,
          insurance: false,
          fragileHandling: false,
          saturdayDelivery: false,
        },
        carriersFilter: undefined,
      };

      const fedExRequest = adapter['buildFedExRequest'](request);

      // Verify structure
      expect(fedExRequest).toHaveProperty('accountNumber');
      expect(fedExRequest).toHaveProperty('requestedShipment');
      expect(fedExRequest).toHaveProperty('returnTransitTimes', true);

      // Verify dimensions are in correct units
      const shipment = fedExRequest.requestedShipment;
      expect(shipment.requestedPackageLineItems?.[0]?.dimensions?.units).toBe('IN');
      expect(shipment.requestedPackageLineItems?.[0]?.weight?.units).toBe('LB');
    });

    it('should build valid FedEx rate request with dimensions in cm', () => {
      const request: RateRequest = {
        package: {
          id: 'pkg-1',
          type: 'box',
          dimensions: {
            length: 25,
            width: 20,
            height: 15,
            unit: 'cm',
          },
          weight: {
            value: 1,
            unit: 'kg',
          },
        },
        origin: {
          name: 'John Doe',
          street1: '123 Main St',
          city: 'London',
          state: 'LND',
          postalCode: 'SW1A 1AA',
          country: 'GB',
        },
        destination: {
          name: 'Jane Smith',
          street1: '456 Oak Ave',
          city: 'Manchester',
          state: 'GRT',
          postalCode: 'M1 1AA',
          country: 'GB',
        },
        options: {
          speed: 'standard',
          signatureRequired: true,
          insurance: false,
          fragileHandling: false,
          saturdayDelivery: false,
        },
        carriersFilter: undefined,
      };

      const fedExRequest = adapter['buildFedExRequest'](request);

      // Verify dimensions are in correct units
      const shipment = fedExRequest.requestedShipment;
      expect(shipment.requestedPackageLineItems?.[0]?.dimensions?.units).toBe('CM');
      expect(shipment.requestedPackageLineItems?.[0]?.weight?.units).toBe('KG');
    });

    it('should include signature service when required', () => {
      const request: RateRequest = {
        package: {
          id: 'pkg-1',
          type: 'box',
          dimensions: { length: 10, width: 8, height: 6, unit: 'in' },
          weight: { value: 2, unit: 'lbs' },
        },
        origin: {
          name: 'Sender',
          street1: '123 Main',
          city: 'NY',
          state: 'NY',
          postalCode: '10001',
          country: 'US',
        },
        destination: {
          name: 'Receiver',
          street1: '456 Oak',
          city: 'LA',
          state: 'CA',
          postalCode: '90001',
          country: 'US',
        },
        options: {
          speed: 'standard',
          signatureRequired: true,
          insurance: false,
          fragileHandling: false,
          saturdayDelivery: false,
        },
        carriersFilter: undefined,
      };

      const fedExRequest = adapter['buildFedExRequest'](request);
      const lineItem = fedExRequest.requestedShipment.requestedPackageLineItems[0];

      expect(lineItem).toHaveProperty('specialServices');
      expect(lineItem?.specialServices?.specialServiceTypes).toContain('SIGNATURE_OPTION');
    });
  });

  describe('Surcharge Type Mapping', () => {
    it('should map FUEL surcharge to fuel type', () => {
      const type = adapter['mapSurchargeType']('FUEL');
      expect(type).toBe('fuel');
    });

    it('should map SIGNATURE_OPTION to signature type', () => {
      const type = adapter['mapSurchargeType']('SIGNATURE_OPTION');
      expect(type).toBe('signature');
    });

    it('should map DECLARED_VALUE to insurance type', () => {
      const type = adapter['mapSurchargeType']('DECLARED_VALUE');
      expect(type).toBe('insurance');
    });

    it('should convert unknown surcharge to lowercase with underscores replaced', () => {
      const type = adapter['mapSurchargeType']('CUSTOM_SURCHARGE_TYPE');
      expect(type).toBe('customsurchargetype');
    });
  });

  describe('Transit Time Formatting', () => {
    it('should format 1_DAY to 1 Day', () => {
      const formatted = adapter['formatTransitTime']('1_DAY');
      expect(formatted).toBe('1 Day');
    });

    it('should format 2_DAY to 2 Days', () => {
      const formatted = adapter['formatTransitTime']('2_DAY');
      expect(formatted).toBe('2 Days');
    });

    it('should format ONE_DAY to 1 Day', () => {
      const formatted = adapter['formatTransitTime']('ONE_DAY');
      expect(formatted).toBe('1 Day');
    });

    it('should format FIVE_DAY to 5 Days', () => {
      const formatted = adapter['formatTransitTime']('FIVE_DAY');
      expect(formatted).toBe('5 Days');
    });

    it('should return original string for unknown format', () => {
      const formatted = adapter['formatTransitTime']('UNKNOWN_FORMAT');
      expect(formatted).toBe('UNKNOWN_FORMAT');
    });
  });

  describe('Packaging Type Validation', () => {
    it('should accept envelope with weight <= 0.5 kg', () => {
      const packageType = adapter['getPackagingType']('envelope', { value: 0.5, unit: 'lbs' });
      expect(packageType).toBe('FEDEX_ENVELOPE');
    });

    it('should throw error for envelope exceeding max weight (0.5 kg)', () => {
      expect(() => {
        adapter['getPackagingType']('envelope', { value: 2, unit: 'lbs' });
      }).toThrow();
    });

    it('should accept tube with weight <= 9.1 kg', () => {
      const packageType = adapter['getPackagingType']('tube', { value: 9, unit: 'lbs' });
      expect(packageType).toBe('FEDEX_TUBE');
    });

    it('should throw error for tube exceeding max weight (9.1 kg)', () => {
      expect(() => {
        adapter['getPackagingType']('tube', { value: 25, unit: 'lbs' });
      }).toThrow();
    });

    it('should return YOUR_PACKAGING for box or custom', () => {
      const boxType = adapter['getPackagingType']('box', { value: 5, unit: 'lbs' });
      const customType = adapter['getPackagingType']('custom', { value: 5, unit: 'lbs' });

      expect(boxType).toBe('YOUR_PACKAGING');
      expect(customType).toBe('YOUR_PACKAGING');
    });
  });

  describe('State Code Extraction', () => {
    it('should extract state code from ISO format', () => {
      const stateCode = adapter['getStateCode']('US-NY');
      expect(stateCode).toBe('NY');
    });

    it('should handle undefined state', () => {
      const stateCode = adapter['getStateCode'](undefined);
      expect(stateCode).toBeUndefined();
    });

    it('should extract GB region code', () => {
      const stateCode = adapter['getStateCode']('GB-ENG');
      expect(stateCode).toBe('ENG');
    });
  });
});
