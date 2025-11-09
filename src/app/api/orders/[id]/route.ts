import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        },
        { status: 400 }
      );
    }

    // Fetch order by ID
    const order = await db.select()
      .from(orders)
      .where(eq(orders.id, parseInt(id)))
      .limit(1);

    if (order.length === 0) {
      return NextResponse.json(
        { 
          error: 'Order not found',
          code: 'ORDER_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json(order[0], { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { status, totalAmount, paymentType } = body;

    // Validate at least one field is provided
    if (status === undefined && totalAmount === undefined && paymentType === undefined) {
      return NextResponse.json(
        { 
          error: "At least one field (status, totalAmount, or paymentType) must be provided",
          code: "NO_UPDATE_FIELDS" 
        },
        { status: 400 }
      );
    }

    // Validate totalAmount if provided
    if (totalAmount !== undefined && (typeof totalAmount !== 'number' || totalAmount <= 0)) {
      return NextResponse.json(
        { 
          error: "Total amount must be a positive number",
          code: "INVALID_TOTAL_AMOUNT" 
        },
        { status: 400 }
      );
    }

    // Check if order exists
    const existingOrder = await db.select()
      .from(orders)
      .where(eq(orders.id, parseInt(id)))
      .limit(1);

    if (existingOrder.length === 0) {
      return NextResponse.json(
        { 
          error: 'Order not found',
          code: 'ORDER_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: Record<string, any> = {};

    if (status !== undefined) {
      updateData.status = typeof status === 'string' ? status.trim() : status;
    }

    if (totalAmount !== undefined) {
      updateData.totalAmount = totalAmount;
    }

    if (paymentType !== undefined) {
      updateData.paymentType = paymentType ? paymentType.trim() : null;
    }

    // Update order
    const updated = await db.update(orders)
      .set(updateData)
      .where(eq(orders.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}