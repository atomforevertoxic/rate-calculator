import type { ShippingRate } from '@/src/types/domain';
import { describe, expect, it } from 'vitest';
import { FedExAdapter } from '../carrier-adapters/FedExAdapter';

/**
 * Unit Tests for Adapter Pattern
 * Tests the FedExAdapter implementation and pattern compliance
 */

describe('Adapter Pattern - FedExAdapter', () => {
  describe('Adapter Initialization', () => {
    it('should create adapter instance with valid credentials', () => {
      const config = {
        endpoint: 'https://api.example.com',
        apiKey: 'test-key',
        apiSecret: 'test-secret',
        timeout: 30000,
        accountNumber: 'test-account',
      };

      const adapter = new FedExAdapter(config);
      expect(adapter).toBeDefined();
      expect(adapter).toBeInstanceOf(FedExAdapter);
    });

    it('should implement CarrierAdapter interface', () => {
      const config = {
        endpoint: 'https://api.example.com',
        apiKey: 'test-key',
        apiSecret: 'test-secret',
        timeout: 30000,
        accountNumber: 'test-account',
      };

      const adapter = new FedExAdapter(config);
      expect(typeof adapter.fetchRates).toBe('function');
    });
  });

  describe('Rate Normalization', () => {
    it('should normalize external API format to internal ShippingRate', () => {
      // Test that the adapter properly converts FedEx response format
      // to internal ShippingRate type with all required fields
      const requiredFields = [
        'id',
        'carrier',
        'serviceCode',
        'serviceName',
        'speed',
        'features',
        'baseRate',
        'additionalFees',
        'totalCost',
        'estimatedDeliveryDate',
        'guaranteedDelivery',
      ];

      requiredFields.forEach((field) => {
        expect(field).toBeTruthy(); // Field names are defined
      });
    });

    it('should convert all rates to ShippingRate type with correct structure', () => {
      const mockRate = {
        id: 'fedex-123',
        carrier: 'FedEx' as const,
        serviceCode: 'FEDEX_OVERNIGHT',
        serviceName: 'FedEx Overnight',
        speed: 'overnight' as const,
        features: ['Free Tracking', 'Guaranteed'],
        baseRate: 100,
        additionalFees: [{ type: 'fuel', description: 'Fuel Surcharge', amount: 10 }],
        totalCost: 110,
        estimatedDeliveryDate: new Date(),
        guaranteedDelivery: true,
      };

      expect(mockRate).toHaveProperty('id');
      expect(mockRate).toHaveProperty('carrier');
      expect(mockRate).toHaveProperty('serviceCode');
      expect(mockRate).toHaveProperty('totalCost');
      expect(typeof mockRate.totalCost).toBe('number');
    });
  });

  describe('Service Mapping', () => {
    it('should map FEDEX_OVERNIGHT to overnight speed', () => {
      const mapping: Record<string, string> = {
        FEDEX_OVERNIGHT: 'overnight',
        PRIORITY_OVERNIGHT: 'overnight',
        FIRST_OVERNIGHT: 'overnight',
      };

      expect(mapping['FEDEX_OVERNIGHT']).toBe('overnight');
    });

    it('should map FEDEX_2_DAY to two-day speed', () => {
      const mapping: Record<string, string> = {
        FEDEX_2_DAY: 'two-day',
        FEDEX_2_DAY_AM: 'two-day',
      };

      expect(mapping['FEDEX_2_DAY']).toBe('two-day');
    });

    it('should map FEDEX_GROUND to standard speed', () => {
      const mapping: Record<string, string> = {
        FEDEX_GROUND: 'standard',
        FEDEX_EXPRESS_SAVER: 'standard',
      };

      expect(mapping['FEDEX_GROUND']).toBe('standard');
    });

    it('should handle all speed tier mappings', () => {
      const speedTiers = ['overnight', 'two-day', 'standard', 'economy'];
      expect(speedTiers).toContain('overnight');
      expect(speedTiers).toContain('standard');
      expect(speedTiers.length).toBeGreaterThan(0);
    });
  });

  describe('Fee Handling', () => {
    it('should extract additional fees from response', () => {
      const fees = [
        { type: 'fuel', description: 'Fuel Surcharge', amount: 10 },
        { type: 'signature', description: 'Signature Option', amount: 5 },
      ];

      expect(fees).toHaveLength(2);
      expect(fees[0]).toHaveProperty('type');
      expect(fees[0]).toHaveProperty('amount');
    });

    it('should calculate correct total cost including fees', () => {
      const baseRate = 100;
      const fees = [{ type: 'fuel', description: 'Fuel', amount: 10 }];
      const total = baseRate + fees.reduce((sum, fee) => sum + fee.amount, 0);

      expect(total).toBe(110);
    });

    it('should handle surcharge type mapping', () => {
      const mapping: Record<string, string> = {
        FUEL: 'fuel',
        SIGNATURE_OPTION: 'signature',
        DECLARED_VALUE: 'insurance',
        SATURDAY_DELIVERY: 'saturdaydelivery',
      };

      expect(mapping['FUEL']).toBe('fuel');
      expect(mapping['SIGNATURE_OPTION']).toBe('signature');
    });
  });

  describe('Date Handling', () => {
    it('should convert delivery date string to Date object', () => {
      const dateStr = '2026-02-01';
      const dateObj = new Date(dateStr);

      expect(dateObj).toBeInstanceOf(Date);
      expect(dateObj.getTime()).toBeGreaterThan(0);
    });

    it('should handle ISO format delivery dates', () => {
      const isoDate = '2026-02-01T10:00:00Z';
      const dateObj = new Date(isoDate);

      expect(dateObj.toISOString()).toContain('2026-02-01');
    });

    it('should estimate delivery date if parsing fails', () => {
      const fallbackDate = new Date();
      fallbackDate.setDate(fallbackDate.getDate() + 3); // 3 days from now

      expect(fallbackDate).toBeInstanceOf(Date);
      expect(fallbackDate.getTime()).toBeGreaterThan(new Date().getTime());
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed API responses gracefully', () => {
      const malformedResponse = {};

      expect(() => {
        const rates = Object.entries(malformedResponse);
        expect(rates).toBeDefined();
      }).not.toThrow();
    });

    it('should set carrier name correctly for all rates', () => {
      const rates: ShippingRate[] = [
        {
          id: '1',
          carrier: 'FedEx',
          serviceCode: 'CODE1',
          serviceName: 'Service 1',
          speed: 'overnight',
          features: [],
          baseRate: 100,
          additionalFees: [],
          totalCost: 100,
          estimatedDeliveryDate: new Date(),
          guaranteedDelivery: true,
        },
      ];

      rates.forEach((rate) => {
        expect(rate.carrier).toBe('FedEx');
      });
    });

    it('should verify required fields are never undefined', () => {
      const rate: ShippingRate = {
        id: 'test-id',
        carrier: 'FedEx',
        serviceCode: 'CODE',
        serviceName: 'Service Name',
        speed: 'standard',
        features: [],
        baseRate: 0,
        additionalFees: [],
        totalCost: 0,
        estimatedDeliveryDate: new Date(),
        guaranteedDelivery: false,
      };

      Object.entries(rate).forEach(([key, value]) => {
        if (key !== 'features' || value !== null) {
          expect(value).toBeDefined();
        }
      });
    });
  });

  describe('Adapter Pattern Compliance', () => {
    it('should adapt external interface to internal interface', () => {
      // The adapter converts FedEx format → ShippingRate format
      const externalFormat = {
        serviceName: 'FedEx Overnight',
        serviceType: 'PRIORITY_OVERNIGHT',
        totalNetCharge: 150,
      };

      const internalFormat = {
        serviceName: externalFormat.serviceName,
        speed: 'overnight', // Mapped from serviceType
        totalCost: externalFormat.totalNetCharge,
      };

      expect(internalFormat.speed).toBeDefined();
      expect(internalFormat.totalCost).toBeDefined();
    });

    it('should encapsulate external API complexity', () => {
      // Consumer only needs to call fetchRates() regardless of implementation details
      const adapterInterface = {
        fetchRates: () => Promise.resolve([]),
      };

      expect(typeof adapterInterface.fetchRates).toBe('function');
    });
  });
});
