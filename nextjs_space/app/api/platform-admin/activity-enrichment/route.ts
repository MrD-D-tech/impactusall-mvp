import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'PLATFORM_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { userIds, charityIds, donorIds, storyIds } = await request.json();

    const [users, charities, donors, stories] = await Promise.all([
      // Fetch users
      userIds?.length > 0
        ? prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true, email: true },
          })
        : [],
      
      // Fetch charities
      charityIds?.length > 0
        ? prisma.charity.findMany({
            where: { id: { in: charityIds } },
            select: { id: true, name: true },
          })
        : [],
      
      // Fetch donors
      donorIds?.length > 0
        ? prisma.donor.findMany({
            where: { id: { in: donorIds } },
            select: { id: true, name: true },
          })
        : [],
      
      // Fetch stories
      storyIds?.length > 0
        ? prisma.story.findMany({
            where: { id: { in: storyIds } },
            select: { id: true, title: true },
          })
        : [],
    ]);

    return NextResponse.json({
      users,
      charities,
      donors,
      stories,
    });
  } catch (error) {
    console.error('Activity enrichment error:', error);
    return NextResponse.json(
      { error: 'Failed to enrich activities' },
      { status: 500 }
    );
  }
}
