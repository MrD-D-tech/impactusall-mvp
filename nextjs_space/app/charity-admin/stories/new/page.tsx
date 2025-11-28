import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import StoryForm from '../story-form';

export default async function NewStoryPage() {
  const session = await getServerSession(authOptions);
  
  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    include: { charity: true },
  });

  if (!user?.charity) {
    redirect('/charity-admin');
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
        <h1 className="text-3xl font-bold text-gray-900">Create New Story</h1>
        <p className="text-gray-600 mt-1">Share a powerful impact story from your charity</p>
      </div>

      <StoryForm
        charityId={user.charity.id}
        charityName={user.charity.name}
        donors={donors}
        userId={user.id}
      />
    </div>
  );
}
