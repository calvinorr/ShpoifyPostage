import { PriceService } from './priceService';
import { IPriceEntry } from '@/models/Price';

// Current Royal Mail international pricing (2025 rates)
const SEED_PRICES: Omit<IPriceEntry, '_id'>[] = [
  // Zone 1 - Europe (Small packets up to 2kg)
  {
    service: 'standard',
    destination: 'Europe',
    zone: 1,
    weightRangeKg: { min: 0, max: 0.1 },
    sizeCategory: 'small',
    maxDimensions: { length: 45, width: 35, height: 16 },
    price: 3.45,
    currency: 'GBP',
    effectiveDate: new Date('2025-01-01'),
    extractedAt: new Date(),
    sourceType: 'manual'
  },
  {
    service: 'standard',
    destination: 'Europe',
    zone: 1,
    weightRangeKg: { min: 0.1, max: 0.25 },
    sizeCategory: 'small',
    maxDimensions: { length: 45, width: 35, height: 16 },
    price: 4.95,
    currency: 'GBP',
    effectiveDate: new Date('2025-01-01'),
    extractedAt: new Date(),
    sourceType: 'manual'
  },
  {
    service: 'standard',
    destination: 'Europe',
    zone: 1,
    weightRangeKg: { min: 0.25, max: 0.5 },
    sizeCategory: 'small',
    maxDimensions: { length: 45, width: 35, height: 16 },
    price: 6.95,
    currency: 'GBP',
    effectiveDate: new Date('2025-01-01'),
    extractedAt: new Date(),
    sourceType: 'manual'
  },
  {
    service: 'standard',
    destination: 'Europe',
    zone: 1,
    weightRangeKg: { min: 0.5, max: 1.0 },
    sizeCategory: 'small',
    maxDimensions: { length: 45, width: 35, height: 16 },
    price: 10.45,
    currency: 'GBP',
    effectiveDate: new Date('2025-01-01'),
    extractedAt: new Date(),
    sourceType: 'manual'
  },
  {
    service: 'standard',
    destination: 'Europe',
    zone: 1,
    weightRangeKg: { min: 1.0, max: 2.0 },
    sizeCategory: 'small',
    maxDimensions: { length: 45, width: 35, height: 16 },
    price: 15.85,
    currency: 'GBP',
    effectiveDate: new Date('2025-01-01'),
    extractedAt: new Date(),
    sourceType: 'manual'
  },

  // Zone 1 - Tracked Service
  {
    service: 'tracked',
    destination: 'Europe',
    zone: 1,
    weightRangeKg: { min: 0, max: 0.1 },
    sizeCategory: 'small',
    maxDimensions: { length: 45, width: 35, height: 16 },
    price: 7.45,
    currency: 'GBP',
    effectiveDate: new Date('2025-01-01'),
    extractedAt: new Date(),
    sourceType: 'manual'
  },
  {
    service: 'tracked',
    destination: 'Europe',
    zone: 1,
    weightRangeKg: { min: 0.1, max: 0.25 },
    sizeCategory: 'small',
    maxDimensions: { length: 45, width: 35, height: 16 },
    price: 9.95,
    currency: 'GBP',
    effectiveDate: new Date('2025-01-01'),
    extractedAt: new Date(),
    sourceType: 'manual'
  },
  {
    service: 'tracked',
    destination: 'Europe',
    zone: 1,
    weightRangeKg: { min: 0.25, max: 0.5 },
    sizeCategory: 'small',
    maxDimensions: { length: 45, width: 35, height: 16 },
    price: 13.95,
    currency: 'GBP',
    effectiveDate: new Date('2025-01-01'),
    extractedAt: new Date(),
    sourceType: 'manual'
  },
  {
    service: 'tracked',
    destination: 'Europe',
    zone: 1,
    weightRangeKg: { min: 0.5, max: 1.0 },
    sizeCategory: 'small',
    maxDimensions: { length: 45, width: 35, height: 16 },
    price: 19.45,
    currency: 'GBP',
    effectiveDate: new Date('2025-01-01'),
    extractedAt: new Date(),
    sourceType: 'manual'
  },
  {
    service: 'tracked',
    destination: 'Europe',
    zone: 1,
    weightRangeKg: { min: 1.0, max: 2.0 },
    sizeCategory: 'small',
    maxDimensions: { length: 45, width: 35, height: 16 },
    price: 27.85,
    currency: 'GBP',
    effectiveDate: new Date('2025-01-01'),
    extractedAt: new Date(),
    sourceType: 'manual'
  },

  // Zone 2 - Rest of World (Sample entries)
  {
    service: 'standard',
    destination: 'Rest of World',
    zone: 2,
    weightRangeKg: { min: 0, max: 0.1 },
    sizeCategory: 'small',
    maxDimensions: { length: 45, width: 35, height: 16 },
    price: 4.95,
    currency: 'GBP',
    effectiveDate: new Date('2025-01-01'),
    extractedAt: new Date(),
    sourceType: 'manual'
  },
  {
    service: 'standard',
    destination: 'Rest of World',
    zone: 2,
    weightRangeKg: { min: 0.25, max: 0.5 },
    sizeCategory: 'small',
    maxDimensions: { length: 45, width: 35, height: 16 },
    price: 9.95,
    currency: 'GBP',
    effectiveDate: new Date('2025-01-01'),
    extractedAt: new Date(),
    sourceType: 'manual'
  },
  {
    service: 'tracked',
    destination: 'Rest of World',
    zone: 2,
    weightRangeKg: { min: 0, max: 0.1 },
    sizeCategory: 'small',
    maxDimensions: { length: 45, width: 35, height: 16 },
    price: 9.95,
    currency: 'GBP',
    effectiveDate: new Date('2025-01-01'),
    extractedAt: new Date(),
    sourceType: 'manual'
  },
  {
    service: 'tracked',
    destination: 'Rest of World',
    zone: 2,
    weightRangeKg: { min: 0.25, max: 0.5 },
    sizeCategory: 'small',
    maxDimensions: { length: 45, width: 35, height: 16 },
    price: 16.95,
    currency: 'GBP',
    effectiveDate: new Date('2025-01-01'),
    extractedAt: new Date(),
    sourceType: 'manual'
  }
];

export async function seedPrices(): Promise<void> {
  try {
    console.log('Seeding price database...');
    const result = await PriceService.savePrices(SEED_PRICES);
    console.log(`✅ Seeded ${result.totalEntries} price entries`);
    console.log(`   New entries: ${result.newEntries}`);
    console.log(`   Changed entries: ${result.changedEntries}`);
  } catch (error) {
    console.error('❌ Error seeding prices:', error);
    throw error;
  }
}

// Add specific country mappings
export const COUNTRY_ZONE_MAP: Record<string, { zone: number; destination: string }> = {
  'france': { zone: 1, destination: 'Europe' },
  'germany': { zone: 1, destination: 'Europe' },
  'spain': { zone: 1, destination: 'Europe' },
  'italy': { zone: 1, destination: 'Europe' },
  'netherlands': { zone: 1, destination: 'Europe' },
  'belgium': { zone: 1, destination: 'Europe' },
  'poland': { zone: 1, destination: 'Europe' },
  'sweden': { zone: 1, destination: 'Europe' },
  'norway': { zone: 1, destination: 'Europe' },
  'denmark': { zone: 1, destination: 'Europe' },
  'usa': { zone: 2, destination: 'Rest of World' },
  'canada': { zone: 2, destination: 'Rest of World' },
  'australia': { zone: 2, destination: 'Rest of World' },
  'japan': { zone: 2, destination: 'Rest of World' },
  'brazil': { zone: 2, destination: 'Rest of World' },
  'india': { zone: 2, destination: 'Rest of World' },
  'china': { zone: 2, destination: 'Rest of World' }
};