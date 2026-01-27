import { getCarrierAdapter } from '@/src/adapters/carrier-adapters';
import {
  CarrierError,
  CarrierName,
  RateRequest,
  RateResponse,
  ShippingRate,
} from '@/src/types/domain';
import { randomUUID } from 'crypto';

export class RateService {
  async fetchAllRates(request: RateRequest): Promise<RateResponse> {
    const requestId = randomUUID();
    const carriers = request.carriersFilter ?? ['FedEx'];

    const results = await Promise.allSettled(
      carriers.map((carrier) => this.fetchCarrierRate(carrier, request))
    );

    const rates: ShippingRate[] = [];
    const errors: CarrierError[] = [];

    results.forEach((result, index) => {
      const carrier = carriers[index];
      if (!carrier) return;

      if (result.status === 'fulfilled') {
        rates.push(...result.value);
      } else {
        const error = result.reason;
        errors.push({
          carrier,
          message: error instanceof Error ? error.message : String(error),
          recoverable: this.isRecoverableError(error),
        });
      }
    });

    const sortedRates = this.sortRates(rates);

    return {
      requestId,
      rates: sortedRates,
      errors,
      timestamp: new Date(),
    };
  }

  private async fetchCarrierRate(
    carrier: CarrierName,
    request: RateRequest
  ): Promise<ShippingRate[]> {
    try {
      const adapter = getCarrierAdapter(carrier);
      return await adapter.fetchRates(request);
    } catch (error) {
      if (this.isRecoverableError(error)) {
        return this.retryWithBackoff(carrier, request, 3);
      }
      throw error;
    }
  }

  private async retryWithBackoff(
    carrier: CarrierName,
    request: RateRequest,
    maxRetries: number
  ): Promise<ShippingRate[]> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const adapter = getCarrierAdapter(carrier);
        return await adapter.fetchRates(request);
      } catch (error) {
        if (attempt === maxRetries - 1) {
          throw error;
        }

        const delayMs = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    return [];
  }

  private sortRates(rates: ShippingRate[]): ShippingRate[] {
    return [...rates].sort((a, b) => {
      if (a.totalCost !== b.totalCost) {
        return a.totalCost - b.totalCost;
      }

      return a.estimatedDeliveryDate.getTime() - b.estimatedDeliveryDate.getTime();
    });
  }

  private isRecoverableError(error: unknown): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      return (
        message.includes('timeout') ||
        message.includes('network') ||
        message.includes('connection') ||
        message.includes('fetch failed') ||
        message.includes('econnrefused') ||
        message.includes('enotfound')
      );
    }

    return false;
  }
}
