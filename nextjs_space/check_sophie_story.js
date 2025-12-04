require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const story = await prisma.story.findFirst({
    where: {
      title: { contains: 'Sophie' }
    },
    select: {
      id: true,
      title: true,
      slug: true,
      featuredImageUrl: true,
      status: true,
      donor: {
        select: {
          name: true,
          slug: true,
          primaryColor: true,
          donationAmount: true
        }
      }
    }
  });
  
  console.log('Sophie Story:', JSON.stringify(story, null, 2));
  
  const manUtdDonor = await prisma.donor.findFirst({
    where: {
      slug: 'manchester-united'
    },
    select: {
      name: true,
      slug: true,
      primaryColor: true,
      secondaryColor: true,
      donationAmount: true,
      logoUrl: true
    }
  });
  
  console.log('\nMan Utd Donor:', JSON.stringify(manUtdDonor, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
