import { db } from '@/db';
import { cart } from '@/db/schema';

async function main() {
    const sampleCartItems = [
        {
            userId: 6,
            productId: 3,
            quantity: 2,
            createdAt: new Date('2024-12-18').toISOString(),
        },
        {
            userId: 7,
            productId: 8,
            quantity: 1,
            createdAt: new Date('2024-12-19').toISOString(),
        },
        {
            userId: 8,
            productId: 15,
            quantity: 3,
            createdAt: new Date('2024-12-20').toISOString(),
        },
        {
            userId: 9,
            productId: 5,
            quantity: 5,
            createdAt: new Date('2024-12-21').toISOString(),
        },
        {
            userId: 10,
            productId: 12,
            quantity: 4,
            createdAt: new Date('2024-12-22').toISOString(),
        },
    ];

    await db.insert(cart).values(sampleCartItems);
    
    console.log('✅ Cart seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});