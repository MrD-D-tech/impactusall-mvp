require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.story.updateMany({
    where: {
      title: { contains: 'Sophie' }
    },
    data: {
      featuredImageUrl: '/images/story-placeholder.jpg'
    }
  });
  
  console.log('Updated Sophie story image:', result);
  
  // Verify
  const story = await prisma.story.findFirst({
    where: { title: { contains: 'Sophie' } },
    select: { title: true, featuredImageUrl: true }
  });
  
  console.log('Verified:', story);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
