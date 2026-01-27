import { CarrierCredentials } from '@/src/config/carrier-config';
import { Fee, PackageType, RateRequest, ServiceSpeed, ShippingRate } from '@/src/types/domain';
import { addDays, format, parseISO } from 'date-fns';
import { CarrierAdapter } from './adapter';
import {
  DELIVERY_DAYS,
  FedExAddress,
  FedExAlert,
  FedExPackagingType,
  FedExRateReplyDetail,
  FedExRateRequest,
  FedExRateResponse,
  FedExRatedShipmentDetail,
  FedExServiceType,
  RateRequestType,
  SpecialServiceType,
} from './FedExAdapter_types';

interface TokenCache {
  token: string;
  expiresAt: number;
}

const PACKAGING_LIMITS = {
  ENVELOPE: { maxKg: 0.5 },
  TUBE: { maxKg: 9.1 },
} as const;

const TOKEN_CACHE_BUFFER_MS = 5 * 60 * 1000;
const DEFAULT_TOKEN_EXPIRY_SEC = 600;
const CARRIER_NAME = 'FedEx' as const;
const DEFAULT_PICKUP_TYPE = 'DROPOFF_AT_FEDEX_LOCATION';

const ENDPOINTS = {
  RATES: '/rate/v1/rates/quotes',
  OAUTH_TOKEN: '/oauth/token',
} as const;

// Helper function: round to 2 decimal places
const roundToTwoDecimals = (num: number): number => Math.round(num * 100) / 100;

// Helper function: log warnings
const logWarning = (message: string): void => console.warn(message);

export class FedExAdapter implements CarrierAdapter {
  private baseUrl: string;
  private apiKey: string;
  private apiSecret: string;
  private timeout: number;
  private accountNumber: string;
  private tokenCache: TokenCache | null = null;
  private tokenPromise: Promise<string> | null = null;

  constructor(config: CarrierCredentials) {
    this.baseUrl = config.endpoint;
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    this.timeout = config.timeout;
    this.accountNumber = config.accountNumber!;
  }

  async fetchRates(request: RateRequest): Promise<ShippingRate[]> {
    const rawData = await this.callFedExAPI(request);
    const allRates = await this.adaptFedExResponse(rawData, request.options);
    if (request.options.speed === 'all') return allRates;

    return allRates.filter((rate) => rate.speed === request.options.speed);
  }

  private async callFedExAPI(request: RateRequest): Promise<FedExRateResponse> {
    const accessToken = await this.getAccessToken();
    const apiRequest = this.buildFedExRequest(request);

    const response = await this.fetchWithTimeout(`${this.baseUrl}${ENDPOINTS.RATES}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-locale': 'en_US',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(apiRequest),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.log('[FedEx] API Error:', errorBody);
      throw new Error(`FedEx API error (${response.status}): ${response.statusText}`);
    }

    return await response.json();
  }

  private async adaptFedExResponse(
    rateResponse: FedExRateResponse,
    options: RateRequest['options']
  ): Promise<ShippingRate[]> {
    this.handleAlerts(rateResponse.output?.alerts || []);

    const rateReplyDetails = rateResponse.output?.rateReplyDetails || [];
    if (rateReplyDetails.length === 0) return [];

    const rates: ShippingRate[] = [];

    for (let index = 0; index < rateReplyDetails.length; index++) {
      const detail = rateReplyDetails[index];
      if (!detail) continue;

      const ratedShipment = this.selectRate(detail.ratedShipmentDetails);
      if (!ratedShipment) continue;

      const totalNetCharge = this.extractTotalCharge(ratedShipment);
      const baseRate = ratedShipment.totalBaseCharge ?? 0;

      const additionalFees: Fee[] =
        ratedShipment.shipmentRateDetail?.surCharges?.map((surcharge) => ({
          type: this.mapSurchargeType(surcharge.type),
          amount: surcharge.amount,
          description: surcharge.description || surcharge.type,
        })) || [];

      rates.push({
        id: `fedex-${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${index}`,
        carrier: CARRIER_NAME,
        serviceCode: detail.serviceDescription?.code || detail.serviceType,
        serviceName: detail.serviceName,
        speed: this.mapServiceTypeToSpeed(detail.serviceType),
        features: this.extractFeatures(detail, options),
        baseRate,
        additionalFees,
        totalCost: roundToTwoDecimals(totalNetCharge),
        estimatedDeliveryDate: this.parseDeliveryDate(detail),
        guaranteedDelivery: !detail.operationalDetail?.ineligibleForMoneyBackGuarantee,
      });
    }

    return rates;
  }

  private extractTotalCharge(ratedShipment: FedExRatedShipmentDetail): number {
    if (typeof ratedShipment.totalNetChargeWithDutiesAndTaxes === 'number') {
      return ratedShipment.totalNetChargeWithDutiesAndTaxes;
    }
    if (typeof ratedShipment.totalNetCharge === 'number') {
      return ratedShipment.totalNetCharge;
    }
    if (ratedShipment.totalNetCharge?.amount != null) {
      return ratedShipment.totalNetCharge.amount;
    }

    throw new Error('Could not extract total charge from FedEx response');
  }

  private buildFedExRequest(request: RateRequest): FedExRateRequest {
    const weightUnit = request.package.weight.unit === 'lbs' ? 'LB' : 'KG';
    const dimensionUnit = request.package.dimensions.unit === 'in' ? 'IN' : 'CM';
    const packagingType = this.getPackagingType(request.package.type, request.package.weight);

    const requestedShipment: FedExRateRequest['requestedShipment'] = {
      shipper: { address: this.buildFedExAddress(request.origin) },
      recipient: { address: this.buildFedExAddress(request.destination) },
      shipDateStamp: format(new Date(), 'yyyy-MM-dd'),
      rateRequestType: [RateRequestType.LIST],
      requestedPackageLineItems: [
        {
          weight: {
            units: weightUnit,
            value: roundToTwoDecimals(request.package.weight.value),
          },
          dimensions: {
            length: roundToTwoDecimals(request.package.dimensions.length),
            width: roundToTwoDecimals(request.package.dimensions.width),
            height: roundToTwoDecimals(request.package.dimensions.height),
            units: dimensionUnit,
          },
          ...(request.options.signatureRequired && {
            specialServices: {
              specialServiceTypes: [SpecialServiceType.SIGNATURE_OPTION],
            },
          }),
        },
      ],
      totalPackageCount: '1',
      packagingType,
      pickupType: DEFAULT_PICKUP_TYPE,
    };

    return {
      accountNumber: { value: this.accountNumber },
      requestedShipment,
      returnTransitTimes: true,
    };
  }

  private getPackagingType(
    packageType: PackageType,
    weight: RateRequest['package']['weight']
  ): FedExPackagingType {
    const weightKg = weight.unit === 'lbs' ? weight.value * 0.453592 : weight.value;

    if (packageType === 'envelope') {
      if (weightKg > PACKAGING_LIMITS.ENVELOPE.maxKg) {
        throw new Error(
          `FedEx Envelope max weight is ${PACKAGING_LIMITS.ENVELOPE.maxKg} kg. Your package weighs ${weightKg.toFixed(2)} kg.`
        );
      }
      return FedExPackagingType.FEDEX_ENVELOPE;
    }

    if (packageType === 'tube') {
      if (weightKg > PACKAGING_LIMITS.TUBE.maxKg) {
        throw new Error(
          `FedEx Tube max weight is ${PACKAGING_LIMITS.TUBE.maxKg} kg. Your package weighs ${weightKg.toFixed(2)} kg.`
        );
      }
      return FedExPackagingType.FEDEX_TUBE;
    }

    return FedExPackagingType.YOUR_PACKAGING;
  }

  private buildFedExAddress(address: RateRequest['origin']): FedExAddress {
    const streetLines = [address.street1];
    if (address.street2) streetLines.push(address.street2);

    const stateCode = this.getStateCode(address.state);

    return {
      streetLines,
      city: address.city,
      ...(stateCode && { stateOrProvinceCode: stateCode }),
      postalCode: address.postalCode,
      countryCode: address.country,
    };
  }

  private getStateCode(stateISO: string | undefined): string | undefined {
    if (!stateISO) return undefined;

    return stateISO.split('-')[1];
  }

  private mapServiceTypeToSpeed(serviceType: FedExServiceType): ServiceSpeed {
    const type = serviceType as string;

    if (
      type === 'FEDEX_INTERNATIONAL_FIRST' ||
      type === 'INTERNATIONAL_FIRST' ||
      type === 'PRIORITY_OVERNIGHT' ||
      type === 'FIRST_OVERNIGHT' ||
      type === 'STANDARD_OVERNIGHT'
    ) {
      return 'overnight';
    }

    if (
      type === 'FEDEX_INTERNATIONAL_PRIORITY' ||
      type === 'FEDEX_2_DAY' ||
      type === 'FEDEX_2_DAY_AM'
    ) {
      return 'two-day';
    }

    if (
      type === 'FEDEX_INTERNATIONAL_ECONOMY' ||
      type === 'INTERNATIONAL_ECONOMY' ||
      type === 'FEDEX_EXPRESS_SAVER' ||
      type === 'FEDEX_GROUND'
    ) {
      return 'standard';
    }

    return 'economy';
  }

  private extractFeatures(detail: FedExRateReplyDetail, options: RateRequest['options']): string[] {
    const features: string[] = [];

    if (options.signatureRequired) {
      features.push('Signature Required');
    }

    if (options.saturdayDelivery) {
      features.push('Saturday Delivery');
    }

    if (options.fragileHandling) {
      features.push('Fragile Handling');
    }

    if (options.insurance) {
      features.push(`Insurance: $${options.insuredValue}`);
    }

    if (detail.operationalDetail?.deliveryDay) {
      features.push(`Delivers ${detail.operationalDetail.deliveryDay}`);
    }
    if (detail.operationalDetail?.transitTime) {
      features.push(this.formatTransitTime(detail.operationalDetail.transitTime));
    }
    if (!detail.operationalDetail?.ineligibleForMoneyBackGuarantee) {
      features.push('Money-Back Guarantee');
    }

    return features;
  }

  private formatTransitTime(transitTime: string): string {
    const match = transitTime.match(/(\d+)_DAY/i);
    if (match && match[1]) {
      const days = parseInt(match[1], 10);
      return `${days} ${days === 1 ? 'Day' : 'Days'}`;
    }

    const words: Record<string, number> = {
      ONE: 1,
      TWO: 2,
      THREE: 3,
      FOUR: 4,
      FIVE: 5,
      SIX: 6,
      SEVEN: 7,
      EIGHT: 8,
      NINE: 9,
      TEN: 10,
    };
    const first = transitTime.split('_')[0];
    if (first && words[first]) {
      const days = words[first];
      return `${days} ${days === 1 ? 'Day' : 'Days'}`;
    }

    return transitTime;
  }

  private parseDeliveryDate(detail: FedExRateReplyDetail): Date {
    const dateStr = detail.commit?.dateDetail?.dayCxsFormat || detail.operationalDetail?.commitDate;

    if (dateStr) {
      try {
        return parseISO(dateStr);
      } catch {
        logWarning(`FedEx: Failed to parse delivery date: ${dateStr}`);
      }
    }

    return this.estimateDeliveryDate(
      this.mapServiceTypeToSpeed(detail.serviceType),
      detail.serviceType.includes('INTERNATIONAL')
    );
  }

  private estimateDeliveryDate(speed: ServiceSpeed, isInternational: boolean): Date {
    const effectiveSpeed = speed === 'all' ? 'standard' : speed;
    const days = DELIVERY_DAYS[isInternational ? 'INTERNATIONAL' : 'DOMESTIC'][effectiveSpeed];
    return addDays(new Date(), days);
  }

  private selectRate(details: FedExRatedShipmentDetail[]): FedExRatedShipmentDetail | null {
    return (
      details.find((d) => d.rateType === 'ACCOUNT') ||
      details.find((d) => d.rateType === 'LIST') ||
      details[0] ||
      null
    );
  }

  private mapSurchargeType(type: string): string {
    const map: Record<string, string> = {
      FUEL: 'fuel',
      RESIDENTIAL_DELIVERY: 'residentialdelivery',
      SIGNATURE_OPTION: 'signature',
      DECLARED_VALUE: 'insurance',
      SATURDAY_DELIVERY: 'saturdaydelivery',
    };
    return map[type] || type.toLowerCase().replace(/_/g, '');
  }

  private handleAlerts(alerts: FedExAlert[]): void {
    const errors = alerts.filter((a) => a.alertType === 'ERROR');
    if (errors.length > 0 && errors[0]) {
      throw new Error(`FedEx API Error: ${errors[0].message}`);
    }
    alerts
      .filter((a) => a.alertType === 'WARNING')
      .forEach((a) => logWarning(`FedEx: ${a.message}`));
  }

  private async getAccessToken(): Promise<string> {
    const now = Date.now();

    if (this.tokenCache && this.tokenCache.expiresAt > now + TOKEN_CACHE_BUFFER_MS) {
      return this.tokenCache.token;
    }

    if (this.tokenPromise) {
      return this.tokenPromise;
    }

    this.tokenPromise = this.fetchNewToken(now);

    try {
      const token = await this.tokenPromise;
      return token;
    } finally {
      this.tokenPromise = null;
    }
  }

  private async fetchNewToken(now: number): Promise<string> {
    const response = await this.fetchWithTimeout(`${this.baseUrl}${ENDPOINTS.OAUTH_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.apiKey,
        client_secret: this.apiSecret,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get FedEx access token: ${response.statusText}`);
    }

    const tokenData = await response.json();

    if (!tokenData.access_token || typeof tokenData.access_token !== 'string') {
      throw new Error('FedEx API returned invalid token: access_token is missing or invalid');
    }

    this.tokenCache = {
      token: tokenData.access_token,
      expiresAt: now + (tokenData.expires_in || DEFAULT_TOKEN_EXPIRY_SEC) * 1000,
    };

    return this.tokenCache.token;
  }

  private async fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.timeout}ms`);
      }
      throw error;
    }
  }
}
