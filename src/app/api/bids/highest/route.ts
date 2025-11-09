import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bids } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');

    // Validate product_id is provided
    if (!productId) {
      return NextResponse.json(
        { 
          error: 'product_id query parameter is required',
          code: 'MISSING_PRODUCT_ID'
        },
        { status: 400 }
      );
    }

    // Validate product_id is a valid integer
    const parsedProductId = parseInt(productId);
    if (isNaN(parsedProductId)) {
      return NextResponse.json(
        { 
          error: 'product_id must be a valid integer',
          code: 'INVALID_PRODUCT_ID'
        },
        { status: 400 }
      );
    }

    // Query for highest bid
    const highestBid = await db
      .select()
      .from(bids)
      .where(eq(bids.productId, parsedProductId))
      .orderBy(desc(bids.amount))
      .limit(1);

    // Check if any bids found
    if (highestBid.length === 0) {
      return NextResponse.json(
        { 
          error: 'No bids found for this product',
          code: 'NO_BIDS_FOUND'
        },
        { status: 404 }
      );
    }

    // Return highest bid
    return NextResponse.json(highestBid[0], { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}