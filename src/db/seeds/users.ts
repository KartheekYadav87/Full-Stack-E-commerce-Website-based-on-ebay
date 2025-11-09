import { db } from '@/db';
import { users } from '@/db/schema';

async function main() {
    const sampleUsers = [
        {
            name: 'John Smith',
            email: 'john.smith@email.com',
            password: 'password123',
            createdAt: new Date('2024-08-15').toISOString(),
        },
        {
            name: 'Sarah Johnson',
            email: 'sarah.j@gmail.com',
            password: 'password123',
            createdAt: new Date('2024-09-02').toISOString(),
        },
        {
            name: 'Michael Chen',
            email: 'michael.chen@outlook.com',
            password: 'password123',
            createdAt: new Date('2024-07-20').toISOString(),
        },
        {
            name: 'Emma Davis',
            email: 'emma.davis@email.com',
            password: 'password123',
            createdAt: new Date('2024-10-10').toISOString(),
        },
        {
            name: 'James Rodriguez',
            email: 'j.rodriguez@yahoo.com',
            password: 'password123',
            createdAt: new Date('2024-08-28').toISOString(),
        },
        {
            name: 'Aisha Patel',
            email: 'aisha.patel@gmail.com',
            password: 'password123',
            createdAt: new Date('2024-09-15').toISOString(),
        },
        {
            name: 'David Kim',
            email: 'david.kim@email.com',
            password: 'password123',
            createdAt: new Date('2024-11-05').toISOString(),
        },
        {
            name: 'Maria Garcia',
            email: 'maria.g@hotmail.com',
            password: 'password123',
            createdAt: new Date('2024-07-30').toISOString(),
        },
        {
            name: 'Robert Williams',
            email: 'robert.williams@gmail.com',
            password: 'password123',
            createdAt: new Date('2024-10-22').toISOString(),
        },
        {
            name: 'Lisa Anderson',
            email: 'lisa.anderson@email.com',
            password: 'password123',
            createdAt: new Date('2024-08-05').toISOString(),
        }
    ];

    await db.insert(users).values(sampleUsers);
    
    console.log('✅ Users seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});