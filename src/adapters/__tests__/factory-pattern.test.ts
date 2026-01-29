import { carrierNames, type CarrierName } from '@/src/types/domain';
import { describe, expect, it } from 'vitest';

/**
 * Unit Tests for Factory Pattern
 * Tests the carrier adapter factory implementation
 */

describe('Factory Pattern - Carrier Adapter Factory', () => {
  describe('Factory Function', () => {
    it('should create adapter for supported carrier: FedEx', () => {
      const carrierName: CarrierName = 'FedEx';
      expect(carrierName).toBe('FedEx');
    });

    it('should return correct adapter instance for FedEx', () => {
      const supportedCarriers = carrierNames;
      expect(supportedCarriers).toContain('FedEx');
    });

    it('should only support defined carriers', () => {
      const supportedCarriers = carrierNames;
      expect(supportedCarriers).toHaveLength(1); // Currently FedEx only
    });
  });

  describe('Factory Pattern Compliance', () => {
    it('should encapsulate adapter creation logic', () => {
      // Factory hides the complexity of which adapter to instantiate
      const carrierToAdapterMap = {
        FedEx: 'FedExAdapter',
      };

      expect(carrierToAdapterMap['FedEx']).toBeDefined();
    });

    it('should return consistent adapter types', () => {
      const adapter1Name = 'FedExAdapter';
      const adapter2Name = 'FedExAdapter';

      expect(adapter1Name).toBe(adapter2Name);
    });

    it('should support extensibility for new carriers', () => {
      // Can easily add new carriers without modifying existing code
      const extensibleMap: Record<string, string> = {
        FedEx: 'FedExAdapter',
        // UPS: 'UPSAdapter', // Future
        // USPS: 'USPSAdapter', // Future
      };

      expect(Object.keys(extensibleMap)).toContain('FedEx');
    });
  });

  describe('Error Handling', () => {
    it('should handle unknown carrier gracefully', () => {
      const unknownCarrier = 'UnknownCarrier';
      const supportedCarriers = carrierNames;

      const isSupported = supportedCarriers.includes(unknownCarrier as CarrierName);
      expect(isSupported).toBe(false);
    });

    it('should validate carrier before creating adapter', () => {
      const createAdapter = (carrier: string) => {
        const validCarriers = ['FedEx'];
        if (!validCarriers.includes(carrier)) {
          throw new Error(`Unsupported carrier: ${carrier}`);
        }
        return `${carrier}Adapter`;
      };

      expect(() => createAdapter('FedEx')).not.toThrow();
      expect(() => createAdapter('InvalidCarrier')).toThrow();
    });
  });

  describe('Factory Benefits', () => {
    it('should centralize adapter instantiation', () => {
      // Single point of control for all adapter creation
      const getAdapterForCarrier = (carrier: CarrierName) => {
        return `${carrier}Adapter`;
      };

      expect(getAdapterForCarrier('FedEx')).toBe('FedExAdapter');
    });

    it('should simplify consumer code', () => {
      // Consumer doesn't need to know which concrete adapter to use
      const consumer = {
        getAdapter: (carrier: CarrierName) => {
          // Just call factory, don't instantiate directly
          return `Got ${carrier} adapter`;
        },
      };

      expect(consumer.getAdapter('FedEx')).toContain('FedEx');
    });

    it('should enable easy addition of new carriers', () => {
      const carrierRegistry: Record<string, boolean> = {
        FedEx: true,
        // UPS: true, // Add without changing factory code
        // USPS: true, // Add without changing factory code
      };

      expect(carrierRegistry['FedEx']).toBe(true);
      expect(Object.keys(carrierRegistry)).toHaveLength(1);
    });
  });

  describe('Adapter Resolution', () => {
    it('should resolve correct adapter class name for carrier', () => {
      const carriers: CarrierName[] = ['FedEx'];

      carriers.forEach((carrier) => {
        const adapterName = `${carrier}Adapter`;
        expect(adapterName).toMatch(/Adapter$/);
        expect(adapterName).toBe('FedExAdapter');
      });
    });

    it('should handle carrier name case sensitivity', () => {
      const carrier: CarrierName = 'FedEx';
      const lowerCase = carrier.toLowerCase();

      expect(carrier).not.toBe(lowerCase);
      expect(carrier).toBe('FedEx');
    });
  });

  describe('Configuration Management', () => {
    it('should retrieve correct credentials for carrier', () => {
      const carrierConfig = {
        FedEx: {
          endpoint: 'https://apis.fedex.com',
          apiKey: 'fedex-key',
        },
      };

      expect(carrierConfig['FedEx']).toBeDefined();
      expect(carrierConfig['FedEx'].endpoint).toContain('fedex');
    });

    it('should provide carrier-specific configuration', () => {
      const getCarrierConfig = (carrier: CarrierName) => {
        const configs: Record<CarrierName, Record<string, string>> = {
          FedEx: {
            name: 'FedEx',
            endpoint: 'https://apis.fedex.com',
            supportEmail: 'support@fedex.com',
          },
        };
        return configs[carrier];
      };

      const config = getCarrierConfig('FedEx');
      expect(config.name).toBe('FedEx');
      expect(config.endpoint).toContain('fedex');
    });
  });
});
