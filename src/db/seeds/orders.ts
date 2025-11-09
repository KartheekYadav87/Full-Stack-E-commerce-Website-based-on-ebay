import { db } from '@/db';
import { orders } from '@/db/schema';

async function main() {
    const sampleOrders = [
        {
            userId: 8,
            totalAmount: 89.99,
            orderDate: new Date('2024-12-20').toISOString(),
            status: 'pending',
        },
        {
            userId: 7,
            totalAmount: 450.00,
            orderDate: new Date('2024-12-15').toISOString(),
            status: 'shipped',
        },
        {
            userId: 6,
            totalAmount: 150.00,
            orderDate: new Date('2024-12-10').toISOString(),
            status: 'delivered',
        }
    ];

    await db.insert(orders).values(sampleOrders);
    
    console.log('✅ Orders seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});