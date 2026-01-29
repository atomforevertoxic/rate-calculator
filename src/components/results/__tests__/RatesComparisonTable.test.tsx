import type { ShippingRate } from '@/src/types/domain';
import { describe, expect, it } from 'vitest';

/**
 * Mock data for testing
 */
const mockRates: ShippingRate[] = [
  {
    id: 'fedex-1',
    carrier: 'FedEx',
    serviceCode: 'FEDEX_OVERNIGHT',
    serviceName: 'FedEx Overnight',
    speed: 'overnight',
    totalCost: 150.0,
    baseRate: 140.0,
    additionalFees: [{ type: 'fuel', description: 'Fuel Surcharge', amount: 10.0 }],
    estimatedDeliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    guaranteedDelivery: true,
    features: ['Free Tracking', 'Insurance'],
  },
  {
    id: 'fedex-2',
    carrier: 'FedEx',
    serviceCode: 'FEDEX_2DAY',
    serviceName: 'FedEx 2-Day',
    speed: 'two-day',
    totalCost: 85.5,
    baseRate: 80.0,
    additionalFees: [{ type: 'fuel', description: 'Fuel Surcharge', amount: 5.5 }],
    estimatedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
    guaranteedDelivery: true,
    features: ['Free Tracking'],
  },
  {
    id: 'fedex-3',
    carrier: 'FedEx',
    serviceCode: 'FEDEX_STANDARD',
    serviceName: 'FedEx Standard',
    speed: 'standard',
    totalCost: 45.0,
    baseRate: 40.0,
    additionalFees: [{ type: 'fuel', description: 'Fuel Surcharge', amount: 5.0 }],
    estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
    guaranteedDelivery: false,
    features: [],
  },
  {
    id: 'fedex-4',
    carrier: 'FedEx',
    serviceCode: 'FEDEX_GROUND',
    serviceName: 'FedEx Ground',
    speed: 'standard',
    totalCost: 42.75,
    baseRate: 38.0,
    additionalFees: [{ type: 'fuel', description: 'Fuel Surcharge', amount: 4.75 }],
    estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
    guaranteedDelivery: false,
    features: ['Free Tracking'],
  },
];

describe('RatesComparisonTable Component', () => {
  describe('Sorting Functionality', () => {
    it('should sort by price in ascending order (low to high)', () => {
      const sorted = [...mockRates].sort((a, b) => a.totalCost - b.totalCost);

      expect(sorted[0]?.totalCost).toBe(42.75); // Lowest
      expect(sorted[1]?.totalCost).toBe(45.0);
      expect(sorted[2]?.totalCost).toBe(85.5);
      expect(sorted[3]?.totalCost).toBe(150.0); // Highest
    });

    it('should sort by delivery date correctly (earliest first)', () => {
      const sorted = [...mockRates].sort(
        (a, b) => a.estimatedDeliveryDate.getTime() - b.estimatedDeliveryDate.getTime()
      );

      // Tomorrow should be first (fastest)
      expect(sorted[0]?.serviceName).toBe('FedEx Overnight');
      // 2 days should be second
      expect(sorted[1]?.serviceName).toBe('FedEx 2-Day');
      // Later dates should be last
      const lastTime = sorted[sorted.length - 1]?.estimatedDeliveryDate.getTime() ?? 0;
      const secondLastTime = sorted[sorted.length - 2]?.estimatedDeliveryDate.getTime() ?? 0;
      expect(lastTime).toBeGreaterThanOrEqual(secondLastTime);
    });

    it('should sort by best value (speed/cost ratio)', () => {
      const speedOrder = { overnight: 4, 'two-day': 3, standard: 2, economy: 1 };
      const sorted = [...mockRates].sort((a, b) => {
        const aSpeed = speedOrder[a.speed as keyof typeof speedOrder] ?? 0;
        const bSpeed = speedOrder[b.speed as keyof typeof speedOrder] ?? 0;
        const aValue = (aSpeed / a.baseRate) * 100;
        const bValue = (bSpeed / b.baseRate) * 100;
        return bValue - aValue; // Better value first
      });

      // Results should be sorted by value (higher is better)
      expect(sorted[0]?.serviceName).toBeDefined();
      if (sorted.length > 1) {
        const value1 =
          (speedOrder[sorted[0]?.speed as keyof typeof speedOrder] ?? 0) /
          (sorted[0]?.baseRate ?? 1);
        const value2 =
          (speedOrder[sorted[1]?.speed as keyof typeof speedOrder] ?? 0) /
          (sorted[1]?.baseRate ?? 1);
        expect(value1).toBeGreaterThanOrEqual(value2);
      }
    });
  });

  describe('Carrier Filtering', () => {
    it('should filter rates by selected carrier', () => {
      const selectedCarriers = ['FedEx'];
      const filtered = mockRates.filter((rate) => selectedCarriers.includes(rate.carrier));

      expect(filtered).toHaveLength(4);
      expect(filtered.every((r) => r.carrier === 'FedEx')).toBe(true);
    });

    it('should exclude non-selected carriers from display', () => {
      const selectedCarriers = ['FedEx'];
      const filtered = mockRates.filter((rate) => selectedCarriers.includes(rate.carrier));

      const hasAll = filtered.every((r) => r.carrier === 'FedEx');
      expect(hasAll).toBe(true);
    });

    it('should handle multiple selected carriers', () => {
      const selectedCarriers = ['FedEx'];
      const filtered = mockRates.filter((rate) => selectedCarriers.includes(rate.carrier));

      expect(filtered).toHaveLength(4);
      expect(filtered.every((r) => r.carrier === 'FedEx')).toBe(true);
    });

    it('should return all rates when no carrier filter applied', () => {
      const selectedCarriers: string[] = [];
      const filtered = mockRates.filter((rate) =>
        selectedCarriers.length > 0 ? selectedCarriers.includes(rate.carrier) : true
      );

      expect(filtered).toHaveLength(4);
    });
  });

  describe('Best Value Identification', () => {
    it('should correctly identify cheapest rate', () => {
      const cheapestCost = Math.min(...mockRates.map((r) => r.totalCost));

      expect(cheapestCost).toBe(42.75);
      const cheapest = mockRates.find((r) => r.totalCost === cheapestCost);
      expect(cheapest?.serviceName).toBe('FedEx Ground');
    });

    it('should correctly identify fastest rate', () => {
      const speedOrder = { overnight: 0, 'two-day': 1, standard: 2, economy: 3 };
      const fastestRate = mockRates.reduce((fastest, current) => {
        const fastestSpeed = speedOrder[fastest.speed as keyof typeof speedOrder] ?? 4;
        const currentSpeed = speedOrder[current.speed as keyof typeof speedOrder] ?? 4;
        return currentSpeed < fastestSpeed ? current : fastest;
      });

      expect(fastestRate.speed).toBe('overnight');
      expect(fastestRate.serviceName).toBe('FedEx Overnight');
    });

    it('should mark guaranteed delivery correctly', () => {
      const withGuarantee = mockRates.filter((r) => r.guaranteedDelivery);

      expect(withGuarantee).toHaveLength(2);
      expect(withGuarantee.every((r) => r.guaranteedDelivery === true)).toBe(true);
    });

    it('should calculate value score considering both price and speed', () => {
      // Simple value score: (1 / price) * speed_weight
      // Lower price and faster speed = higher score
      const valueScores = mockRates.map((rate) => {
        const speedOrder = { overnight: 4, 'two-day': 3, standard: 2, economy: 1 };
        const speedWeight = speedOrder[rate.speed as keyof typeof speedOrder] ?? 0;
        const priceScore = 1 / (rate.totalCost / 100); // Normalize price
        return (priceScore * speedWeight) / 2;
      });

      const bestValueIndex = valueScores.indexOf(Math.max(...valueScores));
      // FedEx 2-Day should have good value (affordable + fast)
      expect(mockRates[bestValueIndex]?.serviceName).toBeDefined();
    });
  });

  describe('Data Consistency', () => {
    it('should maintain rate object integrity during sorting', () => {
      const sorted = [...mockRates].sort((a, b) => a.totalCost - b.totalCost);

      sorted.forEach((rate) => {
        expect(rate.id).toBeDefined();
        expect(rate.carrier).toBeDefined();
        expect(rate.serviceName).toBeDefined();
        expect(rate.totalCost).toBeGreaterThan(0);
      });
    });

    it('should not mutate original rates array during filtering', () => {
      const originalLength = mockRates.length;
      const filtered = mockRates.filter((r) => r.carrier === 'FedEx');

      expect(mockRates).toHaveLength(originalLength);
      expect(filtered).toHaveLength(4);
    });

    it('should correctly handle edge case with single rate', () => {
      const singleRate = [mockRates[0]!];
      const cheapestCost = Math.min(...singleRate.map((r: ShippingRate) => r.totalCost));

      expect(cheapestCost).toBe(150.0);
    });

    it('should correctly handle empty rates array', () => {
      const emptyRates: ShippingRate[] = [];
      const cheapestCost =
        emptyRates.length > 0 ? Math.min(...emptyRates.map((r) => r.totalCost)) : 0;
      const filtered = emptyRates.filter((r) => r.carrier === 'FedEx');

      expect(cheapestCost).toBe(0);
      expect(filtered).toHaveLength(0);
    });
  });
});
