import { PriceEntry, PriceUpdate } from '@/models/Price';
import dbConnect from './mongodb';

export interface PriceChange {
  service: string;
  destination: string;
  zone: number;
  weightRangeKg: {
    min: number;
    max: number;
  };
  oldPrice: number;
  newPrice: number;
  changeAmount: number;
  changePercentage: number;
  effectiveDate: Date;
  detectedAt: Date;
}

export interface ChangeDetectionResult {
  hasChanges: boolean;
  priceChanges: PriceChange[];
  newEntries: number;
  totalChanges: number;
  significantChanges: number; // Changes > 5%
}

export class PriceChangeDetector {
  private static readonly SIGNIFICANT_CHANGE_THRESHOLD = 0.05; // 5%

  /**
   * Detect price changes by comparing new prices with existing ones
   */
  static async detectChanges(newPrices: any[]): Promise<ChangeDetectionResult> {
    await dbConnect();

    const priceChanges: PriceChange[] = [];
    let newEntries = 0;

    console.log(`🔍 Analyzing ${newPrices.length} prices for changes...`);

    for (const newPrice of newPrices) {
      try {
        // Find existing price for the same service/destination/zone/weight
        const existingPrice = await PriceEntry.findOne({
          service: newPrice.service,
          destination: newPrice.destination,
          zone: newPrice.zone,
          'weightRangeKg.min': newPrice.weightRangeKg.min,
          'weightRangeKg.max': newPrice.weightRangeKg.max,
          sizeCategory: newPrice.sizeCategory
        }).sort({ effectiveDate: -1 }); // Get most recent

        if (!existingPrice) {
          // This is a new price entry
          newEntries++;
          console.log(`📦 New price entry: ${newPrice.service} to ${newPrice.destination} Zone ${newPrice.zone} = £${newPrice.price}`);
          continue;
        }

        // Check if price has changed
        const oldPrice = existingPrice.price;
        const newPriceValue = newPrice.price;

        if (Math.abs(oldPrice - newPriceValue) > 0.01) { // More than 1p difference
          const changeAmount = newPriceValue - oldPrice;
          const changePercentage = (changeAmount / oldPrice) * 100;

          const priceChange: PriceChange = {
            service: newPrice.service,
            destination: newPrice.destination,
            zone: newPrice.zone,
            weightRangeKg: newPrice.weightRangeKg,
            oldPrice,
            newPrice: newPriceValue,
            changeAmount,
            changePercentage,
            effectiveDate: newPrice.effectiveDate,
            detectedAt: new Date()
          };

          priceChanges.push(priceChange);

          const changeDirection = changeAmount > 0 ? '📈' : '📉';
          const changeSign = changeAmount > 0 ? '+' : '';

          console.log(
            `${changeDirection} Price change detected: ${newPrice.service} to ${newPrice.destination} Zone ${newPrice.zone}`,
            `£${oldPrice} → £${newPriceValue} (${changeSign}£${changeAmount.toFixed(2)}, ${changeSign}${changePercentage.toFixed(1)}%)`
          );
        }

      } catch (error) {
        console.error('Error checking price change:', error);
        continue;
      }
    }

    const significantChanges = priceChanges.filter(
      change => Math.abs(change.changePercentage) >= this.SIGNIFICANT_CHANGE_THRESHOLD * 100
    ).length;

    const result: ChangeDetectionResult = {
      hasChanges: priceChanges.length > 0 || newEntries > 0,
      priceChanges,
      newEntries,
      totalChanges: priceChanges.length,
      significantChanges
    };

    console.log(`✅ Change detection complete: ${priceChanges.length} changes, ${newEntries} new entries, ${significantChanges} significant changes`);

    return result;
  }

  /**
   * Log price changes to the database for historical tracking
   */
  static async logPriceChanges(changes: PriceChange[], updateId: string): Promise<void> {
    if (changes.length === 0) return;

    try {
      await dbConnect();

      // Store price changes in a dedicated collection
      const PriceChangeLog = require('@/models/PriceChangeLog').PriceChangeLog;

      const changeEntries = changes.map(change => ({
        ...change,
        updateId,
        loggedAt: new Date()
      }));

      await PriceChangeLog.insertMany(changeEntries);
      console.log(`📝 Logged ${changes.length} price changes to database`);

    } catch (error) {
      console.error('Failed to log price changes:', error);
    }
  }

  /**
   * Get recent price changes for monitoring
   */
  static async getRecentChanges(limit: number = 10): Promise<PriceChange[]> {
    try {
      await dbConnect();
      const PriceChangeLog = require('@/models/PriceChangeLog').PriceChangeLog;

      const recentChanges = await PriceChangeLog
        .find({})
        .sort({ detectedAt: -1 })
        .limit(limit)
        .lean();

      return recentChanges || [];

    } catch (error) {
      console.error('Failed to get recent changes:', error);
      return [];
    }
  }

  /**
   * Generate summary statistics for price changes
   */
  static generateChangeSummary(result: ChangeDetectionResult): string {
    const { priceChanges, newEntries, significantChanges } = result;

    if (!result.hasChanges) {
      return 'No price changes detected';
    }

    const increases = priceChanges.filter(c => c.changeAmount > 0).length;
    const decreases = priceChanges.filter(c => c.changeAmount < 0).length;

    let summary = [];

    if (newEntries > 0) {
      summary.push(`${newEntries} new price${newEntries > 1 ? 's' : ''}`);
    }

    if (priceChanges.length > 0) {
      summary.push(`${priceChanges.length} price change${priceChanges.length > 1 ? 's' : ''}`);

      if (increases > 0 && decreases > 0) {
        summary.push(`(${increases} increase${increases > 1 ? 's' : ''}, ${decreases} decrease${decreases > 1 ? 's' : ''})`);
      } else if (increases > 0) {
        summary.push(`(${increases} increase${increases > 1 ? 's' : ''})`);
      } else if (decreases > 0) {
        summary.push(`(${decreases} decrease${decreases > 1 ? 's' : ''})`);
      }
    }

    if (significantChanges > 0) {
      summary.push(`${significantChanges} significant (>5%)`);
    }

    return summary.join(', ');
  }
}