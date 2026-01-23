import { ValidationResult, Validator } from './validation-chain';

export abstract class BaseValidator<T> implements Validator<T> {
  private next: Validator<T> | null = null;

  setNext(validator: Validator<T>): Validator<T> {
    this.next = validator;
    return validator;
  }

  validate(data: T): ValidationResult {
    const result = this.doValidation(data);

    if (!result.isValid) {
      return result;
    }

    if (this.next) {
      return this.next.validate(data);
    }

    return result;
  }

  protected abstract doValidation(data: T): ValidationResult;

  protected createSuccessResult(): ValidationResult {
    return { isValid: true, errors: [] };
  }

  protected createErrorResult(field: string, message: string, code: string): ValidationResult {
    return {
      isValid: false,
      errors: [{ field, message, code }],
    };
  }
}
