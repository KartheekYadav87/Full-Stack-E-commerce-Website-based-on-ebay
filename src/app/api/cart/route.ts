import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { cart } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    const userIdInt = parseInt(userId);
    if (isNaN(userIdInt)) {
      return NextResponse.json(
        { error: 'Valid User ID is required', code: 'INVALID_USER_ID' },
        { status: 400 }
      );
    }

    const cartItems = await db
      .select()
      .from(cart)
      .where(eq(cart.userId, userIdInt));

    return NextResponse.json(cartItems, { status: 200 });
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
    const { userId, productId, quantity } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required', code: 'MISSING_PRODUCT_ID' },
        { status: 400 }
      );
    }

    if (quantity === undefined || quantity === null) {
      return NextResponse.json(
        { error: 'Quantity is required', code: 'MISSING_QUANTITY' },
        { status: 400 }
      );
    }

    const userIdInt = parseInt(userId);
    const productIdInt = parseInt(productId);
    const quantityInt = parseInt(quantity);

    if (isNaN(userIdInt)) {
      return NextResponse.json(
        { error: 'Valid User ID is required', code: 'INVALID_USER_ID' },
        { status: 400 }
      );
    }

    if (isNaN(productIdInt)) {
      return NextResponse.json(
        { error: 'Valid Product ID is required', code: 'INVALID_PRODUCT_ID' },
        { status: 400 }
      );
    }

    if (isNaN(quantityInt) || quantityInt <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be a positive integer', code: 'INVALID_QUANTITY' },
        { status: 400 }
      );
    }

    const newCartItem = await db
      .insert(cart)
      .values({
        userId: userIdInt,
        productId: productIdInt,
        quantity: quantityInt,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newCartItem[0], { status: 201 });
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Cart item ID is required', code: 'MISSING_ID' },
        { status: 400 }
      );
    }

    const idInt = parseInt(id);
    if (isNaN(idInt)) {
      return NextResponse.json(
        { error: 'Valid cart item ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { quantity } = body;

    if (quantity === undefined || quantity === null) {
      return NextResponse.json(
        { error: 'Quantity is required', code: 'MISSING_QUANTITY' },
        { status: 400 }
      );
    }

    const quantityInt = parseInt(quantity);
    if (isNaN(quantityInt) || quantityInt <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be a positive integer', code: 'INVALID_QUANTITY' },
        { status: 400 }
      );
    }

    const existingItem = await db
      .select()
      .from(cart)
      .where(eq(cart.id, idInt))
      .limit(1);

    if (existingItem.length === 0) {
      return NextResponse.json(
        { error: 'Cart item not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const updatedItem = await db
      .update(cart)
      .set({
        quantity: quantityInt,
      })
      .where(eq(cart.id, idInt))
      .returning();

    return NextResponse.json(updatedItem[0], { status: 200 });
  } catch (error: any) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Cart item ID is required', code: 'MISSING_ID' },
        { status: 400 }
      );
    }

    const idInt = parseInt(id);
    if (isNaN(idInt)) {
      return NextResponse.json(
        { error: 'Valid cart item ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existingItem = await db
      .select()
      .from(cart)
      .where(eq(cart.id, idInt))
      .limit(1);

    if (existingItem.length === 0) {
      return NextResponse.json(
        { error: 'Cart item not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deletedItem = await db
      .delete(cart)
      .where(eq(cart.id, idInt))
      .returning();

    return NextResponse.json(
      {
        message: 'Cart item deleted successfully',
        deletedItem: deletedItem[0],
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}