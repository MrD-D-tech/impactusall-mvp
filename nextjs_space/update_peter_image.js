require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updatePeterImage() {
  const result = await prisma.story.update({
    where: {
      id: 'cmirg6w3d0001rx08s5w874wm'
    },
    data: {
      featuredImageUrl: '/images/story-placeholder.jpg'
    }
  });
  
  console.log("✅ Updated Peter's story image:", result.featuredImageUrl);
  await prisma.$disconnect();
}

updatePeterImage();
