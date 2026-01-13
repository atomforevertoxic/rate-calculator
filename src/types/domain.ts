// ==================== Package Information Types ====================


export interface PackageDimensions{
    length: number,
    width: number,
    height: number,
    unit: 'in' | 'cm'
};


export interface PackageWeight{
    value: number,
    unit: 'lbs' | 'kg'
};


export type PackageType = 'envelope' | 'box' | 'tube' | 'custom';


export interface Package{
    id: string,
    dimensions: PackageDimensions,
    weight: PackageWeight,
    type: PackageType,
    declaredValue?: number
};



// ==================== Address Information ====================


export interface Address{
    name: string,
    street1: string,
    city: string,
    state: string,
    postalCode: string,
    country: string,
    street2?: string,
    phone?: string
}



// ==================== Shipping Service Options ====================


export type ServiceSpeed = 'overnight' | 'two-day' | 'standard' | 'economy';


export interface ShippingOptions{
    speed: ServiceSpeed,
    signatureRequired: boolean,
    insurance: boolean,
    fragileHandling: boolean,
    saturdayDelivery: boolean,
    insuredValue?: boolean
};



// ==================== Carrier and Rate Information ====================


export type CarrierName = 'USPS' | 'FedEx' | 'UPS' | 'DHL';


export interface ShippingRate{
    id: string,
    carrier: CarrierName,
    serviceCode: string,
    serviceName: string,
    speed: ServiceSpeed,
    features: string[],
    baseRate: ShippingRate,
    additionalFees: Fee[],
    totalCost: number,
    estimatedDeliveryDate: Date,
    guaranteedDelivery : boolean
};


export interface Fee{
    type: FeeType,
    amount: number,
    description: string
};


export type FeeType = 
  | 'FUEL'
  | 'RESIDENTIAL_DELIVERY'
  | 'REMOTE_AREA'
  | 'SIGNATURE'
  | 'INSURANCE'
  | 'HANDLING'
  | 'WEEKEND_DELIVERY'
  | 'CUSTOMS'
  | 'OTHER';



// ==================== API Request/Response Types ====================


export interface RateRequest{
    package: Package,
    origin: Address,
    destination: Address,
    options: ShippingOptions
};


export interface RateResponse{
    requestId: string,
    rates: ShippingRate[],
    errors: CarrierError[],
    timestamp: Date
};


export interface CarrierError{
    carrier: CarrierName,
    message: string,
    recomverable: boolean
};
