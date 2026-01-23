export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface Validator<T> {
  setNext(validator: Validator<T>): Validator<T>;
  validate(data: T): ValidationResult;
}
