import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Get Emma's story
  const emmaStory = await prisma.story.findFirst({
    where: { slug: { contains: 'emmas' } },
    include: {
      charity: { select: { name: true, logoUrl: true } },
      donor: { select: { name: true } },
      media: true
    }
  });
  
  // Get Sophie's story
  const sophieStory = await prisma.story.findFirst({
    where: { slug: { contains: 'sophie' } },
    include: {
      charity: { select: { name: true, logoUrl: true } },
      donor: { select: { name: true } },
      media: true
    }
  });
  
  console.log('=== EMMA\'S STORY ===');
  console.log('Title:', emmaStory?.title);
  console.log('Slug:', emmaStory?.slug);
  console.log('Featured Image:', emmaStory?.featuredImageUrl);
  console.log('Excerpt:', emmaStory?.excerpt?.substring(0, 200) + '...');
  console.log('Impact Metrics:', JSON.stringify(emmaStory?.impactMetrics, null, 2));
  console.log('Charity:', emmaStory?.charity?.name);
  console.log('Donor:', emmaStory?.donor?.name);
  console.log('Created:', emmaStory?.createdAt);
  console.log('');
  
  console.log('=== SOPHIE\'S STORY ===');
  console.log('Title:', sophieStory?.title);
  console.log('Slug:', sophieStory?.slug);
  console.log('Featured Image:', sophieStory?.featuredImageUrl);
  console.log('Excerpt:', sophieStory?.excerpt?.substring(0, 200) + '...');
  console.log('Impact Metrics:', JSON.stringify(sophieStory?.impactMetrics, null, 2));
  console.log('Charity:', sophieStory?.charity?.name);
  console.log('Donor:', sophieStory?.donor?.name);
  console.log('Created:', sophieStory?.createdAt);
}

main().catch(console.error).finally(() => prisma.$disconnect());
