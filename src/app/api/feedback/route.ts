import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { feedback } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('order_id');

    // Validate order_id if provided
    if (orderId !== null) {
      const orderIdNum = parseInt(orderId);
      if (isNaN(orderIdNum)) {
        return NextResponse.json(
          { 
            error: 'Invalid order_id parameter. Must be a valid integer.',
            code: 'INVALID_ORDER_ID' 
          },
          { status: 400 }
        );
      }

      // Filter by order_id
      const results = await db.select()
        .from(feedback)
        .where(eq(feedback.orderId, orderIdNum));

      return NextResponse.json(results, { status: 200 });
    }

    // Return all feedback if no filter
    const results = await db.select().from(feedback);
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
    const { orderId, comments } = body;

    // Validate orderId
    if (orderId === undefined || orderId === null) {
      return NextResponse.json(
        { 
          error: 'orderId is required',
          code: 'MISSING_ORDER_ID' 
        },
        { status: 400 }
      );
    }

    const orderIdNum = parseInt(orderId);
    if (isNaN(orderIdNum)) {
      return NextResponse.json(
        { 
          error: 'orderId must be a valid integer',
          code: 'INVALID_ORDER_ID' 
        },
        { status: 400 }
      );
    }

    // Validate comments
    if (!comments) {
      return NextResponse.json(
        { 
          error: 'comments is required',
          code: 'MISSING_COMMENTS' 
        },
        { status: 400 }
      );
    }

    const trimmedComments = comments.trim();
    if (trimmedComments.length === 0) {
      return NextResponse.json(
        { 
          error: 'comments must be a non-empty string',
          code: 'INVALID_COMMENTS' 
        },
        { status: 400 }
      );
    }

    // Create feedback
    const newFeedback = await db.insert(feedback)
      .values({
        orderId: orderIdNum,
        comments: trimmedComments,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newFeedback[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}