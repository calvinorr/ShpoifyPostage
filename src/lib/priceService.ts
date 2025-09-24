import dbConnect from './mongodb';
import { PriceEntry, PriceUpdate, IPriceEntry, IPriceUpdate } from '@/models/Price';
import { Package } from '@/types';
import { PriceChangeDetector, ChangeDetectionResult } from './priceChangeDetector';

export class PriceService {
  static async getCurrentPrices(
    packageData: Package,
    destination: string,
    serviceTypes: string[]
  ): Promise<IPriceEntry[]> {
    await dbConnect();

    const packageWeight = packageData.weight / 1000; // Convert grams to kg
    const packageVolume = (packageData.length * packageData.width * packageData.height) / 1000000; // Convert cm³ to m³

    const query = {
      service: { $in: serviceTypes },
      destination: destination,
      'weightRangeKg.min': { $lte: packageWeight },
      'weightRangeKg.max': { $gte: packageWeight },
      $and: [
        { 'maxDimensions.length': { $gte: packageData.length } },
        { 'maxDimensions.width': { $gte: packageData.width } },
        { 'maxDimensions.height': { $gte: packageData.height } }
      ]
    };

    // Get the most recent prices for each service
    const prices = await PriceEntry.aggregate([
      { $match: query },
      { $sort: { effectiveDate: -1, extractedAt: -1 } },
      {
        $group: {
          _id: { service: '$service', destination: '$destination', zone: '$zone' },
          latestPrice: { $first: '$$ROOT' }
        }
      },
      { $replaceRoot: { newRoot: '$latestPrice' } }
    ]);

    return prices;
  }

  static async savePrices(prices: Omit<IPriceEntry, '_id'>[]): Promise<IPriceUpdate> {
    await dbConnect();

    const updateId = `update_${Date.now()}`;

    try {
      // First, detect price changes before saving new prices
      console.log('🔍 Detecting price changes...');
      const changeDetection: ChangeDetectionResult = await PriceChangeDetector.detectChanges(prices);

      // Save new prices to database with enhanced duplicate detection
      const savedPrices = [];
      let skippedDuplicates = 0;
      
      for (const priceData of prices) {
        // Enhanced duplicate check - consider exact match including sourceUrl
        const exactDuplicateQuery = {
          service: priceData.service,
          destination: priceData.destination,
          zone: priceData.zone,
          'weightRangeKg.min': priceData.weightRangeKg.min,
          'weightRangeKg.max': priceData.weightRangeKg.max,
          sizeCategory: priceData.sizeCategory,
          price: priceData.price,
          effectiveDate: priceData.effectiveDate,
          sourceUrl: priceData.sourceUrl
        };

        const existingExactPrice = await PriceEntry.findOne(exactDuplicateQuery);

        if (existingExactPrice) {
          console.log(`🔄 Skipping exact duplicate from same source: ${priceData.service} to ${priceData.destination} = £${priceData.price}`);
          skippedDuplicates++;
          continue;
        }

        // Check for similar price with different source (keep most recent)
        const similarPriceQuery = {
          service: priceData.service,
          destination: priceData.destination,
          zone: priceData.zone,
          'weightRangeKg.min': priceData.weightRangeKg.min,
          'weightRangeKg.max': priceData.weightRangeKg.max,
          sizeCategory: priceData.sizeCategory,
          effectiveDate: priceData.effectiveDate
        };

        const existingSimilarPrice = await PriceEntry.findOne(similarPriceQuery);

        if (existingSimilarPrice) {
          // If price is different, we may want to keep both for change tracking
          // If price is same but different source, update source info
          if (existingSimilarPrice.price === priceData.price && existingSimilarPrice.sourceUrl !== priceData.sourceUrl) {
            console.log(`📝 Updating source info for existing price: ${priceData.service} to ${priceData.destination} = £${priceData.price}`);
            existingSimilarPrice.sourceUrl = priceData.sourceUrl;
            existingSimilarPrice.extractedAt = priceData.extractedAt;
            await existingSimilarPrice.save();
            continue;
          }
        }

        // Create new price entry
        const savedPrice = await PriceEntry.create(priceData);
        savedPrices.push(savedPrice);
        console.log(`📦 New price entry: ${priceData.service} to ${priceData.destination} = £${priceData.price}`);
      }

      console.log(`✅ Processed ${prices.length} prices: ${savedPrices.length} new, ${skippedDuplicates} skipped duplicates`);

      // Log price changes if any were detected
      if (changeDetection.priceChanges.length > 0) {
        await PriceChangeDetector.logPriceChanges(changeDetection.priceChanges, updateId);
      }

      // Generate change summary for logging
      const changeSummary = PriceChangeDetector.generateChangeSummary(changeDetection);
      console.log(`📊 Price update summary: ${changeSummary}`);

      const updateRecord: Omit<IPriceUpdate, '_id'> = {
        updateId,
        extractedAt: new Date(),
        sourceType: prices[0]?.sourceType || 'manual',
        sourceUrl: prices[0]?.sourceUrl,
        totalEntries: prices.length,
        newEntries: changeDetection.newEntries,
        changedEntries: changeDetection.totalChanges,
        status: 'success'
      };

      const savedUpdate = await PriceUpdate.create(updateRecord);
      return savedUpdate;

    } catch (error) {
      const errorUpdate: Omit<IPriceUpdate, '_id'> = {
        updateId,
        extractedAt: new Date(),
        sourceType: prices[0]?.sourceType || 'manual',
        sourceUrl: prices[0]?.sourceUrl,
        totalEntries: prices.length,
        newEntries: 0,
        changedEntries: 0,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };

      await PriceUpdate.create(errorUpdate);
      throw error;
    }
  }

  static async getPriceHistory(
    service: string,
    destination: string,
    zone: number,
    limit: number = 10
  ): Promise<IPriceEntry[]> {
    await dbConnect();

    return await PriceEntry.find({
      service,
      destination,
      zone
    })
    .sort({ effectiveDate: -1, extractedAt: -1 })
    .limit(limit);
  }

  static async getPriceHistoryWithFilters(filters: {
    services?: string[];
    destinations?: string[];
    zones?: number[];
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: IPriceEntry[]; total: number }> {
    await dbConnect();

    // Build query based on filters
    const query: any = {};

    if (filters.services && filters.services.length > 0) {
      query.service = { $in: filters.services };
    }

    if (filters.destinations && filters.destinations.length > 0) {
      query.destination = { $in: filters.destinations };
    }

    if (filters.zones && filters.zones.length > 0) {
      query.zone = { $in: filters.zones };
    }

    if (filters.dateFrom || filters.dateTo) {
      query.effectiveDate = {};
      if (filters.dateFrom) {
        query.effectiveDate.$gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        query.effectiveDate.$lte = filters.dateTo;
      }
    }

    // Build sort options
    const sortField = filters.sortBy || 'effectiveDate';
    const sortDirection = filters.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortDirection, extractedAt: -1 };

    // Get total count for pagination
    const total = await PriceEntry.countDocuments(query);

    // Get paginated results
    const data = await PriceEntry.find(query)
      .sort(sort)
      .skip(filters.offset || 0)
      .limit(filters.limit || 20);

    return { data, total };
  }

  static async getRecentUpdates(limit: number = 5): Promise<IPriceUpdate[]> {
    await dbConnect();

    return await PriceUpdate.find()
      .sort({ extractedAt: -1 })
      .limit(limit);
  }

  static async getDestinationZones(): Promise<Array<{ destination: string; zone: number }>> {
    await dbConnect();

    const zones = await PriceEntry.aggregate([
      {
        $group: {
          _id: { destination: '$destination', zone: '$zone' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          destination: '$_id.destination',
          zone: '$_id.zone',
          _id: 0
        }
      },
      { $sort: { zone: 1, destination: 1 } }
    ]);

    return zones;
  }

  static async getRecentPriceChanges(limit: number = 10) {
    return await PriceChangeDetector.getRecentChanges(limit);
  }

  static async getPriceChangesWithFilters(filters: {
    services?: string[];
    destinations?: string[];
    zones?: number[];
    dateFrom?: Date;
    dateTo?: Date;
    changeType?: 'increase' | 'decrease' | 'all';
    minChangePercent?: number;
    limit?: number;
    offset?: number;
  }) {
    await dbConnect();
    
    try {
      const PriceChangeLog = require('@/models/PriceChangeLog').PriceChangeLog;
      
      const query: any = {};

      if (filters.services && filters.services.length > 0) {
        query.service = { $in: filters.services };
      }

      if (filters.destinations && filters.destinations.length > 0) {
        query.destination = { $in: filters.destinations };
      }

      if (filters.zones && filters.zones.length > 0) {
        query.zone = { $in: filters.zones };
      }

      if (filters.dateFrom || filters.dateTo) {
        query.detectedAt = {};
        if (filters.dateFrom) {
          query.detectedAt.$gte = filters.dateFrom;
        }
        if (filters.dateTo) {
          query.detectedAt.$lte = filters.dateTo;
        }
      }

      if (filters.changeType && filters.changeType !== 'all') {
        query.changeAmount = filters.changeType === 'increase' ? { $gt: 0 } : { $lt: 0 };
      }

      if (filters.minChangePercent && filters.minChangePercent > 0) {
        query.changePercentage = { 
          $or: [
            { $gte: filters.minChangePercent },
            { $lte: -filters.minChangePercent }
          ]
        };
      }

      const total = await PriceChangeLog.countDocuments(query);
      const data = await PriceChangeLog.find(query)
        .sort({ detectedAt: -1 })
        .skip(filters.offset || 0)
        .limit(filters.limit || 20);

      return { data, total };
      
    } catch (error) {
      console.error('Failed to get filtered price changes:', error);
      return { data: [], total: 0 };
    }
  }

  static async getFilterOptions(): Promise<{
    services: string[];
    destinations: string[];
    zones: number[];
  }> {
    await dbConnect();

    const [services, destinations, zones] = await Promise.all([
      PriceEntry.distinct('service'),
      PriceEntry.distinct('destination').sort(),
      PriceEntry.distinct('zone').sort()
    ]);

    return { services, destinations, zones };
  }
}