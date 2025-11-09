import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { payments } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');

    if (orderId) {
      const parsedOrderId = parseInt(orderId);
      if (isNaN(parsedOrderId)) {
        return NextResponse.json(
          { 
            error: 'Invalid order_id parameter',
            code: 'INVALID_ORDER_ID' 
          },
          { status: 400 }
        );
      }

      const results = await db.select()
        .from(payments)
        .where(eq(payments.orderId, parsedOrderId));

      return NextResponse.json(results, { status: 200 });
    }

    const results = await db.select().from(payments);
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
    const { orderId, paymentType } = body;

    if (!orderId) {
      return NextResponse.json(
        { 
          error: 'orderId is required',
          code: 'MISSING_ORDER_ID' 
        },
        { status: 400 }
      );
    }

    if (!paymentType) {
      return NextResponse.json(
        { 
          error: 'paymentType is required',
          code: 'MISSING_PAYMENT_TYPE' 
        },
        { status: 400 }
      );
    }

    const parsedOrderId = parseInt(orderId);
    if (isNaN(parsedOrderId)) {
      return NextResponse.json(
        { 
          error: 'orderId must be a valid integer',
          code: 'INVALID_ORDER_ID' 
        },
        { status: 400 }
      );
    }

    const trimmedPaymentType = paymentType.trim();
    if (!trimmedPaymentType) {
      return NextResponse.json(
        { 
          error: 'paymentType cannot be empty',
          code: 'EMPTY_PAYMENT_TYPE' 
        },
        { status: 400 }
      );
    }

    const newPayment = await db.insert(payments)
      .values({
        orderId: parsedOrderId,
        paymentType: trimmedPaymentType,
        paymentDate: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newPayment[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}