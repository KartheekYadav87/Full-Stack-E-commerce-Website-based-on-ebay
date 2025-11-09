import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { cart } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: 'Valid cart item ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    const cartItemId = parseInt(id);

    // Parse request body
    const body = await request.json();
    const { quantity } = body;

    // Validate quantity
    if (quantity === undefined || quantity === null) {
      return NextResponse.json(
        {
          error: 'Quantity is required',
          code: 'MISSING_QUANTITY',
        },
        { status: 400 }
      );
    }

    if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity <= 0) {
      return NextResponse.json(
        {
          error: 'Quantity must be a positive integer',
          code: 'INVALID_QUANTITY',
        },
        { status: 400 }
      );
    }

    // Check if cart item exists
    const existingItem = await db
      .select()
      .from(cart)
      .where(eq(cart.id, cartItemId))
      .limit(1);

    if (existingItem.length === 0) {
      return NextResponse.json(
        {
          error: 'Cart item not found',
          code: 'CART_ITEM_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Update cart item
    const updatedItem = await db
      .update(cart)
      .set({
        quantity,
      })
      .where(eq(cart.id, cartItemId))
      .returning();

    return NextResponse.json(updatedItem[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: 'Valid cart item ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    const cartItemId = parseInt(id);

    // Check if cart item exists
    const existingItem = await db
      .select()
      .from(cart)
      .where(eq(cart.id, cartItemId))
      .limit(1);

    if (existingItem.length === 0) {
      return NextResponse.json(
        {
          error: 'Cart item not found',
          code: 'CART_ITEM_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Delete cart item
    const deletedItem = await db
      .delete(cart)
      .where(eq(cart.id, cartItemId))
      .returning();

    return NextResponse.json(
      {
        message: 'Cart item deleted successfully',
        deletedItem: deletedItem[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    );
  }
}