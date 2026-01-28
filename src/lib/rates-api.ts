import type { RateRequest, RateResponse } from '@/src/types/domain';

/**
 * Fetches shipping rates from the backend API
 *
 * @param request - The rate request containing package, addresses, and shipping options
 * @returns Promise that resolves to RateResponse with rates and any errors
 * @throws Error if the API request fails
 *
 * This function is used with React 19's use() hook for Suspense integration
 */
export async function fetchRates(request: RateRequest): Promise<RateResponse> {
  const response = await fetch('/api/rates', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.message || `Failed to fetch rates: ${response.statusText}`);
  }

  const data = await response.json();

  // Ensure timestamp is a Date object if it's a string
  if (typeof data.timestamp === 'string') {
    data.timestamp = new Date(data.timestamp);
  }

  // Convert estimatedDeliveryDate strings to Date objects
  if (data.rates) {
    data.rates = data.rates.map((rate: any) => ({
      ...rate,
      estimatedDeliveryDate:
        typeof rate.estimatedDeliveryDate === 'string'
          ? new Date(rate.estimatedDeliveryDate)
          : rate.estimatedDeliveryDate,
    }));
  }

  return data as RateResponse;
}
