import { Fee } from '@/src/types/domain';
import { RateDecorator } from './RateDecorator';
import { RateComponent } from './decorator';

export class InsuranceDecorator extends RateDecorator {
  private insuredValue: number;

  constructor(component: RateComponent, insuredValue: number) {
    super(component);
    this.insuredValue = insuredValue;
  }

  private calculateInsuranceFee(): number {
    // $1 per $100 of value, minimum $2.50
    const fee = Math.max((this.insuredValue / 100) * 1, 2.5);
    return Math.round(fee * 100) / 100;
  }

  override getCost(): number {
    return this.wrappedComponent.getCost() + this.calculateInsuranceFee();
  }

  override getFees(): Fee[] {
    const insuranceFee = this.calculateInsuranceFee();
    return [
      ...this.wrappedComponent.getFees(),
      {
        type: 'insurance',
        amount: insuranceFee,
        description: `Insurance: $${this.insuredValue}`,
      },
    ];
  }

  override getDescription(): string {
    return `${this.wrappedComponent.getDescription()} + Insurance`;
  }
}
