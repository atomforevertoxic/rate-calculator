import { describe, expect, it } from 'vitest';

describe('Singleton Pattern - CarrierConfigManager', () => {
  describe('Singleton Instance', () => {
    it('should export a valid carrierConfigManager instance', async () => {
      const { carrierConfigManager } = await import('../carrier-config');
      expect(carrierConfigManager).toBeDefined();
    });

    it('should have getCarrierCredentials method', async () => {
      const { carrierConfigManager } = await import('../carrier-config');
      expect(typeof carrierConfigManager.getCarrierCredentials).toBe('function');
    });

    it('should have CarrierConfigManager class exported', async () => {
      const { CarrierConfigManager } = await import('../carrier-config');
      expect(CarrierConfigManager).toBeDefined();
    });

    it('should return credentials for FedEx', async () => {
      const { carrierConfigManager } = await import('../carrier-config');
      const credentials = carrierConfigManager.getCarrierCredentials('FedEx');

      expect(credentials).toBeDefined();
      expect(credentials.endpoint).toBe('https://apis-sandbox.fedex.com');
      expect(credentials.timeout).toBe(5000);
    });

    it('should throw error for unsupported carrier', async () => {
      const { carrierConfigManager } = await import('../carrier-config');

      expect(() => {
        // @ts-expect-error Testing invalid carrier
        carrierConfigManager.getCarrierCredentials('UPS');
      }).toThrow();
    });

    it('should return same instance across imports', async () => {
      const mod1 = await import('../carrier-config');
      const mod2 = await import('../carrier-config');

      expect(mod1.carrierConfigManager).toBe(mod2.carrierConfigManager);
    });

    it('should have consistent API key field', async () => {
      const { carrierConfigManager } = await import('../carrier-config');
      const credentials = carrierConfigManager.getCarrierCredentials('FedEx');

      expect(credentials.apiKey).toBeDefined();
      expect(typeof credentials.apiKey).toBe('string');
    });

    it('should have consistent API secret field', async () => {
      const { carrierConfigManager } = await import('../carrier-config');
      const credentials = carrierConfigManager.getCarrierCredentials('FedEx');

      expect(credentials.apiSecret).toBeDefined();
      expect(typeof credentials.apiSecret).toBe('string');
    });

    it('should have account number field', async () => {
      const { carrierConfigManager } = await import('../carrier-config');
      const credentials = carrierConfigManager.getCarrierCredentials('FedEx');

      expect('accountNumber' in credentials).toBe(true);
    });

    it('should return credentials with all required fields', async () => {
      const { carrierConfigManager } = await import('../carrier-config');
      const credentials = carrierConfigManager.getCarrierCredentials('FedEx');

      expect(credentials.apiKey).toBeDefined();
      expect(credentials.apiSecret).toBeDefined();
      expect(credentials.endpoint).toBeDefined();
      expect(credentials.timeout).toBeDefined();
    });

    it('should have private constructor pattern (singleton)', async () => {
      const { carrierConfigManager } = await import('../carrier-config');

      // The instance should be immutable and shared
      expect(carrierConfigManager).toBeDefined();
      expect(typeof carrierConfigManager).toBe('object');

      // Verify multiple calls return same instance
      const credentials1 = carrierConfigManager.getCarrierCredentials('FedEx');
      const credentials2 = carrierConfigManager.getCarrierCredentials('FedEx');
      expect(credentials1).toBe(credentials2);
    });

    it('should validate configuration on getInstance', async () => {
      const { carrierConfigManager } = await import('../carrier-config');

      // Should not throw - validateConfiguration runs in constructor
      expect(() => {
        carrierConfigManager.getCarrierCredentials('FedEx');
      }).not.toThrow();
    });
  });
});
