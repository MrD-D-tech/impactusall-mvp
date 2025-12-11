import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testLogin() {
  try {
    const testEmail = 'platform@impactusall.com';
    const testPassword = 'admin123';

    console.log(`Testing login for: ${testEmail}`);
    console.log(`Password: ${testPassword}`);
    console.log('');

    // Fetch user
    const user = await prisma.user.findUnique({
      where: { email: testEmail },
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User found:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Password hash: ${user.password.substring(0, 30)}...`);
    console.log('');

    // Test password
    const isValidPassword = await bcrypt.compare(testPassword, user.password);

    if (isValidPassword) {
      console.log('✅ Password verification: SUCCESS');
      console.log('');
      console.log('🎉 Login credentials are valid!');
      console.log('   You can now log in at http://localhost:3000/login');
      console.log(`   Email: ${testEmail}`);
      console.log(`   Password: ${testPassword}`);
    } else {
      console.log('❌ Password verification: FAILED');
      console.log('   The password does not match the stored hash');
    }
  } catch (error) {
    console.error('Error during test:', error);
  }
}

testLogin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
