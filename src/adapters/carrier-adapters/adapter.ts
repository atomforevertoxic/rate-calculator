import { RateRequest, ShippingRate } from '@/src/types/domain';

export interface CarrierAdapter {
  fetchRates(request: RateRequest): Promise<ShippingRate[]>;
}
