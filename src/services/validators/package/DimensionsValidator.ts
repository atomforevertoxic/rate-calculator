import { Package } from '@/src/types/domain';
import { BaseValidator } from '../BaseValidator';
import { ValidationResult } from '../validation-chain';

export class DimensionsValidator extends BaseValidator<Package> {
  private readonly MAX_LENGTH = 108;
  private readonly MAX_GIRTH = 165;
  private readonly MIN_DIMENSION = 0.1;

  protected doValidation(data: Package): ValidationResult {
    const { dimensions } = data;

    if (dimensions.length <= 0 || dimensions.width <= 0 || dimensions.height <= 0) {
      return this.createErrorResult(
        'dimensions',
        'All dimensions must be greater than zero',
        'INVALID_DIMENSIONS'
      );
    }

    if (
      dimensions.length < this.MIN_DIMENSION ||
      dimensions.width < this.MIN_DIMENSION ||
      dimensions.height < this.MIN_DIMENSION
    ) {
      return this.createErrorResult(
        'dimensions',
        `Dimensions must be at least ${this.MIN_DIMENSION} ${dimensions.unit}`,
        'DIMENSIONS_TOO_SMALL'
      );
    }

    let lengthIn = dimensions.length;
    let widthIn = dimensions.width;
    let heightIn = dimensions.height;

    if (dimensions.unit === 'cm') {
      lengthIn = this.cmToInches(dimensions.length);
      widthIn = this.cmToInches(dimensions.width);
      heightIn = this.cmToInches(dimensions.height);
    }

    if (lengthIn > this.MAX_LENGTH) {
      return this.createErrorResult(
        'dimensions.length',
        `Length cannot exceed ${this.MAX_LENGTH} inches (${Math.round(this.MAX_LENGTH * 2.54)} cm)`,
        'LENGTH_EXCEEDED'
      );
    }

    const girth = 2 * (widthIn + heightIn);
    const total = lengthIn + girth;

    if (total > this.MAX_GIRTH) {
      return this.createErrorResult(
        'dimensions',
        `Package size exceeds carrier limits. Length + 2*(Width + Height) cannot exceed ${this.MAX_GIRTH} inches`,
        'GIRTH_EXCEEDED'
      );
    }

    return this.createSuccessResult();
  }

  private cmToInches(cm: number): number {
    return cm / 2.54;
  }
}
