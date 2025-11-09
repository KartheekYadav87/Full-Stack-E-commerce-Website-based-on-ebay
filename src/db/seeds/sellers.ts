import { db } from '@/db';
import { sellers } from '@/db/schema';

async function main() {
    const sampleSellers = [
        {
            userId: 1,
            createdAt: new Date('2024-08-15').toISOString(),
        },
        {
            userId: 2,
            createdAt: new Date('2024-09-22').toISOString(),
        },
        {
            userId: 3,
            createdAt: new Date('2024-10-05').toISOString(),
        },
        {
            userId: 4,
            createdAt: new Date('2024-11-12').toISOString(),
        },
        {
            userId: 5,
            createdAt: new Date('2024-12-01').toISOString(),
        },
    ];

    await db.insert(sellers).values(sampleSellers);
    
    console.log('✅ Sellers seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});