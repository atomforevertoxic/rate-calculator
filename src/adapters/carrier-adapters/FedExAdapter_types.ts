import { PackageType, ServiceSpeed } from '@/src/types/domain';

export enum FedExServiceType {
  FIRST_OVERNIGHT = 'FIRST_OVERNIGHT',
  PRIORITY_OVERNIGHT = 'PRIORITY_OVERNIGHT',
  STANDARD_OVERNIGHT = 'STANDARD_OVERNIGHT',
  FEDEX_2_DAY = 'FEDEX_2_DAY',
  FEDEX_2_DAY_AM = 'FEDEX_2_DAY_AM',
  FEDEX_EXPRESS_SAVER = 'FEDEX_EXPRESS_SAVER',
  FEDEX_GROUND = 'FEDEX_GROUND',
  GROUND_HOME_DELIVERY = 'GROUND_HOME_DELIVERY',
  INTERNATIONAL_FIRST = 'INTERNATIONAL_FIRST',
  FEDEX_INTERNATIONAL_PRIORITY = 'FEDEX_INTERNATIONAL_PRIORITY',
  INTERNATIONAL_ECONOMY = 'INTERNATIONAL_ECONOMY',
}

export enum FedExPackagingType {
  YOUR_PACKAGING = 'YOUR_PACKAGING',
  FEDEX_ENVELOPE = 'FEDEX_ENVELOPE',
  FEDEX_TUBE = 'FEDEX_TUBE',
}

export enum RateRequestType {
  LIST = 'LIST',
  ACCOUNT = 'ACCOUNT',
}

export enum SpecialServiceType {
  SIGNATURE_OPTION = 'SIGNATURE_OPTION',
  SATURDAY_DELIVERY = 'SATURDAY_DELIVERY',
}

export interface FedExAddress {
  streetLines: string[];
  city: string;
  stateOrProvinceCode?: string;
  postalCode: string;
  countryCode: string;
}

export interface FedExWeight {
  units: 'LB' | 'KG';
  value: number;
}

export interface FedExDimensions {
  length: number;
  width: number;
  height: number;
  units: 'IN' | 'CM';
}

export interface FedExRequestedShipment {
  shipper: { address: FedExAddress };
  recipient: { address: FedExAddress };
  shipDateStamp: string;
  rateRequestType: RateRequestType[];
  requestedPackageLineItems: Array<{
    weight: FedExWeight;
    dimensions?: FedExDimensions;
    specialServices?: { specialServiceTypes: string[] };
  }>;
  totalPackageCount: string;
  packagingType?: FedExPackagingType;
  shipmentSpecialServices?: { specialServiceTypes: string[] };
  pickupType?: string;
}

export interface FedExRateRequest {
  accountNumber: { value: string };
  requestedShipment: FedExRequestedShipment;
  returnTransitTimes?: boolean;
}

export interface FedExSurcharge {
  type: string;
  amount: number;
  description?: string;
}

export interface FedExRatedShipmentDetail {
  rateType: 'ACCOUNT' | 'LIST' | 'PREFERRED_INCENTIVE' | 'PREFERRED_CURRENCY';
  totalNetCharge: { amount: number; currency: string };
  totalNetChargeWithDutiesAndTaxes?: number;
  totalBaseCharge?: number;
  shipmentRateDetail?: { surCharges?: FedExSurcharge[] };
  totalDutiesAndTaxes?: number;
}

export interface FedExRateReplyDetail {
  serviceType: FedExServiceType;
  serviceName: string;
  serviceDescription?: { code: string };
  ratedShipmentDetails: FedExRatedShipmentDetail[];
  commit?: {
    dateDetail?: {
      dayOfWeek?: string;
      dayCxsFormat?: string;
    };
  };
  operationalDetail?: {
    transitTime?: string;
    commitDate?: string;
    deliveryDay?: string;
    ineligibleForMoneyBackGuarantee?: boolean;
  };
}

export interface FedExAlert {
  code: string;
  message: string;
  alertType: 'NOTE' | 'WARNING' | 'ERROR';
}

export interface FedExRateResponse {
  output: {
    rateReplyDetails: FedExRateReplyDetail[];
    alerts?: FedExAlert[];
  };
}

export const packageTypeToFedExPackaging: Record<PackageType, FedExPackagingType> = {
  envelope: FedExPackagingType.FEDEX_ENVELOPE,
  tube: FedExPackagingType.FEDEX_TUBE,
  box: FedExPackagingType.YOUR_PACKAGING,
  custom: FedExPackagingType.YOUR_PACKAGING,
};

type DeliverySpeed = Exclude<ServiceSpeed, 'all'>;

export const DELIVERY_DAYS: Record<'DOMESTIC' | 'INTERNATIONAL', Record<DeliverySpeed, number>> = {
  DOMESTIC: {
    overnight: 1,
    'two-day': 2,
    standard: 3,
    economy: 5,
  },
  INTERNATIONAL: {
    overnight: 3,
    'two-day': 7,
    standard: 10,
    economy: 14,
  },
};
