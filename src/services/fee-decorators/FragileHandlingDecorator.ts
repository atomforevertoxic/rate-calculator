import { Fee } from '@/src/types/domain';
import { RateDecorator } from './RateDecorator';
import { RateComponent } from './decorator';

export class FragileHandlingDecorator extends RateDecorator {
  private static readonly FRAGILE_HANDLING_FEE = 10.0;

  constructor(component: RateComponent) {
    super(component);
  }

  override getCost(): number {
    return this.wrappedComponent.getCost() + FragileHandlingDecorator.FRAGILE_HANDLING_FEE;
  }

  override getFees(): Fee[] {
    return [
      ...this.wrappedComponent.getFees(),
      {
        type: 'fragilehandling',
        amount: FragileHandlingDecorator.FRAGILE_HANDLING_FEE,
        description: 'Fragile Handling',
      },
    ];
  }

  override getDescription(): string {
    return `${this.wrappedComponent.getDescription()} + Fragile Handling`;
  }
}
