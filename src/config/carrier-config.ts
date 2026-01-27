import { CarrierName } from '@/src/types/domain';

export interface CarrierCredentials {
  apiKey: string;
  apiSecret: string;
  endpoint: string;
  timeout: number;
  accountNumber?: string;
}

export type CarrierConfiguration = {
  [key in CarrierName]: CarrierCredentials;
};

class CarrierConfigManager {
  private static instance: CarrierConfigManager | null = null;
  private configuration: CarrierConfiguration;

  private constructor() {
    this.configuration = this.loadConfiguration();
  }

  static getInstance(): CarrierConfigManager {
    if (!CarrierConfigManager.instance) {
      CarrierConfigManager.instance = new CarrierConfigManager();
    }

    return CarrierConfigManager.instance;
  }

  getCarrierCredentials(carrier: CarrierName): CarrierCredentials {
    const credentials = this.configuration[carrier];

    if (!credentials) {
      throw new Error(
        `Carrier credentials not found for carrier: ${carrier}. Available carriers: ${Object.keys(this.configuration).join(', ')}`
      );
    }

    return credentials;
  }

  private loadConfiguration(): CarrierConfiguration {
    const config: CarrierConfiguration = {
      FedEx: {
        apiKey: process.env.FEDEX_API_KEY ?? '',
        apiSecret: process.env.FEDEX_API_SECRET ?? '',
        endpoint: 'https://apis-sandbox.fedex.com',
        timeout: 5000,
        accountNumber: process.env.FEDEX_ACCOUNT_NUMBER ?? '',
      },
    };

    return config;
  }
}

export const carrierConfigManager = CarrierConfigManager.getInstance();
