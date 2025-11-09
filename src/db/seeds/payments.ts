import { db } from '@/db';
import { payments } from '@/db/schema';

async function main() {
    const samplePayments = [
        {
            orderId: 1,
            paymentType: 'credit_card',
            paymentDate: new Date('2024-01-15T14:35:00').toISOString(),
        },
        {
            orderId: 2,
            paymentType: 'paypal',
            paymentDate: new Date('2024-01-20T16:20:00').toISOString(),
        },
        {
            orderId: 3,
            paymentType: 'debit_card',
            paymentDate: new Date('2024-02-01T10:15:00').toISOString(),
        }
    ];

    await db.insert(payments).values(samplePayments);
    
    console.log('✅ Payments seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});