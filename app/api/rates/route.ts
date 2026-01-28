import { getCarrierAdapter } from '@/src/adapters/carrier-adapters';
import type { RateRequest, RateResponse } from '@/src/types/domain';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/rates
 *
 * Server-side endpoint for fetching shipping rates from carrier APIs
 *
 * This runs on the server, so it can make requests to external APIs without CORS issues.
 * The client (browser) cannot call external APIs due to CORS restrictions.
 *
 * Request body: RateRequest
 * Response: RateResponse with rates or errors
 */
export async function POST(request: NextRequest): Promise<NextResponse<RateResponse>> {
  try {
    console.log('📨 [API] POST /api/rates - Received request');

    // Parse the request body
    const rateRequest = (await request.json()) as RateRequest;

    console.log('📋 [API] RateRequest data:', {
      package: rateRequest.package,
      origin: rateRequest.origin,
      destination: rateRequest.destination,
      options: rateRequest.options,
    });

    const rateResponse: RateResponse = {
      requestId: `api-${Date.now()}`,
      rates: [],
      errors: [],
      timestamp: new Date(),
    };

    // Fetch rates from FedEx
    try {
      console.log('🔑 [API] Getting FedEx adapter instance...');
      const fedexAdapter = getCarrierAdapter('FedEx');

      console.log('📨 [API] Calling FedEx adapter.fetchRates()...');
      const fedexRates = await fedexAdapter.fetchRates(rateRequest);

      console.log(`✅ [API] Successfully fetched ${fedexRates.length} rates from FedEx`);
      console.log(
        '💰 [API] Rates details:',
        fedexRates.map((r) => ({
          id: r.id,
          carrier: r.carrier,
          serviceName: r.serviceName,
          speed: r.speed,
          totalCost: r.totalCost,
          estimatedDeliveryDate: r.estimatedDeliveryDate,
        }))
      );

      rateResponse.rates = fedexRates;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : '';

      console.error('❌ [API] Error fetching from FedEx:', errorMessage);
      console.error('❌ [API] Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: errorMessage,
        stack: errorStack,
      });

      rateResponse.errors.push({
        carrier: 'FedEx',
        message: errorMessage,
        recoverable: true,
      });
    }

    console.log('📊 [API] Final response:', {
      rateCount: rateResponse.rates.length,
      errorCount: rateResponse.errors.length,
      timestamp: rateResponse.timestamp,
    });

    return NextResponse.json(rateResponse);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error('❌ [API] Error processing request:', errorMessage);

    const errorResponse: RateResponse = {
      requestId: `api-error-${Date.now()}`,
      rates: [],
      errors: [
        {
          carrier: 'FedEx',
          message: `API Error: ${errorMessage}`,
          recoverable: true,
        },
      ],
      timestamp: new Date(),
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
