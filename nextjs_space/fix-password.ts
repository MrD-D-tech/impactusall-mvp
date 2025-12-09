import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function createPlatformAdmin() {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'platform@impactusall.com' }
    });

    if (existingUser) {
      console.log('User already exists. Updating password...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await prisma.user.update({
        where: { email: 'platform@impactusall.com' },
        data: { password: hashedPassword }
      });
      
      console.log('Password updated successfully!');
    } else {
      console.log('User does not exist. Creating new platform admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await prisma.user.create({
        data: {
          id: randomUUID(),
          email: 'platform@impactusall.com',
          password: hashedPassword,
          name: 'Platform Admin',
          role: 'PLATFORM_ADMIN'
        }
      });
      
      console.log('Platform admin user created successfully!');
    }

    // Verify the user
    const user = await prisma.user.findUnique({
      where: { email: 'platform@impactusall.com' },
      select: { id: true, email: true, name: true, role: true }
    });
    
    console.log('User details:', user);
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

createPlatformAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
