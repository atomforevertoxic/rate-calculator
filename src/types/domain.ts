// ==================== Package Information Types ====================

export const packageDimensionUnits = ['cm', 'in'] as const;
export interface PackageDimensions {
  length: number;
  width: number;
  height: number;
  unit: (typeof packageDimensionUnits)[number];
}

export const packageWeightUnits = ['kg', 'lbs'] as const;
export interface PackageWeight {
  value: number;
  unit: (typeof packageWeightUnits)[number];
}

export const packageTypes = ['envelope', 'box', 'tube', 'custom'] as const;
export type PackageType = (typeof packageTypes)[number];

export interface Package {
  id: string;
  dimensions: PackageDimensions;
  weight: PackageWeight;
  type: PackageType;
  declaredValue?: number;
}

// ==================== Address Information ====================

export interface Address {
  name: string;
  street1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  street2?: string;
  phone?: string;
}

// ==================== Shipping Service Options ====================

export const serviceSpeeds = ['overnight', 'two-day', 'standard', 'economy'] as const;
export type ServiceSpeed = (typeof serviceSpeeds)[number];

export interface ShippingOptions {
  speed: ServiceSpeed;
  signatureRequired: boolean;
  insurance: boolean;
  fragileHandling: boolean;
  saturdayDelivery: boolean;
  insuredValue?: number;
}

// ==================== Carrier and Rate Information ====================

export const carrierNames = ['FedEx', 'UPS'];
export type CarrierName = (typeof carrierNames)[number];

export interface ShippingRate {
  id: string;
  carrier: CarrierName;
  serviceCode: string;
  serviceName: string;
  speed: ServiceSpeed;
  features: string[];
  baseRate: number;
  additionalFees: Fee[];
  totalCost: number;
  estimatedDeliveryDate: Date;
  guaranteedDelivery: boolean;
}

export const feeTypes = ['insurance', 'signature', 'fragile', 'saturdayDelivery'] as const;

export interface Fee {
  type: (typeof feeTypes)[number];
  amount: number;
  description: string;
}

// ==================== API Request/Response Types ====================

export interface RateRequest {
  package: Package;
  origin: Address;
  destination: Address;
  options: ShippingOptions;
  carriersFilter?: CarrierName[];
}

export interface RateResponse {
  requestId: string;
  rates: ShippingRate[];
  errors: CarrierError[];
  timestamp: Date;
}

export interface CarrierError {
  carrier: CarrierName;
  message: string;
  recoverable: boolean;
}
