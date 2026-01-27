import { Fee } from '@/src/types/domain';
import { RateDecorator } from './RateDecorator';
import { RateComponent } from './decorator';

export class SignatureDecorator extends RateDecorator {
  private static readonly SIGNATURE_FEE = 5.5;

  constructor(component: RateComponent) {
    super(component);
  }

  override getCost(): number {
    return this.wrappedComponent.getCost() + SignatureDecorator.SIGNATURE_FEE;
  }

  override getFees(): Fee[] {
    return [
      ...this.wrappedComponent.getFees(),
      {
        type: 'signature',
        amount: SignatureDecorator.SIGNATURE_FEE,
        description: 'Signature Required',
      },
    ];
  }

  override getDescription(): string {
    return `${this.wrappedComponent.getDescription()} + Signature Required`;
  }
}
