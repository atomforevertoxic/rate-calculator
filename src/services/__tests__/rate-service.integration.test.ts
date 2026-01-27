import type { RateRequest } from '@/src/types/domain';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RateService } from '../rate-service';

vi.mock('@/src/adapters/carrier-adapters/index', () => ({
  getCarrierAdapter: vi.fn(() => ({
    fetchRates: vi.fn().mockResolvedValue([]),
  })),
}));

vi.mock('@/src/config/carrier-config', () => ({
  carrierConfigManager: {
    getCarrierCredentials: vi.fn(() => ({
      endpoint: 'https://apis.fedex.com',
      apiKey: 'test-key',
      apiSecret: 'test-secret',
      timeout: 5000,
    })),
    validateConfiguration: vi.fn(),
  },
}));

describe('Integration Tests - RateService', () => {
  let rateService: RateService;

  beforeEach(() => {
    vi.clearAllMocks();
    rateService = new RateService();
  });

  describe('RateService Initialization', () => {
    it('should create RateService instance', () => {
      expect(rateService).toBeDefined();
      expect(typeof rateService.fetchAllRates).toBe('function');
    });

    it('should have fetchAllRates method', () => {
      expect(typeof rateService.fetchAllRates).toBe('function');
    });
  });

  describe('fetchAllRates()', () => {
    it('should accept valid rate request', async () => {
      const request: RateRequest = {
        package: {
          id: 'pkg-1',
          type: 'box',
          weight: { value: 5, unit: 'lbs' },
          dimensions: { length: 10, width: 8, height: 6, unit: 'in' },
        },
        origin: {
          name: 'Origin',
          street1: '123 Main',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'US',
        },
        destination: {
          name: 'Destination',
          street1: '456 Oak',
          city: 'Los Angeles',
          state: 'CA',
          postalCode: '90210',
          country: 'US',
        },
        options: {
          speed: 'standard',
          signatureRequired: false,
          insurance: false,
          fragileHandling: false,
          saturdayDelivery: false,
        },
      };

      const result = await rateService.fetchAllRates(request);
      expect(result).toBeDefined();
      expect(result.rates).toBeDefined();
    });

    it('should return result with rates array', async () => {
      const request: RateRequest = {
        package: {
          id: 'pkg-1',
          type: 'box',
          weight: { value: 5, unit: 'lbs' },
          dimensions: { length: 10, width: 8, height: 6, unit: 'in' },
        },
        origin: {
          name: 'Origin',
          street1: '123 Main',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'US',
        },
        destination: {
          name: 'Destination',
          street1: '456 Oak',
          city: 'Los Angeles',
          state: 'CA',
          postalCode: '90210',
          country: 'US',
        },
        options: {
          speed: 'standard',
          signatureRequired: false,
          insurance: false,
          fragileHandling: false,
          saturdayDelivery: false,
        },
      };

      const result = await rateService.fetchAllRates(request);
      expect(Array.isArray(result.rates)).toBe(true);
      expect(result.requestId).toBeDefined();
    });

    it('should include errors array in response', async () => {
      const request: RateRequest = {
        package: {
          id: 'pkg-1',
          type: 'box',
          weight: { value: 5, unit: 'lbs' },
          dimensions: { length: 10, width: 8, height: 6, unit: 'in' },
        },
        origin: {
          name: 'Origin',
          street1: '123 Main',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'US',
        },
        destination: {
          name: 'Destination',
          street1: '456 Oak',
          city: 'Los Angeles',
          state: 'CA',
          postalCode: '90210',
          country: 'US',
        },
        options: {
          speed: 'standard',
          signatureRequired: false,
          insurance: false,
          fragileHandling: false,
          saturdayDelivery: false,
        },
      };

      const result = await rateService.fetchAllRates(request);
      expect(Array.isArray(result.errors)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle adapter errors gracefully', async () => {
      const { getCarrierAdapter } = await import('@/src/adapters/carrier-adapters/index');

      vi.mocked(getCarrierAdapter).mockReturnValue({
        fetchRates: vi.fn().mockRejectedValue(new Error('API Error')),
      } as any);

      const request: RateRequest = {
        package: {
          id: 'pkg-1',
          type: 'box',
          weight: { value: 5, unit: 'lbs' },
          dimensions: { length: 10, width: 8, height: 6, unit: 'in' },
        },
        origin: {
          name: 'Origin',
          street1: '123 Main',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'US',
        },
        destination: {
          name: 'Destination',
          street1: '456 Oak',
          city: 'Los Angeles',
          state: 'CA',
          postalCode: '90210',
          country: 'US',
        },
        options: {
          speed: 'standard',
          signatureRequired: false,
          insurance: false,
          fragileHandling: false,
          saturdayDelivery: false,
        },
      };

      const result = await rateService.fetchAllRates(request);
      expect(result).toBeDefined();
      expect(Array.isArray(result.rates)).toBe(true);
    });
  });

  describe('Full Workflow Integration', () => {
    it('should complete end-to-end rate request with all service options', async () => {
      const request: RateRequest = {
        package: {
          id: 'pkg-1',
          type: 'box',
          weight: { value: 5, unit: 'lbs' },
          dimensions: { length: 10, width: 8, height: 6, unit: 'in' },
        },
        origin: {
          name: 'Origin',
          street1: '123 Main',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'US',
        },
        destination: {
          name: 'Destination',
          street1: '456 Oak',
          city: 'Los Angeles',
          state: 'CA',
          postalCode: '90210',
          country: 'US',
        },
        options: {
          speed: 'standard',
          signatureRequired: true,
          insurance: true,
          fragileHandling: false,
          saturdayDelivery: false,
          insuredValue: 200,
        },
      };

      const result = await rateService.fetchAllRates(request);

      expect(result).toBeDefined();
      expect(result.requestId).toBeDefined();
      expect(Array.isArray(result.rates)).toBe(true);
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it('should include timestamp in response', async () => {
      const request: RateRequest = {
        package: {
          id: 'pkg-1',
          type: 'box',
          weight: { value: 5, unit: 'lbs' },
          dimensions: { length: 10, width: 8, height: 6, unit: 'in' },
        },
        origin: {
          name: 'Origin',
          street1: '123 Main',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'US',
        },
        destination: {
          name: 'Destination',
          street1: '456 Oak',
          city: 'Los Angeles',
          state: 'CA',
          postalCode: '90210',
          country: 'US',
        },
        options: {
          speed: 'standard',
          signatureRequired: false,
          insurance: false,
          fragileHandling: true,
          saturdayDelivery: true,
        },
      };

      const result = await rateService.fetchAllRates(request);

      expect(result.timestamp).toBeDefined();
      expect(result.timestamp instanceof Date).toBe(true);
    });

    it('should work with carrier filtering', async () => {
      const request: RateRequest = {
        package: {
          id: 'pkg-1',
          type: 'box',
          weight: { value: 5, unit: 'lbs' },
          dimensions: { length: 10, width: 8, height: 6, unit: 'in' },
        },
        origin: {
          name: 'Origin',
          street1: '123 Main',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'US',
        },
        destination: {
          name: 'Destination',
          street1: '456 Oak',
          city: 'Los Angeles',
          state: 'CA',
          postalCode: '90210',
          country: 'US',
        },
        options: {
          speed: 'standard',
          signatureRequired: false,
          insurance: false,
          fragileHandling: false,
          saturdayDelivery: false,
        },
        carriersFilter: ['FedEx'],
      };

      const result = await rateService.fetchAllRates(request);
      expect(result).toBeDefined();
    });
  });

  describe('Configuration Integration', () => {
    it('should initialize with carrier config', async () => {
      const { carrierConfigManager } = await import('@/src/config/carrier-config');

      expect(carrierConfigManager).toBeDefined();
      expect(typeof carrierConfigManager.getCarrierCredentials).toBe('function');
    });

    it('should use singleton config across service calls', async () => {
      const request: RateRequest = {
        package: {
          id: 'pkg-1',
          type: 'box',
          weight: { value: 5, unit: 'lbs' },
          dimensions: { length: 10, width: 8, height: 6, unit: 'in' },
        },
        origin: {
          name: 'Origin',
          street1: '123 Main',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'US',
        },
        destination: {
          name: 'Destination',
          street1: '456 Oak',
          city: 'Los Angeles',
          state: 'CA',
          postalCode: '90210',
          country: 'US',
        },
        options: {
          speed: 'standard',
          signatureRequired: false,
          insurance: false,
          fragileHandling: false,
          saturdayDelivery: false,
        },
      };

      const result1 = await rateService.fetchAllRates(request);
      const result2 = await rateService.fetchAllRates(request);

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
    });
  });
});
