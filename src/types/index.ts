export interface Package {
  length: number;
  width: number;
  height: number;
  weight: number;
}

export interface ServiceOption {
  id: string;
  name: string;
  description: string;
  tracking: boolean;
  signed: boolean;
}

export interface PricingData {
  id: string;
  service: string;
  destination: string;
  weightBand: string;
  price: number;
  maxDimensions?: {
    length: number;
    width: number;
    height: number;
  };
  maxWeight: number;
  lastUpdated: Date;
}

export interface Destination {
  code: string;
  name: string;
  zone: number;
  region: 'UK' | 'Europe' | 'World';
}

export interface PriceQuote {
  service: ServiceOption;
  destination: Destination;
  price: number;
  estimatedDays: string;
  available: boolean;
  restrictions?: string[];
}

export interface PackageType {
  id: string;
  name: string;
  description: string;
  maxDimensions: {
    length: number;
    width: number;
    height: number;
  };
  maxWeight: number;
}