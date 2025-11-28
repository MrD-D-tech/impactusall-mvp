import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import StoryForm from '../../story-form';

interface EditStoryPageProps {
  params: {
    id: string;
  };
}

export default async function EditStoryPage({ params }: EditStoryPageProps) {
  const session = await getServerSession(authOptions);
  
  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    include: { charity: true },
  });

  if (!user?.charity) {
    redirect('/charity-admin');
  }

  // Get the story to edit
  const story = await prisma.story.findFirst({
    where: {
      id: params.id,
      charityId: user.charity.id, // Ensure user can only edit their charity's stories
    },
  });

  if (!story) {
    notFound();
  }

  // Get all donors to populate the dropdown
  const donors = await prisma.donor.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
    },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Story</h1>
        <p className="text-gray-600 mt-1">Update your impact story</p>
      </div>

      <StoryForm
        charityId={user.charity.id}
        charityName={user.charity.name}
        donors={donors}
        userId={user.id}
        initialData={{
          id: story.id,
          title: story.title,
          excerpt: story.excerpt || '',
          content: story.content,
          featuredImageUrl: story.featuredImageUrl,
          donorId: story.donorId,
          status: story.status,
          impactMetrics: story.impactMetrics,
        }}
      />
    </div>
  );
}
