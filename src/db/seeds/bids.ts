import { db } from '@/db';
import { bids } from '@/db/schema';

async function main() {
    const sampleBids = [
        // Product 2 bids - showing bidding progression
        {
            productId: 2,
            userId: 6,
            amount: 120.00,
            bidDate: new Date('2024-12-20T10:30:00Z').toISOString(),
        },
        {
            productId: 2,
            userId: 8,
            amount: 135.00,
            bidDate: new Date('2024-12-22T14:15:00Z').toISOString(),
        },
        {
            productId: 2,
            userId: 10,
            amount: 150.00,
            bidDate: new Date('2024-12-24T16:45:00Z').toISOString(),
        },
        // Product 3 bids - competitive bidding
        {
            productId: 3,
            userId: 7,
            amount: 890.00,
            bidDate: new Date('2024-12-21T09:20:00Z').toISOString(),
        },
        {
            productId: 3,
            userId: 9,
            amount: 920.00,
            bidDate: new Date('2024-12-23T11:30:00Z').toISOString(),
        },
        // Product 7 bids - showing incremental increases
        {
            productId: 7,
            userId: 6,
            amount: 45.00,
            bidDate: new Date('2024-12-19T13:00:00Z').toISOString(),
        },
        {
            productId: 7,
            userId: 8,
            amount: 48.00,
            bidDate: new Date('2024-12-21T15:30:00Z').toISOString(),
        },
        {
            productId: 7,
            userId: 10,
            amount: 52.00,
            bidDate: new Date('2024-12-23T17:00:00Z').toISOString(),
        },
        // Product 11 bids - lower value item bidding
        {
            productId: 11,
            userId: 7,
            amount: 25.00,
            bidDate: new Date('2024-12-20T08:45:00Z').toISOString(),
        },
        {
            productId: 11,
            userId: 9,
            amount: 28.00,
            bidDate: new Date('2024-12-22T10:20:00Z').toISOString(),
        },
    ];

    await db.insert(bids).values(sampleBids);
    
    console.log('✅ Bids seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});