import { Package } from '@/src/types/domain';
import { BaseValidator } from '../BaseValidator';
import { ValidationResult } from '../validation-chain';

export class WeightValidator extends BaseValidator<Package> {
  private readonly MAX_WEIGHT_LBS = 150;
  private readonly MAX_WEIGHT_KG = 68;
  private readonly MIN_WEIGHT = 0.01;

  protected doValidation(data: Package): ValidationResult {
    const { weight } = data;

    if (weight.value <= 0) {
      return this.createErrorResult('weight', 'Weight must be greater than zero', 'INVALID_WEIGHT');
    }

    if (weight.value < this.MIN_WEIGHT) {
      return this.createErrorResult(
        'weight',
        `Weight must be at least ${this.MIN_WEIGHT} ${weight.unit}`,
        'WEIGHT_TOO_SMALL'
      );
    }

    let maxWeight: number;
    let maxWeightOtherUnit: number;

    if (weight.unit === 'lbs') {
      maxWeight = this.MAX_WEIGHT_LBS;
      maxWeightOtherUnit = this.MAX_WEIGHT_KG;
    } else {
      maxWeight = this.MAX_WEIGHT_KG;
      maxWeightOtherUnit = this.MAX_WEIGHT_LBS;
    }

    if (weight.value > maxWeight) {
      return this.createErrorResult(
        'weight',
        `Weight cannot exceed ${maxWeight} ${weight.unit} (approx ${maxWeightOtherUnit} ${weight.unit === 'lbs' ? 'kg' : 'lbs'})`,
        'WEIGHT_EXCEEDED'
      );
    }

    return this.createSuccessResult();
  }
}
