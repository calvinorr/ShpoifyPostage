import { ServiceOption, PackageType } from '@/types';

export const services: ServiceOption[] = [
  {
    id: 'standard',
    name: 'Standard',
    description: 'Basic international service',
    tracking: false,
    signed: false
  },
  {
    id: 'tracked',
    name: 'Tracked',
    description: 'Service with tracking information',
    tracking: true,
    signed: false
  },
  {
    id: 'signed',
    name: 'Signed For',
    description: 'Service requiring signature on delivery',
    tracking: false,
    signed: true
  },
  {
    id: 'tracked-signed',
    name: 'Tracked & Signed',
    description: 'Service with tracking and signature required',
    tracking: true,
    signed: true
  }
];

export const packageTypes: PackageType[] = [
  {
    id: 'small-parcel',
    name: 'Small Parcel',
    description: 'Up to 2kg, max 45cm length',
    maxDimensions: { length: 45, width: 35, height: 16 },
    maxWeight: 2000
  },
  {
    id: 'medium-parcel',
    name: 'Medium Parcel',
    description: 'Up to 20kg, max 61cm length',
    maxDimensions: { length: 61, width: 46, height: 46 },
    maxWeight: 20000
  },
  {
    id: 'large-parcel',
    name: 'Large Parcel',
    description: 'Up to 30kg, max 150cm combined dimensions',
    maxDimensions: { length: 100, width: 50, height: 50 },
    maxWeight: 30000
  }
];