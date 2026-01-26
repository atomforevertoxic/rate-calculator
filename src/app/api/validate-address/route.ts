// Mark the file as a Server Action
'use server';

import { createAddressValidationChain, validateWithChain } from '@/src/services/validators';
import { ValidationError } from '@/src/services/validators/validation-chain';
import { Address } from '@/src/types/domain';
import { z } from 'zod';

// Zod schema for basic format validation
const addressSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  street1: z.string().min(1, 'Street Address 1 is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().length(2, 'State must be 2 characters'),
  postalCode: z.string().min(5, 'Postal Code must be at least 5 characters'),
  country: z.string().length(2, 'Country must be 2 characters'),
  street2: z.string().optional(),
  phone: z.string().optional(),
});

/**
 * Server Action to validate an address.
 * It uses Zod for initial schema validation and then applies a custom validation chain for business logic.
 *
 * @param prevState - The previous state passed by useFormState.
 * @param formData - FormData object containing address fields.
 * @returns A state object indicating validation status and errors if any.
 */
export async function validateAddress(
  _prevState: { errors: ValidationError[] } | null, // Ignored prevState (never read)
  formData: FormData
): Promise<{ errors: ValidationError[] }> {
  // Convert FormData to a plain object and cast to Address type.
  // Ensure all fields are explicitly extracted to match the Zod schema and Address type.
  const addressData: Address = {
    name: formData.get('name')?.toString() || '',
    street1: formData.get('street1')?.toString() || '',
    city: formData.get('city')?.toString() || '',
    state: formData.get('state')?.toString() || '',
    postalCode: formData.get('postalCode')?.toString() || '',
    country: formData.get('country')?.toString() || '',
    street2: formData.get('street2')?.toString() || undefined, // Optional fields correctly handled
    phone: formData.get('phone')?.toString() || undefined, // Optional fields correctly handled
  };

  // 1. Zod validation for basic schema and type checks
  const zodResult = addressSchema.safeParse(addressData);

  if (!zodResult.success) {
    const fieldErrors = zodResult.error.flatten().fieldErrors;
    const errors: ValidationError[] = (
      Object.keys(fieldErrors) as Array<keyof typeof fieldErrors>
    ).map((field) => ({
      field,
      message: fieldErrors[field]?.[0] || 'Invalid field', // Use the first error message with fallback
      code: 'ZOD_VALIDATION_ERROR',
    }));
    // Return a structured state compatible with useFormState
    return { errors };
  }

  // 2. Apply custom validation chain for business logic
  const address: Address = zodResult.data;
  const validationChainResult = await validateWithChain(address, createAddressValidationChain());

  if (validationChainResult.errors.length > 0) {
    // Return structured state with errors from the validation chain
    return { errors: validationChainResult.errors };
  }

  // If all validations pass
  return { errors: [] };
}
