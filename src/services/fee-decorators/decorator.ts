import { Fee, ShippingOptions } from '@/src/types/domain';
import { FragileHandlingDecorator } from './FragileHandlingDecorator';
import { InsuranceDecorator } from './InsuranceDecorator';
import { SaturdayDeliveryDecorator } from './SaturdayDeliveryDecorator';
import { SignatureDecorator } from './SignatureDecorator';

export interface RateComponent {
  getCost(): number;
  getDescription(): string;
  getFees(): Fee[];
}

export class BaseRate implements RateComponent {
  constructor(
    private baseAmount: number,
    private serviceName: string
  ) {}

  getCost(): number {
    return this.baseAmount;
  }

  getDescription(): string {
    return this.serviceName;
  }

  getFees(): Fee[] {
    return [];
  }
}

/**
 * Applies additional fees to a base rate component based on shipping options.
 * Decorators are stacked in sequence to dynamically add fees.
 *
 * @param baseRate - The base rate component to decorate
 * @param options - Shipping options that determine which fees to apply
 * @returns A fully decorated RateComponent with all applicable fees
 */
export function applyFees(baseRate: RateComponent, options: ShippingOptions): RateComponent {
  let decoratedRate: RateComponent = baseRate;

  // Apply decorators based on options
  if (options.signatureRequired) {
    decoratedRate = new SignatureDecorator(decoratedRate);
  }

  if (options.insurance && options.insuredValue) {
    decoratedRate = new InsuranceDecorator(decoratedRate, options.insuredValue);
  }

  if (options.fragileHandling) {
    decoratedRate = new FragileHandlingDecorator(decoratedRate);
  }

  if (options.saturdayDelivery) {
    decoratedRate = new SaturdayDeliveryDecorator(decoratedRate);
  }

  return decoratedRate;
}
