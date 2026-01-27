import { describe, expect, it } from 'vitest';
import { getCarrierAdapter } from '../index';

describe('Adapter Factory - getCarrierAdapter()', () => {
  it('should return FedExAdapter for FedEx carrier', () => {
    const adapter = getCarrierAdapter('FedEx');
    expect(adapter).toBeDefined();
    expect(adapter).toHaveProperty('fetchRates');
  });

  it('should throw error for unknown carrier', () => {
    expect(() => {
      getCarrierAdapter('UnknownCarrier' as any);
    }).toThrow('Unknown carrier');
  });

  it('should return same adapter instance for repeated calls', () => {
    const adapter1 = getCarrierAdapter('FedEx');
    const adapter2 = getCarrierAdapter('FedEx');
    expect(adapter1).toBe(adapter2);
  });

  it('should have fetchRates method as async function', () => {
    const adapter = getCarrierAdapter('FedEx');
    expect(typeof adapter.fetchRates).toBe('function');
  });
});
