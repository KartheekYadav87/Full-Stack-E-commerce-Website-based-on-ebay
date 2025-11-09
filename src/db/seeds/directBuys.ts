import { db } from '@/db';
import { directBuys } from '@/db/schema';

async function main() {
    const sampleDirectBuys = [
        {
            productId: 1,
            buyerId: 6,
            purchaseDate: new Date('2024-12-15T10:30:00').toISOString(),
        },
        {
            productId: 5,
            buyerId: 7,
            purchaseDate: new Date('2024-12-18T14:45:00').toISOString(),
        },
        {
            productId: 8,
            buyerId: 8,
            purchaseDate: new Date('2024-12-22T09:15:00').toISOString(),
        },
        {
            productId: 12,
            buyerId: 9,
            purchaseDate: new Date('2024-12-28T16:20:00').toISOString(),
        },
        {
            productId: 15,
            buyerId: 10,
            purchaseDate: new Date('2025-01-05T11:00:00').toISOString(),
        }
    ];

    await db.insert(directBuys).values(sampleDirectBuys);
    
    console.log('✅ Direct buys seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});