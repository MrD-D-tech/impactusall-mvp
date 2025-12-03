import { config } from 'dotenv';
config();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMetrics() {
  const stories = await prisma.story.findMany({
    where: { status: 'PUBLISHED' },
    select: {
      title: true,
      impactMetrics: true,
      _count: {
        select: {
          likes: true,
          comments: true,
          media: true
        }
      }
    }
  });

  console.log('=== STORY IMPACT METRICS ===\n');
  stories.forEach((story, index) => {
    console.log(`${index + 1}. ${story.title}`);
    console.log(`   Impact Metrics:`, JSON.stringify(story.impactMetrics, null, 2));
    console.log(`   Engagement: ${story._count.likes} likes, ${story._count.comments} comments, ${story._count.media} media\n`);
  });

  await prisma.$disconnect();
}

checkMetrics();
