import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq, like, or, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single product fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
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
          { error: 'Product not found', code: 'PRODUCT_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(product[0], { status: 200 });
    }

    // List products with filters
    const limit = Math.min(
      parseInt(searchParams.get('limit') ?? '10'),
      100
    );
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const category = searchParams.get('category');

    let query = db.select().from(products);

    const conditions = [];

    if (category) {
      conditions.push(eq(products.category, category));
    }

    if (search) {
      const searchCondition = or(
        like(products.name, `%${search}%`),
        like(products.description, `%${search}%`)
      );
      conditions.push(searchCondition);
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.limit(limit).offset(offset);

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
    const { name, description, price, category, rating, sellerId } = body;

    // Validate required fields
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Name is required', code: 'MISSING_NAME' },
        { status: 400 }
      );
    }

    if (price === undefined || price === null) {
      return NextResponse.json(
        { error: 'Price is required', code: 'MISSING_PRICE' },
        { status: 400 }
      );
    }

    if (!category || category.trim() === '') {
      return NextResponse.json(
        { error: 'Category is required', code: 'MISSING_CATEGORY' },
        { status: 400 }
      );
    }

    if (!sellerId) {
      return NextResponse.json(
        { error: 'Seller ID is required', code: 'MISSING_SELLER_ID' },
        { status: 400 }
      );
    }

    // Validate price is positive number
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return NextResponse.json(
        { error: 'Price must be a positive number', code: 'INVALID_PRICE' },
        { status: 400 }
      );
    }

    // Validate sellerId is valid integer
    const parsedSellerId = parseInt(sellerId);
    if (isNaN(parsedSellerId)) {
      return NextResponse.json(
        { error: 'Seller ID must be a valid integer', code: 'INVALID_SELLER_ID' },
        { status: 400 }
      );
    }

    // Validate rating if provided
    let finalRating = 0;
    if (rating !== undefined && rating !== null) {
      const parsedRating = parseFloat(rating);
      if (isNaN(parsedRating) || parsedRating < 0 || parsedRating > 5) {
        return NextResponse.json(
          { error: 'Rating must be between 0 and 5', code: 'INVALID_RATING' },
          { status: 400 }
        );
      }
      finalRating = parsedRating;
    }

    // Prepare product data
    const productData = {
      name: name.trim(),
      description: description ? description.trim() : null,
      price: parsedPrice,
      category: category.trim(),
      rating: finalRating,
      sellerId: parsedSellerId,
      createdAt: new Date().toISOString(),
    };

    const newProduct = await db.insert(products).values(productData).returning();

    return NextResponse.json(newProduct[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description, price, category, rating } = body;

    // Check if product exists
    const existingProduct = await db
      .select()
      .from(products)
      .where(eq(products.id, parseInt(id)))
      .limit(1);

    if (existingProduct.length === 0) {
      return NextResponse.json(
        { error: 'Product not found', code: 'PRODUCT_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Validate price if provided
    if (price !== undefined && price !== null) {
      const parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        return NextResponse.json(
          { error: 'Price must be a positive number', code: 'INVALID_PRICE' },
          { status: 400 }
        );
      }
    }

    // Validate rating if provided
    if (rating !== undefined && rating !== null) {
      const parsedRating = parseFloat(rating);
      if (isNaN(parsedRating) || parsedRating < 0 || parsedRating > 5) {
        return NextResponse.json(
          { error: 'Rating must be between 0 and 5', code: 'INVALID_RATING' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};

    if (name !== undefined) {
      updateData.name = name.trim();
    }

    if (description !== undefined) {
      updateData.description = description ? description.trim() : null;
    }

    if (price !== undefined && price !== null) {
      updateData.price = parseFloat(price);
    }

    if (category !== undefined) {
      updateData.category = category.trim();
    }

    if (rating !== undefined && rating !== null) {
      updateData.rating = parseFloat(rating);
    }

    const updated = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, parseInt(id)))
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

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if product exists
    const existingProduct = await db
      .select()
      .from(products)
      .where(eq(products.id, parseInt(id)))
      .limit(1);

    if (existingProduct.length === 0) {
      return NextResponse.json(
        { error: 'Product not found', code: 'PRODUCT_NOT_FOUND' },
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
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}