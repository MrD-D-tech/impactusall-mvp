require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.donor.update({
    where: {
      slug: 'manchester-united'
    },
    data: {
      logoUrl: '/images/man-united-logo.png'
    }
  });
  
  console.log('Updated Man Utd donor:', {
    name: result.name,
    logoUrl: result.logoUrl,
    donationAmount: result.donationAmount,
    primaryColor: result.primaryColor
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
