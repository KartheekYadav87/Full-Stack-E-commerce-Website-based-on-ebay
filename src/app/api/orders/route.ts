import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const userId = searchParams.get('user_id');

    // Single order by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const order = await db
        .select()
        .from(orders)
        .where(eq(orders.id, parseInt(id)))
        .limit(1);

      if (order.length === 0) {
        return NextResponse.json(
          { error: 'Order not found', code: 'ORDER_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(order[0], { status: 200 });
    }

    // List orders with optional user filter and pagination
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    let query = db.select().from(orders);

    // Filter by userId if provided
    if (userId) {
      if (isNaN(parseInt(userId))) {
        return NextResponse.json(
          { error: 'Valid user_id is required', code: 'INVALID_USER_ID' },
          { status: 400 }
        );
      }
      query = query.where(eq(orders.userId, parseInt(userId)));
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error: any) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, totalAmount, status, paymentType } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    if (totalAmount === undefined || totalAmount === null) {
      return NextResponse.json(
        { error: 'totalAmount is required', code: 'MISSING_TOTAL_AMOUNT' },
        { status: 400 }
      );
    }

    // Validate userId is valid integer
    if (isNaN(parseInt(userId))) {
      return NextResponse.json(
        { error: 'userId must be a valid integer', code: 'INVALID_USER_ID' },
        { status: 400 }
      );
    }

    // Validate totalAmount is positive number
    const parsedAmount = parseFloat(totalAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        {
          error: 'totalAmount must be a positive number',
          code: 'INVALID_TOTAL_AMOUNT',
        },
        { status: 400 }
      );
    }

    // Prepare insert data
    const orderData: any = {
      userId: parseInt(userId),
      totalAmount: parsedAmount,
      orderDate: new Date().toISOString(),
      status: status ? status.trim() : 'pending',
      paymentType: paymentType ? paymentType.trim() : null,
    };

    const newOrder = await db.insert(orders).values(orderData).returning();

    return NextResponse.json(newOrder[0], { status: 201 });
  } catch (error: any) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Validate ID is provided
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, totalAmount } = body;

    // Check if order exists
    const existingOrder = await db
      .select()
      .from(orders)
      .where(eq(orders.id, parseInt(id)))
      .limit(1);

    if (existingOrder.length === 0) {
      return NextResponse.json(
        { error: 'Order not found', code: 'ORDER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};

    if (status !== undefined) {
      updateData.status = status.trim();
    }

    if (totalAmount !== undefined) {
      const parsedAmount = parseFloat(totalAmount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return NextResponse.json(
          {
            error: 'totalAmount must be a positive number',
            code: 'INVALID_TOTAL_AMOUNT',
          },
          { status: 400 }
        );
      }
      updateData.totalAmount = parsedAmount;
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          error: 'No valid fields to update',
          code: 'NO_UPDATE_FIELDS',
        },
        { status: 400 }
      );
    }

    const updated = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error: any) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}