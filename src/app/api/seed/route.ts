import { NextRequest, NextResponse } from 'next/server';
import { seedPrices } from '@/lib/seedPrices';

export async function POST(request: NextRequest) {
  try {
    // Add basic auth check in production
    const authHeader = request.headers.get('authorization');
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await seedPrices();

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully'
    });

  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    );
  }
}