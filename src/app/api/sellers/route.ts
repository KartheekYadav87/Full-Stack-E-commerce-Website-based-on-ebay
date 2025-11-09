import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sellers } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single seller by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { 
            error: "Valid ID is required",
            code: "INVALID_ID" 
          },
          { status: 400 }
        );
      }

      const seller = await db.select()
        .from(sellers)
        .where(eq(sellers.id, parseInt(id)))
        .limit(1);

      if (seller.length === 0) {
        return NextResponse.json(
          { error: 'Seller not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(seller[0], { status: 200 });
    }

    // List sellers with pagination
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    const results = await db.select()
      .from(sellers)
      .limit(limit)
      .offset(offset);

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
    const { userId } = body;

    // Validate required field
    if (!userId) {
      return NextResponse.json(
        { 
          error: "userId is required",
          code: "MISSING_REQUIRED_FIELD" 
        },
        { status: 400 }
      );
    }

    // Validate userId is valid integer
    if (isNaN(parseInt(userId))) {
      return NextResponse.json(
        { 
          error: "userId must be a valid integer",
          code: "INVALID_USER_ID" 
        },
        { status: 400 }
      );
    }

    // Check if userId already exists as seller
    const existingSeller = await db.select()
      .from(sellers)
      .where(eq(sellers.userId, parseInt(userId)))
      .limit(1);

    if (existingSeller.length > 0) {
      return NextResponse.json(
        { 
          error: "User is already a seller",
          code: "USER_ALREADY_SELLER" 
        },
        { status: 400 }
      );
    }

    // Create new seller
    const newSeller = await db.insert(sellers)
      .values({
        userId: parseInt(userId),
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newSeller[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}