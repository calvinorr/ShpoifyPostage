import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { PriceEntry, PriceUpdate } from '@/models/Price';

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    // Clear all price entries
    const priceEntriesResult = await PriceEntry.deleteMany({});
    
    // Clear all price updates
    const priceUpdatesResult = await PriceUpdate.deleteMany({});

    return NextResponse.json({
      success: true,
      message: 'Database cleared successfully',
      deletedPriceEntries: priceEntriesResult.deletedCount,
      deletedPriceUpdates: priceUpdatesResult.deletedCount
    });

  } catch (error) {
    console.error('Database clear error:', error);
    return NextResponse.json(
      { error: 'Failed to clear database' },
      { status: 500 }
    );
  }
}