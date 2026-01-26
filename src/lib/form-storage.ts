// Defines constants and utility functions for form state persistence to localStorage.

import { Address, Package, ShippingOptions } from '@/src/types/domain';

// This interface defines the shape of the form data that will be stored in localStorage.
// It should align with the main formData state in RateCalculatorForm.
export interface FormDataState {
  package: Package;
  origin: Address;
  destination: Address;
  options: ShippingOptions;
}

export const FORM_STORAGE_KEY = 'rate-calculator-form-state';

/**
 * Saves the current form state to localStorage.
 * @param state The entire form data object to save.
 */
export function saveFormState(state: FormDataState): void {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(FORM_STORAGE_KEY, serializedState);
  } catch (error) {
    console.error('Error saving form state to localStorage:', error);
    // Potentially handle QuotaExceededError for browsers
  }
}

/**
 * Loads the form state from localStorage.
 * @returns The parsed form data object if found, otherwise null.
 */
export function loadFormState(): FormDataState | null {
  try {
    const serializedState = localStorage.getItem(FORM_STORAGE_KEY);
    if (serializedState === null) {
      return null;
    }
    // Attempt to parse and return
    return JSON.parse(serializedState) as FormDataState;
  } catch (error) {
    console.error('Error loading form state from localStorage:', error);
    // Handle JSON parse errors gracefully
    return null;
  }
}

/**
 * Clears the saved form state from localStorage.
 */
export function clearFormState(): void {
  try {
    localStorage.removeItem(FORM_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing form state from localStorage:', error);
  }
}
