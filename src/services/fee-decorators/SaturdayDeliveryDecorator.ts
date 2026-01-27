import { Fee } from '@/src/types/domain';
import { RateDecorator } from './RateDecorator';
import { RateComponent } from './decorator';

export class SaturdayDeliveryDecorator extends RateDecorator {
  private static readonly SATURDAY_DELIVERY_FEE = 15.0;

  constructor(component: RateComponent) {
    super(component);
  }

  override getCost(): number {
    return this.wrappedComponent.getCost() + SaturdayDeliveryDecorator.SATURDAY_DELIVERY_FEE;
  }

  override getFees(): Fee[] {
    return [
      ...this.wrappedComponent.getFees(),
      {
        type: 'saturdaydelivery',
        amount: SaturdayDeliveryDecorator.SATURDAY_DELIVERY_FEE,
        description: 'Saturday Delivery',
      },
    ];
  }

  override getDescription(): string {
    return `${this.wrappedComponent.getDescription()} + Saturday Delivery`;
  }
}
