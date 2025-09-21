import { Package, Destination, ServiceOption, PriceQuote } from "@/types";
import { destinations } from "@/data/destinations";
import { services } from "@/data/services";
import { pricingData } from "@/data/pricing";

/**
 * Data-driven weight bands (ordered ascending).
 * Keeps band definitions in one place for easier maintenance.
 */
const WEIGHT_BANDS: { key: string; max: number }[] = [
  { key: "0-100g", max: 100 },
  { key: "101-250g", max: 250 },
  { key: "251-500g", max: 500 },
  { key: "501-750g", max: 750 },
  { key: "751-1000g", max: 1000 },
  { key: "1001-1250g", max: 1250 },
  { key: "1251-1500g", max: 1500 },
  { key: "1501-2000g", max: 2000 },
];

export function getWeightBand(weight: number): string {
  const band = WEIGHT_BANDS.find((b) => weight <= b.max);
  if (!band) {
    throw new Error(
      "Package weight exceeds maximum limit of 2kg for small parcels",
    );
  }
  return band.key;
}

/**
 * Zone key mapping (declarative).
 */
const ZONE_KEY_MAP: Record<string, Record<number, string>> = {
  Europe: { 1: "europe_zone1", 2: "europe_zone2" },
  World: { 3: "world_zone1", 4: "world_zone2", 5: "world_zone3" },
};

export function getZoneKey(destination: Destination): string {
  const regionMap = ZONE_KEY_MAP[destination.region];
  if (!regionMap) {
    throw new Error(`Unknown region: ${destination.region}`);
  }
  const key = regionMap[destination.zone];
  if (!key) {
    throw new Error(
      `Invalid destination zone: ${destination.zone} for region: ${destination.region}`,
    );
  }
  return key;
}

/**
 * Service -> pricing key map
 * Keep mapping small and explicit so it's easier to audit.
 */
const SERVICE_KEY_MAP: Record<string, string> = {
  standard: "international_standard",
  tracked: "international_tracked",
  signed: "international_signed",
  "tracked-signed": "international_tracked_signed",
};

export function getServiceKey(service: ServiceOption): string {
  return SERVICE_KEY_MAP[service.id] ?? "international_standard";
}

/**
 * Extracted helper for delivery time estimation.
 * Keeps calculation isolated and easy to modify / test.
 */
export function estimateDeliveryDays(
  service: ServiceOption,
  destination: Destination,
): string {
  if (destination.region === "Europe") {
    return service.tracking ? "3-5 working days" : "5-7 working days";
  }

  // World destinations: zone 3 considered nearer destinations in original logic
  if (destination.zone === 3) {
    return service.tracking ? "5-7 working days" : "7-10 working days";
  }

  // World zones 4 & 5
  return service.tracking ? "7-10 working days" : "10-15 working days";
}

/**
 * Validation aligned to pricing capability: this calculator supports small parcels up to 2kg.
 */
export function validatePackage(pkg: Package): string[] {
  const errors: string[] = [];

  // Weight checks: only support up to 2000g (2kg) for the current pricing tables
  if (pkg.weight <= 0) {
    errors.push("Weight must be greater than 0");
  }
  if (pkg.weight > 2000) {
    errors.push(
      "Weight is greater than 2kg; this calculator supports small parcels up to 2kg only",
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

/**
 * Main calculation. Safer lookups and explicit checks to avoid runtime exceptions.
 */
export function calculateShipping(
  pkg: Package,
  destinationCode: string,
  serviceIds: string[],
): PriceQuote[] {
  // Validate package
  const validationErrors = validatePackage(pkg);
  if (validationErrors.length > 0) {
    throw new Error(
      `Package validation failed: ${validationErrors.join(", ")}`,
    );
  }

  // Find destination
  const destination = destinations.find((d) => d.code === destinationCode);
  if (!destination) {
    throw new Error(`Destination not found: ${destinationCode}`);
  }

  // UK domestic shipping not implemented in this version
  if (destination.code === "UK") {
    throw new Error("UK domestic shipping not implemented in this version");
  }

  const quotes: PriceQuote[] = [];

  for (const serviceId of serviceIds) {
    const service = services.find((s) => s.id === serviceId);
    if (!service) {
      // Skip invalid service IDs but include an unavailable quote for visibility
      quotes.push({
        service: {
          id: serviceId,
          name: serviceId,
          description: "Unknown service",
          tracking: false,
          signed: false,
        },
        destination,
        price: 0,
        estimatedDays: "N/A",
        available: false,
        restrictions: ["Invalid service id"],
      });
      continue;
    }

    try {
      const weightBand = getWeightBand(pkg.weight);
      const zoneKey = getZoneKey(destination);
      const serviceKey = getServiceKey(service);

      // Safe lookups into pricing data
      const servicePricing = (pricingData as any)[serviceKey];
      if (!servicePricing) {
        throw new Error(`Pricing not found for service: ${serviceKey}`);
      }

      const zonePricing = servicePricing[zoneKey];
      if (!zonePricing) {
        throw new Error(
          `Pricing not found for zone: ${zoneKey} in service: ${serviceKey}`,
        );
      }

      const price = zonePricing[weightBand];

      // Explicit undefined check so zero-valued prices are treated as valid (if any)
      if (price === undefined) {
        throw new Error(
          `No price for weight band ${weightBand} in ${zoneKey} for ${serviceKey}`,
        );
      }

      const estimatedDays = estimateDeliveryDays(service, destination);

      quotes.push({
        service,
        destination,
        price,
        estimatedDays,
        available: true,
        restrictions: [],
      });
    } catch (error) {
      quotes.push({
        service,
        destination,
        price: 0,
        estimatedDays: "N/A",
        available: false,
        restrictions: [
          error instanceof Error ? error.message : "Service not available",
        ],
      });
    }
  }

  // Return available quotes sorted by price, then append unavailable quotes
  const available = quotes
    .filter((q) => q.available)
    .sort((a, b) => a.price - b.price);
  const unavailable = quotes.filter((q) => !q.available);
  return [...available, ...unavailable];
}

export function findDestination(code: string): Destination | undefined {
  return destinations.find((d) => d.code === code);
}

export function getAvailableServices(): ServiceOption[] {
  return services;
}

export function getAvailableDestinations(): Destination[] {
  // Exclude UK for international shipping as in original behavior
  return destinations.filter((d) => d.code !== "UK");
}
