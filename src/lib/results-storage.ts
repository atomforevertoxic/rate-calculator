// Defines constants and utility functions for rate results persistence to localStorage.
// Implements a 30-minute TTL (time to live) cache for shipping rate results.

import type { RateRequest, RateResponse } from '@/src/types/domain';

// Storage configuration
export const RESULTS_STORAGE_KEY = 'shipping-rate-results';
export const RESULTS_TTL_MINUTES = 30;
export const RESULTS_TTL_MS = RESULTS_TTL_MINUTES * 60 * 1000; // 30 minutes in milliseconds

/**
 * Interface for stored rate results including metadata
 */
export interface StoredResults {
  response: RateResponse;
  request: RateRequest;
  timestamp: number; // milliseconds since epoch
}

/**
 * Saves rate results to localStorage with timestamp
 * @param request The original rate request
 * @param response The rate response from the API
 */
export function saveResults(request: RateRequest, response: RateResponse): void {
  try {
    const storedResults: StoredResults = {
      response,
      request,
      timestamp: Date.now(),
    };

    const serializedResults = JSON.stringify(storedResults);
    localStorage.setItem(RESULTS_STORAGE_KEY, serializedResults);

    console.log('💾 [Results Storage] Saved rate results to localStorage', {
      requestId: response.requestId,
      timestamp: new Date(storedResults.timestamp).toISOString(),
      expiresIn: `${RESULTS_TTL_MINUTES} minutes`,
    });
  } catch (error) {
    console.error('❌ [Results Storage] Error saving results to localStorage:', error);
    // Potentially handle QuotaExceededError for browsers with limited storage
  }
}

/**
 * Loads cached rate results from localStorage
 * Returns null if:
 * - Results not found in localStorage
 * - Results have expired (beyond TTL)
 * @returns The stored results if valid, otherwise null
 */
export function loadResults(): StoredResults | null {
  try {
    const serializedResults = localStorage.getItem(RESULTS_STORAGE_KEY);

    if (serializedResults === null) {
      console.log('📭 [Results Storage] No cached results found in localStorage');
      return null;
    }

    const storedResults = JSON.parse(serializedResults) as StoredResults;

    // Check if results have expired
    const currentTime = Date.now();
    const age = currentTime - storedResults.timestamp;

    if (age > RESULTS_TTL_MS) {
      console.log('⏰ [Results Storage] Cached results expired', {
        age: `${Math.round(age / 1000 / 60)} minutes`,
        maxAge: `${RESULTS_TTL_MINUTES} minutes`,
      });

      // Clear expired results
      clearResults();
      return null;
    }

    // Results are still valid
    const remainingTime = RESULTS_TTL_MS - age;
    console.log('✅ [Results Storage] Loaded valid cached results from localStorage', {
      requestId: storedResults.response.requestId,
      age: `${Math.round(age / 1000)} seconds`,
      expiresIn: `${Math.round(remainingTime / 1000 / 60)} minutes`,
    });

    return storedResults;
  } catch (error) {
    console.error('❌ [Results Storage] Error loading results from localStorage:', error);
    // Handle JSON parse errors gracefully
    return null;
  }
}

/**
 * Clears the saved rate results from localStorage
 */
export function clearResults(): void {
  try {
    localStorage.removeItem(RESULTS_STORAGE_KEY);
    console.log('🗑️ [Results Storage] Cleared cached results from localStorage');
  } catch (error) {
    console.error('❌ [Results Storage] Error clearing results from localStorage:', error);
  }
}

/**
 * Gets the approximate remaining time for cached results
 * Returns null if no cached results exist or they have expired
 */
export function getResultsExpirationTime(): number | null {
  try {
    const serializedResults = localStorage.getItem(RESULTS_STORAGE_KEY);
    if (serializedResults === null) return null;

    const storedResults = JSON.parse(serializedResults) as StoredResults;
    const age = Date.now() - storedResults.timestamp;

    if (age > RESULTS_TTL_MS) {
      return null;
    }

    return RESULTS_TTL_MS - age;
  } catch {
    return null;
  }
}
