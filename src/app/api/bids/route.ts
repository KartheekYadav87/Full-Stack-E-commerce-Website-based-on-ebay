import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bids } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');
    const userId = searchParams.get('user_id');

    // Validate parameters if provided
    if (productId && isNaN(parseInt(productId))) {
      return NextResponse.json(
        { 
          error: 'Invalid product_id parameter', 
          code: 'INVALID_PRODUCT_ID' 
        },
        { status: 400 }
      );
    }

    if (userId && isNaN(parseInt(userId))) {
      return NextResponse.json(
        { 
          error: 'Invalid user_id parameter', 
          code: 'INVALID_USER_ID' 
        },
        { status: 400 }
      );
    }

    let query = db.select().from(bids);

    // Build filter conditions
    const conditions = [];
    if (productId) {
      conditions.push(eq(bids.productId, parseInt(productId)));
    }
    if (userId) {
      conditions.push(eq(bids.userId, parseInt(userId)));
    }

    // Apply filters if any exist
    if (conditions.length > 0) {
      if (conditions.length === 1) {
        query = query.where(conditions[0]);
      } else {
        query = query.where(and(...conditions));
      }
    }

    const results = await query;

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, userId, amount } = body;

    // Validate required fields
    if (!productId) {
      return NextResponse.json(
        { 
          error: 'productId is required', 
          code: 'MISSING_PRODUCT_ID' 
        },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { 
          error: 'userId is required', 
          code: 'MISSING_USER_ID' 
        },
        { status: 400 }
      );
    }

    if (amount === undefined || amount === null) {
      return NextResponse.json(
        { 
          error: 'amount is required', 
          code: 'MISSING_AMOUNT' 
        },
        { status: 400 }
      );
    }

    // Validate productId is valid integer
    if (isNaN(parseInt(productId))) {
      return NextResponse.json(
        { 
          error: 'productId must be a valid integer', 
          code: 'INVALID_PRODUCT_ID' 
        },
        { status: 400 }
      );
    }

    // Validate userId is valid integer
    if (isNaN(parseInt(userId))) {
      return NextResponse.json(
        { 
          error: 'userId must be a valid integer', 
          code: 'INVALID_USER_ID' 
        },
        { status: 400 }
      );
    }

    // Validate amount is positive number
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json(
        { 
          error: 'amount must be a positive number', 
          code: 'INVALID_AMOUNT' 
        },
        { status: 400 }
      );
    }

    // Create new bid
    const newBid = await db.insert(bids)
      .values({
        productId: parseInt(productId),
        userId: parseInt(userId),
        amount: amountNum,
        bidDate: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newBid[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}