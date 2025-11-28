import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function checkUser() {
  const user = await prisma.user.findUnique({
    where: { email: 'admin@northernhospice.org.uk' },
    include: { charity: true }
  });

  if (user) {
    console.log('✅ User found in database:');
    console.log('Email:', user.email);
    console.log('Name:', user.name);
    console.log('Role:', user.role);
    console.log('Charity:', user.charity?.name);
    console.log('Has password:', !!user.password);
    
    // Test password
    if (user.password) {
      const isValid = await bcrypt.compare('admin123', user.password);
      console.log('Password "admin123" is valid:', isValid);
    }
  } else {
    console.log('❌ User NOT found in database');
  }

  await prisma.$disconnect();
}

checkUser();
