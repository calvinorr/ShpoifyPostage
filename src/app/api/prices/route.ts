import { NextRequest, NextResponse } from 'next/server';
import { PriceService } from '@/lib/priceService';
import { Package } from '@/types';
import { COUNTRY_ZONE_MAP } from '@/lib/seedPrices';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    switch (action) {
      case 'calculate': {
        // Get current prices for calculation
        const length = parseFloat(searchParams.get('length') || '0');
        const width = parseFloat(searchParams.get('width') || '0');
        const height = parseFloat(searchParams.get('height') || '0');
        const weight = parseFloat(searchParams.get('weight') || '0');
        const country = searchParams.get('country')?.toLowerCase();
        const services = searchParams.get('services')?.split(',') || [];

        if (!country || !COUNTRY_ZONE_MAP[country]) {
          return NextResponse.json(
            { error: 'Invalid or unsupported destination country' },
            { status: 400 }
          );
        }

        const packageData: Package = { length, width, height, weight };
        const { destination } = COUNTRY_ZONE_MAP[country];

        const prices = await PriceService.getCurrentPrices(
          packageData,
          destination,
          services
        );

        return NextResponse.json({
          prices: prices.map(price => ({
            service: price.service,
            price: price.price,
            currency: price.currency,
            zone: price.zone,
            destination: price.destination,
            effectiveDate: price.effectiveDate,
            available: true
          }))
        });
      }

      case 'history': {
        const service = searchParams.get('service');
        const destination = searchParams.get('destination');
        const zone = parseInt(searchParams.get('zone') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        if (!service || !destination) {
          return NextResponse.json(
            { error: 'Service and destination are required for history' },
            { status: 400 }
          );
        }

        const history = await PriceService.getPriceHistory(service, destination, zone, limit);
        return NextResponse.json({ history });
      }

      case 'history-filtered': {
        const services = searchParams.get('services')?.split(',').filter(Boolean) || undefined;
        const destinations = searchParams.get('destinations')?.split(',').filter(Boolean) || undefined;
        const zones = searchParams.get('zones')?.split(',').map(z => parseInt(z)).filter(z => !isNaN(z)) || undefined;
        const dateFrom = searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined;
        const dateTo = searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined;
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');
        const sortBy = searchParams.get('sortBy') || 'effectiveDate';
        const sortOrder = (searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc';

        const result = await PriceService.getPriceHistoryWithFilters({
          services,
          destinations,
          zones,
          dateFrom,
          dateTo,
          limit,
          offset,
          sortBy,
          sortOrder
        });

        return NextResponse.json(result);
      }

      case 'changes': {
        const services = searchParams.get('services')?.split(',').filter(Boolean) || undefined;
        const destinations = searchParams.get('destinations')?.split(',').filter(Boolean) || undefined;
        const zones = searchParams.get('zones')?.split(',').map(z => parseInt(z)).filter(z => !isNaN(z)) || undefined;
        const dateFrom = searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined;
        const dateTo = searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined;
        const changeType = searchParams.get('changeType') as 'increase' | 'decrease' | 'all' || 'all';
        const minChangePercent = searchParams.get('minChangePercent') ? parseFloat(searchParams.get('minChangePercent')!) : undefined;
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');

        const result = await PriceService.getPriceChangesWithFilters({
          services,
          destinations,
          zones,
          dateFrom,
          dateTo,
          changeType,
          minChangePercent,
          limit,
          offset
        });

        return NextResponse.json(result);
      }

      case 'filter-options': {
        const options = await PriceService.getFilterOptions();
        return NextResponse.json(options);
      }

      case 'updates': {
        const limit = parseInt(searchParams.get('limit') || '5');
        const updates = await PriceService.getRecentUpdates(limit);
        return NextResponse.json({ updates });
      }

      case 'zones': {
        const zones = await PriceService.getDestinationZones();
        return NextResponse.json({ zones });
      }

      default: {
        return NextResponse.json(
          { error: 'Invalid action. Use: calculate, history, history-filtered, changes, updates, zones, or filter-options' },
          { status: 400 }
        );
      }
    }

  } catch (error) {
    console.error('Price API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prices } = body;

    if (!Array.isArray(prices) || prices.length === 0) {
      return NextResponse.json(
        { error: 'Prices array is required' },
        { status: 400 }
      );
    }

    const result = await PriceService.savePrices(prices);

    return NextResponse.json({
      success: true,
      updateId: result.updateId,
      totalEntries: result.totalEntries,
      newEntries: result.newEntries,
      changedEntries: result.changedEntries,
      status: result.status
    });

  } catch (error) {
    console.error('Price save error:', error);
    return NextResponse.json(
      { error: 'Failed to save prices' },
      { status: 500 }
    );
  }
}