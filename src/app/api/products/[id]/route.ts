import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: 'Valid ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, parseInt(id)))
      .limit(1);

    if (product.length === 0) {
      return NextResponse.json(
        {
          error: 'Product not found',
          code: 'PRODUCT_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(product[0], { status: 200 });
  } catch (error: any) {
    console.error('GET error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + error.message,
      },
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

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: 'Valid ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description, price, category, rating } = body;

    const existingProduct = await db
      .select()
      .from(products)
      .where(eq(products.id, parseInt(id)))
      .limit(1);

    if (existingProduct.length === 0) {
      return NextResponse.json(
        {
          error: 'Product not found',
          code: 'PRODUCT_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const updates: any = {};

    if (name !== undefined) {
      updates.name = name.trim();
    }

    if (description !== undefined) {
      updates.description = description ? description.trim() : description;
    }

    if (price !== undefined) {
      const priceValue = parseFloat(price);
      if (isNaN(priceValue) || priceValue <= 0) {
        return NextResponse.json(
          {
            error: 'Price must be a positive number',
            code: 'INVALID_PRICE',
          },
          { status: 400 }
        );
      }
      updates.price = priceValue;
    }

    if (category !== undefined) {
      updates.category = category.trim();
    }

    if (rating !== undefined) {
      const ratingValue = parseFloat(rating);
      if (isNaN(ratingValue) || ratingValue < 0 || ratingValue > 5) {
        return NextResponse.json(
          {
            error: 'Rating must be between 0 and 5',
            code: 'INVALID_RATING',
          },
          { status: 400 }
        );
      }
      updates.rating = ratingValue;
    }

    const updated = await db
      .update(products)
      .set(updates)
      .where(eq(products.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error: any) {
    console.error('PUT error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + error.message,
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
    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: 'Valid ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    const existingProduct = await db
      .select()
      .from(products)
      .where(eq(products.id, parseInt(id)))
      .limit(1);

    if (existingProduct.length === 0) {
      return NextResponse.json(
        {
          error: 'Product not found',
          code: 'PRODUCT_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(products)
      .where(eq(products.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Product deleted successfully',
        product: deleted[0],
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + error.message,
      },
      { status: 500 }
    );
  }
}