// Custom hook for persisting and loading form state from localStorage.
'use client';

import {
  clearFormState,
  FormDataState,
  loadFormState,
  saveFormState,
} from '@/src/lib/form-storage';
import { usePathname } from 'next/navigation'; // Assuming Next.js for routing
import { useCallback, useEffect, useState } from 'react';

/**
 * Custom hook to manage form state persistence to localStorage.
 * Provides the current form data, and functions to update/clear storage.
 *
 * @param initialFormState The initial state of the form.
 * @returns An object containing the current form data, and functions to update/clear storage.
 */
export function useFormPersistence(initialFormState: FormDataState) {
  const [formData, setFormData] = useState<FormDataState>(initialFormState);
  const pathname = usePathname(); // Get current path to determine when to clear data (optional usage)

  // Effect to load form state when the component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Ensure localStorage is available
      const savedState = loadFormState();
      if (savedState) {
        // In a real application, you might show a "Resume previous session?" prompt here.
        // For this implementation, we'll just load it directly.
        setFormData(savedState);
      }
    }
  }, []); // Run only once on mount

  // Effect to save form state whenever formData changes
  // Debounce saving to prevent excessive writes on rapid changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Ensure localStorage is available
      const handler = setTimeout(() => {
        saveFormState(formData);
      }, 500); // Debounce for 500ms

      return () => {
        clearTimeout(handler);
      };
    }
    return () => {}; // Return empty cleanup function if window is undefined
  }, [formData]); // Re-run when formData changes

  // Optional: Effect to clear state if navigating away from the form's primary route
  useEffect(() => {
    // You might customize this logic based on your application's routing.
    // For example, only clear if they navigate away from '/rate-calculator'.
    // This is currently commented out to avoid clearing on every route change.
    // console.log(`Current path: ${pathname}`);
    // if (!pathname.startsWith('/rate-calculator')) { // Example condition
    //   clearFormState();
    // }
  }, [pathname]);

  /**
   * Updates the form data and persists it to storage.
   * @param newFormState The new full form state to update.
   */
  const updateFormData = useCallback((newFormState: FormDataState) => {
    setFormData(newFormState);
  }, []);

  /**
   * Resets the form to its initial state and clears it from storage.
   */
  const resetForm = useCallback(() => {
    setFormData(initialFormState);
    if (typeof window !== 'undefined') {
      // Ensure localStorage is available
      clearFormState();
    }
  }, [initialFormState]);

  return {
    formData,
    updateFormData,
    resetForm,
  };
}
