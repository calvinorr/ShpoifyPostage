import { Package, PriceQuote, ServiceOption } from "@/types";
import { services } from "@/data/services";
import { calculateShipping as staticCalculateShipping } from '@/lib/calculator';
import { DeliveryDateService } from '@/lib/deliveryDateService';

// Country to zone mapping for client-side use
const COUNTRY_ZONE_MAP: Record<string, { zone: number; destination: string }> = {
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

export class CalculatorService {
  static async calculateShipping(
    pkg: Package,
    destinationCode: string,
    serviceIds: string[]
  ): Promise<PriceQuote[]> {
    // Validate package
    const validationErrors = this.validatePackage(pkg);
    if (validationErrors.length > 0) {
      throw new Error(
        `Package validation failed: ${validationErrors.join(", ")}`
      );
    }

    // Get destination info from country mapping
    const country = destinationCode.toLowerCase();
    const destinationInfo = COUNTRY_ZONE_MAP[country];

    if (!destinationInfo) {
      throw new Error(`Destination not supported: ${destinationCode}`);
    }

    const quotes: PriceQuote[] = [];

    // Try database first, fall back to static pricing
    try {
      const params = new URLSearchParams({
        action: 'calculate',
        length: pkg.length.toString(),
        width: pkg.width.toString(),
        height: pkg.height.toString(),
        weight: pkg.weight.toString(),
        country: country,
        services: serviceIds.join(',')
      });

      const response = await fetch(`/api/prices?${params}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();

      // Transform API response to PriceQuote format
      for (const serviceId of serviceIds) {
        const service = services.find((s) => s.id === serviceId);
        if (!service) {
          quotes.push(this.createUnavailableQuote(serviceId, destinationInfo, "Invalid service"));
          continue;
        }

        const priceData = data.prices.find((p: any) => p.service === serviceId);

        if (priceData && priceData.available) {
          const deliveryEstimate = DeliveryDateService.calculateDeliveryEstimate(service, destinationInfo.zone);

          quotes.push({
            service,
            destination: {
              code: destinationCode,
              name: this.getCountryName(country),
              region: destinationInfo.destination,
              zone: destinationInfo.zone
            },
            price: priceData.price,
            estimatedDays: deliveryEstimate.businessDaysText, // Use enhanced text
            delivery: {
              estimatedDays: deliveryEstimate.businessDaysText,
              earliestDate: deliveryEstimate.earliestDate,
              latestDate: deliveryEstimate.latestDate,
              estimatedDate: deliveryEstimate.estimatedDate,
              businessDaysText: deliveryEstimate.businessDaysText,
              estimatedDateText: deliveryEstimate.estimatedDateText,
              isGuaranteed: deliveryEstimate.isGuaranteed,
              cutoffTime: deliveryEstimate.cutoffTime,
              processingDelay: deliveryEstimate.processingDelay
            },
            available: true,
            restrictions: []
          });
        } else {
          quotes.push(this.createUnavailableQuote(serviceId, destinationInfo, "No pricing available"));
        }
      }

    } catch (error) {
      console.error('Database unavailable, falling back to static prices:', error);

      // Fallback to static calculation if database is unavailable
      try {
        // Map country to legacy destination format for static calculator
        const legacyDestinations: Record<string, string> = {
          'france': 'FR',
          'germany': 'DE',
          'spain': 'ES',
          'italy': 'IT',
          'netherlands': 'NL',
          'belgium': 'BE',
          'poland': 'PL',
          'sweden': 'SE',
          'norway': 'NO',
          'denmark': 'DK',
          'usa': 'US',
          'canada': 'CA',
          'australia': 'AU',
          'japan': 'JP',
          'brazil': 'BR',
          'india': 'IN',
          'china': 'CN'
        };

        const legacyDestination = legacyDestinations[country];
        if (legacyDestination) {
          const staticQuotes = staticCalculateShipping(pkg, legacyDestination, serviceIds);
          return staticQuotes;
        } else {
          // If no legacy mapping, create unavailable quotes
          for (const serviceId of serviceIds) {
            const service = services.find((s) => s.id === serviceId);
            if (service) {
              quotes.push(this.createUnavailableQuote(serviceId, destinationInfo, "Destination not supported in fallback mode"));
            }
          }
        }
      } catch (staticError) {
        console.error('Static calculator also failed:', staticError);
        // Last resort: mark all as unavailable
        for (const serviceId of serviceIds) {
          const service = services.find((s) => s.id === serviceId);
          if (service) {
            quotes.push(this.createUnavailableQuote(serviceId, destinationInfo, "Service temporarily unavailable"));
          }
        }
      }
    }

    // Return available quotes sorted by price, then append unavailable quotes
    const available = quotes
      .filter((q) => q.available)
      .sort((a, b) => a.price - b.price);
    const unavailable = quotes.filter((q) => !q.available);
    return [...available, ...unavailable];
  }

  private static createUnavailableQuote(
    serviceId: string,
    destinationInfo: { zone: number; destination: string },
    reason: string
  ): PriceQuote {
    const service = services.find((s) => s.id === serviceId) || {
      id: serviceId,
      name: serviceId,
      description: "Unknown service",
      tracking: false,
      signed: false
    };

    return {
      service,
      destination: {
        code: serviceId,
        name: "Unknown",
        region: destinationInfo.destination,
        zone: destinationInfo.zone
      },
      price: 0,
      estimatedDays: "N/A",
      available: false,
      restrictions: [reason]
    };
  }

  private static getCountryName(countryCode: string): string {
    const countryNames: Record<string, string> = {
      'france': 'France',
      'germany': 'Germany',
      'spain': 'Spain',
      'italy': 'Italy',
      'netherlands': 'Netherlands',
      'belgium': 'Belgium',
      'poland': 'Poland',
      'sweden': 'Sweden',
      'norway': 'Norway',
      'denmark': 'Denmark',
      'usa': 'United States',
      'canada': 'Canada',
      'australia': 'Australia',
      'japan': 'Japan',
      'brazil': 'Brazil',
      'india': 'India',
      'china': 'China'
    };
    return countryNames[countryCode] || countryCode.charAt(0).toUpperCase() + countryCode.slice(1);
  }

  private static estimateDeliveryDays(service: ServiceOption, zone: number): string {
    if (zone === 1) { // Europe
      return service.tracking ? "3-5 working days" : "5-7 working days";
    }
    // Rest of World
    return service.tracking ? "7-10 working days" : "10-15 working days";
  }

  private static validatePackage(pkg: Package): string[] {
    const errors: string[] = [];

    // Weight checks: only support up to 2000g (2kg) for the current pricing tables
    if (pkg.weight <= 0) {
      errors.push("Weight must be greater than 0");
    }
    if (pkg.weight > 2000) {
      errors.push(
        "Weight is greater than 2kg; this calculator supports small parcels up to 2kg only"
      );
    }

    // Dimensions basic checks
    if (pkg.length <= 0 || pkg.width <= 0 || pkg.height <= 0) {
      errors.push("All dimensions must be greater than 0");
    }

    // Small parcel size limits (kept in sync with pricing scope)
    if (pkg.weight <= 2000) {
      if (pkg.length > 45 || pkg.width > 35 || pkg.height > 16) {
        errors.push("Small parcels (≤2kg) must not exceed 45cm × 35cm × 16cm");
      }
    }

    // Combined dimensions constraint for larger items (defensive)
    const combinedDimensions = pkg.length + pkg.width + pkg.height;
    if (combinedDimensions > 150) {
      errors.push("Combined dimensions (L+W+H) cannot exceed 150cm");
    }

    return errors;
  }

  static getAvailableCountries(): Array<{ code: string; name: string; zone: number }> {
    return Object.entries(COUNTRY_ZONE_MAP).map(([code, info]) => ({
      code,
      name: this.getCountryName(code),
      zone: info.zone
    })).sort((a, b) => a.name.localeCompare(b.name));
  }
}