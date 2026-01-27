import { CarrierName } from '@/src/types/domain';

/**
 * Credentials required for carrier API authentication and configuration.
 * Each carrier requires API key, secret, endpoint URL, and timeout settings.
 */
export interface CarrierCredentials {
  apiKey: string;
  apiSecret: string;
  endpoint: string;
  timeout: number;
  accountNumber?: string;
}

/**
 * Type-safe carrier configuration mapping.
 * Ensures all configured carriers have credentials defined.
 */
export type CarrierConfiguration = {
  [key in CarrierName]: CarrierCredentials;
};

class CarrierConfigManager {
  private static instance: CarrierConfigManager | null = null;
  private configuration: CarrierConfiguration;

  private constructor() {
    this.configuration = this.loadConfiguration();
    this.validateConfiguration();
  }

  static getInstance(): CarrierConfigManager {
    if (!CarrierConfigManager.instance) {
      CarrierConfigManager.instance = new CarrierConfigManager();
    }

    return CarrierConfigManager.instance;
  }

  /**
   * Retrieves API credentials for a specific carrier.
   *
   * @param carrier - Carrier name (must be a valid CarrierName)
   * @returns CarrierCredentials for the specified carrier
   * @throws Error if carrier is not configured
   */
  getCarrierCredentials(carrier: CarrierName): CarrierCredentials {
    const credentials = this.configuration[carrier];

    if (!credentials) {
      throw new Error(
        `Carrier credentials not found for carrier: ${carrier}. Available carriers: ${Object.keys(this.configuration).join(', ')}`
      );
    }

    return credentials;
  }

  /**
   * Private Method: Loads all carrier credentials from environment variables.
   * Called once during singleton initialization.
   *
   * Environment variables expected:
   * - FEDEX_API_KEY, FEDEX_API_SECRET, FEDEX_ACCOUNT_NUMBER
   *
   * @returns CarrierConfiguration object with all carrier credentials
   */
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

  /**
   * Private Method: Validates that all required credentials are configured.
   * Warns if API keys are missing (empty strings from environment defaults).
   */
  private validateConfiguration(): void {
    Object.entries(this.configuration).forEach(([carrier, creds]) => {
      if (!creds.apiKey || !creds.apiSecret) {
        console.warn(
          `⚠️  Warning: Carrier "${carrier}" is missing API credentials. ` +
            `Set ${carrier.toUpperCase()}_API_KEY and ${carrier.toUpperCase()}_API_SECRET environment variables.`
        );
      }
    });
  }
}

export const carrierConfigManager = CarrierConfigManager.getInstance();
