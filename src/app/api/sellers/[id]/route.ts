import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sellers } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        },
        { status: 400 }
      );
    }

    // Fetch seller by ID
    const seller = await db.select()
      .from(sellers)
      .where(eq(sellers.id, parseInt(id)))
      .limit(1);

    // Check if seller exists
    if (seller.length === 0) {
      return NextResponse.json(
        { 
          error: 'Seller not found',
          code: 'SELLER_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json(seller[0], { status: 200 });

  } catch (error) {
    console.error('GET seller error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}