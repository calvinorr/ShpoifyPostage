import { ServiceOption } from '@/types';

// UK Bank Holidays 2025 (add more years as needed)
const UK_BANK_HOLIDAYS_2025 = [
  '2025-01-01', // New Year's Day
  '2025-04-18', // Good Friday
  '2025-04-21', // Easter Monday
  '2025-05-05', // Early May Bank Holiday
  '2025-05-26', // Spring Bank Holiday
  '2025-08-25', // Summer Bank Holiday
  '2025-12-25', // Christmas Day
  '2025-12-26', // Boxing Day
];

// International holidays that might affect delivery (major ones)
const INTERNATIONAL_HOLIDAYS = [
  '2025-01-01', // New Year's Day (Global)
  '2025-12-25', // Christmas Day (Christian countries)
  '2025-12-26', // Boxing Day (Some Commonwealth countries)
];

export interface DeliveryEstimate {
  earliestDate: Date;
  latestDate: Date;
  estimatedDate: Date;
  workingDays: {
    min: number;
    max: number;
    typical: number;
  };
  businessDaysText: string;
  estimatedDateText: string;
  isGuaranteed: boolean;
  cutoffTime?: string;
  processingDelay?: string;
}

export class DeliveryDateService {
  private static CUTOFF_TIME = 16; // 4 PM cutoff for same-day processing

  static calculateDeliveryEstimate(
    service: ServiceOption,
    destinationZone: number,
    postDate?: Date
  ): DeliveryEstimate {
    const now = postDate || new Date();

    // Determine if package will be processed today based on cutoff time
    const processingStartDate = this.getProcessingStartDate(now);

    // Get delivery time ranges based on service and zone
    const deliveryTimes = this.getDeliveryTimeRanges(service, destinationZone);

    // Calculate actual delivery dates
    const earliestDate = this.addBusinessDays(processingStartDate, deliveryTimes.min);
    const latestDate = this.addBusinessDays(processingStartDate, deliveryTimes.max);
    const estimatedDate = this.addBusinessDays(processingStartDate, deliveryTimes.typical);

    // Generate human-readable text
    const businessDaysText = this.formatBusinessDaysText(deliveryTimes);
    const estimatedDateText = this.formatEstimatedDate(estimatedDate);

    // Check if service has guarantees
    const isGuaranteed = this.hasDeliveryGuarantee(service);

    // Determine processing info
    const processingDelay = this.getProcessingDelay(now, processingStartDate);
    const cutoffTime = this.getCutoffTimeText();

    return {
      earliestDate,
      latestDate,
      estimatedDate,
      workingDays: deliveryTimes,
      businessDaysText,
      estimatedDateText,
      isGuaranteed,
      cutoffTime,
      processingDelay
    };
  }

  private static getDeliveryTimeRanges(service: ServiceOption, zone: number) {
    // Enhanced delivery time estimates based on Royal Mail 2025 guidelines
    if (zone === 1) { // Europe
      if (service.tracking && service.signed) {
        return { min: 2, max: 4, typical: 3 }; // Tracked & Signed
      } else if (service.tracking) {
        return { min: 3, max: 5, typical: 4 }; // Tracked
      } else if (service.signed) {
        return { min: 4, max: 6, typical: 5 }; // Signed for
      } else {
        return { min: 5, max: 8, typical: 6 }; // Standard
      }
    } else { // Rest of World (Zone 2)
      if (service.tracking && service.signed) {
        return { min: 5, max: 8, typical: 6 }; // Tracked & Signed
      } else if (service.tracking) {
        return { min: 6, max: 10, typical: 8 }; // Tracked
      } else if (service.signed) {
        return { min: 8, max: 12, typical: 10 }; // Signed for
      } else {
        return { min: 10, max: 20, typical: 15 }; // Standard
      }
    }
  }

  private static getProcessingStartDate(postDate: Date): Date {
    const currentHour = postDate.getHours();
    const currentDay = postDate.getDay(); // 0 = Sunday, 6 = Saturday

    // If it's weekend or after cutoff time, processing starts next business day
    if (currentDay === 0 || currentDay === 6 || currentHour >= this.CUTOFF_TIME) {
      return this.getNextBusinessDay(postDate);
    }

    // If it's a UK bank holiday, processing starts next business day
    if (this.isUKBankHoliday(postDate)) {
      return this.getNextBusinessDay(postDate);
    }

    // Otherwise, processing starts today
    return new Date(postDate);
  }

  private static addBusinessDays(startDate: Date, businessDays: number): Date {
    const currentDate = new Date(startDate);
    let daysAdded = 0;

    while (daysAdded < businessDays) {
      currentDate.setDate(currentDate.getDate() + 1);

      // Skip weekends and holidays
      if (!this.isWeekend(currentDate) && !this.isUKBankHoliday(currentDate)) {
        daysAdded++;
      }
    }

    return currentDate;
  }

  private static getNextBusinessDay(date: Date): Date {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    // Keep moving forward until we find a business day
    while (this.isWeekend(nextDay) || this.isUKBankHoliday(nextDay)) {
      nextDay.setDate(nextDay.getDate() + 1);
    }

    return nextDay;
  }

  private static isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  }

  private static isUKBankHoliday(date: Date): boolean {
    const dateString = date.toISOString().split('T')[0];
    return UK_BANK_HOLIDAYS_2025.includes(dateString);
  }

  private static formatBusinessDaysText(deliveryTimes: { min: number; max: number; typical: number }): string {
    if (deliveryTimes.min === deliveryTimes.max) {
      return `${deliveryTimes.min} working day${deliveryTimes.min > 1 ? 's' : ''}`;
    }
    return `${deliveryTimes.min}-${deliveryTimes.max} working days`;
  }

  private static formatEstimatedDate(date: Date): string {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    if (isToday) {
      return 'Today';
    } else if (isTomorrow) {
      return 'Tomorrow';
    } else {
      // Calculate days from now
      const diffTime = date.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 7) {
        return date.toLocaleDateString('en-GB', { weekday: 'long' });
      } else {
        return date.toLocaleDateString('en-GB', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        });
      }
    }
  }

  private static hasDeliveryGuarantee(service: ServiceOption): boolean {
    // Typically, tracked and signed services have better guarantees
    return service.tracking && service.signed;
  }

  private static getProcessingDelay(postDate: Date, processingStartDate: Date): string | undefined {
    const postDateStr = postDate.toDateString();
    const processingDateStr = processingStartDate.toDateString();

    if (postDateStr !== processingDateStr) {
      const currentHour = postDate.getHours();
      const currentDay = postDate.getDay();

      if (currentHour >= this.CUTOFF_TIME) {
        return `Posted after 4 PM cutoff`;
      } else if (currentDay === 0 || currentDay === 6) {
        return `Posted on weekend`;
      } else if (this.isUKBankHoliday(postDate)) {
        return `Posted on bank holiday`;
      }
    }

    return undefined;
  }

  private static getCutoffTimeText(): string {
    return `Order by 4 PM for same-day processing`;
  }

  static getDaysBetween(startDate: Date, endDate: Date): number {
    const diffTime = endDate.getTime() - startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  static formatDateRange(startDate: Date, endDate: Date): string {
    const startStr = this.formatEstimatedDate(startDate);
    const endStr = this.formatEstimatedDate(endDate);

    if (startStr === endStr) {
      return startStr;
    }

    return `${startStr} - ${endStr}`;
  }
}