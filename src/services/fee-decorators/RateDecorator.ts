import { Fee } from '@/src/types/domain';
import { RateComponent } from './decorator';

export abstract class RateDecorator implements RateComponent {
  protected wrappedComponent: RateComponent;

  constructor(component: RateComponent) {
    this.wrappedComponent = component;
  }

  getCost(): number {
    return this.wrappedComponent.getCost();
  }

  getDescription(): string {
    return this.wrappedComponent.getDescription();
  }

  getFees(): Fee[] {
    return this.wrappedComponent.getFees();
  }
}
