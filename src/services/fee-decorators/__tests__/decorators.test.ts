import { ShippingOptions } from '@/src/types/domain';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  BaseRate,
  FragileHandlingDecorator,
  InsuranceDecorator,
  SaturdayDeliveryDecorator,
  SignatureDecorator,
  applyFees,
} from '../index';

describe('Decorator Pattern - Fee Decorators', () => {
  let baseRate: BaseRate;

  beforeEach(() => {
    baseRate = new BaseRate(100, 'FedEx Standard');
  });

  describe('BaseRate', () => {
    it('should have correct base cost', () => {
      expect(baseRate.getCost()).toBe(100);
    });

    it('should have correct description', () => {
      expect(baseRate.getDescription()).toBe('FedEx Standard');
    });

    it('should have empty fees array', () => {
      expect(baseRate.getFees()).toEqual([]);
    });
  });

  describe('InsuranceDecorator', () => {
    it('should add insurance fee to cost', () => {
      const decorated = new InsuranceDecorator(baseRate, 500); // $500 value
      // Fee should be max(500/100 * 1, 2.50) = max(5, 2.50) = 5
      expect(decorated.getCost()).toBe(105);
    });

    it('should calculate insurance correctly: $1 per $100 of value', () => {
      const decorated = new InsuranceDecorator(baseRate, 1000); // $1000 value
      // Fee should be $10
      expect(decorated.getCost()).toBe(110);
    });

    it('should enforce minimum insurance fee of $2.50', () => {
      const decorated = new InsuranceDecorator(baseRate, 100); // $100 value
      // Fee should be max(100/100 * 1, 2.50) = max(1, 2.50) = 2.50
      expect(decorated.getCost()).toBe(102.5);
    });

    it('should add insurance fee to getFees array', () => {
      const decorated = new InsuranceDecorator(baseRate, 500);
      const fees = decorated.getFees();
      expect(fees.length).toBe(1);
      expect(fees[0]?.type).toBe('insurance');
      expect(fees[0]?.amount).toBe(5);
    });

    it('should update description', () => {
      const decorated = new InsuranceDecorator(baseRate, 500);
      expect(decorated.getDescription()).toContain('Insurance');
    });
  });

  describe('SignatureDecorator', () => {
    it('should add $5.50 signature fee to cost', () => {
      const decorated = new SignatureDecorator(baseRate);
      expect(decorated.getCost()).toBe(105.5);
    });

    it('should add signature fee to getFees array', () => {
      const decorated = new SignatureDecorator(baseRate);
      const fees = decorated.getFees();
      expect(fees.length).toBe(1);
      expect(fees[0]?.type).toBe('signature');
      expect(fees[0]?.amount).toBe(5.5);
    });

    it('should update description', () => {
      const decorated = new SignatureDecorator(baseRate);
      expect(decorated.getDescription()).toContain('Signature Required');
    });
  });

  describe('FragileHandlingDecorator', () => {
    it('should add $10.00 fragile handling fee to cost', () => {
      const decorated = new FragileHandlingDecorator(baseRate);
      expect(decorated.getCost()).toBe(110);
    });

    it('should add fragile handling fee to getFees array', () => {
      const decorated = new FragileHandlingDecorator(baseRate);
      const fees = decorated.getFees();
      expect(fees.length).toBe(1);
      expect(fees[0]?.type).toBe('fragilehandling');
      expect(fees[0]?.amount).toBe(10);
    });

    it('should update description', () => {
      const decorated = new FragileHandlingDecorator(baseRate);
      expect(decorated.getDescription()).toContain('Fragile Handling');
    });
  });

  describe('SaturdayDeliveryDecorator', () => {
    it('should add $15.00 Saturday delivery fee to cost', () => {
      const decorated = new SaturdayDeliveryDecorator(baseRate);
      expect(decorated.getCost()).toBe(115);
    });

    it('should add Saturday delivery fee to getFees array', () => {
      const decorated = new SaturdayDeliveryDecorator(baseRate);
      const fees = decorated.getFees();
      expect(fees.length).toBe(1);
      expect(fees[0]?.type).toBe('saturdaydelivery');
      expect(fees[0]?.amount).toBe(15);
    });

    it('should update description', () => {
      const decorated = new SaturdayDeliveryDecorator(baseRate);
      expect(decorated.getDescription()).toContain('Saturday Delivery');
    });
  });

  describe('Decorator Stacking', () => {
    it('should stack decorators and accumulate fees', () => {
      let decorated: any = baseRate;
      decorated = new SignatureDecorator(decorated); // +5.50
      decorated = new FragileHandlingDecorator(decorated); // +10.00
      decorated = new SaturdayDeliveryDecorator(decorated); // +15.00

      expect(decorated.getCost()).toBe(100 + 5.5 + 10 + 15); // 130.50
    });

    it('should return all fees from stacked decorators', () => {
      let decorated: any = baseRate;
      decorated = new SignatureDecorator(decorated);
      decorated = new FragileHandlingDecorator(decorated);
      decorated = new SaturdayDeliveryDecorator(decorated);

      const fees = decorated.getFees();
      expect(fees.length).toBe(3);
      expect(fees.map((f: any) => f.type)).toEqual([
        'signature',
        'fragilehandling',
        'saturdaydelivery',
      ]);
    });

    it('should stack in any order and accumulate same total cost', () => {
      // Order 1: Signature -> Fragile -> Saturday
      let decorated1: any = baseRate;
      decorated1 = new SignatureDecorator(decorated1);
      decorated1 = new FragileHandlingDecorator(decorated1);
      decorated1 = new SaturdayDeliveryDecorator(decorated1);

      // Order 2: Saturday -> Fragile -> Signature
      let decorated2: any = baseRate;
      decorated2 = new SaturdayDeliveryDecorator(decorated2);
      decorated2 = new FragileHandlingDecorator(decorated2);
      decorated2 = new SignatureDecorator(decorated2);

      expect(decorated1.getCost()).toBe(decorated2.getCost());
      expect(decorated1.getFees().length).toBe(3);
      expect(decorated2.getFees().length).toBe(3);
    });

    it('should not modify wrapped component', () => {
      const base = new BaseRate(100, 'Base Rate');
      const decorated = new SignatureDecorator(base);

      expect(base.getCost()).toBe(100);
      expect(base.getFees()).toEqual([]);
      expect(decorated.getCost()).toBe(105.5);
    });
  });

  describe('applyFees() Helper Function', () => {
    it('should apply no fees when all options are false', () => {
      const options: ShippingOptions = {
        speed: 'standard',
        signatureRequired: false,
        insurance: false,
        fragileHandling: false,
        saturdayDelivery: false,
      };

      const decorated = applyFees(baseRate, options);
      expect(decorated.getCost()).toBe(100);
      expect(decorated.getFees()).toEqual([]);
    });

    it('should apply signature fee when required', () => {
      const options: ShippingOptions = {
        speed: 'standard',
        signatureRequired: true,
        insurance: false,
        fragileHandling: false,
        saturdayDelivery: false,
      };

      const decorated = applyFees(baseRate, options);
      expect(decorated.getCost()).toBe(105.5);
      expect(decorated.getFees().length).toBe(1);
      expect(decorated.getFees()[0]?.type).toBe('signature');
    });

    it('should apply insurance fee with insured value', () => {
      const options: ShippingOptions = {
        speed: 'standard',
        signatureRequired: false,
        insurance: true,
        fragileHandling: false,
        saturdayDelivery: false,
        insuredValue: 1000,
      };

      const decorated = applyFees(baseRate, options);
      expect(decorated.getCost()).toBe(110); // 100 + 10
      expect(decorated.getFees().length).toBe(1);
      expect(decorated.getFees()[0]?.type).toBe('insurance');
    });

    it('should apply fragile handling fee', () => {
      const options: ShippingOptions = {
        speed: 'standard',
        signatureRequired: false,
        insurance: false,
        fragileHandling: true,
        saturdayDelivery: false,
      };

      const decorated = applyFees(baseRate, options);
      expect(decorated.getCost()).toBe(110);
      expect(decorated.getFees().length).toBe(1);
      expect(decorated.getFees()[0]?.type).toBe('fragilehandling');
    });

    it('should apply Saturday delivery fee', () => {
      const options: ShippingOptions = {
        speed: 'standard',
        signatureRequired: false,
        insurance: false,
        fragileHandling: false,
        saturdayDelivery: true,
      };

      const decorated = applyFees(baseRate, options);
      expect(decorated.getCost()).toBe(115);
      expect(decorated.getFees().length).toBe(1);
      expect(decorated.getFees()[0]?.type).toBe('saturdaydelivery');
    });

    it('should apply all fees in order', () => {
      const options: ShippingOptions = {
        speed: 'standard',
        signatureRequired: true,
        insurance: true,
        fragileHandling: true,
        saturdayDelivery: true,
        insuredValue: 500,
      };

      const decorated = applyFees(baseRate, options);
      expect(decorated.getCost()).toBe(100 + 5.5 + 5 + 10 + 15); // 135.50
      expect(decorated.getFees().length).toBe(4);
    });

    it('should skip insurance if insuredValue missing', () => {
      const options: ShippingOptions = {
        speed: 'standard',
        signatureRequired: false,
        insurance: true, // true but no value
        fragileHandling: false,
        saturdayDelivery: false,
      };

      const decorated = applyFees(baseRate, options);
      expect(decorated.getCost()).toBe(100);
      expect(decorated.getFees()).toEqual([]);
    });
  });
});
