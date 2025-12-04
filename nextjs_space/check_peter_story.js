require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPeterStory() {
  const story = await prisma.story.findFirst({
    where: {
      title: {
        contains: "Peter Smith"
      }
    },
    include: {
      charity: true,
      donor: true
    }
  });
  
  console.log("Peter's Story:");
  console.log(JSON.stringify(story, null, 2));
  
  await prisma.$disconnect();
}

checkPeterStory();
