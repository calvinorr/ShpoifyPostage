import { NextRequest, NextResponse } from 'next/server';
import { RoyalMailPdfScraper } from '@/lib/royalMailPdfScraper';
import { PriceService } from '@/lib/priceService';

// Configure maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    // Check for admin authorization
    const authHeader = request.headers.get('authorization');
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('📄 PDF upload triggered via API');

    // Get the uploaded file from form data
    const formData = await request.formData();
    const file = formData.get('pdf') as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'No PDF file provided'
        },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        {
          success: false,
          error: 'File must be a PDF'
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`
        },
        { status: 400 }
      );
    }

    console.log(`📊 Processing uploaded PDF: ${file.name} (${file.size} bytes)`);

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process the PDF using our existing scraper logic
    const scrapingResult = await RoyalMailPdfScraper.processPdfFromBuffer(
      buffer,
      `uploaded-file://${file.name}`
    );

    if (!scrapingResult.success) {
      return NextResponse.json({
        success: false,
        error: scrapingResult.errorMessage || 'PDF processing failed',
        totalPrices: 0,
        sourceUrl: `uploaded-file://${file.name}`,
        extractedAt: scrapingResult.extractedAt
      }, { status: 500 });
    }

    // Convert to database format
    const dbPrices = RoyalMailPdfScraper.convertToDbFormat(scrapingResult.prices);

    // Save to database
    const saveResult = await PriceService.savePrices(dbPrices);

    console.log(`✅ PDF upload processing completed: ${saveResult.totalEntries} total, ${saveResult.newEntries} new, ${saveResult.changedEntries} changed`);

    return NextResponse.json({
      success: true,
      file: {
        name: file.name,
        size: file.size,
        type: file.type
      },
      scraping: {
        method: 'pdf-upload',
        processingMethod: scrapingResult.pdfProcessingMethod || 'text',
        totalPricesScraped: scrapingResult.totalPrices,
        sourceUrl: scrapingResult.sourceUrl,
        sourceType: 'pdf',
        extractedAt: scrapingResult.extractedAt
      },
      database: {
        updateId: saveResult.updateId,
        totalEntries: saveResult.totalEntries,
        newEntries: saveResult.newEntries,
        changedEntries: saveResult.changedEntries,
        status: saveResult.status
      }
    });

  } catch (error) {
    console.error('💥 PDF upload API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error during PDF processing',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'PDF Upload API',
    maxFileSize: `${MAX_FILE_SIZE / 1024 / 1024}MB`,
    supportedTypes: ['application/pdf'],
    endpoints: {
      upload: 'POST /api/upload-pdf'
    }
  });
}