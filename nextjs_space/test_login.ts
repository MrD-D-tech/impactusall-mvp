import bcrypt from 'bcryptjs';
import { prisma } from './lib/db';

async function testLogin() {
  const credentials = {
    email: 'admin@northernhospice.org.uk',
    password: 'admin123'
  };

  console.log('Testing login with:', credentials);

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: credentials.email },
  });

  if (!user || !user.password) {
    console.log('❌ User not found or no password');
    return;
  }

  console.log('✅ User found:', {
    email: user.email,
    name: user.name,
    role: user.role,
    hasPassword: !!user.password
  });

  // Compare password
  const isValidPassword = await bcrypt.compare(
    credentials.password,
    user.password
  );

  console.log('Password comparison result:', isValidPassword);

  if (isValidPassword) {
    console.log('✅ Login would succeed!');
  } else {
    console.log('❌ Login would fail - password mismatch');
  }

  await prisma.$disconnect();
}

testLogin();
