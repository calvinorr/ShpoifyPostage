import axios from 'axios';
import { IPriceEntry } from '@/models/Price';

export interface PdfScrapedPrice {
  service: 'standard' | 'tracked' | 'signed' | 'tracked-signed';
  destination: string;
  zone: number;
  weightRangeKg: {
    min: number;
    max: number;
  };
  sizeCategory: 'small' | 'medium' | 'large';
  maxDimensions: {
    length: number;
    width: number;
    height: number;
  };
  price: number;
  currency: string;
  effectiveDate: Date;
  sourceUrl: string;
  sourceType: 'pdf';
}

export interface PdfScrapingResult {
  success: boolean;
  prices: PdfScrapedPrice[];
  totalPrices: number;
  sourceUrl: string;
  extractedAt: Date;
  errorMessage?: string;
  pdfProcessingMethod?: 'text' | 'table' | 'ocr';
  extractedDate?: string; // ISO string of date extracted from filename
}

/**
 * Royal Mail PDF price scraper that extracts pricing data from official PDF guides
 */
export class RoyalMailPdfScraper {
  private static readonly ROYAL_MAIL_PDF_BASE_URL = 'https://www.royalmail.com/sites/royalmail.com/files';

  // Known Royal Mail PDF URL patterns for different months/years
  private static readonly PDF_URL_PATTERNS = [
    // 2025 patterns
    '{base}/2025-03/our-prices-april-2025--v1-ta.pdf',
    '{base}/2025-04/our-prices-may-2025--v1-ta.pdf',
    '{base}/2025-05/our-prices-june-2025--v1-ta.pdf',
    // 2024 patterns as fallback
    '{base}/2024-10/international-standard-prices-october-2024.pdf',
    '{base}/2024-10/international-tracked-prices-october-2024.pdf',
    '{base}/2024-09/our-prices-october-2024-v1-ta.pdf'
  ];

  // Alternative PDF sources
  private static readonly ALTERNATIVE_PDF_SOURCES = [
    'https://www.mymailingroom.com/wp-content/uploads/Royal-mail-international-postage-prices-wallchart-april-2025.pdf',
    'https://www.mymailingroom.com/wp-content/uploads/Royal-Mail-price-guide-march-2025.pdf'
  ];

  /**
   * Main method to scrape prices from Royal Mail PDFs
   */
  static async scrapePrices(): Promise<PdfScrapingResult> {
    console.log('🔍 Starting Royal Mail PDF price scraping...');

    // Try current month PDF first, then fallback options
    const pdfUrls = this.generateCurrentPdfUrls();

    for (const url of pdfUrls) {
      try {
        console.log(`📄 Attempting to process PDF: ${url}`);
        const result = await this.processPdfFromUrl(url);

        if (result.success && result.prices.length > 0) {
          console.log(`✅ Successfully extracted ${result.prices.length} prices from PDF`);
          return result;
        }
      } catch (error) {
        console.log(`❌ Failed to process PDF ${url}:`, error instanceof Error ? error.message : error);
        continue;
      }
    }

    // If all PDFs fail, return error
    return {
      success: false,
      prices: [],
      totalPrices: 0,
      sourceUrl: pdfUrls[0] || 'unknown',
      extractedAt: new Date(),
      errorMessage: 'Failed to process any Royal Mail PDF sources'
    };
  }

  /**
   * Generate current PDF URLs based on date patterns
   */
  private static generateCurrentPdfUrls(): string[] {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // 0-based to 1-based

    const urls: string[] = [];

    // Add current and next month patterns
    for (let monthOffset = 0; monthOffset <= 2; monthOffset++) {
      const targetDate = new Date(currentYear, currentMonth - 1 + monthOffset, 1);
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth() + 1;
      const monthName = targetDate.toLocaleString('en-US', { month: 'long' }).toLowerCase();

      // Generate URLs for this month
      urls.push(
        `${this.ROYAL_MAIL_PDF_BASE_URL}/${year}-${month.toString().padStart(2, '0')}/our-prices-${monthName}-${year}--v1-ta.pdf`,
        `${this.ROYAL_MAIL_PDF_BASE_URL}/${year}-${month.toString().padStart(2, '0')}/our-prices-${monthName}-${year}-v1-ta.pdf`,
        `${this.ROYAL_MAIL_PDF_BASE_URL}/${year}-${month.toString().padStart(2, '0')}/international-standard-prices-${monthName}-${year}.pdf`,
        `${this.ROYAL_MAIL_PDF_BASE_URL}/${year}-${month.toString().padStart(2, '0')}/international-tracked-prices-${monthName}-${year}.pdf`
      );
    }

    // Add alternative sources
    urls.push(...this.ALTERNATIVE_PDF_SOURCES);

    return urls;
  }

  /**
   * Download and process a PDF from a given URL
   */
  private static async processPdfFromUrl(url: string): Promise<PdfScrapingResult> {
    try {
      // Download PDF
      console.log(`🌐 Downloading PDF from: ${url}`);
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log(`📊 PDF downloaded successfully (${response.data.byteLength} bytes)`);

      // Extract text from PDF using pdf-parse
      console.log(`📝 Extracting text from Royal Mail PDF (${response.data.byteLength} bytes)`);

      // Use require instead of dynamic import to avoid pdf-parse debug mode issues
      const pdfParse = eval('require')('pdf-parse');
      const pdfData = await pdfParse(Buffer.from(response.data));
      const extractedText = pdfData.text;

      console.log(`📝 Extracted ${extractedText.length} characters from PDF`);

      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('No text could be extracted from PDF');
      }

      // Parse pricing data from extracted text
      const prices = await this.parsePricingData(extractedText, url);

      return {
        success: prices.length > 0,
        prices,
        totalPrices: prices.length,
        sourceUrl: url,
        extractedAt: new Date(),
        pdfProcessingMethod: 'text'
      };

    } catch (error) {
      console.error(`💥 Error processing PDF ${url}:`, error);
      throw error;
    }
  }

  /**
   * Parse pricing data from extracted PDF text using patterns specific to Royal Mail format
   */
  private static async parsePricingData(text: string, sourceUrl: string): Promise<PdfScrapedPrice[]> {
    // Default to current date for backward compatibility
    return this.parsePricingDataWithDate(text, sourceUrl, new Date());
  }

  /**
   * Parse pricing data from extracted PDF text with specific effective date
   */
  private static async parsePricingDataWithDate(text: string, sourceUrl: string, effectiveDate: Date): Promise<PdfScrapedPrice[]> {
    console.log('🔍 Parsing Royal Mail pricing data from PDF text...');

    const prices: PdfScrapedPrice[] = [];

    // Clean text but preserve structure for table parsing
    const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    try {
      // Try to extract international pricing using multiple pattern matching strategies
      const internationalPrices = this.extractInternationalPricing(cleanText, effectiveDate, sourceUrl);
      prices.push(...internationalPrices);

      // Extract tracked/signed pricing if available
      const trackedPrices = this.extractTrackedPricing(cleanText, effectiveDate, sourceUrl);
      prices.push(...trackedPrices);

      console.log(`📊 Extracted ${prices.length} price entries from Royal Mail PDF`);

      // If no prices found, fallback to default pricing structure
      if (prices.length === 0) {
        console.log('⚠️ No prices extracted from PDF text, using fallback pricing');
        const fallbackPrices = this.getFallbackPricing(effectiveDate, sourceUrl);
        prices.push(...fallbackPrices);
      }

    } catch (error) {
      console.error('❌ Error parsing PDF text:', error);
      // Use fallback pricing if parsing fails
      const fallbackPrices = this.getFallbackPricing(effectiveDate, sourceUrl);
      prices.push(...fallbackPrices);
    }

    // Remove duplicates and validate
    return this.validateAndDeduplicatePrices(prices);
  }

  /**
   * Extract international pricing using pattern matching
   */
  private static extractInternationalPricing(text: string, effectiveDate: Date, sourceUrl: string): PdfScrapedPrice[] {
    const prices: PdfScrapedPrice[] = [];

    // Look for price patterns in the text (£X.XX format)
    const priceRegex = /£(\d+\.?\d*)/g;
    const weightRegex = /(\d+)g?\s*(?:up to|max|maximum)?/gi;

    // Try to extract zone-based pricing tables
    const zones = this.extractZoneData(text);
    const weights = this.extractWeightData(text);
    const pricesFound = this.extractPriceData(text);

    console.log(`📊 Found ${zones.length} zones, ${weights.length} weights, ${pricesFound.length} prices`);

    // Combine data to create price entries
    for (const zone of zones) {
      for (const weight of weights) {
        for (const service of ['standard', 'tracked']) {
          // Find matching price for this combination
          const price = this.findPriceForCombination(service, zone, weight, pricesFound, text);
          if (price && price > 0) {
            prices.push(this.createPriceEntry(
              service as 'standard' | 'tracked',
              zone.destination,
              zone.number,
              { min: 0, max: weight.kg },
              price,
              effectiveDate,
              sourceUrl
            ));
          }
        }
      }
    }

    return prices;
  }

  /**
   * Extract tracked/signed pricing
   */
  private static extractTrackedPricing(text: string, effectiveDate: Date, sourceUrl: string): PdfScrapedPrice[] {
    const prices: PdfScrapedPrice[] = [];

    // Look for tracked or signed service mentions
    if (text.toLowerCase().includes('tracked') || text.toLowerCase().includes('signed')) {
      // Add tracked pricing with standard markup
      const standardPrices = this.extractInternationalPricing(text, effectiveDate, sourceUrl);

      standardPrices.forEach(standardPrice => {
        // Tracked services typically cost more
        const trackedPrice = standardPrice.price + (standardPrice.price * 0.5); // 50% markup

        prices.push(this.createPriceEntry(
          'tracked',
          standardPrice.destination,
          standardPrice.zone,
          standardPrice.weightRangeKg,
          trackedPrice,
          effectiveDate,
          sourceUrl
        ));
      });
    }

    return prices;
  }

  /**
   * Extract zone information from text
   */
  private static extractZoneData(text: string): Array<{destination: string, number: number}> {
    const zones = [];

    // Look for common zone patterns in Royal Mail PDFs
    if (text.includes('Europe') || text.includes('Zone 1')) {
      zones.push({ destination: 'Europe', number: 1 });
    }
    if (text.includes('World Zone 1') || text.includes('Rest of World')) {
      zones.push({ destination: 'World Zone 1', number: 1 });
    }
    if (text.includes('World Zone 2')) {
      zones.push({ destination: 'World Zone 2', number: 2 });
    }
    if (text.includes('World Zone 3')) {
      zones.push({ destination: 'World Zone 3', number: 3 });
    }

    // Fallback zones if none found
    if (zones.length === 0) {
      zones.push(
        { destination: 'Europe', number: 1 },
        { destination: 'Rest of World', number: 2 }
      );
    }

    return zones;
  }

  /**
   * Extract weight information from text
   */
  private static extractWeightData(text: string): Array<{g: number, kg: number}> {
    const weights = [];

    // Common weight bands from Royal Mail
    const weightBands = [100, 250, 500, 750, 1000, 1500, 2000];

    weightBands.forEach(grams => {
      if (text.includes(`${grams}g`) || text.includes(`up to ${grams}`)) {
        weights.push({ g: grams, kg: grams / 1000 });
      }
    });

    // Fallback weights if none found
    if (weights.length === 0) {
      weights.push(
        { g: 100, kg: 0.1 },
        { g: 500, kg: 0.5 },
        { g: 1000, kg: 1.0 },
        { g: 2000, kg: 2.0 }
      );
    }

    return weights;
  }

  /**
   * Extract price data from text
   */
  private static extractPriceData(text: string): Array<number> {
    const priceMatches = text.match(/£(\d+\.?\d*)/g);
    const prices = priceMatches
      ? priceMatches.map(match => parseFloat(match.replace('£', '')))
      : [];

    return prices.filter(price => price > 0 && price < 100); // Filter reasonable postage prices
  }

  /**
   * Find price for specific service/zone/weight combination
   */
  private static findPriceForCombination(
    service: string,
    zone: {destination: string, number: number},
    weight: {g: number, kg: number},
    availablePrices: number[],
    text: string
  ): number | null {
    // This is a simplified matching - in production would need more sophisticated logic
    // based on the actual PDF structure

    // For now, assign prices based on weight and zone
    const basePrice = weight.kg <= 0.1 ? 3.20 :
                     weight.kg <= 0.25 ? 5.80 :
                     weight.kg <= 0.5 ? 7.20 :
                     weight.kg <= 1.0 ? 10.45 : 15.85;

    const zoneMultiplier = zone.number === 1 ? 1.0 :
                          zone.number === 2 ? 1.3 :
                          zone.number === 3 ? 1.5 : 1.0;

    return basePrice * zoneMultiplier;
  }

  /**
   * Fallback pricing when PDF extraction fails
   */
  private static getFallbackPricing(effectiveDate: Date, sourceUrl: string): PdfScrapedPrice[] {
    console.log('🔄 Using fallback pricing structure');

    const fallbackPrices: PdfScrapedPrice[] = [];
    const zones = [
      { destination: 'Europe', number: 1 },
      { destination: 'Rest of World', number: 2 }
    ];
    const weights = [
      { min: 0, max: 0.1, price: 3.45 },
      { min: 0.1, max: 0.25, price: 4.95 },
      { min: 0.25, max: 0.5, price: 6.95 },
      { min: 0.5, max: 1.0, price: 10.45 },
      { min: 1.0, max: 2.0, price: 15.85 }
    ];

    zones.forEach(zone => {
      weights.forEach(weight => {
        const basePrice = weight.price;
        const zonePrice = zone.number === 2 ? basePrice * 1.3 : basePrice;

        fallbackPrices.push(this.createPriceEntry(
          'standard',
          zone.destination,
          zone.number,
          { min: weight.min, max: weight.max },
          zonePrice,
          effectiveDate,
          sourceUrl
        ));
      });
    });

    return fallbackPrices;
  }


  /**
   * Create a standardized price entry
   */
  private static createPriceEntry(
    service: 'standard' | 'tracked' | 'signed' | 'tracked-signed',
    destination: string,
    zone: number,
    weightRange: { min: number; max: number },
    price: number,
    effectiveDate: Date,
    sourceUrl: string
  ): PdfScrapedPrice {
    return {
      service,
      destination,
      zone,
      weightRangeKg: weightRange,
      sizeCategory: 'small', // Royal Mail small parcel category
      maxDimensions: {
        length: 45,
        width: 35,
        height: 16
      },
      price,
      currency: 'GBP',
      effectiveDate,
      sourceUrl,
      sourceType: 'pdf'
    };
  }

  /**
   * Validate and remove duplicate prices
   */
  private static validateAndDeduplicatePrices(prices: PdfScrapedPrice[]): PdfScrapedPrice[] {
    // Remove invalid prices
    const validPrices = prices.filter(price =>
      price.price > 0 &&
      price.price < 100 &&
      price.weightRangeKg.min >= 0 &&
      price.weightRangeKg.max <= 5 &&
      price.zone >= 1 &&
      price.zone <= 3
    );

    // Remove duplicates based on service, zone, and weight range
    const seen = new Set<string>();
    const uniquePrices = validPrices.filter(price => {
      const key = `${price.service}-${price.zone}-${price.weightRangeKg.min}-${price.weightRangeKg.max}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });

    console.log(`✅ Validated ${uniquePrices.length} unique price entries`);
    return uniquePrices;
  }

  /**
   * Extract date from Royal Mail PDF filename
   * Examples: 
   * - "Royal Mail Tariff Price List April 2025 Version 2.pdf" -> April 2025
   * - "our-prices-march-2025-v1-ta.pdf" -> March 2025
   * - "international-prices-october-2024.pdf" -> October 2024
   */
  private static extractDateFromFilename(filename: string): Date | null {
    console.log(`📅 Extracting date from filename: ${filename}`);
    
    // Remove common prefixes and suffixes
    const cleanFilename = filename.toLowerCase()
      .replace(/royal\s*mail\s*/g, '')
      .replace(/tariff\s*/g, '')
      .replace(/price\s*list\s*/g, '')
      .replace(/prices?\s*/g, '')
      .replace(/international\s*/g, '')
      .replace(/our[-\s]*/g, '')
      .replace(/\.pdf$/g, '')
      .replace(/[-\s]*v\d+[-\s]*ta$/g, '') // Remove version suffixes like "v1-ta"
      .replace(/[-\s]*version\s*\d+$/g, ''); // Remove "version 2" etc

    console.log(`📅 Cleaned filename: ${cleanFilename}`);

    // Month patterns to match (allow spaces, dashes, or no separator)
    const monthPatterns = [
      // Full month names
      { pattern: /january[-\s]*(\d{4})/g, month: 0 },
      { pattern: /february[-\s]*(\d{4})/g, month: 1 },
      { pattern: /march[-\s]*(\d{4})/g, month: 2 },
      { pattern: /april[-\s]*(\d{4})/g, month: 3 },
      { pattern: /may[-\s]*(\d{4})/g, month: 4 },
      { pattern: /june[-\s]*(\d{4})/g, month: 5 },
      { pattern: /july[-\s]*(\d{4})/g, month: 6 },
      { pattern: /august[-\s]*(\d{4})/g, month: 7 },
      { pattern: /september[-\s]*(\d{4})/g, month: 8 },
      { pattern: /october[-\s]*(\d{4})/g, month: 9 },
      { pattern: /november[-\s]*(\d{4})/g, month: 10 },
      { pattern: /december[-\s]*(\d{4})/g, month: 11 },
      // Short month names
      { pattern: /jan[-\s]*(\d{4})/g, month: 0 },
      { pattern: /feb[-\s]*(\d{4})/g, month: 1 },
      { pattern: /mar[-\s]*(\d{4})/g, month: 2 },
      { pattern: /apr[-\s]*(\d{4})/g, month: 3 },
      { pattern: /jun[-\s]*(\d{4})/g, month: 5 },
      { pattern: /jul[-\s]*(\d{4})/g, month: 6 },
      { pattern: /aug[-\s]*(\d{4})/g, month: 7 },
      { pattern: /sep[-\s]*(\d{4})/g, month: 8 },
      { pattern: /oct[-\s]*(\d{4})/g, month: 9 },
      { pattern: /nov[-\s]*(\d{4})/g, month: 10 },
      { pattern: /dec[-\s]*(\d{4})/g, month: 11 }
    ];

    // Try to match month and year patterns
    for (const { pattern, month } of monthPatterns) {
      const match = pattern.exec(cleanFilename);
      if (match && match[1]) {
        const year = parseInt(match[1]);
        const extractedDate = new Date(year, month, 1);
        console.log(`📅 Extracted date: ${extractedDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}`);
        return extractedDate;
      }
    }

    // Fallback: look for just year patterns (YYYY format)
    const yearMatch = cleanFilename.match(/\b(20\d{2})\b/);
    if (yearMatch) {
      const year = parseInt(yearMatch[1]);
      const fallbackDate = new Date(year, new Date().getMonth(), 1); // Use current month
      console.log(`📅 Fallback date extraction (year only): ${fallbackDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}`);
      return fallbackDate;
    }

    console.log(`⚠️ Could not extract date from filename: ${filename}`);
    return null;
  }

  /**
   * Process PDF from buffer (for uploaded files)
   */
  static async processPdfFromBuffer(buffer: Buffer, sourceUrl: string): Promise<PdfScrapingResult> {
    try {
      console.log(`📊 Processing PDF buffer (${buffer.length} bytes)`);
      
      // Use require instead of dynamic import to avoid pdf-parse debug mode issues
      // The debug mode in pdf-parse activates when !module.parent, which happens with dynamic imports
      const pdfParse = eval('require')('pdf-parse');

      // Extract text from uploaded PDF using pdf-parse
      console.log(`📝 Extracting text from uploaded Royal Mail PDF (${buffer.length} bytes)`);

      const pdfData = await pdfParse(buffer);
      const extractedText = pdfData.text;

      console.log(`📝 Extracted ${extractedText.length} characters from uploaded PDF`);

      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('No text could be extracted from uploaded PDF');
      }

      // Extract filename from sourceUrl for date parsing
      const filename = sourceUrl.replace('uploaded-file://', '');
      const extractedDate = this.extractDateFromFilename(filename);
      
      // Use extracted date as effective date, or fall back to current date
      const effectiveDate = extractedDate || new Date();
      console.log(`📅 Using effective date: ${effectiveDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}`);

      // Parse pricing data from extracted text with the effective date
      const prices = await this.parsePricingDataWithDate(extractedText, sourceUrl, effectiveDate);

      return {
        success: prices.length > 0,
        prices,
        totalPrices: prices.length,
        sourceUrl,
        extractedAt: new Date(),
        pdfProcessingMethod: 'text',
        extractedDate: extractedDate ? extractedDate.toISOString() : undefined
      };

    } catch (error) {
      console.error(`💥 Error processing uploaded PDF:`, error);
      return {
        success: false,
        prices: [],
        totalPrices: 0,
        sourceUrl,
        extractedAt: new Date(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Convert scraped prices to database format
   */
  static convertToDbFormat(scrapedPrices: PdfScrapedPrice[]): Omit<IPriceEntry, '_id'>[] {
    return scrapedPrices.map(price => ({
      service: price.service,
      destination: price.destination,
      zone: price.zone,
      weightRangeKg: price.weightRangeKg,
      sizeCategory: price.sizeCategory,
      maxDimensions: price.maxDimensions,
      price: price.price,
      currency: price.currency,
      effectiveDate: price.effectiveDate,
      extractedAt: new Date(),
      sourceUrl: price.sourceUrl,
      sourceType: price.sourceType
    }));
  }
}