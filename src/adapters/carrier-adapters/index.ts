import { carrierConfigManager } from '@/src/config/carrier-config';
import { CarrierName } from '@/src/types/domain';
import { FedExAdapter } from './FedExAdapter';
import { CarrierAdapter } from './adapter';

const adapters: Record<CarrierName, CarrierAdapter> = {
  FedEx: new FedExAdapter(carrierConfigManager.getCarrierCredentials('FedEx')),
};

export function getCarrierAdapter(carrier: CarrierName): CarrierAdapter {
  const adapter = adapters[carrier];
  if (!adapter) {
    throw new Error(`Unknown carrier: ${carrier}`);
  }
  return adapter;
}
